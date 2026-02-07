
# Add TRUMP Token Price to the Ticker Marquee

## Overview

Add the TRUMP token (Solana contract: `6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN`) price display to the scrolling price ticker on the launch page.

## Approach

TRUMP is available on CoinGecko with the ID `official-trump`, so we can add it directly to the existing CoinGecko fetch logic -- no need for a separate GeckoTerminal fetch like USDV.

## Changes

**File: `src/components/PriceTicker.tsx`**

1. Add TRUMP to the `CG_IDS` mapping:

```text
const CG_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  USDT: "tether",
  BNB: "binancecoin",
  DOGE: "dogecoin",
  TRUMP: "official-trump",   // <-- new
};
```

2. Add TRUMP to the `ORDER` array (displayed after SOL, before USDT):

```text
const ORDER: Array<keyof typeof CG_IDS | "USD1" | "USDV"> = [
  "BTC",
  "ETH",
  "SOL",
  "TRUMP",   // <-- new
  "USDT",
  "USD1",
  "USDV",
  "BNB",
  "DOGE",
];
```

3. Slightly increase the marquee animation duration from `28s` to `32s` to accommodate the extra item and keep the scroll speed comfortable.

No other files need to be changed -- the existing `fetchPrices` logic already handles any key in `CG_IDS` automatically, and the `toItem` function will format TRUMP's price and 24h change correctly.

## Result

The ticker will display: BTC - ETH - SOL - **TRUMP** - USDT - USD1 - USDV - BNB - DOGE, with TRUMP showing real-time price and 24h change from CoinGecko.
