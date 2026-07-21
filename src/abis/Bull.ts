export const BULL_ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
] as const;

export const BULL_MIGRATION_ABI = [
  "function hasMigrated(address) view returns (bool)",
  "function entitlementOf(address) view returns (uint256)",
  "function paused() view returns (bool)",
  "function migrate(uint256 entitlement, bytes32[] proof)",
] as const;

export const BULL_VESTING_ABI = [
  "function vests(address) view returns (uint256 total, uint256 claimed, uint256 start)",
  "function vestedAmount(address) view returns (uint256)",
  "function claimable(address) view returns (uint256)",
  "function VESTING_DURATION() view returns (uint256)",
  "function paused() view returns (bool)",
  "function claim()",
] as const;

export const PANCAKE_FACTORY_ABI = [
  "function getPair(address, address) view returns (address)",
] as const;

export const PANCAKE_PAIR_ABI = [
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
] as const;
