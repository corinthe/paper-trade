/**
 * Structured logging utility
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMetadata {
  [key: string]: any;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: LogMetadata;
  error?: {
    message: string;
    stack?: string;
    name: string;
  };
}

class Logger {
  private shouldLog(level: LogLevel): boolean {
    const env = process.env.NODE_ENV;
    if (env === 'test') return false;
    if (env === 'production' && level === 'debug') return false;
    return true;
  }

  private log(level: LogLevel, message: string, metadata?: LogMetadata, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(metadata && { metadata }),
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
      }),
    };

    const output = JSON.stringify(entry);

    switch (level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'debug':
        console.debug(output);
        break;
      default:
        console.log(output);
    }
  }

  /**
   * Log an informational message
   */
  info(message: string, metadata?: LogMetadata): void {
    this.log('info', message, metadata);
  }

  /**
   * Log a warning message
   */
  warn(message: string, metadata?: LogMetadata): void {
    this.log('warn', message, metadata);
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error, metadata?: LogMetadata): void {
    this.log('error', message, metadata, error);
  }

  /**
   * Log a debug message
   */
  debug(message: string, metadata?: LogMetadata): void {
    this.log('debug', message, metadata);
  }
}

export const logger = new Logger();
