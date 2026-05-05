# 添加交易历史记录

在「善举」(Stake `/invest`) 和「活期」(`/flexible`) 页面新增"我的历史记录"区块，显示当前钱包在合约上的链上操作记录：什么时候存款、什么时候领取了收益、领了多少、什么时候取出本金等，并附 BscScan 交易链接。

## 实现方式

通过 ethers 的 `queryFilter` 查询合约事件日志，按当前钱包地址过滤（事件中的 `user` 参数是 indexed，链上原生支持过滤）。这与项目里 `useStakingData.ts` 已用的 `rewardsVault.queryFilter` 是同一个模式。

## 具体改动

**1. `src/abis/LockStaking.ts`** — 补全事件签名（目前只有 `Deposited` 和 `ReferralAccrued`，缺 `Claimed`、`Withdrawn`），以便能 queryFilter：
```
event Claimed(address indexed user, uint256 indexed posId, uint256 amount)
event Withdrawn(address indexed user, uint256 indexed posId, uint256 principalReturned, uint256 penalty)
```

**2. 新增 `src/components/TransactionHistory.tsx`** — 通用历史记录组件，参数：
- `contract`（ethers Contract 只读实例）
- `account`（当前钱包）
- `events`：要查询的事件列表，每条带 label（中/英）、参数解析函数、金额字段名
- `chainExplorerBase`（BscScan）

内部逻辑：
- 对每个事件 `contract.queryFilter(filters.X(account), fromBlock, 'latest')` 并行抓取
- 合并日志，去 `provider.getBlock(blockNumber)` 拉时间戳（带缓存避免重复请求）
- 按时间降序排序，渲染为表格：时间 / 类型 / 金额(USDT) / Tx
- 失败静默回退到空列表（遵循项目的 silent fallback 规则）
- 加 30 秒/手动刷新；显示 loading skeleton

**3. `src/pages/Stake.tsx`（善举页）** — 在仓位列表下方插入 `<TransactionHistory>`，订阅 LockStaking 合约的：
- `Deposited` → "存入本金"
- `Claimed` → "领取收益"
- `Withdrawn` → "取出本金"（如有罚金额外显示）

同时也读取 `RewardsVault` 的 `Claimed` 事件 → "领取静态/动态奖励"。

**4. `src/pages/Flexible.tsx`（活期页）** — 在仓位卡片下方插入 `<TransactionHistory>`，订阅 FlexiblePool 的：
- `PositionOpened` → "活期存入"
- `PositionClosed` → "活期平仓"，金额展示 `netPaid`，副信息显示 `principal / yield / fees`
- `CommissionClaimed` → "领取返佣"，显示 net 金额

## 表格样式

复用 `@/components/ui/table`，与项目 glass-morphism 风格一致（`backdrop-blur-md bg-card/40 border-border/50` 卡片包裹）。移动端折叠为卡片列表（参考 PositionsList 的响应式做法）。

## 注意事项

- RPC 对 `getLogs` 区块范围有限制；初版用 `fromBlock=0, toBlock='latest'`（与现有 rewardsVault 调用一致）。如某些公共节点拒绝，组件捕获错误后静默返回空，不影响主页面。
- 特殊 mock 账号（`useStakingData` 里硬编码的两个地址）链上没有真实事件，历史会为空 —— 这与现状一致，无需 mock 历史数据（除非你想让我也给这两个账号补几条假记录）。
- 不修改任何金额/利率/UI 文案规则。
