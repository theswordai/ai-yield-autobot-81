import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLegendaryDashboard, fmt } from "@/hooks/useLegendary";
import { useWeb3 } from "@/hooks/useWeb3";
import { CLAIM_COOLDOWN_SEC, aprBpsToApyPct } from "@/config/legendary";
import { useEffect, useState } from "react";
import { TrendingUp, Wallet, Gift, Crown, Users, Activity } from "lucide-react";

function StatCard({ icon: Icon, label, value, sub }: any) {
  return (
    <Card className="p-4 bg-white/5 backdrop-blur-xl border-white/10">
      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
        <Icon className="w-4 h-4" /> {label}
      </div>
      <div className="text-xl md:text-2xl font-bold text-foreground">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </Card>
  );
}

function useCountdown(target: bigint) {
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);
  const remain = Number(target) - now;
  if (remain <= 0) return "可立即领取";
  const h = Math.floor(remain / 3600);
  const m = Math.floor((remain % 3600) / 60);
  const s = remain % 60;
  return `${h}h ${m}m ${s}s`;
}

export function DashboardTab({ onGoto }: { onGoto: (tab: string) => void }) {
  const { account, connect } = useWeb3();
  const { data } = useLegendaryDashboard();
  const totalPrincipal = data.pool1Principal + data.pool2Principal;
  const nextClaim = data.lastClaimAt + BigInt(CLAIM_COOLDOWN_SEC);
  const countdown = useCountdown(nextClaim);

  if (!account) {
    return (
      <Card className="p-8 bg-white/5 backdrop-blur-xl border-white/10 text-center">
        <p className="text-muted-foreground mb-4">连接钱包以查看你的传奇锁仓数据</p>
        <Button onClick={() => connect()} className="bg-gradient-to-r from-amber-500 to-yellow-600">
          连接钱包
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={Wallet}
          label="我的总锁仓本金"
          value={`${fmt(totalPrincipal)} USDT`}
          sub={`一池 ${fmt(data.pool1Principal)} · 二池 ${fmt(data.pool2Principal)}`}
        />
        <StatCard
          icon={TrendingUp}
          label="累计可领利息"
          value={`${fmt(data.totalPending)} USDT`}
        />
        <StatCard
          icon={Gift}
          label="可领奖励"
          value={`${fmt(data.referralClaimable)} USDT`}
          sub={`距下次可领：${countdown}`}
        />
        <StatCard
          icon={Crown}
          label="我的等级"
          value={data.level === 0 ? "V0" : `V${data.level}`}
          sub={`自投 ${fmt(data.selfStake, 0)} · 业绩 ${fmt(data.teamPerf, 0)}`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard
          icon={Activity}
          label="全网一池本金"
          value={`${fmt(data.totalPool1)} USDT`}
          sub={`APR 260% · APY ${aprBpsToApyPct(26000).toFixed(0)}%`}
        />
        <StatCard
          icon={Activity}
          label="全网二池本金"
          value={`${fmt(data.totalPool2)} USDT`}
          sub={`APR 360% · APY ${aprBpsToApyPct(36000).toFixed(0)}%`}
        />
        <StatCard
          icon={Users}
          label="当日全网入金"
          value={`${fmt(data.currentDayInflow)} USDT`}
        />
      </div>

      <Card className="p-4 bg-white/5 backdrop-blur-xl border-white/10">
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => onGoto("deposit")}
            disabled={data.paused || data.frozen}
            className="bg-gradient-to-r from-amber-500 to-yellow-600"
          >
            去存款
          </Button>
          <Button
            onClick={() => onGoto("positions")}
            variant="outline"
            className="border-white/20"
          >
            去复投 / 管理仓位
          </Button>
          <Button onClick={() => onGoto("rewards")} variant="outline" className="border-white/20">
            领取奖励
          </Button>
          {data.paused && (
            <span className="text-xs text-destructive self-center">合约已暂停</span>
          )}
          {data.frozen && (
            <span className="text-xs text-destructive self-center">账户已冻结</span>
          )}
        </div>
      </Card>
    </div>
  );
}
