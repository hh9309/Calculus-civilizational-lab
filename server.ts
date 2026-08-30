import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { exec, spawn } from "child_process";
import fs from "fs";
import os from "os";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialize Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Historical Mathematician Personas System Prompts
const PERSONA_PROMPTS: Record<string, string> = {
  historian: `你是一位博古通今的“微积分文明史首席科学家与哲学导师”。
你的职责是系统解答关于微积分起源、概念演化（有限到无限、静态到动态、直觉到形式化）、历史论战（牛顿与莱布尼茨发明权之争）、数学危机（贝克莱悖论与第二次数学危机）、严格化历程（柯西-魏尔斯特拉斯）等问题。
风格：淡雅沉稳、严谨博雅，富有科学史哲思，善用 LaTeX 公式（用 $...$ 或 $$...$$ 格式）与精准的史料考证。语言为简体中文。`,

  archimedes: `你现在扮演古希腊叙拉古的数学巨匠【阿基米德 (Archimedes of Syracuse, 前287 - 前212)】。
你以“穷竭法 (Method of Exhaustion)”与力学杠杆原理著称。你用双重归谬法证明抛物线弓形面积为内接三角形的 4/3，求得球体体积与圆面积。
你的语言风格：庄重、古典，崇尚纯粹几何的绝对严谨，深信无限逼近但不直接宣称完成无限分割。常用几何直观与割补法。`,

  newton: `你现在扮演英国皇家学会会长【艾萨克·牛顿爵士 (Sir Isaac Newton, 1643 - 1727)】。
你于 1665-1666 伍尔斯索普瘟疫避静年创立“流数术 (Method of Fluxions)”，将变量视为流动量 (fluents, x, y)，其变化速率为流数 (fluxions, \\dot{x}, \\dot{y})，并运用瞬 (moment, o\\dot{x}) 与二项式级数展开。
你的语言风格：深邃、敏锐、略带英国科学家的威严与谨慎。深谙力学与天文学（如行星椭圆轨道与引力），坚信几何运动学是微积分的自然根基。`,

  leibniz: `你现在扮演德国通才哲学家与数学大师【戈特弗里德·威廉·莱布尼茨 (Gottfried Wilhelm Leibniz, 1646 - 1716)】。
你建立了极其优美与强大的符号体系：微商 $d/dx$（源自 latin: differentia）与积分号 $\\int$（源自 latin: summa 拉长 S）。你提出了特征字母论与微积分运算律（乘积法则 $d(uv) = u dv + v du$ 等）。
你的语言风格：广博、优雅、充满普遍和谐哲学观念。善于从离散差分数列推演连续求和与切线问题，深知良好符号对人类思维的解放力量。`,

  berkeley: `你现在扮演爱尔兰哲学家、主教【乔治·贝克莱 (George Berkeley, 1685 - 1753)】。
你是《分析学者》(The Analyst, 1734) 的作者，曾对微积分的逻辑漏洞发出震动学术界的质疑：“它们是什么？是逝去量的幽灵 (Ghosts of departed quantities) 吗？当它们不是零时除以它们，然后又把它们当作零抹去！”
你的语言风格：犀利、深刻、直击逻辑破绽。你并不否定微积分结果的实用性，但坚决批判其基础在形而上学与逻辑证明上的自相矛盾。`,

  cauchy: `你现在扮演法国分析学巨匠【奥古斯丁-路易·柯西 (Augustin-Louis Cauchy, 1789 - 1857)】。
你在巴黎综合理工学院的教材《代数分析教程》(1821) 中首次将微积分建立在严格的极限定义之上，摆脱对几何直观和神秘无穷小量的依赖，引入 $(\\varepsilon, \\delta)$ 极限思想与连续函数、积分的精确定义。
你的语言风格：严谨、清澈、现代分析学范式。善于用不等式和极限语言消除模糊性。`,

  weierstrass: `你现在扮演现代分析之父【卡尔·魏尔斯特拉斯 (Karl Weierstrass, 1815 - 1897)】。
你彻底完成了微积分严格化的代数化与实数完备性基础，提出绝对精准的静态 $\\varepsilon-\\delta$ 定义，构造了处处连续却处处不可导的魏尔斯特拉斯病态函数，终结了无穷小的几何直觉幻象。
你的语言风格：极致精准、逻辑坚如磐石、不留一丝模糊地带。`
};

