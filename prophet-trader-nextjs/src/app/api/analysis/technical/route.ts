/**
 * Technical Analysis API Route
 * GET /api/analysis/technical - Calculate technical indicators for a symbol
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { TechnicalAnalysisService } from '@/lib/services/analysis/technical';
import { AlpacaDataService } from '@/lib/services/alpaca/data';
import { logger } from '@/lib/utils/logger';
import type { BarParams } from '@/lib/types/trading';

const VALID_TIMEFRAMES: BarParams['timeframe'][] = ['1Min', '5Min', '15Min', '1Hour', '1Day'];

const querySchema = z.object({
  symbol: z.string().min(1).max(10),
  indicator: z.enum(['rsi', 'sma', 'ema', 'macd', 'bollinger', 'support_resistance', 'trend', 'all']).optional(),
  period: z.coerce.number().positive().optional(),
  timeframe: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params = querySchema.parse({
      symbol: searchParams.get('symbol'),
      indicator: searchParams.get('indicator') || 'all',
      period: searchParams.get('period') || undefined,
      timeframe: searchParams.get('timeframe') || '1Day',
    });

    const timeframe = VALID_TIMEFRAMES.includes(params.timeframe as any)
      ? (params.timeframe as BarParams['timeframe'])
      : '1Day';

    const dataService = new AlpacaDataService();
    const technicalService = new TechnicalAnalysisService();

    // Fetch historical bars
    const bars = await dataService.getHistoricalBars({
      symbol: params.symbol.toUpperCase(),
      timeframe,
      limit: 200, // Need enough data for all indicators
    });

    if (bars.length < 20) {
      return NextResponse.json(
        {
          error: 'Insufficient data',
          message: `Need at least 20 bars for technical analysis, got ${bars.length}`,
        },
        { status: 400 }
      );
    }

    const closePrices = bars.map(b => b.c);
    const period = params.period || 14;

    let result: any = {
      symbol: params.symbol.toUpperCase(),
      timeframe,
      bars_analyzed: bars.length,
      current_price: closePrices[closePrices.length - 1],
    };

    switch (params.indicator) {
      case 'rsi':
        const rsi = technicalService.calculateRSI(closePrices, period);
        result.rsi = {
          value: rsi,
          period,
          signal: rsi < 30 ? 'oversold' : rsi > 70 ? 'overbought' : 'neutral',
        };
        break;

      case 'sma':
        result.sma = {
          value: technicalService.calculateSMA(closePrices, period),
          period,
        };
        break;

      case 'ema':
        result.ema = {
          value: technicalService.calculateEMA(closePrices, period),
          period,
        };
        break;

      case 'macd':
        result.macd = technicalService.calculateMACD(closePrices);
        break;

      case 'bollinger':
        result.bollinger_bands = technicalService.calculateBollingerBands(
          closePrices,
          params.period || 20
        );
        break;

      case 'support_resistance':
        result.support_resistance = technicalService.findSupportResistance(bars);
        break;

      case 'trend':
        result.trend = technicalService.detectTrend(closePrices);
        break;

      case 'all':
      default:
        result.indicators = technicalService.analyzeBars(bars);
        break;
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    logger.error('Failed to calculate technical indicators', error as Error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate technical indicators',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
