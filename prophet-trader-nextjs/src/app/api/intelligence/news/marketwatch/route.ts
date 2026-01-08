/**
 * MarketWatch News API Route
 * GET /api/intelligence/news/marketwatch - Get MarketWatch feeds
 */

import { NextRequest, NextResponse } from 'next/server';
import { NewsService } from '@/lib/services/news';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const feedType = searchParams.get('feed') as 'realtimeheadlines' | 'topstories' | 'marketpulse' | null;

    const newsService = new NewsService();
    const articles = await newsService.getMarketWatchFeed(feedType || 'realtimeheadlines');

    return NextResponse.json({
      success: true,
      data: articles,
      count: articles.length,
      feed: feedType || 'realtimeheadlines',
    });
  } catch (error) {
    logger.error('Failed to fetch MarketWatch news', error as Error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch MarketWatch news',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
