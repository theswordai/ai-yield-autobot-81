import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ferrariAsset from "@/assets/news-ferrari.png.asset.json";
import conferenceAsset from "@/assets/news-conference.png.asset.json";

export function NewsAnnouncement() {
  const { t, language } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [zoomImg, setZoomImg] = useState<string | null>(null);
  const [detailIds, setDetailIds] = useState<Set<number>>(new Set());

  const gallery = [
    { url: ferrariAsset.url, alt: language === 'en' ? 'Campaign 1' : '活动一' },
    { url: conferenceAsset.url, alt: language === 'en' ? 'Global Conference' : '全球大会' },
  ];

  const announcements = [
    {
      id: 11,
      title: "$BULL 领取说明",
      titleEn: "$BULL Claim Instructions",
      content: "各位合伙人：\n\n$BULL 兑换规则如下，请仔细阅读：\n\n符合条件的地址可在官网兑换 BULL。兑换成功后，立即到账总额的 3%，其余 97% 进入锁仓。锁仓部分线性解锁，随时间持续释放，不是一次性到账。\n\n页面上的「预计 24 小时新增可领」是根据当前解锁进度估算的参考值，表示大约再过 24 小时，锁仓里还会再解锁多少。这不是额外空投，也不会增加你的总配额。\n\n已解锁部分可随时点击「领取」；未解锁部分需等待时间释放后再领。\n\n未来领取到钱包后的 BULL，可以在 PancakeSwap 实现交易；交易后可能会收取卖税用于回流流动性。希望所有合伙人在 45 天内完成动换币动作后学会去 PancakeSwap 交易。\n\n请以钱包地址对应的链上数据为准。具体领币实际操作步骤会有文字说明提示或与客服进行沟通。\n\n感谢理解与支持。",
      contentEn: "Dear Partners:\n\nPlease read the $BULL claim rules carefully:\n\nEligible addresses can migrate to BULL on the official website. Upon successful migration, 3% of the total entitlement is credited immediately, and the remaining 97% enters vesting. The vested portion is released linearly over time — it is not a one-time distribution.\n\nThe \"Estimated 24h newly claimable\" figure shown on the page is a reference value calculated based on the current unlock progress. It indicates approximately how much more will be unlocked from vesting over the next 24 hours. This is not an additional airdrop and does not increase your total allocation.\n\nUnlocked portions can be claimed at any time by clicking \"Claim\"; unvested portions must wait for time-based release before they can be claimed.\n\nBULL received in your wallet can be traded on PancakeSwap; a sell tax may be applied to trades to replenish liquidity. We encourage all partners to complete the migration and learn to trade on PancakeSwap within 45 days.\n\nPlease refer to the on-chain data corresponding to your wallet address as the authoritative source. Detailed step-by-step claim instructions will be provided via written guidance or through customer service.\n\nThank you for your understanding and support.",
      date: "2026-07-23",
      time: "10:00 CEST",
      source: "USD.ONLINE 官方",
      sourceEn: "USD.ONLINE Official",
      type: "event",
      urgent: true,
    },
    {
      id: 10,
      title: "关于 USDV 兑换 BULL 安排的通知",
      titleEn: "Notice on USDV to BULL Conversion Arrangements",
      content: "尊敬的各位合伙人：\n\n第一步：现就 USDV 兑换 BULL 相关安排通知如下：\n\n功能开发进度\n\n因 USDV 合约受到污染，相关兑换通道需重新部署与校验。技术团队正加紧开发与安全测试，预计在 十个工作日内 完成 USDV 兑换 BULL 功能上线。\n\n领币功能继续开放，请已满足条件的用户按指引正常操作与领取，等待完成兑换重要步骤。\n\n第二步与第三步会逐步展开，敬请期待。\n\n请广大合伙人以官网公告为准，谨防非官方链接与虚假信息。功能上线时间如有调整，将第一时间另行通知。\n\n感谢大家的理解与支持。再次表示感谢",
      contentEn: "Dear Partners:\n\nStep 1: We hereby notify you of the arrangements for USDV to BULL conversion:\n\nDevelopment Progress\n\nDue to contamination of the USDV contract, the relevant conversion channels need to be redeployed and verified. The technical team is accelerating development and security testing, and expects to complete the USDV to BULL conversion feature launch within ten working days.\n\nThe token claiming function remains open. Eligible users please follow the instructions to operate and claim normally, and await the completion of this important conversion step.\n\nStep 2 and Step 3 will be rolled out gradually. Please stay tuned.\n\nAll partners are requested to refer to official website announcements and beware of unofficial links and false information. If the launch time is adjusted, a further notice will be issued at the earliest opportunity.\n\nThank you for your understanding and support. Once again, thank you.",
      date: "2026-07-09",
      time: "12:00 CEST",
      source: "USD.ONLINE 官方",
      sourceEn: "USD.ONLINE Official",
      type: "alert",
      urgent: true,
    },
    {
      id: 9,
      title: "平台功能恢复公告",
      titleEn: "Platform Function Recovery Announcement",
      content: "尊敬的各位合伙人：\n\n平台目前使大部分功能恢复正常运行，团队各项工作有序推进。\n\n针对近期链上安全事件，鉴于黑客攻击与链上博弈的复杂性、多样性，技术团队正全力推进系统修复与功能恢复。我们对未来逐步实现全部功能充满信心。\n\n感谢大家的耐心等待，不便之处敬请谅解，谢谢。请以官网公告为准。",
      contentEn: "Dear Partners:\n\nMost platform functions have now returned to normal operation, and all team work is proceeding in an orderly manner.\n\nRegarding the recent on-chain security incident, given the complexity and diversity of hacker attacks and on-chain games, the technical team is making every effort to advance system repair and function recovery. We are fully confident that all functions will be gradually restored in the future.\n\nThank you for your patience, and we apologize for any inconvenience caused. Please refer to official website announcements.",
      date: "2026-07-09",
      time: "10:00 CEST",
      source: "USD.ONLINE 官方",
      sourceEn: "USD.ONLINE Official",
      type: "alert",
      urgent: true,
    },
    {
      id: 8,
      title: "关于遭受有预谋链上恶意攻击的紧急公告",
      titleEn: "Urgent Announcement on Pre-Planned On-Chain Malicious Attack",
      content: "尊敬的各位合伙人：\n\n经初步研判，本次事件系外部恶意攻击所致，因本次链上黑客团队攻击手段高度复杂、痕迹非常隐蔽，技术团队需更多时间完成链上信息收集与溯源分析。我们预计在 7 月 10 日前公布调查进展及解决方案。请以官网公告为准。感谢大家的耐心等待。",
      contentEn: "Based on preliminary analysis, this incident was caused by external malicious attacks. The on-chain hacker team employed highly complex and extremely covert attack methods. The technical team needs more time to complete on-chain information collection and traceability analysis. We expect to announce investigation progress and solutions before July 10. Please refer to official website announcements. Thank you for your patience.",
      date: "2026-06-30",
      time: "07:49 CEST",
      source: "USD.ONLINE 官方",
      sourceEn: "USD.ONLINE Official",
      type: "alert",
      urgent: true,
    },
    {
      id: 7,
      title: "紧急安全公告",
      titleEn: "Urgent Security Notice",
      content: "项目遭遇未授权黑客攻击，团队正在紧急排查处理。请勿继续向本项目投入资金。本次事件给用户带来的不便，我们深表歉意。",
      contentEn: "The project has suffered an unauthorized hacker attack. The team is urgently investigating and handling the issue. Please do not continue to deposit funds into this project. We sincerely apologize for the inconvenience caused to users.",
      date: "2026-06-28",
      time: "02:00 CEST",
      source: "USD.ONLINE 官方",
      sourceEn: "USD.ONLINE Official",
      type: "alert",
      urgent: true,
    },
    {
      id: 6,
      title: "GLOBAL ANNOUNCEMENT — A New Era Begins",
      titleEn: "GLOBAL ANNOUNCEMENT — A New Era Begins",
      content: `June 20, 2026 USD.ONLINE will officially launch globally.\n\nThis is not merely a launch; it is a global enterprise forged for the next decade.\n\nFollowing extensive preparation and strategic planning, the project has successfully completed its compliance structuring in the United Kingdom and continues to accelerate its global expansion strategy. Simultaneously, the FutureDAOX ecosystem is actively under development. Grounded in AI, big data, advanced algorithms, and blockchain technology, it is dedicated to building a next-generation digital value ecosystem. Moving forward, the FutureDAO project will actively explore growth opportunities within international capital markets, strictly adhering to local laws, regulations, and compliance requirements.\n\nTo drive the construction of our global ecosystem, we are officially initiating:\n\nFounding Partner Program\n\nNational Partner Program\n\nRegional Leader Program\n\nThe initial cohort of Global Partners will have the exclusive opportunity to participate in ecosystem development and market expansion. In accordance with future institutional frameworks, partners will receive corresponding incentive rights and growth opportunities.\n\nOur Conviction\n\nThe greatest opportunities of the future do not belong to those who wait, but to those who take the initiative.\n\nThe greatest value of the future stems not just from possessing resources, but from actively participating in value creation.\n\nWho We Are Looking For\n\nVisionary entrepreneurs with big dreams\n\nDriven leaders with established teams\n\nForward-thinking investors\n\nTrailblazers ready to embrace the era of AI and the digital economy\n\nToday's participants may well become the pivotal contributors to tomorrow's ecosystem.\n\nUSD.ONLINE FutureDAO\n\nGlobal Launch · Global Recruitment · Global Co-Creation Connecting the World, Creating the Future.`,
      contentEn: `June 20, 2026 USD.ONLINE will officially launch globally.\n\nThis is not merely a launch; it is a global enterprise forged for the next decade.\n\nFollowing extensive preparation and strategic planning, the project has successfully completed its compliance structuring in the United Kingdom and continues to accelerate its global expansion strategy. Simultaneously, the FutureDAOX ecosystem is actively under development. Grounded in AI, big data, advanced algorithms, and blockchain technology, it is dedicated to building a next-generation digital value ecosystem. Moving forward, the FutureDAO project will actively explore growth opportunities within international capital markets, strictly adhering to local laws, regulations, and compliance requirements.\n\nTo drive the construction of our global ecosystem, we are officially initiating:\n\nFounding Partner Program\n\nNational Partner Program\n\nRegional Leader Program\n\nThe initial cohort of Global Partners will have the exclusive opportunity to participate in ecosystem development and market expansion. In accordance with future institutional frameworks, partners will receive corresponding incentive rights and growth opportunities.\n\nOur Conviction\n\nThe greatest opportunities of the future do not belong to those who wait, but to those who take the initiative.\n\nThe greatest value of the future stems not just from possessing resources, but from actively participating in value creation.\n\nWho We Are Looking For\n\nVisionary entrepreneurs with big dreams\n\nDriven leaders with established teams\n\nForward-thinking investors\n\nTrailblazers ready to embrace the era of AI and the digital economy\n\nToday's participants may well become the pivotal contributors to tomorrow's ecosystem.\n\nUSD.ONLINE FutureDAO\n\nGlobal Launch · Global Recruitment · Global Co-Creation Connecting the World, Creating the Future.`,
      date: "2026-06-20",
      time: "02:00 CEST",
      source: "USD.ONLINE 官方",
      sourceEn: "USD.ONLINE Official",
      type: "event",
      urgent: true,
    },
    {
      id: 5,
      title: "USD.ONLINE 2026年6月20日正式上线",
      titleEn: "USD.ONLINE Officially Launches on June 20, 2026",
      content: "USD.ONLINE将于2026年6月20日正式上线，敬请期待",
      contentEn: "USD.ONLINE will officially launch on June 20, 2026. Stay tuned.",
      date: "2026-06-20",
      time: "02:00 CEST",
      source: "USD.ONLINE 官方",
      sourceEn: "USD.ONLINE Official",
      type: "event",
      urgent: true,
    },
    {
      id: 4,
      title: "USD.ONLINE兑换功能已上线",
      titleEn: "USD.ONLINE Swap Feature is Now Live",
      content: "USD.ONLINE DEX兑换功能已正式上线，支持多币种快速兑换",
      contentEn: "USD.ONLINE DEX swap feature is now live, supporting fast multi-token swaps",
      date: "2026-04-15",
      time: "14:00 CEST",
      source: "USD.ONLINE 官方",
      sourceEn: "USD.ONLINE Official",
      type: "event",
      urgent: false,
    },
    {
      id: 3,
      title: "USD.ONLINE主网将于2026年Q2正式上线",
      titleEn: "USD.ONLINE Mainnet to Launch in Q2 2026",
      content: "USD.ONLINE主网将于2026年第二季度正式上线，敬请期待",
      contentEn: "USD.ONLINE mainnet will officially launch in Q2 2026, stay tuned",
      date: "2025-11-17",
      time: "11:20 CET",
      source: "USD.ONLINE 官方",
      sourceEn: "USD.ONLINE Official",
      type: "event",
      urgent: false,
    },
    {
      id: 2,
      title: "加入全球善意计划",
      titleEn: "Join the Global Goodwill Plan",
      content: "芝麻开门 · 善意化为财富 · 价值融合之旅启程",
      contentEn: "Open Sesame· Goodwill Becomes Wealth · The Journey of Value Fusion Begins",
      date: "2025-09-14",
      time: "10:15 CEST",
      source: "USD.ONLINE 官方",
      sourceEn: "USD.ONLINE Official",
      type: "event",
      urgent: false,
    },
    {
      id: 1,
      title: "USD.ONLINE即将上线🚀",
      titleEn: "USD.ONLINE LAUNCH SOON🚀",
      content: "USD.ONLINE平台即将正式上线，为用户带来全新的数字资产体验",
      contentEn: "USD.ONLINE platform is launching soon, bringing users a new digital asset experience",
      date: "2025-09",
      time: "08:00 CEST",
      source: "USD.ONLINE 官方",
      sourceEn: "USD.ONLINE Official",
      type: "event",
      urgent: true,
    },
  ];

  const latest = announcements[0];
  const rest = announcements.slice(1);
  const visibleItems = expanded ? announcements : [latest];

  const toggleDetail = (id: number) => {
    setDetailIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground tracking-wide">NEWS</h3>
        <span className="px-3 py-1 text-xs font-bold tracking-wider border border-primary/50 text-primary rounded bg-primary/10">
          LIVE
        </span>
      </div>

      {/* Campaign images thumbnails */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {gallery.map((img) => (
          <button
            key={img.url}
            type="button"
            onClick={() => setZoomImg(img.url)}
            className="group relative overflow-hidden rounded-lg border border-primary/30 bg-card/60 hover:border-primary/60 transition-colors"
          >
            <img
              src={img.url}
              alt={img.alt}
              loading="lazy"
              className="w-full h-24 sm:h-32 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </button>
        ))}
      </div>

      {/* Timeline items */}
      <div className="space-y-3">
        {visibleItems.map((announcement) => {
          const isOpen = detailIds.has(announcement.id);
          return (
            <div
              key={announcement.id}
              className="relative pl-4 border-l-2 border-primary/60 rounded-r-lg bg-card/60 p-4 hover:bg-card/80 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground leading-relaxed flex-1">
                  {language === 'en' ? announcement.titleEn : announcement.title}
                </p>
                <span className="shrink-0 px-2 py-0.5 text-[10px] font-semibold text-primary bg-primary/10 rounded border border-primary/20">
                  {announcement.date}
                </span>
              </div>
              <button
                onClick={() => toggleDetail(announcement.id)}
                className="mt-2 flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {isOpen ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    {language === 'en' ? 'Collapse' : '收起'}
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    {language === 'en' ? 'View Details' : '查看详情'}
                  </>
                )}
              </button>
              {isOpen && (
                <div className="mt-3">
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
                    <span>
                      {language === 'en' ? 'Published: ' : '发布时间: '}
                      {announcement.date} {announcement.time}
                    </span>
                    <span className="w-px h-3 bg-border/50" />
                    <span>
                      {language === 'en' ? 'Source: ' : '来源: '}
                      {language === 'en' ? announcement.sourceEn : announcement.source}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {language === 'en' ? announcement.contentEn : announcement.content}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>


      {/* Expand/Collapse */}
      {rest.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-card/60 hover:bg-card/80 transition-colors text-sm font-medium text-muted-foreground border border-border/20"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              {language === 'en' ? 'Collapse' : '收起'}
            </>
          ) : (
            <>
              {language === 'en' ? `View ${rest.length} more` : `查看更多 ${rest.length} 条`}
            </>
          )}
        </button>
      )}

      {/* Zoom dialog */}
      <Dialog open={!!zoomImg} onOpenChange={(o) => !o && setZoomImg(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl p-2 bg-background/95 border-primary/40">
          {zoomImg && (
            <img
              src={zoomImg}
              alt="zoom"
              className="w-full h-auto max-h-[85vh] object-contain rounded"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

