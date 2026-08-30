import React, { useState, useRef, useEffect } from "react";
import { SandboxType } from "../types";
import { MathView } from "./MathView";
import {
  Compass,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Sparkles,
  Info,
  Maximize2,
} from "lucide-react";

export const SandboxModule: React.FC = () => {
  const [activeSandbox, setActiveSandbox] =
    useState<SandboxType>("archimedes_parabola");

  // Archimedes Parabola State
  const [parabolaDepth, setParabolaDepth] = useState<number>(3); // 0 to 4
  const [showSlices, setShowSlices] = useState<boolean>(true);

  // Kepler Barrel State
  const [barrelSlices, setBarrelSlices] = useState<number>(16); // 4 to 80
  const [barrelCurvature, setBarrelCurvature] = useState<number>(0.4);

  // Cavalieri State
  const [cavalieriHeight, setCavalieriHeight] = useState<number>(50); // 0 to 100%
  const [cavalieriDisks, setCavalieriDisks] = useState<number>(24);
  const [cavalieriShear, setCavalieriShear] = useState<number>(45);

  // Barrow / Differential Triangle State
  const [tangentX, setTangentX] = useState<number>(0.6);
  const [dxMicro, setDxMicro] = useState<number>(0.3); // approaching 0
  const [zoomMicro, setZoomMicro] = useState<boolean>(false);

  // Play animation state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const animRef = useRef<number | null>(null);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animation Loop
  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    let forward = true;
    const interval = setInterval(() => {
      if (activeSandbox === "archimedes_parabola") {
        setParabolaDepth((prev) => {
          if (prev >= 4) return 0;
          return prev + 1;
        });
      } else if (activeSandbox === "kepler_barrel") {
        setBarrelSlices((prev) => {
          if (prev >= 60) return 6;
          return prev + 4;
        });
      } else if (activeSandbox === "cavalieri_principle") {
        setCavalieriHeight((prev) => {
          if (prev >= 95) forward = false;
          if (prev <= 5) forward = true;
          return forward ? prev + 3 : prev - 3;
        });
      } else if (activeSandbox === "barrow_tangent") {
        setDxMicro((prev) => {
          if (prev <= 0.03) return 0.5;
          return prev * 0.85;
        });
      }
    }, 600);

    return () => clearInterval(interval);
  }, [isPlaying, activeSandbox]);

  // Render Canvas when params change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 2, 2.5);
    const width = 760;
    const height = 475;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Reset canvas with ancient parchment background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#FAF8F2";
    ctx.fillRect(0, 0, width, height);

    // Draw subtle academic coordinate grid
    ctx.strokeStyle = "rgba(212, 197, 176, 0.4)";
    ctx.lineWidth = 0.8;
    for (let x = 0; x < width; x += 28) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 28) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Outer subtle border
    ctx.strokeStyle = "rgba(180, 160, 130, 0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, width - 16, height - 16);

    if (activeSandbox === "archimedes_parabola") {
      drawArchimedesParabola(ctx, width, height, parabolaDepth, showSlices);
    } else if (activeSandbox === "kepler_barrel") {
      drawKeplerBarrel(ctx, width, height, barrelSlices, barrelCurvature);
    } else if (activeSandbox === "cavalieri_principle") {
      drawCavalieriPrinciple(
        ctx,
        width,
        height,
        cavalieriHeight / 100,
        cavalieriDisks,
        cavalieriShear
      );
    } else if (activeSandbox === "barrow_tangent") {
      drawBarrowTangent(ctx, width, height, tangentX, dxMicro, zoomMicro);
    }

    ctx.restore();
  }, [
    activeSandbox,
    parabolaDepth,
    showSlices,
    barrelSlices,
    barrelCurvature,
    cavalieriHeight,
    cavalieriDisks,
    cavalieriShear,
    tangentX,
    dxMicro,
    zoomMicro,
  ]);

  // Helper to draw rounded rectangles
  const drawRoundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
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
  };

  // Helper for drawing elegant manuscript header cards on canvas
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
    // Card background
    ctx.fillStyle = "rgba(245, 241, 232, 0.94)";
    ctx.strokeStyle = "#D4C5B0";
    ctx.lineWidth = 1;
    drawRoundRect(ctx, x, y, w, h, 6);
    ctx.fill();
    ctx.stroke();

    // Decorative inner gold line
    ctx.strokeStyle = "rgba(90, 90, 64, 0.2)";
    ctx.lineWidth = 0.6;
    drawRoundRect(ctx, x + 3, y + 3, w - 6, h - 6, 4);
    ctx.stroke();

    // Title in classical serif typography
    ctx.fillStyle = "#2E2B25";
    ctx.font = "600 13.5px 'Noto Serif SC', 'Songti SC', serif";
    ctx.fillText(title, x + 14, y + 21);

    // Subtitle
    ctx.fillStyle = "#6B6557";
    ctx.font = "400 11px 'Noto Serif SC', 'Songti SC', serif";
    ctx.fillText(subTitle, x + 14, y + 38);

    // Parameter Badge
    if (paramBadge) {
      ctx.fillStyle = "#425C3C";
      ctx.font = "500 11px 'Fira Code', ui-monospace, monospace";
      ctx.fillText(paramBadge, x + 14, y + 55);
    }
    ctx.restore();
  };

  // Helper for drawing crisp math & coordinate labels
  const drawPointLabel = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    color: string = "#2E2B25",
    bgColor: string = "rgba(255, 255, 255, 0.92)"
  ) => {
    ctx.save();
    ctx.font = "600 11px 'Fira Code', 'Noto Serif SC', monospace";
    const textWidth = ctx.measureText(text).width;
    const padH = 6;
    const padV = 3;

    ctx.fillStyle = bgColor;
    ctx.strokeStyle = "#D4C5B0";
    ctx.lineWidth = 0.8;
    drawRoundRect(ctx, x - padH, y - 10 - padV, textWidth + padH * 2, 13 + padV * 2, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  };

  // DRAW SANDBOX 1: Archimedes Quadrature of Parabola
  const drawArchimedesParabola = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    depth: number,
    slices: boolean
  ) => {
    const padX = 70;
    const padY = 55;
    const plotW = w - padX * 2;
    const plotH = h - padY * 2 - 40;

    const mapX = (x: number) => padX + x * plotW;
    const mapY = (y: number) => h - padY - y * plotH;

    // Parabola: y = 4 * x * (1 - x), x in [0, 1]
    const f = (x: number) => 4 * x * (1 - x);

    // Draw coordinate base line
    ctx.strokeStyle = "#8A7A60";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mapX(0), mapY(0));
    ctx.lineTo(mapX(1), mapY(0));
    ctx.stroke();

    // Slicing fills if enabled
    if (slices && depth > 0) {
      const sliceCount = Math.pow(2, depth + 1);
      const dx = 1 / sliceCount;
      ctx.fillStyle = "rgba(90, 90, 64, 0.08)";
      for (let i = 0; i < sliceCount; i++) {
        const x1 = i * dx;
        const x2 = (i + 1) * dx;
        const y1 = f(x1);
        const y2 = f(x2);
        ctx.beginPath();
        ctx.moveTo(mapX(x1), mapY(0));
        ctx.lineTo(mapX(x1), mapY(y1));
        ctx.lineTo(mapX(x2), mapY(y2));
        ctx.lineTo(mapX(x2), mapY(0));
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(90, 90, 64, 0.22)";
        ctx.stroke();
      }
    }

    // Draw main Parabola curve
    ctx.strokeStyle = "#2D2922";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let px = 0; px <= 100; px++) {
      const x = px / 100;
      const y = f(x);
      if (px === 0) ctx.moveTo(mapX(x), mapY(y));
      else ctx.lineTo(mapX(x), mapY(y));
    }
    ctx.stroke();

    // Recursive Triangles Breakdown
    const colors = [
      "rgba(90, 90, 64, 0.35)", // T0 Main Triangle
      "rgba(142, 136, 123, 0.4)", // T1
      "rgba(66, 92, 60, 0.4)", // T2
      "rgba(196, 164, 104, 0.45)", // T3
      "rgba(102, 90, 72, 0.45)", // T4
    ];

    function drawTriangles(xL: number, xR: number, d: number) {
      if (d > depth) return;
      const xM = (xL + xR) / 2;
      const yL = f(xL);
      const yR = f(xR);
      const yM = f(xM);

      ctx.fillStyle = colors[d % colors.length];
      ctx.strokeStyle = "#3D3D3D";
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      ctx.moveTo(mapX(xL), mapY(yL));
      ctx.lineTo(mapX(xM), mapY(yM));
      ctx.lineTo(mapX(xR), mapY(yR));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Vertex dots
      ctx.fillStyle = "#5A5A40";
      ctx.beginPath();
      ctx.arc(mapX(xM), mapY(yM), 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Recurse left and right
      drawTriangles(xL, xM, d + 1);
      drawTriangles(xM, xR, d + 1);
    }

    drawTriangles(0, 1, 0);

    // Calculate current ratio
    const currentSumRatio =
      (Array.from({ length: depth + 1 }).reduce<number>(
        (acc, _, k) => acc + Math.pow(0.25, k),
        0
      ) /
        (4 / 3)) *
      100;

    // Header Plaque
    drawManuscriptPlaque(
      ctx,
      20,
      18,
      w - 40,
      68,
      "阿基米德抛物线弓形穷竭割补 (Quadrature of the Parabola)",
      "公元前240年《抛物线求积》· 递归内接三角形与等比级数公比 1/4 求和",
      `递归细分阶数 n = ${depth} 阶  |  内接三角形总数: ${Math.pow(2, depth + 1) - 1} 个  |  逼近真实弓形面积比例: ${currentSumRatio.toFixed(2)}%`
    );

    // In-diagram annotations
    drawPointLabel(ctx, "A(0,0)", mapX(0) - 10, mapY(0) + 20, "#3D3D3D");
    drawPointLabel(ctx, "B(1,0)", mapX(1) - 20, mapY(0) + 20, "#3D3D3D");
    drawPointLabel(ctx, "顶点 C(1/2, 1)", mapX(0.5) - 38, mapY(1) - 10, "#5A5A40");
    drawPointLabel(ctx, "弦 AB (底边)", mapX(0.5) - 30, mapY(0) + 20, "#7A7468");
  };

  // DRAW SANDBOX 2: Kepler Wine Barrel Infinitesimal Cylindrical Slices
  const drawKeplerBarrel = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    slices: number,
    curvature: number
  ) => {
    const cx = w / 2;
    const cy = h / 2 + 35;
    const barrelH = h * 0.52;
    const R_mid = 135;
    const R_top = R_mid * (1 - curvature * 0.45);

    const rAt = (yNorm: number) => {
      // yNorm in [-1, 1]
      return R_top + (R_mid - R_top) * (1 - yNorm * yNorm);
    };

    const dh = barrelH / slices;

    // Draw Slices (Cylinders)
    for (let i = 0; i < slices; i++) {
      const yBottom = -barrelH / 2 + i * dh;
      const yTop = yBottom + dh;
      const yMid = (yBottom + yTop) / 2;
      const yNorm = yMid / (barrelH / 2);
      const r = rAt(yNorm);

      const scrY = cy + yBottom;
      const scrH = dh;

      // Slice disk fill (with natural tones parchment gradient)
      const grad = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
      grad.addColorStop(0, "rgba(90, 90, 64, 0.35)");
      grad.addColorStop(0.5, "rgba(235, 228, 212, 0.85)");
      grad.addColorStop(1, "rgba(120, 114, 98, 0.45)");

      ctx.fillStyle = grad;
      ctx.fillRect(cx - r, scrY, r * 2, scrH);

      // Slice top ellipse (3D disk perspective)
      ctx.strokeStyle = "rgba(90, 85, 70, 0.5)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(cx, scrY, r, r * 0.16, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Slicing outline
      ctx.strokeStyle = "rgba(90, 90, 64, 0.3)";
      ctx.strokeRect(cx - r, scrY, r * 2, scrH);
    }

    // Outer smooth silhouette curve (Kepler's ideal continuous barrel)
    ctx.strokeStyle = "#5A5A40";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let yi = -barrelH / 2; yi <= barrelH / 2; yi += 2) {
      const yNorm = yi / (barrelH / 2);
      const r = rAt(yNorm);
      if (yi === -barrelH / 2) ctx.moveTo(cx - r, cy + yi);
      else ctx.lineTo(cx - r, cy + yi);
    }
    ctx.stroke();

    ctx.beginPath();
    for (let yi = -barrelH / 2; yi <= barrelH / 2; yi += 2) {
      const yNorm = yi / (barrelH / 2);
      const r = rAt(yNorm);
      if (yi === -barrelH / 2) ctx.moveTo(cx + r, cy + yi);
      else ctx.lineTo(cx + r, cy + yi);
    }
    ctx.stroke();

    // Central Axis
    ctx.strokeStyle = "#7A7468";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, cy - barrelH / 2 - 25);
    ctx.lineTo(cx, cy + barrelH / 2 + 25);
    ctx.stroke();
    ctx.setLineDash([]);

    // Header Plaque
    drawManuscriptPlaque(
      ctx,
      20,
      18,
      w - 40,
      68,
      "开普勒酒桶旋转体积测定 (Kepler's Infinitesimal Cylindrical Slices)",
      "1615年《酒桶的新立体几何》(Nova Stereometria Doliorum Vinariorum) · 连续旋转体微元法",
      `圆盘薄切片数 N = ${slices} 片  |  单片厚度 Δh = ${(barrelH / slices).toFixed(1)}px  |  微元体积 dV = π · r(y)² · dy`
    );

    // In-diagram measurement labels
    drawPointLabel(ctx, `桶口半径 R_top = ${R_top.toFixed(0)}px`, cx + R_top + 10, cy - barrelH / 2 + 5, "#5A5A40");
    drawPointLabel(ctx, `鼓腹最大半径 R_mid = ${R_mid.toFixed(0)}px`, cx + R_mid + 10, cy, "#425C3C");
    drawPointLabel(ctx, "y 轴 (旋转对称轴)", cx - 45, cy + barrelH / 2 + 18, "#7A7468");
    drawPointLabel(ctx, `连续母线 r(y) = R_top + (R_mid - R_top)(1 - y²)`, cx - R_mid - 180, cy, "#3D3D3D");
  };

  // DRAW SANDBOX 3: Cavalieri's Principle & Slice Shearing
  const drawCavalieriPrinciple = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    hNorm: number, // 0 to 1
    slices: number,
    shearDeg: number
  ) => {
    const pad = 40;
    const totalH = h * 0.52;
    const startY = h * 0.88;
    const baseW = 100;
    const dh = totalH / slices;

    const leftCX = w * 0.28;
    const rightCX = w * 0.72;

    // 1. Left Stack (Straight Coin Stack / Prism)
    ctx.fillStyle = "rgba(90, 90, 64, 0.3)";
    ctx.strokeStyle = "#5A5A40";
    ctx.lineWidth = 1;
    for (let i = 0; i < slices; i++) {
      const y = startY - (i + 1) * dh;
      ctx.fillRect(leftCX - baseW / 2, y, baseW, dh);
      ctx.strokeRect(leftCX - baseW / 2, y, baseW, dh);
    }

    // 2. Right Stack (Sheared Parallelogram / Coin Stack)
    const maxShearX = Math.tan((shearDeg * Math.PI) / 180) * totalH * 0.35;
    ctx.fillStyle = "rgba(66, 92, 60, 0.3)";
    ctx.strokeStyle = "#425C3C";
    for (let i = 0; i < slices; i++) {
      const progress = i / slices;
      const offsetX = Math.sin(progress * Math.PI) * maxShearX;
      const y = startY - (i + 1) * dh;
      ctx.fillRect(rightCX - baseW / 2 + offsetX, y, baseW, dh);
      ctx.strokeRect(rightCX - baseW / 2 + offsetX, y, baseW, dh);
    }

    // Horizontal Active Scan Slice Plane
    const scanY = startY - hNorm * totalH;
    ctx.strokeStyle = "#5A5A40";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(pad, scanY);
    ctx.lineTo(w - pad, scanY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Highlight cross-sectional slices on both bodies
    ctx.fillStyle = "rgba(90, 90, 64, 0.85)";
    ctx.fillRect(leftCX - baseW / 2, scanY - 3, baseW, 6);

    const activeProgress = hNorm;
    const activeOffset = Math.sin(activeProgress * Math.PI) * maxShearX;
    ctx.fillRect(rightCX - baseW / 2 + activeOffset, scanY - 3, baseW, 6);

    // Header Plaque
    drawManuscriptPlaque(
      ctx,
      20,
      18,
      w - 40,
      68,
      "卡瓦列利不可分量原理 (Cavalieri's Principle: 幂势既同 则积不容异)",
      "1635年《不可分量几何学》· 截面积处处相等则两几何体体积恒等",
      `扫描高度截线 y = ${(hNorm * 100).toFixed(0)}%  |  等高截面面积 A₁(y) ≡ A₂(y) = ${baseW}px  |  离散切片数 N = ${slices} 层`
    );

    // In-diagram annotations
    drawPointLabel(ctx, "正立柱体堆叠 (V₁ = ∫ A₁(y)dy)", leftCX - 75, startY + 22, "#5A5A40");
    drawPointLabel(ctx, "侧向倾斜形变堆叠 (V₂ = ∫ A₂(y)dy)", rightCX - 85, startY + 22, "#425C3C");
    drawPointLabel(ctx, `扫描截面 A₁(h) ≡ A₂(h)`, w / 2 - 60, scanY - 10, "#3D3D3D");
  };

  // DRAW SANDBOX 4: Barrow Characteristic Triangle & Differential Slicing
  const drawBarrowTangent = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    x0: number,
    dx: number,
    zoom: boolean
  ) => {
    const padX = 80;
    const padY = 55;
    const plotW = w - padX * 2;
    const plotH = h - padY * 2 - 40;

    const f = (x: number) => 0.8 * x * x + 0.15;
    const fPrime = (x: number) => 1.6 * x;

    const mapX = (x: number) => padX + x * plotW;
    const mapY = (y: number) => h - padY - y * plotH;

    // Draw Axes
    ctx.strokeStyle = "#8A7A60";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padX - 10, h - padY);
    ctx.lineTo(w - padX + 10, h - padY);
    ctx.moveTo(padX, h - padY + 10);
    ctx.lineTo(padX, padY + 30);
    ctx.stroke();

    // Axis arrows
    ctx.fillStyle = "#8A7A60";
    ctx.beginPath();
    ctx.moveTo(w - padX + 12, h - padY);
    ctx.lineTo(w - padX + 4, h - padY - 4);
    ctx.lineTo(w - padX + 4, h - padY + 4);
    ctx.fill();

    // Draw Curve y = f(x)
    ctx.strokeStyle = "#5A5A40";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let px = 0; px <= 100; px++) {
      const x = px / 100;
      const y = f(x);
      if (px === 0) ctx.moveTo(mapX(x), mapY(y));
      else ctx.lineTo(mapX(x), mapY(y));
    }
    ctx.stroke();

    // Points P(x0, f(x0)) and Q(x0+dx, f(x0+dx))
    const x1 = Math.min(x0 + dx, 0.95);
    const y0 = f(x0);
    const y1 = f(x1);

    const px0 = mapX(x0);
    const py0 = mapY(y0);
    const px1 = mapX(x1);
    const py1 = mapY(y1);

    // Secant Line
    ctx.strokeStyle = "rgba(142, 136, 123, 0.8)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    const secSlope = (y1 - y0) / (x1 - x0);
    ctx.moveTo(mapX(x0 - 0.2), mapY(y0 - 0.2 * secSlope));
    ctx.lineTo(mapX(x1 + 0.2), mapY(y1 + 0.2 * secSlope));
    ctx.stroke();
    ctx.setLineDash([]);

    // True Tangent Line at P
    const tanSlope = fPrime(x0);
    ctx.strokeStyle = "#425C3C";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mapX(x0 - 0.25), mapY(y0 - 0.25 * tanSlope));
    ctx.lineTo(mapX(x0 + 0.25), mapY(y0 + 0.25 * tanSlope));
    ctx.stroke();

    // Differential Characteristic Triangle (P, (x1, y0), Q)
    ctx.fillStyle = "rgba(90, 90, 64, 0.22)";
    ctx.strokeStyle = "#5A5A40";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px0, py0);
    ctx.lineTo(px1, py0);
    ctx.lineTo(px1, py1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Points
    ctx.fillStyle = "#425C3C";
    ctx.beginPath();
    ctx.arc(px0, py0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#8E887B";
    ctx.beginPath();
    ctx.arc(px1, py1, 5, 0, Math.PI * 2);
    ctx.fill();

    // Header Plaque
    drawManuscriptPlaque(
      ctx,
      20,
      18,
      w - 40,
      68,
      "巴罗特征三角形与微分割线微商逼近 (Barrow's Characteristic Triangle)",
      "1670年《几何学讲义》· 微分特征三角形 (dx, dy, ds) 与切线极限",
      `切点 P(${x0.toFixed(2)}, ${y0.toFixed(2)})  |  切线斜率 f'(x₀) = ${tanSlope.toFixed(3)}  |  差商 Δy/Δx = ${secSlope.toFixed(3)}  |  逼近误差 = ${Math.abs(secSlope - tanSlope).toFixed(4)}`
    );

    // In-diagram labels
    drawPointLabel(ctx, `P(${x0.toFixed(2)}, ${y0.toFixed(2)})`, px0 - 75, py0 - 10, "#425C3C");
    drawPointLabel(ctx, `Q(${x1.toFixed(2)}, ${y1.toFixed(2)})`, px1 + 10, py1 - 10, "#8E887B");
    drawPointLabel(ctx, `Δx = ${(x1 - x0).toFixed(2)}`, (px0 + px1) / 2 - 25, py0 + 18, "#5A5A40");
    drawPointLabel(ctx, `Δy = ${(y1 - y0).toFixed(2)}`, px1 + 10, (py0 + py1) / 2, "#5A5A40");
    drawPointLabel(ctx, "理论切线 T (斜率 f')", mapX(x0 + 0.15), mapY(y0 + 0.15 * tanSlope) - 10, "#425C3C");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-[#F0EEE6] border border-[#D4C5B0] rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-serif bg-[#E8E4D9] text-[#7A7468] border border-[#D4C5B0] mb-2">
              <Compass className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>核心模块 2 · 2D 历史古籍与几何证明沙盒（多用切片）</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#3D3D3D]">
              古图交互演算与无限切片逼近沙盒
            </h2>
            <p className="text-xs sm:text-sm text-[#7A7468] font-serif mt-1">
              交互拖拽历史时间轴与切片参数，动态重现阿基米德抛物线割补、开普勒酒桶薄片、卡瓦列利不可分量及巴罗特征三角形。
            </p>
          </div>

          {/* Sandbox Selector */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "archimedes_parabola", label: "阿基米德抛物线弓形" },
              { id: "kepler_barrel", label: "开普勒酒桶切片" },
              { id: "cavalieri_principle", label: "卡瓦列利不可分量" },
              { id: "barrow_tangent", label: "巴罗特征三角形" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSandbox(item.id as SandboxType);
                  setIsPlaying(false);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-serif transition-all cursor-pointer ${
                  activeSandbox === item.id
                    ? "bg-[#5A5A40] text-white font-medium shadow-xs"
                    : "bg-[#EAE7DF] hover:bg-[#ded9ce] text-[#3D3D3D] border border-[#D4C5B0]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas Display Viewport (2 cols on large screen) */}
        <div className="lg:col-span-2 bg-white border border-[#D4C5B0] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#EAE7DF]">
            <span className="text-xs font-serif font-bold text-[#3D3D3D] flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>2D 古籍演算画板 (Ancient Manuscript Canvas)</span>
            </span>

            {/* Playback Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-serif transition-all cursor-pointer ${
                  isPlaying
                    ? "bg-[#8E887B] text-white"
                    : "bg-[#5A5A40] text-white hover:opacity-90"
                }`}
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isPlaying ? "暂停演播" : "自动演播"}</span>
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  if (activeSandbox === "archimedes_parabola") setParabolaDepth(2);
                  if (activeSandbox === "kepler_barrel") setBarrelSlices(16);
                  if (activeSandbox === "cavalieri_principle") setCavalieriHeight(50);
                  if (activeSandbox === "barrow_tangent") setDxMicro(0.3);
                }}
                className="p-1.5 rounded-full bg-[#EAE7DF] text-[#3D3D3D] hover:bg-[#ded9ce] border border-[#D4C5B0] cursor-pointer"
                title="重置参数"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Canvas Element */}
          <div className="w-full aspect-[16/10] bg-[#F9F7F2] rounded-lg border border-[#D4C5B0] overflow-hidden relative shadow-inner">
            <canvas
              ref={canvasRef}
              width={760}
              height={475}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] font-serif text-[#8E887B]">
            <span>💡 提示：调整右侧切片参数，观察“离散多边形/薄片”如何无限逼近“连续光滑极限”。</span>
            <span>分辨率: 760 × 475px</span>
          </div>
        </div>

        {/* Right Parameter Controller & Mathematical Formalization */}
        <div className="bg-white border border-[#D4C5B0] rounded-xl p-5 shadow-sm space-y-5">
          <div className="flex items-center space-x-2 text-xs font-serif font-bold text-[#3D3D3D] pb-2 border-b border-[#EAE7DF]">
            <Sliders className="w-4 h-4 text-[#5A5A40]" />
            <span>切片参数与几何演算控制面板</span>
          </div>

          {/* Parameters for Archimedes Parabola */}
          {activeSandbox === "archimedes_parabola" && (
            <div className="space-y-4 text-xs font-serif">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="font-bold text-[#3D3D3D]">三角形内接递归阶数 n:</span>
                  <span className="font-mono font-bold text-[#5A5A40]">{parabolaDepth} 阶</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={4}
                  step={1}
                  value={parabolaDepth}
                  onChange={(e) => setParabolaDepth(parseInt(e.target.value))}
                  className="w-full accent-[#5A5A40] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8E887B] mt-1 font-mono">
                  <span>0 (主三角形 T₀)</span>
                  <span>1 (2个侧三角形)</span>
                  <span>2 (4个)</span>
                  <span>3 (8个)</span>
                  <span>4 (16个)</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="sliceToggle"
                  checked={showSlices}
                  onChange={(e) => setShowSlices(e.target.checked)}
                  className="rounded accent-[#5A5A40] cursor-pointer"
                />
                <label htmlFor="sliceToggle" className="cursor-pointer text-[#3D3D3D]">
                  同屏显示梯形微元切片 (Trapezoid Slices)
                </label>
              </div>

              <div className="bg-[#F0EEE6] p-3.5 rounded-lg border border-[#D4C5B0] space-y-2">
                <span className="font-bold text-[#3D3D3D] block">阿基米德等比级数推导：</span>
                <MathView
                  math={`S_${parabolaDepth} = T_0 \\sum_{k=0}^{${parabolaDepth}} \\left(\\frac{1}{4}\\right)^k = \\frac{4}{3}T_0 \\left(1 - \\frac{1}{4^{${parabolaDepth + 1}}}\\right)`}
                  block={true}
                />
                <div className="text-[11px] text-[#7A7468] font-mono pt-1">
                  当前面积占抛物线弓形真实面积比例：
                  <span className="font-bold text-[#5A5A40] ml-1">
                    {(
                      (Array.from({ length: parabolaDepth + 1 }).reduce<number>(
                        (acc, _, k) => acc + Math.pow(0.25, k),
                        0
                      ) /
                        (4 / 3)) *
                      100
                    ).toFixed(2)}
                    %
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Parameters for Kepler Barrel */}
          {activeSandbox === "kepler_barrel" && (
            <div className="space-y-4 text-xs font-serif">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="font-bold text-[#3D3D3D]">圆盘切片数量 N:</span>
                  <span className="font-mono font-bold text-[#5A5A40]">{barrelSlices} 片</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={80}
                  step={2}
                  value={barrelSlices}
                  onChange={(e) => setBarrelSlices(parseInt(e.target.value))}
                  className="w-full accent-[#5A5A40] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="font-bold text-[#3D3D3D]">酒桶鼓腹曲率 (Curvature):</span>
                  <span className="font-mono font-bold text-[#5A5A40]">
                    {(barrelCurvature * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={0.7}
                  step={0.05}
                  value={barrelCurvature}
                  onChange={(e) => setBarrelCurvature(parseFloat(e.target.value))}
                  className="w-full accent-[#5A5A40] cursor-pointer"
                />
              </div>

              <div className="bg-[#F0EEE6] p-3.5 rounded-lg border border-[#D4C5B0] space-y-2">
                <span className="font-bold text-[#3D3D3D] block">开普勒旋转体定积分：</span>
                <MathView
                  math="V = \lim_{N \to \infty} \sum_{i=1}^N \pi r(y_i)^2 \Delta h = \int_{-H/2}^{H/2} \pi r(y)^2 dy"
                  block={true}
                />
                <p className="text-[11px] text-[#7A7468] leading-relaxed">
                  开普勒《酒桶的新立体几何》(1615)
                  打破了古希腊严格公理的拘束，首次将立体视为无穷多薄圆盘微元的连续叠加。
                </p>
              </div>
            </div>
          )}

          {/* Parameters for Cavalieri Principle */}
          {activeSandbox === "cavalieri_principle" && (
            <div className="space-y-4 text-xs font-serif">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="font-bold text-[#3D3D3D]">扫描截面高度 y = h:</span>
                  <span className="font-mono font-bold text-[#5A5A40]">{cavalieriHeight}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={cavalieriHeight}
                  onChange={(e) => setCavalieriHeight(parseInt(e.target.value))}
                  className="w-full accent-[#5A5A40] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="font-bold text-[#3D3D3D]">不可分量薄片离散度:</span>
                  <span className="font-mono font-bold text-[#3D3D3D]">{cavalieriDisks} 层</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={48}
                  step={2}
                  value={cavalieriDisks}
                  onChange={(e) => setCavalieriDisks(parseInt(e.target.value))}
                  className="w-full accent-[#5A5A40] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="font-bold text-[#3D3D3D]">右侧柱体剪切倾角:</span>
                  <span className="font-mono font-bold text-[#3D3D3D]">{cavalieriShear}°</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={65}
                  step={5}
                  value={cavalieriShear}
                  onChange={(e) => setCavalieriShear(parseInt(e.target.value))}
                  className="w-full accent-[#5A5A40] cursor-pointer"
                />
              </div>

              <div className="bg-[#F0EEE6] p-3.5 rounded-lg border border-[#D4C5B0] space-y-2">
                <span className="font-bold text-[#3D3D3D] block">不可分量定理核心：</span>
                <MathView
                  math="A_1(y) = A_2(y) \quad \forall y \implies V_1 = \int A_1(y)dy = \int A_2(y)dy = V_2"
                  block={true}
                />
              </div>
            </div>
          )}

          {/* Parameters for Barrow Tangent */}
          {activeSandbox === "barrow_tangent" && (
            <div className="space-y-4 text-xs font-serif">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="font-bold text-[#3D3D3D]">切点位置 x₀:</span>
                  <span className="font-mono font-bold text-[#5A5A40]">{tangentX.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={0.85}
                  step={0.05}
                  value={tangentX}
                  onChange={(e) => setTangentX(parseFloat(e.target.value))}
                  className="w-full accent-[#5A5A40] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="font-bold text-[#3D3D3D]">差分微步长 Δx (趋近于 0):</span>
                  <span className="font-mono font-bold text-[#5A5A40]">{dxMicro.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min={0.01}
                  max={0.5}
                  step={0.01}
                  value={dxMicro}
                  onChange={(e) => setDxMicro(parseFloat(e.target.value))}
                  className="w-full accent-[#5A5A40] cursor-pointer"
                />
              </div>

              <div className="bg-[#F0EEE6] p-3.5 rounded-lg border border-[#D4C5B0] space-y-2">
                <span className="font-bold text-[#3D3D3D] block">割线斜率向微商极限逼近：</span>
                <MathView
                  math="\frac{dy}{dx} = \lim_{\Delta x \to 0} \frac{f(x_0+\Delta x) - f(x_0)}{\Delta x}"
                  block={true}
                />
                <p className="text-[11px] text-[#7A7468] leading-relaxed">
                  巴罗特征三角形 $(dx, dy, ds)$
                  是微分几何的原型，直接催生了牛顿流数与莱布尼茨微分符号。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
