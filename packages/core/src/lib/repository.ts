import * as git from 'isomorphic-git';

export default class Repository {
  options: { dir: string; fs: git.FsClient; http: git.HttpClient };

  constructor(
    dir: string,
    readonly fs: git.FsClient = fs,
    readonly http: git.HttpClient
  ) {
    this.options = { dir, fs, http };
  }

  get dir() {
    return this.options.dir;
  }

  protected async commit(options: {
    tree: string;
    parent: string[] | string[];
    message: string;
    author:
      | { name: string }
      | {
          name?: string;
          email?: string;
          timestamp?: number;
          timezoneOffset?: number;
        };
    ref: string;
    onSign?: git.SignCallback;
    committer?: {
      name?: string;
      email?: string;
      timestamp?: number;
      timezoneOffset?: number;
    };
    signingKey?: string;
    dryRun?: boolean;
    noUpdateBranch?: boolean;
    cache?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }): Promise<string> {
    return git.commit({ ...this.options, ...options });
  }

  protected async readBlob(options: {
    oid: string;
    filepath?: string;
    cache?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }): Promise<git.ReadBlobResult> {
    return git.readBlob({ ...this.options, ...options });
  }

  protected async readCommit(options: {
    oid: string;
    cache?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }): Promise<git.ReadCommitResult> {
    return git.readCommit({ ...this.options, ...options });
  }

  protected async readTree(options: {
    oid: string;
    ref?: string;
    filepath?: string;
    cache?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }): Promise<git.ReadTreeResult> {
    return git.readTree({ ...this.options, ...options });
  }

  protected async resolveRef(options: {
    ref: string;
    depth?: number;
  }): Promise<string> {
    return git.resolveRef({ ...this.options, ...options });
  }

  protected async writeBlob(blob: Uint8Array): Promise<string> {
    return git.writeBlob({ ...this.options, blob });
  }

  protected async writeRef(options: {
    ref: string;
    value: string;
    force: boolean;
    symbolic?: boolean;
  }): Promise<void> {
    return git.writeRef({ ...this.options, ...options });
  }

  protected async writeTree(tree: git.TreeEntry[]): Promise<string> {
    return git.writeTree({ ...this.options, tree });
  }
}
