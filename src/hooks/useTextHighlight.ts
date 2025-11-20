import { useMemo } from 'react';

interface UseTextHighlightOptions {
  caseSensitive?: boolean;
}

export const useTextHighlight = (
  searchTerm: string,
  options: UseTextHighlightOptions = {}
) => {
  const { caseSensitive = false } = options;

  const highlightText = useMemo(() => {
    return (text: string): string[] => {
      if (!searchTerm.trim()) {
        return [text];
      }

      const flags = caseSensitive ? 'g' : 'gi';
      const regex = new RegExp(`(${searchTerm})`, flags);
      return text.split(regex);
    };
  }, [searchTerm, caseSensitive]);

  const isMatch = useMemo(() => {
    return (text: string): boolean => {
      if (!searchTerm.trim()) {
        return false;
      }

      const compareText = caseSensitive ? text : text.toLowerCase();
      const compareSearch = caseSensitive ? searchTerm : searchTerm.toLowerCase();
      return compareText.includes(compareSearch);
    };
  }, [searchTerm, caseSensitive]);

  return { highlightText, isMatch };
};
