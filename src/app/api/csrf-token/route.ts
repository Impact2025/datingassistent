/**
 * CSRF TOKEN ENDPOINT
 * Returns a CSRF token for client-side use
 */

import { NextRequest } from 'next/server';
import { generateCSRFTokenResponse } from '@/lib/api-security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return generateCSRFTokenResponse();
}
