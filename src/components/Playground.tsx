import React, { useState, useRef } from 'react';
import { PenTool, Eye, Sparkles, Copy, Check, BookOpen, Layers } from 'lucide-react';
import { MathToolbar } from './MathToolbar';
import { MathMarkdownViewer } from './MathMarkdownViewer';

const SAMPLE_TEMPLATES = [
  {
    name: '分部積分純推導範例',
    code: `## 分部積分法計算範例：$\\int x e^x \\, dx$

設 $u = x$，則其微分微元為：
$$du = dx$$

設 $dv = e^x dx$，則其反導函數為：
$$v = \\int e^x \\, dx = e^x$$

### 套用分部積分公式：
$$\\int u \\, dv = u v - \\int v \\, du$$

代入各項得：
$$\\int x e^x \\, dx = x e^x - \\int e^x \\, dx = x e^x - e^x + C = e^x(x - 1) + C$$

若計算定積分區間 $[0, 1]$：
$$\\int_0^1 x e^x \\, dx = \\left[ e^x(x - 1) \\right]_0^1 = e^1(1 - 1) - e^0(0 - 1) = 0 - (-1) = 1$$`,
  },
  {
    name: '羅必達二階極限計算',
    code: `## 連續羅必達法則計算範例

目標計算極限：
$$L = \\lim_{x \\to 0} \\frac{1 - \\cos(x)}{x^2}$$

### 型態檢驗：
當 $x \\to 0$ 時，分子 $1 - \\cos(0) = 0$，分母 $0^2 = 0$，屬於 $\\frac{0}{0}$ 未定型。

### 第一次應用羅必達法則：
$$L = \\lim_{x \\to 0} \\frac{\\frac{d}{dx}(1 - \\cos x)}{\\frac{d}{dx}(x^2)} = \\lim_{x \\to 0} \\frac{\\sin(x)}{2x}$$

此式仍為 $\\frac{0}{0}$ 型，進行第二次羅必達法則：
$$L = \\lim_{x \\to 0} \\frac{\\frac{d}{dx}\\sin(x)}{\\frac{d}{dx}(2x)} = \\lim_{x \\to 0} \\frac{\\cos(x)}{2}$$

代入 $x = 0$：
$$L = \\frac{\\cos(0)}{2} = \\frac{1}{2}$$`,
  },
  {
    name: '代換積分法純計算',
    code: `## $u$-代換積分法計算範例

計算不定積分：
$$\\int 2x \\cos(x^2) \\, dx$$

### 變數代換設定：
令 $u = x^2$，則：
$$\\frac{du}{dx} = 2x \\implies du = 2x \\, dx$$

### 改寫為 $u$ 的積分式：
$$\\int 2x \\cos(x^2) \\, dx = \\int \\cos(u) \\, du = \\sin(u) + C$$

### 還原回 $x$ 變數：
$$= \\sin(x^2) + C$$`,
  },
];

export const Playground: React.FC = () => {
  const [content, setContent] = useState<string>(SAMPLE_TEMPLATES[0].code);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleInsertSnippet = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => prev + snippet);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previous = textarea.value;
    const next = previous.substring(0, start) + snippet + previous.substring(end);
    setContent(next);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 10);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-5">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-5 h-5" />
            </span>
            微積分 Markdown 與 LaTeX 純計算沙盒
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            自由輸入任何 Markdown 與 LaTeX 數學式，即時轉譯、推導驗證與整理純微積分算式。
          </p>
        </div>

        {/* Template Selector & Copy */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-[11px] text-slate-400 px-2 font-medium">純計算範本：</span>
            {SAMPLE_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.name}
                onClick={() => setContent(tmpl.code)}
                className="px-2.5 py-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-xs cursor-pointer"
              >
                {tmpl.name}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '已複製' : '複製內容'}</span>
          </button>
        </div>
      </div>

      {/* Quick LaTeX Toolbar */}
      <MathToolbar onInsertSnippet={handleInsertSnippet} />

      {/* Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Editor */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-cyan-400" />
              Markdown + LaTeX 算式源碼輸入區
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              支援 $...$ 與 $$...$$
            </span>
          </div>

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={18}
            className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs sm:text-sm font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 leading-relaxed resize-y"
            placeholder="在此輸入 Markdown 與 LaTeX 數學式..."
          />
        </div>

        {/* Live Preview */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              即時 KaTeX 渲染與排版展示
            </span>
            <span className="text-[10px] text-slate-500">Live Mathematical Typesetting</span>
          </div>

          <div className="w-full flex-1 bg-slate-950/80 border border-slate-800/90 rounded-xl p-5 overflow-y-auto max-h-[500px]">
            <MathMarkdownViewer content={content} />
          </div>
        </div>
      </div>
    </div>
  );
};
