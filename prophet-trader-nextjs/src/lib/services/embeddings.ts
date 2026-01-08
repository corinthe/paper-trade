/**
 * Embeddings Service
 * Generates vector embeddings for semantic search using Voyage AI
 */

import { logger } from '@/lib/utils/logger';

const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings';
const VOYAGE_MODEL = 'voyage-3-lite'; // 512 dimensions, fast and cost-effective
const EMBEDDING_DIMENSIONS = 512;

export interface EmbeddingResult {
  embedding: number[];
  tokens_used: number;
}

export class EmbeddingsService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.VOYAGE_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('VOYAGE_API_KEY not set - embeddings will use fallback');
    }
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    if (!this.apiKey) {
      // Fallback: generate a deterministic pseudo-embedding based on text hash
      return this.generateFallbackEmbedding(text);
    }

    try {
      const response = await fetch(VOYAGE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: VOYAGE_MODEL,
          input: text,
          input_type: 'document',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Voyage API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      logger.debug('Embedding generated', {
        tokens: data.usage?.total_tokens,
        dimensions: data.data[0]?.embedding?.length,
      });

      return {
        embedding: data.data[0].embedding,
        tokens_used: data.usage?.total_tokens || 0,
      };
    } catch (error) {
      logger.error('Failed to generate embedding', error as Error);
      // Fallback to deterministic embedding on error
      return this.generateFallbackEmbedding(text);
    }
  }

  /**
   * Generate embeddings for multiple texts (batch)
   */
  async generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    if (!this.apiKey) {
      return texts.map(text => this.generateFallbackEmbedding(text));
    }

    try {
      const response = await fetch(VOYAGE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: VOYAGE_MODEL,
          input: texts,
          input_type: 'document',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Voyage API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      logger.debug('Batch embeddings generated', {
        count: texts.length,
        tokens: data.usage?.total_tokens,
      });

      return data.data.map((item: any, index: number) => ({
        embedding: item.embedding,
        tokens_used: Math.floor((data.usage?.total_tokens || 0) / texts.length),
      }));
    } catch (error) {
      logger.error('Failed to generate batch embeddings', error as Error);
      return texts.map(text => this.generateFallbackEmbedding(text));
    }
  }

  /**
   * Generate embedding for a trading decision
   */
  async generateDecisionEmbedding(params: {
    symbol: string;
    action: string;
    strategy?: string;
    reasoning: string;
    market_context?: string;
  }): Promise<EmbeddingResult> {
    // Combine all relevant fields into a single text for embedding
    const textParts = [
      `Symbol: ${params.symbol}`,
      `Action: ${params.action}`,
    ];

    if (params.strategy) {
      textParts.push(`Strategy: ${params.strategy}`);
    }

    textParts.push(`Reasoning: ${params.reasoning}`);

    if (params.market_context) {
      textParts.push(`Market Context: ${params.market_context}`);
    }

    const text = textParts.join('\n');

    logger.debug('Generating decision embedding', {
      symbol: params.symbol,
      action: params.action,
      textLength: text.length,
    });

    return this.generateEmbedding(text);
  }

  /**
   * Generate embedding for a search query
   */
  async generateQueryEmbedding(query: string): Promise<EmbeddingResult> {
    if (!this.apiKey) {
      return this.generateFallbackEmbedding(query);
    }

    try {
      const response = await fetch(VOYAGE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: VOYAGE_MODEL,
          input: query,
          input_type: 'query', // Optimized for search queries
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Voyage API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      return {
        embedding: data.data[0].embedding,
        tokens_used: data.usage?.total_tokens || 0,
      };
    } catch (error) {
      logger.error('Failed to generate query embedding', error as Error);
      return this.generateFallbackEmbedding(query);
    }
  }

  /**
   * Fallback embedding generator using deterministic hashing
   * Used when Voyage API is unavailable
   */
  private generateFallbackEmbedding(text: string): EmbeddingResult {
    logger.debug('Using fallback embedding generator');

    const embedding = new Array(EMBEDDING_DIMENSIONS).fill(0);

    // Simple hash-based pseudo-embedding
    // This is NOT suitable for real semantic search but allows the system to work
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const index = (charCode * (i + 1)) % EMBEDDING_DIMENSIONS;
      embedding[index] += Math.sin(charCode * (i + 1)) * 0.1;
    }

    // Normalize the vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] /= magnitude;
      }
    }

    return {
      embedding,
      tokens_used: 0,
    };
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embeddings must have the same dimensions');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    if (magnitude === 0) return 0;

    return dotProduct / magnitude;
  }

  /**
   * Get the embedding dimensions used by this service
   */
  static getDimensions(): number {
    return EMBEDDING_DIMENSIONS;
  }
}
