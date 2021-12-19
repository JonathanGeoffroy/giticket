import Giticket, { AddItem, Item } from '@giticket/core';
import { Command } from 'commander';
import * as chalk from 'chalk';
import { log } from 'loglevel';
import * as fs from 'fs';
import * as http from 'isomorphic-git/http/node';
import { strictlyPositiveNumber } from './checker';

function listCommand(): Command {
  return new Command('list')
    .option(
      '-C, --path <path>',
      'repository path ; current directory if ommited',
      './'
    )
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

export default function handleItemCommands(): Command {
  return new Command('item').addCommand(listCommand());
}

function format(item: Item): string {
  return `${chalk.underline(item.id)}\u0009${chalk.italic(item.kind)}\u0009${
    item.title
  }`;
}
