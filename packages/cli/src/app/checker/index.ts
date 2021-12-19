import { InvalidArgumentError } from 'commander';

export function strictlyPositiveNumber(value) {
  // parseInt takes a string and a radix
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue) || parsedValue <= 0) {
    throw new InvalidArgumentError('Strictly positive number expected');
  }
  return parsedValue;
}
