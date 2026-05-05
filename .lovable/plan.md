## 问题
"我的历史记录"一直在转圈，因为 `TransactionHistory` 的 `useEffect` 死循环了。

## 根因
`fetchHistory` 的 `useCallback` 依赖里有 `contracts`（数组）和 `fromBlock`。调用方 `Stake.tsx` / `Flexible.tsx` 每次渲染都会新建 `contracts` 数组字面量，导致引用每次都不同 → `fetchHistory` 重建 → `useEffect` 重跑 → `setLoading(true)` → 父组件重渲染 → 又新建 contracts → 循环不止。再加上每次拉链上日志要几秒，spinner 永远停不下来。

## 修复
1. **`src/components/TransactionHistory.tsx`**
   - 把 `useCallback` 的依赖数组从 `[accountKey, contracts, fromBlock]` 改成 `[accountKey]`，账户切换才重拉。
   - 增加一个 `loadingRef` 守卫，防止刷新按钮被连点时并发触发。
   - 切换账号时重置 `rows`、`loading`、`didLoad` 状态。

2. （可选）后续若想自动定时刷新，再单独加 `setInterval`，不靠依赖数组触发。

无任何 UI / 文案变化。
