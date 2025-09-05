import { Navbar } from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/useI18n";

export default function Whitepaper() {
  const { t } = useI18n();
  
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-dark">
      <Navbar />
      <Helmet>
        <title>{t('meta.title')} | Whitepaper</title>
        <meta name="description" content={t('meta.description')} />
        <link rel="canonical" href="/whitepaper" />
      </Helmet>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" />
      <main className="pt-20 pb-10 relative z-10">
        <div className="container mx-auto px-4">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">USD.online Whitepaper Collection</h1>
          </header>

          {/* Whitepaper 1: USD.online */}
          <section className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">🚀 数美在线（USD.online）白皮书</CardTitle>
                <p className="text-lg text-muted-foreground">AI 驱动的全球流动性与公益共建平台</p>
                <p className="text-center font-bold text-primary">算法即自由 · 叙事即价值 · 资本即文明</p>
              </CardHeader>
              <CardContent className="space-y-6 text-sm leading-6">
                
                <div className="prose prose-sm max-w-none">
                  <h3>1. 项目序言</h3>
                  <p>全球金融文明正处在新的临界点。美元霸权正在松动，AI 正在改写金融逻辑，全球资本体系正在走向新的多极化。</p>
                  <p>在这样的时代背景下，USD.online（数美在线） 应运而生。它不是单纯的金融平台，而是 USDV 文明生物链的孵化器与实验场：一个将 AI × 区块链 × 公益金融 融合的全球舞台。</p>
                  <p><strong>👉 愿景：</strong><br/>让资本不再冰冷，而是带有温度；<br/>让财富不止增长，而是带来文明共鸣。</p>
                  
                  <h3>2. 市场痛点</h3>
                  <h4>传统金融的困境</h4>
                  <ul>
                    <li>跨境资本流动受限：依赖央行与清算体系，效率低、成本高。</li>
                    <li>信息不对称：透明度不足，信任成本极高。</li>
                  </ul>
                  
                  <h4>加密金融的局限</h4>
                  <ul>
                    <li>零散割裂：CEX 与 DEX 流动性孤岛化，资金效率低。</li>
                    <li>投机化严重：缺乏长期价值锚定，市场信任不足。</li>
                  </ul>
                  
                  <h4>公益金融的缺口</h4>
                  <ul>
                    <li>捐助资金不透明：公众难以追踪流向。</li>
                    <li>善意无法放大：公益停留在"捐助"层面，未能与资本结合。</li>
                  </ul>
                  
                  <p>👉 旧世界的宿命：低效、零散、不透明。<br/>👉 数美在线的使命：让资本与公益融合，重塑全球金融文明。</p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Whitepaper 2: USDV */}
          <section className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">🌐 USDV 白皮书</CardTitle>
                <p className="text-lg text-muted-foreground">文明生物链 · 全球金融的新物种</p>
                <p className="text-sm text-muted-foreground">副标题：AI × Crypto × Science —— 生态只是表层，生物链才是本质</p>
              </CardHeader>
              <CardContent className="space-y-6 text-sm leading-6">
                <div className="prose prose-sm max-w-none">
                  <h3>1. 项目背景（宏观大势）</h3>
                  <p>全球金融正处于百年未有之大变局：</p>
                  <ul>
                    <li>美元霸权衰退：布雷顿森林体系正在崩解，世界寻求新的信任锚点。</li>
                    <li>AI 金融崛起：AI 不再只是工具，而是文明级力量，正在重写资本流动与价值创造逻辑。</li>
                    <li>多极化格局：SWIFT 制裁、稳定币扩张、区域结算体系，让全球进入数字化多极时代。</li>
                  </ul>
                  <p>👉 USDV = 站在大势之上的金融新物种，不是产品，而是文明的跃迁。</p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Additional sections would continue similarly... */}
        </div>
      </main>
    </div>
  );
}
