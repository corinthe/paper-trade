/**
 * Aggregate News API Route
 * GET /api/intelligence/news/aggregate - Get aggregated news from multiple sources
 */

import { NextRequest, NextResponse } from 'next/server';
import { NewsService } from '@/lib/services/news';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const sourcesParam = searchParams.get('sources');

    const sources = sourcesParam
      ? sourcesParam.split(',').map(s => s.trim().toLowerCase())
      : ['marketwatch', 'google'];

    const newsService = new NewsService();
    const articles = await newsService.aggregateNews(
      sources,
      symbol?.toUpperCase() || undefined
    );

    return NextResponse.json({
      success: true,
      data: articles,
      count: articles.length,
      sources,
    });
  } catch (error) {
    logger.error('Failed to aggregate news', error as Error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to aggregate news',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
