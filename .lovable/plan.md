# 增值资本 V2 升级方案

USDT 锁仓/推荐/动态分红逻辑保持不变，新增 USDV + FDAO 代币奖励体系。两套奖励完全分离。

## 1. 地址与配置更新

**`src/config/legendary.ts`**
- `LEGENDARY_STAKING_ADDRESS` → `0x56d49C2c3E550a52b784432b92598058720B205b`
- `LEGENDARY_REFERRAL_ADDRESS` 保持 `0x991d90cbbBd2bDE04e7906D160A6B36CEA56D2cF`
- 新增 `FDAO_ADDRESS = 0xB14473F60bb1073235ca9a96CE2da43BfD274811`

**`src/config/contracts.ts`**
- `USDV_ADDRESS` 已是 `0x14B26...`，保持
- 新增导出 `FDAO_ADDRESS`

**`src/lib/legendaryClaimHistory.ts` / Etherscan edge function**
- 因为引用 `LEGENDARY_STAKING_ADDRESS` 常量，自动跟随更新，无需改代码

## 2. ABI 文件

**`src/abis/LegendaryStaking.ts`** — 在现有 ABI 基础上追加：
```
// 写
"function claimTokenRewards() returns (uint256, uint256)"
// 读
"function pendingUsdv(address) view returns (uint256)"
"function pendingFdao(address) view returns (uint256)"
"function previewTokenRewards(address) view returns (uint256, uint256, uint256, uint256)"
"function usdvPerInterestBps() view returns (uint256)"
"function fdaoPerInterestBps() view returns (uint256)"
"function maxUsdvLevelReached(address) view returns (uint8)"
"function maxFdaoLevelReached(address) view returns (uint8)"
"function getLevelBonusUsdv() view returns (uint256[7])"
"function getLevelBonusFdao() view returns (uint256[7])"
"function usdv() view returns (address)"
"function futureDao() view returns (address)"
// 事件
"event UsdvAccrued(address indexed user, uint256 usdtInterest, uint256 usdvAmount)"
"event FdaoAccrued(address indexed user, uint256 usdtInterest, uint256 fdaoAmount)"
"event UsdvClaimed(address indexed user, uint256 fromInterest, uint256 fromLevel, uint8 levelFrom, uint8 levelTo)"
"event FdaoClaimed(address indexed user, uint256 fromInterest, uint256 fromLevel, uint8 levelFrom, uint8 levelTo)"
```

**新建 `src/abis/FutureDao.ts`**：标准 ERC20 + `MAX_SUPPLY()`

## 3. Hook 改造

**`src/hooks/useLegendary.ts`**
- `useLegendaryContracts` 增加 `usdv` 和 `fdao` Contract（读 + 写）
- `LegendaryDashboard` 类型新增字段：
  - `pendingUsdv: bigint`、`pendingFdao: bigint`
  - `previewUsdvInterest`、`previewUsdvLevel`、`previewFdaoInterest`、`previewFdaoLevel`
  - `usdvBalance`、`fdaoBalance`
- `doRefetch` 并行追加：`pendingUsdv`、`pendingFdao`、`previewTokenRewards`、`usdv.balanceOf`、`fdao.balanceOf`
- 全部用 `safe(...)` 包，未配置时 fallback 0

**`src/hooks/useLegendaryActions.ts`**
- 新增 `claimTokenRewards()` action，成功后 `onDone` 自动 refetch
- `REVERT_MAP` 追加：`"nothing or unavailable"` → `"暂无可领代币或合约未配置"`
- 现有 `claimInterest`、`withdraw`、`earlyWithdraw`、`compoundToPool2` 成功回调本就触发 refetch，会自动刷新 pending 代币奖励，无需额外改动

## 4. UI 改动

**`src/components/legendary/RewardsTab.tsx`**
在「领取奖励（USDT 佣金）」卡片下方新增「代币奖励」卡片：
- 两列展示 USDV / FDAO：利息累计部分、等级一次性部分、合计
- 显示当前 V 等级、钱包 USDV 余额、钱包 FDAO 余额
- 按钮「领取 USDV / FDAO」→ `claimTokenRewards()`，合计为 0 时 disabled
- 底部小字说明：领息/到期/复投按比例累计 USDV+FDAO；V1~V6 首次领取额外等级奖励

**`src/components/legendary/StatCard.tsx` / `Legendary.tsx`** （可选）
在 Dashboard 增加「待领 USDV」「待领 FDAO」两个 StatCard。

## 5. 不动的部分

- 1 池 deposit、2 池 compoundToPool2、仓位列表、APR 计算
- bind/teamPerf/getLevel/直推列表
- USDT 佣金 `claimRewards` + 24h 倒计时
- ReferralRegistry 地址与调用
- Etherscan `RewardsClaimed` 查询逻辑（仅 staking 地址常量变更）

## 验收清单

- 新地址下存款、仓位、佣金行为与旧版一致
- 领利息后 `pendingUsdv` / `pendingFdao` 上升
- `previewTokenRewards` 与链上读值一致
- `claimTokenRewards` 后 USDV/FDAO 到账钱包，pending 清零
- `claimRewards` 仍只领 USDT 佣金，两者互不影响
- Referral 仍走 `0x991d...`
