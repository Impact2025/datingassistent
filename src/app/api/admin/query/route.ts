import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { adminSecurityMiddleware } from '@/lib/admin-security';

// Query whitelist for security
const ALLOWED_QUERY_PATTERNS = [
  /^SELECT\s+/i,
  /^INSERT\s+INTO\s+/i,
  /^UPDATE\s+/i,
  /^DELETE\s+FROM\s+/i,
];

// Dangerous keywords that should be blocked
const DANGEROUS_KEYWORDS = [
  'DROP',
  'TRUNCATE',
  'ALTER',
  'CREATE',
  'GRANT',
  'REVOKE',
  'EXEC',
  'EXECUTE',
  'SP_',
  'XP_',
  'INFORMATION_SCHEMA',
  'SYSOBJECTS',
  'SYSCOLUMNS'
];

function validateQuery(query: string): { valid: boolean; reason?: string } {
  // Check for dangerous keywords
  const upperQuery = query.toUpperCase();
  for (const keyword of DANGEROUS_KEYWORDS) {
    if (upperQuery.includes(keyword)) {
      return { valid: false, reason: `Dangerous keyword detected: ${keyword}` };
    }
  }

  // Check if query matches allowed patterns
  const isAllowed = ALLOWED_QUERY_PATTERNS.some(pattern => pattern.test(query.trim()));
  if (!isAllowed) {
    return { valid: false, reason: 'Query type not allowed. Only SELECT, INSERT, UPDATE, DELETE are permitted.' };
  }

  // Additional validation for SELECT queries
  if (upperQuery.startsWith('SELECT')) {
    // Prevent selecting from system tables
    if (upperQuery.includes('PG_') || upperQuery.includes('INFORMATION_SCHEMA')) {
      return { valid: false, reason: 'Access to system tables is not allowed' };
    }
  }

  return { valid: true };
}

function sanitizeParams(params: any[]): any[] {
  return params.map(param => {
    // Basic sanitization - prevent injection through parameters
    if (typeof param === 'string') {
      // Remove any potential SQL injection characters
      return param.replace(/['";\\]/g, '');
    }
    return param;
  });
}

export async function POST(request: NextRequest) {
  // Apply comprehensive admin security middleware
  const securityResult = await adminSecurityMiddleware(request, {
    enableRateLimiting: true,
    enableInputValidation: true,
    enableAuditLogging: true,
    strictMode: true // Block suspicious queries
  });

  if (!securityResult.allowed) {
    return securityResult.response!;
  }

  const adminUser = securityResult.adminUser!;
  let result;

  try {
    const body = await request.json();
    const { query, params = [] } = body;

    // Input validation
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Valid query string is required' }, { status: 400 });
    }

    if (query.length > 10000) {
      return NextResponse.json({ error: 'Query too long (max 10000 characters)' }, { status: 400 });
    }

    // Validate query structure and security
    const validation = validateQuery(query);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.reason || 'Query validation failed' },
        { status: 403 }
      );
    }

    // Sanitize parameters
    const sanitizedParams = sanitizeParams(params);

    console.log('🔍 Executing validated query:', query.substring(0, 100) + '...');

    // Execute query safely with parameterized statements
    try {
      if (sanitizedParams && sanitizedParams.length > 0) {
        result = await sql.query(query, sanitizedParams);
      } else {
        result = await sql.query(query);
      }
    } catch (sqlError) {
      console.error('SQL Execution error:', sqlError);
      return NextResponse.json(
        { error: 'Query execution failed', details: sqlError instanceof Error ? sqlError.message : 'Unknown error' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      rows: result.rows,
      rowCount: result.rowCount,
      fields: result.fields?.map(f => f.name) || []
    });

  } catch (error) {
    console.error('❌ Admin query error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Query execution failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}