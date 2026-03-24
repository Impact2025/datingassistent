/**
 * Admin Affiliate API
 *
 * GET  /api/admin/affiliate          — List all partners + stats
 * POST /api/admin/affiliate          — Create new partner
 * PATCH /api/admin/affiliate?id=xxx  — Update partner (status, commission)
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdmin } from '@/lib/auth';

function generateReferralCode(name: string): string {
  const base = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);
  const suffix = Math.random().toString(36).slice(-3).toUpperCase();
  return `${base}${suffix}`;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const stats = await sql`
      SELECT * FROM affiliate_partner_stats
      ORDER BY total_revenue_generated DESC
    `;

    return NextResponse.json({ partners: stats.rows });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    console.error('Affiliate GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const { name, email, company, commissionPct, payoutEmail, notes } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'name en email zijn verplicht' }, { status: 400 });
    }

    const referralCode = generateReferralCode(name);
    const commission = commissionPct ?? 30;

    const result = await sql`
      INSERT INTO affiliate_partners (
        name, email, company, referral_code,
        commission_pct, payout_email, notes, status
      ) VALUES (
        ${name}, ${email}, ${company || null}, ${referralCode},
        ${commission}, ${payoutEmail || email}, ${notes || null}, 'active'
      )
      RETURNING id, referral_code
    `;

    const partner = result.rows[0];
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://datingassistent.nl';

    return NextResponse.json({
      success: true,
      partnerId: partner.id,
      referralCode: partner.referral_code,
      trackingUrl: `${BASE_URL}/api/affiliate/track?ref=${partner.referral_code}&to=/quiz/dating-patroon`,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    console.error('Affiliate POST error:', error);
    return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id parameter vereist' }, { status: 400 });
    }

    const body = await request.json();
    const { status, commissionPct, notes } = body;

    await sql`
      UPDATE affiliate_partners
      SET
        status         = COALESCE(${status || null}, status),
        commission_pct = COALESCE(${commissionPct || null}, commission_pct),
        notes          = COALESCE(${notes || null}, notes),
        updated_at     = NOW()
      WHERE id = ${parseInt(id)}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    console.error('Affiliate PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update partner' }, { status: 500 });
  }
}
