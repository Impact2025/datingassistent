/**
 * Application Logger
 *
 * Centralized logging system with different log levels.
 * In production, this can be extended to send logs to external services
 * like Sentry, LogRocket, Datadog, or custom logging endpoints.
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info('User logged in', { userId: 123 });
 *   logger.error('Payment failed', { error, orderId });
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  private formatMessage(entry: LogEntry): string {
    const emoji = {
      debug: '🐛',
      info: 'ℹ️ ',
      warn: '⚠️ ',
      error: '❌',
    }[entry.level];

    return `${emoji} [${entry.timestamp}] ${entry.message}`;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    // In development, use console with pretty formatting
    if (this.isDevelopment) {
      const formatted = this.formatMessage(entry);

      switch (level) {
        case 'debug':
          console.debug(formatted, context || '');
          break;
        case 'info':
          console.log(formatted, context || '');
          break;
        case 'warn':
          console.warn(formatted, context || '');
          break;
        case 'error':
          console.error(formatted, context || '', error || '');
          if (error?.stack) {
            console.error(error.stack);
          }
          break;
      }
      return;
    }

    // In production, use structured JSON logging
    const logData: any = {
      level,
      message,
      timestamp: entry.timestamp,
      ...(context && { context }),
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
      }),
    };

    // Output as JSON for production log aggregators
    console.log(JSON.stringify(logData));

    // TODO: Send critical errors to external monitoring service
    if (level === 'error' && this.isProduction) {
      // Example: Send to Sentry
      // Sentry.captureException(error || new Error(message), { contexts: { custom: context } });
    }
  }

  /**
   * Debug level - detailed information for debugging
   * Only logged in development
   */
  debug(message: string, context?: Record<string, any>) {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }

  /**
   * Info level - general informational messages
   */
  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  /**
   * Warning level - something unexpected but not critical
   */
  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  /**
   * Error level - error conditions that need attention
   */
  error(message: string, errorOrContext?: Error | Record<string, any>, context?: Record<string, any>) {
    if (errorOrContext instanceof Error) {
      this.log('error', message, context, errorOrContext);
    } else {
      this.log('error', message, errorOrContext);
    }
  }

  /**
   * Log authentication events
   */
  auth(action: 'login' | 'logout' | 'register' | 'failed_login', context: Record<string, any>) {
    this.info(`Auth: ${action}`, { ...context, category: 'auth' });
  }

  /**
   * Log payment events
   */
  payment(action: string, context: Record<string, any>) {
    this.info(`Payment: ${action}`, { ...context, category: 'payment' });
  }

  /**
   * Log API requests (for important endpoints)
   */
  apiRequest(method: string, path: string, context?: Record<string, any>) {
    this.debug(`API ${method} ${path}`, { ...context, category: 'api' });
  }

  /**
   * Log database queries (for monitoring)
   */
  database(query: string, context?: Record<string, any>) {
    this.debug(`Database query`, { ...context, query, category: 'database' });
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * Helper to safely serialize errors for logging
 */
export function serializeError(error: unknown): Record<string, any> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (typeof error === 'object' && error !== null) {
    return { ...error };
  }

  return { error: String(error) };
}

/**
 * Helper to redact sensitive information from logs
 */
export function redactSensitive(data: Record<string, any>): Record<string, any> {
  const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'authorization', 'cookie'];
  const redacted = { ...data };

  for (const key of Object.keys(redacted)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
      redacted[key] = '[REDACTED]';
    }

    // Recursively redact nested objects
    if (typeof redacted[key] === 'object' && redacted[key] !== null) {
      redacted[key] = redactSensitive(redacted[key]);
    }
  }

  return redacted;
}
