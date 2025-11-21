import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    console.log('Initializing course database schema...');

    // Read the SQL schema file
    const schemaPath = path.join(process.cwd(), 'src', 'lib', 'db', 'schema', 'courses.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Remove comments
    const cleanedSchema = schema
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    // Split by semicolons and filter
    const statements = cleanedSchema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 80).replace(/\s+/g, ' ');
      console.log(`[${i + 1}/${statements.length}] Executing: ${preview}...`);

      try {
        await sql.query(statement);
        console.log(`[${i + 1}/${statements.length}] Success`);
      } catch (err) {
        console.error(`[${i + 1}/${statements.length}] Failed:`, err);
        throw err;
      }
    }

    console.log('Course database schema initialized successfully');

    return NextResponse.json({
      success: true,
      message: 'Course database schema initialized successfully',
      details: {
        tablesCreated: [
          'courses',
          'course_modules',
          'course_lessons',
          'course_assignments',
          'course_quiz_questions',
          'course_quiz_options',
          'user_course_progress',
          'user_lesson_progress',
          'user_assignment_submissions',
          'user_quiz_results'
        ]
      }
    });

  } catch (error) {
    console.error('Error initializing course database:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to initialize course database schema',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
