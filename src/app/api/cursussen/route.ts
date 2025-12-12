import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { cookies } from 'next/headers';
import { verifyToken, cookieConfig } from '@/lib/jwt-config';

/**
 * GET /api/cursussen
 * Haal alle gepubliceerde cursussen op met toegangscontrole
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Fetching cursussen...');

    // Try to get user from JWT token
    let userId: number | null = null;
    let userSubscription: string | null = null;
    let purchasedCursusIds: number[] = [];

    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(cookieConfig.name)?.value;

      if (token) {
        const user = await verifyToken(token);
        if (user) {
          userId = user.id;

          // Get user's subscription type
          const userResult = await sql`
            SELECT subscription_type FROM users WHERE id = ${userId}
          `;
          if (userResult.rows.length > 0) {
            userSubscription = userResult.rows[0].subscription_type;
          }

          // Get user's purchased courses (via payment_transactions)
          const purchasedResult = await sql`
            SELECT DISTINCT c.id
            FROM cursussen c
            JOIN payment_transactions pt ON pt.cursus_id = c.id
            WHERE pt.user_id = ${userId}
              AND pt.status = 'completed'
          `;
          purchasedCursusIds = purchasedResult.rows.map((r: any) => r.id);
        }
      }
    } catch (authError) {
      // User not authenticated - continue without access info
      console.log('No authenticated user for cursussen request');
    }

    // Get all published courses
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

    const cursussen = result.rows.map((cursus: any) => {
      // Determine access:
      // - 'gratis' courses: everyone has access
      // - VIP subscription: access to all
      // - Purchased course: has access
      // - Otherwise: no access
      const isGratis = cursus.cursus_type === 'gratis';
      const isVip = userSubscription === 'vip' || userSubscription === 'expert' || userSubscription === 'groeier';
      const isPurchased = purchasedCursusIds.includes(cursus.id);
      const hasAccess = isGratis || isVip || isPurchased;

      return {
        ...cursus,
        doelen: cursus.doelen || [],
        gekoppelde_tools: cursus.gekoppelde_tools || [],
        hasAccess,
        user_progress: {
          voltooide_lessen: 0,
          totaal_lessen: parseInt(cursus.totaal_lessen) || 0,
          percentage: 0
        }
      };
    });

    return NextResponse.json({ cursussen });
  } catch (error: any) {
    console.error('Error fetching cursussen:', error);
    return NextResponse.json({ error: 'Failed to fetch cursussen', details: error.message }, { status: 500 });
  }
}
