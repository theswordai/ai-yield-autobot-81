import { useMemo } from "react";
import { Contract } from "ethers";
import { useWeb3 } from "./useWeb3";
import { USDV_ABI, USDVMethods } from "@/abis/USDV";
import { EmissionsController_ABI, EmissionsControllerMethods } from "@/abis/EmissionsController";
import { SpinWheel_ABI, SpinWheelMethods } from "@/abis/SpinWheel";
import { LockStaking_ABI, LockStakingMethods } from "@/abis/LockStaking";
import { 
  USDV_ADDRESS, 
  EMISSIONS_CONTROLLER_ADDRESS, 
  SPIN_WHEEL_ADDRESS,
  LOCK_ADDRESS 
} from "@/config/contracts";

export function useUSDVContracts() {
  const { provider, signer } = useWeb3();

  // 只读合约实例 (使用 provider)
  const contracts = useMemo(() => {
    if (!provider) return null;
    
    return {
      usdv: new Contract(USDV_ADDRESS, USDV_ABI, provider) as Contract & USDVMethods,
      emissionsController: new Contract(EMISSIONS_CONTROLLER_ADDRESS, EmissionsController_ABI, provider) as Contract & EmissionsControllerMethods,
      spinWheel: new Contract(SPIN_WHEEL_ADDRESS, SpinWheel_ABI, provider) as Contract & SpinWheelMethods,
      lockStaking: new Contract(LOCK_ADDRESS, LockStaking_ABI, provider) as Contract & LockStakingMethods,
    };
  }, [provider]);

  // 可写合约实例 (使用 signer)
  const writeContracts = useMemo(() => {
    if (!signer) return null;
    
    return {
      usdv: new Contract(USDV_ADDRESS, USDV_ABI, signer) as Contract & USDVMethods,
      emissionsController: new Contract(EMISSIONS_CONTROLLER_ADDRESS, EmissionsController_ABI, signer) as Contract & EmissionsControllerMethods,
      spinWheel: new Contract(SPIN_WHEEL_ADDRESS, SpinWheel_ABI, signer) as Contract & SpinWheelMethods,
      lockStaking: new Contract(LOCK_ADDRESS, LockStaking_ABI, signer) as Contract & LockStakingMethods,
    };
  }, [signer]);

  return {
    contracts,
    writeContracts,
    isReady: !!contracts && !!writeContracts,
  };
}