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
