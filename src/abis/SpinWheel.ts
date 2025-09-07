export const SpinWheel_ABI = [
  // User methods
  "function canSpin(address user) view returns (bool ok, string reason)",
  "function spin() returns (uint256 amount)",
  "function dailyCap() view returns (uint256)",
  "function mintedPerDay(uint256 dayId) view returns (uint256)",
  "function lastSpinDay(address user) view returns (uint256)",
  
  // Events
  "event Spun(address indexed user, uint256 amount, uint256 dayId)"
] as const;

export type SpinWheelMethods = {
  canSpin: (user: string) => Promise<{ ok: boolean; reason: string }>;
  spin: () => Promise<any>;
  dailyCap: () => Promise<bigint>;
  mintedPerDay: (dayId: bigint) => Promise<bigint>;
  lastSpinDay: (user: string) => Promise<bigint>;
};