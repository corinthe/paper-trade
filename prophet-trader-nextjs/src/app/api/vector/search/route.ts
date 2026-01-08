/**
 * Vector Search API Route
 * POST /api/vector/search - Search for similar trading decisions
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { VectorSearchService } from '@/lib/services/vector-search';
import { logger } from '@/lib/utils/logger';

const searchSchema = z.object({
  query: z.string().min(1),
  symbol: z.string().min(1).max(10).optional(),
  action: z.enum(['BUY', 'SELL', 'HOLD', 'CLOSE', 'ADJUST']).optional(),
  limit: z.number().int().min(1).max(100).optional().default(10),
  min_similarity: z.number().min(0).max(1).optional().default(0.5),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Normalize action to uppercase if provided
    if (body.action) {
      body.action = body.action.toUpperCase();
    }

    const validatedData = searchSchema.parse(body);

    const service = new VectorSearchService();
    const results = await service.searchSimilar({
      query: validatedData.query,
      symbol: validatedData.symbol,
      action: validatedData.action,
      limit: validatedData.limit,
      min_similarity: validatedData.min_similarity,
    });

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
      query: validatedData.query,
    });
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

    logger.error('Failed to search decisions', error as Error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search decisions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
