/**
 * Position Manager Service
 * Handles managed positions with automated stop-loss and take-profit
 */

import { AlpacaTradingService } from './alpaca/trading';
import { AlpacaDataService } from './alpaca/data';
import { logger } from '@/lib/utils/logger';
import { prisma } from '@/lib/db/client';

// Type definitions for ManagedPosition
export type ManagedPositionStatus =
  | 'active'
  | 'monitoring'
  | 'stop_loss_triggered'
  | 'take_profit_triggered'
  | 'closed'
  | 'error';

export interface ManagedPosition {
  id: string;
  symbol: string;
  qty: number;
  entry_price: number;
  entry_order_id: string | null;
  stop_loss_pct: number;
  take_profit_pct: number;
  stop_loss_price: number;
  take_profit_price: number;
  trailing_stop: boolean;
  status: ManagedPositionStatus;
  current_price: number | null;
  unrealized_pl: number | null;
  unrealized_plpc: number | null;
  closed_price: number | null;
  closed_reason: string | null;
  exit_order_id: string | null;
  created_at: Date;
  updated_at: Date;
  closed_at: Date | null;
}

export interface CreateManagedPositionParams {
  symbol: string;
  qty: number;
  side: 'buy' | 'sell';
  stopLossPct: number;
  takeProfitPct: number;
  trailingStop?: boolean;
}

export interface ManagedPositionWithMetrics extends ManagedPosition {
  unrealizedPlPct?: number;
}

export class PositionManagerService {
  private tradingService: AlpacaTradingService;
  private dataService: AlpacaDataService;

  constructor() {
    this.tradingService = new AlpacaTradingService();
    this.dataService = new AlpacaDataService();
  }

  /**
   * Create a managed position with automated stop-loss and take-profit
   */
  async createManagedPosition(
    params: CreateManagedPositionParams
  ): Promise<ManagedPosition> {
    const { symbol, qty, side, stopLossPct, takeProfitPct, trailingStop = false } = params;

    logger.info('Creating managed position', params);

    try {
      // Place the entry order
      const order = await this.tradingService.placeOrder({
        symbol,
        qty,
        side,
        type: 'market',
        time_in_force: 'day',
      });

      logger.info('Entry order placed', {
        orderId: order.id,
        symbol,
        qty,
        side,
      });

      // Get current price (use the order's filled price if available)
      let entryPrice: number;
      if (order.filled_avg_price) {
        entryPrice = parseFloat(order.filled_avg_price);
      } else {
        // Fallback to current market price
        const snapshot = await this.dataService.getSnapshot(symbol);
        entryPrice = snapshot.latestTrade?.p || 0;
      }

      // Calculate stop-loss and take-profit prices
      const { stopLossPrice, takeProfitPrice } = this.calculatePrices(
        entryPrice,
        stopLossPct,
        takeProfitPct,
        side
      );

      // Create managed position in database
      const managedPosition = await prisma.managedPosition.create({
        data: {
          symbol,
          qty,
          entry_price: entryPrice,
          entry_order_id: order.id,
          stop_loss_pct: stopLossPct,
          take_profit_pct: takeProfitPct,
          stop_loss_price: stopLossPrice,
          take_profit_price: takeProfitPrice,
          trailing_stop: trailingStop,
          status: 'active',
          current_price: entryPrice,
          unrealized_pl: 0,
          unrealized_plpc: 0,
        },
      });

      logger.info('Managed position created', {
        id: managedPosition.id,
        symbol,
        entryPrice,
        stopLossPrice,
        takeProfitPrice,
      });

      return managedPosition;
    } catch (error) {
      logger.error('Failed to create managed position', error as Error, params);
      throw error;
    }
  }

