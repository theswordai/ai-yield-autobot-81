import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const SYMBOLS: Record<string, string> = {
  BTC: "BTCUSDT",
  ETH: "ETHUSDT",
  BNB: "BNBUSDT",
  SOL: "SOLUSDT",
  XRP: "XRPUSDT",
  DOGE: "DOGEUSDT",
};

export default defineTool({
  name: "get_featured_prices",
  title: "Get featured crypto prices",
  description:
    "Get current spot prices (USD) for featured cryptocurrencies from Binance. Supports BTC, ETH, BNB, SOL, XRP, DOGE.",
  inputSchema: {
    symbols: z
      .array(z.string())
      .optional()
      .describe("Optional list of ticker symbols like ['BTC','ETH']. Defaults to all featured symbols."),
  },
  annotations: { readOnlyHint: true, openWorldHint: true },
  handler: async ({ symbols }) => {
    const wanted = (symbols && symbols.length ? symbols : Object.keys(SYMBOLS))
      .map((s) => s.toUpperCase())
      .filter((s) => SYMBOLS[s]);
    const results: Record<string, number | null> = {};
    await Promise.all(
      wanted.map(async (s) => {
        try {
          const r = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${SYMBOLS[s]}`);
          const j = await r.json();
          results[s] = j?.price ? Number(j.price) : null;
        } catch {
          results[s] = null;
        }
      }),
    );
    return {
      content: [{ type: "text", text: JSON.stringify(results) }],
      structuredContent: { prices: results },
    };
  },
});
