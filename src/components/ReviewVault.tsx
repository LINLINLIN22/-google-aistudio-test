import React, { useState } from 'react';
import {
  Bookmark,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  Filter,
  Download,
  Upload,
  Trash2,
  Trophy,
  Flame,
  ArrowRight,
  Calculator,
} from 'lucide-react';
import { QuizQuestion, UserAnswerRecord, UserStats } from '../types/quiz';
import { QUIZ_QUESTIONS, CATEGORIES } from '../data/quizData';
import { MathMarkdownViewer } from './MathMarkdownViewer';

interface ReviewVaultProps {
  records: Record<string, UserAnswerRecord>;
  stats: UserStats;
  onSelectQuestion: (questionId: string) => void;
  onToggleBookmark: (questionId: string) => void;
  onExportProgress: () => void;
  onImportProgress: (json: string) => boolean;
  onResetProgress: () => void;
}

export const ReviewVault: React.FC<ReviewVaultProps> = ({
  records,
  stats,
  onSelectQuestion,
  onToggleBookmark,
  onExportProgress,
  onImportProgress,
  onResetProgress,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'bookmarked' | 'incorrect' | 'solved'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [importText, setImportText] = useState<string>('');
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const filteredQuestions = QUIZ_QUESTIONS.filter((q) => {
    const rec = records[q.id];

    if (selectedCategory !== 'all' && q.category !== selectedCategory) {
      return false;
    }

    if (filterMode === 'bookmarked') {
      return rec?.bookmarked === true;
    }
    if (filterMode === 'incorrect') {
      return rec && rec.wrongAttempts > 0 && !rec.isCorrect;
    }
    if (filterMode === 'solved') {
      return rec?.isCorrect === true;
    }

    return true;
  });

  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    const ok = onImportProgress(importText);
    if (ok) {
      setImportStatus('進度匯入成功！');
      setTimeout(() => {
        setShowImportModal(false);
        setImportStatus(null);
      }, 1000);
    } else {
      setImportStatus('匯入格式有誤，請確認為正確的 JSON 備份檔。');
    }
  };

  const totalQuestions = QUIZ_QUESTIONS.length;
  const solvedCount = Object.values(records).filter((r) => r.isCorrect).length;
  const bookmarkedCount = Object.values(records).filter((r) => r.bookmarked).length;
  const incorrectCount = Object.values(records).filter((r) => r.wrongAttempts > 0 && !r.isCorrect).length;

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      {/* Overview Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">總算力經驗值</div>
            <div className="text-xl font-extrabold text-amber-300 font-mono">{stats.totalXp} XP</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{stats.levelTitle}</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">連續挑戰天數</div>
            <div className="text-xl font-extrabold text-rose-300 font-mono">{stats.streakDays} 天</div>
            <div className="text-[11px] text-slate-400 mt-0.5">每日保持計算手感</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">通關掌握率</div>
            <div className="text-xl font-extrabold text-emerald-300 font-mono">
              {solvedCount} / {totalQuestions}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              掌握度 {Math.round((solvedCount / totalQuestions) * 100)}%
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">收藏待複習</div>
            <div className="text-xl font-extrabold text-cyan-300 font-mono">{bookmarkedCount} 題</div>
            <div className="text-[11px] text-slate-400 mt-0.5">隨時重溫算式步驟</div>
          </div>
        </div>
      </div>

      {/* Control and Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterMode === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            全部計算題 ({totalQuestions})
          </button>
          <button
            onClick={() => setFilterMode('bookmarked')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              filterMode === 'bookmarked'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 fill-amber-300" />
            待複習收藏 ({bookmarkedCount})
          </button>
          <button
            onClick={() => setFilterMode('incorrect')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              filterMode === 'incorrect'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            錯題淬鍊庫 ({incorrectCount})
          </button>
          <button
            onClick={() => setFilterMode('solved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              filterMode === 'solved'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            已通關題型 ({solvedCount})
          </button>
        </div>

        {/* Category Selector & Backup Actions */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.badge} {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={onExportProgress}
            title="下載學習進度備份 JSON"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            title="匯入進度 JSON"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (window.confirm('確定要清空所有計算題紀錄與收藏嗎？此動作無法復原。')) {
                onResetProgress();
              }
            }}
            title="重設所有進度"
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-rose-400 border border-slate-700 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Questions Grid */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">沒有符合條件的計算題</h3>
          <p className="text-xs text-slate-400">
            {filterMode === 'bookmarked'
              ? '您尚未收藏任何計算題。可在答題時點擊右上角書籤加入收藏！'
              : filterMode === 'incorrect'
              ? '太棒了！您目前沒有未掌握的錯題！'
              : '可切換分類篩選查看其他運算類型的進度。'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuestions.map((q) => {
            const rec = records[q.id];
            const isSolved = rec?.isCorrect || false;
            const isBookmarked = rec?.bookmarked || false;

            return (
              <div
                key={q.id}
                className={`bg-slate-900/90 border rounded-2xl p-5 shadow-xl flex flex-col justify-between transition-all hover:border-cyan-500/50 ${
                  isSolved
                    ? 'border-slate-800'
                    : rec?.wrongAttempts && rec.wrongAttempts > 0
                    ? 'border-rose-900/40 bg-slate-900/95'
                    : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{q.categoryBadge}</span>
                      <span className="text-xs font-semibold text-slate-300">{q.categoryName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSolved ? (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> 已通關 (+{rec?.score} XP)
                        </span>
                      ) : rec?.wrongAttempts && rec.wrongAttempts > 0 ? (
                        <span className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                          <XCircle className="w-3 h-3" /> 待突破 ({rec.wrongAttempts} 次未中)
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                          尚未挑戰
                        </span>
                      )}

                      <button
                        onClick={() => onToggleBookmark(q.id)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          isBookmarked
                            ? 'text-amber-400 bg-amber-500/20'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title={isBookmarked ? '取消收藏' : '加入複習清單'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-white mb-2">{q.title}</h4>

                  {/* Math Formula Card */}
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/90 mb-3 text-center overflow-x-auto">
                    <span className="text-[10px] text-cyan-400 font-mono block mb-1">待求算式</span>
                    <MathMarkdownViewer content={`$$${q.mathExpression}$$`} />
                    <div className="text-[11px] text-slate-400 mt-1">{q.targetTask}</div>
                  </div>

                  {/* Saved User Markdown Steps if any */}
                  {rec?.userMarkdown && (
                    <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60 mb-3 text-xs">
                      <div className="text-[10px] text-slate-400 font-mono mb-1">您先前留下的計算筆記：</div>
                      <div className="max-h-20 overflow-y-auto text-slate-300 text-xs">
                        <MathMarkdownViewer content={rec.userMarkdown} />
                      </div>
                    </div>
                  )}

                  {rec?.reviewNotes && (
                    <div className="bg-amber-950/20 border border-amber-500/20 p-2 rounded-xl mb-3 text-xs text-amber-200">
                      <span className="font-semibold text-[11px]">💡 個人運算備忘：</span> {rec.reviewNotes}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-400 font-mono">
                    正確值：${q.standardAnswerLatex}$
                  </span>

                  <button
                    onClick={() => onSelectQuestion(q.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span>{isSolved ? '重新演算複習' : '立即計算此題'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">匯入計算進度備份</h3>
            <p className="text-xs text-slate-400 mb-3">
              貼上先前導出的進度 JSON 字串以還原純計算題測驗進度與收藏：
            </p>
            <textarea
              rows={6}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='{"records": {...}, "stats": {...}}'
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 mb-3"
            />

            {importStatus && (
              <div className="text-xs mb-3 text-amber-300 font-medium">{importStatus}</div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
              >
                取消
              </button>
              <button
                onClick={handleImportSubmit}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
              >
                確認匯入
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
