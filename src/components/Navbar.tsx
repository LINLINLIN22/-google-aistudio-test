import React from 'react';
import { Trophy, Flame, BookOpen, Layers, Calculator, HelpCircle } from 'lucide-react';
import { UserStats } from '../types/quiz';

interface NavbarProps {
  currentTab: 'quest' | 'review' | 'sandbox';
  onSelectTab: (tab: 'quest' | 'review' | 'sandbox') => void;
  stats: UserStats;
  completionRate: number;
  bookmarkedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  stats,
  completionRate,
  bookmarkedCount,
}) => {
  const xpInCurrentLevel = stats.totalXp % 150;
  const xpProgressPercent = Math.min(100, Math.round((xpInCurrentLevel / 150) * 100));

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('quest')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-amber-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-xl font-serif font-black text-white">∫</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  微積分純計算測驗
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                  Math for Fun
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-[200px] md:max-w-[260px] lg:max-w-none">
                零應用問題 • 純算力化簡 • 即時 LaTeX 渲染
              </p>
            </div>
          </div>

          {/* Mobile Streak & XP badge */}
          <div className="flex md:hidden items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
              <Trophy className="w-3.5 h-3.5" /> {stats.totalXp} XP
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs shadow-inner">
          <button
            onClick={() => onSelectTab('quest')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all font-semibold cursor-pointer ${
              currentTab === 'quest'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>算力測驗</span>
          </button>

          <button
            onClick={() => onSelectTab('review')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all font-semibold cursor-pointer ${
              currentTab === 'review'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>複習寶庫</span>
            {bookmarkedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold">
                {bookmarkedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('sandbox')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all font-semibold cursor-pointer ${
              currentTab === 'sandbox'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-pink-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>自由沙盒</span>
          </button>
        </div>

        {/* User Stats: Streak, Level, XP Bar */}
        <div className="hidden md:flex items-center gap-3">
          {/* Streak */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
            <span className="font-mono font-bold text-orange-300">{stats.streakDays}</span>
            <span className="text-slate-400 text-[11px]">天連勝</span>
          </div>

          {/* Level and XP */}
          <div className="flex flex-col gap-1 min-w-[140px] bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-amber-400 font-mono">Lv.{stats.level}</span>
              <span className="text-slate-400 text-[10px] font-mono">{stats.totalXp} XP</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-cyan-400 transition-all duration-300"
                style={{ width: `${xpProgressPercent}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-400 truncate max-w-[130px]">{stats.levelTitle}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
