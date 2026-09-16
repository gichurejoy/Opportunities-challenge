import React from 'react';

interface FormattedTextProps {
  text: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ text }) => {
  if (!text) return null;

  // Split text by lines first
  const lines = text.split('\n');

  return (
    <div className="space-y-0.5">
      {lines.map((line, lineIdx) => {
        // Check if it's a bullet list item
        const listMatch = line.match(/^(\s*)[-*+]\s+(.*)$/);
        // Check if it's a numbered list item
        const numListMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);

        let content = line;
        let isListItem = false;
        let listPrefix = '';

        if (listMatch) {
          isListItem = true;
          content = listMatch[2];
          listPrefix = '•';
        } else if (numListMatch) {
          isListItem = true;
          content = numListMatch[2];
          // Keep the original number prefix
          const rawPrefix = line.match(/^\s*(\d+\.)/);
          listPrefix = rawPrefix ? rawPrefix[1] : '1.';
        }

        // Parse inline formatting (Bold, Italic, Links) inside the content
        const parsedContent = parseInlineStyles(content);

        if (isListItem) {
          return (
            <div key={lineIdx} className="flex items-start gap-1 pl-1 font-sans text-[10px] leading-relaxed">
              <span className="text-sepia-500 dark:text-sepia-400 font-bold shrink-0">{listPrefix}</span>
              <span className="flex-1">{parsedContent}</span>
            </div>
          );
        }

        return (
          <div key={lineIdx} className="font-sans text-[10px] leading-relaxed min-h-[1em] break-words">
            {parsedContent}
          </div>
        );
      })}
    </div>
  );
};

// Helper function to parse bold, italic, and URLs in a single string line
function parseInlineStyles(text: string): React.ReactNode[] {
  // Regex to match URLs: http or https
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Split the text by URL regex first
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    // If it matches a URL, render an anchor tag
    if (part.match(/^https?:\/\//)) {
      // Strip trailing punctuation from URL if any (e.g. final dot or comma)
      const cleanUrl = part.replace(/[.,;:)\]]+$/, '');
      const trailingPunctuation = part.slice(cleanUrl.length);
      return (
        <span key={index} className="inline-flex items-center">
          <a
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 dark:text-emerald-450 hover:underline inline-flex items-center gap-0.5 break-all font-bold font-sans"
            onClick={(e) => e.stopPropagation()} // Prevent triggering parent edit clicks
          >
            {cleanUrl}
          </a>
          {trailingPunctuation}
        </span>
      );
    }

    // Otherwise, parse bold (`**text**`) and italic (`*text*`)
    return parseMarkdownStyles(part, index);
  });
}

function parseMarkdownStyles(text: string, parentKey: number): React.ReactNode {
  // Simple regex parser for markdown styles
  // We match **bold** first, then *italic*
  const boldRegex = /(\*\*[^*]+\*\*)/g;
  const parts = text.split(boldRegex);

  const boldParsed = parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return <strong key={index} className="font-extrabold">{boldText}</strong>;
    }

    // Parse italics inside non-bold text
    const italicRegex = /(\*[^*]+\*)/g;
    const italicParts = part.split(italicRegex);

    return italicParts.map((iPart, iIndex) => {
      if (iPart.startsWith('*') && iPart.endsWith('*')) {
        const italicText = iPart.slice(1, -1);
        return <em key={iIndex} className="italic">{italicText}</em>;
      }
      return iPart;
    });
  });

  return <React.Fragment key={parentKey}>{boldParsed}</React.Fragment>;
}
