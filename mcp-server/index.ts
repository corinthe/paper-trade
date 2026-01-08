#!/usr/bin/env node

/**
 * Prophet Trader MCP Server
 *
 * Exposes 50+ tools for Claude Code to interact with the trading system
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { tradingTools } from './tools/trading.js';
import { marketDataTools } from './tools/market-data.js';
import { optionsTools } from './tools/options.js';
import { positionManagementTools } from './tools/position-management.js';
import { newsTools } from './tools/news.js';
import { intelligenceTools } from './tools/intelligence.js';
import { technicalAnalysisTools } from './tools/technical-analysis.js';
import { activityLogTools } from './tools/activity-log.js';
// Vector search disabled until implementation
// import { vectorSearchTools } from './tools/vector-search.js';

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Initialize server
const server = new Server(
  {
    name: 'prophet-trader',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Combine all tools
const allTools = [
  ...tradingTools,
  ...marketDataTools,
  ...optionsTools,
  ...positionManagementTools,
  ...newsTools,
  ...intelligenceTools,
  ...technicalAnalysisTools,
  ...activityLogTools,
  // ...vectorSearchTools, // Disabled
];

// Handle tool list request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: allTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  };
});

// Handle tool call request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const tool = allTools.find(t => t.name === toolName);

  if (!tool) {
    throw new Error(`Unknown tool: ${toolName}`);
  }

  try {
    const result = await tool.handler(request.params.arguments || {}, API_BASE_URL);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: errorMessage,
            tool: toolName,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Prophet Trader MCP Server running on stdio');
  console.error(`Connected to API at ${API_BASE_URL}`);
  console.error(`Exposing ${allTools.length} tools`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
