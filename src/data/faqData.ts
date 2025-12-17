export interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

export interface FAQCategory {
  id: string;
  name: string;
  icon: string;
}

export const faqCategories: FAQCategory[] = [
  { id: 'overview', name: '项目概述', icon: '🏠' },
  { id: 'alpha-engine', name: '跨链阿尔法引擎', icon: '⚡' },
  { id: 'ai-rotation', name: 'AI收益轮动', icon: '🤖' },
  { id: 'staking-vault', name: '质押金库', icon: '🏦' },
  { id: 'ido', name: '链上透明协议', icon: '🔗' },
  { id: 'usdv', name: 'USDV代币', icon: '💎' },
  { id: 'charity', name: '公益慈善', icon: '❤️' },
  { id: 'compliance', name: '合规监管', icon: '📋' },
  { id: 'team', name: '团队介绍', icon: '👥' },
  { id: 'guide', name: '投资指南', icon: '📖' },
];

export const faqData: FAQItem[] = [
  // ===== 项目概述 (10题) =====
  {
    id: 1,
    category: 'overview',
    question: '什么是USD.online（数美在线）？',
    answer: 'USD.online（数美在线）是AI驱动的全球流动性与公益共建平台，融合AI×区块链×公益金融，是USDV文明生物链的孵化器与实验场。我们的愿景是让资本不再冰冷而是带有温度，让财富不止增长而是带来文明共鸣。'
  },
  {
    id: 2,
    category: 'overview',
    question: 'USD.online的核心愿景是什么？',
    answer: '我们的核心愿景是"算法即自由·叙事即价值·资本即文明"。在全球金融文明的新临界点，我们致力于将AI、区块链与公益金融融合，打造一个让资本带有温度、让财富带来文明共鸣的全球舞台。'
  },
  {
    id: 3,
    category: 'overview',
    question: 'USD.online解决了什么市场痛点？',
    answer: '我们解决三大痛点：1）传统金融的跨境资本流动受限、信息不对称；2）加密金融的流动性孤岛化、投机化严重；3）公益金融的资金不透明、善意无法放大。我们的使命是让资本与公益融合，重塑全球金融文明。'
  },
  {
    id: 4,
    category: 'overview',
    question: 'USD.online与传统金融平台有什么区别？',
    answer: '传统金融平台依赖央行与清算体系，效率低、成本高、信息不对称。USD.online通过区块链技术实现透明高效的价值创造，结合AI驱动的量化策略，同时融入公益慈善机制，形成金融×公益双重驱动模式。'
  },
  {
    id: 5,
    category: 'overview',
    question: 'USD.online的核心竞争力是什么？',
    answer: '我们的核心竞争力在于硬科技而非话术，包括：1）跨链阿尔法引擎；2）AI自适应收益轮动；3）去中心化质押金库；4）链上清晰透明协议。这四大技术护城河确保平台的长期竞争优势。'
  },
  {
    id: 6,
    category: 'overview',
    question: 'USD.online的增长模式是怎样的？',
    answer: '我们采用四阶段增长模式：1）邀请码裂变，绑定一次永久有效；2）落地页承接，愿景金句+技术逻辑+公益入口；3）白名单培育，点火→引流→裂变→巩固；4）新人7天行动营，复制SOP快速落地。'
  },
  {
    id: 7,
    category: 'overview',
    question: 'USD.online适合什么类型的投资者？',
    answer: '适合追求稳健收益、认同AI×区块链×公益理念的投资者。无论是希望获得被动收入的长期持有者，还是关注技术创新的区块链爱好者，或是希望投资兼顾社会价值的公益型投资者，都能在这里找到适合的参与方式。'
  },
  {
    id: 8,
    category: 'overview',
    question: 'USD.online的技术架构基于什么？',
    answer: '基于多链架构，整合以太坊、BSC等主流公链，采用智能合约实现自动化策略执行，结合AI算法进行风险控制和收益优化。所有操作链上可查，确保透明度和安全性。'
  },
  {
    id: 9,
    category: 'overview',
    question: 'USD.online的项目背景是什么？',
    answer: '项目诞生于全球金融大变局时代：美元霸权衰退、AI金融崛起、多极化格局形成。在SWIFT制裁、稳定币扩张、区域结算体系变革的背景下，USD.online应运而生，致力于成为数字化多极时代的金融新物种。'
  },
  {
    id: 10,
    category: 'overview',
    question: 'USD.online与USDV的关系是什么？',
    answer: 'USD.online是USDV文明生物链的孵化器与实验场。USDV是USD.online生态的核心代币，用于绑定四条链上策略的长期收益，是一种"结构化权益代币"。两者共同构成完整的生态系统。'
  },

  // ===== 跨链阿尔法引擎 (12题) =====
  {
    id: 11,
    category: 'alpha-engine',
    question: '什么是跨链阿尔法引擎？',
    answer: '跨链阿尔法引擎是USD.online的核心技术之一，定位于多链价差捕捉+订单流时间价值+新资产早期红利。通过24/7智能调度，资金在三条子策略（DEX搬砖、低风险MEV、新币狙击）间动态分配，风险等级为中等。'
  },
  {
    id: 12,
    category: 'alpha-engine',
    question: '什么是DEX搬砖套利？',
    answer: 'DEX搬砖是利用同一标的在不同链与池子出现的瞬时价差，通过低延迟撮合对冲套利获取收益。技术手段包括自建路由、批量签名、预估滑点、桥白名单与到账确认窗口。KPI包括单位资金收益、毛胜率、回撤与恢复时长。'
  },
  {
    id: 13,
    category: 'alpha-engine',
    question: 'DEX搬砖的风控措施有哪些？',
    answer: '风控措施包括：1）暂停阈值（偏差>设定bp时暂停）；2）桥延迟告警；3）池子深度下限检测。确保在市场异常时及时停止操作，保护资金安全。'
  },
  {
    id: 14,
    category: 'alpha-engine',
    question: '什么是低风险MEV策略？',
    answer: '低风险MEV是利用撮合排序的"时间价值"而非侵略性方式获取收益，包括清算尾差、延迟套利、合并路由等。通过私有RPC、Bundle提交、撤单冷却时间窗等技术手段实现，KPI包括成功率、失败成本率、Gas成本占比。'
  },
  {
    id: 15,
    category: 'alpha-engine',
    question: '低风险MEV的风控机制是什么？',
    answer: '风控机制包括：1）黑名单合约/路由过滤；2）Gas上限控制；3）自适应撤单机制。确保在成本可控的前提下获取MEV收益，避免恶意行为和过高的Gas消耗。'
  },
  {
    id: 16,
    category: 'alpha-engine',
    question: '什么是新币狙击策略？',
    answer: '新币狙击是在极早期上线/开池阶段，围绕"真项目&真流动性"做小额多点式试探与跟随的策略。包含发现（Discovery）和首次建仓（Sniping）两个阶段，目标是捕捉新资产的早期红利。'
  },
  {
    id: 17,
    category: 'alpha-engine',
    question: '新币狙击的发现机制是什么？',
    answer: '信号源包括Factory PairCreated事件、Router初加池、Launchpad日历、KOL列表、链上社媒/多签活动。过滤条件包括合约不可升级、初始LP达标、税费限制、持仓集中度等硬性标准，以及合约质量、审计状态等软性评分。'
  },
  {
    id: 18,
    category: 'alpha-engine',
    question: '新币狙击的建仓策略是什么？',
    answer: '采用微仓+网格模式，例如0.1-0.5基准单位/次，多次分布式切入。解池后延迟δ秒入场避免黑盒开盘，设置限价/滑点上限，立即挂止损/止盈。预设多档止盈（+30%、+80%、+150%分批）和硬止损（-15%/-20%）。'
  },
  {
    id: 19,
    category: 'alpha-engine',
    question: '新币狙击的风控护栏有哪些？',
    answer: '风控护栏包括：1）每日/每周策略资金上限（总池的X%）；2）单项目最大敞口（≤策略资金的y%）；3）熔断机制（连续N次异常/亏损触发暂停）；4）黑名单（可疑Factory/Router/税费合约一键全网拉黑）。'
  },
  {
    id: 20,
    category: 'alpha-engine',
    question: '跨链阿尔法引擎的透明度如何保证？',
    answer: '新币策略独立曲线与异常事件日志对外公示，所有交易可在链上追踪。披露内容包括命中率（样本数/胜率）、盈亏比、平均持有时长、Rug/税费异常事件计数与损失上限、净绩效等关键指标。'
  },
  {
    id: 21,
    category: 'alpha-engine',
    question: '跨链阿尔法引擎的资金分配逻辑是什么？',
    answer: '资金在DEX搬砖、低风险MEV、新币狙击三条子策略间24/7智能动态分配。根据市场条件、各策略的实时收益率和风险状况，AI系统自动调整各策略的资金权重，确保整体收益最大化和风险可控。'
  },
  {
    id: 22,
    category: 'alpha-engine',
    question: '跨链阿尔法引擎支持哪些链？',
    answer: '支持以太坊、BSC、Arbitrum、Polygon等主流公链，通过跨链桥实现资金在不同链间的高效调度。桥白名单和到账确认窗口确保跨链操作的安全性。'
  },

  // ===== AI自适应收益轮动 (12题) =====
  {
    id: 23,
    category: 'ai-rotation',
    question: '什么是AI自适应收益轮动？',
    answer: 'AI自适应收益轮动（预言者之脑）是用AI信号做"仓位与权重调度"，底层由三条可验证子策略执行：主流币网格交易、资金费率套利、低杠杆合约。资产范围覆盖BTC/ETH/SOL，风险等级为中低，强调回撤控制。'
  },
  {
    id: 24,
    category: 'ai-rotation',
    question: '什么是主流币网格交易？',
    answer: '网格交易是在横盘或震荡行情时，以预设价差逐级买卖，赚取来回波动的价差。AI根据波动率/成交密度/资金流动态选择有效区间和网格密度，资金分层为基础仓（β）+网格仓（α），防止单边行情被动。'
  },
  {
    id: 25,
    category: 'ai-rotation',
    question: '网格交易的风控机制是什么？',
    answer: '风控包括：1）单边趋势识别，突破通道上/下轨后自动收网、降低挂单密度或暂停；2）滑点&手续费阈值，若交易摩擦>毛利自动缩表。看板指标包括网格成交笔数、胜率、单位资金收益、最大浮亏、净收益曲线。'
  },
  {
    id: 26,
    category: 'ai-rotation',
    question: '什么是资金费率套利？',
    answer: '资金费率套利是在CEX/DEX上做现货多+永续空（或相反），吃正/负资金费。适用于期货溢价高/资金费正奖励时。多交易所采样挑选资金费稳定的平台，AI评估资金费可持续性与对手盘深度。'
  },
  {
    id: 27,
    category: 'ai-rotation',
    question: '资金费率套利如何控制风险？',
    answer: '仓位对冲确保名义敞口≈0，净暴露<阈值，到期前滚动换月。风控包括：1）极端行情保护，资金费突变或价差失衡时快速减对冲仓/调杠杆；2）对手方与通道监控，平台风险上升时触发迁徙或清仓。'
  },
  {
    id: 28,
    category: 'ai-rotation',
    question: '什么是低杠杆合约策略？',
    answer: '低杠杆合约是AI生成趋势/反转信号，仅做1-2×低杠杆，以小回撤换取更平滑收益。信号融合价格动量+资金流向+期现基差+宏观/链上情绪，判定多/空/观望。胜率回落或波动加大时自动降杠杆或轻仓。'
  },
  {
    id: 29,
    category: 'ai-rotation',
    question: '低杠杆合约的止损止盈机制是什么？',
    answer: '采用固定硬止损+波动自适应止损+分批止盈机制。风控包括：1）单侧持仓上限，单币合约净多/净空不超过策略资金的x%；2）事件熔断，大事件窗口（FOMC、ETF大额赎回等）降档或只做对冲。'
  },
  {
    id: 30,
    category: 'ai-rotation',
    question: 'AI收益轮动支持哪些资产？',
    answer: '目前资产范围覆盖BTC、ETH、SOL三大主流加密资产，可根据市场发展扩展至其他主流资产。AI系统会根据各资产的市场表现和风险特征动态调整配置权重。'
  },
  {
    id: 31,
    category: 'ai-rotation',
    question: 'AI信号是如何生成的？',
    answer: 'AI信号融合多维度数据：价格动量、资金流向、期现基差、宏观情绪、链上数据等。通过机器学习模型分析历史模式，结合实时市场数据，生成多/空/观望的交易信号和仓位建议。'
  },
  {
    id: 32,
    category: 'ai-rotation',
    question: 'AI收益轮动的看板指标有哪些？',
    answer: '看板指标包括：胜率、盈亏比、最大回撤、连续亏损笔数、持仓时长分布、净值曲线、当期平均资金费、APR（净）、名义敞口、保证金利用率、强平距离等关键数据。'
  },
  {
    id: 33,
    category: 'ai-rotation',
    question: '三条子策略如何协同工作？',
    answer: 'AI系统根据市场状态动态调度：震荡市场偏重网格交易，资金费率有利时增加套利仓位，趋势明确时启用低杠杆合约。三策略联动确保在不同市场环境下都能获取收益，降低单一策略风险。'
  },
  {
    id: 34,
    category: 'ai-rotation',
    question: 'AI收益轮动的回撤控制目标是什么？',
    answer: '策略定位为中低风险，不追求极端杠杆，强调回撤控制。通过仓位节流阀机制，在胜率回落或波动加大时自动降杠杆或轻仓，确保净值曲线平滑，最大回撤控制在可接受范围内。'
  },

  // ===== 去中心化质押金库 (10题) =====
  {
    id: 35,
    category: 'staking-vault',
    question: '什么是去中心化质押金库？',
    answer: '去中心化质押金库是稳定币挖矿版的收益策略，包含两条主线：利率与点数挖矿（占比60%）和稳定币AMM做市（占比40%）。目标是在低风险前提下获取稳定收益。'
  },
  {
    id: 36,
    category: 'staking-vault',
    question: '什么是利率与点数挖矿？',
    answer: '将稳定币分散存入头部借贷/稳币协议（如Aave、Morpho、Spark等），获取基础利率+原生激励/积分（points/空投）。在净收益为正的前提下做动态迁移与复投，覆盖USDC/USDT/DAI/FRAX等资产。'
  },
  {
    id: 37,
    category: 'staking-vault',
    question: '利率挖矿的执行要点是什么？',
    answer: '执行要点包括：1）分散投放，单协议/单对手方设上限避免集中暴露；2）净APY筛选，以（利率+激励）−（Gas+滑点）为准；3）移仓节奏控制，达到收益衰减阈值或更优目的地出现时再迁移；4）激励分期兑现与复投。'
  },
  {
    id: 38,
    category: 'staking-vault',
    question: '什么是稳定币AMM做市？',
    answer: '为稳定币对（如USDC/USDT、DAI/USDC等）提供流动性，赚取交易费+协议激励。通过集中流动性/档位移动提高资金利用率并降低无常损。候选协议包括Curve+Convex、Velodrome/Aerodrome、Uniswap V3稳定池。'
  },
  {
    id: 39,
    category: 'staking-vault',
    question: 'AMM做市的策略要点是什么？',
    answer: '策略要点：1）只做低偏离池，同类稳定币/锚定资产，历史偏离低、体量大；2）集中流动性，AI依据波动与流量移动档位；3）激励叠加，对接聚合器获取二次激励；4）费率—滑点平衡，动态权重调整。'
  },
  {
    id: 40,
    category: 'staking-vault',
    question: '质押金库的资金配比是多少？',
    answer: '默认配比为利率与点数挖矿60%、稳定币AMM做市40%。当激励季/points活跃时提升"利率与点数"权重；当成交量走高且波动回落时提升"AMM做市"权重。组合回撤阈值（如-3%/-5%）触发降档或临时保守。'
  },
  {
    id: 41,
    category: 'staking-vault',
    question: '质押金库的风控措施有哪些？',
    answer: '风控措施包括：1）协议限额，单协议≤组合的X%；2）监控审计/预言机/治理变更、TVL异常、利用率过高；3）预案准备，一键迁移脚本、7-10%现金垫、48-72小时短融窗口；4）退出通道设最小深度与最大滑点阈值。'
  },
  {
    id: 42,
    category: 'staking-vault',
    question: '质押金库的透明度如何保证？',
    answer: '透明度披露：日更各协议/各池头寸占比、组合净APY、在途资金；周更净值与回撤曲线、迁移与复投日志（Tx哈希）；月更风险事件复盘、限额与权重调整说明。所有协议与资产基于风控白名单动态筛选。'
  },
  {
    id: 43,
    category: 'staking-vault',
    question: '质押金库支持哪些稳定币？',
    answer: '覆盖主流稳定币：USDC、USDT、DAI、FRAX、crvUSD、USDe（sUSDe）等。这些资产选择基于流动性、稳定性和收益潜力的综合评估。'
  },
  {
    id: 44,
    category: 'staking-vault',
    question: '质押金库的候选协议有哪些？',
    answer: '借贷协议候选：Aave、Morpho、Spark（sDAI/DSR）、FraxLend、Ethena（sUSDe）。AMM协议候选：Curve+Convex、Velodrome/Aerodrome、Uniswap V3稳定池。实际投放基于风控白名单、审计状态与实时指标动态筛选。'
  },

  // ===== 链上透明协议/IDO (8题) =====
  {
    id: 45,
    category: 'ido',
    question: '什么是链上清晰透明协议？',
    answer: '链上清晰透明协议是打新/IDO模块，只参与头部、可信项目的官方IDO（如MegaETH/Plasma），小额分散，纪律化兑现，全流程可追踪。目标是在风险可控的前提下捕捉优质项目的早期红利。'
  },
  {
    id: 46,
    category: 'ido',
    question: 'IDO参与的准入标准是什么？',
    answer: '硬门槛包括：1）合约开源+≥1家审计，可升级需多签+时间锁；2）发行规则明确，总量/初始流通/解锁曲线/LP安排公开可验证；3）初始LP锁仓/销毁可查；4）KYC/KYB与区域限制合规。'
  },
  {
    id: 47,
    category: 'ido',
    question: 'IDO的资金与仓位管理是怎样的？',
    answer: '资金管理规则：1）单项目上限≤打新资金池的10-20%；2）当日累计上限≤金库规模的2-5%；3）同赛道同日参与数设上限，避免相关性踩踏。确保风险分散，单一项目失败不会造成重大损失。'
  },
  {
    id: 48,
    category: 'ido',
    question: 'IDO的申购与兑现流程是什么？',
    answer: '申购流程：仅走官方IDO合约，设最高可接受价格带与Gas/滑点阈值。兑现流程：领取后进入Vesting地址，按TGE+线性解锁分批卖出，预设止盈阶梯（+30%/+80%/+150%）与硬止损（-20%），支持TWAP分片成交。'
  },
  {
    id: 49,
    category: 'ido',
    question: 'IDO模块如何保证透明度？',
    answer: '公开地址簿（Vault/Launch/Vesting/Realize）与全部交易哈希。看板显示申购金额、均价、滑点、胜率/盈亏比、单位资金净收益、最大回撤等关键指标，所有操作链上可查。'
  },
  {
    id: 50,
    category: 'ido',
    question: 'IDO模块的风控边界是什么？',
    answer: '风控边界：1）税费陷阱/黑名单/可冻结条款项目一票否决；2）连续异常或回撤超阈值时本策略暂停/降权；3）预留7-10%现金垫应对延期/回购。明确声明不承诺收益，仅执行规则内可验证参与与纪律化兑现。'
  },
  {
    id: 51,
    category: 'ido',
    question: 'IDO参与的项目类型有哪些？',
    answer: '只参与头部、可信项目的官方IDO，如MegaETH、Plasma等经过严格筛选的项目。不参与小型、未经审计、规则不透明的项目，确保参与质量和风险可控。'
  },
  {
    id: 52,
    category: 'ido',
    question: '为什么选择纪律化兑现而非长期持有？',
    answer: '纪律化兑现通过预设的止盈阶梯和止损规则，在市场波动中锁定收益、控制风险。相比主观判断的长期持有，纪律化兑现更能避免情绪化决策，确保收益的可预期性和风险的可控性。'
  },

  // ===== USDV代币 (10题) =====
  {
    id: 53,
    category: 'usdv',
    question: '什么是USDV代币？',
    answer: 'USDV是USD.online生态的核心代币，用于绑定四条链上策略的长期收益，是一种"结构化权益代币"。它不是单纯的投机标的，而是文明生物链的价值载体，代表着AI×区块链×公益金融融合的新金融物种。'
  },
  {
    id: 54,
    category: 'usdv',
    question: 'USDV的定位是什么？',
    answer: 'USDV定位为"站在大势之上的金融新物种"，不是产品而是文明的跃迁。在美元霸权衰退、AI金融崛起、多极化格局形成的背景下，USDV承载着重塑全球金融文明的使命。'
  },
  {
    id: 55,
    category: 'usdv',
    question: 'USDV与四大策略的关系是什么？',
    answer: 'USDV绑定四条链上策略（跨链阿尔法引擎、AI自适应收益轮动、去中心化质押金库、链上清晰透明协议）的长期收益。持有USDV相当于持有这四大策略组合的权益份额。'
  },
  {
    id: 56,
    category: 'usdv',
    question: '如何获取USDV代币？',
    answer: '可以通过平台参与投资获取USDV奖励，或通过邀请好友获得推荐奖励。具体获取方式和数量取决于参与的策略类型、投资金额和锁定期限等因素。'
  },
  {
    id: 57,
    category: 'usdv',
    question: 'USDV的价值来源是什么？',
    answer: 'USDV的价值来源于：1）四大策略的真实收益支撑；2）生态系统的网络效应；3）公益慈善带来的社会认同；4）合规化进程带来的机构信任。这些因素共同构成USDV的内在价值基础。'
  },
  {
    id: 58,
    category: 'usdv',
    question: 'USDV是稳定币吗？',
    answer: 'USDV不是稳定币，而是"结构化权益代币"。它的价值与平台四大策略的收益表现挂钩，具有一定的价格波动性，但通过多策略组合和风控机制，力求实现稳健增值。'
  },
  {
    id: 59,
    category: 'usdv',
    question: 'USDV的使用场景有哪些？',
    answer: 'USDV可用于：1）参与平台治理投票；2）获取策略收益分配；3）享受平台费用优惠；4）参与公益慈善活动；5）作为生态内支付媒介。更多使用场景将随生态发展持续扩展。'
  },
  {
    id: 60,
    category: 'usdv',
    question: 'USDV的发行机制是什么？',
    answer: 'USDV采用与策略收益挂钩的发行机制，确保代币发行与实际价值创造同步。具体发行规则遵循透明、可验证的链上逻辑，避免无节制增发稀释持有者权益。'
  },
  {
    id: 61,
    category: 'usdv',
    question: 'USDV如何参与生态治理？',
    answer: '持有USDV的用户可以参与平台重要决策的投票，包括策略参数调整、新功能上线、公益项目选择等。治理权重与持有数量和锁定期限相关，鼓励长期持有和深度参与。'
  },
  {
    id: 62,
    category: 'usdv',
    question: 'USDV与传统权益代币有什么区别？',
    answer: 'USDV的独特之处在于：1）收益来源透明可验证（链上策略）；2）融合公益慈善机制；3）背靠AI×区块链技术；4）追求合规化发展。这使它超越了单纯的投机标的，成为文明生物链的价值载体。'
  },

  // ===== 公益慈善 (10题) =====
  {
    id: 63,
    category: 'charity',
    question: 'USD.online如何支持公益？',
    answer: 'USD.online采用金融×公益双重驱动模式。平台净收益的一部分自动进入"自闭症儿童关怀基金"，善意资金流向全链可查，形成"善意可见、信任可循"的透明公益机制。'
  },
  {
    id: 64,
    category: 'charity',
    question: '什么是自闭症儿童关怀基金？',
    answer: '这是USD.online设立的专项公益基金，用于支持自闭症儿童的康复治疗、教育培训和家庭支持。基金运作全程链上透明，每一笔善款流向都可追踪验证。'
  },
  {
    id: 65,
    category: 'charity',
    question: '公益资金的注入机制是什么？',
    answer: '平台净收益的固定比例自动注入公益金库，通过智能合约执行，无需人工干预。这确保了公益承诺的执行不受主观因素影响，形成可持续的公益机制。'
  },
  {
    id: 66,
    category: 'charity',
    question: '如何查看公益资金流向？',
    answer: '所有公益资金流向都在区块链上公开记录，用户可以通过平台的公益透明看板或直接在链上查询每一笔善款的来源、金额、流向和使用情况，做到"善意可见、信任可循"。'
  },
  {
    id: 67,
    category: 'charity',
    question: '什么是全球公益榜单？',
    answer: '全球公益榜单展示平台用户的公益贡献排名，让捐助成为荣誉，形成正向竞争与信任共鸣。通过榜单机制，鼓励更多用户参与公益，扩大善意的影响力。'
  },
  {
    id: 68,
    category: 'charity',
    question: '投资者如何参与公益？',
    answer: '投资者参与平台投资即自动参与公益，因为平台收益的一部分会自动注入公益基金。此外，投资者也可以选择额外捐赠或参与特定公益活动，获得公益榜单排名和荣誉认证。'
  },
  {
    id: 69,
    category: 'charity',
    question: '为什么选择关注自闭症儿童？',
    answer: '自闭症儿童是需要长期关注和支持的群体，康复治疗和教育成本高昂，很多家庭面临巨大压力。USD.online希望通过持续的资金支持，为这些家庭提供实质性帮助，体现"资本带有温度"的理念。'
  },
  {
    id: 70,
    category: 'charity',
    question: '公益机制如何保证可持续性？',
    answer: '公益资金注入与平台收益挂钩，通过智能合约自动执行，形成"赚钱即做善事"的正向循环。只要平台持续运营产生收益，公益基金就会持续获得资金注入，确保长期可持续。'
  },
  {
    id: 71,
    category: 'charity',
    question: '公益活动的执行方是谁？',
    answer: '公益基金由专业的公益机构负责执行，确保善款用于实际帮助自闭症儿童和家庭。USD.online负责资金募集和链上透明披露，专业机构负责项目执行和效果评估。'
  },
  {
    id: 72,
    category: 'charity',
    question: 'USD.online的公益理念是什么？',
    answer: '我们相信资本不只是财富的放大器，更是善意的加速器。通过将金融投资与公益慈善融合，让每一份投资都能产生双重价值——既为投资者创造收益，也为社会创造福祉。'
  },

  // ===== 合规监管 (8题) =====
  {
    id: 73,
    category: 'compliance',
    question: 'USD.online的合规愿景是什么？',
    answer: '已启动与英国FCA（金融行为监管局）与新加坡MAS（金融管理局）的合规筹备。路径为：备案→沙盒测试→豁免框架→全球化监管对接。目标是打造全球资本市场的"信任护照"。'
  },
  {
    id: 74,
    category: 'compliance',
    question: '为什么要选择FCA和MAS监管？',
    answer: 'FCA和MAS是全球最权威的金融监管机构之一，获得其认可意味着达到国际最高标准的合规要求。这不仅是法律保障，更是向全球投资者展示平台专业性和可信度的重要背书。'
  },
  {
    id: 75,
    category: 'compliance',
    question: '合规化进程的当前阶段是什么？',
    answer: '目前处于合规筹备阶段，正在准备相关申请材料和合规框架设计。预计将依次完成备案、沙盒测试、豁免框架申请等步骤，逐步实现全球化监管对接。'
  },
  {
    id: 76,
    category: 'compliance',
    question: '合规化对投资者有什么好处？',
    answer: '合规化为投资者提供：1）法律层面的权益保障；2）资金安全的制度保证；3）纠纷处理的正规渠道；4）平台运营的透明监督。合规不仅是护盾，更是USD.online走向全球的入场券。'
  },
  {
    id: 77,
    category: 'compliance',
    question: 'USD.online如何处理不同地区的监管差异？',
    answer: '我们采用"全球化监管对接"策略，根据不同地区的监管要求提供差异化的服务和合规方案。优先获取主要金融中心的监管认可，再逐步扩展到其他地区。'
  },
  {
    id: 78,
    category: 'compliance',
    question: 'KYC/AML政策是怎样的？',
    answer: '平台严格执行KYC（客户身份识别）和AML（反洗钱）政策，用户需要完成身份验证才能参与投资。这既是监管要求，也是保护用户和平台免受非法资金侵害的必要措施。'
  },
  {
    id: 79,
    category: 'compliance',
    question: '投资者资金如何得到保障？',
    answer: '投资者资金通过多重机制保障：1）智能合约托管，资金流向透明可查；2）分散投放，避免集中风险；3）风控系统实时监控；4）预留现金垫应对极端情况；5）合规化运营接受监管审查。'
  },
  {
    id: 80,
    category: 'compliance',
    question: '什么是"信任护照"概念？',
    answer: '"信任护照"是指通过获得全球主要金融监管机构的认可，使USD.online能够在世界各地合法合规运营，为全球投资者提供服务。这是平台国际化发展的核心战略目标。'
  },

  // ===== 团队介绍 (10题) =====
  {
    id: 81,
    category: 'team',
    question: 'USD.online的创始人是谁？',
    answer: 'CC是USD.online创始人，全球稳定币架构师、总统家族数字资产顾问、跨境资本与AI风控专家。过去8年历史管理规模（AUM）累计超过150亿美元，毕业于伦敦政治经济学院（LSE）。'
  },
  {
    id: 82,
    category: 'team',
    question: 'CC有什么独特背景？',
    answer: 'CC曾受邀加入总统家族的加密资产办公室担任核心数字资产顾问，为其加密资产配置、稳定币储备机制、AI风控体系与全球加密政策研究提供战略建议。这是全球极其罕见的经历，意味着他在美国顶级政治与家族资本体系中持有高度信任与信息权限。'
  },
  {
    id: 83,
    category: 'team',
    question: 'Mr.Lee的背景是什么？',
    answer: 'Mr.Lee是深耕瑞士金融体系超过十五年的高级管理者，曾在UBS瑞银集团担任多个关键领导岗位，职业生涯始于Credit Suisse，后加入波士顿咨询公司（BCG）从事全球金融机构战略咨询。在苏黎世、伦敦、新加坡等主要银行中心拥有丰富经验。'
  },
  {
    id: 84,
    category: 'team',
    question: 'Mr.Micheal负责什么？',
    answer: 'Mr.Micheal是联合创始人&CTO（AI/量化），前就职于华尔街Renaissance Technologies对冲基金，覆盖统计套利、做市、资金效率调度。在Web3侧主导链上数据采集、异常检测、MEV风险防护方案，负责Alpha引擎与清算引擎技术路线。毕业于美国耶鲁大学计算机系。'
  },
  {
    id: 85,
    category: 'team',
    question: 'Mouad的职责是什么？',
    answer: 'Mouad是USD.online机构与资本市场负责人&CMO，负责头部与区域型CEX上币与充提现接入、做市联盟与护航机制，拓展托管、审计、预言机、支付与风控厂商合作版图，共建投资者沟通、二级流动性与回购执行的协同机制。'
  },
  {
    id: 86,
    category: 'team',
    question: 'Omar的背景是什么？',
    answer: 'Omar R. Al-Sayegh是USD.online首席财务官&CFO，迪拜主权资本背景，拥有超过17年在主权财富基金、中东家族办公室、跨境清算机构与数字金融监管框架（VARA/ADGM）的综合经验。是中东地区少数能同时理解TradFi+Web3+RegTech交叉领域的专家。'
  },
  {
    id: 87,
    category: 'team',
    question: '团队的核心优势是什么？',
    answer: '团队汇聚了顶级金融机构（瑞银、BCG）、顶级量化基金（Renaissance Technologies）、主权资本（迪拜主权基金）和顶级学府（LSE、耶鲁）的人才。覆盖传统金融、量化交易、区块链技术、合规监管等全方位能力。'
  },
  {
    id: 88,
    category: 'team',
    question: '团队在量化交易方面有什么经验？',
    answer: 'CTO Mr.Micheal前就职于Renaissance Technologies，这是全球最成功的量化对冲基金之一。他带领团队在统计套利、做市、资金效率调度、实时风控系统等方面积累了丰富经验，为USD.online的量化策略提供核心技术支撑。'
  },
  {
    id: 89,
    category: 'team',
    question: '团队在传统金融方面有什么资源？',
    answer: 'Mr.Lee在瑞银、波士顿咨询等顶级机构的丰富经验，Omar在迪拜主权基金的背景，使团队拥有深厚的传统金融资源和人脉网络。这为平台的合规化发展、机构合作和全球化扩展提供了重要支撑。'
  },
  {
    id: 90,
    category: 'team',
    question: '团队成员的教育背景如何？',
    answer: '团队成员毕业于全球顶级学府：CC毕业于伦敦政治经济学院（LSE），Mr.Micheal毕业于耶鲁大学计算机系。顶级学术背景确保团队具备扎实的理论基础和全球化视野。'
  },

  // ===== 投资指南 (10题) =====
  {
    id: 91,
    category: 'guide',
    question: '如何开始在USD.online投资？',
    answer: '首先连接钱包，完成身份验证；然后选择投资策略和金额，确认锁定期限；最后授权并完成投资。平台提供详细的引导流程，新手也能轻松上手。'
  },
  {
    id: 92,
    category: 'guide',
    question: '最低投资金额是多少？',
    answer: '不同策略可能有不同的最低投资要求，具体金额请参考平台投资页面的实时信息。我们致力于降低参与门槛，让更多用户能够参与。'
  },
  {
    id: 93,
    category: 'guide',
    question: '投资收益如何计算？',
    answer: '收益基于日复利计算，实际收益取决于所选策略的表现、投资金额和锁定期限。平台提供收益计算器，可以预估不同投资方案的预期收益。'
  },
  {
    id: 94,
    category: 'guide',
    question: '资金什么时候可以取出？',
    answer: '取款规则取决于所选策略的锁定期限。锁定期满后可以随时申请取款，资金将在处理周期内到达您的钱包。具体时间请参考各策略的说明。'
  },
  {
    id: 95,
    category: 'guide',
    question: '投资有什么风险？',
    answer: '所有投资都有风险，包括但不限于：市场波动风险、智能合约风险、策略执行风险等。平台通过多策略分散、风控机制、透明披露等方式降低风险，但不能保证本金安全或固定收益。'
  },
  {
    id: 96,
    category: 'guide',
    question: '如何邀请好友获得奖励？',
    answer: '在平台获取您的专属邀请码或邀请链接，分享给好友。好友通过您的邀请注册并投资后，您将获得相应的推荐奖励。邀请码绑定一次，永久有效。'
  },
  {
    id: 97,
    category: 'guide',
    question: '支持哪些钱包连接？',
    answer: '平台支持主流加密钱包连接，包括MetaMask、OKX Wallet等。请确保您的钱包已安装并包含足够的资产用于投资。'
  },
  {
    id: 98,
    category: 'guide',
    question: '如何查看投资收益和持仓？',
    answer: '登录平台后，在用户中心可以查看您的所有投资持仓、累计收益、待领取收益等详细信息。所有数据实时更新，也可以在链上验证。'
  },
  {
    id: 99,
    category: 'guide',
    question: '遇到问题如何获得帮助？',
    answer: '您可以通过平台的客服系统查找常见问题解答，也可以通过官方社区渠道联系客服团队。我们致力于为用户提供及时、专业的支持服务。'
  },
  {
    id: 100,
    category: 'guide',
    question: '平台收取什么费用？',
    answer: '平台费用结构透明，主要包括策略执行费和提款手续费。具体费率会在投资确认前明确显示，确保用户充分了解成本。持有USDV代币可能享受费用优惠。'
  },
];

export const getQuestionsByCategory = (categoryId: string): FAQItem[] => {
  return faqData.filter(item => item.category === categoryId);
};

export const searchQuestions = (keyword: string): FAQItem[] => {
  const lowerKeyword = keyword.toLowerCase();
  return faqData.filter(
    item => 
      item.question.toLowerCase().includes(lowerKeyword) ||
      item.answer.toLowerCase().includes(lowerKeyword)
  );
};
