export const ReferralRegistry_ABI = [
  "function inviterOf(address) view returns (address)",
  "function getDirects(address user) view returns (address[])",
  "function getIndirectsL1(address user) view returns (address[])",
  "function getTeamP(address user) view returns (uint256)",
  "function getLevel(address user) view returns (uint256)",
  "function getDirectBps(address inviter) view returns (uint256)",
  // Newly exposed public mapping getters for accurate on-chain stats
  "function pDirect(address) view returns (uint256)",
  "function pIndirect1(address) view returns (uint256)",
  "function pSelf(address) view returns (uint256)",
  "function bind(address inviter)",
  "function owner() view returns (address)"
] as const;

export type ReferralRegistryMethods = {
  inviterOf: (user: string) => Promise<string>;
  getDirects: (user: string) => Promise<string[]>;
  getIndirectsL1: (user: string) => Promise<string[]>;
  getTeamP: (user: string) => Promise<bigint>;
  getLevel: (user: string) => Promise<bigint>;
  getDirectBps: (user: string) => Promise<bigint>;
  pDirect: (user: string) => Promise<bigint>;
  pIndirect1: (user: string) => Promise<bigint>;
  pSelf: (user: string) => Promise<bigint>;
  owner: () => Promise<string>;
};
