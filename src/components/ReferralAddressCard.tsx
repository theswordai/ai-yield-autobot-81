import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface Investment {
  amount: string;
  earnings: string;
  date: string;
  txHash: string;
}

interface ReferralData {
  level: 1 | 2;
  user: string;
  amount: string;
  earnings: string;
  date: string;
  investments: Investment[];
}

interface ReferralAddressCardProps {
  address: string;
  level: 1 | 2;
  referralData?: ReferralData;
  shortenAddress: (address: string) => string;
}

export function ReferralAddressCard({ address, level, referralData, shortenAddress }: ReferralAddressCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div 
        className="flex items-center justify-between p-3 hover:bg-muted/20 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <Badge variant={level === 1 ? "default" : "secondary"}>L{level}</Badge>
          <span className="font-mono text-sm">{shortenAddress(address)}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            总投资: <span className="text-primary font-medium">{referralData?.amount || "0.00"} USDT</span>
          </div>
          <div className="text-sm">
            总奖励: <span className="text-accent font-medium">{referralData?.earnings || "0.00"} USDT</span>
          </div>
          <span className={`text-xs transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </div>
      
      {expanded && referralData?.investments && referralData.investments.length > 0 && (
        <div className="border-t border-border bg-muted/5">
          <div className="p-2">
            <div className="text-xs text-muted-foreground mb-2 font-medium">投资记录明细：</div>
            <div className="space-y-1">
              {referralData.investments.map((investment, invIndex) => (
                <div key={invIndex} className="flex justify-between items-center text-xs p-2 bg-background/50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{investment.date}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {investment.txHash.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <span>投资: <span className="text-primary font-medium">{investment.amount} USDT</span></span>
                    <span>奖励: <span className="text-accent font-medium">{investment.earnings} USDT</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}