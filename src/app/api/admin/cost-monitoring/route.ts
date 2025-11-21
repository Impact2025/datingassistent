import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdmin } from '@/lib/auth';

interface CostData {
  service: string;
  cost: number;
  tokens?: number;
  timestamp: Date;
  userId?: number;
  operation: string;
}

interface CostSummary {
  totalCost: number;
  monthlyCost: number;
  dailyCost: number;
  costByService: Record<string, number>;
  costByDay: Array<{ date: string; cost: number }>;
  topUsers: Array<{ userId: number; cost: number; operations: number }>;
  alerts: Array<{ type: string; message: string; severity: 'low' | 'medium' | 'high' }>;
}

export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const adminUser = await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // 'day', 'week', 'month', 'year'
    const service = searchParams.get('service'); // optional filter

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get total cost
    let totalCostQuery;
    if (service) {
      totalCostQuery = await sql`
        SELECT COALESCE(SUM(cost), 0) as total_cost
        FROM ai_cost_tracking
        WHERE created_at >= ${startDate.toISOString()} AND service = ${service}
      `;
    } else {
      totalCostQuery = await sql`
        SELECT COALESCE(SUM(cost), 0) as total_cost
        FROM ai_cost_tracking
        WHERE created_at >= ${startDate.toISOString()}
      `;
    }

    // Get cost by service
    let costByServiceQuery;
    if (service) {
      costByServiceQuery = await sql`
        SELECT service, COALESCE(SUM(cost), 0) as total_cost
        FROM ai_cost_tracking
        WHERE created_at >= ${startDate.toISOString()} AND service = ${service}
        GROUP BY service
        ORDER BY total_cost DESC
      `;
    } else {
      costByServiceQuery = await sql`
        SELECT service, COALESCE(SUM(cost), 0) as total_cost
        FROM ai_cost_tracking
        WHERE created_at >= ${startDate.toISOString()}
        GROUP BY service
        ORDER BY total_cost DESC
      `;
    }

    // Get cost by day
    let costByDayQuery;
    if (service) {
      costByDayQuery = await sql`
        SELECT
          DATE(created_at) as date,
          COALESCE(SUM(cost), 0) as daily_cost
        FROM ai_cost_tracking
        WHERE created_at >= ${startDate.toISOString()} AND service = ${service}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `;
    } else {
      costByDayQuery = await sql`
        SELECT
          DATE(created_at) as date,
          COALESCE(SUM(cost), 0) as daily_cost
        FROM ai_cost_tracking
        WHERE created_at >= ${startDate.toISOString()}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `;
    }

    // Get top users by cost
    const topUsersQuery = await sql`
      SELECT
        user_id,
        COALESCE(SUM(cost), 0) as total_cost,
        COUNT(*) as operations
      FROM ai_cost_tracking
      WHERE user_id IS NOT NULL AND created_at >= ${startDate.toISOString()}
      GROUP BY user_id
      ORDER BY total_cost DESC
      LIMIT 10
    `;

    // Get recent operations for monitoring
    let recentOperationsQuery;
    if (service) {
      recentOperationsQuery = await sql`
        SELECT
          service,
          operation,
          cost,
          tokens,
          created_at,
          user_id
        FROM ai_cost_tracking
        WHERE created_at >= ${startDate.toISOString()} AND service = ${service}
        ORDER BY created_at DESC
        LIMIT 100
      `;
    } else {
      recentOperationsQuery = await sql`
        SELECT
          service,
          operation,
          cost,
          tokens,
          created_at,
          user_id
        FROM ai_cost_tracking
        WHERE created_at >= ${startDate.toISOString()}
        ORDER BY created_at DESC
        LIMIT 100
      `;
    }

    const totalCost = parseFloat(totalCostQuery.rows[0]?.total_cost || '0');
    const costByService = costByServiceQuery.rows.reduce((acc, row) => {
      acc[row.service] = parseFloat(row.total_cost);
      return acc;
    }, {} as Record<string, number>);

    const costByDay = costByDayQuery.rows.map(row => ({
      date: row.date,
      cost: parseFloat(row.daily_cost)
    }));

    const topUsers = topUsersQuery.rows.map(row => ({
      userId: row.user_id,
      cost: parseFloat(row.total_cost),
      operations: parseInt(row.operations)
    }));

    // Generate alerts based on cost patterns
    const alerts: Array<{ type: string; message: string; severity: 'low' | 'medium' | 'high' }> = [];

    // Daily cost alert
    const todayCost = costByDay.find(d => d.date === now.toISOString().split('T')[0])?.cost || 0;
    if (todayCost > 50) {
      alerts.push({
        type: 'daily_cost',
        message: `Today's AI costs: €${todayCost.toFixed(2)} (High usage detected)`,
        severity: todayCost > 100 ? 'high' : 'medium'
      });
    }

    // Service cost alerts
    Object.entries(costByService).forEach(([serviceName, cost]) => {
      if (cost > 100) {
        alerts.push({
          type: 'service_cost',
          message: `${serviceName} costs: €${cost.toFixed(2)} (${period})`,
          severity: cost > 500 ? 'high' : 'medium'
        });
      }
    });

    // Monthly budget alert (assuming €1000 budget)
    const monthlyBudget = 1000;
    if (totalCost > monthlyBudget * 0.8) {
      alerts.push({
        type: 'budget_warning',
        message: `Monthly budget: €${totalCost.toFixed(2)} / €${monthlyBudget} (${((totalCost / monthlyBudget) * 100).toFixed(1)}% used)`,
        severity: totalCost > monthlyBudget * 0.95 ? 'high' : 'medium'
      });
    }

    const summary: CostSummary = {
      totalCost,
      monthlyCost: totalCost, // For the selected period
      dailyCost: todayCost,
      costByService,
      costByDay,
      topUsers,
      alerts
    };

    return NextResponse.json({
      success: true,
      data: summary,
      recentOperations: recentOperationsQuery.rows,
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      }
    });

  } catch (error) {
    console.error('Cost monitoring error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cost data' },
      { status: 500 }
    );
  }
}

// POST endpoint to log costs (called by AI services)
export async function POST(request: NextRequest) {
  try {
    const costData: CostData = await request.json();

    // Validate required fields
    if (!costData.service || typeof costData.cost !== 'number') {
      return NextResponse.json(
        { error: 'Service and cost are required' },
        { status: 400 }
      );
    }

    // Insert cost record
    const timestamp = costData.timestamp ? new Date(costData.timestamp).toISOString() : new Date().toISOString();

    await sql`
      INSERT INTO ai_cost_tracking (
        service,
        operation,
        cost,
        tokens,
        user_id,
        created_at
      ) VALUES (
        ${costData.service},
        ${costData.operation},
        ${costData.cost},
        ${costData.tokens || null},
        ${costData.userId || null},
        ${timestamp}
      )
    `;

    return NextResponse.json({
      success: true,
      message: 'Cost logged successfully'
    });

  } catch (error) {
    console.error('Cost logging error:', error);
    return NextResponse.json(
      { error: 'Failed to log cost' },
      { status: 500 }
    );
  }
}