import { id, zeroPadValue, getAddress } from "ethers";
import { LEGENDARY_STAKING_ADDRESS } from "@/config/legendary";

export type ClaimRecord = {
  hash: string;
  block: number;
  amount: bigint;
  ts?: number;
};

const BSC_CHAIN_ID = 56;
const REWARDS_CLAIMED_TOPIC = id("RewardsClaimed(address,uint256)");

const cacheKey = (account: string) =>
  `legendary_claims_v1_${account.toLowerCase()}_${LEGENDARY_STAKING_ADDRESS.toLowerCase()}`;

export function readClaimCache(account: string): ClaimRecord[] | null {
  try {
    const raw = localStorage.getItem(cacheKey(account));
    if (!raw) return null;
    const arr = JSON.parse(raw) as Array<Omit<ClaimRecord, "amount"> & { amount: string }>;
    return arr.map((r) => ({ ...r, amount: BigInt(r.amount) }));
  } catch {
    return null;
  }
}

export function writeClaimCache(account: string, records: ClaimRecord[]) {
  try {
    localStorage.setItem(
      cacheKey(account),
      JSON.stringify(records.map((r) => ({ ...r, amount: r.amount.toString() }))),
    );
  } catch {
    // ignore
  }
}

export async function fetchClaimHistoryViaApi(
  account: string,
  apiKey: string,
): Promise<ClaimRecord[]> {
  if (!apiKey) throw new Error("未配置 API Key，请在环境变量填写 VITE_ETHERSCAN_API_KEY");
  const topic1 = zeroPadValue(getAddress(account), 32);
  const url = new URL("https://api.etherscan.io/v2/api");
  url.searchParams.set("chainid", String(BSC_CHAIN_ID));
  url.searchParams.set("module", "logs");
  url.searchParams.set("action", "getLogs");
  url.searchParams.set("address", LEGENDARY_STAKING_ADDRESS);
  url.searchParams.set("fromBlock", "0");
  url.searchParams.set("toBlock", "latest");
  url.searchParams.set("topic0", REWARDS_CLAIMED_TOPIC);
  url.searchParams.set("topic0_1_opr", "and");
  url.searchParams.set("topic1", topic1);
  url.searchParams.set("page", "1");
  url.searchParams.set("offset", "1000");
  url.searchParams.set("apikey", apiKey);

  const res = await fetch(url.toString());
  const json = await res.json();
  if (json.status !== "1") {
    if (Array.isArray(json.result) && json.result.length === 0) return [];
    if (typeof json.result === "string" && /no records/i.test(json.result)) return [];
    throw new Error(json.message || json.result || "Etherscan API 请求失败");
  }
  const logs = json.result as Array<{
    transactionHash: string;
    blockNumber: string;
    timeStamp: string;
    data: string;
  }>;
  const records: ClaimRecord[] = logs.map((l) => ({
    hash: l.transactionHash,
    block: parseInt(l.blockNumber, 16),
    ts: l.timeStamp ? parseInt(l.timeStamp, 16) : undefined,
    amount: BigInt(l.data),
  }));
  records.sort((a, b) => b.block - a.block);
  return records.slice(0, 50);
}
