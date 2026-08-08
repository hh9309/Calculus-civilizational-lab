/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { BookOpen, Compass, ShieldAlert, RefreshCw, Milestone } from "lucide-react";

interface TimelineNode {
  id: string;
  era: string;
  title: string;
  pioneer: string;
  focus: string;
  description: string;
  latex: string;
  crisis?: string;
}

const HISTORICAL_TIMELINE: TimelineNode[] = [
  {
    id: "exhaustion",
    era: "公元前370年 (古希腊)",
    title: "穷竭法与圆周率积分萌芽",
    pioneer: "安提丰 & 欧多克索斯",
    focus: "面积通量逼近",
    description: "通过不断增加正多边形的边数来‘穷竭’圆形面积。这奠定了通过有限逼近无限的积分思想基石，但由于缺乏‘极限状态’的严格化表述，停留在感性几何层面。",
    latex: "A = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} T_i \\approx \\pi r^2"
  },
  {
    id: "fluxions",
    era: "1665年 - 1684年",
    title: "微积分大发现：流动与切线",
    pioneer: "艾萨克·牛顿 (英国) & 莱布尼茨 (德国)",
    focus: "流数术与微差符号",
    description: "牛顿从运动力学出发发明‘流数术’，而莱布尼茨从几何切线出发发明了至今沿用的 dx/dy 算子。他们将求导与求面积绑定为互逆的‘微积分基本定理’。然而牛顿将无穷小量描述为‘已经消失的瞬时增量’，面临严酷的逻辑指责。",
    latex: "\\frac{dy}{dx} = \\lim_{\\Delta x \\to 0} \\frac{f(x+\\Delta x)-f(x)}{\\Delta x}",
    crisis: "贝克莱主教幽灵：无穷小量究竟是不是零？"
  },
  {
    id: "rigor",
    era: "1821年 - 1850年",
    title: "算术分析巨变：极限的代数大厦",
    pioneer: "波尔查诺 & 柯西 & 魏尔斯特拉斯",
    focus: "ε-δ (Epsilon-Delta) 极限定义",
    description: "用没有‘幽灵增量’的纯粹数理不等式重新定义极限，彻底封印了无穷小引起的百年危机，使微积分从物理直觉升华为无可争议的现代数学最高王冠。",
    latex: "\\forall \\epsilon > 0, \\exists \\delta > 0 \\text{ s.t. } 0 < |x - c| < \\delta \\implies |f(x) - L| < \\epsilon"
  }
];

