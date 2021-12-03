import * as git from 'isomorphic-git';
import * as fs from 'fs';
import * as http from 'isomorphic-git/http/node';
import path = require('path');

export async function clone(
  url: string,
  baseDirectory: string
): Promise<string> {
  const dir = path.join(baseDirectory, url.split('/').slice(-1)[0]);
  await git.clone({ fs, http, dir, url });
  return dir;
}

export async function listCommits(
  repository: string
): Promise<git.ReadCommitResult[]> {
  return git.log({ fs, dir: repository });
}
