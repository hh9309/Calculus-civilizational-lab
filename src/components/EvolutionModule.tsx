import React, { useState, useRef, useEffect } from "react";
import { MathView } from "./MathView";
import { GitCommit, Play, Pause, RotateCcw, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

export const EvolutionModule: React.FC = () => {
  const [currentStage, setCurrentStage] = useState<number>(3); // 0: Newton, 1: Leibniz, 2: Berkeley Crisis, 3: Cauchy (eps, delta)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Epsilon-Delta parameters for Cauchy stage
  const [epsilon, setEpsilon] = useState<number>(0.35); // 0.1 to 0.8
  const [x0, setX0] = useState<number>(0.5);

  // Animation canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stages = [
    {
      id: "newton_fluxion",
      year: "1666 年",
      title: "牛顿流数术：物理运动生成轨迹与瞬 (Moments)",
      subtitle: "将几何量视作流动点，变化率为流数 ẋ, 增量为 o ẋ",
      icon: "🍎",
      tag: "物理运动直觉",
    },
    {
      id: "leibniz_infinitesimal",
      year: "1675 年",
      title: "莱布尼茨微元：无限小差分 dx 与积分累加 ∫ydx",
      subtitle: "特征三角形中 dx, dy 作为可代数操作的无穷小量",
      icon: "✒️",
      tag: "符号代数威力",
    },
    {
      id: "berkeley_ghost",
      year: "1734 年",
      title: "贝克莱悖论：逝去量的幽灵 (Ghost of Departed Quantities)",
      subtitle: "除以 o 时假定 o≠0，求出导数时又令 o=0，逻辑自相矛盾",
      icon: "⛪",
      tag: "第二次数学危机",
    },
    {
      id: "cauchy_weierstrass",
      year: "1821-1872 年",
      title: "柯西-魏尔斯特拉斯：(ε, δ) 极限严格化与实数完备性",
      subtitle: "用静态实数不等式管带取代运动隐喻，彻底驱逐幽灵量",
      icon: "📐",
      tag: "现代分析学奠基",
    },
  ];

  // Auto playback of evolution stages
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentStage((prev) => (prev + 1) % stages.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Reset background
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#faf6ee";
    ctx.fillRect(0, 0, w, h);

    // Subtle grid
    ctx.strokeStyle = "rgba(200, 185, 155, 0.35)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 35) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const padX = 80;
    const padY = 60;
    const plotW = w - padX * 2;
    const plotH = h - padY * 2;

    const mapX = (xVal: number) => padX + xVal * plotW;
    const mapY = (yVal: number) => h - padY - yVal * plotH;

    // Base Curve: f(x) = x^2 + 0.1, x in [0, 1]
    const f = (xVal: number) => xVal * xVal + 0.1;
    const fPrime = (xVal: number) => 2 * xVal;

    // Draw Axes
    ctx.strokeStyle = "#6b5d44";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padX - 10, h - padY);
    ctx.lineTo(w - padX + 15, h - padY);
    ctx.moveTo(padX, h - padY + 10);
    ctx.lineTo(padX, padY - 15);
    ctx.stroke();

    // Draw Function Curve y = f(x)
    ctx.strokeStyle = "#2c2b28";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let px = 0; px <= 100; px++) {
      const vx = px / 100;
      const vy = f(vx);
      if (px === 0) ctx.moveTo(mapX(vx), mapY(vy));
      else ctx.lineTo(mapX(vx), mapY(vy));
    }
    ctx.stroke();

    // 0: Newton Fluxions (Kinematics point & velocity vector)
    if (currentStage === 0) {
      const curX = 0.55;
      const curY = f(curX);
      const slope = fPrime(curX);

      // Tangent vector
      const vx = 0.25;
      const vy = vx * slope;

      ctx.strokeStyle = "#2a4365";
      ctx.fillStyle = "rgba(42, 67, 101, 0.15)";
      ctx.lineWidth = 2.5;

      // Draw Tangent velocity line
      ctx.beginPath();
      ctx.moveTo(mapX(curX - 0.2), mapY(curY - 0.2 * slope));
      ctx.lineTo(mapX(curX + 0.25), mapY(curY + 0.25 * slope));
      ctx.stroke();

      // Velocity Arrow Vector
      const startX = mapX(curX);
      const startY = mapY(curY);
      const endX = mapX(curX + vx);
      const endY = mapY(curY + vy);

      ctx.strokeStyle = "#b85d38";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Point P
      ctx.fillStyle = "#b85d38";
      ctx.beginPath();
      ctx.arc(startX, startY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Labels
      ctx.fillStyle = "#2a4365";
      ctx.font = "bold 13px 'Noto Serif SC', serif";
      ctx.fillText("【牛顿流数模型】速度矢量 v = (ẋ, ẏ), 流动量增量 Δx = o ẋ", padX, 35);
      ctx.font = "12px monospace";
      ctx.fillText(`流动点 P(x, y), 流数比 ẏ/ẋ = 2x = ${(2 * curX).toFixed(2)}`, startX + 15, startY - 15);
    }

    // 1: Leibniz Differentials (dx, dy Infinitesimal characteristic triangle)
    else if (currentStage === 1) {
      const curX = 0.45;
      const dx = 0.2;
      const curY = f(curX);
      const nextY = f(curX + dx);

      // Area strip fill ∫ y dx
      ctx.fillStyle = "rgba(198, 138, 53, 0.25)";
      ctx.strokeStyle = "rgba(198, 138, 53, 0.7)";
      ctx.lineWidth = 1;
      const stripSteps = 8;
      const sDx = dx / stripSteps;
      for (let s = 0; s < stripSteps; s++) {
        const sx1 = curX + s * sDx;
        const sx2 = sx1 + sDx;
        const sy = f(sx1);
        ctx.fillRect(mapX(sx1), mapY(sy), mapX(sx2) - mapX(sx1), mapY(0) - mapY(sy));
        ctx.strokeRect(mapX(sx1), mapY(sy), mapX(sx2) - mapX(sx1), mapY(0) - mapY(sy));
      }

      // Microscopic Characteristic Triangle (dx, dy, ds)
      const px0 = mapX(curX);
      const py0 = mapY(curY);
      const px1 = mapX(curX + dx);
      const py1 = mapY(nextY);

      ctx.fillStyle = "rgba(74, 107, 93, 0.35)";
      ctx.strokeStyle = "#2e5242";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px0, py0);
      ctx.lineTo(px1, py0);
      ctx.lineTo(px1, py1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#2e5242";
      ctx.font = "bold 13px 'Noto Serif SC', serif";
      ctx.fillText("【莱布尼茨微积分】特征三角形 (dx, dy) 与微分面积元 y dx", padX, 35);
      ctx.font = "12px monospace";
      ctx.fillText("dx (横微元)", (px0 + px1) / 2 - 15, py0 + 16);
      ctx.fillText("dy (纵微元)", px1 + 8, (py0 + py1) / 2);
      ctx.fillText("∫ y dx (总和)", mapX(curX) + 10, mapY(0.1) - 15);
    }

    // 2: Berkeley Ghost Paradox
    else if (currentStage === 2) {
      const curX = 0.5;
      const curY = f(curX);
      const px0 = mapX(curX);
      const py0 = mapY(curY);

      // Pulsing Ghost Halo
      const time = Date.now() / 300;
      const pulse = (Math.sin(time) + 1) / 2;

      ctx.fillStyle = `rgba(184, 93, 56, ${0.15 + pulse * 0.25})`;
      ctx.beginPath();
      ctx.arc(px0, py0, 30 + pulse * 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#b85d38";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(px0, py0, 30 + pulse * 15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#b85d38";
      ctx.font = "bold 13px 'Noto Serif SC', serif";
      ctx.fillText("【贝克莱悖论】无穷小量 o 到底是 0 还是非 0？——“逝去量的幽灵”", padX, 35);

      ctx.font = "12px monospace";
      ctx.fillStyle = "#333";
      ctx.fillText(`第一步 (除以 o): 假定 o ≠ 0  =>  (2x·o + o²)/o = 2x + o`, padX, 60);
      ctx.fillText(`第二步 (取导数): 假定 o = 0  =>  2x + o = 2x`, padX, 80);
      ctx.fillStyle = "#b85d38";
      ctx.fillText(`“你们既把它们当作非零，又把它们当作零抹去！”`, padX, 105);
    }

    // 3: Cauchy & Weierstrass Epsilon-Delta Tube
    else if (currentStage === 3) {
      const L = f(x0);
      const slope = fPrime(x0);

      // Determine delta so that for |x - x0| < delta, |f(x) - L| < epsilon
      // Using quadratic solve: x = sqrt(L + epsilon - 0.1)
      const xUpper = Math.sqrt(Math.min(L + epsilon - 0.1, 1));
      const xLower = Math.sqrt(Math.max(L - epsilon - 0.1, 0));
      const delta = Math.min(xUpper - x0, x0 - xLower);

      const yTop = mapY(Math.min(L + epsilon, 1.1));
      const yBot = mapY(Math.max(L - epsilon, 0));
      const xLeft = mapX(Math.max(x0 - delta, 0));
      const xRight = mapX(Math.min(x0 + delta, 1));

      // 1. Draw Epsilon Strip (Horizontal Green Band)
      ctx.fillStyle = "rgba(74, 107, 93, 0.18)";
      ctx.fillRect(padX, yTop, plotW, yBot - yTop);

      ctx.strokeStyle = "#274035";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padX, yTop);
      ctx.lineTo(w - padX, yTop);
      ctx.moveTo(padX, yBot);
      ctx.lineTo(w - padX, yBot);
      ctx.stroke();

      // 2. Draw Delta Window (Vertical Green Band)
      ctx.fillStyle = "rgba(42, 67, 101, 0.15)";
      ctx.fillRect(xLeft, padY, xRight - xLeft, plotH);

      ctx.strokeStyle = "#1d334e";
      ctx.beginPath();
      ctx.moveTo(xLeft, padY);
      ctx.lineTo(xLeft, h - padY);
      ctx.moveTo(xRight, padY);
      ctx.lineTo(xRight, h - padY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Highlight target box intersection
      ctx.fillStyle = "rgba(74, 107, 93, 0.3)";
      ctx.fillRect(xLeft, yTop, xRight - xLeft, yBot - yTop);
      ctx.strokeStyle = "#1b5e20";
      ctx.lineWidth = 2;
      ctx.strokeRect(xLeft, yTop, xRight - xLeft, yBot - yTop);

      // Target Point (x0, L)
      const px0 = mapX(x0);
      const py0 = mapY(L);
      ctx.fillStyle = "#1b5e20";
      ctx.beginPath();
      ctx.arc(px0, py0, 5, 0, Math.PI * 2);
      ctx.fill();

      // Annotations
      ctx.fillStyle = "#1b5e20";
      ctx.font = "bold 13px 'Noto Serif SC', serif";
      ctx.fillText("【柯西-魏尔斯特拉斯 (ε, δ) 误差管带】静态实数不等式逻辑", padX, 35);

      ctx.font = "12px monospace";
      ctx.fillText(`极限值 L = ${L.toFixed(3)}, 误差容限 ε = ${epsilon.toFixed(2)}`, padX, 55);
      ctx.fillStyle = "#1d334e";
      ctx.fillText(`自适应控制区间 δ = ${delta.toFixed(3)}: 当 0 < |x - x₀| < δ 时, 恒有 |f(x) - L| < ε`, padX, 75);

      ctx.fillStyle = "#274035";
      ctx.fillText("L + ε", padX - 45, yTop + 4);
      ctx.fillText("L - ε", padX - 45, yBot + 4);
      ctx.fillText("x₀ - δ", xLeft - 20, h - padY + 18);
      ctx.fillText("x₀ + δ", xRight - 10, h - padY + 18);
    }
  }, [currentStage, epsilon, x0]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-[#F0EEE6] border border-[#D4C5B0] rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-serif bg-[#E8E4D9] text-[#7A7468] border border-[#D4C5B0] mb-2">
              <GitCommit className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>核心模块 3 · 无限分割与严密化 2D 思想轨迹动画</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#3D3D3D]">
              从“幽灵量”到 (ε, δ) 不等式：概念严密化的思想跃迁
            </h2>
            <p className="text-xs sm:text-sm text-[#7A7468] font-serif mt-1">
              同屏演播“无穷小”概念从 17 世纪力学运动与几何微元，历经贝克莱逻辑审判，直至 19 世纪极限严格化的完整演进轨迹。
            </p>
          </div>

          {/* Stage Selector */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-serif transition-all cursor-pointer ${
                isPlaying
                  ? "bg-[#8E887B] text-white font-medium"
                  : "bg-[#5A5A40] text-white hover:opacity-90 font-medium"
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? "暂停演播" : "连续演播"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stages.map((stg, idx) => {
          const isSelected = currentStage === idx;
          return (
            <button
              key={stg.id}
              onClick={() => {
                setCurrentStage(idx);
                setIsPlaying(false);
              }}
              className={`p-4 rounded-xl border text-left transition-all relative cursor-pointer ${
                isSelected
                  ? "bg-[#5A5A40] text-white border-[#5A5A40] shadow-sm ring-2 ring-[#5A5A40]/30"
                  : "bg-white hover:bg-[#F0EEE6] text-[#3D3D3D] border-[#D4C5B0]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{stg.icon}</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded font-mono ${
                    isSelected ? "bg-[#EAE7DF] text-[#5A5A40] font-bold" : "bg-[#E8E4D9] text-[#7A7468]"
                  }`}
                >
                  {stg.year}
                </span>
              </div>
              <h4 className="font-serif font-bold text-sm mb-1">{stg.title}</h4>
              <p
                className={`text-xs line-clamp-2 ${
                  isSelected ? "text-[#E8E4D9]" : "text-[#8E887B]"
                }`}
              >
                {stg.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Canvas & Interactive Control */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas Display */}
        <div className="lg:col-span-2 bg-white border border-[#D4C5B0] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#EAE7DF]">
            <span className="text-xs font-serif font-bold text-[#3D3D3D] flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>{stages[currentStage].title}</span>
            </span>
            <span className="text-xs font-serif px-2.5 py-0.5 rounded-full bg-[#E8E4D9] text-[#7A7468] border border-[#D4C5B0]">
              {stages[currentStage].tag}
            </span>
          </div>

          <div className="w-full aspect-[16/10] bg-[#F9F7F2] rounded-lg border border-[#D4C5B0] overflow-hidden shadow-inner">
            <canvas ref={canvasRef} width={760} height={475} className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="bg-white border border-[#D4C5B0] rounded-xl p-5 shadow-sm space-y-4 text-xs font-serif">
          <h4 className="font-bold text-sm text-[#3D3D3D] pb-2 border-b border-[#EAE7DF] flex items-center space-x-2">
            {currentStage === 2 ? (
              <AlertTriangle className="w-4 h-4 text-[#A85842]" />
            ) : currentStage === 3 ? (
              <ShieldCheck className="w-4 h-4 text-[#5A5A40]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#5A5A40]" />
            )}
            <span>阶段学术解析与数学形式化</span>
          </h4>

          {currentStage === 0 && (
            <div className="space-y-3">
              <p className="text-[#555555] leading-relaxed">
                牛顿在《流数法与无穷级数》(1671)
                中，将几何图形视为质点在时间 $t$ 内的连续流动。
              </p>
              <div className="bg-[#F0EEE6] p-3 rounded-lg border border-[#D4C5B0]">
                <span className="font-bold text-[#3D3D3D] block mb-1">二阶展开与瞬：</span>
                <MathView
                  math="(x + o\dot{x})^n = x^n + n x^{n-1} o\dot{x} + \frac{n(n-1)}{2} x^{n-2} (o\dot{x})^2 + \cdots"
                  block={true}
                />
              </div>
              <p className="text-[11px] text-[#8E887B]">
                局限：时间 $t$ 成为所有变量的全局参数，多变量求导与形式化抽象受限。
              </p>
            </div>
          )}

          {currentStage === 1 && (
            <div className="space-y-3">
              <p className="text-[#555555] leading-relaxed">
                莱布尼茨将差分算子 $d$ 与求和算子 $\int$ 提升为通用代数运算体系。
              </p>
              <div className="bg-[#F0EEE6] p-3 rounded-lg border border-[#D4C5B0]">
                <span className="font-bold text-[#3D3D3D] block mb-1">莱布尼茨乘积法则：</span>
                <MathView math="d(uv) = u\,dv + v\,du + du\,dv \approx u\,dv + v\,du" block={true} />
              </div>
              <p className="text-[11px] text-[#8E887B]">
                局限：二阶无穷小 $du\,dv$ 到底以何种法则被丢弃？尚无严格实数论支持。
              </p>
            </div>
          )}

          {currentStage === 2 && (
            <div className="space-y-3 text-[#555555]">
              <p className="leading-relaxed">
                1734年，爱尔兰哲学家乔治·贝克莱主教出版《分析学者》，直击微积分逻辑漏洞。
              </p>
              <div className="bg-[#F6EBE8] p-3 rounded-lg border border-[#EACEC8] text-[#914332]">
                <span className="font-bold block mb-1">贝克莱之问 (Berkeley's Paradox)：</span>
                <p className="text-[11px] italic">
                  “在求导第一步中，若微量 $o=0$ 则不能作分母；在第二步中，若微量 $o \ne 0$ 则不能直接舍弃。它究竟是零还是非零？”
                </p>
              </div>
              <p className="text-[11px] text-[#8E887B]">
                这场危机迫使数学界在随后的一个世纪中展开了轰轰烈烈的“严格化运动”。
              </p>
            </div>
          )}

          {currentStage === 3 && (
            <div className="space-y-3">
              <p className="text-[#555555] leading-relaxed">
                柯西与魏尔斯特拉斯用精确的不等式语言，把“动态逼近过程”转化为“静态量词真值”：
              </p>
              <div className="bg-[#EEF2EC] p-3 rounded-lg border border-[#C8D7C4] text-[#425C3C]">
                <MathView
                  math="\forall \varepsilon > 0, \; \exists \delta > 0, \; 0 < |x - x_0| < \delta \implies |f(x) - L| < \varepsilon"
                  block={true}
                />
              </div>

              {/* Interactive Epsilon Slider */}
              <div className="pt-2 border-t border-[#EAE7DF] space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-[#3D3D3D]">调节误差容限 ε:</span>
                  <span className="font-mono font-bold text-[#5A5A40]">{epsilon.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={0.6}
                  step={0.02}
                  value={epsilon}
                  onChange={(e) => setEpsilon(parseFloat(e.target.value))}
                  className="w-full accent-[#5A5A40] cursor-pointer"
                />
                <p className="text-[11px] text-[#8E887B]">
                  无论把 $\varepsilon$ 设得多小，系统总能自动求解出相应的 $\delta$ 控制带，确保函数不出界！
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
