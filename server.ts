import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Gemini API setup for real-time calculus reasoning & tailored hints
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

// AI Calculus Sage Hint endpoint
app.post('/api/ai-hint', async (req: Request, res: Response) => {
  try {
    const { questionTitle, questionScenario, targetTask, userCurrentInput, hintLevel } = req.body;

    if (!process.env.GEMINI_API_KEY || !aiClient) {
      return res.status(200).json({
        available: false,
        message: '未設定 GEMINI_API_KEY，將使用題目內建的漸進式解題指引。'
      });
    }

    const prompt = `你是一位熱愛純粹數學推導與計算的「微積分算力導師」（Calculus Computation Mentor）。
這是一個「Math for Fun」的純微積分計算測驗，專注於極限、導函數、定積分與級數的純粹運算化簡（絕無應用題或文字故事）。

【當前題目算式】：
$$${questionScenario || ''}$$

【目標要求】：${targetTask || ''}
【使用者目前輸入的 Markdown/LaTeX 計算過程或答案】：
${userCurrentInput || '（使用者目前正在思考如何下手化簡）'}

【提示等級】：Level ${hintLevel || 1}
- Level 1: 點出該題算式的關鍵型態（如 0/0 未定型、連鎖律內層、分部積分的 u 與 dv 選擇），給予運算直覺，不直接給出最終答案。
- Level 2: 提供核心化簡恆等式或計算定理公式（使用標準 LaTeX 格式）。
- Level 3: 針對使用者目前的輸入檢查：正負號、次方減一、連鎖律是否漏乘常數，並給出下一步化簡指引。

請以繁體中文回答，語氣清晰敏銳、重視數學符號嚴謹度，所有公式皆使用標準 LaTeX（行內 $...$、區塊 $$...$$），控制在 120 字以內！`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const reply = response.text || '繼續探索，靈感就在轉角處！';
    return res.status(200).json({
      available: true,
      hint: reply
    });
  } catch (error: any) {
    console.error('AI Hint Error:', error);
    return res.status(500).json({
      available: false,
      error: error.message || 'AI 導師暫時神遊了，請查看題目的內建秘笈提示！'
    });
  }
});

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
