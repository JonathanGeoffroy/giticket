export default interface Path {
  uuid: string;
  timestamp: number;
}

export function parse(path: string): Path {
  const [timestamp, uuid] = path.split('_');

  return {
    timestamp: parseInt(timestamp),
    uuid,
  };
}

export function generate(id: string): string {
  return `${Date.now()}_${id}`;
}
