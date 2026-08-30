export interface KnowledgeSliceSubItem {
  id: string;
  title: string;
  historicalFigure: string;
  years: string;
  coreConcept: string;
  formalMath: string;
  historicalContext: string;
  detailedDerivation: string[];
  philosophicalParadigm: string;
  modernUniversityMapping: string;
  classicQuote?: string;
  keyInsights: string[];
}

export interface KnowledgeSliceSection {
  sectionNumber: number;
  sectionId: string;
  sectionTitle: string;
  subtitle: string;
  eraRange: string;
  themeColor: string;
  summary: string;
  historicalDrive: string;
  epistemologicalShift: string;
  items: KnowledgeSliceSubItem[];
}

export const KNOWLEDGE_SLICES_SECTIONS: KnowledgeSliceSection[] = [
  {
    sectionNumber: 1,
    sectionId: "ancient_foundations",
    sectionTitle: "第一部分 · 几何穷竭与古代极限先验切片",
    subtitle: "从古希腊几何公理到东方割圆术的极限潜势萌芽",
    eraRange: "公元前 5 世纪 — 公元 5 世纪 · 古希腊与古代中国",
    themeColor: "#8C6D46",
    summary: "在没有现代实数理论和极限符号的古代，数学家们凭借无与伦比的几何构造与双重反证法，将曲面、曲体面积与体积精确逼近，奠定了微积分的几何先验公理与逼近论基石。",
    historicalDrive: "天文观测、土地丈量、圆周率测算与球体/抛物线等非规则几何体的容积计算需求。",
    epistemologicalShift: "从静态有限离散的欧几里得几何，首次触及‘无限可分’与‘潜无穷’的几何逼近边界。",
    items: [
      {
        id: "eudoxus_exhaustion",
        title: "欧多克索斯穷竭原理与双重归谬法",
        historicalFigure: "欧多克索斯 (Eudoxus of Cnidus)",
        years: "前 408 — 前 355",
        coreConcept: "通过连续减半或多边形逼近，借助双重反证法严格证明曲边面积，避开直接谈论实无穷。",
        formalMath: "\\forall \\varepsilon > 0, \\; \\exists n \\in \\mathbb{N}, \\; |A - S_n| < \\varepsilon \\implies A = B",
        historicalContext: "芝诺悖论（阿喀琉斯追龟、飞矢不动）使古希腊学界对‘无穷’产生极大敬畏，欧多克索斯创立公理化穷竭法以规避无穷小带来的逻辑陷阱。",
        detailedDerivation: [
          "命题设定：圆面积与其直径的平方成正比，即 $A_1 / A_2 = d_1^2 / d_2^2$。",
          "第一重归谬：假设 $A_1 / A_2 > d_1^2 / d_2^2$，必存在一较小面积 $S < A_1$ 使得 $S / A_2 = d_1^2 / d_2^2$。",
          "向圆内接正 $2^n$ 边形，每次将剩余弓形面积减半以上。根据阿基米德公理，必存在某内接多边形 $P_n$ 使得 $S < P_n < A_1$。",
          "根据已证定理，内接多边形面积之比等于直径平方之比，导致 $P_n < S$，导出不可调和的矛盾。",
          "第二重归谬：同理假设 $A_1 / A_2 < d_1^2 / d_2^2$ 亦导出矛盾。由排中律，唯一可能即为精确相等！"
        ],
        philosophicalParadigm: "潜无穷观：无穷只是一个可无限进行的过程，而不是一个现成的数学实体；逻辑严密性高于计算便利性。",
        modernUniversityMapping: "大学高等数学：数列极限严格夹逼准则 (Squeeze Theorem)、实数阿基米德公理的前身。",
        classicQuote: "“对于任意给定的量，如果从中减去大于其一半的部分，再从余量中减去大于其一半的部分，如此继续，必能得到一个小于任何预先指定量的余量。”——《几何原本》第十卷命题1",
        keyInsights: [
          "首创了不用无穷小符号也能进行严格极限证明的范式",
          "为后世所有微积分逼近提供了双向夹逼的不等式框架"
        ]
      },
      {
        id: "archimedes_quadrature_mechanics",
        title: "阿基米德抛物线弓形求积与杠杆力学平衡法",
        historicalFigure: "阿基米德 (Archimedes of Syracuse)",
        years: "前 287 — 前 212",
        coreConcept: "将物理力矩平衡的直觉作为发现工具，再以等比级数细分与穷竭法作为几何绝对真理证明。",
        formalMath: "S_{\\text{parabola}} = T_0 \\sum_{k=0}^{\\infty} \\left(\\frac{1}{4}\\right)^k = T_0 \\cdot \\frac{1}{1 - 1/4} = \\frac{4}{3} T_0",
        historicalContext: "在《方法论》(The Method) 中，阿基米德揭示了他如何先将几何图形切成无数条极薄截面并在虚构天平上称重，从而先发现定理，再用几何语言封印。",
        detailedDerivation: [
          "在抛物线弓形内作底为弦、顶点为平行切线切点的主内接三角形 $T_0$。",
          "在剩余两个弓形中继续作内接三角形，几何证明新生成的两个三角形面积之和恰为 $T_0 / 4$。",
          "第 $k$ 步新填补的 $2^k$ 个微小三角形总面积为 $T_0 \\cdot (1/4)^k$。",
          "有限项累加：$S_n = T_0 \\left(1 + \\frac{1}{4} + \\frac{1}{16} + \\dots + \\frac{1}{4^n}\\right) = \\frac{4}{3} T_0 \\left(1 - \\frac{1}{4^{n+1}}\\right)$。",
          "结合穷竭法反证，严格得出抛物线弓形面积恒等于内接主三角形面积的 4/3 倍。"
        ],
        philosophicalParadigm: "力学与几何大统一：直觉发现（力学切片）与逻辑论证（几何穷竭）完美分离又相互印证。",
        modernUniversityMapping: "大学高等数学：定积分几何应用、数项级数求和、截面微元法。",
        classicQuote: "“某些事情首先是通过力学方法在我心中明朗起来的，虽然这种方法并未提供严格证明；但一旦获得先验知识，再寻找严格的几何证明就容易得多。”——阿基米德《方法论》致埃拉托斯特尼书",
        keyInsights: [
          "人类历史上第一个求得非圆曲边面积的精确常数级数",
          "将等比级数无穷求和与几何实体精确绑定"
        ]
      },
      {
        id: "liu_hui_zu_geng",
        title: "刘徽割圆术与祖暅不可分量体积原理",
        historicalFigure: "刘徽 & 祖冲之、祖暅父子",
        years: "公元 263 年 — 公元 5 世纪",
        coreConcept: "割之弥细，所失弥少；幂势既同，则积不容异（等高处平行截面面积相等，则二立体体积必相等）。",
        formalMath: "A_1(z) = A_2(z) \\; (\\forall z \\in [0, H]) \\implies V_1 = \\int_0^H A_1(z)dz = \\int_0^H A_2(z)dz = V_2",
        historicalContext: "刘徽注《九章算术》创立割圆术，祖暅利用‘牟合方盖’巧妙求出球体体积公式，比西方卡瓦列利原理早1100余年。",
        detailedDerivation: [
          "割圆术推演：从内接正六边形出发，边数倍增至 12、24、48、96、192 边形。",
          "差值极限思想：“割之弥细，所失弥少，割之又割，以至于不可割，则与圆周合体而无所失矣”。",
          "祖暅牟合方盖：取两底面互相垂直的正交等径圆柱，相交形成‘牟合方盖’。",
          "截面构造：高为 $h$ 处的水平截面为正方形，面积为 $a^2 = R^2 - h^2$。同时构造外切倒立四棱锥，其高 $h$ 截面面积亦为 $R^2 - h^2$。",
          "依据‘幂势既同，则积不容异’，牟合方盖体积为立方体减去两个倒锥，即 $V = 8R^3 - 8/3 R^3 = 16/3 R^3$；球体为牟合方盖内切，得出球体积 $V_{\\text{sphere}} = \\frac{4}{3} \\pi R^3$。"
        ],
        philosophicalParadigm: "东方构造演算法：以动驭静、以离散逼近连续，注重构造性算式与直观代数平衡。",
        modernUniversityMapping: "大学高等数学：平行截面面积求体积法、多重积分富比尼定理 (Fubini's Theorem) 的先驱雏形。",
        classicQuote: "“幂势既同，则积不容异。”——祖暅《缀术》",
        keyInsights: [
          "比西方早一个千年的截面积分原理",
          "通过巧妙辅助立体（牟合方盖与倒锥）消解复杂积分计算"
        ]
      }
    ]
  },
  {
    sectionNumber: 2,
    sectionId: "early_modern_infinitesimals",
    sectionTitle: "第二部分 · 17世纪代数化与微元萌芽切片",
    subtitle: "从开普勒立体测酒桶到费马伪等法与巴罗特征三角形",
    eraRange: "1600 — 1670 年 · 科学革命黎明期的欧洲",
    themeColor: "#5A6B48",
    summary: "解析几何的发明与经典力学的兴起，促使数学家们大胆突破古希腊公理禁忌，将几何体视为无数不可分量（线或面）的集合，创立了寻找切线与求积的先验代数算法。",
    historicalDrive: "航海透镜磨制、天体开普勒轨道计算、炮弹抛射弹道优化、木桶容积速测与力学瞬时速度分析。",
    epistemologicalShift: "从纯粹静态空间几何，转向引入运动、瞬时变化与具有代数特征的‘无穷小量’。",
    items: [
      {
        id: "kepler_barrel_integration",
        title: "开普勒酒桶体积与无限薄圆盘微元求和",
        historicalFigure: "约翰尼斯·开普勒 (Johannes Kepler)",
        years: "1571 — 1630",
        coreConcept: "将旋转曲面体大胆切分为无数个厚度无限薄的圆盘或细锥体，累加其体积以求整体。",
        formalMath: "V = \\lim_{\\Delta y \\to 0} \\sum \\pi [r(y)]^2 \\Delta y = \\int_{-H/2}^{H/2} \\pi [r(y)]^2 dy",
        historicalContext: "1613年奥地利林茨葡萄大丰收，酒商仅用一根木尺斜插桶底测量斜高便估算价格，开普勒深感不严密，遂写成《酒桶立体几何学》奠定微元求积雏形。",
        detailedDerivation: [
          "将实心圆视为无数个以圆心为顶点的无限薄细三角形组成的集合。",
          "圆面积：无数高为 $R$ 的细三角形底边之和为圆周长 $2\\pi R$，面积 $A = \\frac{1}{2} \\times (2\\pi R) \\times R = \\pi R^2$。",
          "将酒桶旋转体切成无限多个极薄的圆柱薄片，每个薄片体积 $dV = \\pi r(y)^2 dy$。",
          "开普勒在极值研究中观察到：“在极大值附近，函数的变化极为缓慢，几乎停滞”，为费马导数驻点论提供了直觉。"
        ],
        philosophicalParadigm: "实用主义微元论：打破欧氏公理禁区，承认由无数无限小部分构成连续整体的物理直觉。",
        modernUniversityMapping: "大学高等数学：定积分元素法（微元法）、旋转体体积圆盘法与薄壳法。",
        classicQuote: "“圆包含着无数个以圆心为顶点的三角形；阿基米德用双重反证法得出的结论，我们用不可分量可以在一行算式中直观理解。”——开普勒",
        keyInsights: [
          "首次将旋转体明确表述为连续切片积分",
          "敏锐洞察到极值点附近的局部一阶导数恒为零特征"
        ]
      },
      {
        id: "cavalieri_indivisibles",
        title: "卡瓦列利不可分量原理 (Indivisibles)",
        historicalFigure: "博纳文图拉·卡瓦列利 (Bonaventura Cavalieri)",
        years: "1598 — 1647",
        coreConcept: "线由无限个点组成，面由无限条平行线段组成，体由无限个平行平面组成（如同一本由无数纸页构成的书）。",
        formalMath: "\\text{Area}(S_1) : \\text{Area}(S_2) = \\sum l_1(y) : \\sum l_2(y)",
        historicalContext: "作为伽利略的学生，卡瓦列利于1635年发表《连续不可分量几何学》，试图建立一套独立于阿基米德穷竭法的全新算术化面积推导体系。",
        detailedDerivation: [
          "假设平面图形被一组等距平行线簇所截，每条割线交出的线段长度为 $l(y)$。",
          "若两图形在所有对应高度处的截线长度之比恒为常数 $k$，则两图形总面积之比必然严格为 $k$。",
          "高维推广：若两个立体在任意平行平面的截面面积比恒为常数，则两立体体积比亦为该常数。",
          "求幂和积分公式：通过不可分量计算 $\\int_0^a x^n dx = \\frac{a^{n+1}}{n+1}$，推导了 $n=1$ 到 $n=9$ 的高阶幂积分！"
        ],
        philosophicalParadigm: "连续统构成论：将连续几何连续统离散化为高阶维度的元素堆叠，开辟积分代数化大门。",
        modernUniversityMapping: "大学高等数学：平行截面体积积分、二重积分与三重积分的累次积分转化法。",
        classicQuote: "“平面图形就像一匹布，不可分量就是织成这匹布的无数根经线。”——卡瓦列利",
        keyInsights: [
          "系统化推导了单项式函数 $x^n$ 的定积分通式",
          "成为牛顿和莱布尼茨前最重要的积分学先驱成果"
        ]
      },
      {
        id: "fermat_adequality_derivatives",
        title: "费马伪等法 (Adequality) 与极值导数切线通法",
        historicalFigure: "皮埃尔·德·费马 (Pierre de Fermat)",
        years: "1607 — 1665",
        coreConcept: "引入微扰量 $e$，建立近似伪等式 $f(x+e) \\approx f(x)$，消去公因子后令 $e=0$，求得极值临界点与切线斜率。",
        formalMath: "\\lim_{e \\to 0} \\frac{f(x+e) - f(x)}{e} = 0 \\implies f'(x) = 0 \\quad (\\text{极值驻点判据})",
        historicalContext: "费马在1636年左右的论文《求极大值与极小值的方法》中，发明了本质上等同于现代导数差商极限的代数运算，拉格朗日甚至称费马为微积分的真正发明人。",
        detailedDerivation: [
          "问题：将线段 $B$ 分成两段 $x$ 与 $B-x$，使其围成矩形面积 $A(x) = x(B-x)$ 最大。",
          "第一步（微扰）：赋予 $x$ 微小扰动 $e$，计算新面积 $A(x+e) = (x+e)(B - x - e) = Bx - x^2 + Be - 2xe - e^2$。",
          "第二步（伪等）：设 $A(x+e) \\approx A(x)$，即 $Bx - x^2 + Be - 2xe - e^2 \\approx Bx - x^2$。",
          "第三步（消项）：两边消去 $Bx - x^2$，得 $Be - 2xe - e^2 \\approx 0$。",
          "第四步（除以 $e$）：由于 $e \\neq 0$，两边同除以 $e$，得 $B - 2x - e \\approx 0$。",
          "第五步（隐匿 $e$）：令 $e = 0$，得到精确方程 $B - 2x = 0 \\implies x^* = B / 2$！"
        ],
        philosophicalParadigm: "微分代数化萌芽：巧妙地让微扰量 $e$ 在除法中非零，在最后代入时取零，开启了‘幽灵量’的两重性。",
        modernUniversityMapping: "大学高等数学：费马引理 (Fermat's Theorem)、导数差商定义、临界点求极值通法。",
        classicQuote: "“我们很难想象有比这更一般、更优美的方法来求一切曲线的切线和极大极小值了。”——费马致罗贝瓦尔信",
        keyInsights: [
          "在没有极限理论的情况下完美实现了求导计算",
          "将几何切线斜率与极值问题彻底统一为代数差商运算"
        ]
      },
      {
        id: "barrow_characteristic_triangle_ftc",
        title: "巴罗微分特征三角形与微积分互逆几何证明",
        historicalFigure: "伊萨克·巴罗 (Isaac Barrow)",
        years: "1630 — 1677",
        coreConcept: "在曲线切线上构造特征直角三角形 $(dx, dy, ds)$，几何论证面积累积的导数等于曲线上点的纵坐标。",
        formalMath: "\\frac{d}{dx} \\left( \\int_a^x f(t) dt \\right) = f(x) \\iff \\text{切线变化率与求积面积互为逆运算}",
        historicalContext: "巴罗在剑桥大学担任首任卢卡斯数学教授（后主动让位给弟子牛顿），他在1670年《几何学讲义》中给出了微积分基本定理的第一个纯几何证明。",
        detailedDerivation: [
          "取曲线 $y = f(x)$ 下从 $a$ 到 $x$ 的面积函数 $A(x) = \\int_a^x f(t)dt$。",
          "给自变量 $x$ 增加微小增量 $\\Delta x$，面积相应增加一狭长曲边梯形 $\\Delta A$。",
          "曲边梯形面积夹在两矩形之间：$f(x) \\cdot \\Delta x \\le \\Delta A \\le f(x+\\Delta x) \\cdot \\Delta x$。",
          "两边同除以 $\\Delta x$：$f(x) \\le \\frac{\\Delta A}{\\Delta x} \\le f(x+\\Delta x)$。",
          "当 $\\Delta x \\to 0$ 时，两端夹逼逼近 $f(x)$，得出面积函数的变化率（导数）恰好等于原曲线的高度 $f(x)$！"
        ],
        philosophicalParadigm: "几何综合的顶峰：用欧几里得传统几何方法证明了微积分的核心互逆定理，但繁琐的几何图阻碍了算术普及。",
        modernUniversityMapping: "大学高等数学：微积分第一基本定理、变上限积分函数求导定理、原函数存在性定理。",
        classicQuote: "“求面积与作切线，乃是同一事物从正反两个维度的几何投射。”——巴罗《几何学讲义》",
        keyInsights: [
          "牛顿微积分思想的直接启蒙导师",
          "历史上首次确立了微分与积分是互逆运算的核心定理"
        ]
      }
    ]
  },
  {
    sectionNumber: 3,
    sectionId: "newton_leibniz_revolution",
    sectionTitle: "第三部分 · 牛顿-莱布尼茨范式革命与符号统一切片",
    subtitle: "从流数动力学到微积分通用算子与大一统公式",
    eraRange: "1665 — 1730 年 · 英国与欧洲大陆",
    themeColor: "#4A5D6E",
    summary: "牛顿从经典动力学与时间流动出发发明流数术，莱布尼茨从哲学和谐与符号代数算子出发发明微分积分体系。两人独立创立微积分，将零散的求切线与求积技巧升华为普遍适用的通用演算科学。",
    historicalDrive: "天体力学行星轨道精确求解、万有引力引力场积分、弹性力学、摆钟等时曲线与通用微分方程求解。",
    epistemologicalShift: "从具体几何图形的个例推导，彻底升华为普遍适用的符号代数运算法则与微积分基本定理。",
    items: [
      {
        id: "newton_fluxions_mechanics",
        title: "牛顿流数术、流动量与万有引力几何反演",
        historicalFigure: "艾萨克·牛顿爵士 (Sir Isaac Newton)",
        years: "1643 — 1727",
        coreConcept: "将几何量视作时间连续流动的‘流动量’ (Fluents)，其变化速度称为‘流数’ (Fluxions)；瞬量 $o$ 代表极小时间间隔。",
        formalMath: "\\dot{y} / \\dot{x} = \\lim_{o \\to 0} \\frac{(y + o\\dot{y}) - y}{(x + o\\dot{x}) - x}, \\quad (x + o\\dot{x})^n = x^n + n x^{n-1} o \\dot{x} + O(o^2)",
        historicalContext: "1665-1666年因伦敦大鼠疫，牛顿回伍尔索普庄园避静，在22岁那年接连发明广义二项式定理、流数术、万有引力定律与光学色散，迎来奇迹年。",
        detailedDerivation: [
          "设连续运动变量 $x, y$ 随时间 $t$ 流动，速度分别为 $\\dot{x}, \\dot{y}$。",
          "在无限小时间 $o$ 内，$x$ 增加到 $x + o\\dot{x}$，$y$ 增加到 $y + o\\dot{y}$。",
          "对于代数曲线方程 $x^n - y = 0$，代入流动后的增量：$(x + o\\dot{x})^n - (y + o\\dot{y}) = 0$。",
          "利用二项式定理展开：$x^n + n x^{n-1} o\\dot{x} + \\frac{n(n-1)}{2} x^{n-2} o^2 \\dot{x}^2 + \\dots - y - o\\dot{y} = 0$。",
          "利用原方程 $x^n - y = 0$ 抵消常数项，两端同除以 $o$ 后忽略含 $o$ 的高阶项，得出 $\\dot{y} = n x^{n-1} \\dot{x}$，即 $\\frac{\\dot{y}}{\\dot{x}} = n x^{n-1}$！"
        ],
        philosophicalParadigm: "经典机械动力学时空观：连续运动是宇宙的本质，微积分是描绘质点轨迹与天体引力的天然数学工具。",
        modernUniversityMapping: "大学高等数学与理论力学：导数的物理意义（瞬时速度/加速度）、参数方程求导法、一阶常微分方程。",
        classicQuote: "“我并不把数学量看成是由非常小的部分组成的，而是看成是由连续的运动所生成的。”——牛顿《流数术与无穷级数》(1671)",
        keyInsights: [
          "创立了求瞬时变化率与反求轨迹的流数双向法则",
          "将微积分与经典力学彻底融合，解释了开普勒行星运动三大定律"
        ]
      },
      {
        id: "newton_generalized_binomial_expansion",
        title: "牛顿广义二项式展开与反演求积代数引擎",
        historicalFigure: "艾萨克·牛顿爵士 (Sir Isaac Newton)",
        years: "1665 年",
        coreConcept: "将古典整数二项式定理推广至任意实数（包括分数、负数）指数，将复杂根式与反三角函数展开为无穷幂级数进行逐项积分。",
        formalMath: "(1 + x)^\\alpha = 1 + \\alpha x + \\frac{\\alpha(\\alpha-1)}{2!} x^2 + \\frac{\\alpha(\\alpha-1)(\\alpha-2)}{3!} x^3 + \\dots = \\sum_{k=0}^\\infty \\binom{\\alpha}{k} x^k",
        historicalContext: "当时无法直接对 $\\sqrt{1-x^2}$ 进行初等积分，牛顿通过二项式展开将其转化为无穷多项式，使一切代数曲线的求长、求积迎刃而解。",
        detailedDerivation: [
          "观察杨辉/帕斯卡三角的整系数插值规律，提出分数阶组合系数公式 $\\binom{\\alpha}{k} = \\frac{\\alpha(\\alpha-1)\\dots(\\alpha-k+1)}{k!}$。",
          "以计算圆周率 $\\pi$ 为例：求圆方程 $y = \\sqrt{x - x^2} = x^{1/2} (1 - x)^{1/2}$ 的定积分。",
          "利用广义二项式展开：$(1-x)^{1/2} = 1 - \\frac{1}{2}x - \\frac{1}{8}x^2 - \\frac{1}{16}x^3 - \\dots$。",
          "乘以 $x^{1/2}$ 得到多项式级数，逐项应用单项式求积公式 $\\int x^p dx = \\frac{x^{p+1}}{p+1}$。",
          "牛顿仅用十几项求和便手工算出了圆周率 $\\pi$ 精度达小数点后16位！"
        ],
        philosophicalParadigm: "无穷级数即广义多项式：视无穷级数为代数运算的直接延拓，化非线性为局部线性叠加。",
        modernUniversityMapping: "大学高等数学：泰勒级数 (Taylor Series)、麦克劳林展开式、幂级数逐项求导与积分定理。",
        classicQuote: "“我很惭愧地承认，我曾经计算了多少位圆周率，当时我手头没有别的事可做。”——牛顿致奥登伯格信",
        keyInsights: [
          "微积分发展史上最强大的代数解析求积工具之一",
          "打破了初等几何无法对复杂根式求积的千年瓶颈"
        ]
      },
      {
        id: "leibniz_differentials_notation",
        title: "莱布尼茨符号体系、微分算子 $dx, dy$ 与积分号 $\\int$",
        historicalFigure: "戈特弗里德·莱布尼茨 (G. W. Leibniz)",
        years: "1646 — 1716",
        coreConcept: "创制 $dx$（差分 difference）与 $\\int$（求和 summa 拉长之 S），建立乘积法则 $d(uv) = udv + vdu$ 与形式代数算子体系。",
        formalMath: "d(uv) = u\\,dv + v\\,du, \\quad d\\left(\\frac{u}{v}\\right) = \\frac{v\\,du - u\\,dv}{v^2}, \\quad \\int y\\,dx = \\text{所有微元矩形面积之和}",
        historicalContext: "莱布尼茨于1684年在《教师学报》发表人类历史上第一篇正式印刷的微积分论文《一种求极大值、极小值与切线的新方法》，其优美记号体系沿用至今。",
        detailedDerivation: [
          "将自变量数列 $x_1, x_2, \\dots$ 的相邻微差记为 $dx$，因变量微差记为 $dy$。",
          "微商 $\\frac{dy}{dx}$ 即为切线斜率，体现了两个无穷小量的真实比值。",
          "推导乘积法则：$d(uv) = (u + du)(v + dv) - uv = u\\,dv + v\\,du + du\\,dv$。",
          "忽略二阶无穷小量 $du\\,dv$，得到永恒经典的乘积微分律：$d(uv) = u\\,dv + v\\,du$。",
          "两边积分并移项，直接诞生定积分分部积分法：$\\int u\\,dv = uv - \\int v\\,du$！"
        ],
        philosophicalParadigm: "符号主义哲学：只要发明了恰当且符合思维规律的符号，推理与计算便可化为不假思索的代数流转（算子自动化）。",
        modernUniversityMapping: "大学高等数学：全微分形式不变性、微分运算法则、复合函数链式法则、定积分换元法与分部积分法。",
        classicQuote: "“好的符号可以大大减轻思维的负担，使头脑得以专注于更高层次的问题。”——莱布尼茨",
        keyInsights: [
          "现代所有微积分教科书所使用的 $dx, dy, \\int$ 记号标准制定者",
          "赋予微积分无与伦比的代数自动化推导威力，催生了伯努利家族与欧拉的辉煌"
        ]
      },
      {
        id: "newton_leibniz_fundamental_theorem",
        title: "微积分基本定理 (Newton-Leibniz Formula) 的大一统",
        historicalFigure: "艾萨克·牛顿 & 戈特弗里德·莱布尼茨",
        years: "1670s — 1684 年",
        coreConcept: "将自古希腊以来割裂的一对对偶问题（求切线速度的微分与求面积体积的积分）彻底统一为一对互逆运算。",
        formalMath: "\\int_a^b f(x) dx = F(b) - F(a), \\quad \\text{其中 } F'(x) = f(x)",
        historicalContext: "在微积分基本定理诞生前，求切线需要一套复杂的几何作图法，求面积又需要一套完全不同的穷竭切片法；基本定理的发现将求积分化为简单的求导数反运算（原函数）。",
        detailedDerivation: [
          "定义变上限积分函数（累积面积函数）：$\\Phi(x) = \\int_a^x f(t) dt$。",
          "计算 $\\Phi(x)$ 在点 $x$ 处的导数：$\\Phi'(x) = \\lim_{\\Delta x \\to 0} \\frac{\\Phi(x+\\Delta x) - \\Phi(x)}{\\Delta x} = \\lim_{\\Delta x \\to 0} \\frac{1}{\\Delta x} \\int_x^{x+\\Delta x} f(t)dt$。",
          "利用积分中值定理：存在 $\\xi \\in [x, x+\\Delta x]$ 使得 $\\int_x^{x+\\Delta x} f(t)dt = f(\\xi) \\Delta x$。",
          "代入得 $\\Phi'(x) = \\lim_{\\Delta x \\to 0} f(\\xi) = f(x)$，证明 $\\Phi(x)$ 是 $f(x)$ 的一个原函数！",
          "若 $F(x)$ 是 $f(x)$ 的任意已知原函数，则必有 $\\Phi(x) = F(x) + C$。代入 $x=a$ 得 $C = -F(a)$；代入 $x=b$ 即得大一统公式：$\\int_a^b f(x) dx = F(b) - F(a)$！"
        ],
        philosophicalParadigm: "对偶性与守恒律：局部变化率（微分）的宏观连续累加（积分），恰好等于两端边界状态的差值。",
        modernUniversityMapping: "大学高等数学：牛顿-莱布尼茨公式、微积分第一与第二基本定理、原函数与不定积分求法。",
        classicQuote: "“这是人类智力史上最重大的综合之一，它将几何、代数、物理变化率融为一体。”",
        keyInsights: [
          "微积分皇冠上的明珠，彻底终结了繁琐的几何穷竭割补历史",
          "使得计算复杂定积分变成了机械查找导数反运算的简便流程"
        ]
      }
    ]
  },
  {
    sectionNumber: 4,
    sectionId: "second_crisis_rigor",
    sectionTitle: "第四部分 · 第二次数学危机与极限严格化重构切片",
    subtitle: "从贝克莱幽灵量悖论到柯西-魏尔斯特拉斯 (ε, δ) 算术化大厦",
    eraRange: "1734 — 1900 年 · 英国、法国与德国",
    themeColor: "#6B5A48",
    summary: "由于初期微积分对‘无穷小’定义模糊，引发了以贝克莱主教为代表的逻辑猛烈批判。历经达朗贝尔、拉格朗日、柯西、魏尔斯特拉斯与戴德金近一个半世纪的接力奋斗，数学界彻底驱逐了直观与幽灵量，建立了基于纯粹实数完备性与量词逻辑的绝对严密分析学大厦。",
    historicalDrive: "傅里叶级数收敛性争论、病态连续不可导函数的发现、微分方程解的存在唯一性要求与纯数学自洽性危机。",
    epistemologicalShift: "从依赖几何直觉与运动学时间隐喻，彻底转变为纯静态不等式控制与量词命题逻辑（分析学的算术化）。",
    items: [
      {
        id: "berkeley_ghost_quantities_crisis",
        title: "贝克莱主教之矛：“逝去量的幽灵”与第二次数学危机",
        historicalFigure: "乔治·贝克莱主教 (Bishop George Berkeley)",
        years: "1685 — 1753",
        coreConcept: "直指微积分初期的核心逻辑悖论：无穷小量 $dx$ 在计算差商时假设 $dx \\neq 0$，而在得出最终结果时又令 $dx = 0$，犯下了逻辑学‘偷换假设’的致命错误。",
        formalMath: "\\text{悖论：} \\frac{(x+dx)^2 - x^2}{dx} = 2x + dx \\xrightarrow{\\text{令 } dx=0} 2x \\quad (dx \\text{ 既是非零又是零})",
        historicalContext: "1734年贝克莱出版《分析学者》(The Analyst)，副标题为‘致一位不信教的数学家（哈雷）’，旨在证明微积分学家的信仰并不比神学家的信仰更具理性逻辑基础。",
        detailedDerivation: [
          "审视牛顿与莱布尼茨求导计算：求 $y = x^2$ 的切线变化率。",
          "第一步：设 $x$ 增加增量 $\\Delta x$，计算 $\\Delta y = (x+\\Delta x)^2 - x^2 = 2x\\Delta x + (\\Delta x)^2$。",
          "第二步：为了求比值，两边同除以 $\\Delta x$。根据代数公理，除数必须满足 $\\Delta x \\neq 0$！",
          "第三步：得出表达式 $2x + \\Delta x$ 后，数学家却轻率地说‘因为 $\\Delta x$ 是无穷小，所以可以把它抹去等于零’，得到 $2x$。",
          "贝克莱质问：“如果 $\\Delta x = 0$，则第二步除以零是非法未定义的；如果 $\\Delta x \\neq 0$，则第三步丢弃 $\\Delta x$ 是不成立的！它们到底是什么？难道是逝去量的幽灵吗？！”"
        ],
        philosophicalParadigm: "形式逻辑严密性审判：即使微积分能够得出惊人正确的物理预测，若其逻辑基石自相矛盾，亦不能称为严谨科学。",
        modernUniversityMapping: "大学高等数学：极限定义的必要性引入、无穷小量不是固定数值而是以零为极限的变量概念。",
        classicQuote: "“它们既不是有限量，也不是无限小量，又不是虚无。难道我们不能称它们为‘逝去量的幽灵’吗？”——贝克莱《分析学者》(1734)",
        keyInsights: [
          "微积分史上最深刻、最致命的逻辑诘难",
          "直接催生了后世一个世纪的数学分析严格化运动"
        ]
      },
      {
        id: "cauchy_limit_revolution",
        title: "柯西极限论革命：用极限数列与不等式封印幽灵",
        historicalFigure: "奥古斯丁·柯西 (Augustin-Louis Cauchy)",
        years: "1789 — 1857",
        coreConcept: "彻底废弃神秘的无穷小实体，将导数定义为差商数列的‘极限值’；定义定积分为和式的极限，将微积分建立在极限算术之上。",
        formalMath: "f'(x_0) = \\lim_{\\Delta x \\to 0} \\frac{f(x_0 + \\Delta x) - f(x_0)}{\\Delta x}, \\quad \\int_a^b f(x) dx = \\lim_{\\max \\Delta x_i \\to 0} \\sum_{i=1}^n f(\\xi_i) \\Delta x_i",
        historicalContext: "1821年柯西在巴黎综合理工学院出版《代数分析教程》，首次给出了极限、连续函数与收敛级数的近代严格数学定义。",
        detailedDerivation: [
          "极限的柯西表述：当同一个变量逐次赋予的值无限趋近于某个固定值，最终与后者的差可以随意之小，该固定值即称为极限。",
          "破解贝克莱悖论：在极限过程 $\\Delta x \\to 0$ 中，$\\Delta x$ 在逼近全过程中**始终严格不等于 0**，因此除以 $\\Delta x$ 完全合法；而最终的导数值是差商的目标极限，并非简单令 $\\Delta x=0$！",
          "连续性定义：若当 $\\Delta x$ 趋于 0 时，函数增量 $f(x+\\Delta x) - f(x)$ 也趋于 0，则称函数 $f$ 在 $x$ 处连续。",
          "建立柯西收敛准则：一个数列收敛的充要条件是其任意两项差在序号充分大时可任意小，无需预先知道极限值即可判定收敛性！"
        ],
        philosophicalParadigm: "极限过程替代实体无穷小：无穷小不再是一个固定的非零微粒，而是一个以零为极限的动态变量。",
        modernUniversityMapping: "大学高等数学：导数极限定义、连续函数介值定理与零点定理、柯西中值定理、柯西审敛原理。",
        classicQuote: "“当我们说一个量是无穷小时，我们的意思仅仅是它的极限是零。”——柯西《代数分析教程》(1821)",
        keyInsights: [
          "人类历史上第一次用纯粹代数极限代替了几何直观",
          "奠定了现代大学微积分教学的核心框架体系"
        ]
      },
      {
        id: "weierstrass_epsilon_delta_quantifiers",
        title: "魏尔斯特拉斯 $(\\varepsilon, \\delta)$ 语言与分析算术化顶峰",
        historicalFigure: "卡尔·魏尔斯特拉斯 (Karl Weierstrass)",
        years: "1815 — 1897",
        coreConcept: "使用纯粹一阶逻辑量词 $\\forall \\varepsilon > 0, \\exists \\delta > 0$ 彻底驱逐‘无限接近’等运动学时间隐喻，完成极限的完全静态化与算术化。",
        formalMath: "\\lim_{x \\to x_0} f(x) = L \\iff \\forall \\varepsilon > 0, \\; \\exists \\delta > 0, \\; 0 < |x - x_0| < \\delta \\implies |f(x) - L| < \\varepsilon",
        historicalContext: "柯西的语言仍残留‘无限趋近’等运动学字眼，导致他在一致收敛等精细问题上犯过错误。魏尔斯特拉斯在柏林大学讲学期间，创立了绝对无歧义的 $(\\varepsilon, \\delta)$ 静态量词体系。",
        detailedDerivation: [
          "静态量词转换：“无论你给出多么苛刻的误差容限 $\\varepsilon > 0$（挑战者）”，",
          "“我总能找到一个邻域控制半径 $\\delta > 0$（应答者）”，",
          "“只要自变量 $x$ 满足 $0 < |x - x_0| < \\delta$（距离 $x_0$ 足够近且不重合）”，",
          "“函数值 $f(x)$ 与目标值 $L$ 的误差就严格受控于 $|f(x) - L| < \\varepsilon$”。",
          "构造病态反例：构造出著名的魏尔斯特拉斯函数 $f(x) = \\sum_{n=0}^{\\infty} a^n \\cos(b^n \\pi x)$，证明其**处处连续却处处不可导**，彻底粉碎了几何画图‘连续必平滑可导’的直觉幻觉！"
        ],
        philosophicalParadigm: "分析算术化：几何直观不可靠，数学分析必须建立在纯粹实数算术不等式与一阶逻辑量词之上。",
        modernUniversityMapping: "数学专业数学分析：$(\\varepsilon, \\delta)$ 极限证明、一致收敛理论、阿策拉-阿斯考利定理。",
        classicQuote: "“微积分中不需要任何运动学概念，也没有几何图形的立足之地，有的只是实数和不等式。”——魏尔斯特拉斯",
        keyInsights: [
          "现代纯数学分析的最高标准范式",
          "彻底消除了微积分创立两百年来的所有概念歧义与逻辑漏洞"
        ]
      },
      {
        id: "dedekind_real_number_completeness",
        title: "戴德金分割与实数连续统完备性底座",
        historicalFigure: "理查德·戴德金 (Richard Dedekind)",
        years: "1831 — 1916",
        coreConcept: "通过有理数集切分（戴德金分割），在纯逻辑上无漏洞地严格构造出整个实数系 $\\mathbb{R}$，为极限存在性提供终极公理底座。",
        formalMath: "\\mathbb{Q} = A \\cup B, \\quad \\forall a \\in A, b \\in B \\implies a < b \\implies \\exists ! \\; \\alpha \\in \\mathbb{R} \\; (\\text{分割点})",
        historicalContext: "魏尔斯特拉斯的极限证明依赖于极限值 $L$ 在数轴上真实存在。但有理数轴充满空隙（如 $\\sqrt{2}$ 不是有理数），若没有完备实数系，极限就可能‘掉进虚无’，实数理论必须公理化。",
        detailedDerivation: [
          "将所有有理数划分为不相交的两个非空子集 $A$ 与 $B$，使 $A$ 中的每个数均小于 $B$ 中的每个数，称对 $(A, B)$ 为一个戴德金分割。",
          "第一种情况：$A$ 中有最大值或 $B$ 中有最小值，对应一个有理数。",
          "第二种情况：$A$ 中无最大值且 $B$ 中无最小值（如 $A = \\{x \\in \\mathbb{Q} \\mid x \\le 0 \\text{ 或 } x^2 < 2\\}$），这就精确定义了一个**无理数**（如 $\\sqrt{2}$）！",
          "实数完备性六大等价定理：确界原理 $\\iff$ 单调有界收敛准则 $\\iff$ 区间套定理 $\\iff$ 柯西收敛准则 $\\iff$ 有限覆盖定理 $\\iff$ 聚点原理。",
          "自此，微积分大厦从地基（戴德金实数）到梁柱（$\\varepsilon-\\delta$ 极限）再到穹顶（微分与积分）全部完工，无懈可击！"
        ],
        philosophicalParadigm: "结构主义公理化：数学对象不由其物理意义定义，而由其满足的关系公理系统与集合论构造完全确定。",
        modernUniversityMapping: "数学分析：实数连续性公理、上确界与下确界、博雷尔有限覆盖定理、海涅-博雷尔定理。",
        classicQuote: "“数是人类心灵自由创造的产物。”——戴德金《连续性与无理数》(1872)",
        keyInsights: [
          "为微积分提供了最底层、最坚固的实数连续统地基",
          "使得连续、极限与收敛性获得了完全自洽的集合论诠释"
        ]
      }
    ]
  },
  {
    sectionNumber: 5,
    sectionId: "modern_university_frontiers",
    sectionTitle: "第五部分 · 现代大学高等数学全景与跨学科前沿切片",
    subtitle: "从高数核心知识树到微分形式大一统与人工智能梯度引擎",
    eraRange: "20 世纪 — 21 世纪 · 现代大学课程与当代科技前沿",
    themeColor: "#425C3C",
    summary: "历经演化的微积分已成为现代自然科学、工程技术与人工智能的通用底座语言。本切片梳理大学高等数学的认知进阶阶梯，展示从多元微积分到流形微分形式的终极升华，并透视微积分在深度学习与物理宇宙中的核心驱动力。",
    historicalDrive: "现代工业计算、量子力学、广义相对论时空几何、流体力学 Navier-Stokes 方程与深度学习亿级参数反向传播优化。",
    epistemologicalShift: "从单一标量分析，跃迁至多维向量场、微分流形外微分形式与高维张量微分自动计算。",
    items: [
      {
        id: "university_math_curriculum_tree",
        title: "大学高等数学五大阶梯架构与认知思维进阶",
        historicalFigure: "大学高等数学与数学分析教学体系",
        years: "当代大学核心基础课程",
        coreConcept: "极限论（地基） $\\to$ 一元微积分（骨架） $\\to$ 多元微积分与场论（空间） $\\to$ 常微分方程（动力学） $\\to$ 无穷级数（函数逼近）。",
        formalMath: "\\text{地基: } \\lim \\to \\text{算子: } \\frac{d}{dx}, \\int \\to \\text{场论: } \\nabla, \\iint, \\iiint \\to \\text{动力: } F(x, y, y')=0 \\to \\text{逼近: } \\sum a_n x^n",
        historicalContext: "大一高等数学是所有理工科与经济学学生的共同基础，理解各章节背后的历史动因能彻底消除‘只记题型不识本源’的死记硬背困境。",
        detailedDerivation: [
          "第一阶梯【极限与连续】：掌握 $(\\varepsilon, \\delta)$ 与 $(\\varepsilon, N)$ 语言，理解导数存在的根本前提是局部线性可逼近。",
          "第二阶梯【一元微分与积分】：微分用于寻找局部最优（梯度与极值），积分用于宏观累积守恒，微积分基本定理架起双向立交桥。",
          "第三阶梯【多元微积分与场论】：偏导数、梯度矢量 $\\nabla f$、全微分 $dz = f_x dx + f_y dy$、重积分、曲线积分与曲面积分。",
          "第四阶梯【经典三大场论公式】：格林公式（平面）、高斯散度公式（通量与体积分）、斯托克斯公式（环量与旋度），揭示边界与内部的积分守恒对偶。",
          "第五阶梯【无穷级数与傅里叶分析】：将任意复杂的时空信号拆解为简单的基函数（幂函数多项式或正余弦三角波）线性叠加。"
        ],
        philosophicalParadigm: "局部线性化与全局积分拓扑：将复杂的非线性现实世界在极小邻域内线性化（微分），再通过空间拓扑累加还原全局（积分）。",
        modernUniversityMapping: "理工科大学高等数学 (Calculus I, II, III)、数学专业数学分析、高等代数与几何。",
        classicQuote: "“微积分是人类最强大的智力武器：它教会我们如何把复杂问题切碎成无数简单微元，再以优雅的方式无缝拼接起来。”",
        keyInsights: [
          "构建大学高等数学知识点之间的全景逻辑血缘关系网",
          "从根本上理顺考点公式背后的物理直觉与几何意义"
        ]
      },
      {
        id: "generalized_stokes_differential_forms",
        title: "广义斯托克斯定理与外微分形式的大一统终极升华",
        historicalFigure: "亨利·庞加莱 (Henri Poincaré) & 埃利·嘉当 (Élie Cartan)",
        years: "1890s — 1945 年",
        coreConcept: "用一条仅仅数个字符的外微分形式公式，将微积分基本定理、格林公式、高斯散度定理、斯托克斯旋度定理完全统合！",
        formalMath: "\\int_{\\partial \\Omega} \\omega = \\int_{\\Omega} d\\omega",
        historicalContext: "在19世纪末，流体力学与麦克斯韦电磁学充斥着数十个繁杂的散度、旋度与分量积分公式；嘉当创立外微分形式后，所有这些公式全部化为同一几何真理的特例。",
        detailedDerivation: [
          "符号含义：$\\Omega$ 为 $k$ 维紧致可定向流形，$\\partial \\Omega$ 为其 $(k-1)$ 维边界，$\\omega$ 为 $(k-1)$ 次微分形式，$d\\omega$ 为其外微分形式。",
          "特例 1（一维区间，微积分基本定理）：$\\Omega = [a, b]$，边界 $\\partial \\Omega = \\{b\\} - \\{a\\}$，$\\omega = F(x)$，$d\\omega = F'(x)dx$，公式即为 $\\int_a^b F'(x)dx = F(b) - F(a)$！",
          "特例 2（二维平面区域，格林公式）：$\\Omega \\subset \\mathbb{R}^2$，$\\omega = P dx + Q dy$，$d\\omega = \\left(\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right) dx \\wedge dy$，公式即为格林公式！",
          "特例 3（三维立体空间，高斯散度公式）：$\\Omega \\subset \\mathbb{R}^3$，$\\omega$ 为通量 2-形式，$d\\omega = (\\nabla \\cdot \\mathbf{F}) dV$，公式即为高斯定理！",
          "特例 4（空间曲面，斯托克斯旋度定理）：$\\Omega$ 为空间曲面，$\\omega$ 为线积分 1-形式，$d\\omega = (\\nabla \\times \\mathbf{F}) \\cdot d\\mathbf{S}$，公式即为经典斯托克斯公式！"
        ],
        philosophicalParadigm: "终极对称性与拓扑守恒：无论维度多高，‘在边界上的累加’永远精确等于‘在内部其导数微元的累加’！",
        modernUniversityMapping: "现代大学高年级与研究生：微分流形、代数拓扑、理论物理广义相对论时空几何。",
        classicQuote: "“数学的优美在于：随着维度的提升，真理并没有变得更加凌乱，反而凝聚为一幅更纯粹、更震撼的统一画卷。”",
        keyInsights: [
          "现代数学最著名的黄金定理之一",
          "深刻揭示了电磁学麦克斯韦方程组与现代规范场论的时空几何实质"
        ]
      },
      {
        id: "ai_backprop_calculus_engine",
        title: "人工智能深度学习的微积分引擎：自动微分与反向传播 (Backpropagation)",
        historicalFigure: "当代人工智能先驱 (Hinton, LeCun 等)",
        years: "1986 年 — 至今",
        coreConcept: "现代大语言模型（如 Gemini、DeepSeek）与神经网络的万亿参数训练，本质上是莱布尼茨复合函数链式法则在超高维损失函数上的连续梯度下降。",
        formalMath: "\\mathbf{w}_{t+1} = \\mathbf{w}_t - \\eta \\nabla_{\\mathbf{w}} \\mathcal{L}(\\mathbf{w}), \\quad \\frac{\\partial \\mathcal{L}}{\\partial w_{ij}^{(l)}} = \\frac{\\partial \\mathcal{L}}{\\partial z_j^{(l)}} \\cdot \\frac{\\partial z_j^{(l)}}{\\partial w_{ij}^{(l)}} = \\delta_j^{(l)} a_i^{(l-1)}",
        historicalContext: "大模型展现出的惊人推理与创造能力，其底层的数学引擎正是300多年前发明的偏导数、梯度算子与链式法则的高效并行化执行。",
        detailedDerivation: [
          "神经网络前向传播：输入 $\\mathbf{x}$ 经过千百层矩阵乘法与非线性激活函数映射为预测输出 $\\hat{\\mathbf{y}}$。",
          "损失函数评估：计算预测值与真实目标之间的误差 $\\mathcal{L}(\\mathbf{w}) = \\frac{1}{2} \\|\\hat{\\mathbf{y}} - \\mathbf{y}\\|^2$。",
          "反向传播算法：根据莱布尼茨链式法则 (Chain Rule)，从最终损失层开始，逐层向后反向传递误差偏导数 $\\frac{\\partial \\mathcal{L}}{\\partial \\mathbf{z}}$。",
          "参数更新（梯度下降）：利用费马驻点极小化思想，沿着负梯度方向更新权重 $\\Delta \\mathbf{w} = -\\eta \\nabla \\mathcal{L}$，使整个网络的损失逐步逼近局部极小值。",
          "自动微分系统（如 PyTorch、TensorFlow计算图）：通过将复杂算子分解为基本初等运算的有向无环图，实现了任意复杂神经网络的瞬时精确求导！"
        ],
        philosophicalParadigm: "古老数学赋能现代智能：人类三百年前探索星体轨道的微积分几何思想，化作了驱动人类下一代通用人工智能 (AGI) 进化的最核心燃料。",
        modernUniversityMapping: "现代计算机科学与人工智能：机器学习导论、深度学习数学基础、凸优化理论与高维统计学。",
        classicQuote: "“每一个大模型权重的调整，都在无声地践行着牛顿与莱布尼茨留给人类的导数与切线法则。”",
        keyInsights: [
          "生动诠释微积分在21世纪人类最尖端科技中的现实应用",
          "打通基础数学理论与前沿大模型工程实现的认知脉络"
        ]
      }
    ]
  }
];

