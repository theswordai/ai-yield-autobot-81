## 调整聊天机器人发言频率

将 `chat_bot_config` 表中的发言间隔改为约 4 小时一条：

- `min_interval_minutes`: 20 → **210**（3.5 小时）
- `max_interval_minutes`: 40 → **270**（4.5 小时）

平均约 4 小时一条机器人消息。无需改代码，只更新一条数据库记录。