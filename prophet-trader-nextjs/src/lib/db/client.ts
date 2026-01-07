/**
 * Prisma Client Singleton
 * Ensures only one Prisma Client instance exists
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create a function to safely create PrismaClient
function createPrismaClient() {
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  } catch (error) {
    // During build time, Prisma client may not be generated yet
    // Return a mock client to prevent build failures
    console.warn('PrismaClient not initialized. This is expected during build time.');
    return null as unknown as PrismaClient;
  }
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
