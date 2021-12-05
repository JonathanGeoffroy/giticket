import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as git from 'isomorphic-git';
import Repository from './repository';
import NoMoreItemError from './errors/noMoreItemError';

describe('listCommits', () => {
  async function commitSomethingNew(line: string, commit: string) {
    await fs.promises.writeFile(path.join(repo.dir, 'README.md'), line, {
      flag: 'a',
    });
    await git.add({ fs, dir: repo.dir, filepath: 'README.md' });
    return await git.commit({
      fs,
      dir: repo.dir,
      message: commit,
      author: { email: 'test@giticket.com', name: 'test' },
    });
  }

  let repo: Repository;

  beforeEach(async () => {
    const baseDir = await os.tmpdir();
    repo = await Repository.init(path.join(baseDir, 'giticket-test'));
  });

  afterEach(async () => {
    return fs.promises.rm(repo.dir, {
      recursive: true,
    });
  });

  // FIXME is this really what we want ?
  it('should throw NotFoundError for empty repository', async () => {
    expect(repo.listCommits()).rejects.toMatchObject({ code: 'NotFoundError' });
  });

  it('should list commits', async () => {
    const commitId = await commitSomethingNew('# TEST', 'test');

    const actual = await repo.listCommits();
    expect(actual.results).toHaveLength(1);
    expect(actual.results[0]).toMatchObject({
      oid: commitId,
      commit: { message: 'test\n' },
    });
  });

  it('should paginate commits', async () => {
    let commits = [];
    for (let i = 0; i < 9; i++) {
      commits = [
        await commitSomethingNew(`line #${i}`, `commit #${i}`),
        ...commits,
      ];
    }

    // First page
    let actual = await repo.listCommits({ depth: 5 });
    expect(actual.results).toHaveLength(5);
    for (let i = 0; i < 5; i++) {
      expect(actual.results[i]).toMatchObject({
        oid: commits[i],
        commit: {
          message: `commit #${8 - i}\n`,
        },
      });
    }
    expect(actual.hasNext).toBeTruthy();

    // Second page
    actual = await actual.next();
    expect(actual.results).toHaveLength(4);

    for (let i = 0; i < 4; i++) {
      expect(actual.results[i]).toMatchObject({
        oid: commits[5 + i],
        commit: {
          message: `commit #${3 - i}\n`,
        },
      });
    }
    expect(actual.hasNext).toBeFalsy();

    expect(actual.next()).rejects.toBeInstanceOf(NoMoreItemError);
  });
});