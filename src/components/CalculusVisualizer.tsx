import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface CalculusVisualizerProps {
  type: 'tangent' | 'riemann' | 'coaster' | 'decay' | 'none';
  params?: {
    funcStr?: string;
    domain?: [number, number];
    initialX?: number;
    initialN?: number;
  };
  title?: string;
}

export const CalculusVisualizer: React.FC<CalculusVisualizerProps> = ({ type, params, title }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [sliderValue, setSliderValue] = useState<number>(params?.initialX ?? 2);
  const [riemannN, setRiemannN] = useState<number>(params?.initialN ?? 10);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  // Helper math evaluators
  const evaluateFunc = (x: number): number => {
    const f = params?.funcStr || 'x^2';
    if (f.includes('5*x^2')) return 5 * x * x - 2 * x + 4;
    if (f.includes('sqrt')) return Math.sqrt(Math.max(0, x));
    if (f.includes('-x^2 + 6*x')) return -x * x + 6 * x + 10;
    if (f.includes('x^3 - 6*x^2')) return x * x * x - 6 * x * x + 9 * x + 2;
    if (f.includes('3*x^2')) return 3 * x * x;
    if (f.includes('sin(4*x)')) return x === 0 ? 4 : Math.sin(4 * x) / x;
    if (f.includes('100 * 2^x')) return 100 * Math.pow(2, x);
    if (f.includes('1/(2^x)')) return 1 / Math.pow(2, x);
    if (f.includes('1 - x^2/2')) return 1 - (x * x) / 2;
    if (f.includes('x^2')) return x * x;
    return x * x;
  };

  const evaluateDerivative = (x: number): number => {
    const h = 0.0001;
    return (evaluateFunc(x + h) - evaluateFunc(x - h)) / (2 * h);
  };

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Determine domain and range
    const domain = params?.domain || [0, 5];
    const xMin = domain[0];
    const xMax = domain[1];

    // Sample y min/max
    let yMin = Infinity;
    let yMax = -Infinity;
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = evaluateFunc(x);
      if (!isNaN(y)) {
        if (y < yMin) yMin = y;
        if (y > yMax) yMax = y;
      }
    }
    yMin = Math.min(0, yMin - 1);
    yMax = Math.max(5, yMax + (yMax - yMin) * 0.15);

    const toCanvasX = (x: number) => 40 + ((x - xMin) / (xMax - xMin)) * (width - 70);
    const toCanvasY = (y: number) => height - 30 - ((y - yMin) / (yMax - yMin)) * (height - 60);

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Grid lines & Axes
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    // Horizontal axis (y = 0)
    const yZeroCanvas = toCanvasY(0);
    ctx.beginPath();
    ctx.moveTo(40, yZeroCanvas);
    ctx.lineTo(width - 20, yZeroCanvas);
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    // Vertical axis (x = 0)
    if (xMin <= 0 && xMax >= 0) {
      const xZeroCanvas = toCanvasX(0);
      ctx.beginPath();
      ctx.moveTo(xZeroCanvas, 20);
      ctx.lineTo(xZeroCanvas, height - 30);
      ctx.stroke();
    }

    // Draw Riemann slices if type === 'riemann'
    if (type === 'riemann') {
      const n = riemannN;
      const dx = (xMax - xMin) / n;
      for (let i = 0; i < n; i++) {
        const xLeft = xMin + i * dx;
        const xMid = xLeft + dx / 2;
        const yVal = evaluateFunc(xMid);

        const cx1 = toCanvasX(xLeft);
        const cx2 = toCanvasX(xLeft + dx);
        const cy = toCanvasY(yVal);
        const cyZero = toCanvasY(0);

        ctx.fillStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.28)' : 'rgba(99, 102, 241, 0.28)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.lineWidth = 1;
        ctx.fillRect(cx1, Math.min(cy, cyZero), cx2 - cx1, Math.abs(cyZero - cy));
        ctx.strokeRect(cx1, Math.min(cy, cyZero), cx2 - cx1, Math.abs(cyZero - cy));
      }
    }

    // Draw Curve
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#38bdf8'; // Sky blue curve
    let started = false;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = evaluateFunc(x);
      if (!isNaN(y)) {
        const cx = toCanvasX(x);
        const cy = toCanvasY(y);
        if (!started) {
          ctx.moveTo(cx, cy);
          started = true;
        } else {
          ctx.lineTo(cx, cy);
        }
      }
    }
    ctx.stroke();

    // Tangent Line & Point (for tangent or coaster mode)
    if (type === 'tangent' || type === 'coaster') {
      const x0 = sliderValue;
      const y0 = evaluateFunc(x0);
      const slope = evaluateDerivative(x0);

      // Tangent segment
      const deltaX = (xMax - xMin) * 0.25;
      const x1 = x0 - deltaX;
      const y1 = y0 - slope * deltaX;
      const x2 = x0 + deltaX;
      const y2 = y0 + slope * deltaX;

      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#f59e0b'; // Amber tangent line
      ctx.moveTo(toCanvasX(x1), toCanvasY(y1));
      ctx.lineTo(toCanvasX(x2), toCanvasY(y2));
      ctx.stroke();

      // Point (x0, y0)
      const cx0 = toCanvasX(x0);
      const cy0 = toCanvasY(y0);

      ctx.beginPath();
      ctx.arc(cx0, cy0, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Tooltip readout on canvas
      ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.fillStyle = '#f8fafc';
      const label = `x = ${x0.toFixed(2)}, f'(x) = ${slope.toFixed(2)}`;
      ctx.fillText(label, Math.min(cx0 + 10, width - 140), Math.max(cy0 - 12, 30));
    }

    // Axes tick numbers
    ctx.font = '10px ui-sans-serif, system-ui';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(xMin.toFixed(1), 40, height - 12);
    ctx.fillText(xMax.toFixed(1), width - 35, height - 12);
    ctx.fillText(yMax.toFixed(1), 10, 24);
  }, [sliderValue, riemannN, type, params]);

  // Animation for coaster or dynamic exploration
  useEffect(() => {
    if (!isAnimating) return;
    const domain = params?.domain || [0, 5];
    let dir = 1;

    const step = () => {
      setSliderValue((prev) => {
        let next = prev + 0.04 * dir;
        if (next >= domain[1]) {
          dir = -1;
          next = domain[1];
        } else if (next <= domain[0]) {
          dir = 1;
          next = domain[0];
        }
        return next;
      });
      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isAnimating, params]);

  if (type === 'none') return null;

  const domain = params?.domain || [0, 5];
  const currentSlope = evaluateDerivative(sliderValue);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl mb-4 backdrop-blur-md">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {type === 'tangent' ? '📐 即時切線觀測儀' : type === 'riemann' ? '🍰 黎曼千層薄片模擬' : '🎢 雲霄飛車曲率儀'}
          </span>
          <span className="text-xs text-slate-400 font-mono">{params?.funcStr || ''}</span>
        </div>

        {type !== 'riemann' && (
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            {isAnimating ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            {isAnimating ? '暫停巡航' : '自動動態巡航'}
          </button>
        )}
      </div>

      <div className="relative w-full h-44 bg-slate-950/60 rounded-xl overflow-hidden border border-slate-800/80">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Interactive Controls */}
      <div className="mt-3 pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        {type === 'riemann' ? (
          <div className="flex items-center gap-3 w-full">
            <span className="text-slate-300 font-medium whitespace-nowrap">薄片分割數 $n$：</span>
            <input
              type="range"
              min="2"
              max="40"
              value={riemannN}
              onChange={(e) => setRiemannN(parseInt(e.target.value, 10))}
              className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <span className="font-mono text-cyan-300 font-bold w-8 text-right">{riemannN}</span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">($n$ 越大切片越細，總和越逼近真實積分)</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 w-full">
            <span className="text-slate-300 font-medium whitespace-nowrap">滑動探測點 $x_0$：</span>
            <input
              type="range"
              min={domain[0]}
              max={domain[1]}
              step="0.05"
              value={sliderValue}
              onChange={(e) => {
                setIsAnimating(false);
                setSliderValue(parseFloat(e.target.value));
              }}
              className="flex-1 accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <span className="font-mono text-amber-300 font-bold">{sliderValue.toFixed(2)}</span>
            <div className="bg-slate-800/80 px-2 py-0.5 rounded text-[11px] font-mono text-slate-300">
              斜率 <span className="text-emerald-400 font-bold">{currentSlope.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
