import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { clone } from './core';

describe('core', () => {
  it('should clone existing repository', async () => {
    const baseDir = await os.tmpdir();
    const actual = await clone(
      'https://github.com/JonathanGeoffroy/giticket',
      baseDir
    );

    expect(actual).toEqual(path.join(baseDir, 'giticket'));
    const actualGit = await fs.stat(path.join(actual, '.git'));
    expect(actualGit.isDirectory()).toBeTruthy();
  });
});
