## Flexible Pool 活期理财页面

合约：`0x709020b91e5e8405e96eee06bfb2a0a3ae4d6004` (BSC)，USDT (`0x55d398326f99059fF775485246999027B3197955`, 18 decimals)。

ABI 已从 BscScan 拉取并核对完毕，所有需求函数都存在。

### 关键 ABI 摘要（已确认）

**写入**：`bind(address)`、`deposit(uint256) -> positionId`、`closePosition(uint256)`、`claimCommission()`

**读取**（按页面区块归类）：
- 用户数据：`principalOf(user)`（我的活期本金）、`directPrincipalOf(user)`（直推本金）、`getLevelPrincipal(user)`（等级本金=自己+直推）、`getLevel(user)`（0–5）、`getMaxGeneration(user)`（可拿代数）、`claimableCommission(user)`、`inviterOf(user)`、`getDirects(user)`
- 仓位：`getUserPositions(user)`、`getOpenPositions(user)`、`positions(id) -> (user, principal, startTime, lastAccruedAt, closed)`、`pendingYield(id)`、`previewClose(id) -> (principal, yieldAmt, principalFee, yieldFee, netPaid)`
- 全局：`apr()` (bps)、`minDeposit()`、`PRINCIPAL_FEE_BPS`、`YIELD_FEE_BPS`、`COMMISSION_FEE_BPS`、`paused`、`frozen`、`totalPrincipal`、`contractBalance`

**重要发现**（需求里没提到，但页面必须呈现，否则用户会困惑）：
- 平仓时合约会从**本金**和**利息**各扣一笔费用，所以「Close Position」之前必须用 `previewClose` 显示净到账金额（principal、yield、principalFee、yieldFee、netPaid 五个数字）
- 领取佣金时也有 `COMMISSION_FEE_BPS` 手续费
- 合约有 `paused` / `frozen` 开关，需在页面顶部根据状态禁用操作并提示

### 路由
- `src/App.tsx`：新增 `/zh/flexible`、`/en/flexible`，以及 `/flexible` → `/zh/flexible` 兜底
- 导航入口：`Navbar.tsx`（PC）+ `MobileBottomNav.tsx`（移动）增加「活期 / Flexible」

### 新增文件

1. **`src/abis/FlexiblePool.ts`** —— 完整 ABI（来自 BscScan）
2. **`src/config/flexible.ts`** —— `FLEXIBLE_ADDRESS = 0x7090...`、`USDT_BSC = 0x55d3...`、`USDT_DECIMALS = 18`
3. **`src/hooks/useFlexibleData.ts`** —— 一次性读取所有用户/全局数据，30s 自动刷新；遇到 BAD_DATA / RPC 错误按全局策略静默回退
4. **`src/hooks/useFlexibleActions.ts`** —— `bind / approveUSDT / deposit / closePosition / claimCommission`，统一 toast、loading、BSC 网络检查（复用 `useWeb3.connect`）
5. **`src/pages/Flexible.tsx`** —— 页面主体

### 页面布局（Flexible.tsx，沿用玻璃态 + 60px 网格 overlay）

1. **顶部状态条**：钱包地址（缩短+复制）、USDT 余额、已授权额度、合约状态徽章（paused/frozen 时红色）
2. **核心数据卡（4 宫格）**
   - 当前 APR：`apr()/100` %，并按全局规则同步显示日复利 APY = `(1 + APR/365)^365 - 1`
   - 我的活期本金：`principalOf`
   - 我的等级本金：`getLevelPrincipal`（hover/小字说明=自己+直推）
   - 我的等级 + 可拿代数：`Lv{getLevel}` Badge + `{getMaxGeneration} 代`
3. **可领取佣金卡**：`claimableCommission` 大号显示 + 「Claim Commission」按钮（按钮旁小字提示扣 `COMMISSION_FEE_BPS` 手续费，按 bps 折算百分比）
4. **邀请绑定卡**
   - 已绑定 → 显示上级地址（缩短+复制），不可改
   - 未绑定 → 输入框 + 「Bind」按钮，自动从 URL `?inviter=` 或 `localStorage("inviter")` 预填
5. **存款卡**
   - 金额输入，最低 `minDeposit()`（合约即 200 USDT）
   - 智能按钮：allowance < amount → 「Approve」；否则 → 「Deposit」
   - 提示：未绑定上级时按钮上方显示黄色提醒「建议先绑定上级，否则您的存款无法为您的上级带来佣金」（按合约逻辑，绑定与否不影响存款本身，但会影响推荐链）
6. **我的仓位列表**（卡片栅格）
   - 来源：`getUserPositions(user)` → 逐个 `positions(id)` + `pendingYield(id)`
   - 每张卡：positionId、principal、startTime（本地时间）、pendingInterest（实时）、closed 徽章
   - 「Close Position」按钮 → 弹出确认 Dialog，先调 `previewClose(id)` 展示 principal / yield / principalFee / yieldFee / netPaid 明细，确认后再 `closePosition`
   - 已关闭仓位置灰，不显示按钮
7. **等级与返佣规则**（折叠卡，纯静态展示，与合约文档一致）
   - 等级表：Lv1 ≥200U 拿1代 / Lv2 ≥1000U 拿3代 / Lv3 ≥5000U 拿5代 / Lv4 ≥20000U 拿7代 / Lv5 ≥50000U 拿10代
   - 10代返佣：30/20/15/10/8/6/4/3/2/2 %
   - 备注：返佣基于「利息」计算，不从本金扣除；等级本金 = 自己当前活期本金 + 直推一级当前活期本金

### i18n
`src/locales/zh.json` 与 `en.json` 增加 `flexible.*` 命名空间（标题、字段名、按钮、提示、规则文本）。

### 技术栈
- 沿用 ethers v6 + 现有 `useWeb3`（项目目前不用 wagmi，避免引入新依赖）
- 写操作前自动 `ensureBSC` 切链
- 所有金额用 `parseUnits/formatUnits(_, 18)`
- 静默错误处理遵循 [Error Handling](mem://technical/error-handling-strategy)