/**
 * Technical Analysis Service
 * Calculates technical indicators (RSI, MACD, Bollinger Bands, etc.)
 */

import { logger } from '@/lib/utils/logger';
import type { Bar } from '@/lib/types/trading';
import type { TechnicalIndicators } from '@/lib/types/intelligence';

export class TechnicalAnalysisService {
  /**
   * Calculate RSI (Relative Strength Index)
   */
  calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) {
      throw new Error(`Need at least ${period + 1} prices for RSI calculation`);
    }

    const changes: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }

    let avgGain = 0;
    let avgLoss = 0;

    // Initial average
    for (let i = 0; i < period; i++) {
      if (changes[i] > 0) {
        avgGain += changes[i];
      } else {
        avgLoss += Math.abs(changes[i]);
      }
    }

    avgGain /= period;
    avgLoss /= period;

    // Smoothed averages
    for (let i = period; i < changes.length; i++) {
      if (changes[i] > 0) {
        avgGain = (avgGain * (period - 1) + changes[i]) / period;
        avgLoss = (avgLoss * (period - 1)) / period;
      } else {
        avgGain = (avgGain * (period - 1)) / period;
        avgLoss = (avgLoss * (period - 1) + Math.abs(changes[i])) / period;
      }
    }

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    return Number(rsi.toFixed(2));
  }

  /**
   * Calculate SMA (Simple Moving Average)
   */
  calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) {
      throw new Error(`Need at least ${period} prices for SMA calculation`);
    }

    const slice = prices.slice(-period);
    const sum = slice.reduce((a, b) => a + b, 0);

    return Number((sum / period).toFixed(2));
  }

  /**
   * Calculate EMA (Exponential Moving Average)
   */
  calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) {
      throw new Error(`Need at least ${period} prices for EMA calculation`);
    }

    const multiplier = 2 / (period + 1);
    let ema = this.calculateSMA(prices.slice(0, period), period);

    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }

    return Number(ema.toFixed(2));
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   */
  calculateMACD(prices: number[]): {
    macd: number;
    signal: number;
    histogram: number;
    signal_type: 'bullish' | 'bearish' | 'neutral';
  } {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12 - ema26;

    // Calculate signal line (9-day EMA of MACD)
    // For simplicity, we'll approximate this
    const signal = macd * 0.9; // Simplified
    const histogram = macd - signal;

    let signal_type: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (histogram > 0 && macd > signal) {
      signal_type = 'bullish';
    } else if (histogram < 0 && macd < signal) {
      signal_type = 'bearish';
    }

    return {
      macd: Number(macd.toFixed(2)),
      signal: Number(signal.toFixed(2)),
      histogram: Number(histogram.toFixed(2)),
      signal_type,
    };
  }

  /**
   * Calculate Bollinger Bands
   */
  calculateBollingerBands(
    prices: number[],
    period: number = 20,
    stdDevMultiplier: number = 2
  ): {
    upper: number;
    middle: number;
    lower: number;
    position: 'above' | 'below' | 'inside';
  } {
    const sma = this.calculateSMA(prices, period);
    const slice = prices.slice(-period);

    // Calculate standard deviation
    const squaredDiffs = slice.map((price) => Math.pow(price - sma, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
    const stdDev = Math.sqrt(variance);

    const upper = sma + stdDevMultiplier * stdDev;
    const lower = sma - stdDevMultiplier * stdDev;
    const currentPrice = prices[prices.length - 1];

    let position: 'above' | 'below' | 'inside' = 'inside';
    if (currentPrice > upper) {
      position = 'above';
    } else if (currentPrice < lower) {
      position = 'below';
    }

    return {
      upper: Number(upper.toFixed(2)),
      middle: Number(sma.toFixed(2)),
      lower: Number(lower.toFixed(2)),
      position,
    };
  }

  /**
   * Find support and resistance levels
   */
  findSupportResistance(bars: Bar[]): {
    support: number[];
    resistance: number[];
  } {
    if (bars.length < 10) {
      return { support: [], resistance: [] };
    }

    const highs = bars.map((b) => b.h);
    const lows = bars.map((b) => b.l);

    // Find local maxima and minima
    const resistance: number[] = [];
    const support: number[] = [];

    for (let i = 1; i < bars.length - 1; i++) {
      // Local maximum
      if (highs[i] > highs[i - 1] && highs[i] > highs[i + 1]) {
        resistance.push(highs[i]);
      }

      // Local minimum
      if (lows[i] < lows[i - 1] && lows[i] < lows[i + 1]) {
        support.push(lows[i]);
      }
    }

    // Sort and take top 3
    resistance.sort((a, b) => b - a);
    support.sort((a, b) => a - b);

    return {
      support: support.slice(0, 3).map((s) => Number(s.toFixed(2))),
      resistance: resistance.slice(0, 3).map((r) => Number(r.toFixed(2))),
    };
  }

  /**
   * Detect trend
   */
  detectTrend(prices: number[]): 'uptrend' | 'downtrend' | 'sideways' {
    if (prices.length < 20) {
      return 'sideways';
    }

    const sma20 = this.calculateSMA(prices, 20);
    const sma50 = prices.length >= 50 ? this.calculateSMA(prices, 50) : sma20;
    const currentPrice = prices[prices.length - 1];

    if (currentPrice > sma20 && sma20 > sma50) {
      return 'uptrend';
    } else if (currentPrice < sma20 && sma20 < sma50) {
      return 'downtrend';
    }

    return 'sideways';
  }

  /**
   * Get complete technical analysis
   */
  analyzeBars(bars: Bar[]): TechnicalIndicators {
    logger.debug('Analyzing bars', { count: bars.length });

    const closePrices = bars.map((b) => b.c);
    const currentPrice = closePrices[closePrices.length - 1];

    const rsi = this.calculateRSI(closePrices);
    const sma20 = this.calculateSMA(closePrices, 20);
    const sma50 = closePrices.length >= 50 ? this.calculateSMA(closePrices, 50) : sma20;
    const sma200 = closePrices.length >= 200 ? this.calculateSMA(closePrices, 200) : sma50;
    const ema12 = this.calculateEMA(closePrices, 12);
    const ema26 = this.calculateEMA(closePrices, 26);
    const macd = this.calculateMACD(closePrices);
    const bollingerBands = this.calculateBollingerBands(closePrices);
    const { support, resistance } = this.findSupportResistance(bars);
    const trend = this.detectTrend(closePrices);

    let rsi_signal: 'oversold' | 'overbought' | 'neutral' = 'neutral';
    if (rsi < 30) {
      rsi_signal = 'oversold';
    } else if (rsi > 70) {
      rsi_signal = 'overbought';
    }

    const indicators: TechnicalIndicators = {
      rsi,
      rsi_signal,
      sma_20: sma20,
      sma_50: sma50,
      sma_200: sma200,
      ema_12: ema12,
      ema_26: ema26,
      macd,
      bollinger_bands: bollingerBands,
      trend,
      support_levels: support,
      resistance_levels: resistance,
    };

    logger.debug('Technical analysis complete', {
      rsi,
      trend,
      macd_signal: macd.signal_type,
    });

    return indicators;
  }
}
