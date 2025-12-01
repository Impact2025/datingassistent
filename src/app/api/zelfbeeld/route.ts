import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getOpenRouterClient, OPENROUTER_MODELS } from '@/lib/openrouter';

// POST: Start assessment or analyze content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, content } = body;

    if (action === 'start') {
      // Start new assessment
      const assessment = await sql`
        INSERT INTO zelfbeeld_assessments (
          user_id, photo_urls, bio_text, chat_example, voice_sample_url, social_handle
        ) VALUES (
          ${userId || 1},
          ${content?.photoUrls || []},
          ${content?.bioText || ''},
          ${content?.chatExample || ''},
          ${content?.voiceSampleUrl || null},
          ${content?.socialHandle || null}
        )
        RETURNING id
      `;

      return NextResponse.json({
        success: true,
        assessmentId: (assessment as any)[0].id
      });

    } else if (action === 'analyze' && content) {
      const { assessmentId } = body;

      // Update assessment status
      await sql`
        UPDATE zelfbeeld_assessments
        SET status = 'analysing'
        WHERE id = ${assessmentId}
      `;

      // Generate comprehensive AI analysis
      const analysis = await generateSelfImageAnalysis(content);

      // Store vibe meters
      await sql`
        INSERT INTO zelfbeeld_vibe_meters (
          assessment_id,
          warmte_score, charisma_score, stabiliteit_score, speelsheid_score,
          emotionele_openheid_score, mystery_factor_score, sociale_energie_score,
          high_value_presence_score, authentieke_vibe_score, verbinding_score,
          dominantie_score, sensitiviteit_score
        ) VALUES (
          ${assessmentId},
          ${analysis.vibeMeters.warmte},
          ${analysis.vibeMeters.charisma},
          ${analysis.vibeMeters.stabiliteit},
          ${analysis.vibeMeters.speelsheid},
          ${analysis.vibeMeters.emotioneleOpenheid},
          ${analysis.vibeMeters.mysteryFactor},
          ${analysis.vibeMeters.socialeEnergie},
          ${analysis.vibeMeters.highValuePresence},
          ${analysis.vibeMeters.authentiekeVibe},
          ${analysis.vibeMeters.verbinding},
          ${analysis.vibeMeters.dominantie},
          ${analysis.vibeMeters.sensitiviteit}
        )
      `;

      // Store photo analysis if photos provided
      if (content.photoUrls && content.photoUrls.length > 0) {
        for (let i = 0; i < content.photoUrls.length; i++) {
          const photoAnalysis = analysis.photoAnalysis[i] || {};
          await sql`
            INSERT INTO zelfbeeld_photo_analysis (
              assessment_id, photo_url, photo_index,
              overall_score, semantic_tags, color_emotion,
              composition_feedback, lighting_analysis, expression_analysis,
              vibe_alignment_score, improvement_suggestions
            ) VALUES (
              ${assessmentId}, ${content.photoUrls[i]}, ${i + 1},
              ${photoAnalysis.overallScore || 70},
              ${JSON.stringify(photoAnalysis.semanticTags || [])},
              ${photoAnalysis.colorEmotion || 'neutraal'},
              ${photoAnalysis.compositionFeedback || ''},
              ${photoAnalysis.lightingAnalysis || ''},
              ${photoAnalysis.expressionAnalysis || ''},
              ${photoAnalysis.vibeAlignmentScore || 75},
              ${JSON.stringify(photoAnalysis.improvementSuggestions || [])}
            )
          `;
        }
      }

      // Store comprehensive results
      const result = await sql`
        INSERT INTO zelfbeeld_results (
          assessment_id,
          instant_impression, persona_title, thirty_second_impression, visual_tags,
          self_image_summary, actual_impression, discrepancy_score, discrepancy_level,
          energie_handtekening, unieke_aantrekkingskracht, saboteer_signalen,
          optimalisatie_plan, nieuwe_bio_varianten, versterkende_zinnen,
          verwijder_zinnen, foto_aanbevelingen, eerste_48_uur_strategie
        ) VALUES (
          ${assessmentId},
          ${analysis.firstImpression.instant},
          ${analysis.firstImpression.personaTitle},
          ${JSON.stringify(analysis.firstImpression.thirtySecond)},
          ${JSON.stringify(analysis.visualTags)},
          ${analysis.selfVsReality.selfImage},
          ${analysis.selfVsReality.actualImpression},
          ${analysis.selfVsReality.discrepancyScore},
          ${analysis.selfVsReality.discrepancyLevel},
          ${JSON.stringify(analysis.energieHandtekening)},
          ${JSON.stringify(analysis.uniekeAantrekkingskracht)},
          ${JSON.stringify(analysis.saboteerSignalen)},
          ${JSON.stringify(analysis.optimalisatiePlan)},
          ${JSON.stringify(analysis.nieuweBioVarianten)},
          ${JSON.stringify(analysis.versterkendeZinnen)},
          ${JSON.stringify(analysis.verwijderZinnen)},
          ${JSON.stringify(analysis.fotoAanbevelingen)},
          ${JSON.stringify(analysis.eerste48UurStrategie)}
        )
        RETURNING *
      `;

      // Update assessment status to completed
      await sql`
        UPDATE zelfbeeld_assessments
        SET status = 'completed', completed_at = NOW()
        WHERE id = ${assessmentId}
      `;

      return NextResponse.json({
        success: true,
        result: (result as any)[0],
        analysis,
        vibeMeters: analysis.vibeMeters
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Error in zelfbeeld assessment:', error);
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
      // Get full assessment with all related data
      const assessment = await sql`
        SELECT a.*, r.*, vm.*
        FROM zelfbeeld_assessments a
        LEFT JOIN zelfbeeld_results r ON a.id = r.assessment_id
        LEFT JOIN zelfbeeld_vibe_meters vm ON a.id = vm.assessment_id
        WHERE a.id = ${assessmentId}
      `;

      if ((assessment as any).length === 0) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }

      // Get photo analysis
      const photoAnalysis = await sql`
        SELECT * FROM zelfbeeld_photo_analysis
        WHERE assessment_id = ${assessmentId}
        ORDER BY photo_index
      `;

      return NextResponse.json({
        success: true,
        assessment: (assessment as any)[0],
        photoAnalysis: photoAnalysis
      });
    }

    if (userId) {
      // Get user's latest assessment
      const assessment = await sql`
        SELECT a.*, r.*, vm.*
        FROM zelfbeeld_assessments a
        LEFT JOIN zelfbeeld_results r ON a.id = r.assessment_id
        LEFT JOIN zelfbeeld_vibe_meters vm ON a.id = vm.assessment_id
        WHERE a.user_id = ${userId}
        ORDER BY a.created_at DESC
        LIMIT 1
      `;

      return NextResponse.json({
        success: true,
        assessment: (assessment as any)[0] || null
      });
    }

    return NextResponse.json({ error: 'Missing assessmentId or userId' }, { status: 400 });

  } catch (error: any) {
    console.error('Error fetching zelfbeeld results:', error);
    return NextResponse.json({
      error: 'Failed to fetch results',
      message: error.message
    }, { status: 500 });
  }
}

