import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bot, TrendingUp, Zap, Shield, ChevronDown, ChevronUp, BarChart3, ArrowRight, Twitter, Send, MessageCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PriceTicker } from "@/components/PriceTicker";
import { NewsAnnouncement } from "@/components/NewsAnnouncement";
import { MiniKChart } from "@/components/MiniKChart";
import { useI18n } from "@/hooks/useI18n";
import customerServiceAvatar from "@/assets/customer-service-avatar.png";
export function HeroSection() {
  const [showDetails, setShowDetails] = useState(false);
  const {
    t
  } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const currentLang = location.pathname.startsWith('/en') ? 'en' : 'zh';
  const strategies = [{
    icon: "⚡",
    title: t("hero.crossChainEngine.title"),
    description: t("hero.crossChainEngine.description"),
    fee: t("hero.crossChainEngine.fee"),
    color: "text-primary",
    change: "+2.4%"
  }, {
    icon: "🤖",
    title: t("hero.aiRotation.title"),
    description: t("hero.aiRotation.description"),
    fee: t("hero.aiRotation.fee"),
    color: "text-accent",
    change: "+1.8%"
  }, {
    icon: "🏦",
    title: t("hero.defiVault.title"),
    description: t("hero.defiVault.description"),
    fee: t("hero.defiVault.fee"),
    color: "text-primary",
    change: "+0.9%"
  }];
  const handleStrategyClick = (strategy: any) => {
    setShowDetails(true);
  };
  const partners = [{
    name: "FCA",
    href: "https://www.fca.org.uk/",
    logo: "/lovable-uploads/80dcc076-7def-42ea-8b13-59ec9e20fd9d.png",
    tagline: t('partners.fca')
  }, {
    name: "Autism Partnership",
    href: "https://autismpartnership.com.hk/zh/",
    logo: "/lovable-uploads/c2f93963-a119-4398-a035-0295602b12e6.png",
    tagline: t('partners.autism')
  }, {
    name: "Tether",
    href: "https://tether.to/en/",
    logo: "/lovable-uploads/6d93f36a-01d3-4bbd-8a70-5ea5f6102b03.png",
    tagline: t('partners.tether')
  }, {
    name: "Binance",
    href: "https://binance.com",
    logo: "/lovable-uploads/a28448a3-4a4c-466d-a61f-f3435d74544c.png",
    tagline: t('partners.binance')
  }, {
    name: "Jupiter",
    href: "https://jup.ag",
    logo: "/lovable-uploads/a5ac8a2f-2dab-47d3-a9a1-5dd924cf7b1e.png",
    tagline: t('partners.jupiter')
  }, {
    name: "WLFi",
    href: "https://worldlibertyfinancial.com/",
    logo: "/lovable-uploads/10b0a1a2-b9cf-4066-921b-8de9a9a9d591.png",
    tagline: t('partners.wlfi')
  }, {
    name: "Ethena",
    href: "https://app.ethena.fi",
    logo: "/lovable-uploads/726511cc-3ffa-46da-a04e-e0ff36ef16c6.png",
    tagline: t('partners.ethena')
  }, {
    name: "TokenPocket",
    href: "https://www.tokenpocket.pro/",
    logo: "/lovable-uploads/bfa4a049-9100-45ff-b1e9-c0d01a044067.png",
    tagline: t('partners.tokenpocket')
  }, {
    name: "Bitget",
    href: "https://www.bitget.com/",
    logo: "/lovable-uploads/b4b67a76-0d73-4183-a2db-c5faa5552004.png",
    tagline: t('partners.bitget')
  }, {
    name: "Gate.io",
    href: "https://www.gate.io/",
    logo: "/lovable-uploads/4b1c2dcd-a4eb-4c22-83e4-4bf54c29b957.png",
    tagline: t('partners.gate')
  }, {
    name: "Uniswap",
    href: "https://app.uniswap.org/",
    logo: "/lovable-uploads/8d1300ec-2ed2-44f8-809c-e46e9366dff9.png",
    tagline: t('partners.uniswap')
  }, {
    name: "OpenAI",
    href: "https://openai.com/",
    logo: "/lovable-uploads/c69e71ce-69a8-4faa-a02b-6cda17287cc3.png",
    tagline: t('partners.openai')
  }, {
    name: "Monetary Authority of Singapore",
    href: "https://www.mas.gov.sg/",
    logo: "/lovable-uploads/b47700e7-2fe5-45ea-9469-0135ab829d4e.png",
    tagline: t('partners.mas')
  }, {
    name: "Samsung",
    href: "https://www.samsung.com/",
    logo: "/lovable-uploads/4e11cc4b-891e-40c8-8db9-e789b18dddcd.png",
    tagline: t('partners.samsung')
  }] as const;
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-dark">
      
      {/* Premium gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      
      
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center mb-16">

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
            {t("hero.title")}
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-4xl mx-auto animate-fade-in">
            {t("hero.subtitle")}
          </p>
          <p className="text-lg text-muted-foreground mb-6 max-w-4xl mx-auto animate-fade-in">
            {t("hero.description")}
          </p>
          <div className="max-w-5xl mx-auto mb-10">
            <PriceTicker />
          </div>
          
          <NewsAnnouncement />

          {/* Strategy Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
            {strategies.map((strategy, index) => <div key={index} className="group">
                
              </div>)}
          </div>
        </div>

        {/* Strategy Details Section */}
        {showDetails && <div className="mb-16 animate-fade-in">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">{t("hero.strategyDetails")}</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 跨链阿尔法引擎策略 */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{t("hero.crossChainEngine.title")}</h3>
                      
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm mb-4">
                    <p className="text-foreground font-medium">{t("hero.crossChainEngine.eyeTitle")}</p>
                    <p className="text-muted-foreground">
                      {t("hero.crossChainEngine.eyeDesc")}
                    </p>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                      <span>{t("hero.crossChainEngine.strategyType")}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                      <span>{t("hero.crossChainEngine.executionFreq")}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                      <span>{t("hero.crossChainEngine.riskLevel")}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <p className="font-semibold text-accent">{t("hero.crossChainEngine.advantages")}</p>
                    <div className="space-y-1 pl-4">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{t("hero.crossChainEngine.advantage1")}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{t("hero.crossChainEngine.advantage2")}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{t("hero.crossChainEngine.advantage3")}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm text-primary font-medium">
                      {t("hero.crossChainEngine.summary")}
                    </p>
                  </div>
                </Card>

                {/* AI轮动策略 */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center">
                      <Bot className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{t("hero.aiRotation.title")}</h3>
                      
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm mb-4">
                    <p className="text-foreground font-medium">{t("hero.aiRotation.brainTitle")}</p>
                    <p className="text-muted-foreground mt-2 leading-relaxed">
                      {t("hero.aiRotation.brainDesc")}
                    </p>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                      <span>{t("hero.aiRotation.assetRange")}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                      <span>{t("hero.aiRotation.rebalanceFreq")}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                      <span>{t("hero.aiRotation.riskLevel")}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <p className="font-semibold text-primary">{t("hero.aiRotation.advantages")}</p>
                    <div className="space-y-1 pl-4">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{t("hero.aiRotation.advantage1")}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{t("hero.aiRotation.advantage2")}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{t("hero.aiRotation.advantage3")}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm text-accent font-medium">
                      {t("hero.aiRotation.summary")}
                    </p>
                  </div>
                </Card>

                {/* DeFi质押策略 */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{t("hero.defiVault.title")}</h3>
                      
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm mb-4">
                    <p className="text-foreground font-medium">{t("hero.defiVault.heartTitle")}</p>
                    <p className="text-muted-foreground mt-2 leading-relaxed">
                      {t("hero.defiVault.heartDesc")}
                    </p>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                      <span>{t("hero.defiVault.strategyType")}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                      <span>{t("hero.defiVault.revenueSource")}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                      <span>{t("hero.defiVault.riskLevel")}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <p className="font-semibold text-accent">{t("hero.defiVault.advantages")}</p>
                    <div className="space-y-1 pl-4">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{t("hero.defiVault.advantage1")}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{t("hero.defiVault.advantage2")}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{t("hero.defiVault.advantage3")}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm text-primary font-medium">
                      {t("hero.defiVault.summary")}
                    </p>
                  </div>
                </Card>
              </div>

              {/* 链上清晰透明协议详情 */}
              <div className="mt-8">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold">{t("hero.transparentProtocol.title")}</h3>
                      
                    </div>
                  </div>
                  
                  <div className="space-y-4 text-sm mb-6">
                    <p className="text-foreground font-medium">{t("hero.transparentProtocol.soulTitle")}</p>
                    <p className="text-muted-foreground mt-2 leading-relaxed">
                      {t("hero.transparentProtocol.soulDesc")}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 技术内核 */}
                    <div>
                      <h4 className="font-semibold text-primary mb-4 flex items-center gap-2">
                        {t("hero.transparentProtocol.techCore")}
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                           <span className="text-muted-foreground">{t("hero.transparentProtocol.verifiableLedger")}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                           <span className="text-muted-foreground">{t("hero.transparentProtocol.smartContract")}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                           <span className="text-muted-foreground">{t("hero.transparentProtocol.realTimeAudit")}</span>
                        </div>
                      </div>
                    </div>

                    {/* 叙事高度 */}
                    <div>
                      <h4 className="font-semibold text-accent mb-4 flex items-center gap-2">
                        {t("hero.transparentProtocol.narrativeHeight")}
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                           <span className="text-muted-foreground">{t("hero.transparentProtocol.trustRedefinition")}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                           <span className="text-muted-foreground">{t("hero.transparentProtocol.transparencyStandard")}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                           <span className="text-muted-foreground">{t("hero.transparentProtocol.participatoryAudit")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  
                </Card>
              </div>

              {/* 风险提示 */}
              
            </div>
          </div>}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("hero.crossChainEngine.title")}</h3>
            
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-secondary rounded-full flex items-center justify-center">
              <Bot className="w-8 h-8 text-accent-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("hero.aiRotation.title")}</h3>
            
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("hero.defiVault.title")}</h3>
            
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-secondary rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-accent-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("hero.transparentProtocol.title")}</h3>
            
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-16 mb-12">
          <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-all duration-300 group" onClick={() => navigate(`/${currentLang}/invest`)}>
            <Bot className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
            {t("invest.charityButtonName")}
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button size="lg" variant="outline" className="border-border hover:border-primary/50 hover:bg-primary/5 backdrop-blur-sm" onClick={() => setShowDetails(!showDetails)}>
            <Shield className="w-5 h-5 mr-2" />
            {t("invest.strategyButtonName")}
            {showDetails ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
        </div>

        {/* Partners Section */}
        <div className="mt-8 max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8 text-muted-foreground">{t("hero.strategicPartners")}</h3>
          
          {/* Partner Logos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {partners.map(p => <a key={p.name} href={p.href} target="_blank" rel="noopener noreferrer" className="group">
                <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 hover:border-primary/50 hover:bg-card/80 transition-all duration-300 flex flex-col items-center justify-center h-28">
                  <img src={p.logo} alt={`${p.name} logo`} className="h-10 w-auto object-contain mb-2 group-hover:scale-105 transition-transform" loading="lazy" width={128} height={40} onError={e => {
                (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
              }} />
                  <div className="text-sm font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{p.tagline}</div>
                </div>
              </a>)}
          </div>

          {/* Social Media & Customer Service */}
          <div className="flex justify-center gap-12">
            <div className="text-center">
              <span className="text-sm text-muted-foreground mb-3 block">{t("hero.followUs")}</span>
              <div className="flex gap-4">
                
                <a href="#" className="w-12 h-12 bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg flex items-center justify-center hover:border-accent/50 hover:bg-accent/10 transition-all duration-300 group" title="Telegram">
                  <Send className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </a>
              </div>
            </div>
            
            <div className="text-center">
              <span className="text-sm text-muted-foreground mb-3 block">{t("hero.customerService")}</span>
              <div className="flex justify-center gap-4">
                <button className="group flex flex-col items-center gap-2 p-2 hover:bg-card/50 rounded-lg transition-all duration-300" title={t("hero.contactSupport")}>
                  <Avatar className="w-8 h-8 border-2 border-border/50 group-hover:border-primary/50 transition-all duration-300">
                    <AvatarImage src="/lovable-uploads/f64c75c0-6345-4c8c-b12e-10f2527d1c3f.png" alt="Telegram Support" />
                    <AvatarFallback className="bg-gradient-primary">
                      <MessageCircle className="w-5 h-5 text-primary-foreground" />
                    </AvatarFallback>
                  </Avatar>
                </button>
                <button className="group flex flex-col items-center gap-2 p-2 hover:bg-card/50 rounded-lg transition-all duration-300" title={t("hero.contactSupport")}>
                  <Avatar className="w-8 h-8 border-2 border-border/50 group-hover:border-accent/50 transition-all duration-300">
                    <AvatarImage src="/lovable-uploads/e6bca233-40fa-44a0-bf40-dd55b080b52d.png" alt="Customer Service 2" />
                    <AvatarFallback className="bg-gradient-accent">
                      <MessageCircle className="w-5 h-5 text-accent-foreground" />
                    </AvatarFallback>
                  </Avatar>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
}