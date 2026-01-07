import { beforeAll, afterEach, afterAll, vi } from 'vitest';

// Mock environment variables
beforeAll(() => {
  process.env.ALPACA_API_KEY = 'test-api-key';
  process.env.ALPACA_SECRET_KEY = 'test-secret-key';
  process.env.ALPACA_PAPER = 'true';
  process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
});

// Clear all mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});
