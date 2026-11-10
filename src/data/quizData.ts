import { QuizQuestion, CalculationCategory } from '../types/quiz';
import quizQuestionsJson from './quizQuestions.json';

export interface CategoryInfo {
  id: CalculationCategory | 'all';
  name: string;
  badge: string;
  description: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'all',
    name: '全部純計算題',
    badge: '🧮',
    description: '涵蓋極限、微分、定積分與無窮級數的純數學計算闖關。',
    color: 'from-indigo-600 to-cyan-500',
  },
  {
    id: 'limit',
    name: '極限運算 (Limits)',
    badge: '⚡',
    description: '未定型 $\\frac{0}{0}$ 化簡、三角極限、羅必達法則與無窮極限計算。',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'derivative',
    name: '微分與導函數 (Derivatives)',
    badge: '📐',
    description: '多項式冪次律、連鎖律、乘積律、除法律與高階導數精確值。',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'integral',
    name: '積分運算 (Integrals)',
    badge: '∫',
    description: '微積分基本定理、代換積分法、分部積分法與定積分求值。',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'series',
    name: '無窮級數與展開 (Series)',
    badge: '∑',
    description: '等比級數求和、泰勒展開式與係數計算。',
    color: 'from-violet-500 to-fuchsia-600',
  },
];

// Load questions directly from the standalone JSON question bank
export const QUIZ_QUESTIONS: QuizQuestion[] = quizQuestionsJson as QuizQuestion[];
