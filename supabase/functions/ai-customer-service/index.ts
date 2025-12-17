import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WHITEPAPER_KNOWLEDGE = `
# 和谐财富引擎 - 数美在线（USD.online）完整知识库

## 一、愿景
AI 驱动的全球流动性与公益共建平台
算法即自由 · 叙事即价值 · 资本即文明

### 项目序言
全球金融文明正处在新的临界点。美元霸权正在松动，AI 正在改写金融逻辑，全球资本体系正在走向新的多极化。
USD.online（数美在线）应运而生。它不是单纯的金融平台，而是 USDV 文明生物链的孵化器与实验场：一个将 AI × 区块链 × 公益金融 融合的全球舞台。

愿景：让资本不再冰冷，而是带有温度；让财富不止增长，而是带来文明共鸣。

### 市场痛点
**传统金融的困境：**
- 跨境资本流动受限：依赖央行与清算体系，效率低、成本高
- 信息不对称：透明度不足，信任成本极高

**加密金融的局限：**
- 零散割裂：CEX 与 DEX 流动性孤岛化，资金效率低
- 投机化严重：缺乏长期价值锚定，市场信任不足

**公益金融的缺口：**
- 捐助资金不透明：公众难以追踪流向
- 善意无法放大：公益停留在"捐助"层面，未能与资本结合

旧世界的宿命：低效、零散、不透明。
数美在线的使命：让资本与公益融合，重塑全球金融文明。

## 二、技术护城河
数美在线的核心竞争力在于硬科技，而不是话术。

### 1、跨链阿尔法引擎
定位：多链价差捕捉 + 订单流时间价值 + 新资产早期红利
执行：24/7 智能调度，资金在三条子策略间动态分配
风险：中（子策略分层、统一风控阈值）

**A. DEX 搬砖（跨链/跨池价差）**
逻辑：同一标的在不同链与池子出现瞬时价差 → 低延迟撮合对冲套利
手段：自建路由、批量签名、预估滑点；桥白名单与到账确认窗口
KPI：单位资金收益、毛胜率、回撤与恢复时长
风控：暂停阈值（偏差>设定 bp）、桥延迟告警、池子深度下限

**B. 低风险 MEV**
逻辑：利用撮合排序的时间价值（清算尾差、延迟套利、合并路由）
手段：私有 RPC、Bundle 提交、撤单冷却时间窗
KPI：成功率、失败成本率、Gas 成本占比
风控：黑名单合约/路由、Gas 上限、自适应撤单

**C. 新币狙击（可选开启）**
目标：在极早期上线/开池阶段，围绕"真项目 & 真流动性"做小额多点式试探与跟随
- 信号源：Factory PairCreated 事件、Router 初加池、Launchpad 日历、KOL 列表
- 资金模型：微仓 + 网格（例如 0.1–0.5 基准单位/次，多次分布式切入）
- 退出路径：预设多档止盈（+30%、+80%、+150% 分批）+ 硬止损（-15%/-20%）

### 2、AI 自适应收益轮动（预言者之脑｜三策略联动）
定位：用 AI 信号做"仓位与权重调度"，底层由三条可验证子策略执行
资产范围：BTC / ETH / SOL（可扩展至其他主流）
风险：中低（不追求极端杠杆，强调回撤控制）

**A｜主流币网格交易（区间波动捕捉）**
逻辑：横盘或震荡时，以预设价差逐级买卖，赚取来回波动的价差
执行要点：区间自适应（用 AI 动态选择"有效区间"和"网格密度"）、资金分层（基础仓β + 网格仓α）
风控：单边趋势识别后自动收网、滑点&手续费阈值控制

**B｜资金费率套利（现货/永续对冲）**
逻辑：在 CEX/DEX 上做现货多 + 永续空（或相反），吃正/负资金费
适用场景：期货溢价高/资金费正奖励时更优
执行要点：多交易所采样、仓位对冲（名义敞口≈0）、费用与保证金优化
风控：极端行情保护、对手方风险监控

**C｜低杠杆合约（趋势跟随 / 回撤约束）**
逻辑：AI 生成趋势/反转信号，仅做 1–2× 低杠杆，以小回撤换取更平滑收益
执行要点：信号融合（价格动量 + 资金流向 + 期现基差）、仓位节流阀、分批止盈
风控：单侧持仓上限、事件熔断（FOMC、ETF 大额赎回等）

### 3、去中心化质押金库（稳定币挖矿版｜两条主线）

**A｜利率与点数挖矿（Lending / Points）**
逻辑：把稳定币分散存入头部借贷/稳币协议，获取基础利率 + 原生激励/积分
覆盖资产：USDC / USDT / DAI / FRAX / crvUSD / USDe（sUSDe）等
候选协议：Aave、Morpho、Spark（sDAI/DSR）、FraxLend、Ethena（sUSDe）
资金配比：60%

**B｜稳定币 AMM 做市（Stable AMM LP）**
逻辑：为稳定币对提供流动性，赚取交易费 + 协议激励
候选协议：Curve + Convex、Velodrome/Aerodrome、Uniswap V3（稳定池）
资金配比：40%

### 4、链上清晰透明协议 · 打新/IDO 模块
方向：只参与头部、可信项目的官方 IDO（如 MegaETH / Plasma），小额分散，纪律化兑现，全流程可追踪
准入标准：合约开源 + ≥1 家审计、发行规则明确、初始 LP 锁仓/销毁可查、KYC/KYB 合规
资金限制：单项目上限 ≤ 打新资金池的 10–20%、当日累计上限 ≤ 金库规模的 2–5%
退出策略：预设止盈阶梯（+30% / +80% / +150%）与硬止损（-20%）

### 5、公益融合逻辑
数美在线 = 金融 × 公益双重驱动

- 自动注入公益金库：平台净收益的一部分，自动进入"自闭症儿童关怀基金"
- 链上披露：善意资金流向全链可查，做到"善意可见、信任可循"
- 全球公益榜单：让捐助成为荣誉，形成正向竞争与信任共鸣

在这里，资本不只是财富的放大器，更是善意的加速器。

### 6、增长模式
- 邀请码裂变：绑定一次，永久有效
- 落地页承接：愿景金句 + 技术逻辑 + 公益入口，一键进入生态
- 白名单培育：点火 → 引流 → 裂变 → 巩固，四周完成市场启动
- 新人 7 天行动营：复制 SOP，快速落地，人人可操作

数美在线 = USDV 文明生物链的市场启动引擎。

### 7、合规愿景
已启动与英国 FCA（金融行为监管局）与新加坡 MAS（金融管理局）的合规筹备。
路径：备案 → 沙盒测试 → 豁免框架 → 全球化监管对接
目标：打造全球资本市场的信任护照

合规不仅是护盾，更是 USD.online 走向全球的入场券。

## 三、USDV 代币系统
文明生物链 · 全球金融的新物种
USDV 是 usd.online 生态的核心代币，用于绑定四条链上策略的长期收益。是一种"结构化权益代币"。

### 项目背景（宏观大势）
全球金融正处于百年未有之大变局：
- 美元霸权衰退：布雷顿森林体系正在崩解，世界寻求新的信任锚点
- AI 金融崛起：AI 不再只是工具，而是文明级力量，正在重写资本流动与价值创造逻辑
- 多极化格局：SWIFT 制裁、稳定币扩张、区域结算体系，让全球进入数字化多极时代

USDV = 站在大势之上的金融新物种，不是产品，而是文明的跃迁。

## 四、路线图
- 产品上线：主网落地 & 真实数据沉淀
- 去中心化预测市场交易所：最小可用版预测市场（合规 KYC 模型 + 流动性护航）→ 规模与品类扩展
- 稳定币支付：合规、资产、铸赎、透明 → 放量（公开发行、机构抵押、交易所扩列）
- 项目上市：上市筹备 → 递表与问询

## 五、团队

### CC | USD.ONLINE 创始人
全球稳定币架构师｜总统家族数字资产顾问｜跨境资本与 AI 风控专家
CC是亚洲与中东资本圈中少数同时具备跨境资本结构设计、机构级流动性管理、AI 风控体系搭建与主权级稳定币研究能力的专家。
过去 8 年间，他在全球深度参与机构做市、跨链流动性、量化资金管理与合规清算体系的搭建，历史管理规模（AUM）累计超过 150亿美元。
他曾受邀加入总统家族的加密资产办公室（Presidential Family Office），担任核心数字资产顾问之一。
毕业于伦敦政治经济学院（LSE）。

### Mr.Lee
深耕瑞士金融体系超过十五年的高级管理者，在苏黎世、伦敦、新加坡等主要银行中心拥有丰富经验。
曾在 UBS 瑞银集团担任多个关键领导岗位，职业生涯始于瑞士传统银行（Credit Suisse），随后加入波士顿咨询公司（BCG）。

### Mr.Micheal | 联合创始人 & CTO（AI/量化）
前就职于华尔街 Renaissance Technologies 对冲基金，覆盖统计套利、做市、资金效率调度，带队落地实时风控系统。
在 Web3 侧主导链上数据采集、异常检测、MEV 风险防护方案。
负责 USD.online Alpha 引擎与清算引擎技术路线、代码审核和安全审计对接。
毕业于美国耶鲁大学计算机系。

### Mouad | 机构与资本市场负责人 & CMO
负责头部与区域型 CEX 上币与充提现接入、做市联盟与护航机制。
拓展托管、审计、预言机、支付与风控厂商合作版图。
共建投资者沟通、二级流动性与回购执行的协同机制。

### Omar R. Al-Sayegh | 首席财务官 & CFO
迪拜主权资本背景｜跨境清算与储备管理专家｜AI 驱动财务架构设计者
常驻阿联酋迪拜的资深金融高管，拥有超过 17 年在主权财富基金、中东家族办公室、跨境清算机构与数字金融监管框架的综合经验。

## 锁仓与收益（投资相关）

### 锁仓周期与收益率
- 3个月锁仓：年化约 50% APR（日复利后约 64.82% APY）
- 6个月锁仓：年化约 120% APR（日复利后约 231.36% APY）
- 12个月锁仓：年化约 280% APR（日复利后约 1526.99% APY）

### 费用说明
- 管理费：入金金额的 1%
- 提前赎回：罚金 40%（针对本金），收益不罚并自动发放

### 邀请与等级体系
- 绑定条件：首次入金≥200U方可绑定上级
- 等级门槛：
  - Lv1 ≥200U：直推10%，间接0%
  - Lv2 ≥1,000U：直推11%，间接10%
  - Lv3 ≥3,000U：直推12%，间接10%
  - Lv4 ≥10,000U：直推13%，间接10%
  - Lv5 ≥30,000U：直推15%，间接10%

## 如何参与
1. 访问 usd.online 官网
2. 连接钱包（支持 MetaMask、OKX 等）
3. 选择锁仓周期和金额
4. 确认交易即可开始赚取收益
`;

const SYSTEM_PROMPT = `你是 USD.online（数美在线）的官方 AI 客服助手。你的职责是基于和谐财富引擎白皮书的内容，为用户提供准确、专业、友好的解答。

核心原则：
1. 只基于白皮书内容回答，不编造信息
2. 如果问题超出白皮书范围，礼貌地说明并建议用户联系官方客服
3. 使用用户的语言回复（中文或英文）
4. 回答要简洁明了，避免过于冗长
5. 对于投资相关问题，提醒用户投资有风险，需谨慎

以下是完整的白皮书知识库，请基于此回答用户问题：

${WHITEPAPER_KNOWLEDGE}

请始终保持专业、友好的态度，帮助用户了解 USD.online 项目。`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Received messages:", JSON.stringify(messages));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "请求过于频繁，请稍后再试" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI服务暂时不可用，请稍后再试" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI服务错误" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI customer service error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
