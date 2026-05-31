## 目标
有些钱包（OKX、TokenPocket 等多链钱包）连接时默认返回 ETH 主网 (chainId 1)。需要在连接流程中主动强制切到 BNB Smart Chain (56)，并在用户中途切走时自动切回。

## 修改文件

**1. `src/hooks/useWeb3.ts`**
- `connectWith(provider)` 内：拿到 accounts 后，立即调用
  - `wallet_switchEthereumChain` → `0x38`
  - 若 error code === 4902，调 `wallet_addEthereumChain` 注入 BSC 配置（RPC: bsc-dataseed.binance.org, symbol BNB, explorer bscscan），然后重试切换
- 监听 `chainChanged`：若新 chainId !== 56，自动再次尝试切回 56；用户拒绝时不强制断开，仅依赖 `NetworkChecker` 显示警告
- 切链失败时抛出可读错误给上层 toast

**2. `src/components/WalletConnector.tsx`**
- `handleSelect` 捕获切链错误，toast 提示"请在钱包中切换到 BNB Smart Chain"
- 其它 UI 不变

**3. `src/components/NetworkChecker.tsx`**
- 保留作为兜底警告 + 一键切换按钮，无需改动

## 不动
- `src/config/contracts.ts`、合约 ABI、读链 provider（`getReadProvider` 本身已写死 56）
- 任何业务/UI 样式

## 验证
- MetaMask 在 ETH 主网连接 → 弹出切换到 BSC 提示
- OKX 钱包连接 → 自动落到 chainId 56
- 连接后手动切到 ETH → 自动再切回 56；拒绝则显示 NetworkChecker 警告