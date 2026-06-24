## 问题
拉黑钱包加载页面时会闪现半秒网站内容再黑屏，因为 `useBlockedWallet` 通过异步请求 Supabase 查询黑名单，期间 `blocked=false`,所以页面短暂可见。

## 解决方案
在 `useBlockedWallet` 和 `WalletAccessGate` 增加本地缓存 + 同步初始化,做到"已知拉黑的钱包"在 React 首次渲染时就立刻黑屏,无任何闪烁。

### 修改 `src/hooks/useBlockedWallet.ts`
1. 用 `localStorage` 缓存已确认拉黑的钱包地址列表(key: `blocked_wallets_cache`)。
2. `useState` 初始化函数同步读取缓存:若当前 `account` 在缓存中,`blocked` 初始值直接为 `true`(首帧就是 true,无闪烁)。
3. 异步请求 Supabase 后:
   - 若返回拉黑 → 写入缓存,`setBlocked(true)`。
   - 若返回未拉黑 → 从缓存移除该地址,`setBlocked(false)`(避免误锁正常用户)。
4. 暴露 `loading` 状态(已存在)。

### 修改 `src/components/WalletAccessGate.tsx`
渲染条件改为:`blocked || (loading && cachedBlocked)`,即:
- 已知拉黑(缓存命中) → 立刻黑屏,首帧就遮住。
- 正常钱包 → 不闪黑屏(loading 期间不遮罩,因为缓存未命中)。

### 效果
- 已拉黑钱包第二次进入网站:首帧即黑屏,完全无闪烁。
- 首次拉黑后当前会话:Supabase 返回后才黑屏(仍有短暂可见,这是首次不可避免)。
- 正常钱包:零影响,不会出现黑屏闪烁。

### 不修改
- 后端逻辑、RLS 策略、Admin 后台。
- 仅前端展示层缓存,不影响安全性(真正的访问控制依然在 Supabase RLS / Edge Function)。