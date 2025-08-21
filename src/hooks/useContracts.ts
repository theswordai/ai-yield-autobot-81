import { useMemo } from "react";
import { Contract } from "ethers";
import { useWeb3 } from "./useWeb3";
import { MockUSDT_ABI, MockUSDTMethods } from "@/abis/MockUSDT";
import { LockStaking_ABI, LockStakingMethods } from "@/abis/LockStaking";
import { RewardsVault_ABI, RewardsVaultMethods } from "@/abis/RewardsVault";
import { ReferralRegistry_ABI, ReferralRegistryMethods } from "@/abis/ReferralRegistry";
import { USDT_ADDRESS, LOCK_ADDRESS, VAULT_ADDRESS, REFERRAL_ADDRESS } from "@/config/contracts";

export function useContracts() {
  const { provider, signer } = useWeb3();

  // 只读合约实例 (使用 provider)
  const contracts = useMemo(() => {
    if (!provider) return null;
    
    return {
      usdt: new Contract(USDT_ADDRESS, MockUSDT_ABI, provider) as Contract & MockUSDTMethods,
      lockStaking: new Contract(LOCK_ADDRESS, LockStaking_ABI, provider) as Contract & LockStakingMethods,
      rewardsVault: new Contract(VAULT_ADDRESS, RewardsVault_ABI, provider) as Contract & RewardsVaultMethods,
      referralRegistry: new Contract(REFERRAL_ADDRESS, ReferralRegistry_ABI, provider) as Contract & ReferralRegistryMethods,
    };
  }, [provider]);

  // 可写合约实例 (使用 signer)
  const writeContracts = useMemo(() => {
    if (!signer) return null;
    
    return {
      usdt: new Contract(USDT_ADDRESS, MockUSDT_ABI, signer) as Contract & MockUSDTMethods,
      lockStaking: new Contract(LOCK_ADDRESS, LockStaking_ABI, signer) as Contract & LockStakingMethods,
      rewardsVault: new Contract(VAULT_ADDRESS, RewardsVault_ABI, signer) as Contract & RewardsVaultMethods,
      referralRegistry: new Contract(REFERRAL_ADDRESS, ReferralRegistry_ABI, signer) as Contract & ReferralRegistryMethods,
    };
  }, [signer]);

  return {
    contracts,
    writeContracts,
    isReady: !!contracts && !!writeContracts,
  };
}