import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRootAddress } from "@/hooks/useRootAddress";
import { useToast } from "@/hooks/use-toast";
import { Settings, Trash2, Wallet, RefreshCw } from "lucide-react";

export function RootAddressManager() {
  const { rootAddress, source, updateRootAddress, clearInviteSource, switchToWallet } = useRootAddress();
  const { toast } = useToast();
  const [showManager, setShowManager] = useState(false);
  const [newAddress, setNewAddress] = useState("");

  const shortenAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "ref": return "URL参数";
      case "localStorage": return "本地存储";
      case "wallet": return "当前钱包";
      case "default": return "默认地址";
      default: return "未知";
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case "ref": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "localStorage": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "wallet": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "default": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const handleUpdateAddress = () => {
    if (!newAddress.trim()) {
      toast({
        title: "错误",
        description: "请输入有效的地址"
      });
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(newAddress)) {
      toast({
        title: "错误", 
        description: "请输入有效的以太坊地址格式"
      });
      return;
    }

    updateRootAddress(newAddress);
    setNewAddress("");
    setShowManager(false);
    toast({
      title: "成功",
      description: "根地址已更新"
    });
  };

  const handleClearSource = () => {
    clearInviteSource();
    setShowManager(false);
    toast({
      title: "成功",
      description: "邀请来源已清除"
    });
  };

  const handleSwitchToWallet = () => {
    switchToWallet();
    setShowManager(false);
    toast({
      title: "成功", 
      description: "已切换到钱包地址"
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            当前根地址
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowManager(!showManager)}
          >
            管理
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm">{shortenAddress(rootAddress)}</span>
            <Badge className={getSourceLabel(source) && getSourceColor(source)}>
              {getSourceLabel(source)}
            </Badge>
          </div>
        </div>

        {showManager && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="space-y-2">
              <label className="text-sm font-medium">设置新的根地址</label>
              <div className="flex gap-2">
                <Input
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="0x..."
                  className="font-mono text-xs"
                />
                <Button onClick={handleUpdateAddress} size="sm">
                  更新
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSwitchToWallet}
                className="flex items-center gap-1"
              >
                <Wallet className="w-3 h-3" />
                切换到钱包
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSource}
                className="flex items-center gap-1 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
                清除邀请来源
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <div className="mb-1">地址优先级：URL参数 → 本地存储 → 当前钱包 → 默认地址</div>
              <div>默认地址：{shortenAddress("0x6eD00D95766Bdf20c2FffcdBEC34a69A8c5B7eE6")}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}