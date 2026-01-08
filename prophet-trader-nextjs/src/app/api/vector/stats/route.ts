/**
 * Vector Stats API Route
 * GET /api/vector/stats - Get trading statistics from decision history
 */

import { NextRequest, NextResponse } from 'next/server';
import { VectorSearchService } from '@/lib/services/vector-search';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const strategy = searchParams.get('strategy');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    const service = new VectorSearchService();
    const stats = await service.getStats({
      symbol: symbol || undefined,
      strategy: strategy || undefined,
      start_date: start_date || undefined,
      end_date: end_date || undefined,
    });

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Failed to get trade stats', error as Error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get trade stats',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
