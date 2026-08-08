import { useEffect, useRef, RefObject, useState, MouseEvent } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import katex from "katex";

interface MathFormulaProps {
  math: string;
  block?: boolean;
  className?: string;
}

function getFormulaMeta(math: string) {
  const norm = math.replace(/\s+/g, "");

  // 1. Lorenz Attractor System
  if (norm.includes("dot{x}") || norm.includes("\\dot{x}") || norm.includes("sigma(y-x)") || norm.includes("dot{z}")) {
    return {
      title: "洛伦兹混沌动力学系统",
      tag: "混沌理论",
      icon: "🌀",
      formula: "dx/dt = σ(y - x), dy/dt = x(ρ - z) - y, dz/dt = xy - βz",
      meaning: "经典三维连续流体混沌物理系统。描述大气局部不稳定受热对流模型，反映多维流场运动中不可预知的复杂‘蝴蝶效应’双翼吸引子轨道分岔运动。",
      background: "由麻省理工学院气象学家爱德华·洛伦兹（Edward Lorenz）于1963年提出。这是人类首次通过确定性一阶偏微分计算证实确定性混沌和分形吸引子的存在。"
    };
  }

  // 2. Fourier Series Square Wave
  if (norm.includes("sum_{k=1}") || norm.includes("sum_{k=1}^{n}") || norm.includes("\\sum_{k=1}^{n}") || norm.includes("sin((2k-1)")) {
    return {
      title: "傅里叶阶梯正弦叠加级数",
      tag: "谐波分析",
      icon: "📈",
      formula: "f(t) = 4/π * Σ (sin(2k-1)t)/(2k-1)",
      meaning: "将极其不连续的对称非凸矩形波或方波，通过正弦和余弦倍频分量阶梯累加，在宏观时域中完全表达为线性高阶三角级数的连续叠和。",
      background: "法国数学家约瑟夫·傅里叶（Joseph Fourier）于1822年发表《热的解析理论》时确立。在突变跳跃边缘部分产生的周期振幅振荡被称为“吉布斯现象”。"
    };
  }

  // 3. Loss Functions
  if (norm.includes("\\mathcal{L}(x,y)") || norm.includes("mathcal{L}(x,y)")) {
    if (norm.includes("cos(2.8x)") || norm.includes("peaks")) {
      return {
        title: "非凸多极值混合谐振损失函数",
        tag: "机器学习",
        icon: "🧠",
        formula: "L(x,y) = 18(x² + y² - cos(2.8x) - cos(2.8y)) + 30",
        meaning: "刻画神经网络复杂损失层级中的‘非球面高低起伏地形’。具备多个极度诱惑的局部极小能量鞍阱，用于模拟和考验梯度下降跳出局部最优解的能力。",
        background: "借鉴了统计力学与热力学自旋玻璃模型（Spin Glass）的三维势能面设计，是近代深度算法、动力非线性调谐学界评测算法逃逸性质的经典势能地貌。"
      };
    } else {
      return {
        title: "非凸双阶马鞍空间损失函数",
        tag: "数值优化",
        icon: "🧠",
        formula: "L(x,y) = 15(x² - 0.5y²) + 40",
        meaning: "评估网络模型在某一参数维度表现为极小（凹）、而在另一相对参数维度表现为极大（凸）的多阶不稳定鞍点流形（Saddle Point）物理空间图谱。",
        background: "在高维参数层叠中，鞍点数量远多于真实局部最小值。本模型常用于测试‘牛顿动力学速度动量法（Momentum）’在一维下降中如何防止惯性丢失、无损跨越鞍区。"
      };
    }
  }

  // 4. Gradient Operator
  if (norm.includes("\\nabla\\mathcal{L}") || norm.includes("nabla\\mathcal{L}") || norm.includes("partial\\mathcal{L}")) {
    return {
      title: "多元偏微分梯度向量算子",
      tag: "多元微积分",
      icon: "📐",
      formula: "∇L = [ ∂L/∂x, ∂L/∂y ]ᵀ",
      meaning: "由各标量一阶偏导构成的多维矢量方向。指向多维连续超平曲面函数增长率最陡峭的时空中法法向向量，是参数迭代自我校正的绝对指引标杆。",
      background: "梯度下降法最早由法国卓越数学家奥古斯丁·路易·柯西（Augustin-Louis Cauchy）于1847年发明，今日已成为反向传播与深度机器学习模型自适应梯度优化算法的柱石。"
    };
  }

  // 5. Momentum Constraint
  if (norm.includes("v_{t+1}") || norm.includes("v_{t}") || norm.includes("\\gammav_t")) {
    return {
      title: "牛顿力学多阶动量惯性修正公式",
      tag: "优化阻轨",
      icon: "⚡",
      formula: "v(t+1) = γv(t) - η∇L, w(t+1) = w(t) + v(t+1)",
      meaning: "在纯数学偏导梯度微元调整中，引入传统牛顿惯性物理运动学摩擦力‘动能冲量（Momentum）’，使历史步进累积释放出超高流速以防梯度停滞。",
      background: "由前苏联天才应用数学家波利亚克（Boris Polyak）于1964年首次以‘重球逼近法’推导并命名。极大改善了经典逼近过程在极度平坦或波动区域的振荡发散性。"
    };
  }

  // 5.5 One-Dimensional Alternating Wave Equation
  if (norm.includes("E_y(x,t)") || norm.includes("\\mathbf{E}_y") || norm.includes("E_0\\sin") || norm.includes("E_0") && norm.includes("\\sin")) {
    return {
      title: "一维交变高频简谐谐振电场",
      tag: "波动物理学",
      icon: "🌊",
      formula: "E_y(x,t) = E_0 * sin( (2πf/v)*x - 2πf*t )",
      meaning: "一维简谐电磁行波。此偏微分波动模型描绘了在瞬时高频电磁谐振下，垂直正交电场分量在介质空间沿传播阻抗方向（x）按简谐函数随时间（t）高频波导流溢的能量波前状态。",
      background: "由近代电磁物理波矢理论推演得到，展现了一维自由透波波导与电介质内简谐偏振高阶波动解，是5G/6G微波通信和超材料电磁切片分析的核心解析物理常数。"
    };
  }

  // 6. Faraday's Law
  if (norm.includes("\\nabla\\times\\mathbf{E}") || norm.includes("nabla\\times\\mathbf{E}") || norm.includes("partial\\mathbf{B}")) {
    return {
      title: "法拉第电磁感应偏微分定律",
      tag: "经典电磁",
      icon: "🔋",
      formula: "∇ × E = -∂B/∂t",
      meaning: "时空电磁场偏微分对称表达：表示时变偏偏导变化的磁通感应强度（B），在其时空垂直平面内必感应激生出呈涡旋自旋状态、非保守闭合的强旋电场（E）。",
      background: "源自英国十九世纪划时代巨擘迈克尔·法拉第（Michael Faraday）的大量磁生电物理测试，后经麦克斯韦数学抽象，它完美阐明了发电机、变压器与现代大电力电力的流转物理实质。"
    };
  }

  // 7. Ampere-Maxwell Law
  if (norm.includes("\\nabla\\times\\mathbf{B}") || norm.includes("nabla\\times\\mathbf{B}") || norm.includes("mu_0")) {
    return {
      title: "安培-麦克斯韦高频涡旋磁定律",
      tag: "麦克斯韦群",
      icon: "🌀",
      formula: "∇ × B = μ₀ ε₀ ∂E/∂t",
      meaning: "描述除了真空中经典电子流通产生的实体超导电流外，时空间变偏导变化的位移电极化通量变幅，亦能同步在其环绕切向诱发闭合的正交高频自激磁流（B）。",
      background: "詹姆斯·克拉克·麦克斯韦（James Clerk Maxwell）于1861年为纠正传统安培环路环定理引入的史诗级修补项。首次证明电磁信息能以波动光速在宏观物质空间自震荡传送。"
    };
  }

  // 8. Second-Order Damped Harmonic Oscillator (PhysicsSandbox)
  if (norm.includes("d^2y/dt^2") || norm.includes("dy/dt") || norm.includes("F_0\\cos") || norm.includes("m\\frac{d^2y}")) {
    return {
      title: "二阶摩擦阻尼强迫振荡微分方程",
      tag: "振动力学",
      icon: "🔬",
      formula: "m(d²y/dt²) + c(dy/dt) + ky = F₀ cos(ωt)",
      meaning: "描绘包含系统质量惯性加速度（m）、外界阻尼介质耗散剪切速度（c）与机身回弹恢复刚度（k），在谐振正弦强迫牵引力下多阶不连续振颤平衡。",
      background: "它是牛宿力学、近代土木防灾抗风设计、甚至无线电微观RLC接收调谐阻抗谐振滤波器的普适控制数学母体，代表了波动与振动的根本动力约束律。"
    };
  }

  // 9. Gravity/Orbit Newton Motion
  if (norm.includes("-G\\frac{M}") || norm.includes("r^3") || norm.includes("d^2\\mathbf{r}")) {
    return {
      title: "两体引力向量守恒常微分方程",
      tag: "天体轨道",
      icon: "🌌",
      formula: "d²r/dt² = -G * (M / r³) * r",
      meaning: "由万有引力引力常数（G）与心天体巨大质量物理折算。指出运动微粒（r）随质心径向平方反比引力拖拽，呈现出的极限椭圆绕偏角闭合圆周相动力。",
      background: "艾萨克·牛顿爵士在1687年经典的《自然哲学的数学原理》中确立。借此数学物理微分方法，让人类头一回能在神论天体天穹下求解极其精细之运行预测轨道。"
    };
  }

  // 10. Thermal Equil / Pressure Sandbox
  if (norm.includes("dp/dt") || norm.includes("Q_{in}") || norm.includes("C_{cooling}")) {
    return {
      title: "热能极值压强连续对流平衡系统",
      tag: "工程热力",
      icon: "🔥",
      formula: "dp/dt = α * Q_in - β * C_cooling",
      meaning: "描述特定工业密封增压管路系统阻抗，吸收流体源（Q_in）与负反馈安全散热介液（C_cooling）在微分时段相互挤压，诱发容器承载内部气压一阶时振变率。",
      background: "本方程用于工业高能蒸汽动力安全控制与特变电压力超导极温平衡仿真。通过实时改变阻逆系数，探查工业容器产生极端汽蚀爆炸的极限控制边界。"
    };
  }

  // 11. SIR Pandemic in CompilerSDK
  if (norm.includes("dS/dt") || norm.includes("dI/dt") || norm.includes("dR/dt") || norm.includes("Susceptible")) {
    return {
      title: "流行病连续时变流动模型 (SIR)",
      tag: "传染动力",
      icon: "🧪",
      formula: "dS/dt = -βSI, dI/dt = βSI - γI, dR/dt = γI",
      meaning: "通过三个一阶连续非线性强耦合方程构成物质流。描述未感人群传染扩散、已感染期活性患者激增以及抗体防御康复移除三门状态空间质量转移轨迹。",
      background: "苏格兰科学家威廉·克马克与安德森·麦肯德里克于1927年创立。这一突破开启了用定量动力学建模防御病毒传播、预测疫情收敛拐点与群免极值的时代。"
    };
  }

  // 12. Lotka-Volterra Ecology Predator-Prey in CompilerSDK
  if (norm.includes("dx/dt") || norm.includes("dy/dt") || norm.includes("alpha\\cdotx") || norm.includes("delta\\cdotx")) {
    return {
      title: "洛特卡-沃尔泰拉物种博弈模型",
      tag: "生态数学",
      icon: "🦊",
      formula: "dx/dt = αx - βxy, dy/dt = δxy - γy",
      meaning: "非线性多阶相空间周期微分控制方程组。描述无天敌下兔子自我繁衍、及狐狸捕获捕食导致种群双向消长反馈阻尼，展现守恒能流的相平面椭圆震荡。",
      background: "由阿弗雷德·洛特卡与维托·沃尔泰拉于1925年独自推导出。被生物地理学家推崇为天然生态链消长博弈控制、周期捕猎极值边界估算的经典方程体系。"
    };
  }

  // Fallback
  return {
    title: "微积分连续物理时空算子",
    tag: "微分流形",
    icon: "♾️",
    formula: "dF/dt = F(t, s)",
    meaning: "描述物理时空及连续介质在特定坐标微元内的极值连续转换关系。以瞬时一阶或多阶偏导、向量模态定量标定宏观流动或力能物理机制的渐近流向定理。",
    background: "由艾萨克·牛顿与莱布尼茨于17世纪末分别提出。微积分将微观一阶瞬时极限与宏观时序累加完美合并，铺设了一条通过局部连续计算掌控时空的通路。"
  };
}

