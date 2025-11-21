import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { AIAnalysisService } from '@/lib/ai-analysis-service';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

async function verifyAdminAccess(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.substring(7);
    const { payload } = await jwtVerify(token, JWT_SECRET);

    const userEmail = payload.email as string;
    return userEmail && ['v_mun@hotmail.com', 'v.munster@weareimpact.nl'].includes(userEmail);
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
    const { reportType } = body;

    switch (reportType) {
      case 'monthly':
        await AIAnalysisService.generateMonthlyReports();
        return NextResponse.json({
          success: true,
          message: 'Monthly AI reports generated successfully'
        });

      case 'weekly':
        await AIAnalysisService.generateWeeklyReviews();
        return NextResponse.json({
          success: true,
          message: 'Weekly AI reviews generated successfully'
        });

      case 'notifications':
        await AIAnalysisService.generateCoachNotifications();
        return NextResponse.json({
          success: true,
          message: 'Coach notifications generated successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid report type. Use: monthly, weekly, or notifications' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error generating reports:', error);
    return NextResponse.json(
      { error: 'Failed to generate reports' },
      { status: 500 }
    );
  }
}