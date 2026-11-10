import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { QuestView } from './components/QuestView';
import { ReviewVault } from './components/ReviewVault';
import { Playground } from './components/Playground';
import { useQuizProgress } from './hooks/useQuizProgress';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'quest' | 'review' | 'sandbox'>('quest');
  const [targetQuestionId, setTargetQuestionId] = useState<string | undefined>(undefined);

  const {
    state,
    recordAttempt,
    toggleBookmark,
    exportProgress,
    importProgress,
    resetProgress,
    bookmarkedQuestionIds,
    completionRate,
  } = useQuizProgress();

  // Jump from review directly to a question
  const handleSelectQuestionFromReview = (questionId: string) => {
    setTargetQuestionId(questionId);
    setCurrentTab('quest');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[130px]" />
        <div className="absolute bottom-[10%] right-[15%] w-[450px] h-[450px] rounded-full bg-indigo-600/10 blur-[130px]" />
        <div className="absolute top-[40%] right-[5%] w-[350px] h-[350px] rounded-full bg-amber-600/5 blur-[120px]" />
      </div>

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        stats={state.stats}
        completionRate={completionRate}
        bookmarkedCount={bookmarkedQuestionIds.length}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 z-10">
        {currentTab === 'quest' && (
          <QuestView
            records={state.records}
            targetQuestionId={targetQuestionId}
            onRecordAttempt={recordAttempt}
            onToggleBookmark={toggleBookmark}
          />
        )}

        {currentTab === 'review' && (
          <ReviewVault
            records={state.records}
            stats={state.stats}
            onSelectQuestion={handleSelectQuestionFromReview}
            onToggleBookmark={toggleBookmark}
            onExportProgress={exportProgress}
            onImportProgress={importProgress}
            onResetProgress={resetProgress}
          />
        )}

        {currentTab === 'sandbox' && <Playground />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 backdrop-blur-md py-6 text-center text-xs text-slate-500 z-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400 font-bold font-mono">Math for Fun</span>
            <span>• 純微積分計算測驗：專注極限、導數、定積分與級數化簡</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>支援即時 Markdown / LaTeX 算式轉譯</span>
            <span>•</span>
            <span>進度自動儲存於瀏覽器</span>
            <span>•</span>
            <span className="text-slate-400">Pure Calculus Practice</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
