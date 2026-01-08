/**
 * Market Quote API Route
 * GET /api/market/quote - Get latest quote for a symbol
 */

import { NextRequest, NextResponse } from 'next/server';
import { AlpacaDataService } from '@/lib/services/alpaca/data';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    const dataService = new AlpacaDataService();
    const quote = await dataService.getLatestQuote(symbol.toUpperCase());

    return NextResponse.json(quote);
  } catch (error) {
    logger.error('Failed to fetch quote', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to fetch quote',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
