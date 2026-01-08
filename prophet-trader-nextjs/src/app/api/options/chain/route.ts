/**
 * Options Chain API Route
 * GET /api/options/chain - Get option chain for an underlying symbol
 */

import { NextRequest, NextResponse } from 'next/server';
import { AlpacaOptionsService } from '@/lib/services/alpaca/options';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const underlying_symbol = searchParams.get('underlying_symbol');
    const expiration_date = searchParams.get('expiration_date');
    const expiration_date_gte = searchParams.get('expiration_date_gte');
    const expiration_date_lte = searchParams.get('expiration_date_lte');
    const strike_price_gte = searchParams.get('strike_price_gte');
    const strike_price_lte = searchParams.get('strike_price_lte');
    const type = searchParams.get('type') as 'call' | 'put' | null;
    const limit = searchParams.get('limit');

    if (!underlying_symbol) {
      return NextResponse.json(
        { error: 'underlying_symbol is required' },
        { status: 400 }
      );
    }

    const optionsService = new AlpacaOptionsService();
    const chain = await optionsService.getOptionChain({
      underlying_symbol: underlying_symbol.toUpperCase(),
      expiration_date: expiration_date || undefined,
      expiration_date_gte: expiration_date_gte || undefined,
      expiration_date_lte: expiration_date_lte || undefined,
      strike_price_gte: strike_price_gte ? parseFloat(strike_price_gte) : undefined,
      strike_price_lte: strike_price_lte ? parseFloat(strike_price_lte) : undefined,
      type: type || undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json({
      underlying_symbol: underlying_symbol.toUpperCase(),
      contracts: chain,
      count: chain.length,
    });
  } catch (error) {
    logger.error('Failed to fetch option chain', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to fetch option chain',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
