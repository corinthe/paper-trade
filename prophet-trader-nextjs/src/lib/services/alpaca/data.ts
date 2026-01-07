/**
 * Alpaca Data Service
 * Handles market data operations via Alpaca API
 */

import Alpaca from '@alpacahq/alpaca-trade-api';
import { getConfig } from '@/lib/config';
import { logger } from '@/lib/utils/logger';
import { withRetry } from '@/lib/utils/retry';
import type { Quote, Bar, Snapshot, BarParams } from '@/lib/types/trading';

export class AlpacaDataService {
  private client: Alpaca;

  constructor() {
    const config = getConfig();

    this.client = new Alpaca({
      keyId: config.alpaca.apiKey,
      secretKey: config.alpaca.secretKey,
      paper: config.alpaca.paper,
    });

    logger.info('AlpacaDataService initialized');
  }

  /**
   * Get latest quote for a symbol
   */
  async getLatestQuote(symbol: string): Promise<Quote> {
    logger.debug('Fetching latest quote', { symbol });

    return withRetry(
      async () => {
        const quote = await this.client.getLatestQuote(symbol);
        logger.debug('Latest quote fetched', {
          symbol,
          bidPrice: quote.BidPrice,
          askPrice: quote.AskPrice,
        });

        return {
          symbol,
          ask_price: quote.AskPrice,
          ask_size: quote.AskSize,
          ask_exchange: quote.AskExchange,
          bid_price: quote.BidPrice,
          bid_size: quote.BidSize,
          bid_exchange: quote.BidExchange,
          timestamp: quote.Timestamp,
        } as Quote;
      },
      { maxAttempts: 3 }
    );
  }

  /**
   * Get latest bar for a symbol
   */
  async getLatestBar(symbol: string): Promise<Bar> {
    logger.debug('Fetching latest bar', { symbol });

    return withRetry(
      async () => {
        const bar = await this.client.getLatestBar(symbol);
        logger.debug('Latest bar fetched', {
          symbol,
          close: bar.ClosePrice,
        });

        return {
          t: bar.Timestamp,
          o: bar.OpenPrice,
          h: bar.HighPrice,
          l: bar.LowPrice,
          c: bar.ClosePrice,
          v: bar.Volume,
          n: bar.TradeCount,
          vw: bar.VWAP,
        } as Bar;
      },
      { maxAttempts: 3 }
    );
  }

  /**
   * Get historical bars for a symbol
   */
  async getHistoricalBars(params: BarParams): Promise<Bar[]> {
    logger.debug('Fetching historical bars', params);

    return withRetry(
      async () => {
        const bars = await this.client.getBarsV2(
          params.symbol,
          {
            start: params.start,
            end: params.end,
            limit: params.limit,
            timeframe: params.timeframe,
          }
        );

        const result: Bar[] = [];
        for await (const bar of bars) {
          result.push({
            t: bar.Timestamp,
            o: bar.OpenPrice,
            h: bar.HighPrice,
            l: bar.LowPrice,
            c: bar.ClosePrice,
            v: bar.Volume,
            n: bar.TradeCount,
            vw: bar.VWAP,
          });
        }

        logger.info('Historical bars fetched', {
          symbol: params.symbol,
          count: result.length,
        });

        return result;
      },
      { maxAttempts: 3 }
    );
  }

