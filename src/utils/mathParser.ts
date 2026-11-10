import katex from 'katex';

/**
 * Safely renders LaTeX string using KaTeX with identical styling to problem statements
 */
export function renderLatexSafe(latex: string, displayMode: boolean = false): string {
  try {
    const trimmed = latex.trim();
    if (!trimmed) return '';

    return katex.renderToString(trimmed, {
      displayMode,
      throwOnError: false,
      output: 'htmlAndMathml',
      strict: false,
    });
  } catch (err) {
    console.warn('KaTeX render error:', err);
    return `<span class="text-rose-400 font-mono text-xs">[LaTeX: ${escapeHtml(latex)}]</span>`;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Parses markdown containing LaTeX blocks ($$ ... $$) and inline LaTeX ($ ... $)
 * plus standard markdown elements (headers, lists, bold, code),
 * AND automatically recognizes bare LaTeX formulas (such as \sqrt{x}, \frac{a}{b}, \int, \lim)
 * even if the user forgets to type surrounding dollar signs!
 */
export function parseMarkdownWithLatex(text: string): string {
  if (!text) return '';

  let processed = text;

  // Pre-normalize common non-LaTeX shortcuts: e.g. sqrt(x) -> \sqrt{x}
  processed = processed.replace(/\bsqrt\(([^)]+)\)/g, '\\sqrt{$1}');

  // Dictionary of math tokens to replace back after markdown parsing
  const mathTokens: Record<string, string> = {};
  let tokenCounter = 0;

  // 1. Extract and store Block LaTeX $$ ... $$
  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    const tokenId = `___MATH_BLOCK_${tokenCounter++}___`;
    const rendered = renderLatexSafe(math, true);
    mathTokens[tokenId] = `<div class="my-2 py-2 px-3 overflow-x-auto bg-slate-950/70 rounded-xl border border-indigo-500/20 text-center flex justify-center text-sm sm:text-base">${rendered}</div>`;
    return tokenId;
  });

  // 2. Extract and store Inline LaTeX $ ... $
  processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    const tokenId = `___MATH_INLINE_${tokenCounter++}___`;
    const rendered = renderLatexSafe(math, false);
    mathTokens[tokenId] = `<span class="inline-block px-1 align-baseline">${rendered}</span>`;
    return tokenId;
  });

  // 3. Extract and render bare LaTeX commands (e.g. \sqrt{x}, \sqrt{2x + 5}, \frac{1}{2}, \lim_{x \to 0}, \int, \sum, \pi, \infty)
  // This ensures that even if user writes \sqrt{x} without dollar signs, it renders identically to the problem!
  const bareLatexRegex = /(\\(?:sqrt|frac|int|lim|sum|prod|sin|cos|tan|ln|exp|infty|pi|theta|cdot|pm|partial|le|ge|ne|to|approx)(?:\{[^{}]*\}|\[[^\[\]]*\]|_\{[^{}]*\}|\^[^{}]*|\_[a-zA-Z0-9]|\^[a-zA-Z0-9]|[a-zA-Z0-9])*(?:\{[^{}]*\})*)/g;
  processed = processed.replace(bareLatexRegex, (match) => {
    // If it's already a token placeholder, skip
    if (match.startsWith('___MATH_')) return match;
    const trimmed = match.trim();
    if (!trimmed || trimmed === '\\') return match;

    const tokenId = `___MATH_BARE_${tokenCounter++}___`;
    const rendered = renderLatexSafe(trimmed, false);
    mathTokens[tokenId] = `<span class="inline-block px-1 align-baseline">${rendered}</span>`;
    return tokenId;
  });

  // 4. Headers
  processed = processed.replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-indigo-300 mt-2.5 mb-1">$1</h3>');
  processed = processed.replace(/^## (.*$)/gim, '<h2 class="text-base font-bold text-violet-200 mt-3 mb-1.5">$1</h2>');
  processed = processed.replace(/^# (.*$)/gim, '<h1 class="text-lg font-extrabold text-white mt-3.5 mb-2">$1</h1>');

  // 5. Bold and Italic
  processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-amber-300">$1</strong>');
  processed = processed.replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>');

  // 6. Inline code
  processed = processed.replace(/`([^`]+)`/g, '<code class="bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');

  // 7. Blockquote
  processed = processed.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-indigo-500 pl-3 italic text-slate-300 my-1.5">$1</blockquote>');

  // 8. Unordered lists
  processed = processed.replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-200 my-0.5">$1</li>');

  // 9. Line breaks
  const paragraphs = processed.split(/\n\s*\n/);
  processed = paragraphs
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      if (
        trimmed.startsWith('___MATH_BLOCK_') ||
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<blockquote') ||
        trimmed.startsWith('<li')
      ) {
        return trimmed;
      }
      return `<p class="my-1 text-slate-200 leading-relaxed">${trimmed.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('');

  // 10. Restore all math tokens safely
  Object.keys(mathTokens).forEach((token) => {
    processed = processed.replace(new RegExp(token, 'g'), mathTokens[token]);
  });

  return processed;
}

/**
 * Clean & normalize a math expression for flexible equivalence comparison
 */
export function normalizeMathAnswer(input: string): string {
  if (!input) return '';

  return input
    .trim()
    .replace(/^\$+|\$+$/g, '')
    .replace(/\s+/g, '')
    .replace(/\\cdot|\\times|\*/g, '')
    .replace(/\^{([^{}]+)}/g, '^$1')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
    .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
    .replace(/\\mathrm\{e\}/g, 'e')
    .replace(/\\frac\{d\}\{dx\}/g, 'd/dx')
    .toLowerCase();
}

/**
 * Checks if user's input matches any accepted answer
 */
export function checkAnswerEquivalence(userInput: string, acceptedAnswers: string[]): boolean {
  if (!userInput) return false;

  const normalizedUser = normalizeMathAnswer(userInput);

  for (const rawAccepted of acceptedAnswers) {
    const normalizedAccepted = normalizeMathAnswer(rawAccepted);
    if (normalizedUser === normalizedAccepted) return true;

    // Check if user answer is a number that evaluates identically (e.g. 1/2 vs 0.5)
    const userNum = evaluateSimpleNumber(normalizedUser);
    const acceptedNum = evaluateSimpleNumber(normalizedAccepted);
    if (userNum !== null && acceptedNum !== null && Math.abs(userNum - acceptedNum) < 1e-5) {
      return true;
    }
  }

  // Check if user typed a full markdown step containing the answer at the end e.g. "答案是 4" or "= 4"
  for (const rawAccepted of acceptedAnswers) {
    const norm = normalizeMathAnswer(rawAccepted);
    const regex = new RegExp(`(=|答案|結尾|\\b)${escapeRegex(norm)}(\\b|$)`, 'i');
    if (regex.test(normalizedUser)) {
      return true;
    }
  }

  return false;
}

function evaluateSimpleNumber(str: string): number | null {
  if (/^-?\d+(\.\d+)?$/.test(str)) {
    return parseFloat(str);
  }
  const fracMatch = str.match(/^(-?\d+)\/(\d+)$/);
  if (fracMatch) {
    const num = parseInt(fracMatch[1], 10);
    const den = parseInt(fracMatch[2], 10);
    if (den !== 0) return num / den;
  }
  return null;
}

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Real-time heuristic feedback based on what user is typing
 */
export function diagnoseUserWork(userInput: string, questionMathGoal: string): string | null {
  if (!userInput || userInput.trim().length < 2) return null;

  const clean = userInput.toLowerCase();

  if (questionMathGoal.includes('\\int') && !questionMathGoal.includes('_') && !clean.includes('+c') && !clean.includes('+ c')) {
    if (clean.includes('x^') || clean.includes('ln') || clean.includes('sin') || clean.includes('cos')) {
      return '🔔 小叮嚀：不定積分算式別忘了加上積分常數 $+ C$ 喔！';
    }
  }

  if (questionMathGoal.includes('x^3') && clean.includes('x^2') && !clean.includes('3x^2') && !clean.includes('3*x^2')) {
    return '💡 提示：微分多項式時，次方要掉下來當係數，次數再減一喔！';
  }

  if (questionMathGoal.includes('\\cos') && clean.includes('\\sin') && !clean.includes('-')) {
    return '⚡ 注意正負號：$\\cos(x)$ 的導函數帶有負號 $-\\sin(x)$ 喔！';
  }

  return null;
}
