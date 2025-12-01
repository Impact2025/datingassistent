import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

interface Program {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  transformation_promise: string;
  price_regular: number;
  price_beta: number | null;
  duration_days: number;
  outcome_category: string | null;
  target_audience: string;
  tangible_proof: string;
  tier: string;
  is_active: boolean;
  created_at: Date;
}

interface ProgramOutcome {
  program_id: number;
  outcome_text: string;
  outcome_order: number;
}

interface ProgramFeature {
  program_id: number;
  feature_text: string;
  feature_type: string;
  feature_order: number;
}

/**
 * GET /api/programs
 * Fetch all active programs with their outcomes and features
 *
 * Query params:
 * - tier: Filter by tier (kickstart, transformatie, vip, alumni)
 * - slug: Get specific program by slug
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get('tier');
    const slug = searchParams.get('slug');

    // Build query based on filters
    let programsQuery;
    if (slug) {
      programsQuery = await sql`
        SELECT * FROM programs
        WHERE slug = ${slug} AND is_active = true
        LIMIT 1
      `;
    } else if (tier) {
      programsQuery = await sql`
        SELECT * FROM programs
        WHERE tier = ${tier} AND is_active = true
        ORDER BY price_regular ASC
      `;
    } else {
      programsQuery = await sql`
        SELECT * FROM programs
        WHERE is_active = true
        ORDER BY
          CASE tier
            WHEN 'kickstart' THEN 1
            WHEN 'transformatie' THEN 2
            WHEN 'vip' THEN 3
            WHEN 'alumni' THEN 4
            ELSE 5
          END,
          price_regular ASC
      `;
    }

    const programs = programsQuery.rows as Program[];

    if (programs.length === 0) {
      return NextResponse.json(
        { error: 'No programs found' },
        { status: 404 }
      );
    }

    // Fetch outcomes and features for all programs
    const programIds = programs.map(p => p.id);

    const [outcomesQuery, featuresQuery] = await Promise.all([
      sql`
        SELECT * FROM program_outcomes
        WHERE program_id = ANY(${programIds})
        ORDER BY program_id, outcome_order ASC
      `,
      sql`
        SELECT * FROM program_features
        WHERE program_id = ANY(${programIds})
        ORDER BY program_id, feature_order ASC
      `
    ]);

    const outcomes = outcomesQuery.rows as ProgramOutcome[];
    const features = featuresQuery.rows as ProgramFeature[];

    // Map outcomes and features to programs
    const enrichedPrograms = programs.map(program => ({
      ...program,
      outcomes: outcomes
        .filter(o => o.program_id === program.id)
        .map(o => o.outcome_text),
      features: features
        .filter(f => f.program_id === program.id)
        .map(f => ({
          text: f.feature_text,
          type: f.feature_type
        }))
    }));

    // If single program requested, return object instead of array
    if (slug) {
      return NextResponse.json(enrichedPrograms[0]);
    }

    return NextResponse.json(enrichedPrograms);

  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch programs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
