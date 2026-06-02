
## 现状诊断（已验证）

我用公共节点直接查了 `0x7500…4E7c`：

- 链上 `inviterOf` = `0xcbec…5160` → **该地址已经绑定过上级**
- 链上 USDT 余额 = **200.86 USDT**

也就是说，链上数据是对的。问题在前端：**所有读链调用都被静默吞掉了**，UI 全部回落到 `0` 和 `0x000…000`，于是表现成「未绑定」「USDT 0」。再点「绑定」时，预检查也读不到 inviter（被 try/catch 吃了），交易发出后被合约 revert，但部分钱包 `estimateGas` 阶段就吞掉了 reason，所以看上去「点了没反应」。

控制台里反复出现的 `[legendary] posIds []` 印证了这点——refetch 在跑，但所有按地址查询都返回了空（fallback）。

根因：用户设备访问当前 5 个 BSC 公共 RPC（binance.org / defibit.io / ninicoin.io）不稳定或被墙，`safe()` 把错误全咽了，UI 没有任何提示。

## 修复计划

只动前端读链/提示逻辑，不动合约、不动业务逻辑。

### 1. `src/lib/rpcClient.ts` — 扩充 + 加固公共节点池

- `BSC_READ_ENDPOINTS` 增加在受限网络下更稳的镜像：
  - `https://bsc.publicnode.com`
  - `https://binance.llamarpc.com`
  - `https://1rpc.io/bnb`
  - `https://bsc.drpc.org`
  - 保留现有 binance/defibit/ninicoin
- `FallbackReadProvider.send` 增加一条「热路径加速」：对 `eth_call` / `eth_chainId` / `eth_blockNumber`，用 `Promise.any` 同时打前 3 个节点，先到先得；失败再走原顺序回退。其它方法保持现状。
- 增加一个轻量事件：当**一整轮**都失败时，触发 `window.dispatchEvent(new CustomEvent("legendary:rpc-down"))`。

### 2. `src/hooks/useLegendary.ts` — 不再把"读失败"伪装成 0

- 给 `safe()` 增加一个可选 `onError` 回调，refetch 内部累计 phase-1 / phase-2 的失败次数。
- Phase 1（USDT 余额 / allowance / frozen）：如果三项里 ≥2 项失败，**保留 prev 值**而不是写 0，并 set 一个新的共享布尔 `sharedRpcDegraded = true`，通过 `notify()` 推给订阅者。
- Phase 2 同样：若 inviter / selfStake / 余额 三项都失败，置 `sharedRpcDegraded = true` 并保留 prev.inviter，不要回落到 ZERO（避免把已绑定用户显示成未绑定）。
- 通过 `useLegendaryDashboard()` 暴露 `rpcDegraded` 字段。

### 3. 新增 `src/components/legendary/RpcDegradedBanner.tsx`

- 当 `rpcDegraded === true` 时显示红/琥珀色横幅：
  - 文案：「⚠️ 当前网络无法稳定读取链上数据，显示的余额/上级可能不准确。请检查网络或切换 VPN 后点击刷新。」
  - 按钮「重新读取」→ 调 `_refetchLegendary()`。
- 在 `src/pages/Legendary.tsx`，放在已有 `<ChainSwitchBanner />` 下方。

### 4. `src/components/legendary/ReferralTab.tsx` — 绑定区收紧

- 当 `rpcDegraded` 时：把「绑定上级」按钮 disabled，提示「网络异常，无法校验是否已绑定，请稍后重试」，避免用户在不知情下发一笔注定 revert 的交易。
- 当 `data.inviter === ZERO` 且 `rpcDegraded === false` 才显示绑定表单（现在只判 ZERO，所以读失败时也会错误地展示表单）。

### 5. `src/hooks/useLegendaryActions.ts` — bind 错误识别更稳

- `REVERT_MAP` 增加：`"already binded"`, `"has inviter"`, `"inviter set"`（不同合约/钱包返回的别名），以及一条兜底：当 revert reason 为空字符串 且 `read.referral.inviterOf(account)` 重新读到非零，toast 改为「您已绑定过上线，请刷新页面」。
- bind 前的预检查若 `inviterOf` 抛错（即网络异常），直接 `toast.error("网络异常，无法校验绑定状态，请稍后重试")` 并 return，**不要发交易**。

### 6. 不动的地方

- 合约地址、ABI、所有写交易逻辑、`useWeb3.ts`、链切换横幅、奖励/仓位逻辑。

## 验证

- 用 DevTools 把 `bsc-dataseed.binance.org` 等加到 Block request URL，刷新 `/zh/legendary`：应看到红色横幅，余额栏保留上次数值（首次进入则显示 "—" 而非 0），绑定按钮 disabled。
- 解除拦截后点「重新读取」，inviter、selfStake、余额应正确出现，横幅消失。
- 用一个已绑定地址（如 `0x7500…4E7c`）连接，应看到正确的上级地址，不再出现绑定表单。

