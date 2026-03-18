

## Plan: Redesign Prediction Market Page to Match Polymarket Style

### Overview
Redesign the Predict page and detail page to closely resemble Polymarket's layout, and ensure all available data fields (including images, icons, event info, liquidity, 24hr volume) are pulled from the API.

### Changes

#### 1. Update Edge Function — more data fields
- Add `tag` parameter support and increase `limit` to 50
- Pass through more fields: `image`, `icon`, `slug`, `liquidity`, `volume24hr`, `events`, `bestBid`, `bestAsk`, `outcomes`, `groupItemTitle`

#### 2. Update `usePolymarkets.ts` — richer data model
- Expand `PolyMarket` interface to include:
  - `icon` (market icon/logo from API)
  - `image` (market banner image)
  - `slug` (for potential external links)
  - `liquidity` (liquidityNum)
  - `volume24hr` (24h trading volume)
  - `endDate`, `outcomes` (parsed outcome labels)
  - `events` (event title, series info)
  - `groupItemTitle` (e.g. team name)
- Map these from the raw API response
- Improve `categorize()` with more keywords from Polymarket's actual categories (Iran, Cuba, NCAA, UCL, etc.)

#### 3. Redesign `Predict.tsx` — Polymarket-style layout
- **Top section**: Featured/trending market carousel or hero card (like Polymarket's top banner showing the hottest market with outcomes listed)
- **Category tabs**: Horizontal scrollable tab bar matching Polymarket style (Trending, Politics, Sports, Crypto, Tech, etc.) — more like text tabs than pill buttons
- **Market cards redesign**:
  - Show market `icon`/`image` as a small avatar on the left (like Polymarket)
  - Title on the right of icon
  - Show YES percentage prominently with green/red Yes/No buttons
  - Volume at bottom
  - Cleaner, list-like layout option alongside grid view
- **Search bar** moved to top-right area (like Polymarket)

#### 4. Redesign `PredictDetail.tsx` — richer detail view
- Show market image/banner at top
- Display icon next to title
- Show event context (from `events` array — event title, series)
- Add liquidity info alongside volume
- Keep the paper trading panel but style it more cleanly

### Technical Details

**Files to modify:**
- `supabase/functions/polymarket-proxy/index.ts` — no changes needed, already returns full API response
- `src/hooks/usePolymarkets.ts` — expand interface, map more fields
- `src/pages/Predict.tsx` — full redesign with image support, Polymarket-style cards
- `src/pages/PredictDetail.tsx` — add image/icon display, more stats

**Key design elements from Polymarket to replicate:**
- Small round icon/avatar next to market title
- Clean white-on-dark card style
- YES/NO price buttons with green/red colors
- Volume displayed as "$10M Vol."
- End date shown
- Horizontal category filter tabs

