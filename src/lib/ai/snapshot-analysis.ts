/**
 * AI Snapshot Analysis Engine
 *
 * Generates world-class AI-powered analysis of Dating Snapshot results
 * using Claude 3.5 Sonnet via OpenRouter for deep, personalized insights.
 */

import { sql } from '@vercel/postgres';
import { OPENROUTER_MODELS } from '@/lib/openrouter';
import type {
  SnapshotAIAnalysis,
  SnapshotAnswers,
  SnapshotScores,
  AIAnalysisRawOutput,
  AnalysisStreamChunk,
} from './snapshot-analysis-types';
import type { EnergyProfile, AttachmentStyle, PainPoint } from '@/types/dating-snapshot.types';

// =====================================================
// FORMATTERS
// =====================================================

const SINGLE_SINCE_TEXTS: Record<string, string> = {
  less_than_3_months: 'minder dan 3 maanden',
  '3_to_6_months': '3 tot 6 maanden',
  '6_to_12_months': '6 tot 12 maanden',
  '1_to_2_years': '1 tot 2 jaar',
  '2_to_5_years': '2 tot 5 jaar',
  more_than_5_years: 'meer dan 5 jaar',
  always: 'altijd single geweest',
};

const CONVERSATION_PREFERENCE_TEXTS: Record<string, string> = {
  deep_1on1: 'diepgaande 1-op-1 gesprekken',
  light_groups: 'luchtige groepsgesprekken',
  mixed: 'een mix van beide',
};

const POST_DATE_NEED_TEXTS: Record<string, string> = {
  alone_time: 'alleen tijd om te herstellen',
  more_contact: 'meteen meer contact',
  depends: 'hangt af van de date',
};

const RECHARGE_METHOD_TEXTS: Record<string, string> = {
  alone: 'in mijn eentje',
  close_friends: 'met goede vrienden',
  activities: 'door actief bezig te zijn',
  sleep: 'door te slapen',
};

const PAIN_POINT_TEXTS: Record<string, string> = {
  few_matches: 'te weinig matches krijgen',
  conversations_die: 'gesprekken die doodlopen',
  no_dates: 'van gesprek naar date komen',
  ghosting: 'geghostd worden',
  burnout: 'dating burnout',
  wrong_people: 'op de verkeerde mensen vallen',
  confidence: 'onzekerheid bij het daten',
  second_dates: 'eerste dates omzetten naar tweede dates',
};

const RELATIONSHIP_GOAL_TEXTS: Record<string, string> = {
  serious_relationship: 'een serieuze relatie',
  casual_dating: 'casual daten',
  marriage: 'trouwen / levenspartner',
  unsure: 'nog aan het ontdekken',
};

const TIMELINE_TEXTS: Record<string, string> = {
  no_rush: 'geen haast, laat het komen',
  within_year: 'liefst binnen een jaar',
  asap: 'zo snel mogelijk',
  exploring: 'eerst mezelf leren kennen',
};

const GHOSTING_FREQUENCY_TEXTS: Record<string, string> = {
  never: 'nooit',
  once: 'één keer',
  rarely: 'zelden',
  sometimes: 'soms',
  often: 'regelmatig',
  very_often: 'heel vaak',
};

// =====================================================
// PROMPT BUILDER
// =====================================================

