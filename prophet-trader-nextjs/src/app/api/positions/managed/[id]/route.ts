/**
 * API Routes for Individual Managed Position
 * GET /api/positions/managed/[id] - Get managed position details
 * DELETE /api/positions/managed/[id] - Close a managed position
 */

import { NextRequest, NextResponse } from 'next/server';
import { PositionManagerService } from '@/lib/services/positions';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/positions/managed/[id]
 * Get a specific managed position by ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    logger.debug('Fetching managed position via API', { id });

    const service = new PositionManagerService();
    const position = await service.getManagedPosition(id);

    if (!position) {
      return NextResponse.json(
        {
          success: false,
          error: 'Managed position not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: position,
    });
  } catch (error) {
    logger.error('Failed to fetch managed position via API', error as Error);

    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Failed to fetch managed position',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/positions/managed/[id]
 * Close a managed position
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason') || 'manual_close';

    logger.info('Closing managed position via API', { id, reason });

    const service = new PositionManagerService();
    const position = await service.getManagedPosition(id);

    if (!position) {
      return NextResponse.json(
        {
          success: false,
          error: 'Managed position not found',
        },
        { status: 404 }
      );
    }

    // Check if already closed
    if (position.status === 'closed') {
      return NextResponse.json(
        {
          success: false,
          error: 'Position is already closed',
        },
        { status: 400 }
      );
    }

    const closedPosition = await service.closeManagedPosition(id, reason);

    return NextResponse.json({
      success: true,
      data: closedPosition,
      message: 'Managed position closed successfully',
    });
  } catch (error) {
    logger.error('Failed to close managed position via API', error as Error);

    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Failed to close managed position',
      },
      { status: 500 }
    );
  }
}
