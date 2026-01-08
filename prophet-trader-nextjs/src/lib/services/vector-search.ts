/**
 * Vector Search Service
 * Handles semantic search over trading decisions using pgvector
 */

import { prisma } from '@/lib/db/client';
import { EmbeddingsService } from './embeddings';
import { logger } from '@/lib/utils/logger';

export type DecisionAction = 'BUY' | 'SELL' | 'HOLD' | 'CLOSE' | 'ADJUST';

export interface StoreDecisionParams {
  symbol: string;
  action: DecisionAction;
  strategy?: string;
  reasoning: string;
  market_context?: string;
  confidence?: number;
  entry_price?: number;
  qty?: number;
  stop_loss?: number;
  take_profit?: number;
  result_pct?: number;
  result_dollars?: number;
}

export interface SearchParams {
  query: string;
  symbol?: string;
  action?: DecisionAction;
  limit?: number;
  min_similarity?: number;
}

export interface SearchResult {
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
  similarity: number;
}

export interface TradeStats {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  avg_return_pct: number;
  total_return_dollars: number;
  best_trade_pct: number;
  worst_trade_pct: number;
  by_symbol: Record<string, {
    count: number;
    win_rate: number;
    avg_return_pct: number;
  }>;
  by_strategy: Record<string, {
    count: number;
    win_rate: number;
    avg_return_pct: number;
  }>;
  by_action: Record<string, {
    count: number;
    win_rate: number;
    avg_return_pct: number;
  }>;
}

export class VectorSearchService {
  private embeddingsService: EmbeddingsService;

  constructor() {
    this.embeddingsService = new EmbeddingsService();
  }

  /**
   * Store a trading decision with its embedding
   */
  async storeDecision(params: StoreDecisionParams): Promise<{ id: string; success: boolean }> {
    logger.info('Storing decision with embedding', {
      symbol: params.symbol,
      action: params.action,
    });

    try {
      // Generate embedding for the decision
      const { embedding } = await this.embeddingsService.generateDecisionEmbedding({
        symbol: params.symbol,
        action: params.action,
        strategy: params.strategy,
        reasoning: params.reasoning,
        market_context: params.market_context,
      });

      // Convert embedding array to pgvector format
      const embeddingStr = `[${embedding.join(',')}]`;

      // Insert using raw query to handle vector type
      const result = await prisma.$queryRaw<{ id: string }[]>`
        INSERT INTO "Decision" (
          id, symbol, action, strategy, reasoning, market_context,
          confidence, entry_price, qty, stop_loss, take_profit,
          result_pct, result_dollars, embedding, created_at
        ) VALUES (
          gen_random_uuid()::text,
          ${params.symbol.toUpperCase()},
          ${params.action}::"DecisionAction",
          ${params.strategy || 'unknown'},
          ${params.reasoning},
          ${params.market_context || null},
          ${params.confidence || null},
          ${params.entry_price || null},
          ${params.qty || null},
          ${params.stop_loss || null},
          ${params.take_profit || null},
          ${params.result_pct || null},
          ${params.result_dollars || null},
          ${embeddingStr}::vector,
          NOW()
        )
        RETURNING id
      `;

      logger.info('Decision stored successfully', { id: result[0].id });

      return {
        id: result[0].id,
        success: true,
      };
    } catch (error) {
      logger.error('Failed to store decision', error as Error, params);
      throw error;
    }
  }

  /**
   * Search for similar trading decisions using semantic similarity
   */
  async searchSimilar(params: SearchParams): Promise<SearchResult[]> {
    const { query, symbol, action, limit = 10, min_similarity = 0.5 } = params;

    logger.info('Searching similar decisions', {
      query: query.substring(0, 50),
      symbol,
      action,
      limit,
    });

    try {
      // Generate embedding for the search query
      const { embedding } = await this.embeddingsService.generateQueryEmbedding(query);
      const embeddingStr = `[${embedding.join(',')}]`;

      // Build the WHERE clause dynamically
      let whereClause = `WHERE embedding IS NOT NULL`;
      if (symbol) {
        whereClause += ` AND symbol = '${symbol.toUpperCase()}'`;
      }
      if (action) {
        whereClause += ` AND action = '${action}'::"DecisionAction"`;
      }

      // Search using cosine similarity (1 - cosine distance)
      const results = await prisma.$queryRawUnsafe<SearchResult[]>(`
        SELECT
          id,
          symbol,
          action,
          strategy,
          reasoning,
          market_context,
          confidence,
          entry_price,
          qty,
          stop_loss,
          take_profit,
          result_pct,
          result_dollars,
          created_at,
          1 - (embedding <=> '${embeddingStr}'::vector) as similarity
        FROM "Decision"
        ${whereClause}
          AND 1 - (embedding <=> '${embeddingStr}'::vector) >= ${min_similarity}
        ORDER BY embedding <=> '${embeddingStr}'::vector
        LIMIT ${limit}
      `);

      logger.info('Search completed', {
        resultsCount: results.length,
        topSimilarity: results[0]?.similarity,
      });

      return results;
    } catch (error) {
      logger.error('Failed to search similar decisions', error as Error);
      throw error;
    }
  }

