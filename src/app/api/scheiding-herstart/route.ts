import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getOpenRouterClient, OPENROUTER_MODELS } from '@/lib/openrouter';

interface IntakeData {
  tijdSindsScheiding: string;
  relatieduur: string;
  kinderen: string;
}

interface Scores {
  overallScore: number;
  profiel: string;
  emotioneleVerwerking: number;
  identiteitskracht: number;
  datingMindset: number;
  praktischeStabiliteit: number;
  externeBevestiging: number;
  reboundRisk: number;
  reboundNiveau: 'laag' | 'gemiddeld' | 'hoog';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers, intake, userId } = body as {
      answers: Record<string, number>;
      intake: IntakeData;
      userId?: number;
    };

    if (!answers || !intake) {
      return NextResponse.json({ error: 'Answers and intake required' }, { status: 400 });
    }

    const scores = calculateScores(answers, intake);
    const aiAnalysis = await generateAIAnalysis(scores, intake);

    if (userId) {
      await persistResults(userId, scores, aiAnalysis, answers, intake);
    }

    return NextResponse.json({
      success: true,
      result: { scores, aiAnalysis },
    });
  } catch (error: any) {
    console.error('Scheiding herstart scan error:', error);
    return NextResponse.json(
      { error: 'Scan processing failed', message: error.message },
      { status: 500 }
    );
  }
}

function calculateScores(answers: Record<string, number>, intake: IntakeData): Scores {
  const p = (score: number, max: number) => Math.round((score / max) * 100);

  const q1 = answers.ex_gevoelens ?? 2;
  const q2raw = answers.dagelijkse_gedachten ?? 3;
  const q2 = 6 - q2raw; // reversed: 5 (helemaal niet) = score 5
  const q3 = answers.vrede_einde ?? 2;
  const q4 = answers.eigen_identiteit ?? 2;
  const q5 = answers.activiteiten_jezelf ?? 2;
  const q6 = answers.goed_in_vel ?? 2;
  const q7 = answers.reden_daten ?? 2;
  const q8 = answers.ex_scenario ?? 2;
  const q9 = answers.stabiel_leven ?? 2;
  const q10 = answers.scheiding_disclosure ?? 2;
  const q11 = answers.eerlijk_over_scheiding ?? 2;
  const q12 = answers.omgeving_klaar ?? 2;

  const emotioneleVerwerking = Math.round((p(q1, 4) + p(q2, 5) + p(q3, 5)) / 3);
  const identiteitskracht = Math.round((p(q4, 5) + p(q5, 5) + p(q6, 5)) / 3);
  const datingMindset = Math.round((p(q7, 4) + p(q10, 4) + p(q11, 5)) / 3);
  const praktischeStabiliteit = Math.round((p(q9, 5) + p(q8, 4)) / 2);
  const externeBevestiging = p(q12, 5);

  const overallScore = Math.round(
    emotioneleVerwerking * 0.30 +
    identiteitskracht * 0.25 +
    datingMindset * 0.25 +
    praktischeStabiliteit * 0.10 +
    externeBevestiging * 0.10
  );

  let reboundRisk = 0;
  if (intake.tijdSindsScheiding === 'less_3m') reboundRisk += 35;
  else if (intake.tijdSindsScheiding === '3_6m') reboundRisk += 20;
  else if (intake.tijdSindsScheiding === '6_12m') reboundRisk += 10;
  if (q7 === 1) reboundRisk += 25;
  else if (q7 === 2) reboundRisk += 20;
  if (q2 <= 2) reboundRisk += 15;
  if (q3 <= 2) reboundRisk += 10;
  reboundRisk = Math.min(100, reboundRisk);

  const profiel = overallScore >= 80 ? 'bloeier'
    : overallScore >= 60 ? 'starter'
    : overallScore >= 40 ? 'waker'
    : 'heler';

  const reboundNiveau: 'laag' | 'gemiddeld' | 'hoog' =
    reboundRisk < 30 ? 'laag' : reboundRisk < 60 ? 'gemiddeld' : 'hoog';

  return {
    overallScore,
    profiel,
    emotioneleVerwerking,
    identiteitskracht,
    datingMindset,
    praktischeStabiliteit,
    externeBevestiging,
    reboundRisk,
    reboundNiveau,
  };
}

