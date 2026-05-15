import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getOpenRouterClient, OPENROUTER_MODELS } from '@/lib/openrouter';
import { sendEmail } from '@/lib/email-service';

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
    const { answers, intake, userId, email, firstName, acceptsMarketing } = body as {
      answers: Record<string, number>;
      intake: IntakeData;
      userId?: number;
      email?: string;
      firstName?: string;
      acceptsMarketing?: boolean;
    };

    if (!answers || !intake) {
      return NextResponse.json({ error: 'Answers and intake required' }, { status: 400 });
    }

    const scores = calculateScores(answers, intake);
    const aiAnalysis = await generateAIAnalysis(scores, intake);

    // Ensure lead storage table exists
    await ensureLeadTable();

    // Save lead + optionally persist scan history
    if (email && firstName) {
      await saveLead(email, firstName, scores, aiAnalysis, intake, acceptsMarketing ?? false);
      await sendResultEmail(email, firstName, scores, aiAnalysis);
    }

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
  const q2 = 6 - q2raw;
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
    overallScore, profiel,
    emotioneleVerwerking, identiteitskracht, datingMindset,
    praktischeStabiliteit, externeBevestiging,
    reboundRisk, reboundNiveau,
  };
}

async function generateAIAnalysis(scores: Scores, intake: IntakeData) {
  const PROFILE_NAMES: Record<string, string> = {
    heler: 'De Heler', waker: 'De Waker', starter: 'De Starter', bloeier: 'De Bloeier',
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
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return null;
  } catch {
    return null;
  }
}

async function ensureLeadTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS scheiding_herstart_leads (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        first_name TEXT NOT NULL,
        profiel TEXT NOT NULL,
        overall_score INTEGER NOT NULL,
        rebound_niveau TEXT NOT NULL,
        scores_json JSONB,
        ai_analysis JSONB,
        intake_json JSONB,
        accepts_marketing BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
  } catch (e) {
    console.error('Failed to ensure lead table:', e);
  }
}

async function saveLead(
  email: string,
  firstName: string,
  scores: Scores,
  aiAnalysis: any,
  intake: IntakeData,
  acceptsMarketing: boolean
) {
  try {
    await sql`
      INSERT INTO scheiding_herstart_leads
        (email, first_name, profiel, overall_score, rebound_niveau,
         scores_json, ai_analysis, intake_json, accepts_marketing)
      VALUES (
        ${email}, ${firstName}, ${scores.profiel}, ${scores.overallScore}, ${scores.reboundNiveau},
        ${JSON.stringify(scores)}::jsonb,
        ${aiAnalysis ? JSON.stringify(aiAnalysis) : null}::jsonb,
        ${JSON.stringify(intake)}::jsonb,
        ${acceptsMarketing}
      )
    `;
  } catch (e) {
    console.error('Failed to save scheiding herstart lead:', e);
  }

  if (acceptsMarketing) {
    try {
      await sql`
        INSERT INTO newsletter_subscribers (email, first_name, source, created_at)
        VALUES (${email}, ${firstName}, 'scheiding-herstart-scan', NOW())
        ON CONFLICT (email) DO NOTHING
      `;
    } catch (e) {
      console.error('Failed to subscribe lead to newsletter:', e);
    }
  }
}

function getCoachingPitch(profiel: string): string {
  const pitches: Record<string, string> = {
    heler: 'Je hebt eerlijk aangegeven dat je hart nog aan het helen is — en dat vraagt moed. Heling gaat sneller met de juiste begeleiding. Onze coaches helpen je dit proces bewust te doorlopen, zodat je vanuit kracht begint te daten — niet vanuit pijn of eenzaamheid.',
    waker: 'Je staat op het kantelpunt. Met de juiste begeleiding zet je dit momentum om in echte stappen — zonder de valkuilen die de meeste mensen in jouw fase maken. Onze coaches weten precies wat je nu nodig hebt om van Waker naar Starter te gaan.',
    starter: 'Je hebt de basis goed op orde. Nu gaat het erom hoe je dit omzet in echte, goede connecties — van profiel tot tweede date. Dat is precies waar onze coaches je bij helpen: van klaar-zijn naar daadwerkelijk de juiste match vinden.',
    bloeier: 'Jouw positie is sterk — en dat is zeldzaam. Maar zelfs de meest zelfbewuste singles missen de juiste match als ze geen bewuste strategie hebben. Onze coaching helpt je jouw kracht om te zetten in echte, duurzame verbinding.',
  };
  return pitches[profiel] ?? pitches.starter;
}

