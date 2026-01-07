/**
 * Tests for Individual Managed Position API Routes
 * GET /api/positions/managed/[id] - Get position details
 * DELETE /api/positions/managed/[id] - Close position
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, DELETE } from '@/app/api/positions/managed/[id]/route';
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

describe('GET /api/positions/managed/[id]', () => {
  let mockService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockService = {
      getManagedPosition: vi.fn(),
    };
    (PositionManagerService as any).mockImplementation(() => mockService);
  });

  it('should return position details for valid ID', async () => {
    const mockPosition = {
      id: 'position-123',
      symbol: 'AAPL',
      qty: 10,
      entry_price: 150,
      status: 'active',
      stop_loss_price: 147,
      take_profit_price: 157.5,
    };

    mockService.getManagedPosition.mockResolvedValue(mockPosition);

    const request = new NextRequest(
      'http://localhost:3000/api/positions/managed/position-123'
    );

    const response = await GET(request, {
      params: Promise.resolve({ id: 'position-123' }),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockPosition);
    expect(mockService.getManagedPosition).toHaveBeenCalledWith('position-123');
  });

  it('should return 404 if position not found', async () => {
    mockService.getManagedPosition.mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/positions/managed/nonexistent'
    );

    const response = await GET(request, {
      params: Promise.resolve({ id: 'nonexistent' }),
    });

    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Managed position not found');
  });

  it('should return 500 if service throws error', async () => {
    mockService.getManagedPosition.mockRejectedValue(new Error('Database error'));

    const request = new NextRequest(
      'http://localhost:3000/api/positions/managed/position-123'
    );

    const response = await GET(request, {
      params: Promise.resolve({ id: 'position-123' }),
    });

    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Database error');
  });
});

describe('DELETE /api/positions/managed/[id]', () => {
  let mockService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockService = {
      getManagedPosition: vi.fn(),
      closeManagedPosition: vi.fn(),
    };
    (PositionManagerService as any).mockImplementation(() => mockService);
  });

  it('should close position successfully', async () => {
    const mockPosition = {
      id: 'position-123',
      symbol: 'AAPL',
      status: 'active',
    };

    const mockClosedPosition = {
      ...mockPosition,
      status: 'closed',
      closed_reason: 'manual_close',
      closed_at: new Date(),
    };

    mockService.getManagedPosition.mockResolvedValue(mockPosition);
    mockService.closeManagedPosition.mockResolvedValue(mockClosedPosition);

    const request = new NextRequest(
      'http://localhost:3000/api/positions/managed/position-123',
      { method: 'DELETE' }
    );

    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'position-123' }),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockClosedPosition);
    expect(data.message).toBe('Managed position closed successfully');
    expect(mockService.closeManagedPosition).toHaveBeenCalledWith(
      'position-123',
      'manual_close'
    );
  });

  it('should use custom reason from query params', async () => {
    const mockPosition = {
      id: 'position-123',
      symbol: 'AAPL',
      status: 'active',
    };

    mockService.getManagedPosition.mockResolvedValue(mockPosition);
    mockService.closeManagedPosition.mockResolvedValue({ ...mockPosition, status: 'closed' });

    const request = new NextRequest(
      'http://localhost:3000/api/positions/managed/position-123?reason=emergency_stop',
      { method: 'DELETE' }
    );

    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'position-123' }),
    });

    expect(response.status).toBe(200);
    expect(mockService.closeManagedPosition).toHaveBeenCalledWith(
      'position-123',
      'emergency_stop'
    );
  });

  it('should return 404 if position not found', async () => {
    mockService.getManagedPosition.mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/positions/managed/nonexistent',
      { method: 'DELETE' }
    );

    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'nonexistent' }),
    });

    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Managed position not found');
    expect(mockService.closeManagedPosition).not.toHaveBeenCalled();
  });

  it('should return 400 if position is already closed', async () => {
    const mockPosition = {
      id: 'position-123',
      symbol: 'AAPL',
      status: 'closed', // Already closed
    };

    mockService.getManagedPosition.mockResolvedValue(mockPosition);

    const request = new NextRequest(
      'http://localhost:3000/api/positions/managed/position-123',
      { method: 'DELETE' }
    );

    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'position-123' }),
    });

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Position is already closed');
    expect(mockService.closeManagedPosition).not.toHaveBeenCalled();
  });

  it('should return 500 if close operation fails', async () => {
    const mockPosition = {
      id: 'position-123',
      symbol: 'AAPL',
      status: 'active',
    };

    mockService.getManagedPosition.mockResolvedValue(mockPosition);
    mockService.closeManagedPosition.mockRejectedValue(
      new Error('Failed to close position')
    );

    const request = new NextRequest(
      'http://localhost:3000/api/positions/managed/position-123',
      { method: 'DELETE' }
    );

    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'position-123' }),
    });

    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Failed to close position');
  });

  it('should handle positions in monitoring status', async () => {
    const mockPosition = {
      id: 'position-123',
      symbol: 'AAPL',
      status: 'monitoring',
    };

    mockService.getManagedPosition.mockResolvedValue(mockPosition);
    mockService.closeManagedPosition.mockResolvedValue({
      ...mockPosition,
      status: 'closed',
    });

    const request = new NextRequest(
      'http://localhost:3000/api/positions/managed/position-123',
      { method: 'DELETE' }
    );

    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'position-123' }),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