export function buildAnalysisPrompt(
  answers: SnapshotAnswers,
  scores: SnapshotScores
): string {
  const parts: string[] = [];

  // System context
  parts.push(`Je bent Iris, de AI dating coach van DatingAssistent.nl.
Je analyseert de Dating Snapshot resultaten van een nieuwe gebruiker.
Je taak is om DIEPGAANDE, GEPERSONALISEERDE inzichten te geven.

BELANGRIJKE REGELS:
1. Wees SPECIFIEK - refereer aan hun WERKELIJKE antwoorden
2. Wees WARM maar EERLIJK - geen sugarcoating
3. Schrijf in B1/B2 Nederlands, informeel maar professioneel
4. Gebruik "je/jij" aanspreekvorm
5. Toon ECHTE psychologische inzichten, niet generieke platitudes
6. De hechtingsstijl analyse is VOORLOPIG - in Module 2 krijgen ze de volledige analyse
7. Wees empathisch maar ook direct - dating advies moet actionable zijn

TONE: Als een ervaren vriendin die ook psycholoog is - warm, direct, inzichtelijk.`);

  // User profile overview
  parts.push(`
=== GEBRUIKER PROFIEL ===
Naam: ${answers.display_name}
Leeftijd: ${answers.age || 'Niet opgegeven'}
${answers.occupation ? `Beroep: ${answers.occupation}` : ''}
${answers.location_city ? `Stad: ${answers.location_city}` : ''}
Single sinds: ${SINGLE_SINCE_TEXTS[answers.single_since || ''] || answers.single_since || 'Niet opgegeven'}
${answers.longest_relationship_months ? `Langste relatie: ${answers.longest_relationship_months} maanden` : ''}`);

  // Dating situation
  parts.push(`
=== DATING SITUATIE ===
Apps gebruikt: ${answers.apps_used?.join(', ') || 'Niet gespecificeerd'}
${answers.primary_app ? `Voorkeurs app: ${answers.primary_app}` : ''}
Ervaring met apps: ${answers.app_experience_months || 0} maanden
Matches per week: ${answers.matches_per_week || 'Niet opgegeven'}
Matches → gesprekken: ${answers.matches_to_conversations_pct || 0}%
Gesprekken → dates: ${answers.conversations_to_dates_pct || 0}%
Dates laatste 3 maanden: ${answers.dates_last_3_months || 0}`);

  // Energy profile
  parts.push(`
=== ENERGIE PROFIEL (RUWE DATA) ===
Energie na sociale interactie (1=uitgeput, 5=vol energie): ${answers.energy_after_social || 'N/A'}
Gespreksvoorkeur: ${CONVERSATION_PREFERENCE_TEXTS[answers.conversation_preference || ''] || 'N/A'}
Voorbereiding voor bellen (1=spontaan, 5=veel prep nodig): ${answers.call_preparation || 'N/A'}
Na een date: ${POST_DATE_NEED_TEXTS[answers.post_date_need || ''] || 'N/A'}
Oplaadmethode: ${RECHARGE_METHOD_TEXTS[answers.recharge_method || ''] || 'N/A'}
Sociale batterij (1-10): ${answers.social_battery_capacity || 'N/A'}

BEREKENDE SCORES:
- Introvert score: ${scores.introvertScore}/100
- Energie profiel: ${scores.energyProfile}`);

  // Pain points
  const painPointsFormatted = answers.pain_points_ranked
    ?.map((pp, i) => `${i + 1}. ${PAIN_POINT_TEXTS[pp] || pp}`)
    .join('\n') || 'Niet gespecificeerd';

  parts.push(`
=== PIJNPUNTEN (gerangschikt van meest naar minst frustrerend) ===
${painPointsFormatted}

Ernst van frustratie (1-10): ${answers.pain_point_severity || 'N/A'}
${answers.biggest_frustration ? `\nIn eigen woorden: "${answers.biggest_frustration}"` : ''}
${answers.tried_solutions?.length ? `\nAl geprobeerde oplossingen: ${answers.tried_solutions.join(', ')}` : ''}`);

  // Attachment style
  const anxietyScore =
    (answers.attachment_q1_abandonment || 0) +
    (answers.attachment_q4_validation || 0) +
    (answers.attachment_q7_closeness || 0);
  const avoidanceScore =
    (answers.attachment_q2_trust || 0) +
    (answers.attachment_q3_intimacy || 0) +
    (answers.attachment_q5_withdraw || 0) +
    (answers.attachment_q6_independence || 0);

  parts.push(`
=== HECHTINGSSTIJL (RUWE ANTWOORDEN, schaal 1-5) ===
Q1 - "Ik maak me zorgen dat mensen me verlaten" (angst verlating): ${answers.attachment_q1_abandonment || 'N/A'}
Q2 - "Ik vind het moeilijk om anderen te vertrouwen": ${answers.attachment_q2_trust || 'N/A'}
Q3 - "Ik voel me ongemakkelijk als iemand te dichtbij komt": ${answers.attachment_q3_intimacy || 'N/A'}
Q4 - "Ik heb veel bevestiging nodig in relaties": ${answers.attachment_q4_validation || 'N/A'}
Q5 - "Als iemand te dichtbij komt, trek ik me terug": ${answers.attachment_q5_withdraw || 'N/A'}
Q6 - "Ik geef de voorkeur aan onafhankelijkheid boven nabijheid": ${answers.attachment_q6_independence || 'N/A'}
Q7 - "Ik verlang naar meer nabijheid dan mijn partner wil": ${answers.attachment_q7_closeness || 'N/A'}

BEREKEND:
- Anxiety score (Q1+Q4+Q7): ${anxietyScore}/15
- Avoidance score (Q2+Q3+Q5+Q6): ${avoidanceScore}/20
- Voorlopige stijl: ${scores.attachmentStyle}
- Confidence: ${scores.attachmentConfidence}%`);

  // Goals and vision
  parts.push(`
=== DOELEN & VISIE ===
Zoekt: ${RELATIONSHIP_GOAL_TEXTS[answers.relationship_goal || ''] || 'Niet opgegeven'}
Timeline: ${TIMELINE_TEXTS[answers.timeline_preference || ''] || 'Niet opgegeven'}
Commitment (1-10): ${answers.commitment_level || 'N/A'}
Uren per week beschikbaar: ${answers.weekly_time_available || 'N/A'}

Over 1 jaar wil ik: "${answers.one_year_vision || 'Niet ingevuld'}"
Succes na deze cursus is: "${answers.success_definition || 'Niet ingevuld'}"`);

  // Context
  parts.push(`
=== CONTEXT & EERDERE ERVARINGEN ===
Ghosting ervaren: ${answers.has_been_ghosted ? 'Ja' : 'Nee'}
${answers.has_been_ghosted && answers.ghosting_frequency ? `- Frequentie: ${GHOSTING_FREQUENCY_TEXTS[answers.ghosting_frequency] || answers.ghosting_frequency}` : ''}
${answers.has_been_ghosted && answers.ghosting_impact ? `- Impact (1-10): ${answers.ghosting_impact}` : ''}
Dating burnout ervaren: ${answers.has_experienced_burnout ? 'Ja' : 'Nee'}
${answers.has_experienced_burnout && answers.burnout_severity ? `- Ernst (1-10): ${answers.burnout_severity}` : ''}
${answers.previous_coaching ? 'Heeft eerder coaching gehad' : ''}`);

  // Output format instructions
  parts.push(`
=== JE TAAK ===

Analyseer ALLE bovenstaande data en genereer een JSON response. Let op:
- Refereer aan SPECIFIEKE antwoorden en scores
- Maak ECHTE verbanden tussen verschillende antwoorden
- Geef CONCRETE, ACTIONABLE adviezen
- Wees WARM maar ook EERLIJK

GENEREER EXACT DEZE JSON STRUCTUUR (geen markdown, alleen pure JSON):

{
  "energyProfileAnalysis": {
    "nuancedInterpretation": "[80-100 woorden over hun specifieke energie profiel - refereer aan concrete scores en antwoorden]",
    "datingImplications": ["[implicatie 1 voor hun dating leven]", "[implicatie 2]", "[implicatie 3]"],
    "strengthsInDating": ["[kracht 1 die uit hun profiel blijkt]", "[kracht 2]"],
    "watchOuts": ["[waar ze op moeten letten 1]", "[waar ze op moeten letten 2]"]
  },
  "attachmentStyleAnalysis": {
    "interpretation": "[60-80 woorden - refereer aan specifieke antwoorden op de hechtingsvragen]",
    "triggerPatterns": ["[trigger 1 gebaseerd op hun antwoorden]", "[trigger 2]"],
    "relationshipPatterns": ["[patroon 1 dat ze waarschijnlijk hebben]", "[patroon 2]"],
    "growthAreas": ["[groeigebied 1]", "[groeigebied 2]"]
  },
  "painPointAnalysis": {
    "rootCauseAnalysis": "[50-70 woorden - waarom DIT specifiek hun uitdaging is, gekoppeld aan hun profiel]",
    "connectionToProfile": "[1-2 zinnen over hoe dit samenhangt met hun energie/hechtingsstijl]",
    "immediateActionSteps": ["[concrete actie 1 die ze vandaag kunnen doen]", "[actie 2]", "[actie 3]"],
    "howProgramHelps": "[Specifiek welke modules/tools in het programma hen gaan helpen]"
  },
  "crossCorrelationInsights": [
    {
      "factors": ["[factor1]", "[factor2]"],
      "insight": "[De connectie die je ziet tussen deze factoren]",
      "implication": "[Wat dit betekent voor hun dating]",
      "recommendation": "[Concrete aanbeveling]"
    },
    {
      "factors": ["[factor1]", "[factor2]"],
      "insight": "[Nog een interessante connectie]",
      "implication": "[Wat dit betekent]",
      "recommendation": "[Concrete aanbeveling]"
    }
  ],
  "coachingPreview": {
    "personalizedGreeting": "[Warme, persoonlijke begroeting met hun naam - 1-2 zinnen]",
    "whatIrisNoticed": ["[Observatie 1 uit hun antwoorden]", "[Observatie 2]", "[Observatie 3]"],
    "focusAreasForProgram": ["[Focus 1 voor hun programma]", "[Focus 2]", "[Focus 3]"],
    "expectedBreakthroughs": ["[Doorbraak die ze kunnen verwachten 1]", "[Doorbraak 2]"],
    "firstWeekFocus": "[Waar ze zich de eerste week op gaan focussen]"
  }
}

VOORBEELDEN VAN GOEDE CROSS-CORRELATIONS (pas aan voor deze persoon):
- introvert + conversations_die → selectiever matchen zodat elk gesprek de energie waard is
- anxious + ghosting_impact_high → werken aan rejection resilience voordat we aan gesprekken werken
- avoidant + second_dates → comfortabel kwetsbaar leren zijn zonder jezelf te verliezen
- low_matches + high_commitment → profiel optimalisatie prioriteit + realistische verwachtingen

Genereer 2-3 relevante cross-correlations SPECIFIEK voor deze persoon.`);

  return parts.join('\n');
}

