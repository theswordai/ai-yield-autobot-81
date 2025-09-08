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
                    🌐 USDV 白皮书
                  </CardTitle>
                  <p className="text-xl text-cyan-400 mt-4">文明生物链 · 全球金融的新物种</p>
                  <p className="text-lg text-purple-400">副标题：AI × Crypto × Science —— 生态只是表层，生物链才是本质</p>
                </CardHeader>
                <CardContent className="space-y-8 text-base leading-7">
                  <div className="prose prose-lg max-w-none text-foreground">
                    <div className="space-y-8">
                      
                      {/* 1. 项目背景 */}
                      <div className="ml-0 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-blue-400 electric-border-inline">1. 项目背景（宏观大势）</h3>
                        <div className="space-y-4 ml-4">
                          <p className="leading-relaxed text-white">全球金融正处于百年未有之大变局：</p>
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-blue-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-cyan-400">美元霸权衰退：</strong>布雷顿森林体系正在崩解，世界寻求新的信任锚点。</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-blue-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-cyan-400">AI 金融崛起：</strong>AI 不再只是工具，而是文明级力量，正在重写资本流动与价值创造逻辑。</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-blue-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-cyan-400">多极化格局：</strong>SWIFT 制裁、稳定币扩张、区域结算体系，让全球进入数字化多极时代。</span>
                            </li>
                          </ul>
                          <div className="p-4 rounded-lg border-l-4 border-blue-400">
                            <p className="text-white">👉 <strong className="text-blue-400">USDV = 站在大势之上的金融新物种，不是产品，而是文明的跃迁。</strong></p>
                          </div>
                        </div>
                      </div>

                      {/* 2. 市场痛点 */}
                      <div className="ml-4 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-purple-400 electric-border-inline">2. 市场痛点（旧世界的枷锁）</h3>
                        <div className="space-y-4 ml-4">
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-purple-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-purple-300">传统金融：</strong>封闭 + 垄断，跨境低效，信任成本高。</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-purple-300">加密金融：</strong>零散 + 投机，缺乏价值锚定，无法形成长期共识。</span>
                            </li>
                          </ul>
                          <div className="p-4 rounded-lg border-l-4 border-purple-400">
                            <p className="text-white">👉 <strong className="text-purple-400">旧世界的问题 = 信任、效率、透明度的缺失。</strong></p>
                            <p className="text-white">👉 <strong className="text-purple-400">新世界的答案 = AI × 区块链 × 文明叙事。</strong></p>
                          </div>
                        </div>
                      </div>

                      {/* 3. 技术与生态 */}
                      <div className="ml-2 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-green-400 electric-border-inline">3. 技术与生态（文明生物链）</h3>
                        <div className="space-y-6 ml-4">
                          <p className="leading-relaxed text-white">USDV 的核心不是功能拼盘，而是 <strong className="text-green-400">文明生物链</strong> —— 从 DNA 到大脑的进化链。</p>
                          
                          <div className="space-y-4">
                            <h4 className="text-lg font-medium text-cyan-300">六大生态链：</h4>
                            <ul className="space-y-3 ml-6">
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-2">1.</span>
                                <span className="text-white"><strong className="text-cyan-400">技术生态 = DNA</strong> → AI 引擎、跨链协议、预言机、zk 模块。</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-2">2.</span>
                                <span className="text-white"><strong className="text-red-400">金融生态 = 心脏</strong> → 套利、AI 轮动、RWA、做市网络。</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-2">3.</span>
                                <span className="text-white"><strong className="text-orange-400">安全生态 = 免疫系统</strong> → MPC 金库、断路器、审计体系。</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-2">4.</span>
                                <span className="text-white"><strong className="text-yellow-400">治理生态 = 社会制度</strong> → DAO、veUSDV、Booster NFT。</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-2">5.</span>
                                <span className="text-white"><strong className="text-pink-400">公益生态 = 精神系统</strong> → 慈善基金、善意回报、全球公益榜单。</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-2">6.</span>
                                <span className="text-white"><strong className="text-purple-400">AI 超级智能 = 大脑</strong> → AI 代理、智能治理、个性化财富引擎。</span>
                              </li>
                            </ul>
                          </div>
                          
                          <div className="p-4 rounded-lg border-l-4 border-green-400">
                            <p className="text-white">👉 <strong className="text-green-400">USDV = 一个能 自我生长、自我复制、自我进化 的金融文明生命体。</strong></p>
                          </div>
                        </div>
                      </div>

                      {/* 4. 收益逻辑 */}
                      <div className="ml-6 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-yellow-400 electric-border-inline">4. 收益逻辑（财富从何而来）</h3>
                        <div className="space-y-4 ml-4">
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-yellow-300">套利差价：</strong>CEX × DEX 价差 + MEV 捕捉。</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-yellow-300">趋势轮动：</strong>AI 模型驱动，涨跌皆有机会。</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-yellow-300">质押复利：</strong>稳定收益 + 链上再质押。</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-yellow-300">RWA 收益：</strong>债券、基金、票据上链。</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-yellow-300">公益 Alpha：</strong>善意注入，信任放大，资本反哺。</span>
                            </li>
                          </ul>
                          <div className="p-4 rounded-lg border-l-4 border-yellow-400">
                            <p className="text-white">👉 <strong className="text-yellow-400">USDV = 技术护城河 × 收益闭环 × 文明叙事。</strong></p>
                          </div>
                        </div>
                      </div>

                      {/* 5. 合规愿景 */}
                      <div className="ml-8 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-indigo-400 electric-border-inline">5. 合规愿景（FCA + MAS）</h3>
                        <div className="space-y-4 ml-4">
                          <p className="leading-relaxed text-white">USDV 始终把 <strong className="text-indigo-400">合规与透明</strong> 放在战略核心：</p>
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-indigo-400 mt-2">•</span>
                              <span className="text-white">已启动与 <strong className="text-indigo-300">英国 FCA、新加坡 MAS</strong> 的合规对接流程。</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-indigo-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-indigo-300">路径：</strong>备案 → 沙盒测试 → 豁免框架 → 全面合规。</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-indigo-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-indigo-300">愿景：</strong>FCA + MAS = 全球信任护照。</span>
                            </li>
                          </ul>
                          <div className="p-4 rounded-lg border-l-4 border-indigo-400">
                            <p className="text-white">👉 <strong className="text-indigo-400">合规不仅是保护伞，更是 USDV 进入全球资本市场的 信任基石。</strong></p>
                          </div>
                        </div>
                      </div>

                      {/* 6. 风险与对策 */}
                      <div className="ml-4 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-orange-400 electric-border-inline">6. 风险与对策</h3>
                        <div className="space-y-4 ml-4">
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-orange-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-orange-300">市场风险</strong> → 多链路由、自动止损、动态避险。</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-orange-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-orange-300">算法风险</strong> → 分仓策略、RL 优化、止损阈值。</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-orange-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-orange-300">合约风险</strong> → 多重审计、MPC 多签、Bug Bounty。</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-orange-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-orange-300">合规风险</strong> → 模块化架构，灵活适配全球监管变化。</span>
                            </li>
                          </ul>
                          <div className="p-4 rounded-lg border-l-4 border-orange-400">
                            <p className="text-white">👉 <strong className="text-orange-400">工程化对冲 + 透明披露 = 放大信任。</strong></p>
                          </div>
                        </div>
                      </div>

                      {/* 7. 愿景与哲学 */}
                      <div className="ml-10 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-pink-400 electric-border-inline">7. 愿景与哲学（道义阿尔法 3.0）</h3>
                        <div className="space-y-4 ml-4">
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-pink-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-pink-300">道义阿尔法 3.0：</strong>善意 = 信任 → 信任 = 流动性 → 流动性 = 收益。</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-pink-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-pink-300">布雷顿森林 2.0：</strong>USDV = 链上结算与国际资本的新锚点。</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-pink-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-pink-300">文明生物链：</strong>技术 = DNA，金融 = 心脏，安全 = 免疫，治理 = 制度，公益 = 灵魂，AI = 大脑。</span>
                            </li>
                          </ul>
                          <div className="p-4 rounded-lg border-l-4 border-pink-400">
                            <p className="text-white">👉 <strong className="text-pink-400">USDV = 从金融协议，跃迁为 金融文明的生命体。</strong></p>
                          </div>
                        </div>
                      </div>

                      {/* 8. 收尾金句 */}
                      <div className="ml-6 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-cyan-400 electric-border-inline">8. 收尾金句</h3>
                        <div className="space-y-4 ml-4">
                          <div className="p-6 rounded-lg border border-cyan-200 dark:border-cyan-800">
                            <div className="space-y-3">
                              <p className="text-white">📌 <strong className="text-cyan-400">别人讲生态 = 功能拼盘。</strong></p>
                              <p className="text-white">📌 <strong className="text-cyan-400">USDV 讲生物链 = 文明新物种。</strong></p>
                              <p className="text-white">📌 <strong className="text-cyan-400">数美在线（USD.online）= 让这个新物种真正落地的全球舞台。</strong></p>
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
                    🚀 USD.online · 数美在线
                  </CardTitle>
                  <p className="text-xl text-green-400 mt-4">AI 驱动的全球流动性文明引擎</p>
                  <p className="text-lg text-blue-400">算法即自由 · 叙事即价值 · 资本即文明</p>
                </CardHeader>
                <CardContent className="space-y-8 text-base leading-7">
                  <div className="prose prose-lg max-w-none text-foreground">
                    <div className="space-y-8">
                      
                      {/* 宏观背景 */}
                      <div className="ml-0 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-green-400 electric-border-inline">🌍 宏观背景：百年未有之大变局</h3>
                        <div className="space-y-4 ml-4">
                          <p className="leading-relaxed text-white">全球金融体系正处于历史性的临界点：</p>
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-green-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-green-300">布雷顿森林体系的信任坍塌</strong> —— 美元不再是唯一的全球信用锚。</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-green-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-green-300">美元霸权的数字化延伸</strong> —— SWIFT、稳定币、地缘割裂，形成碎片化秩序。</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-green-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-green-300">AI 算法文明的崛起</strong> —— 智能模型正在重写资本流动与价值创造的逻辑。</span>
                            </li>
                          </ul>
                          
                          <div className="p-4 rounded-lg border-l-4 border-green-400">
                            <p className="text-white">在这样的背景下，USD.online 不只是平台，而是文明的原型：</p>
                            <p className="text-white">它融合 <strong className="text-cyan-400">华尔街的量化智慧</strong> × <strong className="text-purple-400">Web3 的去中心化精神</strong> × <strong className="text-green-400">AI 的自适应智能</strong>，</p>
                            <p className="text-white">打造一个超越投资的 <strong className="text-green-400">国际金融文明引擎</strong>。</p>
                          </div>
                        </div>
                      </div>

                      {/* 市场痛点 */}
                      <div className="ml-4 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-red-400 electric-border-inline">❌ 市场痛点</h3>
                        <div className="space-y-4 ml-4">
                          <ul className="space-y-3 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-red-400 mt-2">•</span>
                              <div className="text-white">
                                <strong className="text-red-300">传统金融 = 封闭 + 垄断</strong><br/>
                                跨境资本流动受制于央行与清算体系，效率低、信任成本高。
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-400 mt-2">•</span>
                              <div className="text-white">
                                <strong className="text-red-300">加密金融 = 零散 + 投机</strong><br/>
                                CEX 与 DEX 割裂，叙事缺乏长期锚点，信任机制脆弱。
                              </div>
                            </li>
                          </ul>
                          <div className="p-4 rounded-lg border-l-4 border-red-400">
                            <p className="text-white">👉 <strong className="text-red-400">市场需要的不是产品，而是文明级新秩序。</strong></p>
                          </div>
                        </div>
                      </div>

                      {/* 技术亮点 */}
                      <div className="ml-2 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-blue-400 electric-border-inline">🔑 数美在线的技术亮点</h3>
                        <div className="space-y-6 ml-4">
                          
                          {/* AI 跨链阿尔法引擎 */}
                          <div>
                            <h4 className="text-lg font-medium mb-3 text-cyan-300">🔹 AI 跨链阿尔法引擎</h4>
                            <ul className="space-y-2 ml-6">
                              <li className="flex items-start gap-2">
                                <span className="text-cyan-400 mt-2">•</span>
                                <span className="text-white"><strong className="text-cyan-300">24/7 自适应执行：</strong>DEX 套利 + MEV 捕捉 + 跨链延迟套利。</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-cyan-400 mt-2">•</span>
                                <span className="text-white"><strong className="text-cyan-300">全链生态覆盖：</strong>Base / Arbitrum / Solana / Layer2。</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-cyan-400 mt-2">•</span>
                                <span className="text-white"><strong className="text-cyan-300">Alpha 优化器：</strong>RL（强化学习）实时进化策略。</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-cyan-400 mt-2">•</span>
                                <span className="text-white"><strong className="text-cyan-300">10% Performance Fee：</strong>与全球顶尖对冲基金对标。</span>
                              </li>
                            </ul>
                            <div className="mt-4 p-4 rounded-lg border border-cyan-200 dark:border-cyan-800">
                              <p className="leading-relaxed text-white">👉 逻辑：每一次价差，就是一次文明现金流的创造。</p>
                            </div>
                          </div>

                          {/* AI 量化轮动系统 */}
                          <div>
                            <h4 className="text-lg font-medium mb-3 text-purple-300">🔹 AI 量化轮动系统</h4>
                            <ul className="space-y-2 ml-6">
                              <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-2">•</span>
                                <span className="text-white"><strong className="text-purple-300">GPT-4 × 链上大数据</strong> → 动态因子轮动模型。</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-2">•</span>
                                <span className="text-white"><strong className="text-purple-300">多维策略：</strong>趋势增强 + 波动对冲 + 相关性套利。</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-2">•</span>
                                <span className="text-white"><strong className="text-purple-300">核心资产：</strong>BTC / ETH / SOL → 概率分布建模。</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-2">•</span>
                                <span className="text-white"><strong className="text-purple-300">1–2% 管理费：</strong>机构级策略，链上透明。</span>
                              </li>
                            </ul>
                            <div className="mt-4 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                              <p className="leading-relaxed text-white">👉 逻辑：AI 替人类博取 Alpha，财富全天候跳动。</p>
                            </div>
                          </div>

                          {/* 全球流动性互联 */}
                          <div>
                            <h4 className="text-lg font-medium mb-3 text-green-300">🔹 全球流动性互联（CEX × DEX Aggregation）</h4>
                            <ul className="space-y-2 ml-6">
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-2">•</span>
                                <span className="text-white">打通 Binance / Coinbase 与链上流动性池。</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-2">•</span>
                                <span className="text-white">T+0 跨境清算，取代传统银行 2–5 天周期。</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-2">•</span>
                                <span className="text-white">构建 <strong className="text-green-400">全球流动性统一体</strong>。</span>
                              </li>
                            </ul>
                            <div className="mt-4 p-4 rounded-lg border border-green-200 dark:border-green-800">
                              <p className="leading-relaxed text-white">👉 逻辑：掌握流动性，就是掌握新文明的心脏。</p>
                            </div>
                          </div>

                          {/* 去中心化托管架构 */}
                          <div>
                            <h4 className="text-lg font-medium mb-3 text-orange-300">🔹 去中心化托管架构（Decentralized Custody Protocol）</h4>
                            <ul className="space-y-2 ml-6">
                              <li className="flex items-start gap-2">
                                <span className="text-orange-400 mt-2">•</span>
                                <span className="text-white">MPC 金库 + 智能合约，双重安全。</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-orange-400 mt-2">•</span>
                                <span className="text-white">资金与善款流动，链上可见。</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-orange-400 mt-2">•</span>
                                <span className="text-white">算法即信任，合约即金融。</span>
                              </li>
                            </ul>
                            <div className="mt-4 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                              <p className="leading-relaxed text-white">👉 逻辑：信任不再依赖人，而是写进代码。</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 全球监管背书 */}
                      <div className="ml-6 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-indigo-400 electric-border-inline">🏛 全球监管背书</h3>
                        <div className="space-y-4 ml-4">
                          <p className="leading-relaxed text-white"><strong className="text-indigo-400">USD.online 正在推进 FCA + MAS 合规路径</strong></p>
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-indigo-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-indigo-300">英国金融行为监管局（FCA）</strong> 合规备案与授权筹备。</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-indigo-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-indigo-300">新加坡金融管理局（MAS）</strong> 框架下的沙盒与豁免路径。</span>
                            </li>
                          </ul>
                          
                          <div className="p-4 rounded-lg border-l-4 border-indigo-400">
                            <h4 className="text-lg font-medium text-indigo-300 mb-2">FCA + MAS = 全球信任护照</h4>
                            <ul className="space-y-1 text-white">
                              <li>📜 <strong className="text-indigo-300">合法合规：</strong>严格对标国际金融监管框架。</li>
                              <li>🔍 <strong className="text-indigo-300">公开透明：</strong>资金与数据链上可追溯。</li>
                              <li>🛡 <strong className="text-indigo-300">投资保障：</strong>为投资人 & 合作伙伴提供法律保护。</li>
                              <li>🌍 <strong className="text-indigo-300">国际通行证：</strong>成为全球资本秩序的信任锚点。</li>
                            </ul>
                          </div>
                          
                          <div className="p-4 rounded-lg border-l-4 border-indigo-400">
                            <p className="text-white">👉 <strong className="text-indigo-400">合规不是护盾，而是文明进化的入场券。</strong></p>
                          </div>
                        </div>
                      </div>

                      {/* 道义阿尔法 */}
                      <div className="ml-8 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-pink-400 electric-border-inline">🔮 道义阿尔法（Moral Alpha）：哲学核心</h3>
                        <div className="space-y-4 ml-4">
                          <p className="leading-relaxed text-white">USD.online 的独特性，不止金融与技术，而在于文明哲学。</p>
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-pink-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-pink-300">算法释放自由：</strong>AI 成为人类意志的链上投射，让资本脱离垄断，回归自由流动。</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-pink-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-pink-300">资本重塑秩序：</strong>从掠夺逻辑，转化为跨境公共脉动；从霸权逻辑，走向共识逻辑。</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-pink-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-pink-300">叙事成为财富引擎：</strong>财富的真正源泉，不是资源，而是叙事、信任与善意。</span>
                            </li>
                          </ul>
                          
                          <div className="p-4 rounded-lg border-l-4 border-pink-400">
                            <p className="text-white">👉 <strong className="text-pink-400">道义阿尔法 = 金融正收益 + 技术新秩序 + 文明共识红利。</strong></p>
                            <p className="text-white">这让 USD.online 不只是金融协议，而是 <strong className="text-pink-400">金融文明的实验原型</strong>。</p>
                          </div>
                        </div>
                      </div>

                      {/* 愿景 */}
                      <div className="ml-4 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-yellow-400 electric-border-inline">🌟 愿景</h3>
                        <div className="space-y-4 ml-4">
                          <div className="p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <h4 className="text-lg font-medium text-yellow-300 mb-3">USD.online = 链上时代的布雷顿森林体系 2.0</h4>
                            <p className="text-white mb-3">它不只是金融产品，而是：</p>
                            <ul className="space-y-2 text-white">
                              <li>• AI × DeFi × Stablecoin × Meme 共识的跨界融合；</li>
                              <li>• 全球资本叙事驱动的共同体秩序；</li>
                              <li>• 新国际金融体系的雏形。</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* 国际化定位 */}
                      <div className="ml-10 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-teal-400 electric-border-inline">🌐 国际化定位</h3>
                        <div className="space-y-4 ml-4">
                          <p className="leading-relaxed text-white"><strong className="text-teal-400">USD.online = 未来金融文明的原型。</strong></p>
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-teal-400 mt-2">•</span>
                              <span className="text-white">AI → 成为金融语言</span>
                            </li>
                            <li className="flex items-start gap-2">  
                              <span className="text-teal-400 mt-2">•</span>
                              <span className="text-white">资本 → 成为全球脉动</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-teal-400 mt-2">•</span>
                              <span className="text-white">叙事 → 成为财富源泉</span>
                            </li>
                          </ul>
                          
                          <div className="p-4 rounded-lg border-l-4 border-teal-400">
                            <p className="text-white">👉 最终，USD.online 将成为：</p>
                            <p className="text-white"><strong className="text-teal-400">全球金融文明跃迁的信任基石。</strong></p>
                          </div>
                        </div>
                      </div>

                      {/* 一句话总结 */}
                      <div className="ml-6 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-red-400 electric-border-inline">📌 一句话高端总结</h3>
                        <div className="space-y-4 ml-4">
                          <div className="p-6 rounded-lg border border-red-200 dark:border-red-800">
                            <p className="text-white text-lg font-medium"><strong className="text-red-400">USD.online 不是项目，而是文明。</strong></p>
                            <p className="text-white">它让 <strong className="text-cyan-400">算法释放自由</strong>，<strong className="text-purple-400">资本重塑秩序</strong>，<strong className="text-yellow-400">叙事成为财富的永恒引擎</strong>。</p>
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
                    🔮 道义阿尔法 3.0：USD.online 的文明哲学核心
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 text-base leading-7">
                  <div className="prose prose-lg max-w-none text-foreground">
                    <div className="space-y-8">
                      
                      {/* 概念来源 */}
                      <div className="ml-0 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-purple-400 electric-border-inline">🔹 一、概念来源</h3>
                        <div className="space-y-4 ml-4">
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-purple-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-purple-300">Alpha（阿尔法）</strong> 在金融学中 = 超额收益，是投资策略的核心竞争力。</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-purple-300">道义（Morality / Ethics）</strong> = 公益、慈善、责任，属于文明层面价值观。</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-400 mt-2">•</span>
                              <div className="text-white">
                                <strong className="text-purple-300">3.0</strong> = 升级迭代：<br/>
                                从 <strong className="text-cyan-400">利润导向 (1.0)</strong> → <strong className="text-yellow-400">共赢导向 (2.0)</strong> → <strong className="text-pink-400">文明导向 (3.0)</strong>。
                              </div>
                            </li>
                          </ul>
                          <div className="p-4 rounded-lg border-l-4 border-purple-400">
                            <p className="text-white">👉 <strong className="text-purple-400">道义阿尔法 3.0 = 把财富增长与人类善意融合在同一条算法中。</strong></p>
                          </div>
                        </div>
                      </div>

                      {/* 进化逻辑 */}
                      <div className="ml-4 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-blue-400 electric-border-inline">🔹 二、进化逻辑</h3>
                        <div className="space-y-4 ml-4">
                          <ul className="space-y-3 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-blue-400 mt-2">•</span>
                              <div className="text-white">
                                <strong className="text-blue-300">道义阿尔法 1.0 → 慈善捐赠</strong><br/>
                                财富与善意分离：先赚钱，再捐款。
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-blue-400 mt-2">•</span>
                              <div className="text-white">
                                <strong className="text-blue-300">道义阿尔法 2.0 → ESG 投资</strong><br/>
                                收益与责任兼顾：企业层面，仍偏重于商业逻辑。
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-blue-400 mt-2">•</span>
                              <div className="text-white">
                                <strong className="text-blue-300">道义阿尔法 3.0 → 算法驱动 × 公益内嵌 × 全球共建</strong><br/>
                                财富增长与公益不再分离，而是 <strong className="text-blue-400">同一个算法的双重回报</strong>。
                              </div>
                            </li>
                          </ul>
                          <div className="p-4 rounded-lg border-l-4 border-blue-400">
                            <p className="text-white">👉 <strong className="text-blue-400">投资人赚到的超额收益，自动部分流向慈善文明基金。</strong></p>
                          </div>
                        </div>
                      </div>

                      {/* 叙事定义 */}
                      <div className="ml-2 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-green-400 electric-border-inline">🔹 三、叙事定义</h3>
                        <div className="space-y-4 ml-4">
                          <div className="p-6 rounded-lg border border-green-200 dark:border-green-800">
                            <p className="text-white text-lg mb-4">
                              <strong className="text-green-400">道义阿尔法 3.0 =</strong>
                            </p>
                            <p className="text-white mb-4">
                              <strong className="text-cyan-400">AI + 区块链驱动的超额收益模型。</strong>
                            </p>
                            
                            <p className="text-white mb-3">其结果是：</p>
                            <ul className="space-y-2 text-white">
                              <li>• <strong className="text-yellow-400">利润</strong> → 投资人的超额收益。</li>
                              <li>• <strong className="text-pink-400">善意</strong> → 自动注入慈善基金，放大文明共识。</li>
                            </ul>
                          </div>
                          
                          <div className="p-4 rounded-lg border-l-4 border-green-400">
                            <p className="text-white mb-2">换句话说：</p>
                            <p className="text-white"><strong className="text-green-400">投资的成功 = 公益的壮大。</strong></p>
                            <p className="text-white"><strong className="text-green-400">善意越强 → 共识越大 → 资本流动越广 → 投资收益越高。</strong></p>
                          </div>
                        </div>
                      </div>

                      {/* 国际化表达 */}
                      <div className="ml-6 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-orange-400 electric-border-inline">🔹 四、国际化表达</h3>
                        <div className="space-y-4 ml-4">
                          <p className="leading-relaxed text-white">为了在全球叙事中统一语言，道义阿尔法 3.0 可以有多重国际化定义：</p>
                          <ul className="space-y-2 ml-6">
                            <li className="flex items-start gap-2">
                              <span className="text-orange-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-orange-300">Ethical Alpha 3.0</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-orange-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-orange-300">Moral Alpha Protocol</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-orange-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-orange-300">Compassion-Driven Alpha</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-orange-400 mt-2">•</span>
                              <span className="text-white"><strong className="text-orange-300">Civilizational Alpha</strong></span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* 座右铭 */}
                      <div className="ml-8 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-pink-400 electric-border-inline">🔹 五、座右铭</h3>
                        <div className="space-y-4 ml-4">
                          <div className="space-y-4">
                            <div className="p-4 rounded-lg border-l-4 border-pink-400">
                              <p className="text-white">「在道义阿尔法 3.0 的世界里，<strong className="text-pink-400">善意不再是额外成本，而是超额收益的源泉</strong>。」</p>
                            </div>
                            <div className="p-4 rounded-lg border-l-4 border-cyan-400">
                              <p className="text-white">「<strong className="text-cyan-400">资本因算法而流动，因道义而升华</strong>。」</p>
                            </div>
                            <div className="p-4 rounded-lg border-l-4 border-yellow-400">
                              <p className="text-white">「<strong className="text-yellow-400">Alpha 不止于超额收益，更是金融文明的进化红利</strong>。」</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 结束语 */}
                      <div className="ml-4 transform transition-all duration-300 hover:translate-x-2">
                        <h3 className="text-2xl font-semibold mb-4 text-red-400 electric-border-inline">📌 结束语</h3>
                        <div className="space-y-4 ml-4">
                          <div className="p-6 rounded-lg border border-red-200 dark:border-red-800">
                            <p className="text-white text-lg mb-4">
                              <strong className="text-red-400">道义阿尔法 3.0 = 财富文明 × 慈善文明 × 全球共建。</strong>
                            </p>
                            <p className="text-white mb-4">
                              它是 <strong className="text-red-400">USD.online 的哲学核心</strong>，也是为什么这个项目不是单纯的逐利工具，
                            </p>
                            <p className="text-white">
                              而是一个能让 <strong className="text-cyan-400">财富裂变</strong> 与 <strong className="text-purple-400">文明进化</strong> 同步发生的 <strong className="text-red-400">人类新金融范式</strong>。
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
