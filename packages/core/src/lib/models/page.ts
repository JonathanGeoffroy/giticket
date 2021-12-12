export interface Page<P> {
  hasNext: boolean;
  next: () => Promise<Page<P>>;
  results: P[];
}
