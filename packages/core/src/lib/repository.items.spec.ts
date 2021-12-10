import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import NoMoreItemError from './errors/noMoreItemError';
import Repository from './repository';

describe('items', () => {
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

  it('should list empty list of items', async () => {
    expect(repo.listItems({})).resolves.toMatchObject({
      hasNext: false,
      results: [],
    });
  });

  it('should add items', async () => {
    const first = {
      title: 'First',
      description: 'Some test',
      kind: 'issue',
    };

    const second = {
      ...first,
      title: 'Second',
    };

    const third = {
      ...first,
      title: 'Second',
    };

    await repo.addItem(first);
    let itemList = await repo.listItems({});
    expect(itemList.results).toMatchObject([first]);
    expect(itemList.results[0].id).not.toBeNull();

    await repo.addItem(second);
    itemList = await repo.listItems({});
    expect(itemList.results).toMatchObject([second, first]);
    expect(itemList.results[0].id).not.toBeNull();
    expect(itemList.results[1].id).not.toBeNull();

    await repo.addItem(third);
    itemList = await repo.listItems({});
    expect(itemList.results).toMatchObject([third, second, first]);
    expect(itemList.results[0].id).not.toBeNull();
    expect(itemList.results[1].id).not.toBeNull();
    expect(itemList.results[2].id).not.toBeNull();

    // Check we don't pollute current branch
    expect(repo.listCommits()).rejects.toMatchObject({ code: 'NotFoundError' });
  });

  it('should handle pagination', async () => {
    for (let i = 0; i < 8; i++) {
      await repo.addItem({
        title: `title ${i}`,
        description: `description ${i}`,
        kind: 'issue',
      });
    }

    let itemList = await repo.listItems({ limit: 3 });
    expect(itemList.results).toHaveLength(3);
    expect(itemList.results[0].title).toEqual('title 7');
    expect(itemList.results[1].title).toEqual('title 6');
    expect(itemList.results[2].title).toEqual('title 5');
    expect(itemList.hasNext).toBeTruthy();

    itemList = await itemList.next();
    expect(itemList.results).toHaveLength(3);
    expect(itemList.results[0].title).toEqual('title 4');
    expect(itemList.results[1].title).toEqual('title 3');
    expect(itemList.results[2].title).toEqual('title 2');
    expect(itemList.hasNext).toBeTruthy();

    itemList = await itemList.next();
    expect(itemList.results).toHaveLength(2);
    expect(itemList.results[0].title).toEqual('title 1');
    expect(itemList.results[1].title).toEqual('title 0');
    expect(itemList.hasNext).toBeFalsy();

    expect(itemList.next()).rejects.toBeInstanceOf(NoMoreItemError);
  });
});
