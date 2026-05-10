## 更新聊天机器人文案

### 改动范围
仅修改 `supabase/functions/chat-bot-tick/index.ts` 中的 `TEMPLATES` 常量与 `CATEGORY_WEIGHTS`，其他逻辑（地址池、节奏、占位符填充）保持不变。

### 文案替换
- **fomo**：替换为新提供的 15 条
- **showoff**：替换为新提供的 12 条（保留 `{amount}` / `{yield}` / `{days}` 占位符）
- **discuss**：替换为新提供的 12 条
- **question**：保留原有 10 条提问互动文案（用户本次未提供新版本，删掉会少一类对话感；保留更自然）

### 权重调整（晒单多一点）
当前：fomo 35 / showoff 30 / discuss 20 / question 15
调整为：**showoff 45 / fomo 25 / discuss 20 / question 10**
晒单成为占比最高的一类，符合"晒单的多一点"。

### 同步更新
- `src/components/admin/ChatBotAdmin.tsx` 底部说明里的权重数字（35/30/20/15 → 25/45/20/10），保持后台描述与实际一致。
- `.lovable/plan.md` 中的权重段落同步更新（可选，保持文档准确）。

### 不改动
- 节奏判断、地址池、占位符随机范围、cron 配置、RLS、表结构均不动。
- `question` 类文案保留原版。
