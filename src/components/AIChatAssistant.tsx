/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, Send, Sparkles, X, User, Bot, HelpCircle, Loader2, 
  Settings, Key, Check, AlertCircle, Eye, EyeOff, ShieldCheck,
  BookOpen, Search, ArrowRight, ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import MathFormula from "./MathFormula";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CalculusTerm {
  id: string;
  nameZh: string;
  nameEn: string;
  formula: string;
  definition: string;
  history: string;
  tag: "全部" | "基础" | "微解析" | "求和累加" | "微分方程" | "场论";
}

const CALCULUS_VOCABULARY: CalculusTerm[] = [
  {
    id: "limit",
    nameZh: "极限",
    nameEn: "Limit",
    formula: "\\lim_{x \\to a} f(x) = L",
    definition: "描述函数在一处邻域内随着自变量无限逼近某一确定数时的解析趋势。由柯西与魏尔斯特拉斯通过标准的 (ε, δ) 语言奠定了现代高等数学坚实严密的基石。",
    history: "牛顿与莱布尼茨初期均依赖直观、模糊的无穷小。这引来了贝克莱主教的科学攻讦，指责无穷小量是“消逝量的幽灵”（即第一次微积分危机）。最终19世纪极限论的确立彻底驱散了幽灵。",
    tag: "基础"
  },
  {
    id: "derivative",
    nameZh: "导数与流数",
    nameEn: "Derivative & Fluxion",
    formula: "f'(x) = \\lim_{\\Delta x \\to 0} \\frac{f(x+\\Delta x)-f(x)}{\\Delta x}",
    definition: "函数在空间/时间某一点的瞬时变化率，几何表现为切线斜率，是衡量一个量对另一个量瞬时敏感度的底层工具。",
    history: "牛顿从运动学出发，将其命名为“流数(Fluxion)”；莱布尼茨则将其看作商 dy/dx。思想观与符号表达的对立，导致了英国皇家学会与欧洲大陆数学界长达百年的发明权公案。",
    tag: "微解析"
  },
  {
    id: "differential",
    nameZh: "微分",
    nameEn: "Differential",
    formula: "dy = f'(x) \\, dx",
    definition: "自变量产生微小变化 dx 时，函数自变量响应的、最核心主要的“局部线性近似”部分。它使得复杂弯曲在微小世界中皆可用直线拟合。",
    history: "莱布尼茨设计微积分时，精细赋予了 dy 和 dx 无穷小实体的数学运算直觉。其极高适应性的代数乘除律（如链式法则）让欧洲大陆的数学应用在18世纪反超英国本土。",
    tag: "微解析"
  },
  {
    id: "integral",
    nameZh: "黎曼积分",
    nameEn: "Riemann Integral",
    formula: "\\int_a^b f(x) \\, dx = \\lim_{\\lambda \\to 0} \\sum_{i=1}^n f(\\xi_i) \\Delta x_i",
    definition: "将函数图形围成区间无限细化分割，求其微宽乘高度的无穷累加和的极限。代表了微观积聚从而通向宏观物理量总和的过程。",
    history: "古希腊阿基米德曾采用割圆术和穷竭法逼近圆周率和抛物线面积。直至19世纪，波尔查诺、柯西及黎曼将其用积分和的上确界与下确界进行定义，扫清了求和逻辑的混乱。",
    tag: "求和累加"
  },
  {
    id: "ftc",
    nameZh: "微积分基本定理",
    nameEn: "Fundamental Theorem of Calculus",
    formula: "\\frac{d}{dx} \\int_a^x f(t) \\, dt = f(x)",
    definition: "又称牛顿-莱布尼茨公式。将求切线的“微分”（改变率）与求面积的“积分”（累加）这两个独立发源、方向看似相反的分支，在数学逻辑上神奇地连接在了一起，确立了它们为互逆运算。",
    history: "在牛顿和莱布尼茨之前，切线归费马、笛卡尔管，面积归卡瓦列里、阿基米德管，彼此风马牛不相及。此定理一出，微积分彻底打破各分支孤岛状态，升华为普适代数算法。",
    tag: "求和累加"
  },
  {
    id: "ode",
    nameZh: "常微分方程 (ODE)",
    nameEn: "Ordinary Differential Equation",
    formula: "m \\frac{d^2 y}{dt^2} + c \\frac{dy}{dt} + k y = F_0 \\cos(\\omega t)",
    definition: "包含未知函数、自变量以及该未知一阶或高阶导数的解析方程。用于在力学、声学、自动化控制中描述物体随时间演变的动态平衡律。",
    history: "欧拉、拉格朗日、达朗贝尔等人在天体力学与流体力学研究中发展了求解体系。在工程领域，诸如塔科马海峡大桥在特定阻尼下的能量自激颤振共振反应，便是由此方程解释并在仿真沙盒中复现的。",
    tag: "微分方程"
  },
  {
    id: "gradient",
    nameZh: "梯度向量",
    nameEn: "Gradient",
    formula: "\\nabla \\mathcal{L} = \\left[ \\frac{\\partial \\mathcal{L}}{\\partial x}, \\frac{\\partial \\mathcal{L}}{\\partial y} \\right]^T",
    definition: "多维空间标量场中某处高度/误差上升最快的速度矢量。其负方向（负梯度）即为下降最快的最陡峭下降方向，构成了优化算法的指南针。",
    history: "随着多元微积分的发展，自哈密顿引入梯度算子引入了完美的偏导矩阵表达。在现代 AI 中，梯度是神经网络通过反向传播在千亿维度空间下迭代训练、完成权重“误差极小化”的最核心数学依据。",
    tag: "场论"
  },
  {
    id: "taylor",
    nameZh: "泰勒级数",
    nameEn: "Taylor Series",
    formula: "f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!} (x-a)^n",
    definition: "将复杂的平滑超越函数（如三角、对数、指数函数）使用一处邻域的无限次高阶导数作为连加系数，展开为易于计算的长项数代数多项式。",
    history: "由英国数学家布鲁克·泰勒于1715年系统发表。它在现代数值计算与工程插值、极限求解中有着无出其右的地位，任何计算器底层的超越方程计算几乎都蕴藏着泰勒展开思想的投影。",
    tag: "基础"
  },
  {
    id: "maxwell",
    nameZh: "麦克斯韦旋散度",
    nameEn: "Curl & Divergence",
    formula: "\\nabla \\times \\mathbf{B} = \\mu_0 \\varepsilon_0 \\frac{\\partial \\mathbf{E}}{\\partial t}",
    definition: "散度度量场在某一点向外的净流量源强；旋度标度该场在极微元局域自旋旋转的环流量与方向，它们构成了多维矢量分析的核心度量工具。",
    history: "麦克斯韦应用流体运动学和偏导数学工具，将法拉第看似感性的“力线”描述写成了完美对称的四元旋散微分方程组。不仅解答了电磁场变化之妙，更通过波动偏微分直接预言并证实了光速与电磁波的本质相通。",
    tag: "场论"
  }
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  { label: "贝克莱幽灵危机", query: "贝克莱主教说的无穷小幽灵到底是什么？最后是谁解决的？" },
  { label: "微分方程解密颤振", query: "大桥由于自激空气颤振坍塌，如何用二阶非线性微分方程来描述阻尼变为负数？" },
  { label: "麦克斯韦与光速", query: "麦克斯韦方程组的散度、旋度在多维微积分上有什么深刻物理意义？" },
  { label: "AI 机器梯度下山", query: "为什么说神经网络的训练本质上是在千亿维度下的微积分下山游戏？梯度代表什么？" }
];

