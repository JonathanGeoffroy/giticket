import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as git from 'isomorphic-git';
import { listCommits } from './core';

describe('core.listCommits', () => {
  let repo;

  beforeEach(async () => {
    const baseDir = await os.tmpdir();
    repo = path.join(baseDir, 'giticket-test');

    await git.init({
      fs,
      dir: repo,
    });
  });

  afterEach(async () => {
    return fs.promises.rm(repo, {
      recursive: true,
    });
  });

  it('should list commits', async () => {
    // FIXME is this really what we want ?
    expect(listCommits(repo)).rejects.toMatchObject({ code: 'NotFoundError' });

    await fs.promises.writeFile(path.join(repo, 'README.md'), `# TEST`);
    await git.add({ fs, dir: repo, filepath: 'README.md' });
    const commitId = await git.commit({
      fs,
      dir: repo,
      message: 'test',
      author: { email: 'test@giticket.com', name: 'test' },
    });

    const actual = await listCommits(repo);
    expect(actual).toHaveLength(1);
    expect(actual[0]).toMatchObject({
      oid: commitId,
      commit: { message: 'test\n' },
    });
  });
});
