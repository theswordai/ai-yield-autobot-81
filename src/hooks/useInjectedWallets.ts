import { useEffect, useState } from "react";
import type { Eip1193Provider } from "ethers";

export type DiscoveredProvider = {
  info: {
    name: string;
    icon?: string;
    rdns?: string;
    uuid?: string;
  };
  provider: Eip1193Provider & { request?: (args: any) => Promise<any> };
};

// EIP-6963 multi-injected wallet discovery
export function useInjectedWallets() {
  const [providers, setProviders] = useState<DiscoveredProvider[]>([]);

  useEffect(() => {
    const list: DiscoveredProvider[] = [];

    // Handler for announced providers
    const onAnnounce = (event: any) => {
      const detail = event?.detail;
      if (!detail?.provider) return;
      const exists = list.find((p) => p.info?.uuid && p.info.uuid === detail.info?.uuid);
      if (!exists) {
        list.push({ info: detail.info || { name: "Injected" }, provider: detail.provider });
        setProviders([...list]);
      }
    };

    // Listen for announcements
    window.addEventListener("eip6963:announceProvider", onAnnounce as EventListener);
    // Request providers
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    // Fallback: single injected provider
    const fallback: any = (window as any).ethereum;
    if (fallback) {
      const name = (fallback.isOKXWallet && "OKX Wallet") ||
        (fallback.isMetaMask && "MetaMask") ||
        (fallback.isBitget && "Bitget Wallet") ||
        (fallback.isBybitWallet && "Bybit Wallet") ||
        (fallback.isCoinbaseWallet && "Coinbase Wallet") ||
        "Injected";
      const exists = list.some((p) => p.provider === fallback);
      if (!exists) {
        list.push({ info: { name }, provider: fallback });
        setProviders([...list]);
      }
    }

    return () => {
      window.removeEventListener("eip6963:announceProvider", onAnnounce as EventListener);
    };
  }, []);

  return providers;
}
