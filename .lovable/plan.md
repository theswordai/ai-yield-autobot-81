Add two corrected FAQ items to `src/components/legendary/FaqTab.tsx` explaining `selfStake` and `teamPerf` with accurate contract behavior:

**1. selfStake** — state that it increases on deposit/compoundToPool2 and decreases on withdraw/earlyWithdraw (full principal deduction, not half), and that dropping below thresholds can cause level loss.

**2. teamPerf** — state that it's a single weighted sum (not big/small zone): gen+1 100%, gen+2 90%, gen+3 75%, gen+4 60%, gen+5 45%, gen+6~15 30% each, nothing beyond gen+15; same weights subtract on withdrawal.

Also update the `zh.json` locale `referralWhitepaper.invite.teamStaking` line if it still carries the outdated 3-level description.

No logic changes; refresh strategy stays untouched.