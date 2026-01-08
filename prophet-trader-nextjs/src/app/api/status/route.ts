/**
 * Status API Route
 * GET /api/status - Get system status and configuration mode
 */

import { NextResponse } from 'next/server';
import { getConfig } from '@/lib/config';

export async function GET() {
  const config = getConfig();

  const alpacaConfigured = !!config.alpaca.apiKey && !!config.alpaca.secretKey;
  const claudeConfigured = !!config.anthropic.apiKey;
  const voyageConfigured = !!config.voyage.apiKey;

  const status = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.env,
    services: {
      alpaca: {
        configured: alpacaConfigured,
        paper: config.alpaca.paper,
        mode: alpacaConfigured ? (config.alpaca.paper ? 'paper' : 'live') : 'not_configured',
      },
      claude: {
        configured: claudeConfigured,
        mode: claudeConfigured ? 'live' : 'mock',
        description: claudeConfigured
          ? 'AI-powered analysis enabled'
          : 'Using keyword-based mock analysis',
      },
      voyage: {
        configured: voyageConfigured,
        mode: voyageConfigured ? 'live' : 'fallback',
        description: voyageConfigured
          ? 'Semantic embeddings enabled'
          : 'Using hash-based fallback embeddings',
      },
      database: {
        configured: !!config.database.url,
      },
    },
    features: {
      trading: alpacaConfigured ? 'real' : 'disabled',
      ai_analysis: claudeConfigured ? 'claude_ai' : 'mock_keywords',
      vector_search: voyageConfigured ? 'semantic_voyage' : 'hash_fallback',
      news: 'enabled_rss',
      technical_analysis: 'enabled',
    },
    messages: [
      alpacaConfigured
        ? `Alpaca ${config.alpaca.paper ? 'PAPER' : 'LIVE'} trading enabled`
        : 'Alpaca not configured - trading disabled',
      claudeConfigured
        ? 'Claude AI analysis enabled'
        : 'Claude not configured - using mock analysis (set ANTHROPIC_API_KEY for real AI)',
      voyageConfigured
        ? 'Voyage embeddings enabled'
        : 'Voyage not configured - using fallback embeddings (set VOYAGE_API_KEY for semantic search)',
    ],
  };

  return NextResponse.json(status);
}
