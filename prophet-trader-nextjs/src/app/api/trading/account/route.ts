/**
 * Account API Route
 * GET /api/trading/account
 */

import { NextResponse } from 'next/server';
import { AlpacaTradingService } from '@/lib/services/alpaca/trading';
import { logger } from '@/lib/utils/logger';

export async function GET() {
  try {
    const tradingService = new AlpacaTradingService();
    const account = await tradingService.getAccount();

    return NextResponse.json(account);
  } catch (error) {
    logger.error('Failed to fetch account', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to fetch account',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
