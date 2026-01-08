/**
 * Market Multi-Bars API Route
 * GET /api/market/multi-bars - Get historical bars for multiple symbols
 */

import { NextRequest, NextResponse } from 'next/server';
import { AlpacaDataService } from '@/lib/services/alpaca/data';
import { logger } from '@/lib/utils/logger';
import type { BarParams } from '@/lib/types/trading';

const VALID_TIMEFRAMES: BarParams['timeframe'][] = ['1Min', '5Min', '15Min', '1Hour', '1Day'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');
    const timeframeParam = searchParams.get('timeframe') || '1Day';
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const limit = searchParams.get('limit');

    if (!symbolsParam) {
      return NextResponse.json(
        { error: 'Symbols parameter is required (comma-separated)' },
        { status: 400 }
      );
    }

    const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase());

    if (symbols.length === 0) {
      return NextResponse.json(
        { error: 'At least one symbol is required' },
        { status: 400 }
      );
    }

    const timeframe = VALID_TIMEFRAMES.includes(timeframeParam as any)
      ? (timeframeParam as BarParams['timeframe'])
      : '1Day';

    const dataService = new AlpacaDataService();
    const bars = await dataService.getMultiBars(symbols, {
      timeframe,
      start: start || undefined,
      end: end || undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json({
      timeframe,
      bars,
      symbolCount: Object.keys(bars).length,
    });
  } catch (error) {
    logger.error('Failed to fetch multi bars', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to fetch multi bars',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
