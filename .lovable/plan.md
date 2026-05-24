## 方案：改用 Edge Function 代理 Etherscan API

由于 Lovable 的 Build Secrets 需要你手动在 Workspace Settings 里配置（工具无法代填），更可靠的做法是**把 key 存为后端 runtime secret**，前端通过 edge function 调用。这样：
- key 不暴露在前端 bundle 里（更安全）
- 我可以用工具直接配置，无需你找 Workspace Settings

### 实施步骤

1. **添加 runtime secret** `ETHERSCAN_API_KEY`（值：`7BD2YXKFEJ78Z1SXJX317Y3HEV9VRYV8ZW`）
   - 通过 `add_secret` 工具弹窗让你确认提交（值会直接预填，你点确认即可）

2. **新建 edge function** `supabase/functions/etherscan-claims/index.ts`
   - 接收 `{ user, contract, fromBlock?, toBlock? }`
   - 服务端读取 `ETHERSCAN_API_KEY`，调用 `https://api.etherscan.io/v2/api?chainid=56&module=logs&action=getLogs&...`
   - 解析 `RewardsClaimed` 事件日志，返回 `[{ amount, timestamp, txHash, blockNumber }]`
   - CORS 已配置

3. **改 `src/lib/legendaryClaimHistory.ts`**
   - 移除 `VITE_ETHERSCAN_API_KEY` 检查
   - 改为 `supabase.functions.invoke('etherscan-claims', { body: {...} })`
   - 保留 localStorage 缓存逻辑

4. **删除提示语**"未配置 API Key..."

### 验收

- 打开「传奇锁仓 → 奖励」点「加载领取记录」秒出结果
- 二次打开走缓存
- key 不出现在前端代码 / network 请求 query 中

---

确认后我切到 build 模式执行。
