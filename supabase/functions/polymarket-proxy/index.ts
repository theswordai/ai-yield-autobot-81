const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch multiple pages to get more markets
    const allMarkets: any[] = [];
    const perPage = 100;
    const pages = 5; // 500 markets total

    const fetchPage = async (offset: number) => {
      const url = new URL('https://gamma-api.polymarket.com/markets');
      url.searchParams.set('limit', String(perPage));
      url.searchParams.set('active', 'true');
      url.searchParams.set('closed', 'false');
      url.searchParams.set('order', 'volume24hr');
      url.searchParams.set('ascending', 'false');
      url.searchParams.set('offset', String(offset));

      const response = await fetch(url.toString(), {
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Polymarket API error [${response.status}]: ${text}`);
      }

      return response.json();
    };

    // Fetch pages in parallel
    const promises = [];
    for (let i = 0; i < pages; i++) {
      promises.push(fetchPage(i * perPage));
    }

    const results = await Promise.all(promises);
    for (const page of results) {
      if (Array.isArray(page)) {
        allMarkets.push(...page);
      }
    }

    // Deduplicate by id
    const seen = new Set<string>();
    const unique = allMarkets.filter((m) => {
      const id = m.id || m.conditionId;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    return new Response(JSON.stringify(unique), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Polymarket proxy error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
