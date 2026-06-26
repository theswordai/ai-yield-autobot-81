### 目标
在 USDV-DEX 兑换卡片上增加一行固定比例提示文本，展示当前 1 USDV 可兑换的 USDT 数量。

### 具体改动
- 修改 `src/components/DexSwap.tsx`
- 在"获得"卡片与兑换按钮之间（或箭头下方）插入一行小字：`1 USDV ≈ 0.15 USDT`
- 样式使用 `text-xs text-muted-foreground`，居中显示，保持与现有玻璃拟态风格一致

### 技术细节
- 可直接使用合约返回的 `sellPriceUsdtE18()` 动态格式化输出（`formatUnits(priceE18, 18)`），这样如果合约价格调整，前端会自动同步，无需手动改硬编码
- 若 `priceE18` 尚未加载，显示占位符 `—`