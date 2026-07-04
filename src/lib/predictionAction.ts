import { BrowserProvider } from "ethers";
import { supabase } from "@/integrations/supabase/client";

export type PredictionOp =
  | "account.claim_initial_balance"
  | "account.get"
  | "trade.place"
  | "admin.settle_market"
  | "admin.adjust_balance"
  | "admin.list_markets";

function randomNonce() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function callPredictionAction(op: PredictionOp, payload: Record<string, unknown> = {}) {
  const eth = (window as any).ethereum;
  if (!eth) throw new Error("未检测到钱包 / Wallet not detected");
  const provider = new BrowserProvider(eth);
  const signer = await provider.getSigner();
  const wallet = (await signer.getAddress()).toLowerCase();

  const message = `USD.ONLINE prediction action\nop=${op}\nts=${Date.now()}\nnonce=${randomNonce()}`;
  const signature = await signer.signMessage(message);

  const { data, error } = await supabase.functions.invoke("prediction-action", {
    body: { wallet, signature, message, op, payload },
  });
  if (error) throw new Error(error.message || "Request failed");
  if (data && (data as any).error) {
    const err = (data as any).error;
    throw new Error(typeof err === "string" ? err : JSON.stringify(err));
  }
  return data as any;
}
