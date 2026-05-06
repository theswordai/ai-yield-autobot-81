// USDV Rewarder ABI for Flexible Pool positions
// Address: 0x96a0c407Ce4cceF6B9405197ee8d8d94Dd983B9D (BSC Mainnet)
export const Rewarder_ABI = [
  "function register(uint256 positionId)",
  "function claim(uint256 positionId)",
  "function isRegistered(uint256 positionId) view returns (bool)",
  "function isClaimed(uint256 positionId) view returns (bool)",
  "function previewClaim(uint256 positionId) view returns (uint256)",
  "function previewLive(uint256 positionId) view returns (uint256)",
  "function multiplier() view returns (uint256)",
  "function totalUsdvMinted() view returns (uint256)",
  "event Registered(address indexed user, uint256 indexed positionId)",
  "event Claimed(address indexed user, uint256 indexed positionId, uint256 amount)",
] as const;
