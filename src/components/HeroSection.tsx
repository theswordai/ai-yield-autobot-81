import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, TrendingUp, Zap, Shield, ChevronDown, ChevronUp, BarChart3, ArrowRight, Twitter, Send, MessageCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PriceTicker } from "@/components/PriceTicker";
import { NewsAnnouncement } from "@/components/NewsAnnouncement";
import { MiniKChart } from "@/components/MiniKChart";
import { FeaturedPrices } from "@/components/FeaturedPrices";
import { useI18n } from "@/hooks/useI18n";
import customerServiceAvatar from "@/assets/customer-service-avatar.png";
import metamaskLogo from "@/assets/metamask-logo.png";
export function HeroSection() {
  const [showDetails, setShowDetails] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const { t } = useI18n();
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
    name: "MetaMask",
    href: "https://metamask.io/",
    logo: metamaskLogo,
    tagline: t('partners.metamask')
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
  }, {
    name: "OKX Wallet",
    href: "https://web3.okx.com",
    logo: "/lovable-uploads/okx-wallet-logo.png",
    tagline: t('partners.okxwallet')
  }, {
    name: "Jupiter",
    href: "https://jup.ag",
    logo: "/lovable-uploads/a5ac8a2f-2dab-47d3-a9a1-5dd924cf7b1e.png",
    tagline: t('partners.jupiter')
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
          
          <FeaturedPrices />
          
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
                {/* 跨链阿尔法引擎策略 - 完整版 */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-6 lg:col-span-3">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold">{t("hero.crossChainEngine.title")}</h3>
                    </div>
                  </div>
                  
                  {/* 定位、执行、风险 */}
                  <div className="space-y-2 text-sm mb-6 bg-primary/5 p-4 rounded-lg">
                    <p className="text-foreground">{t("hero.crossChainEngine.positioning")}</p>
                    <p className="text-foreground">{t("hero.crossChainEngine.execution")}</p>
                    <p className="text-foreground">{t("hero.crossChainEngine.risk")}</p>
                  </div>
                  
                  {/* 三个子策略 */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* A. DEX 搬砖 */}
                    <div className="space-y-3 text-sm">
                      <p className="font-bold text-primary text-base">{t("hero.crossChainEngine.strategyA")}</p>
                      <div className="space-y-2 pl-2">
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyALogic")}</p>
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyAMeans")}</p>
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyAKPI")}</p>
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyARisk")}</p>
                      </div>
                    </div>
                    
                    {/* B. 低风险 MEV */}
                    <div className="space-y-3 text-sm">
                      <p className="font-bold text-primary text-base">{t("hero.crossChainEngine.strategyB")}</p>
                      <div className="space-y-2 pl-2">
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyBLogic")}</p>
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyBMeans")}</p>
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyBKPI")}</p>
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyBRisk")}</p>
                      </div>
                    </div>
                    
                    {/* C. 新币狙击 */}
                    <div className="space-y-3 text-sm">
                      <p className="font-bold text-primary text-base">{t("hero.crossChainEngine.strategyC")}</p>
                      <div className="space-y-2 pl-2">
                        <p className="text-muted-foreground">{t("hero.crossChainEngine.strategyCTarget")}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* C策略详细内容 */}
                  <div className="mt-6 p-4 bg-accent/5 rounded-lg space-y-4 text-sm">
                    {/* 1) 发现 */}
                    <div>
                      <p className="font-semibold text-accent mb-2">{t("hero.crossChainEngine.strategyCDiscovery")}</p>
                      <div className="pl-4 space-y-2">
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyCSignal")}</p>
                        <div>
                          <p className="text-foreground mb-1">• {t("hero.crossChainEngine.strategyCFilterTitle")}</p>
                          <div className="pl-6 space-y-1">
                            <p className="text-muted-foreground">• {t("hero.crossChainEngine.strategyCFilter1")}</p>
                            <p className="text-muted-foreground">• {t("hero.crossChainEngine.strategyCFilter2")}</p>
                            <p className="text-muted-foreground">• {t("hero.crossChainEngine.strategyCFilter3")}</p>
                            <p className="text-muted-foreground">• {t("hero.crossChainEngine.strategyCFilter4")}</p>
                          </div>
                        </div>
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.streamegyCFilterSoft")}</p>
                      </div>
                    </div>
                    
                    {/* 2) 首次建仓 */}
                    <div>
                      <p className="font-semibold text-accent mb-2">{t("hero.crossChainEngine.strategyCSniping")}</p>
                      <div className="pl-4 space-y-2">
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyCFunding")}</p>
                        <div>
                          <p className="text-foreground mb-1">• {t("hero.crossChainEngine.strategyCMatchTitle")}</p>
                          <div className="pl-6 space-y-1">
                            <p className="text-muted-foreground">• {t("hero.crossChainEngine.strategyCMatch1")}</p>
                            <p className="text-muted-foreground">• {t("hero.crossChainEngine.strategyCMatch2")}</p>
                            <p className="text-muted-foreground">• {t("hero.crossChainEngine.strategyCMatch3")}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-foreground mb-1">• {t("hero.crossChainEngine.strategyCExitTitle")}</p>
                          <div className="pl-6 space-y-1">
                            <p className="text-muted-foreground">• {t("hero.crossChainEngine.strategyCExit1")}</p>
                            <p className="text-muted-foreground">• {t("hero.crossChainEngine.strategyCExit2")}</p>
                            <p className="text-muted-foreground">• {t("hero.crossChainEngine.strategyCExit3")}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 3) 指标与看板 */}
                    <div>
                      <p className="font-semibold text-accent mb-2">{t("hero.crossChainEngine.strategyCIndicatorsTitle")}</p>
                      <div className="pl-4 space-y-1">
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyCIndicators1")}</p>
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyCIndicators2")}</p>
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyCIndicators3")}</p>
                      </div>
                    </div>
                    
                    {/* 4) 风控护栏 */}
                    <div>
                      <p className="font-semibold text-accent mb-2">{t("hero.crossChainEngine.strategyCRiskTitle")}</p>
                      <div className="pl-4 space-y-1">
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyCRisk1")}</p>
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyCRisk2")}</p>
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyCRisk3")}</p>
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyCRisk4")}</p>
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyCRisk5")}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* AI轮动策略 - 完整版 */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-6 lg:col-span-3">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center">
                      <Bot className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold">{t("hero.aiRotation.title")}</h3>
                    </div>
                  </div>
                  
                  {/* 定位、资产范围、风险 */}
                  <div className="space-y-2 text-sm mb-6 bg-accent/5 p-4 rounded-lg">
                    <p className="text-foreground">{t("hero.aiRotation.positioning")}</p>
                    <p className="text-foreground">{t("hero.aiRotation.assetRange")}</p>
                    <p className="text-foreground">{t("hero.aiRotation.risk")}</p>
                  </div>
                  
                  {/* 三个子策略 */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* A｜主流币网格交易 */}
                    <div className="space-y-3 text-sm">
                      <p className="font-bold text-accent text-base">{t("hero.aiRotation.strategyA")}</p>
                      <p className="text-muted-foreground">{t("hero.aiRotation.strategyALogic")}</p>
                      
                      <div className="space-y-2">
                        <p className="font-semibold text-accent text-sm">{t("hero.aiRotation.strategyAExecutionTitle")}</p>
                        <div className="pl-2 space-y-1">
                          <p className="text-xs text-muted-foreground"><span className="text-foreground">• </span>{t("hero.aiRotation.strategyAExecution1")}</p>
                          <p className="text-xs text-muted-foreground"><span className="text-foreground">• </span>{t("hero.aiRotation.strategyAExecution2")}</p>
                          <p className="text-xs text-muted-foreground"><span className="text-foreground">• </span>{t("hero.aiRotation.strategyAExecution3")}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="font-semibold text-accent text-sm">{t("hero.aiRotation.strategyARiskTitle")}</p>
                        <div className="pl-2 space-y-1">
                          <p className="text-xs text-muted-foreground"><span className="text-foreground">• </span>{t("hero.aiRotation.strategyARisk1")}</p>
                          <p className="text-xs text-muted-foreground"><span className="text-foreground">• </span>{t("hero.aiRotation.strategyARisk2")}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="font-semibold text-accent text-sm">{t("hero.aiRotation.strategyAIndicatorsTitle")}</p>
                        <div className="pl-2">
                          <p className="text-xs text-muted-foreground"><span className="text-foreground">• </span>{t("hero.aiRotation.strategyAIndicators")}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* B｜资金费率套利 */}
                    <div className="space-y-3 text-sm">
                      <p className="font-bold text-accent text-base">{t("hero.aiRotation.strategyB")}</p>
                      <p className="text-muted-foreground">{t("hero.aiRotation.strategyBLogic")}</p>
                      <p className="text-muted-foreground">{t("hero.aiRotation.strategyBScenario")}</p>
                      
                      <div className="space-y-2">
                        <p className="font-semibold text-accent text-sm">{t("hero.aiRotation.strategyBExecutionTitle")}</p>
                        <div className="pl-2 space-y-1">
                          <p className="text-xs text-muted-foreground"><span className="text-foreground">• </span>{t("hero.aiRotation.strategyBExecution1")}</p>
                          <p className="text-xs text-muted-foreground"><span className="text-foreground">• </span>{t("hero.aiRotation.strategyBExecution2")}</p>
                          <p className="text-xs text-muted-foreground"><span className="text-foreground">• </span>{t("hero.aiRotation.strategyBExecution3")}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="font-semibold text-accent text-sm">{t("hero.aiRotation.strategyBRiskTitle")}</p>
                        <div className="pl-2 space-y-1">
                          <p className="text-xs text-muted-foreground"><span className="text-foreground">• </span>{t("hero.aiRotation.strategyBRisk1")}</p>
                          <p className="text-xs text-muted-foreground"><span className="text-foreground">• </span>{t("hero.aiRotation.strategyBRisk2")}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="font-semibold text-accent text-sm">{t("hero.aiRotation.strategyBIndicatorsTitle")}</p>
                        <div className="pl-2">
                          <p className="text-xs text-muted-foreground"><span className="text-foreground">• </span>{t("hero.aiRotation.strategyBIndicators")}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* C｜低杠杆合约 */}
                    <div className="space-y-3 text-sm">
                      <p className="font-bold text-accent text-base">{t("hero.aiRotation.strategyC")}</p>
                      <p className="text-muted-foreground">{t("hero.aiRotation.strategyCLogic")}</p>
                      
                      <div className="space-y-2">
                        <p className="font-semibold text-accent text-sm">{t("hero.aiRotation.strategyCExecutionTitle")}</p>
                        <div className="pl-2 space-y-1">
                          <p className="text-xs text-muted-foreground"><span className="text-foreground">• </span>{t("hero.aiRotation.strategyCExecution1")}</p>
                          <p className="text-xs text-muted-foreground"><span className="text-foreground">• </span>{t("hero.aiRotation.strategyCExecution2")}</p>
                          <p className="text-xs text-muted-foreground"><span className="text-foreground">• </span>{t("hero.aiRotation.strategyCExecution3")}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="font-semibold text-accent text-sm">{t("hero.aiRotation.strategyCRiskTitle")}</p>
                        <div className="pl-2 space-y-1">
                          <p className="text-xs text-muted-foreground"><span className="text-foreground">• </span>{t("hero.aiRotation.strategyCRisk1")}</p>
                          <p className="text-xs text-muted-foreground"><span className="text-foreground">• </span>{t("hero.aiRotation.strategyCRisk2")}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="font-semibold text-accent text-sm">{t("hero.aiRotation.strategyCIndicatorsTitle")}</p>
                        <div className="pl-2">
                          <p className="text-xs text-muted-foreground"><span className="text-foreground">• </span>{t("hero.aiRotation.strategyCIndicators")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* DeFi质押策略 - 完整版 */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-6 lg:col-span-3">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold">{t("hero.defiVault.title")}</h3>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6">{t("hero.defiVault.description")}</p>
                  
                  {/* 两个子策略并排 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* A. 利率与点数挖矿 */}
                    <div className="space-y-3 p-4 rounded-lg bg-background/50 border border-border/50">
                      <h4 className="font-bold text-lg text-primary">{t("hero.defiVault.strategyA.title")}</h4>
                      <p className="text-sm text-muted-foreground">{t("hero.defiVault.strategyA.logic")}</p>
                      <p className="text-sm text-muted-foreground">{t("hero.defiVault.strategyA.assets")}</p>
                      <p className="text-sm text-muted-foreground">{t("hero.defiVault.strategyA.protocols")}</p>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-foreground">{t("hero.defiVault.strategyA.execution")}</p>
                        <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
                          <li>{t("hero.defiVault.strategyA.executionPoints.point1")}</li>
                          <li>{t("hero.defiVault.strategyA.executionPoints.point2")}</li>
                          <li>{t("hero.defiVault.strategyA.executionPoints.point3")}</li>
                          <li>{t("hero.defiVault.strategyA.executionPoints.point4")}</li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-foreground">{t("hero.defiVault.strategyA.kpi")}</p>
                        <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
                          <li>{t("hero.defiVault.strategyA.kpiPoints.point1")}</li>
                          <li>{t("hero.defiVault.strategyA.kpiPoints.point2")}</li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-foreground">{t("hero.defiVault.strategyA.riskControl")}</p>
                        <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
                          <li>{t("hero.defiVault.strategyA.riskPoints.point1")}</li>
                          <li>{t("hero.defiVault.strategyA.riskPoints.point2")}</li>
                          <li>{t("hero.defiVault.strategyA.riskPoints.point3")}</li>
                        </ul>
                      </div>
                    </div>

                    {/* B. 稳定币 AMM 做市 */}
                    <div className="space-y-3 p-4 rounded-lg bg-background/50 border border-border/50">
                      <h4 className="font-bold text-lg text-primary">{t("hero.defiVault.strategyB.title")}</h4>
                      <p className="text-sm text-muted-foreground">{t("hero.defiVault.strategyB.logic")}</p>
                      <p className="text-sm text-muted-foreground">{t("hero.defiVault.strategyB.protocols")}</p>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-foreground">{t("hero.defiVault.strategyB.execution")}</p>
                        <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
                          <li>{t("hero.defiVault.strategyB.executionPoints.point1")}</li>
                          <li>{t("hero.defiVault.strategyB.executionPoints.point2")}</li>
                          <li>{t("hero.defiVault.strategyB.executionPoints.point3")}</li>
                          <li>{t("hero.defiVault.strategyB.executionPoints.point4")}</li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-foreground">{t("hero.defiVault.strategyB.kpi")}</p>
                        <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
                          <li>{t("hero.defiVault.strategyB.kpiPoints.point1")}</li>
                          <li>{t("hero.defiVault.strategyB.kpiPoints.point2")}</li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-foreground">{t("hero.defiVault.strategyB.riskControl")}</p>
                        <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
                          <li>{t("hero.defiVault.strategyB.riskPoints.point1")}</li>
                          <li>{t("hero.defiVault.strategyB.riskPoints.point2")}</li>
                          <li>{t("hero.defiVault.strategyB.riskPoints.point3")}</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 资金配比 */}
                  <div className="space-y-2 p-4 rounded-lg bg-background/50 border border-border/50 mb-4">
                    <p className="text-sm font-semibold text-foreground">{t("hero.defiVault.allocation.title")}</p>
                    <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
                      <li>{t("hero.defiVault.allocation.point1")}</li>
                      <li>{t("hero.defiVault.allocation.point2")}</li>
                      <li>{t("hero.defiVault.allocation.point3")}</li>
                    </ul>
                  </div>

                  {/* 透明度 */}
                  <div className="space-y-2 p-4 rounded-lg bg-background/50 border border-border/50 mb-4">
                    <p className="text-sm font-semibold text-foreground">{t("hero.defiVault.transparency.title")}</p>
                    <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
                      <li>{t("hero.defiVault.transparency.daily")}</li>
                      <li>{t("hero.defiVault.transparency.weekly")}</li>
                      <li>{t("hero.defiVault.transparency.monthly")}</li>
                    </ul>
                  </div>

                  {/* 免责声明 */}
                  <p className="text-xs text-muted-foreground/70 italic">
                    {t("hero.defiVault.disclaimer")}
                  </p>
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
                    <p className="text-muted-foreground leading-relaxed">
                      {t("hero.transparentProtocol.direction")}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 准入标准 */}
                    <div>
                      <h4 className="font-semibold text-primary mb-4">
                        {t("hero.transparentProtocol.admissionStandards")}
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{t("hero.transparentProtocol.admissionContract")}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{t("hero.transparentProtocol.admissionRules")}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{t("hero.transparentProtocol.admissionLP")}</span>
                        </div>
                      </div>
                    </div>

                    {/* 资金与仓位 */}
                    <div>
                      <h4 className="font-semibold text-accent mb-4">
                        {t("hero.transparentProtocol.fundingPosition")}
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{t("hero.transparentProtocol.fundingSingle")}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{t("hero.transparentProtocol.fundingDaily")}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{t("hero.transparentProtocol.fundingSector")}</span>
                        </div>
                      </div>
                    </div>

                    {/* 透明度与披露 */}
                    <div>
                      <h4 className="font-semibold text-primary mb-4">
                        {t("hero.transparentProtocol.transparencyDisclosure")}
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{t("hero.transparentProtocol.transparencyAddressBook")}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{t("hero.transparentProtocol.transparencyDashboard")}</span>
                        </div>
                      </div>
                    </div>

                    {/* 风控与边界 */}
                    <div>
                      <h4 className="font-semibold text-accent mb-4">
                        {t("hero.transparentProtocol.riskControlBoundary")}
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{t("hero.transparentProtocol.riskTrap")}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{t("hero.transparentProtocol.riskNoPromise")}</span>
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
          <Button 
            size="lg" 
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300 group"
            onClick={() => navigate(`/${currentLang}/invest`)}
          >
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

          {/* Team Introduction Section */}
          <div className="mt-16 mb-12">
            <div className="flex flex-col items-center mb-8">
              <h3 className="text-2xl font-bold text-center mb-4 text-muted-foreground">{t("hero.teamIntro.title")}</h3>
              <Button
                variant="outline"
                onClick={() => setShowTeam(!showTeam)}
                className="flex items-center gap-2"
              >
                {showTeam ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    <span>{t("hero.teamIntro.collapse")}</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    <span>{t("hero.teamIntro.expand")}</span>
                  </>
                )}
              </Button>
            </div>
            
            {showTeam && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {/* CC - Founder */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 lg:col-span-3">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-primary mb-1">{t("hero.teamIntro.members.cc.name")}</h4>
                    <p className="text-sm font-semibold text-foreground mb-2">{t("hero.teamIntro.members.cc.title")}</p>
                    <p className="text-xs text-muted-foreground italic mb-3">{t("hero.teamIntro.members.cc.subtitle")}</p>
                  </div>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>{t("hero.teamIntro.members.cc.bio")}</p>
                    <p>{t("hero.teamIntro.members.cc.experience")}</p>
                    <p>{t("hero.teamIntro.members.cc.education")}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Mr.Lee */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 lg:col-span-3">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-primary mb-1">{t("hero.teamIntro.members.lee.name")}</h4>
                    <p className="text-sm font-semibold text-foreground mb-3">{t("hero.teamIntro.members.lee.title")}</p>
                  </div>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>{t("hero.teamIntro.members.lee.bio")}</p>
                    <p>{t("hero.teamIntro.members.lee.career")}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Mr.Micheal, Mouad, Omar - In 3 columns */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-primary mb-1">{t("hero.teamIntro.members.michael.name")}</h4>
                    <p className="text-sm font-semibold text-foreground mb-3">{t("hero.teamIntro.members.michael.title")}</p>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <p className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t("hero.teamIntro.members.michael.point1")}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t("hero.teamIntro.members.michael.point2")}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t("hero.teamIntro.members.michael.point3")}</span>
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground italic">{t("hero.teamIntro.members.michael.education")}</p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-primary mb-1">{t("hero.teamIntro.members.mouad.name")}</h4>
                    <p className="text-sm font-semibold text-foreground mb-2">{t("hero.teamIntro.members.mouad.title")}</p>
                    <p className="text-xs text-muted-foreground italic mb-3">{t("hero.teamIntro.members.mouad.subtitle")}</p>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t("hero.teamIntro.members.mouad.point1")}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t("hero.teamIntro.members.mouad.point2")}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t("hero.teamIntro.members.mouad.point3")}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-primary mb-1">{t("hero.teamIntro.members.omar.name")}</h4>
                    <p className="text-sm font-semibold text-foreground mb-2">{t("hero.teamIntro.members.omar.title")}</p>
                    <p className="text-xs text-muted-foreground italic mb-3">{t("hero.teamIntro.members.omar.subtitle")}</p>
                  </div>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>{t("hero.teamIntro.members.omar.bio")}</p>
                    <p>{t("hero.teamIntro.members.omar.experience")}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}
          </div>

          {/* Social Media & Customer Service */}
          <div className="flex justify-center gap-12">
            <div className="text-center">
              <span className="text-sm text-muted-foreground mb-3 block">{t("hero.followUs")}</span>
              <div className="flex gap-4">
                <a href="https://t.me/OfficialUSDONLINE" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg flex items-center justify-center hover:border-accent/50 hover:bg-accent/10 transition-all duration-300 group" title="Telegram">
                  <Send className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </a>
              </div>
            </div>
            
            <div className="text-center">
              <span className="text-sm text-muted-foreground mb-3 block">{t("hero.customerService")}</span>
              <div className="flex justify-center gap-4">
                <button 
                  className="group flex flex-col items-center gap-2 p-2 hover:bg-card/50 rounded-lg transition-all duration-300" 
                  title={t("hero.contactSupport")}
                  onClick={() => window.open('https://t.me/usdvservice', '_blank')}
                >
                  <Avatar className="w-8 h-8 border-2 border-border/50 group-hover:border-primary/50 transition-all duration-300">
                    <AvatarImage src="/lovable-uploads/bf7773a4-a71f-4db0-b011-a29216ca2485.png" alt="Telegram Customer Service" />
                    <AvatarFallback className="bg-gradient-primary">
                      <MessageCircle className="w-5 h-5 text-primary-foreground" />
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