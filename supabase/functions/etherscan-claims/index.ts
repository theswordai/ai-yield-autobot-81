import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const BSC_CHAIN_ID = 56;
// keccak256("RewardsClaimed(address,uint256)")
const REWARDS_CLAIMED_TOPIC =
  '0xfc30cddea38e2bf4d6ea7d3f9ed3b6ad7f176419f4963bd81318067a4aee73fe';

function padAddress(addr: string): string {
  const clean = addr.toLowerCase().replace(/^0x/, '');
  return '0x' + clean.padStart(64, '0');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('ETHERSCAN_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'ETHERSCAN_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { user, contract, fromBlock = '0', toBlock = 'latest' } = await req.json();
    if (!user || !contract) {
      return new Response(
        JSON.stringify({ error: 'Missing user or contract' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const url = new URL('https://api.etherscan.io/v2/api');
    url.searchParams.set('chainid', String(BSC_CHAIN_ID));
    url.searchParams.set('module', 'logs');
    url.searchParams.set('action', 'getLogs');
    url.searchParams.set('address', contract);
    url.searchParams.set('fromBlock', String(fromBlock));
    url.searchParams.set('toBlock', String(toBlock));
    url.searchParams.set('topic0', REWARDS_CLAIMED_TOPIC);
    url.searchParams.set('topic0_1_opr', 'and');
    url.searchParams.set('topic1', padAddress(user));
    url.searchParams.set('page', '1');
    url.searchParams.set('offset', '1000');
    url.searchParams.set('apikey', apiKey);

    const res = await fetch(url.toString());
    const json = await res.json();

    if (json.status !== '1') {
      if (Array.isArray(json.result) && json.result.length === 0) {
        return new Response(JSON.stringify({ records: [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (typeof json.result === 'string' && /no records/i.test(json.result)) {
        return new Response(JSON.stringify({ records: [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(
        JSON.stringify({ error: json.message || json.result || 'Etherscan API failed' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const logs = (json.result ?? []) as Array<{
      transactionHash: string;
      blockNumber: string;
      timeStamp: string;
      data: string;
    }>;

    const records = logs
      .map((l) => ({
        hash: l.transactionHash,
        block: parseInt(l.blockNumber, 16),
        ts: l.timeStamp ? parseInt(l.timeStamp, 16) : undefined,
        amount: BigInt(l.data).toString(),
      }))
      .sort((a, b) => b.block - a.block)
      .slice(0, 50);

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
