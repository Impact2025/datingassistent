import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Check table structure
    const columns = await sql`
      SELECT column_name, data_type, numeric_precision, numeric_scale, column_default
      FROM information_schema.columns
      WHERE table_name = 'dating_style_results'
      ORDER BY ordinal_position
    `;

    // Check if tables exist
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE 'dating_style%'
      ORDER BY table_name
    `;

    // Check sample data
    let questionsCount = 0;
    let scenariosCount = 0;
    let assessmentsCount = 0;

    try {
      const q = await sql`SELECT COUNT(*) as count FROM dating_style_questions`;
      questionsCount = q.rows[0].count;
    } catch (e) {}

    try {
      const s = await sql`SELECT COUNT(*) as count FROM dating_style_scenarios`;
      scenariosCount = s.rows[0].count;
    } catch (e) {}

    try {
      const a = await sql`SELECT COUNT(*) as count FROM dating_style_assessments`;
      assessmentsCount = a.rows[0].count;
    } catch (e) {}

    return NextResponse.json({
      tables: tables.rows,
      columns: columns.rows,
      dataCounts: {
        questions: questionsCount,
        scenarios: scenariosCount,
        assessments: assessmentsCount
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}