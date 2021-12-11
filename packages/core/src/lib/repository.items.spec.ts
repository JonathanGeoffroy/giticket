import NoMoreItemError from './errors/noMoreItemError';
import { AddItem } from './models/item';
import Repository from './repository';
import { initRepository, cleanupRepository } from '../testing/helpers';

describe('items', () => {
  let repo: Repository;

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

    checkList([first]);

    await repo.addItem(second);
    checkList([second, first]);

    await repo.addItem(third);
    checkList([third, second, first]);

    // Check we don't pollute current branch
    expect(repo.listCommits()).rejects.toMatchObject({ code: 'NotFoundError' });

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
