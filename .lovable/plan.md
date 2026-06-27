# CLASS-B 利息复投 & 一键复投

## 目标
1. 在「CLASS-B」Tab 的"选择仓位作为利息来源"列表里，把 **CLASS-B 仓位** 也一并列出来，允许用其未领利息复投回 CLASS-B。
2. 增加 **「一键全选并最大复投」** 按钮：自动勾选所有 CLASS-A + CLASS-B 活跃仓位，并把复投金额填成全部可用利息（向下取整、且 ≥ 200 USDT 才可点）。

## 改动文件
仅前端 UI / 状态层，合约不变（`compoundToPool2(posIds, amount)` 本身支持 CLASS-B posId 作为来源）。

- `src/components/legendary/Pool2Tab.tsx`

## 具体改动（Pool2Tab.tsx）

1. **来源列表合并**
   - 现状：`pool1Active = positions.filter(poolType === 1)`，列表只渲染 `pool1Active`。
   - 改为：`eligibleActive = positions.filter(p => !p.withdrawn && (p.poolType === 1 || p.poolType === 2))`。
   - 渲染时给每行加一个小 Badge 标明 `CLASS-A` / `CLASS-B`，方便用户区分。
   - `selectedPositions` / `selectedIds` / `selectedPending` 改成基于 `eligibleActive`。

2. **一键复投按钮**
   - 在「选择…作为资金」卡片右上角放一个 `「一键全选最大复投」` 小按钮：
     - 点击：`selected = new Set(eligibleActive.map(p => p.id.toString()))`，并把 `amount` 填为所有 `eligibleActive` 利息求和 → 转成 USDT 字符串（用 `formatUnits` 截 6 位小数，再裁成整数 USDT，向下取整，避免超过链上 pending 导致 revert）。
   - 同时给一个 `「清空」` 链接复位 selected + amount。

3. **金额校验**
   - 现有 `tooLow`(< 200) 保留。
   - 增加 `tooHigh = amountWei > selectedPending`，提示"复投金额不能超过所选仓位的未领利息合计"。

4. **说明文案更新**
   - 把"从 CLASS-A 仓位的未领利息中扣除…"改为"从 CLASS-A / CLASS-B 仓位的未领利息中扣除作为本金，进入新的 CLASS-B 仓位，锁仓 365 天。最低 200 USDT。"

## 不变
- `useLegendaryActions.compoundToPool2` 调用不变。
- 「我的 CLASS-B 仓位」列表 + 领利息 / 取本金按钮不变。
- CLASS-A Tab、其他 Tab 不动。

## 风险
- 合约对"来源仓位类型"的限制以链上为准。若链上 `compoundToPool2` 实际拒绝 CLASS-B 来源，将由现有 `parseRevert` 报错提示，UI 不会写错状态；这是已被现有错误处理覆盖的情况。
