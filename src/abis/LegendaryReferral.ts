export const LegendaryReferral_ABI = [
  "function bind(address inviter)",
  "function inviterOf(address user) view returns (address)",
  "function getDirects(address user) view returns (address[])",
  "function directCount(address user) view returns (uint256)",
  "function selfStake(address user) view returns (uint256)",
  "function teamPerf(address user) view returns (uint256)",
  "function getLevel(address user) view returns (uint8)",
  "function minBindStake() view returns (uint256)",
  "function selfMins(uint256 i) view returns (uint256)",
  "function teamMins(uint256 i) view returns (uint256)",
  "event Bound(address indexed user, address indexed inviter)",
] as const;
