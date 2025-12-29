export type ModelStatus = 'ACTIVE' | 'SCALING' | 'COOLING';
export type RiskLevel = 'LOW' | 'MID' | 'HIGH';

export interface ModelConfig {
  id: string;
  name: string;
  tagline: string;
  description: string;
  underlying: string[];
  risk: RiskLevel;
  // Simulation parameters
  baseDrift: number;      // Base daily return (annualized ~280%+)
  volatility: number;     // Daily volatility
  beta: number;           // Market sensitivity
  meanReversion: number;  // Mean reversion strength
  jumpProb: number;       // Probability of jump per tick
  jumpSize: number;       // Jump magnitude
}

export const MODEL_CONFIGS: ModelConfig[] = [
  {
    id: 'atlas-x',
    name: 'Atlas-X',
    tagline: 'Cross-chain Alpha Engine',
    description: 'High-frequency cross-chain arbitrage exploiting price discrepancies across DEXs',
    underlying: ['BTC', 'ETH', 'SOL', 'BNB'],
    risk: 'HIGH',
    baseDrift: 0.0012,      // ~320% APY base
    volatility: 0.015,
    beta: 1.5,
    meanReversion: 0.1,
    jumpProb: 0.02,
    jumpSize: 0.03,
  },
  {
    id: 'helios-ai',
    name: 'Helios-AI',
    tagline: 'AI Rotation / Trend',
    description: 'Machine learning-driven trend following with dynamic asset rotation',
    underlying: ['BTC', 'ETH', 'SOL'],
    risk: 'MID',
    baseDrift: 0.001,       // ~290% APY base
    volatility: 0.01,
    beta: 0.8,
    meanReversion: 0.15,
    jumpProb: 0.01,
    jumpSize: 0.02,
  },
  {
    id: 'delta-vault',
    name: 'Delta-Vault',
    tagline: 'Staking / Restaking Yield Base',
    description: 'Stable yield generation through optimized staking and restaking strategies',
    underlying: ['ETH', 'SOL'],
    risk: 'LOW',
    baseDrift: 0.0008,      // ~280% APY base
    volatility: 0.005,
    beta: 0.3,
    meanReversion: 0.2,
    jumpProb: 0.005,
    jumpSize: 0.01,
  },
  {
    id: 'omega-event',
    name: 'Omega-Event',
    tagline: 'On-chain Event Driven',
    description: 'Captures alpha from on-chain events, governance, and market catalysts',
    underlying: ['BTC', 'ETH', 'BNB'],
    risk: 'HIGH',
    baseDrift: 0.0011,      // ~300% APY base
    volatility: 0.012,
    beta: 1.2,
    meanReversion: 0.05,
    jumpProb: 0.04,
    jumpSize: 0.05,
  },
];

export function getModelConfig(id: string): ModelConfig | undefined {
  return MODEL_CONFIGS.find(m => m.id === id);
}
