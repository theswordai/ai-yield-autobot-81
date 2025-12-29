import { useTranslation } from 'react-i18next';
import { ModelEvent } from '@/lib/models/types';
import { Activity, ArrowRightLeft, LogIn, LogOut, Settings } from 'lucide-react';

interface EventLogProps {
  events: ModelEvent[];
}

const EVENT_ICONS = {
  rebalance: ArrowRightLeft,
  entry: LogIn,
  exit: LogOut,
  adjustment: Settings,
};

const EVENT_COLORS = {
  rebalance: 'text-primary',
  entry: 'text-accent',
  exit: 'text-amber-400',
  adjustment: 'text-muted-foreground',
};

export function EventLog({ events }: EventLogProps) {
  const { t, i18n } = useTranslation();
  const sortedEvents = [...events].sort((a, b) => b.ts - a.ts).slice(0, 10);

  if (sortedEvents.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        <Activity className="w-4 h-4 mr-2" />
        {t('dashboard.noEvents')}
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
      {sortedEvents.map((event, idx) => {
        const Icon = EVENT_ICONS[event.type];
        const color = EVENT_COLORS[event.type];
        const time = new Date(event.ts);

        return (
          <div
            key={`${event.ts}-${idx}`}
            className="flex items-start gap-3 p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <Icon className={`w-4 h-4 mt-0.5 ${color}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground truncate">{event.message}</p>
              <p className="text-xs text-muted-foreground">
                {time.toLocaleTimeString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
