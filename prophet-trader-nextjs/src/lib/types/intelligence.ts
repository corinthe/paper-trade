/**
 * Intelligence and analysis types
 */

export interface NewsArticle {
  source: string;
  title: string;
  url: string;
  author?: string;
  published_at: Date;
  content?: string;
  summary?: string;
  symbols?: string[];
  sentiment?: number;
  relevance?: number;
}

export interface CleanedNews {
  summary: string;
  key_points: string[];
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  relevant_symbols: string[];
  articles_analyzed: number;
}

export interface TechnicalIndicators {
  rsi: number;
  rsi_signal: 'oversold' | 'overbought' | 'neutral';
  sma_20: number;
  sma_50: number;
  sma_200: number;
  ema_12: number;
  ema_26: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
    signal_type: 'bullish' | 'bearish' | 'neutral';
  };
  bollinger_bands: {
    upper: number;
    middle: number;
    lower: number;
    position: 'above' | 'below' | 'inside';
  };
  trend: 'uptrend' | 'downtrend' | 'sideways';
  support_levels: number[];
  resistance_levels: number[];
}

export interface StockAnalysisResult {
  symbol: string;
  current_price: number;
  technical: TechnicalIndicators;
  news_sentiment?: CleanedNews;
  ai_recommendation: {
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    reasoning: string;
    entry_price?: number;
    stop_loss?: number;
    take_profit?: number;
    risk_reward_ratio?: number;
  };
  analyzed_at: Date;
}

export interface MarketIntelligence {
  market_summary: string;
  top_movers: {
    gainers: Array<{ symbol: string; change: number }>;
    losers: Array<{ symbol: string; change: number }>;
  };
  sector_performance: Record<string, number>;
  news_highlights: NewsArticle[];
  overall_sentiment: 'bullish' | 'bearish' | 'neutral';
  generated_at: Date;
}
