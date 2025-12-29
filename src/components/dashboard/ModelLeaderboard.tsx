import { useState } from 'react';
import { MODEL_CONFIGS } from '@/lib/models';
import { AllModelsState } from '@/lib/models/types';
import { calculateMetrics, CalculatedMetrics } from '@/lib/metrics';
import { ModelCard } from './ModelCard';
import { ArrowUpDown } from 'lucide-react';

type SortField = 'apy7d' | 'return30d' | 'maxDrawdown' | 'volatility30d';

interface ModelLeaderboardProps {
  modelsState: AllModelsState;
  selectedModelId: string | null;
  onSelectModel: (id: string) => void;
}

export function ModelLeaderboard({ modelsState, selectedModelId, onSelectModel }: ModelLeaderboardProps) {
  const [sortField, setSortField] = useState<SortField>('apy7d');
  const [sortAsc, setSortAsc] = useState(false);

  // Calculate metrics for all models
  const modelsWithMetrics = MODEL_CONFIGS.map(config => {
    const model = modelsState.models[config.id];
    const metrics = model ? calculateMetrics(model) : {
      pnlTotalPct: 0,
      pnlDailyPct: 0,
      apy7d: 0,
      return30d: 0,
      volatility30d: 0,
      maxDrawdown: 0,
      winRate: 50,
      tradeCount: 0,
      sharpeRatio: 0,
    };
    return {
      config,
      model,
      metrics,
    };
  });

  // Sort models
  const sortedModels = [...modelsWithMetrics].sort((a, b) => {
    let aVal = a.metrics[sortField];
    let bVal = b.metrics[sortField];
    
    // For drawdown, lower is better so invert
    if (sortField === 'maxDrawdown') {
      aVal = -aVal;
      bVal = -bVal;
    }
    
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortButtons: { field: SortField; label: string }[] = [
    { field: 'apy7d', label: 'APY' },
    { field: 'return30d', label: '30D' },
    { field: 'maxDrawdown', label: 'DD' },
    { field: 'volatility30d', label: 'Vol' },
  ];

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Sort by:</span>
        {sortButtons.map(({ field, label }) => (
          <button
            key={field}
            onClick={() => toggleSort(field)}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
              sortField === field
                ? 'bg-primary/20 text-primary'
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
            }`}
          >
            {label}
            {sortField === field && (
              <ArrowUpDown className={`w-3 h-3 ${sortAsc ? 'rotate-180' : ''}`} />
            )}
          </button>
        ))}
      </div>

      {/* Model Cards */}
      <div className="space-y-3">
        {sortedModels.map(({ config, model, metrics }) => (
          <ModelCard
            key={config.id}
            config={config}
            nav={model?.currentNav || 1}
            status={model?.status || 'ACTIVE'}
            metrics={metrics}
            isSelected={selectedModelId === config.id}
            onClick={() => onSelectModel(config.id)}
          />
        ))}
      </div>
    </div>
  );
}
