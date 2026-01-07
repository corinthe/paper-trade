/**
 * Tests for PositionManagerService
 */

import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { PositionManagerService } from '@/lib/services/positions';
import { AlpacaTradingService } from '@/lib/services/alpaca/trading';
import { AlpacaDataService } from '@/lib/services/alpaca/data';
import { prisma } from '@/lib/db/client';

// Mock dependencies
vi.mock('@/lib/services/alpaca/trading');
vi.mock('@/lib/services/alpaca/data');
vi.mock('@/lib/db/client', () => ({
  prisma: {
    managedPosition: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('PositionManagerService', () => {
  let service: PositionManagerService;
  let mockTradingService: any;
  let mockDataService: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mocks
    mockTradingService = {
      placeOrder: vi.fn(),
      closePosition: vi.fn(),
    };

    mockDataService = {
      getSnapshot: vi.fn(),
    };

    // Mock the constructors to return our mocks
    (AlpacaTradingService as any).mockImplementation(() => mockTradingService);
    (AlpacaDataService as any).mockImplementation(() => mockDataService);

    service = new PositionManagerService();
  });

  describe('createManagedPosition', () => {
    it('should create a managed position with correct stop-loss and take-profit for long position', async () => {
      const params = {
        symbol: 'AAPL',
        qty: 10,
        side: 'buy' as const,
        stopLossPct: 2,
        takeProfitPct: 5,
      };

      const mockOrder = {
        id: 'order-123',
        symbol: 'AAPL',
        filled_avg_price: '150.00',
      };

      const mockManagedPosition = {
        id: 'position-123',
        symbol: 'AAPL',
        qty: 10,
        entry_price: 150,
        entry_order_id: 'order-123',
        stop_loss_pct: 2,
        take_profit_pct: 5,
        stop_loss_price: 147, // 150 * (1 - 0.02)
        take_profit_price: 157.5, // 150 * (1 + 0.05)
        trailing_stop: false,
        status: 'active',
        current_price: 150,
        unrealized_pl: 0,
        unrealized_plpc: 0,
        created_at: new Date(),
        updated_at: new Date(),
        closed_at: null,
        closed_price: null,
        closed_reason: null,
        exit_order_id: null,
      };

      mockTradingService.placeOrder.mockResolvedValue(mockOrder);
      (prisma.managedPosition.create as Mock).mockResolvedValue(mockManagedPosition);

      const result = await service.createManagedPosition(params);

      // Verify order was placed
      expect(mockTradingService.placeOrder).toHaveBeenCalledWith({
        symbol: 'AAPL',
        qty: 10,
        side: 'buy',
        type: 'market',
        time_in_force: 'day',
      });

      // Verify position was created with correct prices
      expect(prisma.managedPosition.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          symbol: 'AAPL',
          qty: 10,
          entry_price: 150,
          stop_loss_price: 147,
          take_profit_price: 157.5,
          status: 'active',
        }),
      });

      expect(result).toEqual(mockManagedPosition);
    });

    it('should create a managed position for short position with inverted prices', async () => {
      const params = {
        symbol: 'TSLA',
        qty: 5,
        side: 'sell' as const,
        stopLossPct: 3,
        takeProfitPct: 4,
      };

      const mockOrder = {
        id: 'order-456',
        symbol: 'TSLA',
        filled_avg_price: '200.00',
      };

      mockTradingService.placeOrder.mockResolvedValue(mockOrder);
      (prisma.managedPosition.create as Mock).mockResolvedValue({
        id: 'position-456',
        stop_loss_price: 206, // 200 * (1 + 0.03) for short
        take_profit_price: 192, // 200 * (1 - 0.04) for short
      });

      await service.createManagedPosition(params);

      expect(prisma.managedPosition.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          stop_loss_price: 206,
          take_profit_price: 192,
        }),
      });
    });

    it('should use market price when order has no filled_avg_price', async () => {
      const params = {
        symbol: 'AAPL',
        qty: 10,
        side: 'buy' as const,
        stopLossPct: 2,
        takeProfitPct: 5,
      };

      const mockOrder = {
        id: 'order-123',
        symbol: 'AAPL',
        filled_avg_price: null,
      };

      const mockSnapshot = {
        latestTrade: { p: 155 },
      };

      mockTradingService.placeOrder.mockResolvedValue(mockOrder);
      mockDataService.getSnapshot.mockResolvedValue(mockSnapshot);
      (prisma.managedPosition.create as Mock).mockResolvedValue({});

      await service.createManagedPosition(params);

      expect(mockDataService.getSnapshot).toHaveBeenCalledWith('AAPL');
      expect(prisma.managedPosition.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          entry_price: 155,
        }),
      });
    });

    it('should enable trailing stop when requested', async () => {
      const params = {
        symbol: 'AAPL',
        qty: 10,
        side: 'buy' as const,
        stopLossPct: 2,
        takeProfitPct: 5,
        trailingStop: true,
      };

      mockTradingService.placeOrder.mockResolvedValue({
        id: 'order-123',
        filled_avg_price: '150.00',
      });
      (prisma.managedPosition.create as Mock).mockResolvedValue({});

      await service.createManagedPosition(params);

      expect(prisma.managedPosition.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          trailing_stop: true,
        }),
      });
    });
  });

  describe('getManagedPosition', () => {
    it('should return a managed position by ID', async () => {
      const mockPosition = {
        id: 'position-123',
        symbol: 'AAPL',
        status: 'active',
      };

      (prisma.managedPosition.findUnique as Mock).mockResolvedValue(mockPosition);

      const result = await service.getManagedPosition('position-123');

      expect(prisma.managedPosition.findUnique).toHaveBeenCalledWith({
        where: { id: 'position-123' },
      });
      expect(result).toEqual(mockPosition);
    });

    it('should return null if position not found', async () => {
      (prisma.managedPosition.findUnique as Mock).mockResolvedValue(null);

      const result = await service.getManagedPosition('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getActiveManagedPositions', () => {
    it('should return only active and monitoring positions', async () => {
      const mockPositions = [
        { id: '1', status: 'active' },
        { id: '2', status: 'monitoring' },
      ];

      (prisma.managedPosition.findMany as Mock).mockResolvedValue(mockPositions);

      const result = await service.getActiveManagedPositions();

      expect(prisma.managedPosition.findMany).toHaveBeenCalledWith({
        where: {
          status: {
            in: ['active', 'monitoring'],
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });
      expect(result).toEqual(mockPositions);
    });
  });

  describe('getManagedPositions', () => {
    it('should filter by status', async () => {
      (prisma.managedPosition.findMany as Mock).mockResolvedValue([]);

      await service.getManagedPositions({ status: 'closed' });

      expect(prisma.managedPosition.findMany).toHaveBeenCalledWith({
        where: { status: 'closed' },
        orderBy: { created_at: 'desc' },
        take: 100,
      });
    });

    it('should filter by symbol', async () => {
      (prisma.managedPosition.findMany as Mock).mockResolvedValue([]);

      await service.getManagedPositions({ symbol: 'AAPL' });

      expect(prisma.managedPosition.findMany).toHaveBeenCalledWith({
        where: { symbol: 'AAPL' },
        orderBy: { created_at: 'desc' },
        take: 100,
      });
    });

    it('should respect limit parameter', async () => {
      (prisma.managedPosition.findMany as Mock).mockResolvedValue([]);

      await service.getManagedPositions({ limit: 50 });

      expect(prisma.managedPosition.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { created_at: 'desc' },
        take: 50,
      });
    });
  });

  describe('updateManagedPosition', () => {
    it('should update position with current price and P&L', async () => {
      const mockPosition = {
        id: 'position-123',
        symbol: 'AAPL',
        qty: 10,
        entry_price: 150,
      };

      (prisma.managedPosition.findUnique as Mock).mockResolvedValue(mockPosition);
      (prisma.managedPosition.update as Mock).mockResolvedValue({
        ...mockPosition,
        current_price: 155,
      });

      await service.updateManagedPosition('position-123', 155);

      expect(prisma.managedPosition.update).toHaveBeenCalledWith({
        where: { id: 'position-123' },
        data: {
          current_price: 155,
          unrealized_pl: 50, // (155 - 150) * 10
          unrealized_plpc: 3.3333333333333335, // ((155 - 150) / 150) * 100
          updated_at: expect.any(Date),
        },
      });
    });

    it('should throw error if position not found', async () => {
      (prisma.managedPosition.findUnique as Mock).mockResolvedValue(null);

      await expect(
        service.updateManagedPosition('nonexistent', 155)
      ).rejects.toThrow('Managed position nonexistent not found');
    });
  });

  describe('monitorPosition', () => {
    it('should trigger stop-loss when price drops below threshold', async () => {
      const mockPosition = {
        id: 'position-123',
        symbol: 'AAPL',
        status: 'active',
        stop_loss_price: 147,
        take_profit_price: 157.5,
        entry_price: 150,
        qty: 10,
      };

      const mockSnapshot = {
        latestTrade: { p: 145 }, // Below stop-loss
      };

      (prisma.managedPosition.findUnique as Mock).mockResolvedValue(mockPosition);
      (prisma.managedPosition.update as Mock).mockResolvedValue(mockPosition);
      mockDataService.getSnapshot.mockResolvedValue(mockSnapshot);
      mockTradingService.closePosition.mockResolvedValue({ id: 'close-order-123' });

      const result = await service.monitorPosition('position-123');

      expect(result.triggered).toBe(true);
      expect(result.reason).toBe('stop_loss');
      expect(mockTradingService.closePosition).toHaveBeenCalledWith('AAPL');
    });

    it('should trigger take-profit when price rises above threshold', async () => {
      const mockPosition = {
        id: 'position-123',
        symbol: 'AAPL',
        status: 'active',
        stop_loss_price: 147,
        take_profit_price: 157.5,
        entry_price: 150,
        qty: 10,
      };

      const mockSnapshot = {
        latestTrade: { p: 160 }, // Above take-profit
      };

      (prisma.managedPosition.findUnique as Mock).mockResolvedValue(mockPosition);
      (prisma.managedPosition.update as Mock).mockResolvedValue(mockPosition);
      mockDataService.getSnapshot.mockResolvedValue(mockSnapshot);
      mockTradingService.closePosition.mockResolvedValue({ id: 'close-order-123' });

      const result = await service.monitorPosition('position-123');

      expect(result.triggered).toBe(true);
      expect(result.reason).toBe('take_profit');
    });

    it('should not trigger if price is within range', async () => {
      const mockPosition = {
        id: 'position-123',
        symbol: 'AAPL',
        status: 'active',
        stop_loss_price: 147,
        take_profit_price: 157.5,
        entry_price: 150,
        qty: 10,
        trailing_stop: false,
      };

      const mockSnapshot = {
        latestTrade: { p: 152 }, // Within range
      };

      (prisma.managedPosition.findUnique as Mock).mockResolvedValue(mockPosition);
      (prisma.managedPosition.update as Mock).mockResolvedValue(mockPosition);
      mockDataService.getSnapshot.mockResolvedValue(mockSnapshot);

      const result = await service.monitorPosition('position-123');

      expect(result.triggered).toBe(false);
      expect(mockTradingService.closePosition).not.toHaveBeenCalled();
    });

    it('should skip monitoring if position is not active', async () => {
      const mockPosition = {
        id: 'position-123',
        status: 'closed',
      };

      (prisma.managedPosition.findUnique as Mock).mockResolvedValue(mockPosition);

      const result = await service.monitorPosition('position-123');

      expect(result.triggered).toBe(false);
      expect(mockDataService.getSnapshot).not.toHaveBeenCalled();
    });
  });

  describe('closeManagedPosition', () => {
    it('should close position and update database', async () => {
      const mockPosition = {
        id: 'position-123',
        symbol: 'AAPL',
        status: 'active',
        current_price: 155,
      };

      const mockCloseOrder = {
        id: 'close-order-123',
        filled_avg_price: '155.50',
      };

      (prisma.managedPosition.findUnique as Mock).mockResolvedValue(mockPosition);
      mockTradingService.closePosition.mockResolvedValue(mockCloseOrder);
      (prisma.managedPosition.update as Mock).mockResolvedValue({
        ...mockPosition,
        status: 'closed',
      });

      const result = await service.closeManagedPosition(
        'position-123',
        'stop_loss_triggered'
      );

      expect(mockTradingService.closePosition).toHaveBeenCalledWith('AAPL');
      expect(prisma.managedPosition.update).toHaveBeenCalledWith({
        where: { id: 'position-123' },
        data: {
          status: 'closed',
          closed_price: 155.5,
          closed_reason: 'stop_loss_triggered',
          exit_order_id: 'close-order-123',
          closed_at: expect.any(Date),
        },
      });
    });

    it('should mark position as error if close fails', async () => {
      const mockPosition = {
        id: 'position-123',
        symbol: 'AAPL',
        status: 'active',
      };

      (prisma.managedPosition.findUnique as Mock).mockResolvedValue(mockPosition);
      mockTradingService.closePosition.mockRejectedValue(new Error('Close failed'));
      (prisma.managedPosition.update as Mock).mockResolvedValue({});

      await expect(
        service.closeManagedPosition('position-123', 'manual_close')
      ).rejects.toThrow('Close failed');

      expect(prisma.managedPosition.update).toHaveBeenCalledWith({
        where: { id: 'position-123' },
        data: {
          status: 'error',
          closed_reason: 'Error: Close failed',
        },
      });
    });
  });

  describe('monitorAllPositions', () => {
    it('should monitor all active positions', async () => {
      const mockPositions = [
        { id: 'pos-1', symbol: 'AAPL', status: 'active' },
        { id: 'pos-2', symbol: 'TSLA', status: 'active' },
      ];

      (prisma.managedPosition.findMany as Mock).mockResolvedValue(mockPositions);
      (prisma.managedPosition.findUnique as Mock)
        .mockResolvedValueOnce(mockPositions[0])
        .mockResolvedValueOnce(mockPositions[1]);
      (prisma.managedPosition.update as Mock).mockResolvedValue({});

      mockDataService.getSnapshot
        .mockResolvedValueOnce({ latestTrade: { p: 150 } })
        .mockResolvedValueOnce({ latestTrade: { p: 200 } });

      const result = await service.monitorAllPositions();

      expect(result.total).toBe(2);
      expect(result.triggered).toBe(0);
      expect(result.errors).toBe(0);
    });

    it('should count errors when monitoring fails', async () => {
      const mockPositions = [{ id: 'pos-1', symbol: 'AAPL', status: 'active' }];

      (prisma.managedPosition.findMany as Mock).mockResolvedValue(mockPositions);
      (prisma.managedPosition.findUnique as Mock).mockRejectedValue(
        new Error('Database error')
      );

      const result = await service.monitorAllPositions();

      expect(result.total).toBe(1);
      expect(result.errors).toBe(1);
    });
  });

  describe('deleteManagedPosition', () => {
    it('should delete a position', async () => {
      (prisma.managedPosition.delete as Mock).mockResolvedValue({});

      await service.deleteManagedPosition('position-123');

      expect(prisma.managedPosition.delete).toHaveBeenCalledWith({
        where: { id: 'position-123' },
      });
    });
  });
});
