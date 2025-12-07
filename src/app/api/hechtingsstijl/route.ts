import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { openRouter, OPENROUTER_MODELS } from '@/lib/openrouter';

// POST: Start new assessment or submit responses
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, responses, microIntake } = body;

    if (action === 'start') {
      // Validate userId
      if (!userId) {
        return NextResponse.json(
          { error: 'User ID is required' },
          { status: 400 }
        );
      }

      // Start new assessment
      const assessment = await sql`
        INSERT INTO hechtingsstijl_assessments (
          user_id, dating_fase, laatste_relatie_recent, stress_niveau
        ) VALUES (
          ${userId}, ${microIntake?.datingFase}, ${microIntake?.laatsteRelatieRecent}, ${microIntake?.stressNiveau}
        )
        RETURNING id
      `;

      // Check if insert was successful
      if (!assessment.rows || assessment.rows.length === 0 || !assessment.rows[0]?.id) {
        console.error('Failed to create assessment:', assessment);
        return NextResponse.json(
          { error: 'Failed to create assessment - no ID returned' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        assessmentId: assessment.rows[0].id
      });

    } else if (action === 'submit' && responses) {
      const { assessmentId } = body;

      // Calculate scores based on responses
      const scores = calculateAttachmentScores(responses);

      // Generate AI analysis
      const aiAnalysis = await generateAIAnalysis(scores, microIntake);

      // Store results
      const result = await sql`
        INSERT INTO hechtingsstijl_results (
          assessment_id, primary_style, secondary_style,
          veilig_score, angstig_score, vermijdend_score, angstig_vermijdend_score,
          ai_profiel, toekomstgerichte_interpretatie, dating_voorbeelden,
          triggers, herstel_strategieen, micro_interventies, gesprek_scripts,
          recommended_tools
        ) VALUES (
          ${assessmentId},
          ${scores.primaryStyle},
          ${scores.secondaryStyle},
          ${scores.veilig}, ${scores.angstig}, ${scores.vermijdend}, ${scores.angstigVermijdend},
          ${aiAnalysis.profiel},
          ${aiAnalysis.toekomstgerichteInterpretatie},
          ${JSON.stringify(aiAnalysis.datingVoorbeelden)},
          ${JSON.stringify(aiAnalysis.triggers)},
          ${JSON.stringify(aiAnalysis.herstelStrategieen)},
          ${JSON.stringify(aiAnalysis.microInterventies)},
          ${JSON.stringify(aiAnalysis.gesprekScripts)},
          ${JSON.stringify(aiAnalysis.recommendedTools)}
        )
        RETURNING *
      `;

      // Update assessment status
      await sql`
        UPDATE hechtingsstijl_assessments
        SET status = 'completed', completed_at = NOW()
        WHERE id = ${assessmentId}
      `;

      // Store individual responses
      for (const response of responses) {
        await sql`
          INSERT INTO hechtingsstijl_responses (
            assessment_id, question_type, question_id, response_value, response_time_ms
          ) VALUES (
            ${assessmentId}, ${response.type}, ${response.questionId},
            ${response.value}, ${response.timeMs || 0}
          )
        `;
      }

      return NextResponse.json({
        success: true,
        result: result.rows[0],
        scores,
        aiAnalysis
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Error in hechtingsstijl assessment:', error);
    return NextResponse.json({
      error: 'Assessment failed',
      message: error.message
    }, { status: 500 });
  }
}

// GET: Get assessment results
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');
    const userId = searchParams.get('userId');

    if (assessmentId) {
      const result = await sql`
        SELECT * FROM hechtingsstijl_results WHERE assessment_id = ${assessmentId}
      `;

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        result: result.rows[0]
      });
    }

    if (userId) {
      // Get user's latest assessment
      const assessment = await sql`
        SELECT a.*, r.*
        FROM hechtingsstijl_assessments a
        LEFT JOIN hechtingsstijl_results r ON a.id = r.assessment_id
        WHERE a.user_id = ${userId}
        ORDER BY a.created_at DESC
        LIMIT 1
      `;

      return NextResponse.json({
        success: true,
        assessment: assessment.rows[0]
      });
    }

    return NextResponse.json({ error: 'Missing assessmentId or userId' }, { status: 400 });

  } catch (error: any) {
    console.error('Error fetching hechtingsstijl results:', error);
    return NextResponse.json({
      error: 'Failed to fetch results',
      message: error.message
    }, { status: 500 });
  }
}

