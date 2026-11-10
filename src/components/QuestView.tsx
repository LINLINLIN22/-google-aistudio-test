import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Bookmark, Dices, Calculator, Zap } from 'lucide-react';
import { QuizQuestion, UserAnswerRecord } from '../types/quiz';
import { CATEGORIES, QUIZ_QUESTIONS } from '../data/quizData';
import { QuizCard } from './QuizCard';

interface QuestViewProps {
  records: Record<string, UserAnswerRecord>;
  targetQuestionId?: string;
  onRecordAttempt: (
    questionId: string,
    userMarkdown: string,
    isCorrect: boolean,
    hintsUsedCount: number,
    scoreGained: number,
    reviewNotes?: string
  ) => void;
  onToggleBookmark: (questionId: string) => void;
}

export const QuestView: React.FC<QuestViewProps> = ({
  records,
  targetQuestionId,
  onRecordAttempt,
  onToggleBookmark,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(
    targetQuestionId || QUIZ_QUESTIONS[0].id
  );

  // Filter questions based on selected calculation category
  const filteredQuestions = selectedCategory === 'all'
    ? QUIZ_QUESTIONS
    : QUIZ_QUESTIONS.filter((q) => q.category === selectedCategory);

  useEffect(() => {
    if (targetQuestionId) {
      setSelectedQuestionId(targetQuestionId);
      const q = QUIZ_QUESTIONS.find((item) => item.id === targetQuestionId);
      if (q && selectedCategory !== 'all' && q.category !== selectedCategory) {
        setSelectedCategory('all');
      }
    }
  }, [targetQuestionId]);

  const currentQuestion =
    QUIZ_QUESTIONS.find((q) => q.id === selectedQuestionId) || filteredQuestions[0] || QUIZ_QUESTIONS[0];

  const [isAutoRandom, setIsAutoRandom] = useState<boolean>(false);

  // Pick random calculation question
  const handleRandomCalc = () => {
    const list = filteredQuestions.length > 0 ? filteredQuestions : QUIZ_QUESTIONS;
    if (list.length <= 1) return;
    const candidates = list.filter((q) => q.id !== selectedQuestionId);
    const randomIndex = Math.floor(Math.random() * candidates.length);
    setSelectedQuestionId(candidates[randomIndex].id);
  };

  // Next question
  const handleNextQuestion = () => {
    if (isAutoRandom) {
      handleRandomCalc();
      return;
    }
    const currentIndex = filteredQuestions.findIndex((q) => q.id === selectedQuestionId);
    if (currentIndex >= 0 && currentIndex < filteredQuestions.length - 1) {
      setSelectedQuestionId(filteredQuestions[currentIndex + 1].id);
    } else {
      // Loop or go to next
      setSelectedQuestionId(filteredQuestions[0].id);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Category Filter and Quick Arcade Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-500/20 shrink-0">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  純微積分計算測驗
                </span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-300">
                  無任何應用問題 • 專注算力
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                微積分純算力挑戰關卡
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                精選極限求值、導函數與高階微分、定積分求值與無窮級數求和，支援 Markdown 即時數學推導。
              </p>
            </div>
          </div>

          {/* Random Question Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-950 px-3 py-2 rounded-2xl border border-slate-800 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAutoRandom}
                onChange={(e) => setIsAutoRandom(e.target.checked)}
                className="rounded accent-cyan-400 cursor-pointer"
              />
              <span>答對自動隨機下一題</span>
            </label>

            <button
              onClick={handleRandomCalc}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-md shrink-0 cursor-pointer"
            >
              <Dices className="w-4 h-4 text-amber-400" />
              <span>隨機出題 (Random)</span>
            </button>
          </div>
        </div>

        {/* Calculation Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = cat.id === selectedCategory;
            const qCount = cat.id === 'all'
              ? QUIZ_QUESTIONS.length
              : QUIZ_QUESTIONS.filter((q) => q.category === cat.id).length;
            const solvedQCount = cat.id === 'all'
              ? QUIZ_QUESTIONS.filter((q) => records[q.id]?.isCorrect).length
              : QUIZ_QUESTIONS.filter((q) => q.category === cat.id && records[q.id]?.isCorrect).length;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  const firstQ = cat.id === 'all'
                    ? QUIZ_QUESTIONS[0]
                    : QUIZ_QUESTIONS.find((q) => q.category === cat.id);
                  if (firstQ) setSelectedQuestionId(firstQ.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border transition-all text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-500/20 scale-[1.02]'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{cat.badge}</span>
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {solvedQCount}/{qCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Question Selector Pills */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-1">選擇計算題：</span>
          {filteredQuestions.map((q, idx) => {
            const isSelected = q.id === selectedQuestionId;
            const isSolved = records[q.id]?.isCorrect;
            const isBookmarked = records[q.id]?.bookmarked;

            return (
              <button
                key={q.id}
                onClick={() => setSelectedQuestionId(q.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md font-bold'
                    : isSolved
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/30'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {isSolved ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-[10px] font-mono flex items-center justify-center text-slate-400">
                    {idx + 1}
                  </span>
                )}
                <span className="truncate max-w-[130px]">{q.title}</span>
                {isBookmarked && <Bookmark className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Calculation Card */}
      <QuizCard
        question={currentQuestion}
        record={records[currentQuestion.id]}
        onRecordAttempt={onRecordAttempt}
        onToggleBookmark={onToggleBookmark}
        onNextQuestion={handleNextQuestion}
        onRandomQuestion={handleRandomCalc}
      />
    </div>
  );
};
