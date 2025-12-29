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
    baseDrift: 0.00085,     // Balanced for ~380% APY
    volatility: 0.008,
    beta: 0.8,
    meanReversion: 0.15,
    jumpProb: 0.008,
    jumpSize: 0.015,
  },
  {
    id: 'helios-ai',
    name: 'Helios-AI',
    tagline: 'AI Rotation / Trend',
    description: 'Machine learning-driven trend following with dynamic asset rotation',
    underlying: ['BTC', 'ETH', 'SOL'],
    risk: 'MID',
    baseDrift: 0.00075,     // Balanced for ~320% APY
    volatility: 0.006,
    beta: 0.5,
    meanReversion: 0.18,
    jumpProb: 0.005,
    jumpSize: 0.01,
  },
  {
    id: 'delta-vault',
    name: 'Delta-Vault',
    tagline: 'Staking / Restaking Yield Base',
    description: 'Stable yield generation through optimized staking and restaking strategies',
    underlying: ['ETH', 'SOL'],
    risk: 'LOW',
    baseDrift: 0.00065,     // Balanced for ~240% APY
    volatility: 0.004,
    beta: 0.2,
    meanReversion: 0.2,
    jumpProb: 0.003,
    jumpSize: 0.008,
  },
  {
    id: 'omega-event',
    name: 'Omega-Event',
    tagline: 'On-chain Event Driven',
    description: 'Captures alpha from on-chain events, governance, and market catalysts',
    underlying: ['BTC', 'ETH', 'BNB'],
    risk: 'HIGH',
    baseDrift: 0.0008,      // Balanced for ~360% APY
    volatility: 0.007,
    beta: 0.7,
    meanReversion: 0.12,
    jumpProb: 0.01,
    jumpSize: 0.012,
  },
];

export function getModelConfig(id: string): ModelConfig | undefined {
  return MODEL_CONFIGS.find(m => m.id === id);
}
