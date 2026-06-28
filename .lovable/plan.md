# 修复"领取收益"点击无反应

## 现象
用户在 `/zh/stake` → 我的仓位 → 弹窗里点"领取收益"按钮后，没有任何反馈，钱包也不弹签名窗口。

## 根因分析
`PositionsList.tsx` 的 `handleDirectClaim` 流程里有两个隐患：

1. **错误被吞掉**：`lock.claim(posId)` 在签名前会先做 gas 估算。如果合约 revert（最常见就是 `pendingYield == 0` 或锁定期内某些状态），ethers 直接抛 CALL_EXCEPTION，钱包根本不会弹窗。catch 里只 `toast.error(e?.shortMessage || e?.message)`，这种错误的 message 是一长串 ABI 解码字符串，sonner 截断后用户基本看不到，视觉上就是"没反应"。

2. **没有事前校验**：当 `pending == 0` 时按钮本不应该可点；当前 UI 只按 `canInteract` 禁用，没把 pending 金额纳入判断。点了就一定 revert。

3. **缺日志埋点**：`handleClaimClick` 有 console.log，但 `handleDirectClaim` 进入后没有日志，无法在控制台快速确认是按钮没触发 onClick，还是 tx 抛错。

## 修改方案

**文件：`src/components/PositionsList.tsx`**

1. 在每个仓位卡片渲染时，`pending <= 0` 的情况下把"领取收益"按钮 `disabled`，并在 hover/title 上提示"暂无可领取收益"。

2. 改造 `handleDirectClaim`：
   - 进入时 `console.log` 记录 posId / pending；
   - 二次校验 `selectedPosition` 不为空、`pending > 0`，否则 `toast.warning("当前无可领取收益")` 并关闭弹窗；
   - 先 `estimateGas` 单独 try：如果失败，把 revert reason（`e.reason || e.info?.error?.message`）取出来用更友好的中文提示，例如"合约拒绝：可能尚无可领取收益或仓位状态异常"；
   - 真正 `claim` 失败时，toast 用 `duration: 6000` + 显式 `description` 让用户看清。

3. 给"领取收益"按钮加 `type="button"` 防御性写法，避免任何隐式 form 行为吞掉点击。

**文件：`src/components/ClaimYieldDialog.tsx`**

- 给"领取收益"那个 `<Button variant="outline">` 也明确 `type="button"`；
- 该按钮 `disabled` 时加 `opacity-60 cursor-not-allowed` 视觉提示；
- 在按钮上加 `aria-label="领取收益"` 方便后续调试。

不动 `useStakingActions.ts` / 合约逻辑 / 其他页面。

## 验证

- 普通钱包、pending > 0：点击应该正常弹出钱包签名，成功后 toast 成功并刷新列表。
- pending == 0：按钮直接灰掉，点不动；通过 dialog 路径也会给出"当前无可领取收益"提示。
- revert 场景：toast 显示可读中文原因而不是 ABI 字符串。
