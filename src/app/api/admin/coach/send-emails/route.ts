import { NextRequest, NextResponse } from 'next/server';
import { EmailCoachService } from '@/lib/email-coach-service';
import { verifyToken } from '@/lib/jwt-config';

async function verifyAdminAccess(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);

    return user?.email ? ['v_mun@hotmail.com', 'v.munster@weareimpact.nl'].includes(user.email) : false;
  } catch (error) {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdminAccess(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { emailType } = body;

    switch (emailType) {
      case 'monthly-reports':
        await EmailCoachService.sendAllPendingMonthlyReports();
        return NextResponse.json({
          success: true,
          message: 'Monthly reports sent successfully'
        });

      case 'weekly-reviews':
        await EmailCoachService.sendAllPendingWeeklyReviews();
        return NextResponse.json({
          success: true,
          message: 'Weekly reviews sent successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid email type. Available: monthly-reports, weekly-reviews' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error sending emails:', error);
    return NextResponse.json(
      { error: 'Failed to send emails', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await verifyAdminAccess(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return available email types
    return NextResponse.json({
      availableEmailTypes: [
        {
          type: 'monthly-reports',
          description: 'Send all pending monthly AI reports to clients',
          schedule: 'Manual trigger'
        },
        {
          type: 'weekly-reviews',
          description: 'Send all pending weekly AI reviews to clients',
          schedule: 'Manual trigger'
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching email types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email types' },
      { status: 500 }
    );
  }
}