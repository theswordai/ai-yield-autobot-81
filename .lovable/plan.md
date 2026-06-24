## 目标
命中黑名单的钱包连接后，整站显示完全空白页。黑名单由后台数据库管理，可随时增删。初始拉黑地址：`0x82e9E55E42Bcf3bCA2341779DDE08BAcfc72270f`。

## 实现方案

### 1. 数据库迁移
新建 `public.blocked_wallets` 表：
- `wallet_address text primary key`（存储小写）
- `note text`
- `created_at timestamptz default now()`

GRANT：
- `anon`, `authenticated`：`SELECT`（前端公开读，仅为判断是否拦截）
- `service_role`：`ALL`

启用 RLS：
- 公开 SELECT 策略
- 不开放 INSERT/UPDATE/DELETE 给 anon/authenticated（写入走 service_role / 管理员函数）

同迁移内插入初始数据：`0x82e9e55e42bcf3bca2341779dde08bacfc72270f`。

### 2. 前端拦截
**`src/hooks/useBlockedWallet.ts`**
- 监听 `account` 变化，查询 `blocked_wallets` where `wallet_address = lower(account)`
- 返回 `{ blocked, loading }`

**`src/components/WalletAccessGate.tsx`**
- 取 `useWeb3().account` → `useBlockedWallet(account)`
- 命中：渲染 `<div className="fixed inset-0 z-[9999] bg-background" />`（纯空白，无任何子节点）
- 未命中 / 加载中：返回 `null`

**`src/components/AppLayout.tsx`**
- 在 `SidebarProvider` 顶层挂载 `<WalletAccessGate />`，覆盖 sidebar、路由、弹窗、聊天室等所有 UI

### 3. 后台管理（同步建好，方便后续增删）
**`src/components/admin/BlockedWalletsAdmin.tsx`**
- 列表：地址、备注、添加时间、删除按钮
- 输入新地址 + 备注 → 「添加」（自动小写、校验 `0x` + 40 hex）
- 写操作通过新增 edge function `manage-blocked-wallets`（service_role），参考 `supabase/functions/admin-action` 的管理员校验模式（基于 `admin_wallets` 表 / `is_admin_wallet` 函数）

**`src/pages/Admin.tsx`**
- 新增 Tab「钱包拉黑」，挂载 `BlockedWalletsAdmin`

## 行为
- 未连钱包：正常访问
- 命中钱包连接后：整屏空白，无任何可交互元素
- 切换/断开钱包：遮罩消失
- 后台改动：受影响钱包刷新或重连即生效

## 安全提示
纯前端拦截可被技术用户绕过（改本地 JS、直接调合约）。合规级封禁需在 RPC / 业务接口层一并拦截。
