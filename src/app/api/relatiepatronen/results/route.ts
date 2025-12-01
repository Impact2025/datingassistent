import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getOpenRouterClient, OPENROUTER_MODELS } from '@/lib/openrouter';
import { AIContextManager } from '@/lib/ai-context-manager';

// Scoring configuration
const PATTERN_CATEGORIES = [
  'idealize', 'avoid_conflict', 'rebound', 'sabotage',
  'boundary_deficit', 'role_expectation', 'unavailable_preference', 'validation_seeking'
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assessmentId, userId, responses, timeline } = body;

    if (!assessmentId || !userId) {
      return NextResponse.json({ error: 'Assessment ID and User ID required' }, { status: 400 });
    }

    let responsesData;
    if (responses) {
      // Use provided responses
      responsesData = responses;
    } else {
      // Fallback: Get responses from database
      const responsesResult = await sql`
        SELECT r.question_id, r.response_value, r.response_time_ms, q.category, q.weight
        FROM relationship_patterns_responses r
        JOIN relationship_patterns_questions q ON r.question_id = q.id
        WHERE r.assessment_id = ${assessmentId}
        ORDER BY r.question_id
      `;

      if (responsesResult.rows.length === 0) {
        return NextResponse.json({ error: 'No responses found for this assessment' }, { status: 404 });
      }

      responsesData = responsesResult.rows.map(row => ({
        questionId: row.question_id,
        value: row.response_value,
        timeMs: row.response_time_ms,
        category: row.category,
        weight: row.weight
      }));
    }

    // Calculate scores for each relationship pattern
    const scores = {
      idealize: 0, avoid_conflict: 0, rebound: 0, sabotage: 0,
      boundary_deficit: 0, role_expectation: 0, unavailable_preference: 0, validation_seeking: 0
    };

    let totalResponseTime = 0;
    const responseTimes: number[] = [];

    // Process responses
    responsesData.forEach(response => {
      // For provided responses, we need to get question details
      if (responses) {
        // Simplified scoring for provided responses
        scores.idealize += response.value * 0.1;
        scores.avoid_conflict += response.value * 0.1;
        scores.rebound += response.value * 0.1;
        scores.sabotage += response.value * 0.1;
        scores.boundary_deficit += response.value * 0.1;
        scores.role_expectation += response.value * 0.1;
        scores.unavailable_preference += response.value * 0.1;
        scores.validation_seeking += response.value * 0.1;
      } else {
        // Database responses
        if (response.category && PATTERN_CATEGORIES.includes(response.category)) {
          scores[response.category as keyof typeof scores] += response.value * response.weight;
        }
      }

      if (response.timeMs) {
        totalResponseTime += response.timeMs;
        responseTimes.push(response.timeMs);
      }
    });

    // Get scenario responses and adjust scores
    const scenarioResponses = await sql`
      SELECT r.question_id, r.response_value, s.associated_patterns, s.weight as scenario_weight
      FROM relationship_patterns_responses r
      JOIN relationship_patterns_scenarios s ON r.question_id = s.question_id AND r.response_value = s.order_position
      WHERE r.assessment_id = ${assessmentId} AND r.question_type = 'scenario'
    `;

    scenarioResponses.rows.forEach(scenario => {
      scenario.associated_patterns.forEach((pattern: string) => {
        if (PATTERN_CATEGORIES.includes(pattern)) {
          scores[pattern as keyof typeof scores] += 5 * scenario.scenario_weight;
        }
      });
    });

    // Normalize scores to 0-100 scale
    const maxPossibleScore = 5 * 12; // 12 questions × 5 max score + scenario bonuses
    const normalizedScores = Object.fromEntries(
      Object.entries(scores).map(([pattern, score]) => [
        pattern,
        Math.round((score / maxPossibleScore) * 100 * 100) / 100
      ])
    ) as Record<string, number>;

    // Determine primary and secondary patterns
    const patternEntries = Object.entries(normalizedScores).sort((a, b) => b[1] - a[1]);
    const primaryPattern = patternEntries[0][0];
    const secondaryPatterns = patternEntries.slice(1, 3).map(([pattern, score]) => ({
      pattern,
      percentage: Math.round(score)
    }));

    // Calculate blind spot index
    const avgResponseTime = totalResponseTime / responsesData.length;
    const variance = responseTimes.length > 1 ?
      responseTimes.reduce((acc, time) => acc + Math.pow(time - avgResponseTime, 2), 0) / responseTimes.length : 0;

    const timeConsistency = Math.max(0, 100 - (variance / 1000));
    const responseConsistency = calculateResponseConsistency(responsesData);
    const blindspotIndex = Math.round((100 - timeConsistency + (100 - responseConsistency)) / 2);

    // Calculate confidence and validity
    const completionRate = Math.min(100, (responsesData.length / 14) * 100);
    const validityWarnings: string[] = [];

    if (avgResponseTime < 3000) validityWarnings.push('Zeer snelle antwoorden gedetecteerd');
    if (variance > 50000) validityWarnings.push('Inconsistente antwoordtijden');
    if (completionRate < 80) validityWarnings.push('Niet alle vragen beantwoord');

    const confidenceScore = Math.max(0, Math.min(100,
      completionRate - (validityWarnings.length * 10) - (variance > 30000 ? 5 : 0)
    ));

    // Save responses to database if they were provided
    if (responses) {
      for (const response of responses) {
        await sql`
          INSERT INTO relationship_patterns_responses (
            assessment_id, question_id, response_value, response_time_ms, question_type
          ) VALUES (
            ${assessmentId}, ${response.questionId}, ${response.value}, ${response.timeMs}, 'statement'
          )
        `;
      }
    }

    // Generate AI insights
    const aiInsights = await generateAIInsights(primaryPattern, secondaryPatterns, normalizedScores, timeline);

    // Save results to database
    const resultInsert = await sql`
      INSERT INTO relationship_patterns_results (
        assessment_id, primary_pattern, secondary_patterns,
        idealize_score, avoid_conflict_score, rebound_score, sabotage_score,
        boundary_deficit_score, role_expectation_score, unavailable_preference_score, validation_seeking_score,
        blindspot_index, top_blindspots, validity_warnings,
        completion_rate, response_variance, timeline_entries,
        ai_headline, ai_one_liner, pattern_examples, triggers,
        micro_interventions, conversation_scripts, stop_start_actions, recommended_tools
      ) VALUES (
        ${assessmentId}, ${primaryPattern}, ${JSON.stringify(secondaryPatterns)},
        ${normalizedScores.idealize}, ${normalizedScores.avoid_conflict}, ${normalizedScores.rebound}, ${normalizedScores.sabotage},
        ${normalizedScores.boundary_deficit}, ${normalizedScores.role_expectation}, ${normalizedScores.unavailable_preference}, ${normalizedScores.validation_seeking},
        ${blindspotIndex}, ARRAY[${aiInsights.topBlindspots.map(b => `'${b.replace(/'/g, "''")}'`).join(', ')}],
        ARRAY[${validityWarnings.map(w => `'${w.replace(/'/g, "''")}'`).join(', ')}],
        ${completionRate}, ${Math.min(99999, variance)}, ${timeline ? JSON.stringify(timeline) : null},
        ${aiInsights.headline}, ${aiInsights.oneLiner},
        ARRAY[${aiInsights.patternExamples.map(p => `'${p.replace(/'/g, "''")}'`).join(', ')}],
        ARRAY[${aiInsights.triggers.map(t => `'${t.replace(/'/g, "''")}'`).join(', ')}],
        ${JSON.stringify(aiInsights.microInterventions)}, ${JSON.stringify(aiInsights.conversationScripts)},
        ${JSON.stringify(aiInsights.stopStartActions)}, ${JSON.stringify(aiInsights.recommendedTools)}
      )
      RETURNING *
    `;

    // Update assessment with confidence score
    await sql`
      UPDATE relationship_patterns_assessments
      SET confidence_score = ${confidenceScore}, completed_at = NOW(), status = 'completed'
      WHERE id = ${assessmentId}
    `;

    // Update progress
    await sql`
      INSERT INTO relationship_patterns_progress (user_id, last_assessment_id, assessment_count, can_retake_after)
      VALUES (${userId}, ${assessmentId}, 1, NOW() + INTERVAL '3 months')
      ON CONFLICT (user_id) DO UPDATE SET
        last_assessment_id = EXCLUDED.last_assessment_id,
        assessment_count = relationship_patterns_progress.assessment_count + 1,
        can_retake_after = EXCLUDED.can_retake_after,
        updated_at = NOW()
    `;

    // Save relationship patterns data to AI context
    try {
      await AIContextManager.saveUserContext(userId, {
        relationshipPatterns: {
          primaryPattern: primaryPattern,
          secondaryPatterns: secondaryPatterns,
          scores: normalizedScores,
          blindspotIndex: blindspotIndex,
          confidence: confidenceScore,
          completedAt: new Date(),
          keyInsights: aiInsights.patternExamples,
          blindSpots: aiInsights.topBlindspots,
          microInterventions: aiInsights.microInterventions
        }
      });
      console.log(`✅ Relationship patterns data saved to AI context for user ${userId}`);
    } catch (contextError) {
      console.error('Error saving relationship patterns data to AI context:', contextError);
    }

    return NextResponse.json({
      result: resultInsert.rows[0],
      confidence: confidenceScore,
      scores: normalizedScores,
      aiInsights
    });

  } catch (error) {
    console.error('Error processing relationship patterns results:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateResponseConsistency(responses: any[]): number {
  const values = responses.map(r => r.value || r.response_value);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return Math.max(0, Math.min(100, 100 - (stdDev * 20)));
}

async function generateAIInsights(primaryPattern: string, secondaryPatterns: any[], scores: Record<string, number>, timeline?: any[]) {
  const patternProfiles = {
    idealize: {
      name: 'Idealiseringslus',
      examples: [
        'Je valt vaak op mensen die emotioneel inconsistent zijn',
        'Je ziet potentiële partners door een roze bril in het begin',
        'Je negeert rode vlaggen omdat je een verhaal hebt gecreëerd'
      ],
      triggers: [
        'Eenzaamheid - je zoekt snel verbinding',
        'Stress - je wilt afleiding van dagelijkse problemen',
        'Nieuwe ontmoetingen - je enthousiasme loopt weg met je'
      ],
      microInterventions: [
        {
          title: 'Realiteit-check lijst',
          description: 'Maak een lijst van 3 feiten, 1 gevoel, 1 vraag voordat je een date plant',
          duration: 7
        },
        {
          title: 'Pauze na enthousiasme',
          description: 'Wacht 24 uur na eerste klik voordat je verder plant',
          duration: 14
        },
        {
          title: 'Vrienden feedback',
          description: 'Deel je eerste indrukken met een vriend voor realistische input',
          duration: 10
        }
      ]
    },
    avoid_conflict: {
      name: 'Conflictvermijding',
      examples: [
        'Je lost problemen op door ze te negeren',
        'Je trekt je terug bij eerste tekenen van spanning',
        'Je zegt ja op alles om ruzie te voorkomen'
      ],
      triggers: [
        'Angst voor afwijzing - je wilt niet kwetsen of gekwetst worden',
        'Opvoeding - geleerd om conflicten te vermijden',
        'Uitputting - geen energie voor moeilijke gesprekken'
      ],
      microInterventions: [
        {
          title: 'Dagelijkse boundary oefening',
          description: 'Benader één klein ongemak per dag met: "Ik voel me hier ongemakkelijk bij"',
          duration: 7
        },
        {
          title: 'Conflict kalender',
          description: 'Plan één moeilijk gesprek per week in',
          duration: 14
        },
        {
          title: 'Emotie labeling',
          description: 'Noem dagelijks één gevoel dat je normaal vermijdt',
          duration: 10
        }
      ]
    },
    rebound: {
      name: 'Rebound Patroon',
      examples: [
        'Je springt van relatie naar relatie zonder verwerking',
        'Je gebruikt nieuwe dates om oude pijn te vergeten',
        'Je ziet nieuwe partners als oplossing voor eenzaamheid'
      ],
      triggers: [
        'Break-up pijn - je wilt snel herstellen',
        'Eenzaamheid - je vult het gat met nieuwe aandacht',
        'Angst alleen zijn - je vermijdt reflectie tijd'
      ],
      microInterventions: [
        {
          title: 'Reflectie verplichting',
          description: 'Neem 30 minuten per dag voor jezelf voordat je dating apps opent',
          duration: 14
        },
        {
          title: 'Kwaliteit over kwantiteit',
          description: 'Stel één diepe vraag per gesprek in plaats van oppervlakkig chatten',
          duration: 7
        },
        {
          title: 'Vertragingstechniek',
          description: 'Tel tot 10 voordat je op een profiel reageert',
          duration: 10
        }
      ]
    },
    sabotage: {
      name: 'Self-Sabotage',
      examples: [
        'Je drijft mensen weg wanneer het serieus wordt',
        'Je vindt altijd redenen om te stoppen',
        'Je test partners tot ze opgeven'
      ],
      triggers: [
        'Vulnerability angst - je beschermt jezelf tegen pijn',
        'Verlatingsangst - je stoot mensen af voordat zij jou kunnen verlaten',
        'Laag zelfbeeld - je gelooft niet dat je geluk verdient'
      ],
      microInterventions: [
        {
          title: 'Vulnerability oefening',
          description: 'Deel dagelijks één kwetsbaar gevoel met iemand vertrouwds',
          duration: 14
        },
        {
          title: 'Succes journaling',
          description: 'Noteer dagelijks één ding dat goed ging in je relaties',
          duration: 7
        },
        {
          title: 'Grenzen stellen',
          description: 'Oefen met één duidelijke grens per interactie',
          duration: 10
        }
      ]
    },
    boundary_deficit: {
      name: 'Boundary Deficit',
      examples: [
        'Je geeft altijd toe om aardig gevonden te worden',
        'Je past je volledig aan op wat de ander wil',
        'Je vergeet je eigen behoeften in relaties'
      ],
      triggers: [
        'Goedkeuringsdrang - je wilt aardig gevonden worden',
        'Angst voor conflicten - je vermijdt spanning',
        'Opvoeding - geleerd om anderen voorop te stellen'
      ],
      microInterventions: [
        {
          title: 'Eigen behoeften audit',
          description: 'Maak dagelijks lijst van 3 dingen die JIJ nodig hebt',
          duration: 7
        },
        {
          title: 'Nee oefening',
          description: 'Zeg dagelijks nee op één klein verzoek zonder schuldgevoel',
          duration: 14
        },
        {
          title: 'Self-advocacy script',
          description: 'Oefen: "Ik waardeer je mening, maar ik kies voor..."',
          duration: 10
        }
      ]
    },
    role_expectation: {
      name: 'Rol Verwachting',
      examples: [
        'Je kiest altijd dezelfde "type" partner',
        'Je valt op mensen die jou in een bepaalde rol plaatsen',
        'Je herhaalt dezelfde dynamieken keer op keer'
      ],
      triggers: [
        'Comfort zone - bekende patronen voelen veilig',
        'Opvoeding - geleerde relatie modellen',
        'Trauma bonding - vertrouwd met disfunctionele dynamieken'
      ],
      microInterventions: [
        {
          title: 'Rol reflectie',
          description: 'Analyseer welke rol je inneemt en welke je wilt innemen',
          duration: 7
        },
        {
          title: 'Nieuwe ervaringen',
          description: 'Probeer één nieuwe activiteit of gespreksonderwerp per week',
          duration: 14
        },
        {
          title: 'Waarden alignment',
          description: 'Check of partner bij je kernwaarden past voordat je investeert',
          duration: 10
        }
      ]
    },
    unavailable_preference: {
      name: 'Onbereikbaarheid Voorkeur',
      examples: [
        'Je valt op mensen die emotioneel niet beschikbaar zijn',
        'Je ziet uitdagingen als aantrekkelijk',
        'Je probeert mensen te "veranderen"'
      ],
      triggers: [
        'Afwijzingsangst - veilig om niet volledig beschikbaar te zijn',
        'Laag zelfbeeld - je denkt niet dat je normale liefde verdient',
        'Opvoeding - geleerd dat liefde hard werken is'
      ],
      microInterventions: [
        {
          title: 'Beschikbaarheid check',
          description: 'Vraag jezelf: "Is deze persoon echt beschikbaar voor een relatie?"',
          duration: 7
        },
        {
          title: 'Eigen beschikbaarheid',
          description: 'Focus eerst op eigen emotionele beschikbaarheid',
          duration: 14
        },
        {
          title: 'Gezonde relaties onderzoek',
          description: 'Lees één artikel per week over gezonde relatie dynamieken',
          duration: 10
        }
      ]
    },
    validation_seeking: {
      name: 'Validatie Zoeken',
      examples: [
        'Je gebruikt relaties om je waarde te bevestigen',
        'Je blijft in relaties die je zelfbeeld versterken',
        'Je hebt moeite met alleen zijn'
      ],
      triggers: [
        'Laag zelfbeeld - je hebt externe bevestiging nodig',
        'Trauma - geleerd dat je liefde moet verdienen',
        'Sociale druk - je wilt laten zien dat je succesvol bent'
      ],
      microInterventions: [
        {
          title: 'Self-validation oefening',
          description: 'Begin elke dag met 3 dingen die je in jezelf waardeert',
          duration: 14
        },
        {
          title: 'Alleen tijd ritual',
          description: 'Plan wekelijks quality time alleen met jezelf',
          duration: 7
        },
        {
          title: 'Interne motivatie check',
          description: 'Vraag jezelf: "Doe ik dit voor hen of voor mezelf?"',
          duration: 10
        }
      ]
    }
  };

  const profile = patternProfiles[primaryPattern as keyof typeof patternProfiles] || patternProfiles.idealize;

  return {
    headline: `Jouw relatiepatroon: ${profile.name}`,
    oneLiner: `Je hebt de neiging om ${profile.name.toLowerCase()} te herhalen in je relaties.`,
    patternExamples: profile.examples,
    triggers: profile.triggers,
    topBlindspots: profile.examples.slice(0, 3),
    microInterventions: profile.microInterventions,
    conversationScripts: {
      boundary: 'Ik waardeer eerlijkheid; ik merk dat ik soms mijn grenzen vergeet te stellen.',
      checkIn: 'Ik wil graag weten hoe jij hierover denkt voordat we verder gaan.',
      postDate: 'Ik heb nagedacht over ons gesprek en wil graag je perspectief horen.'
    },
    stopStartActions: {
      stop: [
        'Automatisch idealiseren in het begin',
        'Problemen negeren om conflicten te vermijden',
        'Te snel persoonlijke informatie delen'
      ],
      start: [
        'Realiteit checks doen voordat je investeert',
        'Grenzen duidelijk communiceren',
        'Tijd nemen voor reflectie tussen dates'
      ]
    },
    recommendedTools: [
      { name: 'Hechtingsstijl QuickScan', url: '/hechtingsstijl', reason: 'Begrijp je gehechtheidsstijl' },
      { name: 'Emotionele Reset', url: '/dashboard?tab=leren-ontwikkelen', reason: 'Verwerk emotionele patronen' },
      { name: 'Chat Coach', url: '/dashboard?tab=communicatie-matching', reason: 'Verbeter communicatie' },
      { name: 'Profiel Coach', url: '/dashboard?tab=profiel-persoonlijkheid', reason: 'Optimaliseer je profiel' }
    ]
  };
}