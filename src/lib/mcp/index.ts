import { defineMcp } from "@lovable.dev/mcp-js";
import getLatestNews from "./tools/get-latest-news";
import getFeaturedPrices from "./tools/get-featured-prices";
import getYieldInfo from "./tools/get-yield-info";

export default defineMcp({
  name: "usd-online-mcp",
  title: "USD.ONLINE MCP",
  version: "0.1.0",
  instructions:
    "Tools for USD.ONLINE, a BNB Smart Chain DeFi platform. Use `get_latest_news` for recent announcements, `get_featured_prices` for live crypto spot prices, and `get_yield_info` for staking strategies (APR, daily-compounded APY, lock period).",
  tools: [getLatestNews, getFeaturedPrices, getYieldInfo],
});