  /**
   * Get trading statistics from the decision history
   */
  async getStats(params?: {
    symbol?: string;
    strategy?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<TradeStats> {
    const { symbol, strategy, start_date, end_date } = params || {};

    logger.info('Getting trade stats', params);

    try {
      // Build WHERE clause
      const conditions: string[] = [];
      if (symbol) conditions.push(`symbol = '${symbol.toUpperCase()}'`);
      if (strategy) conditions.push(`strategy = '${strategy}'`);
      if (start_date) conditions.push(`created_at >= '${start_date}'::timestamp`);
      if (end_date) conditions.push(`created_at <= '${end_date}'::timestamp`);

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get all decisions matching filters
      const decisions = await prisma.$queryRawUnsafe<Array<{
        id: string;
        symbol: string;
        action: string;
        strategy: string;
        result_pct: number | null;
        result_dollars: number | null;
      }>>(`
        SELECT id, symbol, action, strategy, result_pct, result_dollars
        FROM "Decision"
        ${whereClause}
      `);

      // Calculate stats
      const tradesWithResults = decisions.filter(d => d.result_pct !== null);
      const winningTrades = tradesWithResults.filter(d => (d.result_pct || 0) > 0);
      const losingTrades = tradesWithResults.filter(d => (d.result_pct || 0) < 0);

      const stats: TradeStats = {
        total_trades: decisions.length,
        winning_trades: winningTrades.length,
        losing_trades: losingTrades.length,
        win_rate: tradesWithResults.length > 0
          ? winningTrades.length / tradesWithResults.length
          : 0,
        avg_return_pct: tradesWithResults.length > 0
          ? tradesWithResults.reduce((sum, d) => sum + (d.result_pct || 0), 0) / tradesWithResults.length
          : 0,
        total_return_dollars: tradesWithResults.reduce((sum, d) => sum + (d.result_dollars || 0), 0),
        best_trade_pct: tradesWithResults.length > 0
          ? Math.max(...tradesWithResults.map(d => d.result_pct || 0))
          : 0,
        worst_trade_pct: tradesWithResults.length > 0
          ? Math.min(...tradesWithResults.map(d => d.result_pct || 0))
          : 0,
        by_symbol: {},
        by_strategy: {},
        by_action: {},
      };

      // Group by symbol
      const symbolGroups = this.groupBy(tradesWithResults, 'symbol');
      for (const [sym, trades] of Object.entries(symbolGroups)) {
        const wins = trades.filter(t => (t.result_pct || 0) > 0);
        stats.by_symbol[sym] = {
          count: trades.length,
          win_rate: trades.length > 0 ? wins.length / trades.length : 0,
          avg_return_pct: trades.length > 0
            ? trades.reduce((sum, t) => sum + (t.result_pct || 0), 0) / trades.length
            : 0,
        };
      }

      // Group by strategy
      const strategyGroups = this.groupBy(tradesWithResults, 'strategy');
      for (const [strat, trades] of Object.entries(strategyGroups)) {
        const wins = trades.filter(t => (t.result_pct || 0) > 0);
        stats.by_strategy[strat] = {
          count: trades.length,
          win_rate: trades.length > 0 ? wins.length / trades.length : 0,
          avg_return_pct: trades.length > 0
            ? trades.reduce((sum, t) => sum + (t.result_pct || 0), 0) / trades.length
            : 0,
        };
      }

      // Group by action
      const actionGroups = this.groupBy(tradesWithResults, 'action');
      for (const [act, trades] of Object.entries(actionGroups)) {
        const wins = trades.filter(t => (t.result_pct || 0) > 0);
        stats.by_action[act] = {
          count: trades.length,
          win_rate: trades.length > 0 ? wins.length / trades.length : 0,
          avg_return_pct: trades.length > 0
            ? trades.reduce((sum, t) => sum + (t.result_pct || 0), 0) / trades.length
            : 0,
        };
      }

      logger.info('Stats calculated', {
        total_trades: stats.total_trades,
        win_rate: stats.win_rate,
      });

      return stats;
    } catch (error) {
      logger.error('Failed to get trade stats', error as Error);
      throw error;
    }
  }

  /**
   * Update the result of an existing decision
   */
  async updateDecisionResult(
    id: string,
    result: { result_pct: number; result_dollars: number }
  ): Promise<void> {
    await prisma.decision.update({
      where: { id },
      data: {
        result_pct: result.result_pct,
        result_dollars: result.result_dollars,
      },
    });

    logger.info('Decision result updated', { id, ...result });
  }

  /**
   * Helper function to group array by key
   */
  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const value = String(item[key]);
      if (!groups[value]) {
        groups[value] = [];
      }
      groups[value].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }
}
