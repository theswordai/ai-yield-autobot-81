import { useWeb3 } from "@/hooks/useWeb3";
import { useBlockedWallet } from "@/hooks/useBlockedWallet";

export function WalletAccessGate() {
  const { account } = useWeb3();
  const { blocked } = useBlockedWallet(account);

  if (!blocked) return null;
  return <div className="fixed inset-0 z-[9999] bg-background" aria-hidden="true" />;
}
