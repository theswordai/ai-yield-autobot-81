export const EmissionsController_ABI = [
  // User methods
  "function claimStakeUSDV() returns (uint256)",
  "function claimProfitFollow(uint256[] posIds) returns (uint256)",
  "function claimNewcomer() returns (uint256)",
  "function joined(address user) view returns (bool)",
  
  // Events
  "event ClaimedStake(address indexed user, uint256 amount)",
  "event ClaimedProfit(address indexed user, uint256[] posIds, uint256 amount)",
  "event ClaimedNewcomer(address indexed user, uint256 amount)"
] as const;

export type EmissionsControllerMethods = {
  claimStakeUSDV: () => Promise<any>;
  claimProfitFollow: (posIds: bigint[]) => Promise<any>;
  claimNewcomer: () => Promise<any>;
  joined: (user: string) => Promise<boolean>;
};