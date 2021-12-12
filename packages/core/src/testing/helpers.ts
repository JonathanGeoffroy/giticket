import * as os from 'os';
import * as path from 'path';
import { promises as fs } from 'fs';
import { v4 as uuid } from 'uuid';
import Repository from '../index';

export async function randomTmpDir() {
  const baseDir = await os.tmpdir();
  return path.join(baseDir, uuid());
}

export async function initRepository(): Promise<Repository> {
  const baseDir = await randomTmpDir();
  return await Repository.init(path.join(baseDir, 'giticket-test'));
}

export async function cleanupRepository(repo: Repository) {
  fs.rm(repo.dir, {
    recursive: true,
    force: true,
  });
}
