import * as git from 'isomorphic-git';
import NoMoreItemError from './errors/noMoreItemError';
import Repository from './repository';
import { Page } from './models/page';
import Constructor from './mixin';

type Gitable = Constructor<Repository>;

export type CommitPage = Page<git.ReadCommitResult>;

/**
 * Handles commits behavior from a specific git repository
 * @param Base mixins for Repository
 * @returns a Mixins handling commits behavior
 */
export default function <TBase extends Gitable>(Base: TBase) {
  return class extends Base {
    /**
     * List commits.
     * By default, this will returns all commits of the current ref (HEAD).
     * Default behavior can be changed by providing `ref` and `depth` params
     * @param params {
     * refs: the refs where to start listing ; uses the current ref if ommited
     * depth: number of commits maximum to returns ; returns all commits if ommited
     * }
     * @returns
     */
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
