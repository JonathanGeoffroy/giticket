export default interface Item {
  id: string;
  title: string;
  description: string;
  kind: string;
}

export type AddItem = Omit<Item, 'id'>;
export type EditItem = Partial<Item> & { id: string };
