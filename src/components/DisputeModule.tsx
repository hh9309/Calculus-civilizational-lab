import React, { useState } from "react";
import { MathView } from "./MathView";
import { Scale, AlertCircle, ArrowRight, ShieldAlert, Sparkles, BookOpen, UserCheck } from "lucide-react";

export const DisputeModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"dispute" | "berkeley">("dispute");
  const [berkeleyStep, setBerkeleyStep] = useState<number>(1);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-[#F0EEE6] border border-[#D4C5B0] rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-serif bg-[#E8E4D9] text-[#7A7468] border border-[#D4C5B0] mb-2">
              <Scale className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>核心模块 4 · 牛莱发明权大争论与第二次数学危机演播</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#3D3D3D]">
              学派论争、符号对决与“幽灵量”危机
            </h2>
            <p className="text-xs sm:text-sm text-[#7A7468] font-serif mt-1">
              对比英国皇家学会流数学派与欧洲大陆微商学派的符号演进与哲学分野，深度拆解贝克莱悖论及其破解历程。
            </p>
          </div>

          {/* Sub-tab switcher */}
          <div className="flex bg-[#EAE7DF] p-1 rounded-lg border border-[#D4C5B0]">
            <button
              onClick={() => setActiveTab("dispute")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-serif transition-all cursor-pointer ${
                activeTab === "dispute"
                  ? "bg-[#5A5A40] text-white font-medium shadow-xs"
                  : "text-[#7A7468] hover:text-[#3D3D3D]"
              }`}
            >
              牛顿 vs 莱布尼茨 发明权争论
            </button>
            <button
              onClick={() => setActiveTab("berkeley")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-serif transition-all cursor-pointer ${
                activeTab === "berkeley"
                  ? "bg-[#5A5A40] text-white font-medium shadow-xs"
                  : "text-[#7A7468] hover:text-[#3D3D3D]"
              }`}
            >
              贝克莱悖论与第二次数学危机
            </button>
          </div>
        </div>
      </div>

      {activeTab === "dispute" && (
        <div className="space-y-6">
          {/* Side-by-Side School Comparison Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Newton British School */}
            <div className="bg-white border border-[#D4C5B0] rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-[#EAE7DF]">
                <div className="w-10 h-10 rounded-full bg-[#5A5A40] text-white flex items-center justify-center text-xl shadow-xs">
                  🍎
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#3D3D3D]">
                    英国流数学派 (Sir Isaac Newton)
                  </h3>
                  <span className="text-xs text-[#8E887B] font-serif">
                    物理运动学根基 · 1666年创立 / 1704年出版
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs font-serif">
                <div className="bg-[#F0EEE6] p-3 rounded-lg border border-[#D4C5B0]">
                  <span className="font-bold text-[#3D3D3D] block mb-1">核心符号与记号：</span>
                  <div className="space-y-1 font-mono text-[#3D3D3D]">
                    <p>流动量 (Fluents): <MathView math="x, y" />（由点连续运动生成的量）</p>
                    <p>流数 (Fluxions): <MathView math="\dot{x}, \dot{y}" />（流动量的瞬时变化速率）</p>
                    <p>二阶流数: <MathView math="\ddot{x}, \ddot{y}" />（相当于加速度）</p>
                    <p>瞬 (Moment): <MathView math="o\dot{x}, o\dot{y}" />（时间微元 <MathView math="o" /> 内的微增量）</p>
                  </div>
                </div>

                <div className="space-y-1 text-[#555555]">
                  <span className="font-bold block text-[#3D3D3D]">哲学观念与优势：</span>
                  <p className="leading-relaxed">
                    深植于自然物理现实，直接应用于万有引力与天体轨道求解（《自然哲学的数学原理》）。
                  </p>
                </div>

                <div className="space-y-1 text-[#914332] bg-[#F6EBE8] p-3 rounded-lg border border-[#EACEC8]">
                  <span className="font-bold block text-[#914332]">历史局限性：</span>
                  <p className="leading-relaxed">
                    对全局时间参数 $t$
                    高度依赖；符号在多变量偏导数、链式法则与高维微分形式中难以推广，导致英国数学界在18世纪被欧洲大陆逐渐甩开一个世纪之久。
                  </p>
                </div>
              </div>
            </div>

            {/* Leibniz Continental School */}
            <div className="bg-white border border-[#D4C5B0] rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-[#EAE7DF]">
                <div className="w-10 h-10 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center text-xl shadow-xs">
                  ✒️
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#3D3D3D]">
                    欧洲大陆微商学派 (G. W. Leibniz)
                  </h3>
                  <span className="text-xs text-[#8E887B] font-serif">
                    代数与符号哲学 · 1675年创立 / 1684年公开发表
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs font-serif">
                <div className="bg-[#F0EEE6] p-3 rounded-lg border border-[#D4C5B0]">
                  <span className="font-bold text-[#3D3D3D] block mb-1">核心符号与记号：</span>
                  <div className="space-y-1 font-mono text-[#3D3D3D]">
                    <p>微分微元 (Differential): <MathView math="dx, dy" /> (源自拉丁文 differentia)</p>
                    <p>微商 (Derivative): <MathView math="\frac{dy}{dx}" /> (具有商的代数自明性)</p>
                    <p>积分号 (Integral): <MathView math="\int y\,dx" /> (拉丁文 Summa 长S变形)</p>
                    <p>运算律: <MathView math="d(uv) = u\,dv + v\,du, \quad \frac{dz}{dx} = \frac{dz}{dy}\frac{dy}{dx}" /></p>
                  </div>
                </div>

                <div className="space-y-1 text-[#555555]">
                  <span className="font-bold block text-[#3D3D3D]">哲学观念与优势：</span>
                  <p className="leading-relaxed">
                    符号天然具备代数可操作性，极大地解放了人类的心智，使得积分与微分像四则运算一样标准化。伯努利家族、欧拉等大师借此开创分析学黄金时代。
                  </p>
                </div>

                <div className="space-y-1 text-[#425C3C] bg-[#EEF2EC] p-3 rounded-lg border border-[#C8D7C4]">
                  <span className="font-bold block text-[#425C3C]">最终历史胜利：</span>
                  <p className="leading-relaxed">
                    莱布尼茨符号成为全世界微积分教科书的通用标准，证实了“优良的符号是思维最强力的助产士”。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline of Dispute & Royal Society Report */}
          <div className="bg-white border border-[#D4C5B0] rounded-xl p-5 shadow-sm">
            <h4 className="font-serif font-bold text-sm text-[#3D3D3D] mb-3 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-[#5A5A40]" />
              <span>发明权争论历史大事件编年</span>
            </h4>

            <div className="space-y-3 text-xs font-serif">
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-[#F9F7F2] border border-[#D4C5B0]">
                <span className="font-mono font-bold text-[#5A5A40] px-2 py-0.5 bg-[#E8E4D9] rounded">
                  1666
                </span>
                <p className="text-[#555555]">
                  牛顿在伍尔斯索普乡下躲避鼠疫，发明流数术并写下手稿《流数简论》，但未公开印刷出版，仅在少数英国皇家学会朋友（巴罗、柯林斯）间传阅。
                </p>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg bg-[#F9F7F2] border border-[#D4C5B0]">
                <span className="font-mono font-bold text-[#5A5A40] px-2 py-0.5 bg-[#E8E4D9] rounded">
                  1675
                </span>
                <p className="text-[#555555]">
                  莱布尼茨在巴黎研究惠更斯数学题时，独立发明微积分，确立 $\int$ 与 $d$ 符号体系，写下微积分基本定理。
                </p>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg bg-[#F9F7F2] border border-[#D4C5B0]">
                <span className="font-mono font-bold text-[#5A5A40] px-2 py-0.5 bg-[#E8E4D9] rounded">
                  1684
                </span>
                <p className="text-[#555555]">
                  莱布尼茨在莱比锡学术刊物《学艺》(Acta Eruditorum) 上发表世界第一篇正式微积分学术论文，轰动全欧。
                </p>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg bg-[#F9F7F2] border border-[#D4C5B0]">
                <span className="font-mono font-bold text-[#5A5A40] px-2 py-0.5 bg-[#E8E4D9] rounded">
                  1712
                </span>
                <p className="text-[#555555]">
                  英国皇家学会成立调查委员会，时任会长牛顿亲自起草《通信报告》(Commercium
                  Epistolicum)，指控莱布尼茨抄袭。现代科学史已明确认定：两人各自独立创立微积分。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "berkeley" && (
        <div className="space-y-6">
          {/* Berkeley Paradox Breakdown Interactive */}
          <div className="bg-white border border-[#D4C5B0] rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE7DF]">
              <div>
                <span className="text-xs font-serif text-[#A85842] font-bold uppercase tracking-wider">
                  第二次数学危机核心导火索 (1734)
                </span>
                <h3 className="font-serif text-xl font-bold text-[#3D3D3D] mt-1">
                  《分析学者》：向不信教的数学家发起的逻辑审判
                </h3>
              </div>
              <span className="text-2xl">⛪</span>
            </div>

            <p className="text-xs sm:text-sm font-serif text-[#7A7468] leading-relaxed">
              乔治·贝克莱主教指出，微积分在求切线与导数时存在严重的自相矛盾。以下以求解 $y = x^2$ 的导数为例，分步演示这一致命漏洞：
            </p>

            {/* Interactive 3-Step Wizard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  step: 1,
                  title: "第一步：引入微增量 o 并求差商",
                  desc: "自变量增加 o，因变量增加 (x+o)² - x² = 2xo + o²",
                  status: "表面合法",
                },
                {
                  step: 2,
                  title: "第二步：除以 o 进行化简",
                  desc: "两边除以 o 得 2x + o（必须假设 o ≠ 0）",
                  status: "强行除以非零",
                },
                {
                  step: 3,
                  title: "第三步：令 o = 0 得到导数 2x",
                  desc: "抹去余项 o 得到结果 2x（此时又假设 o = 0）",
                  status: "自相矛盾抹去",
                },
              ].map((s) => (
                <button
                  key={s.step}
                  onClick={() => setBerkeleyStep(s.step)}
                  className={`p-4 rounded-lg text-left border transition-all cursor-pointer ${
                    berkeleyStep === s.step
                      ? "bg-[#5A5A40] text-white border-[#5A5A40] shadow-sm ring-2 ring-[#5A5A40]/30"
                      : "bg-[#F9F7F2] hover:bg-[#F0EEE6] text-[#3D3D3D] border-[#D4C5B0]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold">步骤 0{s.step}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded ${
                        s.step === 3
                          ? "bg-[#F6EBE8] text-[#914332]"
                          : berkeleyStep === s.step
                          ? "bg-[#EAE7DF] text-[#5A5A40] font-bold"
                          : "bg-[#E8E4D9] text-[#7A7468]"
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-sm mb-1">{s.title}</h4>
                  <p
                    className={`text-xs ${
                      berkeleyStep === s.step ? "text-[#E8E4D9]" : "text-[#8E887B]"
                    }`}
                  >
                    {s.desc}
                  </p>
                </button>
              ))}
            </div>

            {/* Current Step Detailed Math & Logical Inconsistency */}
            <div className="bg-[#F0EEE6] p-5 rounded-xl border border-[#D4C5B0] space-y-3 font-serif">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#3D3D3D]">
                  当前步骤代数推演与贝克莱质问：
                </span>
                <span className="text-xs font-mono text-[#5A5A40]">
                  Step {berkeleyStep} / 3
                </span>
              </div>

              {berkeleyStep === 1 && (
                <div className="space-y-2 text-xs">
                  <MathView
                    math="\Delta y = f(x+o) - f(x) = (x+o)^2 - x^2 = 2xo + o^2"
                    block={true}
                  />
                  <p className="text-[#555555]">
                    这一步是纯粹的二项式展开，毫无逻辑问题。$o$ 是任意给定的非零增量。
                  </p>
                </div>
              )}

              {berkeleyStep === 2 && (
                <div className="space-y-2 text-xs">
                  <MathView
                    math="\frac{\Delta y}{o} = \frac{2xo + o^2}{o} = 2x + o \quad (\text{前提必须是 } o \neq 0)"
                    block={true}
                  />
                  <p className="text-[#555555]">
                    在代数学中，任何数除以 $0$ 都是未定义的。因此，能够化简为 $2x + o$ 的绝对前提是{" "}
                    <strong>$o \ne 0$</strong>！
                  </p>
                </div>
              )}

              {berkeleyStep === 3 && (
                <div className="space-y-3 text-xs">
                  <MathView
                    math="\text{令 } o = 0 \implies \frac{\Delta y}{o} = 2x + 0 = 2x"
                    block={true}
                  />
                  <div className="bg-[#F6EBE8] p-3 rounded-lg border border-[#EACEC8] text-[#914332]">
                    <span className="font-bold block mb-1">💥 贝克莱主教的致命讽刺：</span>
                    <p className="italic leading-relaxed">
                      “若 $o$ 是零，则第二步的除法是荒谬的非法操作；若 $o$ 不是零，则第三步凭什么随意将它抛弃？微积分不过是以一个错误抵消了另一个错误，才碰巧得到了正确的结果！”
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* How Cauchy Resolved It */}
            <div className="bg-[#EEF2EC] p-5 rounded-xl border border-[#C8D7C4] space-y-2 text-xs font-serif text-[#425C3C]">
              <h4 className="font-bold text-sm flex items-center space-x-2 text-[#344D30]">
                <UserCheck className="w-4 h-4 text-[#5A5A40]" />
                <span>柯西与魏尔斯特拉斯的现代终极破解方案：极限论</span>
              </h4>
              <p className="leading-relaxed">
                柯西指出：导数不是两个实际“无穷小量”相除，而是差商数列当 $\Delta x$ 趋近于 $0$ 时的<strong>极限值</strong>！
              </p>
              <div className="bg-white/80 p-3 rounded-lg border border-[#C8D7C4] text-[#344D30] font-mono">
                <MathView
                  math="f'(x) = \lim_{\Delta x \to 0} \frac{f(x+\Delta x) - f(x)}{\Delta x} = \lim_{\Delta x \to 0} (2x + \Delta x) = 2x"
                  block={true}
                />
              </div>
              <p className="text-[11px] text-[#425C3C]">
                在整个极限逼近过程中，$\Delta x \ne 0$ 恒成立，因此除法始终合法；而求极限操作寻找的是该趋势所收敛的唯一固定实数 $2x$，无需令 $\Delta x=0$，悖论迎刃而解！
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
