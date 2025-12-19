import { sql as vercelSql } from '@vercel/postgres';

// Re-export sql for direct use in API routes
export const sql = vercelSql;

// Database connection configuration
export const db = {
  query: vercelSql,
};

// Helper function to execute queries with error handling
export async function executeQuery<T = any>(
  queryText: string,
  params: any[] = []
): Promise<T[]> {
  try {
    const result = await sql.query(queryText, params);
    return result.rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper function for single row queries
export async function executeQuerySingle<T = any>(
  queryText: string,
  params: any[] = []
): Promise<T | null> {
  const rows = await executeQuery<T>(queryText, params);
  return rows.length > 0 ? rows[0] : null;
}

// Test connection function
export async function testConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1 as test`;
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