// =====================================================
// CACHE FUNCTIONS
// =====================================================

function hashAnswers(answers: SnapshotAnswers): string {
  const str = JSON.stringify(answers);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

async function getCachedAnalysis(
  userId: number,
  answers: SnapshotAnswers
): Promise<SnapshotAIAnalysis | null> {
  const cacheKey = `snapshot_analysis_${hashAnswers(answers)}`;
  try {
    const result = await sql`
      SELECT content_data
      FROM ai_content_cache
      WHERE user_id = ${userId}
        AND content_type = 'snapshot_analysis'
        AND content_key = ${cacheKey}
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
      LIMIT 1
    `;
    if (result.rows.length > 0) {
      const data = result.rows[0].content_data;
      return typeof data === 'string' ? JSON.parse(data) : data;
    }
  } catch (e) {
    console.warn('Cache check failed:', e);
  }
  return null;
}

async function cacheAnalysis(
  userId: number,
  answers: SnapshotAnswers,
  analysis: SnapshotAIAnalysis
): Promise<void> {
  const cacheKey = `snapshot_analysis_${hashAnswers(answers)}`;
  try {
    await sql`
      INSERT INTO ai_content_cache
      (user_id, content_type, content_key, content_data, ai_model, ai_version, usage_count, last_used, expires_at)
      VALUES (
        ${userId},
        'snapshot_analysis',
        ${cacheKey},
        ${JSON.stringify(analysis)}::jsonb,
        'claude-3-5-sonnet-20241022',
        'v1.0',
        1,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP + INTERVAL '7 days'
      )
      ON CONFLICT (user_id, content_type, content_key)
      DO UPDATE SET
        content_data = EXCLUDED.content_data,
        usage_count = ai_content_cache.usage_count + 1,
        last_used = CURRENT_TIMESTAMP,
        expires_at = CURRENT_TIMESTAMP + INTERVAL '7 days'
    `;
  } catch (e) {
    console.warn('Cache save failed:', e);
  }
}

// =====================================================
// RESPONSE PARSER
// =====================================================

function parseAnalysisResponse(
  responseText: string,
  answers: SnapshotAnswers,
  scores: SnapshotScores,
  userId: number,
  processingTimeMs: number
): SnapshotAIAnalysis {
  // Try to extract JSON from response
  let jsonText = responseText.trim();

  // Remove markdown code blocks if present
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.slice(7);
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.slice(3);
  }
  if (jsonText.endsWith('```')) {
    jsonText = jsonText.slice(0, -3);
  }
  jsonText = jsonText.trim();

  let rawOutput: AIAnalysisRawOutput;
  try {
    rawOutput = JSON.parse(jsonText);
  } catch {
    console.error('Failed to parse AI response as JSON:', jsonText.substring(0, 500));
    // Return fallback analysis
    return createFallbackAnalysis(answers, scores, userId, processingTimeMs);
  }

  // Transform to full analysis object
  const analysis: SnapshotAIAnalysis = {
    id: `analysis_${userId}_${Date.now()}`,
    userId,
    generatedAt: new Date(),
    model: 'claude-3-5-sonnet-20241022',
    energyProfileAnalysis: {
      profile: scores.energyProfile,
      score: scores.introvertScore,
      nuancedInterpretation: rawOutput.energyProfileAnalysis?.nuancedInterpretation || '',
      datingImplications: rawOutput.energyProfileAnalysis?.datingImplications || [],
      strengthsInDating: rawOutput.energyProfileAnalysis?.strengthsInDating || [],
      watchOuts: rawOutput.energyProfileAnalysis?.watchOuts || [],
    },
    attachmentStyleAnalysis: {
      style: scores.attachmentStyle,
      confidence: scores.attachmentConfidence,
      interpretation: rawOutput.attachmentStyleAnalysis?.interpretation || '',
      triggerPatterns: rawOutput.attachmentStyleAnalysis?.triggerPatterns || [],
      relationshipPatterns: rawOutput.attachmentStyleAnalysis?.relationshipPatterns || [],
      growthAreas: rawOutput.attachmentStyleAnalysis?.growthAreas || [],
      isProvisional: true,
    },
    painPointAnalysis: {
      primary: scores.primaryPainPoint,
      secondary: scores.secondaryPainPoint,
      rootCauseAnalysis: rawOutput.painPointAnalysis?.rootCauseAnalysis || '',
      connectionToProfile: rawOutput.painPointAnalysis?.connectionToProfile || '',
      immediateActionSteps: rawOutput.painPointAnalysis?.immediateActionSteps || [],
      howProgramHelps: rawOutput.painPointAnalysis?.howProgramHelps || '',
    },
    crossCorrelationInsights: rawOutput.crossCorrelationInsights || [],
    coachingPreview: {
      personalizedGreeting: rawOutput.coachingPreview?.personalizedGreeting || `Welkom ${answers.display_name}!`,
      whatIrisNoticed: rawOutput.coachingPreview?.whatIrisNoticed || [],
      focusAreasForProgram: rawOutput.coachingPreview?.focusAreasForProgram || [],
      expectedBreakthroughs: rawOutput.coachingPreview?.expectedBreakthroughs || [],
      firstWeekFocus: rawOutput.coachingPreview?.firstWeekFocus || '',
    },
    confidenceScore: 85,
    processingTimeMs,
    cached: false,
  };

  return analysis;
}

