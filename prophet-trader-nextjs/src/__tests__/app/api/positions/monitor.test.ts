/**
 * Tests for Position Monitoring API Routes
 * POST /api/positions/monitor - Monitor all positions
 * GET /api/positions/monitor - Get monitoring status
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from '@/app/api/positions/monitor/route';
import { PositionManagerService } from '@/lib/services/positions';
import { NextRequest } from 'next/server';

// Mock PositionManagerService
vi.mock('@/lib/services/positions');
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('POST /api/positions/monitor', () => {
  let mockService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockService = {
      monitorAllPositions: vi.fn(),
    };
    (PositionManagerService as any).mockImplementation(() => mockService);
  });

  it('should monitor all positions and return results', async () => {
    const mockResult = {
      total: 5,
      triggered: 2,
      errors: 0,
    };

    mockService.monitorAllPositions.mockResolvedValue(mockResult);

    const request = new NextRequest('http://localhost:3000/api/positions/monitor', {
      method: 'POST',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockResult);
    expect(data.message).toBe('Monitored 5 positions, 2 triggered, 0 errors');
    expect(mockService.monitorAllPositions).toHaveBeenCalled();
  });

  it('should handle when no positions are active', async () => {
    const mockResult = {
      total: 0,
      triggered: 0,
      errors: 0,
    };

    mockService.monitorAllPositions.mockResolvedValue(mockResult);

    const request = new NextRequest('http://localhost:3000/api/positions/monitor', {
      method: 'POST',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.total).toBe(0);
    expect(data.message).toBe('Monitored 0 positions, 0 triggered, 0 errors');
  });

  it('should report errors during monitoring', async () => {
    const mockResult = {
      total: 10,
      triggered: 3,
      errors: 2,
    };

    mockService.monitorAllPositions.mockResolvedValue(mockResult);

    const request = new NextRequest('http://localhost:3000/api/positions/monitor', {
      method: 'POST',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.errors).toBe(2);
    expect(data.message).toBe('Monitored 10 positions, 3 triggered, 2 errors');
  });

  it('should return 500 if monitoring service fails', async () => {
    mockService.monitorAllPositions.mockRejectedValue(
      new Error('Service unavailable')
    );

    const request = new NextRequest('http://localhost:3000/api/positions/monitor', {
      method: 'POST',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Service unavailable');
  });

  it('should handle monitoring when all positions trigger', async () => {
    const mockResult = {
      total: 3,
      triggered: 3,
      errors: 0,
    };

    mockService.monitorAllPositions.mockResolvedValue(mockResult);

    const request = new NextRequest('http://localhost:3000/api/positions/monitor', {
      method: 'POST',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.triggered).toBe(3);
  });
});

describe('GET /api/positions/monitor', () => {
  let mockService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockService = {
      getActiveManagedPositions: vi.fn(),
    };
    (PositionManagerService as any).mockImplementation(() => mockService);
  });

  it('should return monitoring status with active positions', async () => {
    const mockPositions = [
      {
        id: 'pos-1',
        symbol: 'AAPL',
        status: 'active',
        entry_price: 150,
        current_price: 152,
        stop_loss_price: 147,
        take_profit_price: 157.5,
        unrealized_plpc: 1.33,
      },
      {
        id: 'pos-2',
        symbol: 'TSLA',
        status: 'monitoring',
        entry_price: 200,
        current_price: 205,
        stop_loss_price: 194,
        take_profit_price: 210,
        unrealized_plpc: 2.5,
      },
    ];

    mockService.getActiveManagedPositions.mockResolvedValue(mockPositions);

    const request = new NextRequest('http://localhost:3000/api/positions/monitor');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.activePositions).toBe(2);
    expect(data.data.positions).toHaveLength(2);
    expect(data.data.positions[0]).toEqual({
      id: 'pos-1',
      symbol: 'AAPL',
      status: 'active',
      entry_price: 150,
      current_price: 152,
      stop_loss_price: 147,
      take_profit_price: 157.5,
      unrealized_plpc: 1.33,
    });
  });

  it('should return empty array when no active positions', async () => {
    mockService.getActiveManagedPositions.mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3000/api/positions/monitor');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.activePositions).toBe(0);
    expect(data.data.positions).toEqual([]);
  });

  it('should include only relevant position fields', async () => {
    const mockPositions = [
      {
        id: 'pos-1',
        symbol: 'AAPL',
        status: 'active',
        entry_price: 150,
        current_price: 152,
        stop_loss_price: 147,
        take_profit_price: 157.5,
        unrealized_plpc: 1.33,
        // These fields should not be in response
        entry_order_id: 'order-123',
        stop_loss_pct: 2,
        take_profit_pct: 5,
      },
    ];

    mockService.getActiveManagedPositions.mockResolvedValue(mockPositions);

    const request = new NextRequest('http://localhost:3000/api/positions/monitor');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    const position = data.data.positions[0];
    expect(position.id).toBe('pos-1');
    expect(position.symbol).toBe('AAPL');
    expect(position.entry_order_id).toBeUndefined();
    expect(position.stop_loss_pct).toBeUndefined();
  });

  it('should return 500 if service throws error', async () => {
    mockService.getActiveManagedPositions.mockRejectedValue(
      new Error('Database connection failed')
    );

    const request = new NextRequest('http://localhost:3000/api/positions/monitor');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Database connection failed');
  });

  it('should handle positions with null current_price', async () => {
    const mockPositions = [
      {
        id: 'pos-1',
        symbol: 'AAPL',
        status: 'active',
        entry_price: 150,
        current_price: null,
        stop_loss_price: 147,
        take_profit_price: 157.5,
        unrealized_plpc: null,
      },
    ];

    mockService.getActiveManagedPositions.mockResolvedValue(mockPositions);

    const request = new NextRequest('http://localhost:3000/api/positions/monitor');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.positions[0].current_price).toBeNull();
    expect(data.data.positions[0].unrealized_plpc).toBeNull();
  });
});
