/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ActiveTab } from "./types";
import { Navbar } from "./components/Navbar";
import { ChronologyModule } from "./components/ChronologyModule";
import { SandboxModule } from "./components/SandboxModule";
import { EvolutionModule } from "./components/EvolutionModule";
import { DisputeModule } from "./components/DisputeModule";
import { BreakthroughsModule } from "./components/BreakthroughsModule";
import { CodeEngineModule } from "./components/CodeEngineModule";
import { AIChatModule } from "./components/AIChatModule";
import { KnowledgeGuidanceModule } from "./components/KnowledgeGuidanceModule";
import { ReportExportModule } from "./components/ReportExportModule";
import { Compass, BookOpen, Sparkles, Scroll, Landmark } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("chronology");

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#3D3D3D] font-serif flex flex-col selection:bg-[#5A5A40] selection:text-[#F9F7F2]">
      {/* Top Academic Navigation Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Module 1: 建模与编年 */}
        {activeTab === "chronology" && <ChronologyModule />}

        {/* Module 2: 2D文明沙盒 */}
        {activeTab === "sandbox" && <SandboxModule />}

        {/* Module 3: 思想演化轨迹 */}
        {activeTab === "evolution" && <EvolutionModule />}

        {/* Module 4: 争论与危机 */}
        {activeTab === "dispute" && <DisputeModule />}

        {/* Module 5: 六大突破 */}
        {activeTab === "breakthroughs" && <BreakthroughsModule />}

        {/* Module 6: 代码与几何 */}
        {activeTab === "code" && <CodeEngineModule />}

        {/* Module 7: AI对话窗口 */}
        {activeTab === "aichat" && <AIChatModule />}

        {/* Module 8: 知识导引 */}
        {activeTab === "guidance" && <KnowledgeGuidanceModule />}

        {/* Module 9: 报告导出 */}
        {activeTab === "report" && <ReportExportModule />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#D4C5B0] bg-[#EAE7DF] py-5 text-xs text-[#8E887B] font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 bg-[#5A5A40] text-white text-[11px] rounded-xs flex items-center justify-center font-serif italic">∫</span>
            <span className="font-bold text-[#3D3D3D]">
              微积分文明史与思想演化实验室 (History of Calculus Lab)
            </span>
          </div>
          <div className="text-[11px] text-[#7A7468]">
            阿基米德 · 费马 · 卡瓦列利 · 巴罗 · 牛顿 · 莱布尼茨 · 贝克莱 · 柯西 · 魏尔斯特拉斯
          </div>
        </div>
      </footer>
    </div>
  );
}