function createFallbackAnalysis(
  answers: SnapshotAnswers,
  scores: SnapshotScores,
  userId: number,
  processingTimeMs: number
): SnapshotAIAnalysis {
  return {
    id: `fallback_${userId}_${Date.now()}`,
    userId,
    generatedAt: new Date(),
    model: 'fallback',
    energyProfileAnalysis: {
      profile: scores.energyProfile,
      score: scores.introvertScore,
      nuancedInterpretation: `Met een introvert score van ${scores.introvertScore}% ben je ${scores.energyProfile === 'introvert' ? 'iemand die energie haalt uit rustige momenten' : scores.energyProfile === 'extrovert' ? 'iemand die energie krijgt van sociale interactie' : 'flexibel in hoe je energie opdoet'}.`,
      datingImplications: ['Je energie niveau bepaalt hoeveel dates je kunt plannen'],
      strengthsInDating: ['Je kent jezelf goed'],
      watchOuts: ['Let op je energieniveau'],
    },
    attachmentStyleAnalysis: {
      style: scores.attachmentStyle,
      confidence: scores.attachmentConfidence,
      interpretation: 'Je hechtingsstijl geeft inzicht in hoe je relaties aangaat.',
      triggerPatterns: ['Onzekerheid in nieuwe situaties'],
      relationshipPatterns: ['Je zoekt verbinding'],
      growthAreas: ['Bewustwording van je patronen'],
      isProvisional: true,
    },
    painPointAnalysis: {
      primary: scores.primaryPainPoint,
      rootCauseAnalysis: 'Dit is een veelvoorkomende uitdaging waar veel mensen mee worstelen.',
      connectionToProfile: 'Je profiel helpt ons begrijpen waar de focus moet liggen.',
      immediateActionSteps: ['Start met Module 1', 'Gebruik de Iris coach', 'Reflecteer dagelijks'],
      howProgramHelps: 'Het programma is afgestemd op jouw specifieke uitdagingen.',
    },
    crossCorrelationInsights: [],
    coachingPreview: {
      personalizedGreeting: `Hoi ${answers.display_name}! Welkom bij je persoonlijke dating transformatie.`,
      whatIrisNoticed: ['Je bent gemotiveerd om te groeien', 'Je kent je uitdagingen'],
      focusAreasForProgram: ['Zelfvertrouwen opbouwen', 'Gesprekstechnieken', 'Energie management'],
      expectedBreakthroughs: ['Meer zelfvertrouwen', 'Betere gesprekken'],
      firstWeekFocus: 'We beginnen met de basis: wie ben jij en wat zoek je?',
    },
    confidenceScore: 50,
    processingTimeMs,
    cached: false,
  };
}

