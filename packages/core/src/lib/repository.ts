import * as git from 'isomorphic-git';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'isomorphic-git/http/node';
import NoMoreItemError from './errors/noMoreItemError';
import Item, { AddItem } from './models/item';
import { v4 as uuid } from 'uuid';

export interface Page<P> {
  hasNext: boolean;
  next: () => Promise<Page<P>>;
  results: P[];
}

export type CommitPage = Page<git.ReadCommitResult>;
export type ItemPage = Page<Item>;

export default class Repository {
  constructor(
    readonly dir: string,
    private readonly fs: git.FsClient = fs,
    private readonly http: git.HttpClient
  ) {}

  async listCommits(
    params: {
      ref?: string;
      depth?: number;
    } = {}
  ): Promise<CommitPage> {
    const { ref, depth } = { ...params };

    const results = await git.log({
      fs: this.fs,
      dir: this.dir,
      ref,
      depth,
    });

    const hasNext =
      results.length && results.slice(-1)[0].commit.parent.length > 0;

    return {
      results,
      hasNext,
      next: async () => {
        if (!hasNext) {
          throw new NoMoreItemError();
        }

        return this.listCommits({
          ...params,
          ref: results.slice(-1)[0].commit.parent[0],
        });
      },
    };
  }

  async addItem(itemToAdd: AddItem): Promise<Item> {
    const item: Item = {
      id: uuid(),
      ...itemToAdd,
    };

    const itemTree = await this.createTreeItem(item);
    const options = { fs: this.fs, dir: this.dir, ref: 'refs/giticket/main' };
    const head = await git.resolveRef(options).catch(() => null);

    const oldTree = head
      ? await (
          await git.readTree({ fs: this.fs, dir: this.dir, oid: head })
        ).tree
      : [];

    const newTree = [itemTree, ...oldTree];

    const tree = await git.writeTree({
      fs: this.fs,
      dir: this.dir,
      tree: newTree,
    });

    const oid = await git.commit({
      dir: this.dir,
      fs: this.fs,
      tree: tree,
      parent: head ? [head] : undefined,
      message: 'giticket auto-generated',
      author: {
        name: 'giticket',
      },
      ref: 'refs/giticket/main',
    });

    await git.writeRef({ ...options, value: oid, force: true });

    return item;
  }

  async listItems({
    ref,
    limit,
  }: {
    ref?: string;
    limit?: number;
  }): Promise<ItemPage> {
    try {
      const giticketRef = await git.resolveRef({
        fs: this.fs,
        dir: this.dir,
        ref: 'refs/giticket/main',
      });
      const { commit } = await git.readCommit({
        fs: this.fs,
        dir: this.dir,
        oid: giticketRef,
      });
      const { tree } = await git.readTree({
        fs: this.fs,
        dir: this.dir,
        oid: commit.tree,
      });

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
          next: () => {
            throw new NoMoreItemError();
          },
          results: [],
        };
      throw e;
    }
  }

  private async readBlobItem(oid: string): Promise<Item> {
    const { blob } = await git.readBlob({ fs: this.fs, dir: this.dir, oid });
    return JSON.parse(new TextDecoder().decode(blob)) as Item;
  }

  private async createTreeItem(item: Item): Promise<git.TreeEntry> {
    const oid = await git.writeBlob({
      dir: this.dir,
      fs: this.fs,
      blob: new Uint8Array(new TextEncoder().encode(JSON.stringify(item))),
    });

    return {
      mode: '100644',
      oid,
      path: `${Date.now()}_${item.id}`,
      type: 'blob',
    };
  }

  static async clone(url: string, baseDirectory: string): Promise<Repository> {
    const dir = path.join(baseDirectory, url.split('/').slice(-1)[0]);
    await git.clone({ fs, http, dir, url });
    return new Repository(dir, fs, http);
  }

  static async init(dir: string) {
    await git.init({ dir, fs });
    return new Repository(dir, fs, http);
  }
}
