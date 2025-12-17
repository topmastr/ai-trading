export interface TradeSetup {
  type: 'BUY' | 'SELL' | 'WAIT';
  entryPrice: string;
  stopLoss: string;
  takeProfit1: string;
  takeProfit2: string;
  takeProfit3: string;
  riskRewardRatio: string;
  confidence: number;
  reasoning: string;
  timeframe: string;
  confluences: string[];
  strategies: string[]; // e.g., ["ICT", "Liquidity Sweep"]
  session?: string; // e.g., "NY Killzone"
  expected_return: string;
  max_drawdown: string;
  timestamp?: string;
  // Money Management Fields
  lotSize?: number;
  riskAmount?: number;
  potentialProfit?: number;
  status?: 'PENDING' | 'WIN' | 'LOSS';
}

export type TradingStyle = 'SCALPING' | 'DAY_TRADING' | 'SWING';

export interface NewsItem {
  title: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  source?: string;
  url?: string;
}

export interface MoneyPlanStep {
  day: number;
  startBalance: number;
  targetProfit: number;
  endBalance: number;
  riskAmount: number; // Based on strict management
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface SystemLog {
  id: string;
  timestamp: string;
  module: string;
  message: string;
  status: 'OK' | 'WARN' | 'ERROR';
}

export interface AppSettings {
  notifications: boolean;
  emailAlerts: boolean;
  autoRisk: boolean;
  theme: 'dark' | 'light';
  apiKey?: string;
}