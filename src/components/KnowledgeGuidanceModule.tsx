import React, { useState } from "react";
import {
  KNOWLEDGE_SLICES_SECTIONS,
  PARADIGM_COMPARISONS,
  KnowledgeSliceSection,
  KnowledgeSliceSubItem,
} from "../data/knowledgeSlicesData";
import { GENEALOGY_NODES } from "../data/historyData";
import { MathView } from "./MathView";
import { DailyManuscriptCard } from "./DailyManuscriptCard";
import {
  Network,
  BookOpen,
  Layers,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Search,
  CheckCircle2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Scale,
  Compass,
  Scroll,
  Lightbulb,
  FileText,
  Atom,
  Quote,
  Filter,
  Bookmark,
} from "lucide-react";

export const KnowledgeGuidanceModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "manuscripts" | "slices" | "genealogy" | "paradigms" | "curriculum"
  >("manuscripts");

  // Section & Slice state
  const [selectedSectionId, setSelectedSectionId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedSliceIds, setExpandedSliceIds] = useState<Set<string>>(
    new Set(["eudoxus_exhaustion", "newton_leibniz_fundamental_theorem", "weierstrass_epsilon_delta_quantifiers"])
  );
  const [copiedFormulaId, setCopiedFormulaId] = useState<string | null>(null);

  // Genealogy interactive state
  const [selectedGenealogyId, setSelectedGenealogyId] = useState<string>("newton_node");
  const [genealogyCategoryFilter, setGenealogyCategoryFilter] = useState<string>("all");

  const toggleSliceExpand = (id: string) => {
    setExpandedSliceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAllSlices = () => {
    const allIds = new Set<string>();
    KNOWLEDGE_SLICES_SECTIONS.forEach((sec) =>
      sec.items.forEach((item) => allIds.add(item.id))
    );
    setExpandedSliceIds(allIds);
  };

  const collapseAllSlices = () => {
    setExpandedSliceIds(new Set());
  };

  const handleCopyFormula = (id: string, formula: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedFormulaId(id);
    setTimeout(() => {
      setCopiedFormulaId(null);
    }, 2000);
  };

  // Filter slices
  const filteredSections = KNOWLEDGE_SLICES_SECTIONS.map((sec) => {
    const isSecMatch =
      selectedSectionId === "all" || sec.sectionId === selectedSectionId;
    if (!isSecMatch) {
      return { ...sec, items: [] };
    }

    const filteredItems = sec.items.filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.historicalFigure.toLowerCase().includes(q) ||
        item.coreConcept.toLowerCase().includes(q) ||
        item.philosophicalParadigm.toLowerCase().includes(q) ||
        item.modernUniversityMapping.toLowerCase().includes(q) ||
        item.formalMath.toLowerCase().includes(q)
      );
    });

    return { ...sec, items: filteredItems };
  }).filter((sec) => sec.items.length > 0);

  // Genealogy nodes filter
  const filteredGenealogyNodes = GENEALOGY_NODES.filter((n) => {
    const matchCategory =
      genealogyCategoryFilter === "all" || n.category === genealogyCategoryFilter;
    const matchSearch =
      !searchQuery.trim() ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.historicalFigure.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.coreIdea.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const selectedGenealogyNode =
    GENEALOGY_NODES.find((n) => n.id === selectedGenealogyId) ||
    GENEALOGY_NODES[0];

  const totalSlicesCount = KNOWLEDGE_SLICES_SECTIONS.reduce(
    (acc, sec) => acc + sec.items.length,
    0
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-[#F0EEE6] border border-[#D4C5B0] rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-serif bg-[#E8E4D9] text-[#7A7468] border border-[#D4C5B0] mb-2">
              <Layers className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>核心模块 8 · 知识导引与核心概念切片库 (Calculus Core Knowledge Slices)</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#3D3D3D]">
              微积分五大核心思想切片与学术导引全景
            </h2>
            <p className="text-xs sm:text-sm text-[#7A7468] font-serif mt-1 max-w-4xl">
              系统重构微积分两千年思想史中的 5 大核心演进切片（共涵盖 {totalSlicesCount} 个精要命题），
              打通古代几何穷竭、17世纪微元代数化、牛顿-莱布尼茨符号范式、19世纪极限严格化重构与现代大学高数/前沿人工智能梯度引擎的认知脉络。
            </p>
          </div>

          {/* Module Mode Switcher */}
          <div className="flex flex-wrap bg-[#EAE7DF] p-1 rounded-xl border border-[#D4C5B0] shrink-0">
            <button
              onClick={() => setActiveTab("manuscripts")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-serif transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === "manuscripts"
                  ? "bg-[#5A5A40] text-white font-medium shadow-xs"
                  : "text-[#7A7468] hover:text-[#3D3D3D]"
              }`}
            >
              <Scroll className="w-3.5 h-3.5 text-amber-300" />
              <span>每日手稿思想卡片 (Daily Cards)</span>
            </button>
            <button
              onClick={() => setActiveTab("slices")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-serif transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === "slices"
                  ? "bg-[#5A5A40] text-white font-medium shadow-xs"
                  : "text-[#7A7468] hover:text-[#3D3D3D]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>五大章节深度切片 ({totalSlicesCount})</span>
            </button>
            <button
              onClick={() => setActiveTab("genealogy")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-serif transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === "genealogy"
                  ? "bg-[#5A5A40] text-white font-medium shadow-xs"
                  : "text-[#7A7468] hover:text-[#3D3D3D]"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>知识基因谱系拓扑</span>
            </button>
            <button
              onClick={() => setActiveTab("paradigms")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-serif transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === "paradigms"
                  ? "bg-[#5A5A40] text-white font-medium shadow-xs"
                  : "text-[#7A7468] hover:text-[#3D3D3D]"
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>五大历史范式对照</span>
            </button>
            <button
              onClick={() => setActiveTab("curriculum")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-serif transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === "curriculum"
                  ? "bg-[#5A5A40] text-white font-medium shadow-xs"
                  : "text-[#7A7468] hover:text-[#3D3D3D]"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>大学高数映射与避坑指南</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 0: DAILY MANUSCRIPTS CARDS ARCHIVE */}
      {activeTab === "manuscripts" && (
        <div className="space-y-6">
          <div className="bg-[#FAF8F2] border border-[#D4C5B0] rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded bg-[#EAE7DF] text-[#5A5A40]">
                  <Scroll className="w-4 h-4" />
                </span>
                <h3 className="font-serif font-bold text-base text-[#3D3D3D]">
                  每日微积分数学家思想卡片与经典手稿原典库
                </h3>
              </div>
              <p className="text-xs text-[#7A7468] font-serif leading-relaxed max-w-3xl">
                汇聚从古希腊阿基米德、魏晋刘徽到牛顿、莱布尼茨、欧拉、柯西与魏尔斯特拉斯的原著手稿珍贵摘录，支持原拉丁文/德文/古汉语对照、LaTeX 核心定理公式、认识论意义解读，并提供一键导出为 Markdown 与学术 PDF 打印保存。
              </p>
            </div>
            <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-[#EAE7DF] text-[#5A5A40] border border-[#D4C5B0] shrink-0">
              共收录 10 位大师珍贵手稿
            </div>
          </div>

          {/* Render Main Manuscript Card */}
          <DailyManuscriptCard />
        </div>
      )}

      {/* VIEW 1: 5 CORE KNOWLEDGE SLICES SECTIONS */}
      {activeTab === "slices" && (
        <div className="space-y-6">
          {/* Section Filter & Search Control Bar */}
          <div className="bg-[#FAF8F2] border border-[#D4C5B0] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-serif font-bold text-[#5A5A40] mr-1 flex items-center space-x-1">
                <Filter className="w-3.5 h-3.5" />
                <span>切片章节筛选:</span>
              </span>
              <button
                onClick={() => setSelectedSectionId("all")}
                className={`px-3 py-1 rounded-full text-xs font-serif transition-colors cursor-pointer ${
                  selectedSectionId === "all"
                    ? "bg-[#5A5A40] text-white font-medium"
                    : "bg-[#EAE7DF] hover:bg-[#ded9ce] text-[#3D3D3D] border border-[#D4C5B0]"
                }`}
              >
                全部 5 大部分
              </button>
              {KNOWLEDGE_SLICES_SECTIONS.map((sec) => (
                <button
                  key={sec.sectionId}
                  onClick={() => setSelectedSectionId(sec.sectionId)}
                  className={`px-3 py-1 rounded-full text-xs font-serif transition-colors cursor-pointer ${
                    selectedSectionId === sec.sectionId
                      ? "bg-[#5A5A40] text-white font-medium"
                      : "bg-[#EAE7DF] hover:bg-[#ded9ce] text-[#3D3D3D] border border-[#D4C5B0]"
                  }`}
                >
                  第{sec.sectionNumber}部分 ({sec.items.length})
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E887B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索定理、数学家或核心概念..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#D4C5B0] rounded-full text-xs font-serif text-[#3D3D3D] placeholder:text-[#8E887B] focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                />
              </div>

              <button
                onClick={expandAllSlices}
                className="px-2.5 py-1.5 bg-white hover:bg-[#F0EEE6] border border-[#D4C5B0] rounded-lg text-xs font-serif text-[#5A5A40] cursor-pointer"
                title="展开所有切片"
              >
                全部展开
              </button>
              <button
                onClick={collapseAllSlices}
                className="px-2.5 py-1.5 bg-white hover:bg-[#F0EEE6] border border-[#D4C5B0] rounded-lg text-xs font-serif text-[#7A7468] cursor-pointer"
                title="折叠所有切片"
              >
                全部折叠
              </button>
            </div>
          </div>

          {/* Slices Stream */}
          <div className="space-y-8">
            {filteredSections.map((section) => (
              <div
                key={section.sectionId}
                className="bg-white border border-[#D4C5B0] rounded-xl overflow-hidden shadow-xs"
              >
                {/* Section Header Banner */}
                <div className="bg-[#F6F4EE] border-b border-[#D4C5B0] p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="w-7 h-7 rounded-lg bg-[#5A5A40] text-white flex items-center justify-center text-xs font-serif font-bold">
                        {section.sectionNumber}
                      </span>
                      <div>
                        <h3 className="font-serif text-lg font-bold text-[#3D3D3D]">
                          {section.sectionTitle}
                        </h3>
                        <p className="text-xs text-[#7A7468] font-serif">
                          {section.subtitle} · <span className="font-mono">{section.eraRange}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#555555] font-serif leading-relaxed mt-2 bg-[#EFECE3] p-3 rounded-lg border border-[#E0D9CB]">
                    <strong>【历史认知概览】</strong> {section.summary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-[11px] font-serif">
                    <div className="bg-[#FAF8F2] p-2.5 rounded-md border border-[#E5DEC9]">
                      <span className="font-bold text-[#5A5A40]">主要历史驱动力：</span>
                      <span className="text-[#666666] ml-1">{section.historicalDrive}</span>
                    </div>
                    <div className="bg-[#FAF8F2] p-2.5 rounded-md border border-[#E5DEC9]">
                      <span className="font-bold text-[#5A5A40]">认识论关键跃迁：</span>
                      <span className="text-[#666666] ml-1">{section.epistemologicalShift}</span>
                    </div>
                  </div>
                </div>

                {/* Sub-Items List */}
                <div className="divide-y divide-[#EAE7DF]">
                  {section.items.map((item, idx) => {
                    const isExpanded = expandedSliceIds.has(item.id);
                    return (
                      <div key={item.id} className="p-5 transition-colors hover:bg-[#FAF9F5]/60">
                        {/* Title Bar (Click to Toggle) */}
                        <div
                          onClick={() => toggleSliceExpand(item.id)}
                          className="flex items-start justify-between cursor-pointer gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#EAE7DF] text-[#5A5A40] font-bold">
                                切片 {section.sectionNumber}.{idx + 1}
                              </span>
                              <h4 className="font-serif text-base font-bold text-[#3D3D3D] hover:text-[#5A5A40] transition-colors">
                                {item.title}
                              </h4>
                              <span className="text-xs text-[#7A7468] font-serif">
                                · {item.historicalFigure} ({item.years})
                              </span>
                            </div>
                            <p className="text-xs text-[#666666] font-serif line-clamp-2">
                              {item.coreConcept}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0 pt-1">
                            <span className="text-xs text-[#7A7468] font-serif hidden sm:inline">
                              {isExpanded ? "收起详情" : "展开推导与教学映射"}
                            </span>
                            <div className="p-1 rounded-full bg-[#EAE7DF] text-[#5A5A40]">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Collapsible Deep Content */}
                        {isExpanded && (
                          <div className="mt-5 space-y-4 pt-4 border-t border-[#EAE7DF] animate-in fade-in duration-200">
                            {/* Formal Math Block with Copy LaTeX Button */}
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-serif font-bold text-[#3D3D3D] flex items-center space-x-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
                                  <span>核心定理与形式化数学表述：</span>
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyFormula(item.id, item.formalMath);
                                  }}
                                  className="inline-flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 rounded bg-[#FAF8F2] hover:bg-[#EAE7DF] text-[#5A5A40] border border-[#D4C5B0] transition-colors cursor-pointer"
                                >
                                  {copiedFormulaId === item.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span className="text-emerald-700">LaTeX 已复制</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>复制 LaTeX</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className="bg-[#FAF8F2] p-4 rounded-xl border border-[#D4C5B0] text-center text-[#3D3D3D] shadow-2xs">
                                <MathView math={item.formalMath} block={true} />
                              </div>
                            </div>

                            {/* Detailed Derivation Steps */}
                            <div className="bg-[#F9F7F2] p-4 rounded-xl border border-[#D4C5B0] space-y-2.5">
                              <span className="text-xs font-serif font-bold text-[#3D3D3D] block">
                                历史严密推演与证明步骤拆解：
                              </span>
                              <div className="space-y-2 text-xs font-serif text-[#4A4A4A]">
                                {item.detailedDerivation.map((step, sIdx) => (
                                  <div key={sIdx} className="flex items-start space-x-2">
                                    <span className="w-4 h-4 rounded-full bg-[#EAE7DF] text-[#5A5A40] font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                      {sIdx + 1}
                                    </span>
                                    <div className="leading-relaxed flex-1">
                                      {step.includes("$") ? (
                                        <MathView math={step} inline={true} />
                                      ) : (
                                        <span>{step}</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Two-Column Info: Philosophical Paradigm & Modern Mapping */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Philosophical Paradigm */}
                              <div className="bg-[#FAF8F2] p-3.5 rounded-lg border border-[#D4C5B0] space-y-1.5">
                                <div className="flex items-center space-x-1.5 text-xs font-serif font-bold text-[#5A5A40]">
                                  <Lightbulb className="w-3.5 h-3.5 text-[#C4A468]" />
                                  <span>哲学认识论与范式突破：</span>
                                </div>
                                <p className="text-xs font-serif text-[#555555] leading-relaxed">
                                  {item.philosophicalParadigm}
                                </p>
                              </div>

                              {/* Modern University Mapping */}
                              <div className="bg-[#EEF2EC] p-3.5 rounded-lg border border-[#C8D7C4] space-y-1.5">
                                <div className="flex items-center space-x-1.5 text-xs font-serif font-bold text-[#425C3C]">
                                  <GraduationCap className="w-3.5 h-3.5 text-[#425C3C]" />
                                  <span>现代大学高等数学教学对应：</span>
                                </div>
                                <p className="text-xs font-serif text-[#425C3C] leading-relaxed">
                                  {item.modernUniversityMapping}
                                </p>
                              </div>
                            </div>

                            {/* Classic Quote */}
                            {item.classicQuote && (
                              <div className="bg-[#FAF8F2] p-3 rounded-lg border-l-4 border-[#5A5A40] text-xs font-serif italic text-[#666666]">
                                <Quote className="w-3.5 h-3.5 inline mr-1 text-[#8E887B]" />
                                {item.classicQuote}
                              </div>
                            )}

                            {/* Key Insights Checklist */}
                            <div className="flex flex-wrap gap-2 pt-1">
                              {item.keyInsights.map((insight, inIdx) => (
                                <div
                                  key={inIdx}
                                  className="inline-flex items-center space-x-1.5 text-[11px] font-serif bg-[#EAE7DF] px-2.5 py-1 rounded-md text-[#3D3D3D] border border-[#D4C5B0]/60"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-[#5A5A40]" />
                                  <span>{insight}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: GENEALOGY TOPOLOGY NODES */}
      {activeTab === "genealogy" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F2] p-3.5 rounded-xl border border-[#D4C5B0]">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: "全部 11 宗师节点" },
                { id: "foundation", label: "古代穷竭与不可分量" },
                { id: "derivative", label: "切线与流数演化" },
                { id: "integral", label: "求积与圆盘微元" },
                { id: "theorem", label: "基本定理与符号系统" },
                { id: "rigor", label: "分析学极限严格化" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setGenealogyCategoryFilter(c.id)}
                  className={`px-3 py-1 rounded-full text-xs font-serif transition-colors cursor-pointer ${
                    genealogyCategoryFilter === c.id
                      ? "bg-[#5A5A40] text-white font-medium"
                      : "bg-[#EAE7DF] hover:bg-[#ded9ce] text-[#3D3D3D] border border-[#D4C5B0]"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E887B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索人物或理论..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#D4C5B0] rounded-full text-xs font-serif text-[#3D3D3D] placeholder:text-[#8E887B] focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
              />
            </div>
          </div>

          {/* Interactive Topology Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Nodes List */}
            <div className="lg:col-span-2 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredGenealogyNodes.map((node) => {
                  const isSelected = selectedGenealogyId === node.id;
                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedGenealogyId(node.id)}
                      className={`p-4 rounded-xl border text-left transition-all relative cursor-pointer ${
                        isSelected
                          ? "bg-[#5A5A40] text-white border-[#5A5A40] shadow-sm ring-2 ring-[#5A5A40]/30"
                          : "bg-white hover:bg-[#F0EEE6] text-[#3D3D3D] border-[#D4C5B0]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            isSelected
                              ? "bg-[#EAE7DF] text-[#5A5A40] font-bold"
                              : "bg-[#E8E4D9] text-[#7A7468]"
                          }`}
                        >
                          {node.era}
                        </span>
                        <span
                          className={`text-xs font-serif font-bold ${
                            isSelected ? "text-[#E8E4D9]" : "text-[#5A5A40]"
                          }`}
                        >
                          {node.historicalFigure}
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-sm mb-1">{node.title}</h4>
                      <p
                        className={`text-xs line-clamp-2 ${
                          isSelected ? "text-[#E8E4D9]" : "text-[#7A7468]"
                        }`}
                      >
                        {node.coreIdea}
                      </p>

                      {node.prerequisites.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-[#D4C5B0]/40 flex flex-wrap gap-1">
                          <span className="text-[9px] opacity-75">思想先驱:</span>
                          {node.prerequisites.map((pId) => (
                            <span
                              key={pId}
                              className="text-[9px] px-1.5 py-0.2 rounded bg-black/10 font-mono"
                            >
                              {pId}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right 1 Col: Selected Node In-Depth Inspection Card */}
            <div className="bg-white border border-[#D4C5B0] rounded-xl p-5 shadow-sm space-y-4 text-xs font-serif">
              <div className="pb-3 border-b border-[#EAE7DF]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono text-[#5A5A40] font-bold">
                    {selectedGenealogyNode.era} · {selectedGenealogyNode.historicalFigure}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAE7DF] text-[#3D3D3D] border border-[#D4C5B0]">
                    {selectedGenealogyNode.category.toUpperCase()}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-base text-[#3D3D3D]">
                  {selectedGenealogyNode.title}
                </h3>
              </div>

              <div>
                <span className="font-bold text-[#3D3D3D] block mb-1">
                  形式化数学定理表述：
                </span>
                <div className="bg-[#FAF8F2] p-3.5 rounded-lg border border-[#D4C5B0] text-[#3D3D3D]">
                  <MathView math={selectedGenealogyNode.formalMath} block={true} />
                </div>
              </div>

              <div>
                <span className="font-bold text-[#3D3D3D] block mb-1">
                  核心思想与历史贡献：
                </span>
                <p className="text-[#555555] leading-relaxed">
                  {selectedGenealogyNode.coreIdea}
                </p>
              </div>

              <div className="bg-[#EEF2EC] p-3.5 rounded-lg border border-[#C8D7C4] text-[#425C3C] space-y-1.5">
                <div className="flex items-center space-x-1.5 font-bold">
                  <GraduationCap className="w-4 h-4 text-[#425C3C]" />
                  <span>现代大学高等数学教学映射：</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#425C3C]">
                  {selectedGenealogyNode.modernMapping}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#EAE7DF]">
                <span className="font-bold text-[#3D3D3D] block">
                  概念衍生与继承链路：
                </span>
                <div className="space-y-1 text-[11px] text-[#7A7468]">
                  <p>
                    • <strong>思想先驱：</strong>{" "}
                    {selectedGenealogyNode.prerequisites.length > 0
                      ? selectedGenealogyNode.prerequisites.join(", ")
                      : "无（古希腊源头始祖）"}
                  </p>
                  <p>
                    • <strong>后续启发：</strong>{" "}
                    {selectedGenealogyNode.descendants.length > 0
                      ? selectedGenealogyNode.descendants.join(", ")
                      : "现代微积分与现代分析学大厦"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: 5 PARADIGMS COMPARISON TABLE */}
      {activeTab === "paradigms" && (
        <div className="bg-white border border-[#D4C5B0] rounded-xl overflow-hidden shadow-xs">
          <div className="p-5 bg-[#FAF8F2] border-b border-[#D4C5B0]">
            <h3 className="font-serif font-bold text-base text-[#3D3D3D]">
              微积分两千年思想演化五大核心范式横向对比
            </h3>
            <p className="text-xs text-[#7A7468] font-serif mt-1">
              横向透视从古希腊几何穷竭到17世纪微元、牛顿-莱布尼茨代数算子、19世纪极限严格化及20世纪非标准分析的演变逻辑。
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-serif text-left border-collapse">
              <thead>
                <tr className="bg-[#EAE7DF] text-[#3D3D3D] border-b border-[#D4C5B0]">
                  <th className="p-3.5 font-bold">历史范式时期</th>
                  <th className="p-3.5 font-bold">代表宗师</th>
                  <th className="p-3.5 font-bold">研究核心本体</th>
                  <th className="p-3.5 font-bold">无穷小量处理方式</th>
                  <th className="p-3.5 font-bold">主要演算工具</th>
                  <th className="p-3.5 font-bold">严密性与逻辑缺陷</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE7DF] text-[#4A4A4A]">
                {PARADIGM_COMPARISONS.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="p-3.5 font-bold text-[#5A5A40] align-top bg-[#FAF8F2]/60">
                      {p.era}
                    </td>
                    <td className="p-3.5 align-top font-medium text-[#3D3D3D]">
                      {p.representativeFigures}
                    </td>
                    <td className="p-3.5 align-top">{p.coreObject}</td>
                    <td className="p-3.5 align-top font-mono text-[11px] text-[#5A5A40]">
                      {p.infinitesimalHandling}
                    </td>
                    <td className="p-3.5 align-top">{p.mainTool}</td>
                    <td className="p-3.5 align-top text-[#7A7468]">
                      <span className="block font-bold text-[#3D3D3D]">{p.rigorLevel}</span>
                      {p.paradoxVulnerability}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: UNIVERSITY CALCULUS COGNITIVE MAP & COMMON MISCONCEPTIONS */}
      {activeTab === "curriculum" && (
        <div className="space-y-6">
          {/* Cognitive Map Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cognitive Tree */}
            <div className="bg-white border border-[#D4C5B0] rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-[#EAE7DF]">
                <GraduationCap className="w-4 h-4 text-[#5A5A40]" />
                <h3 className="font-serif font-bold text-base text-[#3D3D3D]">
                  大学高等数学知识阶梯架构
                </h3>
              </div>

              <div className="space-y-3 text-xs font-serif">
                <div className="p-3 bg-[#FAF8F2] rounded-lg border border-[#D4C5B0]">
                  <span className="font-bold text-[#5A5A40] block mb-1">
                    1. 极限与连续论（地基基石）
                  </span>
                  <p className="text-[#666666]">
                    $(\varepsilon, \delta)$ 与 $(\varepsilon, N)$ 静态控制不等式；单调有界与夹逼定理；间断点分类与连续函数介值定理。
                  </p>
                </div>

                <div className="p-3 bg-[#FAF8F2] rounded-lg border border-[#D4C5B0]">
                  <span className="font-bold text-[#5A5A40] block mb-1">
                    2. 一元微分与积分（动力与累积）
                  </span>
                  <p className="text-[#666666]">
                    导数差商极限、切线与高阶导数；洛必达法则与泰勒展开；不定积分与微积分基本定理；定积分微元法求面积/旋转体。
                  </p>
                </div>

                <div className="p-3 bg-[#FAF8F2] rounded-lg border border-[#D4C5B0]">
                  <span className="font-bold text-[#5A5A40] block mb-1">
                    3. 多元微积分与空间场论（高维拓展）
                  </span>
                  <p className="text-[#666666]">
                    偏导数与全微分；梯度向量场 $\nabla f$；重积分、格林公式、高斯散度公式与斯托克斯旋度定理（统合于外微分）。
                  </p>
                </div>

                <div className="p-3 bg-[#FAF8F2] rounded-lg border border-[#D4C5B0]">
                  <span className="font-bold text-[#5A5A40] block mb-1">
                    4. 微分方程与无穷级数（物理动力与函数逼近）
                  </span>
                  <p className="text-[#666666]">
                    一阶可分离/齐次/线性微分方程；二阶常系数齐次/非齐次方程；数项级数审敛法；幂级数收敛半径与傅里叶级数展开。
                  </p>
                </div>
              </div>
            </div>

            {/* Common Misconceptions & Historical Pitfalls */}
            <div className="bg-white border border-[#D4C5B0] rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-[#EAE7DF]">
                <Lightbulb className="w-4 h-4 text-[#C4A468]" />
                <h3 className="font-serif font-bold text-base text-[#3D3D3D]">
                  经典认知误区与历史思想纠偏
                </h3>
              </div>

              <div className="space-y-3 text-xs font-serif">
                <div className="p-3 bg-[#FFF9F5] rounded-lg border border-[#EAC4B0]">
                  <span className="font-bold text-[#B45309] block mb-1">
                    误区 1：“无穷小量 dx 是一个非常非常小的非零常数”
                  </span>
                  <p className="text-[#78350F] leading-relaxed">
                    <strong>纠偏：</strong> 无穷小不是一个具体的数，而是一个<strong>以零为极限的变量数列</strong>。在现代分析中，我们从不谈论单一无穷小数值，而只谈论变量逼近过程中的相对阶数（如高阶无穷小、同阶无穷小）。
                  </p>
                </div>

                <div className="p-3 bg-[#FFF9F5] rounded-lg border border-[#EAC4B0]">
                  <span className="font-bold text-[#B45309] block mb-1">
                    误区 2：“函数图像只要连绵不断（连续），就一定可以在每一处作切线（可导）”
                  </span>
                  <p className="text-[#78350F] leading-relaxed">
                    <strong>纠偏：</strong> 魏尔斯特拉斯构造的病态分形函数证明了：存在<strong>处处连续却处处不可导</strong>的函数！连续性只保证函数无断裂，可导性还需要局部具有极其优良的线性平滑逼近性。
                  </p>
                </div>

                <div className="p-3 bg-[#FFF9F5] rounded-lg border border-[#EAC4B0]">
                  <span className="font-bold text-[#B45309] block mb-1">
                    误区 3：“0.999... 只是无限接近 1，但永远不等于 1”
                  </span>
                  <p className="text-[#78350F] leading-relaxed">
                    <strong>纠偏：</strong> 在完备实数系 <MathView math="\mathbb{R}" inline={true} /> 中，0.999... <strong>严格、精确等于 1</strong>！它是等比级数 <MathView math="\sum_{n=1}^\infty 9 \times 10^{-n} = \frac{0.9}{1 - 0.1} = 1" inline={true} /> 的极限值，二者是同一实数的两种十进制书写形式。
                  </p>
                </div>

                <div className="p-3 bg-[#FFF9F5] rounded-lg border border-[#EAC4B0]">
                  <span className="font-bold text-[#B45309] block mb-1">
                    误区 4：“求导 dy/dx 就是简单的 dy 除以 dx”
                  </span>
                  <p className="text-[#78350F] leading-relaxed">
                    <strong>纠偏：</strong> <MathView math="\frac{dy}{dx}" inline={true} /> 记号本质是一个整体微分算子 <MathView math="\frac{d}{dx}(y)" inline={true} />，代表差商的极限。虽然莱布尼茨记号巧合地满足许多分数代数形式法则（如链式法则），但不可盲目当作普通算术分数相除。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
