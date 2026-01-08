/**
 * Options Latest Quote API Route
 * GET /api/options/quote - Get latest quote for an option contract
 */

import { NextRequest, NextResponse } from 'next/server';
import { AlpacaOptionsService } from '@/lib/services/alpaca/options';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Option symbol is required' },
        { status: 400 }
      );
    }

    const optionsService = new AlpacaOptionsService();
    const quote = await optionsService.getOptionLatestQuote(symbol);

    return NextResponse.json({
      symbol,
      quote,
    });
  } catch (error) {
    logger.error('Failed to fetch option latest quote', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to fetch option latest quote',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
