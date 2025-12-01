import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getOpenRouterClient, OPENROUTER_MODELS } from '@/lib/openrouter';

// POST: Start new assessment or submit responses
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, responses, microIntake } = body;

    if (action === 'start') {
      // Start new assessment
      const assessment = await sql`
        INSERT INTO emotionele_readiness_assessments (
          user_id, laatste_relatie, emotioneel_herstel, stress_niveau
        ) VALUES (
          ${userId}, ${microIntake?.laatsteRelatie}, ${microIntake?.emotioneelHerstel}, ${microIntake?.stressNiveau}
        )
        RETURNING id
      `;

      if (!assessment.rows || assessment.rows.length === 0) {
        throw new Error('Assessment insert failed - no result returned');
      }

      return NextResponse.json({
        success: true,
        assessmentId: assessment.rows[0].id
      });

    } else if (action === 'submit' && responses) {
      const { assessmentId } = body;

      // Calculate readiness scores based on responses
      const scores = calculateReadinessScores(responses);

      // Generate AI analysis
      const aiAnalysis = await generateAIReadinessAnalysis(scores, microIntake);

      // Store results
      const result = await sql`
        INSERT INTO emotionele_readiness_results (
          assessment_id, readiness_score, readiness_level,
          emotionele_draagkracht, intenties_score, restlading_score,
          self_esteem_score, stress_score, rebound_risico,
          ai_conclusie, readiness_analyse, wat_werkt_nu, wat_lastig_kan_zijn,
          directe_aanbevelingen, micro_interventies, scripts, recommended_tools
        ) VALUES (
          ${assessmentId},
          ${scores.overallScore},
          ${scores.readinessLevel},
          ${scores.emotioneleDraagkracht}, ${scores.intenties}, ${scores.restlading},
          ${scores.selfEsteem}, ${scores.stress}, ${scores.reboundRisico},
          ${aiAnalysis.conclusie},
          ${aiAnalysis.analyse},
          ${JSON.stringify(aiAnalysis.watWerktNu)},
          ${JSON.stringify(aiAnalysis.watLastigKanZijn)},
          ${JSON.stringify(aiAnalysis.aanbevelingen)},
          ${JSON.stringify(aiAnalysis.microInterventies)},
          ${JSON.stringify(aiAnalysis.scripts)},
          ${JSON.stringify(aiAnalysis.recommendedTools)}
        )
        RETURNING *
      `;

      // Update assessment status
      await sql`
        UPDATE emotionele_readiness_assessments
        SET status = 'completed', completed_at = NOW()
        WHERE id = ${assessmentId}
      `;

      // Store individual responses
      for (const response of responses) {
        await sql`
          INSERT INTO emotionele_readiness_responses (
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
    console.error('Error in emotionele readiness assessment:', error);
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
        SELECT * FROM emotionele_readiness_results WHERE assessment_id = ${assessmentId}
      `;

      if ((result as any).length === 0) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        result: (result as any)[0]
      });
    }

    if (userId) {
      // Get user's latest assessment
      const assessment = await sql`
        SELECT a.*, r.*
        FROM emotionele_readiness_assessments a
        LEFT JOIN emotionele_readiness_results r ON a.id = r.assessment_id
        WHERE a.user_id = ${userId}
        ORDER BY a.created_at DESC
        LIMIT 1
      `;

      return NextResponse.json({
        success: true,
        assessment: (assessment as any)[0]
      });
    }

    return NextResponse.json({ error: 'Missing assessmentId or userId' }, { status: 400 });

  } catch (error: any) {
    console.error('Error fetching emotionele readiness results:', error);
    return NextResponse.json({
      error: 'Failed to fetch results',
      message: error.message
    }, { status: 500 });
  }
}

