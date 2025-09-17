import { useState, useEffect } from "react";
import { useWeb3 } from "./useWeb3";

const DEFAULT_ROOT_ADDRESS = "0x6eD00D95766Bdf20c2FffcdBEC34a69A8c5B7eE6";

export function useRootAddress() {
  const { account } = useWeb3();
  const [rootAddress, setRootAddress] = useState<string>("");
  const [source, setSource] = useState<"ref" | "localStorage" | "wallet" | "default">("default");

  useEffect(() => {
    // Priority: ref → localStorage → wallet → DEFAULT
    const urlParams = new URLSearchParams(window.location.search);
    const refAddress = urlParams.get('inviter') || urlParams.get('ref');
    const storedAddress = localStorage.getItem('inviter');
    
    let address = "";
    let addressSource: "ref" | "localStorage" | "wallet" | "default" = "default";

    if (refAddress && /^0x[a-fA-F0-9]{40}$/.test(refAddress)) {
      address = refAddress;
      addressSource = "ref";
      // Store ref address to localStorage
      localStorage.setItem('inviter', refAddress);
    } else if (storedAddress && /^0x[a-fA-F0-9]{40}$/.test(storedAddress)) {
      address = storedAddress;
      addressSource = "localStorage";
    } else if (account && /^0x[a-fA-F0-9]{40}$/.test(account)) {
      address = account;
      addressSource = "wallet";
    } else {
      address = DEFAULT_ROOT_ADDRESS;
      addressSource = "default";
    }

    setRootAddress(address);
    setSource(addressSource);
  }, [account]);

  const updateRootAddress = (newAddress: string) => {
    if (/^0x[a-fA-F0-9]{40}$/.test(newAddress)) {
      localStorage.setItem('inviter', newAddress);
      setRootAddress(newAddress);
      setSource("localStorage");
    }
  };

  const clearInviteSource = () => {
    localStorage.removeItem('inviter');
    // Clear URL params
    const url = new URL(window.location.href);
    url.searchParams.delete('inviter');
    url.searchParams.delete('ref');
    window.history.replaceState({}, '', url.toString());
    
    // Reset to wallet or default
    if (account && /^0x[a-fA-F0-9]{40}$/.test(account)) {
      setRootAddress(account);
      setSource("wallet");
    } else {
      setRootAddress(DEFAULT_ROOT_ADDRESS);
      setSource("default");
    }
  };

  const switchToWallet = () => {
    if (account && /^0x[a-fA-F0-9]{40}$/.test(account)) {
      localStorage.removeItem('inviter');
      setRootAddress(account);
      setSource("wallet");
    }
  };

  return {
    rootAddress,
    source,
    updateRootAddress,
    clearInviteSource,
    switchToWallet,
    defaultAddress: DEFAULT_ROOT_ADDRESS
  };
}