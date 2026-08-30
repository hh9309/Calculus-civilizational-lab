import React, { useState } from "react";
import { TIMELINE_EPOCHS } from "../data/historyData";
import { MathView } from "./MathView";
import { DailyManuscriptCard } from "./DailyManuscriptCard";
import { Clock, BookMarked, Sparkles, ArrowRight, Layers, Award, Scroll, ChevronDown, ChevronUp } from "lucide-react";

export const ChronologyModule: React.FC<{ onNavigateToSandbox?: () => void }> = ({
  onNavigateToSandbox,
}) => {
  const [selectedEpochId, setSelectedEpochId] = useState<string>("ancient");
  const [showDailyCard, setShowDailyCard] = useState<boolean>(true);

  const currentEpoch =
    TIMELINE_EPOCHS.find((e) => e.id === selectedEpochId) || TIMELINE_EPOCHS[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-[#F0EEE6] border border-[#D4C5B0] rounded-xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-[radial-gradient(#D4C5B0_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-serif bg-[#E8E4D9] text-[#7A7468] border border-[#D4C5B0] mb-3">
            <BookMarked className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>核心模块 1 · 数学思想演进与概念形式化建模</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D3D3D] tracking-tight mb-2">
            从几何直观到分析严密化：微积分编年史与抽象映射
          </h2>
          <p className="text-sm sm:text-base text-[#7A7468] font-serif leading-relaxed">
            形式化梳理从古希腊“穷竭法”到19世纪极限严格化的跨时代抽象演进，建立阿基米德几何割补、牛顿流数术（Fluxions）、莱布尼茨微商符号
            $d/dx$ 与柯西-魏尔斯特拉斯 $(\varepsilon, \delta)$ 语言的精确映射体系。
          </p>
        </div>
      </div>

      {/* Daily Mathematician Thought & Manuscript Card Showcase */}
      <div className="bg-[#FAF8F2] border border-[#D4C5B0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-3">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 rounded-lg bg-[#5A5A40] text-white">
              <Scroll className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-serif font-bold text-base text-[#3D3D3D]">
                每日微积分数学家思想卡片 · 经典手稿原典研读
              </h3>
              <p className="text-xs text-[#7A7468] font-serif">
                每日精选一位大师手稿原典、经典箴言与 LaTeX 定理形式化，支持一键复制 Markdown 与导出学术 PDF
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDailyCard(!showDailyCard)}
            className="px-3 py-1.5 rounded-lg text-xs font-serif bg-white hover:bg-[#EAE7DF] text-[#5A5A40] border border-[#D4C5B0] transition-colors cursor-pointer flex items-center space-x-1"
          >
            <span>{showDailyCard ? "收起手稿卡片" : "展开今日手稿"}</span>
            {showDailyCard ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {showDailyCard && <DailyManuscriptCard />}
      </div>

      {/* Epoch Stepper Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {TIMELINE_EPOCHS.map((epoch, idx) => {
          const isSelected = epoch.id === selectedEpochId;
          return (
            <button
              key={epoch.id}
              onClick={() => setSelectedEpochId(epoch.id)}
              className={`text-left p-4 rounded-xl border transition-all duration-200 relative cursor-pointer ${
                isSelected
                  ? "bg-[#5A5A40] text-white border-[#5A5A40] shadow-sm ring-2 ring-[#5A5A40]/30"
                  : "bg-white hover:bg-[#F0EEE6] text-[#3D3D3D] border-[#D4C5B0]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs font-serif px-2 py-0.5 rounded-md ${
                    isSelected
                      ? "bg-[#EAE7DF] text-[#5A5A40] font-bold"
                      : "bg-[#E8E4D9] text-[#7A7468]"
                  }`}
                >
                  阶段 0{idx + 1}
                </span>
                <span className="text-xs font-mono opacity-80">{epoch.period}</span>
              </div>
              <h3 className="font-serif font-bold text-base mb-1">{epoch.name}</h3>
              <p
                className={`text-xs line-clamp-2 ${
                  isSelected ? "text-[#E8E4D9]" : "text-[#8E887B]"
                }`}
              >
                {epoch.tagline}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Epoch Detailed Overview & Formal Mapping Matrix */}
      <div className="bg-white border border-[#D4C5B0] rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#EAE7DF] gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-[#8E887B]">
              <Clock className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>历史跨度：{currentEpoch.period}</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-[#3D3D3D] mt-1">
              {currentEpoch.name}：{currentEpoch.tagline}
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs font-serif text-[#8E887B] mr-1">代表人物：</span>
            {currentEpoch.keyFigures.map((fig, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 rounded-md bg-[#F0EEE6] text-[#5A5A40] font-serif border border-[#D4C5B0]"
              >
                {fig}
              </span>
            ))}
          </div>
        </div>

        <p className="text-sm font-serif text-[#555555] leading-relaxed">
          {currentEpoch.description}
        </p>

        {/* Formal Cross-Era Mapping Card */}
        <div className="bg-[#F0EEE6] border border-[#D4C5B0] rounded-lg p-5">
          <div className="flex items-center space-x-2 text-xs font-serif font-bold text-[#3D3D3D] uppercase tracking-wider mb-4">
            <Layers className="w-4 h-4 text-[#5A5A40]" />
            <span>核心概念形式化映射模型 (Formal Abstraction Mapping)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-serif">
            <div className="bg-white p-3.5 rounded-md border border-[#D4C5B0] space-y-1">
              <span className="text-[#8E887B] block font-medium">1. 几何直观表达与切片载体：</span>
              <p className="text-[#3D3D3D] font-semibold text-sm">
                {currentEpoch.formalMapping.geometricConcept}
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-md border border-[#D4C5B0] space-y-1">
              <span className="text-[#8E887B] block font-medium">2. 形式化代数/极限算式：</span>
              <div className="text-[#3D3D3D] font-semibold text-sm py-0.5">
                <MathView math={currentEpoch.formalMapping.algebraicExpression} block={false} />
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-md border border-[#D4C5B0] space-y-1">
              <span className="text-[#8E887B] block font-medium">3. 哲学视界与“无穷”认知：</span>
              <p className="text-[#3D3D3D]">{currentEpoch.formalMapping.philosophicalStance}</p>
            </div>

            <div className="bg-white p-3.5 rounded-md border border-[#D4C5B0] space-y-1">
              <span className="text-[#8E887B] block font-medium">4. 严密性等级与公理化程度：</span>
              <p className="text-[#3D3D3D]">{currentEpoch.formalMapping.limitStrictness}</p>
            </div>
          </div>
        </div>

        {/* Milestones in this Epoch */}
        <div>
          <h4 className="font-serif font-bold text-sm text-[#3D3D3D] mb-3 flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-[#5A5A40]" />
            <span>该历史时期标志性突破事件</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentEpoch.milestones.map((m, idx) => (
              <div
                key={idx}
                className="bg-[#F9F7F2] p-4 rounded-lg border border-[#D4C5B0] hover:border-[#8E887B] transition-all hover:shadow-xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono font-bold text-[#5A5A40] bg-[#E8E4D9] px-2 py-0.5 rounded">
                    {m.year}
                  </span>
                  <span className="text-xs font-serif text-[#7A7468]">{m.mathematician}</span>
                </div>
                <h5 className="font-serif font-bold text-sm text-[#3D3D3D] mb-1">{m.title}</h5>
                <p className="text-xs font-serif text-[#666666] mb-2.5 leading-relaxed">
                  {m.contribution}
                </p>
                <div className="bg-white px-3 py-1.5 rounded text-xs text-[#3D3D3D] font-mono border border-[#D4C5B0] overflow-x-auto">
                  <MathView math={m.formula} block={false} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {onNavigateToSandbox && (
          <div className="pt-4 flex justify-end">
            <button
              onClick={onNavigateToSandbox}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-serif bg-[#5A5A40] text-white hover:opacity-90 transition-all shadow-xs cursor-pointer"
            >
              <span>进入 2D 文明沙盒演播几何古图</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Global Cross-Era Evolution Summary Matrix */}
      <div className="bg-white border border-[#D4C5B0] rounded-xl p-6 shadow-sm">
        <h3 className="font-serif text-lg font-bold text-[#3D3D3D] mb-2 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#5A5A40]" />
          <span>微积分四阶段跨时代概念演变总览表</span>
        </h3>
        <p className="text-xs text-[#8E887B] font-serif mb-4">
          横向比对微积分在研究对象、无穷概念、运算工具与严格性基础上的历史质变。
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-serif border-collapse text-left">
            <thead>
              <tr className="bg-[#EAE7DF] text-[#3D3D3D] border-b border-[#D4C5B0]">
                <th className="p-3 font-bold">历史阶段</th>
                <th className="p-3 font-bold">核心代表人物</th>
                <th className="p-3 font-bold">对“无穷小”的态度</th>
                <th className="p-3 font-bold">几何/代数形式化表达</th>
                <th className="p-3 font-bold">文明演进范式</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE7DF] bg-[#F9F7F2]">
              <tr>
                <td className="p-3 font-bold text-[#3D3D3D]">古希腊萌芽期</td>
                <td className="p-3 text-[#555555]">阿基米德、欧多克索斯</td>
                <td className="p-3 text-[#555555]">避开实无穷，仅承认潜无限，用有限割补逼近</td>
                <td className="p-3 font-mono">
                  <MathView math="S_n = T_0 \sum_{k=0}^n (1/4)^k \to \frac{4}{3}T_0" />
                </td>
                <td className="p-3 text-[#555555]">静态几何双重归谬证明</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-[#3D3D3D]">17世纪先驱期</td>
                <td className="p-3 text-[#555555]">开普勒、卡瓦列利、费马、巴罗</td>
                <td className="p-3 text-[#555555]">大胆假设不可分量薄片与微增量 $e$，重解题轻基础</td>
                <td className="p-3 font-mono">
                  <MathView math="f(x+e) \approx f(x) \implies f'(x)=0" />
                </td>
                <td className="p-3 text-[#555555]">几何不可分量与伪等法</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-[#3D3D3D]">牛莱创立期</td>
                <td className="p-3 text-[#555555]">牛顿、莱布尼茨</td>
                <td className="p-3 text-[#555555]">
                  流动量增量瞬 <MathView math="o\dot{x}" /> 与微分微元 <MathView math="dx" />，引申出幽灵量
                </td>
                <td className="p-3 font-mono">
                  <MathView math="\dot{y}/\dot{x}, \quad \frac{dy}{dx}, \quad \int y\,dx" />
                </td>
                <td className="p-3 text-[#555555]">微积分基本定理的普遍法则</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-[#3D3D3D]">19世纪严密期</td>
                <td className="p-3 text-[#555555]">柯西、魏尔斯特拉斯、戴德金</td>
                <td className="p-3 text-[#555555]">驱逐所有幽灵量，完全建立在 $(\varepsilon, \delta)$ 与实数连续统</td>
                <td className="p-3 font-mono">
                  <MathView math="\forall \varepsilon>0, \exists \delta>0, 0<|x-x_0|<\delta \implies |f(x)-L|<\varepsilon" />
                </td>
                <td className="p-3 text-[#555555]">现代数学分析公理体系</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