  /**
   * Calculate stop-loss and take-profit prices based on percentages
   */
  private calculatePrices(
    entryPrice: number,
    stopLossPct: number,
    takeProfitPct: number,
    side: 'buy' | 'sell'
  ): { stopLossPrice: number; takeProfitPrice: number } {
    if (side === 'buy') {
      // Long position
      const stopLossPrice = entryPrice * (1 - stopLossPct / 100);
      const takeProfitPrice = entryPrice * (1 + takeProfitPct / 100);
      return { stopLossPrice, takeProfitPrice };
    } else {
      // Short position
      const stopLossPrice = entryPrice * (1 + stopLossPct / 100);
      const takeProfitPrice = entryPrice * (1 - takeProfitPct / 100);
      return { stopLossPrice, takeProfitPrice };
    }
  }

  /**
   * Get all active managed positions
   */
  async getActiveManagedPositions(): Promise<ManagedPosition[]> {
    return prisma.managedPosition.findMany({
      where: {
        status: {
          in: ['active', 'monitoring'],
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  /**
   * Get all managed positions with optional filters
   */
  async getManagedPositions(params?: {
    status?: ManagedPositionStatus;
    symbol?: string;
    limit?: number;
  }): Promise<ManagedPosition[]> {
    const { status, symbol, limit = 100 } = params || {};

    return prisma.managedPosition.findMany({
      where: {
        ...(status && { status }),
        ...(symbol && { symbol }),
      },
      orderBy: {
        created_at: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Get a specific managed position by ID
   */
  async getManagedPosition(id: string): Promise<ManagedPosition | null> {
    return prisma.managedPosition.findUnique({
      where: { id },
    });
  }

  /**
   * Update managed position with current market data
   */
  async updateManagedPosition(
    id: string,
    currentPrice: number
  ): Promise<ManagedPosition> {
    const position = await this.getManagedPosition(id);
    if (!position) {
      throw new Error(`Managed position ${id} not found`);
    }

    const unrealizedPl = (currentPrice - position.entry_price) * position.qty;
    const unrealizedPlpc = ((currentPrice - position.entry_price) / position.entry_price) * 100;

    return prisma.managedPosition.update({
      where: { id },
      data: {
        current_price: currentPrice,
        unrealized_pl: unrealizedPl,
        unrealized_plpc: unrealizedPlpc,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Monitor a managed position and trigger exit if conditions are met
   */
  async monitorPosition(id: string): Promise<{
    triggered: boolean;
    reason?: string;
    action?: string;
  }> {
    const position = await this.getManagedPosition(id);
    if (!position) {
      throw new Error(`Managed position ${id} not found`);
    }

    // Skip if not active
    if (position.status !== 'active' && position.status !== 'monitoring') {
      return { triggered: false };
    }

    try {
      // Get current price
      const snapshot = await this.dataService.getSnapshot(position.symbol);
      const currentPrice = snapshot.latestTrade?.p || snapshot.latestQuote?.ap;

      if (!currentPrice) {
        logger.warn('No current price available for position', {
          id: position.id,
          symbol: position.symbol,
        });
        return { triggered: false };
      }

      // Update position with current price
      await this.updateManagedPosition(id, currentPrice);

      // Check stop-loss trigger
      const stopLossTriggered =
        currentPrice <= position.stop_loss_price;

      // Check take-profit trigger
      const takeProfitTriggered =
        currentPrice >= position.take_profit_price;

      if (stopLossTriggered) {
        logger.warn('Stop-loss triggered', {
          id: position.id,
          symbol: position.symbol,
          currentPrice,
          stopLossPrice: position.stop_loss_price,
        });

        await this.closeManagedPosition(id, 'stop_loss_triggered', currentPrice);
        return {
          triggered: true,
          reason: 'stop_loss',
          action: 'closed',
        };
      }

      if (takeProfitTriggered) {
        logger.info('Take-profit triggered', {
          id: position.id,
          symbol: position.symbol,
          currentPrice,
          takeProfitPrice: position.take_profit_price,
        });

        await this.closeManagedPosition(id, 'take_profit_triggered', currentPrice);
        return {
          triggered: true,
          reason: 'take_profit',
          action: 'closed',
        };
      }

      // Update trailing stop if enabled
      if (position.trailing_stop) {
        await this.updateTrailingStop(id, currentPrice);
      }

      return { triggered: false };
    } catch (error) {
      logger.error('Failed to monitor position', error as Error, {
        id: position.id,
        symbol: position.symbol,
      });
      throw error;
    }
  }

  /**
   * Update trailing stop-loss price based on current price
   */
  private async updateTrailingStop(
    id: string,
    currentPrice: number
  ): Promise<void> {
    const position = await this.getManagedPosition(id);
    if (!position) return;

    // Calculate new stop-loss price (trailing)
    const newStopLossPrice = currentPrice * (1 - position.stop_loss_pct / 100);

    // Only update if new stop-loss is higher than current (for long positions)
    if (newStopLossPrice > position.stop_loss_price) {
      await prisma.managedPosition.update({
        where: { id },
        data: {
          stop_loss_price: newStopLossPrice,
        },
      });

      logger.info('Trailing stop updated', {
        id,
        symbol: position.symbol,
        oldStopLoss: position.stop_loss_price,
        newStopLoss: newStopLossPrice,
        currentPrice,
      });
    }
  }

  /**
   * Close a managed position
   */
  async closeManagedPosition(
    id: string,
    reason: string,
    closedPrice?: number
  ): Promise<ManagedPosition> {
    const position = await this.getManagedPosition(id);
    if (!position) {
      throw new Error(`Managed position ${id} not found`);
    }

    logger.info('Closing managed position', {
      id,
      symbol: position.symbol,
      reason,
    });

    try {
      // Close the position on Alpaca
      const closeOrder = await this.tradingService.closePosition(position.symbol);

      // Determine the actual closed price
      const finalClosedPrice =
        closedPrice ||
        (closeOrder.filled_avg_price
          ? parseFloat(closeOrder.filled_avg_price)
          : position.current_price || position.entry_price);

      // Update the managed position
      const updatedPosition = await prisma.managedPosition.update({
        where: { id },
        data: {
          status: 'closed',
          closed_price: finalClosedPrice,
          closed_reason: reason,
          exit_order_id: closeOrder.id,
          closed_at: new Date(),
        },
      });

      logger.info('Managed position closed successfully', {
        id,
        symbol: position.symbol,
        closedPrice: finalClosedPrice,
        reason,
      });

      return updatedPosition;
    } catch (error) {
      // Mark as error but don't throw
      logger.error('Failed to close managed position', error as Error, {
        id,
        symbol: position.symbol,
      });

      await prisma.managedPosition.update({
        where: { id },
        data: {
          status: 'error',
          closed_reason: `Error: ${(error as Error).message}`,
        },
      });

      throw error;
    }
  }

  /**
   * Monitor all active managed positions
   */
  async monitorAllPositions(): Promise<{
    total: number;
    triggered: number;
    errors: number;
  }> {
    logger.info('Starting position monitoring cycle');

    const activePositions = await this.getActiveManagedPositions();
    let triggered = 0;
    let errors = 0;

    for (const position of activePositions) {
      try {
        const result = await this.monitorPosition(position.id);
        if (result.triggered) {
          triggered++;
        }
      } catch (error) {
        logger.error('Error monitoring position', error as Error, {
          id: position.id,
          symbol: position.symbol,
        });
        errors++;
      }
    }

    logger.info('Position monitoring cycle completed', {
      total: activePositions.length,
      triggered,
      errors,
    });

    return {
      total: activePositions.length,
      triggered,
      errors,
    };
  }

  /**
   * Delete a managed position (admin only)
   */
  async deleteManagedPosition(id: string): Promise<void> {
    await prisma.managedPosition.delete({
      where: { id },
    });

    logger.info('Managed position deleted', { id });
  }
}
