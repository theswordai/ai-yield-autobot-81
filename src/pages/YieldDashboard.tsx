import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { usePriceStream } from '@/hooks/usePriceStream';
import { useModelSimulator } from '@/hooks/useModelSimulator';
import { MODEL_CONFIGS, getModelConfig } from '@/lib/models';
import { DataSourceBadge, MarketTicker, ModelLeaderboard, ModelDetail } from '@/components/dashboard';

export default function YieldDashboard() {
  const priceState = usePriceStream();
  const { models, resetModel } = useModelSimulator(priceState.ticks);
  const [selectedModelId, setSelectedModelId] = useState<string>(MODEL_CONFIGS[0].id);

  const selectedConfig = getModelConfig(selectedModelId);
  const selectedModel = models[selectedModelId];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Yield Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">AI-powered yield optimization models</p>
          </div>
          <DataSourceBadge 
            connectionStatus={priceState.connectionStatus} 
            dataSource={priceState.dataSource} 
          />
        </div>

        {/* Market Ticker */}
        <div className="mb-6">
          <MarketTicker ticks={priceState.ticks} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Model Leaderboard */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-foreground mb-4">Model Leaderboard</h2>
            <ModelLeaderboard
              modelsState={{ models, lastGlobalUpdate: Date.now() }}
              selectedModelId={selectedModelId}
              onSelectModel={setSelectedModelId}
            />
          </div>

          {/* Right: Model Detail */}
          <div className="lg:col-span-2">
            {selectedConfig && selectedModel && (
              <ModelDetail
                config={selectedConfig}
                model={selectedModel}
                onReset={() => resetModel(selectedModelId)}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
