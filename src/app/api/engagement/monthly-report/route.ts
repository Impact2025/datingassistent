import { NextRequest, NextResponse } from 'next/server';
import { generateMonthlyReport, getUserMonthlyReports } from '@/lib/monthly-report-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // If month and year are provided, generate/get specific report
    if (month && year) {
      const report = await generateMonthlyReport(
        parseInt(userId),
        parseInt(month),
        parseInt(year)
      );

      return NextResponse.json(report);
    }

    // Otherwise, get all reports for the user
    const reports = await getUserMonthlyReports(parseInt(userId));
    return NextResponse.json({ reports });

  } catch (error) {
    console.error('Error generating monthly report:', error);
    return NextResponse.json(
      { error: 'Failed to generate monthly report' },
      { status: 500 }
    );
  }
}
