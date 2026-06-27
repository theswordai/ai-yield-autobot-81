import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWeb3 } from "@/hooks/useWeb3";
import { callSysAction } from "@/lib/sysAction";
import { toast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

type Row = { wallet_address: string; note: string | null; created_at: string };

export default function SysPanel() {
  const { account, connect } = useWeb3();
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [addr, setAddr] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!account) return;
    let cancelled = false;
    (async () => {
      setVerifying(true);
      try {
        await callSysAction("verify", {});
        if (!cancelled) setVerified(true);
      } catch (e: any) {
        if (!cancelled) {
          toast({ title: "验证失败", description: e?.message || String(e), variant: "destructive" });
        }
      } finally {
        if (!cancelled) setVerifying(false);
      }
    })();
    return () => { cancelled = true; };
  }, [account]);

  useEffect(() => {
    if (!verified) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verified]);

  const load = async () => {
    setLoading(true);
    try {
      const data: any = await callSysAction("blocked.list", {});
      setRows((data?.rows as Row[]) || []);
    } catch (e: any) {
      toast({ title: "加载失败", description: e?.message || String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const add = async () => {
    const trimmed = addr.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      toast({ title: "地址格式错误", description: "请输入合法的 0x 开头 40 位十六进制地址", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      await callSysAction("blocked.add", { wallet_address: trimmed, note: note.trim() || null });
      toast({ title: "已处理" });
      setAddr("");
      setNote("");
      await load();
    } catch (e: any) {
      toast({ title: "操作失败", description: e?.message || String(e), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (wallet_address: string) => {
    if (!confirm(`确认移除 ${wallet_address} ？`)) return;
    try {
      await callSysAction("blocked.delete", { wallet_address });
      toast({ title: "已移除" });
      await load();
    } catch (e: any) {
      toast({ title: "操作失败", description: e?.message || String(e), variant: "destructive" });
    }
  };

  if (!account) {
    return (
      <main className="container mx-auto px-4 py-20">
        <Card className="p-6 text-center space-y-3">
          <p className="text-muted-foreground">请先连接钱包</p>
          <Button onClick={() => connect()}>连接钱包</Button>
        </Card>
      </main>
    );
  }

  if (verifying) {
    return (
      <main className="container mx-auto px-4 py-20">
        <p className="text-muted-foreground text-center">验证中...</p>
      </main>
    );
  }

  if (!verified) {
    return (
      <main className="container mx-auto px-4 py-20">
        <Card className="p-6 text-center space-y-3">
          <p className="text-muted-foreground">当前钱包无权访问此页面</p>
          <Button variant="outline" onClick={() => navigate("/")}>返回首页</Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold mb-6">系统配置</h1>
      <div className="space-y-4">
        <Card className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-2">
            <Input
              placeholder="0x..."
              value={addr}
              onChange={(e) => setAddr(e.target.value)}
              className="font-mono"
            />
            <Input
              placeholder="备注（可选）"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Button onClick={add} disabled={busy}>
              {busy ? "提交中..." : "添加"}
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">加载中...</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无</p>
          ) : (
            <div className="space-y-2">
              {rows.map((r) => (
                <div
                  key={r.wallet_address}
                  className="flex items-center justify-between gap-2 p-2 rounded border border-border"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-xs break-all">{r.wallet_address}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.note || "—"} · {new Date(r.created_at).toLocaleString()}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => remove(r.wallet_address)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