async function sendResultEmail(
  email: string,
  firstName: string,
  scores: Scores,
  aiAnalysis: any
) {
  const PROFILE_NAMES: Record<string, string> = {
    heler: 'De Heler', waker: 'De Waker', starter: 'De Starter', bloeier: 'De Bloeier',
  };

  const PROFILE_EMOJI: Record<string, string> = {
    heler: '🌱', waker: '🌤️', starter: '🚀', bloeier: '🌸',
  };

  const profielNaam = PROFILE_NAMES[scores.profiel] ?? scores.profiel;
  const emoji = PROFILE_EMOJI[scores.profiel] ?? '';
  const PROD_URL = 'https://datingassistent.nl';

  const analysis = aiAnalysis ?? {};
  const week1 = (analysis.actieplan?.week1 ?? []).slice(0, 3);
  const tip = analysis.datinTip ?? '';
  const omschrijving = analysis.profielOmschrijving ?? '';

  const html = `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 0; color: #1f2937; }
  .container { max-width: 560px; margin: 32px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .header { background: linear-gradient(135deg, #fff1f2, #fdf2f8); padding: 40px 32px 32px; text-align: center; }
  .emoji { font-size: 48px; margin-bottom: 12px; }
  .score-badge { display: inline-block; background: #fff; border: 1px solid #fecdd3; color: #be185d; font-size: 13px; font-weight: 600; padding: 6px 16px; border-radius: 999px; margin-top: 8px; }
  .body { padding: 32px; }
  .section { margin-bottom: 24px; }
  .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 12px; }
  .card { background: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 16px 20px; }
  .action-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; font-size: 14px; color: #374151; }
  .bullet { color: #f43f5e; font-size: 18px; line-height: 1.2; flex-shrink: 0; }
  .cta-btn { display: block; width: 100%; background: #f43f5e; color: #fff; text-align: center; padding: 16px; border-radius: 999px; font-weight: 700; font-size: 16px; text-decoration: none; margin-top: 8px; }
  .footer { padding: 24px 32px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #9ca3af; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="emoji">${emoji}</div>
    <h1 style="margin:0 0 4px;font-size:28px;font-weight:800;color:#be185d;">${profielNaam}</h1>
    <p style="margin:0;color:#6b7280;font-size:15px;">Jouw Herstart na Scheiding Analyse</p>
    <div class="score-badge">Herstartscore: ${scores.overallScore}/100</div>
  </div>
  <div class="body">
    <p style="font-size:16px;line-height:1.6;margin-top:0;">Hoi ${firstName},</p>
    <p style="font-size:15px;line-height:1.6;color:#4b5563;">${omschrijving || `Je scan is klaar. Jouw profiel is <strong>${profielNaam}</strong> met een herstartscore van <strong>${scores.overallScore}/100</strong>.`}</p>

    <div class="section">
      <div class="section-title">Jouw scores</div>
      <div class="card">
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="padding:4px 0;color:#6b7280;">Emotionele verwerking</td><td style="text-align:right;font-weight:600;color:#be185d;">${scores.emotioneleVerwerking}%</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;">Identiteitskracht</td><td style="text-align:right;font-weight:600;color:#be185d;">${scores.identiteitskracht}%</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;">Dating mindset</td><td style="text-align:right;font-weight:600;color:#be185d;">${scores.datingMindset}%</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;">Rebound risico</td><td style="text-align:right;font-weight:600;color:#be185d;">${scores.reboundNiveau}</td></tr>
        </table>
      </div>
    </div>

    ${week1.length > 0 ? `
    <div class="section">
      <div class="section-title">Jouw acties voor week 1</div>
      ${week1.map((a: string) => `<div class="action-item"><span class="bullet">→</span><span>${a}</span></div>`).join('')}
    </div>
    ` : ''}

    ${tip ? `
    <div class="section">
      <div class="section-title">Persoonlijke tip</div>
      <div class="card" style="font-style:italic;color:#374151;font-size:15px;line-height:1.6;">"${tip}"</div>
    </div>
    ` : ''}

    <div class="section">
      <div class="section-title">Jouw volgende stap</div>
      <div class="card" style="font-size:14px;color:#374151;line-height:1.7;margin-bottom:16px;">${getCoachingPitch(scores.profiel)}</div>
      <a href="${PROD_URL}/prijzen?utm_source=email&utm_medium=scan&utm_campaign=scheiding-herstart&profiel=${scores.profiel}" class="cta-btn">Bekijk coaching opties →</a>
      <p style="font-size:12px;text-align:center;color:#9ca3af;margin-top:8px;">Vanaf €47 · 21 dagen · Geen langetermijn verplichtingen</p>
    </div>

    <p style="font-size:14px;color:#6b7280;line-height:1.6;margin-bottom:0;">
      Vragen of feedback? Reply gewoon op deze mail.<br><br>
      Groet,<br>
      <strong>Vincent</strong><br>
      DatingAssistent
    </p>
  </div>
  <div class="footer">
    <a href="${PROD_URL}/uitschrijven?email=${encodeURIComponent(email)}" style="color:#9ca3af;">Uitschrijven</a>
    &nbsp;·&nbsp; DatingAssistent.nl
  </div>
</div>
</body>
</html>`;

  const text = `
Hoi ${firstName},

Jouw Herstart na Scheiding analyse is klaar.

PROFIEL: ${profielNaam} ${emoji}
Herstartscore: ${scores.overallScore}/100

Emotionele verwerking: ${scores.emotioneleVerwerking}%
Identiteitskracht: ${scores.identiteitskracht}%
Dating mindset: ${scores.datingMindset}%
Rebound risico: ${scores.reboundNiveau}

${week1.length > 0 ? `ACTIES VOOR WEEK 1:\n${week1.map((a: string) => `→ ${a}`).join('\n')}\n` : ''}
${tip ? `\nPERSOONLIJKE TIP:\n"${tip}"` : ''}

JOUW VOLGENDE STAP:
${getCoachingPitch(scores.profiel)}

Bekijk coaching opties: ${PROD_URL}/prijzen?utm_source=email&utm_medium=scan&utm_campaign=scheiding-herstart&profiel=${scores.profiel}
(Vanaf €47 · 21 dagen · Geen langetermijn verplichtingen)

Groet,
Vincent
DatingAssistent
  `.trim();

  try {
    await sendEmail({
      to: email,
      from: process.env.RESEND_FROM_EMAIL || 'noreply@datingassistent.nl',
      subject: `${firstName}, jouw Herstart Analyse: ${profielNaam} (${scores.overallScore}/100)`,
      html,
      text,
    });
  } catch (e) {
    console.error('Failed to send scheiding herstart result email:', e);
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
