/**
 * AI CONTEXT API
 * Save and retrieve AI personalization context
 * GET/POST /api/ai-context
 *
 * Professional implementation with:
 * - Secure token-based authentication
 * - Cache management for AI context
 * - Query performance monitoring
 * - Size validation (prevent 413 errors)
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { select, insert, update } from '@/lib/db/query-wrapper';
import { logDatabaseError } from '@/lib/error-logging';
import { verifyToken } from '@/lib/jwt-config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_CONTEXT_SIZE = 100000; // 100KB limit

/**
 * GET /api/ai-context
 * Retrieve user's AI context from cache
 */
export async function GET(request: NextRequest) {
  try {
    // Get user from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token using centralized jwt-config
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Retrieve all AI context for user
    const result = await select(
      async () => {
        return await sql`
          SELECT
            content_type,
            content_key,
            content_data,
            expires_at,
            last_used
          FROM ai_content_cache
          WHERE user_id = ${userId}
            AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
          ORDER BY last_used DESC
        `;
      },
      'get-ai-context'
    );

    const context: Record<string, any> = {};
    result.rows.forEach(row => {
      const data = typeof row.content_data === 'string'
        ? JSON.parse(row.content_data)
        : row.content_data;

      if (!context[row.content_type]) {
        context[row.content_type] = {};
      }
      context[row.content_type][row.content_key] = data;
    });

    console.log(`📖 Retrieved AI context for user ${userId}: ${result.rows.length} entries`);

    return NextResponse.json({
      success: true,
      context
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error getting AI context:', error);
    logDatabaseError(
      error instanceof Error ? error : new Error('Get AI context failed'),
      'get-ai-context'
    );

    return NextResponse.json(
      { error: 'Failed to get AI context', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai-context
 * Save or update AI context
 */
export async function POST(request: NextRequest) {
  try {
    // Get user from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token using centralized jwt-config
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const userId = user.id;

    const body = await request.json();
    const { action, updates } = body;

    // Validate request size
    const requestSize = JSON.stringify(body).length;
    if (requestSize > MAX_CONTEXT_SIZE) {
      return NextResponse.json(
        { error: 'Request too large', message: 'Context data exceeds 100KB limit' },
        { status: 413 }
      );
    }

    // Handle save_context action (used by onboarding)
    if (action === 'save_context' && updates) {
      console.log(`💾 Saving AI context for user ${userId}`, Object.keys(updates));

      // Save each field to ai_content_cache
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined) continue;

        const contentType = 'user_preferences';
        const contentKey = key;
        const contentData = { value, updatedAt: new Date().toISOString() };

        // Check if entry exists
        const existing = await sql`
          SELECT id FROM ai_content_cache
          WHERE user_id = ${userId}
            AND content_type = ${contentType}
            AND content_key = ${contentKey}
        `;

        if (existing.rows.length === 0) {
          // Insert new entry
          await insert(
            async () => {
              return await sql`
                INSERT INTO ai_content_cache (
                  user_id,
                  content_type,
                  content_key,
                  content_data,
                  ai_model,
                  ai_version,
                  usage_count,
                  last_used
                ) VALUES (
                  ${userId},
                  ${contentType},
                  ${contentKey},
                  ${JSON.stringify(contentData)}::jsonb,
                  'user-input',
                  'v1.0',
                  1,
                  CURRENT_TIMESTAMP
                )
              `;
            },
            'insert-ai-context'
          );
        } else {
          // Update existing entry
          await update(
            async () => {
              return await sql`
                UPDATE ai_content_cache
                SET
                  content_data = ${JSON.stringify(contentData)}::jsonb,
                  usage_count = usage_count + 1,
                  last_used = CURRENT_TIMESTAMP
                WHERE user_id = ${userId}
                  AND content_type = ${contentType}
                  AND content_key = ${contentKey}
              `;
            },
            'update-ai-context'
          );
        }
      }

      console.log(`✅ AI context saved for user ${userId}`);

      return NextResponse.json({
        success: true,
        message: 'AI context saved successfully'
      }, { status: 200 });
    }

    // Unsupported action
    return NextResponse.json(
      { error: 'Invalid action. Supported: save_context' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Error updating AI context:', error);
    logDatabaseError(
      error instanceof Error ? error : new Error('Update AI context failed'),
      'update-ai-context'
    );

    return NextResponse.json(
      { error: 'Failed to update AI context', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
