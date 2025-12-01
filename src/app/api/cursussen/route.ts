import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * GET /api/cursussen
 * Haal alle gepubliceerde cursussen op
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Fetching cursussen...');

    // Simpele query zonder auth (voor nu)
    const result = await sql`
      SELECT
        c.*,
        COUNT(DISTINCT cl.id) as totaal_lessen
      FROM cursussen c
      LEFT JOIN cursus_lessen cl ON cl.cursus_id = c.id AND cl.status = 'published'
      WHERE c.status = 'published'
      GROUP BY c.id
      ORDER BY c.created_at ASC
    `;

    console.log(`✅ Found ${result.rows.length} cursussen`);

    const cursussen = result.rows.map((cursus: any) => ({
      ...cursus,
      doelen: cursus.doelen || [],
      gekoppelde_tools: cursus.gekoppelde_tools || [],
      user_progress: {
        voltooide_lessen: 0,
        totaal_lessen: parseInt(cursus.totaal_lessen) || 0,
        percentage: 0
      }
    }));

    return NextResponse.json({ cursussen });
  } catch (error: any) {
    console.error('Error fetching cursussen:', error);
    return NextResponse.json({ error: 'Failed to fetch cursussen', details: error.message }, { status: 500 });
  }
}
