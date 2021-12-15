import Giticket, { AddItem } from '../src';
import { initRepository, cleanupRepository } from './utils';
import { item } from '../src/';

describe('filters', () => {
  let repo: Giticket;

  const first: AddItem = {
    title: 'First',
    description: 'Some test',
    kind: 'issue',
  };

  const second: AddItem = {
    title: 'Second',
    description: 'Second description',
    kind: 'issue',
  };

  const third: AddItem = {
    title: 'Third',
    description: 'Third description',
    kind: 'feature',
  };

  beforeEach(async () => {
    repo = await initRepository();

    await repo.addItem(first);
    await repo.addItem(second);
    await repo.addItem(third);
  });

  afterEach(() => cleanupRepository(repo));

  it('should find field containing exact pattern', async () => {
    return expect(
      repo.searchItems(item('title').contains('Third'))
    ).resolves.toMatchObject([third]);
  });

  it('should find field *not* containing exact pattern', async () => {
    return expect(
      repo.searchItems(item('title').not.contains('Third'))
    ).resolves.toMatchObject([second, first]);
  });

  it('should filter by title containing starting match', async () => {
    return expect(
      repo.searchItems(item('description').contains('Third'))
    ).resolves.toMatchObject([third]);
  });

  it('should filter by title *not* containing starting match', async () => {
    return expect(
      repo.searchItems(item('description').not.contains('Third'))
    ).resolves.toMatchObject([second, first]);
  });

  it('should filter by title containing matching pattern', async () => {
    return expect(
      repo.searchItems(item('description').contains('description'))
    ).resolves.toMatchObject([third, second]);
  });

  it('should filter by title *not* containing matching pattern', async () => {
    return expect(
      repo.searchItems(item('description').not.contains('description'))
    ).resolves.toMatchObject([first]);
  });

  it('should filter item strictly less than value', async () => {
    await expect(
      repo.searchItems(item('title').lt('Third'))
    ).resolves.toMatchObject([second, first]);

    await expect(
      repo.searchItems(item('title').lt('Second'))
    ).resolves.toMatchObject([first]);

    await expect(
      repo.searchItems(item('title').lt('second'))
    ).resolves.toMatchObject([third, second, first]);

    await expect(
      repo.searchItems(item('title').lt('Univers'))
    ).resolves.toMatchObject([third, second, first]);

    await expect(
      repo.searchItems(item('title').lt('Sec'))
    ).resolves.toMatchObject([first]);

    await expect(
      repo.searchItems(item('title').lt('Hello'))
    ).resolves.toMatchObject([first]);
  });

  it('should filter item *not* strictly less than value', async () => {
    await expect(
      repo.searchItems(item('title').not.lt('Third'))
    ).resolves.toMatchObject([third]);

    await expect(
      repo.searchItems(item('title').not.lt('Second'))
    ).resolves.toMatchObject([third, second]);

    await expect(
      repo.searchItems(item('title').not.lt('second'))
    ).resolves.toMatchObject([]);

    await expect(
      repo.searchItems(item('title').not.lt('Univers'))
    ).resolves.toMatchObject([]);

    await expect(
      repo.searchItems(item('title').not.lt('Sec'))
    ).resolves.toMatchObject([third, second]);

    await expect(
      repo.searchItems(item('title').not.lt('Hello'))
    ).resolves.toMatchObject([third, second]);
  });

  it('should filter item strictly greater than value', async () => {
    await expect(
      repo.searchItems(item('title').gt('Third'))
    ).resolves.toMatchObject([]);

    await expect(
      repo.searchItems(item('title').gt('Second'))
    ).resolves.toMatchObject([third]);

    await expect(
      repo.searchItems(item('title').gt('second'))
    ).resolves.toMatchObject([]);

    await expect(
      repo.searchItems(item('title').gt('Univers'))
    ).resolves.toMatchObject([]);

    await expect(
      repo.searchItems(item('title').gt('Sec'))
    ).resolves.toMatchObject([third, second]);

    await expect(
      repo.searchItems(item('title').gt('Hello'))
    ).resolves.toMatchObject([third, second]);
  });

  it('should filter item *not* strictly greater than value', async () => {
    await expect(
      repo.searchItems(item('title').not.gt('Third'))
    ).resolves.toMatchObject([third, second, first]);

    await expect(
      repo.searchItems(item('title').not.gt('Second'))
    ).resolves.toMatchObject([second, first]);

    await expect(
      repo.searchItems(item('title').not.gt('second'))
    ).resolves.toMatchObject([third, second, first]);

    await expect(
      repo.searchItems(item('title').not.gt('Univers'))
    ).resolves.toMatchObject([third, second, first]);

    await expect(
      repo.searchItems(item('title').not.gt('Sec'))
    ).resolves.toMatchObject([first]);

    await expect(
      repo.searchItems(item('title').not.gt('Hello'))
    ).resolves.toMatchObject([first]);
  });

  it('should filter existing fields', async () => {
    await repo.addItem({
      title: null,
      description: undefined,
      kind: '',
    });

    await expect(
      repo.searchItems(item('title').exist())
    ).resolves.toMatchObject([third, second, first]);
    await expect(
      repo.searchItems(item('description').exist())
    ).resolves.toMatchObject([third, second, first]);
    await expect(repo.searchItems(item('kind').exist())).resolves.toMatchObject(
      [
        {
          title: null,
          kind: '',
        },
        third,
        second,
        first,
      ]
    );
  });

  it('should filter *not* existing fields', async () => {
    const expectedNull = {
      title: null,
      kind: '',
    };

    await repo.addItem({
      ...expectedNull,
      description: undefined,
    });

    await expect(
      repo.searchItems(item('title').not.exist())
    ).resolves.toMatchObject([expectedNull]);
    await expect(
      repo.searchItems(item('description').not.exist())
    ).resolves.toMatchObject([expectedNull]);
    await expect(
      repo.searchItems(item('kind').not.exist())
    ).resolves.toMatchObject([]);
  });

  it('should filter null fields', async () => {
    const expectedNull = {
      title: null,
      kind: '',
    };

    await repo.addItem({
      ...expectedNull,
      description: undefined,
    });

    await expect(
      repo.searchItems(item('title').isNull())
    ).resolves.toMatchObject([expectedNull]);
    await expect(
      repo.searchItems(item('description').isNull())
    ).resolves.toMatchObject([]);
    await expect(
      repo.searchItems(item('kind').isNull())
    ).resolves.toMatchObject([]);
  });

  it('should filter *not* null fields', async () => {
    const expectedNull = {
      title: null,
      kind: '',
    };

    await repo.addItem({
      ...expectedNull,
      description: undefined,
    });

    await expect(
      repo.searchItems(item('title').not.isNull())
    ).resolves.toMatchObject([third, second, first]);
    await expect(
      repo.searchItems(item('description').not.isNull())
    ).resolves.toMatchObject([expectedNull, third, second, first]);
    await expect(
      repo.searchItems(item('kind').not.isNull())
    ).resolves.toMatchObject([expectedNull, third, second, first]);
  });

  it('should filter by equality', async () => {
    await expect(
      repo.searchItems(item('kind').eq('feature'))
    ).resolves.toMatchObject([third]);

    await expect(
      repo.searchItems(item('kind').eq('issue'))
    ).resolves.toMatchObject([second, first]);
  });

  it('should filter by difference', async () => {
    await expect(
      repo.searchItems(item('kind').not.eq('feature'))
    ).resolves.toMatchObject([second, first]);

    await expect(
      repo.searchItems(item('kind').not.eq('issue'))
    ).resolves.toMatchObject([third]);

    await expect(
      repo.searchItems(item('kind').not.eq('feature'))
    ).resolves.toMatchObject([second, first]);
  });
});