async function generateAIAnalysis(scores: Scores, intake: IntakeData) {
  const PROFILE_NAMES: Record<string, string> = {
    heler: 'De Heler',
    waker: 'De Waker',
    starter: 'De Starter',
    bloeier: 'De Bloeier',
  };

  const TIJD_LABELS: Record<string, string> = {
    less_3m: 'minder dan 3 maanden geleden',
    '3_6m': '3-6 maanden geleden',
    '6_12m': '6-12 maanden geleden',
    '1_2y': '1-2 jaar geleden',
    more_2y: 'meer dan 2 jaar geleden',
  };

  const prompt = `
Je bent een empathische Nederlandse dating coach gespecialiseerd in mensen die opnieuw gaan daten na een scheiding.

Analyseer deze resultaten van de "Herstart na Scheiding" scan:

CONTEXT:
- Scheiding: ${TIJD_LABELS[intake.tijdSindsScheiding] ?? intake.tijdSindsScheiding}
- Relatieduur: ${intake.relatieduur === 'long' ? 'Lange relatie (7+ jaar / getrouwd)' : intake.relatieduur === 'medium' ? 'Middellange relatie (2-7 jaar)' : 'Korte relatie (< 2 jaar)'}
- Kinderen: ${intake.kinderen === 'no' ? 'Geen kinderen betrokken' : intake.kinderen === 'yes_young' ? 'Jonge kinderen betrokken' : 'Oudere kinderen/tieners betrokken'}

SCORES:
- Herstartscore: ${scores.overallScore}/100 → Profiel: ${PROFILE_NAMES[scores.profiel]}
- Emotionele verwerking: ${scores.emotioneleVerwerking}%
- Identiteitskracht: ${scores.identiteitskracht}%
- Dating mindset: ${scores.datingMindset}%
- Praktische stabiliteit: ${scores.praktischeStabiliteit}%
- Rebound risico: ${scores.reboundRisk}% (${scores.reboundNiveau})

Genereer een Nederlandse analyse als JSON (geen markdown, alleen pure JSON):
{
  "profielTitel": "${PROFILE_NAMES[scores.profiel]}",
  "profielOmschrijving": "Persoonlijke, warme omschrijving van dit profiel specifiek voor deze persoon (2-3 zinnen)",
  "watGaedGaat": ["3 specifieke sterke punten op basis van scores"],
  "aandachtspunten": ["3 concrete aandachtspunten specifiek voor dit profiel en deze context"],
  "actieplan": {
    "week1": ["3 concrete acties voor de eerste week"],
    "maand1": ["3 concrete acties voor de eerste maand"],
    "maand3": ["3 concrete acties voor maand 3"]
  },
  "datinTip": "1 specifieke, praktische tip voor iemand met dit profiel die gaat daten na een scheiding",
  "reboundAlerts": ["2 specifieke rebound-risico's voor dit profiel"]
}

Wees eerlijk maar bemoedigend. Gebruik 'je/jij'. Zorg dat de adviezen SPECIFIEK zijn voor scheiding-context.
`;

  try {
    const client = getOpenRouterClient();
    const response = await client.createChatCompletion(
      OPENROUTER_MODELS.CLAUDE_35_HAIKU,
      [{ role: 'user', content: prompt }],
      { temperature: 0.7, max_tokens: 1500 }
    );

    const content = typeof response === 'string' ? response : JSON.stringify(response);
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch {
    return null;
  }
}

async function persistResults(
  userId: number,
  scores: Scores,
  aiAnalysis: any,
  answers: Record<string, number>,
  intake: IntakeData
) {
  const fullResults = { scores, aiAnalysis, answers, intake };
  // Generate a pseudo-unique assessment_id (no dedicated table for this scan)
  const assessmentId = Math.floor(Math.random() * 2_000_000_000) + 1;

  try {
    await sql`
      INSERT INTO user_scan_history (
        user_id, scan_type, assessment_id, completed_at,
        primary_result, scores_json, full_results
      ) VALUES (
        ${userId}, 'scheiding-herstart', ${assessmentId}, NOW(),
        ${scores.profiel},
        ${JSON.stringify(scores)}::jsonb,
        ${JSON.stringify(fullResults)}::jsonb
      )
      ON CONFLICT (scan_type, assessment_id) DO NOTHING
    `;
  } catch (e) {
    console.error('Failed to write scan history:', e);
  }

  try {
    await sql`
      INSERT INTO scan_retake_status (
        user_id, scan_type, total_attempts, last_completed_at,
        can_retake_after, cooldown_days, max_attempts_per_year
      ) VALUES (
        ${userId}, 'scheiding-herstart', 1, NOW(),
        NOW() + INTERVAL '30 days', 30, 12
      )
      ON CONFLICT (user_id, scan_type) DO UPDATE SET
        total_attempts = scan_retake_status.total_attempts + 1,
        last_completed_at = NOW(),
        can_retake_after = NOW() + INTERVAL '30 days',
        updated_at = NOW()
    `;

    await sql`
      INSERT INTO user_scan_progress (
        user_id, scans_completed,
        first_scan_completed_at, last_scan_completed_at
      ) VALUES (
        ${userId}, 1, NOW(), NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        scans_completed = (
          SELECT COUNT(DISTINCT scan_type) FROM user_scan_history WHERE user_id = ${userId}
        ),
        last_scan_completed_at = NOW(),
        total_retakes = user_scan_progress.total_retakes + 1,
        updated_at = NOW()
    `;
  } catch (e) {
    console.error('Failed to write scan retake/progress:', e);
  }
}