function calculateReadinessScores(responses: any[]) {
  // Initialize sub-scores
  let emotioneleDraagkracht = 0, intenties = 0, restlading = 0, selfEsteem = 0, stress = 0, reboundRisico = 0;

  // Calculate scores based on question categories and responses
  for (const response of responses) {
    const value = response.value; // 1-5 Likert scale

    if (response.category === 'emotionele_stabiliteit') {
      emotioneleDraagkracht += value * 10; // Higher values = more stable
    }

    else if (response.category === 'loslaten_verwerken') {
      restlading += value * 10; // Higher values = more processed
    }

    else if (response.category === 'fysieke_mentale_stress') {
      stress += value * 10; // Higher values = less stressed
    }

    else if (response.category === 'intenties') {
      intenties += value * 10; // Higher values = healthier intentions
    }

    else if (response.category === 'grenzen_zelfzorg') {
      selfEsteem += value * 10; // Higher values = better boundaries
    }

    // Scenario responses (weighted more heavily)
    else if (response.type === 'scenario') {
      if (response.questionId === 11) { // Ex-contact scenario
        if (value === 1) restlading += 90; // Neutral = high processing
        else if (value === 2) restlading += 60; // Light reaction = medium
        else if (value === 3) restlading += 30; // Deep reaction = low
      }
      else if (response.questionId === 12) { // Rejection scenario
        if (value === 1) selfEsteem += 90; // Fine with it = high self-esteem
        else if (value === 2) selfEsteem += 60; // Self-doubt = medium
        else if (value === 3) selfEsteem += 30; // Feel rejected = low
      }
      else if (response.questionId === 13) { // Stress week scenario
        if (value === 1) stress += 80; // Can date slowly = good stress management
        else if (value === 2) stress += 50; // Prefer to wait = medium
        else if (value === 3) stress += 20; // Can't handle = low
      }
    }
  }

  // Normalize to 0-100 scale
  const maxPossible = 200; // Rough estimate per category
  emotioneleDraagkracht = Math.min(100, (emotioneleDraagkracht / maxPossible) * 100);
  intenties = Math.min(100, (intenties / maxPossible) * 100);
  restlading = Math.min(100, (restlading / maxPossible) * 100);
  selfEsteem = Math.min(100, (selfEsteem / maxPossible) * 100);
  stress = Math.min(100, (stress / maxPossible) * 100);
  reboundRisico = Math.min(100, (reboundRisico / maxPossible) * 100);

  // Calculate overall readiness score (weighted average)
  const overallScore = Math.round(
    (emotioneleDraagkracht * 0.25) +
    (intenties * 0.20) +
    (restlading * 0.20) +
    (selfEsteem * 0.15) +
    (stress * 0.15) +
    (reboundRisico * 0.05)
  );

  // Determine readiness level
  let readinessLevel = 'moet_eerst_helen';
  if (overallScore >= 80) readinessLevel = 'klaar_om_te_daten';
  else if (overallScore >= 60) readinessLevel = 'bijna_klaar';

  return {
    overallScore,
    readinessLevel,
    emotioneleDraagkracht: Math.round(emotioneleDraagkracht),
    intenties: Math.round(intenties),
    restlading: Math.round(restlading),
    selfEsteem: Math.round(selfEsteem),
    stress: Math.round(stress),
    reboundRisico: Math.round(reboundRisico)
  };
}

