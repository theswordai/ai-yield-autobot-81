import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const RPC_URL = 'https://bsc.publicnode.com';
const REWARDS_CLAIMED_TOPIC =
  '0xfc30cddea38e2bf4d6ea7d3f9ed3b6ad7f176419f4963bd81318067a4aee73fe';
const CHUNK = 49000;
const MAX_CHUNKS = 40; // ~1.96M blocks ≈ 68 days
const MAX_RECORDS = 50;

function padAddress(addr: string): string {
  return '0x' + addr.toLowerCase().replace(/^0x/, '').padStart(64, '0');
}

async function rpc(method: string, params: unknown[]) {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || 'RPC error');
  return json.result;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { user, contract } = await req.json();
    if (!user || !contract) {
      return new Response(JSON.stringify({ records: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const latestHex = (await rpc('eth_blockNumber', [])) as string;
    const latest = parseInt(latestHex, 16);
    const topic1 = padAddress(user);

    const collected: Array<{
      hash: string;
      block: number;
      ts?: number;
      amount: string;
    }> = [];

    let to = latest;
    for (let i = 0; i < MAX_CHUNKS && collected.length < MAX_RECORDS && to > 0; i++) {
      const from = Math.max(0, to - CHUNK);
      let logs: any[] = [];
      try {
        logs = (await rpc('eth_getLogs', [
          {
            fromBlock: '0x' + from.toString(16),
            toBlock: '0x' + to.toString(16),
            address: contract,
            topics: [REWARDS_CLAIMED_TOPIC, topic1],
          },
        ])) as any[];
      } catch {
        // skip failed chunk, continue
      }
      for (const l of logs) {
        collected.push({
          hash: l.transactionHash,
          block: parseInt(l.blockNumber, 16),
          amount: BigInt(l.data).toString(),
        });
      }
      to = from - 1;
    }

    collected.sort((a, b) => b.block - a.block);
    const records = collected.slice(0, MAX_RECORDS);

    // Fetch block timestamps in parallel
    await Promise.all(
      records.map(async (r) => {
        try {
          const blk = await rpc('eth_getBlockByNumber', [
            '0x' + r.block.toString(16),
            false,
          ]);
          if (blk?.timestamp) r.ts = parseInt(blk.timestamp, 16);
        } catch {
          // ignore
        }
      }),
    );

    return new Response(JSON.stringify({ records }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
