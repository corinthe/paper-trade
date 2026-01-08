/**
 * Market Latest Trades API Route
 * GET /api/market/trades - Get latest trades for multiple symbols
 */

import { NextRequest, NextResponse } from 'next/server';
import { AlpacaDataService } from '@/lib/services/alpaca/data';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');

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

    const dataService = new AlpacaDataService();
    const trades = await dataService.getLatestTrades(symbols);

    return NextResponse.json({
      trades,
      count: Object.keys(trades).length,
    });
  } catch (error) {
    logger.error('Failed to fetch latest trades', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to fetch latest trades',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
