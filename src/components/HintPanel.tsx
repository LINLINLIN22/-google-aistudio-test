import React from 'react';
import { Lightbulb, Key, ListOrdered, CheckCircle2, AlertTriangle, Eye, ChevronRight, Unlock } from 'lucide-react';
import { QuizQuestion } from '../types/quiz';
import { MathMarkdownViewer } from './MathMarkdownViewer';
import { diagnoseUserWork } from '../utils/mathParser';

interface HintPanelProps {
  question: QuizQuestion;
  userCurrentInput: string;
  unlockedHintLevel: number;
  onUnlockHint: (level: number) => void;
  className?: string;
}

export const HintPanel: React.FC<HintPanelProps> = ({
  question,
  userCurrentInput,
  unlockedHintLevel,
  onUnlockHint,
  className = '',
}) => {
  // Real-time automatic heuristic diagnosis running 100% in browser
  const instantWarning = diagnoseUserWork(userCurrentInput, question.mathExpression);

  const hintLevels = [
    {
      level: 1,
      title: '提示 1：算式型態與技巧判定',
      icon: <Lightbulb className="w-4 h-4 text-amber-400" />,
      content: question.hints.technique,
      penalty: '無扣分 (自由查看)',
    },
    {
      level: 2,
      title: '提示 2：核心計算定理與公式',
      icon: <Key className="w-4 h-4 text-cyan-400" />,
      content: question.hints.formulaKey,
      penalty: '-10 XP',
    },
    {
      level: 3,
      title: '提示 3：逐步化簡步驟引導',
      icon: <ListOrdered className="w-4 h-4 text-indigo-400" />,
      content: question.hints.stepGuide,
      penalty: '-20 XP',
    },
    {
      level: 4,
      title: '提示 4：完整數學推導與正確解答',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      content: question.hints.fullSolution,
      penalty: '-30 XP',
    },
  ];

  // Unlock next sequential hint
  const handleUnlockNext = () => {
    if (unlockedHintLevel < 4) {
      onUnlockHint(unlockedHintLevel + 1);
    }
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              即時計算提示庫
              <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                已解鎖 {unlockedHintLevel} / 4
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">依序提供運算指引，純前端獨立運作</p>
          </div>
        </div>

        {/* Sequential unlock button */}
        {unlockedHintLevel < 4 ? (
          <button
            type="button"
            onClick={handleUnlockNext}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Unlock className="w-3.5 h-3.5 text-cyan-300" />
            <span>解鎖第 {unlockedHintLevel + 1} 步提示</span>
          </button>
        ) : (
          <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            已解鎖所有提示
          </span>
        )}
      </div>

      {/* Real-time Instant Heuristic Warning (Browser-based) */}
      {instantWarning && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2 animate-pulse">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div className="flex-1">
            <span className="font-semibold">即時運算提醒：</span>
            <MathMarkdownViewer content={instantWarning} className="text-xs text-amber-200 mt-0.5" />
          </div>
        </div>
      )}

      {/* Progressive Hints List (Loaded from JSON question bank) */}
      <div className="flex flex-col gap-2.5">
        {hintLevels.map((item) => {
          const isUnlocked = unlockedHintLevel >= item.level;

          return (
            <div
              key={item.level}
              className={`rounded-xl border transition-all duration-200 ${
                isUnlocked
                  ? 'bg-slate-900/80 border-slate-700/80 p-3 shadow-md'
                  : 'bg-slate-950/50 border-slate-800/60 p-2.5 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-slate-800">{item.icon}</span>
                  <span className={`text-xs font-semibold ${isUnlocked ? 'text-slate-100' : 'text-slate-400'}`}>
                    {item.title}
                  </span>
                </div>

                {!isUnlocked && (
                  <button
                    type="button"
                    onClick={() => onUnlockHint(item.level)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 font-medium transition-colors cursor-pointer"
                  >
                    查看 ({item.penalty})
                  </button>
                )}
              </div>

              {isUnlocked && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-xs">
                  <MathMarkdownViewer content={item.content} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
