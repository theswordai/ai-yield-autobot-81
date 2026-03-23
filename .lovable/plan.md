

## 计划：钱包连接时自动切换到 BNB Chain

### 问题
连接钱包（如 OKX）时，如果钱包当前在错误的网络（如 chainId 9746），合约调用会报 `BAD_DATA` 错误。

### 方案

#### 1. 修改 `src/hooks/useWeb3.ts`
- 在 `connect()` 和 `connectWith()` 连接成功后，检查 chainId 是否为 56（BSC）
- 如果不是，自动调用 `wallet_switchEthereumChain` 切换到 `0x38`
- 如果钱包没有添加过 BSC 网络（错误码 4902），自动调用 `wallet_addEthereumChain` 添加 BSC 网络配置
- 切换成功后刷新 provider/signer/chainId 状态
- 使用 `activeEip1193Ref.current` 发送请求，兼容 OKX 等钱包

#### 2. 修改 `src/pages/Stake.tsx`
- `refreshData` 中增加 `chainId !== 56` 判断，跳过合约调用
- 捕获 `BAD_DATA` 错误，显示友好提示："请切换到 BNB Chain 网络"

