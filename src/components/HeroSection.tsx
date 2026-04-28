import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, TrendingUp, Zap, Shield, ChevronDown, ChevronUp, BarChart3, ArrowRight, Send, MessageCircle, FileText } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PriceTicker } from "@/components/PriceTicker";
import { NewsAnnouncement } from "@/components/NewsAnnouncement";
import { FeaturedPrices } from "@/components/FeaturedPrices";
import { useI18n } from "@/hooks/useI18n";
import customerServiceAvatar from "@/assets/customer-service-avatar.png";
import metamaskLogo from "@/assets/metamask-logo.png";

export function HeroSection() {
  const [showDetails, setShowDetails] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const { t, language } = useI18n();
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

  const featureCards = [
    {
      icon: <Zap className="w-8 h-8 md:w-10 md:h-10" />,
      title: t("hero.crossChainEngine.title"),
      description: t("hero.crossChainEngine.description"),
    },
    {
      icon: <Shield className="w-8 h-8 md:w-10 md:h-10" />,
      title: t("hero.transparentProtocol.title"),
      description: t("hero.transparentProtocol.direction"),
    },
    {
      icon: <BarChart3 className="w-8 h-8 md:w-10 md:h-10" />,
      title: t("hero.defiVault.title"),
      description: t("hero.defiVault.description"),
    },
    {
      icon: <Bot className="w-8 h-8 md:w-10 md:h-10" />,
      title: t("hero.aiRotation.title"),
      description: t("hero.aiRotation.description"),
    },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="relative z-10 container mx-auto px-3 sm:px-4 pt-16 pb-8 sm:pt-24 sm:pb-16">
        
        {/* ===== HERO HEADER ===== */}
        <div className="text-center mb-6 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-4 sm:mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] sm:text-xs font-medium text-primary tracking-widest uppercase">USD.ONLINE</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-3 sm:mb-6 leading-tight">
            <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              {t("hero.title")}
            </span>
          </h1>
          
          <p className="text-sm sm:text-lg md:text-xl text-muted-foreground mb-2 sm:mb-3 max-w-3xl mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </p>
          <p className="text-xs sm:text-base text-muted-foreground/80 mb-5 sm:mb-8 max-w-3xl mx-auto">
            {t("hero.description")}
          </p>

          {/* CTA Buttons - Hero position */}
          <div className="flex flex-row gap-2 sm:gap-3 justify-center mb-6 sm:mb-10">
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow transition-all duration-300 px-5 py-2.5 text-sm sm:px-8 sm:py-3 sm:text-base font-semibold sm:h-11"
              onClick={() => navigate(`/${currentLang}/invest`)}
            >
              {t("invest.charityButtonName")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              className="border-border/60 hover:border-primary/40 hover:bg-primary/5 px-5 py-2.5 text-sm sm:px-8 sm:py-3 sm:text-base sm:h-11"
              onClick={() => {
                if (!showDetails) setShowDetails(true);
                setTimeout(() => {
                  document.getElementById('strategy-details')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
            >
              {t("invest.strategyButtonName")}
            </Button>
          </div>
        </div>

        {/* ===== PRICE TICKER ===== */}
        <div className="max-w-5xl mx-auto mb-5 sm:mb-10">
          <PriceTicker />
        </div>
        
        {/* ===== FEATURED PRICES ===== */}
        <FeaturedPrices />
        
        {/* ===== NEWS + FEATURE CARDS SIDE BY SIDE ===== */}
        <div className="max-w-6xl mx-auto -mt-1 sm:-mt-2 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
            {/* Left: NEWS */}
            <div className="lg:col-span-1">
              <NewsAnnouncement />
            </div>

            {/* Right: Feature Cards 2x2 */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-2 sm:gap-4">
              {featureCards.map((card, index) => (
                <div
                  key={index}
                  className="group relative rounded-xl border border-dashed border-border/50 bg-card/30 backdrop-blur-sm p-3 sm:p-6 md:p-8 hover:border-primary/40 hover:bg-card/50 transition-all duration-300"
                >
                  <div className="w-7 h-7 mb-2 sm:w-10 sm:h-10 md:w-12 md:h-12 sm:mb-4 md:mb-5 text-primary">
                    {card.icon}
                  </div>
                  <h3 className="text-xs sm:text-base md:text-lg font-bold text-foreground">{card.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== ABOUT US VIDEO ===== */}
        <div className="max-w-3xl mx-auto mb-5 sm:mb-10">
          <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-3 sm:p-5 shadow-card">
            <h2 className="text-sm sm:text-xl font-bold tracking-wide text-primary mb-2 sm:mb-4 text-left uppercase">About us</h2>
            <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/hYFWCQ-rtcw"
                title="About usd.online"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        {/* ===== STRATEGY DETAILS TOGGLE ===== */}
        <div className="flex justify-center mb-5 sm:mb-8">
          <Button
            variant="outline"
            size="sm"
            className="border-border/60 hover:border-primary/40 hover:bg-primary/5 text-sm sm:text-base sm:h-10 sm:px-4"
            onClick={() => setShowDetails(!showDetails)}
          >
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
            {t("invest.strategyButtonName")}
            {showDetails ? <ChevronUp className="w-4 h-4 ml-1.5 sm:ml-2" /> : <ChevronDown className="w-4 h-4 ml-1.5 sm:ml-2" />}
          </Button>
        </div>

        {/* Strategy Details Section */}
        {showDetails && (
          <div id="strategy-details" className="mb-8 sm:mb-16 animate-fade-in">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-xl sm:text-3xl font-bold text-center mb-4 sm:mb-8">{t("hero.strategyDetails")}</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
                {/* 跨链阿尔法引擎策略 */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/40 p-3 sm:p-6 lg:col-span-3">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold">{t("hero.crossChainEngine.title")}</h3>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-6 bg-primary/5 p-4 rounded-lg border border-primary/10">
                    <p className="text-foreground">{t("hero.crossChainEngine.positioning")}</p>
                    <p className="text-foreground">{t("hero.crossChainEngine.execution")}</p>
                    <p className="text-foreground">{t("hero.crossChainEngine.risk")}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-3 text-sm">
                      <p className="font-bold text-primary text-base">{t("hero.crossChainEngine.strategyA")}</p>
                      <div className="space-y-2 pl-2">
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyALogic")}</p>
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyAMeans")}</p>
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyAKPI")}</p>
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyARisk")}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <p className="font-bold text-primary text-base">{t("hero.crossChainEngine.strategyB")}</p>
                      <div className="space-y-2 pl-2">
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyBLogic")}</p>
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyBMeans")}</p>
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyBKPI")}</p>
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyBRisk")}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <p className="font-bold text-primary text-base">{t("hero.crossChainEngine.strategyC")}</p>
                      <div className="space-y-2 pl-2">
                        <p className="text-muted-foreground">{t("hero.crossChainEngine.strategyCTarget")}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-accent/5 rounded-lg border border-accent/10 space-y-4 text-sm">
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
                    
                    <div>
                      <p className="font-semibold text-accent mb-2">{t("hero.crossChainEngine.strategyCIndicatorsTitle")}</p>
                      <div className="pl-4 space-y-1">
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyCIndicators1")}</p>
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyCIndicators2")}</p>
                        <p className="text-muted-foreground"><span className="text-foreground">• </span>{t("hero.crossChainEngine.strategyCIndicators3")}</p>
                      </div>
                    </div>
                    
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

                {/* AI轮动策略 */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/40 p-3 sm:p-6 lg:col-span-3">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Bot className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold">{t("hero.aiRotation.title")}</h3>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-6 bg-accent/5 p-4 rounded-lg border border-accent/10">
                    <p className="text-foreground">{t("hero.aiRotation.positioning")}</p>
                    <p className="text-foreground">{t("hero.aiRotation.assetRange")}</p>
                    <p className="text-foreground">{t("hero.aiRotation.risk")}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

                {/* DeFi质押策略 */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/40 p-3 sm:p-6 lg:col-span-3">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold">{t("hero.defiVault.title")}</h3>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6">{t("hero.defiVault.description")}</p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3 p-4 rounded-lg bg-background/50 border border-border/30">
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

                    <div className="space-y-3 p-4 rounded-lg bg-background/50 border border-border/30">
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

                  <div className="space-y-2 p-4 rounded-lg bg-background/50 border border-border/30 mb-4">
                    <p className="text-sm font-semibold text-foreground">{t("hero.defiVault.allocation.title")}</p>
                    <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
                      <li>{t("hero.defiVault.allocation.point1")}</li>
                      <li>{t("hero.defiVault.allocation.point2")}</li>
                      <li>{t("hero.defiVault.allocation.point3")}</li>
                    </ul>
                  </div>

                  <div className="space-y-2 p-4 rounded-lg bg-background/50 border border-border/30 mb-4">
                    <p className="text-sm font-semibold text-foreground">{t("hero.defiVault.transparency.title")}</p>
                    <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
                      <li>{t("hero.defiVault.transparency.daily")}</li>
                      <li>{t("hero.defiVault.transparency.weekly")}</li>
                      <li>{t("hero.defiVault.transparency.monthly")}</li>
                    </ul>
                  </div>

                  <p className="text-xs text-muted-foreground/70 italic">
                    {t("hero.defiVault.disclaimer")}
                  </p>
                </Card>
              </div>

              {/* 链上清晰透明协议详情 */}
              <div className="mt-8">
                <Card className="bg-card/50 backdrop-blur-sm border-border/40 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-accent" />
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
            </div>
          </div>
        )}

        {/* ===== PARTNERS ===== */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h3 className="text-sm font-medium text-muted-foreground tracking-widest uppercase mb-2">{t("hero.strategicPartners")}</h3>
            <div className="w-12 h-0.5 bg-primary/40 mx-auto" />
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {partners.map(p => (
              <a key={p.name} href={p.href} target="_blank" rel="noopener noreferrer" className="group">
                <div className="rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm p-2 md:p-5 hover:border-primary/30 hover:bg-card/50 transition-all duration-300 flex flex-col items-center justify-center h-20 md:h-28">
                  <img 
                    src={p.logo} 
                    alt={`${p.name} logo`} 
                    className="h-6 md:h-10 w-auto object-contain mb-1 md:mb-2 group-hover:scale-105 transition-transform" 
                    loading="lazy" 
                    width={128} 
                    height={40} 
                    onError={e => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }} 
                  />
                  <div className="text-sm font-semibold">{p.name}</div>
                  <div className="text-[10px] md:text-xs text-muted-foreground mt-1 text-center leading-tight">{p.tagline}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ===== TEAM ===== */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="flex flex-col items-center mb-8">
            <h3 className="text-sm font-medium text-muted-foreground tracking-widest uppercase mb-2">{t("hero.teamIntro.title")}</h3>
            <div className="w-12 h-0.5 bg-primary/40 mx-auto mb-6" />
            <Button
              variant="outline"
              onClick={() => setShowTeam(!showTeam)}
              className="flex items-center gap-2 border-border/60 hover:border-primary/40"
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
              <Card className="bg-card/40 backdrop-blur-sm border-border/30 hover:border-primary/30 transition-all duration-300 lg:col-span-3">
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

              <Card className="bg-card/40 backdrop-blur-sm border-border/30 hover:border-primary/30 transition-all duration-300 lg:col-span-3">
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

              <Card className="bg-card/40 backdrop-blur-sm border-border/30 hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-primary mb-1">{t("hero.teamIntro.members.michael.name")}</h4>
                    <p className="text-sm font-semibold text-foreground mb-3">{t("hero.teamIntro.members.michael.title")}</p>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <p className="flex items-start gap-2"><span className="text-primary">•</span><span>{t("hero.teamIntro.members.michael.point1")}</span></p>
                    <p className="flex items-start gap-2"><span className="text-primary">•</span><span>{t("hero.teamIntro.members.michael.point2")}</span></p>
                    <p className="flex items-start gap-2"><span className="text-primary">•</span><span>{t("hero.teamIntro.members.michael.point3")}</span></p>
                  </div>
                  <p className="text-sm text-muted-foreground italic">{t("hero.teamIntro.members.michael.education")}</p>
                </CardContent>
              </Card>

              <Card className="bg-card/40 backdrop-blur-sm border-border/30 hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-primary mb-1">{t("hero.teamIntro.members.mouad.name")}</h4>
                    <p className="text-sm font-semibold text-foreground mb-2">{t("hero.teamIntro.members.mouad.title")}</p>
                    <p className="text-xs text-muted-foreground italic mb-3">{t("hero.teamIntro.members.mouad.subtitle")}</p>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-start gap-2"><span className="text-primary">•</span><span>{t("hero.teamIntro.members.mouad.point1")}</span></p>
                    <p className="flex items-start gap-2"><span className="text-primary">•</span><span>{t("hero.teamIntro.members.mouad.point2")}</span></p>
                    <p className="flex items-start gap-2"><span className="text-primary">•</span><span>{t("hero.teamIntro.members.mouad.point3")}</span></p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/40 backdrop-blur-sm border-border/30 hover:border-primary/30 transition-all duration-300">
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

        {/* ===== FOOTER SOCIAL ===== */}
        <div className="max-w-6xl mx-auto">
          <div className="rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm p-8">
            <div className="flex justify-center gap-12">
              <div className="text-center">
                <span className="text-sm text-muted-foreground mb-3 block">{t("hero.followUs")}</span>
                <div className="flex gap-4">
                  <a href="https://t.me/OfficialUSDONLINE" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-lg border border-border/40 bg-card/50 flex items-center justify-center hover:border-accent/50 hover:bg-accent/10 transition-all duration-300 group" title="Telegram">
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
                    <Avatar className="w-8 h-8 border-2 border-border/40 group-hover:border-primary/50 transition-all duration-300">
                      <AvatarImage src="/lovable-uploads/bf7773a4-a71f-4db0-b011-a29216ca2485.png" alt="Telegram Customer Service" />
                      <AvatarFallback className="bg-primary/10">
                        <MessageCircle className="w-5 h-5 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </div>
              </div>

              <div className="text-center">
                <span className="text-sm text-muted-foreground mb-3 block">X</span>
                <div className="flex justify-center gap-4">
                  <a 
                    href="https://x.com/ONLINE_USD" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-lg border border-border/40 bg-card/50 flex items-center justify-center hover:border-accent/50 hover:bg-accent/10 transition-all duration-300 group"
                    title="X (Twitter)"
                  >
                    <img src="/lovable-uploads/x-logo.png" alt="X" className="w-6 h-6 rounded" />
                  </a>
                </div>
              </div>

              <div className="text-center">
                <span className="text-sm text-muted-foreground mb-3 block">审计报告</span>
                <div className="flex justify-center gap-4">
                  <Link
                    to={`/${language || 'zh'}/audit`}
                    className="w-12 h-12 rounded-lg border border-border/40 bg-card/50 flex items-center justify-center hover:border-accent/50 hover:bg-accent/10 transition-all duration-300 group"
                    title="LockStaking V3 审计报告"
                  >
                    <FileText className="w-6 h-6 text-accent" />
                  </Link>
                </div>
              </div>
            </div>

            {/* System status bar */}
            <div className="mt-8 pt-6 border-t border-border/20 flex items-center justify-between text-xs text-muted-foreground/60">
              <span>© 2024 USD.ONLINE Moral Alpha 3.0</span>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span>System Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