// AI Chat endpoint
app.post("/api/ai-chat", async (req, res) => {
  try {
    const {
      prompt,
      message,
      persona = "historian",
      personaId,
      history = [],
      model = "gemini-3-flash",
      apiKey,
      baseUrl,
    } = req.body;

    const actualPrompt = prompt || message;
    const actualPersona = personaId || persona || "historian";

    if (!actualPrompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const systemInstruction = PERSONA_PROMPTS[actualPersona] || PERSONA_PROMPTS.historian;

    // Handle DeepSeek model proxying
    if (model === "deepseek-v4-pro") {
      const userApiKey = apiKey || process.env.DEEPSEEK_API_KEY;
      if (!userApiKey) {
        return res.status(401).json({
          error: "未提供 DeepSeek API Key，请在前端小齿轮设置中手工输入。",
        });
      }

      let dsBase = baseUrl || "https://api.deepseek.com/v1";
      if (dsBase.endsWith("/")) dsBase = dsBase.slice(0, -1);
      const dsUrl = dsBase.endsWith("/chat/completions") ? dsBase : `${dsBase}/chat/completions`;

      const messages: Array<{ role: string; content: string }> = [
        { role: "system", content: systemInstruction },
      ];

      if (Array.isArray(history)) {
        for (const msg of history.slice(-8)) {
          messages.push({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.content || msg.text || "",
          });
        }
      }

      messages.push({
        role: "user",
        content: actualPrompt,
      });

      const dsRes = await fetch(dsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userApiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages,
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!dsRes.ok) {
        const errJson: any = await dsRes.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `DeepSeek HTTP ${dsRes.status}`);
      }

      const dsData: any = await dsRes.json();
      const reply = dsData.choices?.[0]?.message?.content || "（历史导师正在沉思……）";
      return res.json({ text: reply, reply, source: "deepseek-v4-pro" });
    }

    // Handle Gemini 3 Flash model
    const userApiKey = apiKey || process.env.GEMINI_API_KEY;
    if (!userApiKey) {
      return res.status(401).json({
        error: "未提供 Gemini API Key，请在前端小齿轮设置中手工输入。",
      });
    }

    // Use customized Gemini client if user provided key
    const ai = new GoogleGenAI({
      apiKey: userApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    // Prepare conversation messages
    const formattedContents = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const msg of history.slice(-8)) {
        formattedContents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content || msg.text || "" }],
        });
      }
    }
    formattedContents.push({
      role: "user",
      parts: [{ text: actualPrompt }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "（历史导师正在沉思……）";
    res.json({ text: reply, reply, source: "gemini-3-flash" });
  } catch (error: any) {
    console.error("AI Chat error:", error);
    res.status(500).json({
      error: error.message || "大模型请求异常",
      details: error.toString(),
    });
  }
});


