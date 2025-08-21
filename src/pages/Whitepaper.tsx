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
                    <p><strong>{t('whitepaper.projectIntro.transformation')}</strong></p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>{t('whitepaper.projectIntro.point1')}</li>
                      <li>{t('whitepaper.projectIntro.point2')}</li>
                      <li>{t('whitepaper.projectIntro.point3')}</li>
                    </ul>
                    <p dangerouslySetInnerHTML={{ __html: t('whitepaper.projectIntro.backdrop') }}></p>
                  </div>
                </article>

                <article>
                  <h3 className="text-base font-semibold text-foreground mb-2">{t('whitepaper.painPoints.title')}</h3>
                  <div className="space-y-3">
                    <div className="pl-4 border-l-2 border-primary/20">
                      <p className="mb-1 font-medium">{t('whitepaper.painPoints.traditional')}</p>
                      <p>{t('whitepaper.painPoints.traditionalDesc')}</p>
                    </div>
                    <div className="pl-4 border-l-2 border-accent/20">
                      <p className="mb-1 font-medium">{t('whitepaper.painPoints.crypto')}</p>
                      <p>{t('whitepaper.painPoints.cryptoDesc')}</p>
                    </div>
                  </div>
                </article>

                <article>
                  <h3 className="text-base font-semibold text-foreground mb-2">{t('whitepaper.tech.title')}</h3>
                  <div className="space-y-4">
                    <div className="pl-4 border-l-2 border-primary/20">
                      <p className="mb-2 font-medium text-foreground">{t('whitepaper.tech.alphaEngine')}</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>{t('whitepaper.tech.alphaPoint1')}</li>
                        <li>{t('whitepaper.tech.alphaPoint2')}</li>
                        <li>{t('whitepaper.tech.alphaPoint3')}</li>
                      </ul>
                    </div>
                    
                    <div className="pl-4 border-l-2 border-accent/20">
                      <p className="mb-2 font-medium text-foreground">{t('whitepaper.tech.smartRotation')}</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>{t('whitepaper.tech.rotationPoint1')}</li>
                        <li>{t('whitepaper.tech.rotationPoint2')}</li>
                        <li>{t('whitepaper.tech.rotationPoint3')}</li>
                      </ul>
                    </div>
                    
                    <div className="pl-4 border-l-2 border-primary/20">
                      <p className="mb-2 font-medium text-foreground">{t('whitepaper.tech.globalConnect')}</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>{t('whitepaper.tech.connectPoint1')}</li>
                        <li>{t('whitepaper.tech.connectPoint2')}</li>
                      </ul>
                    </div>
                    
                    <div className="pl-4 border-l-2 border-accent/20">
                      <p className="mb-2 font-medium text-foreground">{t('whitepaper.tech.transparent')}</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>{t('whitepaper.tech.transparentPoint1')}</li>
                        <li>{t('whitepaper.tech.transparentPoint2')}</li>
                        <li dangerouslySetInnerHTML={{ __html: t('whitepaper.tech.transparentPoint3') }}></li>
                      </ul>
                    </div>
                  </div>
                </article>

                <article>
                  <h3 className="text-base font-semibold text-foreground mb-2">{t('whitepaper.vision.title')}</h3>
                  <p className="font-medium text-primary text-center mb-3">{t('whitepaper.visionStatement')}</p>
                </article>

                <article>
                  <h3 className="text-base font-semibold text-foreground mb-2">{t('whitepaper.positioning.title')}</h3>
                  <div className="space-y-3">
                    <ul className="list-disc pl-5 space-y-1">
                      <li dangerouslySetInnerHTML={{ __html: t('whitepaper.positioning.content1') }}></li>
                      <li dangerouslySetInnerHTML={{ __html: t('whitepaper.positioning.content2') }}></li>
                      <li dangerouslySetInnerHTML={{ __html: t('whitepaper.positioning.content3') }}></li>
                      <li dangerouslySetInnerHTML={{ __html: t('whitepaper.positioning.content4') }}></li>
                    </ul>
                    
                    <div className="pl-4 border-l-2 border-primary/20">
                      <p className="mb-1 font-medium text-foreground">{t('whitepaper.positioning.allows')}</p>
                      <ul className="space-y-1">
                        <li>{t('whitepaper.positioning.allow1')}</li>
                        <li>{t('whitepaper.positioning.allow2')}</li>
                        <li>{t('whitepaper.positioning.allow3')}</li>
                        <li>{t('whitepaper.positioning.allow4')}</li>
                      </ul>
                    </div>
                    
                    <p className="font-medium text-foreground text-center mt-4">{t('whitepaper.positioning.conclusion')}</p>
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