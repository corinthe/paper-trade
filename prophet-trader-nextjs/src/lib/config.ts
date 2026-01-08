/**
 * Application configuration with Zod validation
 * Supports mock mode for testing without paid APIs
 */

import { z } from 'zod';

const ConfigSchema = z.object({
  alpaca: z.object({
    apiKey: z.string(),
    secretKey: z.string(),
    paper: z.boolean(),
  }),
  anthropic: z.object({
    apiKey: z.string(),
  }),
  voyage: z.object({
    apiKey: z.string(),
  }),
  database: z.object({
    url: z.string(),
  }),
  env: z.enum(['development', 'production', 'test']),
  mockMode: z.boolean(),
});

export type Config = z.infer<typeof ConfigSchema>;

function loadConfig(): Config {
  // mockMode controls AI services (Claude, Voyage) only
  // Alpaca trading is always real when configured
  const anthropicKey = process.env.ANTHROPIC_API_KEY || '';
  const alpacaKey = process.env.ALPACA_API_KEY || '';
  const alpacaSecret = process.env.ALPACA_SECRET_KEY || '';

  // Mock mode only affects AI services (Claude)
  // Set MOCK_MODE=true to force mock mode, or it auto-enables when ANTHROPIC_API_KEY is missing
  const mockMode = process.env.MOCK_MODE === 'true' || !anthropicKey;

  return ConfigSchema.parse({
    alpaca: {
      apiKey: alpacaKey,
      secretKey: alpacaSecret,
      paper: process.env.ALPACA_PAPER !== 'false', // Default to paper trading
    },
    anthropic: {
      apiKey: anthropicKey,
    },
    voyage: {
      apiKey: process.env.VOYAGE_API_KEY || '',
    },
    database: {
      url: process.env.DATABASE_URL || process.env.PRISMA_DATABASE_URL || '',
    },
    env: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
    mockMode,
  });
}

// Singleton config instance
let configInstance: Config | null = null;

export function getConfig(): Config {
  if (!configInstance) {
    configInstance = loadConfig();
  }
  return configInstance;
}
