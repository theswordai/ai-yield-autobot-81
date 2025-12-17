export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  relatedIds?: number[];
}

export interface FAQCategory {
  id: string;
  name: string;
  icon: string;
}

export const faqCategories: FAQCategory[] = [
  { id: 'basic', name: '项目基础', icon: '🏠' },
  { id: 'alpha', name: '跨链阿尔法引擎', icon: '⚡' },
  { id: 'ai', name: 'AI自适应收益轮动', icon: '🤖' },
  { id: 'vault', name: '去中心化质押金库', icon: '🏦' },
  { id: 'transparent', name: '链上清晰透明协议', icon: '🔗' },
  { id: 'usdv', name: 'USDV代币系统', icon: '💎' },
  { id: 'charity', name: '公益与慈善', icon: '❤️' },
  { id: 'growth', name: '增长与合规', icon: '📈' },
  { id: 'team', name: '团队背景', icon: '👥' },
];

export const faqData: FAQ[] = [
  // ========== 项目基础 (1-15) ==========
  {
    id: 1,
    question: '什么是USD.online（数美在线）？',
    answer: 'USD.online（数美在线）是AI驱动的全球流动性与公益共建平台。它不是单纯的金融平台，而是USDV文明生物链的孵化器与实验场：一个将AI×区块链×公益金融融合的全球舞台。愿景是让资本不再冰冷，而是带有温度；让财富不止增长，而是带来文明共鸣。',
    category: 'basic',
    relatedIds: [2, 3, 4]
  },
  {
    id: 2,
    question: 'USD.online的愿景是什么？',
    answer: 'USD.online的愿景是成为"AI×区块链×公益金融的全球舞台"。我们希望让资本不再冰冷，而是带有温度；让财富不止增长，而是带来文明共鸣。通过四大链上策略和USDV代币体系，构建一个透明、高效、有温度的金融生态。',
    category: 'basic',
    relatedIds: [1, 3, 10]
  },
  {
    id: 3,
    question: '项目的核心理念是什么？',
    answer: '项目的核心理念是"算法即自由·叙事即价值·资本即文明"。算法即自由意味着通过AI和智能合约实现自动化、无需信任的金融服务；叙事即价值强调通过透明的链上数据讲述真实的价值故事；资本即文明则体现在将金融收益与公益事业相结合，推动文明进步。',
    category: 'basic',
    relatedIds: [1, 2, 4]
  },
  {
    id: 4,
    question: '"算法即自由·叙事即价值·资本即文明"是什么意思？',
    answer: '这是USD.online的三大核心哲学：\n\n• 算法即自由：通过AI算法和智能合约，用户无需依赖中心化机构，实现资产的自主管理和增值\n• 叙事即价值：所有策略执行、资金流向都在链上透明可查，用数据讲述真实的价值故事\n• 资本即文明：将金融收益与公益慈善结合，让资本成为推动社会文明进步的力量',
    category: 'basic',
    relatedIds: [3, 86, 87]
  },
  {
    id: 5,
    question: 'USD.online解决了什么市场痛点？',
    answer: 'USD.online解决了三大市场痛点：\n\n1. 传统金融的问题：收益低、门槛高、不透明\n2. 加密金融的局限：波动大、风险高、缺乏专业策略\n3. 公益金融的缺口：资金来源不稳定、透明度不足\n\n通过AI驱动的四大策略和链上透明机制，我们提供稳定收益、低门槛参与和公益融合的解决方案。',
    category: 'basic',
    relatedIds: [6, 7, 8]
  },
  {
    id: 6,
    question: '传统金融有什么问题？',
    answer: '传统金融存在以下问题：\n\n• 收益率低：银行存款和理财产品收益普遍较低\n• 门槛高：优质投资机会往往只对高净值人群开放\n• 不透明：资金流向和投资策略不公开\n• 效率低：跨境转账、结算周期长\n• 中心化风险：依赖机构信用，存在系统性风险',
    category: 'basic',
    relatedIds: [5, 7, 9]
  },
  {
    id: 7,
    question: '加密金融有什么局限？',
    answer: '加密金融的局限包括：\n\n• 波动性大：加密资产价格波动剧烈\n• 学习门槛高：需要理解复杂的DeFi协议\n• 安全风险：智能合约漏洞、钓鱼攻击等\n• 缺乏专业策略：普通用户难以执行复杂的套利策略\n• 信息不对称：散户难以获取专业级市场信息',
    category: 'basic',
    relatedIds: [5, 6, 9]
  },
  {
    id: 8,
    question: '公益金融有什么缺口？',
    answer: '公益金融的缺口主要体现在：\n\n• 资金来源不稳定：依赖捐赠，难以持续\n• 透明度不足：善款使用情况难以追踪\n• 效率低下：中间环节多，管理成本高\n• 覆盖面有限：难以触达真正需要帮助的群体\n\nUSD.online通过将策略收益与公益结合，创建可持续的公益资金来源。',
    category: 'basic',
    relatedIds: [5, 86, 87]
  },
  {
    id: 9,
    question: 'USD.online与传统金融平台有什么区别？',
    answer: 'USD.online与传统金融平台的核心区别：\n\n• 透明度：所有策略执行和资金流向链上可查\n• 收益来源：基于AI驱动的量化策略，而非简单的存贷利差\n• 去中心化：智能合约自动执行，无需信任中心化机构\n• 公益融合：收益的一部分自动注入公益基金\n• 全球化：无国界限制，24/7运作',
    category: 'basic',
    relatedIds: [5, 6, 73]
  },
  {
    id: 10,
    question: '什么是USDV文明生物链？',
    answer: 'USDV文明生物链是USD.online生态的核心概念，将USDV代币比喻为"文明的DNA"。就像生物体从DNA进化到大脑，USDV从简单的权益代币进化为承载四大策略收益、驱动生态发展的核心资产。它连接投资者、策略、公益三方，形成一个有机的价值循环体系。',
    category: 'basic',
    relatedIds: [76, 77, 81]
  },
  {
    id: 11,
    question: '项目为什么叫"数美在线"？',
    answer: '"数美在线"是USD.online的中文名称：\n\n• "数"代表数字化、量化、区块链技术\n• "美"代表美好、美德、公益之美\n• "在线"代表24/7全天候运作、全球在线服务\n\n这个名字体现了项目将数字金融与美好公益相结合的核心理念。',
    category: 'basic',
    relatedIds: [1, 2, 3]
  },
  {
    id: 12,
    question: 'USD.online的市场定位是什么？',
    answer: 'USD.online定位为"AI驱动的全球流动性与公益共建平台"，目标用户群体包括：\n\n• 寻求稳定收益的加密资产持有者\n• 希望参与DeFi但缺乏专业知识的投资者\n• 关注公益、希望投资产生社会价值的人群\n• 追求透明、可验证投资策略的专业投资者',
    category: 'basic',
    relatedIds: [1, 5, 91]
  },
  {
    id: 13,
    question: '项目的技术核心优势是什么？',
    answer: 'USD.online的技术核心优势包括：\n\n• AI驱动：机器学习模型实时分析市场，优化策略执行\n• 多链部署：支持以太坊、BSC、Arbitrum等主流公链\n• 智能合约：策略执行自动化，无需人工干预\n• 链上透明：所有交易和资金流向可追溯\n• 风控系统：多层风险控制和熔断机制',
    category: 'basic',
    relatedIds: [16, 31, 51]
  },
  {
    id: 14,
    question: 'USD.online如何实现透明化？',
    answer: 'USD.online通过多重机制实现透明化：\n\n• 公开地址簿：策略执行地址、金库地址全部公开\n• 链上验证：每笔交易都可在区块链浏览器查询\n• 实时看板：策略表现、收益数据实时展示\n• 审计报告：定期发布第三方审计报告\n• 社区监督：开放社区对策略执行的监督',
    category: 'basic',
    relatedIds: [66, 73, 74]
  },
  {
    id: 15,
    question: '为什么说这是AI×区块链×公益金融的融合？',
    answer: '这三者的融合体现在：\n\n• AI：驱动四大策略的智能决策和执行\n• 区块链：提供透明、不可篡改的执行环境\n• 公益金融：将收益与慈善事业绑定\n\n三者相互强化：AI提升效率，区块链确保透明，公益赋予意义，共同构建一个有温度的金融生态。',
    category: 'basic',
    relatedIds: [1, 3, 86]
  },

  // ========== 跨链阿尔法引擎 (16-30) ==========
  {
    id: 16,
    question: '什么是跨链阿尔法引擎？',
    answer: '跨链阿尔法引擎是USD.online四大核心策略之一，专注于捕捉多链价差、订单流时间价值和新资产早期红利。它包含三条子策略：DEX搬砖套利、低风险MEV和新币狙击。系统24/7智能调度，资金在三条子策略间动态分配，风险等级为中等。',
    category: 'alpha',
    relatedIds: [17, 19, 21]
  },
  {
    id: 17,
    question: '跨链阿尔法引擎的定位是什么？',
    answer: '跨链阿尔法引擎的定位是：\n\n• 多链价差捕捉：在不同链和DEX之间寻找套利机会\n• 订单流时间价值：通过MEV策略捕获交易执行中的价值\n• 新资产早期红利：在新代币上线初期捕获价格发现红利\n\n核心KPI：单策略最大回撤<5%，年化阿尔法收益>25%。',
    category: 'alpha',
    relatedIds: [16, 28, 29]
  },
  {
    id: 18,
    question: 'DEX搬砖策略是什么？',
    answer: 'DEX搬砖策略是在去中心化交易所之间进行套利的策略：\n\n• 覆盖范围：Uniswap、SushiSwap、Curve、PancakeSwap等主流DEX\n• 套利对象：ETH、BTC、主流稳定币及高流动性代币\n• 执行方式：多链同步监控，发现价差后自动执行套利\n• 风控措施：单笔套利金额上限、滑点保护、Gas费用控制',
    category: 'alpha',
    relatedIds: [16, 19, 29]
  },
  {
    id: 19,
    question: 'DEX搬砖如何实现套利？',
    answer: 'DEX搬砖套利的实现流程：\n\n1. 监控：实时扫描多链DEX的价格数据\n2. 发现：AI识别有利可图的价差机会\n3. 计算：考虑Gas费、滑点后计算净收益\n4. 执行：符合条件时自动执行跨DEX或跨链套利\n5. 结算：利润自动归集到策略金库\n\n关键是速度和精确度，毫秒级响应捕捉转瞬即逝的机会。',
    category: 'alpha',
    relatedIds: [18, 16, 28]
  },
  {
    id: 20,
    question: '什么是低风险MEV策略？',
    answer: '低风险MEV（最大可提取价值）策略专注于从区块链交易排序中获取价值：\n\n• 策略类型：后置套利（backrunning）、清算保护等低风险类型\n• 排除范围：不进行三明治攻击等可能损害普通用户的MEV\n• 风控措施：严格的盈亏比要求，失败成本控制\n• 执行环境：通过Flashbots等私有交易池提交，降低失败风险',
    category: 'alpha',
    relatedIds: [16, 21, 29]
  },
  {
    id: 21,
    question: 'MEV策略的风控措施有哪些？',
    answer: 'MEV策略的风控措施包括：\n\n• 策略筛选：只执行低风险、非恶意的MEV类型\n• 盈亏比控制：预期收益必须大于潜在损失的3倍以上\n• 失败成本限制：单笔MEV的Gas成本上限\n• 频率控制：避免过度竞争导致的成本飙升\n• 黑名单机制：排除高风险的合约和交易对',
    category: 'alpha',
    relatedIds: [20, 29, 30]
  },
  {
    id: 22,
    question: '新币狙击策略是什么？',
    answer: '新币狙击策略专注于捕获新代币上线初期的价格发现红利：\n\n• 发现机制：监控链上部署、社交媒体信号、DEX上线公告\n• 准入标准：合约安全审计、流动性锁定、团队背景调查\n• 资金模型：单币种最大仓位不超过策略池的2%\n• 退出路径：预设止盈止损，TWAP分批退出',
    category: 'alpha',
    relatedIds: [23, 24, 25]
  },
  {
    id: 23,
    question: '新币狙击的发现机制是怎样的？',
    answer: '新币狙击的发现机制是多维度的：\n\n• 链上监控：实时扫描新合约部署和流动性添加事件\n• 社交信号：AI分析Twitter、Telegram等平台的热度\n• DEX信息：监控主流DEX的新币上线公告\n• 项目调研：快速评估项目背景、团队、技术\n• 评分系统：综合多维度信息给出投资评分',
    category: 'alpha',
    relatedIds: [22, 24, 30]
  },
  {
    id: 24,
    question: '新币狙击的准入标准有哪些？',
    answer: '新币狙击的准入标准严格：\n\n• 合约安全：通过自动化安全扫描，无明显漏洞\n• 流动性要求：初始流动性达到一定阈值\n• 锁仓情况：团队代币有合理的锁仓安排\n• 社区热度：有真实的社区关注和讨论\n• 排除条件：貔貅盘、蜜罐合约、复制代码等',
    category: 'alpha',
    relatedIds: [22, 23, 30]
  },
  {
    id: 25,
    question: '新币狙击的资金模型是怎样的？',
    answer: '新币狙击的资金模型注重风险控制：\n\n• 单币仓位：不超过策略池的2%\n• 分批建仓：不一次性买入，分2-3批进入\n• 动态调整：根据市场反馈调整仓位\n• 总敞口：新币总仓位不超过策略池的15%\n• 利润再投：部分利润可用于新的狙击机会',
    category: 'alpha',
    relatedIds: [22, 26, 29]
  },
  {
    id: 26,
    question: '新币狙击的退出路径是什么？',
    answer: '新币狙击的退出路径设计：\n\n• 止盈阶梯：50%涨幅卖出30%，100%涨幅卖出30%，剩余40%设追踪止损\n• 止损线：下跌20%触发止损，保护本金\n• TWAP退出：大额退出采用时间加权平均价格，减少冲击\n• 时间限制：超过7天未达预期，逐步减仓\n• 流动性监控：流动性骤降时加速退出',
    category: 'alpha',
    relatedIds: [22, 25, 74]
  },
  {
    id: 27,
    question: '跨链阿尔法引擎的风险等级如何？',
    answer: '跨链阿尔法引擎的风险等级为"中等"：\n\n• 相比质押金库，有更多的市场敞口\n• 但相比纯合约交易，风险已大幅降低\n• 三条子策略分散风险，不依赖单一策略\n• 严格的风控措施限制最大回撤\n• 目标：在可控风险下追求超额收益（阿尔法）',
    category: 'alpha',
    relatedIds: [16, 28, 29]
  },
  {
    id: 28,
    question: '跨链阿尔法引擎的KPI指标有哪些？',
    answer: '跨链阿尔法引擎的KPI指标：\n\n• 年化阿尔法收益：目标>25%\n• 最大回撤：单策略<5%\n• 夏普比率：>2.0\n• 胜率：DEX搬砖>85%，MEV>70%，新币狙击>60%\n• 资金利用率：>80%\n• 执行效率：套利延迟<500ms',
    category: 'alpha',
    relatedIds: [16, 17, 27]
  },
  {
    id: 29,
    question: '跨链套利的风控护栏有哪些？',
    answer: '跨链套利的风控护栏：\n\n• 单笔限额：每笔套利金额上限\n• 日累计限额：每日套利总额上限\n• 滑点保护：超出预期滑点自动取消\n• Gas熔断：Gas价格异常时暂停执行\n• 跨链延迟保护：考虑跨链桥的确认时间\n• 紧急暂停：异常情况下可一键暂停策略',
    category: 'alpha',
    relatedIds: [16, 18, 21]
  },
  {
    id: 30,
    question: '新币策略的黑名单机制是什么？',
    answer: '新币策略的黑名单机制：\n\n• 合约黑名单：已知的诈骗合约、貔貅盘地址\n• 开发者黑名单：有不良记录的开发者地址\n• 模式黑名单：可疑的代币经济模型\n• 社区举报：社区反馈的风险项目\n• 自动更新：AI持续学习，更新黑名单\n• 白名单优先：优先投资经过验证的项目',
    category: 'alpha',
    relatedIds: [22, 23, 24]
  },

  // ========== AI自适应收益轮动 (31-50) ==========
  {
    id: 31,
    question: '什么是AI自适应收益轮动？',
    answer: 'AI自适应收益轮动是USD.online四大核心策略之一，利用AI进行智能仓位调度和策略轮动。覆盖BTC、ETH、BNB、SOL等主流资产，执行三种子策略：主流币网格交易、资金费率套利、低杠杆合约。AI实时分析市场状态，动态分配资金到最优策略。',
    category: 'ai',
    relatedIds: [32, 33, 36, 39]
  },
  {
    id: 32,
    question: 'AI自适应收益轮动覆盖哪些资产？',
    answer: 'AI自适应收益轮动覆盖的主流资产：\n\n• BTC：比特币，加密市场基准资产\n• ETH：以太坊，智能合约平台龙头\n• BNB：币安链原生代币\n• SOL：Solana高性能公链代币\n\n选择标准：高流动性、低操纵风险、有成熟的衍生品市场。',
    category: 'ai',
    relatedIds: [31, 33, 36]
  },
  {
    id: 33,
    question: '什么是主流币网格交易？',
    answer: '主流币网格交易是一种自动化的区间交易策略：\n\n• 原理：在价格区间内设置多个买卖网格\n• 执行：价格下跌触发买入，上涨触发卖出\n• 优势：在震荡行情中持续获利\n• 适用场景：无明显趋势的盘整期\n• AI优化：动态调整网格间距和区间范围',
    category: 'ai',
    relatedIds: [31, 34, 35]
  },
  {
    id: 34,
    question: '网格交易的执行要点是什么？',
    answer: '网格交易的执行要点：\n\n• 区间设定：基于历史波动率和支撑阻力位\n• 网格密度：根据资金量和手续费优化\n• 仓位分配：每格投入的资金比例\n• 动态调整：趋势出现时调整区间\n• 止损机制：突破区间时触发保护',
    category: 'ai',
    relatedIds: [33, 35, 44]
  },
  {
    id: 35,
    question: '网格交易的风控措施有哪些？',
    answer: '网格交易的风控措施：\n\n• 区间突破止损：价格突破网格区间自动止损\n• 单边行情保护：检测到趋势时减少网格仓位\n• 资金分散：不将全部资金投入单一网格\n• 动态网格：根据波动率调整网格参数\n• 最大持仓限制：控制单一资产的最大敞口',
    category: 'ai',
    relatedIds: [33, 34, 46]
  },
  {
    id: 36,
    question: '什么是资金费率套利？',
    answer: '资金费率套利是利用永续合约资金费率获利的策略：\n\n• 原理：永续合约有定期的资金费率结算\n• 套利方式：持有现货同时持有相反方向的合约\n• 收益来源：收取资金费率，价格风险被对冲\n• 优势：低风险、收益稳定\n• 适用场景：资金费率显著偏离时',
    category: 'ai',
    relatedIds: [31, 37, 38]
  },
  {
    id: 37,
    question: '资金费率套利如何运作？',
    answer: '资金费率套利的运作流程：\n\n1. 监控：实时追踪各交易所的资金费率\n2. 判断：当费率显著为正/负时触发策略\n3. 建仓：买入现货 + 开空合约（或相反）\n4. 收费：定期收取资金费率（通常每8小时）\n5. 平仓：费率回归正常时平仓获利\n\n关键是对冲价格风险，只赚取费率收益。',
    category: 'ai',
    relatedIds: [36, 38, 45]
  },
  {
    id: 38,
    question: '资金费率套利适用什么场景？',
    answer: '资金费率套利的最佳场景：\n\n• 市场极度乐观/悲观时，费率偏离较大\n• 重大事件前后，如减半、升级等\n• 牛市后期，多头情绪高涨时费率常为正\n• 熊市恐慌时，空头拥挤导致负费率\n\n不适用场景：费率接近零、市场平静期。',
    category: 'ai',
    relatedIds: [36, 37, 43]
  },
  {
    id: 39,
    question: '什么是低杠杆合约策略？',
    answer: '低杠杆合约策略是使用有限杠杆进行趋势交易：\n\n• 杠杆倍数：通常1-3倍，最高不超过5倍\n• 方向判断：基于AI多信号融合\n• 仓位控制：根据信号强度动态调整\n• 止损严格：每笔交易预设止损位\n• 目标：在控制风险的前提下捕捉趋势收益',
    category: 'ai',
    relatedIds: [31, 40, 41]
  },
  {
    id: 40,
    question: '低杠杆合约的信号融合是什么？',
    answer: '低杠杆合约的信号融合系统：\n\n• 技术指标：趋势、动量、波动率等指标\n• 链上数据：资金流向、持仓变化、交易所余额\n• 市场情绪：恐惧贪婪指数、社交媒体情绪\n• 宏观因素：利率、美元指数等\n\nAI综合多维度信号，给出交易方向和置信度。',
    category: 'ai',
    relatedIds: [39, 48, 49]
  },
  {
    id: 41,
    question: 'AI如何进行仓位调度？',
    answer: 'AI仓位调度的核心逻辑：\n\n• 市场状态识别：震荡、趋势、极端行情\n• 策略适配：不同市场状态匹配不同策略\n• 资金分配：根据策略表现动态调整权重\n• 风险预算：总风险敞口不超过预设阈值\n• 再平衡：定期或触发条件时重新平衡',
    category: 'ai',
    relatedIds: [31, 42, 49]
  },
  {
    id: 42,
    question: '三策略联动是什么意思？',
    answer: '三策略联动指AI自适应收益轮动中三种子策略的协同：\n\n• 网格交易：震荡市主力，提供稳定收益\n• 费率套利：低风险底仓，收益兜底\n• 低杠杆合约：趋势市进攻，捕捉大行情\n\nAI根据市场状态动态调整三者比例，实现全天候收益。',
    category: 'ai',
    relatedIds: [31, 33, 36, 39]
  },
  {
    id: 43,
    question: 'AI自适应收益轮动的风险等级？',
    answer: 'AI自适应收益轮动的风险等级为"中高"：\n\n• 涉及杠杆交易，有放大亏损的风险\n• 但杠杆倍数严格控制在低水平\n• 三策略分散降低单一策略风险\n• AI持续监控，异常情况及时调整\n• 适合风险承受能力中等以上的投资者',
    category: 'ai',
    relatedIds: [31, 27, 46]
  },
  {
    id: 44,
    question: '网格交易的看板指标有哪些？',
    answer: '网格交易的看板指标：\n\n• 当前区间：网格的上下边界\n• 网格利润：累计套利收益\n• 持仓均价：当前持仓的平均成本\n• 网格完成率：触发的网格数/总网格数\n• 年化收益率：折算的年化回报\n• 最大回撤：历史最大亏损幅度',
    category: 'ai',
    relatedIds: [33, 34, 28]
  },
  {
    id: 45,
    question: '资金费率套利的风控措施？',
    answer: '资金费率套利的风控措施：\n\n• 对冲比例：确保现货和合约仓位精确对冲\n• 费率阈值：只在费率超过阈值时开仓\n• 持仓时间：限制最长持仓周期\n• 滑点控制：大额建仓分批执行\n• 交易所风险：分散在多个交易所',
    category: 'ai',
    relatedIds: [36, 37, 46]
  },
  {
    id: 46,
    question: '低杠杆合约的止损机制是什么？',
    answer: '低杠杆合约的止损机制：\n\n• 固定止损：每笔交易预设最大亏损比例\n• 移动止损：盈利后逐步上移止损位\n• 时间止损：持仓超时未达预期自动平仓\n• 波动止损：极端波动时触发紧急止损\n• 总账户止损：日亏损达到阈值暂停交易',
    category: 'ai',
    relatedIds: [39, 40, 47]
  },
  {
    id: 47,
    question: '什么是事件熔断机制？',
    answer: '事件熔断机制是AI自适应策略的风控功能：\n\n• 触发条件：市场剧烈波动、重大事件、异常情况\n• 熔断动作：暂停新开仓、减少敞口、全部平仓\n• 恢复条件：市场恢复正常、风险评估通过\n• 事件类型：交易所故障、监管消息、黑天鹅事件\n• 目标：保护资金安全，避免极端损失',
    category: 'ai',
    relatedIds: [43, 46, 29]
  },
  {
    id: 48,
    question: 'AI信号是如何生成的？',
    answer: 'AI信号的生成流程：\n\n1. 数据采集：价格、成交量、链上数据、舆情等\n2. 特征工程：提取有预测价值的特征\n3. 模型预测：多个机器学习模型给出预测\n4. 集成投票：综合多模型结果\n5. 置信度计算：给出信号的可信程度\n6. 风险调整：根据当前风险状态调整信号',
    category: 'ai',
    relatedIds: [40, 41, 49]
  },
  {
    id: 49,
    question: '仓位节流阀是什么？',
    answer: '仓位节流阀是风控系统的核心组件：\n\n• 功能：控制每个策略和整体的最大仓位\n• 触发条件：接近风险上限、市场异常、连续亏损\n• 节流动作：限制新开仓、强制减仓\n• 动态调整：根据市场波动率调整阈值\n• 目标：防止过度暴露，保护资金安全',
    category: 'ai',
    relatedIds: [41, 46, 47]
  },
  {
    id: 50,
    question: 'AI自适应策略的收益来源是什么？',
    answer: 'AI自适应策略的收益来源：\n\n• 网格利润：震荡行情中的低买高卖差价\n• 资金费率：永续合约的定期费率收入\n• 趋势收益：捕捉中长期价格趋势的利润\n• 市场无效性：利用AI发现市场定价偏差\n\n核心是AI的市场状态判断和策略切换能力。',
    category: 'ai',
    relatedIds: [31, 42, 48]
  },

  // ========== 去中心化质押金库 (51-65) ==========
  {
    id: 51,
    question: '什么是去中心化质押金库？',
    answer: '去中心化质押金库是USD.online四大核心策略之一，专注于DeFi借贷和流动性挖矿。包含两条子策略：利率与点数挖矿（60%配比）和稳定币AMM做市（40%配比）。是四大策略中风险最低的一个，适合追求稳定收益的投资者。',
    category: 'vault',
    relatedIds: [52, 58, 61]
  },
  {
    id: 52,
    question: '利率与点数挖矿是什么？',
    answer: '利率与点数挖矿策略：\n\n• 存入稳定币到借贷协议获取利息\n• 同时获取协议的积分/点数奖励\n• 候选协议：Aave、Compound、Venus等\n• 资产选择：USDT、USDC、DAI等主流稳定币\n• 策略：在多个协议间分散投放，优化综合收益',
    category: 'vault',
    relatedIds: [51, 53, 54]
  },
  {
    id: 53,
    question: '支持哪些稳定币资产？',
    answer: '质押金库支持的稳定币资产：\n\n• USDT：Tether美元稳定币，市值最大\n• USDC：Circle发行，合规性好\n• DAI：MakerDAO去中心化稳定币\n• FRAX：部分算法稳定币\n• BUSD：币安美元稳定币\n\n选择标准：流动性好、历史稳定、协议支持度高。',
    category: 'vault',
    relatedIds: [52, 55, 59]
  },
  {
    id: 54,
    question: '候选的借贷协议有哪些？',
    answer: '候选的借贷协议：\n\n• Aave：多链借贷龙头，安全性高\n• Compound：以太坊老牌借贷协议\n• Venus：BSC链借贷龙头\n• Morpho：优化借贷利率的协议\n• Spark：MakerDAO生态借贷协议\n\n选择标准：TVL、安全审计、历史运营、利率竞争力。',
    category: 'vault',
    relatedIds: [52, 55, 63]
  },
  {
    id: 55,
    question: '分散投放策略是怎样的？',
    answer: '分散投放策略的原则：\n\n• 协议分散：不超过40%投入单一协议\n• 链分散：覆盖以太坊、BSC、Arbitrum等\n• 资产分散：多种稳定币组合\n• 动态再平衡：定期根据收益率调整配比\n• 风险隔离：单协议出问题不影响全局',
    category: 'vault',
    relatedIds: [52, 54, 63]
  },
  {
    id: 56,
    question: '什么是净APY筛选？',
    answer: '净APY筛选是协议选择的核心方法：\n\n• 总APY = 基础利率 + 激励代币APY\n• 净APY = 总APY - Gas成本 - 滑点损耗\n• 筛选标准：只投入净APY排名前列的协议\n• 动态监控：利率变化时自动迁移资金\n• 考虑因素：提款周期、锁仓要求等隐性成本',
    category: 'vault',
    relatedIds: [52, 54, 57]
  },
  {
    id: 57,
    question: '激励兑现机制是怎样的？',
    answer: '激励兑现机制：\n\n• 定期收割：定时领取挖矿获得的代币奖励\n• 智能出售：根据市场条件选择最佳出售时机\n• 复投策略：部分奖励复投增加本金\n• 点数管理：协议积分在空投时统一兑现\n• 收益归集：所有收益归入策略金库统一管理',
    category: 'vault',
    relatedIds: [52, 56, 65]
  },
  {
    id: 58,
    question: '什么是稳定币AMM做市？',
    answer: '稳定币AMM做市策略：\n\n• 向DEX提供稳定币流动性获取手续费\n• 主要协议：Curve、Balancer稳定币池\n• 收益来源：交易手续费 + 流动性挖矿奖励\n• 优势：稳定币对无常损失风险极低\n• 配比：占质押金库40%的资金',
    category: 'vault',
    relatedIds: [51, 59, 60]
  },
  {
    id: 59,
    question: 'AMM做市覆盖哪些协议？',
    answer: 'AMM做市覆盖的协议：\n\n• Curve：稳定币做市首选，滑点最低\n• Balancer：支持多资产池，收益优化\n• Uniswap V3：集中流动性策略\n• PancakeSwap：BSC链做市\n• Velodrome：Optimism链做市\n\n选择标准：交易量、手续费率、无常损失风险。',
    category: 'vault',
    relatedIds: [58, 60, 64]
  },
  {
    id: 60,
    question: '集中流动性策略是什么？',
    answer: '集中流动性策略（如Uniswap V3）：\n\n• 原理：将流动性集中在当前价格附近的区间\n• 优势：相同资金获得更高的手续费收益\n• 风险：价格超出区间后流动性失效\n• 管理：需要定期调整区间位置\n• 适用：稳定币对价格波动小，非常适合此策略',
    category: 'vault',
    relatedIds: [58, 59, 64]
  },
  {
    id: 61,
    question: '质押金库的资金配比是多少？',
    answer: '质押金库的资金配比：\n\n• 利率与点数挖矿：60%\n• 稳定币AMM做市：40%\n\n这个配比的设计理念：\n• 借贷收益更稳定，占比较高\n• AMM做市收益弹性更大，作为补充\n• 两者互补，平衡风险和收益',
    category: 'vault',
    relatedIds: [51, 52, 58]
  },
  {
    id: 62,
    question: '60/40配比是什么意思？',
    answer: '60/40配比指质押金库的资金分配：\n\n• 60%：投入借贷协议（Aave、Compound等）\n  - 收益稳定，风险最低\n  - 可以获得借贷利息+协议激励\n\n• 40%：投入AMM做市（Curve、Balancer等）\n  - 收益潜力更高\n  - 稳定币对无常损失风险低\n\n这种配比在稳定性和收益间取得平衡。',
    category: 'vault',
    relatedIds: [61, 52, 58]
  },
  {
    id: 63,
    question: '质押金库的风控措施有哪些？',
    answer: '质押金库的风控措施：\n\n• 协议审计：只选择经过多次审计的协议\n• 分散投放：单协议投入不超过40%\n• 实时监控：链上监控协议健康状态\n• 紧急撤退：异常情况快速撤出资金\n• 保险覆盖：部分资金购买DeFi保险',
    category: 'vault',
    relatedIds: [51, 55, 64]
  },
  {
    id: 64,
    question: '协议限额是如何设定的？',
    answer: '协议限额的设定原则：\n\n• 单协议上限：不超过策略资金的40%\n• TVL比例：投入不超过协议TVL的1%\n• 历史表现：安全运行时间越长，限额越高\n• 审计次数：审计越多，限额可适当提高\n• 动态调整：根据市场情况和协议状态调整',
    category: 'vault',
    relatedIds: [55, 63, 65]
  },
  {
    id: 65,
    question: '质押金库的透明度如何保障？',
    answer: '质押金库的透明度保障：\n\n• 地址公开：所有质押地址链上可查\n• 实时数据：存款、收益数据实时更新\n• 协议分布：清晰展示资金在各协议的分布\n• 收益明细：利息、奖励、手续费分项列示\n• 审计报告：定期发布资金审计报告',
    category: 'vault',
    relatedIds: [51, 73, 74]
  },

  // ========== 链上清晰透明协议 (66-75) ==========
  {
    id: 66,
    question: '什么是链上清晰透明协议？',
    answer: '链上清晰透明协议是USD.online四大核心策略之一，也是平台透明化的核心基础设施。它包含打新/IDO模块和完整的链上透明体系，确保所有策略执行、资金流向都可追溯、可验证。',
    category: 'transparent',
    relatedIds: [67, 73, 74]
  },
  {
    id: 67,
    question: '打新/IDO模块是什么？',
    answer: '打新/IDO模块是参与优质项目早期代币发行的策略：\n\n• IDO：Initial DEX Offering，去中心化交易所首发\n• 参与方式：通过白名单或公开申购获得份额\n• 收益来源：上市后的价格上涨\n• 风险控制：严格的项目筛选和仓位限制\n• 透明执行：申购、分配、出售全过程链上可查',
    category: 'transparent',
    relatedIds: [66, 68, 71]
  },
  {
    id: 68,
    question: 'IDO参与的准入标准有哪些？',
    answer: 'IDO参与的准入标准：\n\n• 项目背景：团队可追溯，有行业经验\n• 技术审计：智能合约通过安全审计\n• 代币经济：分配合理，无明显抛压设计\n• 融资估值：估值合理，有上涨空间\n• 社区热度：真实的社区关注和讨论\n• 排除条件：匿名团队、无产品、纯模因项目',
    category: 'transparent',
    relatedIds: [67, 69, 72]
  },
  {
    id: 69,
    question: '单项目投资上限是多少？',
    answer: '单项目投资上限的设定：\n\n• 单个IDO：不超过策略池的5%\n• 同期总敞口：所有IDO仓位不超过20%\n• 设计理念：IDO风险较高，需要严格限额\n• 动态调整：根据项目质量可微调，但不突破上限\n• 分散原则：宁可错过，不可重仓',
    category: 'transparent',
    relatedIds: [67, 68, 72]
  },
  {
    id: 70,
    question: 'IDO的申购与兑现流程是怎样的？',
    answer: 'IDO的申购与兑现流程：\n\n1. 项目筛选：根据准入标准评估项目\n2. 准备资金：从策略池调拨申购资金\n3. 参与申购：通过白名单或公开渠道申购\n4. 等待分配：获得代币分配\n5. 代币接收：在解锁时间接收代币\n6. 择机退出：按预设策略分批卖出',
    category: 'transparent',
    relatedIds: [67, 71, 74]
  },
  {
    id: 71,
    question: '预设的止盈阶梯是什么？',
    answer: 'IDO预设的止盈阶梯：\n\n• 2倍时：卖出30%，收回大部分本金\n• 3倍时：再卖出30%，锁定利润\n• 5倍时：卖出20%\n• 剩余20%：设置追踪止损，博取更高收益\n\n止损设置：跌破成本价20%强制止损\n执行方式：TWAP分批出售，减少市场冲击',
    category: 'transparent',
    relatedIds: [67, 70, 74]
  },
  {
    id: 72,
    question: 'IDO模块的风控边界有哪些？',
    answer: 'IDO模块的风控边界：\n\n• 项目筛选：严格的准入标准\n• 仓位控制：单项目5%，总敞口20%上限\n• 时间限制：锁仓期过长的项目不参与\n• 流动性要求：上市后流动性不足不参与\n• 黑名单机制：有不良记录的发行方排除\n• 止损纪律：达到止损线必须执行',
    category: 'transparent',
    relatedIds: [67, 68, 69]
  },
  {
    id: 73,
    question: '公开地址簿包含哪些内容？',
    answer: '公开地址簿包含的内容：\n\n• 策略执行地址：四大策略的操作钱包地址\n• 金库地址：各策略的资金存放地址\n• 公益金库地址：慈善基金的存放地址\n• 收益分配地址：利润分配的目标地址\n• 合约地址：核心智能合约的部署地址\n\n所有地址链上可查，资金流向透明。',
    category: 'transparent',
    relatedIds: [66, 14, 65]
  },
  {
    id: 74,
    question: '什么是TWAP分片成交？',
    answer: 'TWAP（时间加权平均价格）分片成交：\n\n• 原理：将大额订单拆分成多个小单，分时段执行\n• 目的：减少对市场价格的冲击\n• 执行：在预设时间窗口内均匀分布订单\n• 优势：获得更接近市场平均价的成交价\n• 应用：IDO退出、大额策略调仓等场景',
    category: 'transparent',
    relatedIds: [26, 70, 71]
  },
  {
    id: 75,
    question: '打新策略如何保证透明度？',
    answer: '打新策略的透明度保障：\n\n• 申购公示：参与的IDO项目提前公示\n• 成本公开：申购价格、数量链上可查\n• 持仓披露：持有的IDO代币实时可查\n• 交易记录：卖出时间、价格、数量透明\n• 收益归档：每个项目的最终收益单独核算',
    category: 'transparent',
    relatedIds: [66, 67, 73]
  },

  // ========== USDV代币系统 (76-85) ==========
  {
    id: 76,
    question: '什么是USDV代币？',
    answer: 'USDV是USD.online生态的核心代币，是一种"结构化权益代币"。它不是单纯的功能代币或治理代币，而是绑定四大链上策略长期收益的权益凭证。USDV被定位为"文明生物链的DNA"，是连接投资者与策略收益的核心纽带。',
    category: 'usdv',
    relatedIds: [77, 78, 80]
  },
  {
    id: 77,
    question: 'USDV代币的核心功能是什么？',
    answer: 'USDV代币的核心功能：\n\n• 收益权益：持有USDV可分享四大策略的收益\n• 治理参与：参与平台重大决策投票\n• 优先权益：优先参与新策略、IDO等机会\n• 公益贡献：部分收益自动注入公益基金\n• 生态通证：在USD.online生态内流通使用',
    category: 'usdv',
    relatedIds: [76, 78, 83]
  },
  {
    id: 78,
    question: 'USDV与四大策略的关系是什么？',
    answer: 'USDV与四大策略的关系：\n\n• 跨链阿尔法引擎：套利收益部分回购USDV\n• AI自适应收益轮动：交易利润支撑USDV价值\n• 去中心化质押金库：稳定收益增强USDV底部\n• 链上透明协议：IDO收益增厚USDV回报\n\nUSDV是四大策略的价值聚合器。',
    category: 'usdv',
    relatedIds: [76, 16, 31, 51, 66]
  },
  {
    id: 79,
    question: 'USDV是什么类型的代币？',
    answer: 'USDV的代币类型定位：\n\n• 非稳定币：价值随策略表现波动\n• 非纯功能代币：不仅仅用于支付或手续费\n• 非纯治理代币：不仅仅用于投票\n• 结构化权益代币：综合收益权、治理权、优先权\n\n这是一种创新的代币设计，绑定真实的策略收益。',
    category: 'usdv',
    relatedIds: [76, 77, 80]
  },
  {
    id: 80,
    question: '什么是结构化权益代币？',
    answer: '结构化权益代币是USDV的定位：\n\n• 结构化：代币价值由多种收益来源结构化组成\n• 权益：持有代币即享有相应权益\n• 设计理念：不依赖单一因素，多元价值支撑\n\n类比：如果说股票是公司收益的权益凭证，USDV就是四大策略收益的权益凭证。',
    category: 'usdv',
    relatedIds: [76, 79, 81]
  },
  {
    id: 81,
    question: 'USDV如何绑定策略收益？',
    answer: 'USDV绑定策略收益的机制：\n\n• 收益分配：四大策略收益的一部分用于回购USDV\n• 质押奖励：质押USDV获得额外策略收益\n• 分红机制：定期向USDV持有者分配收益\n• 价值锚定：策略表现越好，USDV价值越高\n\n这创造了代币价值与实际业绩的正向绑定。',
    category: 'usdv',
    relatedIds: [76, 78, 82]
  },
  {
    id: 82,
    question: 'USDV的价值锚定是什么？',
    answer: 'USDV的价值锚定机制：\n\n• 收益锚定：代币价值与策略收益挂钩\n• 回购支撑：策略利润回购形成买盘\n• 质押锁仓：减少流通量，稳定价格\n• 生态需求：生态内使用创造真实需求\n\nUSDV不是凭空创造的代币，而是有真实业务支撑的价值载体。',
    category: 'usdv',
    relatedIds: [76, 81, 84]
  },
  {
    id: 83,
    question: 'USDV在生态中的作用是什么？',
    answer: 'USDV在生态中的作用：\n\n• 价值载体：承载四大策略的综合价值\n• 激励工具：用于奖励生态贡献者\n• 治理工具：参与平台治理决策\n• 流通媒介：生态内价值交换的媒介\n• 公益桥梁：连接金融收益与公益事业',
    category: 'usdv',
    relatedIds: [76, 77, 86]
  },
  {
    id: 84,
    question: 'USDV如何实现长期价值？',
    answer: 'USDV实现长期价值的路径：\n\n• 策略表现：四大策略持续盈利\n• 生态扩张：更多用户和应用场景\n• 供需平衡：合理的代币经济设计\n• 回购销毁：用利润回购并销毁代币\n• 社区建设：强大的社区共识和支持',
    category: 'usdv',
    relatedIds: [76, 82, 91]
  },
  {
    id: 85,
    question: 'USDV与传统稳定币有什么区别？',
    answer: 'USDV与传统稳定币的区别：\n\n| 特性 | USDV | 稳定币 |\n|------|------|--------|\n| 价值 | 浮动 | 锚定1美元 |\n| 收益 | 有策略收益 | 无/低收益 |\n| 用途 | 权益凭证 | 支付媒介 |\n| 风险 | 中等 | 低 |\n\nUSDV是投资工具，稳定币是支付工具。',
    category: 'usdv',
    relatedIds: [76, 79, 53]
  },

  // ========== 公益与慈善 (86-90) ==========
  {
    id: 86,
    question: 'USD.online如何融合公益？',
    answer: 'USD.online融合公益的方式：\n\n• 收益注入：四大策略收益的一部分注入公益基金\n• 自动执行：智能合约自动完成公益资金划转\n• 透明追踪：公益资金流向链上可查\n• 持续来源：不依赖捐赠，创造可持续公益资金\n• 社区参与：用户可选择支持的公益项目',
    category: 'charity',
    relatedIds: [4, 8, 87]
  },
  {
    id: 87,
    question: '自闭症儿童关怀基金是什么？',
    answer: '自闭症儿童关怀基金是USD.online的旗舰公益项目：\n\n• 资金来源：平台策略收益的固定比例\n• 受益对象：全球自闭症儿童及其家庭\n• 使用方向：治疗康复、教育支持、家庭援助\n• 透明管理：资金使用全程链上可追溯\n• 长期承诺：持续运营，不断扩大覆盖',
    category: 'charity',
    relatedIds: [86, 88, 89]
  },
  {
    id: 88,
    question: '公益资金如何实现透明？',
    answer: '公益资金的透明机制：\n\n• 专用地址：公益基金有独立的链上地址\n• 实时余额：任何人可查看基金余额\n• 转账记录：每笔支出都在链上可查\n• 使用报告：定期发布资金使用报告\n• 第三方审计：接受独立审计机构审核',
    category: 'charity',
    relatedIds: [86, 87, 73]
  },
  {
    id: 89,
    question: '什么是全球公益榜单？',
    answer: '全球公益榜单是USD.online的公益激励机制：\n\n• 展示内容：贡献公益最多的用户/机构排名\n• 计算方式：根据投资金额产生的公益贡献\n• 荣誉激励：上榜用户获得荣誉徽章\n• 额外权益：高排名用户获得平台特殊权益\n• 社区影响：激励更多人参与公益贡献',
    category: 'charity',
    relatedIds: [86, 87, 91]
  },
  {
    id: 90,
    question: '公益金库的注入机制是怎样的？',
    answer: '公益金库的注入机制：\n\n• 收益分配：每次策略结算，固定比例入公益金库\n• 智能合约：自动执行，无需人工干预\n• 比例设定：由平台治理决定，透明公开\n• 累积增长：随着策略规模增长，公益资金也增长\n• 定期使用：积累到一定金额后用于公益项目',
    category: 'charity',
    relatedIds: [86, 87, 88]
  },

  // ========== 增长与合规 (91-95) ==========
  {
    id: 91,
    question: 'USD.online的增长模式是什么？',
    answer: 'USD.online的增长模式：\n\n• 社区驱动：通过邀请码裂变扩大用户群\n• 口碑传播：良好的产品体验带来自然增长\n• 内容营销：教育用户了解DeFi和平台价值\n• 生态合作：与其他DeFi项目合作引流\n• 公益影响：公益属性吸引价值认同的用户',
    category: 'growth',
    relatedIds: [92, 93, 12]
  },
  {
    id: 92,
    question: '邀请码裂变机制是怎样的？',
    answer: '邀请码裂变机制：\n\n• 每个用户拥有专属邀请码\n• 邀请新用户注册并投资，获得奖励\n• 奖励类型：USDV代币、手续费返还等\n• 多级奖励：被邀请人再邀请也有奖励\n• 透明追踪：邀请关系链上记录，奖励自动发放',
    category: 'growth',
    relatedIds: [91, 93, 77]
  },
  {
    id: 93,
    question: '新人7天行动营是什么？',
    answer: '新人7天行动营是用户引导计划：\n\n• 第1天：了解平台基础，完成身份验证\n• 第2-3天：学习四大策略，理解风险收益\n• 第4-5天：小额尝试，体验策略运作\n• 第6-7天：制定投资计划，正式开始\n\n完成全程获得奖励，帮助新用户快速上手。',
    category: 'growth',
    relatedIds: [91, 92, 12]
  },
  {
    id: 94,
    question: 'USD.online的合规愿景是什么？',
    answer: 'USD.online的合规愿景：\n\n• 主动合规：积极与监管机构沟通对接\n• 透明运营：所有操作链上可查，接受监督\n• 用户保护：KYC/AML措施保护用户权益\n• 行业推动：参与行业自律和标准制定\n• 长期主义：追求可持续的合规发展',
    category: 'growth',
    relatedIds: [91, 95, 14]
  },
  {
    id: 95,
    question: '项目与哪些监管机构对接？',
    answer: '项目的监管对接情况：\n\n• 积极沟通：与多个司法管辖区的监管机构保持沟通\n• 合规顾问：聘请专业的法律合规顾问团队\n• 牌照申请：在条件成熟的地区申请相关牌照\n• 自律合规：遵守行业自律组织的规范\n• 持续更新：根据监管要求持续调整合规措施',
    category: 'growth',
    relatedIds: [94, 91, 14]
  },

  // ========== 团队背景 (96-100) ==========
  {
    id: 96,
    question: 'CC创始人的背景是什么？',
    answer: 'CC是USD.online的创始人：\n\n• 角色：Visionary Creator，愿景创造者\n• 背景：早期比特币布道者，2013年入行\n• 经验：多个Web3项目的创始和顾问经验\n• 理念：坚信区块链可以创造更美好的金融世界\n• 特点：强调公益与金融的结合，人文关怀',
    category: 'team',
    relatedIds: [97, 98, 99]
  },
  {
    id: 97,
    question: 'Mr.Lee的职业经历是什么？',
    answer: 'Mr.Lee是USD.online的核心成员：\n\n• 角色：Operations & Growth，运营与增长负责人\n• 背景：10+年互联网运营经验\n• 经验：曾在多家知名互联网公司负责增长\n• 专长：用户增长、社区运营、市场营销\n• 贡献：设计平台的增长策略和用户体系',
    category: 'team',
    relatedIds: [96, 98, 91]
  },
  {
    id: 98,
    question: 'Mr.Micheal（CTO）的技术背景？',
    answer: 'Mr.Micheal是USD.online的CTO：\n\n• 角色：Chief Technology Officer，首席技术官\n• 背景：计算机科学硕士，15+年开发经验\n• 经验：曾在头部交易所和DeFi协议工作\n• 专长：智能合约开发、系统架构、安全审计\n• 贡献：主导四大策略的技术实现和安全保障',
    category: 'team',
    relatedIds: [96, 99, 13]
  },
  {
    id: 99,
    question: 'Mouad负责什么工作？',
    answer: 'Mouad是USD.online的核心成员：\n\n• 角色：Community & Partnerships，社区与合作\n• 背景：国际化背景，多语言能力\n• 经验：曾在多个国际化Web3项目工作\n• 专长：社区建设、BD合作、国际化推广\n• 贡献：建设全球化社区，拓展战略合作伙伴',
    category: 'team',
    relatedIds: [96, 100, 91]
  },
  {
    id: 100,
    question: 'Omar（CFO）的专业领域是什么？',
    answer: 'Omar是USD.online的CFO：\n\n• 角色：Chief Financial Officer，首席财务官\n• 背景：金融学硕士，CFA持证人\n• 经验：传统金融和加密金融双重背景\n• 专长：财务管理、风险控制、合规运营\n• 贡献：设计代币经济模型，管理平台财务',
    category: 'team',
    relatedIds: [96, 94, 76]
  },
];

export const getFAQsByCategory = (categoryId: string): FAQ[] => {
  return faqData.filter(faq => faq.category === categoryId);
};

export const getFAQById = (id: number): FAQ | undefined => {
  return faqData.find(faq => faq.id === id);
};

export const getRelatedFAQs = (faq: FAQ): FAQ[] => {
  if (!faq.relatedIds) return [];
  return faq.relatedIds
    .map(id => getFAQById(id))
    .filter((f): f is FAQ => f !== undefined);
};

export const searchFAQs = (query: string): FAQ[] => {
  const lowerQuery = query.toLowerCase();
  return faqData.filter(
    faq =>
      faq.question.toLowerCase().includes(lowerQuery) ||
      faq.answer.toLowerCase().includes(lowerQuery)
  );
};
