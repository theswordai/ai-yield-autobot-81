import { Navbar } from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/useI18n";

export default function Team() {
  const { t } = useI18n();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Helmet>
        <title>{t('meta.title')} | {t('team.title')}</title>
        <meta name="description" content={t('team.description')} />
        <link rel="canonical" href="/team" />
      </Helmet>
      
      <div className="pt-16 min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 cyber-grid">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Header */}
            <div className="text-center space-y-6 mb-16">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent neon-text">
                {t('team.title')}
              </h1>
              <div className="h-1 w-32 mx-auto bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full electric-border"></div>
            </div>

            {/* Company Introduction */}
            <section className="mb-12">
              <Card className="cyberpunk-card hologram">
                <CardHeader>
                  <CardTitle className="text-3xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {t('team.company.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-base leading-7">
                  <p className="text-foreground leading-relaxed text-lg">
                    {t('team.company.description')}
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Our Team */}
            <section className="mb-12">
              <Card className="cyberpunk-card hologram">
                <CardHeader>
                  <CardTitle className="text-3xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {t('team.ourTeam.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-base leading-7">
                  <p className="text-foreground leading-relaxed text-lg">
                    {t('team.ourTeam.description')}
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Team Members */}
            <section className="space-y-8">
              {/* Chris Chew */}
              <Card className="cyberpunk-card hologram border-l-4 border-cyan-400">
                <CardHeader>
                  <CardTitle className="text-2xl text-cyan-400">
                    {t('team.members.chris.name')}
                  </CardTitle>
                  <p className="text-lg text-muted-foreground">{t('team.members.chris.title')}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground leading-relaxed">
                    {t('team.members.chris.intro')}
                  </p>
                  <ul className="space-y-3 ml-6">
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-2">▶</span>
                      <span className="text-foreground">{t('team.members.chris.point1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-2">▶</span>
                      <span className="text-foreground">{t('team.members.chris.point2')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-2">▶</span>
                      <span className="text-foreground">{t('team.members.chris.point3')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-2">▶</span>
                      <span className="text-foreground">{t('team.members.chris.point4')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-2">▶</span>
                      <span className="text-foreground">{t('team.members.chris.point5')}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Grant Lee */}
              <Card className="cyberpunk-card hologram border-l-4 border-purple-400">
                <CardHeader>
                  <CardTitle className="text-2xl text-purple-400">
                    {t('team.members.grant.name')}
                  </CardTitle>
                  <p className="text-lg text-muted-foreground">{t('team.members.grant.title')}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground leading-relaxed">
                    {t('team.members.grant.intro')}
                  </p>
                  <ul className="space-y-3 ml-6">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-2">▶</span>
                      <span className="text-foreground">{t('team.members.grant.point1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-2">▶</span>
                      <span className="text-foreground">{t('team.members.grant.point2')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-2">▶</span>
                      <span className="text-foreground">{t('team.members.grant.point3')}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Frank Gabriele */}
              <Card className="cyberpunk-card hologram border-l-4 border-blue-400">
                <CardHeader>
                  <CardTitle className="text-2xl text-blue-400">
                    {t('team.members.frank.name')}
                  </CardTitle>
                  <p className="text-lg text-muted-foreground">{t('team.members.frank.title')}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3 ml-6">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-2">▶</span>
                      <span className="text-foreground">{t('team.members.frank.point1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-2">▶</span>
                      <span className="text-foreground">{t('team.members.frank.point2')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-2">▶</span>
                      <span className="text-foreground">{t('team.members.frank.point3')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-2">▶</span>
                      <span className="text-foreground">{t('team.members.frank.point4')}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Ying Huang */}
              <Card className="cyberpunk-card hologram border-l-4 border-green-400">
                <CardHeader>
                  <CardTitle className="text-2xl text-green-400">
                    {t('team.members.ying.name')}
                  </CardTitle>
                  <p className="text-lg text-muted-foreground">{t('team.members.ying.title')}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3 ml-6">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-2">▶</span>
                      <span className="text-foreground">{t('team.members.ying.point1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-2">▶</span>
                      <span className="text-foreground">{t('team.members.ying.point2')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-2">▶</span>
                      <span className="text-foreground">{t('team.members.ying.point3')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-2">▶</span>
                      <span className="text-foreground">{t('team.members.ying.point4')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-2">▶</span>
                      <span className="text-foreground">{t('team.members.ying.point5')}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
