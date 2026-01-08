/**
 * Claude AI Service
 * Handles AI-powered news analysis and stock recommendations
 * Supports mock mode for testing without API key
 */

import Anthropic from '@anthropic-ai/sdk';
import { getConfig } from '@/lib/config';
import { logger } from '@/lib/utils/logger';
import type { NewsArticle, CleanedNews, StockAnalysisResult } from '@/lib/types/intelligence';

export class ClaudeService {
  private client: Anthropic | null = null;
  private model: string = 'claude-3-5-sonnet-20241022';
  private mockMode: boolean;

  constructor() {
    const config = getConfig();
    this.mockMode = config.mockMode || !config.anthropic.apiKey;

    if (!this.mockMode) {
      this.client = new Anthropic({
        apiKey: config.anthropic.apiKey,
      });
      logger.info('ClaudeService initialized', { model: this.model });
    } else {
      logger.warn('ClaudeService running in MOCK MODE - no real AI analysis');
    }
  }

  /**
   * Check if running in mock mode
   */
  isMockMode(): boolean {
    return this.mockMode;
  }

  /**
   * Clean and summarize news articles for trading decisions
   */
  async cleanNewsForTrading(articles: NewsArticle[]): Promise<CleanedNews> {
    logger.info('Cleaning news for trading', { count: articles.length, mockMode: this.mockMode });

    if (this.mockMode) {
      return this.mockCleanNews(articles);
    }

    const prompt = `You are a financial analyst. Analyze these news articles and provide a concise summary for trading decisions.

Articles:
${articles.map((a, i) => `${i + 1}. ${a.title}\n   Source: ${a.source}\n   ${a.summary || a.content?.substring(0, 200) || ''}`).join('\n\n')}

Provide your analysis in the following JSON format:
{
  "summary": "Brief overall summary (2-3 sentences)",
  "key_points": ["Key point 1", "Key point 2", "Key point 3"],
  "sentiment": "bullish" | "bearish" | "neutral",
  "confidence": 0.0 to 1.0,
  "relevant_symbols": ["SYMBOL1", "SYMBOL2"],
  "articles_analyzed": ${articles.length}
}

Focus on actionable trading insights.`;

    try {
      const response = await this.client!.messages.create({
        model: this.model,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Extract JSON from response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response');
      }

      const result = JSON.parse(jsonMatch[0]) as CleanedNews;

      logger.info('News cleaned successfully', {
        sentiment: result.sentiment,
        confidence: result.confidence,
      });

      return result;
    } catch (error) {
      logger.error('Failed to clean news', error as Error);
      throw error;
    }
  }

  /**
   * Analyze a stock with AI and provide trading recommendation
   */
  async analyzeStockForTrading(params: {
    symbol: string;
    current_price: number;
    technical_analysis: any;
    news_summary?: CleanedNews;
  }): Promise<StockAnalysisResult['ai_recommendation']> {
    logger.info('Analyzing stock with AI', { symbol: params.symbol, mockMode: this.mockMode });

    if (this.mockMode) {
      return this.mockStockAnalysis(params);
    }

    const prompt = `You are an expert stock trader. Analyze this stock and provide a trading recommendation.

Symbol: ${params.symbol}
Current Price: $${params.current_price}

Technical Analysis:
${JSON.stringify(params.technical_analysis, null, 2)}

${params.news_summary ? `News Summary:
Sentiment: ${params.news_summary.sentiment}
Summary: ${params.news_summary.summary}
Key Points: ${params.news_summary.key_points.join(', ')}` : 'No news data available'}

Provide your recommendation in the following JSON format:
{
  "action": "BUY" | "SELL" | "HOLD",
  "confidence": 0.0 to 1.0,
  "reasoning": "Detailed explanation of your recommendation (2-3 sentences)",
  "entry_price": recommended entry price (optional),
  "stop_loss": recommended stop loss price (optional),
  "take_profit": recommended take profit price (optional),
  "risk_reward_ratio": calculated risk/reward ratio (optional)
}

Be concise but thorough in your reasoning.`;

    try {
      const response = await this.client!.messages.create({
        model: this.model,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Extract JSON from response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response');
      }

      const result = JSON.parse(jsonMatch[0]);

      logger.info('Stock analyzed successfully', {
        symbol: params.symbol,
        action: result.action,
        confidence: result.confidence,
      });

      return result;
    } catch (error) {
      logger.error('Failed to analyze stock', error as Error, {
        symbol: params.symbol,
      });
      throw error;
    }
  }

  /**
   * Generate market intelligence summary
   */
  async generateMarketIntelligence(newsArticles: NewsArticle[]): Promise<string> {
    logger.info('Generating market intelligence', {
      articlesCount: newsArticles.length,
      mockMode: this.mockMode,
    });

    if (this.mockMode) {
      return this.mockMarketIntelligence(newsArticles);
    }

    const prompt = `You are a financial market analyst. Provide a brief market intelligence summary based on these news articles.

${newsArticles.map((a, i) => `${i + 1}. ${a.title} (${a.source})`).join('\n')}

Provide a 3-4 sentence summary of the current market conditions and sentiment.`;

    try {
      const response = await this.client!.messages.create({
        model: this.model,
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      logger.info('Market intelligence generated successfully');

      return content.text;
    } catch (error) {
      logger.error('Failed to generate market intelligence', error as Error);
      throw error;
    }
  }

  // ============================================================================
  // MOCK IMPLEMENTATIONS
  // ============================================================================

  private mockCleanNews(articles: NewsArticle[]): CleanedNews {
    // Extract symbols mentioned in titles
    const symbolPattern = /\b([A-Z]{2,5})\b/g;
    const symbols = new Set<string>();
    articles.forEach(a => {
      const matches = a.title.match(symbolPattern);
      if (matches) matches.forEach(s => symbols.add(s));
    });

    // Simple sentiment based on keywords
    const text = articles.map(a => a.title.toLowerCase()).join(' ');
    let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    const bullishWords = ['surge', 'jump', 'rally', 'gain', 'up', 'high', 'growth', 'beat', 'strong'];
    const bearishWords = ['drop', 'fall', 'crash', 'down', 'low', 'decline', 'miss', 'weak', 'fear'];

    const bullishCount = bullishWords.filter(w => text.includes(w)).length;
    const bearishCount = bearishWords.filter(w => text.includes(w)).length;

    if (bullishCount > bearishCount + 1) sentiment = 'bullish';
    else if (bearishCount > bullishCount + 1) sentiment = 'bearish';

    return {
      summary: `[MOCK] Analyzed ${articles.length} articles. Market sentiment appears ${sentiment} based on keyword analysis.`,
      key_points: [
        `[MOCK] ${articles.length} news articles processed`,
        `[MOCK] Detected sentiment: ${sentiment}`,
        `[MOCK] This is simulated analysis - enable Claude API for real insights`,
      ],
      sentiment,
      confidence: 0.5,
      relevant_symbols: Array.from(symbols).slice(0, 5),
      articles_analyzed: articles.length,
    };
  }

  private mockStockAnalysis(params: {
    symbol: string;
    current_price: number;
    technical_analysis: any;
    news_summary?: CleanedNews;
  }): StockAnalysisResult['ai_recommendation'] {
    // Simple mock analysis based on technical indicators if available
    const ta = params.technical_analysis || {};
    let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let reasoning = '[MOCK] ';

    // Check RSI if available
    if (ta.rsi !== undefined) {
      if (ta.rsi < 30) {
        action = 'BUY';
        reasoning += `RSI at ${ta.rsi.toFixed(1)} indicates oversold conditions. `;
      } else if (ta.rsi > 70) {
        action = 'SELL';
        reasoning += `RSI at ${ta.rsi.toFixed(1)} indicates overbought conditions. `;
      } else {
        reasoning += `RSI at ${ta.rsi.toFixed(1)} is neutral. `;
      }
    }

    // Check trend if available
    if (ta.trend) {
      reasoning += `Trend is ${ta.trend}. `;
    }

    // Factor in news sentiment
    if (params.news_summary) {
      reasoning += `News sentiment is ${params.news_summary.sentiment}. `;
      if (params.news_summary.sentiment === 'bullish' && action === 'HOLD') {
        action = 'BUY';
      } else if (params.news_summary.sentiment === 'bearish' && action === 'HOLD') {
        action = 'SELL';
      }
    }

    reasoning += 'This is simulated analysis - enable Claude API for real AI recommendations.';

    const stopLoss = params.current_price * 0.95;
    const takeProfit = params.current_price * 1.1;

    return {
      action,
      confidence: 0.5,
      reasoning,
      entry_price: params.current_price,
      stop_loss: stopLoss,
      take_profit: takeProfit,
      risk_reward_ratio: (takeProfit - params.current_price) / (params.current_price - stopLoss),
    };
  }

  private mockMarketIntelligence(newsArticles: NewsArticle[]): string {
    const sources = [...new Set(newsArticles.map(a => a.source))];
    return `[MOCK MODE] Market intelligence based on ${newsArticles.length} articles from ${sources.join(', ')}. ` +
      `Headlines suggest mixed market conditions. For accurate AI-powered analysis, configure ANTHROPIC_API_KEY. ` +
      `Current data includes: ${newsArticles.slice(0, 3).map(a => a.title.substring(0, 50)).join('; ')}...`;
  }
}
