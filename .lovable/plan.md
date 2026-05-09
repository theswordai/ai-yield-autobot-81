## 诊断：为什么今天大家领完收益都看不到记录

我读了 `TransactionHistory.tsx`、`Stake.tsx` 和 `Flexible.tsx` 的接入方式后，定位到 **三个互相叠加的 bug**，组合起来导致今天所有用户领完收益后历史记录都是空的。

### 根本原因

**1. `contracts` 是行内字面量数组，每次渲染都换新引用 → 触发无限刷新风暴**

`Stake.tsx` 第 850 行、`Flexible.tsx` 第 436 行都是这样写的：
```tsx
<TransactionHistory contracts={[{ contract: lockRead, events: [...] }]} ... />
```
这个数组每次父组件 render 都是**新引用**。而 `TransactionHistory` 内部：
- `storageKey = useMemo(..., [title, account, contracts])` → key 一直变
- `fetchHistory = useCallback(..., [account, contracts, startBlock, rowsKey])` → 函数一直变
- `useEffect(() => { fetchHistory() }, [fetchHistory])` → 每次 render 都重新发起一轮 `queryFilter`

结果是组件挂载后**疯狂重复请求 BSC 公共节点**。一旦 setRows 触发 re-render，又重新建一轮请求，循环到 RPC 限流。

**2. BSC 公共节点的 `eth_getLogs` 区块范围限制**

`bsc-dataseed.binance.org` 等公共节点对 `eth_getLogs` 单次查询有 **5000 区块上限**（约 4 小时）。`startBlock` 是几天前缓存到 localStorage 的，现在已经超过 10 万区块，节点直接返回 `limit exceeded`。组件里 `catch` 是**静默吞掉**的（`// silent fallback`），所以表现就是"什么也没发生，列表永远空"。

**3. 领取成功后没有主动触发 `fetchHistory`**

`useStakingActions.ts` 里 `claimYield`、`compoundYield`、`claimReferralRewards` 走完 `tx.wait()` 之后，没有任何机制通知 `TransactionHistory` 去抓新事件。用户必须手动点"刷新"按钮，而点了刷新又会撞上 (1) 和 (2)。

### 解决方案

**修改 `src/components/TransactionHistory.tsx`：**

1. **依赖键稳定化**：内部用 `JSON.stringify(contracts.map(c => c.contract?.target))` 派生一个字符串 `addrsKey`；所有 `useMemo` / `useCallback` / `useEffect` 改成依赖 `addrsKey + account` 而不是 `contracts` 引用。彻底切断渲染→请求循环。

2. **分段查询绕开 5000 区块限制**：`fetchHistory` 内部把 `[startBlock, latest]` 切成 4500 块的多段，依次 `queryFilter`，单段失败时跳过该段而不是放弃整轮。同时把成功扫到的最高块号写回 localStorage 当下次的 `startBlock`，避免每次都从老远开始扫。

3. **错误可见**：把"silent fallback" 换成 `console.warn`（按你的全局规则不弹 toast，但开发面板能看到），方便以后排查。

4. **暴露刷新触发器**：导出一个轻量级的 `bumpHistoryRefresh()` 工具（基于 `window` 自定义事件 `txhist:refresh`），`TransactionHistory` 监听它就重抓。

**修改 `src/hooks/useStakingActions.ts`：**

5. 在 `claimYield` / `withdraw` / `compoundYield` / `claimReferralRewards` / `deposit` 的 `tx.wait()` 成功后，调用 `bumpHistoryRefresh()`，让活期/善举页面立刻把新事件拉进来。

**修改 `src/pages/Stake.tsx` 和 `src/pages/Flexible.tsx`（可选但推荐）：**

6. 把 `contracts={[...]}` 改成 `useMemo` 出来的稳定数组，进一步保险。

### 不会动的地方

- 不改 startBlock 的初始值策略——还是"从首次连接钱包那一刻起"，符合你之前定的规则。
- 不改 localStorage 缓存格式（已存的记录不会丢）。
- 不改链 / RPC 列表。
- 不动业务逻辑，只动展示与抓取层。

### 验证清单

实施完成后我会让你做一次：连接钱包 → 领取一笔收益 → 不点任何按钮，几秒内列表自动出现该笔 `领取收益` 行；刷新页面后仍然在；切换到善举页同样能自动看到 `Deposit / Close` 记录。
