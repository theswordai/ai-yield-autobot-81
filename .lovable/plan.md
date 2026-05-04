## 目标

在活期理财页面新增「我的团队层级数据」板块，按代（Gen 1 → Gen N）展示：
- 该层级的下级人数
- 该层级所有下级的活期本金合计

层数取合约返回的 `getMaxGeneration(account)`（即根据当前等级可拿的代数，1~10 代）。

## 数据来源（合约已支持）

`FlexiblePool` ABI 已暴露：
- `getDirects(address) -> address[]` 直推下级
- `principalOf(address) -> uint256` 该地址当前活期本金
- `getMaxGeneration(address) -> uint256` 当前可拿代数

通过对 `account` 做 BFS：
- 第 N 代 = 第 N-1 代每个地址的 `getDirects` 去重合并
- 各层并行调用 `principalOf` 求和
- 设上限 800 个地址防止极端团队下 RPC 过载

## 改动文件

1. **`src/hooks/useFlexiblePool.ts`**
   - 新增 `loadDownlineByGen(maxGen, addressLimit=800)` 函数
   - 返回 `Array<{ gen, count, principal: bigint }>`
   - 不放进自动刷新（按需触发，避免影响首屏）

2. **`src/pages/Flexible.tsx`**
   - 在「我的仓位」与「可领取佣金」之间插入 Card：「我的团队层级数据 / Team by Generation」
   - 进入页面或 `data.maxGeneration` 变化时自动加载一次
   - 提供「刷新」按钮
   - 网格展示：每行 Gen N · 人数 · 本金合计 (USDT)
   - 移动端紧凑（单列），桌面 2 列
   - 加载中显示骨架占位；返回为空时显示「暂无下级」
   - 顶部小提示：仅统计当前等级可拿的 N 代；如等级提升后会展示更多代

## UI 草图

```
我的团队层级数据 (按当前等级 Lv3，可统计 5 代)        [刷新]
─────────────────────────────────────────────
 Gen 1   人数 12     本金 8,420.00 USDT
 Gen 2   人数 38     本金 21,150.00 USDT
 Gen 3   人数 95     本金 17,002.50 USDT
 Gen 4   人数 0      本金 0.00 USDT
 Gen 5   人数 0      本金 0.00 USDT
─────────────────────────────────────────────
* 数据为链上实时聚合，最多统计 800 个地址。
```

## 备注

- 全部读链，不依赖任何后端。
- 若用户尚未绑定上级或未投资，依然显示 Gen 1 起的数据（自身直推）。
- 等级（`level`）与可统计代数（`maxGeneration`）已在卡片网格里显示，无需再额外展示。
