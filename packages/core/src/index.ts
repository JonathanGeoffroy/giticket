import * as fs from 'fs';
import * as path from 'path';
import * as http from 'isomorphic-git/http/node';

import CommitManager from './lib/commit-manager';
import ItemManager from './lib/item-manager';
import Repository from './lib/repository';
import { clone, init } from 'isomorphic-git';

import Item, { AddItem, EditItem } from './lib/models/item';
import NoMoreItemError from './lib/errors/noMoreItemError';
export { Item, AddItem, EditItem, NoMoreItemError };

export { item } from './lib/query';

/**
 * Main exported class of @giticket/core
 * Giticket is able to initialize or clone a repository.
 * It handles mixins about all Repository's features
 *  * Commits,
 *  * Items
 */
export default class Giticket extends CommitManager(ItemManager(Repository)) {
  static async clone(url: string, baseDirectory: string): Promise<Repository> {
    const dir = path.join(baseDirectory, url.split('/').slice(-1)[0]);
    await clone({ fs, http, dir, url });
    return new Giticket(dir, fs, http);
  }

  static async init(dir: string) {
    await init({ dir, fs });
    return new Giticket(dir, fs, http);
  }
}
