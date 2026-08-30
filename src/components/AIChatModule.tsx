import React, { useState, useRef, useEffect } from "react";
import { PersonaId, ChatMessage, AIModelConfig } from "../types";
import { PERSONAS } from "../data/historyData";
import { MathView } from "./MathView";
import { AIModelSettingsModal } from "./AIModelSettingsModal";
import {
  getSavedAIConfig,
  saveAIConfig,
  sendChatMessage,
} from "../services/aiChatService";
import {
  MessageSquare,
  Send,
  Sparkles,
  RefreshCw,
  User,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Key,
  Trash2,
  HelpCircle,
} from "lucide-react";

export const AIChatModule: React.FC = () => {
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>("newton");
  const [inputMessage, setInputMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [aiConfig, setAiConfig] = useState<AIModelConfig>(() => getSavedAIConfig());

  const [messages, setMessages] = useState<Record<PersonaId, ChatMessage[]>>({
    archimedes: [
      {
        id: "m_arc_1",
        sender: "persona",
        personaId: "archimedes",
        text: "我是叙拉古的阿基米德。给我一个支点，我将撬动整个地球。关于抛物线弓形割补、球体与外切圆柱体积之比（2:3），或力学平衡称重求积，你有什么几何疑问想要与我探讨？",
        timestamp: "公元前250年",
      },
    ],
    newton: [
      {
        id: "m_new_1",
        sender: "persona",
        personaId: "newton",
        text: "我是艾萨克·牛顿。自然界的定律由连续流动的力学轨迹所主宰。流数术（Fluxions）揭示了速度矢量 $\\dot{x}$ 与瞬间微量 $o\\dot{x}$ 的深层秘密。如果你想探讨天体引力轨道或二项式流数展开，尽可发问。",
        timestamp: "1687年",
      },
    ],
    leibniz: [
      {
        id: "m_lei_1",
        sender: "persona",
        personaId: "leibniz",
        text: "我是戈特弗里德·威廉·莱布尼茨。好的记号是思维最强大的助产士！我所创制的微商 $\\frac{dy}{dx}$ 与求和积分号 $\\int y dx$ 揭示了微分与积分的对偶神圣之美。让我们像计算四则运算一样计算微积分吧！",
        timestamp: "1684年",
      },
    ],
    berkeley: [
      {
        id: "m_ber_1",
        sender: "persona",
        personaId: "berkeley",
        text: "我是爱尔兰克洛因主教乔治·贝克莱。你们这些自诩崇尚理性的数学家，在推导导数时引入增量 $o$，先假定它不为零而做除法，随后又假定它是零而将其抹杀！这难道不是‘逝去量的幽灵’吗？你如何为这种逻辑矛盾辩护？",
        timestamp: "1734年",
      },
    ],
    cauchy: [
      {
        id: "m_cau_1",
        sender: "persona",
        personaId: "cauchy",
        text: "我是奥古斯丁-路易·柯西。微积分的根基绝不能建立在直觉、力学运动或幽灵般的微元上，而必须建立在严格的极限数列与 $(\\varepsilon, \\delta)$ 实数不等式之上。让我们用严密的逻辑驱逐一切含糊不清。",
        timestamp: "1821年",
      },
    ],
  });

  const activePersonaObj = PERSONAS.find((p) => p.id === selectedPersona)!;
  const activeChatList = messages[selectedPersona] || [];
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Sync config from local storage
  useEffect(() => {
    setAiConfig(getSavedAIConfig());
  }, []);

  const hasApiKey = Boolean(aiConfig.apiKey && aiConfig.apiKey.trim().length > 0);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [activeChatList, loading]);

  const handleSaveConfig = (newConfig: AIModelConfig) => {
    setAiConfig(newConfig);
    saveAIConfig(newConfig);
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputMessage.trim();
    if (!textToSend || loading) return;

    // Check if API key is configured
    if (!hasApiKey) {
      setIsSettingsOpen(true);
      return;
    }

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedPersona]: [...(prev[selectedPersona] || []), userMsg],
    }));

    setInputMessage("");
    setLoading(true);

    try {
      // Build conversation history
      const history = (messages[selectedPersona] || []).map((m) => ({
        role: m.sender === "user" ? ("user" as const) : ("model" as const),
        text: m.text,
      }));

      const res = await sendChatMessage({
        prompt: textToSend,
        personaId: selectedPersona,
        history,
        config: aiConfig,
      });

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: "persona",
        personaId: selectedPersona,
        text: res.text,
        timestamp: `${new Date().toLocaleTimeString()} · ${res.modelUsed}`,
      };

      setMessages((prev) => ({
        ...prev,
        [selectedPersona]: [...(prev[selectedPersona] || []), aiMsg],
      }));
    } catch (e: any) {
      console.warn("AI Chat error:", e);
      const errMsg = e.message || "大模型请求失败";
      const fallbackMsg: ChatMessage = {
        id: `fb_${Date.now()}`,
        sender: "persona",
        personaId: selectedPersona,
        text: `（${activePersonaObj.name} 答道）：${errMsg}\n\n*提示：请点击右上角 ⚙️ 设置大模型，检查您的 API-Key 或切换大模型引擎。*`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => ({
        ...prev,
        [selectedPersona]: [...(prev[selectedPersona] || []), fallbackMsg],
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages((prev) => ({
      ...prev,
      [selectedPersona]: [
        {
          id: `init_${Date.now()}`,
          sender: "persona",
          personaId: selectedPersona,
          text: `（${activePersonaObj.name} 整理手稿重新端坐）：对话记录已清空。我们可以从新的几何命题或哲学争议重新开始！`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with Title and Model Settings Gear Icon on Far Right */}
      <div className="bg-[#F0EEE6] border border-[#D4C5B0] rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-serif bg-[#E8E4D9] text-[#7A7468] border border-[#D4C5B0] mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>核心模块 7 · AI 虚拟数学家对话与跨时代哲学答疑</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#3D3D3D]">
              跨越两千年的第一人称学术对谈
            </h2>
            <p className="text-xs sm:text-sm text-[#7A7468] font-serif mt-1">
              与阿基米德、牛顿、莱布尼茨、贝克莱主教、柯西等历史先贤展开沉浸式学术辩论，深度探寻微积分发明的灵感源泉与哲学争议。
            </p>
          </div>

          {/* Model Settings Trigger Group on the Far Right */}
          <div className="flex items-center space-x-2 shrink-0 self-start md:self-center">
            {/* Active Model Indicator Badge */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#D4C5B0] text-xs font-serif shadow-2xs">
              {aiConfig.model === "gemini-3-flash" ? (
                <Sparkles className="w-3.5 h-3.5 text-[#C4A468]" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-[#5A5A40]" />
              )}
              <span className="font-bold text-[#3D3D3D]">
                {aiConfig.model === "gemini-3-flash"
                  ? "Gemini 3 Flash"
                  : "DeepSeek V4 Pro"}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  hasApiKey ? "bg-emerald-500" : "bg-amber-500"
                }`}
                title={hasApiKey ? "API-Key 已配置就绪" : "未配置 API-Key"}
              />
            </div>

            {/* Gear Icon Button for Settings */}
            <button
              id="btn-open-ai-settings"
              onClick={() => setIsSettingsOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#5A5A40] hover:bg-[#474732] text-white text-xs font-serif font-bold transition-all shadow-xs cursor-pointer group"
              title="设置大模型：手工输入 API-Key，选择 Gemini 3 Flash / DeepSeek V4 Pro"
            >
              <Settings className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform duration-300" />
              <span>设置大模型</span>
            </button>
          </div>
        </div>

        {/* Missing API Key Guidance Banner */}
        {!hasApiKey && (
          <div className="mt-4 p-3 rounded-lg bg-[#FAF3E8] border border-[#E8D4BA] flex items-center justify-between gap-3 text-xs text-[#8A5B22] font-serif animate-in fade-in duration-200">
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-[#C4883B] shrink-0" />
              <span>
                <strong>提示：</strong> 本项目支持部署至 GitHub Pages
                在浏览器端直接调用。所有大模型调用必须先输入 API-Key。
              </span>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3 py-1 bg-[#8A5B22] hover:bg-[#6E481A] text-white rounded-md text-xs font-bold shrink-0 transition-colors cursor-pointer"
            >
              立即配置 Key
            </button>
          </div>
        )}
      </div>

      {/* Personas Selector Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {PERSONAS.map((p) => {
          const isSelected = selectedPersona === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPersona(p.id)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#5A5A40] text-white border-[#5A5A40] shadow-sm ring-2 ring-[#5A5A40]/30"
                  : "bg-white hover:bg-[#F0EEE6] text-[#3D3D3D] border-[#D4C5B0]"
              }`}
            >
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="text-xl">{p.avatar}</span>
                <div>
                  <h4 className="font-serif font-bold text-xs line-clamp-1">{p.name}</h4>
                  <span
                    className={`text-[10px] block ${
                      isSelected ? "text-[#E8E4D9]" : "text-[#8E887B]"
                    }`}
                  >
                    {p.era}
                  </span>
                </div>
              </div>
              <p
                className={`text-[11px] font-serif line-clamp-1 ${
                  isSelected ? "text-[#E8E4D9]" : "text-[#7A7468]"
                }`}
              >
                {p.title}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Chat Conversation Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Cols: Message Flow */}
        <div className="lg:col-span-3 bg-white border border-[#D4C5B0] rounded-xl p-5 shadow-sm flex flex-col h-[580px]">
          {/* Persona Header in Chat */}
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE7DF] mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{activePersonaObj.avatar}</span>
              <div>
                <h3 className="font-serif font-bold text-sm text-[#3D3D3D]">
                  {activePersonaObj.name} ({activePersonaObj.era})
                </h3>
                <p className="text-[11px] font-serif text-[#7A7468] line-clamp-1">
                  “{activePersonaObj.quote}”
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-serif px-2.5 py-1 rounded-full bg-[#EAE7DF] text-[#3D3D3D] border border-[#D4C5B0] hidden sm:inline-block">
                {activePersonaObj.coreBelief}
              </span>
              <button
                onClick={handleClearHistory}
                className="p-1.5 rounded-lg text-[#8E887B] hover:text-[#3D3D3D] hover:bg-[#F0EEE6] transition-colors cursor-pointer"
                title="清空当前人物对话记录"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto space-y-4 pr-2 font-serif text-xs"
          >
            {activeChatList.map((msg) => {
              const isMe = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-2.5 ${
                    isMe ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                      isMe
                        ? "bg-[#5A5A40] text-white"
                        : "bg-[#EAE7DF] text-[#3D3D3D] border border-[#D4C5B0]"
                    }`}
                  >
                    {isMe ? <User className="w-3.5 h-3.5" /> : activePersonaObj.avatar}
                  </div>

                  <div
                    className={`max-w-[82%] rounded-xl p-3.5 leading-relaxed ${
                      isMe
                        ? "bg-[#5A5A40] text-white shadow-xs"
                        : "bg-[#F0EEE6] text-[#3D3D3D] border border-[#D4C5B0] shadow-xs"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between text-[10px] opacity-75">
                      <span className="font-bold">
                        {isMe ? "你 (现代学者)" : activePersonaObj.name}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div className="text-xs">
                      <MathView math={msg.text} />
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center space-x-2 text-xs font-serif text-[#7A7468] p-3 bg-[#F0EEE6] rounded-lg border border-[#D4C5B0] w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#5A5A40]" />
                <span>
                  {activePersonaObj.name} 正在提笔推演手稿回复中 (
                  {aiConfig.model === "gemini-3-flash"
                    ? "Gemini 3 Flash"
                    : "DeepSeek V4 Pro"}
                  )...
                </span>
              </div>
            )}
          </div>

          {/* Quick Preset Starters */}
          <div className="pt-3 pb-2 flex flex-wrap gap-1.5 border-t border-[#EAE7DF] mt-2">
            <span className="text-[11px] font-serif text-[#7A7468] mr-1 flex items-center">
              💡 提问建议:
            </span>
            {activePersonaObj.suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 rounded-full text-[11px] font-serif bg-[#EAE7DF] hover:bg-[#ded9ce] text-[#3D3D3D] border border-[#D4C5B0] transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2 pt-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                hasApiKey
                  ? `向 ${activePersonaObj.name} 提出关于微积分数学史或哲学原理的疑问...`
                  : `请先点击右上角 ⚙️ 设置大模型并输入 API-Key 后方可发起学术对谈...`
              }
              className="flex-1 bg-[#F9F7F2] border border-[#D4C5B0] rounded-full px-3.5 py-2 text-xs font-serif text-[#3D3D3D] placeholder:text-[#8E887B] focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="px-4 py-2 rounded-full bg-[#5A5A40] hover:opacity-90 disabled:opacity-40 text-white text-xs font-serif inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>发送</span>
            </button>
          </form>
        </div>

        {/* Right 1 Col: Persona Biography & Key Publications */}
        <div className="bg-white border border-[#D4C5B0] rounded-xl p-5 shadow-sm space-y-4 text-xs font-serif">
          <div className="text-center pb-3 border-b border-[#EAE7DF]">
            <div className="w-14 h-14 rounded-full bg-[#EAE7DF] border border-[#D4C5B0] flex items-center justify-center text-3xl mx-auto mb-2 shadow-xs">
              {activePersonaObj.avatar}
            </div>
            <h4 className="font-bold text-sm text-[#3D3D3D]">{activePersonaObj.name}</h4>
            <span className="text-[11px] text-[#7A7468]">{activePersonaObj.era}</span>
          </div>

          <div>
            <span className="font-bold text-[#3D3D3D] block mb-1">学术头衔与地位：</span>
            <p className="text-[#555555] leading-relaxed">{activePersonaObj.title}</p>
          </div>

          <div>
            <span className="font-bold text-[#3D3D3D] block mb-1">核心哲学信条：</span>
            <p className="text-[#555555] leading-relaxed">{activePersonaObj.coreBelief}</p>
          </div>

          <div>
            <span className="font-bold text-[#3D3D3D] block mb-1">传世经典代表作：</span>
            <p className="text-[#555555] italic leading-relaxed">
              《{activePersonaObj.classicWork}》
            </p>
          </div>

          <div className="bg-[#F0EEE6] p-3 rounded-lg border border-[#D4C5B0] text-[#5A5A40]">
            <span className="font-bold block mb-1">当前大模型引擎：</span>
            <div className="flex items-center justify-between text-[11px]">
              <span>
                {aiConfig.model === "gemini-3-flash"
                  ? "Gemini 3 Flash"
                  : "DeepSeek V4 Pro"}
              </span>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="underline hover:text-[#3D3D3D] cursor-pointer"
              >
                切换/配置
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Model Settings Modal */}
      <AIModelSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentConfig={aiConfig}
        onSaveConfig={handleSaveConfig}
      />
    </div>
  );
};
