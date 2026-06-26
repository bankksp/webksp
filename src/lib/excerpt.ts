export const createExcerpt = (content: string, length: number = 100): string => {
  if (!content) return '';
  
  // Remove HTML tags
  let text = content.replace(/<[^>]+>/g, ' ');
  
  // Remove markdown headings
  text = text.replace(/#{1,6}\s?/g, '');
  
  // Remove markdown bold/italics
  text = text.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1');
  
  // Remove markdown links
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Remove extraneous whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
};

/** Plain-text meta description (~160 chars) from post HTML/markdown for SEO & social previews. */
export const createMetaDescription = (content: string, maxLength = 160): string => {
  const text = createExcerpt(content, 400);
  if (!text) return '';
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  const trimmed = (lastSpace > 60 ? cut.slice(0, lastSpace) : cut).trim();
  return `${trimmed}…`;
};
