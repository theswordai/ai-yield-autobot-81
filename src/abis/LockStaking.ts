export const LockStaking_ABI = [
  "function deposit(uint256 amount, uint8 lockChoice)",
  "function claim(uint256 posId)",
  "function withdraw(uint256 posId)",
  "function emergencyWithdraw(uint256 amount)",
  "function owner() view returns (address)",
  "function pendingYield(uint256 posId) view returns (uint256)",
  "function getUserPositions(address user) view returns (uint256[])",
  "function positions(uint256) view returns (address user, uint256 principal, uint256 startTime, uint256 lastClaimTime, uint256 lockDuration, uint256 aprBps, bool principalWithdrawn)",
  "event Deposited(address indexed user, uint256 indexed posId, uint256 amount, uint256 fee, uint8 lockChoice, uint256 aprBps)",
  "event ReferralAccrued(address indexed to1, address indexed to2, uint256 r1, uint256 r2)"
] as const;

export type PositionStruct = {
  user: string;
  principal: bigint;
  startTime: bigint;
  lastClaimTime: bigint;
  lockDuration: bigint;
  aprBps: bigint;
  principalWithdrawn: boolean;
};

export type LockStakingMethods = {
  deposit: (amount: bigint, lockChoice: number) => Promise<any>;
  claim: (posId: bigint) => Promise<any>;
  withdraw: (posId: bigint) => Promise<any>;
  emergencyWithdraw: (amount: bigint) => Promise<any>;
  owner: () => Promise<string>;
  pendingYield: (posId: bigint) => Promise<bigint>;
  getUserPositions: (user: string) => Promise<bigint[]>;
  positions: (posId: bigint) => Promise<PositionStruct>;
};
