import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useWeb3 } from "@/hooks/useWeb3";
import { toast } from "@/hooks/use-toast";
import { AnnouncementsAdmin } from "@/components/admin/AnnouncementsAdmin";
import { InboxAdmin } from "@/components/admin/InboxAdmin";
import { SupportAdmin } from "@/components/admin/SupportAdmin";
import { ChatBotAdmin } from "@/components/admin/ChatBotAdmin";
import { BlockedWalletsAdmin } from "@/components/admin/BlockedWalletsAdmin";
import { callAdminAction } from "@/lib/adminAction";

export default function Admin() {
  const { isAdmin, loading, account } = useIsAdmin();
  const { connect } = useWeb3();

  const bootstrap = async () => {
    try {
      await callAdminAction("admin.bootstrap");
      toast({ title: "已添加为首位管理员，请刷新页面" });
    } catch (e: any) {
      toast({ title: "操作失败", description: e?.message || String(e), variant: "destructive" });
    }
  };

  return (
    <main className="container mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold mb-6">管理后台</h1>

      {!account && (
        <Card className="p-6 text-center space-y-3">
          <p className="text-muted-foreground">请先连接钱包</p>
          <Button onClick={() => connect()}>连接钱包</Button>
        </Card>
      )}

      {account && loading && <p className="text-muted-foreground">检查权限中...</p>}

      {account && !loading && !isAdmin && (
        <Card className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">当前钱包 <span className="font-mono">{account}</span> 不是管理员。</p>
          <div className="border-t border-border pt-4 space-y-2">
            <p className="text-xs text-muted-foreground">如果还没有任何管理员，可用当前钱包签名设置为首位管理员（仅在管理员表为空时生效）：</p>
            <Button onClick={bootstrap}>用当前钱包签名设为管理员</Button>
          </div>
        </Card>
      )}

      {account && isAdmin && (
        <Tabs defaultValue="announcements">
          <TabsList>
            <TabsTrigger value="announcements">公告管理</TabsTrigger>
            <TabsTrigger value="inbox">站内信发送</TabsTrigger>
            <TabsTrigger value="support">客服会话</TabsTrigger>
            <TabsTrigger value="chatbot">聊天机器人</TabsTrigger>
            <TabsTrigger value="blocked">wallet</TabsTrigger>
          </TabsList>
          <TabsContent value="announcements" className="mt-4"><AnnouncementsAdmin /></TabsContent>
          <TabsContent value="inbox" className="mt-4"><InboxAdmin /></TabsContent>
          <TabsContent value="support" className="mt-4"><SupportAdmin /></TabsContent>
          <TabsContent value="chatbot" className="mt-4"><ChatBotAdmin /></TabsContent>
          <TabsContent value="blocked" className="mt-4"><BlockedWalletsAdmin /></TabsContent>
        </Tabs>
      )}
    </main>
  );
}
