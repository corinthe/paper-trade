/**
 * Stock Analysis Service
 * Combines technical analysis, news sentiment, and AI recommendations
 */

import { logger } from '@/lib/utils/logger';
import { AlpacaDataService } from '../alpaca/data';
import { NewsService } from '../news';
import { ClaudeService } from '../claude';
import { TechnicalAnalysisService } from './technical';
import type { StockAnalysisResult } from '@/lib/types/intelligence';

export class StockAnalysisService {
  private dataService: AlpacaDataService;
  private newsService: NewsService;
  private claudeService: ClaudeService;
  private technicalService: TechnicalAnalysisService;

  constructor() {
    this.dataService = new AlpacaDataService();
    this.newsService = new NewsService();
    this.claudeService = new ClaudeService();
    this.technicalService = new TechnicalAnalysisService();

    logger.info('StockAnalysisService initialized');
  }

  /**
   * Perform comprehensive stock analysis
   */
  async analyzeStock(symbol: string): Promise<StockAnalysisResult> {
    logger.info('Analyzing stock', { symbol });

    try {
      // Get current price and historical data
      const snapshot = await this.dataService.getSnapshot(symbol);
      const currentPrice = snapshot.latestTrade?.p || snapshot.minuteBar?.c || 0;

      if (!currentPrice) {
        throw new Error(`No price data available for ${symbol}`);
      }

      // Get historical bars for technical analysis
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 200); // 200 days of data

      const bars = await this.dataService.getHistoricalBars({
        symbol,
        timeframe: '1Day',
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        limit: 200,
      });

      if (bars.length < 20) {
        throw new Error(`Insufficient historical data for ${symbol}`);
      }

      // Perform technical analysis
      const technical = this.technicalService.analyzeBars(bars);

      // Get news sentiment
      let news_sentiment;
      try {
        news_sentiment = await this.newsService.getCleanedNews(
          ['marketwatch', 'google'],
          symbol
        );
      } catch (error) {
        logger.warn('Failed to get news sentiment', {
          symbol,
          error: (error as Error).message,
        });
        news_sentiment = undefined;
      }

      // Get AI recommendation
      const ai_recommendation = await this.claudeService.analyzeStockForTrading({
        symbol,
        current_price: currentPrice,
        technical_analysis: technical,
        news_summary: news_sentiment,
      });

      const result: StockAnalysisResult = {
        symbol,
        current_price: currentPrice,
        technical,
        news_sentiment,
        ai_recommendation,
        analyzed_at: new Date(),
      };

      logger.info('Stock analysis complete', {
        symbol,
        action: ai_recommendation.action,
        confidence: ai_recommendation.confidence,
      });

      return result;
    } catch (error) {
      logger.error('Failed to analyze stock', error as Error, { symbol });
      throw error;
    }
  }

  /**
   * Get technical analysis only (faster, no AI)
   */
  async getTechnicalAnalysis(symbol: string) {
    logger.info('Getting technical analysis', { symbol });

    try {
      const snapshot = await this.dataService.getSnapshot(symbol);
      const currentPrice = snapshot.latestTrade?.p || snapshot.minuteBar?.c || 0;

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 200);

      const bars = await this.dataService.getHistoricalBars({
        symbol,
        timeframe: '1Day',
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        limit: 200,
      });

      const technical = this.technicalService.analyzeBars(bars);

      logger.info('Technical analysis complete', { symbol });

      return {
        symbol,
        current_price: currentPrice,
        technical,
        analyzed_at: new Date(),
      };
    } catch (error) {
      logger.error('Failed to get technical analysis', error as Error, {
        symbol,
      });
      throw error;
    }
  }
}