export default function MathFormula({ math, block = false, className = "" }: MathFormulaProps) {
  const containerRef = useRef<HTMLSpanElement | HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [calcPos, setCalcPos] = useState({ left: 0, top: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(math, containerRef.current, {
          displayMode: block,
          throwOnError: false,
          trust: true,
        });
      } catch (err) {
        console.error("KaTeX rendering error for:", math, err);
        containerRef.current.textContent = math;
      }
    }
  }, [math, block]);

  useEffect(() => {
    if (!show) return;
    const tooltipWidth = 320;
    const tooltipHeight = 220;
    let newLeft = mousePos.x + 15;
    let newTop = mousePos.y + 15;

    if (typeof window !== "undefined") {
      if (newLeft + tooltipWidth > window.innerWidth) {
        newLeft = mousePos.x - tooltipWidth - 15;
      }
      if (newTop + tooltipHeight > window.innerHeight) {
        newTop = mousePos.y - tooltipHeight - 15;
      }
      if (newLeft < 10) newLeft = 10;
      if (newTop < 10) newTop = 10;
    }

    setCalcPos({ left: newLeft, top: newTop });
  }, [mousePos, show]);

  const handleMouseEnter = () => setShow(true);
  const handleMouseLeave = () => setShow(false);
  const handleMouseMove = (e: MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const meta = getFormulaMeta(math);

  // Dynamic automatic contrast analyzer
  const normClass = className.toLowerCase();
  const isBrightText = normClass.includes("text-cyan") || 
                      normClass.includes("text-blue-4") || 
                      normClass.includes("text-sky-4") || 
                      normClass.includes("text-amber-4") || 
                      normClass.includes("text-emerald-4") ||
                      normClass.includes("text-slate-205") ||
                      normClass.includes("text-slate-300");

  const isDarkText = normClass.includes("text-sky-6") ||
                     normClass.includes("text-amber-6") ||
                     normClass.includes("text-emerald-6") ||
                     normClass.includes("text-brand-orange") ||
                     normClass.includes("text-slate-800") ||
                     normClass.includes("text-slate-700") || 
                     normClass.includes("text-slate-900");

  // Choose appropriate contrast reinforcement class
  let contrastClass = "math-contrast-neutral";
  if (isBrightText) {
    contrastClass = "math-contrast-dark-bg";
  } else if (isDarkText) {
    contrastClass = "math-contrast-light-bg";
  }

  return (
    <>
      {/* Inject custom styles for KaTeX to ensure mathematically crisp subpixel contrast */}
      <style>{`
        /* Global math readability optimizations */
        .math-contrast-dark-bg .katex-html {
          text-shadow: 0 0.5px 1.5px rgba(0, 0, 0, 0.4), 0 0 1px rgba(255, 255, 255, 0.15) !important;
          filter: drop-shadow(0 0.8px 1px rgba(0, 0, 0, 0.45));
        }
        .math-contrast-light-bg .katex-html {
          text-shadow: 0 0.2px 0.8px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.03) !important;
          filter: drop-shadow(0 0.2px 0.4px rgba(0, 0, 0, 0.05));
        }
        
        /* Smooth micro-sizing for adaptive screen density */
        .katex {
          font-size: 1.05em !important;
          letter-spacing: 0.015em !important;
          text-rendering: optimizeLegibility !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
        }

        /* Thicken extremely fragile fractions and square roots */
        .katex .frac-line, 
        .katex .mrule, 
        .katex .sqrt-line {
          border-bottom-width: 1.35px !important;
          opacity: 0.95 !important;
        }
        
        /* Accent custom highlights on active hover states */
        .katex-block-wrapper:hover .katex-html,
        .katex-inline-wrapper:hover .katex-html {
          transition: filter 0.3s ease;
          filter: drop-shadow(0 2px 4px rgba(234, 88, 12, 0.18)) !important;
        }
      `}</style>

      {block ? (
        <motion.div
          key={math}
          ref={containerRef as RefObject<HTMLDivElement | null>}
          initial={{ opacity: 0, x: -22, scale: 0.95, filter: "blur(2.5px)" }}
          animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
          whileHover={{ scale: 1.02 }}
          transition={{ 
            type: "spring",
            stiffness: 75,
            damping: 14,
            mass: 0.9,
            filter: { duration: 0.4 }
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          className={`katex-block-wrapper my-2.5 overflow-x-auto py-1.5 text-center cursor-help select-none transition-all duration-300 rounded ${contrastClass} ${className}`}
        />
      ) : (
        <motion.span
          key={math}
          ref={containerRef as RefObject<HTMLSpanElement | null>}
          initial={{ opacity: 0, x: -10, scale: 0.97, filter: "blur(1.5px)" }}
          animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
          whileHover={{ scale: 1.04 }}
          transition={{ 
            type: "spring",
            stiffness: 85,
            damping: 13,
            mass: 0.8,
            filter: { duration: 0.35 }
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          className={`katex-inline-wrapper inline-block mx-0.5 align-middle cursor-help select-none transition-all duration-300 ${contrastClass} ${className}`}
        />
      )}

      {mounted &&
        createPortal(
          <AnimatePresence>
            {show && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 8 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: "fixed",
                  left: calcPos.left,
                  top: calcPos.top,
                  zIndex: 99999,
                  pointerEvents: "none",
                }}
                className="bg-white/95 backdrop-blur-md border border-slate-200/90 text-slate-800 rounded-2xl p-4.5 shadow-[0_12px_40px_rgba(15,23,42,0.14)] tracking-wide font-sans md:max-w-[325px] max-w-[285px] w-full text-xs box-border overflow-hidden border-l-4 border-brand-orange pl-3.5 select-none"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm shrink-0">{meta.icon}</span>
                    <span className="font-bold text-slate-800 text-[11.5px] truncate max-w-[170px]">
                      {meta.title}
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-brand-orange/10 text-brand-orange shrink-0 tracking-widest uppercase font-mono">
                    {meta.tag}
                  </span>
                </div>

                <div className="font-mono text-[9.5px] text-slate-450 bg-slate-50 border border-slate-150 rounded-lg px-2 py-1 mb-2 mt-1 font-semibold leading-normal break-all">
                  {meta.formula}
                </div>

                <div className="space-y-1 mt-1.5 text-[11px]">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                    <span>🔬</span> <span>物理与数学物理含义</span>
                  </div>
                  <p className="text-slate-650 leading-relaxed font-sans font-medium">
                    {meta.meaning}
                  </p>
                </div>

                <div className="space-y-1 border-t border-slate-100 pt-2 mt-2 text-[10px] text-slate-500 font-sans">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                    <span>🏛️</span> <span>学术背景与历史渊源</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed font-sans">
                    {meta.background}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
