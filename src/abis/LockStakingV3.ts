// V3 staking contract ABI — superset of LockStaking with legacy migration helpers.
export const LockStakingV3_ABI = [
  "function deposit(uint256 amount, uint8 lockChoice)",
  "function claim(uint256 posId)",
  "function withdraw(uint256 posId)",
  "function claimLegacy(uint256 posId)",
  "function withdrawLegacy(uint256 posId)",
  "function pendingYield(uint256 posId) view returns (uint256)",
  "function getUserPositions(address user) view returns (uint256[])",
  "function positions(uint256) view returns (address user, uint256 principal, uint256 startTime, uint256 lastClaimTime, uint256 lockDuration, uint256 aprBps, bool principalWithdrawn)",
  "event Deposited(address indexed user, uint256 indexed posId, uint256 amount, uint256 fee, uint8 lockChoice, uint256 aprBps)"
] as const;
