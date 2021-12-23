/**
 * Item stored in git system
 */
export default interface Item {
  id: string;
  title: string;
  description: string;
  kind: string;
}

/**
 * Add item.
 *
 * All item's fields but `id` are available as it will be computed by giticket
 */
export type AddItem = Omit<Item, 'id'>;

/**
 * Edit item, used to patch an existing item.
 *
 * Every field but `id` are optional. If any field in _not_ provided, old value will be kept as is.
 */
export type EditItem = Partial<Item> & { id: string };
