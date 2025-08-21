export const RewardsVault_ABI = [
  "function pendingRewards(address user) view returns (uint256)",
  "function claim() returns (uint256)",
  "function owner() view returns (address)",
  "event Claimed(address indexed user, uint256 amount)"
] as const;

export type RewardsVaultMethods = {
  pendingRewards: (user: string) => Promise<bigint>;
  claim: () => Promise<any>;
  owner: () => Promise<string>;
};