// =====================================================
// OPENROUTER HELPER
// =====================================================

async function callOpenRouter(
  systemPrompt: string,
  userPrompt: string,
  options: { stream?: boolean } = {}
): Promise<Response> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }

  return fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_BASE_URL || 'https://datingassistent.nl',
      'X-Title': 'DatingAssistent',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODELS.CLAUDE_35_SONNET,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 2500,
      temperature: 0.7,
      stream: options.stream || false,
    }),
  });
}

// =====================================================
// MAIN ANALYSIS FUNCTIONS
// =====================================================

/**
 * Generate snapshot analysis (non-streaming)
 */
export async function generateSnapshotAnalysis(
  answers: SnapshotAnswers,
  scores: SnapshotScores,
  userId: number
): Promise<SnapshotAIAnalysis> {
  // Check cache first
  const cached = await getCachedAnalysis(userId, answers);
  if (cached) {
    return { ...cached, cached: true };
  }

  const startTime = Date.now();
  const prompt = buildAnalysisPrompt(answers, scores);
  const systemPrompt = 'Je bent een expert AI dating coach. Genereer ALLEEN valid JSON output. Geen markdown code blocks, geen tekst ervoor of erna, alleen pure JSON.';

  try {
    const response = await callOpenRouter(systemPrompt, prompt);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    const analysis = parseAnalysisResponse(text, answers, scores, userId, Date.now() - startTime);

    // Cache the result
    await cacheAnalysis(userId, answers, analysis);

    return analysis;
  } catch (error) {
    console.error('Error generating analysis:', error);
    return createFallbackAnalysis(answers, scores, userId, Date.now() - startTime);
  }
}

