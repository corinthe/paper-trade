-- Enable pgvector extension for PostgreSQL
-- This must be run before pushing the Prisma schema

CREATE EXTENSION IF NOT EXISTS vector;

-- Verify the extension is installed
SELECT * FROM pg_extension WHERE extname = 'vector';
