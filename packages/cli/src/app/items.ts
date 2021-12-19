import Giticket, { Item } from '@giticket/core';
import { Command, InvalidArgumentError } from 'commander';
import * as chalk from 'chalk';
import { log } from 'loglevel';
import * as fs from 'fs';
import * as http from 'isomorphic-git/http/node';

export default function handleItemCommands(): Command {
  function strictlyPositiveNumber(value) {
    // parseInt takes a string and a radix
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue) || parsedValue <= 0) {
      throw new InvalidArgumentError('Strictly positive number expected');
    }
    return parsedValue;
  }

  const itemCommand = new Command('item');
  itemCommand
    .command('list [gitDir]')
    .option(
      '-s --size <size>',
      'Size of the pagination',
      strictlyPositiveNumber
    )
    .action(async (gitDir = './', { ref, size }) => {
      const git = new Giticket(gitDir, fs, http);
      const items = await git.listItems({ ref, limit: size });
      items.results.map(format).forEach((str) => log(str));
    });

  return itemCommand;
}

function format(item: Item): string {
  return `${chalk.underline(item.id)}\u0009${chalk.italic(item.kind)}\u0009${
    item.title
  }`;
}
