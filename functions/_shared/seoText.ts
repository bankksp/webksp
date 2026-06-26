/** Normalize shortId for URL matching (GAS may return numbers). */
export function normalizeShortId(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

/** Strip HTML/markdown noise and build a ~160 char description for crawlers. */
export function buildMetaDescription(content: string, maxLength = 160): string {
  if (!content) return '';

  let text = content
    .replace(/<[^>]+>/g, ' ')
    .replace(/#{1,6}\s?/g, '')
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  const trimmed = (lastSpace > 60 ? cut.slice(0, lastSpace) : cut).trim();
  return `${trimmed}…`;
}
