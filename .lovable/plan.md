# 传奇锁仓页面修复计划

## 1. 严重 Bug 修复

### 1.1 仓位列表过滤错误
**文件：** `src/components/legendary/PositionsTab.tsx`

- 第 45 行 `filter((p) => !p.withdrawn && p.poolType === 1)` → `filter((p) => !p.withdrawn)`
- 顶部统计提示文本 `共 N 个一池活跃仓位` 改为 `共 N 个活跃仓位`
- 其余 UI 已用 Badge 区分一池/二池，无需改动

### 1.2 not authorized 错误映射修正
**文件：** `src/hooks/useLegendaryActions.ts`

`"not authorized": "请先绑定上线后再操作"` → `"not authorized": "系统暂未就绪，请联系客服"`

## 2. REVERT_MAP 清理与扩充

**文件：** `src/hooks/useLegendaryActions.ts`

删除：`"self bind"`、`"inviter below min"`、`"pool2 only compound"`、`"cooldown"`

追加：
```
"bad inviter": "上线地址无效（不能为空或自己）",
"inviter not qualified": "上线自投不足 200 USDT，无法绑定",
"circular": "检测到循环邀请，绑定被拒绝",
"transferFrom failed": "USDT 余额或授权额度不足",
"transfer failed": "合约偿付额度不足，请联系客服",
"insufficient liquidity": "合约偿付额度不足，请联系客服",
"reentrancy": "操作冲突，请稍后重试",
"already": "该仓位已被处理",
"use withdraw": "仓位已到期，请使用「到期取本金」",
"zero": "参数错误",
"nothing": "暂无可领取金额",
```

## 3. 提前赎回罚金动态读取

**文件：**
- `src/abis/LegendaryStaking.ts`：在 ABI 数组中追加 `"function earlyPenaltyBps() view returns (uint256)"`（若链上不存在，`safe()` 会回退到默认值 5000）
- `src/hooks/useLegendary.ts`：
  - `LegendaryDashboard` 与 `EMPTY_DASHBOARD` 加 `earlyPenaltyBps: number`（默认 5000）
  - `doRefetch` 全局段加 `safe(read.staking.earlyPenaltyBps(), 5000n)`，转 `Number` 后写入 sharedData
- `src/components/legendary/PositionsTab.tsx` 提前赎回弹窗：
  ```
  const bps = BigInt(data.earlyPenaltyBps || 5000);
  const penalty  = (earlyTarget.principal * bps) / 10000n;
  const returned = earlyTarget.principal - penalty;
  ```
  - 文案：`将扣除 {bps/100}% 本金作为罚金…`
  - 显示「返还本金 = fmt(returned)」「罚金 = fmt(penalty)」

## 4. 提前赎回弹窗：掉级 / 失格警告

仅在 `PositionsTab.tsx` 弹窗内新增提示块（前端计算，不动合约/Hook）：

- 从 `@/config/legendary` 引入 `LEVELS`
- 计算 `newSelfStake = data.selfStake - earlyTarget.principal`（负数夹到 0）
- 复用现有等级判定逻辑：遍历 `LEVELS`，按 `self`（×1e18）和 `data.teamPerf` 判定，取最高满足等级 → `newLevel`
- 渲染规则：
  - 若 `newLevel < data.level`：红字「⚠️ 赎回后等级将从 V{old} 下降到 V{new}，影响下次动态分红分桶比例」
  - 若 `newSelfStake < 200n * 10n**18n`：红字「⚠️ 赎回后您的自投将跌破 200 USDT，失去拿直推/间推奖资格」

## 5. 直推列表分页

**文件：** `src/components/legendary/ReferralTab.tsx`

把 `list.slice(0, 50)` 改为前端分页：
- `const PAGE = 20`，`useState(1)` 维护 `page`
- 渲染 `list.slice(0, page * PAGE)`
- 底部「加载更多 ({显示数}/{总数})」按钮，达到末尾后禁用
- 切换钱包/list 变化时重置 `page = 1`

## 技术注意

- `EARLY_PENALTY_BPS` 在合约里为常量，部分部署版本可能没有 `earlyPenaltyBps()` getter。已用 `safe(..., 5000n)` 兜底，调用失败会自动落回 50%，与现状一致，不影响线上。
- 新增 ABI 行不会破坏 ethers `Contract`，未实现的方法只有在调用时才报错，被 `safe()` 捕获。
- 等级判定与现有 `useLegendary` 中由合约 `getLevel()` 返回的值一致使用同一 `LEVELS` 表；前端模拟只用于「赎回前预测」展示，不替换链上权威值。
