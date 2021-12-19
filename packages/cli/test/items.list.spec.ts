import Giticket, { Item } from '@giticket/core';
import log from 'loglevel';
import { cleanupRepository, initRepository } from './utils';
import stringArgv from 'string-argv';
import cli from '../src/app/cli';
import chalk = require('chalk');

describe('item list', () => {
  let spyedLog: jest.SpyInstance;
  let git: Giticket;

  beforeEach(async () => {
    spyedLog = jest.spyOn(log, 'log');

    // Prevent from exiting when testing errors
    jest.spyOn(process, 'exit').mockImplementation(() => {
      return undefined as never;
    });

    git = await initRepository();
  });

  afterEach(async () => {
    spyedLog.mockReset();
    await cleanupRepository(git);
  });

  it('should list empty list', () => {
    cli.parse(stringArgv(`item list -C ${git.dir}`, 'node', 'testing'));
    expect(spyedLog).not.toHaveBeenCalled();
  });

  it('should list single item', async () => {
    const item = await git.addItem({
      kind: 'test',
      description: 'a test description',
      title: 'test title',
    });

    await cli.parseAsync(
      stringArgv(`item list -C ${git.dir}`, 'node', 'testing')
    );
    expect(spyedLog).toHaveBeenCalledWith(
      stringify(item.id, item.title, item.kind)
    );
  });

  it('should list multiple items', async () => {
    const items: Item[] = await addItems(5);

    await cli.parseAsync(
      stringArgv(`item list -C ${git.dir}`, 'node', 'testing')
    );

    expect(spyedLog.mock.calls).toEqual([
      [stringify(items[4].id, 'test 4', 'test')],
      [stringify(items[3].id, 'test 3', 'test')],
      [stringify(items[2].id, 'test 2', 'test')],
      [stringify(items[1].id, 'test 1', 'test')],
      [stringify(items[0].id, 'test 0', 'test')],
    ]);
  });

  it('should handle limit', async () => {
    const items: Item[] = await addItems(5);

    await cli.parseAsync(
      stringArgv(`item list -C ${git.dir} -s 3`, 'node', 'testing')
    );

    expect(spyedLog.mock.calls).toEqual([
      [stringify(items[4].id, 'test 4', 'test')],
      [stringify(items[3].id, 'test 3', 'test')],
      [stringify(items[2].id, 'test 2', 'test')],
    ]);
  });

  it('should handle limit negative size error', async () => {
    expect(
      cli.parseAsync(
        stringArgv(`item list -C ${git.dir} -s -3`, 'node', 'testing')
      )
    ).rejects.toThrow('Strictly positive number expected');
  });

  it('should handle limit 0 size error', async () => {
    expect(
      cli.parseAsync(
        stringArgv(`item list -C ${git.dir} -s 0`, 'node', 'testing')
      )
    ).rejects.toThrow('Strictly positive number expected');
  });

  it('should handle limit NaN size error', async () => {
    expect(
      cli.parseAsync(
        stringArgv(`item list -C ${git.dir} -s seven`, 'node', 'testing')
      )
    ).rejects.toThrow('Strictly positive number expected');
  });

  function stringify(id, title, kind) {
    return `${chalk.underline(id)}\u0009${chalk.italic(kind)}\u0009${title}`;
  }

  async function addItems(number: number) {
    const items: Item[] = [];

    for (let i = 0; i < number; i++) {
      items.push(
        await git.addItem({
          kind: 'test',
          description: `description ${i}`,
          title: `test ${i}`,
        })
      );
    }
    return items;
  }
});
