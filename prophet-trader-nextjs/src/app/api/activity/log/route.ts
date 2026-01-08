/**
 * Activity Log API Route
 * GET /api/activity/log - Get activity logs
 * POST /api/activity/log - Log a new activity
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ActivityLogService } from '@/lib/services/activity';
import { logger } from '@/lib/utils/logger';

const logActivitySchema = z.object({
  type: z.enum(['TRADE', 'ANALYSIS', 'DECISION', 'ERROR', 'INFO', 'WARNING', 'SYSTEM']),
  message: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as any;
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const service = new ActivityLogService();
    const result = await service.getActivityLogs({
      type: type || undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: result.logs,
      total: result.total,
      count: result.logs.length,
    });
  } catch (error) {
    logger.error('Failed to fetch activity logs', error as Error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch activity logs',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = logActivitySchema.parse(body);

    const service = new ActivityLogService();
    const entry = await service.logActivity(validatedData);

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

    logger.error('Failed to log activity', error as Error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to log activity',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
