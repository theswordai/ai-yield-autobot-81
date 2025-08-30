import { Navbar } from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { ReferralWhitepaper } from "@/components/ReferralWhitepaper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/useI18n";
export default function Whitepaper() {
  const { t } = useI18n();
  
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [{
      "@type": "Question",
      "name": "首次未入金可以绑定下级吗？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "不可以，需首次入金≥200U 才能绑定。"
      }
    }, {
      "@type": "Question",
      "name": "奖励多久到账？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "入金后即时计入“可领取余额”，可随时领取。"
      }
    }, {
      "@type": "Question",
      "name": "提前赎回是否影响已得收益？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "不影响，收益不罚，仅本金按 40% 罚金。"
      }
    }, {
      "@type": "Question",
      "name": "USDo 是否给推荐奖励？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "否，USDo 仅针对自投铸造。"
      }
    }]
  };
  return <div className="relative min-h-screen overflow-hidden bg-gradient-dark">
      <Navbar />
      <Helmet>
        <title>{t('meta.title')} | {t('nav.whitepaper')}</title>
        <meta name="description" content={t('meta.description')} />
        <link rel="canonical" href="/whitepaper" />
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" />
      <main className="pt-20 pb-10 relative z-10">
        <div className="container mx-auto px-4">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">{t('whitepaper.title')}</h1>
          </header>
          <section aria-labelledby="usd-online" className="mb-8">
            <Card>
              
              <CardContent className="space-y-6 text-sm leading-6 text-muted-foreground">
                <article>
                  <p className="text-center font-medium text-primary mb-4">{t('whitepaper.subtitle')}</p>
                </article>

                <article>
                  <h3 className="text-base font-semibold text-foreground mb-2">{t('whitepaper.preface.title')}</h3>
                  <div className="space-y-3">
                    <p>{t('whitepaper.preface.content1')}</p>
                    <p>{t('whitepaper.preface.content2')}</p>
                    <p dangerouslySetInnerHTML={{ __html: t('whitepaper.preface.content3') }}></p>
                    <div className="pl-4 border-l-2 border-primary/20">
                      <p className="mb-1">{t('whitepaper.preface.here')}</p>
                      <ul className="space-y-1">
                        <li>{t('whitepaper.preface.point1')}</li>
                        <li>{t('whitepaper.preface.point2')}</li>
                        <li>{t('whitepaper.preface.point3')}</li>
                      </ul>
                    </div>
                    <p className="font-medium text-foreground">{t('whitepaper.preface.conclusion')}</p>
                  </div>
                </article>

                <article>
                  <h3 className="text-base font-semibold text-foreground mb-2">{t('whitepaper.vision.title')}</h3>
                  <div className="space-y-3">
                    <p>{t('whitepaper.vision.content1')}</p>
                    <div className="pl-4 border-l-2 border-accent/20">
                      <p className="mb-1">{t('whitepaper.vision.inThisOrder')}</p>
                      <ul className="space-y-1">
                        <li>{t('whitepaper.vision.point1')}</li>
                        <li>{t('whitepaper.vision.point2')}</li>
                        <li>{t('whitepaper.vision.point3')}</li>
                        <li>{t('whitepaper.vision.point4')}</li>
                      </ul>
                    </div>
                    <p className="font-medium text-foreground">{t('whitepaper.vision.conclusion')}</p>
                  </div>
                </article>

                <article>
                  <h3 className="text-base font-semibold text-foreground mb-2">{t('whitepaper.mission.title')}</h3>
                  <div className="space-y-3">
                    <p>{t('whitepaper.mission.content1')}</p>
                    <div className="pl-4 border-l-2 border-primary/20">
                      <p className="mb-1 font-medium">{t('whitepaper.mission.commitments')}</p>
                      <ul className="space-y-1">
                        <li>{t('whitepaper.mission.commitment1')}</li>
                        <li>{t('whitepaper.mission.commitment2')}</li>
                      </ul>
                    </div>
                    <div className="pl-4 border-l-2 border-accent/20">
                      <p className="mb-1 font-medium">{t('whitepaper.mission.valueExpression')}</p>
                      <ul className="space-y-1">
                        <li dangerouslySetInnerHTML={{ __html: t('whitepaper.mission.value1') }}></li>
                        <li dangerouslySetInnerHTML={{ __html: t('whitepaper.mission.value2') }}></li>
                        <li dangerouslySetInnerHTML={{ __html: t('whitepaper.mission.value3') }}></li>
                      </ul>
                    </div>
                    <p className="font-medium text-foreground">{t('whitepaper.mission.conclusion')}</p>
                  </div>
                </article>

                <article>
                  <h3 className="text-base font-semibold text-foreground mb-2">{t('whitepaper.strategy.title')}</h3>
                  <div className="space-y-3">
                    <p dangerouslySetInnerHTML={{ __html: t('whitepaper.strategy.content1') }}></p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li dangerouslySetInnerHTML={{ __html: t('whitepaper.strategy.point1') }}></li>
                      <li dangerouslySetInnerHTML={{ __html: t('whitepaper.strategy.point2') }}></li>
                      <li dangerouslySetInnerHTML={{ __html: t('whitepaper.strategy.point3') }}></li>
                    </ul>
                    <p dangerouslySetInnerHTML={{ __html: t('whitepaper.strategy.conclusion') }}></p>
                  </div>
                </article>

                <article>
                  <h3 className="text-base font-semibold text-foreground mb-2">{t('whitepaper.conclusion.title')}</h3>
                  <div className="space-y-3">
                    <p>{t('whitepaper.conclusion.content1')}</p>
                    <p dangerouslySetInnerHTML={{ __html: t('whitepaper.conclusion.content2') }}></p>
                    <p className="font-medium text-foreground" dangerouslySetInnerHTML={{ __html: t('whitepaper.conclusion.content3') }}></p>
                  </div>
                </article>
              </CardContent>
            </Card>
          </section>
          
          <section aria-labelledby="project-intro" className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle id="project-intro" className="text-3xl">{t('whitepaper.projectIntro.title')}<br/>{t('whitepaper.projectIntro.subtitle')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm leading-6 text-muted-foreground">
                <article>
                  <div className="space-y-3">
                    <p className="text-center font-medium text-primary mb-4">{t('whitepaper.projectIntro.motto')}</p>
                    
                    <div className="space-y-4">
                      <h3 className="text-base font-semibold text-foreground mb-2">{t('whitepaper.projectIntro.backgroundTitle')}</h3>
                      <p className="font-medium">{t('whitepaper.projectIntro.backgroundDesc')}</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>{t('whitepaper.projectIntro.backgroundPoint1')}</li>
                        <li>{t('whitepaper.projectIntro.backgroundPoint2')}</li>
                        <li>{t('whitepaper.projectIntro.backgroundPoint3')}</li>
                      </ul>
                      <p className="font-medium text-foreground">{t('whitepaper.projectIntro.backgroundSummary')}</p>
                    </div>
                  </div>
                </article>

                <article>
                  <h3 className="text-base font-semibold text-foreground mb-2">{t('whitepaper.projectIntro.painPointsTitle')}</h3>
                  <div className="space-y-3">
                    <div className="pl-4 border-l-2 border-primary/20">
                      <p className="mb-1 font-medium">{t('whitepaper.projectIntro.painPoint1Title')}</p>
                      <p>{t('whitepaper.projectIntro.painPoint1Desc')}</p>
                    </div>
                    <div className="pl-4 border-l-2 border-accent/20">
                      <p className="mb-1 font-medium">{t('whitepaper.projectIntro.painPoint2Title')}</p>
                      <p>{t('whitepaper.projectIntro.painPoint2Desc')}</p>
                    </div>
                  </div>
                </article>

                <article>
                  <h3 className="text-base font-semibold text-foreground mb-2">{t('whitepaper.projectIntro.techTitle')}</h3>
                  <div className="space-y-4">
                    <div className="pl-4 border-l-2 border-primary/20">
                      <p className="mb-2 font-medium text-foreground">{t('whitepaper.projectIntro.aiEngineTitle')}</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>{t('whitepaper.projectIntro.aiEnginePoint1')}</li>
                        <li>{t('whitepaper.projectIntro.aiEnginePoint2')}</li>
                        <li>{t('whitepaper.projectIntro.aiEnginePoint3')}</li>
                        <li>{t('whitepaper.projectIntro.aiEnginePoint4')}</li>
                      </ul>
                    </div>
                    
                    <div className="pl-4 border-l-2 border-accent/20">
                      <p className="mb-2 font-medium text-foreground">{t('whitepaper.projectIntro.quantTitle')}</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>{t('whitepaper.projectIntro.quantPoint1')}</li>
                        <li>{t('whitepaper.projectIntro.quantPoint2')}</li>
                        <li>{t('whitepaper.projectIntro.quantPoint3')}</li>
                        <li>{t('whitepaper.projectIntro.quantPoint4')}</li>
                      </ul>
                    </div>
                    
                    <div className="pl-4 border-l-2 border-primary/20">
                      <p className="mb-2 font-medium text-foreground">{t('whitepaper.projectIntro.liquidityTitle')}</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>{t('whitepaper.projectIntro.liquidityPoint1')}</li>
                        <li>{t('whitepaper.projectIntro.liquidityPoint2')}</li>
                        <li>{t('whitepaper.projectIntro.liquidityPoint3')}</li>
                      </ul>
                    </div>
                    
                    <div className="pl-4 border-l-2 border-accent/20">
                      <p className="mb-2 font-medium text-foreground">{t('whitepaper.projectIntro.custodyTitle')}</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>{t('whitepaper.projectIntro.custodyPoint1')}</li>
                        <li>{t('whitepaper.projectIntro.custodyPoint2')}</li>
                        <li>{t('whitepaper.projectIntro.custodyPoint3')}</li>
                      </ul>
                    </div>
                  </div>
                </article>

                <article>
                  <h3 className="text-base font-semibold text-foreground mb-2">{t('whitepaper.projectIntro.regulationTitle')}</h3>
                  <div className="space-y-3">
                    <p className="font-medium">{t('whitepaper.projectIntro.regulationDesc1')}</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>{t('whitepaper.projectIntro.regulationDesc2')}</li>
                      <li>{t('whitepaper.projectIntro.regulationDesc3')}</li>
                    </ul>
                    
                    <div className="pl-4 border-l-2 border-primary/20">
                      <p className="mb-2 font-medium text-foreground">{t('whitepaper.projectIntro.regulationSummary')}</p>
                      <ul className="space-y-1">
                        <li>{t('whitepaper.projectIntro.regulationPoint1')}</li>
                        <li>{t('whitepaper.projectIntro.regulationPoint2')}</li>
                        <li>{t('whitepaper.projectIntro.regulationPoint3')}</li>
                        <li>{t('whitepaper.projectIntro.regulationPoint4')}</li>
                      </ul>
                    </div>
                  </div>
                </article>

                <article>
                  <h3 className="text-base font-semibold text-foreground mb-2">{t('whitepaper.projectIntro.moralTitle')}</h3>
                  <div className="space-y-3">
                    <p>{t('whitepaper.projectIntro.moralDesc')}</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>{t('whitepaper.projectIntro.moralPoint1')}</li>
                      <li>{t('whitepaper.projectIntro.moralPoint2')}</li>
                      <li>{t('whitepaper.projectIntro.moralPoint3')}</li>
                    </ul>
                    <p className="font-medium text-foreground">{t('whitepaper.projectIntro.moralConclusion')}</p>
                  </div>
                </article>

                <article>
                  <h3 className="text-base font-semibold text-foreground mb-2">{t('whitepaper.projectIntro.visionTitle')}</h3>
                  <p className="font-medium text-primary text-center mb-3">{t('whitepaper.projectIntro.visionStatement')}</p>
                  <p className="mb-2">{t('whitepaper.projectIntro.visionDesc')}</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>{t('whitepaper.projectIntro.visionPoint1')}</li>
                    <li>{t('whitepaper.projectIntro.visionPoint2')}</li>
                    <li>{t('whitepaper.projectIntro.visionPoint3')}</li>
                  </ul>
                </article>

                <article>
                  <h3 className="text-base font-semibold text-foreground mb-2">{t('whitepaper.projectIntro.internationalTitle')}</h3>
                  <p className="mb-2">{t('whitepaper.projectIntro.internationalDesc')}</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>{t('whitepaper.projectIntro.internationalPoint1')}</li>
                    <li>{t('whitepaper.projectIntro.internationalPoint2')}</li>
                    <li>{t('whitepaper.projectIntro.internationalPoint3')}</li>
                  </ul>
                  <p className="font-medium text-foreground text-center mt-4">{t('whitepaper.projectIntro.internationalConclusion')}</p>
                </article>

                <article>
                  <div className="pl-4 border-l-2 border-primary/20">
                    <p className="font-medium text-foreground mb-2">{t('whitepaper.projectIntro.summaryTitle')}</p>
                    <p className="font-medium text-primary text-center italic">{t('whitepaper.projectIntro.summaryStatement')}</p>
                  </div>
                </article>
              </CardContent>
            </Card>
          </section>

          <section aria-labelledby="fca-regulation" className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle id="fca-regulation" className="text-2xl">{t('fcaRegulation.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm leading-6 text-muted-foreground">
                <article>
                  <div className="space-y-4">
                    <p className="font-medium">{t('fcaRegulation.intro')}</p>
                    <p>{t('fcaRegulation.description1')}</p>
                    <p>{t('fcaRegulation.description2')}</p>
                    
                    <div className="pl-4 border-l-2 border-primary/20">
                      <h4 className="font-semibold text-foreground mb-3">{t('fcaRegulation.regulatorySignificance')}</h4>
                      <ul className="space-y-2">
                        <li>{t('fcaRegulation.compliance')}</li>
                        <li>{t('fcaRegulation.transparency')}</li>
                        <li>{t('fcaRegulation.protection')}</li>
                        <li>{t('fcaRegulation.passport')}</li>
                      </ul>
                    </div>
                    
                    <div className="pl-4 border-l-2 border-accent/20">
                      <h4 className="font-semibold text-foreground mb-3">{t('fcaRegulation.strategicHeight')}</h4>
                      <p className="mb-2">{t('fcaRegulation.strategicIntro')}</p>
                      <ul className="space-y-1">
                        <li>{t('fcaRegulation.anchor')}</li>
                        <li>{t('fcaRegulation.testbed')}</li>
                        <li>{t('fcaRegulation.cornerstone')}</li>
                      </ul>
                    </div>
                    
                    <p className="font-medium text-primary text-center italic">{t('fcaRegulation.conclusion')}</p>
                  </div>
                </article>
              </CardContent>
            </Card>
          </section>

          <section aria-labelledby="moral-alpha" className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle id="moral-alpha" className="text-2xl">{t('moralAlpha.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm leading-6 text-muted-foreground">
                <article>
                  <h3 className="text-base font-semibold text-foreground mb-2">{t('moralAlpha.conceptOrigin.title')}</h3>
                  <div className="space-y-3">
                    <ul className="space-y-2">
                      <li>{t('moralAlpha.conceptOrigin.alpha')}</li>
                      <li>{t('moralAlpha.conceptOrigin.morality')}</li>
                      <li>{t('moralAlpha.conceptOrigin.version')}</li>
                    </ul>
                  </div>
                </article>

                <article>
                  <h3 className="text-base font-semibold text-foreground mb-2">{t('moralAlpha.evolutionLogic.title')}</h3>
                  <div className="space-y-3">
                    <ul className="space-y-2">
                      <li>{t('moralAlpha.evolutionLogic.v1')}</li>
                      <li>{t('moralAlpha.evolutionLogic.v2')}</li>
                      <li dangerouslySetInnerHTML={{ __html: t('moralAlpha.evolutionLogic.v3') }}></li>
                    </ul>
                    <p className="font-medium text-primary text-center mt-4">{t('moralAlpha.evolutionLogic.conclusion')}</p>
                  </div>
                </article>

                <article>
                  <h3 className="text-base font-semibold text-foreground mb-2">{t('moralAlpha.narrativeDefinition.title')}</h3>
                  <div className="space-y-4">
                    <div className="pl-4 border-l-2 border-primary/20">
                      <p className="font-medium text-foreground mb-2">{t('moralAlpha.narrativeDefinition.definition')}</p>
                      <p className="mb-2">{t('moralAlpha.narrativeDefinition.desc1')}</p>
                      <p className="mb-2">{t('moralAlpha.narrativeDefinition.desc2')}</p>
                      <p className="mb-2">{t('moralAlpha.narrativeDefinition.desc3')}</p>
                    </div>
                    <div className="pl-4 border-l-2 border-accent/20">
                      <p className="font-medium text-foreground mb-2">{t('moralAlpha.narrativeDefinition.explanation')}</p>
                      <p>{t('moralAlpha.narrativeDefinition.mechanismDesc')}</p>
                    </div>
                  </div>
                </article>

                <article>
                  <h3 className="text-base font-semibold text-foreground mb-2">{t('moralAlpha.international.title')}</h3>
                  <div className="space-y-2">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>{t('moralAlpha.international.ethical')}</li>
                      <li>{t('moralAlpha.international.moral')}</li>
                      <li>{t('moralAlpha.international.compassion')}</li>
                      <li>{t('moralAlpha.international.civilizational')}</li>
                    </ul>
                  </div>
                </article>

                <article>
                  <h3 className="text-base font-semibold text-foreground mb-2">{t('moralAlpha.motto.title')}</h3>
                  <div className="space-y-3">
                    <div className="pl-4 border-l-2 border-primary/20">
                      <ul className="space-y-2">
                        <li className="font-medium text-foreground">「{t('moralAlpha.motto.quote1')}」</li>
                        <li className="font-medium text-foreground">「{t('moralAlpha.motto.quote2')}」</li>
                        <li className="font-medium text-foreground">「{t('moralAlpha.motto.quote3')}」</li>
                      </ul>
                    </div>
                  </div>
                </article>

                <article>
                  <h3 className="text-base font-semibold text-foreground mb-2">{t('moralAlpha.conclusion.title')}</h3>
                  <div className="space-y-3">
                    <p>{t('moralAlpha.conclusion.content1')}</p>
                    <p className="font-medium text-primary text-center">{t('moralAlpha.conclusion.content2')}</p>
                  </div>
                </article>
              </CardContent>
            </Card>
          </section>

          <section aria-labelledby="whitepaper-content">
            <ReferralWhitepaper />
          </section>
        </div>
      </main>
    </div>;
}