/**
 * Alpaca Options Service
 * Handles options data operations via Alpaca API
 */

import Alpaca from '@alpacahq/alpaca-trade-api';
import { getConfig } from '@/lib/config';
import { logger } from '@/lib/utils/logger';
import { withRetry } from '@/lib/utils/retry';

export interface OptionContract {
  symbol: string;
  name: string;
  status: string;
  tradable: boolean;
  expiration_date: string;
  root_symbol: string;
  underlying_symbol: string;
  underlying_asset_id: string;
  type: 'call' | 'put';
  style: 'american' | 'european';
  strike_price: number;
  size: number;
  open_interest: number;
  open_interest_date: string;
  close_price: number;
  close_price_date: string;
}

export interface OptionSnapshot {
  symbol: string;
  latestQuote?: {
    ap: number;
    as: number;
    bp: number;
    bs: number;
    t: string;
  };
  latestTrade?: {
    p: number;
    s: number;
    t: string;
    x: string;
  };
  greeks?: {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
    rho: number;
  };
  impliedVolatility?: number;
}

export interface OptionBar {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  n?: number;
  vw?: number;
}

export class AlpacaOptionsService {
  private client: Alpaca;

  constructor() {
    const config = getConfig();

    this.client = new Alpaca({
      keyId: config.alpaca.apiKey,
      secretKey: config.alpaca.secretKey,
      paper: config.alpaca.paper,
    });

    logger.info('AlpacaOptionsService initialized');
  }

  /**
   * Get option chain for an underlying symbol
   */
  async getOptionChain(params: {
    underlying_symbol: string;
    expiration_date?: string;
    expiration_date_gte?: string;
    expiration_date_lte?: string;
    strike_price_gte?: number;
    strike_price_lte?: number;
    type?: 'call' | 'put';
    limit?: number;
  }): Promise<OptionContract[]> {
    logger.debug('Fetching option chain', params);

    return withRetry(
      async () => {
        // Alpaca options API endpoint
        const queryParams: Record<string, string> = {
          underlying_symbols: params.underlying_symbol,
        };

        if (params.expiration_date) {
          queryParams.expiration_date = params.expiration_date;
        }
        if (params.expiration_date_gte) {
          queryParams.expiration_date_gte = params.expiration_date_gte;
        }
        if (params.expiration_date_lte) {
          queryParams.expiration_date_lte = params.expiration_date_lte;
        }
        if (params.strike_price_gte) {
          queryParams.strike_price_gte = String(params.strike_price_gte);
        }
        if (params.strike_price_lte) {
          queryParams.strike_price_lte = String(params.strike_price_lte);
        }
        if (params.type) {
          queryParams.type = params.type;
        }
        if (params.limit) {
          queryParams.limit = String(params.limit);
        }

        const response = await fetch(
          `https://paper-api.alpaca.markets/v2/options/contracts?${new URLSearchParams(queryParams)}`,
          {
            headers: {
              'APCA-API-KEY-ID': getConfig().alpaca.apiKey,
              'APCA-API-SECRET-KEY': getConfig().alpaca.secretKey,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch option chain: ${response.statusText}`);
        }

        const data = await response.json();
        logger.info('Option chain fetched', {
          underlying: params.underlying_symbol,
          count: data.option_contracts?.length || 0,
        });

        return data.option_contracts || [];
      },
      { maxAttempts: 3 }
    );
  }

  /**
   * Get snapshot for an option contract
   */
  async getOptionSnapshot(symbol: string): Promise<OptionSnapshot> {
    logger.debug('Fetching option snapshot', { symbol });

    return withRetry(
      async () => {
        const response = await fetch(
          `https://data.alpaca.markets/v1beta1/options/snapshots/${symbol}`,
          {
            headers: {
              'APCA-API-KEY-ID': getConfig().alpaca.apiKey,
              'APCA-API-SECRET-KEY': getConfig().alpaca.secretKey,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch option snapshot: ${response.statusText}`);
        }

        const data = await response.json();
        logger.debug('Option snapshot fetched', { symbol });

        return {
          symbol,
          latestQuote: data.latestQuote,
          latestTrade: data.latestTrade,
          greeks: data.greeks,
          impliedVolatility: data.impliedVolatility,
        };
      },
      { maxAttempts: 3 }
    );
  }

  /**
   * Get historical bars for an option contract
   */
  async getOptionBars(params: {
    symbol: string;
    timeframe?: string;
    start?: string;
    end?: string;
    limit?: number;
  }): Promise<OptionBar[]> {
    logger.debug('Fetching option bars', params);

    return withRetry(
      async () => {
        const queryParams: Record<string, string> = {
          timeframe: params.timeframe || '1Day',
        };

        if (params.start) queryParams.start = params.start;
        if (params.end) queryParams.end = params.end;
        if (params.limit) queryParams.limit = String(params.limit);

        const response = await fetch(
          `https://data.alpaca.markets/v1beta1/options/bars/${params.symbol}?${new URLSearchParams(queryParams)}`,
          {
            headers: {
              'APCA-API-KEY-ID': getConfig().alpaca.apiKey,
              'APCA-API-SECRET-KEY': getConfig().alpaca.secretKey,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch option bars: ${response.statusText}`);
        }

        const data = await response.json();
        logger.info('Option bars fetched', {
          symbol: params.symbol,
          count: data.bars?.length || 0,
        });

        return data.bars || [];
      },
      { maxAttempts: 3 }
    );
  }

  /**
   * Get latest trade for an option contract
   */
  async getOptionLatestTrade(symbol: string): Promise<any> {
    logger.debug('Fetching option latest trade', { symbol });

    return withRetry(
      async () => {
        const response = await fetch(
          `https://data.alpaca.markets/v1beta1/options/trades/latest?symbols=${symbol}`,
          {
            headers: {
              'APCA-API-KEY-ID': getConfig().alpaca.apiKey,
              'APCA-API-SECRET-KEY': getConfig().alpaca.secretKey,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch option latest trade: ${response.statusText}`);
        }

        const data = await response.json();
        logger.debug('Option latest trade fetched', { symbol });

        return data.trades?.[symbol] || null;
      },
      { maxAttempts: 3 }
    );
  }

  /**
   * Get latest quote for an option contract
   */
  async getOptionLatestQuote(symbol: string): Promise<any> {
    logger.debug('Fetching option latest quote', { symbol });

    return withRetry(
      async () => {
        const response = await fetch(
          `https://data.alpaca.markets/v1beta1/options/quotes/latest?symbols=${symbol}`,
          {
            headers: {
              'APCA-API-KEY-ID': getConfig().alpaca.apiKey,
              'APCA-API-SECRET-KEY': getConfig().alpaca.secretKey,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch option latest quote: ${response.statusText}`);
        }

        const data = await response.json();
        logger.debug('Option latest quote fetched', { symbol });

        return data.quotes?.[symbol] || null;
      },
      { maxAttempts: 3 }
    );
  }
}
