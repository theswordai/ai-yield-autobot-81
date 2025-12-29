import { useTranslation } from 'react-i18next';
import { PriceState } from '@/lib/prices';

interface DataSourceBadgeProps {
  connectionStatus: PriceState['connectionStatus'];
  dataSource: PriceState['dataSource'];
}

export function DataSourceBadge({ connectionStatus, dataSource }: DataSourceBadgeProps) {
  const { t } = useTranslation();

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-accent/20 text-accent border-accent/30';
      case 'connecting':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'degraded':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-destructive/20 text-destructive border-destructive/30';
    }
  };

  const getLabel = () => {
    if (dataSource === 'binance-ws') {
      return connectionStatus === 'connected' ? t('dashboard.liveViaBinance') : t('dashboard.connecting');
    }
    if (dataSource === 'coingecko-rest') {
      return t('dashboard.liveViaREST');
    }
    return t('dashboard.disconnected');
  };

  const getPulse = () => {
    if (connectionStatus === 'connected') {
      return (
        <span className="relative flex h-2 w-2 mr-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      );
    }
    if (connectionStatus === 'connecting') {
      return (
        <span className="w-2 h-2 mr-2 rounded-full bg-current animate-pulse"></span>
      );
    }
    return <span className="w-2 h-2 mr-2 rounded-full bg-current opacity-50"></span>;
  };

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
      {getPulse()}
      {getLabel()}
    </div>
  );
}
