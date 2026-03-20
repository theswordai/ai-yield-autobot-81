import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GAMMA_API = 'https://gamma-api.polymarket.com';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const limit = url.searchParams.get('limit') || '20';
    const offset = url.searchParams.get('offset') || '0';
    const slug = url.searchParams.get('slug');

    let apiUrl: string;

    if (slug) {
      apiUrl = `${GAMMA_API}/markets?slug=${encodeURIComponent(slug)}&closed=false`;
    } else {
      apiUrl = `${GAMMA_API}/markets?closed=false&active=true&limit=${limit}&offset=${offset}&order=volume24hr&ascending=false`;
    }

    const response = await fetch(apiUrl, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Polymarket API error [${response.status}]:`, text);
      return new Response(JSON.stringify({ error: `Polymarket API error: ${response.status}` }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
