/**
 * DATABASE QUERY WRAPPER
 * Automatic logging, monitoring, and error handling for database queries
 * Created: 2025-11-22
 */

import { sql } from '@vercel/postgres';
import { logDatabaseError } from '../error-logging';
import { measureDatabaseQuery } from '../performance-monitoring';
import { addBreadcrumb } from '../error-logging';

export interface QueryOptions {
  name?: string; // Human-readable query name for logging
  timeout?: number; // Query timeout in milliseconds
  retries?: number; // Number of retries on failure
  logSlowQueries?: boolean; // Log queries slower than threshold
  slowQueryThreshold?: number; // Threshold in ms (default: 1000ms)
}

const DEFAULT_OPTIONS: QueryOptions = {
  timeout: 30000, // 30 seconds
  retries: 0,
  logSlowQueries: true,
  slowQueryThreshold: 1000,
};

/**
 * Execute a database query with automatic monitoring and error handling
 */
export async function query<T = any>(
  queryFn: () => Promise<T>,
  options: QueryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const queryName = opts.name || 'unnamed-query';
  const startTime = Date.now();

  // Add breadcrumb for debugging
  addBreadcrumb(
    `DB Query: ${queryName}`,
    'database',
    'debug',
    { startTime: new Date(startTime).toISOString() }
  );

  try {
    // Execute query with performance monitoring
    const result = await measureDatabaseQuery(queryName, async () => {
      return await executeWithRetry(queryFn, opts.retries || 0);
    });

    const duration = Date.now() - startTime;

    // Log slow queries
    if (opts.logSlowQueries && duration > (opts.slowQueryThreshold || 1000)) {
      console.warn(`🐌 Slow query detected: ${queryName} took ${duration}ms`);

      addBreadcrumb(
        `Slow Query: ${queryName}`,
        'database',
        'warning',
        { duration, threshold: opts.slowQueryThreshold }
      );
    }

    // Log successful query in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 DB Query: ${queryName} (${duration}ms)`);
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    console.error(`❌ DB Query failed: ${queryName} after ${duration}ms`, error);

    // Log to error tracking
    logDatabaseError(
      error instanceof Error ? error : new Error('Unknown database error'),
      queryName
    );

    throw error;
  }
}

/**
 * Execute query with retry logic
 */
async function executeWithRetry<T>(
  queryFn: () => Promise<T>,
  retries: number
): Promise<T> {
  try {
    return await queryFn();
  } catch (error) {
    if (retries > 0 && isRetryableError(error)) {
      console.warn(`Retrying query... (${retries} attempts left)`);
      await sleep(1000); // Wait 1 second before retry
      return executeWithRetry(queryFn, retries - 1);
    }

    throw error;
  }
}

/**
 * Check if error is retryable (connection issues, timeouts, etc.)
 */
function isRetryableError(error: any): boolean {
  const retryableErrors = [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ECONNRESET',
    '40001', // Serialization failure
    '40P01', // Deadlock detected
  ];

  const errorMessage = error?.message || error?.code || '';

  return retryableErrors.some(code => errorMessage.includes(code));
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// QUERY BUILDERS
// ============================================================================

/**
 * Safe SELECT query with automatic monitoring
 */
export async function select<T = any>(
  queryFn: () => Promise<T>,
  name: string
): Promise<T> {
  return query(queryFn, {
    name: `SELECT: ${name}`,
    retries: 1, // Retry SELECTs once
  });
}

/**
 * Safe INSERT query with automatic monitoring
 */
export async function insert<T = any>(
  queryFn: () => Promise<T>,
  name: string
): Promise<T> {
  return query(queryFn, {
    name: `INSERT: ${name}`,
    retries: 0, // Don't retry INSERTs (might duplicate data)
  });
}

/**
 * Safe UPDATE query with automatic monitoring
 */
export async function update<T = any>(
  queryFn: () => Promise<T>,
  name: string
): Promise<T> {
  return query(queryFn, {
    name: `UPDATE: ${name}`,
    retries: 0, // Don't retry UPDATEs
  });
}

/**
 * Safe DELETE query with automatic monitoring
 */
export async function deleteQuery<T = any>(
  queryFn: () => Promise<T>,
  name: string
): Promise<T> {
  return query(queryFn, {
    name: `DELETE: ${name}`,
    retries: 0, // Don't retry DELETEs
  });
}

// ============================================================================
// TRANSACTION HELPERS
// ============================================================================

/**
 * Execute queries in a transaction
 */
export async function transaction<T>(
  name: string,
  callback: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();

  addBreadcrumb(
    `Transaction Start: ${name}`,
    'database',
    'info'
  );

  try {
    await sql`BEGIN`;

    const result = await callback();

    await sql`COMMIT`;

    const duration = Date.now() - startTime;

    addBreadcrumb(
      `Transaction Complete: ${name}`,
      'database',
      'info',
      { duration }
    );

    console.log(`✅ Transaction ${name} completed in ${duration}ms`);

    return result;
  } catch (error) {
    await sql`ROLLBACK`;

    const duration = Date.now() - startTime;

    console.error(`❌ Transaction ${name} failed after ${duration}ms`, error);

    addBreadcrumb(
      `Transaction Rollback: ${name}`,
      'database',
      'error',
      { duration, error: error instanceof Error ? error.message : 'Unknown' }
    );

    logDatabaseError(
      error instanceof Error ? error : new Error('Transaction failed'),
      `Transaction: ${name}`
    );

    throw error;
  }
}

// ============================================================================
// QUERY MONITORING
// ============================================================================

interface QueryStats {
  totalQueries: number;
  slowQueries: number;
  failedQueries: number;
  averageResponseTime: number;
}

const queryStats: QueryStats = {
  totalQueries: 0,
  slowQueries: 0,
  failedQueries: 0,
  averageResponseTime: 0,
};

/**
 * Get query statistics
 */
export function getQueryStats(): QueryStats {
  return { ...queryStats };
}

/**
 * Reset query statistics
 */
export function resetQueryStats(): void {
  queryStats.totalQueries = 0;
  queryStats.slowQueries = 0;
  queryStats.failedQueries = 0;
  queryStats.averageResponseTime = 0;
}

// ============================================================================
// CONNECTION POOL MONITORING
// ============================================================================

/**
 * Get database connection pool status
 * Note: @vercel/postgres doesn't expose pool stats directly
 * This is a placeholder for when we switch to pg directly
 */
export async function getConnectionPoolStatus(): Promise<any> {
  return {
    total: 'unknown',
    idle: 'unknown',
    waiting: 'unknown',
    message: '@vercel/postgres does not expose pool stats',
  };
}
