import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import Repository from './repository';

describe('core.clone', () => {
  it('should clone existing repository', async () => {
    const baseDir = await os.tmpdir();
    const repo = await Repository.clone(
      'https://github.com/JonathanGeoffroy/giticket',
      baseDir
    );

    expect(repo.dir).toEqual(path.join(baseDir, 'giticket'));
    const actualGit = await fs.promises.stat(path.join(repo.dir, '.git'));
    expect(actualGit.isDirectory()).toBeTruthy();
  });
});
