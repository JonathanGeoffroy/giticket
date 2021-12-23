import { InvalidArgumentError } from 'commander';

export function strictlyPositiveNumber(value) {
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue) || parsedValue <= 0) {
    throw new InvalidArgumentError('Strictly positive number expected');
  }
  return parsedValue;
}
