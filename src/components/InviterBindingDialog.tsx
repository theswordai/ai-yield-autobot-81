import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useStakingActions } from "@/hooks/useStakingActions";
import { useI18n } from "@/hooks/useI18n";

interface InviterBindingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onSkip: () => void;
}

export function InviterBindingDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  onSkip 
}: InviterBindingDialogProps) {
  const { loading, bindReferrer } = useStakingActions();
  const [inviterAddress, setInviterAddress] = useState("");
  const { t } = useI18n();

  // 从URL或localStorage获取邀请人地址
  useEffect(() => {
    if (open) {
      const urlParams = new URLSearchParams(window.location.search);
      const inviterFromUrl = urlParams.get('inviter');
      const inviterFromStorage = localStorage.getItem('inviter');
      
      if (inviterFromUrl) {
        localStorage.setItem('inviter', inviterFromUrl);
        setInviterAddress(inviterFromUrl);
      } else if (inviterFromStorage) {
        setInviterAddress(inviterFromStorage);
      }
    }
  }, [open]);

  const handleBind = async () => {
    if (!inviterAddress) return;
    
    const success = await bindReferrer(inviterAddress);
    if (success) {
      // 清除存储的邀请人地址
      localStorage.removeItem('inviter');
      onConfirm();
    }
  };

  const handleSkip = () => {
    // 清除存储的邀请人地址
    localStorage.removeItem('inviter');
    onSkip();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t("inviterBinding.title")}
          </DialogTitle>
          <div className="mt-3 p-3 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold text-primary">{t("common.confirm")}</span>
            </div>
            <p className="text-base font-medium text-foreground">
              {t("inviterBinding.description")}
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="inviter">{t("inviterBinding.inviterAddress")}</Label>
            <Input
              id="inviter"
              placeholder="0x..."
              value={inviterAddress}
              onChange={(e) => setInviterAddress(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {t("inviterBinding.note1")}<br/>
              {t("inviterBinding.note2")}<br/>
              {t("inviterBinding.note3")}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleSkip}
            disabled={loading.bind}
          >
            {t("inviterBinding.skip")}
          </Button>
          <Button 
            onClick={handleBind}
            disabled={loading.bind || !inviterAddress}
            className="bg-gradient-primary hover:bg-gradient-primary/90"
          >
            {loading.bind ? t("inviterBinding.binding") : t("inviterBinding.bind")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}