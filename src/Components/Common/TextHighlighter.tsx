import React from 'react';

interface TextHighlighterProps {
  text: string;
  highlight: string;
  className?: string;
  highlightClassName?: string;
}

export const TextHighlighter: React.FC<TextHighlighterProps> = ({
  text,
  highlight,
  className = '',
  highlightClassName = 'bg-yellow-200 dark:bg-yellow-600 font-semibold',
}) => {
  if (!highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={index} className={highlightClassName}>
            {part}
          </mark>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      )}
    </span>
  );
};
