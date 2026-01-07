/**
 * News Search API Route
 * GET /api/intelligence/news/search?q=AAPL&sources=marketwatch,google
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { NewsService } from '@/lib/services/news';
import { logger } from '@/lib/utils/logger';

const QuerySchema = z.object({
  q: z.string().optional(),
  sources: z.string().optional().default('marketwatch'),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = QuerySchema.parse({
      q: searchParams.get('q'),
      sources: searchParams.get('sources'),
      limit: searchParams.get('limit'),
    });

    const sources = params.sources.split(',');
    const newsService = new NewsService();

    const cleanedNews = await newsService.getCleanedNews(sources, params.q);

    return NextResponse.json(cleanedNews);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    logger.error('Failed to search news', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to search news',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