interface AIChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChatAssistant({ isOpen, onClose }: AIChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "### 🌌 欢迎来到微积时空学术舱！\n我是您的**微积分学术导师**。在这里，数学不再是卷子上的干瘪公式，而是推动世界流转、电磁激荡与机器觉醒的无声史诗。\n\n您可以向我追问任何微积分、动力平衡、AI梯度计算或历史危机的问题，让我们一同感受连续变化的永恒之美！"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // States for advanced LLM keys and configurations
  const [geminiKey, setGeminiKey] = useState<string>(() => localStorage.getItem("CALCULUS_GEMINI_KEY") || "");
  const [deepseekKey, setDeepseekKey] = useState<string>(() => localStorage.getItem("CALCULUS_DEEPSEEK_KEY") || "");
  const [deepseekUrl, setDeepseekUrl] = useState<string>(() => localStorage.getItem("CALCULUS_DEEPSEEK_URL") || "https://api.deepseek.com/v1/chat/completions");
  const [activeModel, setActiveModel] = useState<"gemini" | "deepseek">(
    () => (localStorage.getItem("CALCULUS_ACTIVE_MODEL") as "gemini" | "deepseek") || "gemini"
  );
  
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showKey, setShowKey] = useState<boolean>(false);

  // Calculus Vocabulary Index state
  const [activeTab, setActiveTab] = useState<"chat" | "index">("chat");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("全部");

  // Temporary state holders for form inputs
  const [tempGeminiKey, setTempGeminiKey] = useState("");
  const [tempDeepseekKey, setTempDeepseekKey] = useState("");
  const [tempDeepseekUrl, setTempDeepseekUrl] = useState("");
  const [tempModel, setTempModel] = useState<"gemini" | "deepseek">("gemini");

  useEffect(() => {
    if (showSettings) {
      setTempGeminiKey(geminiKey);
      setTempDeepseekKey(deepseekKey);
      setTempDeepseekUrl(deepseekUrl);
      setTempModel(activeModel);
    }
  }, [showSettings, geminiKey, deepseekKey, deepseekUrl, activeModel]);

  useEffect(() => {
    const handleAskEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.query) {
        setInputValue(customEvent.detail.query);
        setActiveTab("chat");
      }
    };
    window.addEventListener("ask-academic-chat", handleAskEvent);
    return () => {
      window.removeEventListener("ask-academic-chat", handleAskEvent);
    };
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem("CALCULUS_GEMINI_KEY", tempGeminiKey);
    localStorage.setItem("CALCULUS_DEEPSEEK_KEY", tempDeepseekKey);
    localStorage.setItem("CALCULUS_DEEPSEEK_URL", tempDeepseekUrl);
    localStorage.setItem("CALCULUS_ACTIVE_MODEL", tempModel);
    
    setGeminiKey(tempGeminiKey);
    setDeepseekKey(tempDeepseekKey);
    setDeepseekUrl(tempDeepseekUrl);
    setActiveModel(tempModel);
    setShowSettings(false);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, showSettings]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    // Check key before sending
    const currentKey = activeModel === "gemini" ? geminiKey : deepseekKey;
    if (!currentKey) {
      setShowSettings(true);
      return;
    }

    const updatedMessages = [...messages, { role: "user" as const, content: textToSend }];
    setMessages(updatedMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      let responseText = "";

      if (activeModel === "gemini") {
        // Map message history to Gemini contents structure
        const geminiContents = updatedMessages.map(msg => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        }));

        const modelName = "gemini-3.5-flash"; 
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${currentKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: geminiContents,
            systemInstruction: {
              parts: [{ text: "你是一个微积分与物理学的学术导师。你的态度硬核、专业而饱含科学美学，擅长用精确的代码和微分方程分析物理系统。探讨微积分危机（如贝克莱幽灵）、共振非线性（如塔科马海峡风力负阻尼阻尼变为负）、高维鞍点寻找反向传播、麦克斯韦方程组的流数物理意义。请使用精美排版的 Markdown 格式及 LaTeX 样式的数学公式（如 $dx$）回复，保持文字富有思辨高度。" }]
            }
          })
        });

        if (!res.ok) {
          const errDetails = await res.text();
          throw new Error(`Gemini API Response: ${res.status} - ${errDetails}`);
        }

        const data = await res.json();
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "大模型未返回任何文本内容。";

      } else {
        // DeepSeek-V4-Pro via OpenAI SDK compatible browser fetch
        const systemMsg = {
          role: "system",
          content: "你是一个微积分与物理学的学术导师。你的态度硬核高维而饱含科学探讨美感。请使用精美排版的 Markdown 格式及 $...$ 数学格式符号进行解答。"
        };
        
        const deepseekContents = [
          systemMsg,
          ...updatedMessages.map(msg => ({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.content
          }))
        ];

        const res = await fetch(deepseekUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${currentKey}`
          },
          body: JSON.stringify({
            model: "deepseek-v4-pro", // Standard model API name for DeepSeek-V4-Pro
            messages: deepseekContents,
            temperature: 0.6
          })
        });

        if (!res.ok) {
          const errDetails = await res.text();
          throw new Error(`DeepSeek API Response: ${res.status} - ${errDetails}`);
        }

        const data = await res.json();
        responseText = data.choices?.[0]?.message?.content || "DeepSeek 未返回任何文本内容。";
        
        // Render thinking trace if supported by DeepSeek V4 Pro
        const reasoning = data.choices?.[0]?.message?.reasoning_content;
        if (reasoning) {
          responseText = `> 💭 **V4 Pro 深度思考链：**\n> ${reasoning.split('\n').join('\n> ')}\n\n${responseText}`;
        }
      }

      setMessages(prev => [...prev, { role: "assistant", content: responseText }]);
    } catch (error: any) {
      console.error("Q&A call failed:", error);
      let errorMsg = error?.message || "网络请求异常";
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ **时空学术助理接口异常**\n\n\`${errorMsg}\`\n\n**解决方案提示：**\n1. 请检查您的 API 密钥（API-Key）是否输入正确。\n2. **浏览器 CORS 拦截警告：** 许多大模型提供商（如 DeepSeek 官方 API）设置了反向跨域拦截，直接在前端静态网页调用会失败。如需在 GitHub 静态网页使用，建议使用支持 CORS 的中转 API。`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-compiled basic markdown translator because react-markdown is heavy and can cause import noise
  const renderMarkdown = (text: string) => {
    // Simple robust regex mapper for titles, bold, blocks
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let content = line;
      
      // Headers
      if (content.startsWith("### ")) {
        return <h4 key={idx} className="font-display font-bold text-slate-800 text-sm mt-3 mb-1.5 flex items-center gap-1.5 border-b border-slate-100 pb-1">{content.slice(4)}</h4>;
      }
      if (content.startsWith("#### ")) {
        return <h5 key={idx} className="font-mono font-bold text-slate-700 text-xs mt-2.5 mb-1">{content.slice(5)}</h5>;
      }
      
      // Bullet points
      if (content.startsWith("- ")) {
        return (
          <li key={idx} className="text-xs text-slate-650 ml-4 list-disc my-1 leading-relaxed">
            {parseInlineStyles(content.slice(2))}
          </li>
        );
      }
      if (content.startsWith("> ")) {
        return (
          <blockquote key={idx} className="border-l-3 border-brand-orange/40 bg-slate-50 pl-3 py-1 my-2 text-xs text-slate-600 italic rounded-r">
            {parseInlineStyles(content.slice(2))}
          </blockquote>
        );
      }

      return (
        <p key={idx} className="text-xs text-slate-700 my-1.5 leading-relaxed break-words">
          {parseInlineStyles(content)}
        </p>
      );
    });
  };

  const parseInlineStyles = (text: string) => {
    // Basic bold **text** and inline $math$ formatting
    const parts: React.ReactNode[] = [];
    let currentText = text;
    let keyIdx = 0;

    // A simple parser to split by ** and $
    const regex = /(\*\*.*?\*\*|\$.*?\$)/g;
    const tokens = currentText.split(regex);

    return tokens.map((token, index) => {
      if (token.startsWith("**") && token.endsWith("**")) {
        return <strong key={index} className="font-semibold text-slate-900">{token.slice(2, -2)}</strong>;
      }
      if (token.startsWith("$") && token.endsWith("$")) {
        return <code key={index} className="font-mono bg-brand-orange/5 text-brand-orange px-1 rounded text-[11px] font-medium">{token.slice(1, -1)}</code>;
      }
      return token;
    });
  };

  if (!isOpen) return null;

  const currentKeySet = activeModel === "gemini" ? !!geminiKey : !!deepseekKey;

  return (
    <div className="w-full lg:w-96 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] overflow-hidden h-[540px] lg:h-full lg:flex-1 lg:min-h-0">
      {/* Drawer Header */}
      <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-brand-orange/10 text-brand-orange rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xs text-slate-800">时空学术助理 (Calculus AI)</h3>
            <p className="text-[9px] text-slate-400 font-mono">
              {activeModel === "gemini" ? "Gemini 3.5 Flash 舱" : "DeepSeek-V4-Pro 推理舱"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            type="button"
            onClick={() => setShowSettings(prev => !prev)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer select-none ${
              showSettings 
                ? "bg-brand-orange/10 text-brand-orange" 
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
            }`}
            title="接口及大模型配置"
          >
            <Settings className={`w-4 h-4 ${showSettings ? "animate-spin" : ""}`} style={{ animationDuration: "12s" }} />
          </button>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Switchers shown when not in settings */}
      {!showSettings && (
        <div className="flex border-b border-slate-150 bg-slate-50 text-[11px] font-mono select-none shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-2.5 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === "chat"
                ? "border-brand-orange text-brand-orange bg-white font-bold"
                : "border-transparent text-slate-500 hover:text-slate-850 hover:bg-slate-100/55"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI 学术问答</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("index");
              setSearchTerm("");
            }}
            className={`flex-1 py-2.5 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === "index"
                ? "border-brand-orange text-brand-orange bg-white font-bold"
                : "border-transparent text-slate-500 hover:text-slate-850 hover:bg-slate-100/55"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>微积分词汇索引</span>
          </button>
        </div>
      )}

      {/* Main Content Pane */}
      {showSettings ? (
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Settings className="w-4 h-4 text-brand-orange" />
              <h4 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">大模型学术接口高级设置</h4>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              由于本项目计划部署于 GitHub 静态托管，所有的大模型运算均<strong>直接在浏览器端 client-side 完成</strong>。为激活功能，请在下方提供您的 API 密钥，该敏感地方数据仅存储在您的 browser LocalStorage 中。
            </p>

            {/* Selector */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-500 font-mono font-medium">1. 选择科研大模型</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTempModel("gemini")}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                    tempModel === "gemini"
                      ? "border-brand-orange bg-brand-orange/5 text-brand-orange shadow-xs font-semibold"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-650 hover:text-slate-850"
                  }`}
                >
                  <Sparkles className={`w-4 h-4 ${tempModel === "gemini" ? "text-brand-orange" : "text-slate-400"}`} />
                  <div className="flex flex-col">
                    <span className="text-xs">Gemini Flash</span>
                    <span className="text-[8px] opacity-75 font-mono">gemini-3.5-flash</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTempModel("deepseek")}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                    tempModel === "deepseek"
                      ? "border-brand-orange bg-brand-orange/5 text-brand-orange shadow-xs font-semibold"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-650 hover:text-slate-850"
                  }`}
                >
                  <Bot className={`w-4 h-4 ${tempModel === "deepseek" ? "text-slate-700" : "text-slate-400"}`} />
                  <div className="flex flex-col">
                    <span className="text-xs">DeepSeek-V4-Pro</span>
                    <span className="text-[8px] opacity-75 font-mono">deepseek-v4-pro</span>
                  </div>
                </button>
              </div>
            </div>

            {/* API Key Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-500 font-mono font-medium flex items-center justify-between">
                <span>2. 输入 {tempModel === "gemini" ? "Gemini" : "DeepSeek"} API 密钥</span>
                <span className="text-[8px] text-emerald-650 font-bold flex items-center gap-0.5">
                  <ShieldCheck className="w-3" /> 纯客端不泄露
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <input
                  type={showKey ? "text" : "password"}
                  value={tempModel === "gemini" ? tempGeminiKey : tempDeepseekKey}
                  onChange={(e) => {
                    if (tempModel === "gemini") {
                      setTempGeminiKey(e.target.value);
                    } else {
                      setTempDeepseekKey(e.target.value);
                    }
                  }}
                  placeholder={tempModel === "gemini" ? "输入 AIzaSy 开头的 Gemini 密钥" : "输入 sk- 开头的 DeepSeek 密钥"}
                  className="block w-full pl-9 pr-9 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-brand-orange/60 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                >
                  {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Custom endpoint URL for DeepSeek (CORS fallback) */}
            {tempModel === "deepseek" && (
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-500 font-mono font-medium flex items-center justify-between">
                  <span>3. DeepSeek API 请求端点 (CORS/中转)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={tempDeepseekUrl}
                    onChange={(e) => setTempDeepseekUrl(e.target.value)}
                    placeholder="https://api.deepseek.com/v1/chat/completions"
                    className="block w-full px-3 py-1.5 text-[10px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-brand-orange/60 font-mono text-slate-650"
                  />
                </div>
                <p className="text-[9px] text-slate-400 leading-normal">
                  提示：DeepSeek 官方直连由于跨域策略(CORS)，浏览器端会拒绝。建议输入高可靠的代理、OneAPI/NewAPI 或反代接口，以在纯静态网页中完好调用。
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition cursor-pointer select-none border border-slate-200 text-center font-medium"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSaveSettings}
              className="flex-1 py-1.5 px-3 bg-brand-orange hover:bg-brand-orange-600 text-white rounded-xl text-xs transition flex items-center justify-center gap-1.5 font-semibold cursor-pointer shadow-xs select-none"
            >
              <Check className="w-3.5 h-3.5" /> 确认大模型选择
            </button>
          </div>
        </div>
      ) : activeTab === "chat" ? (
        <>
          {/* Key missing warning banner */}
          {!currentKeySet && (
            <div className="mx-4 mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl text-slate-700 text-[11px] flex items-center justify-between gap-2 shadow-xs shrink-0 font-sans">
              <div className="flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                <span>
                  未绑定用于静态页的 API 密钥。请输入 <b>{activeModel === "gemini" ? "Gemini" : "DeepSeek"} 密钥</b> 以激活学术大模型。
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setShowSettings(true)}
                className="px-2.5 py-1 bg-brand-orange hover:bg-brand-orange-600 text-white rounded-lg text-[10px] cursor-pointer transition font-medium shrink-0 shadow-xs"
              >
                去配置
              </button>
            </div>
          )}

          {/* Messages Sandbox Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50"
          >
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100 text-[10px]">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div 
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs border ${
                      msg.role === "user"
                        ? "bg-brand-orange border-brand-orange text-white rounded-br-none"
                        : "bg-white border-slate-100 text-slate-800 rounded-bl-none"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="break-words leading-relaxed">{msg.content}</p>
                    ) : (
                      <div>{renderMarkdown(msg.content)}</div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-6 h-6 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0 text-[10px] border border-brand-orange/20">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Thinking Loader */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2.5 animate-pulse"
                >
                  <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 shrink-0">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <div className="bg-white border border-slate-200/60 rounded-2xl rounded-bl-none px-4 py-3 shadow-xs">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                      <span>时空学术神经网络计算中...</span>
                      <span className="animate-bounce font-sans">∫(dx)</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Suggested Quick Prompts */}
          {messages.length < 3 && (
            <div className="p-3 bg-white border-t border-slate-100 flex flex-col gap-1.5 shrink-0">
              <p className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 px-1">
                <HelpCircle className="w-3" /> 学术热点疑问推荐：
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(p.query)}
                    className="p-1.5 text-left rounded-lg border border-slate-100 hover:border-brand-orange/30 hover:bg-brand-orange/5 text-[10px] text-slate-600 hover:text-slate-800 transition text-ellipse line-clamp-1 truncate cursor-pointer font-sans"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input panel */}
          <div className="p-3 bg-white border-t border-slate-100 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="relative flex items-center bg-slate-50 border border-slate-200 focus-within:border-brand-orange/60 transition rounded-xl px-3 py-1.5"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={currentKeySet ? "问问高维梯度、风力负阻尼、柯西极限..." : "请点击右上角 ⚙️ 配置学术 API 密钥..."}
                className="flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder-slate-400 pr-10 font-sans"
                disabled={isLoading || !currentKeySet}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading || !currentKeySet}
                className={`absolute right-1.5 p-2 rounded-lg transition ${
                  inputValue.trim() && !isLoading && currentKeySet
                    ? "bg-brand-orange text-white shadow-xs cursor-pointer hover:bg-brand-orange-600"
                    : "text-slate-300 cursor-not-allowed"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col bg-slate-50/50 overflow-hidden">
          {/* Search bar & Tag filters */}
          <div className="p-3 bg-white border-b border-slate-150 flex flex-col gap-2 shrink-0">
            {/* Search input */}
            <div className="relative flex items-center bg-slate-50 border border-slate-200 focus-within:border-brand-orange/60 transition rounded-xl px-2.5 py-1.5 shadow-2xs">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="在索引中搜索词汇名称、公式或历史..."
                className="flex-1 bg-transparent text-[11px] text-slate-800 outline-none placeholder-slate-400 font-sans"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="text-[10px] text-slate-450 hover:text-slate-650 cursor-pointer font-sans"
                >
                  清除
                </button>
              )}
            </div>

            {/* Tag Quick Selectors */}
            <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar select-none text-[9.5px]">
              {(["全部", "基础", "微解析", "求和累加", "微分方程", "场论"] as const).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`px-2 py-0.5 rounded-md shrink-0 transition-all font-mono font-medium border cursor-pointer ${
                    selectedTag === tag
                      ? "bg-brand-orange/10 text-brand-orange border-brand-orange/30 font-bold"
                      : "bg-slate-55 border-slate-200 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Terms Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {CALCULUS_VOCABULARY.filter(item => {
              const matchesSearch = item.nameZh.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    item.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    item.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    item.history.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesTag = selectedTag === "全部" || item.tag === selectedTag;
              return matchesSearch && matchesTag;
            }).map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col text-left group"
              >
                {/* Header section (Ch/En titles + tag badge) */}
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex flex-col">
                    <h4 className="font-display font-bold text-xs text-slate-800 flex items-center gap-1">
                      {item.nameZh}
                    </h4>
                    <span className="text-[9.5px] font-mono text-slate-400 capitalize mt-0.5">{item.nameEn}</span>
                  </div>
                  <span className="text-[9px] font-mono font-medium py-0.5 px-2 bg-slate-100 border border-slate-200 text-slate-500 rounded-md">
                    {item.tag}
                  </span>
                </div>

                {/* Mathematical Equation displays inside card */}
                <div className="my-2.5 py-2 px-3 bg-slate-50 border border-slate-150/75 rounded-lg flex items-center justify-center select-all shadow-inner">
                  <MathFormula math={item.formula} block={true} className="text-brand-orange text-xs font-bold" />
                </div>

                {/* Exact academic definition text info */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">1. 严密学术定义</span>
                  <p className="text-[11px] text-slate-650 leading-relaxed font-sans">{item.definition}</p>
                </div>

                {/* Dynamic historiography perspective */}
                <div className="mt-2.5 p-2 bg-amber-50/30 border border-amber-100/40 rounded-lg text-[10.5px] leading-relaxed text-slate-550 font-sans">
                  <div className="flex items-center gap-1 mb-1 border-b border-amber-100/20 pb-0.5 text-amber-800 font-mono text-[9px] font-bold uppercase">
                    <span>📜 历史经纬与争端</span>
                  </div>
                  <p>{item.history}</p>
                </div>

                {/* Hover trigger - interactive follow up query */}
                <button
                  type="button"
                  onClick={() => {
                    const query = `你好，我对微积分词条中的【${item.nameZh} (${item.nameEn})】非常感兴趣。你能结合物理学与数学思想史，再详细讲讲它的推演渊源、具体计算律和现代科技中的工程应用吗？`;
                    setActiveTab("chat");
                    if (currentKeySet) {
                      handleSendMessage(query);
                    } else {
                      setInputValue(query);
                    }
                  }}
                  className="mt-3.5 w-full py-1.5 px-3 bg-brand-orange/5 hover:bg-brand-orange hover:text-white border border-brand-orange/20 hover:border-brand-orange rounded-lg text-[10px] font-mono font-bold text-brand-orange transition-all duration-200 flex items-center justify-center gap-1 shadow-2xs cursor-pointer select-none"
                >
                  <span>向学术导师追问此词条</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </motion.div>
            ))}

            {/* Empty stats handler */}
            {CALCULUS_VOCABULARY.filter(item => {
              const matchesSearch = item.nameZh.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    item.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    item.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    item.history.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesTag = selectedTag === "全部" || item.tag === selectedTag;
              return matchesSearch && matchesTag;
            }).length === 0 && (
              <div className="py-12 px-4 text-center">
                <Search className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-pulse" />
                <p className="text-xs text-slate-450 font-medium font-sans">没有任何词条符合您的搜索过滤器</p>
                <p className="text-[10px] text-slate-400 mt-1 font-sans">请尝试更换筛选条件或简短搜索关键词</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
