/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Brain, Send, ShieldAlert, Cpu, Orbit, Signal, HelpCircle, ArrowRight, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChronologyItem {
  year: string;
  event: string;
}

interface SimulatedResult {
  alternativeTitle: string;
  chronology: ChronologyItem[];
  infrastructureImpact: string;
  civilizationScore: number;
  aiAnalysis: string;
}

interface SelectionPreset {
  id: string;
  title: string;
  withdrawnTool: string;
  icon: any;
  explanation: string;
  defaultPrompt: string;
}

const DIVERGENCE_PRESETS: SelectionPreset[] = [
  {
    id: "tacoma",
    title: "抽离《二阶阻尼微分方程》",
    withdrawnTool: "二阶微分方程/阻尼共振公式",
    icon: ShieldAlert,
    explanation: "风阻、悬桥及机械振动偏导数未被解析成立。人类工程学将永远无法控制柔性自激强迫共振。",
    defaultPrompt: "如果所有高架跨海悬吊大桥与超重装摩天大楼因无法规避风力风切共振，城市只敢用泥土和巨大叠石建造重型水泥墩，世界会退化成什么样？"
  },
  {
    id: "fourier",
    title: "抽离《傅里叶频域求和》",
    withdrawnTool: "傅里叶级数/积分相干变换",
    icon: Signal,
    explanation: "时域与频域转化解析工具流失。无线电广播、多媒体信号、声波与声像混叠无法单独滤波分离。",
    defaultPrompt: "如果无线电频谱滤波傅氏积分定理从未被提出。电热辐射波像杂音一般互相厮杀重叠。全能互联网与光纤带宽技术会怎么流变？"
  },
  {
    id: "kepler",
    title: "抽离《天体力学极值积分》",
    withdrawnTool: "轨道动力学多重极值/牛顿运动积分",
    icon: Orbit,
    explanation: "行星绕日摄动轨道、宇宙火箭飞出极速积分方程式未予建立。天体力学彻底退化到原始浑天仪阶段。",
    defaultPrompt: "如果牛顿对微小极值逼近积分的轨迹测算从未被发明。人类火箭由于找不到微小纠偏变轨模型，直接砸向地面，永远禁锢在引力牢笼中？"
  },
  {
    id: "gradient",
    title: "抽离《高维多项式偏导梯度》",
    withdrawnTool: "高维偏导梯度/反向传播导数链式法则",
    icon: Cpu,
    explanation: "数十亿感知机节点因求导故障，无法自反回送误差并逆向修正参数权值。AI彻底被逼回静态IF-ELSE法则。",
    defaultPrompt: "如果多层感知反演的负偏导数路径被完全证明为不可解。神经网络反向传播算法被封杀，现在甚至没有基本的大型专家语言模型？"
  }
];

