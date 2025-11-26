import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { authenticateUser } from '@/lib/auth-utils';
import { generateAIFeedback } from '@/lib/ai-feedback';
import { getLessonExerciseCount, isValidLesson } from '@/lib/course-utils';
import { updateCursusProgress } from '@/lib/progress-utils';
import { getClientIdentifier, rateLimitExpensiveAI, createRateLimitHeaders } from '@/lib/rate-limit';

// POST /api/cursus/answer - Save exercise answer and generate AI feedback
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                   request.headers.get('x-real-ip') ||
                   request.headers.get('cf-connecting-ip') ||
                   'unknown';
  let userId: number | undefined;

  try {
    console.log(`📝 Cursus answer request from IP: ${clientIP}`);

    // Authenticate user
    const authResult = await authenticateUser(request);
    if (authResult instanceof NextResponse) {
      console.warn(`❌ Authentication failed for IP: ${clientIP}`);
      return authResult;
    }
    userId = authResult.id;
    console.log(`✅ User ${userId} authenticated successfully`);

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json({
        error: 'Invalid JSON',
        message: 'Request body must be valid JSON'
      }, { status: 400 });
    }

    const { moduleSlug, lesSlug, exerciseId, answer, answerType = 'tekst' } = body;

    // Validate required fields
    if (!moduleSlug || typeof moduleSlug !== 'string' || moduleSlug.trim() === '') {
      return NextResponse.json({
        error: 'Missing or invalid moduleSlug',
        message: 'moduleSlug is required and must be a non-empty string'
      }, { status: 400 });
    }

    if (!lesSlug || typeof lesSlug !== 'string' || lesSlug.trim() === '') {
      return NextResponse.json({
        error: 'Missing or invalid lesSlug',
        message: 'lesSlug is required and must be a non-empty string'
      }, { status: 400 });
    }

    if (!exerciseId || typeof exerciseId !== 'string' || exerciseId.trim() === '') {
      return NextResponse.json({
        error: 'Missing or invalid exerciseId',
        message: 'exerciseId is required and must be a non-empty string'
      }, { status: 400 });
    }

    if (!answer || typeof answer !== 'string') {
      return NextResponse.json({
        error: 'Missing or invalid answer',
        message: 'answer is required and must be a string'
      }, { status: 400 });
    }

    // Validate answer length
    if (answer.length < 10) {
      return NextResponse.json({
        error: 'Answer too short',
        message: 'Answer must be at least 10 characters long'
      }, { status: 400 });
    }

    if (answer.length > 5000) {
      return NextResponse.json({
        error: 'Answer too long',
        message: 'Answer must be less than 5000 characters'
      }, { status: 400 });
    }

    // Validate answerType
    const validAnswerTypes = ['tekst', 'audio', 'video', 'image'];
    if (!validAnswerTypes.includes(answerType)) {
      return NextResponse.json({
        error: 'Invalid answerType',
        message: `answerType must be one of: ${validAnswerTypes.join(', ')}`
      }, { status: 400 });
    }

    // Validate that the lesson exists and has exercises
    const exerciseCount = getLessonExerciseCount(moduleSlug, lesSlug);
    if (exerciseCount === 0) {
      console.warn(`❌ Invalid lesson requested: ${lesSlug} in module ${moduleSlug} for user ${userId}`);
      return NextResponse.json({
        error: 'Invalid lesson',
        message: `Lesson ${lesSlug} in module ${moduleSlug} not found or has no exercises`
      }, { status: 400 });
    }
    console.log(`✅ Lesson validation passed: ${exerciseCount} exercises found`);

    // Auto-migrate answer_type column if needed (one-time migration)
    try {
      await sql`
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'cursus_exercise_answers'
                AND column_name = 'answer_type'
                AND character_maximum_length < 30
            ) THEN
                ALTER TABLE cursus_exercise_answers ALTER COLUMN answer_type TYPE VARCHAR(30);
            END IF;
        END $$;
      `;
    } catch (migrationError) {
      // Log but don't fail - migration might already be done
      console.log('Migration check completed (column may already be correct size)');
    }

    // Rate limit AI feedback calls to prevent API cost abuse
    const identifier = getClientIdentifier(request);
    const rateLimit = await rateLimitExpensiveAI(identifier);

    if (!rateLimit.success) {
      console.warn(`🚫 Rate limit exceeded for identifier: ${identifier}, user: ${userId}`);
      const headers = createRateLimitHeaders(rateLimit);
      const resetDate = new Date(rateLimit.resetAt);
      return NextResponse.json(
        {
          error: 'rate_limit_exceeded',
          message: `Te veel AI feedback verzoeken. Probeer opnieuw na ${resetDate.toLocaleTimeString('nl-NL')}.`,
          resetAt: resetDate.toISOString(),
        },
        { status: 429, headers }
      );
    }
    console.log(`✅ Rate limit check passed for user ${userId}`);

    // Generate AI feedback using Claude
    let aiFeedback: string;
    let aiScore: number;

    try {
      const aiResult = await generateAIFeedback(answer, parseInt(exerciseId), moduleSlug, lesSlug, userId);
      aiFeedback = aiResult.feedback;
      aiScore = aiResult.score;
    } catch (aiError) {
      console.error('AI feedback generation failed:', aiError);
      // Provide fallback feedback
      aiFeedback = "Bedankt voor je antwoord! Dit is een belangrijke stap in je leerproces. Blijf reflecteren op je ervaringen.";
      aiScore = 75; // Neutral score
    }

    // Save answer to database with error handling
    let result;
    try {
      result = await sql`
        INSERT INTO cursus_exercise_answers
        (user_id, module_slug, les_slug, exercise_id, answer_text, answer_type, ai_feedback, ai_score)
        VALUES (${userId}, ${moduleSlug}, ${lesSlug}, ${exerciseId}, ${answer}, ${answerType}, ${aiFeedback}, ${aiScore})
        ON CONFLICT (user_id, module_slug, les_slug, exercise_id)
        DO UPDATE SET
          answer_text = EXCLUDED.answer_text,
          ai_feedback = EXCLUDED.ai_feedback,
          ai_score = EXCLUDED.ai_score,
          updated_at = NOW()
        RETURNING id
      `;
    } catch (dbError) {
      console.error('Database error saving answer:', dbError);
      return NextResponse.json({
        error: 'Database error',
        message: 'Failed to save your answer. Please try again.'
      }, { status: 500 });
    }

    // Update progress with error handling
    try {
      await updateCursusProgress(userId, moduleSlug, lesSlug);
    } catch (progressError) {
      console.error('Progress update failed:', progressError);
      // Don't fail the request if progress update fails - answer was saved successfully
    }

    const processingTime = Date.now() - startTime;
    console.log(`✅ Cursus answer saved successfully for user ${userId}: exercise ${exerciseId}, score ${aiScore}, processing time: ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      feedback: aiFeedback,
      score: aiScore,
      answerId: result.rows[0].id,
      processingTime
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Error saving cursus answer for user ${userId || 'unknown'}:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      processingTime,
      clientIP
    });

    return NextResponse.json({
      error: 'Internal server error',
      message: 'Er is een fout opgetreden bij het opslaan van je antwoord. Probeer het opnieuw.'
    }, { status: 500 });
  }
}

// GET /api/cursus/answer - Get user's answers for a lesson
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult.id;

    const { searchParams } = new URL(request.url);
    const moduleSlug = searchParams.get('moduleSlug');
    const lesSlug = searchParams.get('lesSlug');

    // Validate query parameters
    if (!moduleSlug || typeof moduleSlug !== 'string' || moduleSlug.trim() === '') {
      return NextResponse.json({
        error: 'Missing or invalid moduleSlug',
        message: 'moduleSlug query parameter is required and must be a non-empty string'
      }, { status: 400 });
    }

    if (!lesSlug || typeof lesSlug !== 'string' || lesSlug.trim() === '') {
      return NextResponse.json({
        error: 'Missing or invalid lesSlug',
        message: 'lesSlug query parameter is required and must be a non-empty string'
      }, { status: 400 });
    }

    // Get all answers for this lesson with error handling
    let result;
    try {
      result = await sql`
        SELECT exercise_id, answer_text, ai_feedback, ai_score, submitted_at
        FROM cursus_exercise_answers
        WHERE user_id = ${userId} AND module_slug = ${moduleSlug} AND les_slug = ${lesSlug}
        ORDER BY exercise_id
      `;
    } catch (dbError) {
      console.error('Database error fetching answers:', dbError);
      return NextResponse.json({
        error: 'Database error',
        message: 'Failed to retrieve your answers. Please try again.'
      }, { status: 500 });
    }

    const answers = result.rows.map((row: any) => ({
      exerciseId: row.exercise_id,
      answer: row.answer_text,
      feedback: row.ai_feedback,
      score: row.ai_score,
      submittedAt: row.submitted_at
    }));

    return NextResponse.json({ answers });

  } catch (error) {
    console.error('Error fetching cursus answers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
