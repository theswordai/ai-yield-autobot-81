import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, ArrowRight, Gift, Shield, Zap, Globe, Star, TrendingUp } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { useNavigate, useLocation } from "react-router-dom";

interface InvitationLandingPageProps {
  onClose: () => void;
  onProceed: () => void;
}

export default function InvitationLandingPage({ onClose, onProceed }: InvitationLandingPageProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get current language prefix
  const currentPath = location.pathname;
  const langMatch = currentPath.match(/^\/([a-z]{2})/);
  const langPrefix = langMatch ? `/${langMatch[1]}` : '/zh';
  
  const goToReferral = () => {
    navigate(`${langPrefix}/referral`);
  };

  return (
    <div className="fixed inset-0 bg-gradient-dark backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-4xl w-full bg-gradient-to-br from-card/95 to-card/90 backdrop-blur border-accent/20 relative">
          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
          >
            <X className="w-5 h-5" />
          </Button>

          <CardContent className="p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                <Globe className="w-8 h-8 text-primary" />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {t("invitationLanding.title")}
                </span>
              </div>
            </div>

            {/* One-liner positioning */}
            <div className="text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-accent" />
                <span className="font-semibold text-lg">{t("invitationLanding.positioning.title")}</span>
              </div>
              <p className="text-foreground font-medium">
                {t("invitationLanding.positioning.line1")}<br />
                {t("invitationLanding.positioning.line2")}
              </p>
            </div>

            {/* Why choose us */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xl font-bold text-center justify-center">
                <Star className="w-6 h-6 text-accent" />
                <span>{t("invitationLanding.whyChoose.title")}</span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Stable Returns */}
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-primary">
                      <TrendingUp className="w-5 h-5" />
                      {t("invitationLanding.whyChoose.stableReturns.title")}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("invitationLanding.whyChoose.stableReturns.desc")}
                    </p>
                  </CardContent>
                </Card>

                {/* Security */}
                <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-accent">
                      <Shield className="w-5 h-5" />
                      {t("invitationLanding.whyChoose.security.title")}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("invitationLanding.whyChoose.security.desc")}
                    </p>
                  </CardContent>
                </Card>

                {/* Flexible Exit */}
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-primary">
                      <ArrowRight className="w-5 h-5" />
                      {t("invitationLanding.whyChoose.flexibility.title")}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("invitationLanding.whyChoose.flexibility.desc")}
                    </p>
                  </CardContent>
                </Card>

                {/* Civilization Narrative */}
                <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-accent">
                      <Globe className="w-5 h-5" />
                      {t("invitationLanding.whyChoose.narrative.title")}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("invitationLanding.whyChoose.narrative.desc")}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Future Dividends */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <Gift className="w-5 h-5 text-accent" />
                  <span>{t("invitationLanding.whyChoose.futureRewards.title")}</span>
                </div>
                <p className="text-sm">
                  {t("invitationLanding.whyChoose.futureRewards.desc")}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div>{t("invitationLanding.whyChoose.futureRewards.static")}</div>
                  <div>{t("invitationLanding.whyChoose.futureRewards.dynamic")}</div>
                  <div>{t("invitationLanding.whyChoose.futureRewards.team")}</div>
                </div>
              </CardContent>
            </Card>

            {/* Ecosystem */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-center">{t("invitationLanding.advantage.title")}</h3>
              <p className="text-center text-muted-foreground">
                {t("invitationLanding.advantage.subtitle")}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div className="text-center p-2 rounded bg-primary/5">{t("invitationLanding.advantage.tech")}</div>
                <div className="text-center p-2 rounded bg-accent/5">{t("invitationLanding.advantage.finance")}</div>
                <div className="text-center p-2 rounded bg-primary/5">{t("invitationLanding.advantage.security")}</div>
                <div className="text-center p-2 rounded bg-accent/5">{t("invitationLanding.advantage.governance")}</div>
                <div className="text-center p-2 rounded bg-primary/5">{t("invitationLanding.advantage.charity")}</div>
                <div className="text-center p-2 rounded bg-accent/5">{t("invitationLanding.advantage.ai")}</div>
              </div>
            </div>

            {/* Gift Package */}
            <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-accent/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 font-bold text-accent">
                  <Gift className="w-6 h-6" />
                  <span>{t("invitationLanding.giftPackage.title")}</span>
                </div>
                <p className="text-sm font-medium">{t("invitationLanding.giftPackage.subtitle")}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
                  <div>{t("invitationLanding.giftPackage.item1")}</div>
                  <div>{t("invitationLanding.giftPackage.item2")}</div>
                  <div>{t("invitationLanding.giftPackage.item3")}</div>
                  <div>{t("invitationLanding.giftPackage.item4")}</div>
                  <div>{t("invitationLanding.giftPackage.item5")}</div>
                  <div>{t("invitationLanding.giftPackage.item6")}</div>
                </div>
              </CardContent>
            </Card>

            {/* Compliance */}
            <div className="text-xs text-muted-foreground space-y-2 border-t pt-4">
              <h4 className="font-semibold text-foreground">{t("invitationLanding.compliance.title")}</h4>
              <div className="space-y-1">
                <p>{t("invitationLanding.compliance.risk")}</p>
                <p>{t("invitationLanding.compliance.terms")}</p>
                <p>{t("invitationLanding.compliance.privacy")}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={goToReferral}
                className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90 h-12"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                {t("invitationLanding.buttons.toCharity")}
              </Button>
              <Button
                onClick={onProceed}
                variant="outline"
                className="flex-1 h-12"
              >
                {t("invitationLanding.buttons.startExperience")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}