/**
 * Stream snapshot analysis with progress updates
 */
export async function* streamSnapshotAnalysis(
  answers: SnapshotAnswers,
  scores: SnapshotScores,
  userId: number
): AsyncGenerator<AnalysisStreamChunk, void, unknown> {
  const startTime = Date.now();

  // Check cache first
  const cached = await getCachedAnalysis(userId, answers);
  if (cached) {
    yield { type: 'cached', data: { ...cached, cached: true } };
    return;
  }

  yield { type: 'start', message: 'Iris analyseert je antwoorden...' };
  yield { type: 'phase', phase: 'connecting', progress: 5 };

  // Check if OpenRouter API key is configured
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn('OPENROUTER_API_KEY not configured, using fallback analysis');
    yield { type: 'phase', phase: 'analyzing', progress: 30 };
    yield { type: 'phase', phase: 'correlating', progress: 60 };
    yield { type: 'phase', phase: 'personalizing', progress: 90 };

    // Return fallback analysis
    const fallbackAnalysis = createFallbackAnalysis(answers, scores, userId, Date.now() - startTime);
    yield { type: 'phase', phase: 'complete', progress: 100 };
    yield { type: 'complete', data: fallbackAnalysis };
    return;
  }

  const prompt = buildAnalysisPrompt(answers, scores);
  const systemPrompt = 'Je bent een expert AI dating coach. Genereer ALLEEN valid JSON output. Geen markdown code blocks, alleen pure JSON.';

  try {
    yield { type: 'phase', phase: 'analyzing', progress: 15 };

    const response = await callOpenRouter(systemPrompt, prompt, { stream: true });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter streaming error:', response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No reader available for streaming');
    }

    const decoder = new TextDecoder();
    let fullResponse = '';
    let chunkCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6));
            const content = data.choices?.[0]?.delta?.content;

            if (content) {
              fullResponse += content;
              chunkCount++;

              // Update progress based on chunks
              const progress = Math.min(15 + chunkCount * 2, 85);
              const phase =
                progress < 35 ? 'analyzing' : progress < 60 ? 'correlating' : 'personalizing';

              if (chunkCount % 5 === 0) {
                yield { type: 'phase', phase, progress };
              }
            }
          } catch {
            // Ignore parse errors for incomplete chunks
          }
        }
      }
    }

    yield { type: 'phase', phase: 'personalizing', progress: 90 };

    const analysis = parseAnalysisResponse(
      fullResponse,
      answers,
      scores,
      userId,
      Date.now() - startTime
    );

    // Cache the result
    await cacheAnalysis(userId, answers, analysis);

    yield { type: 'phase', phase: 'complete', progress: 100 };
    yield { type: 'complete', data: analysis };
  } catch (error) {
    console.error('Error in streaming analysis:', error);

    // On any error, return fallback analysis instead of failing
    console.log('Returning fallback analysis due to error');
    const fallbackAnalysis = createFallbackAnalysis(answers, scores, userId, Date.now() - startTime);
    yield { type: 'phase', phase: 'complete', progress: 100 };
    yield { type: 'complete', data: fallbackAnalysis };
  }
}
