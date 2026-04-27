## 双主题切换方案（保留当前 UI，新增亮色版本）

### 核心思路
项目已使用 Tailwind 语义 token + `darkMode: ["class"]`，这是切换主题最干净的方式：
- 现有所有组件用的都是 `bg-background / text-foreground / border-border / text-primary / bg-card …` 等 token
- 只要给两套 token 值，组件本身**一行不动**就能跟随主题切换

### 改动文件（共 4 个）

**1. `src/index.css` — 重新组织 token**
- 把当前所有 token 移到 `.dark { … }` 块内（**完整保留** Jupiter 深色配色）
- 在 `:root { … }` 写一套新的亮色 token：
  - `--background: 210 40% 98%`（近白带极淡冷调）
  - `--card: 0 0% 100%`（纯白卡片）
  - `--foreground: 215 35% 12%`（深墨色文字）
  - `--primary: 43 96% 48%`（金色稍加深，确保白底上对比度）
  - `--accent: 142 65% 38%`（绿色加深）
  - `--border: 215 24% 88%`、`--muted: 215 25% 95%`、`--muted-foreground: 215 16% 42%`
  - `--shadow-card: 0 4px 14px -4px hsl(215 35% 12% / 0.08)`（浅色专用柔和阴影）
  - 同步更新 `--gradient-primary / --gradient-secondary / --gradient-dark / --shimmer-gradient / --sidebar-*`
- 已存在的赛博朋克霓虹效果（cyberpunk-card / neon-text / electric-button 等）保持不动——它们在亮色下仍然能用，只是视觉更克制

**2. `src/hooks/useTheme.ts` — 新建**
- 极简自定义 Hook：读取/写入 `localStorage('theme')`，在 `<html>` 上加减 `dark` 类
- 默认值：`dark`（保证老用户/首次访问的体验与现在 100% 一致）
- 暴露 `{ theme, toggleTheme, setTheme }`

**3. `src/main.tsx` — 启动期主题注入**
- 在 React 渲染前同步执行：
  ```ts
  const saved = localStorage.getItem('theme') ?? 'dark';
  if (saved === 'dark') document.documentElement.classList.add('dark');
  ```
- 避免首屏闪白

**4. `src/components/Navbar.tsx` — 加入切换按钮**
- 桌面端：在 `WalletConnector` 左侧加一个 ☀️/🌙 图标按钮（`Sun` / `Moon` from lucide-react）
- 移动端：在汉堡菜单展开面板内加一个同样的按钮
- 使用 `Button` 组件 `variant="ghost" size="icon"`，与现有 UI 风格一致

### 不会改的
- 所有页面、所有组件代码（`AssetDashboard`、`HeroSection`、`StakingInterface` 等）一律不动
- Tailwind 配置不动（`darkMode: ["class"]` 已就绪）
- 深色模式下的视觉与当前**完全一致**——token 值原样搬运到 `.dark`

### 切换效果预期
- 默认进入 = 当前深色（无任何感知变化）
- 点击太阳图标 → 整站平滑切到亮色（白底 / 深字 / 金色按钮加深 / 绿色 accent 加深 / 阴影变柔），配色保持 USD.ONLINE 品牌一致
- 选择写入 localStorage，刷新后保持

### 可选增强（如需告知）
- A. 是否需要切换时加 200ms 颜色过渡动画？（默认会加 `transition-colors` 到 body）
- B. 是否要在亮色模式下也保留 Hero/Audit 等页面的强烈渐变？（默认保留，仅自动调整对比度）