export interface ParadigmComparisonItem {
  id: string;
  era: string;
  representativeFigures: string;
  coreObject: string;
  infinitesimalHandling: string;
  rigorLevel: string;
  mainTool: string;
  paradoxVulnerability: string;
}

export const PARADIGM_COMPARISONS: ParadigmComparisonItem[] = [
  {
    id: "p1",
    era: "古代几何穷竭学派 (前5世纪-5世纪)",
    representativeFigures: "欧多克索斯、阿基米德、刘徽、祖暅",
    coreObject: "静态几何图形（圆、抛物线弓形、球体、牟合方盖）",
    infinitesimalHandling: "潜无穷逼近，拒绝承认实际无穷小量实体的存在",
    rigorLevel: "极高（基于欧氏几何双重归谬反证法）",
    mainTool: "几何作图、直尺圆规、杠杆力矩直觉、穷竭夹逼",
    paradoxVulnerability: "推导极其繁琐，无法形成通用的代数演算规则"
  },
  {
    id: "p2",
    era: "17世纪先驱微元学派 (1600-1670)",
    representativeFigures: "开普勒、卡瓦列利、费马、巴罗",
    coreObject: "不可分量集合、微小切片与曲线切线",
    infinitesimalHandling: "实无穷小微元，将连续量视为无数不可分量的堆叠",
    rigorLevel: "中等（依赖深厚的几何直觉与力学洞察）",
    mainTool: "无限薄圆盘、平行截面比、费马伪等法扰动 $e$、特征三角形",
    paradoxVulnerability: "不可分量到底有没有厚度？为何微扰 $e$ 可以随意除掉又令为零？"
  },
  {
    id: "p3",
    era: "牛顿-莱布尼茨发明期 (1665-1730)",
    representativeFigures: "牛顿、莱布尼茨、伯努利兄弟",
    coreObject: "连续流动量 (Fluents) 与形式差分微元 ($dx, dy$)",
    infinitesimalHandling: "瞬量 $o$ 或一阶/二阶无穷小量，具有代数操作性",
    rigorLevel: "中等偏低（重在计算生产力与物理问题求解）",
    mainTool: "流数运算法则、广义二项式展开、微分算子与积分号、基本定理",
    paradoxVulnerability: "遭遇贝克莱主教‘逝去量的幽灵’致命批判，引发第二次数学危机"
  },
  {
    id: "p4",
    era: "19世纪严格化分析学派 (1820-1900)",
    representativeFigures: "柯西、魏尔斯特拉斯、戴德金、黎曼",
    coreObject: "实数集合、连续函数映射与极限序列",
    infinitesimalHandling: "驱逐实体无穷小，转化为纯静态 $(\\varepsilon, \\delta)$ 量词控制的不等式",
    rigorLevel: "极高（绝对无漏洞的现代纯数学分析范式）",
    mainTool: "$(\\varepsilon, \\delta)$ 与 $(\\varepsilon, N)$ 不等式语言、柯西收敛准则、戴德金实数分割",
    paradoxVulnerability: "完全消解贝克莱悖论；建立了坚不可摧的现代分析大厦"
  },
  {
    id: "p5",
    era: "20世纪现代拓展与非标准分析 (1900-当代)",
    representativeFigures: "庞加莱、嘉当、鲁滨逊 (Abraham Robinson)",
    coreObject: "微分流形、外微分形式、超实数系 ${}^*\\mathbb{R}$、深度学习计算图",
    infinitesimalHandling: "在超实数模型中以严格数理逻辑复活真实无穷小量；张量自动微分",
    rigorLevel: "完全公理化与现代数理逻辑严格证明",
    mainTool: "广义斯托克斯定理 $\\int_{\\partial \\Omega} \\omega = \\int_\\Omega d\\omega$、超滤子构造、反向传播链式法则",
    paradoxVulnerability: "无逻辑漏洞；拓展至高维几何、量子时空与人工智能万亿参数优化"
  }
];
