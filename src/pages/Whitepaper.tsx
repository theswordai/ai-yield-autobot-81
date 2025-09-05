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
                <CardTitle className="text-2xl">{t('newWhitepaper.usdOnline.title')}</CardTitle>
                <p className="text-lg text-muted-foreground">{t('newWhitepaper.usdOnline.subtitle')}</p>
                <p className="text-center font-bold text-primary">{t('newWhitepaper.usdOnline.motto')}</p>
              </CardHeader>
              <CardContent className="space-y-6 text-sm leading-6">
                <div className="prose prose-sm max-w-none">
                  <h3>{t('newWhitepaper.usdOnline.preface.title')}</h3>
                  <p>{t('newWhitepaper.usdOnline.preface.content1')}</p>
                  <p>{t('newWhitepaper.usdOnline.preface.content2')}</p>
                  <p><strong>{t('newWhitepaper.usdOnline.preface.vision')}</strong><br/>{t('newWhitepaper.usdOnline.preface.visionDesc')}</p>
                  
                  <h3>{t('newWhitepaper.usdOnline.marketPains.title')}</h3>
                  <h4>{t('newWhitepaper.usdOnline.marketPains.traditional.title')}</h4>
                  <ul>
                    <li>{t('newWhitepaper.usdOnline.marketPains.traditional.point1')}</li>
                    <li>{t('newWhitepaper.usdOnline.marketPains.traditional.point2')}</li>
                  </ul>
                  
                  <h4>{t('newWhitepaper.usdOnline.marketPains.crypto.title')}</h4>
                  <ul>
                    <li>{t('newWhitepaper.usdOnline.marketPains.crypto.point1')}</li>
                    <li>{t('newWhitepaper.usdOnline.marketPains.crypto.point2')}</li>
                  </ul>
                  
                  <h4>{t('newWhitepaper.usdOnline.marketPains.charity.title')}</h4>
                  <ul>
                    <li>{t('newWhitepaper.usdOnline.marketPains.charity.point1')}</li>
                    <li>{t('newWhitepaper.usdOnline.marketPains.charity.point2')}</li>
                  </ul>
                  
                  <p>{t('newWhitepaper.usdOnline.marketPains.conclusion')}</p>

                  <h3>{t('newWhitepaper.usdOnline.techMoat.title')}</h3>
                  <p>{t('newWhitepaper.usdOnline.techMoat.description')}</p>
                  
                  <h4>{t('newWhitepaper.usdOnline.techMoat.aiEngine.title')}</h4>
                  <ul>
                    <li>{t('newWhitepaper.usdOnline.techMoat.aiEngine.point1')}</li>
                    <li>{t('newWhitepaper.usdOnline.techMoat.aiEngine.point2')}</li>
                    <li>{t('newWhitepaper.usdOnline.techMoat.aiEngine.point3')}</li>
                  </ul>
                  <p>{t('newWhitepaper.usdOnline.techMoat.aiEngine.logic')}</p>

                  <h4>{t('newWhitepaper.usdOnline.techMoat.aiRotation.title')}</h4>
                  <ul>
                    <li>{t('newWhitepaper.usdOnline.techMoat.aiRotation.point1')}</li>
                    <li>{t('newWhitepaper.usdOnline.techMoat.aiRotation.point2')}</li>
                    <li>{t('newWhitepaper.usdOnline.techMoat.aiRotation.point3')}</li>
                  </ul>
                  <p>{t('newWhitepaper.usdOnline.techMoat.aiRotation.logic')}</p>

                  <h4>{t('newWhitepaper.usdOnline.techMoat.liquidity.title')}</h4>
                  <ul>
                    <li>{t('newWhitepaper.usdOnline.techMoat.liquidity.point1')}</li>
                    <li>{t('newWhitepaper.usdOnline.techMoat.liquidity.point2')}</li>
                    <li>{t('newWhitepaper.usdOnline.techMoat.liquidity.point3')}</li>
                  </ul>
                  <p>{t('newWhitepaper.usdOnline.techMoat.liquidity.logic')}</p>

                  <h4>{t('newWhitepaper.usdOnline.techMoat.security.title')}</h4>
                  <ul>
                    <li>{t('newWhitepaper.usdOnline.techMoat.security.point1')}</li>
                    <li>{t('newWhitepaper.usdOnline.techMoat.security.point2')}</li>
                    <li>{t('newWhitepaper.usdOnline.techMoat.security.point3')}</li>
                  </ul>
                  <p>{t('newWhitepaper.usdOnline.techMoat.security.logic')}</p>

                  <h3>{t('newWhitepaper.usdOnline.charityIntegration.title')}</h3>
                  <p>{t('newWhitepaper.usdOnline.charityIntegration.description')}</p>
                  <ul>
                    <li>{t('newWhitepaper.usdOnline.charityIntegration.point1')}</li>
                    <li>{t('newWhitepaper.usdOnline.charityIntegration.point2')}</li>
                    <li>{t('newWhitepaper.usdOnline.charityIntegration.point3')}</li>
                  </ul>
                  <p>{t('newWhitepaper.usdOnline.charityIntegration.conclusion')}</p>

                  <h3>{t('newWhitepaper.usdOnline.growthModel.title')}</h3>
                  <ul>
                    <li>{t('newWhitepaper.usdOnline.growthModel.point1')}</li>
                    <li>{t('newWhitepaper.usdOnline.growthModel.point2')}</li>
                    <li>{t('newWhitepaper.usdOnline.growthModel.point3')}</li>
                    <li>{t('newWhitepaper.usdOnline.growthModel.point4')}</li>
                  </ul>
                  <p>{t('newWhitepaper.usdOnline.growthModel.conclusion')}</p>

                  <h3>{t('newWhitepaper.usdOnline.compliance.title')}</h3>
                  <p>{t('newWhitepaper.usdOnline.compliance.description')}</p>
                  <ul>
                    <li>{t('newWhitepaper.usdOnline.compliance.point1')}</li>
                    <li>{t('newWhitepaper.usdOnline.compliance.point2')}</li>
                    <li>{t('newWhitepaper.usdOnline.compliance.point3')}</li>
                  </ul>
                  <p>{t('newWhitepaper.usdOnline.compliance.conclusion')}</p>

                  <h3>{t('newWhitepaper.usdOnline.strategy.title')}</h3>
                  <ul>
                    <li>{t('newWhitepaper.usdOnline.strategy.point1')}</li>
                    <li>{t('newWhitepaper.usdOnline.strategy.point2')}</li>
                  </ul>
                  <p>{t('newWhitepaper.usdOnline.strategy.conclusion')}</p>

                  <h3>{t('newWhitepaper.usdOnline.conclusion.title')}</h3>
                  <p>{t('newWhitepaper.usdOnline.conclusion.content1')}</p>
                  <p>{t('newWhitepaper.usdOnline.conclusion.content2')}</p>
                  <p>{t('newWhitepaper.usdOnline.conclusion.content3')}</p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Whitepaper 2: USDV */}
          <section className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{t('newWhitepaper.usdv.title')}</CardTitle>
                <p className="text-lg text-muted-foreground">{t('newWhitepaper.usdv.subtitle')}</p>
                <p className="text-sm text-muted-foreground">{t('newWhitepaper.usdv.subsubtitle')}</p>
              </CardHeader>
              <CardContent className="space-y-6 text-sm leading-6">
                <div className="prose prose-sm max-w-none">
                  <h3>{t('newWhitepaper.usdv.background.title')}</h3>
                  <p>{t('newWhitepaper.usdv.background.description')}</p>
                  <ul>
                    <li>{t('newWhitepaper.usdv.background.point1')}</li>
                    <li>{t('newWhitepaper.usdv.background.point2')}</li>
                    <li>{t('newWhitepaper.usdv.background.point3')}</li>
                  </ul>
                  <p>{t('newWhitepaper.usdv.background.conclusion')}</p>

                  <h3>{t('newWhitepaper.usdv.marketPains.title')}</h3>
                  <ul>
                    <li>{t('newWhitepaper.usdv.marketPains.point1')}</li>
                    <li>{t('newWhitepaper.usdv.marketPains.point2')}</li>
                  </ul>
                  <p>{t('newWhitepaper.usdv.marketPains.conclusion')}</p>

                  <h3>{t('newWhitepaper.usdv.biochain.title')}</h3>
                  <p>{t('newWhitepaper.usdv.biochain.description')}</p>
                  <p>{t('newWhitepaper.usdv.biochain.sixChains')}</p>
                  <ol>
                    <li>{t('newWhitepaper.usdv.biochain.chain1')}</li>
                    <li>{t('newWhitepaper.usdv.biochain.chain2')}</li>
                    <li>{t('newWhitepaper.usdv.biochain.chain3')}</li>
                    <li>{t('newWhitepaper.usdv.biochain.chain4')}</li>
                    <li>{t('newWhitepaper.usdv.biochain.chain5')}</li>
                    <li>{t('newWhitepaper.usdv.biochain.chain6')}</li>
                  </ol>
                  <p>{t('newWhitepaper.usdv.biochain.conclusion')}</p>

                  <h3>{t('newWhitepaper.usdv.yields.title')}</h3>
                  <ul>
                    <li>{t('newWhitepaper.usdv.yields.point1')}</li>
                    <li>{t('newWhitepaper.usdv.yields.point2')}</li>
                    <li>{t('newWhitepaper.usdv.yields.point3')}</li>
                    <li>{t('newWhitepaper.usdv.yields.point4')}</li>
                    <li>{t('newWhitepaper.usdv.yields.point5')}</li>
                  </ul>
                  <p>{t('newWhitepaper.usdv.yields.conclusion')}</p>

                  <h3>{t('newWhitepaper.usdv.compliance.title')}</h3>
                  <p>{t('newWhitepaper.usdv.compliance.description')}</p>
                  <ul>
                    <li>{t('newWhitepaper.usdv.compliance.point1')}</li>
                    <li>{t('newWhitepaper.usdv.compliance.point2')}</li>
                    <li>{t('newWhitepaper.usdv.compliance.point3')}</li>
                  </ul>
                  <p>{t('newWhitepaper.usdv.compliance.conclusion')}</p>

                  <h3>{t('newWhitepaper.usdv.risks.title')}</h3>
                  <ul>
                    <li>{t('newWhitepaper.usdv.risks.point1')}</li>
                    <li>{t('newWhitepaper.usdv.risks.point2')}</li>
                    <li>{t('newWhitepaper.usdv.risks.point3')}</li>
                    <li>{t('newWhitepaper.usdv.risks.point4')}</li>
                  </ul>
                  <p>{t('newWhitepaper.usdv.risks.conclusion')}</p>

                  <h3>{t('newWhitepaper.usdv.vision.title')}</h3>
                  <ul>
                    <li>{t('newWhitepaper.usdv.vision.point1')}</li>
                    <li>{t('newWhitepaper.usdv.vision.point2')}</li>
                    <li>{t('newWhitepaper.usdv.vision.point3')}</li>
                  </ul>
                  <p>{t('newWhitepaper.usdv.vision.conclusion')}</p>

                  <h3>{t('newWhitepaper.usdv.conclusion.title')}</h3>
                  <p>{t('newWhitepaper.usdv.conclusion.content1')}</p>
                  <p>{t('newWhitepaper.usdv.conclusion.content2')}</p>
                  <p>{t('newWhitepaper.usdv.conclusion.content3')}</p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Whitepaper 3: USD.online Extended */}
          <section className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{t('newWhitepaper.extended.title')}</CardTitle>
                <p className="text-lg text-muted-foreground">{t('newWhitepaper.extended.subtitle')}</p>
                <p className="text-center font-bold text-primary">{t('newWhitepaper.extended.motto')}</p>
              </CardHeader>
              <CardContent className="space-y-6 text-sm leading-6">
                <div className="prose prose-sm max-w-none">
                  <h3>{t('newWhitepaper.extended.macroBackground.title')}</h3>
                  <p>{t('newWhitepaper.extended.macroBackground.description')}</p>
                  <ul>
                    <li>{t('newWhitepaper.extended.macroBackground.point1')}</li>
                    <li>{t('newWhitepaper.extended.macroBackground.point2')}</li>
                    <li>{t('newWhitepaper.extended.macroBackground.point3')}</li>
                  </ul>
                  <p>{t('newWhitepaper.extended.macroBackground.conclusion')}</p>

                  <h3>{t('newWhitepaper.extended.painPoints.title')}</h3>
                  <ul>
                    <li><strong>{t('newWhitepaper.extended.painPoints.traditional')}</strong><br/>{t('newWhitepaper.extended.painPoints.traditionalDesc')}</li>
                    <li><strong>{t('newWhitepaper.extended.painPoints.crypto')}</strong><br/>{t('newWhitepaper.extended.painPoints.cryptoDesc')}</li>
                  </ul>
                  <p>{t('newWhitepaper.extended.painPoints.conclusion')}</p>

                  <h3>{t('newWhitepaper.extended.techHighlights.title')}</h3>
                  
                  <h4>{t('newWhitepaper.extended.techHighlights.aiAlpha.title')}</h4>
                  <ul>
                    <li>{t('newWhitepaper.extended.techHighlights.aiAlpha.point1')}</li>
                    <li>{t('newWhitepaper.extended.techHighlights.aiAlpha.point2')}</li>
                    <li>{t('newWhitepaper.extended.techHighlights.aiAlpha.point3')}</li>
                    <li>{t('newWhitepaper.extended.techHighlights.aiAlpha.point4')}</li>
                  </ul>
                  <p>{t('newWhitepaper.extended.techHighlights.aiAlpha.logic')}</p>

                  <h4>{t('newWhitepaper.extended.techHighlights.aiQuant.title')}</h4>
                  <ul>
                    <li>{t('newWhitepaper.extended.techHighlights.aiQuant.point1')}</li>
                    <li>{t('newWhitepaper.extended.techHighlights.aiQuant.point2')}</li>
                    <li>{t('newWhitepaper.extended.techHighlights.aiQuant.point3')}</li>
                    <li>{t('newWhitepaper.extended.techHighlights.aiQuant.point4')}</li>
                  </ul>
                  <p>{t('newWhitepaper.extended.techHighlights.aiQuant.logic')}</p>

                  <h4>{t('newWhitepaper.extended.techHighlights.liquidity.title')}</h4>
                  <ul>
                    <li>{t('newWhitepaper.extended.techHighlights.liquidity.point1')}</li>
                    <li>{t('newWhitepaper.extended.techHighlights.liquidity.point2')}</li>
                    <li>{t('newWhitepaper.extended.techHighlights.liquidity.point3')}</li>
                  </ul>
                  <p>{t('newWhitepaper.extended.techHighlights.liquidity.logic')}</p>

                  <h4>{t('newWhitepaper.extended.techHighlights.custody.title')}</h4>
                  <ul>
                    <li>{t('newWhitepaper.extended.techHighlights.custody.point1')}</li>
                    <li>{t('newWhitepaper.extended.techHighlights.custody.point2')}</li>
                    <li>{t('newWhitepaper.extended.techHighlights.custody.point3')}</li>
                  </ul>
                  <p>{t('newWhitepaper.extended.techHighlights.custody.logic')}</p>

                  <h3>{t('newWhitepaper.extended.regulation.title')}</h3>
                  <p>{t('newWhitepaper.extended.regulation.description')}</p>
                  <ul>
                    <li>{t('newWhitepaper.extended.regulation.point1')}</li>
                    <li>{t('newWhitepaper.extended.regulation.point2')}</li>
                  </ul>
                  <p>{t('newWhitepaper.extended.regulation.passport')}</p>
                  <ul>
                    <li>{t('newWhitepaper.extended.regulation.passportPoint1')}</li>
                    <li>{t('newWhitepaper.extended.regulation.passportPoint2')}</li>
                    <li>{t('newWhitepaper.extended.regulation.passportPoint3')}</li>
                    <li>{t('newWhitepaper.extended.regulation.passportPoint4')}</li>
                  </ul>
                  <p>{t('newWhitepaper.extended.regulation.conclusion')}</p>

                  <h3>{t('newWhitepaper.extended.moralAlpha.title')}</h3>
                  <p>{t('newWhitepaper.extended.moralAlpha.description')}</p>
                  <ul>
                    <li>{t('newWhitepaper.extended.moralAlpha.point1')}</li>
                    <li>{t('newWhitepaper.extended.moralAlpha.point2')}</li>
                    <li>{t('newWhitepaper.extended.moralAlpha.point3')}</li>
                  </ul>
                  <p>{t('newWhitepaper.extended.moralAlpha.conclusion')}</p>

                  <h3>{t('newWhitepaper.extended.vision.title')}</h3>
                  <p>{t('newWhitepaper.extended.vision.statement')}</p>
                  <p>{t('newWhitepaper.extended.vision.description')}</p>
                  <ul>
                    <li>{t('newWhitepaper.extended.vision.point1')}</li>
                    <li>{t('newWhitepaper.extended.vision.point2')}</li>
                    <li>{t('newWhitepaper.extended.vision.point3')}</li>
                  </ul>

                  <h3>{t('newWhitepaper.extended.international.title')}</h3>
                  <p>{t('newWhitepaper.extended.international.description')}</p>
                  <ul>
                    <li>{t('newWhitepaper.extended.international.point1')}</li>
                    <li>{t('newWhitepaper.extended.international.point2')}</li>
                    <li>{t('newWhitepaper.extended.international.point3')}</li>
                  </ul>
                  <p>{t('newWhitepaper.extended.international.conclusion')}</p>

                  <h3>{t('newWhitepaper.extended.summary.title')}</h3>
                  <p>{t('newWhitepaper.extended.summary.statement')}</p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Whitepaper 4: Moral Alpha 3.0 */}
          <section className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{t('newWhitepaper.moralAlpha3.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm leading-6">
                <div className="prose prose-sm max-w-none">
                  <h3>{t('newWhitepaper.moralAlpha3.origin.title')}</h3>
                  <ul>
                    <li>{t('newWhitepaper.moralAlpha3.origin.alpha')}</li>
                    <li>{t('newWhitepaper.moralAlpha3.origin.morality')}</li>
                    <li>{t('newWhitepaper.moralAlpha3.origin.version')}</li>
                  </ul>
                  <p>{t('newWhitepaper.moralAlpha3.origin.conclusion')}</p>

                  <h3>{t('newWhitepaper.moralAlpha3.evolution.title')}</h3>
                  <ul>
                    <li><strong>{t('newWhitepaper.moralAlpha3.evolution.v1')}</strong><br/>{t('newWhitepaper.moralAlpha3.evolution.v1Desc')}</li>
                    <li><strong>{t('newWhitepaper.moralAlpha3.evolution.v2')}</strong><br/>{t('newWhitepaper.moralAlpha3.evolution.v2Desc')}</li>
                    <li><strong>{t('newWhitepaper.moralAlpha3.evolution.v3')}</strong><br/>{t('newWhitepaper.moralAlpha3.evolution.v3Desc')}<br/>{t('newWhitepaper.moralAlpha3.evolution.v3Detail')}</li>
                  </ul>

                  <h3>{t('newWhitepaper.moralAlpha3.narrative.title')}</h3>
                  <p><strong>{t('newWhitepaper.moralAlpha3.narrative.definition')}</strong></p>
                  <p>{t('newWhitepaper.moralAlpha3.narrative.model')}</p>
                  <p>{t('newWhitepaper.moralAlpha3.narrative.result')}</p>
                  <ul>
                    <li>{t('newWhitepaper.moralAlpha3.narrative.profit')}</li>
                    <li>{t('newWhitepaper.moralAlpha3.narrative.goodwill')}</li>
                  </ul>
                  <p>{t('newWhitepaper.moralAlpha3.narrative.explanation')}</p>
                  <p>{t('newWhitepaper.moralAlpha3.narrative.mechanism')}</p>

                  <h3>{t('newWhitepaper.moralAlpha3.international.title')}</h3>
                  <p>{t('newWhitepaper.moralAlpha3.international.description')}</p>
                  <ul>
                    <li>{t('newWhitepaper.moralAlpha3.international.ethical')}</li>
                    <li>{t('newWhitepaper.moralAlpha3.international.moral')}</li>
                    <li>{t('newWhitepaper.moralAlpha3.international.compassion')}</li>
                    <li>{t('newWhitepaper.moralAlpha3.international.civilizational')}</li>
                  </ul>

                  <h3>{t('newWhitepaper.moralAlpha3.motto.title')}</h3>
                  <ul>
                    <li>"{t('newWhitepaper.moralAlpha3.motto.quote1')}"</li>
                    <li>"{t('newWhitepaper.moralAlpha3.motto.quote2')}"</li>
                    <li>"{t('newWhitepaper.moralAlpha3.motto.quote3')}"</li>
                  </ul>

                  <h3>{t('newWhitepaper.moralAlpha3.conclusion.title')}</h3>
                  <p>{t('newWhitepaper.moralAlpha3.conclusion.content1')}</p>
                  <p>{t('newWhitepaper.moralAlpha3.conclusion.content2')}</p>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
