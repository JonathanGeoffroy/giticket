import Giticket from '@giticket/core';
import * as isogit from 'isomorphic-git';
import { cleanupRepository, initRepository } from './utils';
import stringArgv from 'string-argv';
import { InvalidArgumentError } from 'commander';

let cli;

describe('item edit', () => {
  let git: Giticket;
  let processExit: jest.SpyInstance;
  beforeEach(async () => {
    jest.isolateModules(() => {
      // Reset module for each test
      // This prevent commanderjs from keeping previous option states
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      cli = require('../src/app/cli').default;
    });

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

  it('should edit only title', async () => {
    const item = await git.addItem({
      description: 'add description',
      kind: 'add',
      title: 'add title',
    });

    await cli.parseAsync(
      stringArgv(
        `item edit ${item.id} -C ${git.dir} -t 'edit title'`,
        'node',
        'testing'
      )
    );

    const { results } = await git.listItems({});

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      id: item.id,
      kind: 'add',
      title: 'edit title',
      description: 'add description',
    });
  });

  it('should edit only description', async () => {
    const item = await addItem();

    await cli.parseAsync(
      stringArgv(
        `item edit ${item.id} -C ${git.dir} -d 'edit description'`,
        'node',
        'testing'
      )
    );

    const { results } = await git.listItems({});

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      id: item.id,
      kind: 'add',
      title: 'add title',
      description: 'edit description',
    });
  });
  it('should edit only kind', async () => {
    const item = await git.addItem({
      description: 'add description',
      kind: 'add',
      title: 'add title',
    });

    await cli.parseAsync(
      stringArgv(
        `item edit ${item.id} -C ${git.dir} -k 'edit'`,
        'node',
        'testing'
      )
    );

    const { results } = await git.listItems({});

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      id: item.id,
      kind: 'edit',
      title: 'add title',
      description: 'add description',
    });
  });

  it('should edit existing item with all fields', async () => {
    const item = await git.addItem({
      description: 'add description',
      kind: 'add',
      title: 'add title',
    });

    await cli.parseAsync(
      stringArgv(
        `item edit ${item.id} -C ${git.dir} -t 'edit title' -d 'different description' -k edited`,
        'node',
        'testing'
      )
    );

    const { results } = await git.listItems({});

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      id: item.id,
      kind: 'edited',
      title: 'edit title',
      description: 'different description',
    });
  });

  it('should yield id is mandatory', async () => {
    const addItem = await git.addItem({
      description: 'add description',
      kind: 'add',
      title: 'add title',
    });

    await expect(
      cli.parseAsync(
        stringArgv(
          `item edit  -C ${git.dir} -t 'edit title' -d 'different description' -k edited`,
          'node',
          'testing'
        )
      )
    ).rejects.toEqual(new InvalidArgumentError('id is mandatory'));

    const { results } = await git.listItems({});
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual(addItem); // Nothing editted

    expect(processExit).toHaveBeenCalledWith(1);
  });

  it("should yield id doesn't exist", async () => {
    const addItem = await git.addItem({
      description: 'add description',
      kind: 'add',
      title: 'add title',
    });

    await expect(
      cli.parseAsync(
        stringArgv(
          `item edit  this-does-not-exist -C ${git.dir} -t 'edit title' -d 'different description' -k edited`,
          'node',
          'testing'
        )
      )
    ).rejects.toEqual(new isogit.Errors.NotFoundError('this-does-not-exist'));

    const { results } = await git.listItems({});
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual(addItem); // Nothing editted
  });

  async function addItem() {
    return await git.addItem({
      description: 'add description',
      kind: 'add',
      title: 'add title',
    });
  }
});
