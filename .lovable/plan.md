# 修复传奇页"我的仓位"存款后仍为空

## 现象
- 路由：`/zh/legendary`
- 用户已成功存入 200 USDT，但"我的仓位"列表仍为空，总锁仓本金为 0。
- 控制台无任何 `useLegendary` 相关报错（因为 `safe()` 把所有合约调用错误吞掉了）。

## 根因判断
`useLegendary.ts` 的 `refetch` 通过 `read.staking.getUserPositions(account)` 拿仓位 ID 数组。最大概率是**线上合约根本没有这个外部方法**（或方法名/签名不同），调用 revert 后被 `safe()` 静默 catch 成 `[]`，所以列表永远空。

ABI 里已经定义了下面这个事件，可以无视方法名直接从链上反推用户的所有 posId：
```
event Deposited(address indexed user, uint256 indexed posId, uint8 poolType, uint256 amount, uint256 aprBps)
```

## 方案
在 `src/hooks/useLegendary.ts` 里：

1. **诊断日志**：把 `getUserPositions` 单独 try/catch，失败时 `console.warn` 打印错误，便于以后排查。
2. **事件兜底**：无论 `getUserPositions` 是否返回，都额外执行一次 `Deposited` 事件扫描：
   - `read.staking.queryFilter(read.staking.filters.Deposited(account), fromBlock, latest)`
   - `fromBlock = max(0, latest - 50000)`（约 1.5 天，BSC 3s 出块；后续可扩到 100k）。
   - 收集所有 `args.posId`，与 `getUserPositions` 结果合并去重。
3. **保留单例共享**：仍用上次重构的全局 state + 订阅模式，存款后 `refetch` 触发所有 Tab 一起刷新。
4. **可选优化**：把 30s 轮询改为存款/授权动作后立即触发，并保留 30s 兜底。

## 改动文件
- `src/hooks/useLegendary.ts` —— 在 `doRefetch` 里加事件扫描兜底 + 日志。

不动 UI、不动合约地址、不动其它 Tab。

## 验证
1. 重新进入 `/zh/legendary` → "我的仓位"应能列出已有 posId。
2. 再存一笔 200 → 交易确认后立即出现新仓位卡片。
3. Console 应出现一条 `[legendary] getUserPositions failed, fallback to events` 警告（若合约确实没该方法），确认根因。
