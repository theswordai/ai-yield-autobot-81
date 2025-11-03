import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign } from "lucide-react";

interface ClaimYieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  yieldAmount: string;
  onReinvest: () => void;
  onClaim: () => void;
  loading?: boolean;
}

export function ClaimYieldDialog({
  open,
  onOpenChange,
  yieldAmount,
  onReinvest,
  onClaim,
  loading = false,
}: ClaimYieldDialogProps) {
  console.log('🔔 ClaimYieldDialog render:', { open, yieldAmount, loading });
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">选择操作</DialogTitle>
          <DialogDescription className="text-center">
            您的待领收益: <span className="font-bold text-accent">{yieldAmount} USDT</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          <Button
            onClick={onReinvest}
            disabled={loading}
            className="w-full h-auto py-4 flex flex-col items-center gap-2"
            variant="default"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-lg font-semibold">复投</span>
            </div>
            <span className="text-sm opacity-90">年化收益率最高 1544%</span>
          </Button>
          
          <Button
            onClick={onClaim}
            disabled={loading}
            className="w-full h-auto py-4"
            variant="outline"
          >
            <DollarSign className="w-5 h-5 mr-2" />
            <span className="text-lg font-semibold">领取收益</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
