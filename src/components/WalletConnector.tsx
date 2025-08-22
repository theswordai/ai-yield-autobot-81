import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useInjectedWallets } from "@/hooks/useInjectedWallets";
import { useWeb3 } from "@/hooks/useWeb3";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Wallet, ChevronDown, LogOut, RefreshCw, Copy } from "lucide-react";
import { toast } from "sonner";

export function WalletConnector() {
  const providers = useInjectedWallets();
  const { account, chainId, connectWith, disconnect } = useWeb3();
  const [open, setOpen] = useState(false);

  const short = (addr?: string | null) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "");

  const handleSelect = async (prov: any) => {
    try {
      await connectWith(prov);
      setOpen(false);
      toast.success("钱包已连接");
    } catch (e: any) {
      toast.error(e?.shortMessage || e?.message || "连接失败");
    }
  };

  const items = useMemo(() => providers, [providers]);

  if (!account) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="bg-gradient-primary hover:shadow-glow transition-all duration-300 font-medium">
            <Wallet className="w-4 h-4 mr-2" /> 连接钱包
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>选择钱包</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-2">
            {items.length === 0 && (
              <div className="text-sm text-muted-foreground">未发现钱包插件，请先安装如 MetaMask、OKX、Bitget 等扩展。</div>
            )}
            {items.map(({ info, provider }) => (
              <Button key={info.uuid || info.rdns || info.name} variant="outline" className="justify-start" onClick={() => handleSelect(provider)}>
                {info.icon ? (
                  <img src={info.icon} alt={info.name} className="w-5 h-5 rounded mr-2" />
                ) : (
                  <Wallet className="w-4 h-4 mr-2" />
                )}
                <span className="flex-1 text-left">{info.name}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="secondary" className="font-medium">
          <Wallet className="w-4 h-4 mr-2" /> {short(account)}
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(account!).then(() => toast.success("地址已复制"))}>
          <Copy className="w-4 h-4 mr-2" /> 复制地址
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setOpen(true)}>
          <RefreshCw className="w-4 h-4 mr-2" /> 更换钱包
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => disconnect()}>
          <LogOut className="w-4 h-4 mr-2" /> 断开连接
        </DropdownMenuItem>
        <div className="px-2 py-1 text-xs text-muted-foreground">Chain ID: {chainId ?? "-"}</div>
      </DropdownMenuContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>选择钱包</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-2">
            {items.map(({ info, provider }) => (
              <Button key={info.uuid || info.rdns || info.name} variant="outline" className="justify-start" onClick={() => handleSelect(provider)}>
                {info.icon ? (
                  <img src={info.icon} alt={info.name} className="w-5 h-5 rounded mr-2" />
                ) : (
                  <Wallet className="w-4 h-4 mr-2" />
                )}
                <span className="flex-1 text-left">{info.name}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  );
}
