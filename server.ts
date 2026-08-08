/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  console.log("Initializing Gemini Client with provided GEMINI_API_KEY");
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY is not set or is the default placeholder. Falling back to structured simulator.");
}

// Helper to retry Gemini requests during transient 503 errors (Service Unavailable/High demand)
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries <= 0) {
      throw error;
    }
    // Check if error is related to high demand / overloaded / 503 / UNAVAILABLE
    const isTransError = 
      error?.status === 503 || 
      error?.code === 503 || 
      (error?.message && (
        error.message.includes("503") || 
        error.message.includes("high demand") || 
        error.message.includes("UNAVAILABLE") ||
        error.message.includes("overloaded")
      ));
    
    if (isTransError) {
      console.warn(`[Gemini Retry] Service unavailable/high demand. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    // For other non-transient errors, throw immediately
    throw error;
  }
}

// REST API for What-If civilization simulation
app.post("/api/simulate-what-if", async (req, res) => {
  const { scenarioId, withdrawnTool, userPrompt } = req.body;

  if (!withdrawnTool) {
    return res.status(400).json({ error: "Withdrawn tool is required." });
  }

  // Pre-baked alternative history presets in case key is absent
  const mockDeductions: Record<string, any> = {
    tacoma: {
      alternativeTitle: "粗放重载时代：共振与铆钉的极限",
      chronology: [
        { year: "1850年", event: "由于无法精确计算悬索桥在大风下的共振动力学，桥梁跨度被严格限制在100米以内。跨区域铁路网建设停滞。" },
        { year: "1910年", event: "建筑学退回超固结构时代，只敢建造笨重的水泥梁桥与拱桥，钢材消耗量攀升至原本的5倍，引发严重的能源危机。" },
        { year: "1960年", event: "大跨度悬索桥的多次毁灭性坍塌使得两岸经济隔离，城市群化进程失败。" },
        { year: "2026年", event: "现代超级都市（如旧金山、香港）因交通限制无法成型。物流系统仍极度依赖地下实体隧道，基建效率极其低下。" }
      ],
      infrastructureImpact: "没有了描述动力学共振与频率衰减的二阶微分方程，现代轻质大跨度悬索桥、高空摩天大楼和风力涡轮发电机都无法安全耸立。为了抵抗风阻和力学震荡，建筑物不得不采用极其原始、厚重的巨石与巨柱结构，现代空气动力学不复存在。",
      civilizationScore: 45,
      aiAnalysis: "微分方程是理解波、振动与阻尼的唯一绝对数学工具。没有了二阶线性常微分方程对弹性系数的调谐，人类在自然界的流体与狂风面前将退化为粗放堆叠铆钉的‘泥水匠’，无法跨入现代精密大跨度空间工程。这生动证明了数学决定了物理地标的最高海拔。"
    },
    fourier: {
      alternativeTitle: "沉默的世纪：纯铜线与物理邮差的延续",
      chronology: [
        { year: "1880年", event: "由于无法分解混叠的波形，早期的多路复用电报宣告失败。每条信息的传送仍需占用专线铜缆。" },
        { year: "1930年", event: "模拟无线电台遭遇严重的信道拥堵。由于无法实施频谱滤波，所有广播信号在空中杂乱相撞，通讯设备退回到近距离有线电话阶段。" },
        { year: "1980年", event: "计算机处理音频和图像的能力陷入瓶颈，数字多媒体和JPEG/MP3等压缩标准从未出现，互联网因传输量过大无法向公众开放。" },
        { year: "2026年", event: "今天依然没有智能手机或5G网络。数万名人工投递员骑自行车穿行在城市间，传递由纸带转译的信息。‘物理邮递’依旧是世界最重要的干线。" }
      ],
      infrastructureImpact: "傅里叶分析是将复杂信号和波动分解为简谐分量的终极工具。没有傅里叶级数，微波通信、光纤多路复用、数字信号处理（DSP）、无线Wi-Fi均成为空谈。电子工程、医学CT扫描、地震预测与量子力学波函数解析全都因缺乏简谱分析而在黑暗中摸索。",
      civilizationScore: 35,
      aiAnalysis: "傅里叶变换将时域转换为频域，是人类提取自然振荡节奏的‘数学透镜’。剥离这一透镜，我们眼前的电磁波、声波和地震波将只剩一团无法拆解的杂乱噪音。现代无线通信与音视频数字文明的崩塌，揭示了微积分其实是连接物理波动与数字代码的不可替代之桥。"
    },
    kepler: {
      alternativeTitle: "重力牢笼：终身禁锢于地表的物种",
      chronology: [
        { year: "1800年", event: "由于无法求解二体问题与重力场积分，牛顿万有引力定律与天体运行预测只能停留在圆周轨道粗略估算。哈雷彗星的回归预测失败。" },
        { year: "1960年", event: "第一枚轨道火箭试射，因无法解析变质量系统的瞬时加速度微分方程，火箭偏离轨道，在重返大气层时解体。航天科学宣告为‘工程禁区’。" },
        { year: "1990年", event: "由于没有基于开普勒轨道及引力摄动的GPS同步算法，全球定位服务无法实现。航运、测绘和地表农业只能依赖人工罗盘。" },
        { year: "2026年", event: "月球和火星探测依然是科幻小说。人类缺乏同步卫星通信网络，洲际商务被太平洋底极不稳定的潜艇中继线和短波无线电瓶颈所围困。" }
      ],
      infrastructureImpact: "积分学与轨道微分方程是逃离重力井的‘数字阶梯’。缺失了牛顿的积分原理和开普勒力学积分，人类根本无法推算逃逸速度、弹道轨道多级修正以及星际深空助推轨道（引力弹弓），所有太空望远镜与人造卫星都无法安全工作，人类甚至无法跨入GPS时代。",
      civilizationScore: 28,
      aiAnalysis: "空间探索本质上是对可变加速度与重力场通量的积分旅行。如果抽离这些微积分计算，宇宙将再次沦为繁星密布的神秘天幕，而人类只能永远贴伏在陆地上，用望远镜哀叹那无法精确演算的高悬禁区。人类被永远锁死在摇篮之中。"
    },
    gradient: {
      alternativeTitle: "规则机器：停留在专家表格中的黑盒",
      chronology: [
        { year: "1960年", event: "由于导数链式法则未被引入感知机模型，逻辑异或（XOR）问题成为人工神经网络无法逾越的死胡同。研究资金彻底中断。" },
        { year: "1990年", event: "计算机视觉和语音处理依然使用基于人工IF-ELSE专家系统的决策树。拼音输入与图像识别错误率高居70%以上。" },
        { year: "2010年", event: "大型互联网搜索引擎因缺乏矩阵梯度反向传播，无法根据用户行为进行高维度的个性化协同过滤。网络世界呈现单调静态推荐。" },
        { year: "2026年", event: "大语言模型（如GPT系列和Gemini）从未萌芽，无人驾驶、智能仓储与机器翻译完全处于逻辑玩具阶段。人类的脑力溢出效率被困在缓慢的传统编程中。" }
      ],
      infrastructureImpact: "梯度（高维导数）是定义和寻找函数最小值的指南针。没有梯度下降算法，多层感知器、深度卷积神经网络和Transformer等架构由于无法从海量参数中逆向传导误差、自动调整权重而彻底瘫痪。现代AI文明将永久折断双翼。",
      civilizationScore: 50,
      aiAnalysis: "多变量微积分的核心就是寻找变化梯度的极值点。人工智能学习与误差修正本质上是在数十亿维参数空间中由梯度指引的高维漫步。没有梯度，机器就失去了‘睁眼看错并修正自我’的微积分公式，沦为写满死硬规则的打字机。"
    }
  };

  try {
    if (!aiClient) {
      // Return predefined structure if API client is not initialized
      const basePreset = mockDeductions[scenarioId] || {
        alternativeTitle: `如果抽离了“${withdrawnTool}”：重设的逻辑断层`,
        chronology: [
          { year: "第一阶段 (0-10年)", event: `相关的近代工程研究完全停顿，行业退回到纯经验主义。` },
          { year: "第二阶段 (10-50年)", event: `通信与航天工业因计算困难无法建立大尺度基础设施，能源危机爆发。` },
          { year: "第三阶段 (50-100年)", event: `现代超级城市不复存在，生活水平和计算工具退化到19世纪中叶水平。` },
        ],
        infrastructureImpact: `抽离“${withdrawnTool}”使得相关的微积分连续变量分析无法展开，物理世界的工程设计只能依靠超标冗余和直觉模型，大型高精度复杂工业网链、计算机与高吞吐网络通通发生灾难性科技退潮。`,
        civilizationScore: 40,
        aiAnalysis: `数学是文明的无声骨架。剥离了“${withdrawnTool}”工具，微积分大厦就塌掉了重要的一角，人类将永远失去精密预测连续流动、电磁振荡与自适应优化的数理眼睛。`
      };

      // Enrich slightly with user input if present to show personalization even in offline state
      if (userPrompt) {
        basePreset.aiAnalysis += ` （注：在您提及“${userPrompt}”的思路上，由于缺乏微分级联支持，也必然会发生严重的工程计算中断。）`;
      }
      return res.json(basePreset);
    }

    // Call Gemini API full-stack safely
    const schema = {
      type: Type.OBJECT,
      properties: {
        alternativeTitle: {
          type: Type.STRING,
          description: "A creative, slightly tragic, and highly descriptive Title of the alternate history timeline (e.g. '沉默的无线时代')"
        },
        chronology: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              year: { type: Type.STRING, description: "Historical year / milestone (e.g., 1850年, 1920年, 2026年)" },
              event: { type: Type.STRING, description: "Description of what happened or failed to happen in alternative engineering and daily life" }
            },
            required: ["year", "event"]
          },
          description: "A chronological timeline of how history diverged when this mathematical tool was removed"
        },
        infrastructureImpact: {
          type: Type.STRING,
          description: "Detailed description of the consequences on urban infrastructure, heavy engineering, computing, or communication"
        },
        civilizationScore: {
          type: Type.INTEGER,
          description: "An evaluation score out of 100 indicating where this alternate humanity stands (100 is modern, 10 is medieval)"
        },
        aiAnalysis: {
          type: Type.STRING,
          description: "A highly educational philosophical and scientific essay analyzing how this specific calculus tool underpins current civilization"
        }
      },
      required: ["alternativeTitle", "chronology", "infrastructureImpact", "civilizationScore", "aiAnalysis"]
    };

    const promptMessage = `
      您是一位顶级的文明发展史学家和应用数学家。
      假设在微积分发展史中，由于某种原因，人类彻底抽离/未发现以下这一具体数学工具/公式：“${withdrawnTool}”(对应场景背景：${scenarioId})。
      
      用户提供的干扰或偏好变量：${userPrompt || "无额外干预"}。
      
      请展开严密、极具科幻质感与数理严谨性的推演，论证以下结果：
      1. 缺失它之后，历史上的重大工业、物理、天文、计算机革命将如何在关键节点崩溃、延宕或倒退，推演到公元2026年人类文明的状态。
      2. 分析为什么该工具在物理或信息工程中拥有绝对无可替代的支配地位，不能被简单的常识或拼凑经验取代。
      
      请必须以结构完备的JSON格式回应。
    `;

    const response = await retryWithBackoff(() =>
      aiClient!.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptMessage,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.85,
          systemInstruction: "你是一个历史推演算法与应用数学AI。你从不废话，只提供最深刻、最符合数理力学和计算机科学历史常识、言之凿凿的交错历史推演和深入骨髓的微积分哲学洞察。全部文字请用简体中文。"
        }
      })
    );

    const parsedData = JSON.parse(response.text || "{}");
    return res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini invocation failed, returning elegant default dataset", error);
    // Return a structured error fallback
    return res.json({
      alternativeTitle: `抽离“${withdrawnTool}”：混沌历史节点`,
      chronology: [
        { year: "公元18世纪", event: "失去了该微分微积分基底后，古典力学和射击弹道推导被迫采用低精度的线性逼近，大型铸铁工程事故率飙升。" },
        { year: "20世纪中叶", event: "模拟无线传导和轨道运载推力无法建立负反馈控制闭环，信息科学止步于穿孔纸带与继电器计数器。" },
        { year: "当代2026", event: "数字和AI革命未曾发生。依靠水力、蒸汽和物理机械组成的宏大齿轮管道支撑着笨重的生活，算术和文明形态保持在维多利亚时期蒸汽朋克状态。" }
      ],
      infrastructureImpact: "微分运动描述与级数逼近工具被毁，导致重力飞行、高频通信、电磁天线、自动反馈控制等多面技术发生全盘系统崩溃，只剩在机械摩擦损耗下苟延残喘的宏大工业躯壳。",
      civilizationScore: 38,
      aiAnalysis: `【仿真反馈】计算遇到网络过载，但本推演模型依然高度肯定：没有数学级数与微分梯度的指路，工程与优化将在无边无际的荒原中迷失。微积分是文明免于塌缩的唯一确定支柱。`
    });
  }
});


// REST API for general Calculus AI Q&A window
app.post("/api/calculus-qa", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages array." });
  }

  const latestUserMessage = messages.filter(m => m.role === "user").pop();
  const query = latestUserMessage ? latestUserMessage.content : "";

  try {
    if (aiClient) {
      // Map frontend messages role of 'assistant' or 'model' to API format if needed
      // Gemini chats accept role: "user" | "model"
      const geminiContents = messages.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content || "" }]
      }));

      const response = await retryWithBackoff(() =>
        aiClient!.models.generateContent({
          model: "gemini-3.5-flash",
          contents: geminiContents,
          config: {
            temperature: 0.7,
            systemInstruction: "你是一个博古通今的微积分文明导师与应用数学家（名：微积分时空助手）。你精通微积分核心定理，更擅长阐述微积分如何缔造现代工程（塔科马大桥振动、开普勒轨道天体积分、麦克斯韦方程、人工智能反向传播梯度流、洛伦兹混沌声视）。用生动逼真、严谨而充满诗意和学术感的简体中文与学者聊天。如果字数过多请适当排版使用markdown表格或列表。"
          }
        })
      );

      return res.json({ text: response.text || "学理探讨进行中，暂时未获得有效回复。" });
    }
  } catch (error) {
    console.error("Gemini Q&A failed, falling back to expert model:", error);
  }

  // Fallback to highly optimized Calculus expert system (offline model)
  const lowerQuery = query.toLowerCase();
  let reply = "";

  if (lowerQuery.includes("贝克莱") || lowerQuery.includes("幽灵") || lowerQuery.includes("无穷小") || lowerQuery.includes("极限")) {
    reply = `### 🔮 贝克莱主教的无穷小之辩与极限解决

在微积分诞生之初，**艾萨克·牛顿**和**莱布尼茨**对“无穷小量” $\\Delta x$ 的描述含混不清：在计算导数时，第一步假定 $\\Delta x \\neq 0$ 作为分母；第二步又令 $\\Delta x = 0$ 让它消失。

**乔治·贝克莱主教**（Bishop George Berkeley）在1734年发表檄文，尖锐地讽刺：
> “它们既不是有限的量，也不是极小的量，甚至根本不是虚无。它们是什么？难道是**‘已死之量的幽灵’**吗？”

这就是著名的**第二次微积分危机**。

#### 💡 魏尔斯特拉斯的 $\\epsilon-\\delta$ 极限定义
这一危机延迟了一百多年，直到19世纪，由柯西、魏尔斯特拉斯等人建立 **$\\epsilon-\\delta$ 极限语言**，彻底抛弃了不确定的“幽灵量”，把“逼近”过程转化为确定性的实数范围控制，将逼近代数化。

您可以切换到**“历史叙事”**切片，拖动滑块调节 $\\Delta x$ 体验割线如何完美逼近黄金切线的“幽灵收敛”过程！`;
  } else if (lowerQuery.includes("塔科马") || lowerQuery.includes("共振") || lowerQuery.includes("桥") || lowerQuery.includes("物理") || lowerQuery.includes("微分方程")) {
    reply = `### 🌉 自激共振与二阶非线性微分方程

1940年美国华盛顿州的**塔科马海峡大桥**（Tacoma Narrows Bridge）由于轻微的风力骤然坍塌。通常人们误以为它是发生了“共振”，但本质上它是**自激空气动力弹性颤振（Aerodynamic Flutter）**。

在物理仿真中，可以用二阶弹簧-阻尼动力学方程描述：
$$m\\frac{d^2 x}{dt^2} + c(x)\\frac{dx}{dt} + k x = F(t)$$

- **负阻尼效应**：当风速超过临界值，结构阻尼系数 $c(x)$ 在特定相位变为负值，说明流体在对结构做功补给能量，导致振幅指数级膨胀，最终解体。
- **微分形式**：微积分为我们提供了预测波形发散与衰减的唯一利器。

您可以前往**“物理仿真”**切片，通过提升刚度或添加空气阻尼（$c$ 系数）来亲手拯救这座桥梁！`;
  } else if (lowerQuery.includes("麦克斯韦") || lowerQuery.includes("波动") || lowerQuery.includes("电磁") || lowerQuery.includes("梯度") || lowerQuery.includes("神经网络")) {
    reply = `### 📡 微积分的双螺旋：麦克斯韦电磁场与神经网络梯度流

这代表了微积分在人类科学史上的两次最顶峰的应用：

#### 1. 麦克斯韦对称平衡的多维通量（散度与旋度）
麦克斯韦通过四个微积分标量算子，将电场与磁场紧密编织在一起：
- 变化磁场随时间积分可产生电场旋涡，变化电场又产生磁场。
- 这组偏微分方程的奇妙解指向了一个恒定的波动速度——**光速**，从而断言光就是一种电磁波！

#### 2. AI 神经网络的命运：高维梯度（Gradient Vector）
现代人工神经网络（如Transformer）的核心参数调整是靠微积分的**导数链式法则**（Chain Rule）：
$$\\nabla L = \\left[ \\frac{\\partial L}{\\partial w_1}, \\frac{\\partial L}{\\partial w_2}, \\dots \\right]^T$$
我们在动辄千亿维度的复杂误差“山谷”中，永远朝着梯度的反方向（最陡峭下降方向）下山，让机器学会识别和思考。

您可以前往**“现代电磁&AI”**切片，排版感受梯度向量方向如何搜寻函数极小值！`;
  } else if (lowerQuery.includes("声音") || lowerQuery.includes("混沌") || lowerQuery.includes("洛伦兹") || lowerQuery.includes("美学")) {
    reply = `### 🎵 连续之美发生器：自适应混沌几何与音画艺术

当我们在三维极值空间中设定连续的洛伦兹吸引子（Lorentz Attractor）微分方程式：
$$\\frac{dx}{dt} = \\sigma(y - x), \\quad \\frac{dy}{dt} = x(\\rho - z) - y, \\quad \\frac{dz}{dt} = xy - \\beta z$$

- **蝴蝶效应**：初始条件即使微调 $10^{-6}$，在时间累积积分下，轨迹也会在不同的两翼环绕中产生截然相反的演化路径。
- **声音合成**：我们将吸引子轨迹的速度 $\\frac{ds}{dt}$ 映射至音频由于微分流动而产生的数学交响曲线。

您可以调节**“美学声视”**切片中的参数，听到混沌在跳跃双翼时的频率尖叫！`;
  } else if (lowerQuery.includes("编译") || lowerQuery.includes("代码") || lowerQuery.includes("脚本")) {
    reply = `### 💻 编译器：将微原方程映射到工业脚本

在工程实际中，连续的分析符号没法直接塞给CPU。我们需要将符号算子转化为数值微积分求解器：
- 导数 $\\frac{dy}{dt}$ 转化为有限差分： $y_{n+1} = y_n + f(t_n, y_n) \\Delta t$。
- 积分转化为黎曼连续求和或龙格-库塔高阶逼近。

在**“代码编译器”**切片中，您可以选择任何一个理论物理公式，一键转化生成 Python/Matlab 脚本和 WebGL 3D 渲染器！`;
  } else {
    reply = `### 👋 您好！我是微积分文明时空助理

很高兴与您共同探讨连续变化的无声语言——**微积分**！

您可以向我提问：
- *“为什么偏微分方程能预测光速？”*
- *“如何理解AI深度学习本质上是微积分在千亿维度下的下山游戏？”*
- *“贝克莱主教的无穷小幽灵到底是怎么被彻底封印的？”*
- *“给我介绍下洛伦兹吸引子的混沌美学吧！”*

或者，您可以点击屏幕顶部的各个切片来操作动态数学仿真！在这里，微积分不再是枯燥的考试公式，它是文明史中最震撼人心的工具。请随时提问！`;
  }

  return res.json({ text: reply });
});


// Hook up Vite middleware in development or serve static build files in production
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Calculus Civilization Applet running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
