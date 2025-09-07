import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, ArrowRight, Gift, Shield, Zap, Globe, Star, TrendingUp } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { useNavigate, useLocation } from "react-router-dom";

interface InvitationLandingPageProps {
  onClose: () => void;
  onProceed: () => void;
}

export default function InvitationLandingPage({ onClose, onProceed }: InvitationLandingPageProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get current language prefix
  const currentPath = location.pathname;
  const langMatch = currentPath.match(/^\/([a-z]{2})/);
  const langPrefix = langMatch ? `/${langMatch[1]}` : '/zh';
  
  const goToReferral = () => {
    navigate(`${langPrefix}/referral`);
  };

  return (
    <div className="fixed inset-0 bg-gradient-dark backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-4xl w-full bg-gradient-to-br from-card/95 to-card/90 backdrop-blur border-accent/20 relative">
          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
          >
            <X className="w-5 h-5" />
          </Button>

          <CardContent className="p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                <Globe className="w-8 h-8 text-primary" />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  数美在线 · USDV 的孵化器
                </span>
              </div>
            </div>

            {/* One-liner positioning */}
            <div className="text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-accent" />
                <span className="font-semibold text-lg">一句话定位</span>
              </div>
              <p className="text-foreground font-medium">
                数美在线 = 通往 USDV 的唯一入口<br />
                USDV = 驱动文明级财富裂变的终极引擎
              </p>
            </div>

            {/* Why choose us */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xl font-bold text-center justify-center">
                <Star className="w-6 h-6 text-accent" />
                <span>为什么选择数美在线？</span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Stable Returns */}
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-primary">
                      <TrendingUp className="w-5 h-5" />
                      1️⃣ 稳定收益
                    </div>
                    <p className="text-sm text-muted-foreground">
                      财富不是冷冰冰的数字，而是 <span className="text-foreground font-medium">文明脉动</span>。<br />
                      每日释放，链上透明；不是直线，而是 <span className="text-accent font-medium">曲线加速</span>；不是单点爆发，而是 <span className="text-accent font-medium">持续几何级放大</span>。
                    </p>
                  </CardContent>
                </Card>

                {/* Security */}
                <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-accent">
                      <Shield className="w-5 h-5" />
                      2️⃣ 安全护航
                    </div>
                    <p className="text-sm text-muted-foreground">
                      安全不是事后补救，而是 <span className="text-foreground font-medium">文明级的底层设计</span>。<br />
                      所有资金流动由 <span className="text-accent font-medium">智能合约自动执行</span>，配合 <span className="text-accent font-medium">多重独立审计</span> 与 <span className="text-accent font-medium">MPC 去中心化金库</span>。
                    </p>
                  </CardContent>
                </Card>

                {/* Flexible Exit */}
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-primary">
                      <ArrowRight className="w-5 h-5" />
                      3️⃣ 灵活退出
                    </div>
                    <p className="text-sm text-muted-foreground">
                      退出，是 <span className="text-foreground font-medium">规则化的文明契约</span>。<br />
                      👉 提现 = 财富落袋为安<br />
                      👉 复投 = 财富几何裂变
                    </p>
                  </CardContent>
                </Card>

                {/* Civilization Narrative */}
                <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-accent">
                      <Globe className="w-5 h-5" />
                      4️⃣ 文明叙事
                    </div>
                    <p className="text-sm text-muted-foreground">
                      道义阿尔法 3.0 = <span className="text-accent font-medium">财富增长 + 公益放大</span> = 文明红利。<br />
                      你的每一份收益，既是 <span className="text-foreground font-medium">个人回报</span>，也是 <span className="text-accent font-medium">全球善意的扩散</span>。
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Future Dividends */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <Gift className="w-5 h-5 text-accent" />
                  <span>5️⃣ 未来红利</span>
                </div>
                <p className="text-sm">
                  加入数美在线 = 拿到 USDV 的 <span className="text-accent font-medium">文明门票</span>。
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div>• 静态如 <span className="text-primary font-medium">DNA 自我复制</span></div>
                  <div>• 动态如 <span className="text-accent font-medium">心脏</span> 推动循环</div>
                  <div>• 团队长如 <span className="text-primary font-medium">制度</span> 放大共识</div>
                </div>
              </CardContent>
            </Card>

            {/* Ecosystem */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-center">🌌 数美在线的绝对优势</h3>
              <p className="text-center text-muted-foreground">
                生态只是表层，生物链才是本质。六大生态共同构建一个自我生长、自我进化的金融生命体：
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div className="text-center p-2 rounded bg-primary/5">1️⃣ 技术生态 = DNA</div>
                <div className="text-center p-2 rounded bg-accent/5">2️⃣ 金融生态 = 心脏</div>
                <div className="text-center p-2 rounded bg-primary/5">3️⃣ 安全生态 = 免疫系统</div>
                <div className="text-center p-2 rounded bg-accent/5">4️⃣ 治理生态 = 社会制度</div>
                <div className="text-center p-2 rounded bg-primary/5">5️⃣ 公益生态 = 精神系统</div>
                <div className="text-center p-2 rounded bg-accent/5">6️⃣ AI 超级智能生态 = 大脑</div>
              </div>
            </div>

            {/* Gift Package */}
            <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-accent/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 font-bold text-accent">
                  <Gift className="w-6 h-6" />
                  <span>🎁 新人专属资料包</span>
                </div>
                <p className="text-sm font-medium">✨ 注册即可领取，价值无限的财富文明礼包：</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
                  <div>• 《USDV 财富文明简明白皮书》</div>
                  <div>• 《旧世界 vs 新世界》对照话术</div>
                  <div>• 《文明生物链》图解海报</div>
                  <div>• 《7 天新人行动营》操作手册</div>
                  <div>• 《财富进化路径图解》</div>
                  <div>• 《100 问答速查手册》</div>
                </div>
              </CardContent>
            </Card>

            {/* Compliance */}
            <div className="text-xs text-muted-foreground space-y-2 border-t pt-4">
              <h4 className="font-semibold text-foreground">📌 全球合规与安全声明</h4>
              <div className="space-y-1">
                <p>• 风险提示：数字资产和区块链投资具有市场风险与波动性，请根据自身风险承受能力谨慎参与。</p>
                <p>• 服务条款：使用本平台即表示您同意遵守我们的服务协议，包括账户注册、投资参与、收益分配、邀请机制等。</p>
                <p>• 隐私政策：我们严格保护用户隐私，所有数据仅用于平台合规运营，不会被出售或滥用。</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={goToReferral}
                className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90 h-12"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                前往善举页面
              </Button>
              <Button
                onClick={onProceed}
                variant="outline"
                className="flex-1 h-12"
              >
                开始体验
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}