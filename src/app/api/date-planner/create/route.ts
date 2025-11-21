import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { datePlannerAI, DatePlanRequest } from '@/lib/date-planner-ai';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get user from token
    const user = await requireAuth(request);

    const body: DatePlanRequest = await request.json();

    // Validate required fields
    if (!body.dateType || !body.location) {
      return NextResponse.json(
        { error: 'dateType and location are required' },
        { status: 400 }
      );
    }

    console.log(`📅 Generating date plan for user ${user.id}: ${body.dateType} at ${body.location}`);

    // Generate AI-powered date plan
    const datePlan = await datePlannerAI.generateDatePlan(body, user.id.toString());

    // Store in database
    const result = await sql`
      INSERT INTO date_plans (
        user_id, date_idea_id, date_type, location, duration, energy_level,
        desired_style, budget, date_info, insecurities, user_goals, initiator,
        plan_content, ai_version, quality_score, personalization_level
      ) VALUES (
        ${user.id},
        ${body.dateIdeaId || null},
        ${body.dateType},
        ${body.location},
        ${body.duration || 120},
        ${body.energyLevel},
        ${body.desiredStyle},
        ${body.budget},
        ${body.dateInfo || null},
        ${body.insecurities && body.insecurities.length > 0 ? `{${body.insecurities.map(s => `"${s.replace(/"/g, '\\"')}"`).join(',')}}` : '{}'},
        ${body.userGoals || null},
        ${body.initiator || null},
        ${JSON.stringify(datePlan)}::jsonb,
        ${datePlan.aiVersion},
        ${datePlan.qualityScore},
        ${datePlan.personalizationLevel}
      )
      RETURNING id
    `;

    const planId = result.rows[0].id;

    // Create checklist items
    if (datePlan.checklist && datePlan.checklist.length > 0) {
      for (const item of datePlan.checklist) {
        await sql`
          INSERT INTO date_plan_checklists (date_plan_id, item_text, category, priority)
          VALUES (${planId}, ${item.item}, ${item.category}, ${item.priority})
        `;
      }
    }

    console.log(`✅ Date plan created: ${planId} for user ${user.id}`);

    return NextResponse.json({
      success: true,
      data: {
        ...datePlan,
        id: planId
      }
    });

  } catch (error) {
    console.error('Date planner creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create date plan' },
      { status: 500 }
    );
  }
}