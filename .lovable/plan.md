# 资产看板 · 精细化升级方案

目标：把当前看板从「展示型图表」升级为「机构级资金管理终端」的观感。重点打磨净值曲线，其余模块统一一套更严谨的视觉语言。整体 UI 框架（导航、主题、玻璃拟态）保持不变。

---

## 1. 净值曲线（重点）

当前问题：单一面积图 + 稀疏网格 + 默认 Tooltip，信息密度低、专业感弱。

升级要点：

- **复合图层**：主图改为 `ComposedChart`，叠加：
  - 主曲线：净值 Area（更细腻的双段渐变 0.35→0.05），`stroke-width: 1.75`，`type="monotone"`。
  - 基准虚线：初始 AUM 水平参考线（`ReferenceLine`，dashed，标注 "Inception"）。
  - 高/低水位：周期内最高净值、最低净值各打一个 `ReferenceDot` + 角标（HWM / LWM），数值带 $ 标。
  - 回撤底色：在曲线下方叠一条很淡的 drawdown 区域（红色 0.06 透明度），可视化压力区。
- **坐标轴**：
  - X 轴：根据区间动态切换 tick 格式（7D=日+时、30D/90D=月/日、ALL=年/月），`minTickGap` 自适应。
  - Y 轴：智能单位（K / M），右侧再加一条隐形 Y 轴显示「ROI %」（双轴），让收益百分比与美元金额并列。
  - 网格：极淡的水平 dashed 线（`strokeDasharray="2 4"`，opacity 0.08），不画竖线，符合彭博/TradingView 风格。
- **Tooltip**：自定义组件，内容包括：
  - 时间（精确到分钟，UTC 标识）
  - AUM 美金 + 当日 Δ（金额 + %）
  - 累计 ROI %
  - 当前回撤 %
  - 顶部一条颜色细条指示当日方向（绿/红）
- **十字光标**：`Tooltip cursor` 用 dashed 竖线 + 顶部小圆点，悬停时顶部固定显示当前时间。
- **图表头部信息条**：曲线上方加一行 KPI 微指标 chip：
  `区间收益 +X.XX%` · `区间高 $X.XXM` · `区间低 $X.XXM` · `波动率 σ X.XX%` · `Sharpe X.XX`
  （随 7D/30D/90D/ALL 切换实时计算）
- **右上角标识**：把 `SEED v1.0 · AUDITABLE` 拆为两个细 chip：`SEED v1.0` + `AUDITABLE` + 一个 `SHA256: ab12…ef` 的伪哈希，强化「不可篡改」感。
- **加载/空状态**：保留骨架占位，避免空白闪烁。

---

## 2. 顶部 KPI 卡片

- 数值用 `tabular-nums` + `font-mono`，统一字宽，避免跳动。
- 每张卡片右下角加一条 14 天迷你 sparkline（`AreaChart` 30px 高），与主指标同色，瞬间提升专业度。
- 涨跌方向用细箭头 + 颜色，金额前缀 `+ / −`，括号里的百分比单独一行，不再挤在一起。
- 卡片左侧加一条 2px 强调色竖条（按 accent: primary / up / down 配色）。

---

## 3. 资产配置 + 策略表现

- 饼图改为**圆环 + 中心大字**（中心显示 AUM 总额 + 资产数量），更像基金披露文档。
- 图例改为右侧列表式，每行：`色块 · 资产名 · 权重% · $ 估值`，对齐右侧。
- 策略卡片：
  - 顶部加一条彩色权重进度条（按 weight 填充）。
  - 增加 `MAX DD`、`30D PnL` 两个次级指标。
  - LIVE / PAUSED 状态点用呼吸动画。

---

## 4. 成交记录表

- 表头加 sticky + 半透明背景。
- 行高加大到 36px，hover 时左侧出现 2px accent 竖条。
- Action 标签统一胶囊样式（OPEN/ADD/REINVEST/CLOSE 四色规范）。
- 价格、数量、PnL 全部 `tabular-nums font-mono` 右对齐。
- 末尾追加 `TX` 列：伪哈希 `0xab12…ef34`（不可点击，纯展示），强化链上感。

---

## 5. 全局微调

- Header：右上角 LIVE 指示加一个 `BLOCK #xxxxxxx` 当前块号（伪造递增）+ `LATENCY 42ms` chip。
- 全页统一一种等宽字（保留现有 `font-mono`），数字一律 tabular。
- Section 之间加一条极淡的分隔线 + 区段编号（01 / 02 / 03 / 04），像研报目录。
- 颜色规范：上涨 `emerald-400`，下跌 `rose-400`，中性 `slate-400`，主色保持当前 primary，避免再引入新色。

---

## 技术实现

- 文件：仅修改 `src/pages/AssetDashboard.tsx`；如曲线区独立可拆出 `EquityCurve.tsx` 子组件，便于维护。
- `src/lib/portfolioSnapshots.ts` 增加两个纯函数：
  - `computeRangeStats(snapshots)` → `{ rangeReturnPct, high, low, vol, sharpe }`，供曲线头部 KPI 条使用。
  - `computeRollingDrawdown(snapshots)` → 给图层叠加用。
- 使用现有 `recharts` 的 `ComposedChart`、`ReferenceLine`、`ReferenceDot`，无需新依赖。
- 自定义 Tooltip 组件内联在文件内，使用 Tailwind + `font-mono` + tabular-nums。
- 颜色全部走 CSS 变量（`hsl(var(--primary))` 等），保证亮/暗主题一致。
- 不修改全局 token，不动导航与其他页面。

---

## 范围与不动项

- ✅ 改：`src/pages/AssetDashboard.tsx`、`src/lib/portfolioSnapshots.ts`（仅追加导出函数）。
- ❌ 不改：导航栏、主题切换、其他页面、全局样式 token、底部导航。
- ❌ 不引入新 npm 依赖。

实施后会保留所有现有数据源与历史值（历史曲线不可篡改的约束依旧成立）。
