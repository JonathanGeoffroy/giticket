import NoMoreItemError from './errors/noMoreItemError';
import * as git from 'isomorphic-git';
import { v4 as uuid } from 'uuid';
import { TextDecoder, TextEncoder } from 'util';
import Item, { AddItem, EditItem } from './models/item';
import { generate, parse } from './models/path';
import { Page } from './models/page';
import Repository from './repository';
import Constructor from './mixin';
import { Matcher } from './query';

const GITICKET_DEFAULT_HEAD = 'refs/giticket/main';

type Gitable = Constructor<Repository>;

export type ItemPage = Page<Item>;

/**
 * Handles items behavior from a specific git repository
 * @param Base mixins for Repository
 * @returns a Mixins handling items behavior
 */
export default function <TBase extends Gitable>(Base: TBase) {
  return class extends Base {
    /**
     * Adds a new item in the default giticket branch
     * @param itemToAdd
     * @returns added item (including its id)
     */
    async addItem(itemToAdd: AddItem): Promise<Item> {
      const item: Item = {
        id: uuid(),
        ...itemToAdd,
      };

      const itemTree = await this.createTreeItem(item);
      const options = { ref: GITICKET_DEFAULT_HEAD };
      const head = await this.resolveRef(options).catch(() => null);

      const oldTree = head
        ? await (
            await this.readTree({ ...options, oid: head })
          ).tree
        : [];

      const newTree = [itemTree, ...oldTree];

      await this.commitItems({ content: newTree, parent: head });

      return item;
    }

    /**
     * Edits (patches) an existing item, found by its id.
     * Every `item`'s fields are optional. If any field is unset, old field value will remain as is.
     * Be careful that providing null or undefined is different from not providing a value at all:
     *   * The former will change value to null/undefined,
     *   * the latter will not change the old value
     *
     * @param item the item to edit
     * @returns edited item
     * @throws isomorphic-git.Errors.NotFoundError
     */
    async editItem(item: EditItem): Promise<Item> {
      const options = { ref: GITICKET_DEFAULT_HEAD };
      const head = await this.resolveRef(options);

      const { tree: oldTree } = await this.readTree({
        oid: head,
      });

      const itemOid = await this.findOid(item.id);
      const oldItem = await this.readBlobItem(itemOid);
      const editedItem = { ...oldItem, ...item };

      const newTree = [
        await this.createTreeItem(editedItem),
        ...oldTree.filter(({ oid }) => {
          return oid !== itemOid;
        }),
      ];

      await this.commitItems({ content: newTree, parent: head });

      return editedItem;
    }

    /**
     * List items.
     * By default, this will returns all items of the current ref (default giticket ref).
     * Default behavior can be changed by providing `ref` and `depth` params
     * @param params {
     * refs: the refs where to start listing ; uses the current ref if ommited
     * depth: number of commits maximum to returns ; returns all commits if ommited
     * }
     * @returns
     */
    async listItems({
      ref,
      limit,
    }: {
      ref?: string;
      limit?: number;
    }): Promise<ItemPage> {
      try {
        const tree = await this.computeTree();
        let items = tree.reverse();
        let after;

        if (ref) {
          const refIndex = items.findIndex(({ oid }) => oid === ref);
          items = items.slice(refIndex);
        }
        if (limit) {
          after = items[limit]?.oid; // Keep last oid to compute next page
          items = items.slice(0, limit);
        }

        const results = await Promise.all(
          items.map(({ oid }) => this.readBlobItem(oid))
        );
        return {
          results,
          hasNext: !!after,
          next: async () => {
            if (!after) {
              throw new NoMoreItemError();
            }

            return this.listItems({
              limit,
              ref: after,
            });
          },
        };
      } catch (e) {
        if (e.code === 'NotFoundError')
          return {
            hasNext: false,
            next: async () => {
              throw new NoMoreItemError();
            },
            results: [],
          };
        throw e;
      }
    }

    /**
     * Filters items by query
     *
     * @param query The query to filter items
     * @returns All items matching the matcher
     */
    async searchItems(query: Matcher<Item>): Promise<Item[]> {
      const items = await this.listItems({});
      return items.results.filter(query);
    }

    private async commitItems({
      content,
      parent,
    }: {
      content: git.TreeEntry[];
      parent: string | null;
    }): Promise<void> {
      const tree = await this.writeTree(content);

      const oid = await this.commit({
        tree,
        parent: parent ? [parent] : undefined,
        message: 'giticket auto-generated',
        author: {
          name: 'giticket',
        },
        ref: GITICKET_DEFAULT_HEAD,
      });

      await this.writeRef({
        ref: GITICKET_DEFAULT_HEAD,
        value: oid,
        force: true,
      });
    }

    private async readBlobItem(oid: string): Promise<Item> {
      const { blob } = await this.readBlob({ oid });
      return JSON.parse(new TextDecoder().decode(blob)) as Item;
    }

    private async findOid(id: string): Promise<string> {
      const tree = await this.computeTree();
      const entry = tree.find((entry) => parse(entry.path).uuid === id);
      if (!entry) {
        throw new git.Errors.NotFoundError(id);
      }

      return entry.oid;
    }

    private async computeTree(): Promise<git.TreeEntry[]> {
      const giticketRef = await this.resolveRef({
        ref: GITICKET_DEFAULT_HEAD,
      });

      const { commit } = await this.readCommit({
        oid: giticketRef,
      });
      const { tree } = await this.readTree({
        oid: commit.tree,
      });

      return tree;
    }

    private async createTreeItem(item: Item): Promise<git.TreeEntry> {
      const oid = await this.writeBlob(
        new Uint8Array(new TextEncoder().encode(JSON.stringify(item)))
      );

      return {
        mode: '100644',
        oid,
        path: generate(item.id),
        type: 'blob',
      };
    }
  };
}
