import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrowserProvider, Eip1193Provider, JsonRpcSigner } from "ethers";

declare global {
  interface Window {
    ethereum?: Eip1193Provider & { request: (args: any) => Promise<any> };
  }
}

export function useWeb3() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const activeEip1193Ref = useRef<Eip1193Provider | null>(null);

  // Initialize from injected provider (passive)
  useEffect(() => {
    const injected = window.ethereum ?? null;
    if (!injected) return;
    activeEip1193Ref.current = injected;
    const p = new BrowserProvider(injected);
    setProvider(p);

    p.send("eth_accounts", []).then(async (accs) => {
      if (accs && accs.length > 0) {
        setAccount(accs[0]);
        const s = await p.getSigner();
        setSigner(s);
      }
    });

    p.getNetwork().then((n) => setChainId(Number(n.chainId))).catch(() => {});

    const handleAccountsChanged = async (accs: string[]) => {
      const next = accs?.[0] ?? null;
      setAccount(next);
      if (!next) {
        setSigner(null);
      } else {
        try {
          const s = await p.getSigner(next);
          setSigner(s);
        } catch {
          // fallback to default signer
          try { setSigner(await p.getSigner()); } catch {}
        }
      }
    };
    const handleChainChanged = async (_: string) => {
      try {
        const n = await p.getNetwork();
        setChainId(Number(n.chainId));
      } catch {}
    };

    (injected as any)?.on?.("accountsChanged", handleAccountsChanged as any);
    (injected as any)?.on?.("chainChanged", handleChainChanged as any);

    return () => {
      (injected as any)?.removeListener?.("accountsChanged", handleAccountsChanged as any);
      (injected as any)?.removeListener?.("chainChanged", handleChainChanged as any);
    };
  }, []);

  const ensureBSC = useCallback(async (eip: any) => {
    try {
      await eip.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x38" }],
      });
    } catch (err: any) {
      if (err.code === 4902) {
        await eip.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: "0x38",
            chainName: "BNB Smart Chain",
            nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
            rpcUrls: ["https://bsc-dataseed.binance.org/"],
            blockExplorerUrls: ["https://bscscan.com/"],
          }],
        });
      }
    }
  }, []);

  const connect = useCallback(async () => {
    const eip = activeEip1193Ref.current || window.ethereum;
    if (!eip) throw new Error("未检测到钱包，请先安装或选择一个钱包");
    const p = new BrowserProvider(eip);
    setProvider(p);
    const accs = await p.send("eth_requestAccounts", []);
    const s = await p.getSigner();
    setSigner(s);
    setAccount(accs[0]);
    const n = await p.getNetwork();
    const cid = Number(n.chainId);
    setChainId(cid);
    if (cid !== 56) {
      await ensureBSC(eip);
      const p2 = new BrowserProvider(eip);
      setProvider(p2);
      const s2 = await p2.getSigner();
      setSigner(s2);
      const n2 = await p2.getNetwork();
      setChainId(Number(n2.chainId));
    }
  }, [ensureBSC]);

  const connectWith = useCallback(async (extProvider: Eip1193Provider) => {
    activeEip1193Ref.current = extProvider;
    const p = new BrowserProvider(extProvider);
    setProvider(p);
    const accs = await p.send("eth_requestAccounts", []);
    let s = await p.getSigner();
    setSigner(s);
    setAccount(accs[0] ?? null);
    const n = await p.getNetwork();
    let cid = Number(n.chainId);
    setChainId(cid);
    if (cid !== 56) {
      await ensureBSC(extProvider);
      const p2 = new BrowserProvider(extProvider);
      setProvider(p2);
      s = await p2.getSigner();
      setSigner(s);
      const n2 = await p2.getNetwork();
      setChainId(Number(n2.chainId));
    }

    // Bind listeners to selected provider
    const handleAccountsChanged = async (accs: string[]) => {
      const next = accs?.[0] ?? null;
      setAccount(next);
      if (!next) {
        setSigner(null);
      } else {
        try {
          const s = await p.getSigner(next);
          setSigner(s);
        } catch {
          try { setSigner(await p.getSigner()); } catch {}
        }
      }
    };
    const handleChainChanged = async (_: string) => {
      try {
        const n2 = await p.getNetwork();
        setChainId(Number(n2.chainId));
      } catch {}
    };
    (extProvider as any)?.on?.("accountsChanged", handleAccountsChanged as any);
    (extProvider as any)?.on?.("chainChanged", handleChainChanged as any);
  }, [ensureBSC]);

  const disconnect = useCallback(() => {
    setSigner(null);
    setAccount(null);
    // keep chainId & provider so UI can reconnect quickly
  }, []);

  return useMemo(
    () => ({ provider, signer, account, chainId, connect, connectWith, disconnect }),
    [provider, signer, account, chainId, connect, connectWith, disconnect]
  );
}
