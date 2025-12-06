import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Only allow in development or with secret key
  const authHeader = request.headers.get('authorization');
  const expectedKey = process.env.ADMIN_SECRET || 'debug-test-2024';

  if (authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: process.env.VERCEL ? 'yes' : 'no',

    // SendGrid config (masked)
    sendgrid: {
      apiKeyExists: !!process.env.SENDGRID_API_KEY,
      apiKeyLength: process.env.SENDGRID_API_KEY?.length || 0,
      apiKeyPrefix: process.env.SENDGRID_API_KEY?.substring(0, 5) || 'none',
      fromEmail: process.env.SENDGRID_FROM_EMAIL || 'not set',
      fromName: process.env.SENDGRID_FROM_NAME || 'not set',
    },

    // Check if key looks valid (starts with SG.)
    apiKeyValid: process.env.SENDGRID_API_KEY?.startsWith('SG.') || false,
  };

  return NextResponse.json(debugInfo);
}

export async function POST(request: NextRequest) {
  // Only allow with secret key
  const authHeader = request.headers.get('authorization');
  const expectedKey = process.env.ADMIN_SECRET || 'debug-test-2024';

  if (authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { testEmail } = await request.json();

    if (!testEmail) {
      return NextResponse.json({ error: 'testEmail required' }, { status: 400 });
    }

    // Try to send a test email
    const sgMail = await import('@sendgrid/mail');

    if (!process.env.SENDGRID_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'SENDGRID_API_KEY not set',
        keyExists: false
      });
    }

    sgMail.default.setApiKey(process.env.SENDGRID_API_KEY);

    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@datingassistent.nl';

    console.log(`📧 Debug: Attempting to send test email to ${testEmail} from ${fromEmail}`);

    await sgMail.default.send({
      to: testEmail,
      from: fromEmail,
      subject: 'DatingAssistent Email Test',
      text: `Dit is een test email verzonden op ${new Date().toISOString()}`,
      html: `<h1>Email Test</h1><p>Dit is een test email verzonden op ${new Date().toISOString()}</p>`,
    });

    console.log(`✅ Debug: Test email sent successfully to ${testEmail}`);

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${testEmail}`,
      from: fromEmail,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Debug email test error:', error);

    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      response: error.response?.body || null
    }, { status: 500 });
  }
}
