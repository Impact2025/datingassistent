/**
 * CSRF Token API
 *
 * GET - Generate and return a CSRF token
 */

import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Generate a random CSRF token
  const csrfToken = randomBytes(32).toString('hex');

  return NextResponse.json({ csrfToken });
}
