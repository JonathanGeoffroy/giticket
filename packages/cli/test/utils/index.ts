import * as os from 'os';
import * as path from 'path';
import { promises as fs } from 'fs';
import { v4 as uuid } from 'uuid';
import Giticket from '@giticket/core';

export async function randomTmpDir() {
  const baseDir = await os.tmpdir();
  return path.join(baseDir, uuid());
}

export async function initRepository(): Promise<Giticket> {
  const baseDir = await randomTmpDir();
  return await Giticket.init(path.join(baseDir, 'giticket-test'));
}

export async function cleanupRepository(repo: Giticket) {
  fs.rm(repo.dir, {
    recursive: true,
    force: true,
  });
}
