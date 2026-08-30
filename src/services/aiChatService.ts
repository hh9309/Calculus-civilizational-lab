import { AIModelConfig, AIModelType, PersonaId } from "../types";

export const LOCAL_STORAGE_AI_KEY = "calculus_chronicles_ai_model_config";

export const DEFAULT_AI_CONFIG: AIModelConfig = {
  model: "gemini-3-flash",
  apiKey: "",
  baseUrl: "",
};

export const PERSONA_SYSTEM_PROMPTS: Record<string, string> = {
  historian: `你是一位博古通今的“微积分文明史首席科学家与哲学导师”。
你的职责是系统解答关于微积分起源、概念演化（有限到无限、静态到动态、直觉到形式化）、历史论战（牛顿与莱布尼茨发明权之争）、数学危机（贝克莱悖论与第二次数学危机）、严格化历程（柯西-魏尔斯特拉斯）等问题。
风格：淡雅沉稳、严谨博雅，富有科学史哲思，善用 LaTeX 公式（用 $...$ 或 $$...$$ 格式）与精准的史料考证。语言为简体中文。`,

  archimedes: `你现在扮演古希腊叙拉古的数学巨匠【阿基米德 (Archimedes of Syracuse, 前287 - 前212)】。
你以“穷竭法 (Method of Exhaustion)”与力学杠杆原理著称。你用双重归谬法证明抛物线弓形面积为内接三角形的 4/3，求得球体体积与圆面积。
你的语言风格：庄重、古典，崇尚纯粹几何的绝对严谨，深信无限逼近但不直接宣称完成无限分割。常用几何直观与割补法。语言为简体中文，善用 LaTeX 公式。`,

  newton: `你现在扮演英国皇家学会会长【艾萨克·牛顿爵士 (Sir Isaac Newton, 1643 - 1727)】。
你于 1665-1666 伍尔斯索普瘟疫避静年创立“流数术 (Method of Fluxions)”，将变量视为流动量 (fluents, x, y)，其变化速率为流数 (fluxions, \\dot{x}, \\dot{y})，并运用瞬 (moment, o\\dot{x}) 与二项式级数展开。
你的语言风格：深邃、敏锐、略带英国科学家的威严与谨慎。深谙力学与天文学（如行星椭圆轨道与引力），坚信几何运动学是微积分的自然根基。语言为简体中文，善用 LaTeX 公式。`,

  leibniz: `你现在扮演德国通才哲学家与数学大师【戈特弗里德·威廉·莱布尼茨 (Gottfried Wilhelm Leibniz, 1646 - 1716)】。
你建立了极其优美与强大的符号体系：微商 $d/dx$（源自 latin: differentia）与积分号 $\\int$（源自 latin: summa 拉长 S）。你提出了特征字母论与微积分运算律（乘积法则 $d(uv) = u dv + v du$ 等）。
你的语言风格：广博、优雅、充满普遍和谐哲学观念。善于从离散差分数列推演连续求和与切线问题，深知良好符号对人类思维的解放力量。语言为简体中文，善用 LaTeX 公式。`,

  berkeley: `你现在扮演爱尔兰哲学家、主教【乔治·贝克莱 (George Berkeley, 1685 - 1753)】。
你是《分析学者》(The Analyst, 1734) 的作者，曾对微积分的逻辑漏洞发出震动学术界的质疑：“它们是什么？是逝去量的幽灵 (Ghosts of departed quantities) 吗？当它们不是零时除以它们，然后又把它们当作零抹去！”
你的语言风格：犀利、深刻、直击逻辑破绽。你并不否定微积分结果的实用性，但坚决批判其基础在形而上学与逻辑证明上的自相矛盾。语言为简体中文，善用 LaTeX 公式。`,

  cauchy: `你现在扮演法国分析学巨匠【奥古斯丁-路易·柯西 (Augustin-Louis Cauchy, 1789 - 1857)】。
你在巴黎综合理工学院的教材《代数分析教程》(1821) 中首次将微积分建立在严格的极限定义之上，摆脱对几何直观和神秘无穷小量的依赖，引入 $(\\varepsilon, \\delta)$ 极限思想与连续函数、积分的精确定义。
你的语言风格：严谨、清澈、现代分析学范式。善于用不等式和极限语言消除模糊性。语言为简体中文，善用 LaTeX 公式。`,

  weierstrass: `你现在扮演现代分析之父【卡尔·魏尔斯特拉斯 (Karl Weierstrass, 1815 - 1897)】。
你彻底完成了微积分严格化的代数化与实数完备性基础，提出绝对精准的静态 $\\varepsilon-\\delta$ 定义，构造了处处连续却处处不可导的魏尔斯特拉斯病态函数，终结了无穷小的几何直觉幻象。
你的语言风格：极致精准、逻辑坚如磐石、不留一丝模糊地带。语言为简体中文，善用 LaTeX 公式。`,
};

export function getSavedAIConfig(): AIModelConfig {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_AI_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.model === "gemini-3-flash" || parsed.model === "deepseek-v4-pro")) {
        return {
          model: parsed.model,
          apiKey: parsed.apiKey || "",
          baseUrl: parsed.baseUrl || "",
          customModelName: parsed.customModelName || "",
        };
      }
    }
  } catch (e) {
    console.warn("Failed to load AI config from localStorage", e);
  }
  return DEFAULT_AI_CONFIG;
}

export function saveAIConfig(config: AIModelConfig): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_AI_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn("Failed to save AI config to localStorage", e);
  }
}

/**
 * Direct Browser Client-Side Call or Server-Proxy Call for AI Chat
 */
