/**
 * Decision Log API Route
 * GET /api/activity/decision - Get decisions
 * POST /api/activity/decision - Log a new decision
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ActivityLogService } from '@/lib/services/activity';
import { logger } from '@/lib/utils/logger';

const logDecisionSchema = z.object({
  symbol: z.string().min(1).max(10),
  action: z.enum(['BUY', 'SELL', 'HOLD', 'CLOSE', 'ADJUST']),
  strategy: z.string().min(1),
  reasoning: z.string().min(1),
  market_context: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  entry_price: z.number().positive().optional(),
  qty: z.number().positive().optional(),
  stop_loss: z.number().positive().optional(),
  take_profit: z.number().positive().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const action = searchParams.get('action') as any;
    const strategy = searchParams.get('strategy');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const service = new ActivityLogService();
    const result = await service.getDecisions({
      symbol: symbol || undefined,
      action: action || undefined,
      strategy: strategy || undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: result.decisions,
      total: result.total,
      count: result.decisions.length,
    });
  } catch (error) {
    logger.error('Failed to fetch decisions', error as Error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch decisions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = logDecisionSchema.parse(body);

    const service = new ActivityLogService();
    const entry = await service.logDecision(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: entry,
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

    logger.error('Failed to log decision', error as Error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to log decision',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
