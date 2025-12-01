import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Get all questions organized by phase
    const questions = await sql`
      SELECT
        id,
        phase,
        question_type,
        question_text,
        domain,
        options,
        order_position,
        is_required
      FROM levensvisie_questions
      ORDER BY order_position
    `;

    // Group questions by phase
    const groupedQuestions = {
      horizon_scan: questions.filter(q => q.phase === 'horizon_scan'),
      values_mapping: questions.filter(q => q.phase === 'values_mapping'),
      future_partner: questions.filter(q => q.phase === 'future_partner')
    };

    return NextResponse.json({
      success: true,
      questions: groupedQuestions,
      phases: {
        horizon_scan: {
          title: "Horizon Scan",
          description: "Ontdek jouw toekomstvisie in 2-3 minuten",
          estimatedTime: "2-3 min",
          questionCount: groupedQuestions.horizon_scan.length
        },
        values_mapping: {
          title: "Waarden & Richting Mapping",
          description: "Breng helderheid in wat echt belangrijk is",
          estimatedTime: "5-7 min",
          questionCount: groupedQuestions.values_mapping.length
        },
        future_partner: {
          title: "Toekomst-Fit Partner Profiel",
          description: "Definieer wat je nodig hebt voor duurzame liefde",
          estimatedTime: "3-4 min",
          questionCount: groupedQuestions.future_partner.length
        }
      }
    });

  } catch (error: any) {
    console.error('Error fetching levensvisie questions:', error);
    return NextResponse.json({
      error: 'Failed to fetch questions',
      message: error.message
    }, { status: 500 });
  }
}