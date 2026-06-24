## 目标
设备一旦用过被拉黑的钱包地址，之后**刷新或重新访问都直接显示 Chrome 断网页面**，React 应用完全不挂载，与钱包当前是否连接、是否切到其他地址、甚至是否注入钱包都无关。只有清浏览器数据才能恢复。

## 核心机制
利用已有的 `localStorage.blocked_wallets_cache`（用户首次连接被拉黑时由 `useBlockedWallet` / `WalletConnector` 写入）。在 React 启动前，同步检查：
- 缓存非空 → 永久断网页
- 缓存为空 → 正常加载，由现有运行时 Gate 兜底首次拉黑场景

## 实施

### 1. `index.html` — 首屏同步拦截
在 `<head>` 末尾加内联脚本（不依赖任何打包资源）：

```html
<script>
  try {
    var raw = localStorage.getItem('blocked_wallets_cache');
    var arr = raw ? JSON.parse(raw) : [];
    if (Array.isArray(arr) && arr.length > 0) {
      document.documentElement.setAttribute('data-blocked','1');
    }
  } catch(e){}
</script>
<style>
  html[data-blocked="1"] #root { display:none !important; }
  html[data-blocked="1"] #offline-gate { display:flex !important; }
  #offline-gate { display:none; }
</style>
```

在 `<body>` 里、`<div id="root">` 旁边新增静态 HTML `<div id="offline-gate">`，内容是 Chrome 风格断网页（与 `WalletAccessGate.tsx` 视觉一致：白底、灰色 dino SVG、"无法访问此网站"、操作建议、`DNS_PROBE_FINISHED_NXDOMAIN`、"重新加载"按钮 `onclick="location.reload()"`）。

### 2. `src/main.tsx` — 兜底
在 `createRoot(...).render(<App/>)` 之前再次同步检查 `blocked_wallets_cache`，命中则 `return`，根本不渲染 React。这样即便有人禁用内联 `<style>`，应用层也不会启动、不会发任何业务请求。

### 3. 现有运行时 Gate 保留
`WalletAccessGate.tsx` 仍处理**首次拉黑**（缓存还没写入）的场景：用户连接钱包 → `useBlockedWallet` 查 Supabase → 命中后写缓存并显示黑屏。下次刷新就进入 step 1 的永久断网路径。

### 4. 不需要改动
- `useBlockedWallet.ts`、`WalletConnector.tsx`：缓存写入逻辑已就绪。
- Supabase RLS / Edge Function：真正的访问控制不变。

## 效果矩阵

| 场景 | 行为 |
|---|---|
| 全新设备，钱包未被拉黑 | 正常 |
| 全新设备，首次连接被拉黑的钱包 | 运行时 Gate 黑屏，缓存写入 |
| 之后任意刷新（含切换钱包、断开钱包、不装钱包） | index.html 同步命中 → 永久断网页 |
| 清浏览器数据 | 缓存清空，恢复正常（这是用户主动操作） |

## 风险提示
这是前端体验层封锁，技术用户清 localStorage 即可绕过；链上/数据库级的真实拦截依然依赖 Supabase RLS 与合约层。
