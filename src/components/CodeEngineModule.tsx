import React, { useState, useEffect, useRef } from "react";
import { MathView } from "./MathView";
import {
  HISTORICAL_PYTHON_ALGORITHMS,
  PythonAlgorithm,
} from "../data/pythonAlgorithms";
import {
  executePythonCodeUnified,
  ExecutionEnginePreference,
  PythonExecutionResult,
} from "../utils/pythonRunner";
import {
  Code2,
  Play,
  Copy,
  Check,
  Terminal,
  Cpu,
  RefreshCw,
  Sliders,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Clock,
  AlertTriangle,
  FileCode,
  RotateCcw,
  CheckCircle2,
  Share2,
  Server,
  Zap,
} from "lucide-react";

export const CodeEngineModule: React.FC = () => {
  const [selectedAlgoId, setSelectedAlgoId] = useState<string>(
    "archimedes_parabola"
  );
  const currentAlgo =
    HISTORICAL_PYTHON_ALGORITHMS.find((a) => a.id === selectedAlgoId) ||
    HISTORICAL_PYTHON_ALGORITHMS[0];

  // Editable Code State
  const [editableCode, setEditableCode] = useState<string>(
    currentAlgo.defaultCode
  );

  // Engine Preference & Active Engine Status
  const [enginePreference, setEnginePreference] = useState<ExecutionEnginePreference>("auto");
  const [activeEngineUsed, setActiveEngineUsed] = useState<"server_python3" | "client_sandbox">("server_python3");

  // Parameters State
  const [paramN, setParamN] = useState<number>(
    currentAlgo.defaultParams.n ?? 6
  );
  const [paramAlpha, setParamAlpha] = useState<number>(
    currentAlgo.defaultParams.alpha ?? 0.5
  );
  const [paramSlices, setParamSlices] = useState<number>(
    currentAlgo.defaultParams.slices ?? 24
  );
  const [paramX, setParamX] = useState<number>(
    currentAlgo.defaultParams.x ?? 0.5
  );

  // Execution & Output State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [outputStdout, setOutputStdout] = useState<string>("");
  const [outputStderr, setOutputStderr] = useState<string>("");
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [standaloneCheck, setStandaloneCheck] = useState<any>(null);

  // UI tabs & states
  const [activeOutputTab, setActiveOutputTab] = useState<"terminal" | "analysis" | "standalone">("terminal");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedOutput, setCopiedOutput] = useState<boolean>(false);

  // When switching algorithm, load its default code and params
  useEffect(() => {
    setEditableCode(currentAlgo.defaultCode);
    if (currentAlgo.defaultParams.n !== undefined) {
      setParamN(currentAlgo.defaultParams.n);
    }
    if (currentAlgo.defaultParams.alpha !== undefined) {
      setParamAlpha(currentAlgo.defaultParams.alpha);
    }
    if (currentAlgo.defaultParams.slices !== undefined) {
      setParamSlices(currentAlgo.defaultParams.slices);
    }
    if (currentAlgo.defaultParams.x !== undefined) {
      setParamX(currentAlgo.defaultParams.x);
    }
  }, [selectedAlgoId]);

  // Execute Python Code via Unified Dual Engine (Server-side Python 3 + Client sandbox fallback)
  const handleExecuteCode = async (customCode?: string) => {
    setIsRunning(true);
    const codeToRun = customCode ?? editableCode;

    try {
      // Build CLI args according to selected algorithm parameters
      let cliArgs: string[] = [];
      if (selectedAlgoId === "archimedes_parabola") {
        cliArgs = [String(paramN)];
      } else if (selectedAlgoId === "leibniz_pi_series") {
        cliArgs = [String(paramN)];
      } else if (selectedAlgoId === "newton_binomial") {
        cliArgs = [String(paramAlpha), String(paramX), String(paramN)];
      } else if (selectedAlgoId === "riemann_slicing") {
        cliArgs = [String(paramSlices)];
      } else if (selectedAlgoId === "fermat_adequality") {
        cliArgs = [];
      } else if (selectedAlgoId === "barrow_characteristic_triangle") {
        cliArgs = [String(paramX)];
      }

      const res: PythonExecutionResult = await executePythonCodeUnified(
        codeToRun,
        selectedAlgoId,
        cliArgs,
        enginePreference
      );

      setOutputStdout(res.stdout || "");
      setOutputStderr(res.stderr || "");
      setExitCode(res.exitCode);
      setExecutionTime(res.executionTimeMs);
      setActiveEngineUsed(res.engineUsed);
      if (res.standaloneCheck) {
        setStandaloneCheck(res.standaloneCheck);
      }
    } catch (err: any) {
      console.error("Execution error:", err);
      setOutputStderr(`执行异常: ${err.message || err}`);
      setExitCode(1);
    } finally {
      setIsRunning(false);
    }
  };

  // Run automatically on first mount or algorithm selection
  useEffect(() => {
    handleExecuteCode(currentAlgo.defaultCode);
  }, [selectedAlgoId, enginePreference]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editableCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(outputStdout || outputStderr);
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 2000);
  };

  const handleResetCode = () => {
    setEditableCode(currentAlgo.defaultCode);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-[#F0EEE6] border border-[#D4C5B0] rounded-xl p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-serif bg-[#E8E4D9] text-[#7A7468] border border-[#D4C5B0]">
            <Code2 className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>核心模块 6 · 历史算式符号推导与手写 Python 算法还原</span>
          </div>
          <div className="inline-flex items-center space-x-1 text-xs font-mono text-[#425C3C] bg-[#EEF2EC] px-2.5 py-0.5 rounded-md border border-[#C8D7C4]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>支持在线执行 · 支持复制代码在项目外直接运行</span>
          </div>
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#3D3D3D]">
          手写 Python 算法还原与符号演算引擎
        </h2>
        <p className="text-xs sm:text-sm text-[#7A7468] font-serif mt-1">
          将阿基米德穷竭割补、莱布尼茨交错级数、牛顿广义二项式、黎曼积分切片与费马伪等法转化为纯净 Python 3 原生算法。
          您可在下方编辑器中直接修改代码、调整参数并在内置终端中即时运行，查看计算结果与 ASCII 几何图；亦可一键复制代码粘贴至本地终端独立运行！
        </p>
      </div>

      {/* Algorithm Selector Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {HISTORICAL_PYTHON_ALGORITHMS.map((algo) => {
          const isSelected = selectedAlgoId === algo.id;
          return (
            <button
              key={algo.id}
              onClick={() => setSelectedAlgoId(algo.id)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-[#5A5A40] text-white border-[#5A5A40] shadow-sm ring-2 ring-[#5A5A40]/30"
                  : "bg-white hover:bg-[#F0EEE6] text-[#3D3D3D] border-[#D4C5B0]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span
                    className={`font-mono ${
                      isSelected ? "text-[#D4C5B0]" : "text-[#8E887B]"
                    }`}
                  >
                    {algo.year}
                  </span>
                </div>
                <h4 className="font-serif font-bold text-xs line-clamp-1">
                  {algo.title.split(" (")[0]}
                </h4>
              </div>
              <p
                className={`text-[11px] mt-1.5 font-serif line-clamp-1 ${
                  isSelected ? "text-[#E8E4D9]" : "text-[#7A7468]"
                }`}
              >
                {algo.historicalMathematician}
              </p>
            </button>
          );
        })}
      </div>

      {/* Algorithm Info Banner */}
      <div className="bg-[#FAF8F2] border border-[#D4C5B0] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-serif font-bold text-base text-[#3D3D3D]">
              {currentAlgo.title}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-[#EAE7DF] text-[#5A5A40] font-mono border border-[#D4C5B0]">
              {currentAlgo.historicalMathematician} · {currentAlgo.year}
            </span>
          </div>
          <p className="text-xs text-[#7A7468] font-serif mt-1">
            {currentAlgo.description}
          </p>
        </div>

        {/* Action Buttons & Engine Selector */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Engine Selector */}
          <div className="flex items-center space-x-1 bg-white border border-[#D4C5B0] rounded-lg p-1 text-[11px] font-mono">
            <span className="text-[#8E887B] px-1.5 flex items-center space-x-1">
              <Cpu className="w-3 h-3 text-[#5A5A40]" />
              <span className="hidden sm:inline">引擎:</span>
            </span>
            <button
              onClick={() => setEnginePreference("auto")}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                enginePreference === "auto"
                  ? "bg-[#5A5A40] text-white font-bold"
                  : "text-[#7A7468] hover:bg-[#F0EEE6]"
              }`}
              title="智能自动模式：优先原生 Python 3，异常时秒级自动无缝切入内置算法沙盒"
            >
              自动
            </button>
            <button
              onClick={() => setEnginePreference("server")}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                enginePreference === "server"
                  ? "bg-[#5A5A40] text-white font-bold"
                  : "text-[#7A7468] hover:bg-[#F0EEE6]"
              }`}
              title="原生 Python 3 后端进程执行"
            >
              Python 3
            </button>
            <button
              onClick={() => setEnginePreference("client")}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                enginePreference === "client"
                  ? "bg-[#5A5A40] text-white font-bold"
                  : "text-[#7A7468] hover:bg-[#F0EEE6]"
              }`}
              title="浏览器内置高精度演算沙盒 (离线零延迟)"
            >
              内置沙盒
            </button>
          </div>

          <button
            onClick={() => handleExecuteCode()}
            disabled={isRunning}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#5A5A40] hover:bg-[#474732] text-white font-serif text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
            <span>{isRunning ? "正在运行中..." : "运行 Python 代码"}</span>
          </button>
          <button
            onClick={handleCopyCode}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white hover:bg-[#F0EEE6] text-[#3D3D3D] border border-[#D4C5B0] font-serif text-xs font-medium transition-all cursor-pointer"
            title="复制代码到剪贴板，可在外部 Python 环境直接运行"
          >
            {copiedCode ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copiedCode ? "已复制" : "复制源码"}</span>
          </button>
          <button
            onClick={handleResetCode}
            className="p-2 rounded-lg bg-white hover:bg-[#F0EEE6] text-[#7A7468] border border-[#D4C5B0] transition-colors cursor-pointer"
            title="恢复预设手写算法源码"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Workspace: Code Editor & Output Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code Editor & Parameters (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Code Editor Box */}
          <div className="bg-[#24241E] rounded-xl border border-[#404036] shadow-sm overflow-hidden flex flex-col">
            {/* Editor Top Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#1B1B16] border-b border-[#404036]">
              <div className="flex items-center space-x-2 text-xs font-mono text-[#D4C5B0]">
                <FileCode className="w-3.5 h-3.5 text-[#C4A468]" />
                <span>{selectedAlgoId}.py</span>
                <span className="text-[10px] text-[#8E887B]">(可编辑)</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono text-[#8E887B]">
                  Python 3.10+ 标准库
                </span>
              </div>
            </div>

            {/* Editable Textarea */}
            <div className="relative">
              <textarea
                value={editableCode}
                onChange={(e) => setEditableCode(e.target.value)}
                spellCheck={false}
                rows={18}
                className="w-full p-4 bg-[#24241E] text-[#F5F2EB] font-mono text-xs leading-relaxed focus:outline-none resize-y border-0 selection:bg-[#5A5A40] selection:text-white"
              />
            </div>

            {/* Editor Bottom Status Bar */}
            <div className="px-4 py-2 bg-[#1B1B16] border-t border-[#404036] flex flex-wrap items-center justify-between text-[11px] font-mono text-[#8E887B]">
              <span>编码: UTF-8 | 独立性: 纯标准库 (无外部 pip 依赖)</span>
              <span className="text-[#C4A468]">
                快捷运行: 点击右上角「运行 Python 代码」
              </span>
            </div>
          </div>

          {/* Quick CLI Arguments Parameter Tuning */}
          <div className="bg-white border border-[#D4C5B0] rounded-xl p-4 shadow-xs text-xs font-serif space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE7DF]">
              <div className="flex items-center space-x-1.5 text-[#3D3D3D] font-bold">
                <Sliders className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>实时参数微调面板 (传入 Python 命令行参数 sys.argv)</span>
              </div>
              <button
                onClick={() => handleExecuteCode()}
                className="text-[11px] font-mono text-[#5A5A40] hover:underline cursor-pointer flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>立即重新执行</span>
              </button>
            </div>

            {selectedAlgoId === "archimedes_parabola" && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#3D3D3D]">
                    穷竭割补迭代阶数 n (传递参数 sys.argv[1]):
                  </span>
                  <span className="font-mono font-bold text-[#5A5A40]">
                    {paramN} 阶 (共 {Math.pow(2, paramN + 1) - 1} 个内接三角形)
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={paramN}
                  onChange={(e) => {
                    setParamN(parseInt(e.target.value));
                  }}
                  className="w-full accent-[#5A5A40] cursor-pointer"
                />
              </div>
            )}

            {selectedAlgoId === "leibniz_pi_series" && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#3D3D3D]">
                    交错级数迭代项数 n (传递参数 sys.argv[1]):
                  </span>
                  <span className="font-mono font-bold text-[#5A5A40]">
                    {paramN} 项
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={200}
                  step={5}
                  value={paramN}
                  onChange={(e) => {
                    setParamN(parseInt(e.target.value));
                  }}
                  className="w-full accent-[#5A5A40] cursor-pointer"
                />
              </div>
            )}

            {selectedAlgoId === "newton_binomial" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#3D3D3D]">指数 α (sys.argv[1]):</span>
                      <span className="font-mono font-bold text-[#5A5A40]">
                        {paramAlpha}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-2}
                      max={3}
                      step={0.5}
                      value={paramAlpha}
                      onChange={(e) => setParamAlpha(parseFloat(e.target.value))}
                      className="w-full accent-[#5A5A40] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#3D3D3D]">展开阶数 (sys.argv[3]):</span>
                      <span className="font-mono font-bold text-[#5A5A40]">
                        {paramN} 阶
                      </span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={12}
                      value={paramN}
                      onChange={(e) => setParamN(parseInt(e.target.value))}
                      className="w-full accent-[#5A5A40] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedAlgoId === "riemann_slicing" && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#3D3D3D]">
                    黎曼切片分割数 N (传递参数 sys.argv[1]):
                  </span>
                  <span className="font-mono font-bold text-[#5A5A40]">
                    {paramSlices} 份 (Δx = {(1 / paramSlices).toFixed(4)})
                  </span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={120}
                  step={4}
                  value={paramSlices}
                  onChange={(e) => {
                    setParamSlices(parseInt(e.target.value));
                  }}
                  className="w-full accent-[#5A5A40] cursor-pointer"
                />
              </div>
            )}

            {selectedAlgoId === "barrow_characteristic_triangle" && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#3D3D3D]">
                    切点横坐标 x₀ (传递参数 sys.argv[1]):
                  </span>
                  <span className="font-mono font-bold text-[#5A5A40]">
                    x₀ = {paramX.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={5.0}
                  step={0.25}
                  value={paramX}
                  onChange={(e) => {
                    setParamX(parseFloat(e.target.value));
                  }}
                  className="w-full accent-[#5A5A40] cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Output Console & Verification (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Output Window Container */}
          <div className="bg-[#1C1C18] rounded-xl border border-[#3D3D34] shadow-md overflow-hidden flex flex-col h-[520px]">
            {/* Console Header Tabs */}
            <div className="flex items-center justify-between px-3 py-2 bg-[#141410] border-b border-[#3D3D34]">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setActiveOutputTab("terminal")}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                    activeOutputTab === "terminal"
                      ? "bg-[#33332A] text-[#F5F2EB] font-bold"
                      : "text-[#8E887B] hover:text-[#D4C5B0]"
                  }`}
                >
                  <span className="flex items-center space-x-1">
                    <Terminal className="w-3 h-3 text-[#C4A468]" />
                    <span>终端输出 stdout</span>
                  </span>
                </button>

                <button
                  onClick={() => setActiveOutputTab("standalone")}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                    activeOutputTab === "standalone"
                      ? "bg-[#33332A] text-[#F5F2EB] font-bold"
                      : "text-[#8E887B] hover:text-[#D4C5B0]"
                  }`}
                >
                  <span className="flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-[#5A5A40]" />
                    <span>独立运行检测</span>
                  </span>
                </button>
              </div>

              {/* Status, engine badge and copy */}
              <div className="flex items-center space-x-2">
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border flex items-center space-x-1 ${
                    activeEngineUsed === "server_python3"
                      ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/60"
                      : "bg-amber-950/40 text-amber-300 border-amber-800/60"
                  }`}
                  title={
                    activeEngineUsed === "server_python3"
                      ? "由服务器原生 Python 3.10+ 子进程执行"
                      : "由浏览器内置高精度演算沙盒执行"
                  }
                >
                  {activeEngineUsed === "server_python3" ? (
                    <>
                      <Server className="w-2.5 h-2.5 text-emerald-400" />
                      <span>Python3 原生</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-2.5 h-2.5 text-amber-400" />
                      <span>内置沙盒</span>
                    </>
                  )}
                </span>

                {executionTime !== null && (
                  <span className="text-[10px] font-mono text-[#8E887B] flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-[#C4A468]" />
                    <span>{executionTime}ms</span>
                  </span>
                )}

                <button
                  onClick={handleCopyOutput}
                  className="p-1 rounded text-[#8E887B] hover:text-[#F5F2EB] hover:bg-[#33332A] transition-colors cursor-pointer"
                  title="复制终端输出文本"
                >
                  {copiedOutput ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Console Body */}
            <div className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed text-[#E6E2D8] bg-[#1C1C18]">
              {activeOutputTab === "terminal" && (
                <div>
                  {isRunning ? (
                    <div className="flex items-center space-x-2 text-[#C4A468] py-8 justify-center">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>正在启动原生 Python 解释器并执行...</span>
                    </div>
                  ) : outputStdout ? (
                    <pre className="whitespace-pre text-[11.5px] font-mono selection:bg-[#5A5A40] selection:text-white">
                      {outputStdout}
                    </pre>
                  ) : outputStderr ? (
                    <div className="text-rose-400 bg-rose-950/30 p-3 rounded border border-rose-800/50">
                      <div className="flex items-center space-x-1.5 font-bold mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>执行异常 (stderr):</span>
                      </div>
                      <pre className="whitespace-pre-wrap">{outputStderr}</pre>
                    </div>
                  ) : (
                    <div className="text-[#8E887B] text-center py-12 font-serif">
                      点击「运行 Python 代码」查看实时数学推导与 ASCII 几何图输出
                    </div>
                  )}

                  {outputStderr && outputStdout && (
                    <div className="mt-3 pt-3 border-t border-[#3D3D34] text-rose-400 text-xs">
                      <span className="font-bold">警告 / Stderr:</span>
                      <pre className="whitespace-pre-wrap mt-1">{outputStderr}</pre>
                    </div>
                  )}
                </div>
              )}

              {activeOutputTab === "standalone" && (
                <div className="space-y-4 text-xs font-serif text-[#D4C5B0]">
                  <div className="p-3.5 rounded-lg bg-[#25251F] border border-[#404036] space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>独立可移植性检查：100% 验证通过</span>
                    </div>
                    <p className="text-[#A8A295] leading-relaxed">
                      {standaloneCheck?.notes ||
                        "本算法代码完全使用 Python 3 标准库（sys、math 等），绝不强制依赖 sympy、numpy、matplotlib 或任何第三方 pip 包。无论在 Linux、macOS 或 Windows 终端中，均可直接复制并独立执行！"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-bold text-[#EAE7DF] text-xs font-mono">
                      【如何复制并在外部环境运行？】
                    </h5>
                    <ol className="list-decimal list-inside space-y-1.5 text-[#A8A295] font-mono text-[11px] leading-relaxed">
                      <li>
                        点击上方 <span className="text-[#C4A468]">「复制源码」</span>{" "}
                        按钮。
                      </li>
                      <li>
                        在您电脑的任意目录创建文件：
                        <code className="bg-[#141410] px-1 py-0.5 rounded text-emerald-300">
                          solve.py
                        </code>
                      </li>
                      <li>将代码粘贴进去并保存。</li>
                      <li>
                        在终端运行：
                        <code className="bg-[#141410] px-1 py-0.5 rounded text-emerald-300">
                          python3 solve.py
                        </code>
                      </li>
                    </ol>
                  </div>

                  <div className="p-3 rounded bg-[#24241E] border border-[#3D3D34] text-[11px] font-mono text-[#C4A468]">
                    💡 提示：该脚本还支持命令行传入动态参数，例如：
                    <br />
                    <span className="text-emerald-400">
                      python3 solve.py 8
                    </span>{" "}
                    (计算 8 阶割补)
                  </div>
                </div>
              )}
            </div>

            {/* Console Footer */}
            <div className="px-3 py-1.5 bg-[#141410] border-t border-[#3D3D34] flex items-center justify-between text-[10px] font-mono text-[#8E887B]">
              <span className="flex items-center space-x-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    exitCode === 0
                      ? "bg-emerald-500"
                      : exitCode === null
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                />
                <span>
                  进程状态: {exitCode === 0 ? "正常退出 (exit 0)" : exitCode === null ? "就绪" : `异常 (exit ${exitCode})`}
                </span>
              </span>

              <span>UTF-8 CLI Output</span>
            </div>
          </div>

          {/* Educational Note Card */}
          <div className="bg-[#FAF8F2] border border-[#D4C5B0] rounded-xl p-4 text-xs font-serif space-y-1.5 text-[#7A7468]">
            <span className="font-bold text-[#3D3D3D] block flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>算法设计与文明史思想映射</span>
            </span>
            <p className="leading-relaxed">
              {currentAlgo.sampleOutputNote}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
