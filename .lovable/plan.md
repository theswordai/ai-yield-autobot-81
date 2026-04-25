## 目标

把审计报告改成在网站内嵌显示（带翻页/缩放/下载/全屏工具栏），而不是让浏览器跳转去打开原始 PDF 文件。

## 方案

复用项目里已有的 `PDFViewer` 组件（白皮书页面也是这么做的），新增一个 `/zh/audit` 和 `/en/audit` 路由，启航页底部那个按钮点开后进入这个站内页面。

## 改动清单

1. **新建页面 `src/pages/Audit.tsx`**
   - 仿照 `src/pages/Whitepaper.tsx` 的结构
   - 标题："审计报告 / Audit Report"
   - 副标题简短说明（LockStaking V3 智能合约安全审计）
   - 用 `<PDFViewer url="/LockStakingV3_Audit_Report.pdf" title="LockStaking V3 审计报告" />` 嵌入
   - 包裹在 `PageWrapper` + `Navbar` 中，保持站内一致的玻璃拟态风格

2. **注册路由 `src/App.tsx`**
   - 添加 `/zh/audit` 和 `/en/audit` 两条路由，指向新的 `Audit` 页面
   - 添加 `/audit` → `/zh/audit` 的兜底重定向

3. **更新启航页底部入口 `src/components/HeroSection.tsx`**
   - 把"审计报告"那个图标的 `<a href="/LockStakingV3_Audit_Report.pdf" target="_blank">` 改成 React Router 的 `<Link to="/zh/audit">`（使用当前语言路径），不再新开窗口
   - 保留同样的 FileText 图标和样式

## 用户体验

点击启航页底部的"审计报告"图标 → 跳转到 `/zh/audit` 站内页面 → 在站内查看 PDF（可翻页、缩放、旋转、下载、全屏），整体导航和品牌风格一致。
