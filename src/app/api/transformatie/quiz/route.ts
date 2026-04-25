import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/transformatie/quiz?lessonId=X
 * Haal quizvragen op voor een les, inclusief beste eerdere score
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');
    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId is verplicht' }, { status: 400 });
    }

    const questions = await sql`
      SELECT id, question_order, question_type, question_text, options, explanation
      FROM transformatie_lesson_quizzes
      WHERE lesson_id = ${parseInt(lessonId)}
      ORDER BY question_order ASC
    `;

    const bestAttempt = await sql`
      SELECT MAX(score)::int as best_score, COUNT(*)::int as attempt_count
      FROM transformatie_quiz_attempts
      WHERE user_id = ${user.id} AND lesson_id = ${parseInt(lessonId)}
    `;

    return NextResponse.json({
      success: true,
      questions: questions.rows,
      bestScore: bestAttempt.rows[0].best_score ?? null,
      attemptCount: bestAttempt.rows[0].attempt_count ?? 0,
    });
  } catch (error) {
    console.error('Quiz GET error:', error);
    return NextResponse.json({ error: 'Fout bij ophalen quiz' }, { status: 500 });
  }
}

/**
 * POST /api/transformatie/quiz
 * Sla een quiz-poging op en geef score + correcte antwoorden terug
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const body = await request.json();
    const { lessonId, answers } = body;

    if (!lessonId || !answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'lessonId en answers zijn verplicht' }, { status: 400 });
    }

    const questions = await sql`
      SELECT id, correct_answer, explanation, question_text, options
      FROM transformatie_lesson_quizzes
      WHERE lesson_id = ${lessonId}
      ORDER BY question_order ASC
    `;

    if (questions.rows.length === 0) {
      return NextResponse.json({ error: 'Geen vragen gevonden voor deze les' }, { status: 404 });
    }

    let correct = 0;
    const results = questions.rows.map((q) => {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correct_answer;
      if (isCorrect) correct++;
      return {
        questionId: q.id,
        questionText: q.question_text,
        userAnswer,
        correctAnswer: q.correct_answer,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const score = Math.round((correct / questions.rows.length) * 100);

    await sql`
      INSERT INTO transformatie_quiz_attempts (user_id, lesson_id, answers, score)
      VALUES (${user.id}, ${lessonId}, ${JSON.stringify(answers)}::jsonb, ${score})
    `;

    // Perfect score badge trigger via progress endpoint
    if (score === 100) {
      await sql`
        SELECT id FROM transformatie_badges WHERE slug = 'eerste-quiz-perfect'
      `.then(async (badge) => {
        if (badge.rows.length > 0) {
          await sql`
            INSERT INTO transformatie_user_badges (user_id, badge_id)
            VALUES (${user.id}, ${badge.rows[0].id})
            ON CONFLICT (user_id, badge_id) DO NOTHING
          `;
        }
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      score,
      correct,
      total: questions.rows.length,
      results,
    });
  } catch (error) {
    console.error('Quiz POST error:', error);
    return NextResponse.json({ error: 'Fout bij opslaan quiz' }, { status: 500 });
  }
}
