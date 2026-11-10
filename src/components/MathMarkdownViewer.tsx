import React, { useMemo } from 'react';
import { parseMarkdownWithLatex } from '../utils/mathParser';

interface MathMarkdownViewerProps {
  content: string;
  className?: string;
  placeholder?: string;
}

export const MathMarkdownViewer: React.FC<MathMarkdownViewerProps> = ({
  content,
  className = '',
  placeholder = '在此處即時渲染 Markdown 與 LaTeX 數學式...',
}) => {
  const renderedHtml = useMemo(() => {
    if (!content || !content.trim()) return '';
    return parseMarkdownWithLatex(content);
  }, [content]);

  if (!content || !content.trim()) {
    return (
      <div className={`text-slate-500 italic text-sm p-4 text-center select-none ${className}`}>
        {placeholder}
      </div>
    );
  }

  return (
    <div
      className={`prose prose-invert max-w-none text-slate-200 text-xs sm:text-sm leading-relaxed overflow-x-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
