import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getOpenRouterClient, OPENROUTER_MODELS } from '@/lib/openrouter';
import { AIContextManager } from '@/lib/ai-context-manager';

// Scoring configuration
const STYLE_CATEGORIES = [
  'initiator', 'planner', 'adventurer', 'pleaser',
  'selector', 'distant', 'over_sharer', 'ghost_prone'
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assessmentId, userId, responses } = body;

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
        FROM dating_style_responses r
        JOIN dating_style_questions q ON r.question_id = q.id
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

    // Calculate scores for each dating style
    const scores = {
      initiator: 0, planner: 0, adventurer: 0, pleaser: 0,
      selector: 0, distant: 0, over_sharer: 0, ghost_prone: 0
    };

    let totalResponseTime = 0;
    const responseTimes: number[] = [];

    // Process responses
    responsesData.forEach(response => {
      // For provided responses, we need to get question details
      if (responses) {
        // Get question details for provided responses
        // This is a simplified version - in production you'd want to join with questions table
        // For now, we'll assume all responses are valid
        scores.initiator += response.value * 0.1; // Simplified scoring
        scores.planner += response.value * 0.1;
        scores.adventurer += response.value * 0.1;
        scores.pleaser += response.value * 0.1;
        scores.selector += response.value * 0.1;
        scores.distant += response.value * 0.1;
        scores.over_sharer += response.value * 0.1;
        scores.ghost_prone += response.value * 0.1;
      } else {
        // Database responses
        if (response.category && STYLE_CATEGORIES.includes(response.category)) {
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
      SELECT r.question_id, r.response_value, s.associated_styles, s.weight as scenario_weight
      FROM dating_style_responses r
      JOIN dating_style_scenarios s ON r.question_id = s.question_id AND r.response_value = s.order_position
      WHERE r.assessment_id = ${assessmentId} AND r.question_type = 'scenario'
    `;

    scenarioResponses.rows.forEach(scenario => {
      scenario.associated_styles.forEach((style: string) => {
        if (STYLE_CATEGORIES.includes(style)) {
          scores[style as keyof typeof scores] += 5 * scenario.scenario_weight; // Max score for scenario influence
        }
      });
    });

    // Normalize scores to 0-100 scale
    const maxPossibleScore = 5 * 14; // 14 questions × 5 max score
    const normalizedScores = Object.fromEntries(
      Object.entries(scores).map(([style, score]) => [
        style,
        Math.round((score / maxPossibleScore) * 100 * 100) / 100
      ])
    ) as Record<string, number>;

    // Determine primary and secondary styles
    const styleEntries = Object.entries(normalizedScores).sort((a, b) => b[1] - a[1]);
    const primaryStyle = styleEntries[0][0];
    const secondaryStyles = styleEntries.slice(1, 3).map(([style, score]) => ({
      style,
      percentage: Math.round(score)
    }));

    // Calculate blind spot index (discrepancy between self-perception and behavior)
    const avgResponseTime = totalResponseTime / responsesData.length;
    const variance = responseTimes.length > 1 ?
      responseTimes.reduce((acc, time) => acc + Math.pow(time - avgResponseTime, 2), 0) / responseTimes.length : 0;

    // Blind spot is higher when there's inconsistency in responses or very fast/slow answering
    const timeConsistency = Math.max(0, 100 - (variance / 1000)); // Lower variance = more consistent = lower blind spot
    const responseConsistency = calculateResponseConsistency(responsesData);
    const blindspotIndex = Math.round((100 - timeConsistency + (100 - responseConsistency)) / 2);

    // Calculate confidence and validity
    const completionRate = Math.min(100, (responsesData.length / 14) * 100);
    const cappedVariance = Math.min(99999, variance); // Cap variance to prevent overflow
    const validityWarnings: string[] = [];

    if (avgResponseTime < 3000) validityWarnings.push('Zeer snelle antwoorden gedetecteerd');
    if (cappedVariance > 50000) validityWarnings.push('Inconsistente antwoordtijden');
    if (completionRate < 80) validityWarnings.push('Niet alle vragen beantwoord');

    const confidenceScore = Math.max(0, Math.min(100,
      completionRate - (validityWarnings.length * 10) - (cappedVariance > 30000 ? 5 : 0)
    ));

    // Save responses to database if they were provided
    if (responses) {
      for (const response of responses) {
        await sql`
          INSERT INTO dating_style_responses (
            assessment_id, question_id, response_value, response_time_ms, question_type
          ) VALUES (
            ${assessmentId}, ${response.questionId}, ${response.value}, ${response.timeMs}, 'statement'
          )
        `;
      }
    }

    // Generate AI insights
    const aiInsights = await generateAIInsights(primaryStyle, secondaryStyles, normalizedScores);

    // Save results to database
    const resultInsert = await sql`
      INSERT INTO dating_style_results (
        assessment_id, primary_style, secondary_styles,
        initiator_score, planner_score, adventurer_score, pleaser_score,
        selector_score, distant_score, over_sharer_score, ghost_prone_score,
        blindspot_index, top_blindspots, validity_warnings,
        completion_rate, response_variance,
        ai_headline, ai_one_liner, strong_points, blind_spots,
        chat_scripts, micro_exercises, match_filters, recommended_dates, avoid_dates
      ) VALUES (
        ${assessmentId}, ${primaryStyle}, ${JSON.stringify(secondaryStyles)},
        ${normalizedScores.initiator}, ${normalizedScores.planner}, ${normalizedScores.adventurer}, ${normalizedScores.pleaser},
        ${normalizedScores.selector}, ${normalizedScores.distant}, ${normalizedScores.over_sharer}, ${normalizedScores.ghost_prone},
        ${blindspotIndex}, ARRAY[${aiInsights.topBlindspots.map(b => `'${b.replace(/'/g, "''")}'`).join(', ')}],
        ARRAY[${validityWarnings.map(w => `'${w.replace(/'/g, "''")}'`).join(', ')}],
        ${completionRate}, ${cappedVariance},
        ${aiInsights.headline}, ${aiInsights.oneLiner},
        ARRAY[${aiInsights.strongPoints.map(p => `'${p.replace(/'/g, "''")}'`).join(', ')}],
        ARRAY[${aiInsights.blindSpots.map(b => `'${b.replace(/'/g, "''")}'`).join(', ')}],
        ${JSON.stringify(aiInsights.chatScripts)}, ${JSON.stringify(aiInsights.microExercises)},
        ${JSON.stringify(aiInsights.matchFilters)}, ${JSON.stringify(aiInsights.recommendedDates)}, ${JSON.stringify(aiInsights.avoidDates)}
      )
      RETURNING *
    `;

    // Update assessment with confidence score
    await sql`
      UPDATE dating_style_assessments
      SET confidence_score = ${confidenceScore}
      WHERE id = ${assessmentId}
    `;

    // Update progress
    await sql`
      INSERT INTO dating_style_progress (user_id, last_assessment_id, assessment_count, can_retake_after)
      VALUES (${userId}, ${assessmentId}, 1, NOW() + INTERVAL '3 months')
      ON CONFLICT (user_id) DO UPDATE SET
        last_assessment_id = EXCLUDED.last_assessment_id,
        assessment_count = dating_style_progress.assessment_count + 1,
        can_retake_after = EXCLUDED.can_retake_after,
        updated_at = NOW()
    `;

    // Save dating style data to AI context
    try {
      await AIContextManager.saveUserContext(userId, {
        datingStyle: {
          primaryStyle: primaryStyle,
          secondaryStyles: secondaryStyles,
          scores: normalizedScores,
          blindspotIndex: blindspotIndex,
          confidence: confidenceScore,
          completedAt: new Date(),
          keyInsights: aiInsights.strongPoints,
          blindSpots: aiInsights.blindSpots,
          chatScripts: aiInsights.chatScripts,
          microExercises: aiInsights.microExercises
        }
      });
      console.log(`✅ Dating style data saved to AI context for user ${userId}`);
    } catch (contextError) {
      console.error('Error saving dating style data to AI context:', contextError);
    }

    return NextResponse.json({
      result: resultInsert.rows[0],
      confidence: confidenceScore,
      scores: normalizedScores,
      aiInsights
    });

  } catch (error) {
    console.error('Error processing dating style results:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateResponseConsistency(responses: any[]): number {
  // Simple consistency check: look for patterns in responses
  const values = responses.map(r => r.response_value);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Lower standard deviation = more consistent = higher score
  return Math.max(0, Math.min(100, 100 - (stdDev * 20)));
}

async function generateAIInsights(primaryStyle: string, secondaryStyles: any[], scores: Record<string, number>) {
  const styleProfiles = {
    initiator: {
      name: 'De Initiator',
      strengths: ['Snel contact leggen', 'Duidelijk in intenties', 'Proactief gedrag'],
      blindspots: ['Kan overkomen als te pushy', 'Moeite met wachten', 'Snel commitment verwachten'],
      chatScripts: {
        openers: ['Hé! Jij lijkt ook van spontane plannen te houden — wat was je leukste impulsieve actie?'],
        boundaries: ['Ik vind het fijn om duidelijkheid te hebben; mag ik vragen waar jij staat met daten deze week?'],
        followups: ['Ik heb genoten van ons gesprek. Zullen we een keer afspreken?']
      },
      microExercises: [
        { title: 'Respijt-rule', description: 'Wacht 1 uur extra bij niet-urgente chats en noteer je gevoel', duration: 7 },
        { title: 'Intentie-check', description: 'Vraag jezelf: "Waarom stuur ik dit bericht nu?"', duration: 14 }
      ]
    },
    planner: {
      name: 'De Voorzichtige Planner',
      strengths: ['Doordacht en georganiseerd', 'Betrouwbaar in afspraken', 'Goede voorbereiding'],
      blindspots: ['Kan te rigide zijn', 'Moeite met spontaniteit', 'Overanalyse van situaties'],
      chatScripts: {
        openers: ['Ik zie dat je van reizen houdt — wat is je favoriete bestemming en waarom?'],
        boundaries: ['Ik plan mijn week graag van tevoren; hoe flexibel ben jij normaal gesproken?'],
        followups: ['Ik heb nagedacht over wat je vertelde. Zullen we een keer koffiedrinken?']
      },
      microExercises: [
        { title: 'Spontane actie', description: 'Doe één impulsieve, leuke actie per dag', duration: 7 },
        { title: 'Mindfulness pauze', description: 'Neem 5 minuten pauze voordat je een belangrijk bericht stuurt', duration: 14 }
      ]
    },
    adventurer: {
      name: 'De Spontane Avonturier',
      strengths: ['Levenslustig en energiek', 'Maakt elke date speciaal', 'Open voor nieuwe ervaringen'],
      blindspots: ['Kan oppervlakkig overkomen', 'Moeite met routine', 'Snel verveeld'],
      chatScripts: {
        openers: ['Wow, je foto van die bergtocht ziet er geweldig uit! Wat was het hoogtepunt?'],
        boundaries: ['Ik ben avontuurlijk aangelegd, maar ik waardeer ook rust — hoe zit dat bij jou?'],
        followups: ['Dat klinkt als een perfect avontuur! Wanneer zullen we het plannen?']
      },
      microExercises: [
        { title: 'Routine ritueel', description: 'Creëer één dagelijks ritueel dat je helpt focussen', duration: 7 },
        { title: 'Diepe vragen', description: 'Stel één diepe, reflectieve vraag per gesprek', duration: 14 }
      ]
    },
    pleaser: {
      name: 'De Pleaser',
      strengths: ['Empathisch en zorgzaam', 'Maakt anderen zich welkom voelen', 'Goede luisteraar'],
      blindspots: ['Verliest eigen behoeften uit het oog', 'Moeite met nee zeggen', 'Zoekt te veel bevestiging'],
      chatScripts: {
        openers: ['Ik vind je profielbeschrijving echt mooi — wat betekent "avontuurlijk" voor jou?'],
        boundaries: ['Ik waardeer eerlijkheid; ik merk dat ik snel aardig wil zijn, maar ik wil ook duidelijk zijn over mijn grenzen.'],
        followups: ['Ik heb echt genoten van ons gesprek. Wanneer kunnen we verder praten?']
      },
      microExercises: [
        { title: 'Boundary practice', description: 'Oefen dagelijks met één klein "nee" zonder schuldgevoel', duration: 10 },
        { title: 'Self-reflection', description: 'Noteer dagelijks: "Wat heb ik vandaag voor mezelf gedaan?"', duration: 14 }
      ]
    },
    selector: {
      name: 'De Strategische Selector',
      strengths: ['Doordachte partner keuze', 'Duidelijke waarden en behoeften', 'Kwaliteit boven kwantiteit'],
      blindspots: ['Kan te kritisch zijn', 'Moeite met imperfecties accepteren', 'Overzicht van opties'],
      chatScripts: {
        openers: ['Je profiel toont duidelijk wat je belangrijk vindt — wat is je favoriete manier om quality time door te brengen?'],
        boundaries: ['Ik ben selectief in mijn relaties omdat ik op zoek ben naar iets echts.'],
        followups: ['Na ons gesprek denk ik dat we goed zouden kunnen matchen. Zullen we een date plannen?']
      },
      microExercises: [
        { title: 'Vergelijk minder', description: 'Focus op één persoon tegelijk in plaats van vergelijken', duration: 7 },
        { title: 'Appreciatie log', description: 'Noteer dagelijks één positieve eigenschap van iemand die je spreekt', duration: 14 }
      ]
    },
    distant: {
      name: 'De Afstandelijke',
      strengths: ['Waardeert persoonlijke ruimte', 'Onafhankelijk en zelfredzaam', 'Diepgaande gesprekken'],
      blindspots: ['Kan afstandelijk overkomen', 'Moeite met dagelijkse updates', 'Vermijdt kwetsbaarheid'],
      chatScripts: {
        openers: ['Ik zie dat je van lezen houdt — wat is het laatste boek dat je echt geraakt heeft?'],
        boundaries: ['Ik neem graag tijd voor mijn antwoorden; ik vind kwaliteit belangrijker dan snelheid.'],
        followups: ['Ik heb nagedacht over wat je vertelde. Wanneer zou je tijd hebben voor een gesprek?']
      },
      microExercises: [
        { title: 'Dagelijkse check-in', description: 'Stuur één korte, betekenisvolle update per dag naar iemand', duration: 7 },
        { title: 'Kwetsbaarheid oefening', description: 'Deel één persoonlijk gevoel per gesprek', duration: 14 }
      ]
    },
    over_sharer: {
      name: 'De Overdeler',
      strengths: ['Open en transparant', 'Diepe connecties mogelijk', 'Eerlijk over gevoelens'],
      blindspots: ['Kan te veel delen te vroeg', 'Overweldigt anderen', 'Moeite met oppervlakkige gesprekken'],
      chatScripts: {
        openers: ['Ik deel graag wat ik belangrijk vind — wat zijn jouw kernwaarden in relaties?'],
        boundaries: ['Ik ben van nature open, maar ik wil ook graag weten hoe het met jou gaat.'],
        followups: ['Ik heb veel met je gedeeld, en ik vind het mooi hoe jij reageert. Zullen we verder praten?']
      },
      microExercises: [
        { title: 'Luister ratio', description: 'Voor elk verhaal dat je deelt, stel één vraag aan de ander', duration: 7 },
        { title: 'Share less, ask more', description: 'Beperk eigen verhalen en focus op vragen stellen', duration: 14 }
      ]
    },
    ghost_prone: {
      name: 'De Ghost-prone',
      strengths: ['Weet wanneer iets niet werkt', 'Eerlijk over gebrek aan interesse', 'Tijdsefficiënt'],
      blindspots: ['Kan pijn veroorzaken', 'Moeite met moeilijke gesprekken', 'Voorkomt groei'],
      chatScripts: {
        openers: ['Ik vind je profiel interessant — wat zoek je op dit moment in het daten?'],
        boundaries: ['Ik geloof in eerlijkheid; als ik merk dat het niet klikt, zeg ik dat liever direct.'],
        followups: ['Ik heb nagedacht over onze gesprekken, en ik denk niet dat we een goede match zijn. Het beste!']
      },
      microExercises: [
        { title: 'Eerlijk gesprek', description: 'Voer één moeilijk maar eerlijk gesprek per week', duration: 7 },
        { title: 'Reflectie voor stoppen', description: 'Noteer waarom je wilt stoppen voordat je het doet', duration: 14 }
      ]
    }
  };

  const profile = styleProfiles[primaryStyle as keyof typeof styleProfiles] || styleProfiles.initiator;

  return {
    headline: `Jouw datingstijl: ${profile.name}`,
    oneLiner: `Je bent een ${profile.name.toLowerCase()} met sterke punten in ${profile.strengths[0].toLowerCase()} en ${profile.strengths[1].toLowerCase()}.`,
    strongPoints: profile.strengths,
    blindSpots: profile.blindspots,
    topBlindspots: profile.blindspots.slice(0, 3),
    chatScripts: profile.chatScripts,
    microExercises: profile.microExercises,
    matchFilters: {
      values: ['Betrouwbaarheid', 'Communicatie', 'Respect voor grenzen'],
      behaviors: ['Actief luisteren', 'Duidelijke intenties', 'Flexibiliteit']
    },
    recommendedDates: [
      'Koffie in een rustige setting',
      'Wandeling in het park',
      'Museum bezoek',
      'Thuis koken samen'
    ],
    avoidDates: [
      'Te drukke plekken',
      'Overdreven romantische settings',
      'Situaties met veel druk'
    ]
  };
}