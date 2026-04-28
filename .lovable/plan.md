## 目标

启航页（`HeroSection`）在手机端（≤640px）显得松散、字号过大、留白过多。本次只调整移动端密度，桌面端保持不变（用 Tailwind `sm:` / `md:` 断点保护）。

## 调整清单（仅 `src/components/HeroSection.tsx`）

### 1. 容器内边距
- `pt-24 pb-16` → `pt-16 pb-8 sm:pt-24 sm:pb-16`
- `px-4` → `px-3 sm:px-4`

### 2. Hero 头部（标题区）
- 顶部标签 chip：`px-4 py-1.5 mb-6` → `px-3 py-1 mb-4 sm:mb-6`
- 主标题 H1：`text-5xl md:text-7xl mb-6` → `text-3xl sm:text-5xl md:text-7xl mb-3 sm:mb-6`，`leading-tight`
- 副标题 p：`text-lg md:text-xl mb-3` → `text-sm sm:text-lg md:text-xl mb-2 sm:mb-3`
- 描述 p：`text-base mb-8` → `text-xs sm:text-base mb-5 sm:mb-8`
- 整块外边距：`mb-12` → `mb-6 sm:mb-12`

### 3. CTA 按钮
- 容器：`gap-3 mb-10` → `gap-2 mb-6 sm:gap-3 sm:mb-10`
- 按钮：`px-8 py-3 text-base` → `px-5 py-2.5 text-sm sm:px-8 sm:py-3 sm:text-base`
- 移动端 `size="lg"` 视觉过大：改成移动用 `size="default"`，通过 className 控制

### 4. Price Ticker / Featured Prices 间距
- `mb-10` → `mb-5 sm:mb-10`
- 与下一块的负边距 `-mt-2` 在移动端调整为 `-mt-1`

### 5. News + Feature Cards 区
- 外层 `mb-6` → `mb-4 sm:mb-6`
- 网格 `gap-6` → `gap-3 sm:gap-6`
- Feature Card 2x2 `gap-4` → `gap-2 sm:gap-4`
- 卡片内边距 `p-6 md:p-8` → `p-3 sm:p-6 md:p-8`
- 卡片图标容器 `w-10 h-10 mb-4` → `w-7 h-7 mb-2 sm:w-10 sm:h-10 sm:mb-4`
- 图标本身（在 `featureCards` 数组里）：`w-8 h-8 md:w-10 md:h-10` → `w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10`
- 卡片标题 `text-base md:text-lg` → `text-xs sm:text-base md:text-lg`

### 6. About us 视频块
- 外层 `mb-10` → `mb-5 sm:mb-10`
- 卡片 `p-5` → `p-3 sm:p-5`
- 标题 `text-xl mb-4` → `text-sm sm:text-xl mb-2 sm:mb-4`

### 7. Strategy Details Toggle 按钮
- 外层 `mb-8` → `mb-5 sm:mb-8`
- 按钮添加 `text-sm sm:text-base` 并缩小图标 margin

### 8. Strategy Details 展开区（`#strategy-details`）
- 外层 `mb-16` → `mb-8 sm:mb-16`
- 标题 `text-3xl mb-8` → `text-xl sm:text-3xl mb-4 sm:mb-8`
- Card `p-6` → `p-3 sm:p-6`
- 内部 `gap-8` → `gap-4 sm:gap-8`，`gap-6` → `gap-3 sm:gap-6`
- `mb-6` → `mb-3 sm:mb-6`，`space-y-3` → `space-y-2 sm:space-y-3`

## 不改动

- 桌面端样式（所有 `sm:`/`md:`/`lg:` 之上的尺寸保留原值）
- 文案、配色、玻璃拟态、网格背景
- HeroSection 之外的组件（`PriceTicker`、`FeaturedPrices`、`NewsAnnouncement` 内部）—— 如后续仍觉松散，再单独处理

## 验收

手机端（390px）从首屏到策略详情：标题不再占大半屏，按钮更细，卡片之间间距明显收紧，整体一屏可看到更多内容，视觉密度接近专业金融 App。
