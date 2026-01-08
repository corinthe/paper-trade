/**
 * Options Bars API Route
 * GET /api/options/bars - Get historical bars for an option contract
 */

import { NextRequest, NextResponse } from 'next/server';
import { AlpacaOptionsService } from '@/lib/services/alpaca/options';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const timeframe = searchParams.get('timeframe') || '1Day';
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const limit = searchParams.get('limit');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Option symbol is required' },
        { status: 400 }
      );
    }

    const optionsService = new AlpacaOptionsService();
    const bars = await optionsService.getOptionBars({
      symbol,
      timeframe,
      start: start || undefined,
      end: end || undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json({
      symbol,
      timeframe,
      bars,
      count: bars.length,
    });
  } catch (error) {
    logger.error('Failed to fetch option bars', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to fetch option bars',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