export default function OriginsNarrative() {
  const [activeNode, setActiveNode] = useState<string>("fluxions");
  const [deltaX, setDeltaX] = useState<number>(1.2); // Controls secant convergence
  const [curveType, setCurveType] = useState<"parabola" | "sine">("parabola");
  
  // Bishop Berkeley Argument game state
  const [ghostStage, setGhostStage] = useState<"intro" | "question" | "resolution">("intro");
  const [userRigorScore, setUserRigorScore] = useState<number>(40);
  const [feedbackMsg, setFeedbackMsg] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Math equations are evaluated geometrically on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const originX = width / 6;
    const originY = height * 0.75;

    // Clear canvas with beautiful bright white
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Draw coordinate delicate grid paper lines (blueprint grid)
    ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
    ctx.lineWidth = 0.8;
    for (let x = 15; x < width; x += 15) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 15; y < height; y += 15) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw coordinate axis
    ctx.strokeStyle = "rgba(100, 116, 139, 0.35)"; // slate-500 line
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(20, originY);
    ctx.lineTo(width - 20, originY); // X-axis
    ctx.moveTo(originX, 20);
    ctx.lineTo(originX, height - 20); // Y-axis
    ctx.stroke();

    // Curve values
    const f = (x: number) => {
      if (curveType === "parabola") {
        return (x * x) / 130; // normalized parabola
      } else {
        return Math.sin(x / 40) * 80; // sine wave
      }
    };

    // Plot Function Curve f(x)
    ctx.strokeStyle = "#ea580c"; // Deep fire orange curve
    ctx.lineWidth = 3;
    ctx.beginPath();
    let first = true;
    for (let px = 20; px < width - 20; px++) {
      const rx = px - originX; // relative x
      const ry = f(rx);
      const py = originY - ry;
      if (first) {
        ctx.moveTo(px, py);
        first = false;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // Selected central point A
    const ax = 120; // fixed relative X
    const ay = f(ax);
    const plotAX = originX + ax;
    const plotAY = originY - ay;

    // Floating delta point B (A + Δx)
    const bx = ax + deltaX * 80;
    const by = f(bx);
    const plotBX = originX + bx;
    const plotBY = originY - by;

    // Draw secant line connecting A and B
    ctx.strokeStyle = "#0284c7"; // Beautiful oceanic sky-blue
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    // Exaggerated secant line
    const slope = (by - ay) / (bx - ax);
    const startPX = plotAX - 80;
    const startPY = plotAY - (startPX - plotAX) * slope;
    const endPX = plotBX + 80;
    const endPY = plotBY - (endPX - plotBX) * slope;
    ctx.moveTo(startPX, startPY);
    ctx.lineTo(endPX, endPY);
    ctx.stroke();
    ctx.setLineDash([]); // clear dash

    // Draw Limit Tangent Line at A for reference (pure derivative)
    // analytical derivative
    let tangentSlope = 0;
    if (curveType === "parabola") {
      tangentSlope = (2 * ax) / 130;
    } else {
      tangentSlope = Math.cos(ax / 40) * (80 / 40);
    }
    ctx.strokeStyle = "#d97706"; // Amber gold tangent
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    const tStartPX = plotAX - 70;
    const tStartPY = plotAY + (tStartPX - plotAX) * tangentSlope;
    const tEndPX = plotAX + 130;
    const tEndPY = plotAY + (tEndPX - plotAX) * tangentSlope;
    ctx.moveTo(tStartPX, tStartPY);
    ctx.lineTo(tEndPX, tEndPY);
    ctx.stroke();

    // Draw Point A (Anchor)
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(plotAX, plotAY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ea580c";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Label A (dark navy text)
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 11px var(--font-mono)";
    ctx.fillText("Point A (x, f(x))", plotAX - 50, plotAY - 15);

    // Draw Point B
    ctx.fillStyle = "#0284c7";
    ctx.beginPath();
    ctx.arc(plotBX, plotBY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Label B
    ctx.fillText(`Point B (x + Δx)`, plotBX + 10, plotBY + 5);

    // Dynamic math labels (highly readable dark values)
    ctx.fillStyle = "rgba(2, 132, 199, 1)";
    ctx.font = "500 11.5px var(--font-sans)";
    ctx.fillText(`极限界限逼近 Δx = ${deltaX.toFixed(3)}`, 25, 40);
    ctx.fillStyle = "rgba(217, 119, 6, 1)";
    ctx.fillText(`真切线斜率 (导数 dy/dx) ≈ ${(-tangentSlope).toFixed(3)}`, 25, 60);
    ctx.fillStyle = "rgba(234, 88, 12, 1)";
    ctx.fillText(`割线斜率 Δy/Δx = ${(-(by - ay)/(bx - ax)).toFixed(3)}`, 25, 80);

  }, [deltaX, curveType]);

  const handleBerkeleyChoice = (isRigorous: boolean, feedback: string) => {
    if (isRigorous) {
      setUserRigorScore(prev => Math.min(100, prev + 25));
      setFeedbackMsg(`【正确直觉】 ${feedback}`);
    } else {
      setUserRigorScore(prev => Math.max(0, prev - 15));
      setFeedbackMsg(`【遭遇悖论】 ${feedback}`);
    }
    setGhostStage("resolution");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="origins-section">
      {/* Narrative list sidebar */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col gap-3 shadow-xs">
          <div className="flex items-center gap-2 text-brand-orange">
            <Milestone className="w-5 h-5 text-brand-orange" />
            <h3 className="font-display font-semibold text-[15px] text-slate-800 font-mono">人类思维之跃：时空编年史</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            微积分不是凭空诞生的定理，它是两千年来人类在“瞬间移动”与“无穷积累”两大科学矛盾中，艰难撕开的文明航路：
          </p>
        </div>

        {/* Timelines Cards */}
        <div className="flex flex-col gap-3">
          {HISTORICAL_TIMELINE.map((node) => (
            <div
              key={node.id}
              onClick={() => setActiveNode(node.id)}
              className={`p-4 rounded-xl cursor-pointer border transition-all duration-300 flex flex-col gap-2 ${
                activeNode === node.id
                  ? "bg-white border-brand-orange/50 shadow-[0_4px_24px_rgba(234,88,12,0.06)]"
                  : "bg-white/70 border-slate-200 hover:border-slate-350 select-none hover:bg-white"
              }`}
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-brand-orange px-2 py-0.5 rounded bg-brand-orange/10 font-bold">
                  {node.era}
                </span>
                <span className="text-slate-500 font-medium text-[11px]">{node.pioneer}</span>
              </div>
              <h4 className="font-display font-bold text-sm text-slate-800">{node.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{node.description}</p>
              
              <div className="mt-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg flex items-center justify-between">
                <code className="text-xs font-mono text-brand-orange">{node.latex}</code>
                <span className="text-[10px] text-brand-yellow font-semibold tracking-wider uppercase font-mono">
                  {node.focus}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Sandbox Display */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Origin interactive math sandbox */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col gap-4 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-brand-orange animate-spin" style={{ animationDuration: "12s" }} />
              <h3 className="font-display font-semibold text-slate-800 text-sm md:text-base">切线探索器：极限界限导数沙盒</h3>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => setCurveType("parabola")}
                className={`px-3 py-1 text-[10.5px] rounded-full font-semibold transition cursor-pointer select-none border ${
                  curveType === "parabola" 
                    ? "bg-brand-orange/10 border-brand-orange/40 text-brand-orange" 
                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-800"
                }`}
              >
                抛物线
              </button>
              <button
                onClick={() => setCurveType("sine")}
                className={`px-3 py-1 text-[10.5px] rounded-full font-semibold transition cursor-pointer select-none border ${
                  curveType === "sine" 
                    ? "bg-brand-orange/10 border-brand-orange/40 text-brand-orange" 
                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-800"
                }`}
              >
                正弦曲线
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            拖动下方滑块降低 <code className="text-brand-orange font-mono font-semibold">Δx</code> 的值。
            观察割线（蓝色虚线）是如何逐步倾斜，并在 <code className="text-brand-orange font-mono font-semibold">Δx → 0</code> 时完美重振为这一点的黄金切线（橙黄色实线）。这就是微分变化率的纯粹几何形态！
          </p>

          <div className="relative w-full rounded-xl bg-slate-100 border border-slate-200/60 p-2 overflow-hidden flex items-center justify-center shadow-inner">
            <canvas
              ref={canvasRef}
              width={520}
              height={260}
              className="max-w-full bg-white rounded-lg shadow-sm border border-slate-200/30"
            />
          </div>

          {/* Slider trigger */}
          <div className="flex flex-col gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-500">无限分裂增量：(Δx)</span>
              <span className="text-brand-orange font-bold text-sm">{deltaX.toFixed(4)}</span>
            </div>
            <input
              type="range"
              min={0.0001}
              max={2.5}
              step={0.001}
              value={deltaX}
              onChange={(e) => setDeltaX(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>有限宏观 (Δx = 2.5)</span>
              <span className="text-brand-yellow font-bold">阿基米德微小化极限 (Δx → 0.0001)</span>
            </div>
          </div>
        </div>

        {/* Berkeley Ghost Paradox Mini-Game */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-brand-orange/10 text-brand-orange">
              <ShieldAlert className="w-4 h-4 text-brand-orange" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-xs md:text-sm text-slate-800">历史理性交锋：“贝克莱主教的幽灵”</h3>
              <p className="text-[10px] text-slate-400 font-mono">公元1734年，贝克莱大主教猛烈抨击牛顿：</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
            <p className="text-xs font-serif italic text-slate-650 leading-relaxed pl-3.5 border-l-2 border-brand-orange">
              “消失的瞬时增量 dx、dy 是什么？它们既不是有限量，也不是无限小量，甚至也不是虚无。难道它们不就是那些‘已经死去的量的幽灵’吗？如果把增量抛弃，它们就是0，分母就为0；如果不抛弃，怎么能凭空抹去它们的影响？”
            </p>

            {ghostStage === "intro" && (
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => setGhostStage("question")}
                  className="bg-brand-orange text-xs text-white lg:text-slate-900 font-semibold px-4 py-2 rounded-lg hover:shadow-md transition flex items-center gap-1 cursor-pointer"
                >
                  代表微积分学派迎战幽灵 <BookOpen className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {ghostStage === "question" && (
              <div className="mt-2 flex flex-col gap-2.5">
                <p className="text-xs font-bold text-brand-orange font-mono">辩词选择：你该如何捍卫求导公式的严格合法性？</p>
                <div className="grid grid-cols-1 gap-2 mt-1">
                  <button
                    onClick={() => handleBerkeleyChoice(
                      false, 
                      "你认为牛顿说它是‘正在消失的流数’足够严密。大主教冷笑道：‘正在消失？那就是还没消失！没消失就有误差，怎么能得出精确斜率？’数学危机加深，你的文明学术严谨度下降！"
                    )}
                    className="p-3 text-left text-xs bg-white hover:bg-slate-50 rounded-lg text-slate-700 border border-slate-200 shadow-xs transition cursor-pointer leading-relaxed"
                  >
                    1. 坚持微小增量不是零，它只是极为微弱的瞬时流动，在求瞬时变化率公式相除中可以合理忽略。
                  </button>
                  <button
                    onClick={() => handleBerkeleyChoice(
                      true,
                      "你运用了150年后柯西和魏尔斯特拉斯的极限防守方案！即‘dx 和 dy 并非幽灵，而是关于极限数列的动态逼近代数范围（Epsilon-Delta）’。大主教听后对现代代数逻辑哑口无言。你的严谨度增加！"
                    )}
                    className="p-3 text-left text-xs bg-white hover:bg-slate-100 rounded-lg text-slate-705 border border-brand-orange/20 shadow-xs transition cursor-pointer leading-relaxed"
                  >
                    2. 主张我们不讨论 dx 是不是 0，也不凭空丢弃误差，而是用没有‘幽灵量’的极限界限定义（即为任何实数级限制）彻底锁死微分值。
                  </button>
                </div>
              </div>
            )}

            {ghostStage === "resolution" && (
              <div className="mt-2 flex flex-col gap-3">
                <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-650 leading-relaxed border-l-3 border-brand-orange shadow-xs">
                  {feedbackMsg}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-mono">数学文明严谨度积累：</span>
                    <div className="w-32 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-brand-orange to-brand-yellow h-full transition-all duration-500" 
                        style={{ width: `${userRigorScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-brand-orange ml-1 font-bold">{userRigorScore}%</span>
                  </div>
                  <button
                    onClick={() => {
                      setGhostStage("question");
                      setFeedbackMsg("");
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors cursor-pointer font-mono"
                  >
                    <RefreshCw className="w-3 h-3 text-brand-orange" /> 重试本局
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
