import * as git from 'isomorphic-git';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'isomorphic-git/http/node';
import NoMoreItemError from './errors/noMoreItemError';

export interface CommitPage {
  hasNext: boolean;
  next: () => Promise<CommitPage>;
  results: git.ReadCommitResult[];
}

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