  /**
   * Get snapshot for a symbol
   */
  async getSnapshot(symbol: string): Promise<Snapshot> {
    logger.debug('Fetching snapshot', { symbol });

    return withRetry(
      async () => {
        const snapshot = await this.client.getSnapshot(symbol);
        logger.debug('Snapshot fetched', { symbol });

        return {
          symbol,
          latestTrade: (snapshot as any).LatestTrade
            ? {
                t: (snapshot as any).LatestTrade.Timestamp,
                x: (snapshot as any).LatestTrade.Exchange,
                p: (snapshot as any).LatestTrade.Price,
                s: (snapshot as any).LatestTrade.Size,
                c: (snapshot as any).LatestTrade.Conditions,
                i: (snapshot as any).LatestTrade.ID,
                z: (snapshot as any).LatestTrade.Tape,
              }
            : undefined,
          latestQuote: (snapshot as any).LatestQuote
            ? {
                t: (snapshot as any).LatestQuote.Timestamp,
                ax: (snapshot as any).LatestQuote.AskExchange,
                ap: (snapshot as any).LatestQuote.AskPrice,
                as: (snapshot as any).LatestQuote.AskSize,
                bx: (snapshot as any).LatestQuote.BidExchange,
                bp: (snapshot as any).LatestQuote.BidPrice,
                bs: (snapshot as any).LatestQuote.BidSize,
                c: (snapshot as any).LatestQuote.Conditions,
              }
            : undefined,
          minuteBar: (snapshot as any).MinuteBar
            ? {
                t: (snapshot as any).MinuteBar.Timestamp,
                o: (snapshot as any).MinuteBar.OpenPrice,
                h: (snapshot as any).MinuteBar.HighPrice,
                l: (snapshot as any).MinuteBar.LowPrice,
                c: (snapshot as any).MinuteBar.ClosePrice,
                v: (snapshot as any).MinuteBar.Volume,
                n: (snapshot as any).MinuteBar.TradeCount,
                vw: (snapshot as any).MinuteBar.VWAP,
              }
            : undefined,
          dailyBar: (snapshot as any).DailyBar
            ? {
                t: (snapshot as any).DailyBar.Timestamp,
                o: (snapshot as any).DailyBar.OpenPrice,
                h: (snapshot as any).DailyBar.HighPrice,
                l: (snapshot as any).DailyBar.LowPrice,
                c: (snapshot as any).DailyBar.ClosePrice,
                v: (snapshot as any).DailyBar.Volume,
                n: (snapshot as any).DailyBar.TradeCount,
                vw: (snapshot as any).DailyBar.VWAP,
              }
            : undefined,
          prevDailyBar: (snapshot as any).PrevDailyBar
            ? {
                t: (snapshot as any).PrevDailyBar.Timestamp,
                o: (snapshot as any).PrevDailyBar.OpenPrice,
                h: (snapshot as any).PrevDailyBar.HighPrice,
                l: (snapshot as any).PrevDailyBar.LowPrice,
                c: (snapshot as any).PrevDailyBar.ClosePrice,
                v: (snapshot as any).PrevDailyBar.Volume,
                n: (snapshot as any).PrevDailyBar.TradeCount,
                vw: (snapshot as any).PrevDailyBar.VWAP,
              }
            : undefined,
        } as Snapshot;
      },
      { maxAttempts: 3 }
    );
  }

  /**
   * Get snapshots for multiple symbols
   */
  async getSnapshots(symbols: string[]): Promise<Record<string, Snapshot>> {
    logger.debug('Fetching snapshots', { symbols });

    return withRetry(
      async () => {
        const snapshots = await this.client.getSnapshots(symbols);
        logger.info('Snapshots fetched', { count: Object.keys(snapshots).length });

        const result: Record<string, Snapshot> = {};
        for (const [symbol, snapshot] of Object.entries(snapshots)) {
          result[symbol] = await this.getSnapshot(symbol);
        }

        return result;
      },
      { maxAttempts: 3 }
    );
  }

  /**
   * Get latest trades for multiple symbols
   */
  async getLatestTrades(symbols: string[]): Promise<Record<string, any>> {
    logger.debug('Fetching latest trades', { symbols });

    return withRetry(
      async () => {
        const trades = await this.client.getLatestTrades(symbols);
        logger.info('Latest trades fetched', { count: Object.keys(trades).length });
        return trades;
      },
      { maxAttempts: 3 }
    );
  }

  /**
   * Get bars for multiple symbols
   */
  async getMultiBars(
    symbols: string[],
    params: Omit<BarParams, 'symbol'>
  ): Promise<Record<string, Bar[]>> {
    logger.debug('Fetching multi bars', { symbols, ...params });

    return withRetry(
      async () => {
        const result: Record<string, Bar[]> = {};

        for (const symbol of symbols) {
          result[symbol] = await this.getHistoricalBars({
            ...params,
            symbol,
          });
        }

        logger.info('Multi bars fetched', {
          symbolCount: symbols.length,
        });

        return result;
      },
      { maxAttempts: 3 }
    );
  }
}
