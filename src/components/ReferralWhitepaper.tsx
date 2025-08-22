import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useI18n } from "@/hooks/useI18n";

export function ReferralWhitepaper() {
  const { t } = useI18n();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('referralWhitepaper.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm leading-6">
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="staking">
            <AccordionTrigger>{t('referralWhitepaper.staking.title')}</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>{t('referralWhitepaper.staking.period')}</li>
                <li>{t('referralWhitepaper.staking.dailyRate')}</li>
                <li>{t('referralWhitepaper.staking.linear')}</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="fees">
            <AccordionTrigger>{t('referralWhitepaper.fees.title')}</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>{t('referralWhitepaper.fees.managementFee')}</li>
                <li>{t('referralWhitepaper.fees.earlyWithdrawal')}</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="invite">
            <AccordionTrigger>{t('referralWhitepaper.invite.title')}</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>{t('referralWhitepaper.invite.binding')}</li>
                <li>{t('referralWhitepaper.invite.teamStaking')}</li>
                <li>{t('referralWhitepaper.invite.levels')}
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>{t('referralWhitepaper.invite.lv1')}</li>
                    <li>{t('referralWhitepaper.invite.lv2')}</li>
                    <li>{t('referralWhitepaper.invite.lv3')}</li>
                    <li>{t('referralWhitepaper.invite.lv4')}</li>
                    <li>{t('referralWhitepaper.invite.lv5')}</li>
                  </ul>
                </li>
                <li>{t('referralWhitepaper.invite.levelChange')}</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="settle">
            <AccordionTrigger>{t('referralWhitepaper.settlement.title')}</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>{t('referralWhitepaper.settlement.rewardBase')}</li>
                <li>{t('referralWhitepaper.settlement.distribution')}</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="usdo">
            <AccordionTrigger>{t('referralWhitepaper.usdo.title')}</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>{t('referralWhitepaper.usdo.totalSupply')}</li>
                <li>{t('referralWhitepaper.usdo.mintingRule')}</li>
                <li>{t('referralWhitepaper.usdo.capProtection')}</li>
                <li>{t('referralWhitepaper.usdo.transferSwitch')}</li>
                <li>{t('referralWhitepaper.usdo.narrative')}</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq">
            <AccordionTrigger>{t('referralWhitepaper.faq.title')}</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>{t('referralWhitepaper.faq.q1')}</li>
                <li>{t('referralWhitepaper.faq.q2')}</li>
                <li>{t('referralWhitepaper.faq.q3')}</li>
                <li>{t('referralWhitepaper.faq.q4')}</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="example">
            <AccordionTrigger>{t('referralWhitepaper.example.title')}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-muted-foreground">
                <p>{t('referralWhitepaper.example.scenario')}</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>{t('referralWhitepaper.example.managementFee')}</li>
                  <li>{t('referralWhitepaper.example.reward')}</li>
                  <li>{t('referralWhitepaper.example.split')}</li>
                  <li>{t('referralWhitepaper.example.usdo')}</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}