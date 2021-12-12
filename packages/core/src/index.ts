import Commit from './lib/commit-manager';
import Item from './lib/item-manager';
import Repository from './lib/repository';
import { clone, init } from 'isomorphic-git';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'isomorphic-git/http/node';

export default class Giticket extends Commit(Item(Repository)) {
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