// Fallback response engine rich in historical calculus scholarship
function generateFallbackResponse(prompt: string, persona: string): string {
  const p = prompt.toLowerCase();
  
  if (persona === "leibniz" || p.includes("莱布尼茨") || p.includes("符号") || p.includes("dx")) {
    return `### 【莱布尼茨的回答】关于符号体系与微积分形式化

我常言：“**符号的巧妙选择，能使心智卸下不必要的负担，而将全部力量集中于本质问题。**”

1. **微分符号 $dx$ 与求和号 $\\int$ 的构造哲理**：
   - 符号 $d$ 源于拉丁文 *differentia*（差），表示两相邻变量值之有限微差的无限化；
   - 符号 $\\int$ 则是拉丁文 *summa*（总和）首字母 $S$ 的拉长变形，表征连续不可分量的连续累加。

2. **为什么我的符号比牛顿的“流数点”更具生命力？**
   - 牛顿的流数记号 $\\dot{x} = \\frac{dx}{dt}$ 强力绑定了单一的时间参数 $t$，面对多变量复合运算、隐函数求导及高维积分时极为局促；
   - 我的记号 $\\frac{dy}{dx}$ 天然展现了**商的代数属性**，使链式法则 $\\frac{dz}{dx} = \\frac{dz}{dy} \\cdot \\frac{dy}{dx}$ 变得犹如分数约分般自明，极大降低了数学推理与计算的认知门槛。

3. **微积分基本定理的形式化统一**：
   $$\\int d(F(x)) = F(x), \\quad d\\left(\\int f(x)dx\\right) = f(x)dx$$
   微分与积分在此成为互逆的操作算子，开启了18世纪分析学的大繁荣！`;
  }

  if (persona === "newton" || p.includes("牛顿") || p.includes("流数") || p.includes("行星")) {
    return `### 【牛顿的回答】关于流数术与自然哲学的几何洞察

在 1665 至 1666 年伍尔斯索普的瘟疫岁月中，我将几何量视为“连续运动生成的轨迹”。

1. **流动量（Fluent）与流数（Fluxion）**：
   - 设直线或曲线由点运动生成，位置 $x, y$ 称为流动量；
   - 其瞬时生成速率即为流数，记作 $\\dot{x}, \\dot{y}$；
   - 在无穷小时间微元 $o$（瞬，moment）内，流动量的增量为 $o\\dot{x}, o\\dot{y}$。

2. **对行星运动与开普勒第二定律的证明**：
   - 在《自然哲学的数学原理》（1687）中，我并非纯靠代数，而是运用了极限几何（初末比方法）证明了向心力定律：
   - 质点在中心引力作用下，在相等时间内扫过相等的面积（$\\frac{dA}{dt} = \\frac{1}{2} r^2 \\dot{\\theta} = \\text{常数}$）。

3. **与莱布尼茨之分歧**：
   - 我更关注物理世界的连续运动与力学因果，流数是真实物理速度的抽象，而非纯粹的符号博弈。`;
  }

  if (persona === "berkeley" || p.includes("贝克莱") || p.includes("幽灵") || p.includes("危机")) {
    return `### 【贝克莱主教的质询】《分析学者》(1734) 的逻辑审判

致一位不信教的数学家：

你们自诩数学是最严密的理性皇冠，然而在微积分的根基处，却充斥着逻辑自相矛盾的假定！

1. **求 $y = x^2$ 导数的荒谬推导**：
   设 $x$ 增加增量 $o$，则：
   $$\\frac{(x+o)^2 - x^2}{o} = \\frac{2xo + o^2}{o} = 2x + o$$
   - 在第一步除以 $o$ 时，你们假定 **$o \\neq 0$**（否则除以零无意义）；
   - 在第二步得到导数 $2x$ 时，你们又假定 **$o = 0$**，从而把 $o$ 抛弃！
   - **请问：$o$ 到底是不是零？**

2. **“逝去量的幽灵” (Ghosts of departed quantities)**：
   它既不是有限量，也不是无限小量，更不是纯粹的零。你们凭借这种模糊的直觉获得了正确的结果，却不过是“以错抵错的巧合”！正是这一质问，迫使后世柯西与魏尔斯特拉斯重构极限论。`;
  }

  if (persona === "cauchy" || persona === "weierstrass" || p.includes("极限") || p.includes("严格化") || p.includes("epsilon")) {
    return `### 【现代分析学派】从几何直观到 $(\\varepsilon, \\delta)$ 严密化

19 世纪分析学革命的核心任务，正是驱逐“幽灵般的无穷小”，代之以**静态的实数不等式系统**。

1. **柯西与魏尔斯特拉斯的极限精确定义**：
   设函数 $f(x)$ 在点 $x_0$ 附近有定义。若对于任意给定的正实数 $\\varepsilon > 0$，总存在一个正实数 $\\delta > 0$，使得当 $0 < |x - x_0| < \\delta$ 时，恒有：
   $$|f(x) - L| < \\varepsilon$$
   则称常数 $L$ 为当 $x \\to x_0$ 时 $f(x)$ 的极限，记作 $\\lim_{x \\to x_0} f(x) = L$。

2. **导数的无矛盾定义**：
   $$f'(x) = \\lim_{\\Delta x \\to 0} \\frac{f(x+\\Delta x) - f(x)}{\\Delta x}$$
   这里没有任何“时而是零、时而非零”的神秘增量，只有两个实数比值随着自变量靠近 $0$ 时的收敛状态。

3. **文明认知的质变**：
   这一步将微积分彻底从几何画图与物理运动的依赖中解放出来，完成了纯代数形式化的严密奠基！`;
  }

  // General Historian
  return `### 【微积分文明史总论】无限的驯服与分析学的诞生

微积分的发展是人类文明史上最为壮阔的思想史诗之一，经历了四大关键跃迁：

1. **古希腊萌芽（前3世纪）**：阿基米德“穷竭法”与双重归谬法，以有限多边形逐步逼近曲线面积，在不跨越无穷边界的前提下求解几何割补。
2. **17世纪突破（1630-1680s）**：开普勒酒桶体积、卡瓦列利不可分量、费马伪等法、巴罗特征三角形，直至牛顿（流数术）与莱布尼茨（微积分符号体系）实现微积分基本定理的普遍化。
3. **18世纪危机（1734）**：贝克莱悖论直击“无穷小量是逝去量的幽灵”，引发第二次数学危机，数学界在缺乏严格基础的大厦上飞速拓展。
4. **19世纪严密化（1820-1870s）**：柯西与魏尔斯特拉斯创立 $(\\varepsilon, \\delta)$ 极限理论，戴德金与康托尔完成实数连续性完备构建，使微积分蜕变为现代数学分析。

你可以随时在左侧切换 2D 文明沙盒演播古图证明，或提问任何数学家思想细节！`;
}

