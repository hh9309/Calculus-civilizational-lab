import React, { useState, useEffect, useRef } from "react";
import { SIX_BREAKTHROUGHS } from "../data/historyData";
import { BreakthroughItem } from "../types";
import { MathView } from "./MathView";
import {
  Sparkles,
  Play,
  Pause,
  ArrowRight,
  ArrowLeft,
  Quote,
  RotateCcw,
  Layers,
  Scale,
  Gauge,
  Sliders,
  Eye,
  Activity,
  Compass,
} from "lucide-react";

export const BreakthroughsModule: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [animSpeed, setAnimSpeed] = useState<number>(1);
  const [manualParam, setManualParam] = useState<number>(0.55); // normalized [0, 1] parameter for scrubbing
  const [archimedesSubMode, setArchimedesSubMode] = useState<"cross_section" | "lever_balance" | "discrete_slices">("lever_balance");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const animTimeRef = useRef<number>(0);
  const lastTimestampRef = useRef<number | null>(null);

  const currentItem: BreakthroughItem = SIX_BREAKTHROUGHS[selectedIndex];

  // Auto step timer (syncs with continuous animation cycle if desired)
  useEffect(() => {
    setCurrentStep(0);
    setManualParam(0.55);
  }, [selectedIndex]);

  // Main 60FPS animation loop
  useEffect(() => {
    let active = true;

    const animate = (timestamp: number) => {
      if (!active) return;

      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }
      const dt = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      if (isPlaying) {
        animTimeRef.current += dt * animSpeed;
        // Update manual parameter automatically when playing
        const cycle = (Math.sin(animTimeRef.current * 1.2) + 1) / 2; // 0 to 1 smooth oscillation
        setManualParam(cycle);
      }

      // Render canvas
      renderCanvas();

      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      active = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      lastTimestampRef.current = null;
    };
  }, [isPlaying, animSpeed, selectedIndex, currentStep, manualParam, archimedesSubMode]);

  // Canvas drawing routine
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 2, 2.5);
    const w = 760;
    const h = 430;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#FAF8F2";
    ctx.fillRect(0, 0, w, h);

    // Subtle background grid
    ctx.strokeStyle = "rgba(212, 197, 176, 0.35)";
    ctx.lineWidth = 0.8;
    for (let x = 0; x < w; x += 28) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 28) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Outer border
    ctx.strokeStyle = "rgba(180, 160, 130, 0.45)";
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, w - 16, h - 16);

    const time = animTimeRef.current;
    const p = Math.max(0.02, Math.min(0.98, manualParam));

    // Render milestone dynamic animations
    if (selectedIndex === 0) {
      drawArchimedesDynamicProof(ctx, w, h, p, time, archimedesSubMode);
    } else if (selectedIndex === 1) {
      drawFermatDynamicProof(ctx, w, h, p, time);
    } else if (selectedIndex === 2) {
      drawBarrowDynamicProof(ctx, w, h, p, time);
    } else if (selectedIndex === 3) {
      drawNewtonDynamicOrbitProof(ctx, w, h, p, time);
    } else if (selectedIndex === 4) {
      drawLeibnizDynamicProductProof(ctx, w, h, p, time);
    } else {
      drawCauchyDynamicRigourProof(ctx, w, h, p, time);
    }

    ctx.restore();
  };

  // Helper: Manuscript Card
  const drawManuscriptPlaque = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    title: string,
    subTitle: string,
    paramBadge?: string
  ) => {
    ctx.save();
    ctx.fillStyle = "rgba(245, 241, 232, 0.95)";
    ctx.strokeStyle = "#D4C5B0";
    ctx.lineWidth = 1;

    ctx.beginPath();
    const r = 6;
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#2E2B25";
    ctx.font = "600 13px 'Noto Serif SC', 'Songti SC', serif";
    ctx.fillText(title, x + 14, y + 20);

    ctx.fillStyle = "#6B6557";
    ctx.font = "400 11px 'Noto Serif SC', 'Songti SC', serif";
    ctx.fillText(subTitle, x + 14, y + 36);

    if (paramBadge) {
      ctx.fillStyle = "#425C3C";
      ctx.font = "500 11px 'Fira Code', ui-monospace, monospace";
      ctx.fillText(paramBadge, x + 14, y + 53);
    }
    ctx.restore();
  };

  // Helper: Point Badge
  const drawPointLabel = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    color: string = "#2E2B25",
    bgColor: string = "rgba(255, 255, 255, 0.94)"
  ) => {
    ctx.save();
    ctx.font = "600 11px 'Fira Code', 'Noto Serif SC', monospace";
    const textWidth = ctx.measureText(text).width;
    const padH = 6;
    const padV = 3;

    ctx.fillStyle = bgColor;
    ctx.strokeStyle = "#D4C5B0";
    ctx.lineWidth = 0.8;

    ctx.beginPath();
    const r = 3;
    const rx = x - padH;
    const ry = y - 10 - padV;
    const rw = textWidth + padH * 2;
    const rh = 13 + padV * 2;
    ctx.moveTo(rx + r, ry);
    ctx.lineTo(rx + rw - r, ry);
    ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r);
    ctx.lineTo(rx + rw, ry + rh - r);
    ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh);
    ctx.lineTo(rx + r, ry + rh);
    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r);
    ctx.lineTo(rx, ry + r);
    ctx.quadraticCurveTo(rx, ry, rx + r, ry);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  };

  // ==========================================
  // BREAKTHROUGH 1: ARCHIMEDES DYNAMIC PROOF
  // ==========================================
  const drawArchimedesDynamicProof = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    param: number,
    time: number,
    mode: "cross_section" | "lever_balance" | "discrete_slices"
  ) => {
    const R = 75;
    const yVal = param * R; // height from vertex / base
    const rSphere = Math.sqrt(Math.max(0, R * R - (R - yVal) * (R - yVal))); // sphere slice radius at height y
    const rCone = yVal; // cone slice radius
    const rCyl = R; // cylinder slice radius

    const areaSphere = Math.PI * (R * R - (R - yVal) * (R - yVal));
    const areaCone = Math.PI * (yVal * yVal);
    const areaCyl = Math.PI * (R * R);

    // MODE 1: PHYSICAL LEVER BALANCE ANIMATION (阿基米德天平切片力矩平衡)
    if (mode === "lever_balance") {
      drawManuscriptPlaque(
        ctx,
        20,
        14,
        w - 40,
        64,
        "阿基米德《方法论》· 杠杆微元切片平衡动力学",
        "以支点为中心：左臂 (2R) 悬挂半球与圆锥微元切片，右臂 (2R) 悬挂圆柱微元切片，力矩恒等平衡",
        `切片高度 y = ${(yVal / R).toFixed(2)}R | 左臂力矩: 2R·(π(2Ry-y²) + πy²) = 2R·(2πRy) ≡ 右臂力矩 (平衡度: 100%)`
      );

      const fulcrumX = w / 2;
      const fulcrumY = h * 0.48;
      const armLength = 260;

      // Subtle dynamic lever tilt oscillation
      const tilt = Math.sin(time * 2) * 0.015;

      // Draw Fulcrum Base (支点)
      ctx.save();
      ctx.fillStyle = "#8E887B";
      ctx.beginPath();
      ctx.moveTo(fulcrumX, fulcrumY);
      ctx.lineTo(fulcrumX - 18, fulcrumY + 38);
      ctx.lineTo(fulcrumX + 18, fulcrumY + 38);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#5A5A40";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Fulcrum Pivot Pin
      ctx.fillStyle = "#C4A468";
      ctx.beginPath();
      ctx.arc(fulcrumX, fulcrumY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Draw Lever Beam (杠杆横梁)
      ctx.save();
      ctx.translate(fulcrumX, fulcrumY);
      ctx.rotate(tilt);

      // Beam bar
      ctx.fillStyle = "#5A5A40";
      ctx.fillRect(-armLength, -4, armLength * 2, 8);
      ctx.strokeStyle = "#2E2B25";
      ctx.lineWidth = 1;
      ctx.strokeRect(-armLength, -4, armLength * 2, 8);

      // Fulcrum Center Label
      ctx.fillStyle = "#EAE7DF";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText("支点 O", -16, -9);

      // Left hook (-armLength = -2R)
      const leftHookX = -armLength;
      const rightHookX = armLength;

      ctx.strokeStyle = "#8E887B";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(leftHookX, 0, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(rightHookX, 0, 4, 0, Math.PI * 2);
      ctx.stroke();

      // Left Suspension String & Weights (半球切片 + 圆锥切片)
      const stringLen = 70;
      ctx.strokeStyle = "#7A7468";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(leftHookX, 4);
      ctx.lineTo(leftHookX, stringLen);
      ctx.stroke();

      // Right Suspension String & Weight (圆柱切片)
      ctx.beginPath();
      ctx.moveTo(rightHookX, 4);
      ctx.lineTo(rightHookX, stringLen);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();

      // Render Left Weights: 3D Disk representation for Sphere Slice & Cone Slice
      const leftDiskX = fulcrumX - armLength;
      const leftDiskY = fulcrumY + 70;

      // Sphere Slice Disk (Emerald Green)
      const diskScaleSphere = Math.max(12, rSphere * 0.45);
      ctx.save();
      ctx.fillStyle = "rgba(90, 90, 64, 0.75)";
      ctx.strokeStyle = "#5A5A40";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(leftDiskX, leftDiskY, diskScaleSphere, diskScaleSphere * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cone Slice Disk (Golden Ochre stacked below)
      const diskScaleCone = Math.max(8, rCone * 0.45);
      ctx.fillStyle = "rgba(196, 164, 104, 0.75)";
      ctx.strokeStyle = "#A48648";
      ctx.beginPath();
      ctx.ellipse(leftDiskX, leftDiskY + 24, diskScaleCone, diskScaleCone * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Render Right Weight: Cylinder Slice Disk
      const rightDiskX = fulcrumX + armLength;
      const rightDiskY = fulcrumY + 70;
      const diskScaleCyl = R * 0.45;

      ctx.save();
      ctx.fillStyle = "rgba(66, 92, 60, 0.75)";
      ctx.strokeStyle = "#425C3C";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(rightDiskX, rightDiskY + 12, diskScaleCyl, diskScaleCyl * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Labels on Lever and Torque Equations
      drawPointLabel(ctx, `左臂挂载: 半球截面 π(R²-y²) + 圆锥截面 πy²`, leftDiskX - 110, leftDiskY + 54, "#5A5A40");
      drawPointLabel(ctx, `右臂挂载: 圆柱截面 πR² (恒定重力)`, rightDiskX - 80, rightDiskY + 44, "#425C3C");

      // Balance Level Indicator
      ctx.fillStyle = "#FAF8F2";
      ctx.strokeStyle = "#D4C5B0";
      ctx.strokeRect(fulcrumX - 140, h - 55, 280, 36);
      ctx.fillRect(fulcrumX - 140, h - 55, 280, 36);

      ctx.fillStyle = "#425C3C";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(`✓ 动平衡力矩方程: 2R · [ S_球(y) + S_锥(y) ] = 2R · S_柱(y)`, fulcrumX - 126, h - 33);
    }
    // MODE 2: 3-BODY SWEEPING CROSS SECTIONS (三体截面动态扫掠切片)
    else if (mode === "cross_section") {
      drawManuscriptPlaque(
        ctx,
        20,
        14,
        w - 40,
        64,
        "阿基米德三体几何扫掠切片 (Hemisphere + Cone = Cylinder)",
        "水平扫描激光薄片在高度 y 处扫过，球截面与锥截面积之和严格恒等于圆柱截面",
        `当前扫描高度 y = ${(yVal / R).toFixed(2)} R | 球面积: ${(areaSphere / (Math.PI * R * R)).toFixed(3)}πR² + 锥面积: ${(areaCone / (Math.PI * R * R)).toFixed(3)}πR² = 1.000πR²`
      );

      const cy = h / 2 + 50;
      const x1 = w * 0.22; // Hemisphere
      const x2 = w * 0.5; // Inverted Cone
      const x3 = w * 0.78; // Cylinder

      // 1. Hemisphere
      ctx.fillStyle = "rgba(90, 90, 64, 0.15)";
      ctx.strokeStyle = "#5A5A40";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(x1, cy, R, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 3D base ellipse for hemisphere
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.ellipse(x1, cy, R, R * 0.22, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Inverted Cone
      ctx.fillStyle = "rgba(196, 164, 104, 0.15)";
      ctx.strokeStyle = "#A48648";
      ctx.beginPath();
      ctx.moveTo(x2 - R, cy - R);
      ctx.lineTo(x2 + R, cy - R);
      ctx.lineTo(x2, cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cone top ellipse
      ctx.beginPath();
      ctx.ellipse(x2, cy - R, R, R * 0.22, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Cylinder
      ctx.fillStyle = "rgba(66, 92, 60, 0.15)";
      ctx.strokeStyle = "#425C3C";
      ctx.beginPath();
      ctx.rect(x3 - R, cy - R, R * 2, R);
      ctx.fill();
      ctx.stroke();

      // Cylinder top & bottom ellipses
      ctx.beginPath();
      ctx.ellipse(x3, cy - R, R, R * 0.22, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(x3, cy, R, R * 0.22, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Animated Scanline at height ySlice
      const ySlice = cy - yVal;

      // Laser Scanline with glow across canvas
      ctx.strokeStyle = "rgba(180, 83, 9, 0.7)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(35, ySlice);
      ctx.lineTo(w - 35, ySlice);
      ctx.stroke();
      ctx.setLineDash([]);

      // Highlighted 3D Elliptical Slices at this height
      // Hemisphere Slice (Radius = rSphere)
      if (rSphere > 0) {
        ctx.fillStyle = "rgba(90, 90, 64, 0.7)";
        ctx.strokeStyle = "#3A3A20";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x1, ySlice, rSphere, rSphere * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Cone Slice (Radius = rCone)
      if (rCone > 0) {
        ctx.fillStyle = "rgba(196, 164, 104, 0.7)";
        ctx.strokeStyle = "#7A6428";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x2, ySlice, rCone, rCone * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Cylinder Slice (Radius = R)
      ctx.fillStyle = "rgba(66, 92, 60, 0.7)";
      ctx.strokeStyle = "#253A22";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x3, ySlice, R, R * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Labels below solids
      drawPointLabel(ctx, `半球截面: π(R² - y²)`, x1 - 55, cy + 26, "#5A5A40");
      drawPointLabel(ctx, `圆锥截面: πy²`, x2 - 40, cy + 26, "#A48648");
      drawPointLabel(ctx, `圆柱截面: πR² (恒等和)`, x3 - 60, cy + 26, "#425C3C");
    }
    // MODE 3: DISCRETE STACKED SLICES (离散微元切片堆叠与穷竭逼近)
    else {
      drawManuscriptPlaque(
        ctx,
        20,
        14,
        w - 40,
        64,
        "阿基米德祖暅不可分量离散切片堆叠",
        "将连续立体离散化为 N 层圆盘薄片，直观展示等高截面积相加等于外切圆柱",
        `离散切片层数 N = 18 层 | 逐层数值验证: ∑ S_半球·Δy + ∑ S_锥·Δy = ∑ S_柱·Δy`
      );

      const cy = h / 2 + 50;
      const x1 = w * 0.22;
      const x2 = w * 0.5;
      const x3 = w * 0.78;
      const N = 16;
      const sliceH = R / N;

      for (let i = 0; i < N; i++) {
        const curY = (i + 0.5) * sliceH;
        const curRSphere = Math.sqrt(Math.max(0, R * R - (R - curY) * (R - curY)));
        const curRCone = curY;
        const screenY = cy - curY;

        const isCurrent = Math.abs(curY - yVal) < sliceH;

        // Draw Sphere Disc
        ctx.fillStyle = isCurrent ? "rgba(90, 90, 64, 0.85)" : "rgba(90, 90, 64, 0.35)";
        ctx.strokeStyle = "#5A5A40";
        ctx.beginPath();
        ctx.ellipse(x1, screenY, curRSphere, curRSphere * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Draw Cone Disc
        ctx.fillStyle = isCurrent ? "rgba(196, 164, 104, 0.85)" : "rgba(196, 164, 104, 0.35)";
        ctx.strokeStyle = "#A48648";
        ctx.beginPath();
        ctx.ellipse(x2, screenY, curRCone, curRCone * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Draw Cylinder Disc
        ctx.fillStyle = isCurrent ? "rgba(66, 92, 60, 0.85)" : "rgba(66, 92, 60, 0.35)";
        ctx.strokeStyle = "#425C3C";
        ctx.beginPath();
        ctx.ellipse(x3, screenY, R, R * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      drawPointLabel(ctx, `半球 (2/3 πR³)`, x1 - 40, cy + 24, "#5A5A40");
      drawPointLabel(ctx, `圆锥 (1/3 πR³)`, x2 - 35, cy + 24, "#A48648");
      drawPointLabel(ctx, `圆柱 (πR³)`, x3 - 30, cy + 24, "#425C3C");
    }
  };

  // ==========================================
  // BREAKTHROUGH 2: FERMAT ADEQUALITY DYNAMIC PROOF
  // ==========================================
  const drawFermatDynamicProof = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    param: number,
    time: number
  ) => {
    // Parameter e oscillates or scrubs
    const e = (1 - param) * 45; // perturbation amount
    const B = 260; // total length
    const cx = w / 2;
    const cy = h / 2 + 40;

    drawManuscriptPlaque(
      ctx,
      20,
      14,
      w - 40,
      64,
      "费马伪等法 (Adequality) 动态微扰与驻点极值",
      "令分割量产生微扰 e，建立伪等方程 A(x+e) ≈ A(x)，同除以 e 后令 e → 0 锁定峰值",
      `当前微扰量 e = ${e.toFixed(1)} | 方程: B - 2x - e ≈ 0 ===[e→0]===> x = B/2 = ${(B / 2).toFixed(1)} (极大值)`
    );

    // Baseline B
    ctx.strokeStyle = "#5A5A40";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - B / 2, cy);
    ctx.lineTo(cx + B / 2, cy);
    ctx.stroke();

    const x = B / 2; // Midpoint

    // Main Area Rectangle A(x) = x * (B - x)
    const heightA = B / 4;
    ctx.fillStyle = "rgba(90, 90, 64, 0.3)";
    ctx.strokeStyle = "#5A5A40";
    ctx.fillRect(cx - B / 2, cy - heightA, x, heightA);
    ctx.strokeRect(cx - B / 2, cy - heightA, x, heightA);

    // Perturbed Area Rectangle A(x+e)
    if (e > 0.5) {
      const heightPerturbed = (B - (x + e));
      const widthPerturbed = x + e;
      ctx.fillStyle = "rgba(196, 164, 104, 0.35)";
      ctx.strokeStyle = "#A48648";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.fillRect(cx - B / 2, cy - heightPerturbed, widthPerturbed, heightPerturbed);
      ctx.strokeRect(cx - B / 2, cy - heightPerturbed, widthPerturbed, heightPerturbed);
      ctx.setLineDash([]);
    }

    // Parabola Curve A(x) = x(B-x) on top right
    const curvePadX = cx + 80;
    const curvePadY = cy - 20;
    ctx.strokeStyle = "#425C3C";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let t = 0; t <= 100; t++) {
      const px = (t / 100) * B;
      const py = (px * (B - px)) / 150;
      const sx = cx - B / 2 + px;
      const sy = cy - 10 - py;
      if (t === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // Tangent Line at peak
    const peakX = cx;
    const peakY = cy - 10 - ((B / 2) * (B / 2)) / 150;
    ctx.fillStyle = "#843B20";
    ctx.beginPath();
    ctx.arc(peakX, peakY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Dynamic secant/tangent line depending on e
    ctx.strokeStyle = "#843B20";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    const secantSlope = -e * 0.015;
    ctx.moveTo(peakX - 60, peakY - secantSlope * -60);
    ctx.lineTo(peakX + 60, peakY - secantSlope * 60);
    ctx.stroke();

    drawPointLabel(ctx, `极大值驻点 x = B/2 (斜率 f'=0)`, peakX - 65, peakY - 14, "#843B20");
    drawPointLabel(ctx, `主矩形 A(x) = x(B-x)`, cx - B / 2 + 10, cy - heightA + 20, "#5A5A40");
    if (e > 1) {
      drawPointLabel(ctx, `微扰矩形 A(x+e) (差量 ≈ (B-2x)e)`, cx - 20, cy - heightA + 40, "#A48648");
    }
  };

  // ==========================================
  // BREAKTHROUGH 3: BARROW DYNAMIC PROOF
  // ==========================================
  const drawBarrowDynamicProof = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    param: number,
    time: number
  ) => {
    const pad = 65;
    const curT = param; // test point x in [0, 1]

    drawManuscriptPlaque(
      ctx,
      20,
      14,
      w - 40,
      64,
      "巴罗特征三角形与微积分基本定理 (FTC 几何原型)",
      "在曲线上取特征微元三角形 (dx, dy, ds)，证明面积累积函数 F(x) 的导数恰为原函数高度 f(x)",
      `探针位置 x = ${(curT * 10).toFixed(2)} | 原函数高度 f(x) = ${(Math.pow(curT, 1.5) * 10).toFixed(2)} | 面积累积导数 F'(x) ≡ f(x)`
    );

    // Axes
    const originX = pad;
    const originY = h - pad;
    const axisW = w - pad * 2;
    const axisH = h - pad * 2 - 40;

    ctx.strokeStyle = "#5A5A40";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + axisW, originY);
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX, originY - axisH);
    ctx.stroke();

    // Plot Curve y = f(x) = x^1.5
    ctx.strokeStyle = "#2E2B25";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const px = originX + t * axisW;
      const py = originY - Math.pow(t, 1.5) * axisH;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Dynamic Shaded Area under curve from 0 to curT
    ctx.fillStyle = "rgba(90, 90, 64, 0.25)";
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    for (let i = 0; i <= curT * 100; i++) {
      const t = i / 100;
      const px = originX + t * axisW;
      const py = originY - Math.pow(t, 1.5) * axisH;
      ctx.lineTo(px, py);
    }
    const endX = originX + curT * axisW;
    const endY = originY - Math.pow(curT, 1.5) * axisH;
    ctx.lineTo(endX, originY);
    ctx.closePath();
    ctx.fill();

    // Characteristic Differential Triangle at probe point
    const dx = 28;
    const dy = 28 * (1.5 * Math.sqrt(curT) * (axisH / axisW));

    ctx.fillStyle = "rgba(196, 164, 104, 0.5)";
    ctx.strokeStyle = "#843B20";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX + dx, endY);
    ctx.lineTo(endX + dx, endY - dy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Probe point Dot
    ctx.fillStyle = "#843B20";
    ctx.beginPath();
    ctx.arc(endX, endY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Characteristic Triangle Labels
    drawPointLabel(ctx, "dx", endX + dx / 2 - 6, endY + 14, "#5A5A40");
    drawPointLabel(ctx, "dy", endX + dx + 6, endY - dy / 2 + 4, "#843B20");
    drawPointLabel(ctx, "面积累积 F(x) = ∫₀ˣ f(t)dt", originX + 25, originY - 20, "#5A5A40");
    drawPointLabel(ctx, "切线斜率 dy/dx = f(x)", endX - 40, endY - dy - 12, "#425C3C");
  };

  // ==========================================
  // BREAKTHROUGH 4: NEWTON ORBIT DYNAMIC PROOF
  // ==========================================
  const drawNewtonDynamicOrbitProof = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    param: number,
    time: number
  ) => {
    const sunX = w * 0.38;
    const sunY = h / 2 + 35;
    const a = 175; // Semi-major axis
    const b = 100; // Semi-minor axis
    const centerOffsetX = w * 0.5;

    // Kepler Orbital physics: angle theta increases faster near Sun (perihelion)
    // Perihelion is at (centerOffsetX - a), Sun at sunX
    const orbitalAngle = time * 1.5;
    const planetX = centerOffsetX + a * Math.cos(orbitalAngle);
    const planetY = sunY + b * Math.sin(orbitalAngle);

    // Distance to sun
    const distToSun = Math.sqrt((planetX - sunX) ** 2 + (planetY - sunY) ** 2);
    const velocityMag = 180 / Math.max(40, distToSun);

    drawManuscriptPlaque(
      ctx,
      20,
      14,
      w - 40,
      64,
      "牛顿《原理》· 行星万有引力与流数轨道动力学",
      "太阳引力为向心力（二阶流数 ẍ, ÿ），不产生力矩，导出开普勒等面积定律与椭圆流数方程",
      `轨道角动量 L = r²·θ̇ ≡ 常数 | 即时引力矢 F ∝ 1/r² | 面积流数 Ȧ = (1/2)r²θ̇ 恒定`
    );

    // Sun at Focus
    ctx.fillStyle = "#C4A468";
    ctx.beginPath();
    ctx.arc(sunX, sunY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#843B20";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Sun Rays
    ctx.strokeStyle = "rgba(196, 164, 104, 0.6)";
    ctx.lineWidth = 1;
    for (let aDeg = 0; aDeg < 360; aDeg += 45) {
      const rad = (aDeg * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(sunX + Math.cos(rad) * 14, sunY + Math.sin(rad) * 14);
      ctx.lineTo(sunX + Math.cos(rad) * 20, sunY + Math.sin(rad) * 20);
      ctx.stroke();
    }

    // Ellipse Orbit Path
    ctx.strokeStyle = "#5A5A40";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(centerOffsetX, sunY, a, b, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Sweeping Sector Area ΔA (Kepler's 2nd Law)
    const sweepSpan = 0.35;
    ctx.fillStyle = "rgba(90, 90, 64, 0.35)";
    ctx.beginPath();
    ctx.moveTo(sunX, sunY);
    for (let sa = 0; sa <= 20; sa++) {
      const curA = orbitalAngle - sweepSpan + (sa / 20) * sweepSpan;
      const px = centerOffsetX + a * Math.cos(curA);
      const py = sunY + b * Math.sin(curA);
      ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Planet Body
    ctx.fillStyle = "#425C3C";
    ctx.beginPath();
    ctx.arc(planetX, planetY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#EAE7DF";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Velocity Vector (1st Fluxion ṙ)
    const vx = -Math.sin(orbitalAngle) * velocityMag * 14;
    const vy = Math.cos(orbitalAngle) * (b / a) * velocityMag * 14;
    ctx.strokeStyle = "#425C3C";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(planetX, planetY);
    ctx.lineTo(planetX + vx, planetY + vy);
    ctx.stroke();

    // Central Gravitational Force Vector (2nd Fluxion r̈ pointing to Sun)
    const fx = (sunX - planetX) * 0.25;
    const fy = (sunY - planetY) * 0.25;
    ctx.strokeStyle = "#843B20";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(planetX, planetY);
    ctx.lineTo(planetX + fx, planetY + fy);
    ctx.stroke();

    drawPointLabel(ctx, "太阳焦点 S", sunX - 35, sunY + 28, "#843B20");
    drawPointLabel(ctx, "扫过微元面积 ΔA (相等时间扫过等面积)", sunX + 35, sunY - 20, "#5A5A40");
    drawPointLabel(ctx, "速度一阶流数 v = ṙ", planetX + vx + 4, planetY + vy, "#425C3C");
  };

  // ==========================================
  // BREAKTHROUGH 5: LEIBNIZ PRODUCT RULE DYNAMIC PROOF
  // ==========================================
  const drawLeibnizDynamicProductProof = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    param: number,
    time: number
  ) => {
    const cx = w / 2 - 90;
    const cy = h / 2 - 20;

    // Expanding u and v dimensions
    const u = 170;
    const v = 105;
    const du = 25 + param * 30; // animated differential increment
    const dv = 20 + param * 25;

    drawManuscriptPlaque(
      ctx,
      20,
      14,
      w - 40,
      64,
      "莱布尼茨乘积法则几何拆解: d(uv) = u dv + v du (+ du dv)",
      "将矩形面积微分增量拆解为长条条带与角隅二阶高阶微元，直观论证 du·dv 为何可忽略",
      `即时微增量 du = ${du.toFixed(1)}, dv = ${dv.toFixed(1)} | 一阶项: u·dv + v·du | 二阶微元: du·dv (高阶无穷小，舍去)`
    );

    // 1. Main Rectangle: u * v
    ctx.fillStyle = "rgba(90, 90, 64, 0.35)";
    ctx.strokeStyle = "#5A5A40";
    ctx.lineWidth = 2;
    ctx.fillRect(cx, cy, u, v);
    ctx.strokeRect(cx, cy, u, v);

    // 2. Bottom Strip: u * dv
    ctx.fillStyle = "rgba(66, 92, 60, 0.4)";
    ctx.strokeStyle = "#425C3C";
    ctx.fillRect(cx, cy + v, u, dv);
    ctx.strokeRect(cx, cy + v, u, dv);

    // 3. Right Strip: v * du
    ctx.fillStyle = "rgba(196, 164, 104, 0.45)";
    ctx.strokeStyle = "#A48648";
    ctx.fillRect(cx + u, cy, du, v);
    ctx.strokeRect(cx + u, cy, du, v);

    // 4. Corner 2nd-order micro square: du * dv
    ctx.fillStyle = "rgba(180, 83, 9, 0.35)";
    ctx.strokeStyle = "#B45309";
    ctx.setLineDash([3, 3]);
    ctx.fillRect(cx + u, cy + v, du, dv);
    ctx.strokeRect(cx + u, cy + v, du, dv);
    ctx.setLineDash([]);

    // Visual brackets and dimension marks
    drawPointLabel(ctx, `原面积 u·v = ${(u * v).toFixed(0)}`, cx + u / 2 - 35, cy + v / 2, "#5A5A40");
    drawPointLabel(ctx, `一阶微分 u·dv`, cx + u / 2 - 25, cy + v + dv / 2 + 5, "#425C3C");
    drawPointLabel(ctx, `一阶微分 v·du`, cx + u + 8, cy + v / 2, "#A48648");
    drawPointLabel(ctx, `du·dv (二阶无限小，忽略)`, cx + u + 8, cy + v + dv / 2 + 6, "#B45309");
  };

  // ==========================================
  // BREAKTHROUGH 6: CAUCHY RIGOUR DYNAMIC PROOF
  // ==========================================
  const drawCauchyDynamicRigourProof = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    param: number,
    time: number
  ) => {
    // Interactive epsilon dynamically controls delta corridor
    const eps = 20 + param * 45; // epsilon corridor height
    const delta = eps * 1.1; // delta corridor width

    const padX = 80;
    const padY = 55;
    const x0 = w / 2;
    const y0 = h / 2 + 35;

    drawManuscriptPlaque(
      ctx,
      20,
      14,
      w - 40,
      64,
      "柯西-魏尔斯特拉斯 (ε, δ) 严格极限动态邻域",
      "任意给定误差范围 ε > 0，均存在对应控制域 δ > 0，使得 0 < |x - x₀| < δ 时恒有 |f(x) - L| < ε",
      `当前 ε 目标带 = ±${eps.toFixed(1)} | 对应 δ 控制带 = ±${delta.toFixed(1)} | 动态探针约束成功率: 100% (严格收敛)`
    );

    // Epsilon Strip Corridor (Horizontal)
    ctx.fillStyle = "rgba(66, 92, 60, 0.18)";
    ctx.fillRect(padX, y0 - eps, w - padX * 2, eps * 2);
    ctx.strokeStyle = "#425C3C";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(padX, y0 - eps, w - padX * 2, eps * 2);

    // Delta Strip Corridor (Vertical)
    ctx.fillStyle = "rgba(90, 90, 64, 0.18)";
    ctx.fillRect(x0 - delta, padY + 30, delta * 2, h - padY * 2);
    ctx.strokeStyle = "#5A5A40";
    ctx.strokeRect(x0 - delta, padY + 30, delta * 2, h - padY * 2);
    ctx.setLineDash([]);

    // Curve f(x)
    ctx.strokeStyle = "#2E2B25";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const px = padX + (i / 100) * (w - padX * 2);
      const relX = (px - x0) / 140;
      const relY = relX * 0.9;
      const py = y0 - relY * 90;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Moving Probe Particle x inside delta
    const probeOffset = Math.sin(time * 3) * (delta * 0.75);
    const probeX = x0 + probeOffset;
    const probeY = y0 - (probeOffset / 140) * 0.9 * 90;

    // Probe point on curve
    ctx.fillStyle = "#843B20";
    ctx.beginPath();
    ctx.arc(probeX, probeY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Projection Lines to axes
    ctx.strokeStyle = "rgba(132, 59, 32, 0.6)";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(probeX, probeY);
    ctx.lineTo(probeX, y0);
    ctx.moveTo(probeX, probeY);
    ctx.lineTo(x0, probeY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Limit Target Center L
    ctx.fillStyle = "#425C3C";
    ctx.beginPath();
    ctx.arc(x0, y0, 6, 0, Math.PI * 2);
    ctx.fill();

    drawPointLabel(ctx, "极限目标点 (x₀, L)", x0 + 10, y0 - 10, "#425C3C");
    drawPointLabel(ctx, `目标 ε 误差带: (L - ε, L + ε)`, padX + 10, y0 - eps - 6, "#425C3C");
    drawPointLabel(ctx, `控制 δ 邻域: (x₀ - δ, x₀ + δ)`, x0 - delta - 10, h - padY + 16, "#5A5A40");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-[#F0EEE6] border border-[#D4C5B0] rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-serif bg-[#E8E4D9] text-[#7A7468] border border-[#D4C5B0] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>核心模块 5 · 六大里程碑突破动态演播厅 (Dynamic Interactive Breakthroughs)</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#3D3D3D]">
              人类智慧的六大巅峰突破 · 60FPS 动态流体演播
            </h2>
            <p className="text-xs sm:text-sm text-[#7A7468] font-serif mt-1 max-w-4xl">
              深度强化动态交互动画：阿基米德天平力矩平衡与三体截面扫掠、费马伪等法极值摄动、巴罗特征三角形、牛顿流数天体椭圆引力轨道、莱布尼茨乘积微元与柯西
              $(\varepsilon, \delta)$ 邻域约束。
            </p>
          </div>
        </div>
      </div>

      {/* Six Breakthrough Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {SIX_BREAKTHROUGHS.map((item, idx) => {
          const isSelected = selectedIndex === idx;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedIndex(idx)}
              className={`p-3 rounded-lg border text-left transition-all relative cursor-pointer ${
                isSelected
                  ? "bg-[#5A5A40] text-white border-[#5A5A40] shadow-sm ring-2 ring-[#5A5A40]/30"
                  : "bg-white hover:bg-[#F0EEE6] text-[#3D3D3D] border-[#D4C5B0]"
              }`}
            >
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded inline-block mb-1 ${
                  isSelected ? "bg-[#EAE7DF] text-[#5A5A40]" : "bg-[#E8E4D9] text-[#7A7468]"
                }`}
              >
                突破 0{item.number}
              </span>
              <h4 className="font-serif font-bold text-xs line-clamp-1">{item.inventor}</h4>
              <p
                className={`text-[11px] line-clamp-1 ${
                  isSelected ? "text-[#E8E4D9]" : "text-[#8E887B]"
                }`}
              >
                {item.title}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Milestone Detailed Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Dynamic Interactive Canvas & Controls */}
        <div className="lg:col-span-2 bg-white border border-[#D4C5B0] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE7DF]">
            <div>
              <span className="text-xs font-mono font-bold text-[#5A5A40]">
                突破 0{currentItem.number} · {currentItem.era}
              </span>
              <h3 className="font-serif text-lg font-bold text-[#3D3D3D]">
                {currentItem.title}
              </h3>
            </div>

            {/* Archimedes Specific Mode Switcher */}
            {selectedIndex === 0 && (
              <div className="flex bg-[#EAE7DF] p-1 rounded-lg border border-[#D4C5B0] text-xs font-serif shrink-0">
                <button
                  onClick={() => setArchimedesSubMode("lever_balance")}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center space-x-1 ${
                    archimedesSubMode === "lever_balance"
                      ? "bg-[#5A5A40] text-white font-medium shadow-xs"
                      : "text-[#7A7468] hover:text-[#3D3D3D]"
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>天平杠杆平衡</span>
                </button>
                <button
                  onClick={() => setArchimedesSubMode("cross_section")}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center space-x-1 ${
                    archimedesSubMode === "cross_section"
                      ? "bg-[#5A5A40] text-white font-medium shadow-xs"
                      : "text-[#7A7468] hover:text-[#3D3D3D]"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>三体截面扫掠</span>
                </button>
                <button
                  onClick={() => setArchimedesSubMode("discrete_slices")}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center space-x-1 ${
                    archimedesSubMode === "discrete_slices"
                      ? "bg-[#5A5A40] text-white font-medium shadow-xs"
                      : "text-[#7A7468] hover:text-[#3D3D3D]"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>微元薄片堆叠</span>
                </button>
              </div>
            )}
          </div>

          {/* Main 60FPS Render Canvas */}
          <div className="w-full aspect-[16/9] bg-[#F9F7F2] rounded-lg border border-[#D4C5B0] overflow-hidden shadow-inner relative">
            <canvas ref={canvasRef} width={760} height={430} className="w-full h-full object-contain" />
          </div>

          {/* Continuous Dynamic Animation Controls Toolbar */}
          <div className="bg-[#FAF8F2] p-3 rounded-xl border border-[#D4C5B0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-serif">
            {/* Play/Pause & Speed */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer shadow-xs transition-all ${
                  isPlaying
                    ? "bg-[#5A5A40] text-white hover:opacity-90"
                    : "bg-[#8E887B] text-white hover:opacity-90"
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? "暂停动画" : "播放动画"}</span>
              </button>

              <div className="flex items-center bg-[#EAE7DF] rounded-lg p-0.5 border border-[#D4C5B0]">
                {[
                  { speed: 0.5, label: "0.5x" },
                  { speed: 1.0, label: "1.0x" },
                  { speed: 2.0, label: "2.0x" },
                ].map((s) => (
                  <button
                    key={s.speed}
                    onClick={() => setAnimSpeed(s.speed)}
                    className={`px-2 py-1 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                      animSpeed === s.speed
                        ? "bg-[#5A5A40] text-white font-bold"
                        : "text-[#7A7468] hover:text-[#3D3D3D]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Scrubber Slider */}
            <div className="flex items-center space-x-2 w-full sm:w-auto flex-1 max-w-xs">
              <Sliders className="w-3.5 h-3.5 text-[#5A5A40] shrink-0" />
              <span className="text-[11px] text-[#7A7468] shrink-0">参数手控:</span>
              <input
                type="range"
                min="0.02"
                max="0.98"
                step="0.01"
                value={manualParam}
                onChange={(e) => {
                  setIsPlaying(false);
                  setManualParam(parseFloat(e.target.value));
                }}
                className="w-full h-1.5 bg-[#EAE7DF] rounded-lg appearance-none cursor-pointer accent-[#5A5A40]"
              />
              <span className="text-[11px] font-mono font-bold text-[#5A5A40] shrink-0">
                {(manualParam * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Step Progress Checklist */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-serif font-bold text-[#3D3D3D] flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>几何证明推导步骤拆解：</span>
            </span>

            <div className="space-y-1.5">
              {currentItem.proofSteps.map((st, i) => {
                const isActive = currentStep === i;
                return (
                  <div
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`p-2.5 rounded-lg text-xs font-serif cursor-pointer transition-all flex items-start space-x-2.5 ${
                      isActive
                        ? "bg-[#5A5A40] text-white shadow-xs font-medium"
                        : "bg-[#F9F7F2] text-[#555555] hover:bg-[#F0EEE6]"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded mt-0.5 ${
                        isActive
                          ? "bg-[#EAE7DF] text-[#5A5A40] font-bold"
                          : "bg-[#E8E4D9] text-[#7A7468]"
                      }`}
                    >
                      0{i + 1}
                    </span>
                    <span className="leading-relaxed">{st}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Academic Context, Ancient Quote & Math Formula */}
        <div className="bg-white border border-[#D4C5B0] rounded-xl p-5 shadow-sm space-y-4 text-xs font-serif">
          <div>
            <span className="text-xs font-bold text-[#3D3D3D] uppercase tracking-wider block mb-1">
              核心思想形式化表达
            </span>
            <div className="bg-[#F0EEE6] p-3.5 rounded-lg border border-[#D4C5B0] text-[#3D3D3D]">
              <MathView math={currentItem.formalFormula} block={true} />
            </div>
          </div>

          <div>
            <span className="font-bold text-[#3D3D3D] block mb-1">历史背景与动机：</span>
            <p className="text-[#555555] leading-relaxed">
              {currentItem.historicalContext}
            </p>
          </div>

          <div>
            <span className="font-bold text-[#3D3D3D] block mb-1">核心突破洞察：</span>
            <p className="text-[#555555] leading-relaxed">{currentItem.coreIdea}</p>
          </div>

          {/* Ancient Quote */}
          <div className="bg-[#F0EEE6] p-3.5 rounded-lg border border-[#D4C5B0] text-[#5A5A40] space-y-1">
            <div className="flex items-center space-x-1.5 text-xs font-bold">
              <Quote className="w-3.5 h-3.5" />
              <span>古籍经典原话：</span>
            </div>
            <p className="text-[11px] italic leading-relaxed">
              {currentItem.ancientQuote}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
