export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'boss';

export type CalculationCategory = 'limit' | 'derivative' | 'integral' | 'series' | 'mixed';

export interface ProgressiveHint {
  technique: string;     // 提示1：運算技巧與型態判定 (如 0/0 型、分部積分、連鎖律)
  formulaKey: string;    // 提示2：核心計算公式 (LaTeX)
  stepGuide: string;     // 提示3：逐步化簡步驟
  fullSolution: string;  // 提示4：完整推導與解答 (Markdown + LaTeX)
}

export interface QuizQuestion {
  id: string;
  category: CalculationCategory;
  categoryName: string;
  categoryBadge: string;
  title: string;
  difficulty: DifficultyLevel;
  mathExpression: string; // The primary LaTeX problem statement e.g. \lim_{x \to 2} \frac{x^2 - 4}{x - 2}
  targetTask: string;     // e.g. 計算極限值、求導函數、求定積分值
  acceptedAnswers: string[]; // Normalized acceptable answers e.g. ["4", "4"], ["3x^2 - 4x + 5"]
  standardAnswerLatex: string; // Clean LaTeX representation of answer e.g. "4" or "2xe^{x^2}"
  answerFormatHelp: string;    // e.g. "請輸入純數值，例如 4" 或 "輸入多項式，如 2x - 3"
  hints: ProgressiveHint;
  xpReward: number;
}

export interface UserAnswerRecord {
  questionId: string;
  userMarkdown: string;     // 使用者輸入的 Markdown 解題筆記/算式
  isCorrect: boolean;
  score: number;
  hintsUsedCount: number;
  timestamp: number;
  bookmarked: boolean;      // 收藏隨時複習
  wrongAttempts: number;
  reviewNotes?: string;     // 使用者個人複習筆記
}

export interface UserStats {
  totalXp: number;
  streakDays: number;
  lastPlayedDate: string;
  solvedCount: number;
  perfectCount: number;
  level: number;
  levelTitle: string;
}

export interface ProgressState {
  records: Record<string, UserAnswerRecord>;
  stats: UserStats;
  filterCategory: string;
}
