/**
 * News Service
 * Aggregates news from multiple sources (MarketWatch, Google News)
 */

import { logger } from '@/lib/utils/logger';
import { withRetry } from '@/lib/utils/retry';
import type { NewsArticle, CleanedNews } from '@/lib/types/intelligence';
import { ClaudeService } from './claude';

interface RSSItem {
  title?: string;
  link?: string;
  pubDate?: string;
  description?: string;
  author?: string;
}

export class NewsService {
  private claudeService: ClaudeService;

  constructor() {
    this.claudeService = new ClaudeService();
    logger.info('NewsService initialized');
  }

  /**
   * Parse RSS feed from URL
   */
  private async parseRSSFeed(url: string): Promise<NewsArticle[]> {
    logger.debug('Parsing RSS feed', { url });

    return withRetry(
      async () => {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; ProphetTrader/1.0)',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const xml = await response.text();

        // Simple XML parsing (in production, use a proper XML parser)
        const items: NewsArticle[] = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;

        while ((match = itemRegex.exec(xml)) !== null) {
          const itemXml = match[1];

          const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
                       itemXml.match(/<title>(.*?)<\/title>/)?.[1];
          const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1];
          const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];
          const description = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
                            itemXml.match(/<description>(.*?)<\/description>/)?.[1];

          if (title && link) {
            items.push({
              source: new URL(url).hostname,
              title,
              url: link,
              published_at: pubDate ? new Date(pubDate) : new Date(),
              summary: description,
            });
          }
        }

        logger.debug('RSS feed parsed', { url, itemCount: items.length });

        return items;
      },
      { maxAttempts: 3, delay: 1000 }
    );
  }

  /**
   * Get MarketWatch feed
   */
  async getMarketWatchFeed(feedType: 'realtimeheadlines' | 'topstories' | 'marketpulse' = 'realtimeheadlines'): Promise<NewsArticle[]> {
    logger.info('Fetching MarketWatch feed', { feedType });

    const feedUrls: Record<string, string> = {
      realtimeheadlines: 'https://feeds.marketwatch.com/marketwatch/realtimeheadlines/',
      topstories: 'https://feeds.marketwatch.com/marketwatch/topstories/',
      marketpulse: 'https://feeds.marketwatch.com/marketwatch/marketpulse/',
    };

    const url = feedUrls[feedType];
    if (!url) {
      throw new Error(`Unknown feed type: ${feedType}`);
    }

    try {
      const articles = await this.parseRSSFeed(url);
      logger.info('MarketWatch feed fetched', {
        feedType,
        count: articles.length,
      });
      return articles.slice(0, 15); // Limit to 15 articles
    } catch (error) {
      logger.error('Failed to fetch MarketWatch feed', error as Error, {
        feedType,
      });
      throw error;
    }
  }

  /**
   * Search Google News for a query
   */
  async searchGoogleNews(query: string, limit: number = 10): Promise<NewsArticle[]> {
    logger.info('Searching Google News', { query, limit });

    // Google News RSS feed
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;

    try {
      const articles = await this.parseRSSFeed(url);
      logger.info('Google News searched', {
        query,
        count: articles.length,
      });
      return articles.slice(0, limit);
    } catch (error) {
      logger.error('Failed to search Google News', error as Error, { query });
      throw error;
    }
  }

  /**
   * Aggregate news from multiple sources
   */
  async aggregateNews(sources: string[], symbol?: string): Promise<NewsArticle[]> {
    logger.info('Aggregating news', { sources, symbol });

    const allArticles: NewsArticle[] = [];

    for (const source of sources) {
      try {
        if (source === 'marketwatch') {
          const articles = await this.getMarketWatchFeed('realtimeheadlines');
          allArticles.push(...articles);
        } else if (source === 'google' && symbol) {
          const articles = await this.searchGoogleNews(`${symbol} stock`, 10);
          allArticles.push(...articles);
        }
      } catch (error) {
        logger.warn('Failed to fetch from source', {
          source,
          error: (error as Error).message,
        });
        // Continue with other sources
      }
    }

    logger.info('News aggregated', {
      sources,
      totalArticles: allArticles.length,
    });

    return allArticles;
  }

  /**
   * Get cleaned news using Claude AI
   */
  async getCleanedNews(sources: string[], symbol?: string): Promise<CleanedNews> {
    logger.info('Getting cleaned news', { sources, symbol });

    const articles = await this.aggregateNews(sources, symbol);

    if (articles.length === 0) {
      logger.warn('No articles found for cleaning');
      return {
        summary: 'No news articles available',
        key_points: [],
        sentiment: 'neutral',
        confidence: 0,
        relevant_symbols: symbol ? [symbol] : [],
        articles_analyzed: 0,
      };
    }

    const cleanedNews = await this.claudeService.cleanNewsForTrading(articles);

    logger.info('News cleaned', {
      articlesAnalyzed: cleanedNews.articles_analyzed,
      sentiment: cleanedNews.sentiment,
    });

    return cleanedNews;
  }

  /**
   * Get quick market intelligence (top MarketWatch stories + AI analysis)
   */
  async getQuickIntelligence(): Promise<CleanedNews> {
    logger.info('Getting quick market intelligence');

    const articles = await this.getMarketWatchFeed('topstories');

    if (articles.length === 0) {
      return {
        summary: 'No market news available',
        key_points: [],
        sentiment: 'neutral',
        confidence: 0,
        relevant_symbols: [],
        articles_analyzed: 0,
      };
    }

    const intelligence = await this.claudeService.cleanNewsForTrading(
      articles.slice(0, 15)
    );

    logger.info('Quick intelligence generated', {
      sentiment: intelligence.sentiment,
    });

    return intelligence;
  }
}
