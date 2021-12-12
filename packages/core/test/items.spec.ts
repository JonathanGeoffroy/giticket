import Giticket, { AddItem, NoMoreItemError } from '../src';
import { initRepository, cleanupRepository } from './utils';
import * as git from 'isomorphic-git';

const first: AddItem = {
  title: 'First',
  description: 'Some test',
  kind: 'issue',
};

const second: AddItem = {
  ...first,
  title: 'Second',
};

const third: AddItem = {
  ...first,
  title: 'Third',
};

describe('items', () => {
  let repo: Giticket;

  beforeEach(async () => {
    repo = await initRepository();
  });

  afterEach(() => cleanupRepository(repo));

  it('should list empty list of items', async () => {
    const actual = await repo.listItems({});
    expect(actual.results).toEqual([]);
    expect(actual.hasNext).toBeFalsy();
    expect(actual.next()).rejects.toBeInstanceOf(NoMoreItemError);
  });

  it('should add items', async () => {
    await repo.addItem(first);

    await checkList([first]);

    await repo.addItem(second);
    await checkList([second, first]);

    await repo.addItem(third);
    await checkList([third, second, first]);

    // Check we don't pollute current branch
    expect(repo.listCommits()).rejects.toMatchObject({ code: 'NotFoundError' });
  });

  it('should edit items', async () => {
    const firstAdded = await repo.addItem(first);
    const secondAdded = await repo.addItem(second);
    const thirdAdded = await repo.addItem(third);

    await checkList([third, second, first]);

    const firstEdited = {
      ...firstAdded,
      title: 'Edited first',
      status: 'closed',
    };
    await repo.editItem(firstEdited);
    await checkList([firstEdited, thirdAdded, secondAdded]);
  });

  it('should refuse to edit non existing item', async () => {
    await repo.addItem(first);
    await repo.addItem(second);
    await repo.addItem(third);

    expect(
      repo.editItem({
        id: 'doesntexist',
        title: "doesn't exist",
        description: "a test for item that doesn't exist",
        kind: 'test',
      })
    ).rejects.toBeInstanceOf(git.Errors.NotFoundError);
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

  async function checkList(expected: AddItem[]) {
    const itemList = await repo.listItems({});
    expect(itemList.results).toMatchObject(expected);
    for (const item of itemList.results) {
      expect(item.id).not.toBeNull();
    }

    expect(itemList.hasNext).toBeFalsy();
    expect(itemList.next()).rejects.toBeInstanceOf(NoMoreItemError);
  }
});