export default function WhatIfSandbox() {
  const [selectedPreset, setSelectedPreset] = useState<SelectionPreset>(DIVERGENCE_PRESETS[0]);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [simulationData, setSimulationData] = useState<SimulatedResult | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const startSimulation = async () => {
    setLoading(true);
    setErrorText(null);
    setSimulationData(null);

    try {
      const response = await fetch("/api/simulate-what-if", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          scenarioId: selectedPreset.id,
          withdrawnTool: selectedPreset.withdrawnTool,
          userPrompt: customPrompt
        })
      });

      if (!response.ok) {
        throw new Error("模型仿真中继响应失败，请检查API Key配置。");
      }

      const data = await response.json();
      setSimulationData(data);
    } catch (e: any) {
      console.error(e);
      setErrorText("模拟引擎暂时离线或正在冷却。系统已激活自动备忘预设库，正在执行高精度本地备降推算。");
      
      // Fallback local preset trigger
      setTimeout(() => {
        setSimulationData(getFallbackLocal(selectedPreset.id, customPrompt));
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const getFallbackLocal = (id: string, userText: string): SimulatedResult => {
    const backup: Record<string, SimulatedResult> = {
      tacoma: {
        alternativeTitle: "铆钉钢怪与叠石之世纪：无限增厚的大地堆砌",
        chronology: [
          { year: "1850年", event: "由于无法设计大桥侧向阻尼阻碍振幅共振，悬索桥在狂风下迅速断裂。英国和美国全数撤除轻型拉丝拱索，退回造价高昂、臃肿肥厚的叠合泥洞拱桥。" },
          { year: "1920年", event: "写字楼和摩天塔被制约在11层以下，为了平衡结构自重，墙基需要达到惊人的两米厚，城市形态呈平面平铺化。运输损耗拉升全球物料成本。" },
          { year: "1970年", event: "无法构建高速风力叶片振动控制方程。大型发电机螺旋叶片在狂风切削阻尼不足时骤然碎裂。新能源风力和潮汐风能推进无限期挂起。" },
          { year: "2026年", event: "超级海岸带跨阻走廊全部缺失，沿岸大陆架无法建链。今天的人类大都市失去了凌空的玻璃骨架，社会呈现出一幅由重铆钉、铆焊和实心花岗岩构筑的旧重工灰色景象。" }
        ],
        infrastructureImpact: `抽离了对变增量周期外推阻尼常数的微分解算，人类失去了征服横向高空阻力和结构形变的数理法器。所有大跨悬吊跨桥、现代超高摩天楼和柔性空气动力涡流浆均化为泡影。${userText ? `（结合您的推论：${userText}，更导致整体刚性结构出现不可估量的动态剪切疲劳，建筑体量只能依靠叠石无限加厚）` : ""}`,
        civilizationScore: 45,
        aiAnalysis: "微积分绝非一行枯燥的代数符号，它是承载“应力变化率在结构内部无声传导”的科学语言。没有二阶阻尼微分模型，面对波动，人类无法利用柔性对冲去消解风压；只能倒弃材料刚性，依赖无休止堆砌生铁水泥来应对不确定性。这堵高耸的花岗岩城市高塔，也禁锢了人类拓展太空和多维建筑的可能性。"
      },
      fourier: {
        alternativeTitle: "铜缆密织电铃时代：纯净有线承载物的人格化前行",
        chronology: [
          { year: "1884年", event: "时时频域积分转换流失，电磁载波复用（FDM）宣告无解。所有的长途线路只能依靠单独敷设昂贵电缆。人类越洋电缆被拉至铜矿产能极限。" },
          { year: "1930年", event: "无线电接收因相互干扰堆叠无法滤波分级，空中电磁波如巨团混沌。除战时大振动量电报莫尔斯能勉强击穿干扰，长距离民用音频无线接收沦为空谈。" },
          { year: "1985年", event: "数字声音、静止图像缺少傅里叶离散周期分解。由于信息容积毫无压缩方法，带宽占用巨大，现代数字多媒体传输被完全封死。光纤复用理论难立。" },
          { year: "2026年", event: "今天不存在无线蜂窝基站、智能机、Wi-Fi或电解视频流。世界的绝密高带宽数据干线，仍然依赖骑摩托和特快货运列车专人配送硬盘的‘机密包中继邮局’艰难行进。" }
        ],
        infrastructureImpact: `没有了傅里叶级数将复杂物理波动肢解为纯简谐原波段的积分工具，物理波成了堆积在自然界的电磁杂波团，无线多路载波传输成了不可能完成的任务。${userText ? `（依照您所设想的平行要素：${userText}，这更从根本上截断了射频模拟器件的多频率协同演变，通信成了宏大铜桩）` : ""}`,
        civilizationScore: 32,
        aiAnalysis: "傅里叶变换是物理振动与信号频谱的折射镜。它惊人地指出，无论多么粗糙吵闹的杂音，都能在积分状态下优雅化作纯白无暇的简谐弦波组合。剔除这一算子，无线传感即是一湾被废弃的噪声电波深海。时频偏微分其实才是构成今天全球无线信息传输、光纤主干及数字微处理通信的核心数学脊梁。"
      },
      kepler: {
        alternativeTitle: "引力深井的地表泥泞：被永恒终结的深空梦想",
        chronology: [
          { year: "1810年", event: "万有引力多重合力积分无法代数化。人们不能根据微小质元对回转天体做势场核聚积分。哈雷预测和行星摄动变轨参数变成无据可查的星相玄学。" },
          { year: "1957年", event: "变质量火箭发射冲锋。由于缺失了一阶推力变动、重力加速度变动和火箭变质量的微分动力耦合，箭体起飞在进入高压风切层时直接歪斜翻滚在太平洋烧毁。" },
          { year: "1990年", event: "GPS和低轨定位系统由于无法在轨道微扰中求其周期摄动导数，定位计算产生几十公里漂移。人类航海重新退回信手执罗盘、靠岸灯塔指向的旧世纪。" },
          { year: "2026年", event: "卫星星座因变轨道积分偏离，无法精确对位并全数陨落。极少量的长距离跨大洋通信由极易断裂的深海海底高压电缆维持。星际飞船从未进入蓝海天宇，太空死寂一片。" }
        ],
        infrastructureImpact: `多重积分势能模型是打破地表重力束缚的最佳微元锁链。没有了行星动力微分，宇宙轨道修正和发动机推力变质量方程计算将出现不可控偏角。一切外空人造天体工程全数失效。${userText ? `（在您所补充的条件 ${userText} 催化下，重力井势场公式更加离线化，人类完全退避地表）` : ""}`,
        civilizationScore: 28,
        aiAnalysis: "飞跃蓝色天穹不仅要火箭推力巨大，核心更在于对千分之一秒下的动能与势能极差路径实施连续流元积分。缺失了偏导数修正，人类引以为傲的航天探测就成了一发没有对齐模型的烟火，坠地即燃。微积分让数学拥有了在连续多重变轨中预测方向的力量，抽去它，蓝星种群重新成了只见头顶，不解极深天宇的‘井底之囚’。"
      },
      gradient: {
        alternativeTitle: " IF-ELSE 经验天书：停留在巨幅表格和纸质判断的黄昏",
        chronology: [
          { year: "1965年", event: "深度前馈网偏导回归方向在学术界被判为绝境。多层感知点无法依靠链式偏微分把错误率（Loss）从一端逆推回前置层并自动修补。人工智能陷入漫漫冬眠。" },
          { year: "1990年", event: "计算机智能化仅能依靠手工写就的‘If / Then’法则、上万行专家常数表艰难拼接。文字翻译与模糊感知准确率维持在低下水平。机器没有自学习意识。" },
          { year: "2015年", event: "图像识别與自适应决策，由于无法自动沿着极小梯度下山收敛，只得退回静态拉普拉斯算子。无人车规划系统因在多变量微扰下解算瘫痪而在首试告退。" },
          { year: "2026年", event: "全球感知大模型从未启动。包含Gemini、GPT在内的演进智慧沦为幻象。世界各国的自动化工况和机器决策仍然依托复杂的、手工推敲的数据表格。全球算力演进受创。" }
        ],
        infrastructureImpact: `负梯度下降在成百亿规模的参数流中给出了唯一自更新方向。缺失此链式导数偏反向传播，机器就丧失了在曲面上沿着极小梯度自校正优化的功能，机器智能由此石化封死。${userText ? `（顺此因素 ${userText} 的推演，传统知识经验无法得到任何高效参数化整合，只能依靠纸上记录）` : ""}`,
        civilizationScore: 50,
        aiAnalysis: "高维参数调整是在有数十亿起伏的‘亏损地窟’中闭眼求降。偏倒数梯度就是握在手中的导向针。剥离了高阶梯度链式规则，人工逻辑网络就成了一堆无法排净错误渣滓的死铁片。微积分是隐藏在今天大语言模型、神经网络突触中真正的心神。缺失偏导，硅基计算不过是一个庞大而盲目的电容器套件。"
      }
    };
    return backup[id];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="what-if-sandbox">
      {/* Selector Part */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-205 flex flex-col gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-orange/10 text-brand-orange">
              <Brain className="w-5 h-5 text-brand-orange animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-slate-800 text-sm md:text-base font-mono">微积分对历史断裂后的逆向量子推算</h3>
              <p className="text-[10px] text-slate-400 font-mono">Cognitive Tech Tree Alternate History Simulator</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            微积分是建筑起人类高速大洋悬索桥、定位星网、无线信道压缩以及反向传播算法的数学底层重力支撑。
            <strong className="text-brand-orange"> 在下方选定一项核心极值公式，AI认知引擎将瞬间重写大航海或计算机革命史：</strong>
          </p>
        </div>

        {/* Dynamic selector list */}
        <div className="flex flex-col gap-2.5">
          {DIVERGENCE_PRESETS.map((preset) => {
            const IconComp = preset.icon;
            const isSel = selectedPreset.id === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => {
                  setSelectedPreset(preset);
                  setSimulationData(null);
                  setErrorText(null);
                }}
                className={`p-4 rounded-xl border transition-all duration-300 flex items-start gap-3 cursor-pointer ${
                  isSel
                    ? "bg-white border-brand-orange shadow-[0_4px_16px_rgba(234,88,12,0.06)] scale-[1.01]"
                    : "bg-white/70 border-slate-200 hover:border-slate-350 hover:bg-white select-none"
                }`}
              >
                <div className={`p-2 rounded-lg mt-0.5 ${isSel ? "bg-brand-orange/10 text-brand-orange" : "bg-slate-50 border border-slate-100 text-slate-400"}`}>
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-0.5 flex-1 font-sans">
                  <div className="flex justify-between items-center">
                    <span className="font-display font-bold text-xs text-slate-800">{preset.title}</span>
                    {isSel && (
                      <span className="text-[9px] bg-brand-orange/10 text-brand-orange px-1.5 py-0.5 rounded font-mono font-bold tracking-wide">
                        ACTIVE BRANCH
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">抽离工具：y = ∫{preset.withdrawnTool}</span>
                  <p className="text-[11px] text-slate-400 leading-normal mt-1">{preset.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Variable Formulation Input */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">加入自定义历史扰动参数 (可选):</span>
            <span className="text-[10px] text-slate-400 font-mono">LLM Cross-Inference</span>
          </div>
          
          <textarea
            placeholder={selectedPreset.defaultPrompt}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="w-full h-16 bg-white border border-slate-250 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-orange transition-colors placeholder:text-slate-400 resize-none font-sans"
          />

          <button
            onClick={startSimulation}
            disabled={loading}
            className={`w-full py-2.5 rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              loading
                ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                : "bg-brand-orange text-white lg:text-slate-900 hover:bg-brand-orange/95 hover:shadow-md active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-3.5 h-3.5 border-2 border-brand-orange border-t-transparent rounded-full"
                />
                量子历史学矩阵超算中...
              </>
            ) : (
              <>
                一键推演平行历史进程 <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alternate Simulation Results Output */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <AnimatePresence mode="wait">
          {!simulationData && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="h-full min-h-[350px] p-6 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center text-center gap-3 border-dashed shadow-xs shadow-inner"
            >
              <div className="p-3 rounded-full bg-brand-orange/10 text-brand-orange">
                <Brain className="w-10 h-10 text-brand-orange animate-pulse" />
              </div>
              <h4 className="font-display font-semibold text-slate-800 text-sm font-mono text-brand-orange font-bold">量子文明时空推算仪：静默守候</h4>
              <p className="max-w-md text-xs text-slate-500 leading-relaxed font-sans">
                在左侧点选一个您想抽离的微积分核心原理或数学算子，输入任何天马行空的平行条件偏置（亦可为空），点击下方推算，AI 算法将为您解构科技树偏导变轨，为您著述一份生动的 devolution 历史。
              </p>
            </motion.div>
          )}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full min-h-[350px] p-6 rounded-2xl bg-white border border-slate-150 flex flex-col items-center justify-center text-center gap-4 shadow-sm"
            >
              {/* Dynamic loading steps to simulate high computing */}
              <Brain className="w-12 h-12 text-brand-orange animate-bounce mb-1" />
              <div className="flex flex-col gap-1">
                <h4 className="font-display font-semibold text-sm text-slate-800 font-mono font-bold">AI Matrix Modeling System</h4>
                <div className="flex justify-center gap-1.5 mt-1">
                  <span className="w-2.5 h-2.5 bg-brand-orange rounded-full animate-bounce delay-100" />
                  <span className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-bounce delay-200" />
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce delay-300" />
                </div>
              </div>
              <div className="max-w-xs text-[11px] text-slate-500 font-mono leading-relaxed bg-slate-50 py-3 px-3.5 rounded-xl border border-slate-200 shadow-inner">
                1. 正在反向索引“{selectedPreset.withdrawnTool}”在科学史上的多重交叉偏微分分支...<br />
                2. 估算经典力学、热力学、量子波与AI反向传播在此模型下的坍塌边界比例...<br />
                3. 重构18世纪工业节点各分支，生成连续的 devolution 报告书。
              </div>
            </motion.div>
          )}

          {simulationData && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              {/* Main title and civilization score card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col gap-3 relative overflow-hidden shadow-xs">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-full blur-2xl pointer-events-none" />
                
                {errorText && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[10.5px] px-3.5 py-2 rounded-lg leading-normal font-mono mb-2">
                    {errorText}
                  </div>
                )}

                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-brand-orange font-mono font-bold tracking-wider">
                      PARALLEL COGNITIVE HISTORICAL DATA
                    </span>
                    <h3 className="font-display font-bold text-base md:text-lg text-slate-900 leading-tight">
                      {simulationData.alternativeTitle}
                    </h3>
                  </div>

                  {/* Civilization Index Score Meter */}
                  <div className="flex flex-col items-center shrink-0 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
                    <span className="text-[8px] text-slate-400 font-mono">CIV SCORE</span>
                    <span className={`text-lg font-mono font-bold ${simulationData.civilizationScore > 50 ? "text-emerald-600 font-extrabold" : "text-brand-orange animate-pulse"}`}>
                      {simulationData.civilizationScore}/100
                    </span>
                    <span className="text-[8px] text-slate-400 font-mono scale-[0.9]">(原形地球=100)</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  <strong className="text-slate-800">宏观基建极值断代：</strong>{simulationData.infrastructureImpact}
                </p>
              </div>

              {/* Parallel chronological timeline nodes */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col gap-4 shadow-xs">
                <h4 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                  平行时空退火衰变节点 (Devolution Logs)
                </h4>

                <div className="relative pl-5 border-l-2 border-brand-orange/15 flex flex-col gap-4 py-2 ml-1">
                  {simulationData.chronology.map((item, idx) => (
                    <div key={idx} className="relative flex flex-col gap-1 text-xs">
                      {/* Timeline dot marker */}
                      <span className="absolute -left-[24.5px] top-1 w-2.5 h-2.5 rounded-full bg-brand-orange border border-white shadow-xs" />
                      
                      <div className="flex font-bold items-center gap-1.5">
                        <span className="text-brand-orange font-mono font-bold">{item.year}</span>
                        <ArrowRight className="w-3 h-3 text-brand-orange" />
                      </div>
                      <p className="text-slate-505 leading-relaxed font-sans">{item.event}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deep philosophical mathematical essay */}
              <div className="p-5 rounded-2xl bg-slate-100/50 border border-slate-200 pl-4 border-l-3 border-brand-orange shadow-xs">
                <div className="flex items-center gap-2 text-brand-orange mb-2 font-mono">
                  <BookOpen className="w-4 h-4 text-brand-orange animate-pulse" />
                  <h5 className="font-display font-bold text-xs text-brand-orange">AI文明分析学家微积分反射镜</h5>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed italic font-sans pr-2">
                  “{simulationData.aiAnalysis}”
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
