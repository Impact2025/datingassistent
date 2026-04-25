import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { analyzeTransformatieReflectie } from '@/ai/flows/analyze-transformatie-reflectie';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

// Simple in-memory rate limiter: max 10 requests per user per hour
const rateLimitMap = new Map<number, { count: number; resetAt: number }>();

function checkRateLimit(userId: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }

  if (entry.count >= 10) return false;

  entry.count++;
  return true;
}

/**
 * POST /api/transformatie/reflectie-feedback
 * Geeft AI coaching-feedback op een ingevulde reflectievraag
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: 'Je hebt het maximum aantal feedback-verzoeken per uur bereikt (10). Probeer het later opnieuw.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { lessonId, moduleTitle, lessonTitle, phase, reflectieType, question, answer } = body;

    if (!answer || typeof answer !== 'string' || answer.trim().length < 10) {
      return NextResponse.json({ error: 'Antwoord is te kort voor feedback' }, { status: 400 });
    }
    if (!reflectieType || !question || !phase) {
      return NextResponse.json({ error: 'Ongeldige verzoek-parameters' }, { status: 400 });
    }

    const result = await analyzeTransformatieReflectie({
      moduleTitle: moduleTitle ?? 'Transformatie',
      lessonTitle: lessonTitle ?? '',
      phase: phase as 'DESIGN' | 'ACTION' | 'SURRENDER',
      reflectieType: reflectieType as 'spiegel' | 'identiteit' | 'actie',
      question,
      answer: answer.trim(),
    });

    // Track AI feedback usage for badge (direct SQL — no self-fetch in server context)
    if (lessonId) {
      try {
        const badge = await sql`SELECT id FROM transformatie_badges WHERE slug = 'eerste-ai-feedback'`;
        if (badge.rows.length > 0) {
          await sql`
            INSERT INTO transformatie_user_badges (user_id, badge_id)
            VALUES (${user.id}, ${badge.rows[0].id})
            ON CONFLICT (user_id, badge_id) DO NOTHING
          `;
        }
      } catch {}
    }

    return NextResponse.json({ success: true, feedback: result.feedback });
  } catch (error) {
    console.error('Reflectie feedback error:', error);
    return NextResponse.json(
      { error: 'Fout bij genereren feedback', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
