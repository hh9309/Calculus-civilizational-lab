/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { Sparkles, Music, Settings, Volume2, VolumeX, Eye } from "lucide-react";
import MathFormula from "./MathFormula";

export default function CalculusAesthetics() {
  const [activeArt, setActiveArt] = useState<"lorenz" | "fourier_harmonic">("lorenz");
  const [isAudioOn, setIsAudioOn] = useState<boolean>(false);
  
  // Lorenz parameters
  const [sigma, setSigma] = useState<number>(10.0);
  const [rho, setRho] = useState<number>(28.0);
  const [beta, setBeta] = useState<number>(2.66);

  // Fourier parameters
  const [harmonics, setHarmonics] = useState<number>(4); // number of sine components

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Web Audio refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Lorenz numeric state
  const lorenzState = useRef({
    x: 0.1,
    y: 0.0,
    z: 0.0,
    history: [] as Array<{ x: number; y: number; z: number }>
  });

  const handleToggleAudio = () => {
    if (!isAudioOn) {
      try {
        // Initialize Web Audio safely on gesture
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.0, ctx.currentTime); // start silent

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        audioCtxRef.current = ctx;
        oscRef.current = osc;
        gainRef.current = gain;
        
        // fade-in sound
        gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.3);
        setIsAudioOn(true);
      } catch (err) {
        console.error("Web Audio context initialization blocked/failed: ", err);
      }
    } else {
      stopAudio();
    }
  };

  const stopAudio = () => {
    if (gainRef.current && audioCtxRef.current) {
      try {
        gainRef.current.gain.setValueAtTime(gainRef.current.gain.value, audioCtxRef.current.currentTime);
        gainRef.current.gain.linearRampToValueAtTime(0.0, audioCtxRef.current.currentTime + 0.1);
        setTimeout(() => {
          if (oscRef.current) oscRef.current.stop();
          if (audioCtxRef.current) audioCtxRef.current.close();
          audioCtxRef.current = null;
          oscRef.current = null;
          gainRef.current = null;
        }, 120);
      } catch (e) {
        console.warn(e);
      }
    }
    setIsAudioOn(false);
  };

  useEffect(() => {
    return () => {
      // safe cleanup
      if (oscRef.current) oscRef.current.stop();
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // Visual Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    let frame = 0;

    const render = () => {
      frame++;
      
      // Clear canvas with white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Render coordinate delicate blueprint grid on canvas
      ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 25) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += 25) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      // 1. Plot LORENZ ATTRACTOR (Chaos system ODE)
      if (activeArt === "lorenz") {
        const dt = 0.012; // solve step
        const s = lorenzState.current;

        // Lorenz Equations
        // dx = sigma * (y - x) * dt
        // dy = (x * (rho - z) - y) * dt
        // dz = (x * y - beta * z) * dt
        const dx = sigma * (s.y - s.x);
        const dy = s.x * (rho - s.z) - s.y;
        const dz = s.x * s.y - beta * s.z;

        const nextX = s.x + dx * dt;
        const nextY = s.y + dy * dt;
        const nextZ = s.z + dz * dt;

        lorenzState.current.x = nextX;
        lorenzState.current.y = nextY;
        lorenzState.current.z = nextZ;

        // Save position trail
        s.history.push({ x: nextX, y: nextY, z: nextZ });
        if (s.history.length > 550) s.history.shift();

        // Canvas parameters mapping
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = 5.2; // mapping coordinates to screen pixels
        const zOffset = rho - 2.5; // Center attractor vertically around Rayleigh parameter (approx rho - 2.5)

        // Draw attractor trail
        ctx.lineWidth = 1.3;
        for (let i = 1; i < s.history.length; i++) {
          const ptPrev = s.history[i - 1];
          const ptCurr = s.history[i];

          // Saturated rich shifting jewel tones instead of pastels
          const hue = (i + frame * 0.25) % 360;
          ctx.strokeStyle = `hsla(${hue}, 85%, 45%, ${i / s.history.length})`;

          ctx.beginPath();
          // Lorenz XZ projection onto canvas plane centered vertically
          ctx.moveTo(centerX + ptPrev.x * scale, centerY - (ptPrev.z - zOffset) * scale);
          ctx.lineTo(centerX + ptCurr.x * scale, centerY - (ptCurr.z - zOffset) * scale);
          ctx.stroke();
        }

        // Draw leading tracking orb (Glowing volcano fire orange)
        if (s.history.length > 0) {
          const top = s.history[s.history.length - 1];
          ctx.fillStyle = "#ea580c";
          ctx.beginPath();
          ctx.arc(centerX + top.x * scale, centerY - (top.z - zOffset) * scale, 5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Map Lorenz state in Real-Time to Audio Context!
        if (isAudioOn && oscRef.current && audioCtxRef.current) {
          // Map x to a reasonable frequency range (e.g. 150Hz to 600Hz)
          // Lorenz X spans around -20 to 20
          const fx = 350 + s.x * 12;
          // Apply change clamp
          oscRef.current.frequency.setTargetAtTime(Math.max(120, Math.min(1100, fx)), audioCtxRef.current.currentTime, 0.05);
        }
      }

      // 2. Plot FOURIER SERIES Synthesis
      else if (activeArt === "fourier_harmonic") {
        const centerY = height / 2;
        const speed = frame * 0.015;

        // Draw coordinate axes
        ctx.strokeStyle = "rgba(100, 116, 139, 0.22)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(30, centerY); ctx.lineTo(width - 30, centerY);
        ctx.stroke();

        // Map Fourier harmonics dynamic point vectors over a circle on left
        const circleCenterX = 130;
        const radiusBase = 50;

        let prevX = circleCenterX;
        let prevY = centerY;

        ctx.strokeStyle = "rgba(234, 88, 12, 0.12)";
        ctx.strokeRect(30, centerY - 90, 200, 185);

        // Sum up sine wave circles representing harmonics adding up
        for (let k = 1; k <= harmonics; k++) {
          const harmonicIndex = 2 * k - 1; // square wave uses odd harmonics
          const subRadius = radiusBase * (4 / (Math.PI * harmonicIndex)); // Fourier sine multiplier height
          const angle = harmonicIndex * speed;

          const currX = prevX + Math.cos(angle) * subRadius;
          const currY = prevY + Math.sin(angle) * subRadius;

          // Draw phasor circle (Beautiful sunset transparent oranges)
          ctx.strokeStyle = `rgba(234, 88, 12, ${0.48 - k * 0.025})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(prevX, prevY, subRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Vector arm line (Ocean sky blue)
          ctx.strokeStyle = "#0284c7";
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(currX, currY);
          ctx.stroke();

          prevX = currX;
          prevY = currY;
        }

        // Draw phasor tip tracking node (Amber gold)
        ctx.fillStyle = "#d97706";
        ctx.beginPath();
        ctx.arc(prevX, prevY, 3.5, 0, Math.PI*2);
        ctx.fill();

        // Plot reconstructed composite wave from x index
        const waveStartX = 240;
        const waveWidth = width - waveStartX - 30;

        ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(waveStartX, prevY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Graph wave plot (Bold orange composite wave)
        ctx.strokeStyle = "#ea580c";
        ctx.lineWidth = 2.6;
        ctx.beginPath();

        let waveFirst = true;
        for (let sx = 0; sx < waveWidth; sx++) {
          const px = waveStartX + sx;
          const relativePos = sx / waveWidth;
          // compute the Fourier sum for each horizontal pixel coordinate
          let val = 0;
          for (let k = 1; k <= harmonics; k++) {
            const index = 2 * k - 1;
            const amp = radiusBase * (4 / (Math.PI * index));
            // phase shift proportional to coordinate
            const theta = index * (-speed + relativePos * Math.PI * 3);
            val += Math.sin(theta) * amp;
          }

          const py = centerY + val;
          if (waveFirst) {
            ctx.moveTo(px, py);
            waveFirst = false;
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();

        // Audio Timbre mapping: change audio context oscillator based on harmonics
        // Sine wave transforms into buzzing rich sawtooth wave timbre
        if (isAudioOn && oscRef.current && audioCtxRef.current) {
          oscRef.current.frequency.setTargetAtTime(260, audioCtxRef.current.currentTime, 0.1);
          if (harmonics > 8) {
            oscRef.current.type = "sawtooth";
          } else if (harmonics > 3) {
            oscRef.current.type = "triangle";
          } else {
            oscRef.current.type = "sine";
          }
        }
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [activeArt, sigma, rho, beta, harmonics, isAudioOn]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="calculus-aesthetics">
      <div className="lg:col-span-5 flex flex-col gap-4">
        {/* Dynamic Concept Explanation */}
        <div className="p-5 rounded-2xl bg-white border border-slate-205 flex flex-col gap-3 shadow-xs">
          <div className="flex items-center gap-2 text-brand-orange">
            <Sparkles className="w-5 h-5 text-brand-orange animate-pulse" />
            <h3 className="font-display font-semibold text-slate-800 text-sm md:text-base font-mono">连续美学：数学方程几何声流室</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-sans">
            数学方程绝非干枯冰冷的纸面铁律，它是孕育宇宙对称美与运动秩序的无形造物力量。
            在这里，我们将经典动力微分转化为<strong className="text-brand-orange">美学微元声能几何</strong>与<strong className="text-brand-orange">自适应电子谐振乐波</strong>。让您可以直观观测和聆听宇宙深层声场的极致协调：
          </p>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => {
              setActiveArt("lorenz");
              if (oscRef.current) oscRef.current.type = "sine";
            }}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer text-center transition-all ${
              activeArt === "lorenz"
                ? "bg-white border-brand-orange shadow-[0_4px_16px_rgba(234,88,12,0.06)] text-slate-900 font-bold scale-[1.01]"
                : "bg-slate-50/80 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-white select-none shadow-xs"
            }`}
          >
            <Eye className="w-4 h-4 text-brand-orange" />
            <span className="font-display font-semibold text-xs">1. 洛伦兹混沌吸引子</span>
            <span className="text-[10px] text-slate-400 font-mono">Lorenz ODE Attractor</span>
          </button>
          <button
            onClick={() => setActiveArt("fourier_harmonic")}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer text-center transition-all ${
              activeArt === "fourier_harmonic"
                ? "bg-white border-brand-orange shadow-[0_4px_16px_rgba(234,88,12,0.06)] text-slate-900 font-bold scale-[1.01]"
                : "bg-slate-50/80 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-white select-none shadow-xs"
            }`}
          >
            <Music className="w-4 h-4 text-brand-orange" />
            <span className="font-display font-semibold text-xs">2. 傅里叶级数谐振重构</span>
            <span className="text-[10px] text-slate-400 font-mono">Fourier Series Synth</span>
          </button>
        </div>

        {/* Art controls */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider font-mono font-bold">
              调和常数微调控制舱
            </span>
            <Settings className="w-4 h-4 text-slate-450" />
          </div>

          {activeArt === "lorenz" ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600 font-mono">普兰特常数 (Prandtl - σ):</span>
                  <span className="text-brand-orange font-bold font-mono">{sigma}</span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={25.0}
                  step={0.5}
                  value={sigma}
                  onChange={(e) => setSigma(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-brand-orange"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-medium border-t border-slate-50 pt-2.5">
                  <span className="text-slate-600 font-mono">瑞利对流系数 (Rayleigh - ρ):</span>
                  <span className="text-brand-orange font-bold font-mono">{rho}</span>
                </div>
                <input
                  type="range"
                  min={10.0}
                  max={40.0}
                  step={0.5}
                  value={rho}
                  onChange={(e) => setRho(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-brand-orange"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-medium border-t border-slate-50 pt-2.5">
                  <span className="text-slate-600 font-mono">尺度耗散阻尼 (Beta - β):</span>
                  <span className="text-brand-orange font-bold font-mono">{beta}</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={5.0}
                  step={0.1}
                  value={beta}
                  onChange={(e) => setBeta(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-brand-orange"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600 font-sans">傅里叶正弦级数叠加阶数 (n):</span>
                  <span className="text-brand-orange font-mono font-bold text-xs bg-brand-orange/10 px-2 py-0.5 rounded">
                    {harmonics} 阶谐弦子
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={24}
                  step={1}
                  value={harmonics}
                  onChange={(e) => setHarmonics(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                />
                <span className="text-[10px] text-slate-400 leading-normal font-sans">
                  基于微元叠加极值（即吉布斯拟合逼近），高频率的正弦重叠项越多，$n \rightarrow \infty$ 时合成出的波动越发陡直，不可思议地合拢为完全垂直的物理‘方波’。
                </span>
              </div>
            </div>
          )}

          {/* Web audio activation controller */}
          <div className="p-3.5 bg-slate-100/60 rounded-xl border border-slate-200 mt-2">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h5 className="text-xs font-bold text-slate-800">激活公式交响声流引擎</h5>
                <p className="text-[10px] text-slate-400 mt-0.5 font-sans">将微积分切变量实时变换物理正弦声呐（20Hz - 20KHz）</p>
              </div>
              <button
                onClick={handleToggleAudio}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isAudioOn
                    ? "bg-red-50 border border-red-200 text-red-650"
                    : "bg-brand-orange/10 border border-brand-orange/40 hover:bg-brand-orange/20 text-brand-orange"
                }`}
              >
                {isAudioOn ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" /> 关闭声场
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" /> 开启声场
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Drawing Plot Screen */}
      <div className="lg:col-span-7 flex flex-col gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col">
          <div className="flex justify-between items-center border-b border-slate-150 pb-3 mb-3 text-xs font-mono text-slate-505">
            <span>连续变化动态示波器</span>
            <span className="text-brand-orange font-semibold font-mono">
              {activeArt === "lorenz" && "洛伦兹混沌系统轨迹 (X, Y, Z)"}
              {activeArt === "fourier_harmonic" && "傅里叶三角级数叠加合成"}
            </span>
          </div>

          <div className="w-full p-2 bg-slate-50 flex items-center justify-center rounded-xl border border-slate-200/60 overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              width={560}
              height={300}
              className="max-w-full bg-white rounded-lg shadow-xs border border-slate-200/50"
            />
          </div>

          {activeArt === "lorenz" ? (
            <div className="mt-3 p-4 bg-slate-50/85 border border-slate-200 rounded-xl text-slate-700 shadow-xs">
              <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 mb-3 text-slate-800 font-medium">
                <Sparkles className="w-4 h-4 text-brand-orange animate-pulse" />
                <span className="text-xs font-semibold">洛伦兹系统动力方程</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-5 flex justify-center bg-white py-3 px-4 rounded-lg border border-slate-200 shadow-inner">
                  <MathFormula math="\begin{cases} \dot{x} = \sigma (y - x) \\ \dot{y} = x (\rho - z) - y \\ \dot{z} = x y - \beta z \end{cases}" block={true} className="text-brand-orange font-bold text-sm" />
                </div>
                <div className="md:col-span-7 grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-sans border-l border-slate-200 pl-4 h-full flex flex-col justify-center">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-700 block">x', y', z'</span>
                    <span className="text-slate-500">坐标对时间变化速率 (速度)</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-700 block">σ = {sigma}</span>
                    <span className="text-slate-500">普兰特常数 (流体粘性)</span>
                  </div>
                  <div className="space-y-0.5 border-t border-slate-100 pt-1.5">
                    <span className="font-semibold text-slate-700 block">ρ = {rho}</span>
                    <span className="text-slate-500">瑞利对流系数 (温度对流)</span>
                  </div>
                  <div className="space-y-0.5 border-t border-slate-100 pt-1.5">
                    <span className="font-semibold text-slate-700 block">β = {beta}</span>
                    <span className="text-slate-500">空间耗散阻尼 (能损阻阨)</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 p-4 bg-slate-50/85 border border-slate-200 rounded-xl text-slate-700 shadow-xs">
              <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 mb-3 text-slate-800 font-medium">
                <Sparkles className="w-4 h-4 text-brand-orange animate-pulse" />
                <span className="text-xs font-semibold">级数叠加与吉布斯谱波</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-5 flex justify-center bg-white py-4 px-4 rounded-lg border border-slate-200 shadow-inner">
                  <MathFormula math="f(t) = \frac{4}{\pi} \sum_{k=1}^{n} \frac{\sin((2k-1)t)}{2k-1}" block={true} className="text-brand-orange font-bold text-sm" />
                </div>
                <div className="md:col-span-7 grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-sans border-l border-slate-200 pl-4 h-full flex flex-col justify-center">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-700 block">f(t)</span>
                    <span className="text-slate-500">合成方波的瞬时高度值</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-700 block">n = {harmonics}</span>
                    <span className="text-slate-500">叠加总项数 / 谐波叠加阶数</span>
                  </div>
                  <div className="space-y-0.5 border-t border-slate-100 pt-1.5">
                    <span className="font-semibold text-slate-700 block">2k - 1</span>
                    <span className="text-slate-500">仅叠加奇数次倍频谐波</span>
                  </div>
                  <div className="space-y-0.5 border-t border-slate-100 pt-1.5">
                    <span className="font-semibold text-slate-700 block">4 / (π * (2k-1))</span>
                    <span className="text-slate-500">对应谐波的级数衰减缩幅</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Educational foot metadata */}
        <div className="p-4 rounded-xl bg-slate-100/50 border border-slate-205 text-xs text-slate-505 leading-relaxed font-sans shadow-xs pl-3.5 border-l-2 border-brand-orange">
          {activeArt === "lorenz" ? (
            <p>
              <strong className="text-slate-800 font-bold">【混沌引流微积分视角】：</strong> 洛伦兹吸引子是最经典、著名的气象常微分流变极值方程。尽管迭代动力学是100%纯代数确定的，但初始测量条件的细微极微变动，都会在微分积分的高阶链式计算后呈现无限大指数级溢出。这就是举世皆知的“蝴蝶效应”（Butterfly Effect）。微积分在这里成功探索出了隐藏在非线性混沌漩涡内部，牢牢统治着时空走向的优雅确定性。
            </p>
          ) : (
            <p>
              <strong className="text-slate-800 font-bold">【级数合成与吉布斯美学】：</strong> 傅里叶级数证明：我们今天物理世间一切嘈杂、紊乱、粗糙的不连续方波段或锯齿声，在多维函数积分叠加态下，全部能够由最平滑、圆润的纯正弦函数微元组合得来。这是一幅完美的关于牛顿“连续变化拼凑万物”的纯粹几何证明。也是我们现在电磁波滤波与和弦调音的核心法则。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
