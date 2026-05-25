## 目标

在 `增值资本 → 邀请团队` 标签页底部新增一个「我的网络树」模块，按用户点击查询时才递归读取该地址下的全部下级（深度到底），并显示每个下级地址的 selfStake 自投本金。默认折叠/不显示数据，绝不自动刷新。

## UI 设计

在 `src/components/legendary/ReferralTab.tsx`「我的直推」卡片下新增一张玻璃拟态卡片：

- 标题：`我的网络树`
- 副标题/提示：`显示当前钱包地址下的全部下级（递归到底），仅在点击查询时加载，不自动刷新`
- 主操作：`查询我的网络树` 按钮（金色渐变，与现有按钮风格一致）
- 状态：
  - 未查询过 → 仅显示按钮 + 提示
  - 加载中 → 按钮 disabled，显示已加载节点数 `已加载 N 个地址…`
  - 完成 → 显示树 + 顶部统计行：`总人数 X · 最大深度 Y · 团队自投合计 Z USDT` + `重新查询` 按钮
- 树渲染：可折叠树形结构（缩进 + 左侧竖线），每行：
  ```
  L{level}  0xabcd...1234   自投 1,234 USDT   直推 N
  ```
  - 每个节点默认展开，点击可折叠子树（复用 `lucide-react` 的 `ChevronRight/Down`，无需新增依赖）
  - 单元格点击复制地址（toast 提示）
- 安全上限：最多 1000 个节点 / 最大深度 10，达上限时显示提示 `已达节点上限，部分深层下级未展示`，防止极端情况下浏览器卡死

## 数据获取逻辑

新增一个内部函数 `loadNetworkTree(root: string)`，BFS 遍历：

1. 初始队列：`[{ addr: root, level: 0 }]`
2. 每轮取出一批地址，用 `Promise.all` 并发调用：
   - `read.referral.getDirects(addr)` → 子地址数组
   - `read.referral.selfStake(addr)` → bigint
3. 为控制 RPC 压力，每批最多并发 10 个地址；批与批之间不加 sleep
4. 达到节点上限或队列空时结束
5. 返回 `Map<addr, { selfStake, children: string[], level }>` + 根地址

存放在 `useState`，**不挂任何 useEffect 自动刷新**。Tab 切换、`data` 变更都不重置已加载结果。

## 类型 / 抽象

```ts
type TreeNode = {
  addr: string;
  level: number;
  selfStake: bigint;
  children: string[]; // 直推地址
};
type NetworkTree = {
  root: string;
  nodes: Map<string, TreeNode>;
  totalCount: number;
  maxDepth: number;
  totalSelfStake: bigint;
  truncated: boolean;
};
```

渲染用一个递归小组件 `<TreeRow node addr depth />`，内部用本地 state 控制展开/折叠。

## 错误处理

遵守项目「Silent fallbacks」约定：单个地址 RPC 报错时该节点 selfStake 记为 0n、children 记为空数组，整体继续进行；整体抛错则 toast `查询失败，请稍后重试` 并恢复按钮。

## 涉及文件

- 修改：`src/components/legendary/ReferralTab.tsx`（新增卡片 + 加载逻辑 + 树渲染子组件，全部写在同文件内，体量可控）

不改动合约 / ABI / hooks，复用现有 `useLegendaryContracts().read.referral` 的 `getDirects` 与 `selfStake`。

## 验证

- TypeScript 编译通过
- 手动点击按钮 → 显示加载状态 → 出现树
- 不点按钮时切回该 Tab，不发生任何 RPC 请求
- 折叠/展开、复制地址、节点上限提示均正常
