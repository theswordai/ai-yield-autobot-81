export const LEGENDARY_STAKING_ADDRESS = "0x56d49C2c3E550a52b784432b92598058720B205b";
export const LEGENDARY_REFERRAL_ADDRESS = "0xEDb5fe3F6c1BD293e92152928d486420F8cDB9bE";

export const FDAO_ADDRESS = "0xB14473F60bb1073235ca9a96CE2da43BfD274811";

export const LOCK_DURATION_DAYS = 365;
export const MIN_DEPOSIT_USDT = 200n * 10n ** 18n;
export const MIN_BIND_STAKE_USDT = 200n * 10n ** 18n;
export const CLAIM_COOLDOWN_SEC = 24 * 60 * 60;

export const POOL1_BASE_APR_BPS = 26000; // 260%
export const POOL1_BONUS_PER_5K_BPS = 300; // +3%
export const POOL1_BONUS_UNIT = 5000n * 10n ** 18n; // 5000 USDT
export const POOL1_MAX_BONUS_BPS = 3000; // +30%
export const POOL2_APR_BPS = 36000; // 360%

export const REFERRAL_DIRECT_BPS = 450; // 4.5%
export const REFERRAL_INDIRECT_BPS = 300; // 3%
export const DYNAMIC_BASE_BPS = 1000; // 10%

// V1~V6: selfMin (USDT), teamMin (USDT), dynamicBps
export const LEVELS = [
  { v: 1, self: 200n, team: 1_000n, dynBps: 1000 },
  { v: 2, self: 1_000n, team: 50_000n, dynBps: 1200 },
  { v: 3, self: 3_000n, team: 150_000n, dynBps: 1500 },
  { v: 4, self: 10_000n, team: 500_000n, dynBps: 1800 },
  { v: 5, self: 20_000n, team: 1_000_000n, dynBps: 2000 },
  { v: 6, self: 30_000n, team: 2_000_000n, dynBps: 2500 },
] as const;

export function calcPool1AprBps(amountWei: bigint): number {
  const bonus = (amountWei * BigInt(POOL1_BONUS_PER_5K_BPS)) / POOL1_BONUS_UNIT;
  const capped = bonus > BigInt(POOL1_MAX_BONUS_BPS) ? POOL1_MAX_BONUS_BPS : Number(bonus);
  return POOL1_BASE_APR_BPS + capped;
}

// APY from APR with daily compounding
export function aprBpsToApyPct(aprBps: number): number {
  const apr = aprBps / 10000;
  return (Math.pow(1 + apr / 365, 365) - 1) * 100;
}
