/**
 * API Route for Position Monitoring
 * POST /api/positions/monitor - Monitor all active positions
 */

import { NextRequest, NextResponse } from 'next/server';
import { PositionManagerService } from '@/lib/services/positions';
import { logger } from '@/lib/utils/logger';

/**
 * POST /api/positions/monitor
 * Monitor all active managed positions and trigger exits if conditions are met
 *
 * This endpoint should be called periodically (e.g., via a cron job)
 * to check all active positions and close them if stop-loss or take-profit
 * conditions are triggered.
 */
export async function POST(request: NextRequest) {
  try {
    logger.info('Starting position monitoring via API');

    const service = new PositionManagerService();
    const result = await service.monitorAllPositions();

    return NextResponse.json({
      success: true,
      data: result,
      message: `Monitored ${result.total} positions, ${result.triggered} triggered, ${result.errors} errors`,
    });
  } catch (error) {
    logger.error('Failed to monitor positions via API', error as Error);

    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Failed to monitor positions',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/positions/monitor
 * Get monitoring status (for debugging)
 */
export async function GET(request: NextRequest) {
  try {
    const service = new PositionManagerService();
    const activePositions = await service.getActiveManagedPositions();

    return NextResponse.json({
      success: true,
      data: {
        activePositions: activePositions.length,
        positions: activePositions.map((p) => ({
          id: p.id,
          symbol: p.symbol,
          status: p.status,
          entry_price: p.entry_price,
          current_price: p.current_price,
          stop_loss_price: p.stop_loss_price,
          take_profit_price: p.take_profit_price,
          unrealized_plpc: p.unrealized_plpc,
        })),
      },
    });
  } catch (error) {
    logger.error('Failed to get monitoring status via API', error as Error);

    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Failed to get monitoring status',
      },
      { status: 500 }
    );
  }
}
