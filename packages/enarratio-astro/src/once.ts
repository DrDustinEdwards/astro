const styled = new WeakSet<object>();

/**
 * True the first time it is asked about a page render. Astro gives each render its own Request,
 * so the theme's stylesheet is written once per page however many charts the page has.
 */
export function firstOnPage(request: object): boolean {
  if (styled.has(request)) return false;
  styled.add(request);
  return true;
}