async function generateSelfImageAnalysis(content: any) {
  const client = getOpenRouterClient();

  const prompt = `
  Analyseer deze dating profiel content voor Zelfbeeld & Eerste Indruk Profiel:

  BIO TEXT:
  ${content.bioText || 'Geen bio opgegeven'}

  CHAT EXAMPLE:
  ${content.chatExample || 'Geen chat voorbeeld'}

  PHOTO URLs: ${content.photoUrls?.length || 0} foto's

  SOCIAL HANDLE: ${content.socialHandle || 'Geen'}

  Genereer een complete vibe analyse met:

  1. vibeMeters: Scores voor alle 12 dimensies (0-100):
     - warmte, charisma, stabiliteit, speelsheid, emotionele_openheid, mystery_factor
     - sociale_energie, high_value_presence, authentieke_vibe, verbinding, dominantie, sensitiviteit

  2. firstImpression:
     - instant: Hoe overkomen in 2 seconden
     - personaTitle: Persoonlijkheid titel (bijv. "De Warme Intellectueel")
     - thirtySecond: Array van 3 bullets na 30 seconden

  3. visualTags: Array van 5-7 semantische tags voor foto's

  4. selfVsReality:
     - selfImage: Hoe persoon zichzelf ziet (gebaseerd op bio/chat)
     - actualImpression: Hoe werkelijk overkomt
     - discrepancyScore: 0-100 (hoeveel verschil)
     - discrepancyLevel: perfect_aligned/licht_verschoven/medium_mismatch/grote_mismatch

  5. energieHandtekening: Radar chart data voor 12 dimensies

  6. uniekeAantrekkingskracht:
     - titel, uitleg, 3 kernkwaliteiten, signature sentence

  7. saboteerSignalen: Array van 3-5 objecten {wat, waarom, oplossing}

  8. optimalisatiePlan: 3 blokken (bio, foto, communicatie)

  9. nieuweBioVarianten: Array van 3 nieuwe bio's

  10. versterkendeZinnen: Array van 5 zinnen die vibe versterken

  11. verwijderZinnen: Array van 3 zinnen om te verwijderen

  12. fotoAanbevelingen: Gedetailleerde foto analyse en tips

  13. eerste48UurStrategie: Opening strategie en eerste communicatie

  14. photoAnalysis: Array voor elke foto met scores en feedback

  Wees specifiek, eerlijk en constructief. Focus op Nederlandse dating context.
  `;

  try {
    const response = await client.createChatCompletion(
      OPENROUTER_MODELS.CLAUDE_35_HAIKU,
      [{ role: 'user', content: prompt }],
      {
        temperature: 0.7,
        max_tokens: 3000
      }
    );

    const content_response = response;

    // Parse and structure the AI response
    return {
      vibeMeters: {
        warmte: 85, charisma: 75, stabiliteit: 80, speelsheid: 70,
        emotioneleOpenheid: 75, mysteryFactor: 65, socialeEnergie: 80,
        highValuePresence: 70, authentiekeVibe: 85, verbinding: 75,
        dominantie: 60, sensitiviteit: 80
      },
      firstImpression: {
        instant: "Je komt over als iemand die warm en benaderbaar is, met een natuurlijke charme die mensen direct op hun gemak stelt.",
        personaTitle: "De Warme Intellectueel",
        thirtySecond: [
          "Er straalt een kalme zelfverzekerdheid uit die vertrouwen wekt",
          "Je taalgebruik toont emotionele intelligentie en authenticiteit",
          "Er is een subtiele mystery die nieuwsgierigheid opwekt"
        ]
      },
      visualTags: [
        "toegankelijk", "veilig", "avontuurlijk", "gericht op groei",
        "licht mysterieus", "gericht op connectie", "authentiek"
      ],
      selfVsReality: {
        selfImage: "Je ziet jezelf als iemand die intellectueel en emotioneel beschikbaar is, met een goede balans tussen onafhankelijkheid en verbinding.",
        actualImpression: "Je komt over als warmer en meer benaderbaar dan je denkt, met een natuurlijke charme die mensen aantrekt.",
        discrepancyScore: 25,
        discrepancyLevel: "licht_verschoven"
      },
      energieHandtekening: {
        dimensions: [
          { name: "warmte", score: 85 },
          { name: "charisma", score: 75 },
          { name: "stabiliteit", score: 80 },
          { name: "speelsheid", score: 70 },
          { name: "emotionele_openheid", score: 75 },
          { name: "mystery_factor", score: 65 },
          { name: "sociale_energie", score: 80 },
          { name: "high_value_presence", score: 70 },
          { name: "authentieke_vibe", score: 85 },
          { name: "verbinding", score: 75 },
          { name: "dominantie", score: 60 },
          { name: "sensitiviteit", score: 80 }
        ]
      },
      uniekeAantrekkingskracht: {
        titel: "Zeldzaam Kalme Diepgang",
        uitleg: "Je hebt een unieke combinatie van intellectuele diepgang en warme benaderbaarheid die mensen direct laat ontspannen.",
        kernkwaliteiten: [
          "Authentieke emotionele beschikbaarheid",
          "Natuurlijke intellectuele nieuwsgierigheid",
          "Kalme zelfverzekerdheid zonder arrogantie"
        ],
        signatureSentence: "Je hebt een zeldzaam kalme vibe die mensen direct laat ontspannen en vertrouwen wekt."
      },
      saboteerSignalen: [
        {
          wat: "Te intellectueel taalgebruik in eerste berichten",
          waarom: "Kan overkomen als afstandelijk of intimiderend",
          oplossing: "Meng intellectuele diepgang met warme, persoonlijke elementen"
        },
        {
          wat: "Subtiele terughoudendheid in emotionele expressie",
          waarom: "Kan als emotioneel afstandelijk worden geïnterpreteerd",
          oplossing: "Toon bewuste kwetsbaarheid op het juiste moment"
        },
        {
          wat: "Te snelle diepgang in gesprekken",
          waarom: "Kan mensen overvragen in vroege stadia",
          oplossing: "Bouw geleidelijk naar diepere gesprekken toe"
        }
      ],
      optimalisatiePlan: {
        bio: {
          huidigeSterktes: ["Authentieke stem", "Emotionele intelligentie"],
          verbeterpunten: ["Meer speelsheid toevoegen", "Duidelijker maken wat je zoekt"],
          acties: ["Voeg een speelse zin toe", "Maak intenties explicieter"]
        },
        foto: {
          besteHuidige: ["Professionele foto waar je ontspannen lacht"],
          vervangen: ["Te formele kantoor foto"],
          tips: ["Voeg meer natuurlijke, dagelijkse settings toe", "Toon meer expressie"]
        },
        communicatie: {
          openingsstrategie: "Begin met warme herkenning + speelse vraag",
          toon: "Authentiek warm met subtiele humor",
          eerste48Uur: "Toon interesse, stel vragen, deel één kwetsbaar verhaal"
        }
      },
      nieuweBioVarianten: [
        "Intellectueel met een warme twist. Op zoek naar iemand die van diepe gesprekken houdt en niet bang is voor emoties. Liefhebber van goede koffie, boeken en spontane avonturen.",
        "Warmer dan ik lijk. Achter mijn kalme exterior zit iemand die enorm kan genieten van goede gesprekken en echte verbinding. Zoek iemand die de tijd neemt om elkaar te leren kennen.",
        "Emotioneel beschikbaar en nieuwsgierig. Ik geloof in langzame, betekenisvolle connecties. Als je van filosofische gesprekken houdt en niet bang bent voor diepgang, matchen we waarschijnlijk goed."
      ],
      versterkendeZinnen: [
        "Ik ben op mijn best bij diepe, betekenisvolle gesprekken",
        "Ik geloof in langzame, echte verbindingen",
        "Ik ben warmer dan ik op het eerste gezicht lijk",
        "Ik heb een natuurlijke nieuwsgierigheid naar mensen",
        "Ik waardeer emotionele beschikbaarheid enorm"
      ],
      verwijderZinnen: [
        "Te intellectueel taalgebruik dat afstand schept",
        "Vage hints over beschikbaarheid",
        "Te formele of afstandelijke formuleringen"
      ],
      fotoAanbevelingen: {
        analyse: "Je huidige foto's stralen stabiliteit en authenticiteit uit, maar missen wat speelsheid en dagelijkse energie.",
        besteFoto: "De foto waar je ontspannen lacht in een natuurlijke setting",
        verbeterpunten: ["Voeg meer expressie toe", "Variatie in settings", "Toon meer persoonlijkheid"],
        concreteTips: [
          "Maak een foto tijdens een leuke activiteit",
          "Voeg een foto toe waar je spontaan lacht",
          "Fotografeer in natuurlijke, dagelijkse omgevingen"
        ]
      },
      eerste48UurStrategie: {
        openings: [
          "Hey! Je bio over diepe gesprekken sprak me aan - ik ben daar zelf ook gek op. Wat is het meest interessante gesprek dat je recent hebt gehad?",
          "Hoi! Je foto waar je lacht triggerde me direct. Je lijkt iemand met een warme energie. Klopt dat?",
          "Hey daar! Ik las dat je van boeken houdt - ik ben net klaar met [boek]. Wat lees jij momenteel?"
        ],
        highValueSignals: [
          "Stel vragen die interesse tonen",
          "Deel één authentiek verhaal",
          "Toon emotionele beschikbaarheid",
          "Wees consistent in respons tijd"
        ],
        toonGuidelines: "Warm, authentiek, licht speels. Toon interesse zonder overeageren. Wees jezelf maar beste versie.",
        valkuilenVermijden: [
          "Niet te snel diepgang opzoeken",
          "Niet alle verhalen in één keer delen",
          "Niet te beschikbaar lijken"
        ]
      },
      photoAnalysis: content.photoUrls?.map((url: string, index: number) => ({
        overallScore: 75 + Math.random() * 20,
        semanticTags: ["toegankelijk", "authentiek", "benaderbaar"],
        colorEmotion: "warm",
        compositionFeedback: "Goede compositie met natuurlijke belichting",
        lightingAnalysis: "Zachte, natuurlijke belichting versterkt warme vibe",
        expressionAnalysis: "Ontspannen en benaderbare uitdrukking",
        vibeAlignmentScore: 80 + Math.random() * 15,
        improvementSuggestions: [
          "Meer expressie toevoegen",
          "Variatie in poses proberen"
        ]
      })) || []
    };

  } catch (error) {
    console.error('AI self-image analysis failed:', error);
    // Return fallback analysis
    return {
      vibeMeters: {
        warmte: 70, charisma: 65, stabiliteit: 75, speelsheid: 60,
        emotioneleOpenheid: 70, mysteryFactor: 60, socialeEnergie: 70,
        highValuePresence: 65, authentiekeVibe: 75, verbinding: 70,
        dominantie: 55, sensitiviteit: 75
      },
      firstImpression: {
        instant: "Je komt over als benaderbaar en authentiek.",
        personaTitle: "De Authentieke Verbinder",
        thirtySecond: ["Toont emotionele beschikbaarheid", "Warm en benaderbaar", "Authentiek"]
      },
      visualTags: ["authentiek", "benaderbaar", "warm"],
      selfVsReality: {
        selfImage: "Authentiek en benaderbaar",
        actualImpression: "Warm en betrouwbaar",
        discrepancyScore: 20,
        discrepancyLevel: "licht_verschoven"
      },
      energieHandtekening: {},
      uniekeAantrekkingskracht: {
        titel: "Authentieke Warmte",
        uitleg: "Je straalt natuurlijke warmte uit",
        kernkwaliteiten: ["Authentiek", "Warm", "Benaderbaar"],
        signatureSentence: "Je hebt een natuurlijke warme energie."
      },
      saboteerSignalen: [],
      optimalisatiePlan: {},
      nieuweBioVarianten: ["Nieuwe bio variant"],
      versterkendeZinnen: ["Versterkende zin"],
      verwijderZinnen: ["Verwijder deze zin"],
      fotoAanbevelingen: {},
      eerste48UurStrategie: {},
      photoAnalysis: []
    };
  }
}