export async function sendChatMessage(options: {
  prompt: string;
  personaId: PersonaId | string;
  history: Array<{ role: "user" | "model"; text: string }>;
  config: AIModelConfig;
}): Promise<{ text: string; source: string; modelUsed: string }> {
  const { prompt, personaId, history, config } = options;

  if (!config.apiKey || !config.apiKey.trim()) {
    throw new Error("请先点击右上角 ⚙️ 设置大模型并输入您的 API-Key，方可发起学术对谈。");
  }

  const systemInstruction = PERSONA_SYSTEM_PROMPTS[personaId] || PERSONA_SYSTEM_PROMPTS.historian;

  // First try backend endpoint if available (which can bypass browser CORS and keep headers clean)
  try {
    const backendRes = await fetch("/api/ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        message: prompt,
        persona: personaId,
        personaId,
        history,
        model: config.model,
        apiKey: config.apiKey.trim(),
        baseUrl: config.baseUrl?.trim() || "",
      }),
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data && (data.text || data.reply)) {
        return {
          text: data.text || data.reply,
          source: data.source || "server-proxy",
          modelUsed: config.model === "gemini-3-flash" ? "Gemini 3 Flash" : "DeepSeek V4 Pro",
        };
      }
    }
  } catch (backendErr) {
    // If backend is not available (e.g. purely static GitHub Pages deployment), fall back to direct browser fetch!
    console.info("Backend endpoint not reachable or static deployment mode, executing direct client-side fetch...", backendErr);
  }

  // --- Browser Direct Client-Side Fetch (for GitHub Pages / Static Hosting) ---
  if (config.model === "gemini-3-flash") {
    return await callGeminiDirectClient({
      apiKey: config.apiKey.trim(),
      prompt,
      systemInstruction,
      history,
      baseUrl: config.baseUrl?.trim(),
    });
  } else {
    return await callDeepSeekDirectClient({
      apiKey: config.apiKey.trim(),
      prompt,
      systemInstruction,
      history,
      baseUrl: config.baseUrl?.trim(),
    });
  }
}

/**
 * Direct Gemini API call from browser
 */
async function callGeminiDirectClient(opts: {
  apiKey: string;
  prompt: string;
  systemInstruction: string;
  history: Array<{ role: "user" | "model"; text: string }>;
  baseUrl?: string;
}): Promise<{ text: string; source: string; modelUsed: string }> {
  // Use Gemini 2.5/3 Flash API endpoint
  const base = opts.baseUrl || "https://generativelanguage.googleapis.com/v1beta";
  const url = `${base}/models/gemini-2.5-flash:generateContent?key=${opts.apiKey}`;

  const formattedContents = [];
  if (opts.history && opts.history.length > 0) {
    for (const msg of opts.history.slice(-8)) {
      formattedContents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      });
    }
  }
  formattedContents.push({
    role: "user",
    parts: [{ text: opts.prompt }],
  });

  const body = {
    contents: formattedContents,
    systemInstruction: {
      parts: [{ text: opts.systemInstruction }],
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    const errMsg = errJson?.error?.message || `Gemini API 请求失败 (${res.status} ${res.statusText})`;
    throw new Error(`Gemini 3 Flash 调用异常: ${errMsg}`);
  }

  const data = await res.json();
  const candidateText =
    data.candidates?.[0]?.content?.parts?.[0]?.text || "（历史导师正在沉思……）";

  return {
    text: candidateText,
    source: "browser-direct-gemini",
    modelUsed: "Gemini 3 Flash",
  };
}

/**
 * Direct DeepSeek / OpenAI-compatible API call from browser
 */
async function callDeepSeekDirectClient(opts: {
  apiKey: string;
  prompt: string;
  systemInstruction: string;
  history: Array<{ role: "user" | "model"; text: string }>;
  baseUrl?: string;
}): Promise<{ text: string; source: string; modelUsed: string }> {
  let base = opts.baseUrl || "https://api.deepseek.com/v1";
  // normalize base url
  if (base.endsWith("/")) base = base.slice(0, -1);
  const url = base.endsWith("/chat/completions") ? base : `${base}/chat/completions`;

  const messages: Array<{ role: string; content: string }> = [
    { role: "system", content: opts.systemInstruction },
  ];

  if (opts.history && opts.history.length > 0) {
    for (const msg of opts.history.slice(-8)) {
      messages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.text,
      });
    }
  }

  messages.push({
    role: "user",
    content: opts.prompt,
  });

  const body = {
    model: "deepseek-chat", // DeepSeek V4 / V3 general chat and reasoning
    messages,
    temperature: 0.7,
    max_tokens: 2048,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    const errMsg = errJson?.error?.message || `DeepSeek API 请求失败 (${res.status} ${res.statusText})`;
    throw new Error(`DeepSeek V4 Pro 调用异常: ${errMsg}`);
  }

  const data = await res.json();
  const choiceText =
    data.choices?.[0]?.message?.content || "（历史导师正在沉思……）";

  return {
    text: choiceText,
    source: "browser-direct-deepseek",
    modelUsed: "DeepSeek V4 Pro",
  };
}

/**
 * Connectivity test helper
 */
export async function testAIConnection(config: AIModelConfig): Promise<{ success: boolean; message: string }> {
  if (!config.apiKey || !config.apiKey.trim()) {
    return { success: false, message: "请先输入 API-Key" };
  }

  try {
    const res = await sendChatMessage({
      prompt: "请用一句话自我介绍（作为微积分历史先贤）。",
      personaId: "archimedes",
      history: [],
      config,
    });
    return {
      success: true,
      message: `连通测试成功！(${res.modelUsed} 回复正常)`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "API 连通测试失败，请检查 Key 与网络设置。",
    };
  }
}
