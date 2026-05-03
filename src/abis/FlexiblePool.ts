// ABI for Flexible Pool contract on BSC
// Source: https://bscscan.com/address/0x709020b91e5e8405e96eee06bfb2a0a3ae4d6004
export const FlexiblePool_ABI = [
  // ----- Constants -----
  "function BPS() view returns (uint256)",
  "function COMMISSION_FEE_BPS() view returns (uint256)",
  "function PRINCIPAL_FEE_BPS() view returns (uint256)",
  "function YIELD_FEE_BPS() view returns (uint256)",
  "function MAX_GEN() view returns (uint256)",
  "function YEAR() view returns (uint256)",
  "function minDeposit() view returns (uint256)",

  // ----- Global state -----
  "function apr() view returns (uint256)",
  "function aprUpdatedAt() view returns (uint256)",
  "function paused() view returns (bool)",
  "function frozen() view returns (bool)",
  "function totalPrincipal() view returns (uint256)",
  "function contractBalance() view returns (uint256)",
  "function totalClaimableCommission() view returns (uint256)",
  "function token() view returns (address)",

  // ----- User reads -----
  "function principalOf(address) view returns (uint256)",
  "function directPrincipalOf(address) view returns (uint256)",
  "function getLevelPrincipal(address user) view returns (uint256)",
  "function getLevel(address user) view returns (uint256)",
  "function getMaxGeneration(address user) view returns (uint256)",
  "function claimableCommission(address) view returns (uint256)",
  "function inviterOf(address) view returns (address)",
  "function getDirects(address user) view returns (address[])",

  // ----- Position reads -----
  "function getUserPositions(address user) view returns (uint256[])",
  "function getOpenPositions(address user) view returns (uint256[])",
  "function positions(uint256) view returns (address user, uint256 principal, uint64 startTime, uint64 lastAccruedAt, bool closed)",
  "function pendingYield(uint256 positionId) view returns (uint256)",
  "function previewClose(uint256 positionId) view returns (uint256 principal, uint256 yieldAmt, uint256 principalFee, uint256 yieldFee, uint256 netPaid)",

  // ----- Writes -----
  "function bind(address inviter)",
  "function deposit(uint256 amount) returns (uint256 positionId)",
  "function closePosition(uint256 positionId)",
  "function claimCommission()",

  // ----- Events -----
  "event Bound(address indexed user, address indexed inviter)",
  "event PositionOpened(address indexed user, uint256 indexed positionId, uint256 principal)",
  "event PositionClosed(address indexed user, uint256 indexed positionId, uint256 principal, uint256 yield, uint256 principalFee, uint256 yieldFee, uint256 netPaid)",
  "event CommissionAccrued(address indexed fromUser, address indexed toInviter, uint256 generation, uint256 amount)",
  "event CommissionClaimed(address indexed user, uint256 gross, uint256 fee, uint256 net)",
  "event AprUpdated(uint256 oldApr, uint256 newApr, uint256 timestamp)",
] as const;
