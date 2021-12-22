import Giticket, { AddItem, EditItem, Item } from '@giticket/core';
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

function editCommand(): Command {
  return new Command('edit')
    .argument('<id>', 'item identifier')
    .addOption(pathOption())
    .option('-t, --title <title>', "item's title")
    .option('-d, --description <description>', "item's description")
    .option('-k, --kind <kind>', "item's kind")
    .action(async (id, { title, description, kind, path }) => {
      if (!id) {
        throw new InvalidArgumentError('id is mandatory');
      }

      const git = new Giticket(path, fs, http);

      const item: EditItem = {
        id,
      };

      setIfDefined('title', title, item);
      setIfDefined('description', description, item);
      setIfDefined('kind', kind, item);

      await git.editItem(item);
    });
}

export default function handleItemCommands(): Command {
  return new Command('item')
    .addCommand(listCommand())
    .addCommand(addCommand())
    .addCommand(editCommand());
}

function format(item: Item): string {
  return `${chalk.underline(item.id)}\u0009${chalk.italic(item.kind)}\u0009${
    item.title
  }`;
}

function setIfDefined(property: string, value: string, item: EditItem) {
  if (value !== undefined) {
    item[property] = value;
  }
}
