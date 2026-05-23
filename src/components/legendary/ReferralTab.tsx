import { useEffect, useMemo, useState } from "react";
import { isAddress } from "ethers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Check, AlertCircle, Users } from "lucide-react";
import { toast } from "sonner";
import { useWeb3 } from "@/hooks/useWeb3";
import { useLegendaryContracts, useLegendaryDashboard, fmt } from "@/hooks/useLegendary";
import { useLegendaryActions } from "@/hooks/useLegendaryActions";
import { LEVELS } from "@/config/legendary";

const ZERO = "0x0000000000000000000000000000000000000000";

type DirectInfo = {
  addr: string;
  selfStake: bigint;
  teamPerf: bigint;
  level: number;
};

export function ReferralTab() {
  const { account, connect } = useWeb3();
  const { read } = useLegendaryContracts();
  const { data, refetch } = useLegendaryDashboard();
  const { bind, busy } = useLegendaryActions(refetch);
  const [inviterInput, setInviterInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [directs, setDirects] = useState<DirectInfo[]>([]);

  // 从 URL ?ref=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref && isAddress(ref) && data.inviter === ZERO) {
      setInviterInput(ref);
    }
  }, [data.inviter]);

  // 加载直推列表详情
  useEffect(() => {
    (async () => {
      if (!read || !account) return setDirects([]);
      try {
        const list: string[] = await read.referral.getDirects(account);
        const infos = await Promise.all(
          list.slice(0, 50).map(async (addr) => {
            const [ss, tp, lv] = await Promise.all([
              read.referral.selfStake(addr).catch(() => 0n),
              read.referral.teamPerf(addr).catch(() => 0n),
              read.referral.getLevel(addr).catch(() => 0n),
            ]);
            return { addr, selfStake: ss, teamPerf: tp, level: Number(lv) };
          })
        );
        setDirects(infos);
      } catch {
        setDirects([]);
      }
    })();
  }, [read, account, data]);

  const myLink = useMemo(() => {
    if (!account) return "";
    return `${window.location.origin}/?ref=${account}`;
  }, [account]);

  const nextLevel = useMemo(() => {
    const cur = data.level;
    if (cur >= 6) return null;
    return LEVELS[cur];
  }, [data.level]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(myLink);
      setCopied(true);
      toast.success("已复制邀请链接");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("复制失败");
    }
  };

  if (!account) {
    return (
      <Card className="p-8 bg-white/5 backdrop-blur-xl border-white/10 text-center">
        <p className="text-muted-foreground mb-4">连接钱包查看团队与邀请数据</p>
        <Button onClick={() => connect()} className="bg-gradient-to-r from-amber-500 to-yellow-600">
          连接钱包
        </Button>
      </Card>
    );
  }

  const bound = data.inviter !== ZERO;

  return (
    <div className="space-y-4">
      {/* 我的上线 */}
      <Card className="p-4 bg-white/5 backdrop-blur-xl border-white/10">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" /> 我的上线
        </h3>
        {bound ? (
          <div className="text-sm">
            <span className="text-muted-foreground">已绑定：</span>
            <span className="font-mono">{data.inviter}</span>
          </div>
        ) : (
          <div className="space-y-3">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                绑定一次后不可修改。上线需自投 ≥ 200 USDT 才能为你贡献奖励。
              </AlertDescription>
            </Alert>
            <div>
              <Label className="text-xs text-muted-foreground">上线钱包地址</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="0x..."
                  value={inviterInput}
                  onChange={(e) => setInviterInput(e.target.value)}
                  className="font-mono text-sm"
                />
                <Button
                  disabled={!inviterInput || busy !== null}
                  onClick={() => bind(inviterInput.trim())}
                  className="bg-gradient-to-r from-amber-500 to-yellow-600"
                >
                  绑定
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 邀请链接 */}
      <Card className="p-4 bg-white/5 backdrop-blur-xl border-white/10">
        <h3 className="font-bold mb-3">我的邀请链接</h3>
        <div className="flex gap-2">
          <Input value={myLink} readOnly className="font-mono text-xs" />
          <Button variant="outline" onClick={onCopy} className="border-white/20">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </Card>

      {/* 团队总览 */}
      <Card className="p-4 bg-white/5 backdrop-blur-xl border-white/10">
        <h3 className="font-bold mb-3">团队总览</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">自投 selfStake</div>
            <div className="font-bold text-amber-400">{fmt(data.selfStake, 0)} USDT</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">团队业绩 teamPerf</div>
            <div className="font-bold">{fmt(data.teamPerf, 0)} USDT</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">当前等级</div>
            <div className="font-bold text-amber-400">V{data.level}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">距下一级</div>
            <div className="font-bold text-xs">
              {nextLevel
                ? `自投差 ${fmt(
                    nextLevel.self * 10n ** 18n - data.selfStake > 0n
                      ? nextLevel.self * 10n ** 18n - data.selfStake
                      : 0n,
                    0
                  )} / 业绩差 ${fmt(
                    nextLevel.team * 10n ** 18n - data.teamPerf > 0n
                      ? nextLevel.team * 10n ** 18n - data.teamPerf
                      : 0n,
                    0
                  )}`
                : "已满级"}
            </div>
          </div>
        </div>
      </Card>

      {/* 直推列表 */}
      <Card className="p-4 bg-white/5 backdrop-blur-xl border-white/10">
        <h3 className="font-bold mb-3">我的直推（{directs.length}）</h3>
        {directs.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">暂无直推</div>
        ) : (
          <div className="space-y-2">
            {directs.map((d) => (
              <div
                key={d.addr}
                className="flex items-center gap-3 p-2 rounded bg-white/5 text-xs"
              >
                <Badge variant="outline" className="border-amber-400/40 text-amber-400">
                  V{d.level}
                </Badge>
                <span className="font-mono">
                  {d.addr.slice(0, 6)}...{d.addr.slice(-4)}
                </span>
                <span className="ml-auto text-muted-foreground">
                  自投 {fmt(d.selfStake, 0)} · 业绩 {fmt(d.teamPerf, 0)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 等级表 */}
      <Card className="p-4 bg-white/5 backdrop-blur-xl border-white/10">
        <h3 className="font-bold mb-3">等级 & 动态分红比例</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground border-b border-white/10">
              <tr>
                <th className="text-left py-2 px-2">等级</th>
                <th className="text-right py-2 px-2">自投门槛</th>
                <th className="text-right py-2 px-2">团队业绩</th>
                <th className="text-right py-2 px-2">动态分红</th>
              </tr>
            </thead>
            <tbody>
              {LEVELS.map((lv) => (
                <tr key={lv.v} className="border-b border-white/5">
                  <td className="py-2 px-2 font-bold text-amber-400">V{lv.v}</td>
                  <td className="py-2 px-2 text-right">{lv.self.toLocaleString()} USDT</td>
                  <td className="py-2 px-2 text-right">{lv.team.toLocaleString()} USDT</td>
                  <td className="py-2 px-2 text-right">{lv.dynBps / 100}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          推荐奖：直推 4.5% / 间推 3%（上线需自投 ≥ 200 USDT）。动态分红基数 = 入金 ×
          10%，沿上级链最多 15 人按档分配，缺档不发不顺延。
        </p>
      </Card>
    </div>
  );
}
