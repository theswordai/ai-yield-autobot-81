import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useWeb3 } from "@/hooks/useWeb3";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AnnouncementsAdmin } from "@/components/admin/AnnouncementsAdmin";
import { InboxAdmin } from "@/components/admin/InboxAdmin";
import { SupportAdmin } from "@/components/admin/SupportAdmin";

export default function Admin() {
  const { isAdmin, loading, account } = useIsAdmin();
  const { connect } = useWeb3();
  const [bootstrapAddr, setBootstrapAddr] = useState("");

  const bootstrap = async () => {
    const addr = bootstrapAddr.trim().toLowerCase();
    if (!/^0x[a-f0-9]{40}$/.test(addr)) { toast({ title: "请输入有效钱包地址" }); return; }
    const { count } = await supabase.from("admin_wallets").select("*", { count: "exact", head: true });
    if ((count || 0) > 0) { toast({ title: "已有管理员，无法通过此入口添加", variant: "destructive" }); return; }
    const { error } = await supabase.from("admin_wallets").insert({ wallet_address: addr, note: "first admin" });
    if (error) { toast({ title: "添加失败", description: error.message, variant: "destructive" }); return; }
    toast({ title: "已添加为首位管理员，请刷新页面" });
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
            <p className="text-xs text-muted-foreground">如果还没有任何管理员，可在此设置首位管理员（仅在管理员表为空时生效）：</p>
            <div className="flex gap-2">
              <Input placeholder="0x..." value={bootstrapAddr} onChange={(e) => setBootstrapAddr(e.target.value)} />
              <Button onClick={bootstrap}>设为管理员</Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setBootstrapAddr(account)}>填入当前钱包地址</Button>
          </div>
        </Card>
      )}

      {account && isAdmin && (
        <Tabs defaultValue="announcements">
          <TabsList>
            <TabsTrigger value="announcements">公告管理</TabsTrigger>
            <TabsTrigger value="inbox">站内信发送</TabsTrigger>
            <TabsTrigger value="support">客服会话</TabsTrigger>
          </TabsList>
          <TabsContent value="announcements" className="mt-4"><AnnouncementsAdmin /></TabsContent>
          <TabsContent value="inbox" className="mt-4"><InboxAdmin /></TabsContent>
          <TabsContent value="support" className="mt-4"><SupportAdmin /></TabsContent>
        </Tabs>
      )}
    </main>
  );
}
