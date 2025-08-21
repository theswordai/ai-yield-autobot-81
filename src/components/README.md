# 智能合约前端集成说明

本项目已完整集成BSC主网上部署的智能合约系统，支持以下功能：

## 合约地址

- **MockUSDT**: `0x91E34Ea7426cCc7A3bFcBE27E2f8871C8F08FA75`
- **LockStaking**: `0x51afe6fe7490d276fc7e9065cfe2e681d0a1a45c`
- **RewardsVault**: `0xb936055f59486d3832f3eb2a176538ea00de7198`
- **ReferralRegistry**: `0x7a7cad6e164dd9e65cc03b8686a6abf4074233b9`

## 核心功能流程

### 1. 推荐关系绑定
```typescript
// 用户绑定推荐人 (仅能绑定一次)
await referralRegistry.bind(inviterAddress);
```

### 2. USDT 授权与质押
```typescript
// 1. 授权 USDT 给质押合约
await usdt.approve(LOCK_ADDRESS, amount);

// 2. 质押投资 (lockChoice: 0=3月, 1=6月, 2=12月)
await lockStaking.deposit(amount, lockChoice);
```

### 3. 收益管理
```typescript
// 随时领取质押收益
await lockStaking.claim(positionId);

// 到期赎回本金 (收取2%手续费)
await lockStaking.withdraw(positionId);
```

### 4. 推荐奖励
```typescript
// 查看待领取推荐奖励
const pending = await rewardsVault.pendingRewards(userAddress);

// 领取推荐奖励
await rewardsVault.claim();
```

## 收益计算

### 质押收益 (固定年化)
- **3个月**: 91.25% 年化 (0.25% 日化)
- **6个月**: 146% 年化 (0.4% 日化)
- **12个月**: 365% 年化 (1% 日化)

### 推荐奖励等级
- **L1 (≥200U)**: 10% 直推奖励
- **L2 (≥1000U)**: 11% 直推 + 10% 间推
- **L3 (≥3000U)**: 12% 直推 + 10% 间推
- **L4 (≥10000U)**: 13% 直推 + 10% 间推
- **L5 (≥30000U)**: 15% 直推 + 10% 间推

## 关键组件

### useContracts Hook
统一管理所有合约实例，提供只读和可写两套合约对象。

### useStakingData Hook
- 自动获取用户所有相关数据
- 30秒自动刷新
- 包括余额、仓位、推荐统计等

### useStakingActions Hook
- 封装所有合约交互方法
- 统一错误处理和Loading状态
- 自动网络检查和Gas估算

### 核心组件
- **StakingInterface**: 质押投资界面
- **PositionsManager**: 仓位管理界面
- **ReferralManager**: 推荐系统界面

## 安全机制

1. **网络检查**: 自动检查是否连接BSC主网
2. **余额验证**: 交易前检查USDT和BNB余额
3. **Gas估算**: 动态估算Gas费用，避免交易失败
4. **错误处理**: 完整的错误捕获和用户友好提示
5. **重试机制**: MetaMask RPC错误自动重试

## 使用说明

1. **首次使用**: 连接钱包 → 切换到BSC主网
2. **绑定推荐**: 通过邀请链接或手动输入推荐人地址
3. **开始投资**: 授权USDT → 选择锁仓期 → 确认投资
4. **管理收益**: 定期领取利息，到期赎回本金
5. **推荐奖励**: 分享邀请链接，获得持续收益

## 新页面访问

访问 `/stake-new` 查看完整的智能合约集成界面，包含：
- 实时数据仪表板
- 完整的质押功能
- 仓位管理系统
- 推荐奖励系统

所有功能已完全对接链上合约，确保数据准确性和交易安全性。