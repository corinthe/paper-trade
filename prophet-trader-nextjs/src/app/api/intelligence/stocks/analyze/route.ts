/**
 * Stock Analysis API Route
 * POST /api/intelligence/stocks/analyze
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { StockAnalysisService } from '@/lib/services/analysis/stock';
import { logger } from '@/lib/utils/logger';

const AnalyzeRequestSchema = z.object({
  symbol: z.string().min(1).max(10).toUpperCase(),
  technical_only: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const params = AnalyzeRequestSchema.parse(body);

    const analysisService = new StockAnalysisService();

    if (params.technical_only) {
      const result = await analysisService.getTechnicalAnalysis(params.symbol);
      return NextResponse.json(result);
    }

    const result = await analysisService.analyzeStock(params.symbol);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    logger.error('Failed to analyze stock', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to analyze stock',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
