import Item from '../models/item';

export type Matcher<T> = (item: T) => boolean;
export interface Query<T> {
  contains(value: string): Matcher<T>;
  eq(value: string): Matcher<T>;
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
}

class NotQuery<T> implements Query<T> {
  constructor(public readonly not: Query<T>) {}
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
