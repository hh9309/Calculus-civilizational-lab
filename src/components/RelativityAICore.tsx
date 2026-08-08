/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { Gauge, Milestone, Sparkles, RefreshCw, Eye, TrendingDown, BookOpen, Activity } from "lucide-react";
import MathFormula from "./MathFormula";

export default function RelativityAICore() {
  const [activeTab, setActiveTab] = useState<"gradient" | "maxwell">("gradient");
  const [isAutoplay, setIsAutoplay] = useState<boolean>(true);
  
  // Gradient Descent states
  const [learningRate, setLearningRate] = useState<number>(0.12);
  const [momentum, setMomentum] = useState<number>(0.6);
  const [surfaceType, setSurfaceType] = useState<"peaks" | "saddle">("peaks");
  const [epoch, setEpoch] = useState<number>(0);
  const [currentLoss, setCurrentLoss] = useState<number>(100);
  const [optimizerStatus, setOptimizerStatus] = useState<string>("就绪：准备进行高维鞍点寻找");
  const [lossHistory, setLossHistory] = useState<number[]>([]);
  const lossHistoryRef = useRef<number[]>([]);
  const [autoplayCountdown, setAutoplayCountdown] = useState<number | null>(null);

  // Maxwell states
  const [waveFrequency, setWaveFrequency] = useState<number>(1.5);
  const [permittivity, setPermittivity] = useState<number>(1.0); // epsilon
  const [leftFormulaCopied, setLeftFormulaCopied] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Offscreen canvas refs for caching the beautiful high-resolution loss heatmap terrain
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenDrawnTypeRef = useRef<string>("");

  // Gradient Flow particles vector field representation
  const streamParticles = useRef<Array<{
    x: number;
    y: number;
    speed: number;
    life: number;
    maxLife: number;
  }>>([]);

  // Gradient Ball path variables
  const ballPos = useRef({
    x: -1.6, // safe initial coordinates fully inside the screen bounds
    y: 1.1,
    vx: 0,
    vy: 0,
    path: [] as Array<{ x: number; y: number }>
  });

  const epochRef = useRef<number>(0);
  const currentLossRef = useRef<number>(100);

  // Mathematically defined terrain
  const getLossAndGradient = (x: number, y: number) => {
    if (surfaceType === "peaks") {
      // Peaks function logic (multi-minima)
      // Loss L = x^2 + y^2 - cos(3x) - cos(3y)
      const loss = (x * x + y * y - Math.cos(2.8 * x) - Math.cos(2.8 * y)) * 18 + 30;
      // analytical gradient of loss
      const gradX = (2 * x + 2.8 * Math.sin(2.8 * x)) * 18;
      const gradY = (2 * y + 2.8 * Math.sin(2.8 * y)) * 18;
      return { loss, gradX, gradY };
    } else {
      // Saddle point terrain: f(x, y) = 15*(x^2 - 0.5*y^2) + 40
      const loss = (x * x - 0.5 * y * y) * 15 + 40;
      const gradX = 2 * x * 15;
      const gradY = -1.0 * y * 15;
      return { loss, gradX, gradY };
    }
  };

  // Helper to pre-render the glorious loss function heatmap to the offscreen canvas
  const drawOffscreenHeatmap = (canvas: HTMLCanvasElement, type: "peaks" | "saddle") => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    
    // Low-resolution rendering + bilinear canvas scaling gives a gorgeous smooth organic look
    const gridW = 120;
    const gridH = 64;
    const cellW = w / gridW;
    const cellH = h / gridH;
    
    const centerX = w / 2;
    const centerY = h / 2;
    const scale = 110;
    
    for (let i = 0; i < gridW; i++) {
       for (let j = 0; j < gridH; j++) {
        const px = i * cellW + cellW / 2;
        const py = j * cellH + cellH / 2;
        
        // Convert to coordinate system
        const x = (px - centerX) / scale;
        const y = (centerY - py) / scale;
        
        const { loss } = getLossAndGradient(x, y);
        
        let r = 0, g = 0, b = 0;
        if (type === "peaks") {
          // Peaks terrain colors: deep indigo/violet valley to glowing amber peaks
          const norm = Math.min(1.0, Math.max(0.0, loss / 110));
          if (norm < 0.25) {
            const t = norm / 0.25;
            r = Math.round(15 + t * 25);     // 15 -> 40
            g = Math.round(23 + t * 77);     // 23 -> 100
            b = Math.round(42 + t * 90);     // 42 -> 132
          } else if (norm < 0.6) {
            const t = (norm - 0.25) / 0.35;
            r = Math.round(40 + t * 115);    // 40 -> 155
            g = Math.round(100 - t * 75);    // 100 -> 25
            b = Math.round(132 + t * 15);    // 132 -> 147
          } else {
            const t = (norm - 0.6) / 0.4;
            r = Math.round(155 + t * 100);   // 155 -> 255
            g = Math.round(25 + t * 155);    // 25 -> 180
            b = Math.round(147 - t * 125);   // 147 -> 22
          }
        } else {
          // Saddle point terrain colors (symmetric pass)
          const norm = Math.min(1.0, Math.max(0.0, (loss + 30) / 130));
          if (norm < 0.3) {
            const t = norm / 0.3;
            r = Math.round(10 + t * 25);     // 10 -> 35
            g = Math.round(15 + t * 25);     // 15 -> 40
            b = Math.round(30 + t * 105);    // 30 -> 135
          } else if (norm < 0.7) {
            const t = (norm - 0.3) / 0.4;
            r = Math.round(35 + t * 175);    // 35 -> 210
            g = Math.round(40 + t * 50);     // 40 -> 90
            b = Math.round(135 - t * 95);    // 135 -> 40
          } else {
            const t = (norm - 0.7) / 0.3;
            r = Math.round(210 + t * 45);    // 210 -> 255
            g = Math.round(90 + t * 105);    // 90 -> 195
            b = Math.round(40 - t * 25);     // 40 -> 15
          }
        }
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(i * cellW, j * cellH, cellW + 0.3, cellH + 0.3);
      }
    }
  };

  const handleResetOptimizer = () => {
    setEpoch(0);
    setCurrentLoss(100);
    epochRef.current = 0;
    currentLossRef.current = 100;
    setOptimizerStatus("就绪：准备进行高维鞍点寻找并梯度收敛");
    setLossHistory([]);
    lossHistoryRef.current = [];
    setAutoplayCountdown(null);
    
    ballPos.current = {
      x: surfaceType === "peaks" ? -1.65 : -1.7,
      y: surfaceType === "peaks" ? 1.05 : 0.15,
      vx: 0,
      vy: 0,
      path: []
    };

    // Initialize flowing 2D helper gradient-field dust particles
    const particles = [];
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 4.4,
        y: (Math.random() - 0.5) * 2.4,
        speed: 0.6 + Math.random() * 0.9,
        life: Math.random() * 80,
        maxLife: 60 + Math.random() * 80
      });
    }
    streamParticles.current = particles;
  };

  useEffect(() => {
    handleResetOptimizer();
  }, [surfaceType]);

  // Autoplay automation loop with a generous 15-second display hold timer
  useEffect(() => {
    const bx = ballPos.current.x;
    const by = ballPos.current.y;
    // The optimization is completed/stuck if path has run out of epoch steps, loss is tiny, saddle bounds are reached, or speed is 0
    const isFinished = epoch >= 220 || 
                       (surfaceType === "peaks" && currentLoss <= 1.2) || 
                       (surfaceType === "saddle" && (Math.abs(bx) >= 1.9 || Math.abs(by) >= 1.9)) ||
                       (epoch > 40 && Math.abs(ballPos.current.vx) + Math.abs(ballPos.current.vy) < 0.0001);

    if (!isFinished) {
      if (autoplayCountdown !== null) {
        setAutoplayCountdown(null);
      }
      return;
    }

    if (!isAutoplay) {
      if (autoplayCountdown !== null) {
        setAutoplayCountdown(null);
      }
      return;
    }

    // Set initial countdown of 15 seconds so content stays for a long time
    if (autoplayCountdown === null) {
      setAutoplayCountdown(15);
      return;
    }

    if (autoplayCountdown <= 0) {
      // Toggle and Reset
      setSurfaceType(prev => (prev === "peaks" ? "saddle" : "peaks"));
      handleResetOptimizer();
      setAutoplayCountdown(null);
      return;
    }

    const interval = setInterval(() => {
      setAutoplayCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [epoch, isAutoplay, currentLoss, autoplayCountdown, surfaceType]);

  // Infinite numerical rendering cycle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    let localFrame = 0;

    const tick = () => {
      localFrame++;
      
      // Ensure physical cached offscreen heatmap is initialized and updated
      if (offscreenDrawnTypeRef.current !== surfaceType) {
        // Create offscreen canvas on the fly if needed
        if (!offscreenCanvasRef.current) {
          offscreenCanvasRef.current = document.createElement("canvas");
        }
        const offCanvas = offscreenCanvasRef.current;
        if (offCanvas.width !== width || offCanvas.height !== height) {
          offCanvas.width = width;
          offCanvas.height = height;
        }
        drawOffscreenHeatmap(offCanvas, surfaceType);
        offscreenDrawnTypeRef.current = surfaceType;
      }

      // Clear canvas to white paper look
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Rendering Gradient Descent Contours
      if (activeTab === "gradient") {
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = 110; // pixels per unit coordinate

        // 1. Draw the textured 2D topological optimization surface heatmap first
        if (offscreenCanvasRef.current) {
          ctx.drawImage(offscreenCanvasRef.current, 0, 0);
        }

        // 2. Render soft grid coordinate system overlay
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 25) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }
        for (let y = 0; y < height; y += 25) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }

        // 3. Draw true mathematically projected topographic isolines
        if (surfaceType === "peaks") {
          // Dynamic wavy level rings
          for (let r = 25; r <= 360; r += 28) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.16 - r / 2000})`; // elegant white overlay contours
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            const numPoints = 120;
            for (let i = 0; i <= numPoints; i++) {
              const theta = (i / numPoints) * Math.PI * 2;
              // Add real wavy perturbation representing local peaks
              const rad = r + Math.sin(theta * 4) * 8 * (r / 150) + Math.cos(theta * 3) * 4;
              const px = centerX + Math.cos(theta) * rad;
              const py = centerY + Math.sin(theta) * rad;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.stroke();
          }
        } else {
          // Hyperbolic saddle boundaries: 3*x^2 - 1.5*y^2 = C
          const levels = [-80, -40, -10, 20, 50, 90, 140, 200];
          levels.forEach((level) => {
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 - Math.abs(level) / 2200})`;
            ctx.lineWidth = 1.1;
            if (level > 0) {
              // Left & Right hyperbolic branches
              for (let sign of [-1, 1]) {
                ctx.beginPath();
                let first = true;
                for (let sy = -2.0; sy <= 2.0; sy += 0.1) {
                  const temp = (1.5 * sy * sy + level / 12) / 3;
                  if (temp >= 0) {
                    const sx = sign * Math.sqrt(temp);
                    const px = centerX + sx * scale;
                    const py = centerY - sy * scale;
                    if (px >= 0 && px <= width && py >= 0 && py <= height) {
                      if (first) { ctx.moveTo(px, py); first = false; }
                      else ctx.lineTo(px, py);
                    }
                  }
                }
                ctx.stroke();
              }
            } else {
              // Top & Bottom hyperbolic branches
              for (let sign of [-1, 1]) {
                ctx.beginPath();
                let first = true;
                for (let sx = -2.5; sx <= 2.5; sx += 0.1) {
                  const temp = (3 * sx * sx - level / 12) / 1.5;
                  if (temp >= 0) {
                    const sy = sign * Math.sqrt(temp);
                    const px = centerX + sx * scale;
                    const py = centerY - sy * scale;
                    if (px >= 0 && px <= width && py >= 0 && py <= height) {
                      if (first) { ctx.moveTo(px, py); first = false; }
                      else ctx.lineTo(px, py);
                    }
                  }
                }
                ctx.stroke();
              }
            }
          });
        }

        // 4. Animate stream particles drifting down the gradient vector flows (helps intuition immensely!)
        ctx.fillStyle = "rgba(251, 146, 60, 0.75)"; // glowing amber spark
        ctx.strokeStyle = "rgba(251, 146, 60, 0.25)";
        ctx.lineWidth = 1.0;
        
        streamParticles.current.forEach((p) => {
          const { loss, gradX, gradY } = getLossAndGradient(p.x, p.y);
          const gradLen = Math.sqrt(gradX * gradX + gradY * gradY) || 1;
          
          const stepSize = 0.012 * p.speed;
          // Step particles down the slope
          p.x -= (gradX / gradLen) * stepSize;
          p.y -= (gradY / gradLen) * stepSize;
          p.life += 1;
          
          const px = centerX + p.x * scale;
          const py = centerY - p.y * scale;
          
          if (px >= 0 && px <= width && py >= 0 && py <= height) {
            const size = Math.max(1, 3 * (1 - p.life / p.maxLife));
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw a subtle spark tail
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px + (gradX / gradLen) * 5, py - (gradY / gradLen) * 5);
            ctx.stroke();
          }
          
          // Respawn criteria
          const gradValue = Math.abs(gradX) + Math.abs(gradY);
          if (p.life >= p.maxLife || gradValue < 0.1 || loss < 1.0 || px < -20 || px > width + 20 || py < -20 || py > height + 20) {
            p.x = (Math.random() - 0.5) * 4.4;
            p.y = (Math.random() - 0.5) * 2.4;
            if (p.x * p.x + p.y * p.y < 0.15) {
              p.x += (Math.random() > 0.5 ? 1 : -1) * 1.5;
            }
            p.life = 0;
            p.maxLife = 65 + Math.random() * 80;
          }
        });

        // 5. Draw local and global optimum markers
        ctx.fillStyle = "#38bdf8"; // bright sky blue
        ctx.font = "bold 9.5px var(--font-mono)";
        ctx.beginPath();
        ctx.arc(centerX, centerY, 6, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.fillText("GLOBAL MINIMA (核心全局最优收敛点)", centerX + 12, centerY - 2);

        if (surfaceType === "peaks") {
          ctx.fillStyle = "rgba(251, 146, 60, 0.85)"; // high contrast orange
          ctx.beginPath();
          ctx.arc(centerX - scale * 0.9, centerY + scale * 0.9, 5, 0, Math.PI*2);
          ctx.fill();
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.fillText("LOCAL MINIMA (局部极小欺骗点)", centerX - scale * 0.9 + 10, centerY + scale * 0.9 - 2);
        }

        // Perform gradient update step if optimizer running
        const bx = ballPos.current.x;
        const by = ballPos.current.y;
        const { loss, gradX, gradY } = getLossAndGradient(bx, by);

        // Check if out of bounds for saddle escape condition
        const isOutOfBounds = Math.abs(bx) >= 1.9 || Math.abs(by) >= 1.9;
        const stopCondition = surfaceType === "peaks" 
          ? (loss <= 0.4 || (epochRef.current > 70 && Math.abs(gradX) + Math.abs(gradY) < 0.01))
          : isOutOfBounds;

        if (epochRef.current < 250 && !stopCondition) {
          epochRef.current += 1;
          setEpoch(epochRef.current);
          setCurrentLoss(loss);

          // Save in loss history state
          const updatedHistory = [...lossHistoryRef.current, loss];
          lossHistoryRef.current = updatedHistory;
          setLossHistory(updatedHistory);

          // Update velocity with momentum term
          // Clamp step to make it extremely smooth and stable
          const gStep = 0.008;
          let nextVX = ballPos.current.vx * momentum - (learningRate * gradX) * gStep;
          let nextVY = ballPos.current.vy * momentum - (learningRate * gradY) * gStep;

          // Velocity clamping to prevent explosive simulation states
          const maxSpeed = 0.12;
          const speed = Math.sqrt(nextVX * nextVX + nextVY * nextVY);
          if (speed > maxSpeed) {
            nextVX = (nextVX / speed) * maxSpeed;
            nextVY = (nextVY / speed) * maxSpeed;
          }

          const nextX = Math.max(-2, Math.min(2, bx + nextVX));
          const nextY = Math.max(-2, Math.min(2, by + nextVY));

          ballPos.current.vx = nextVX;
          ballPos.current.vy = nextVY;
          ballPos.current.x = nextX;
          ballPos.current.y = nextY;

          // Record step trace path limit
          ballPos.current.path.push({ x: nextX, y: nextY });
          if (ballPos.current.path.length > 120) ballPos.current.path.shift();

          // Check optimizer boundaries failure/success status and adjust diagnostic logs
          if (loss > 150) {
            setOptimizerStatus("❌ 严重震荡发散：梯度跨步(η)过大，位置被直接切飞出最优势垒壁！");
          } else if (surfaceType === "peaks") {
            if (epochRef.current > 80 && loss < 2.5) {
              setOptimizerStatus("✨ 梯度收敛大捷！权重值完美吸附并锁定在最低全局最优亏损点。");
            } else if (epochRef.current > 100 && loss > 18 && Math.abs(nextVX) + Math.abs(nextVY) < 0.001) {
              setOptimizerStatus("⚠️ 陷入非凸局部极小值伪坑：偏导数动力趋于0，陷入次优局部极值坑无法脱身。");
            } else {
              setOptimizerStatus("⚙️ 进行中：牛顿-莱布尼茨偏微分链式法则高速计算反向传播...");
            }
          } else {
            // Saddle point diagnostics
            if (Math.abs(bx) < 0.18 && Math.abs(by) < 0.18) {
              setOptimizerStatus("⏳ 临界鞍点(Saddle Point)平坦高原：梯度极度微弱，二阶Hessian矩阵表现为非正定！");
            } else if (Math.abs(bx) < 0.5 && Math.abs(by) > 0.25) {
              setOptimizerStatus("🚀 极限打破！惯性动量(Momentum)协助权重冲破零导数平原，沿着y轴不稳定流形逃逸！");
            } else {
              setOptimizerStatus("⚙️ 马鞍地标滑行中：参数权重正在寻找局部一阶偏导数极值分水岭...");
            }
          }
        }

        // Plot gradient trajectory path
        ctx.strokeStyle = "#38bdf8"; // glowing light sky blue
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ballPos.current.path.forEach((p, idx) => {
          const px = centerX + p.x * scale;
          const py = centerY - p.y * scale;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();

        // Plot dynamic training parameter agent point (the sliding parameter dot)
        const currentPX = centerX + bx * scale;
        const currentPY = centerY - by * scale;
        
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(currentPX, currentPY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow

        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(currentPX, currentPY, 8, 0, Math.PI * 2);
        ctx.stroke();

        // Label parameters vector
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px var(--font-mono)";
        // Draw background shadow text for premium legibility on the heatmap
        ctx.shadowColor = "#000000";
        ctx.shadowBlur = 4;
        ctx.fillText(`参数权重 w_i | 亏损值 loss=${loss.toFixed(1)}%`, currentPX + 12, currentPY - 2);
        ctx.shadowBlur = 0; // reset

        // Gradient vector arrow
        ctx.strokeStyle = "#f97316"; // Bright sunset orange
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(currentPX, currentPY);
        ctx.lineTo(currentPX - gradX * 1.5, currentPY + gradY * 1.5);
        ctx.stroke();
      }

      // Rendering Electromagnetic Waves (Maxwell propagation)
      else if (activeTab === "maxwell") {
        const centerY = height / 2;
        const cSpeed = 4 / Math.sqrt(permittivity); // wave velocity inversely proportional

        ctx.strokeStyle = "rgba(100, 116, 139, 0.18)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(30, centerY);
        ctx.lineTo(width - 30, centerY); // central propagation line
        ctx.stroke();

        // Render Wave vectors
        // E-wave: Blue vertical vector loop, B-wave: Orange perspective horizontal vector loop
        for (let x = 30; x < width - 30; x += 12) {
          const relativeX = (x - 30) / (width - 60);
          const phase = relativeX * waveFrequency * Math.PI * 4 - localFrame * 0.09 * cSpeed;

          // Electric field magnitude
          const ampE = Math.sin(phase) * 60;
          const ampB = ampE * 0.6; // scaled relative perspective

          // E-vector (vertical sky blue line)
          ctx.strokeStyle = "rgba(2, 132, 199, 0.72)";
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(x, centerY);
          ctx.lineTo(x, centerY - ampE);
          ctx.stroke();

          // Magnetic vector (slanted amber gold line)
          ctx.strokeStyle = "rgba(234, 88, 12, 0.6)";
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(x, centerY);
          ctx.lineTo(x + ampB * 0.5, centerY + ampB * 0.5);
          ctx.stroke();
        }

        // Smooth wave envelope lines (Sky blue)
        ctx.strokeStyle = "#0284c7";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        let eFirst = true;
        for (let x = 30; x < width - 30; x++) {
          const relativeX = (x - 30) / (width - 60);
          const phase = relativeX * waveFrequency * Math.PI * 4 - localFrame * 0.09 * cSpeed;
          const ampE = Math.sin(phase) * 60;
          if (eFirst) {
            ctx.moveTo(x, centerY - ampE);
            eFirst = false;
          } else {
            ctx.lineTo(x, centerY - ampE);
          }
        }
        ctx.stroke();

        // Label equations
        ctx.fillStyle = "#1e293b";
        ctx.font = "bold 11px var(--font-mono)";
        ctx.fillText("∇ × E = -∂B/∂t  (法拉第电磁感应：时变电场求导极值激发交变磁场)", 40, height - 52);
        ctx.fillText("∇ × B = μ₀ε₀ ∂E/∂t (位移电流理论：时变磁场变化率求导激发电偶场)", 40, height - 32);
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [activeTab, learningRate, momentum, surfaceType, waveFrequency, permittivity]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="relativity-ai-core">
      {/* Visual Navigation Tabs */}
      <div className="lg:col-span-12 flex flex-col md:flex-row justify-between md:items-center border-b border-slate-200 pb-3 gap-3">
        <div className="flex gap-2 select-none">
          <button
            onClick={() => setActiveTab("gradient")}
            className={`pb-2 px-3 text-xs md:text-sm font-display font-bold transition-all relative cursor-pointer ${
              activeTab === "gradient" ? "text-brand-orange" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            等高线梯度下降收敛训练
            {activeTab === "gradient" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("maxwell")}
            className={`pb-2 px-3 text-xs md:text-sm font-display font-bold transition-all relative cursor-pointer ${
              activeTab === "maxwell" ? "text-brand-orange" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            经典物理: 麦克斯韦电磁脉冲
            {activeTab === "maxwell" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-brand-orange font-mono">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-brand-orange" />
          <span>多阶微积分偏导数对场论与极值理论的最高统一</span>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {activeTab === "gradient" ? (
          <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col gap-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-mono font-semibold text-slate-800 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                <TrendingDown className="w-4 h-4 text-brand-orange" /> 梯度下降收敛优化调节舱
              </h4>
              <button
                onClick={() => setIsAutoplay(prev => !prev)}
                className={`px-1.5 py-0.5 text-[9px] font-mono border rounded transition-all duration-300 flex items-center gap-1 cursor-pointer focus:outline-none ${
                  isAutoplay
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 font-bold"
                    : "bg-slate-50 border-slate-300 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }`}
                title="自动重播并切换地势"
              >
                <RefreshCw className={`w-2 h-2 ${isAutoplay ? "animate-spin" : ""}`} style={{ animationDuration: "6s" }} />
                <span>{isAutoplay ? "自动巡航" : "巡航关闭"}</span>
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-slate-500 font-mono font-medium">选择深度参数地势：</span>
              <div className="grid grid-cols-2 gap-2 mt-1 select-none">
                <button
                  onClick={() => setSurfaceType("peaks")}
                  className={`p-2 rounded text-center text-xs font-semibold border cursor-pointer ${
                    surfaceType === "peaks" 
                      ? "bg-brand-orange/10 border-brand-orange/40 text-brand-orange" 
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
                  }`}
                >
                  多极小谷
                </button>
                <button
                  onClick={() => setSurfaceType("saddle")}
                  className={`p-2 rounded text-center text-xs font-semibold border cursor-pointer ${
                    surfaceType === "saddle" 
                      ? "bg-brand-orange/10 border-brand-orange/40 text-brand-orange" 
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
                  }`}
                >
                  经典马鞍
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600">反向传播学习速率 (η)</span>
                <span className={`${learningRate > 0.3 ? "text-red-500 font-bold" : "text-brand-orange"}`}>{learningRate}</span>
              </div>
              <input
                type="range"
                min={0.02}
                max={0.5}
                step={0.01}
                value={learningRate}
                onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-brand-orange"
              />
              <span className="text-[10px] text-slate-400">学习率过重会引发偏导数反馈步幅开裂，失去全局盆部。</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-medium border-t border-slate-50 pt-2.5">
                <span className="text-slate-600">惯性阻力二阶系数 (Momentum)</span>
                <span className="text-brand-orange">{momentum}</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={0.9}
                step={0.05}
                value={momentum}
                onChange={(e) => setMomentum(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-brand-orange"
              />
              <span className="text-[10px] text-slate-400">结合二阶切速度物理惯性，引导收敛球滑过次优坑洼。</span>
            </div>

            <button
              onClick={handleResetOptimizer}
              className="mt-3 w-full py-2 bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange border border-brand-orange/30 hover:border-brand-orange/50 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer font-mono shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> 复位模型梯度 (参数权值归零)
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col gap-4 shadow-xs">
            <h4 className="text-xs font-mono font-semibold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1.5 font-bold">
              <Gauge className="w-4 h-4 text-brand-orange" /> 波动矢量参数调节舱
            </h4>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600">电磁脉冲振动频率 (f)</span>
                <span className="text-brand-orange">{waveFrequency} GHz</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={3.0}
                step={0.1}
                value={waveFrequency}
                onChange={(e) => setWaveFrequency(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-brand-orange"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-medium border-t border-slate-50 pt-2.5">
                <span className="text-slate-600">电介质空间磁导率 (ε)</span>
                <span className="text-brand-orange">{permittivity}</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={4.0}
                step={0.1}
                value={permittivity}
                onChange={(e) => setPermittivity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-brand-orange"
              />
              <span className="text-[10px] text-slate-400">基于麦克斯韦波速方程，介电膨胀阻尼将制约光波宏观速率。</span>
            </div>
          </div>
        )}

        {/* 📚 核心算法算子与解析能域实时看板 */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-950 text-slate-100 flex flex-col gap-3 shadow-md" id="active-equation-tracker">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-brand-orange" />
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-300">
                当前核心解算函数与物理常数
              </span>
            </div>
            <span className="text-[8.5px] font-mono text-brand-orange bg-orange-950/40 border border-orange-900/50 px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">
              {activeTab === "gradient" ? "OPTIMIZER" : "ELECTROMAGNETIC"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-widest block">
              当前计算算子 (Target Operator / Function)
            </span>
            <span className="font-display font-bold text-xs text-white">
              {activeTab === "gradient" 
                ? (surfaceType === "peaks" ? "高维非凸·多峰混合谐振损失函数" : "对称非凸·二阶马鞍势能势垒函数")
                : "一维高频交变谐振波电磁分量行分流"
              }
            </span>
          </div>

          {/* Golden math formula output stage */}
          <div className="flex items-center justify-center py-3 px-4 bg-slate-950/80 border border-slate-800/80 rounded-lg max-w-full overflow-x-auto shadow-inner relative group select-all min-h-12 border-l-4 border-brand-orange">
            <div className="text-center text-slate-200 select-all font-mono scale-[0.95] max-w-full">
              {activeTab === "gradient" ? (
                surfaceType === 'peaks' ? (
                  <MathFormula math="\\mathcal{L}(x,y) = 18(x^2 + y^2 - \\cos(2.8x) - \\cos(2.8y)) + 30" block={true} className="text-emerald-400 text-xs font-bold" />
                ) : (
                  <MathFormula math="\\mathcal{L}(x,y) = 15(x^2 - 0.5y^2) + 40" block={true} className="text-emerald-400 text-xs font-bold" />
                )
              ) : (
                <MathFormula math="\\mathbf{E}_y(x,t) = E_0 \\sin\\left( \\frac{2\\pi f}{v} x - 2\\pi f \\cdot t \\right)" block={true} className="text-sky-400 text-xs font-bold" />
              )}
            </div>
            <span className="absolute top-1 right-1 text-[7.5px] font-mono text-slate-600 leading-none font-bold">
              MATH_CORE
            </span>
          </div>

          {/* Parameter Parse Matrix / Grid */}
          <div className="flex flex-col gap-2 border-t border-slate-800/60 pt-2.5">
            <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-widest block">
              能域控制常量与实时物态变量 (Real-time States)
            </span>
            <div className="grid grid-cols-2 gap-2 text-[10px] leading-relaxed">
              {activeTab === "gradient" ? (
                <>
                  <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/50 flex flex-col justify-between">
                    <span className="text-[9px] text-slate-400 leading-snug flex flex-wrap items-center gap-1">
                      步长因子 <MathFormula math="\eta" className="text-brand-orange text-[10px]" /> (Learning Rate)
                    </span>
                    <span className="text-brand-orange font-mono font-bold mt-1 text-[11px]">{learningRate}</span>
                  </div>
                  <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/50 flex flex-col justify-between">
                    <span className="text-[9px] text-slate-400 leading-snug flex flex-wrap items-center gap-1">
                      动量惯性 <MathFormula math="\gamma" className="text-brand-orange text-[10px]" /> (Momentum)
                    </span>
                    <span className="text-brand-orange font-mono font-bold mt-1 text-[11px]">{momentum}</span>
                  </div>
                  <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/50 flex flex-col justify-between col-span-2">
                    <span className="text-[9px] text-slate-400 leading-snug flex flex-wrap items-center gap-1">
                      当前实测评估亏损度量 <MathFormula math="\mathcal{L}(x, y)" className="text-emerald-400 text-[10px]" />
                    </span>
                    <span className="text-emerald-400 font-mono font-bold mt-1 text-[11px] flex justify-between items-center">
                      <MathFormula math={`\\mathcal{L} \\approx ${currentLoss.toFixed(3)}\\%`} className="text-emerald-400 text-[11px] font-bold" />
                      <span className="text-[8.5px] bg-emerald-950/50 border border-emerald-900/50 px-1 py-0.5 rounded text-emerald-500 font-normal shrink-0">
                        {epoch >= 220 || currentLoss <= 1.2 ? "已完美收敛" : "极限逼近中"}
                      </span>
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/50 flex flex-col justify-between">
                    <span className="text-[9px] text-slate-400 leading-snug flex flex-wrap items-center gap-1">
                      交变频率 <MathFormula math="f" className="text-sky-400 text-[10px]" /> (Frequency)
                    </span>
                    <span className="text-sky-400 font-mono font-bold mt-1 text-[11px]">{waveFrequency.toFixed(1)} GHz</span>
                  </div>
                  <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/50 flex flex-col justify-between">
                    <span className="text-[9px] text-slate-400 leading-snug flex flex-wrap items-center gap-1">
                      介电常数 <MathFormula math="\varepsilon_r" className="text-sky-400 text-[10px]" /> (Permittivity)
                    </span>
                    <span className="text-sky-400 font-mono font-bold mt-1 text-[11px]">{permittivity.toFixed(1)}</span>
                  </div>
                  <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/50 flex flex-col justify-between col-span-2">
                    <span className="text-[9px] text-slate-400 leading-snug flex flex-wrap items-center gap-1">
                      波包相速度 <MathFormula math="v_{\text{wave}}" className="text-amber-400 text-[10px]" /> (折射限制)
                    </span>
                    <span className="text-amber-550 font-mono font-bold mt-1 text-[11px] flex justify-between items-center gap-2">
                      <MathFormula math={`v \\approx ${(1 / Math.sqrt(permittivity)).toFixed(3)} c_0`} className="text-amber-400 text-[11px] font-bold" />
                      <span className="text-[8.5px] bg-amber-950/50 border border-amber-900/50 px-1 py-0.5 rounded text-amber-500 font-normal shrink-0">
                        折射率 n = {Math.sqrt(permittivity).toFixed(2)}
                      </span>
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Copy math button */}
          <button
            onClick={async () => {
              try {
                const textToCopy = activeTab === "gradient"
                  ? (surfaceType === "peaks" ? "\\mathcal{L}(x,y) = 18(x^2 + y^2 - \\cos(2.8x) - \\cos(2.8y)) + 30" : "\\mathcal{L}(x,y) = 15(x^2 - 0.5y^2) + 40")
                  : "\\mathbf{E}_y(x,t) = E_0 \\sin\\left( \\frac{2\\pi f}{v} x - 2\\pi f \\cdot t \\right)";
                await navigator.clipboard.writeText(textToCopy);
                setLeftFormulaCopied(true);
                setTimeout(() => setLeftFormulaCopied(false), 2000);
              } catch (e) {
                console.error(e);
              }
            }}
            className="w-full mt-1.5 py-1.5 bg-slate-800 hover:bg-slate-755 text-[10px] font-mono font-bold text-slate-350 hover:text-white border border-slate-705/80 hover:border-slate-600 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none"
          >
            {leftFormulaCopied ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3 text-emerald-400">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-emerald-400">COPIED_LATEX_TO_CLIPBOARD</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-slate-400">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
                <span>COPY_LATEX_FORMULA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Plot Contours */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="relative rounded-2xl bg-white border border-slate-200 p-4 shadow-xs flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-150 pb-3 mb-3 gap-2">
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-brand-orange" />
              <span className="text-xs text-slate-550 font-mono font-bold">
                {activeTab === "gradient" ? "多维损失曲面极限收敛双重记录器 (Contour & Curve)" : "经典三维时空横向电场/磁场互感谐振波动"}
              </span>
            </div>

            {activeTab === "gradient" && (
              <div className="flex gap-4 text-xs font-mono text-slate-500">
                <span>训练迭代 (Epoch): <span className="text-slate-800 font-bold">{epoch}/220</span></span>
                <span>当前 Loss: <span className="text-brand-orange font-bold text-sm">{currentLoss.toFixed(2)}%</span></span>
              </div>
            )}
          </div>

          {activeTab === "gradient" ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
              {/* Left Column: 2D Contour Map Canvas */}
              <div className="xl:col-span-7 flex flex-col items-center justify-center bg-slate-50 overflow-hidden rounded-xl border border-slate-200/60 p-2 shadow-inner">
                <div className="w-full text-[10px] text-slate-450 font-mono self-start mb-1.5 flex items-center gap-1 justify-between px-1">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                    高维 Loss 2D 等高线势能曲面投影盘
                  </span>
                  <span>Scale: 110 pixels/u</span>
                </div>
                <canvas
                  ref={canvasRef}
                  width={480}
                  height={320}
                  className="w-full bg-slate-900 rounded-lg shadow-md border border-slate-200/50"
                />
              </div>

              {/* Right Column: Real-time scrolling convergence curve chart (SVG) */}
              <div className="xl:col-span-5 flex flex-col bg-slate-950 text-slate-100 rounded-xl border border-slate-800 p-3 shadow-inner min-h-[300px] justify-between">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    实时收敛曲线动态示波器 (loss curve)
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-900/50">
                    {epoch >= 220 || currentLoss <= 1.2 ? "已收敛 FINISHED" : "收敛中 CONVERGING"}
                  </span>
                </div>

                <div className="w-full flex-1 flex items-center justify-center py-2">
                  {/* Custom crafted SVG line chart */}
                  <svg viewBox="0 0 320 180" className="w-full h-auto overflow-visible select-none">
                    <defs>
                      <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
                      const padLeft = 32;
                      const padRight = 12;
                      const padTop = 15;
                      const padBottom = 20;
                      const chartValH = 180 - padTop - padBottom;
                      const y = padTop + ratio * chartValH;
                      const val = (110 * (1 - ratio)).toFixed(0);
                      return (
                        <g key={`y-grid-${ratio}`} className="opacity-40">
                          <line x1={padLeft} y1={y} x2={320 - padRight} y2={y} stroke="rgba(255,255,255,0.08)" strokeDasharray="2,2" />
                          <text x={padLeft - 6} y={y + 3} fill="rgba(255,255,255,0.4)" fontSize="7" textAnchor="end" fontFamily="var(--font-mono)">
                            {val}%
                          </text>
                        </g>
                      );
                    })}

                    {/* Vertical grid lines representing epochs */}
                    {[0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
                      const padLeft = 32;
                      const padRight = 12;
                      const padTop = 15;
                      const padBottom = 20;
                      const chartValW = 320 - padLeft - padRight;
                      const x = padLeft + ratio * chartValW;
                      const val = (220 * ratio).toFixed(0);
                      return (
                        <g key={`x-grid-${ratio}`} className="opacity-40">
                          <line x1={x} y1={padTop} x2={x} y2={180 - padBottom} stroke="rgba(255,255,255,0.08)" strokeDasharray="2,2" />
                          <text x={x} y={180 - padBottom + 12} fill="rgba(255,255,255,0.4)" fontSize="7" textAnchor="middle" fontFamily="var(--font-mono)">
                            e{val}
                          </text>
                        </g>
                      );
                    })}

                    {/* Plot Loss Area Gradient under Curve (Area Path) */}
                    {lossHistory.length > 0 && (() => {
                      const padLeft = 32;
                      const padRight = 12;
                      const padTop = 15;
                      const padBottom = 20;
                      const chartValW = 320 - padLeft - padRight;
                      const chartValH = 180 - padTop - padBottom;
                      
                      const points = lossHistory.map((l, i) => {
                        const x = padLeft + (i / 220) * chartValW;
                        const clampedLoss = Math.min(110, Math.max(0, l));
                        const y = padTop + chartValH - (clampedLoss / 110) * chartValH;
                        return `${x.toFixed(1)},${y.toFixed(1)}`;
                      });
                      
                      const firstX = padLeft;
                      const firstY = padTop + chartValH;
                      const lastX = padLeft + ((lossHistory.length - 1) / 220) * chartValW;
                      const lastY = padTop + chartValH;
                      const areaPoints = `M ${firstX},${firstY} L ` + points.map(p => `L ${p}`).join(" ") + ` L ${lastX.toFixed(1)},${lastY.toFixed(1)} Z`;
                      
                      return (
                        <>
                          <path d={areaPoints} fill="url(#curveGradient)" />
                          <polyline points={points.join(" ")} fill="none" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          
                          {/* Pulsing dot at the active current coordinate */}
                          {points.length > 0 && (() => {
                            const lastPoint = points[points.length - 1].split(",");
                            const lx = parseFloat(lastPoint[0]);
                            const ly = parseFloat(lastPoint[1]);
                            return (
                              <g>
                                <circle cx={lx} cy={ly} r="4" fill="#22d3ee" className="animate-pulse" />
                                <circle cx={lx} cy={ly} r="7" stroke="#22d3ee" strokeWidth="1" fill="none" className="opacity-50 animate-ping" />
                              </g>
                            );
                          })()}
                        </>
                      );
                    })()}
                  </svg>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg py-2.5 flex flex-col gap-1.5 text-[10px] font-mono leading-relaxed mt-1">
                  <div className="flex justify-between border-b border-slate-800/60 pb-1">
                    <span className="text-slate-400">初始损失 (Initial cost):</span>
                    <span className="text-slate-200 font-bold">100.00%</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-1">
                    <span className="text-slate-400">当前损失 (Current cost):</span>
                    <span className="text-cyan-400 font-bold">{currentLoss.toFixed(3)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">一阶差商速度 (Slope dt):</span>
                    <span className={epoch > 0 && Math.abs(currentLoss - (lossHistory[lossHistory.length-2] || currentLoss)) < 0.001 ? "text-emerald-400 font-bold" : "text-amber-400"}>
                      {-Math.abs(currentLoss - (lossHistory[lossHistory.length-2] || currentLoss)).toFixed(4)}% / e
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center bg-slate-50 overflow-hidden rounded-xl border border-slate-200/60 p-2 shadow-inner">
              <canvas
                ref={canvasRef}
                width={600}
                height={320}
                className="max-w-full bg-white rounded-lg shadow-xs border border-slate-200/50"
              />
            </div>
          )}

          {activeTab === "gradient" && (
            <div className="mt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 rounded bg-slate-100/70 border border-slate-200 text-xs text-slate-600 font-mono shadow-inner pl-3.5 border-l-4 border-brand-orange">
              <div className="flex-1">
                <span className="text-brand-orange font-bold">🧠 神经网络反向决策监测：</span>
                <span className="text-slate-800 font-medium">{optimizerStatus}</span>
              </div>
              {autoplayCountdown !== null && (
                <div className="shrink-0 bg-brand-orange/10 border border-brand-orange/30 text-brand-orange px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-ping mr-1" />
                  <span>⏱️ 收敛完毕 (停留 {autoplayCountdown} 秒后切换)</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Real latex math presets overlay cards with typeset KaTeX formatting */}
        {activeTab === "gradient" && (
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs flex flex-col gap-4" id="backprop-math-tensors">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-orange" />
                <span className="text-xs font-display font-medium text-slate-800 tracking-wide uppercase font-bold">
                  反向传播收敛控制：深度学习梯度更新数学原理
                </span>
              </div>
              <span className="text-[9.5px] font-mono text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-md font-bold">
                GRADIENT_UPDATE_FLOW
              </span>
            </div>

            <div className="flex flex-col gap-3.5">
              {/* 1. Loss Function Row */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center shrink-0 mt-0.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px] font-bold flex items-center justify-center">
                    01
                  </span>
                  <div className="w-0.5 h-10 bg-slate-100 my-1" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-xs font-display font-bold text-slate-800">
                      亏损评估目标函数 (Objective Loss)
                    </h4>
                    <span className="font-mono text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-150 px-1.5 py-0.5 rounded font-bold">
                      {surfaceType === 'peaks' 
                        ? "L(x,y) = 18(x² + y² - cos(2.8x) - cos(2.8y)) + 30" 
                        : "L(x,y) = 15(x² - 0.5y²) + 40"
                      }
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans mt-1">
                    刻画神经网络输出值与期望物理极值状态偏离度的量度标量。系统利用该函数作为优化的核心地貌，自变量对应神经网络中的可调权重决策变量（同 $w_1, w_2$）。
                  </p>
                </div>
              </div>

              {/* 2. Gradient Operator Row */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center shrink-0 mt-0.5">
                  <span className="w-5 h-5 rounded-full bg-brand-orange/10 text-brand-orange border border-brand-orange/25 font-mono text-[10px] font-bold flex items-center justify-center">
                    02
                  </span>
                  <div className="w-0.5 h-10 bg-slate-100 my-1" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-xs font-display font-bold text-slate-800">
                      多元偏微分梯度向量算子 (Hamiltonian Gradient)
                    </h4>
                    <span className="font-mono text-[10px] text-brand-orange bg-orange-50 border border-orange-150 px-1.5 py-0.5 rounded font-bold">
                      ∇L = [∂L/∂x, ∂L/∂y]ᵀ
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans mt-1">
                    由各个空间坐标轴方向的一阶局部偏微分商组成的向量集合。此算子永远指示着该亏损函数在曲面空间中高度上升最陡峭的方向。在误差反向自适应修正时，控制器沿梯度的负方向（即 $-∇L$）向能量极低谷逼近。
                  </p>
                </div>
              </div>

              {/* 3. Momentum Formula Row */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center shrink-0 mt-0.5">
                  <span className="w-5 h-5 rounded-full bg-sky-50 text-sky-700 border border-sky-250 font-mono text-[10px] font-bold flex items-center justify-center">
                    03
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-xs font-display font-bold text-slate-800">
                      阻力惯性多阶动量参数更新约束 (Momentum Dynamics)
                    </h4>
                    <span className="font-mono text-[10px] text-sky-600 bg-sky-50 border border-sky-150 px-1.5 py-0.5 rounded font-bold">
                      v(t+1) = γ v(t) - η ∇L | w(t+1) = w(t) + v(t+1)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans mt-1">
                    通过平滑引入一阶阻尼物理质量项，当前更新获得指数级历史动量缓冲加权累计（惯性反馈 $γ$ = {momentum.toFixed(2)}，步长频率 $η$ = {learningRate.toFixed(2)}），能在高维震荡或局部极小等无梯度虚无鞍点中，赋予模型粒子克服重滞平滑越下的惯性动能。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "maxwell" && (
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs flex flex-col gap-4" id="maxwell-equations-text">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-orange" />
                <span className="text-xs font-display font-medium text-slate-800 tracking-wide uppercase font-bold">
                  经典物理模块：麦克斯韦电磁统一数学原理
                </span>
              </div>
              <span className="text-[9.5px] font-mono text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-md font-bold">
                ELECTROMAGNETIC_WAVES
              </span>
            </div>

            <div className="flex flex-col gap-3.5">
              {/* 1. Faraday's Law */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center shrink-0 mt-0.5">
                  <span className="w-5 h-5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-mono text-[10px] font-bold flex items-center justify-center">
                    01
                  </span>
                  <div className="w-0.5 h-10 bg-slate-100 my-1" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-xs font-display font-bold text-slate-800">
                      法拉第电磁感应定律 (Faraday's Law of Induction)
                    </h4>
                    <span className="font-mono text-[10px] text-sky-600 bg-sky-50 border border-sky-150 px-1.5 py-0.5 rounded font-bold">
                      ∇ × E = -∂B/∂t
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans mt-1">
                    描述随时间交变的虚无磁场在三维空间自发高速旋流，从而感生出正弦旋涡闭合电环的物理现实，奠定了磁场一阶变化率可以诞生自持切向电场理论。
                  </p>
                </div>
              </div>

              {/* 2. Ampere-Maxwell Law */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center shrink-0 mt-0.5">
                  <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-700 border border-amber-205 font-mono text-[10px] font-bold flex items-center justify-center">
                    02
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-xs font-display font-bold text-slate-800">
                      安培-麦克斯韦涡旋磁场定律 (Ampere-Maxwell Law)
                    </h4>
                    <span className="font-mono text-[10px] text-amber-600 bg-amber-50 border border-amber-150 px-1.5 py-0.5 rounded font-bold">
                      ∇ × B = μ₀ ε₀ ∂E/∂t
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans mt-1">
                    揭示随时间交变或跃迁的电脉冲位移场，能自发在高频透波中在外部维持磁旋流合力。它将电场变化引入电磁方程中，实现电磁波动无需介质而完美自持行前。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic educational footnote */}
        <div className="p-4 rounded-xl bg-slate-100/50 border border-slate-200 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-brand-orange/10 text-brand-orange mt-0.5">
              <Milestone className="w-4 h-4 text-brand-orange animate-pulse" />
            </div>
            <div>
              <h5 className="font-display font-bold text-xs text-slate-800">微积分在核心学术中的至高投影</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                {activeTab === "gradient" ? "神经网络的权重调节就是在大脑损失曲面上寻找极小低谷。高维偏微分求导组合的梯度向量(Gradient Vector)给出了最陡增幅方位。通过多阶链式导数回传(Backpropagation)，庞大的权重阵列才能完美收拢误差，这也是今天所有大模型认知智能的核心物理法则。" : "麦克斯韦用经典的电磁散度、旋度偏微分体系，证明了时变电场求导能催生动态磁场，变化的磁场再度通过积分交变，形成了不需要介质就能自我流变向前的横向电磁脉冲。这就是科学史最浪漫的微分方程，直接宣告了光的波动本质并繁荣了今天的智能无线感知。"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
