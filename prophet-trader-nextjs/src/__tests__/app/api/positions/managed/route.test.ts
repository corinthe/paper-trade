/**
 * Tests for Managed Positions API Routes
 * POST /api/positions/managed - Create managed position
 * GET /api/positions/managed - List managed positions
 */

import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { POST, GET } from '@/app/api/positions/managed/route';
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

describe('POST /api/positions/managed', () => {
  let mockService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockService = {
      createManagedPosition: vi.fn(),
    };
    (PositionManagerService as any).mockImplementation(() => mockService);
  });

  it('should create a managed position with valid data', async () => {
    const requestBody = {
      symbol: 'AAPL',
      qty: 10,
      side: 'buy',
      stopLossPct: 2,
      takeProfitPct: 5,
      trailingStop: false,
    };

    const mockPosition = {
      id: 'position-123',
      ...requestBody,
      entry_price: 150,
      stop_loss_price: 147,
      take_profit_price: 157.5,
      status: 'active',
      created_at: new Date(),
    };

    mockService.createManagedPosition.mockResolvedValue(mockPosition);

    const request = new NextRequest('http://localhost:3000/api/positions/managed', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockPosition);
    expect(mockService.createManagedPosition).toHaveBeenCalledWith({
      symbol: 'AAPL',
      qty: 10,
      side: 'buy',
      stopLossPct: 2,
      takeProfitPct: 5,
      trailingStop: false,
    });
  });

  it('should validate symbol is uppercase', async () => {
    const requestBody = {
      symbol: 'aapl', // lowercase - will be converted
      qty: 10,
      side: 'buy',
      stopLossPct: 2,
      takeProfitPct: 5,
    };

    mockService.createManagedPosition.mockResolvedValue({});

    const request = new NextRequest('http://localhost:3000/api/positions/managed', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(mockService.createManagedPosition).toHaveBeenCalledWith(
      expect.objectContaining({ symbol: 'AAPL' })
    );
  });

  it('should return 400 for invalid qty (negative)', async () => {
    const requestBody = {
      symbol: 'AAPL',
      qty: -10, // Invalid
      side: 'buy',
      stopLossPct: 2,
      takeProfitPct: 5,
    };

    const request = new NextRequest('http://localhost:3000/api/positions/managed', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Validation error');
    expect(mockService.createManagedPosition).not.toHaveBeenCalled();
  });

  it('should return 400 for invalid side', async () => {
    const requestBody = {
      symbol: 'AAPL',
      qty: 10,
      side: 'invalid', // Invalid side
      stopLossPct: 2,
      takeProfitPct: 5,
    };

    const request = new NextRequest('http://localhost:3000/api/positions/managed', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Validation error');
  });

  it('should return 400 for stopLossPct > 100', async () => {
    const requestBody = {
      symbol: 'AAPL',
      qty: 10,
      side: 'buy',
      stopLossPct: 150, // > 100
      takeProfitPct: 5,
    };

    const request = new NextRequest('http://localhost:3000/api/positions/managed', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should return 500 if service throws error', async () => {
    const requestBody = {
      symbol: 'AAPL',
      qty: 10,
      side: 'buy',
      stopLossPct: 2,
      takeProfitPct: 5,
    };

    mockService.createManagedPosition.mockRejectedValue(
      new Error('Insufficient buying power')
    );

    const request = new NextRequest('http://localhost:3000/api/positions/managed', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Insufficient buying power');
  });

  it('should default trailingStop to false if not provided', async () => {
    const requestBody = {
      symbol: 'AAPL',
      qty: 10,
      side: 'buy',
      stopLossPct: 2,
      takeProfitPct: 5,
      // trailingStop not provided
    };

    mockService.createManagedPosition.mockResolvedValue({});

    const request = new NextRequest('http://localhost:3000/api/positions/managed', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    await POST(request);

    expect(mockService.createManagedPosition).toHaveBeenCalledWith(
      expect.objectContaining({ trailingStop: false })
    );
  });
});

describe('GET /api/positions/managed', () => {
  let mockService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockService = {
      getManagedPositions: vi.fn(),
    };
    (PositionManagerService as any).mockImplementation(() => mockService);
  });

  it('should return all managed positions without filters', async () => {
    const mockPositions = [
      { id: '1', symbol: 'AAPL', status: 'active' },
      { id: '2', symbol: 'TSLA', status: 'closed' },
    ];

    mockService.getManagedPositions.mockResolvedValue(mockPositions);

    const request = new NextRequest('http://localhost:3000/api/positions/managed');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockPositions);
    expect(data.count).toBe(2);
    expect(mockService.getManagedPositions).toHaveBeenCalledWith({
      status: null,
      symbol: undefined,
      limit: undefined,
    });
  });

  it('should filter by status', async () => {
    const mockPositions = [{ id: '1', symbol: 'AAPL', status: 'active' }];

    mockService.getManagedPositions.mockResolvedValue(mockPositions);

    const request = new NextRequest(
      'http://localhost:3000/api/positions/managed?status=active'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(mockService.getManagedPositions).toHaveBeenCalledWith({
      status: 'active',
      symbol: undefined,
      limit: undefined,
    });
  });

  it('should filter by symbol', async () => {
    const mockPositions = [{ id: '1', symbol: 'AAPL', status: 'active' }];

    mockService.getManagedPositions.mockResolvedValue(mockPositions);

    const request = new NextRequest(
      'http://localhost:3000/api/positions/managed?symbol=AAPL'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(mockService.getManagedPositions).toHaveBeenCalledWith({
      status: null,
      symbol: 'AAPL',
      limit: undefined,
    });
  });

  it('should respect limit parameter', async () => {
    mockService.getManagedPositions.mockResolvedValue([]);

    const request = new NextRequest(
      'http://localhost:3000/api/positions/managed?limit=50'
    );
    await GET(request);

    expect(mockService.getManagedPositions).toHaveBeenCalledWith({
      status: null,
      symbol: undefined,
      limit: 50,
    });
  });

  it('should handle multiple filters', async () => {
    mockService.getManagedPositions.mockResolvedValue([]);

    const request = new NextRequest(
      'http://localhost:3000/api/positions/managed?status=active&symbol=AAPL&limit=10'
    );
    await GET(request);

    expect(mockService.getManagedPositions).toHaveBeenCalledWith({
      status: 'active',
      symbol: 'AAPL',
      limit: 10,
    });
  });

  it('should return 500 if service throws error', async () => {
    mockService.getManagedPositions.mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/positions/managed');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Database error');
  });

  it('should return empty array when no positions exist', async () => {
    mockService.getManagedPositions.mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3000/api/positions/managed');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
    expect(data.count).toBe(0);
  });
});
