import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useInjectedWallets } from "@/hooks/useInjectedWallets";
import { useWeb3 } from "@/hooks/useWeb3";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Wallet, ChevronDown, LogOut, RefreshCw, Copy, Globe } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/hooks/useI18n";

const languages = [
  { code: 'zh', name: '简体中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

export function WalletConnector() {
  const providers = useInjectedWallets();
  const { account, chainId, connectWith, disconnect } = useWeb3();
  const [open, setOpen] = useState(false);
  const { language, changeLanguage, t } = useI18n();

  const short = (addr?: string | null) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "");

  const handleSelect = async (prov: any) => {
    try {
      await connectWith(prov);
      setOpen(false);
      toast.success(t('wallet.connected'));
    } catch (e: any) {
      toast.error(e?.shortMessage || e?.message || t('wallet.connectFailed'));
    }
  };

  const items = useMemo(() => providers, [providers]);

  const currentLanguage = languages.find(lang => lang.code === language);

  if (!account) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="bg-gradient-primary hover:shadow-glow transition-all duration-300 font-medium">
            <Wallet className="w-4 h-4 mr-2" /> {t('wallet.connect')}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('wallet.selectWallet')}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-2">
            {items.length === 0 && (
              <div className="text-sm text-muted-foreground">{t('wallet.noWallet')}</div>
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
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(account!).then(() => toast.success(t('wallet.addressCopied')))}>
          <Copy className="w-4 h-4 mr-2" /> {t('wallet.copyAddress')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setOpen(true)}>
          <RefreshCw className="w-4 h-4 mr-2" /> {t('wallet.changeWallet')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => disconnect()}>
          <LogOut className="w-4 h-4 mr-2" /> {t('wallet.disconnect')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <Globe className="w-3 h-3 mr-1" /> {t('wallet.language')}
          </div>
          <div className="flex gap-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                  language === lang.code 
                    ? 'bg-primary/20 text-primary' 
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {lang.flag} {lang.name}
              </button>
            ))}
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className="px-2 py-1 text-xs text-muted-foreground">Chain ID: {chainId ?? "-"}</div>
      </DropdownMenuContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('wallet.selectWallet')}</DialogTitle>
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
