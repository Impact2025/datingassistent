import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/auth';
import { applyRateLimit, RateLimitPresets } from '@/lib/rate-limiter';

export const dynamic = 'force-dynamic';

/**
 * GET /api/kickstart/day-zero
 * Haal de Dag 0 status op voor huidige user
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await applyRateLimit(request, RateLimitPresets.api);
    if (rateLimitResponse) return rateLimitResponse;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Get day zero progress
    const result = await sql`
      SELECT * FROM day_zero_progress
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        progress: null,
        completed: false,
      });
    }

    const progress = result.rows[0];

    return NextResponse.json({
      success: true,
      progress: {
        completed: progress.completed,
        vision_statement: progress.vision_statement,
        commitment_level: progress.commitment_level,
        commitment_checklist: progress.commitment_checklist,
        first_impression_notes: progress.first_impression_notes,
        completed_at: progress.completed_at,
        created_at: progress.created_at,
      },
      completed: progress.completed,
    });

  } catch (error) {
    console.error('Get day-zero error:', error);
    return NextResponse.json(
      {
        error: 'Fout bij ophalen Dag 0 status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/kickstart/day-zero
 * Update/save Dag 0 progress (kan meerdere keren per stap)
 *
 * Body kan bevatten:
 * - vision_statement?: string
 * - commitment_level?: number (1-10)
 * - commitment_checklist?: { daily_time: boolean, honest_reflections: boolean, do_exercises: boolean }
 * - first_impression_notes?: string
 * - completed?: boolean
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await applyRateLimit(request, RateLimitPresets.api);
    if (rateLimitResponse) return rateLimitResponse;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn' },
        { status: 401 }
      );
    }

    const userId = user.id;
    const body = await request.json();

    // Check if record exists
    const existingResult = await sql`
      SELECT * FROM day_zero_progress
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    if (existingResult.rows.length === 0) {
      // Create new record
      const insertResult = await sql`
        INSERT INTO day_zero_progress (
          user_id,
          vision_statement,
          commitment_level,
          commitment_checklist,
          first_impression_notes,
          completed,
          completed_at
        ) VALUES (
          ${userId},
          ${body.vision_statement || null},
          ${body.commitment_level || null},
          ${body.commitment_checklist ? JSON.stringify(body.commitment_checklist) : null},
          ${body.first_impression_notes || null},
          ${body.completed || false},
          ${body.completed ? new Date().toISOString() : null}
        )
        RETURNING *
      `;

      const progress = insertResult.rows[0];

      return NextResponse.json({
        success: true,
        progress,
        message: 'Dag 0 progress opgeslagen',
      });

    } else {
      // Update existing record
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (body.vision_statement !== undefined) {
        updates.push(`vision_statement = $${paramIndex++}`);
        values.push(body.vision_statement);
      }

      if (body.commitment_level !== undefined) {
        // Validate commitment_level
        if (body.commitment_level < 1 || body.commitment_level > 10) {
          return NextResponse.json(
            { error: 'Commitment level moet tussen 1 en 10 zijn' },
            { status: 400 }
          );
        }
        updates.push(`commitment_level = $${paramIndex++}`);
        values.push(body.commitment_level);
      }

      if (body.commitment_checklist !== undefined) {
        updates.push(`commitment_checklist = $${paramIndex++}`);
        values.push(JSON.stringify(body.commitment_checklist));
      }

      if (body.first_impression_notes !== undefined) {
        updates.push(`first_impression_notes = $${paramIndex++}`);
        values.push(body.first_impression_notes);
      }

      if (body.completed !== undefined) {
        updates.push(`completed = $${paramIndex++}`);
        values.push(body.completed);

        // Als completed = true, zet completed_at
        if (body.completed) {
          updates.push(`completed_at = NOW()`);
        }
      }

      // Always update updated_at
      updates.push(`updated_at = NOW()`);

      if (updates.length === 1) {
        // Only updated_at, no actual changes
        return NextResponse.json({
          success: true,
          progress: existingResult.rows[0],
          message: 'Geen wijzigingen',
        });
      }

      // Build and execute update query
      const updateResult = await sql.query(
        `UPDATE day_zero_progress SET ${updates.join(', ')}
         WHERE user_id = $${paramIndex}
         RETURNING *`,
        [...values, userId]
      );

      const progress = updateResult.rows[0];

      return NextResponse.json({
        success: true,
        progress,
        message: 'Dag 0 progress bijgewerkt',
      });
    }

  } catch (error) {
    console.error('Update day-zero error:', error);
    return NextResponse.json(
      {
        error: 'Fout bij opslaan Dag 0 progress',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
