import React from "react";
import { ActiveTab } from "../types";
import {
  BookOpen,
  Compass,
  GitCommit,
  Scale,
  Sparkles,
  Code2,
  Bot,
  Scroll,
  Download,
} from "lucide-react";

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openAiChat?: () => void;
  openReportExport?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openAiChat,
  openReportExport,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "chronology", label: "1. 建模与编年", icon: <BookOpen className="w-4 h-4" /> },
    { id: "sandbox", label: "2. 2D文明沙盒", icon: <Compass className="w-4 h-4" />, badge: "多切片" },
    { id: "evolution", label: "3. 思想演化轨迹", icon: <GitCommit className="w-4 h-4" /> },
    { id: "dispute", label: "4. 争论与危机", icon: <Scale className="w-4 h-4" /> },
    { id: "breakthroughs", label: "5. 六大突破", icon: <Sparkles className="w-4 h-4" />, badge: "演播" },
    { id: "code", label: "6. 代码与几何", icon: <Code2 className="w-4 h-4" /> },
    { id: "aichat", label: "7. AI对话窗口", icon: <Bot className="w-4 h-4" />, badge: "7位导师" },
    { id: "guidance", label: "8. 知识导引", icon: <Scroll className="w-4 h-4" /> },
    { id: "report", label: "9. 报告导出", icon: <Download className="w-4 h-4" /> },
  ];

  const handleAiChatClick = () => {
    if (openAiChat) openAiChat();
    else setActiveTab("aichat");
  };

  const handleReportClick = () => {
    if (openReportExport) openReportExport();
    else setActiveTab("report");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D4C5B0] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-[#5A5A40] rounded-sm flex items-center justify-center text-white font-serif italic text-xl shadow-xs">
              <span>∫</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-serif text-base sm:text-lg font-bold text-[#3D3D3D] tracking-tight">
                  微积分文明史与思想演化实验室
                </h1>
                <span className="hidden md:inline-block px-2 py-0.5 text-xs font-serif bg-[#E8E4D9] text-[#7A7468] rounded-sm border border-[#D4C5B0]">
                  HISTORY OF CALCULUS LAB v2.4
                </span>
              </div>
              <p className="text-xs text-[#8E887B] font-serif hidden sm:block">
                从古希腊穷竭法、不可分量与幽灵量，到 (ε, δ) 极限严格化与现代分析学
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAiChatClick}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-serif bg-[#5A5A40] text-white hover:opacity-90 transition-all shadow-xs cursor-pointer"
              title="与阿基米德、牛顿、莱布尼茨等数学家对话"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI 历史导师</span>
            </button>
            <button
              onClick={handleReportClick}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-serif bg-[#EAE7DF] text-[#3D3D3D] hover:bg-[#ded9ce] border border-[#D4C5B0] transition-all cursor-pointer"
              title="一键导出研究报告"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">导出研报</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-[#EAE7DF]">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-serif whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-[#5A5A40] text-white shadow-xs font-medium"
                    : "text-[#7A7468] hover:bg-[#F0EEE6] hover:text-[#3D3D3D]"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? "bg-[#EAE7DF] text-[#5A5A40] font-bold"
                        : "bg-[#E8E4D9] text-[#7A7468]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
