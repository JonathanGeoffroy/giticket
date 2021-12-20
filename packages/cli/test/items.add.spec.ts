import Giticket from '@giticket/core';
import { cleanupRepository, initRepository } from './utils';
import stringArgv from 'string-argv';
import cli from '../src/app/cli';
import { InvalidArgumentError } from 'commander';

describe('item add', () => {
  let git: Giticket;
  let processExit: jest.SpyInstance;
  beforeEach(async () => {
    // Prevent from exiting when testing errors
    processExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      return undefined as never;
    });

    git = await initRepository();
  });

  afterEach(async () => {
    await cleanupRepository(git);
    processExit.mockReset();
  });

  it('should add item with only a title', async () => {
    await cli.parseAsync(
      stringArgv(`item add -C ${git.dir} "some test"`, 'node', 'testing')
    );

    const list = await git.listItems({});
    expect(list.results).toHaveLength(1);
    expect(list.results[0]).toMatchObject({
      title: 'some test',
      description: '',
      kind: 'issue',
    });
  });

  it('should add item with only a title and a description', async () => {
    await cli.parseAsync(
      stringArgv(
        `item add -C ${git.dir} first -d 'different description' `,
        'node',
        'testing'
      )
    );

    const list = await git.listItems({});
    expect(list.results).toHaveLength(1);
    expect(list.results[0]).toMatchObject({
      title: 'first',
      description: 'different description',
      kind: 'issue',
    });
  });

  it('should add item with all fields', async () => {
    await cli.parseAsync(
      stringArgv(
        `item add "a third test" -C ${git.dir} -d 'some description' -k 'ticket'`,
        'node',
        'testing'
      )
    );

    const list = await git.listItems({});
    expect(list.results).toHaveLength(1);
    expect(list.results[0]).toMatchObject({
      title: 'a third test',
      description: 'some description',
      kind: 'ticket',
    });
  });

  it('should throws if mandatory title is not provided', async () => {
    expect(
      cli.parseAsync(
        stringArgv(
          `item add -C  ${git.dir} -d 'some description' -k 'ticket' `,
          'node',
          'testing'
        )
      )
    ).rejects.toBeInstanceOf(InvalidArgumentError);

    expect(processExit).toHaveBeenCalledWith(1);

    const items = await git.listItems({});
    expect(items.results).toHaveLength(0);
  });
});
