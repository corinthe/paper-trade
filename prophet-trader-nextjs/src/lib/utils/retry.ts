/**
 * Retry utility for handling transient failures
 */

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
}

export class RetryError extends Error {
  constructor(message: string, public readonly attempts: number, public readonly lastError: Error) {
    super(message);
    this.name = 'RetryError';
  }
}

/**
 * Retry an async operation with exponential backoff
 * @param operation - The async function to retry
 * @param options - Retry configuration
 * @returns The result of the operation
 * @throws RetryError if all attempts fail
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts || 3;
  const delay = options.delay || 1000;
  const backoff = options.backoff || 'exponential';

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on last attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Calculate wait time
      const waitTime =
        backoff === 'exponential'
          ? delay * Math.pow(2, attempt - 1)
          : delay * attempt;

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw new RetryError(
    `Operation failed after ${maxAttempts} attempts`,
    maxAttempts,
    lastError!
  );
}
