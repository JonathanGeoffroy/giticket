import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as git from 'isomorphic-git';
import Repository from './repository';

describe('core.listCommits', () => {
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

  it('should list commits', async () => {
    expect(repo.listCommits()).resolves.toHaveLength(0);

    await fs.promises.writeFile(path.join(repo.dir, 'README.md'), `# TEST`);
    await git.add({ fs, dir: repo.dir, filepath: 'README.md' });
    const commitId = await git.commit({
      fs,
      dir: repo.dir,
      message: 'test',
      author: { email: 'test@giticket.com', name: 'test' },
    });

    const actual = await repo.listCommits();
    expect(actual).toHaveLength(1);
    expect(actual[0]).toMatchObject({
      oid: commitId,
      commit: { message: 'test\n' },
    });
  });
});
