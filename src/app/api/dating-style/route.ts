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
        INSERT INTO dating_style_assessments (
          user_id, huidige_dating_status, gewenste_relatie_type, app_gebruik
        ) VALUES (
          ${userId}, ${microIntake?.huidigeDatingStatus}, ${microIntake?.gewensteRelatieType}, ${microIntake?.appGebruik}
        )
        RETURNING id
      `;

      return NextResponse.json({
        success: true,
        assessmentId: (assessment as any)[0].id
      });

    } else if (action === 'submit' && responses) {
      const { assessmentId } = body;

      // Calculate dating style scores based on responses
      const scores = calculateDatingStyleScores(responses);

      // Generate AI analysis
      const aiAnalysis = await generateAIDatingStyleAnalysis(scores, microIntake);

      // Store results
      const result = await sql`
        INSERT INTO dating_style_results (
          assessment_id, primary_style,
          initiator_score, planner_score, adventurer_score, selector_score,
          pleaser_score, distant_score, over_sharer_score, ghost_prone_score,
          ai_stijl_profiel, moderne_dating_analyse, sterke_punten, aandachtspunten,
          date_voorkeuren, vermijd_dates, chat_scripts, micro_exercises, match_filters
        ) VALUES (
          ${assessmentId},
          ${scores.primaryStyle},
          ${scores.initiator}, ${scores.planner}, ${scores.adventurer}, ${scores.selector},
          ${scores.pleaser}, ${scores.distant}, ${scores.overSharer}, ${scores.ghostProne},
          ${aiAnalysis.stijlProfiel},
          ${aiAnalysis.moderneDatingAnalyse},
          ${JSON.stringify(aiAnalysis.sterkePunten)},
          ${JSON.stringify(aiAnalysis.aandachtspunten)},
          ${JSON.stringify(aiAnalysis.dateVoorkeuren)},
          ${JSON.stringify(aiAnalysis.vermijdDates)},
          ${JSON.stringify(aiAnalysis.chatScripts)},
          ${JSON.stringify(aiAnalysis.microExercises)},
          ${JSON.stringify(aiAnalysis.matchFilters)}
        )
        RETURNING *
      `;

      // Update assessment status
      await sql`
        UPDATE dating_style_assessments
        SET status = 'completed', completed_at = NOW()
        WHERE id = ${assessmentId}
      `;

      // Store individual responses
      for (const response of responses) {
        await sql`
          INSERT INTO dating_style_responses (
            assessment_id, question_type, question_id, response_value, response_time_ms
          ) VALUES (
            ${assessmentId}, ${response.type}, ${response.questionId},
            ${response.value}, ${response.timeMs || 0}
          )
        `;
      }

      return NextResponse.json({
        success: true,
        result: (result as any)[0],
        scores,
        aiAnalysis
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Error in dating style assessment:', error);
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
        SELECT * FROM dating_style_results WHERE assessment_id = ${assessmentId}
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
        FROM dating_style_assessments a
        LEFT JOIN dating_style_results r ON a.id = r.assessment_id
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
    console.error('Error fetching dating style results:', error);
    return NextResponse.json({
      error: 'Failed to fetch results',
      message: error.message
    }, { status: 500 });
  }
}

function calculateDatingStyleScores(responses: any[]) {
  // Initialize style scores
  let initiator = 0, planner = 0, adventurer = 0, selector = 0, pleaser = 0, distant = 0, overSharer = 0, ghostProne = 0;

  // Calculate scores based on question categories and responses
  for (const response of responses) {
    const value = response.value; // 1-5 Likert scale

    if (response.category === 'communicatie_stijl') {
      if (response.questionId === 1) initiator += value * 10; // Stuur eerste bericht
      if (response.questionId === 2) overSharer += value * 10; // Deel veel info
      if (response.questionId === 3) distant += (6 - value) * 10; // Moeilijk gevoelens uiten (reverse)
    }

    else if (response.category === 'date_aanpak') {
      if (response.questionId === 4) planner += value * 10; // Plan van tevoren
      if (response.questionId === 5) adventurer += value * 10; // Spontane dates
      if (response.questionId === 6) selector += value * 10; // Lijst met eisen
    }

    else if (response.category === 'relatie_verwachtingen') {
      if (response.questionId === 7) initiator += value * 10; // Leiding nemen
      if (response.questionId === 8) pleaser += value * 10; // Aanpassen aan ander
      if (response.questionId === 9) distant += value * 10; // Houd afstand
    }

    else if (response.category === 'conflict_afhandeling') {
      if (response.questionId === 10) initiator += value * 10; // Los meteen op
      if (response.questionId === 11) distant += value * 10; // Vermijd confrontaties
    }

    else if (response.category === 'zelfvertrouwen') {
      if (response.questionId === 12) initiator += value * 10; // Complimenten maken
      if (response.questionId === 13) pleaser += (6 - value) * 10; // Twijfel aan aantrekkelijkheid (reverse)
    }

    else if (response.category === 'grenzen') {
      if (response.questionId === 14) initiator += value * 10; // Duidelijke grenzen
      if (response.questionId === 15) pleaser += value * 10; // Zeg ja terwijl nee
    }

    else if (response.category === 'modern_dating') {
      if (response.questionId === 16) adventurer += value * 10; // Frequent app gebruik
    }

    // Scenario responses (weighted more heavily)
    else if (response.type === 'scenario') {
      if (response.questionId === 17) { // Spontane date scenario
        if (value === 1) adventurer += 90; // Ga mee - spontaniteit
        else if (value === 2) planner += 90; // Vraag details - planning
        else if (value === 3) selector += 90; // Bedank - selectief
      }
      else if (response.questionId === 18) { // Slecht gesprek scenario
        if (value === 1) overSharer += 85; // Stel veel vragen
        else if (value === 2) pleaser += 85; // Stel ander op gemak
        else if (value === 3) { distant += 80; ghostProne += 80; } // Trek terug
      }
    }
  }

  // Normalize to 0-100 scale
  const maxPossible = 300; // Rough estimate per style
  initiator = Math.min(100, (initiator / maxPossible) * 100);
  planner = Math.min(100, (planner / maxPossible) * 100);
  adventurer = Math.min(100, (adventurer / maxPossible) * 100);
  selector = Math.min(100, (selector / maxPossible) * 100);
  pleaser = Math.min(100, (pleaser / maxPossible) * 100);
  distant = Math.min(100, (distant / maxPossible) * 100);
  overSharer = Math.min(100, (overSharer / maxPossible) * 100);
  ghostProne = Math.min(100, (ghostProne / maxPossible) * 100);

  // Determine primary style
  const styles = [
    { name: 'initiator', score: initiator },
    { name: 'planner', score: planner },
    { name: 'adventurer', score: adventurer },
    { name: 'selector', score: selector },
    { name: 'pleaser', score: pleaser },
    { name: 'distant', score: distant },
    { name: 'over_sharer', score: overSharer },
    { name: 'ghost_prone', score: ghostProne }
  ];

  styles.sort((a, b) => b.score - a.score);

  return {
    initiator: Math.round(initiator),
    planner: Math.round(planner),
    adventurer: Math.round(adventurer),
    selector: Math.round(selector),
    pleaser: Math.round(pleaser),
    distant: Math.round(distant),
    overSharer: Math.round(overSharer),
    ghostProne: Math.round(ghostProne),
    primaryStyle: styles[0].name
  };
}

async function generateAIDatingStyleAnalysis(scores: any, microIntake: any) {
  const client = getOpenRouterClient();

  const prompt = `
  Genereer een Nederlandse analyse voor een Dating Stijl Scan met deze scores:
  - Initiator: ${scores.initiator}%
  - Planner: ${scores.planner}%
  - Adventurer: ${scores.adventurer}%
  - Selector: ${scores.selector}%
  - Pleaser: ${scores.pleaser}%
  - Distant: ${scores.distant}%
  - Over Sharer: ${scores.overSharer}%
  - Ghost Prone: ${scores.ghostProne}%

  Primaire stijl: ${scores.primaryStyle}
  Micro-intake: Dating status: ${microIntake?.huidigeDatingStatus}, Gewenste relatie: ${microIntake?.gewensteRelatieType}, App gebruik: ${microIntake?.appGebruik}

  Genereer:
  1. stijl_profiel: Gedetailleerde beschrijving van de primaire dating stijl
  2. moderne_dating_analyse: Hoe deze stijl uitkomt in modern dating (apps, ghosting, etc.)
  3. sterke_punten: Array van 3-4 sterke punten van deze stijl
  4. aandachtspunten: Array van 3-4 aandachtspunten/verbeterpunten
  5. date_voorkeuren: Array van 3 ideale date types voor deze persoon
  6. vermijd_dates: Array van 3 date types om te vermijden
  7. chat_scripts: JSON object met 3 communicatie scripts
  8. micro_exercises: JSON object met 3 kleine oefeningen om stijl te verbeteren
  9. match_filters: JSON object met ideale partner eigenschappen

  Wees specifiek, behulpzaam en focus op moderne dating dynamieken.
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

    // Get style display name
    const getStyleDisplayName = (style: string) => {
      const names: Record<string, string> = {
        'initiator': 'Initiator',
        'planner': 'Planner',
        'adventurer': 'Avonturier',
        'selector': 'Selecteur',
        'pleaser': 'Pleaser',
        'distant': 'Afstandelijk',
        'over_sharer': 'Over-Sharer',
        'ghost_prone': 'Ghost-Gevoelig'
      };
      return names[style] || style;
    };

    return {
      stijlProfiel: `Je primaire dating stijl is **${getStyleDisplayName(scores.primaryStyle)}** (${Math.max(scores.initiator, scores.planner, scores.adventurer, scores.selector, scores.pleaser, scores.distant, scores.overSharer, scores.ghostProne)}% match). Dit betekent dat je in dating situaties geneigd bent om ${scores.primaryStyle === 'initiator' ? 'de leiding te nemen en initiatief te tonen' : scores.primaryStyle === 'planner' ? 'alles zorgvuldig te plannen en organiseren' : scores.primaryStyle === 'adventurer' ? 'open te staan voor spontaniteit en avontuur' : scores.primaryStyle === 'selector' ? 'selectief te zijn en hoge eisen te stellen' : scores.primaryStyle === 'pleaser' ? 'je aan te passen aan wat de ander wil' : scores.primaryStyle === 'distant' ? 'afstand te houden tot zekerheid' : scores.primaryStyle === 'over_sharer' ? 'veel van jezelf te delen' : 'terughoudend te zijn met communicatie'}.`,
      moderneDatingAnalyse: `In het moderne dating landschap van 2025+ komt deze stijl vooral tot uiting in ${scores.primaryStyle === 'initiator' ? 'hoe snel je eerste berichten stuurt en gesprekken initieert' : scores.primaryStyle === 'planner' ? 'je voorkeur voor georganiseerde dates en duidelijke planning' : scores.primaryStyle === 'adventurer' ? 'je enthousiasme voor spontane ontmoetingen en nieuwe ervaringen' : scores.primaryStyle === 'selector' ? 'je zorgvuldige screening van matches voordat je investeert' : scores.primaryStyle === 'pleaser' ? 'hoe je je aanpast aan de communicatie stijl van de ander' : scores.primaryStyle === 'distant' ? 'je voorzichtige aanpak en behoefte aan zekerheid' : scores.primaryStyle === 'over_sharer' ? 'hoe open je bent over gevoelens en ervaringen' : 'je neiging om af te haken bij ongemak'}.`,
      sterkePunten: [
        scores.primaryStyle === 'initiator' ? 'Neemt initiatief en toont interesse duidelijk' : 'Organiseert en plant zorgvuldig',
        scores.primaryStyle === 'adventurer' ? 'Open voor nieuwe ervaringen en spontaniteit' : 'Weet precies wat hij/zij wil',
        'Betrouwbaar in eigen gedragspatroon',
        'Heldere communicatiestijl'
      ],
      aandachtspunten: [
        scores.primaryStyle === 'initiator' ? 'Kan soms te dominant overkomen' : 'Kan te rigide zijn in planning',
        scores.primaryStyle === 'adventurer' ? 'Kan moeite hebben met commitment' : 'Kan te kritisch zijn',
        'Flexibiliteit in andere stijlen',
        'Bewustzijn van eigen patronen'
      ],
      dateVoorkeuren: [
        scores.primaryStyle === 'initiator' ? 'Actieve dates zoals wandelen en praten' : 'Geplande uitjes zoals restaurant of museum',
        scores.primaryStyle === 'adventurer' ? 'Spontane avonturen zoals stedentrip' : 'Kwalitatieve gesprekken bij koffie',
        'Ontspannen sfeer waar je jezelf kunt zijn'
      ],
      vermijdDates: [
        scores.primaryStyle === 'initiator' ? 'Te passieve, saaie activiteiten' : 'Chaos en gebrek aan planning',
        scores.primaryStyle === 'adventurer' ? 'Te formele, stijve gelegenheden' : 'Te oppervlakkige ontmoetingen',
        'Situaties waar je niet tot je recht komt'
      ],
      chatScripts: {
        eerste_bericht: scores.primaryStyle === 'initiator' ? "Hey! Zag je profiel en moest meteen een berichtje sturen. Wat is het leukste wat je deze week hebt gedaan?" : "Hoi! Je profiel sprak me aan. Wat doe je in het weekend?",
        diepte_gesprek: scores.primaryStyle === 'over_sharer' ? "Ik vind het interessant hoe je over je werk praat. Ikzelf heb laatst een grote verandering doorgemaakt..." : "Vertel eens meer over je hobby's?",
        grens_stellen: scores.primaryStyle === 'distant' ? "Ik vind dit gesprek leuk, maar ik heb even tijd nodig om na te denken." : "Bedankt voor het compliment, maar ik wil het graag rustig aan doen."
      },
      microExercises: {
        stijl_bewustzijn: {
          titel: "Stijl Bewustzijn (5 min/dag)",
          beschrijving: "Reflect daily on your dating behavior",
          stappen: ["Noteer 1 dating interactie", "Analyseer je gedrag", "Bedenk 1 alternatief"]
        },
        flexibiliteit_training: {
          titel: "Flexibiliteit Training",
          beschrijving: "Probeer eens een andere aanpak",
          stappen: ["Kies 1 situatie", "Probeer tegengestelde stijl", "Reflecteer op gevoel"]
        },
        grens_experiment: {
          titel: "Grens Experiment",
          beschrijving: "Oefen met duidelijke communicatie",
          stappen: ["Identificeer grens", "Oefen uitspreken", "Observe reaction"]
        }
      },
      matchFilters: {
        communicatie_stijl: scores.primaryStyle === 'over_sharer' ? "Open en expressief communicator" : "Betrouwbare communicator",
        energie_niveau: scores.primaryStyle === 'adventurer' ? "Avontuurlijk en spontaan" : "Stabiel en consistent",
        relatie_doelen: microIntake?.gewensteRelatieType || "Serieus georiënteerd",
        levensstijl: "Passend bij jouw dagelijkse routine"
      }
    };

  } catch (error) {
    console.error('AI dating style analysis generation failed:', error);
    // Return fallback analysis
    return {
      stijlProfiel: `Je primaire dating stijl is ${scores.primaryStyle}. Dit is een unieke combinatie van eigenschappen die je dating ervaring vormgeven.`,
      moderneDatingAnalyse: "Deze stijl heeft zowel sterke punten als aandachtspunten in modern dating.",
      sterkePunten: ["Unieke perspectief", "Betrouwbaar gedrag", "Heldere voorkeuren"],
      aandachtspunten: ["Flexibiliteit", "Bewustzijn", "Aanpassingsvermogen"],
      dateVoorkeuren: ["Persoonlijke gesprekken", "Ontspannen sfeer", "Gedeelde interesses"],
      vermijdDates: ["Te drukke gelegenheden", "Onpersoonlijke settings", "Oncomfortabele situaties"],
      chatScripts: {},
      microExercises: {},
      matchFilters: {}
    };
  }
}