## Add USDV Reward Feature to 活期 (Flexible Pool)

Integrate the new Rewarder contract `0x96a0c407Ce4cceF6B9405197ee8d8d94Dd983B9D` so that for each deposit position users can register → close → claim USDV (10× the yield earned) on the existing Flexible page.

### New files

**`src/abis/Rewarder.ts`** — minimal ABI: `register`, `claim`, `isRegistered`, `isClaimed`, `previewClaim`, `previewLive`, `multiplier`, `totalUsdvMinted`.

**`src/config/rewarder.ts`** — exports `REWARDER_ADDRESS`, `USDV_TOKEN_ADDRESS` (`0x14B26c4A87e7ADddb401c281A4858090D79d1391`), `USDV_DECIMALS = 18`.

**`src/hooks/useRewarder.ts`** — hook providing:
- `globalInfo`: `{ multiplier, totalMinted, usdvBalance }` (refreshed on account/refresh)
- `getStatus(positionId, closed)` → `{ registered, claimed, previewAmount }` (cached map keyed by id)
- `register(id)`, `claim(id)` write functions with the same toast/error pattern as `useFlexiblePool`
- Standard error mapping for the messages listed in the spec (already registered / already closed / not registered / not closed / already claimed / daily mint cap) translated zh/en

### Changes to `src/pages/Flexible.tsx`

1. Use `useRewarder()` alongside the existing pool hook.
2. After `deposit(amount)` returns success, automatically open a small confirmation dialog: **"激活 USDV 奖励 / Activate USDV Reward"** for the newly created position. Use `pool.queryFilter("PositionOpened", fromBlock)` filtered by user to grab the new `positionId` (or read latest from `data.positions` after refresh — newest is index 0). One-click → `rewarder.register(id)`. User can dismiss; the position card will continue to surface an "Activate" button.
3. Extend `PositionCard` props with `usdvStatus`, `usdvMultiplier`, `onRegister`, `onClaimUsdv`, `actionBusy`. Inside the card, render a new row under "Pending Yield":
   - Open + not registered → amber badge "⚠️ USDV 未激活" + "激活" button (`register`)
   - Open + registered → green badge "🟢 USDV 已激活 (×10)" + small text "预计可得 ≈ {previewLive} USDV"
   - Closed + registered + not claimed → "🎁 领取 USDV ({previewClaim})" button
   - Closed + claimed → "✅ 已领取 {amount} USDV"
   - Closed + never registered → muted "❌ 未激活，无 USDV 奖励"
4. After `closePosition` succeeds in `confirmClose`, if the position was registered, show a toast/dialog: **"🎉 您可以领取 X USDV"** with a Claim button calling `rewarder.claim(id)`; on success refresh data so USDV balance updates.
5. New StatCard row above "我的仓位": **USDV 奖励** card with three stats:
   - 我的 USDV 余额 (from token `balanceOf`)
   - 全网累计铸造 USDV (`totalUsdvMinted`)
   - 倍数: "×{multiplier} 利息" with subtitle "活期利息 → USDV 空投"
6. Add a short explainer banner inside the deposit card: "存款后请激活 USDV 奖励，平仓前必须激活，否则无法领取。"

### Technical notes

- All reads use the existing `provider`; writes use `signer`. Wrap RPC calls in try/catch returning fallbacks to honor the silent-error policy for read failures.
- USDV balance is also fetched in `useRewarder` (separate ERC20 contract, just `balanceOf`).
- `getStatus` is called in batch: `Promise.all(positions.map(...))`. Cache results in component state keyed by `id.toString()`; refetch when `data.positions` changes or after register/claim/close.
- Per-position write loading keys: `register-${id}`, `claim-usdv-${id}`.
- Format: `Number(formatUnits(v, 18)).toLocaleString(undefined,{maximumFractionDigits:2})` + " USDV".
- No Supabase changes. No locale file edits required (inline zh/en strings, matching the existing Flexible page style).
- No changes to `Stake.tsx` (lock pool) — feature lives only on the activity that emits `PositionOpened` from the Flexible pool.

### UX flow

```text
Deposit USDT → position created → auto-prompt "Activate USDV"
                                          ↓ (register tx)
        ... yield accrues (live preview shown on card) ...
                                          ↓
Close position → USDT received → toast "Claim X USDV" → claim tx → USDV in wallet
```
