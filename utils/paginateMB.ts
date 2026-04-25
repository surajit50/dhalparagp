// paginateMB.ts
export function paginateMB<T>(items: T[], itemsPerPage: number): T[][] {
  if (!items || items.length === 0) {
    return [];
  }

  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += itemsPerPage) {
    pages.push(items.slice(i, i + itemsPerPage));
  }

  return pages;
}
