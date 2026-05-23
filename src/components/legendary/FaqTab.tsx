import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const FAQ = [
  {
    q: "锁仓期是多久？可以提前取出吗？",
    a: "一池、二池均锁 365 天。可以提前赎回（earlyWithdraw），但会扣除 50% 本金作为罚金，已计利息照付。",
  },
  {
    q: "一池和二池有什么区别？",
    a: "一池：直接用钱包 USDT 存入，基础 APR 260%，每 5,000 USDT 加 3%，最高 +30%。二池：仅能用一池/二池产生的「未领利息」复投进入，APR 360%，钱包 USDT 不能直接进二池。两池最低均为 200 USDT。",
  },
  {
    q: "怎样才能拿到推荐奖？",
    a: "你需要先 bind 一位上线（B），且 B 当前自投 selfStake ≥ 200 USDT。绑定后你每笔入金会触发：直推 4.5% 给 B，间推 3% 给 B 的上线。若上线 selfStake 不足 200，则该笔奖励不发放也不补偿。",
  },
  {
    q: "动态分红怎么算？",
    a: "每笔入金基数 = 入金 × 10%。沿上级链最多 15 个地址，按 V1~V6 分桶：V1=10% / V2=12% / V3=15% / V4=18% / V5=20% / V6=25%。同档位多人均分，缺档不发不顺延。",
  },
  {
    q: "等级 V1~V6 的门槛是什么？",
    a: "V1: 自投≥200, 业绩≥1,000；V2: 1,000/50,000；V3: 3,000/150,000；V4: 10,000/500,000；V5: 20,000/1,000,000；V6: 30,000/2,000,000。自投与业绩需同时满足。",
  },
  {
    q: "奖励可以随时领吗？",
    a: "合约本身不限领取频率，但前端按 24 小时冷却显示倒计时（基于 lastClaimAt）。一次 claimRewards() 会把直推+间推+动态分红的累计一次性领走。",
  },
  {
    q: "为什么显示「合约已暂停」或「账户已冻结」？",
    a: "合约在风控状态下会暂停所有写操作；个别账户被冻结时也无法进行存取与领奖，请联系客服了解原因。",
  },
  {
    q: "邀请关系绑定后还能改吗？",
    a: "不能。bind 是一次性的、不可修改的链上操作。请仔细确认上线地址。",
  },
];

export function FaqTab() {
  return (
    <div className="space-y-4 max-w-3xl">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          风险提示：传奇锁仓为高收益高风险产品，提前赎回扣除 50% 本金，锁仓期 365
          天。合约暂停或账户冻结时无法操作，请理性参与。
        </AlertDescription>
      </Alert>

      <Card className="p-4 bg-white/5 backdrop-blur-xl border-white/10">
        <Accordion type="single" collapsible>
          {FAQ.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-sm">{item.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  );
}
