/**
 * Application configuration with Zod validation
 */

import { z } from 'zod';

const ConfigSchema = z.object({
  alpaca: z.object({
    apiKey: z.string().min(1, 'ALPACA_API_KEY is required'),
    secretKey: z.string().min(1, 'ALPACA_SECRET_KEY is required'),
    paper: z.boolean(),
  }),
  anthropic: z.object({
    apiKey: z.string().min(1, 'ANTHROPIC_API_KEY is required'),
  }),
  database: z.object({
    url: z.string().url('DATABASE_URL must be a valid URL'),
  }),
  env: z.enum(['development', 'production', 'test']),
});

export type Config = z.infer<typeof ConfigSchema>;

function loadConfig(): Config {
  return ConfigSchema.parse({
    alpaca: {
      apiKey: process.env.ALPACA_API_KEY || '',
      secretKey: process.env.ALPACA_SECRET_KEY || '',
      paper: process.env.ALPACA_PAPER === 'true',
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    },
    database: {
      url: process.env.DATABASE_URL || '',
    },
    env: process.env.NODE_ENV || 'development',
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
