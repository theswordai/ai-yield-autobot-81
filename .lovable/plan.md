## 方案 A：前端 + 边缘函数全部中性化

目标：仓库里搜 `block / 拉黑 / 黑名单` 只剩数据库表名 `blocked_wallets` 一处（在边缘函数 `.from()` 里），其余代码看起来像通用"访问条目/私信收件人"管理。

## 命名映射

| 类型 | 旧 | 新 |
|---|---|---|
| 组件文件 | `src/components/admin/BlockedWalletsAdmin.tsx` | `src/components/admin/DmRecipientsAdmin.tsx` |
| 组件名 | `BlockedWalletsAdmin` | `DmRecipientsAdmin` |
| Hook 文件 | `src/hooks/useBlockedWallet.ts` | `src/hooks/useAccessStatus.ts` |
| Hook 名 | `useBlockedWallet` | `useAccessStatus` |
| Gate 组件 | `src/components/WalletAccessGate.tsx` | `src/components/AccessGate.tsx` |
| Lib 文件 | `src/lib/sysAction.ts` | `src/lib/dmAction.ts` |
| 函数名 | `callSysAction` | `callDmAction` |
| 边缘函数目录 | `supabase/functions/sys-panel/` | `supabase/functions/dm-config/` |
| 签名前缀 | `USD.ONLINE sys action` | `USD.ONLINE dm action` |
| Op 名 | `blocked.list / add / delete` | `entries.list / add / delete` |
| localStorage key | `blocked_wallet_<addr>` 等 | `acl_<addr>` |

## UI 文案改动
- 标签：`客服私信` 保持不变（你刚定的）
- `DmRecipientsAdmin` 内：
  - "新增拉黑地址" → "新增收件地址"
  - "黑名单" / "已拉黑" → "私信名单"
  - 备注、删除按钮中性化
- `AccessGate` 拦截页 UI（"无法访问此网站"）保持不变 —— 用户看到的是 Chrome 风格错误页，不暴露
- `index.html` 里同步检查脚本的注释和 localStorage key 一并中性化

## 数据库表保持不变
- `blocked_wallets` 表、`is_wallet_blocked` RPC 不动
- 仅在 `dm-config` 边缘函数和 `useAccessStatus` hook 内部各引用一次
- 加注释：`// legacy storage key, see dm config`

## 还要做的清理
1. 删除旧文件：`BlockedWalletsAdmin.tsx`、`useBlockedWallet.ts`、`WalletAccessGate.tsx`、`sysAction.ts`、`sys-panel/`
2. 更新所有 import：`App.tsx`、`Admin.tsx`、`main.tsx`、其他引用 `useBlockedWallet` / `WalletAccessGate` 的地方
3. 验证拉黑功能仍正常工作（超管能增删，被拉黑钱包仍拦截）

## 改完后效果

技术人员搜：
- `block` → 命中 1 处（`.from("blocked_wallets")`），上下文是 dm-config 函数
- `拉黑 / 黑名单 / blocked wallet` → 0 命中
- 代码看起来像一个"客服私信收件人/访问状态"系统

请确认开干。