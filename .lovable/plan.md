## 1. USDT 显示统一改成 2 位小数

`src/hooks/useLegendary.ts` 中：
```ts
export function fmt(value: bigint, digits = 4): string
```
→ 默认改为 `digits = 2`。所有调用方（DashboardTab/DepositTab/PositionsTab/ReferralTab/RewardsTab + Legendary.tsx 顶部钱包状态卡）已用默认值，无需改动。少数显式传 `fmt(x, 0)` 的地方保留不动。

## 2. Tab 顺序与结构重排

参考善举（`/invest` → `StakingInterface`）的风格：顶部钱包状态条 + 单一存款卡 + 仓位列表。

新 Tab 顺序（去掉"看板"）：
```
一池存款 | 我的仓位 | 二池复投 | 邀请团队 | 奖励
```

`src/pages/Legendary.tsx`：
- 删除 `dashboard` tab 及其 `TabsContent`，默认 tab 改为 `"deposit"`
- 顺序：`deposit → positions → pool2 → referral → rewards`
- `TabsList` 从 `grid-cols-3 md:grid-cols-5` 保持不变（仍 5 个）
- 看板里的 4 张统计卡（我的总锁仓本金 / 累计可领利息 / 可领奖励 / 我的等级）+ 快捷按钮**不再独立成页**，并入"我的仓位"页顶部（紧贴现有"共 N 个活跃仓位"工具条之上），保证用户进页面立刻看到核心数据

## 3. 新增"二池复投" tab

`src/components/legendary/Pool2Tab.tsx`（新文件）— 承载原本散落在 `PositionsTab` 里的二池复投流程：
- 顶部说明卡：二池 APR 360% · 日复利 APY · 锁 365 天 · 最低 200 USDT · 资金来源为一池未领利息
- 中部：列出当前所有一池仓位 + checkbox 多选 + 总可用利息合计
- 输入复投金额（≥200）
- 一键"确认复投"，调用 `compoundToPool2(selectedIds, amount)`
- 下方列出已存在的二池仓位（沿用现有 `PositionsTab` 卡片样式，但只筛选 `poolType === 2`）

`PositionsTab` 同步精简：
- 移除"复投到二池"按钮 + 对应 Dialog
- 列表过滤改为只显示一池仓位（`poolType === 1`）
- 顶部插入 4 张统计卡（复用 DashboardTab 的 `StatCard` 组件，抽到共享文件 `src/components/legendary/StatCard.tsx`）

## 4. 文件清单

- 改：`src/hooks/useLegendary.ts`（fmt 默认 2 位）
- 改：`src/pages/Legendary.tsx`（删 dashboard tab、重排、默认 tab）
- 改：`src/components/legendary/PositionsTab.tsx`（移除复投、加统计卡、只显示一池）
- 新：`src/components/legendary/Pool2Tab.tsx`
- 新：`src/components/legendary/StatCard.tsx`（从 DashboardTab 抽离复用）
- 删：`src/components/legendary/DashboardTab.tsx`（不再使用）

## 5. 不变项

- 邀请团队、奖励两个 tab 内容不动
- 顶部 Navbar + 钱包状态卡（USDT 余额 / 已授权额度）不动
- 合约调用、授权逻辑（一键 approve+deposit）不动
- BSC 网络强制、Glass-morphism 样式不动