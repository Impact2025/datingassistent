/**
 * CSP VIOLATION REPORTING API
 * Handles Content Security Policy violation reports
 * Created: 2025-11-21
 * Author: Security Specialist
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleCSPViolation } from '@/lib/security-headers';

export async function POST(request: NextRequest) {
  try {
    // CSP reports are sent as JSON in the request body
    // The handleCSPViolation function will log and process the report
    await handleCSPViolation(request);

    // Always return 200 for CSP reports to avoid browser retries
    return new NextResponse(null, { status: 200 });

  } catch (error) {
    console.error('CSP violation reporting error:', error);

    // Still return 200 to avoid browser retries, but log the error
    return new NextResponse(null, { status: 200 });
  }
}

// CSP reports can also be sent via GET with query parameters (legacy support)
export async function GET(request: NextRequest) {
  try {
    // Extract CSP violation data from query parameters
    const { searchParams } = new URL(request.url);

    const violation = {
      'document-uri': searchParams.get('document-uri'),
      'violated-directive': searchParams.get('violated-directive'),
      'original-policy': searchParams.get('original-policy'),
      'blocked-uri': searchParams.get('blocked-uri'),
      'source-file': searchParams.get('source-file'),
      'line-number': searchParams.get('line-number'),
      'column-number': searchParams.get('column-number'),
      'status-code': searchParams.get('status-code')
    };

    console.warn('CSP Violation (GET):', violation);

    // In production, you might want to log this to a monitoring service
    // await logSecurityEvent('csp_violation', 'medium', null, getClientIP(request), request.headers.get('user-agent'), violation);

    return new NextResponse(null, { status: 200 });

  } catch (error) {
    console.error('CSP violation reporting error (GET):', error);
    return new NextResponse(null, { status: 200 });
  }
}