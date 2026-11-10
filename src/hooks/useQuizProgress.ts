import { useState, useEffect, useCallback } from 'react';
import { ProgressState, UserAnswerRecord, UserStats } from '../types/quiz';
import { QUIZ_QUESTIONS } from '../data/quizData';

const STORAGE_KEY = 'calcquest_pure_math_v2';

const INITIAL_STATS: UserStats = {
  totalXp: 0,
  streakDays: 1,
  lastPlayedDate: new Date().toISOString().split('T')[0],
  solvedCount: 0,
  perfectCount: 0,
  level: 1,
  levelTitle: '極限算力見習生 (Calc Apprentice)',
};

const INITIAL_STATE: ProgressState = {
  records: {},
  stats: INITIAL_STATS,
  filterCategory: 'all',
};

export function getLevelTitle(level: number): string {
  if (level >= 12) return '微積分無雙神算 (Calculus Grandmaster)';
  if (level >= 8) return '分部積分聖騎士 (Integration Paladin)';
  if (level >= 5) return '連鎖律極速遊俠 (Chain Rule Ranger)';
  if (level >= 3) return '未定型破壁法師 (L\'Hôpital Archmage)';
  if (level >= 2) return '導數流速探索者 (Derivative Adept)';
  return '極限算力見習生 (Calc Apprentice)';
}

export function useQuizProgress() {
  const [state, setState] = useState<ProgressState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          records: parsed.records || {},
          stats: { ...INITIAL_STATS, ...(parsed.stats || {}) },
          filterCategory: parsed.filterCategory || 'all',
        };
      }
    } catch (e) {
      console.warn('Failed to parse saved calculation progress:', e);
    }
    return INITIAL_STATE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [state]);

  const recordAttempt = useCallback(
    (
      questionId: string,
      userMarkdown: string,
      isCorrect: boolean,
      hintsUsedCount: number,
      scoreGained: number,
      reviewNotes?: string
    ) => {
      setState((prev) => {
        const existingRecord = prev.records[questionId];
        const prevWrongAttempts = existingRecord ? existingRecord.wrongAttempts : 0;
        const previouslyCorrect = existingRecord?.isCorrect;

        const updatedRecord: UserAnswerRecord = {
          questionId,
          userMarkdown,
          isCorrect,
          score: Math.max(existingRecord?.score || 0, scoreGained),
          hintsUsedCount,
          timestamp: Date.now(),
          bookmarked: existingRecord?.bookmarked || false,
          wrongAttempts: isCorrect ? prevWrongAttempts : prevWrongAttempts + 1,
          reviewNotes: reviewNotes ?? existingRecord?.reviewNotes,
        };

        const newRecords = {
          ...prev.records,
          [questionId]: updatedRecord,
        };

        let totalXp = 0;
        let solvedCount = 0;
        let perfectCount = 0;

        Object.values(newRecords).forEach((rec) => {
          if (rec.isCorrect) {
            solvedCount += 1;
            totalXp += rec.score;
            if (rec.hintsUsedCount === 0 && rec.wrongAttempts === 0) {
              perfectCount += 1;
            }
          }
        });

        if (!previouslyCorrect && isCorrect) {
          totalXp += scoreGained;
        }

        const calculatedLevel = Math.max(1, Math.floor(totalXp / 150) + 1);

        const today = new Date().toISOString().split('T')[0];
        let streak = prev.stats.streakDays;
        if (prev.stats.lastPlayedDate !== today) {
          const lastDate = new Date(prev.stats.lastPlayedDate);
          const currDate = new Date(today);
          const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
          if (diffDays === 1) {
            streak += 1;
          } else if (diffDays > 1) {
            streak = 1;
          }
        }

        const newStats: UserStats = {
          totalXp,
          streakDays: streak,
          lastPlayedDate: today,
          solvedCount,
          perfectCount,
          level: calculatedLevel,
          levelTitle: getLevelTitle(calculatedLevel),
        };

        return {
          ...prev,
          records: newRecords,
          stats: newStats,
        };
      });
    },
    []
  );

  const toggleBookmark = useCallback((questionId: string) => {
    setState((prev) => {
      const existing = prev.records[questionId];
      const isCurrentlyBookmarked = existing ? existing.bookmarked : false;

      const updatedRecord: UserAnswerRecord = existing
        ? { ...existing, bookmarked: !isCurrentlyBookmarked }
        : {
            questionId,
            userMarkdown: '',
            isCorrect: false,
            score: 0,
            hintsUsedCount: 0,
            timestamp: Date.now(),
            bookmarked: true,
            wrongAttempts: 0,
          };

      return {
        ...prev,
        records: {
          ...prev.records,
          [questionId]: updatedRecord,
        },
      };
    });
  }, []);

  const setFilterCategory = useCallback((category: string) => {
    setState((prev) => ({ ...prev, filterCategory: category }));
  }, []);

  const exportProgress = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `calcquest_math_calculations_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [state]);

  const importProgress = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        setState({
          records: parsed.records || {},
          stats: { ...INITIAL_STATS, ...(parsed.stats || {}) },
          filterCategory: parsed.filterCategory || 'all',
        });
        return true;
      }
    } catch (e) {
      console.error('Import failed:', e);
    }
    return false;
  }, []);

  const resetProgress = useCallback(() => {
    setState(INITIAL_STATE);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const bookmarkedQuestionIds = Object.keys(state.records).filter((id) => state.records[id]?.bookmarked);
  const wrongAttemptQuestionIds = Object.keys(state.records).filter(
    (id) => state.records[id]?.wrongAttempts > 0 && !state.records[id]?.isCorrect
  );
  const solvedQuestionIds = Object.keys(state.records).filter((id) => state.records[id]?.isCorrect);

  const totalQuestions = QUIZ_QUESTIONS.length;
  const completionRate = Math.round((solvedQuestionIds.length / totalQuestions) * 100);

  return {
    state,
    recordAttempt,
    toggleBookmark,
    setFilterCategory,
    exportProgress,
    importProgress,
    resetProgress,
    bookmarkedQuestionIds,
    wrongAttemptQuestionIds,
    solvedQuestionIds,
    completionRate,
  };
}
