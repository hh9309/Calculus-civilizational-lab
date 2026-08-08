/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  Milestone, 
  Activity, 
  TrendingDown, 
  Brain, 
  Sparkles, 
  Code, 
  Cpu, 
  Globe, 
  Clock, 
  Layers,
  ChevronRight,
  Menu,
  X,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { ModuleId } from "./types";
import OriginsNarrative from "./components/OriginsNarrative";
import PhysicsSandbox from "./components/PhysicsSandbox";
import RelativityAICore from "./components/RelativityAICore";
import WhatIfSandbox from "./components/WhatIfSandbox";
import CalculusAesthetics from "./components/CalculusAesthetics";
import CompilerSDK from "./components/CompilerSDK";
import AIChatAssistant from "./components/AIChatAssistant";

interface ModuleConfig {
  id: ModuleId;
  tabLabel: string;
  shortDesc: string;
  title: string;
  icon: any;
  component: any;
}

const MODULES_REGISTRY: ModuleConfig[] = [
  {
    id: "origins",
    tabLabel: "历史叙事",
    shortDesc: "切线与幽灵危机",
    title: "1. 交互史观叙事：牛顿/莱布尼茨与符号觉醒",
    icon: Milestone,
    component: OriginsNarrative
  },
  {
    id: "physics",
    tabLabel: "物理仿真",
    shortDesc: "自激共振与微分方程",
    title: "2. 物理控制沙盒：用微分方程解密力学共鸣",
    icon: Activity,
    component: PhysicsSandbox
  },
  {
    id: "relativity_ai",
    tabLabel: "现代电磁",
    shortDesc: "梯度极值与场论",
    title: "3. 现代科学之轴：麦克斯韦电磁波与神经网络梯度",
    icon: TrendingDown,
    component: RelativityAICore
  },
  {
    id: "cognitive_ai",
    tabLabel: "AI时空推演",
    shortDesc: "科技树断裂沙盒",
    title: "4. AI认知与推演：缺失某一数学工具的平行世界线",
    icon: Brain,
    component: WhatIfSandbox
  },
  {
    id: "aesthetics",
    tabLabel: "美学声视",
    shortDesc: "洛伦兹声音交响",
    title: "5. 连续之美发生器：自适应混沌几何与音画艺术",
    icon: Sparkles,
    component: CalculusAesthetics
  },
  {
    id: "compiler_sdk",
    tabLabel: "代码编译器",
    shortDesc: "数学到脚本转化",
    title: "6. 开源应用链：将抽象微原方程一键编译至真实代码",
    icon: Code,
    component: CompilerSDK
  }
];

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>("origins");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [qaOpen, setQaOpen] = useState<boolean>(true);

  // Active module details
  const activeConfig = MODULES_REGISTRY.find(m => m.id === activeModule) || MODULES_REGISTRY[0];
  const ActiveComponent = activeConfig.component;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col math-grid" id="main-root">
      
      {/* Upper persistent ticker showing mathematical definition of Change */}
      <div className="w-full bg-slate-100 border-b border-slate-200 py-1.5 px-4 flex justify-between text-[10px] text-slate-500 font-mono tracking-wide z-10">
        <span className="flex items-center gap-1.5 select-none">
          <Layers className="w-3 text-brand-orange animate-pulse" /> UNIVERSAL LAW: "Everything changes, everything flows. Differential is its language."
        </span>
        <span className="hidden md:inline text-brand-orange font-semibold select-none">
          ∫ dx / y = ln|y| + C | d/dx[e^x] = e^x | ∇²φ = ρ/ε₀
        </span>
      </div>

      {/* Main Header / Top Hub Banner */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-orange to-brand-cyan p-[1.5px] flex items-center justify-center shadow-xs">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-brand-cyan animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg md:text-xl text-slate-900 tracking-tight flex items-center gap-2">
              微积分文明史 <span className="text-xs font-mono font-normal text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded border border-brand-orange/20 animate-pulse">Calculus Civilization</span>
            </h1>
            <p className="text-[10px] text-slate-500 mt-0.5">连通抽象极限定理与人类工程物理演变的时空科学Web沙盒</p>
          </div>
        </div>

        {/* Global info metrics on right + AI Toggle assistant button */}
        <div className="flex items-center gap-4">
          {/* AI Q&A Launcher */}
          <button
            onClick={() => setQaOpen(!qaOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-[10.5px] font-semibold transition cursor-pointer select-none ${
              qaOpen
                ? "bg-brand-orange/15 border-brand-orange/30 text-brand-orange shadow-sm hover:bg-brand-orange/20"
                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 shadow-xs"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI 学术问答</span>
            <span className={`w-1.5 h-1.5 rounded-full ${qaOpen ? "bg-brand-orange animate-ping" : "bg-slate-400"}`} />
          </button>

          <div className="hidden lg:flex gap-6 text-[10px] font-mono text-slate-400 border-l border-slate-250 pl-6">
            <div className="flex flex-col">
              <span className="text-slate-400">时空定位仪 (TIME):</span>
              <span className="text-slate-600 flex items-center gap-1"><Clock className="w-3 text-brand-orange" /> 2026-06-01 UTC</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400">学术引擎 (AI):</span>
              <span className="text-brand-orange font-semibold flex items-center gap-1"><Globe className="w-3 text-brand-cyan animate-spin" style={{ animationDuration: "16s" }} /> Gemini-3.5-Active</span>
            </div>
          </div>
        </div>

        {/* Mobile menu trigger */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-slate-105 border border-slate-200 hover:bg-slate-50 transition cursor-pointer text-slate-600"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Main dashboard grid container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        
        {/* Bento Grid Header Selection Menu for Desktop */}
        <div className="hidden md:grid grid-cols-6 gap-3 select-none">
          {MODULES_REGISTRY.map((module) => {
            const IconComponent = module.icon;
            const isSelected = activeModule === module.id;
            return (
              <div
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col justify-between gap-3 relative overflow-hidden group ${
                  isSelected
                    ? "bg-white border-brand-orange/60 shadow-[0_8px_24px_rgba(234,88,12,0.06)]"
                    : "bg-white/60 border-slate-200/85 hover:border-slate-350 hover:bg-white"
                }`}
              >
                {/* Visual side glow indicator on selection */}
                {isSelected && (
                  <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-brand-orange" />
                )}

                <div className="flex justify-between items-start">
                  <div className={`p-2 rounded-lg ${isSelected ? "bg-brand-orange/15 text-brand-orange" : "bg-slate-100/80 text-slate-500 group-hover:text-slate-755 transition"}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? "text-brand-orange" : "text-slate-300 group-hover:text-slate-450 transition"}`} />
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className={`font-mono text-xs ${isSelected ? "text-slate-900 font-bold" : "text-slate-600 font-medium"}`}>{module.tabLabel}</span>
                  <span className="text-[10px] text-slate-400 leading-normal line-clamp-1">{module.shortDesc}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile menu navigation sliding drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden p-3 gap-1 shadow-md"
            >
              <span className="text-[9px] text-slate-400 font-mono px-3 py-1 border-b border-slate-100 mb-1">导航时空舱速达</span>
              {MODULES_REGISTRY.map((module) => {
                const IconComponent = module.icon;
                const isSelected = activeModule === module.id;
                return (
                  <div
                    key={module.id}
                    onClick={() => {
                      setActiveModule(module.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`p-2.5 rounded-lg flex items-center justify-between cursor-pointer ${
                      isSelected ? "bg-brand-orange/15 text-brand-orange font-medium" : "text-slate-605 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-xs">
                      <IconComponent className="w-4 h-4 text-brand-orange" />
                      <div>
                        <p className="font-semibold text-slate-800">{module.tabLabel}</p>
                        <p className="text-[9px] text-slate-400">{module.shortDesc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title display block representing chosen active Module */}
        <div className="w-full bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-brand-orange/10 flex items-center justify-center text-brand-orange">
              <activeConfig.icon className="w-4 h-4 text-brand-orange" />
            </div>
            <h2 className="font-mono font-semibold text-xs md:text-sm text-slate-800 tracking-wide">
              {activeConfig.title}
            </h2>
          </div>
          <span className="hidden sm:inline text-[9.5px] font-mono text-brand-orange bg-brand-orange/10 border border-brand-orange/20 px-2.5 py-1 rounded">
            SYSMODE: INTERACTIVE_RUNNING
          </span>
        </div>

        {/* Double Column interactive Layout (Active Sandbox + Optional AI Q&A) */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch flex-1 w-full min-h-[460px]">
          {/* Left Sandbox Panel */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="w-full h-full"
              >
                <ActiveComponent />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Q&A Co-Pilot Panel */}
          {qaOpen && (
            <div className="shrink-0 flex flex-col items-stretch lg:self-stretch">
              <AIChatAssistant isOpen={qaOpen} onClose={() => setQaOpen(false)} />
            </div>
          )}
        </div>

      </main>

      {/* Persistent global Footer containing math insights */}
      <footer className="w-full bg-slate-100 border-t border-slate-200 py-4 px-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-3">
        <span className="font-mono text-[10px]">
          © 2026 微积分文明史科研小组 — “用连续的变化语言，解读物理极限的伟大回响。”
        </span>
        <div className="flex gap-4 text-[10px] font-mono">
          <span>版本: V1.1.2</span>
          <span className="text-slate-300">•</span>
          <span>后端中继协议: REST Proxy Ready</span>
        </div>
      </footer>
    </div>
  );
}
