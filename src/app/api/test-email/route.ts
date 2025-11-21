/**
 * Test Email Endpoint
 * For testing email templates during development
 * URL: /api/test-email
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendTemplatedEmail } from '@/lib/email-sender';
import { scheduleWelcomeEmail } from '@/lib/email-engagement';
import type { EmailTemplateData } from '@/lib/email-engagement';

export async function POST(request: NextRequest) {
  try {
    // Only allow in development or with secret
    if (process.env.NODE_ENV === 'production') {
      const secret = request.headers.get('x-test-secret');
      if (secret !== process.env.TEST_EMAIL_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await request.json();
    const { userId, emailType, testEmail, action } = body;

    // NEW: Support testEmail parameter (for test interface)
    if (testEmail && emailType) {
      // Direct send to test email (bypass database)
      const { sendEmail } = await import('@/lib/email-service');
      const { renderEmailTemplate } = await import('@/lib/email-templates');

      // Render the template
      const emailContent = await renderEmailTemplate(emailType as any, {
        firstName: testEmail.split('@')[0] || 'Test User',
        email: testEmail,
        userId: 999999, // Dummy user ID for testing
        subscriptionType: 'core',
        completionPercentage: 30,
        courseName: 'Onboarding Basics',
        milestoneTitle: 'First Match Success',
        matchCount: 5,
        messageCount: 12,
        profileViews: 45,
        renewalDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL'),
        daysLeft: 7,
        featureName: 'AI Chat Coach',
        featureLimit: '10 chats per maand',
        upgradeUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9001'}/payment`,
        dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9001'}/dashboard`,
      });

      // Send directly
      const sent = await sendEmail({
        to: testEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.textVersion,
      });

      if (!sent) {
        return NextResponse.json(
          { error: 'Failed to send test email' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Test email sent to ${testEmail}`,
        emailType,
      });
    }

    // ORIGINAL: Support userId parameter (for database-based testing)
    if (!userId) {
      return NextResponse.json(
        { error: 'userId or testEmail is required' },
        { status: 400 }
      );
    }

    // Handle different actions
    if (action === 'queue') {
      // Queue the email
      await scheduleWelcomeEmail(userId);
      return NextResponse.json({
        success: true,
        message: 'Email queued successfully',
      });
    }

    // Send immediately (default)
    const templateData: EmailTemplateData = {
      firstName: 'Test User',
      email: 'test@example.com',
      userId: userId,
      subscriptionType: 'core',
      ...body.templateData,
    };

    const sent = await sendTemplatedEmail(
      userId,
      emailType || 'welcome',
      'onboarding',
      templateData
    );

    if (!sent) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      emailType: emailType || 'welcome',
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      {
        error: 'Failed to send test email',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to preview email template
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const emailType = searchParams.get('type') || 'welcome';

    // Import render function
    const { renderEmailTemplate } = await import('@/lib/email-templates');

    // Render preview
    const emailContent = await renderEmailTemplate(emailType as any, {
      firstName: 'John',
      email: 'john@example.com',
      userId: 1,
      subscriptionType: 'core',
    });

    // Return HTML for preview
    return new Response(emailContent.html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    return new Response('Error rendering email', { status: 500 });
  }
}