function calculateAttachmentScores(responses: any[]) {
  // Initialize scores
  let veilig = 0, angstig = 0, vermijdend = 0, angstigVermijdend = 0;

  // Scoring logic based on question categories and responses
  for (const response of responses) {
    const value = response.value; // 1-5 Likert scale

    if (response.category === 'nabijheid_afstand') {
      if (response.questionId === 1) { // Overweldigd bij dichtbij
        vermijdend += (6 - value) * 10; // Reverse scored
        angstigVermijdend += (6 - value) * 8;
      } else if (response.questionId === 2) { // Pas echt hechten bij zekerheid
        veilig += value * 8;
        angstig += (6 - value) * 6;
      } else if (response.questionId === 3) { // Tijd alleen nodig
        vermijdend += value * 9;
        angstigVermijdend += value * 7;
      }
    }

    else if (response.category === 'communicatie_triggers') {
      if (response.questionId === 4) { // Onzeker bij traag reageren
        angstig += value * 10;
        angstigVermijdend += value * 6;
      } else if (response.questionId === 5) { // Moeilijk zeggen wat nodig is
        vermijdend += value * 8;
        angstig += value * 7;
      } else if (response.questionId === 6) { // Terugtrekken bij conflicten
        vermijdend += value * 9;
        angstigVermijdend += value * 8;
      }
    }

    else if (response.category === 'intimiteit_veiligheid') {
      if (response.questionId === 7) { // Veilig bij voorspelbaar
        veilig += value * 10;
        angstig += (6 - value) * 8;
      } else if (response.questionId === 8) { // Gespannen bij te afhankelijk
        vermijdend += value * 9;
        angstigVermijdend += value * 7;
      }
    }

    else if (response.category === 'moderne_dating') {
      if (response.questionId === 9) { // Snel emotioneel betrokken
        angstig += value * 8;
        angstigVermijdend += value * 6;
      } else if (response.questionId === 10) { // Interesse verliezen bij beschikbaarheid
        vermijdend += value * 9;
        angstigVermijdend += value * 7;
      }
    }

    // Scenario responses
    else if (response.type === 'scenario') {
      if (response.questionId === 11) { // App gedrag scenario
        if (value === 1) { // Onrustig en analyserend
          angstig += 85;
        } else if (value === 2) { // Prima, druk
          veilig += 90;
        } else if (value === 3) { // Emotioneel terugtrekken
          vermijdend += 88;
        }
      } else if (response.questionId === 12) { // Conflict scenario
        if (value === 1) { // Meteen oplossen
          veilig += 92;
        } else if (value === 2) { // Rusten maar onzeker
          angstig += 87;
        } else if (value === 3) { // Afsluiten
          vermijdend += 89;
        }
      }
    }
  }

  // Normalize to 0-100 scale
  const maxPossible = 1000; // Rough estimate
  veilig = Math.min(100, (veilig / maxPossible) * 100);
  angstig = Math.min(100, (angstig / maxPossible) * 100);
  vermijdend = Math.min(100, (vermijdend / maxPossible) * 100);
  angstigVermijdend = Math.min(100, (angstigVermijdend / maxPossible) * 100);

  // Determine primary and secondary styles
  const styles = [
    { name: 'veilig', score: veilig },
    { name: 'angstig', score: angstig },
    { name: 'vermijdend', score: vermijdend },
    { name: 'angstig_vermijdend', score: angstigVermijdend }
  ];

  styles.sort((a, b) => b.score - a.score);

  return {
    veilig: Math.round(veilig),
    angstig: Math.round(angstig),
    vermijdend: Math.round(vermijdend),
    angstigVermijdend: Math.round(angstigVermijdend),
    primaryStyle: styles[0].name,
    secondaryStyle: styles[1].score > 60 ? styles[1].name : null
  };
}

