export const escapeRegExp = (text: string): string => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const highlightMatches = (
  text: string,
  searchTerm: string,
  caseSensitive: boolean = false
): { parts: string[]; matches: boolean[] } => {
  if (!searchTerm.trim()) {
    return { parts: [text], matches: [false] };
  }

  const escapedTerm = escapeRegExp(searchTerm);
  const flags = caseSensitive ? 'g' : 'gi';
  const regex = new RegExp(`(${escapedTerm})`, flags);
  const parts = text.split(regex);
  
  const matches = parts.map((part) =>
    caseSensitive
      ? part === searchTerm
      : part.toLowerCase() === searchTerm.toLowerCase()
  );

  return { parts, matches };
};

export const countMatches = (text: string, searchTerm: string): number => {
  if (!searchTerm.trim()) {
    return 0;
  }

  const escapedTerm = escapeRegExp(searchTerm);
  const regex = new RegExp(escapedTerm, 'gi');
  const matches = text.match(regex);
  return matches ? matches.length : 0;
};
