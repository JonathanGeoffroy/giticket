import * as git from 'isomorphic-git';
import NoMoreItemError from './errors/noMoreItemError';
import Repository from './repository';
import { Page } from './models/page';
import Constructor from './mixin';

type Gitable = Constructor<Repository>;

export type CommitPage = Page<git.ReadCommitResult>;

export default function <TBase extends Gitable>(Base: TBase) {
  return class extends Base {
    async listCommits(
      params: {
        ref?: string;
        depth?: number;
      } = {}
    ): Promise<CommitPage> {
      const { ref, depth } = { ...params };

      const results = await git.log({
        ...this.options,
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
  };
}
