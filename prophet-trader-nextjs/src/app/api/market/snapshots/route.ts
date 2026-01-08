/**
 * Market Snapshots API Route
 * GET /api/market/snapshots - Get snapshots for multiple symbols
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
    const snapshots = await dataService.getSnapshots(symbols);

    return NextResponse.json({
      snapshots,
      count: Object.keys(snapshots).length,
    });
  } catch (error) {
    logger.error('Failed to fetch snapshots', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to fetch snapshots',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
