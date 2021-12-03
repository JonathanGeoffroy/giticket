import * as git from 'isomorphic-git';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'isomorphic-git/http/node';

export default class Repository {
  constructor(
    readonly dir: string,
    private readonly fs: git.FsClient = fs,
    private readonly http: git.HttpClient
  ) {}

  listCommits(): Promise<git.ReadCommitResult[]> {
    return git.log({ fs: this.fs, dir: this.dir }).catch((err) => {
      if (err.code === 'NotFoundError') {
        // No commit on branch
        return [];
      }
      throw err;
    });
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
