import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const STRATEGIES = [
  { name: "Flexible Pool", apr: 0.5, minDeposit: 200, lockDays: 0 },
  { name: "Lock Staking", apr: 1.2, minDeposit: 200, lockDays: 30 },
  { name: "Legendary Capital", apr: 2.8, minDeposit: 200, lockDays: 90 },
];

function aprToApy(apr: number) {
  return Math.pow(1 + apr / 365, 365) - 1;
}

export default defineTool({
  name: "get_yield_info",
  title: "Get USD.ONLINE yield strategies",
  description:
    "Get USD.ONLINE staking strategies with APR, daily-compounded APY, minimum deposit, and lock period.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const items = STRATEGIES.map((s) => ({
      ...s,
      apy: aprToApy(s.apr),
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(items) }],
      structuredContent: { strategies: items },
    };
  },
});
