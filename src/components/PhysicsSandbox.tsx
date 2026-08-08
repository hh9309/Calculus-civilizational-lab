/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { Play, Square, RotateCcw, AlertTriangle, ShieldCheck, Zap, Activity, Gauge, Sparkles, RefreshCw } from "lucide-react";
import MathFormula from "./MathFormula";

type SimCategory = "tacoma" | "kepler" | "boiler";

export default function PhysicsSandbox() {
  const [activeSim, setActiveSim] = useState<SimCategory>("tacoma");
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0);
  const timeRef = useRef<number>(0);

  // Autoplay and Carousel configurations
  const [isAutoplay, setIsAutoplay] = useState<boolean>(true);
  const [carouselTimeLeft, setCarouselTimeLeft] = useState<number>(25); // 25 seconds per scenario
  const [autoResetCountdown, setAutoResetCountdown] = useState<number | null>(null);

  // Tacoma parameters (tweak defaults to represent the normal/stable state first)
  const [damping, setDamping] = useState<number>(0.20); // c
  const [windForce, setWindForce] = useState<number>(0.4); // F0 - lower force keeps it peaceful by default
  const [resonanceFreq, setResonanceFreq] = useState<number>(0.6); // omega - out of resonance range (1.0Hz) initially
  const [bridgeStress, setBridgeStress] = useState<number>(0);

  // Kepler parameters
  const [initSpeed, setInitSpeed] = useState<number>(2.4);
  const [gravConstant, setGravConstant] = useState<number>(4.0);
  const keplerHistory = useRef<Array<{ x: number; y: number }>>([]);

  // Boiler parameters
  const [heatInflow, setHeatInflow] = useState<number>(30); // Q_in: 30
  const [coolingRate, setCoolingRate] = useState<number>(45); // C_out: 45 (this yields a perfect normal equilibrium: 30*0.15 = 45*0.1)
  const [boilerPressure, setBoilerPressure] = useState<number>(50);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Numerical state variables for ODE solver
  const simState = useRef({
    // Tacoma State
    y: 0,       // displacement
    v: 0,       // velocity
    // Kepler State
    qx: 120,    // position x
    qy: 0,      // position y
    vx: 0,      // velocity x
    vy: 2.4,    // velocity y (stable circular for 120 radial coordinate)
    // Boiler State
    pressure: 50,
    temp: 200
  });

  // Reset physics states
  const handleReset = (simToReset = activeSim) => {
    setIsFailed(false);
    setTime(0);
    timeRef.current = 0;
    setAutoResetCountdown(null);
    
    // Set parameters back to stable, normal defaults depending on the active simulation selected
    if (simToReset === "tacoma") {
      setDamping(0.20);
      setWindForce(0.4);
      setResonanceFreq(0.6);
      setBridgeStress(0);
    } else if (simToReset === "kepler") {
      setInitSpeed(2.4);
      setGravConstant(4.0);
    } else if (simToReset === "boiler") {
      setHeatInflow(30);
      setCoolingRate(45);
      setBoilerPressure(50);
    }

    simState.current = {
      y: 0,
      v: 0,
      qx: 120,
      qy: 0,
      vx: 0,
      vy: simToReset === "kepler" ? 2.4 : 2.2,
      pressure: 50,
      temp: 180
    };

    keplerHistory.current = [];
  };

  // Switch simulation triggers reset of core constants
  useEffect(() => {
    handleReset(activeSim);
    setCarouselTimeLeft(25); // reset carousel timer
  }, [activeSim]);

  // Handle automatic simulation rotation or failure auto-reset countdown
  useEffect(() => {
    let intervalId: any = null;
    if (isAutoplay) {
      intervalId = setInterval(() => {
        if (isFailed) {
          // If simulation fails, count down to auto-restart
          setAutoResetCountdown(prev => {
            if (prev === null) return 3;
            if (prev <= 1) {
              handleReset();
              return null;
            }
            return prev - 1;
          });
        } else if (isRunning) {
          // If simulation runs normally, tick down the carousel timer
          setCarouselTimeLeft(prev => {
            if (prev <= 1) {
              // Cycle to next physical simulation
              setActiveSim(current => {
                const order: SimCategory[] = ["tacoma", "kepler", "boiler"];
                const nextIdx = (order.indexOf(current) + 1) % order.length;
                return order[nextIdx];
              });
              return 25; // reload rotation time
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      setAutoResetCountdown(null);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoplay, isFailed, isRunning]);

  // Differential Equation Numerical Solvers & Visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const dt = 0.08; // time-step for integration

    const render = () => {
      let currentT = timeRef.current;
      if (isRunning && !isFailed) {
        timeRef.current += dt;
        currentT = timeRef.current;
        setTime(timeRef.current);

        // 1. Solving TACOMA ODE:
        // Equation: y'' + c/m y' + k/m y = F0 * cos(w * t)
        // Let mass m = 1, spring stiffness k = 1.2
        if (activeSim === "tacoma") {
          const k = 1.2;
          const y = simState.current.y;
          const v = simState.current.v;
          
          // Outer Force term representing wind aerodynamics
          const force = windForce * Math.cos(resonanceFreq * currentT);
          const accel = force - damping * v - k * y;
          
          // Euler-Cromer integration step:
          const nextV = v + accel * dt;
          const nextY = y + nextV * dt;
          
          simState.current.v = nextV;
          simState.current.y = nextY;

          // Tacoma stress corresponds to peak torsion
          const currentStress = Math.abs(nextY) * 45;
          setBridgeStress(currentStress);

          if (currentStress > 105) {
            setIsFailed(true);
          }
        }

        // 2. Solving KEPLER Gravity integration:
        // Position q = (qx, qy), Velocity v = (vx, vy)
        // ODE: q'' = - G * M * q / ||q||^3
        else if (activeSim === "kepler") {
          let cx = simState.current.qx;
          let cy = simState.current.qy;
          let cvx = simState.current.vx;
          let cvy = simState.current.vy;

          // Sub-stepping for ultra-high numerical accuracy
          const subSteps = 10;
          const subDt = dt / subSteps;
          for (let step = 0; step < subSteps; step++) {
            const rSq = cx * cx + cy * cy;
            const rLen = Math.sqrt(rSq);
            if (rLen < 1.0) break; // prevent division by zero

            // Numerical factor 172.8 makes GM = 4.0 and Vy = 2.4 perfectly circular at r = 120
            const ax = - (gravConstant * 172.8 * cx) / (rSq * rLen);
            const ay = - (gravConstant * 172.8 * cy) / (rSq * rLen);

            // Symplectic Euler integration (conserves phase space area & total energy)
            cvx += ax * subDt;
            cvy += ay * subDt;
            cx += cvx * subDt;
            cy += cvy * subDt;
          }

          simState.current.qx = cx;
          simState.current.qy = cy;
          simState.current.vx = cvx;
          simState.current.vy = cvy;

          // Record trajectory trail for visualization
          keplerHistory.current.push({ x: cx, y: cy });
          if (keplerHistory.current.length > 80) {
            keplerHistory.current.shift();
          }

          // Detect collapse / escape
          const radius = Math.sqrt(cx * cx + cy * cy);
          if (radius < 18 || radius > 230) {
            setIsFailed(true);
          }
        }

        // 3. Solving BOILER fluid thermal pressure differential equation:
        // dP/dt = alpha * HeatInflow - beta * CoolingRate
        else if (activeSim === "boiler") {
          const currentP = simState.current.pressure;
          const change = (heatInflow * 0.15) - (coolingRate * 0.1) + Math.sin(currentT) * 0.5;
          const nextP = Math.max(10, currentP + change * dt * 8);
          
          simState.current.pressure = nextP;
          setBoilerPressure(nextP);

          if (nextP > 115) {
            setIsFailed(true);
          }
        }
      }

      // Draw Simulation Frame (pained beautiful white paper style)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Simple elegant slate blueprint grid pattern
      ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 25) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += 25) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      // DRAW TACOMA
      if (activeSim === "tacoma") {
        const yOffset = simState.current.y * 35;
        
        ctx.save();
        ctx.translate(width / 2, height / 2);

        // Draw background wind particles
        ctx.fillStyle = "rgba(2, 132, 199, 0.12)"; // soft sky blue breezes
        for (let i = 0; i < 5; i++) {
          const pSpeed = (currentT * 15 + i * 40) % 250;
          ctx.fillRect(-120 + pSpeed, -50 + i * 20, 15, 1);
        }

        // Left & Right Pillars
        ctx.strokeStyle = "#64748b"; // slate-500
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(-150, -80); ctx.lineTo(-150, 100);
        ctx.moveTo(150, -80); ctx.lineTo(150, 100);
        ctx.stroke();

        // Main Suspension Cables (curved)
        ctx.strokeStyle = "rgba(148, 163, 184, 0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-150, -60);
        ctx.quadraticCurveTo(0, yOffset - 10, 150, -60);
        ctx.stroke();

        // Hanging strings
        ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
        ctx.lineWidth = 1;
        for (let sx = -140; sx <= 140; sx += 20) {
          const t = (sx + 150) / 300;
          const cableY = -60 * (1 - t) * (1 - t) + 2 * (1 - t) * t * (yOffset - 10) - 60 * t * t;
          ctx.beginPath();
          ctx.moveTo(sx, cableY);
          ctx.lineTo(sx, yOffset);
          ctx.stroke();
        }

        // Bridge Deck slab with twisting angle based on displacement/speed representation
        const twistAngle = (simState.current.y * 0.15); // angle in radians
        ctx.rotate(twistAngle);

        // Deck structure
        ctx.fillStyle = isFailed ? "#ef4444" : "#ea580c"; // bright solid flame orange or blood red
        ctx.strokeStyle = "#0284c7";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(-130, yOffset - 8, 260, 16);
        ctx.fill();
        ctx.stroke();

        // Grid details inside deck
        ctx.strokeStyle = "rgba(2, 132, 199, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let gx = -120; gx <= 120; gx += 20) {
          ctx.moveTo(gx, yOffset - 8);
          ctx.lineTo(gx, yOffset + 8);
        }
        ctx.stroke();

        ctx.restore();

        // Stats Overlay (safe dark slate labels on white)
        ctx.fillStyle = "#1e293b";
        ctx.font = "bold 11px var(--font-mono)";
        ctx.fillText(`结构侧向挠度 (y): ${simState.current.y.toFixed(3)} m`, 20, 30);
        ctx.fillText(`瞬时震动速度 (dy/dt): ${simState.current.v.toFixed(3)} m/s`, 20, 50);
      }

      // DRAW KEPLER Orbit
      else if (activeSim === "kepler") {
        const cx = width / 2;
        const cy = height / 2;

        // Draw Central Massive Sun
        ctx.fillStyle = "#ea580c"; // glowing bright core
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow

        // Star core rings
        ctx.strokeStyle = "rgba(234, 88, 12, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, 24, 0, Math.PI * 2);
        ctx.stroke();

        // Draw Kepler orbit history trail (glowing sky-blue line)
        if (keplerHistory.current.length > 1) {
          ctx.lineWidth = 1.8;
          for (let i = 1; i < keplerHistory.current.length; i++) {
            const pt1 = keplerHistory.current[i - 1];
            const pt2 = keplerHistory.current[i];
            const alpha = i / keplerHistory.current.length;
            ctx.strokeStyle = `rgba(2, 132, 199, ${alpha * 0.65})`;
            ctx.beginPath();
            ctx.moveTo(cx + pt1.x, cy + pt1.y);
            ctx.lineTo(cx + pt2.x, cy + pt2.y);
            ctx.stroke();
          }
        }

        // Planet coordinate
        const rx = cx + simState.current.qx;
        const ry = cy + simState.current.qy;

        // Trace current orbital radial coordinate line
        ctx.strokeStyle = "rgba(148, 163, 184, 0.18)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.sqrt(simState.current.qx*simState.current.qx + simState.current.qy*simState.current.qy), 0, Math.PI*2);
        ctx.stroke();

        // Orbit velocity vector line (sky-blue)
        ctx.strokeStyle = "#0284c7";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx + simState.current.vx * 15, ry + simState.current.vy * 15);
        ctx.stroke();

        // Planet orbits gravity indicator
        ctx.fillStyle = "#0284c7";
        ctx.beginPath();
        ctx.arc(rx, ry, 7, 0, Math.PI * 2);
        ctx.fill();

        // Kepler text stats
        ctx.fillStyle = "#1e293b";
        ctx.font = "bold 11px var(--font-mono)";
        const currentRadius = Math.sqrt(simState.current.qx*simState.current.qx + simState.current.qy*simState.current.qy);
        ctx.fillText(`向极轨道半径 (r): ${currentRadius.toFixed(1)} AU`, 20, 30);
        ctx.fillText(`星体切向瞬时速度 (v): ${Math.sqrt(simState.current.vx*simState.current.vx + simState.current.vy*simState.current.vy).toFixed(2)} km/s`, 20, 50);
      }

      // DRAW BOILER (beautiful warm fluid & analog gauge)
      else if (activeSim === "boiler") {
        ctx.save();
        ctx.translate(width / 2 - 40, height / 2); // shift slightly left to fit dial gauge

        // Boiler external cylinder container (light boundary)
        const currentP = simState.current.pressure;
        const colorIntensity = Math.min(240, Math.floor(currentP * 2));
        ctx.fillStyle = `rgb(${colorIntensity}, 225, ${255 - colorIntensity / 2})`; // bright pressure liquid coloring
        ctx.strokeStyle = "#1e293b"; // dark charcoal steel border
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.roundRect(-60, -80, 120, 160, 15);
        ctx.fill();
        ctx.stroke();

        // Flame element indicators underneath
        ctx.fillStyle = "#ea580c";
        for (let i = -50; i <= 50; i += 25) {
          ctx.beginPath();
          ctx.moveTo(i, 85);
          ctx.lineTo(i - 8, 100);
          ctx.lineTo(i + 8, 100);
          ctx.fill();
        }

        // Internal boiling dynamic pressure particles
        ctx.fillStyle = "rgba(2, 132, 199, 0.45)"; // oceanic bubbles
        const numBubbles = Math.floor(currentP / 3.2);
        for (let b = 0; b < numBubbles; b++) {
          const particleY = 60 - ((currentT * 8 + b * 20) % 130);
          const particleX = Math.sin(currentT + b) * 35;
          ctx.beginPath();
          ctx.arc(particleX, particleY, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // -- DRAW PROFESSIONAL GAUGE ON RIGHT --
        const dialX = width - 110;
        const dialY = height / 2;
        const dialRadius = 45;

        // Casing ring
        ctx.fillStyle = "#334155"; // slate-700
        ctx.beginPath();
        ctx.arc(dialX, dialY, dialRadius + 5, 0, Math.PI * 2);
        ctx.fill();

        // White background face
        ctx.fillStyle = "#f8fafc";
        ctx.beginPath();
        ctx.arc(dialX, dialY, dialRadius, 0, Math.PI * 2);
        ctx.fill();

        // Ticks
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 1.5;
        for (let angle = -Math.PI * 0.8; angle <= Math.PI * 0.8; angle += Math.PI * 0.25) {
          const startX = dialX + Math.cos(angle) * (dialRadius - 8);
          const startY = dialY + Math.sin(angle) * (dialRadius - 8);
          const endX = dialX + Math.cos(angle) * dialRadius;
          const endY = dialY + Math.sin(angle) * dialRadius;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }

        // Warning red zone
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(dialX, dialY, dialRadius - 3, Math.PI * 0.5, Math.PI * 0.8);
        ctx.stroke();

        // Needle angle calculation: Map pressure 0 to 120 KPa to angle range [-Math.PI * 0.8, Math.PI * 0.8]
        const maxDialP = 120;
        const clampedP = Math.max(0, Math.min(maxDialP, currentP));
        const needleAngle = -Math.PI * 0.8 + (clampedP / maxDialP) * (Math.PI * 1.6);

        ctx.strokeStyle = "#ef4444"; // red needle pointer
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(dialX, dialY);
        ctx.lineTo(dialX + Math.cos(needleAngle) * (dialRadius - 7), dialY + Math.sin(needleAngle) * (dialRadius - 7));
        ctx.stroke();

        // Needle hub cap
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(dialX, dialY, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Value text
        ctx.fillStyle = "#0284c7";
        ctx.font = "bold 9px var(--font-mono)";
        ctx.textAlign = "center";
        ctx.fillText(`${clampedP.toFixed(1)} kPa`, dialX, dialY + 28);
        ctx.fillStyle = "#475569";
        ctx.fillText("PRESSURE", dialX, dialY - 18);
        ctx.textAlign = "left"; // reset

        // Text labels for boiler
        ctx.fillStyle = "#1e293b";
        ctx.font = "bold 11px var(--font-mono)";
        ctx.fillText(`高炉热交换通量 dp/dt = (α·Q - β·C)`, 20, 30);
        ctx.fillText(`核心控制饱和蒸汽压 (P): ${currentP.toFixed(1)} KPa`, 20, 50);
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, activeSim, damping, windForce, resonanceFreq, gravConstant, heatInflow, coolingRate, isFailed]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="physics-sandbox">
      {/* Parameter Control Panel */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col gap-3 shadow-xs">
          <span className="text-[10px] text-brand-orange font-mono font-bold tracking-wide uppercase flex items-center justify-between">
            <span>微积分在人类工程中的核心映射</span>
            {isAutoplay && (
              <span className="flex items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded-full animate-pulse">
                <Sparkles className="w-2.5 h-2.5" /> 自动巡航启
              </span>
            )}
          </span>
          
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-slate-800 font-mono">实时数值控制仿真舱</h3>
            {/* Toggle Autoplay */}
            <button
              onClick={() => {
                setIsAutoplay(prev => !prev);
                setCarouselTimeLeft(25);
              }}
              className={`px-2 py-1 text-[10px] font-mono border rounded-lg transition-all duration-300 flex items-center gap-1 cursor-pointer focus:outline-none ${
                isAutoplay
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 font-bold"
                  : "bg-slate-50 border-slate-300 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
              title="自动循环播放各个仿真场景"
            >
              <RefreshCw className={`w-3 h-3 ${isAutoplay ? "animate-spin" : ""}`} style={{ animationDuration: "6s" }} />
              <span>{isAutoplay ? `轮播 (${carouselTimeLeft}s)` : "自动轮播关"}</span>
            </button>
          </div>
          
          {/* Simulation Selectors */}
          <div className="grid grid-cols-3 gap-2 mt-1 select-none">
            <button
              onClick={() => setActiveSim("tacoma")}
              className={`p-2 rounded-lg text-center font-display text-[11px] font-semibold transition-all border cursor-pointer ${
                activeSim === "tacoma"
                  ? "bg-brand-orange/10 border-brand-orange/40 text-brand-orange"
                  : "bg-slate-50 border-slate-205 text-slate-500 hover:text-slate-850 hover:bg-slate-100"
              }`}
            >
              塔科马大桥
            </button>
            <button
              onClick={() => setActiveSim("kepler")}
              className={`p-2 rounded-lg text-center font-display text-[11px] font-semibold transition-all border cursor-pointer ${
                activeSim === "kepler"
                  ? "bg-brand-orange/10 border-brand-orange/40 text-brand-orange"
                  : "bg-slate-50 border-slate-205 text-slate-500 hover:text-slate-850 hover:bg-slate-100"
              }`}
            >
              天体轨迹
            </button>
            <button
              onClick={() => setActiveSim("boiler")}
              className={`p-2 rounded-lg text-center font-display text-[11px] font-semibold transition-all border cursor-pointer ${
                activeSim === "boiler"
                  ? "bg-brand-orange/10 border-brand-orange/40 text-brand-orange"
                  : "bg-slate-50 border-slate-205 text-slate-500 hover:text-slate-850 hover:bg-slate-100"
              }`}
            >
              锅炉换热器
            </button>
          </div>
        </div>

        {/* Dynamics inputs based on selected tab */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col gap-4 shadow-sm">
          <h4 className="text-xs text-brand-orange font-mono font-semibold border-b border-slate-100 pb-2">
            {activeSim === "tacoma" && "阻尼与强迫振动模型 (二阶ODE)"}
            {activeSim === "kepler" && "万有引力引力积分模型 (偏微分等算)"}
            {activeSim === "boiler" && "对流传热控制模型 (边界极值条件)"}
          </h4>

          {activeSim === "tacoma" && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600">悬索结构阻尼系数 (c)</span>
                  <span className={`${damping < 0.1 ? "text-red-500" : "text-brand-cyan"}`}>{damping}</span>
                </div>
                <input
                  type="range"
                  min={0.02}
                  max={0.5}
                  step={0.01}
                  value={damping}
                  onChange={(e) => setDamping(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-brand-cyan"
                />
                <span className="text-[10px] text-slate-400">阻尼不足时，大风共振将吞没整个钢桥躯壳。</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-medium border-t border-slate-50 pt-2.5">
                  <span className="text-slate-600">气流周期激励力 (F₀)</span>
                  <span className="text-brand-cyan">{windForce}</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2.5}
                  step={0.1}
                  value={windForce}
                  onChange={(e) => setWindForce(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-brand-cyan"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-medium border-t border-slate-50 pt-2.5">
                  <span className="text-slate-600">风吹自激共振频率 (ω)</span>
                  <span className="text-brand-cyan">{resonanceFreq} Hz</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2.0}
                  step={0.05}
                  value={resonanceFreq}
                  onChange={(e) => setResonanceFreq(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-brand-cyan"
                />
                <span className="text-[10px] text-slate-400">接近大桥原固频 1.0Hz 时会发生指数发散形位移！</span>
              </div>
            </div>
          )}

          {activeSim === "kepler" && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600">星体切向初始速度 (v₀)</span>
                  <span className="text-blue-600 font-semibold">{initSpeed} km/s</span>
                </div>
                <input
                  type="range"
                  min={1.2}
                  max={3.4}
                  step={0.1}
                  value={initSpeed}
                  onChange={(e) => setInitSpeed(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-blue-600"
                />
                <span className="text-[10px] text-slate-405">速度过低坠毁入恒星热核，速度过高逃逸入无界虚无。</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-medium border-t border-slate-50 pt-2.5">
                  <span className="text-slate-600">恒星重力场势能核心质量 (GM)</span>
                  <span className="text-blue-600 font-semibold">{gravConstant}</span>
                </div>
                <input
                  type="range"
                  min={1.5}
                  max={7.0}
                  step={0.2}
                  value={gravConstant}
                  onChange={(e) => setGravConstant(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          )}

          {activeSim === "boiler" && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600">热源对流换热输入 (Q_in)</span>
                  <span className="text-amber-600 font-semibold">{heatInflow} J/s</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={80}
                  step={1}
                  value={heatInflow}
                  onChange={(e) => setHeatInflow(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-amber-600"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-medium border-t border-slate-50 pt-2.5">
                  <span className="text-slate-600">安全泄压阀耗散排气 (C_out)</span>
                  <span className="text-amber-600 font-semibold">{coolingRate} J/s</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={60}
                  step={1}
                  value={coolingRate}
                  onChange={(e) => setCoolingRate(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-amber-600"
                />
                <span className="text-[10px] text-slate-400">当热耗平衡失利，核心炉压超过 115 KPa 发生泄气碎裂。</span>
              </div>
            </div>
          )}

          {/* Dynamic math formula panel describing current ODE physics */}
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex flex-col gap-1.5 mt-2">
            <span className="text-[10px] text-slate-400 font-mono font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-orange animate-pulse" />
              {activeSim === "tacoma" && "卡尔当-比奥特气动激励二阶微分方程 (Tacoma ODE)"}
              {activeSim === "kepler" && "牛顿向心万有引力常微分方程群 (Kepler ODE)"}
              {activeSim === "boiler" && "对流相传热极限锅炉炉压方程 (Boiler ODE)"}
            </span>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex justify-center">
              {activeSim === "tacoma" && (
                <MathFormula math="m \frac{d^2y}{dt^2} + c \frac{dy}{dt} + ky = F_0 \cos(\omega t)" block={true} className="text-cyan-400 text-xs font-bold" />
              )}
              {activeSim === "kepler" && (
                <MathFormula math="\frac{d^2 \mathbf{r}}{dt^2} = -G \frac{M}{r^3} \mathbf{r}" block={true} className="text-blue-400 text-xs font-bold" />
              )}
              {activeSim === "boiler" && (
                <MathFormula math="\frac{dp}{dt} = \alpha \cdot Q_{in} - \beta \cdot C_{cooling}" block={true} className="text-amber-400 text-xs font-bold" />
              )}
            </div>
            <span className="text-[9px] text-slate-500 font-sans leading-normal">
              {activeSim === "tacoma" && "二阶位移振幅(y)在负刚阻尼激励下呈现指数不连续发散颤振。"}
              {activeSim === "kepler" && "若运动速度(v₀)与重力场(GM)偏离，向心引力将主导轨道突变与逃逸。"}
              {activeSim === "boiler" && "换热能量一阶温压上升速率由对流注入与安全排热阀差值对时间(t)求导并积分。"}
            </span>
          </div>

          {/* Engine control buttons */}
          <div className="flex gap-2 mt-2 pt-1 border-t border-slate-100">
            {isRunning ? (
              <button
                onClick={() => setIsRunning(false)}
                className="flex-1 py-1.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 text-xs rounded-lg font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer select-none"
              >
                <Square className="w-3.5 h-3.5" /> 挂起常微分方程
              </button>
            ) : (
              <button
                onClick={() => setIsRunning(true)}
                className="flex-1 py-1.5 bg-emerald-50 border border-emerald-250 hover:bg-emerald-100 text-emerald-700 text-xs rounded-lg font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer select-none"
              >
                <Play className="w-3.5 h-3.5 animate-pulse text-emerald-600" /> 唤醒微积分引擎
              </button>
            )}

            <button
              onClick={() => handleReset()}
              className="py-1.5 px-3 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-500 hover:text-slate-705 text-xs rounded-lg transition flex items-center justify-center gap-1 cursor-pointer select-none"
              title="物理常系数/坐标还原"
            >
              <RotateCcw className="w-3.5 h-3.5" /> 重载
            </button>
          </div>
        </div>
      </div>

      {/* Numerical Screen & Dynamic Indicator */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="relative rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs flex flex-col">
          
          {/* Header Panel */}
          <div className="px-5 py-3.5 border-b border-slate-150 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-orange animate-pulse" />
              <span className="text-xs font-mono text-slate-600 font-medium">
                微分方程模拟示波器 | 时间 t = {time.toFixed(2)}s
                {isAutoplay && (
                  <span className="ml-2 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] rounded-md font-bold">
                    自动巡航中 ({carouselTimeLeft}s 后切场景)
                  </span>
                )}
              </span>
            </div>
            
            {/* Dynamic disaster status lamp */}
            {isFailed ? (
              <span className="px-2.5 py-1 bg-red-50 border border-red-200 text-red-650 text-[10px] rounded-full flex items-center gap-1 font-bold tracking-wider animate-bounce">
                <AlertTriangle className="w-3 h-3 text-red-500" /> 
                {autoResetCountdown !== null ? `${autoResetCountdown}s 后自动安全重置` : "结构出现严重共振应力灾难"}
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] rounded-full flex items-center gap-1 font-semibold font-mono">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> 二阶微分状态平稳
              </span>
            )}
          </div>

          {/* Actual canvas */}
          <div className="w-full p-4 bg-slate-50 flex items-center justify-center border-b border-slate-100">
            <canvas
              ref={canvasRef}
              width={640}
              height={320}
              className="max-w-full bg-white rounded-xl shadow-xs border border-slate-200/50"
            />
          </div>

          {/* Tacoma disaster panel overlay */}
          {isFailed && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6 transition-all duration-300 z-10">
              <AlertTriangle className="w-12 h-12 text-red-500 mb-2 animate-bounce" />
              <h3 className="font-display font-bold text-lg text-red-650 mb-1">
                {activeSim === "tacoma" && "塔科马大桥完全由于气动力颤振而坍塌！"}
                {activeSim === "kepler" && "行星冲过洛希极限坠毁或逃逸远走！"}
                {activeSim === "boiler" && "蒸汽内胆超出抗压极限：发生核心泄漏！"}
              </h3>
              <p className="max-w-md text-xs text-slate-500 leading-relaxed mb-4">
                {activeSim === "tacoma" && "在气压交变下，当结构阻尼(c)由于非线性颤振无法平衡激励风力(F₀)，动力解位移发生突变溢出。钢梁应力拉升至 100% 以上。"}
                {activeSim === "kepler" && "天体初始运动角速度与恒星重力吸引势能积分失去契合，无法达成二层向极平衡，直接坠毁或者偏离入无限远轨。"}
                {activeSim === "boiler" && "高炉熔炼吸热通量远远超出了散热冷却因数所划定的边界。连续锅炉炉压极值突破了受拉容器力学的承压底线。"}
              </p>
              
              <div className="flex flex-col gap-2 items-center">
                {autoResetCountdown !== null && (
                  <span className="text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5 animate-pulse mb-1">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> 巡航自愈保护触发：将在 {autoResetCountdown} 秒后恢复稳定状态
                  </span>
                )}
                <button
                  onClick={() => handleReset()}
                  className="bg-brand-orange text-xs text-white px-5 py-2.5 rounded hover:shadow-md transition font-semibold flex items-center gap-1.5 cursor-pointer font-mono"
                >
                  <Zap className="w-3.5 h-3.5" /> 立即手动复位重新计算 (Restart)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic educational caption explaining the math */}
        <div className="p-4 rounded-xl bg-slate-100/50 border border-slate-200 flex flex-col sm:flex-row justify-between gap-4 shadow-xs">
          <div className="flex flex-col gap-1 max-w-lg">
            <h5 className="font-display font-bold text-xs text-slate-800">
              学术指点：为何直觉容易崩塌，我们需要偏微分动力控制？
            </h5>
            <p className="text-[11px] text-slate-505 leading-relaxed">
              {activeSim === "tacoma" && "悬索桥在大风下的摆动本质是气动力反馈引起的自发不稳定性。微积分二阶常微分方程将风阻变化率、结构刚度与位移变动（二阶导数 y''）结合起来，求出来的周期解析解揭示了气压气流周期性补给系统功的物理事实。现代桥梁结构包含高性能重力阻尼箱来化解灾难平衡。"}
              {activeSim === "kepler" && "恒星轨道运行本质上是经典的引力向极积分。利用开普勒矢量微分，将恒星重力引力微元和切向速度微元进行分割求积，借助高保真辛算法能使其完美稳定椭圆运行。缺失此微分算子，人类就无法发射卫星。"}
              {activeSim === "boiler" && "钢炉换热模型刻画了热力学介质能量在传热场上的流动投影。蒸汽温度、对流系数和流变改变，将瞬间重塑状态偏微分数值。系统正是通过对一阶通量变化率(dp/dt)进行积分控制来判定报警，防范气防失效爆沸。"}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-1 shrink-0 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm min-w-[140px]">
            <span className="text-[9px] text-slate-400 font-mono">数学状态实时指标:</span>
            {activeSim === "tacoma" && (
              <>
                <span className={`text-xl font-mono font-bold ${bridgeStress > 85 ? "text-red-500 animate-pulse" : "text-brand-orange"}`}>
                  {bridgeStress.toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-400 font-mono">应力极限系数: 100%</span>
              </>
            )}
            {activeSim === "kepler" && (
              <>
                <span className="text-xl font-mono font-bold text-blue-600">
                  {Math.abs(gravConstant * initSpeed * 12).toFixed(0)}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">引力量纲比 (G·M/v₀)</span>
              </>
            )}
            {activeSim === "boiler" && (
              <>
                <span className={`text-xl font-mono font-bold ${boilerPressure > 95 ? "text-red-500 animate-pulse" : "text-brand-orange"}`}>
                  {boilerPressure.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">极值预警: 115 KPa</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
