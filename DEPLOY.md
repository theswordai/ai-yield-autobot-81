# 部署说明（Sepolia & BNBChain）

前置：安装 Node.js、准备测试币/主网币；建议先在 Sepolia 测试。

1) 安装依赖
- npm i

2) 配置环境变量（在根目录创建 .env）
# Sepolia
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<your-key>  # 或任意 Sepolia RPC
DEPLOYER_PRIVATE_KEY=你的私钥（不带0x）
ETHERSCAN_API_KEY=你的Etherscan API Key（用于验证，选填）

# BNBChain（可选）
# BSC_RPC_URL=https://bsc-dataseed.binance.org/
# BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
# BSCSCAN_API_KEY=你的BscScan API Key（用于验证，选填）

# 业务参数
USDT_ADDRESS=<USDT或Mock地址>
FEE_WALLET=0x40E34a2bec1Ad145939b8CDcC5FC2854BB68B576

3) 编译
- npx hardhat compile

4) （可选）先在 Sepolia 部署 MockUSDT（6位小数）
- npx hardhat run scripts/deploy-mock-usdt.js --network sepolia
- 复制输出地址填入 .env 的 USDT_ADDRESS

5) 在 Sepolia 部署 LockStaking
- npx hardhat run scripts/deploy.js --network sepolia
- 输出示例：
  - LockStaking deployed at: 0x...

6) （可选）Etherscan 验证（Sepolia）
- npx hardhat verify --network sepolia <LockStaking地址> "<USDT_ADDRESS>" "<FEE_WALLET>"

7) 交互要点
- deposit(amount, lockChoice): 先对 USDT 合约 approve，再调用；amount ≥ 200 USDT
  - lockChoice: 0=3个月, 1=6个月, 2=1年
  - 先扣 1% 管理费至 FEE_WALLET，剩余作为本金进入合约
  - 年化 APR 在区间内随机，线性计息、非复投
- claim(posId): 随时提取收益
- withdraw(posId):
  - 到期：返还全部本金
  - 提前：扣 30% 本金罚金到 FEE_WALLET；收益不罚并自动发放
- emergencyWithdraw(amount): 仅 owner 应急提款

8) BNBChain 主网/测试网（参考）
- 部署：npx hardhat run scripts/deploy.js --network bsc
- 验证：npx hardhat verify --network bsc <合约地址> \
  "0x55d398326f99059fF775485246999027B3197955" \
  "0x40E34a2bec1Ad145939b8CDcC5FC2854BB68B576"

