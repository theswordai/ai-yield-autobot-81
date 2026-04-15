

## BNB→USDT 兑换失败修复

### 问题

用户看到 "Swap Exact ETH For Tokens" 错误信息。这是 PancakeSwap Router 合约的 revert reason。

最可能的原因是 **`minOut`（最小输出量）计算精度问题**。第 236 行：

```js
const minOut = parseUnits(toAmount, toTokenInfo.decimals) * BigInt(...) / BigInt(10000);
```

`toAmount` 是从 `formatUnits` 格式化后的字符串，可能包含超长小数位（如 `"0.001632456789012345678"`），`parseUnits` 会因小数位超过 `decimals` 而报错或产生不正确的值，导致 `minOut` 过大，交易 revert。

### 修复方案

**修改 `src/components/DexSwap.tsx`：**

1. **保存原始 BigInt 输出值**：在 `getQuote` 中，将 `getAmountsOut` 返回的原始 `BigInt` 值存到新 state `rawToAmountWei`
2. **用原始值计算 minOut**：`handleSwap` 中直接用 `rawToAmountWei * (10000 - slippageBps) / 10000`，不再用 `parseUnits(toAmount)`
3. **BNB MAX 预留 gas**：当 fromToken 是 BNB 时，MAX 按钮扣除 0.005 BNB

### 技术细节

- 新增 state：`const [rawToAmountWei, setRawToAmountWei] = useState<bigint>(BigInt(0))`
- `getQuote` 中：`setRawToAmountWei(amounts[amounts.length - 1])` 
- `handleSwap` 第 236 行替换为：`const minOut = rawToAmountWei * BigInt(Math.floor((100 - slippage) * 100)) / BigInt(10000)`
- MAX 按钮逻辑：BNB 时 `Math.max(0, parseFloat(fromBalance) - 0.005).toString()`

