/**
 * API Routes for Managed Positions
 * POST /api/positions/managed - Create a managed position
 * GET /api/positions/managed - List managed positions
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PositionManagerService } from '@/lib/services/positions';
import { logger } from '@/lib/utils/logger';

// Request validation schema
const createManagedPositionSchema = z.object({
  symbol: z.string().min(1).max(10).toUpperCase(),
  qty: z.number().positive(),
  side: z.enum(['buy', 'sell']),
  stopLossPct: z.number().positive().max(100),
  takeProfitPct: z.number().positive().max(100),
  trailingStop: z.boolean().optional().default(false),
});

/**
 * POST /api/positions/managed
 * Create a new managed position with stop-loss and take-profit
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = createManagedPositionSchema.parse(body);

    logger.info('Creating managed position via API', validatedData);

    const service = new PositionManagerService();
    const managedPosition = await service.createManagedPosition(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: managedPosition,
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

    logger.error('Failed to create managed position via API', error as Error);

    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Failed to create managed position',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/positions/managed
 * List managed positions with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status') as any;
    const symbol = searchParams.get('symbol') || undefined;
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!)
      : undefined;

    logger.debug('Fetching managed positions via API', {
      status,
      symbol,
      limit,
    });

    const service = new PositionManagerService();
    const positions = await service.getManagedPositions({
      status,
      symbol,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: positions,
      count: positions.length,
    });
  } catch (error) {
    logger.error('Failed to fetch managed positions via API', error as Error);

    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Failed to fetch managed positions',
      },
      { status: 500 }
    );
  }
}
