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

  it('should filter by equality', async () => {
    expect(repo.searchItems(item('kind').eq('feature'))).resolves.toMatchObject(
      [third]
    );

    expect(repo.searchItems(item('kind').eq('issue'))).resolves.toMatchObject([
      second,
      first,
    ]);
  });

  it('should filter by difference', async () => {
    expect(
      repo.searchItems(item('kind').not.eq('feature'))
    ).resolves.toMatchObject([second, first]);

    expect(
      repo.searchItems(item('kind').not.eq('issue'))
    ).resolves.toMatchObject([third]);

    expect(
      repo.searchItems(item('kind').not.eq('feature'))
    ).resolves.toMatchObject([third]);

    expect(
      repo.searchItems(item('kind').not.eq('issue'))
    ).resolves.toMatchObject([second, first]);
  });
});
