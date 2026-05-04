# 把站内信改为右下角浮窗式客服按钮

## 改动

**`src/components/MessageCenter.tsx`**
- 添加 `floating?: boolean` prop（默认 `true`）
- `floating=true` 时渲染为右下角浮窗：
  - 位置：`fixed bottom-6 right-6`（移动端 `bottom-24` 避开底部 Tab 栏）
  - 圆形渐变按钮（primary→accent），ring 圈白边
  - 头像图标 `MessageSquareMore`
  - 周围加 `animate-ping` 呼吸光环吸引注意
  - 未读红点徽章贴在右上角（高对比 ring 边）
  - hover 放大 1.1 + 阴影加深
- `floating=false` 时保留原小图标按钮，供 Navbar 使用（如需）
- Sheet 标题改为"消息中心 / 在线客服"

**`src/components/Navbar.tsx`**
- 移除桌面与移动端 Navbar 中的 `<MessageCenter />`（避免与浮窗重复）

**`src/components/AppLayout.tsx`**
- 全局挂载 `<MessageCenter />`（默认浮窗模式），保证所有页面右下角都有

## 位置避让

- 右下角原本有 FAQ 100问浮按钮 — 已在上一步改为放进"更多"抽屉，不再占用右下角
- 移动端底部有 Tab 栏（h-16），所以移动端浮窗用 `bottom-24` 留够安全距离
- 桌面端用 `bottom-6 right-6`

## 视觉

类似在线客服 widget 风格：圆形渐变 + 呼吸光环 + 红色未读徽章，醒目但不抢戏。点击展开右侧抽屉，内含三个 Tab：公告、站内信、客服对话（保持现有功能不变）。
