/**
 * Market Historical Bars API Route
 * GET /api/market/bars - Get historical bars for a symbol
 */

import { NextRequest, NextResponse } from 'next/server';
import { AlpacaDataService } from '@/lib/services/alpaca/data';
import { logger } from '@/lib/utils/logger';
import type { BarParams } from '@/lib/types/trading';

const VALID_TIMEFRAMES: BarParams['timeframe'][] = ['1Min', '5Min', '15Min', '1Hour', '1Day'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const timeframeParam = searchParams.get('timeframe') || '1Day';
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const limit = searchParams.get('limit');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    const timeframe = VALID_TIMEFRAMES.includes(timeframeParam as any)
      ? (timeframeParam as BarParams['timeframe'])
      : '1Day';

    const dataService = new AlpacaDataService();
    const bars = await dataService.getHistoricalBars({
      symbol: symbol.toUpperCase(),
      timeframe,
      start: start || undefined,
      end: end || undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      timeframe,
      bars,
      count: bars.length,
    });
  } catch (error) {
    logger.error('Failed to fetch historical bars', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to fetch historical bars',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
