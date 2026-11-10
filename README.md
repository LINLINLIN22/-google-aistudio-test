# 微積分純計算測驗 (CalcQuest) - Math for Fun

專注於純計算題的微積分遊戲化測驗網站，完全採用 **100% 純前端（Client-Side SPA）** 架構，不依賴任何後端伺服器（無 Express、無 Node.js server）或外部 AI API（無 Gemini API），完全在瀏覽器中離線獨立運行，並可直接部署至 **GitHub Pages**。

---

## 🌟 特色亮點

- **100% 純前端架構**：無後端伺服器、無外部 API 呼叫，零延遲、零額外費用、保護隱私。
- **純計算題庫**：專注於極限（Limits）、微分（Derivatives）、積分（Integrals）、無窮級數（Series）之純符號運算，絕無文字應用題。
- **即時 LaTeX 數學式渲染**：輸入即時預覽，採用 KaTeX 本地打包引擎，精確渲染分式、根號、上下標與微積分符號。
- **快速數學符號鍵盤**：作答區正下方提供快捷按鈕（`\frac{d}{dx}`, `\int`, `\lim`, `\sqrt{}`, `\pi`, `e`, `\infty`, `\sin`, `\ln` 等），手機與筆電皆能輕鬆輸入。
- **本地漸進式提示系統**：
  - 提示 1：解題技巧與型態判定
  - 提示 2：核心公式與運算定理
  - 提示 3：逐步化簡指引
  - 提示 4：完整解析與標準答案
- **獨立 JSON 題庫**：所有題目、提示、解析與容錯標準答案均存放在 `src/data/quizQuestions.json`，隨時可自由擴充與維護。
- **進度與複習系統**：紀錄連勝、經驗值（XP）與作答記錄，隨時可在「錯題與複習庫」中進行複習。

---

## 📁 專案結構

```
├── public/
│   └── quizQuestions.json     # 公開靜態題庫副本（支援直接下載或靜態存取）
├── src/
│   ├── components/            # React 元件庫
│   │   ├── CalculusVisualizer.tsx # 函數曲線即時繪圖板
│   │   ├── HintPanel.tsx          # 本地漸進式 4 階提示面板
│   │   ├── MathMarkdownViewer.tsx # KaTeX + Markdown 數學式渲染器
│   │   ├── MathToolbar.tsx        # 快速數學符號鍵盤
│   │   ├── Navbar.tsx             # 導航列與統計資訊
│   │   ├── Playground.tsx         # 自由演算與草稿測試台
│   │   ├── QuestView.tsx          # 關卡與題型分類選擇
│   │   ├── QuizCard.tsx           # 主作答卡片（含隨機出題、ℹ️提示、快速鍵盤）
│   │   └── ReviewVault.tsx        # 歷史答題與錯題複習專區
│   ├── data/
│   │   ├── quizQuestions.json     # 核心純計算題目與逐步詳解題庫
│   │   └── quizData.ts            # 分類定義與 JSON 題庫讀取器
│   ├── hooks/
│   │   └── useQuizProgress.ts     # 本地進度、連勝與經驗值儲存（localStorage）
│   ├── types/
│   │   └── quiz.ts                # TypeScript 題庫與型別定義
│   ├── utils/
│   │   └── mathParser.ts          # 純前端數學語法正規化、等價比較與錯誤診斷
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json               # 純前端依賴（已移除 express, @google/genai 等）
├── tsconfig.json
└── vite.config.ts             # 設定 base: './' 確保 GitHub Pages 資源正常讀取
```

---

## 🚀 本地開發與執行

### 安裝依賴
```bash
npm install
```

### 啟動開發伺服器
```bash
npm run dev
```
瀏覽器開啟 `http://localhost:3000` 即可進行測驗。

### 建置生產環境版本 (Build)
```bash
npm run build
```
建置輸出將產生於 `dist/` 目錄，所有資源路徑皆為相對路徑（`./assets/...`）。

### 本地預覽生產版本
```bash
npm run preview
```

---

## 🌐 部署至 GitHub Pages

本專案已在 `vite.config.ts` 中將 `base` 設為 `'./'`，完全相容於 GitHub Pages 子路徑。

### 方法一：使用 GitHub Actions 自動部署（推薦）

在專案中建立 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main] # 或 master

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 方法二：手動部署至 gh-pages 分支

```bash
npm run build
npx gh-pages -d dist
```