async function generateAIReadinessAnalysis(scores: any, microIntake: any) {
  const client = getOpenRouterClient();

  const prompt = `
  Genereer een Nederlandse analyse voor een Emotionele Ready Scan met deze scores:
  - Overall Readiness: ${scores.overallScore}/100
  - Readiness Level: ${scores.readinessLevel}
  - Emotionele Draagkracht: ${scores.emotioneleDraagkracht}%
  - Intenties: ${scores.intenties}%
  - Restlading: ${scores.restlading}%
  - Self-Esteem & Grenzen: ${scores.selfEsteem}%
  - Stress Management: ${scores.stress}%
  - Rebound Risico: ${scores.reboundRisico}%

  Micro-intake: Laatste relatie: ${microIntake?.laatsteRelatie}, Emotioneel herstel: ${microIntake?.emotioneelHerstel}/5, Stress niveau: ${microIntake?.stressNiveau}/5

  Genereer:
  1. conclusie: "Jouw Emotionele Ready Score: [score]/100 — [level interpretatie]"
  2. analyse: Gedetailleerde uitleg van de score en wat dit betekent
  3. watWerktNu: Array van 3-4 dingen die nu goed werken
  4. watLastigKanZijn: Array van 3-4 dingen die lastig kunnen zijn
  5. aanbevelingen: Array van 3 directe, praktische aanbevelingen
  6. microInterventies: JSON object met 3 interventies (7-dagen reset, dopamine balans, intentie-frame)
  7. scripts: JSON object met scripts voor restlading, stress, twijfel
  8. recommendedTools: JSON array met tool aanbevelingen gebaseerd op readiness level

  Wees eerlijk maar bemoedigend, focus op groei en zelfzorg.
  `;

  try {
    const response = await client.createChatCompletion(
      OPENROUTER_MODELS.CLAUDE_35_HAIKU,
      [{ role: 'user', content: prompt }],
      {
        temperature: 0.7,
        max_tokens: 2000
      }
    );

    const content = response;

    // Get readiness level interpretation
    const getLevelText = (level: string) => {
      switch (level) {
        case 'klaar_om_te_daten': return 'Klaar om te Daten';
        case 'bijna_klaar': return 'Bijna Klaar';
        case 'moet_eerst_helen': return 'Moet Eerst Helen';
        default: return level;
      }
    };

    return {
      conclusie: `Jouw Emotionele Ready Score: ${scores.overallScore}/100 — ${getLevelText(scores.readinessLevel)}`,
      analyse: `Deze score geeft aan hoe emotioneel beschikbaar je bent voor dating. Met een score van ${scores.overallScore} zit je in de categorie "${getLevelText(scores.readinessLevel)}". Dit betekent dat je ${scores.overallScore >= 80 ? 'goed voorbereid bent om te daten' : scores.overallScore >= 60 ? 'dichtbij klaar bent, maar nog wat aandacht nodig hebt' : 'eerst wat heling nodig hebt voordat dating gezond is'}.`,
      watWerktNu: [
        scores.emotioneleDraagkracht > 70 ? "Goede emotionele stabiliteit" : "Basis emotionele stabiliteit",
        scores.intenties > 70 ? "Duidelijke, gezonde intenties" : "Bewustzijn van eigen behoeften",
        scores.selfEsteem > 70 ? "Sterke grenzen en zelfzorg" : "Bewustzijn van eigenwaarde"
      ],
      watLastigKanZijn: [
        scores.restlading < 60 ? "Restlading van vorige relatie" : "Enige gevoeligheid voor triggers",
        scores.stress < 60 ? "Stressgevoeligheid bij dating" : "Behoefte aan rustig tempo",
        scores.reboundRisico > 60 ? "Rebound-patronen" : "Tendens tot snelle verbindingen"
      ],
      aanbevelingen: [
        scores.readinessLevel === 'klaar_om_te_daten' ? "Start met dating op een ontspannen manier" :
        scores.readinessLevel === 'bijna_klaar' ? "Focus op zelfzorg terwijl je date" :
        "Neem tijd voor heling voordat je date",
        "Gebruik de micro-interventies dagelijks",
        "Wees eerlijk over je behoeften in gesprekken"
      ],
      microInterventies: {
        "7_dagen_reset": {
          titel: "7-Dagen Mini-Reset",
          beschrijving: "5 minuten reflectie per dag voor emotionele ontlading",
          stappen: ["Dag 1: Emoties erkennen", "Dag 2-6: Stressregulatie", "Dag 7: Intentie zetten"]
        },
        "dopamine_balans": {
          titel: "Dopamine-Balans Protocol",
          beschrijving: "Voor mensen die te hard reageren op appgedrag",
          stappen: ["24u geen dating-app", "3 diepe rustmomenten", "1 echte wereld activiteit"]
        },
        "intentie_frame": {
          titel: "Intentie-Frame Script",
          beschrijving: "Gebruik voor matches om duidelijkheid te geven",
          stappen: ["Stel je intentie vast", "Gebruik het script bij nieuwe matches", "Evalueer hoe het voelt"]
        }
      },
      scripts: {
        restlading: "Ik merk dat bepaalde dingen nog gevoelig liggen. Ik neem even mijn tijd — geen haast.",
        stress: "Drukke week, ik wil je wel leren kennen maar ik kies een rustig tempo.",
        twijfel: "Ik voel dat ik eerst even moet landen voordat ik echt kan verbinden."
      },
      recommendedTools: scores.readinessLevel === 'klaar_om_te_daten' ? [
        { name: "Date Planner PRO", url: "/date-planner", reason: "Voor georganiseerde dates" },
        { name: "Chat Coach", url: "/chat", reason: "Voor natuurlijke communicatie" },
        { name: "Profiel Optimalisatie", url: "/profiel", reason: "Voor sterke eerste indruk" }
      ] : scores.readinessLevel === 'bijna_klaar' ? [
        { name: "Emotionele Reset", url: "/emotionele-reset", reason: "Voor heling en balans" },
        { name: "Hechtingsstijl QuickScan", url: "/hechtingsstijl", reason: "Voor relatiepatronen" },
        { name: "Waarden Kompas", url: "/waarden-kompas", reason: "Voor duidelijke waarden" }
      ] : [
        { name: "Emotionele Reset", url: "/emotionele-reset", reason: "Voor heling eerst" },
        { name: "Break-Up Herstel", url: "/break-up-herstel", reason: "Voor verwerking" },
        { name: "Grenzen & Zelfzorg", url: "/grenzen-zelfzorg", reason: "Voor fundament" }
      ]
    };

  } catch (error) {
    console.error('AI readiness analysis generation failed:', error);
    // Return fallback analysis
    return {
      conclusie: `Jouw Emotionele Ready Score: ${scores.overallScore}/100 — ${scores.readinessLevel}`,
      analyse: "Deze analyse helpt je te begrijpen waar je staat in je dating readiness.",
      watWerktNu: ["Goede zelfbewustzijn", "Bereidheid tot groei"],
      watLastigKanZijn: ["Sommige triggers", "Behoefte aan rust"],
      aanbevelingen: ["Neem tijd voor jezelf", "Wees geduldig", "Focus op heling"],
      microInterventies: {},
      scripts: {},
      recommendedTools: []
    };
  }
}