/**
 * Pagination list support
 */
export interface Page<P> {
  /**
   * true if this is not the last page.
   * Please see `next`
   */
  hasNext: boolean;

  /**
   * Compute the next page
   * if `hasNext === true` this returns the next page of content, otherwise throws an error
   */
  next: () => Promise<Page<P>>;

  /**
   * Available results for this page.
   */
  results: P[];
}
