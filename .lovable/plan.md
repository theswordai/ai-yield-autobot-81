
## 目标
在项目「更多」入口下新增一个全新的 DeFi 锁仓产品：传奇锁仓（Legendary Staking），对接两个新的链上合约，包含 Dashboard、存款、仓位、邀请、奖励、FAQ 六个子页面。

## 技术栈说明（重要）
你给的需求里写了 wagmi/viem + RainbowKit，但本项目现有栈是 **ethers v6 + 自研 useWeb3 hook**（BSC 强制切链、注入钱包检测、Toast、轮询都已实现）。为避免引入两套不兼容的钱包体系，本次实现**沿用现有 ethers + useWeb3 模式**，钱包连接、链切换、错误 Toast 全部复用现成基础设施。功能行为与你描述的 wagmi 版完全一致。如你坚持要 wagmi/RainbowKit，请告诉我，我会单独迁移（工作量较大）。

## 链上配置
- 网络：BSC 主网（chainId 56），强制切链已存在
- USDT：`0x55d398326f99059fF775485246999027B3197955`（decimals 18，已配置）
- LegendaryStaking：`0x3ebaedb612fff6f5590f25191b445737ec238a30`
- ReferralRegistry：`0x991d90cbbBd2bDE04e7906D160A6B36CEA56D2cF`

## 业务规则（要落到代码里）
- 池1：钱包 USDT 直存，锁 365 天，APR = 260% + min(amount/5000 × 3%, 30%)，最低 200
- 池2：仅可由池1/池2 的未领利息复投进入，锁 365 天，APR 360%，最低 200
- 提前赎回扣 50% 本金，利息照付
- 邀请一次性 bind，需上线 selfStake ≥ 200；URL `?ref=0x...` 自动填入
- 直推 4.5% / 间推 3%，需上线 selfStake ≥ 200，否则跳过不补
- 动态分红：入金 × 10%，沿上级链最多 15 人按 V1~V6（10/12/15/18/20/25%）档内均分，缺档不发
- V1~V6 门槛：(200,1k)/(1k,50k)/(3k,150k)/(10k,500k)/(20k,1M)/(30k,2M)
- 领奖 24h 冷却：`lastClaimAt(user) + 86400 - now`

## 改动文件清单

### 新增
- `src/config/legendary.ts` — 合约地址、常量、等级表
- `src/abis/LegendaryStaking.ts` — 合约 ABI（人类可读字符串数组）
- `src/abis/LegendaryReferral.ts` — 合约 ABI
- `src/hooks/useLegendary.ts` — 只读+只写合约实例 + 30s 轮询的 dashboard 数据 hook
- `src/hooks/useLegendaryActions.ts` — deposit / claimInterest / withdraw / earlyWithdraw / compoundToPool2 / claimRewards / bind，统一 toast + revert reason 解析
- `src/pages/Legendary.tsx` — 顶层 Tab 容器（Dashboard / 存款 / 仓位 / 邀请 / 奖励 / FAQ）
- `src/components/legendary/` 下 6 个子组件：`DashboardTab.tsx` `DepositTab.tsx` `PositionsTab.tsx` `ReferralTab.tsx` `RewardsTab.tsx` `FaqTab.tsx`

### 修改
- `src/App.tsx` — 注册路由 `/zh/legendary` `/en/legendary`
- `src/components/AppSidebar.tsx` — 「更多」分组下新增「传奇锁仓」入口（图标 + 中英文）
- `src/components/MobileBottomNav.tsx` — 如需也加入（仅当桌面 sidebar 已展示则跳过移动端）

## 交互规范（统一）
- 金额 `formatUnits(value, 18)` 保留 4 位小数
- 写操作前检查 `paused()` 和 `frozen(user)`，命中则按钮禁用 + 友好中文提示
- USDT approve：`allowance >= amount` 跳过；否则 approve max
- 所有写操作 loading 态 + sonner toast；revert reason 映射：`below min` → "低于最低门槛"，`not authorized` → "未授权"，`frozen` → "账户已冻结"，`paused` → "合约已暂停"，其它 BAD_DATA/CALL_EXCEPTION 按项目规则**静默回退**
- 30s 轮询 + 写操作后立即手动 refetch
- 事件流页面：监听最近 5000 区块的 `ReferralAccrued / DynamicAccrued / RewardsClaimed`

## 设计风格
沿用全局 glass-morphism（12px blur、半透明边框）、60px 网格、APR 与 APY（按日复利）同时展示规则（符合项目 Core 记忆）。

## v1 不包含
- wagmi/RainbowKit 迁移
- 后端持久化历史事件（只走链上日志即时拉取）
- i18n 完整字段（首版直接中文，英文 fallback 同字）

确认后我开始实现。
