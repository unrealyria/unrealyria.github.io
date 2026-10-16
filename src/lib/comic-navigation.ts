// Shared bounds and reset rules for buttons, keyboard, touch and collection changes.
export function createComicNavigation(counts: readonly number[]) {
  let collection = 0;
  let index = 0;
  return {
    get collection() { return collection; },
    get index() { return index; },
    get total() { return counts[collection] ?? 0; },
    select(target: number): boolean {
      if (!Number.isInteger(target) || !counts[target]) return false;
      collection = target;
      index = 0;
      return true;
    },
    go(delta: number): boolean {
      const target = index + delta;
      if (!Number.isInteger(target) || target < 0 || target >= (counts[collection] ?? 0)) return false;
      index = target;
      return true;
    },
  };
}
