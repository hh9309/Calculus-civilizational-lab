import React, { useState, useEffect } from "react";
import { AIModelConfig, AIModelType } from "../types";
import {
  saveAIConfig,
  testAIConnection,
  DEFAULT_AI_CONFIG,
} from "../services/aiChatService";
import {
  Settings,
  X,
  Key,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Globe,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
} from "lucide-react";

interface AIModelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: AIModelConfig;
  onSaveConfig: (newConfig: AIModelConfig) => void;
}

export const AIModelSettingsModal: React.FC<AIModelSettingsModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSaveConfig,
}) => {
  const [selectedModel, setSelectedModel] = useState<AIModelType>(
    currentConfig.model || "gemini-3-flash"
  );
  const [apiKey, setApiKey] = useState<string>(currentConfig.apiKey || "");
  const [baseUrl, setBaseUrl] = useState<string>(currentConfig.baseUrl || "");
  const [showKey, setShowKey] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Testing status
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedModel(currentConfig.model || "gemini-3-flash");
      setApiKey(currentConfig.apiKey || "");
      setBaseUrl(currentConfig.baseUrl || "");
      setTestResult(null);
    }
  }, [isOpen, currentConfig]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!apiKey.trim()) {
      setTestResult({
        success: false,
        message: "请输入有效的 API-Key 后再进行确认保存。",
      });
      return;
    }

    const newConfig: AIModelConfig = {
      model: selectedModel,
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim() || undefined,
    };

    saveAIConfig(newConfig);
    onSaveConfig(newConfig);
    onClose();
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult({
        success: false,
        message: "请先在上方输入 API-Key，再进行连通性测试。",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const testConfig: AIModelConfig = {
      model: selectedModel,
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim() || undefined,
    };

    const res = await testAIConnection(testConfig);
    setIsTesting(false);
    setTestResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white border border-[#D4C5B0] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col font-serif"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F0EEE6] border-b border-[#D4C5B0]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#5A5A40] text-white flex items-center justify-center shadow-xs">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#3D3D3D]">
                大模型调用设置 (AI Model Settings)
              </h3>
              <p className="text-[11px] text-[#7A7468]">
                配置 API-Key 与模型引擎 · 支持 GitHub 静态部署浏览器直连
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A7468] hover:text-[#3D3D3D] hover:bg-[#E8E4D9] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Notice banner */}
          <div className="bg-[#FAF8F2] border border-[#D4C5B0] rounded-xl p-3.5 flex items-start space-x-3 text-xs text-[#5A5A40]">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#5A5A40]" />
            <div className="leading-relaxed">
              <span className="font-bold text-[#3D3D3D] block mb-0.5">
                浏览器本地安全密钥存储说明：
              </span>
              为了便于本项目直接部署至 GitHub Pages 或个人静态空间，您的 API-Key 仅加密保存于当前浏览器的本地缓存（LocalStorage）中，发起对话时由浏览器直连调用，绝不泄露给任何未授权第三方。
            </div>
          </div>

          {/* Section 2: Choose Model (2 Options) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#3D3D3D] flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>步骤 1 · 选择大模型引擎 (Choose Large Model)</span>
              </label>
              <span className="text-[11px] text-[#7A7468]">必选其一</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Gemini 3 Flash */}
              <div
                onClick={() => {
                  setSelectedModel("gemini-3-flash");
                  setTestResult(null);
                }}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  selectedModel === "gemini-3-flash"
                    ? "bg-[#FAF8F2] border-[#5A5A40] shadow-sm"
                    : "bg-white border-[#EAE7DF] hover:border-[#D4C5B0]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-[#C4A468]" />
                      <h4 className="font-bold text-sm text-[#3D3D3D]">
                        Gemini 3 Flash
                      </h4>
                    </div>
                    {selectedModel === "gemini-3-flash" && (
                      <span className="w-2 h-2 rounded-full bg-[#5A5A40]"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#7A7468] leading-relaxed">
                    Google DeepMind 旗舰闪电模型，数学公式 LaTeX 解析与多轮哲学对话响应极速。
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#EAE7DF] flex items-center justify-between text-[10px] text-[#8E887B]">
                  <span>提供商: Google</span>
                  <span className="text-[#5A5A40] font-mono">gemini-3-flash</span>
                </div>
              </div>

              {/* Option 2: DeepSeek V4 Pro */}
              <div
                onClick={() => {
                  setSelectedModel("deepseek-v4-pro");
                  setTestResult(null);
                }}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  selectedModel === "deepseek-v4-pro"
                    ? "bg-[#FAF8F2] border-[#5A5A40] shadow-sm"
                    : "bg-white border-[#EAE7DF] hover:border-[#D4C5B0]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1.5">
                      <Zap className="w-4 h-4 text-[#5A5A40]" />
                      <h4 className="font-bold text-sm text-[#3D3D3D]">
                        DeepSeek V4 Pro
                      </h4>
                    </div>
                    {selectedModel === "deepseek-v4-pro" && (
                      <span className="w-2 h-2 rounded-full bg-[#5A5A40]"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#7A7468] leading-relaxed">
                    深度强化学习与高阶符号推演旗舰，擅长严密逻辑辩论与长思维链学术论证。
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#EAE7DF] flex items-center justify-between text-[10px] text-[#8E887B]">
                  <span>提供商: DeepSeek</span>
                  <span className="text-[#5A5A40] font-mono">deepseek-v4-pro</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Manual API Key Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#3D3D3D] flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>
                  步骤 2 · 手工输入 {selectedModel === "gemini-3-flash" ? "Google Gemini" : "DeepSeek"} API-Key
                </span>
              </label>

              <span className="text-[11px] text-[#8E887B]">
                {selectedModel === "gemini-3-flash"
                  ? "AI Studio Key (以 AIzaSy 开头)"
                  : "DeepSeek Key (以 sk- 开头)"}
              </span>
            </div>

            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestResult(null);
                }}
                placeholder={
                  selectedModel === "gemini-3-flash"
                    ? "请输入您的 Google AI Studio API Key..."
                    : "请输入您的 DeepSeek API Key (sk-...)..."
                }
                className="w-full bg-[#F9F7F2] border border-[#D4C5B0] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#3D3D3D] placeholder:text-[#A8A295] focus:outline-none focus:ring-1 focus:ring-[#5A5A40] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E887B] hover:text-[#3D3D3D] cursor-pointer"
              >
                {showKey ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#7A7468] pt-1">
              <span>
                尚未获取 Key？可在官方平台免费申请：
              </span>
              <a
                href={
                  selectedModel === "gemini-3-flash"
                    ? "https://aistudio.google.com/app/apikey"
                    : "https://platform.deepseek.com/api_keys"
                }
                target="_blank"
                rel="noreferrer"
                className="text-[#5A5A40] hover:underline font-bold inline-flex items-center space-x-1"
              >
                <span>
                  {selectedModel === "gemini-3-flash"
                    ? "获取 Google API Key"
                    : "获取 DeepSeek API Key"}
                </span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Advanced Custom Base URL (Optional) */}
          <div className="border-t border-[#EAE7DF] pt-3">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[11px] font-mono text-[#7A7468] hover:text-[#3D3D3D] flex items-center space-x-1 cursor-pointer"
            >
              <span>{showAdvanced ? "▼ 折叠自定义 API 代理地址" : "► 展开自定义 API 代理地址 (可选)"}</span>
            </button>

            {showAdvanced && (
              <div className="mt-2 space-y-1.5 animate-in fade-in duration-150">
                <label className="text-[11px] text-[#7A7468] block">
                  自定义 Base URL (若国内网络直连受限或使用自建反向代理时填写)：
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder={
                    selectedModel === "gemini-3-flash"
                      ? "默认: https://generativelanguage.googleapis.com/v1beta"
                      : "默认: https://api.deepseek.com/v1"
                  }
                  className="w-full bg-[#F9F7F2] border border-[#D4C5B0] rounded-lg px-3 py-1.5 text-xs font-mono text-[#3D3D3D] placeholder:text-[#A8A295] focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                />
              </div>
            )}
          </div>

          {/* Test connection result notice */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${
                testResult.success
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-rose-50 text-rose-800 border-rose-200"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              )}
              <span className="leading-relaxed">{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Modal Footer: Confirm & Test buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 bg-[#F0EEE6] border-t border-[#D4C5B0]">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting || !apiKey.trim()}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white hover:bg-[#FAF8F2] text-[#3D3D3D] border border-[#D4C5B0] text-xs font-serif font-medium transition-colors inline-flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
            <span>{isTesting ? "正在测试连通性..." : "测试 API 连通性"}</span>
          </button>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#FAF8F2] text-[#7A7468] border border-[#D4C5B0] text-xs font-serif transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="px-5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#474732] text-white text-xs font-serif font-bold transition-all shadow-xs inline-flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>确认大模型并保存</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
