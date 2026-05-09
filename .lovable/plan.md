## 诊断：为什么有的钱包能显示，有的一直在"刷新"

### 根本原因

`TransactionHistory` 抓事件用的 `provider` 是从读合约 `lockRead.runner.provider` 拿出来的，而 `lockRead` 在 `useContracts.ts` 第 19 行是用 `BrowserProvider(injected)` 包装的——**也就是用户钱包自己注入的 EIP-1193 provider**。

不同钱包的注入 provider 行为差异巨大：

- **MetaMask 桌面版 / OKX**：背后走自家代理节点，`eth_getLogs` 跨大区块范围基本能跑通，所以你看到能显示。
- **TokenPocket / imToken / Bitget / WalletConnect 移动端**：注入 provider 走的是钱包内置的轻节点或自家 RPC。这些 RPC 经常：
  1. 对 `eth_getLogs` 直接拒答或返回空（且不抛错），
  2. 请求挂起不返回（没有超时），
  3. 区块范围限制比 5000 还小，每段都失败。

`fetchHistory` 里 `setLoading(true)` 之后，只有 `finally` 才会 `setLoading(false)`。一旦 `provider.getBlockNumber()` 或某个 `queryFilter` **永远不 resolve 也不 reject**（移动钱包很常见），整个 `try` 就卡在那里，按钮永远转圈、列表永远空——表现就是"一直在刷新"。

而历史已经缓存的钱包之前抓到过一次，rows 从 localStorage 直接 hydrate，所以"看起来好的"。

### 解决方案

**统一用项目里已有的 `rpcClient`（3 个公共 BSC 节点带 fallback）来做历史抓取，绕开钱包注入 provider。**

#### 改 1：`src/components/TransactionHistory.tsx`

- 不再从 `contract.runner.provider` 拿 provider。
- 引入 `rpcClient.getCurrentProvider()` 拿到一个稳定的公共 `JsonRpcProvider`。
- 用这个 provider 重建一个**只读**的轻量 contract 影子：`new Contract(targetAddress, originalAbi/interface, publicProvider)`，专门给 `queryFilter` 用。原 `contract` 只用来拿 `target` 地址和 `interface`。
- 给每个异步调用包一层 `withTimeout(p, ms)`（`Promise.race` + 超时 reject），统一 8 秒超时。这样即便公共节点也卡住，`fetchHistory` 的 `try/finally` 一定会走到 `finally`，loading 不会粘住。
- 第一次扫描时给 `startBlock` 一个**最大回溯上限**（比如 `Math.max(latest - 200_000, 0)`，约最近 7 天），避免新设备首次进入钱包时一次性扫几十万块。
- 把 `getBlockNumber` 的失败也 catch 住，失败就直接 `setLoading(false)` 退出本轮。

#### 改 2：`src/components/TransactionHistory.tsx` 的"刷新中"显示

- 给 `loading` 状态加一个**硬保险**：`useEffect` 里挂一个 `setTimeout(20s)`，到点强制 `setLoading(false)`。即使所有兜底都失败，按钮也不会无限转。

#### 不改的地方

- 不动 `useContracts.ts`：写操作（deposit/claim/withdraw）继续走钱包注入 provider，这是正确的。
- 不动 startBlock/rows 的 localStorage 格式，已缓存数据不会丢。
- 不动 `Stake.tsx` / `Flexible.tsx` 接入方式。
- 不弹 toast，按全局规则技术错误静默 + `console.warn`。

### 预期效果

- 所有钱包（包括 TokenPocket / imToken / Bitget / 各种 WalletConnect 移动钱包）都用同一组公共 BSC 节点抓历史，行为一致。
- "一直刷新"的卡死状态消失：最坏情况下 8s 单调用超时 + 20s 总兜底，按钮一定会停。
- 首次进入扫描更快（最多回溯 ~200k 块），之后增量扫描只扫新块。

### 验证清单

实施完请用之前出问题的钱包：
1. 进入"善举"页面 → 几秒内"刷新"按钮停转。
2. 领一笔收益 → 等 1–2 秒，新行自动出现。
3. 刷新页面 → 旧记录还在。
