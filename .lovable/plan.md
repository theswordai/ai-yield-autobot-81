移除首页右下角浮动的"聊天大厅"按钮（`src/components/ChatRoom.tsx` 里 `SheetTrigger` 中的 `<button aria-label="聊天大厅">`）。

做法：在 `src/components/AppLayout.tsx` 中不再渲染 `<ChatRoom />`，并移除相应 import。这样聊天大厅浮动按钮及其面板不会再出现在页面上，其他浮动按钮（在线客服）保持不变。

如果你其实想去掉的是"在线客服"那个按钮（第一个圆钮），告诉我我改成移除 `MessageCenter` 的浮动入口。