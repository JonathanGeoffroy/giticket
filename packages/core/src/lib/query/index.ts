import Item from '../models/item';

export type Matcher<T> = (item: T) => boolean;
export interface Query<T> {
  contains(value: string): Matcher<T>;
  eq(value: string): Matcher<T>;
  lt(value: string): Matcher<T>;
  gt(value: string): Matcher<T>;
  exist(): Matcher<T>;
  isNull(): Matcher<T>;
  not: Query<T>;
}

export class ItemQuery implements Query<Item> {
  constructor(private readonly property: keyof Item) {}
  not = new NotQuery<Item>(this);

  eq(value: string): Matcher<Item> {
    return (item) => item[this.property] === value;
  }

  contains(value: string): Matcher<Item> {
    return (item: Item) => item[this.property].indexOf(value) >= 0;
  }

  lt(value: string): Matcher<Item> {
    return (item: Item) => item[this.property] < value;
  }

  gt(value: string): Matcher<Item> {
    return (item: Item) => item[this.property] > value;
  }

  exist(): Matcher<Item> {
    return (item: Item) =>
      item[this.property] !== null && item[this.property] !== undefined;
  }

  isNull(): Matcher<Item> {
    return (item: Item) => item[this.property] === null;
  }
}

class NotQuery<T> implements Query<T> {
  constructor(public readonly not: Query<T>) {}
  lt(value: string): Matcher<T> {
    return (item: T) => !this.not.lt(value)(item);
  }

  gt(value: string): Matcher<T> {
    return (item: T) => !this.not.gt(value)(item);
  }

  exist(): Matcher<T> {
    return (item: T) => !this.not.exist()(item);
  }

  isNull(): Matcher<T> {
    return (item: T) => !this.not.isNull()(item);
  }

  contains(value: string): Matcher<T> {
    return (item: T) => !this.not.contains(value)(item);
  }

  eq(value: string): Matcher<T> {
    return (item: T) => !this.not.eq(value)(item);
  }
}

export function item(property: keyof Item): ItemQuery {
  return new ItemQuery(property);
}
