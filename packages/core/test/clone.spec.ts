import * as fs from 'fs';
import * as path from 'path';
import Giticket from '../src';
import { randomTmpDir } from './utils';

describe('core.clone', () => {
  it('should clone existing repository', async () => {
    const baseDir = await randomTmpDir();
    try {
      const repo = await Giticket.clone(
        'https://github.com/JonathanGeoffroy/giticket',
        baseDir
      );

      expect(repo.dir).toEqual(path.join(baseDir, 'giticket'));
      const actualGit = await fs.promises.stat(path.join(repo.dir, '.git'));
      expect(actualGit.isDirectory()).toBeTruthy();
    } finally {
      fs.promises.rm(baseDir, { recursive: true, force: true });
    }
  });
});
