import { Command } from 'commander';
import handleItemCommands from './items';

const program = new Command();

program.addCommand(handleItemCommands());

export default program;
