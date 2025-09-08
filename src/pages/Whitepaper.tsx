import { Navbar } from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/useI18n";

export default function Whitepaper() {
  const { t } = useI18n();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Helmet>
        <title>{t('meta.title')} | Whitepaper</title>
        <meta name="description" content={t('meta.description')} />
        <link rel="canonical" href="/whitepaper" />
      </Helmet>
      
      <div className="pt-16 min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 cyber-grid">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Header */}
            <div className="text-center space-y-6 mb-16">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent neon-text">
                和谐财富引擎
              </h1>
              <div className="h-1 w-32 mx-auto bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full electric-border"></div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                构建财富与慈善的和谐统一，通过区块链技术实现透明、高效的价值创造
              </p>
            </div>

            {/* Whitepaper 1: USD.online */}
            <section className="mb-12">
              <Card className="cyberpunk-card hologram">
                <CardHeader>
                  <CardTitle className="text-3xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {t('newWhitepaper.usdOnline.title')}
                  </CardTitle>
                  <p className="text-xl text-muted-foreground mt-4">{t('newWhitepaper.usdOnline.subtitle')}</p>
                  <div className="text-center mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                    <p className="text-lg font-bold text-primary">{t('newWhitepaper.usdOnline.motto')}</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8 text-base leading-7">
                  <div className="prose prose-lg max-w-none text-foreground">
                    <div className="space-y-8">
                      <div className="ml-0 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-cyan-400 electric-border-inline">{t('newWhitepaper.usdOnline.preface.title')}</h3>
                        <div className="space-y-4 ml-4">
                          <p className="leading-relaxed text-white">{t('newWhitepaper.usdOnline.preface.content1')}</p>
                          <p className="leading-relaxed text-white">{t('newWhitepaper.usdOnline.preface.content2')}</p>
                          <div className="p-4 rounded-lg border-l-4 border-blue-400">
                            <p className="text-white"><strong className="text-blue-400">{t('newWhitepaper.usdOnline.preface.vision')}</strong><br/>{t('newWhitepaper.usdOnline.preface.visionDesc')}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-8 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-purple-400 electric-border-inline">{t('newWhitepaper.usdOnline.marketPains.title')}</h3>
                        <div className="space-y-6 ml-4">
                          <div>
                            <h4 className="text-lg font-medium mb-3 text-cyan-300">{t('newWhitepaper.usdOnline.marketPains.traditional.title')}</h4>
                            <ul className="space-y-2 ml-6">
                              <li className="flex items-start gap-2">
                                <span className="text-cyan-400 mt-2">▶</span>
                                <span className="text-white">{t('newWhitepaper.usdOnline.marketPains.traditional.point1')}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-cyan-400 mt-2">▶</span>
                                <span className="text-white">{t('newWhitepaper.usdOnline.marketPains.traditional.point2')}</span>
                              </li>
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-lg font-medium mb-3 text-purple-300">{t('newWhitepaper.usdOnline.marketPains.crypto.title')}</h4>
                            <ul className="space-y-2 ml-6">
                              <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-2">▶</span>
                                <span className="text-white">{t('newWhitepaper.usdOnline.marketPains.crypto.point1')}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-2">▶</span>
                                <span className="text-white">{t('newWhitepaper.usdOnline.marketPains.crypto.point2')}</span>
                              </li>
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-lg font-medium mb-3 text-blue-300">{t('newWhitepaper.usdOnline.marketPains.charity.title')}</h4>
                            <ul className="space-y-2 ml-6">
                              <li className="flex items-start gap-2">
                                <span className="text-blue-400 mt-2">▶</span>
                                <span className="text-white">{t('newWhitepaper.usdOnline.marketPains.charity.point1')}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-blue-400 mt-2">▶</span>
                                <span className="text-white">{t('newWhitepaper.usdOnline.marketPains.charity.point2')}</span>
                              </li>
                            </ul>
                          </div>
                          
                          <div className="p-4 rounded-lg border-l-4 border-yellow-400">
                            <p className="leading-relaxed text-white">{t('newWhitepaper.usdOnline.marketPains.conclusion')}</p>
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-green-400 electric-border-inline">{t('newWhitepaper.usdOnline.techMoat.title')}</h3>
                        <div className="space-y-6 ml-4">
                          <p className="leading-relaxed text-lg text-white">{t('newWhitepaper.usdOnline.techMoat.description')}</p>
                          
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-lg font-medium mb-3 text-cyan-300">{t('newWhitepaper.usdOnline.techMoat.aiEngine.title')}</h4>
                              <ul className="space-y-2 ml-6">
                                <li className="flex items-start gap-2">
                                  <span className="text-cyan-400 mt-2">▶</span>
                                  <span className="text-white">{t('newWhitepaper.usdOnline.techMoat.aiEngine.point1')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-cyan-400 mt-2">▶</span>
                                  <span className="text-white">{t('newWhitepaper.usdOnline.techMoat.aiEngine.point2')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-cyan-400 mt-2">▶</span>
                                  <span className="text-white">{t('newWhitepaper.usdOnline.techMoat.aiEngine.point3')}</span>
                                </li>
                              </ul>
                              <div className="mt-4 p-4 rounded-lg border border-cyan-200 dark:border-cyan-800">
                                <p className="leading-relaxed text-white">{t('newWhitepaper.usdOnline.techMoat.aiEngine.logic')}</p>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-lg font-medium mb-3 text-purple-300">{t('newWhitepaper.usdOnline.techMoat.aiRotation.title')}</h4>
                              <ul className="space-y-2 ml-6">
                                <li className="flex items-start gap-2">
                                  <span className="text-purple-400 mt-2">▶</span>
                                  <span className="text-white">{t('newWhitepaper.usdOnline.techMoat.aiRotation.point1')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-purple-400 mt-2">▶</span>
                                  <span className="text-white">{t('newWhitepaper.usdOnline.techMoat.aiRotation.point2')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-purple-400 mt-2">▶</span>
                                  <span className="text-white">{t('newWhitepaper.usdOnline.techMoat.aiRotation.point3')}</span>
                                </li>
                              </ul>
                              <div className="mt-4 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                                <p className="leading-relaxed text-white">{t('newWhitepaper.usdOnline.techMoat.aiRotation.logic')}</p>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-lg font-medium mb-3 text-green-300">{t('newWhitepaper.usdOnline.techMoat.liquidity.title')}</h4>
                              <ul className="space-y-2 ml-6">
                                <li className="flex items-start gap-2">
                                  <span className="text-green-400 mt-2">▶</span>
                                  <span className="text-white">{t('newWhitepaper.usdOnline.techMoat.liquidity.point1')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-green-400 mt-2">▶</span>
                                  <span className="text-white">{t('newWhitepaper.usdOnline.techMoat.liquidity.point2')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-green-400 mt-2">▶</span>
                                  <span className="text-white">{t('newWhitepaper.usdOnline.techMoat.liquidity.point3')}</span>
                                </li>
                              </ul>
                              <div className="mt-4 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                <p className="leading-relaxed text-white">{t('newWhitepaper.usdOnline.techMoat.liquidity.logic')}</p>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-lg font-medium mb-3 text-orange-300">{t('newWhitepaper.usdOnline.techMoat.security.title')}</h4>
                              <ul className="space-y-2 ml-6">
                                <li className="flex items-start gap-2">
                                  <span className="text-orange-400 mt-2">▶</span>
                                  <span className="text-white">{t('newWhitepaper.usdOnline.techMoat.security.point1')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-orange-400 mt-2">▶</span>
                                  <span className="text-white">{t('newWhitepaper.usdOnline.techMoat.security.point2')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-orange-400 mt-2">▶</span>
                                  <span className="text-white">{t('newWhitepaper.usdOnline.techMoat.security.point3')}</span>
                                </li>
                              </ul>
                              <div className="mt-4 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                                <p className="leading-relaxed text-white">{t('newWhitepaper.usdOnline.techMoat.security.logic')}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="ml-12 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-pink-400 electric-border-inline">{t('newWhitepaper.usdOnline.charityIntegration.title')}</h3>
                        <div className="space-y-4 ml-4">
                          <p className="leading-relaxed text-lg text-white">{t('newWhitepaper.usdOnline.charityIntegration.description')}</p>
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-pink-400 mt-2">▶</span>
                              <span className="text-white">{t('newWhitepaper.usdOnline.charityIntegration.point1')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-pink-400 mt-2">▶</span>
                              <span className="text-white">{t('newWhitepaper.usdOnline.charityIntegration.point2')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-pink-400 mt-2">▶</span>
                              <span className="text-white">{t('newWhitepaper.usdOnline.charityIntegration.point3')}</span>
                            </li>
                          </ul>
                          <div className="p-4 rounded-lg border-l-4 border-pink-400">
                            <p className="leading-relaxed text-white">{t('newWhitepaper.usdOnline.charityIntegration.conclusion')}</p>
                          </div>
                        </div>
                      </div>

                      <div className="ml-2 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-yellow-400 electric-border-inline">{t('newWhitepaper.usdOnline.growthModel.title')}</h3>
                        <div className="space-y-4 ml-4">
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-400 mt-2">▶</span>
                              <span className="text-white">{t('newWhitepaper.usdOnline.growthModel.point1')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-400 mt-2">▶</span>
                              <span className="text-white">{t('newWhitepaper.usdOnline.growthModel.point2')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-400 mt-2">▶</span>
                              <span className="text-white">{t('newWhitepaper.usdOnline.growthModel.point3')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-400 mt-2">▶</span>
                              <span className="text-white">{t('newWhitepaper.usdOnline.growthModel.point4')}</span>
                            </li>
                          </ul>
                          <div className="p-4 rounded-lg border-l-4 border-yellow-400">
                            <p className="leading-relaxed text-white">{t('newWhitepaper.usdOnline.growthModel.conclusion')}</p>
                          </div>
                        </div>
                      </div>

                      <div className="ml-6 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-indigo-400 electric-border-inline">{t('newWhitepaper.usdOnline.compliance.title')}</h3>
                        <div className="space-y-4 ml-4">
                          <p className="leading-relaxed text-lg text-white">{t('newWhitepaper.usdOnline.compliance.description')}</p>
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-indigo-400 mt-2">▶</span>
                              <span className="text-white">{t('newWhitepaper.usdOnline.compliance.point1')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-indigo-400 mt-2">▶</span>
                              <span className="text-white">{t('newWhitepaper.usdOnline.compliance.point2')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-indigo-400 mt-2">▶</span>
                              <span className="text-white">{t('newWhitepaper.usdOnline.compliance.point3')}</span>
                            </li>
                          </ul>
                          <div className="p-4 rounded-lg border-l-4 border-indigo-400">
                            <p className="leading-relaxed text-white">{t('newWhitepaper.usdOnline.compliance.conclusion')}</p>
                          </div>
                        </div>
                      </div>

                      <div className="ml-10 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-teal-400 electric-border-inline">{t('newWhitepaper.usdOnline.strategy.title')}</h3>
                        <div className="space-y-4 ml-4">
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-teal-400 mt-2">▶</span>
                              <span className="text-white">{t('newWhitepaper.usdOnline.strategy.point1')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-teal-400 mt-2">▶</span>
                              <span className="text-white">{t('newWhitepaper.usdOnline.strategy.point2')}</span>
                            </li>
                          </ul>
                          <div className="p-4 rounded-lg border-l-4 border-teal-400">
                            <p className="leading-relaxed text-white">{t('newWhitepaper.usdOnline.strategy.conclusion')}</p>
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-red-400 electric-border-inline">{t('newWhitepaper.usdOnline.conclusion.title')}</h3>
                        <div className="space-y-4 ml-4">
                          <div className="p-6 rounded-lg border border-red-200 dark:border-red-800">
                            <p className="leading-relaxed mb-4 text-white">{t('newWhitepaper.usdOnline.conclusion.content1')}</p>
                            <p className="leading-relaxed mb-4 text-white">{t('newWhitepaper.usdOnline.conclusion.content2')}</p>
                            <p className="leading-relaxed font-semibold text-red-400">{t('newWhitepaper.usdOnline.conclusion.content3')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Whitepaper 2: USDV */}
            <section className="mb-12">
              <Card className="cyberpunk-card data-stream">
                <CardHeader>
                  <CardTitle className="text-3xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {t('newWhitepaper.usdv.title')}
                  </CardTitle>
                  <p className="text-xl text-cyan-400 mt-4">{t('newWhitepaper.usdv.subtitle')}</p>
                  <p className="text-lg text-purple-400">{t('newWhitepaper.usdv.subsubtitle')}</p>
                </CardHeader>
                <CardContent className="space-y-8 text-base leading-7">
                  <div className="prose prose-lg max-w-none text-foreground">
                    <div className="space-y-8">
                      
                      {/* 1. 项目背景 */}
                      <div className="ml-0 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-blue-400 electric-border-inline">{t('newWhitepaper.usdv.background.title')}</h3>
                        <div className="space-y-4 ml-4">
                          <p className="leading-relaxed text-white">{t('newWhitepaper.usdv.background.description')}</p>
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-blue-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.usdv.background.point1')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-blue-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.usdv.background.point2')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-blue-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.usdv.background.point3')}</span>
                            </li>
                          </ul>
                          <div className="p-4 rounded-lg border-l-4 border-blue-400">
                            <p className="text-white">{t('newWhitepaper.usdv.background.conclusion')}</p>
                          </div>
                        </div>
                      </div>

                      {/* 2. 市场痛点 */}
                      <div className="ml-4 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-purple-400 electric-border-inline">{t('newWhitepaper.usdv.marketPains.title')}</h3>
                        <div className="space-y-4 ml-4">
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-purple-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.usdv.marketPains.point1')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.usdv.marketPains.point2')}</span>
                            </li>
                          </ul>
                          <div className="p-4 rounded-lg border-l-4 border-purple-400">
                            <p className="text-white">{t('newWhitepaper.usdv.marketPains.conclusion')}</p>
                          </div>
                        </div>
                      </div>

                      {/* 3. 技术与生态 */}
                      <div className="ml-2 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-green-400 electric-border-inline">{t('newWhitepaper.usdv.biochain.title')}</h3>
                        <div className="space-y-6 ml-4">
                          <p className="leading-relaxed text-white">{t('newWhitepaper.usdv.biochain.description')}</p>
                          
                          <div className="space-y-4">
                            <h4 className="text-lg font-medium text-cyan-300">{t('newWhitepaper.usdv.biochain.sixChains')}</h4>
                            <ul className="space-y-3 ml-6">
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-2">1.</span>
                                <span className="text-white">{t('newWhitepaper.usdv.biochain.chain1')}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-2">2.</span>
                                <span className="text-white">{t('newWhitepaper.usdv.biochain.chain2')}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-2">3.</span>
                                <span className="text-white">{t('newWhitepaper.usdv.biochain.chain3')}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-2">4.</span>
                                <span className="text-white">{t('newWhitepaper.usdv.biochain.chain4')}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-2">5.</span>
                                <span className="text-white">{t('newWhitepaper.usdv.biochain.chain5')}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-2">6.</span>
                                <span className="text-white">{t('newWhitepaper.usdv.biochain.chain6')}</span>
                              </li>
                            </ul>
                          </div>
                          
                          <div className="p-4 rounded-lg border-l-4 border-green-400">
                            <p className="text-white">{t('newWhitepaper.usdv.biochain.conclusion')}</p>
                          </div>
                        </div>
                      </div>

                      {/* 4. 收益逻辑 */}
                      <div className="ml-6 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-yellow-400 electric-border-inline">{t('newWhitepaper.usdv.yields.title')}</h3>
                        <div className="space-y-4 ml-4">
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.usdv.yields.point1')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.usdv.yields.point2')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.usdv.yields.point3')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.usdv.yields.point4')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.usdv.yields.point5')}</span>
                            </li>
                          </ul>
                          <div className="p-4 rounded-lg border-l-4 border-yellow-400">
                            <p className="text-white">{t('newWhitepaper.usdv.yields.conclusion')}</p>
                          </div>
                        </div>
                      </div>

                      {/* 5. 合规愿景 */}
                      <div className="ml-8 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-indigo-400 electric-border-inline">{t('newWhitepaper.usdv.compliance.title')}</h3>
                        <div className="space-y-4 ml-4">
                          <p className="leading-relaxed text-white">{t('newWhitepaper.usdv.compliance.description')}</p>
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-indigo-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.usdv.compliance.point1')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-indigo-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.usdv.compliance.point2')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-indigo-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.usdv.compliance.point3')}</span>
                            </li>
                          </ul>
                          <div className="p-4 rounded-lg border-l-4 border-indigo-400">
                            <p className="text-white">{t('newWhitepaper.usdv.compliance.conclusion')}</p>
                          </div>
                        </div>
                      </div>

                      {/* 6. 风险与对策 */}
                      <div className="ml-4 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-orange-400 electric-border-inline">{t('newWhitepaper.usdv.risks.title')}</h3>
                        <div className="space-y-4 ml-4">
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-orange-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.usdv.risks.point1')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-orange-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.usdv.risks.point2')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-orange-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.usdv.risks.point3')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-orange-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.usdv.risks.point4')}</span>
                            </li>
                          </ul>
                          <div className="p-4 rounded-lg border-l-4 border-orange-400">
                            <p className="text-white">{t('newWhitepaper.usdv.risks.conclusion')}</p>
                          </div>
                        </div>
                      </div>

                      {/* 7. 愿景与哲学 */}
                      <div className="ml-10 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-pink-400 electric-border-inline">{t('newWhitepaper.usdv.vision.title')}</h3>
                        <div className="space-y-4 ml-4">
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-pink-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.usdv.vision.point1')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-pink-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.usdv.vision.point2')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-pink-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.usdv.vision.point3')}</span>
                            </li>
                          </ul>
                          <div className="p-4 rounded-lg border-l-4 border-pink-400">
                            <p className="text-white">{t('newWhitepaper.usdv.vision.conclusion')}</p>
                          </div>
                        </div>
                      </div>

                      {/* 8. 收尾金句 */}
                      <div className="ml-6 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-cyan-400 electric-border-inline">{t('newWhitepaper.usdv.conclusion.title')}</h3>
                        <div className="space-y-4 ml-4">
                          <div className="p-6 rounded-lg border border-cyan-200 dark:border-cyan-800">
                            <div className="space-y-3">
                              <p className="text-white">{t('newWhitepaper.usdv.conclusion.content1')}</p>
                              <p className="text-white">{t('newWhitepaper.usdv.conclusion.content2')}</p>
                              <p className="text-white">{t('newWhitepaper.usdv.conclusion.content3')}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Whitepaper 3: USD.online */}
            <section className="mb-12">
              <Card className="cyberpunk-card hologram">
                <CardHeader>
                  <CardTitle className="text-3xl bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    {t('newWhitepaper.extended.title')}
                  </CardTitle>
                  <p className="text-xl text-green-400 mt-4">{t('newWhitepaper.extended.subtitle')}</p>
                  <p className="text-lg text-blue-400">{t('newWhitepaper.extended.motto')}</p>
                </CardHeader>
                <CardContent className="space-y-8 text-base leading-7">
                  <div className="prose prose-lg max-w-none text-foreground">
                    <div className="space-y-8">
                      
                      {/* 宏观背景 */}
                      <div className="ml-0 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-green-400 electric-border-inline">{t('newWhitepaper.extended.macroBackground.title')}</h3>
                        <div className="space-y-4 ml-4">
                          <p className="leading-relaxed text-white">{t('newWhitepaper.extended.macroBackground.description')}</p>
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-green-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.extended.macroBackground.point1')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-green-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.extended.macroBackground.point2')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-green-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.extended.macroBackground.point3')}</span>
                            </li>
                          </ul>
                          
                          <div className="p-4 rounded-lg border-l-4 border-green-400">
                            <p className="text-white">{t('newWhitepaper.extended.macroBackground.conclusion')}</p>
                          </div>
                        </div>
                      </div>

                      {/* 市场痛点 */}
                      <div className="ml-4 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-red-400 electric-border-inline">{t('newWhitepaper.extended.painPoints.title')}</h3>
                        <div className="space-y-4 ml-4">
                          <ul className="space-y-3 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-red-400 mt-2">•</span>
                              <div className="text-white">
                                <strong className="text-red-300">{t('newWhitepaper.extended.painPoints.traditional')}</strong><br/>
                                {t('newWhitepaper.extended.painPoints.traditionalDesc')}
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-400 mt-2">•</span>
                              <div className="text-white">
                                <strong className="text-red-300">{t('newWhitepaper.extended.painPoints.crypto')}</strong><br/>
                                {t('newWhitepaper.extended.painPoints.cryptoDesc')}
                              </div>
                            </li>
                          </ul>
                          <div className="p-4 rounded-lg border-l-4 border-red-400">
                            <p className="text-white">{t('newWhitepaper.extended.painPoints.conclusion')}</p>
                          </div>
                        </div>
                      </div>

                      {/* 技术亮点 */}
                      <div className="ml-2 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-blue-400 electric-border-inline">{t('newWhitepaper.extended.techHighlights.title')}</h3>
                        <div className="space-y-6 ml-4">
                          
                          {/* AI 跨链阿尔法引擎 */}
                          <div>
                            <h4 className="text-lg font-medium mb-3 text-cyan-300">{t('newWhitepaper.extended.techHighlights.aiAlpha.title')}</h4>
                            <ul className="space-y-2 ml-6">
                              <li className="flex items-start gap-2">
                                <span className="text-cyan-400 mt-2">•</span>
                                <span className="text-white">{t('newWhitepaper.extended.techHighlights.aiAlpha.point1')}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-cyan-400 mt-2">•</span>
                                <span className="text-white">{t('newWhitepaper.extended.techHighlights.aiAlpha.point2')}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-cyan-400 mt-2">•</span>
                                <span className="text-white">{t('newWhitepaper.extended.techHighlights.aiAlpha.point3')}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-cyan-400 mt-2">•</span>
                                <span className="text-white">{t('newWhitepaper.extended.techHighlights.aiAlpha.point4')}</span>
                              </li>
                            </ul>
                            <div className="mt-4 p-4 rounded-lg border border-cyan-200 dark:border-cyan-800">
                              <p className="leading-relaxed text-white">{t('newWhitepaper.extended.techHighlights.aiAlpha.logic')}</p>
                            </div>
                          </div>

                          {/* AI 量化轮动系统 */}
                          <div>
                            <h4 className="text-lg font-medium mb-3 text-purple-300">{t('newWhitepaper.extended.techHighlights.aiQuant.title')}</h4>
                            <ul className="space-y-2 ml-6">
                              <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-2">•</span>
                                <span className="text-white">{t('newWhitepaper.extended.techHighlights.aiQuant.point1')}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-2">•</span>
                                <span className="text-white">{t('newWhitepaper.extended.techHighlights.aiQuant.point2')}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-2">•</span>
                                <span className="text-white">{t('newWhitepaper.extended.techHighlights.aiQuant.point3')}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-2">•</span>
                                <span className="text-white">{t('newWhitepaper.extended.techHighlights.aiQuant.point4')}</span>
                              </li>
                            </ul>
                            <div className="mt-4 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                              <p className="leading-relaxed text-white">{t('newWhitepaper.extended.techHighlights.aiQuant.logic')}</p>
                            </div>
                          </div>

                          {/* 全球流动性互联 */}
                          <div>
                            <h4 className="text-lg font-medium mb-3 text-green-300">{t('newWhitepaper.extended.techHighlights.liquidity.title')}</h4>
                            <ul className="space-y-2 ml-6">
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-2">•</span>
                                <span className="text-white">{t('newWhitepaper.extended.techHighlights.liquidity.point1')}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-2">•</span>
                                <span className="text-white">{t('newWhitepaper.extended.techHighlights.liquidity.point2')}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-2">•</span>
                                <span className="text-white">{t('newWhitepaper.extended.techHighlights.liquidity.point3')}</span>
                              </li>
                            </ul>
                            <div className="mt-4 p-4 rounded-lg border border-green-200 dark:border-green-800">
                              <p className="leading-relaxed text-white">{t('newWhitepaper.extended.techHighlights.liquidity.logic')}</p>
                            </div>
                          </div>

                          {/* 去中心化托管架构 */}
                          <div>
                            <h4 className="text-lg font-medium mb-3 text-orange-300">{t('newWhitepaper.extended.techHighlights.custody.title')}</h4>
                            <ul className="space-y-2 ml-6">
                              <li className="flex items-start gap-2">
                                <span className="text-orange-400 mt-2">•</span>
                                <span className="text-white">{t('newWhitepaper.extended.techHighlights.custody.point1')}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-orange-400 mt-2">•</span>
                                <span className="text-white">{t('newWhitepaper.extended.techHighlights.custody.point2')}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-orange-400 mt-2">•</span>
                                <span className="text-white">{t('newWhitepaper.extended.techHighlights.custody.point3')}</span>
                              </li>
                            </ul>
                            <div className="mt-4 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                              <p className="leading-relaxed text-white">{t('newWhitepaper.extended.techHighlights.custody.logic')}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 全球监管背书 */}
                      <div className="ml-6 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-indigo-400 electric-border-inline">{t('newWhitepaper.extended.regulation.title')}</h3>
                        <div className="space-y-4 ml-4">
                          <p className="leading-relaxed text-white">{t('newWhitepaper.extended.regulation.description')}</p>
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-indigo-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.extended.regulation.point1')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-indigo-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.extended.regulation.point2')}</span>
                            </li>
                          </ul>
                          
                          <div className="p-4 rounded-lg border-l-4 border-indigo-400">
                            <h4 className="text-lg font-medium text-indigo-300 mb-2">{t('newWhitepaper.extended.regulation.passport')}</h4>
                            <ul className="space-y-1 text-white">
                              <li>{t('newWhitepaper.extended.regulation.passportPoint1')}</li>
                              <li>{t('newWhitepaper.extended.regulation.passportPoint2')}</li>
                              <li>{t('newWhitepaper.extended.regulation.passportPoint3')}</li>
                              <li>{t('newWhitepaper.extended.regulation.passportPoint4')}</li>
                            </ul>
                          </div>
                          
                          <div className="p-4 rounded-lg border-l-4 border-indigo-400">
                            <p className="text-white">{t('newWhitepaper.extended.regulation.conclusion')}</p>
                          </div>
                        </div>
                      </div>

                      {/* 道义阿尔法 */}
                      <div className="ml-8 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-pink-400 electric-border-inline">{t('newWhitepaper.extended.moralAlpha.title')}</h3>
                        <div className="space-y-4 ml-4">
                          <p className="leading-relaxed text-white">{t('newWhitepaper.extended.moralAlpha.description')}</p>
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-pink-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.extended.moralAlpha.point1')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-pink-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.extended.moralAlpha.point2')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-pink-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.extended.moralAlpha.point3')}</span>
                            </li>
                          </ul>
                          
                          <div className="p-4 rounded-lg border-l-4 border-pink-400">
                            <p className="text-white">{t('newWhitepaper.extended.moralAlpha.conclusion')}</p>
                          </div>
                        </div>
                      </div>

                      {/* 愿景 */}
                      <div className="ml-4 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-yellow-400 electric-border-inline">{t('newWhitepaper.extended.vision.title')}</h3>
                        <div className="space-y-4 ml-4">
                          <div className="p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <h4 className="text-lg font-medium text-yellow-300 mb-3">{t('newWhitepaper.extended.vision.statement')}</h4>
                            <p className="text-white mb-3">{t('newWhitepaper.extended.vision.description')}</p>
                            <ul className="space-y-2 text-white">
                              <li>• {t('newWhitepaper.extended.vision.point1')}</li>
                              <li>• {t('newWhitepaper.extended.vision.point2')}</li>
                              <li>• {t('newWhitepaper.extended.vision.point3')}</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* 国际化定位 */}
                      <div className="ml-10 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-teal-400 electric-border-inline">{t('newWhitepaper.extended.international.title')}</h3>
                        <div className="space-y-4 ml-4">
                          <p className="leading-relaxed text-white">{t('newWhitepaper.extended.international.description')}</p>
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-teal-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.extended.international.point1')}</span>
                            </li>
                            <li className="flex items-start gap-2">  
                              <span className="text-teal-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.extended.international.point2')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-teal-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.extended.international.point3')}</span>
                            </li>
                          </ul>
                          
                          <div className="p-4 rounded-lg border-l-4 border-teal-400">
                            <p className="text-white">{t('newWhitepaper.extended.international.conclusion')}</p>
                          </div>
                        </div>
                      </div>

                      {/* 一句话总结 */}
                      <div className="ml-6 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-red-400 electric-border-inline">{t('newWhitepaper.extended.summary.title')}</h3>
                        <div className="space-y-4 ml-4">
                          <div className="p-6 rounded-lg border border-red-200 dark:border-red-800">
                            <p className="text-white text-lg font-medium">{t('newWhitepaper.extended.summary.statement')}</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Whitepaper 4: 道义阿尔法 3.0 */}
            <section className="mb-12">
              <Card className="cyberpunk-card electric-border">
                <CardHeader>
                  <CardTitle className="text-3xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {t('newWhitepaper.moralAlpha3.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 text-base leading-7">
                  <div className="prose prose-lg max-w-none text-foreground">
                    <div className="space-y-8">
                      
                      {/* 概念来源 */}
                      <div className="ml-0 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-purple-400 electric-border-inline">{t('newWhitepaper.moralAlpha3.origin.title')}</h3>
                        <div className="space-y-4 ml-4">
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-purple-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.moralAlpha3.origin.alpha')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.moralAlpha3.origin.morality')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-400 mt-2">•</span>
                              <span className="text-white">{t('newWhitepaper.moralAlpha3.origin.version')}</span>
                            </li>
                          </ul>
                          <div className="p-4 rounded-lg border-l-4 border-purple-400">
                            <p className="text-white">{t('newWhitepaper.moralAlpha3.origin.conclusion')}</p>
                          </div>
                        </div>
                      </div>

                      {/* 进化逻辑 */}
                      <div className="ml-4 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-blue-400 electric-border-inline">{t('newWhitepaper.moralAlpha3.evolution.title')}</h3>
                        <div className="space-y-4 ml-4">
                          <ul className="space-y-3 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-blue-400 mt-2">•</span>
                              <div className="text-white">
                                <strong className="text-blue-300">{t('newWhitepaper.moralAlpha3.evolution.v1')}</strong><br/>
                                {t('newWhitepaper.moralAlpha3.evolution.v1Desc')}
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-blue-400 mt-2">•</span>
                              <div className="text-white">
                                <strong className="text-blue-300">{t('newWhitepaper.moralAlpha3.evolution.v2')}</strong><br/>
                                {t('newWhitepaper.moralAlpha3.evolution.v2Desc')}
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-blue-400 mt-2">•</span>
                              <div className="text-white">
                                <strong className="text-blue-300">{t('newWhitepaper.moralAlpha3.evolution.v3')}</strong><br/>
                                {t('newWhitepaper.moralAlpha3.evolution.v3Desc')}
                              </div>
                            </li>
                          </ul>
                          <div className="p-4 rounded-lg border-l-4 border-blue-400">
                            <p className="text-white">{t('newWhitepaper.moralAlpha3.evolution.v3Detail')}</p>
                          </div>
                        </div>
                      </div>

                      {/* 叙事定义 */}
                      <div className="ml-2 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-green-400 electric-border-inline">{t('newWhitepaper.moralAlpha3.narrative.title')}</h3>
                        <div className="space-y-4 ml-4">
                          <div className="p-6 rounded-lg border border-green-200 dark:border-green-800">
                            <p className="text-white text-lg mb-4">
                              <strong className="text-green-400">{t('newWhitepaper.moralAlpha3.narrative.definition')}</strong>
                            </p>
                            <p className="text-white mb-4">
                              <strong className="text-cyan-400">{t('newWhitepaper.moralAlpha3.narrative.model')}</strong>
                            </p>
                            
                            <p className="text-white mb-3">{t('newWhitepaper.moralAlpha3.narrative.result')}</p>
                            <ul className="space-y-2 text-white">
                              <li>• <strong className="text-yellow-400">{t('newWhitepaper.moralAlpha3.narrative.profit')}</strong></li>
                              <li>• <strong className="text-pink-400">{t('newWhitepaper.moralAlpha3.narrative.goodwill')}</strong></li>
                            </ul>
                          </div>
                          
                          <div className="p-4 rounded-lg border-l-4 border-green-400">
                            <p className="text-white mb-2">{t('newWhitepaper.moralAlpha3.narrative.explanation')}</p>
                            <p className="text-white">{t('newWhitepaper.moralAlpha3.narrative.mechanism')}</p>
                          </div>
                        </div>
                      </div>

                      {/* 国际化表达 */}
                      <div className="ml-6 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-orange-400 electric-border-inline">{t('newWhitepaper.moralAlpha3.international.title')}</h3>
                        <div className="space-y-4 ml-4">
                          <p className="leading-relaxed text-white">{t('newWhitepaper.moralAlpha3.international.description')}</p>
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-orange-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-orange-300">{t('newWhitepaper.moralAlpha3.international.ethical')}</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-orange-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-orange-300">{t('newWhitepaper.moralAlpha3.international.moral')}</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-orange-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-orange-300">{t('newWhitepaper.moralAlpha3.international.compassion')}</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-orange-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-orange-300">{t('newWhitepaper.moralAlpha3.international.civilizational')}</strong></span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* 座右铭 */}
                      <div className="ml-8 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-pink-400 electric-border-inline">{t('newWhitepaper.moralAlpha3.motto.title')}</h3>
                        <div className="space-y-4 ml-4">
                          <div className="space-y-4">
                            <div className="p-4 rounded-lg border-l-4 border-pink-400">
                              <p className="text-white">「{t('newWhitepaper.moralAlpha3.motto.quote1')}」</p>
                            </div>
                            <div className="p-4 rounded-lg border-l-4 border-cyan-400">
                              <p className="text-white">「{t('newWhitepaper.moralAlpha3.motto.quote2')}」</p>
                            </div>
                            <div className="p-4 rounded-lg border-l-4 border-yellow-400">
                              <p className="text-white">「{t('newWhitepaper.moralAlpha3.motto.quote3')}」</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 结束语 */}
                      <div className="ml-4 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-red-400 electric-border-inline">{t('newWhitepaper.moralAlpha3.conclusion.title')}</h3>
                        <div className="space-y-4 ml-4">
                          <div className="p-6 rounded-lg border border-red-200 dark:border-red-800">
                            <p className="text-white text-lg mb-4">
                              <strong className="text-red-400">{t('newWhitepaper.moralAlpha3.conclusion.content1')}</strong>
                            </p>
                            <p className="text-white">
                              {t('newWhitepaper.moralAlpha3.conclusion.content2')}
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Continue with other whitepapers using similar cyberpunk styling... */}
            {/* For brevity, I'm showing the pattern but not repeating all sections */}
          </div>
        </div>
      </div>
    </div>
  );
}
