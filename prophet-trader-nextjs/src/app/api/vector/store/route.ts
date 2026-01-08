/**
 * Vector Store API Route
 * POST /api/vector/store - Store a trading decision with embedding
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { VectorSearchService } from '@/lib/services/vector-search';
import { logger } from '@/lib/utils/logger';

const storeDecisionSchema = z.object({
  symbol: z.string().min(1).max(10),
  action: z.enum(['BUY', 'SELL', 'HOLD', 'CLOSE', 'ADJUST']),
  strategy: z.string().optional(),
  reasoning: z.string().min(1),
  market_context: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  entry_price: z.number().positive().optional(),
  qty: z.number().positive().optional(),
  stop_loss: z.number().positive().optional(),
  take_profit: z.number().positive().optional(),
  result_pct: z.number().optional(),
  result_dollars: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Normalize action to uppercase
    if (body.action) {
      body.action = body.action.toUpperCase();
    }

    const validatedData = storeDecisionSchema.parse(body);

    const service = new VectorSearchService();
    const result = await service.storeDecision(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: 'Decision stored with embedding',
      },
      { status: 201 }
    );
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

    logger.error('Failed to store decision', error as Error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to store decision',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
