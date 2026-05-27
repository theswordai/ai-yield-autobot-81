# 增值资本（Legendary）读链路改造

## 目标

- 把"读"全部从钱包内置 EIP-1193 provider 切到 BSC 公共 RPC（多端点降级），避免钱包 RPC 抖动导致的静默吞错和 0 数据闪烁。
- 在 chainId / account 变化时，可靠地清缓存 + 强制重新拉取。
- 写交易（approve / deposit / claim …）仍走 `signer`（钱包），不动。

## 范围

只改读路径，不动业务/UI 文案/合约 ABI。涉及文件：

- `src/lib/rpcClient.ts`（已有降级逻辑，扩展导出一个共享只读 `JsonRpcProvider`）
- `src/hooks/useLegendary.ts`（`useLegendaryContracts` 的 `read` 改为基于共享只读 provider）
- `src/hooks/useWeb3.ts`（确保 `chainId` 变化时下游能感知；不改 signer 逻辑）
- `src/components/legendary/ReferralTab.tsx`（网络树读取沿用同一 `read.referral`，自动受益，无需再改）

## 设计

### 1. 共享只读 provider（`src/lib/rpcClient.ts`）

新增一个轻量 `FallbackProvider` 风格封装（沿用现有 `FallbackRpcClient` 的端点列表）：

```text
endpoints = [
  https://bsc-dataseed.binance.org/
  https://bsc-dataseed1.defibit.io/
  https://bsc-dataseed1.ninicoin.io/
]
```

导出：

- `getReadProvider(): JsonRpcProvider` — 单例，初始化为第一个健康端点。
- 调用失败（`UNKNOWN_ERROR` / `Internal JSON-RPC error` / `empty reader set` / `pebble: not found` / 超时）时，自动切换到下一个端点并重试（指数退避 300/900/2100ms，每端点 3 次，全部失败再抛错）。
- 通过 `ethers.FallbackProvider` 或在 `JsonRpcProvider` 外包一层 Proxy 拦截 `send` 调用实现，二选一以最小改动为准。

### 2. `useLegendaryContracts` 改造

- `read` 实例的 provider 一律使用 `getReadProvider()`（不依赖 `useWeb3().provider`）。
- `write` 仍使用钱包 `signer`。
- 依赖数组改成 `[signer]`（read 是单例，不需要随钱包 provider 变化重建）。

### 3. 换链 / 换账户强制刷新

`useLegendaryDashboard` 当前 `useEffect` 依赖 `[refetch]`，而 `refetch` 依赖 `[read, account]`。改造后：

- 把 `chainId` 也纳入刷新触发器：
  ```text
  useEffect(() => { refetch(); }, [account, chainId, refetch]);
  ```
- 当 `chainId !== 56` 时跳过拉取并清空 `sharedData` 到 `EMPTY_DASHBOARD`（避免显示其它链的旧值）。
- 当 `account` 变化时，重置 `sharedAccount` 并立刻拉一次。

### 4. 错误处理

- 单点 `safe()` 包装继续保留，但 fallback 来源变成"公共 RPC 已穷尽后才静默回退到上一次值"，而不是"钱包抖动一次就回退"。
- 关键调用（`getUserPositions`、`Deposited` 事件扫描）失败时，仍按现有逻辑沿用上一次缓存的 positions，避免闪 0。

## 不动的部分

- 写交易、approve、bind inviter 等仍走 `signer`。
- UI 文案、CLASS-A/CLASS-B、网络树、收益公式、APY 显示策略全部不变。
- 不引入新的依赖包。

## 验收

1. 钱包未连接 / 错链时：CLASS-A、CLASS-B 总盘子等公共数据仍能正常显示（来自公共 RPC）。
2. 钱包切换到 ETH 主网再切回 BSC：仓位 / 余额 / 团队数据自动刷新，不需要手动刷新页面。
3. 切换钱包账户：旧账户数据立刻被新账户覆盖，不残留。
4. 故意拔网 / 单个 RPC 端点 503：日志显示切换到下一端点，UI 不报错、不闪 0。
5. `bunx tsc --noEmit` 通过。
