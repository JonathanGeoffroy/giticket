import Giticket, { AddItem, Item } from '@giticket/core';
import { Command, Option, InvalidArgumentError } from 'commander';
import * as chalk from 'chalk';
import { log } from 'loglevel';
import * as fs from 'fs';
import * as http from 'isomorphic-git/http/node';
import { strictlyPositiveNumber } from './checker';

function pathOption(): Option {
  return new Option(
    '-C, --path <path>',
    'repository path ; current directory if ommited'
  ).default('./');
}

function listCommand(): Command {
  return new Command('list')
    .addOption(pathOption())
    .option(
      '-s --size <size>',
      'Size of the pagination',
      strictlyPositiveNumber
    )
    .action(async ({ path, size }) => {
      const git = new Giticket(path, fs, http);
      const items = await git.listItems({ limit: size });
      items.results.map(format).forEach((str) => log(str));
    });
}

function addCommand(): Command {
  return new Command('add')
    .argument('<title>', 'title of the new item')
    .addOption(pathOption())
    .option(
      '-d, --description <description>',
      'description of the new item ; empty if ommited',
      ''
    )
    .option(
      '-k, --kind <kind>',
      'kind of the new item ; `issue` if ommited',
      'issue'
    )
    .action(async (title, { description, kind, path }) => {
      if (!title) {
        throw new InvalidArgumentError('title is mandatory');
      }
      const git = new Giticket(path, fs, http);

      const item: AddItem = {
        title,
        description,
        kind,
      };

      await git.addItem(item);
    });
}

export default function handleItemCommands(): Command {
  return new Command('item').addCommand(listCommand()).addCommand(addCommand());
}

function format(item: Item): string {
  return `${chalk.underline(item.id)}\u0009${chalk.italic(item.kind)}\u0009${
    item.title
  }`;
}
