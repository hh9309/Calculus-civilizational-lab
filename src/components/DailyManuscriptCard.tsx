import React, { useState, useEffect, useMemo, useRef } from "react";
import { DAILY_MANUSCRIPTS, DailyManuscript } from "../data/dailyManuscriptsData";
import { MathView } from "./MathView";
import {
  Scroll,
  Quote,
  Sparkles,
  Copy,
  Check,
  Download,
  Printer,
  Shuffle,
  Calendar,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Share2,
  Bookmark,
  Award,
  Layers,
  FileText,
  Clock,
  Globe,
  ExternalLink,
} from "lucide-react";

interface DailyManuscriptCardProps {
  initialId?: string;
  variant?: "full" | "compact" | "banner";
  onSelectAnother?: (id: string) => void;
}

export const DailyManuscriptCard: React.FC<DailyManuscriptCardProps> = ({
  initialId,
  variant = "full",
  onSelectAnother,
}) => {
  // Determine today's default manuscript by date
  const defaultTodayIndex = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return dayOfYear % DAILY_MANUSCRIPTS.length;
  }, []);

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    if (initialId) {
      const idx = DAILY_MANUSCRIPTS.findIndex((m) => m.id === initialId);
      if (idx !== -1) return idx;
    }
    return defaultTodayIndex;
  });

  const [copiedType, setCopiedType] = useState<"markdown" | "quote" | null>(null);
  const [isPrintMode, setIsPrintMode] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const currentItem: DailyManuscript = DAILY_MANUSCRIPTS[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? DAILY_MANUSCRIPTS.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === DAILY_MANUSCRIPTS.length - 1 ? 0 : prev + 1
    );
  };

  const handleRandom = () => {
    let nextIdx = currentIndex;
    while (nextIdx === currentIndex && DAILY_MANUSCRIPTS.length > 1) {
      nextIdx = Math.floor(Math.random() * DAILY_MANUSCRIPTS.length);
    }
    setCurrentIndex(nextIdx);
  };

  const handleSelectToday = () => {
    setCurrentIndex(defaultTodayIndex);
  };

  // Generate formatted Markdown content
  const generateMarkdown = (item: DailyManuscript): string => {
    return `# 📜 每日微积分数学家思想手稿卡片 · ${item.name} (${item.nameEn})

> **时代年代**：${item.years} · ${item.era}
> **历史头衔**：${item.titleBadge}
> **手稿出处**：${item.manuscriptSource} (${item.manuscriptYear})
> **印章档案**：[${item.sealText}]

---

### 🖋️ 大师手稿名言原典 (${item.originalLanguage})
> *“${item.originalLanguageQuote}”*

### 📖 中文释义与思想提炼
> **“${item.chineseTranslationQuote}”**

---

### 📐 核心定理形式化表述 (LaTeX)
$$
${item.formalMathLatex}
$$

---

### 💡 核心哲学范式与思想贡献
- **哲学本体突破**：${item.corePhilosophicalConcept}
- **认识论关键跃迁**：${item.epistemologicalSignificance}
- **历史手稿背景**：${item.manuscriptContext}

---
*学术标签：${item.academicTags.map((t) => `\`#${t}\``).join(" ")}*
*来源：微积分文明史与思想演化实验室 (History of Calculus Lab)*
*导出日期：${new Date().toLocaleDateString("zh-CN")}*
`;
  };

  // Copy Markdown to Clipboard
  const handleCopyMarkdown = () => {
    const md = generateMarkdown(currentItem);
    navigator.clipboard.writeText(md);
    setCopiedType("markdown");
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Copy Plain Text Quote
  const handleCopyQuote = () => {
    const text = `【${currentItem.name} · 微积分思想手稿】\n"${currentItem.chineseTranslationQuote}"\n—— 出自 ${currentItem.manuscriptSource} (${currentItem.manuscriptYear})`;
    navigator.clipboard.writeText(text);
    setCopiedType("quote");
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Download Markdown file
  const handleDownloadMarkdown = () => {
    const md = generateMarkdown(currentItem);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentItem.nameEn.replace(/\s+/g, "_")}_Manuscript_Card.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Print as PDF
  const handlePrintPDF = () => {
    window.print();
  };

  const todayDateFormatted = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  }, []);

  return (
    <div className="space-y-4 font-serif">
      {/* Top Interactive Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F2] p-3.5 rounded-xl border border-[#D4C5B0] shadow-xs">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-[#EAE7DF] text-[#5A5A40] border border-[#D4C5B0]">
            <Scroll className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-[#3D3D3D]">
                每日数学家思想手稿卡片 (Daily Manuscript Thought)
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EAE7DF] text-[#5A5A40] border border-[#D4C5B0]">
                {currentIndex + 1} / {DAILY_MANUSCRIPTS.length}
              </span>
            </div>
            <p className="text-[11px] text-[#7A7468]">
              今日推荐 · {todayDateFormatted}
            </p>
          </div>
        </div>

        {/* Action Buttons: Prev, Next, Random, Today */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg bg-white hover:bg-[#EAE7DF] border border-[#D4C5B0] text-[#5A5A40] transition-colors cursor-pointer"
            title="前一位数学家"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg bg-white hover:bg-[#EAE7DF] border border-[#D4C5B0] text-[#5A5A40] transition-colors cursor-pointer"
            title="后一位数学家"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleRandom}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#EAE7DF] border border-[#D4C5B0] text-[#5A5A40] text-xs transition-colors cursor-pointer flex items-center space-x-1"
            title="随机抽取"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">随机抽卡</span>
          </button>
          <button
            onClick={handleSelectToday}
            className={`px-2.5 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer flex items-center space-x-1 ${
              currentIndex === defaultTodayIndex
                ? "bg-[#5A5A40] text-white border-[#5A5A40]"
                : "bg-white hover:bg-[#EAE7DF] text-[#5A5A40] border-[#D4C5B0]"
            }`}
            title="返回今日推荐"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>今日灵感</span>
          </button>
        </div>
      </div>

      {/* Mathematicians Quick Tabs Carousel */}
      <div className="flex space-x-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
        {DAILY_MANUSCRIPTS.map((item, idx) => {
          const isSelected = idx === currentIndex;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif shrink-0 transition-all cursor-pointer flex items-center space-x-1.5 ${
                isSelected
                  ? "bg-[#5A5A40] text-white font-medium shadow-xs"
                  : "bg-white hover:bg-[#EAE7DF] text-[#666666] border border-[#D4C5B0]"
              }`}
            >
              <span className="font-mono text-[10px] opacity-75">0{idx + 1}</span>
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Manuscript Card Display */}
      <div
        ref={cardRef}
        className="bg-[#FCFAF5] border-2 border-[#D4C5B0] rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden text-[#3D3D3D]"
      >
        {/* Subtle Vintage Manuscript Watermark Pattern */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-[radial-gradient(#D4C5B0_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-35 pointer-events-none" />
        
        {/* Traditional Academic Red/Gold Wax Seal Stamp */}
        <div className="absolute top-6 right-6 hidden sm:flex flex-col items-center justify-center w-20 h-20 rounded-full border-2 border-[#843B20]/40 bg-[#843B20]/5 text-[#843B20] rotate-12 pointer-events-none select-none">
          <span className="text-[10px] font-serif font-bold tracking-widest leading-tight text-center px-1">
            {currentItem.sealText}
          </span>
          <span className="text-[8px] font-mono opacity-80 mt-0.5">ARCHIVE</span>
        </div>

        {/* Card Header: Figure Name & Era */}
        <div className="relative z-10 border-b border-[#D4C5B0]/70 pb-4 mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#EAE7DF] text-[#5A5A40] border border-[#D4C5B0]">
              {currentItem.era}
            </span>
            <span className="text-xs text-[#8E887B] font-mono">
              ({currentItem.years})
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#2E2B25] tracking-tight">
                {currentItem.name}
              </h2>
              <span className="text-sm text-[#7A7468] font-serif italic">
                {currentItem.nameEn} · {currentItem.titleBadge}
              </span>
            </div>

            <div className="text-left sm:text-right text-xs text-[#7A7468] font-serif">
              <span className="font-bold text-[#5A5A40] block">手稿出处与年代：</span>
              <span>{currentItem.manuscriptSource}</span>
              <span className="font-mono ml-1 font-semibold text-[#843B20]">[{currentItem.manuscriptYear}]</span>
            </div>
          </div>
        </div>

        {/* Master's Manuscript Quotes in Dual Languages */}
        <div className="space-y-4 mb-6">
          {/* Original Language Quote (Latin / Greek / German / Classical Chinese) */}
          <div className="bg-[#F4EFE6] p-4 rounded-xl border border-[#D8CCB8] relative">
            <div className="flex items-center justify-between mb-1.5 text-xs text-[#7A7468]">
              <span className="font-bold flex items-center space-x-1 text-[#843B20]">
                <Globe className="w-3.5 h-3.5" />
                <span>手稿原典文献语录 ({currentItem.originalLanguage})：</span>
              </span>
              <span className="font-mono text-[10px] opacity-75">ORIGINAL TEXT</span>
            </div>
            <p className="font-serif italic text-sm sm:text-base text-[#4A4337] leading-relaxed pl-2 border-l-2 border-[#843B20]/60">
              “{currentItem.originalLanguageQuote}”
            </p>
          </div>

          {/* Chinese Translation & Philosophical Interpretation */}
          <div className="bg-[#FAF8F2] p-5 rounded-xl border border-[#D4C5B0] shadow-xs">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#5A5A40] mb-2">
              <Quote className="w-4 h-4 text-[#5A5A40]" />
              <span>学术思想释义与认识论提炼：</span>
            </div>
            <p className="font-serif text-base sm:text-lg font-medium text-[#2E2B25] leading-relaxed">
              “{currentItem.chineseTranslationQuote}”
            </p>
          </div>
        </div>

        {/* Formal Mathematical Formulation (LaTeX) */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#3D3D3D] flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>手稿核心定理形式化表述 (Formal Math Formulation)：</span>
            </span>
          </div>
          <div className="bg-[#F2EFE9] p-4 sm:p-5 rounded-xl border border-[#D4C5B0] text-center text-[#2E2B25] overflow-x-auto shadow-2xs">
            <MathView math={currentItem.formalMathLatex} block={true} />
          </div>
        </div>

        {/* Two-Column Deep Context & Epistemology */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#FAF8F2] p-4 rounded-xl border border-[#D4C5B0] space-y-1.5">
            <span className="font-bold text-xs text-[#5A5A40] flex items-center space-x-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>历史手稿创作背景：</span>
            </span>
            <p className="text-xs text-[#555555] leading-relaxed">
              {currentItem.manuscriptContext}
            </p>
          </div>

          <div className="bg-[#EEF2EC] p-4 rounded-xl border border-[#C8D7C4] space-y-1.5">
            <span className="font-bold text-xs text-[#425C3C] flex items-center space-x-1">
              <Award className="w-3.5 h-3.5" />
              <span>认识论与现代数学意义：</span>
            </span>
            <p className="text-xs text-[#425C3C] leading-relaxed">
              {currentItem.epistemologicalSignificance}
            </p>
          </div>
        </div>

        {/* Academic Tags */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#D4C5B0]/60 mb-6">
          <span className="text-xs text-[#7A7468] mr-1">学术主题：</span>
          {currentItem.academicTags.map((tag, tIdx) => (
            <span
              key={tIdx}
              className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#EAE7DF] text-[#5A5A40] border border-[#D4C5B0]/70"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Export & Sharing Action Toolbar */}
        <div className="bg-[#EFECE3] p-3.5 rounded-xl border border-[#D4C5B0] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-1.5 text-xs text-[#7A7468]">
            <Share2 className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>保存与学术分享：</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Copy Markdown */}
            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#FAF8F2] text-xs font-serif text-[#3D3D3D] border border-[#D4C5B0] shadow-2xs transition-colors cursor-pointer"
              title="复制完整 Markdown 代码（含 LaTeX 与名言）"
            >
              {copiedType === "markdown" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Markdown 已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <span>一键复制 Markdown</span>
                </>
              )}
            </button>

            {/* Download .md */}
            <button
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#FAF8F2] text-xs font-serif text-[#3D3D3D] border border-[#D4C5B0] shadow-2xs transition-colors cursor-pointer"
              title="下载为 .md 文档"
            >
              <Download className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>下载 .md</span>
            </button>

            {/* Print to PDF */}
            <button
              onClick={handlePrintPDF}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#5A5A40] hover:bg-[#4A4A34] text-xs font-serif text-white shadow-2xs transition-colors cursor-pointer font-medium"
              title="打印或保存为学术 PDF"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              <span>打印 / 导出 PDF</span>
            </button>

            {/* Copy Short Quote */}
            <button
              onClick={handleCopyQuote}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#FAF8F2] text-xs font-serif text-[#7A7468] border border-[#D4C5B0] shadow-2xs transition-colors cursor-pointer"
              title="仅复制名言与出处"
            >
              {copiedType === "quote" ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Bookmark className="w-3.5 h-3.5" />
              )}
              <span>{copiedType === "quote" ? "名言已复制" : "复制金句"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
