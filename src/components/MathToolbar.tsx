import React from 'react';
import { renderLatexSafe } from '../utils/mathParser';

interface MathToolbarProps {
  onInsertSnippet: (snippet: string, cursorOffset?: number) => void;
  className?: string;
}

interface SnippetItem {
  label: string;      // displayed on button (can be LaTeX)
  insert: string;     // LaTeX snippet inserted into text
  isLatexLabel?: boolean;
  tooltip?: string;
}

const SNIPPET_GROUPS: { name: string; items: SnippetItem[] }[] = [
  {
    name: '微分與導數',
    items: [
      { label: "\\frac{d}{dx}", insert: "\\frac{d}{dx} ", isLatexLabel: true, tooltip: "導數算符 d/dx" },
      { label: "f'(x)", insert: "f'(x)", isLatexLabel: true, tooltip: "一階導數" },
      { label: "f''(x)", insert: "f''(x)", isLatexLabel: true, tooltip: "二階導數" },
      { label: "\\Delta x", insert: "\\Delta x", isLatexLabel: true, tooltip: "變化量 Delta x" },
      { label: "dx", insert: "dx", isLatexLabel: false, tooltip: "微元 dx" },
    ],
  },
  {
    name: '積分與無窮',
    items: [
      { label: "\\int", insert: "\\int ", isLatexLabel: true, tooltip: "不定積分" },
      { label: "\\int_a^b", insert: "\\int_{0}^{2} ", isLatexLabel: true, tooltip: "定積分 (含上下限)" },
      { label: "\\sum", insert: "\\sum_{n=1}^{\\infty} ", isLatexLabel: true, tooltip: "無窮級數加總" },
      { label: "\\infty", insert: "\\infty", isLatexLabel: true, tooltip: "無窮大" },
      { label: "+ C", insert: " + C", isLatexLabel: false, tooltip: "積分常數 + C" },
    ],
  },
  {
    name: '極限與運算',
    items: [
      { label: "\\lim", insert: "\\lim_{x \\to 0} ", isLatexLabel: true, tooltip: "極限運算" },
      { label: "\\to", insert: "\\to ", isLatexLabel: true, tooltip: "趨近於" },
      { label: "\\frac{a}{b}", insert: "\\frac{a}{b}", isLatexLabel: true, tooltip: "分數 \\frac{分子}{分母}" },
      { label: "\\sqrt{x}", insert: "\\sqrt{x}", isLatexLabel: true, tooltip: "平方根" },
      { label: "x^2", insert: "x^2", isLatexLabel: true, tooltip: "二次方" },
      { label: "x^n", insert: "x^{n}", isLatexLabel: true, tooltip: "n 次方" },
      { label: "\\approx", insert: "\\approx ", isLatexLabel: true, tooltip: "約等於" },
    ],
  },
  {
    name: '超越函數 & 常數',
    items: [
      { label: "e^x", insert: "e^{x}", isLatexLabel: true, tooltip: "自然指數 e^x" },
      { label: "\\ln(x)", insert: "\\ln(x)", isLatexLabel: true, tooltip: "自然對數 ln" },
      { label: "\\sin", insert: "\\sin(x)", isLatexLabel: true, tooltip: "正弦函數" },
      { label: "\\cos", insert: "\\cos(x)", isLatexLabel: true, tooltip: "餘弦函數" },
      { label: "\\pi", insert: "\\pi", isLatexLabel: true, tooltip: "圓周率 pi" },
      { label: "$$..$$", insert: "\n$$\n\n$$\n", isLatexLabel: false, tooltip: "區塊數學式" },
      { label: "$..$", insert: "$$", isLatexLabel: false, tooltip: "行內數學式" },
    ],
  },
];

export const MathToolbar: React.FC<MathToolbarProps> = ({ onInsertSnippet, className = '' }) => {
  return (
    <div className={`bg-slate-900/80 border border-slate-800 rounded-xl p-2 select-none ${className}`}>
      <div className="flex items-center justify-between mb-1.5 px-1">
        <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
          快速數學符號鍵盤 (Quick LaTeX Toolbar)
        </span>
        <span className="text-[10px] text-slate-500">點擊直接插入游標處</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SNIPPET_GROUPS.map((group) => (
          <div key={group.name} className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800/80">
            {group.items.map((item, idx) => {
              const labelHtml = item.isLatexLabel
                ? renderLatexSafe(item.label, false)
                : `<span class="font-mono">${item.label}</span>`;

              return (
                <button
                  key={idx}
                  type="button"
                  title={item.tooltip || item.insert}
                  onClick={() => onInsertSnippet(item.insert)}
                  className="px-2 py-1 text-xs rounded-md bg-slate-850 hover:bg-indigo-600/30 hover:border-indigo-400/50 border border-slate-800 text-slate-200 transition-all hover:scale-105 active:scale-95 flex items-center justify-center min-w-[28px] h-7"
                  dangerouslySetInnerHTML={{ __html: labelHtml }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
