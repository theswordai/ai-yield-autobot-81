# 站内信与客服系统方案

基于钱包地址识别用户，使用 Lovable Cloud 存储数据，实现三合一：**全站公告弹窗** + **定向站内信** + **双向客服对话**，并提供项目内嵌的 `/admin` 管理后台。

---

## 一、数据库设计（Lovable Cloud）

### 1. `announcements`（全站公告）
- `id`, `title`, `content`, `image_url`(可选)
- `is_active`(bool), `priority`(int)
- `start_at`, `end_at`(可选时段)
- `created_at`

### 2. `announcement_reads`（用户已读记录）
- `id`, `wallet_address`(lowercase), `announcement_id`, `read_at`
- 唯一约束 (wallet_address, announcement_id)

### 3. `inbox_messages`（定向站内信）
- `id`, `wallet_address`(目标地址，lowercase)
- `title`, `content`, `is_read`, `created_at`

### 4. `support_threads`（客服会话）
- `id`, `wallet_address`(lowercase), `subject`
- `status`('open'/'closed'), `last_message_at`, `unread_user`(bool), `unread_admin`(bool)

### 5. `support_messages`（客服消息）
- `id`, `thread_id`, `sender`('user'/'admin')
- `content`, `created_at`

### 6. `admin_wallets`（管理员白名单）
- `wallet_address`(lowercase, primary key), `note`, `created_at`
- 用于判断是否可访问 `/admin`

**RLS 策略**：所有表启用 RLS。由于本项目使用钱包地址而非 Supabase Auth，前端读写时按 `wallet_address` 字段过滤；为简单起见采用宽松策略（公开读公告 + 客户端按地址过滤其他表）。如需更强安全，需单独签名验证（本期不做，后续可加）。

实时订阅：对 `inbox_messages`、`support_messages`、`announcements` 启用 Realtime。

---

## 二、前端组件

### 1. `MessageCenter`（统一入口图标）
- 放在顶部 Navbar 钱包按钮旁，铃铛图标 + 未读红点徽章
- 点击展开抽屉（Sheet），含三个 Tab：
  - **公告**：列表展示所有 active 公告
  - **站内信**：当前钱包的 `inbox_messages`
  - **客服**：进入客服对话 UI

### 2. `AnnouncementPopup`
- 用户进入站点（任意页面）时，查询未读的 active 公告
- 按 priority 顺序逐条 Dialog 弹窗展示
- 用户点"我知道了"写入 `announcement_reads`
- 关闭后下次进入不再弹（除非新公告）

### 3. `SupportChat`（客服对话）
- 类似微信聊天 UI：左侧 admin 灰色气泡，右侧 user 蓝色气泡
- 底部输入框 + 发送按钮
- 当前钱包没有 thread 时，首次发言自动创建
- Realtime 订阅 `support_messages` 实时收新消息

### 4. `/admin` 管理后台页（新增路由 `/zh/admin` 与 `/en/admin`）
- 入口守卫：连接钱包后查 `admin_wallets`，非管理员显示"无权访问"
- 三个标签页：
  - **公告管理**：列表 + 新建/编辑/启停公告（标题、内容、图片、生效区间）
  - **站内信发送**：表单输入目标钱包地址（可批量，逗号分隔）+ 标题 + 内容 → 批量插入
  - **客服会话**：左侧会话列表（按 last_message_at 排序，红点提示 unread_admin），右侧聊天面板回复用户

---

## 三、文件改动

新增：
- `src/hooks/useMessageCenter.ts` — 未读计数、读取/标记已读
- `src/hooks/useSupportChat.ts` — 客服会话与 Realtime 订阅
- `src/hooks/useIsAdmin.ts` — 检查当前钱包是否管理员
- `src/components/MessageCenter.tsx` — 顶部铃铛 + 抽屉
- `src/components/AnnouncementPopup.tsx` — 公告弹窗调度器
- `src/components/SupportChat.tsx` — 聊天 UI
- `src/pages/Admin.tsx` — 管理后台
- `src/components/admin/AnnouncementsAdmin.tsx`
- `src/components/admin/InboxAdmin.tsx`
- `src/components/admin/SupportAdmin.tsx`

修改：
- `src/components/Navbar.tsx` — 添加 `<MessageCenter />`
- `src/components/AppLayout.tsx` — 全局挂载 `<AnnouncementPopup />`
- `src/App.tsx` — 添加 `/zh/admin`、`/en/admin` 路由
- `src/locales/zh.json` / `en.json` — 新增文案

---

## 四、技术细节

- **钱包小写化**：所有 `wallet_address` 写入和查询前 `toLowerCase()`，避免大小写不一致
- **Realtime**：`ALTER PUBLICATION supabase_realtime ADD TABLE ...` 让站内信和客服消息即时推送
- **未读徽章**：合并 `announcements`(未在 reads 表中) + `inbox_messages`(is_read=false) + `support_threads`(unread_user=true) 三者数量
- **管理员引导**：首次部署后告诉用户去 Cloud 后台手动插入一条 `admin_wallets` 记录（你的钱包地址），之后就能从前端 `/admin` 进入

---

## 五、本期范围

✅ 包含：数据库 + RLS + 三种消息类型 UI + 实时推送 + 嵌入式管理后台 + 未读徽章 + 公告强弹窗
❌ 不包含：图片上传（公告图用外链）、邮件/Telegram 通知、签名验证身份（钱包地址直接信任）

确认后开始实施。
