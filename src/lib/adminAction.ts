import { BrowserProvider } from "ethers";
import { supabase } from "@/integrations/supabase/client";

export type AdminOp =
  | "announcement.create"
  | "announcement.update"
  | "announcement.delete"
  | "admin.bootstrap"
  | "blocked.add"
  | "blocked.delete";

function randomNonce() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function callAdminAction(op: AdminOp, payload: Record<string, unknown> = {}) {
  const eth = (window as any).ethereum;
  if (!eth) throw new Error("未检测到钱包");
  const provider = new BrowserProvider(eth);
  const signer = await provider.getSigner();
  const wallet = (await signer.getAddress()).toLowerCase();

  const message = `USD.ONLINE admin action\nop=${op}\nts=${Date.now()}\nnonce=${randomNonce()}`;
  const signature = await signer.signMessage(message);

  const { data, error } = await supabase.functions.invoke("admin-action", {
    body: { wallet, signature, message, op, payload },
  });
  if (error) throw new Error(error.message || "请求失败");
  if (data && (data as any).error) throw new Error(String((data as any).error));
  return data;
}
