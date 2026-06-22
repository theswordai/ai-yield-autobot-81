// 把要在「我的仓位」中隐藏全部仓位的钱包地址写在这里（任意大小写，比较时会转小写）
export const HIDE_STAKE_POSITIONS_WALLETS: string[] = [
  // "0xabc...",
].map((a) => a.toLowerCase());

export function isStakePositionsHidden(account?: string | null): boolean {
  return !!account && HIDE_STAKE_POSITIONS_WALLETS.includes(account.toLowerCase());
}
