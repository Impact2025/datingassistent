/**
 * Affiliate Click Tracking
 *
 * GET /api/affiliate/track?ref=PARTNERCODE&to=/quiz/dating-patroon
 *
 * 1. Validates the referral code
 * 2. Logs the click
 * 3. Sets a cookie (30-day attribution window)
 * 4. Redirects to the destination page
 *
 * Usage in affiliate links:
 *   https://datingassistent.nl/api/affiliate/track?ref=MIRJAM30&to=/quiz/dating-patroon
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

const COOKIE_NAME = 'da_ref';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://datingassistent.nl';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const ref = searchParams.get('ref')?.toUpperCase();
  const to  = searchParams.get('to') || '/quiz/dating-patroon';

  // Sanitize redirect target — only allow internal paths
  const safeTo = to.startsWith('/') ? to : '/quiz/dating-patroon';
  const redirectUrl = `${BASE_URL}${safeTo}`;

  if (!ref) {
    return NextResponse.redirect(redirectUrl);
  }

  // Validate partner code
  const partner = await sql`
    SELECT id, referral_code
    FROM affiliate_partners
    WHERE referral_code = ${ref}
      AND status = 'active'
    LIMIT 1
  `.catch(() => null);

  if (!partner || partner.rows.length === 0) {
    // Unknown code — redirect anyway, no tracking
    return NextResponse.redirect(redirectUrl);
  }

  const partnerId = partner.rows[0].id;

  // Log the click (non-blocking — fire and forget)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || null;
  sql`
    INSERT INTO affiliate_clicks (partner_id, referral_code, ip_address, landing_page, clicked_at)
    VALUES (${partnerId}, ${ref}, ${ip}, ${safeTo}, NOW())
  `.catch((err) => console.error('Affiliate click log failed:', err));

  // Set attribution cookie and redirect
  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set(COOKIE_NAME, ref, {
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });

  return response;
}
