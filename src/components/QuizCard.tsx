import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Bookmark,
  CheckCircle,
  XCircle,
  Sparkles,
  ArrowRight,
  Eye,
  PenTool,
  RotateCcw,
  BookOpen,
  Send,
  Calculator,
  Info,
  Dices,
  X,
  Columns,
  Maximize2,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { QuizQuestion, UserAnswerRecord } from '../types/quiz';
import { MathMarkdownViewer } from './MathMarkdownViewer';
import { MathToolbar } from './MathToolbar';
import { HintPanel } from './HintPanel';
import { checkAnswerEquivalence } from '../utils/mathParser';

interface QuizCardProps {
  question: QuizQuestion;
  record?: UserAnswerRecord;
  onRecordAttempt: (
    questionId: string,
    userMarkdown: string,
    isCorrect: boolean,
    hintsUsedCount: number,
    scoreGained: number,
    reviewNotes?: string
  ) => void;
  onToggleBookmark: (questionId: string) => void;
  onNextQuestion: () => void;
  onRandomQuestion?: () => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  question,
  record,
  onRecordAttempt,
  onToggleBookmark,
  onNextQuestion,
  onRandomQuestion,
}) => {
  const [userInput, setUserInput] = useState<string>(
    record?.userMarkdown || `### 計算推導步驟：\n\n- 給定算式：$$${question.mathExpression}$$\n- 化簡：\n\n答案 = `
  );
  const [answerValue, setAnswerValue] = useState<string>('');
  const [unlockedHintLevel, setUnlockedHintLevel] = useState<number>(record?.hintsUsedCount || 0);
  const [hasEvaluated, setHasEvaluated] = useState<boolean>(record?.isCorrect || false);
  const [isCorrect, setIsCorrect] = useState<boolean>(record?.isCorrect || false);
  const [workspaceMode, setWorkspaceMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [userNote, setUserNote] = useState<string>(record?.reviewNotes || '');
  const [showHintModal, setShowHintModal] = useState<boolean>(false);
  const [showSidebarHints, setShowSidebarHints] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Sync state if question changes
  useEffect(() => {
    setUserInput(
      record?.userMarkdown || `### 計算推導步驟：\n\n- 給定算式：$$${question.mathExpression}$$\n- 化簡：\n\n答案 = `
    );
    setUnlockedHintLevel(record?.hintsUsedCount || 0);
    setHasEvaluated(record?.isCorrect || false);
    setIsCorrect(record?.isCorrect || false);
    setUserNote(record?.reviewNotes || '');
    setAnswerValue('');
    setShowHintModal(false);
  }, [question.id, record]);

  const handleInsertSnippet = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setUserInput((prev) => prev + snippet);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previous = textarea.value;
    const next = previous.substring(0, start) + snippet + previous.substring(end);
    setUserInput(next);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 10);
  };

  const handleUnlockHint = (level: number) => {
    setUnlockedHintLevel(Math.max(unlockedHintLevel, level));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const correct =
      checkAnswerEquivalence(answerValue, question.acceptedAnswers) ||
      checkAnswerEquivalence(userInput, question.acceptedAnswers);

    setHasEvaluated(true);
    setIsCorrect(correct);

    let score = question.xpReward;
    if (unlockedHintLevel === 1) score = Math.round(score * 0.95);
    else if (unlockedHintLevel === 2) score = Math.round(score * 0.85);
    else if (unlockedHintLevel === 3) score = Math.round(score * 0.65);
    else if (unlockedHintLevel >= 4) score = Math.round(score * 0.4);

    if (correct) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#818cf8', '#34d399', '#fbbf24'],
      });
    }

    onRecordAttempt(
      question.id,
      userInput,
      correct,
      unlockedHintLevel,
      correct ? score : 0,
      userNote
    );
  };

  const isBookmarked = record?.bookmarked || false;

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      {/* Laptop & Desktop Optimized Grid Layout */}
      <div className={`grid grid-cols-1 ${showSidebarHints ? 'xl:grid-cols-12 gap-6' : 'w-full'}`}>
        {/* Main Quiz Card (Takes full 12 cols when sidebar hidden, or 8 cols on xl screens) */}
        <div className={`${showSidebarHints ? 'xl:col-span-8' : 'w-full'} flex flex-col gap-5`}>
          {/* Main Problem Display Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-500" />

            {/* Top row: Category, Difficulty, Random button, Bookmark */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                  <span>{question.categoryBadge}</span>
                  <span>{question.categoryName}</span>
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                    question.difficulty === 'easy'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : question.difficulty === 'medium'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {question.difficulty === 'easy' ? '基礎級' : question.difficulty === 'medium' ? '進階級' : '大師級'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Random Question Button */}
                {onRandomQuestion && (
                  <button
                    type="button"
                    onClick={onRandomQuestion}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                    title="隨機抽一題微積分計算題"
                  >
                    <Dices className="w-3.5 h-3.5 text-amber-400" />
                    <span>隨機出題</span>
                  </button>
                )}

                {/* Sidebar Hint Toggle */}
                <button
                  type="button"
                  onClick={() => setShowSidebarHints(!showSidebarHints)}
                  className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
                  title={showSidebarHints ? '收合側欄提示' : '展開側欄提示'}
                >
                  {showSidebarHints ? <PanelRightClose className="w-3.5 h-3.5 text-cyan-400" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
                  <span>{showSidebarHints ? '收合提示' : '側欄提示'}</span>
                </button>

                <span className="text-xs font-mono text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  <Sparkles className="w-3.5 h-3.5" /> +{question.xpReward} XP
                </span>

                <button
                  type="button"
                  onClick={() => onToggleBookmark(question.id)}
                  className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                    isBookmarked
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-sm'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                  title={isBookmarked ? '已加入待複習收藏' : '收藏此計算題以便複習'}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                </button>
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-100 mb-2">
              {question.title}
            </h2>

            {/* Large LaTeX Formula Display Box with Info Icon in Bottom Right */}
            <div className="relative my-3 py-6 px-4 bg-slate-950/90 rounded-2xl border border-indigo-500/30 text-center flex flex-col items-center justify-center shadow-inner">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
                [ 待計算數學式 ]
              </span>
              <div className="text-xl sm:text-3xl text-white font-medium my-2 overflow-x-auto w-full px-4 py-1">
                <MathMarkdownViewer content={`$$${question.mathExpression}$$`} />
              </div>

              {/* Bottom-right row with Task and Info Hint Icon */}
              <div className="w-full flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 text-xs">
                <span className="text-slate-300 font-medium">{question.targetTask}</span>

                {/* Info Icon Button (Always present at bottom-right) */}
                <button
                  type="button"
                  onClick={() => setShowHintModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 text-xs font-semibold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer ml-auto"
                  title="點擊查看本題解題提示與公式"
                >
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span>提示資訊</span>
                </button>
              </div>
            </div>
          </div>

          {/* Markdown & LaTeX Calculation Workspace */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-md flex flex-col gap-4">
            {/* Workspace Header & Mode Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <PenTool className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Markdown 算式草稿與推導板</h3>
                  <p className="text-[11px] text-slate-400">
                    支援即時 LaTeX 渲染（例如 $\sqrt{'{x}'}$ 或直接輸入 \sqrt{'{x}'}）
                  </p>
                </div>
              </div>

              {/* View Mode Switcher (Split, Editor Only, Preview Only) */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setWorkspaceMode('split')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    workspaceMode === 'split'
                      ? 'bg-indigo-600 text-white font-semibold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="左右對照編輯與即時渲染"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">左右對照</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWorkspaceMode('editor')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    workspaceMode === 'editor'
                      ? 'bg-indigo-600 text-white font-semibold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="聚焦編輯算式"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>編輯區</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWorkspaceMode('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    workspaceMode === 'preview'
                      ? 'bg-indigo-600 text-white font-semibold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="純預覽 LaTeX 渲染"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>渲染預覽</span>
                </button>
              </div>
            </div>

            {/* Workspace Area: Responsive Grid / Single View */}
            <div
              className={`w-full ${
                workspaceMode === 'split'
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
                  : 'flex flex-col'
              }`}
            >
              {/* Editor Textarea */}
              {(workspaceMode === 'split' || workspaceMode === 'editor') && (
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="text-[11px] font-medium text-slate-400 mb-1 flex items-center justify-between">
                    <span>Markdown 計算步驟源碼：</span>
                    <span className="text-[10px] text-slate-500 font-mono">支援 LaTeX 數學符號</span>
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="在此輸入計算化簡過程... 例如：因式分解 (x-2)(x+2)/(x-2) = x+2，代入 x=2 得 4"
                    rows={8}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-y leading-relaxed"
                  />
                </div>
              )}

              {/* Live LaTeX Preview */}
              {(workspaceMode === 'split' || workspaceMode === 'preview') && (
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="text-[11px] font-medium text-slate-400 mb-1 flex items-center justify-between">
                    <span className="text-cyan-400 font-semibold flex items-center gap-1">
                      <Eye className="w-3 h-3" /> 即時 LaTeX 渲染視窗：
                    </span>
                    <span className="text-[10px] text-slate-500">KaTeX 即時渲染</span>
                  </div>
                  <div className="w-full bg-slate-950/90 border border-slate-800/90 rounded-xl p-3.5 overflow-x-auto min-h-[190px] max-h-[320px] overflow-y-auto text-xs sm:text-sm leading-relaxed">
                    <MathMarkdownViewer content={userInput} />
                  </div>
                </div>
              )}
            </div>

            {/* Quick LaTeX Symbol Toolbar (POSITIONED BELOW THE WORKSPACE) */}
            <div className="pt-1 w-full overflow-x-auto">
              <MathToolbar onInsertSnippet={handleInsertSnippet} />
            </div>

            {/* Fast Answer Input & Submit Row */}
            <form onSubmit={handleSubmit} className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex-1 flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 focus-within:border-cyan-500">
                <span className="text-xs text-slate-400 whitespace-nowrap font-medium flex items-center gap-1">
                  <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                  計算結果：
                </span>
                <input
                  type="text"
                  value={answerValue}
                  onChange={(e) => setAnswerValue(e.target.value)}
                  placeholder={question.answerFormatHelp}
                  className="w-full bg-transparent text-sm font-mono text-white placeholder-slate-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>檢驗答案</span>
                </button>

                {hasEvaluated && isCorrect && (
                  <button
                    type="button"
                    onClick={onNextQuestion}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer animate-bounce"
                  >
                    <span>下一題</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>

            {/* Feedback Message */}
            {hasEvaluated && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                  isCorrect
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 text-xs">
                  <div className="font-bold text-sm mb-0.5">
                    {isCorrect ? '🎉 答對了！計算完全正確！' : '🤔 計算結果有微小偏差，再試算一次！'}
                  </div>
                  <div>
                    {isCorrect ? (
                      <span>
                        正確答案為 <strong className="text-amber-400 font-mono">${question.standardAnswerLatex}$</strong>。已獲得 <strong className="text-amber-400 font-mono">+{question.xpReward} XP</strong>，此題紀錄已儲存至複習庫中。
                      </span>
                    ) : (
                      <span>
                        請檢查通分、正負號或冪次求導規則。可以點擊題目右下角的 <strong className="text-cyan-400">ℹ️ 提示資訊</strong> 查看逐步指引！
                      </span>
                    )}
                  </div>

                  {/* Personal Review Note */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/60">
                    <span className="text-[11px] text-slate-400">✍️ 寫給自己的運算備忘（自動儲存至複習庫）：</span>
                    <input
                      type="text"
                      value={userNote}
                      onChange={(e) => {
                        setUserNote(e.target.value);
                        onRecordAttempt(
                          question.id,
                          userInput,
                          isCorrect,
                          unlockedHintLevel,
                          isCorrect ? question.xpReward : 0,
                          e.target.value
                        );
                      }}
                      placeholder="例如：因式分解時分子要先提公因式，注意 x 不等於 2 的約分條件..."
                      className="w-full mt-1 px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Progressive Hint Panel (Visible when showSidebarHints is enabled on desktop) */}
        {showSidebarHints && (
          <div className="hidden xl:flex xl:col-span-4 flex-col gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-md sticky top-4">
              <HintPanel
                question={question}
                userCurrentInput={userInput}
                unlockedHintLevel={unlockedHintLevel}
                onUnlockHint={handleUnlockHint}
              />
            </div>
          </div>
        )}
      </div>

      {/* Info Icon Popover Modal when clicked at bottom-right of problem */}
      {showHintModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              onClick={() => setShowHintModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="關閉提示"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  本題提示資訊與推導秘笈
                </h3>
                <p className="text-xs text-slate-400">{question.title} • {question.targetTask}</p>
              </div>
            </div>

            <HintPanel
              question={question}
              userCurrentInput={userInput}
              unlockedHintLevel={unlockedHintLevel}
              onUnlockHint={handleUnlockHint}
            />

            <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowHintModal(false)}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
              >
                返回作答
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
