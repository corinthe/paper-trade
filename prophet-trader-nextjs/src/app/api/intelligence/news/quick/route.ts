/**
 * Quick Market Intelligence API Route
 * GET /api/intelligence/news/quick
 */

import { NextResponse } from 'next/server';
import { NewsService } from '@/lib/services/news';
import { logger } from '@/lib/utils/logger';

export async function GET() {
  try {
    const newsService = new NewsService();
    const intelligence = await newsService.getQuickIntelligence();

    return NextResponse.json(intelligence);
  } catch (error) {
    logger.error('Failed to get quick intelligence', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to get quick market intelligence',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
