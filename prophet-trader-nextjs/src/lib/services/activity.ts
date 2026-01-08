/**
 * Activity Log Service
 * Handles activity and decision logging
 */

import { logger } from '@/lib/utils/logger';
import { prisma } from '@/lib/db/client';

export type ActivityType =
  | 'TRADE'
  | 'ANALYSIS'
  | 'DECISION'
  | 'ERROR'
  | 'INFO'
  | 'WARNING'
  | 'SYSTEM';

export type DecisionAction = 'BUY' | 'SELL' | 'HOLD' | 'CLOSE' | 'ADJUST';

export interface LogActivityParams {
  type: ActivityType;
  message: string;
  metadata?: Record<string, any>;
}

export interface LogDecisionParams {
  symbol: string;
  action: DecisionAction;
  strategy: string;
  reasoning: string;
  market_context?: string;
  confidence?: number;
  entry_price?: number;
  qty?: number;
  stop_loss?: number;
  take_profit?: number;
}

export interface ActivityLogEntry {
  id: string;
  type: ActivityType;
  message: string;
  metadata: Record<string, any> | null;
  created_at: Date;
}

export interface DecisionEntry {
  id: string;
  symbol: string;
  action: DecisionAction;
  strategy: string;
  reasoning: string;
  market_context: string | null;
  confidence: number | null;
  entry_price: number | null;
  qty: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  result_pct: number | null;
  result_dollars: number | null;
  created_at: Date;
}

export class ActivityLogService {
  /**
   * Log an activity
   */
  async logActivity(params: LogActivityParams): Promise<ActivityLogEntry> {
    logger.debug('Logging activity', params);

    try {
      const entry = await prisma.activityLog.create({
        data: {
          type: params.type,
          message: params.message,
          metadata: params.metadata || undefined,
        },
      });

      logger.info('Activity logged', {
        id: entry.id,
        type: params.type,
      });

      return entry as ActivityLogEntry;
    } catch (error) {
      logger.error('Failed to log activity', error as Error, params);
      throw error;
    }
  }

  /**
   * Log a trading decision
   */
  async logDecision(params: LogDecisionParams): Promise<DecisionEntry> {
    logger.debug('Logging decision', params);

    try {
      const entry = await prisma.decision.create({
        data: {
          symbol: params.symbol.toUpperCase(),
          action: params.action,
          strategy: params.strategy,
          reasoning: params.reasoning,
          market_context: params.market_context || null,
          confidence: params.confidence || null,
          entry_price: params.entry_price || null,
          qty: params.qty || null,
          stop_loss: params.stop_loss || null,
          take_profit: params.take_profit || null,
        },
      });

      // Also log as activity
      await this.logActivity({
        type: 'DECISION',
        message: `${params.action} ${params.symbol}: ${params.reasoning.substring(0, 100)}`,
        metadata: {
          decision_id: entry.id,
          symbol: params.symbol,
          action: params.action,
          strategy: params.strategy,
        },
      });

      logger.info('Decision logged', {
        id: entry.id,
        symbol: params.symbol,
        action: params.action,
      });

      return entry as DecisionEntry;
    } catch (error) {
      logger.error('Failed to log decision', error as Error, params);
      throw error;
    }
  }

  /**
   * Get activity logs with optional filters
   */
  async getActivityLogs(params?: {
    type?: ActivityType;
    limit?: number;
    offset?: number;
    from?: Date;
    to?: Date;
  }): Promise<{ logs: ActivityLogEntry[]; total: number }> {
    const { type, limit = 100, offset = 0, from, to } = params || {};

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (from || to) {
      where.created_at = {};
      if (from) where.created_at.gte = from;
      if (to) where.created_at.lte = to;
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.activityLog.count({ where }),
    ]);

    return {
      logs: logs as ActivityLogEntry[],
      total,
    };
  }

  /**
   * Get decisions with optional filters
   */
  async getDecisions(params?: {
    symbol?: string;
    action?: DecisionAction;
    strategy?: string;
    limit?: number;
    offset?: number;
    from?: Date;
    to?: Date;
  }): Promise<{ decisions: DecisionEntry[]; total: number }> {
    const { symbol, action, strategy, limit = 100, offset = 0, from, to } = params || {};

    const where: any = {};

    if (symbol) {
      where.symbol = symbol.toUpperCase();
    }

    if (action) {
      where.action = action;
    }

    if (strategy) {
      where.strategy = strategy;
    }

    if (from || to) {
      where.created_at = {};
      if (from) where.created_at.gte = from;
      if (to) where.created_at.lte = to;
    }

    const [decisions, total] = await Promise.all([
      prisma.decision.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.decision.count({ where }),
    ]);

    return {
      decisions: decisions as DecisionEntry[],
      total,
    };
  }

  /**
   * Update decision result after trade is closed
   */
  async updateDecisionResult(
    id: string,
    result: { result_pct: number; result_dollars: number }
  ): Promise<DecisionEntry> {
    const updated = await prisma.decision.update({
      where: { id },
      data: {
        result_pct: result.result_pct,
        result_dollars: result.result_dollars,
      },
    });

    logger.info('Decision result updated', {
      id,
      result_pct: result.result_pct,
      result_dollars: result.result_dollars,
    });

    return updated as DecisionEntry;
  }
}
