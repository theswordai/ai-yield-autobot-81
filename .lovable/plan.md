

## 修复 DEX 价格影响计算

### 问题
价格影响用 `|1 - rate| * 100` 计算，把汇率差异当成了价格影响。USDT→BNB 汇率 ~0.0016，所以显示 99.84%。

### 修复方案

**修改 `src/components/DexSwap.tsx` 的 `getQuote` 函数：**

1. 用 1 单位小额调用 `getAmountsOut` 获取基准汇率（baseRate）
2. 用实际金额调用 `getAmountsOut` 获取实际汇率（actualRate）  
3. 价格影响 = `(baseRate - actualRate) / baseRate * 100%`

这样无论代币价格差异多大，价格影响只反映交易量对池子的冲击，小额交易显示接近 0%。

### 涉及文件
- `src/components/DexSwap.tsx` — 修改 `getQuote` 中两处价格影响计算逻辑（第 136 行和第 151 行区域）