// Symbolic Solver & Code engine simulator
app.post("/api/sympy/solve", (req, res) => {
  const { codeType, params } = req.body;

  try {
    let result: any = {};
    if (codeType === "archimedes_parabola") {
      // Parabola segment exhaustion series: Area = T * (1 + 1/4 + 1/16 + ... + 1/4^n)
      const n = Math.min(Math.max(parseInt(params?.n || 6), 1), 30);
      let sum = 0;
      const terms: { k: number; term: number; partialSum: number; formula: string }[] = [];
      for (let k = 0; k <= n; k++) {
        const term = Math.pow(1 / 4, k);
        sum += term;
        terms.push({
          k,
          term,
          partialSum: sum,
          formula: `(1/4)^${k} = ${term.toFixed(6)}`,
        });
      }
      result = {
        title: "阿基米德抛物线弓形穷竭级数推导",
        latexProof: `S_n = T_0 \\sum_{k=0}^{n} \\left(\\frac{1}{4}\\right)^k = T_0 \\cdot \\frac{1 - (1/4)^{n+1}}{1 - 1/4} = \\frac{4}{3} T_0 \\left(1 - \\frac{1}{4^{n+1}}\\right)`,
        limit: 4 / 3,
        currentSum: sum,
        currentRatio: (sum / (4 / 3)) * 100,
        terms: terms.slice(0, 10),
        sympyCode: `from sympy import symbols, Sum, Rational, oo\nk, n = symbols('k n', integer=True)\ns_n = Sum(Rational(1, 4)**k, (k, 0, n)).doit()\nlimit_val = Sum(Rational(1, 4)**k, (k, 0, oo)).doit()\nprint(f"Partial Sum S_n: {s_n}")\nprint(f"Exact Limit: {limit_val} (equals 4/3)")`,
      };
    } else if (codeType === "leibniz_pi_series") {
      // Leibniz Pi series: 1 - 1/3 + 1/5 - 1/7 + ... = pi/4
      const n = Math.min(Math.max(parseInt(params?.n || 50), 1), 10000);
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += Math.pow(-1, k) / (2 * k + 1);
      }
      result = {
        title: "莱布尼茨格里高利级数求圆周率",
        latexProof: `\\frac{\\pi}{4} = \\sum_{k=0}^{\\infty} \\frac{(-1)^k}{2k+1} = 1 - \\frac{1}{3} + \\frac{1}{5} - \\frac{1}{7} + \\cdots`,
        target: Math.PI / 4,
        currentSum: sum,
        approxPi: sum * 4,
        error: Math.abs(sum * 4 - Math.PI),
        sympyCode: `from sympy import symbols, Sum, oo, pi\nk = symbols('k', integer=True)\nleibniz_series = Sum((-1)**k / (2*k + 1), (k, 0, oo))\nprint(f"Analytical Sum: {leibniz_series.doit()} (exactly equals pi/4)")`,
      };
    } else if (codeType === "newton_binomial") {
      // Newton binomial fluxion expansion for (1+x)^alpha
      const alpha = parseFloat(params?.alpha || 0.5); // sqrt(1+x)
      const x = parseFloat(params?.x || 0.5);
      const termsCount = parseInt(params?.terms || 5);
      
      let sum = 0;
      const terms: any[] = [];
      let currentCoeff = 1;
      
      for (let k = 0; k < termsCount; k++) {
        if (k === 0) {
          currentCoeff = 1;
        } else {
          currentCoeff = (currentCoeff * (alpha - k + 1)) / k;
        }
        const termVal = currentCoeff * Math.pow(x, k);
        sum += termVal;
        terms.push({
          k,
          coeff: currentCoeff,
          val: termVal,
          expr: `${currentCoeff.toFixed(4)} * x^${k}`,
        });
      }
      
      const exact = Math.pow(1 + x, alpha);
      result = {
        title: `牛顿二项式任意指数展开式 (1+x)^${alpha}`,
        latexProof: `(1+x)^\\alpha = 1 + \\alpha x + \\frac{\\alpha(\\alpha-1)}{2!} x^2 + \\frac{\\alpha(\\alpha-1)(\\alpha-2)}{3!} x^3 + \\cdots`,
        exact,
        approx: sum,
        error: Math.abs(sum - exact),
        terms,
        sympyCode: `from sympy import symbols, series, sqrt\nx = symbols('x')\nexpr = (1 + x)**(${alpha})\nexpanded = series(expr, x, 0, n=${termsCount})\nprint(f"Taylor Series: {expanded}")`,
      };
    } else {
      // Default Riemann Slicing
      const slices = Math.min(Math.max(parseInt(params?.slices || 20), 2), 500);
      const dx = 1 / slices;
      let leftSum = 0;
      let rightSum = 0;
      let trapSum = 0;
      for (let i = 0; i < slices; i++) {
        const xL = i * dx;
        const xR = (i + 1) * dx;
        const yL = xL * xL;
        const yR = xR * xR;
        leftSum += yL * dx;
        rightSum += yR * dx;
        trapSum += ((yL + yR) / 2) * dx;
      }
      result = {
        title: "古法矩形割补与黎曼切片逼近 (∫ x² dx, x∈[0,1])",
        latexProof: `\\int_0^1 x^2 dx = \\lim_{n \\to \\infty} \\sum_{i=1}^n \\left(\\frac{i}{n}\\right)^2 \\frac{1}{n} = \\lim_{n \\to \\infty} \\frac{n(n+1)(2n+1)}{6n^3} = \\frac{1}{3}`,
        exact: 1 / 3,
        slices,
        leftSum,
        rightSum,
        trapSum,
        leftError: Math.abs(leftSum - 1 / 3),
        rightError: Math.abs(rightSum - 1 / 3),
        trapError: Math.abs(trapSum - 1 / 3),
        sympyCode: `from sympy import symbols, integrate\nx = symbols('x')\nexact_integral = integrate(x**2, (x, 0, 1))\nprint(f"Definite Integral: {exact_integral}")`,
      };
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Real-time Python Code Execution & Standalone Verification Endpoint
app.post("/api/python/execute", (req, res) => {
  const { code, args = [] } = req.body;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "No code provided" });
  }

  // Safety filter for harmful system commands
  const dangerousPatterns = [
    /import\s+os\s*;\s*os\.system/i,
    /subprocess\.Popen.*rm\s+-rf/i,
    /shutil\.rmtree/i,
    /os\.remove\s*\(\s*["']\/.*["']\s*\)/i,
    /__import__\s*\(\s*["']os["']\s*\)\.system/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      return res.status(403).json({
        success: false,
        error: "安全保护策略：禁止执行破坏性系统调用或文件删除操作。",
        stdout: "",
        stderr: "Execution blocked: Detected potentially destructive system command.",
        exitCode: 1,
      });
    }
  }

  // Standalone Verification check (Verify whether script relies ONLY on Python standard libraries: sys, math, json, etc.)
  const externalDependenciesCheck = {
    isFullyStandalone: true,
    detectedImports: [] as string[],
    externalLibraries: [] as string[],
    notes: "代码完全基于 Python 原生内置标准库 (math, sys, json 等)，无需安装第三方 pip 依赖，复制到任何 Python 3 环境均可独立直接运行！",
  };

  const importMatches = code.matchAll(/(?:from\s+([a-zA-Z0-9_]+)\s+import|import\s+([a-zA-Z0-9_]+))/g);
  const standardBuiltins = new Set([
    "math", "sys", "json", "time", "random", "itertools", "functools",
    "collections", "decimal", "fractions", "re", "string", "typing",
    "copy", "statistics", "bisect", "heapq", "datetime", "enum"
  ]);

  for (const match of importMatches) {
    const pkg = match[1] || match[2];
    if (pkg) {
      externalDependenciesCheck.detectedImports.push(pkg);
      if (!standardBuiltins.has(pkg)) {
        externalDependenciesCheck.isFullyStandalone = false;
        externalDependenciesCheck.externalLibraries.push(pkg);
      }
    }
  }

  if (!externalDependenciesCheck.isFullyStandalone) {
    externalDependenciesCheck.notes = `检测到可能依赖第三方扩展库 [${externalDependenciesCheck.externalLibraries.join(", ")}]。若在外部纯净环境中运行，需预先 pip install。`;
  }

  // Write temporary file
  const tempFileName = `calculus_script_${Date.now()}_${Math.random().toString(36).substring(7)}.py`;
  const tempFilePath = path.join(os.tmpdir(), tempFileName);

  fs.writeFile(tempFilePath, code, "utf8", (writeErr) => {
    if (writeErr) {
      return res.status(500).json({
        success: false,
        error: "无法写入临时脚本文件",
        details: writeErr.message,
      });
    }

    const startTime = Date.now();
    const cmdArgs = [tempFilePath, ...(Array.isArray(args) ? args.map(String) : [])];

    const pythonProcess = spawn("python3", cmdArgs, {
      timeout: 8000, // 8s timeout limit
    });

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    pythonProcess.on("error", (procErr) => {
      fs.unlink(tempFilePath, () => {});
      return res.json({
        success: false,
        stdout,
        stderr: stderr || procErr.message,
        exitCode: 1,
        executionTimeMs: Date.now() - startTime,
        standaloneCheck: externalDependenciesCheck,
      });
    });

    pythonProcess.on("close", (exitCode) => {
      fs.unlink(tempFilePath, () => {});
      const executionTimeMs = Date.now() - startTime;

      res.json({
        success: exitCode === 0,
        stdout,
        stderr,
        exitCode: exitCode ?? 0,
        executionTimeMs,
        standaloneCheck: externalDependenciesCheck,
      });
    });
  });
});

// Setup Vite development middleware or static production serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`History of Calculus Lab Server running on http://localhost:${PORT}`);
  });
}

startServer();
