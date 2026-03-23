

## 计划：按照你的设计稿重新设计启航页面

### 概述
根据你提供的 HTML 设计稿，重构 `HeroSection.tsx` 的布局和视觉风格，使其匹配设计中的 glass-card（毛玻璃卡片）风格、mesh 渐变背景、以及整体结构。

### 主要改动

#### 1. 添加 mesh 渐变背景 (`src/index.css`)
- 添加 `.mesh-bg` 样式：三色径向渐变（金色、绿色、紫色）叠加在深色背景上
- 添加 `.glass-card` 样式：`rgba(24,32,41,0.6)` 背景 + `backdrop-filter: blur(12px)` + 微弱白色边框

#### 2. 重构 `HeroSection.tsx` 布局
按照设计稿从上到下排列：

**a) 标题区域**
- "Moral Alpha 3.0" 大标题 + "The Sovereign Ledger Protocol" 副标题
- 保留已有的 i18n 文案映射

**b) 行情滚动条**
- 保留现有 `<PriceTicker />`

**c) USDV Token Value 卡片**
- glass-card 样式，左侧显示价格 `$0.0562`、涨跌幅
- 右侧显示 24H VOLUME 和 MARKET CAP
- 数据从现有 `FeaturedPrices` / `MiniKChart` 组件迁移或复用

**d) 两个 CTA 按钮**
- "善举注入" (Charity Injection) → 导航到 `/{lang}/invest`
- "策略详情" (Explore Strategy Details) → 展开策略折叠面板
- glass-card 样式，带右箭头图标

**e) News & Alerts 区域**
- 保留现有 `<NewsAnnouncement />`，调整为设计稿样式（glass-card + "VIEW ALL" 链接 + 事件标签）

**f) Ecosystem Core 四宫格**
- 4 个 glass-card 图标卡片：跨链引擎、AI 轮动、去中心化质押、链上透明协议
- 使用 Material-style 图标（bolt、psychology、vaping_rooms、verified_user 对应 Zap、Bot、TrendingUp、Shield）

**g) Partners 区域**
- 保留现有合作伙伴网格，套用 glass-card 样式

**h) Team 区域**
- 保留现有团队折叠面板，文案改为 "The Sovereignty Team"

**i) 底部社交区域**
- 保留现有社区/客服/X 链接

#### 3. 策略详情面板保持不变
- 点击"策略详情"展开的大段策略内容不改动，只是外层套 glass-card 样式

### 技术细节

**修改文件：**
- `src/index.css` — 添加 `.mesh-bg` 和 `.glass-card` 工具类
- `src/components/HeroSection.tsx` — 重构布局结构，使用 glass-card 样式，调整排列顺序匹配设计稿
- 可能微调 `src/components/FeaturedPrices.tsx` — 适配新的 USDV 价格卡片样式

**不改动的文件：**
- `PriceTicker.tsx`、`NewsAnnouncement.tsx` — 功能不变，只在 HeroSection 中调整包裹样式
- i18n 文案文件 — 如需新增 key 会同步添加

