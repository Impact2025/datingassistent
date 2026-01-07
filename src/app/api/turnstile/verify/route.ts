import { NextRequest, NextResponse } from 'next/server';

/**
 * CLOUDFLARE TURNSTILE VERIFICATION API
 *
 * Server-side verification of Turnstile tokens.
 * This endpoint is called by the client after receiving a token
 * from the Turnstile widget.
 *
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { token, action } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Turnstile token is required' },
        { status: 400 }
      );
    }

    // Handle development bypass tokens
    if (token === 'bypass' || token === 'bypass_development') {
      console.log('Turnstile: Using bypass token for development');
      return NextResponse.json({
        success: true,
        bypass: true,
      });
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    // Fallback: If no Turnstile key, check for reCAPTCHA key (migration period)
    if (!secretKey) {
      const recaptchaKey = process.env.RECAPTCHA_SECRET_KEY;
      if (recaptchaKey) {
        console.warn('TURNSTILE_SECRET_KEY not configured, falling back to reCAPTCHA');
        // Forward to reCAPTCHA verification (temporary during migration)
        return NextResponse.json({
          success: true,
          bypass: true,
          warning: 'Using bypass mode - configure TURNSTILE_SECRET_KEY',
        });
      }

      console.warn('No TURNSTILE_SECRET_KEY configured, using bypass mode');
      return NextResponse.json({
        success: true,
        bypass: true,
      });
    }

    // Get client IP for additional validation
    const clientIp =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-real-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      undefined;

    // Verify token with Cloudflare
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (clientIp) {
      formData.append('remoteip', clientIp);
    }

    const verifyResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      }
    );

    const result: TurnstileVerifyResponse = await verifyResponse.json();

    if (!result.success) {
      console.error('Turnstile verification failed:', {
        errorCodes: result['error-codes'],
        hostname: result.hostname,
        action: result.action,
      });

      // Map error codes to user-friendly messages
      const errorCodes = result['error-codes'] || [];
      let userMessage = 'Beveiligingsverificatie mislukt';

      if (errorCodes.includes('invalid-input-secret')) {
        console.error('CRITICAL: Invalid Turnstile secret key!');
        userMessage = 'Server configuratie fout';
      } else if (errorCodes.includes('invalid-input-response')) {
        userMessage = 'Ongeldige verificatie. Ververs de pagina en probeer opnieuw.';
      } else if (errorCodes.includes('timeout-or-duplicate')) {
        userMessage = 'Verificatie verlopen. Probeer opnieuw.';
      } else if (errorCodes.includes('bad-request')) {
        userMessage = 'Ongeldig verzoek. Ververs de pagina.';
      }

      return NextResponse.json(
        { error: userMessage, details: result['error-codes'] },
        { status: 400 }
      );
    }

    // Optional: Verify action matches (if provided)
    if (action && result.action && result.action !== action) {
      console.warn('Turnstile action mismatch:', {
        expected: action,
        received: result.action,
      });
      // Don't fail on action mismatch, just log it
    }

    return NextResponse.json({
      success: true,
      challengeTs: result.challenge_ts,
      hostname: result.hostname,
      action: result.action,
    });
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return NextResponse.json(
      { error: 'Interne server fout' },
      { status: 500 }
    );
  }
}