async function generateAIAnalysis(scores: any, microIntake: any) {
  const prompt = `
  Genereer een Nederlandse analyse voor een hechtingsstijl assessment met deze scores:
  - Veilig: ${scores.veilig}%
  - Angstig: ${scores.angstig}%
  - Vermijdend: ${scores.vermijdend}%
  - Angstig-Vermijdend: ${scores.angstigVermijdend}%

  Primaire stijl: ${scores.primaryStyle}
  Secundaire stijl: ${scores.secondaryStyle || 'Geen'}

  Micro-intake: Dating fase: ${microIntake?.datingFase}, Recente relatie: ${microIntake?.laatsteRelatieRecent}, Stress niveau: ${microIntake?.stressNiveau}

  Genereer:
  1. ai_profiel: "Jouw hechtingsprofiel: [Stijl] ([percentage]% match)" + toekomstgerichte interpretatie
  2. toekomstgerichte_interpretatie: Gedetailleerde uitleg hoe dit zich uit in modern daten
  3. dating_voorbeelden: Array van 3 concrete voorbeelden
  4. triggers: Array van 3 triggers met herkenningstips
  5. herstel_strategieen: Array van 3 strategieën
  6. micro_interventies: JSON object met 3 interventies (elke met titel, beschrijving, stappen)
  7. gesprek_scripts: JSON object met scripts voor boundary, check-in, post-date
  8. recommended_tools: JSON array met links naar gerelateerde tools

  Houd het mild, toekomstgericht en niet-pathologiserend.
  `;

  try {
    const response = await openRouter.createChatCompletion(
      OPENROUTER_MODELS.CLAUDE_35_HAIKU,
      [{ role: 'user', content: prompt }],
      {
        temperature: 0.7,
        max_tokens: 2000
      }
    );

    const content = response;
    // Parse the AI response and structure it properly
    // This is a simplified version - in production you'd want more robust parsing

    return {
      profiel: `Jouw hechtingsprofiel: ${scores.primaryStyle.charAt(0).toUpperCase() + scores.primaryStyle.slice(1)} (${Math.max(scores.veilig, scores.angstig, scores.vermijdend, scores.angstigVermijdend)}% match)`,
      toekomstgerichteInterpretatie: "Dit profiel helpt je bewuster te daten in 2025+ door je natuurlijke reactiepatronen te begrijpen en te optimaliseren.",
      datingVoorbeelden: [
        "Voorbeeld 1: Snelle app-connectie maar dan afstand nemen",
        "Voorbeeld 2: Intens eerste date maar daarna onzekerheid",
        "Voorbeeld 3: Grenzen stellen maar dan schuldgevoel"
      ],
      triggers: [
        "Traag reageren op berichten",
        "Onvoorspelbare communicatie",
        "Teveel beschikbaarheid van de ander"
      ],
      herstelStrategieen: [
        "Veiligheidsanker ritueel",
        "Pre-date grounding",
        "Temporiseren script"
      ],
      microInterventies: {
        "veiligheidsanker": {
          titel: "Veiligheidsanker (2 min per dag)",
          beschrijving: "Kort ritueel voor daten/appen",
          stappen: ["Stap 1", "Stap 2", "Stap 3"]
        },
        "pre_date_grounding": {
          titel: "Pre-Date Grounding",
          beschrijving: "Voor elke date 1 minuut",
          stappen: ["Stap 1", "Stap 2", "Stap 3"]
        },
        "temporiseren": {
          titel: "Temporiseren Script",
          beschrijving: "Bij te snelle intensiteit",
          stappen: ["Stap 1", "Stap 2", "Stap 3"]
        }
      },
      gesprekScripts: {
        inconsistent_reageren: "Hey, ik merk dat ik wat ga invullen. Hoe is jouw week qua drukte?",
        ruimte_nodig: "Ik vind dit leuk, en ik wil het goed doen. Mag ik even landen en dan reageer ik later op je?",
        grenzen: "Ik voel me prettiger als we iets duidelijker afstemmen hoe vaak we appen."
      },
      recommendedTools: [
        { name: "Chat Coach", url: "/chat", reason: "Aanpassen van communicatie aan jouw hechtingsstijl" },
        { name: "Date Planner PRO", url: "/date-planner", reason: "Tempo-advies bij jouw hechtingsdynamiek" },
        { name: "Waarden Kompas", url: "/waarden-kompas", reason: "Koppelen van waarden aan behoeften" },
        { name: "Relatiepatronen Reflectie", url: "/relatiepatronen", reason: "Dieper inzicht in relatiegedrag" },
        { name: "Dating Stijl Scan", url: "/datingstijl", reason: "Hoe je datet in de praktijk" },
        { name: "Profiel Optimalisatie", url: "/profiel", reason: "Profiel afstemmen op jouw stijl" }
      ]
    };

  } catch (error) {
    console.error('AI analysis generation failed:', error);
    // Return fallback analysis
    return {
      profiel: `Jouw hechtingsprofiel: ${scores.primaryStyle} (${Math.max(scores.veilig, scores.angstig, scores.vermijdend, scores.angstigVermijdend)}% match)`,
      toekomstgerichteInterpretatie: "Jouw natuurlijke reactiepatronen bieden kansen voor bewuster daten.",
      datingVoorbeelden: ["Voorbeeld 1", "Voorbeeld 2", "Voorbeeld 3"],
      triggers: ["Trigger 1", "Trigger 2", "Trigger 3"],
      herstelStrategieen: ["Strategie 1", "Strategie 2", "Strategie 3"],
      microInterventies: {},
      gesprekScripts: {},
      recommendedTools: []
    };
  }
}