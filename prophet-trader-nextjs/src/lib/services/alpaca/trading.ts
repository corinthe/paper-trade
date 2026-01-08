/**
 * Alpaca Trading Service
 * Handles all trading operations via Alpaca API
 */

import Alpaca from '@alpacahq/alpaca-trade-api';
import { getConfig } from '@/lib/config';
import { logger } from '@/lib/utils/logger';
import { withRetry } from '@/lib/utils/retry';
import type {
  Account,
  Position,
  Order,
  OrderRequest,
  OrderQueryParams,
} from '@/lib/types/trading';

export class AlpacaTradingService {
  private client: Alpaca;

  constructor() {
    const config = getConfig();

    if (!config.alpaca.apiKey || !config.alpaca.secretKey) {
      throw new Error('Alpaca API credentials not configured. Set ALPACA_API_KEY and ALPACA_SECRET_KEY.');
    }

    this.client = new Alpaca({
      keyId: config.alpaca.apiKey,
      secretKey: config.alpaca.secretKey,
      paper: config.alpaca.paper,
    });

    logger.info('AlpacaTradingService initialized', {
      paper: config.alpaca.paper,
    });
  }

  /**
   * Get account information
   */
  async getAccount(): Promise<Account> {
    logger.debug('Fetching account information');

    return withRetry(
      async () => {
        const account = await this.client.getAccount();
        logger.info('Account fetched successfully', {
          accountNumber: account.account_number,
          buyingPower: account.buying_power,
        });
        return account as Account;
      },
      { maxAttempts: 3, delay: 1000 }
    );
  }

  /**
   * Get all positions
   */
  async getPositions(): Promise<Position[]> {
    logger.debug('Fetching all positions');

    return withRetry(
      async () => {
        const positions = await this.client.getPositions();
        logger.info('Positions fetched successfully', {
          count: positions.length,
        });
        return positions as Position[];
      },
      { maxAttempts: 3 }
    );
  }

  /**
   * Get a specific position by symbol
   */
  async getPosition(symbol: string): Promise<Position> {
    logger.debug('Fetching position', { symbol });

    return withRetry(
      async () => {
        const position = await this.client.getPosition(symbol);
        logger.info('Position fetched successfully', {
          symbol,
          qty: position.qty,
          unrealizedPL: position.unrealized_pl,
        });
        return position as Position;
      },
      { maxAttempts: 3 }
    );
  }

  /**
   * Place an order
   */
  async placeOrder(params: OrderRequest): Promise<Order> {
    logger.info('Placing order', params);

    try {
      const order = await this.client.createOrder({
        symbol: params.symbol,
        qty: params.qty,
        notional: params.notional,
        side: params.side,
        type: params.type,
        time_in_force: params.time_in_force || 'day',
        limit_price: params.limit_price,
        stop_price: params.stop_price,
        trail_price: params.trail_price,
        trail_percent: params.trail_percent,
        extended_hours: params.extended_hours,
        client_order_id: params.client_order_id,
        order_class: params.order_class,
        take_profit: params.take_profit,
        stop_loss: params.stop_loss,
      });

      logger.info('Order placed successfully', {
        orderId: order.id,
        symbol: params.symbol,
        side: params.side,
        qty: params.qty,
      });

      return order as Order;
    } catch (error) {
      logger.error('Failed to place order', error as Error, { params });
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<void> {
    logger.info('Canceling order', { orderId });

    try {
      await this.client.cancelOrder(orderId);
      logger.info('Order canceled successfully', { orderId });
    } catch (error) {
      logger.error('Failed to cancel order', error as Error, { orderId });
      throw error;
    }
  }

  /**
   * Get orders with optional filters
   */
  async getOrders(params?: OrderQueryParams): Promise<Order[]> {
    logger.debug('Fetching orders', params);

    return withRetry(
      async () => {
        const orders = await this.client.getOrders(params as any);
        logger.info('Orders fetched successfully', {
          count: orders.length,
          status: params?.status,
        });
        return orders as Order[];
      },
      { maxAttempts: 3 }
    );
  }

  /**
   * Get a specific order by ID
   */
  async getOrder(orderId: string): Promise<Order> {
    logger.debug('Fetching order', { orderId });

    return withRetry(
      async () => {
        const order = await this.client.getOrder(orderId);
        logger.info('Order fetched successfully', {
          orderId,
          status: order.status,
        });
        return order as Order;
      },
      { maxAttempts: 3 }
    );
  }

  /**
   * Close a position at market price
   */
  async closePosition(symbol: string): Promise<Order> {
    logger.info('Closing position', { symbol });

    try {
      const order = await this.client.closePosition(symbol);
      logger.info('Position closed successfully', {
        symbol,
        orderId: order.id,
      });
      return order as Order;
    } catch (error) {
      logger.error('Failed to close position', error as Error, { symbol });
      throw error;
    }
  }

  /**
   * Close all positions
   */
  async closeAllPositions(): Promise<Order[]> {
    logger.info('Closing all positions');

    try {
      const orders = await this.client.closeAllPositions();
      logger.info('All positions closed successfully', {
        count: orders.length,
      });
      return orders as Order[];
    } catch (error) {
      logger.error('Failed to close all positions', error as Error);
      throw error;
    }
  }

  /**
   * Check if the market is currently open
   */
  async isMarketOpen(): Promise<boolean> {
    logger.debug('Checking market status');

    return withRetry(
      async () => {
        const clock = await this.client.getClock();
        logger.debug('Market status fetched', {
          isOpen: clock.is_open,
          nextOpen: clock.next_open,
          nextClose: clock.next_close,
        });
        return clock.is_open;
      },
      { maxAttempts: 3 }
    );
  }
}
