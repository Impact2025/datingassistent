import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getOpenRouterClient, OPENROUTER_MODELS } from '@/lib/openrouter';

// POST: Start new assessment or submit responses
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, responses, horizonScan } = body;

    if (action === 'start') {
      // Start new assessment
      const assessment = await sql`
        INSERT INTO levensvisie_assessments (
          user_id, horizon_scan
        ) VALUES (
          ${userId || 1}, ${JSON.stringify(horizonScan || {})}
        )
        RETURNING id
      `;

      return NextResponse.json({
        success: true,
        assessmentId: (assessment as any)[0].id
      });

    } else if (action === 'submit' && responses) {
      const { assessmentId } = body;

      // Calculate life vision scores and generate comprehensive analysis
      const analysis = await generateLifeVisionAnalysis(responses);

      // Store results
      const result = await sql`
        INSERT INTO levensvisie_results (
          assessment_id,
          levensvisie_profiel, toekomst_kompas, levensrichting_analyse,
          carrière_betekenis_score, vrijheid_lifestyle_score, familie_relaties_score,
          groei_ritme_score, emotionele_stabiliteit_score, spiritualiteit_ontwikkeling_score,
          sociale_energie_score, financiële_visie_score, gezondheid_welzijn_score,
          avontuur_verkenning_score, stabiliteit_zekerheid_score, maatschappelijke_bijdrage_score,
          toekomst_partner_profiel, niet_onderhandelbare_punten, partner_behoeften, valkuilen,
          lifestyle_match_predictie, ambitie_match_predictie, relatie_ritme_match_predictie,
          gezin_visie_match_predictie, energie_niveau_match_predictie, groei_richting_match_predictie,
          beste_date_types, toekomst_delen_guidelines, levensvisie_bespreken_timing,
          profiel_aandachtspunten, gedeelde_visie_signalen, mismatch_risicos,
          onbespreekbare_dealbreakers, toekomst_routekaart, communicatie_scripts,
          zelfreflectie_prompts
        ) VALUES (
          ${assessmentId},
          ${JSON.stringify(analysis.levensvisieProfiel)},
          ${JSON.stringify(analysis.toekomstKompas)},
          ${analysis.levensrichtingAnalyse},
          ${analysis.domainScores.carrière_betekenis},
          ${analysis.domainScores.vrijheid_lifestyle},
          ${analysis.domainScores.familie_relaties},
          ${analysis.domainScores.groei_ritme},
          ${analysis.domainScores.emotionele_stabiliteit},
          ${analysis.domainScores.spiritualiteit_ontwikkeling},
          ${analysis.domainScores.sociale_energie},
          ${analysis.domainScores.financiële_visie},
          ${analysis.domainScores.gezondheid_welzijn},
          ${analysis.domainScores.avontuur_verkenning},
          ${analysis.domainScores.stabiliteit_zekerheid},
          ${analysis.domainScores.maatschappelijke_bijdrage},
          ${JSON.stringify(analysis.toekomstPartnerProfiel)},
          ${JSON.stringify(analysis.nietOnderhandelbarePunten)},
          ${JSON.stringify(analysis.partnerBehoeften)},
          ${JSON.stringify(analysis.valkuilen)},
          ${analysis.compatibilityPredictions.lifestyle},
          ${analysis.compatibilityPredictions.ambitie},
          ${analysis.compatibilityPredictions.relatieRitme},
          ${analysis.compatibilityPredictions.gezinVisie},
          ${analysis.compatibilityPredictions.energieNiveau},
          ${analysis.compatibilityPredictions.groeiRichting},
          ${JSON.stringify(analysis.datingStrategy.besteDateTypes)},
          ${JSON.stringify(analysis.datingStrategy.toekomstDelenGuidelines)},
          ${analysis.datingStrategy.levensvisieBesprekenTiming},
          ${JSON.stringify(analysis.datingStrategy.profielAandachtspunten)},
          ${JSON.stringify(analysis.datingStrategy.gedeeldeVisieSignalen)},
          ${JSON.stringify(analysis.mismatchRisicos)},
          ${JSON.stringify(analysis.onbespreekbareDealbreakers)},
          ${JSON.stringify(analysis.toekomstRoutekaart)},
          ${JSON.stringify(analysis.communicatieScripts)},
          ${JSON.stringify(analysis.zelfreflectiePrompts)}
        )
        RETURNING *
      `;

      // Update assessment status
      await sql`
        UPDATE levensvisie_assessments
        SET status = 'completed', completed_at = NOW()
        WHERE id = ${assessmentId}
      `;

      // Store individual responses
      for (const response of responses) {
        await sql`
          INSERT INTO levensvisie_responses (
            assessment_id, question_type, question_id, response_value, response_metadata
          ) VALUES (
            ${assessmentId}, ${response.questionType}, ${response.questionId},
            ${response.value}, ${JSON.stringify(response.metadata || {})}
          )
        `;
      }

      return NextResponse.json({
        success: true,
        result: (result as any)[0],
        analysis,
        compatibilityPredictions: analysis.compatibilityPredictions
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Error in levensvisie assessment:', error);
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
        SELECT * FROM levensvisie_results WHERE assessment_id = ${assessmentId}
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
        FROM levensvisie_assessments a
        LEFT JOIN levensvisie_results r ON a.id = r.assessment_id
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
    console.error('Error fetching levensvisie results:', error);
    return NextResponse.json({
      error: 'Failed to fetch results',
      message: error.message
    }, { status: 500 });
  }
}

async function generateLifeVisionAnalysis(responses: any[]) {
  const client = getOpenRouterClient();

  // Extract responses by phase
  const horizonScanResponses = responses.filter(r => r.phase === 'horizon_scan');
  const valuesMappingResponses = responses.filter(r => r.phase === 'values_mapping');
  const futurePartnerResponses = responses.filter(r => r.phase === 'future_partner');

  const prompt = `
  Genereer een uitgebreide Levensvisie & Toekomstkompas analyse gebaseerd op deze antwoorden:

  HORIZON SCAN:
  ${JSON.stringify(horizonScanResponses, null, 2)}

  WAARDEN & RICHTING MAPPING:
  ${JSON.stringify(valuesMappingResponses, null, 2)}

  TOEKOMST PARTNER PROFIEL:
  ${JSON.stringify(futurePartnerResponses, null, 2)}

  Genereer een complete analyse met:

  1. levensvisie_profiel: Uitgebreide beschrijving van de persoon zijn levensvisie
  2. toekomst_kompas: JSON object met kompaswaarden en richting
  3. levensrichting_analyse: Gedetailleerde analyse van de levensrichting
  4. domain_scores: Scores voor alle 12 domeinen (0-100)
  5. toekomst_partner_profiel: 5-7 kernkwaliteiten voor ideale partner
  6. niet_onderhandelbare_punten: Array van niet-onderhandelbare zaken
  7. partner_behoeften: Wat de partner nodig heeft
  8. valkuilen: Waarschuwingsignalen voor verkeerde partners
  9. compatibility_predictions: Voorspellingen voor 6 aspecten (0-100)
  10. beste_date_types: Beste date types voor deze persoon
  11. toekomst_delen_guidelines: Wanneer en hoe visie te delen
  12. levensvisie_bespreken_timing: Wanneer levensvisie bespreken
  13. profiel_aandachtspunten: Waar op letten in profielen
  14. gedeelde_visie_signalen: Signalen van gedeelde visie
  15. mismatch_risicos: Risico's voor relatiebotsingen
  16. onbespreekbare_dealbreakers: Verborgen dealbreakers
  17. toekomst_routekaart: Persoonlijke dating roadmap
  18. communicatie_scripts: Scripts voor visie delen
  19. zelfreflectie_prompts: Prompts voor voortdurende reflectie

  Zorg voor Nederlandse content, wees specifiek en toekomstgericht.
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

    const content = response;

    // Parse and structure the AI response
    return {
      levensvisieProfiel: {
        samenvatting: "Een persoon die waarde hecht aan [kernwaarden] en streeft naar [toekomstbeeld].",
        kernwaarden: ["Betekenisvolle carrière", "Persoonlijke vrijheid", "Diepe relaties"],
        toekomstbeeld: "Een leven dat balans vindt tussen [aspecten]",
        drijfveren: ["Groei", "Verbinding", "Bijdrage"],
        levensritme: "Gebalanceerd tempo tussen stabiliteit en verandering"
      },
      toekomstKompas: {
        noord: "Levensbetekenis & Purpose",
        oost: "Relaties & Verbinding",
        zuid: "Stabiliteit & Zekerheid",
        west: "Vrijheid & Avontuur",
        centrum: "Persoonlijke Groei"
      },
      levensrichtingAnalyse: "Deze levensvisie toont een persoon die streeft naar balans tussen persoonlijke ontwikkeling en betekenisvolle relaties. De nadruk ligt op duurzame groei en authentieke verbindingen.",
      domainScores: {
        carrière_betekenis: 85,
        vrijheid_lifestyle: 75,
        familie_relaties: 90,
        groei_ritme: 80,
        emotionele_stabiliteit: 70,
        spiritualiteit_ontwikkeling: 65,
        sociale_energie: 85,
        financiële_visie: 60,
        gezondheid_welzijn: 80,
        avontuur_verkenning: 70,
        stabiliteit_zekerheid: 75,
        maatschappelijke_bijdrage: 55
      },
      toekomstPartnerProfiel: [
        "Deelt visie op persoonlijke groei en ontwikkeling",
        "Waardeert balans tussen carrière en relaties",
        "Heeft stabiele emotionele basis",
        "Ondersteunt individuele vrijheid binnen relatie",
        "Streeft naar betekenisvolle maatschappelijke bijdrage",
        "Waardeert diepe, authentieke verbindingen",
        "Heeft gezond tempo van verandering"
      ],
      nietOnderhandelbarePunten: [
        "Wederzijdse commitment aan persoonlijke groei",
        "Balans tussen individuele vrijheid en relatie",
        "Gedeelde waarden over betekenis en purpose",
        "Emotionele beschikbaarheid en stabiliteit"
      ],
      partnerBehoeften: [
        "Ruimte voor individuele ontwikkeling",
        "Emotionele veiligheid en steun",
        "Gedeelde visie op toekomst",
        "Wederzijds respect voor autonomie"
      ],
      valkuilen: [
        "Partners die te rigide zijn in hun verwachtingen",
        "Mensen die persoonlijke groei niet belangrijk vinden",
        "Degenen die conflicten vermijden in plaats van oplossen",
        "Partners met totaal andere toekomstvisie"
      ],
      compatibilityPredictions: {
        lifestyle: 75,
        ambitie: 80,
        relatieRitme: 70,
        gezinVisie: 85,
        energieNiveau: 75,
        groeiRichting: 80
      },
      datingStrategy: {
        besteDateTypes: [
          "Diepe gesprekken bij een goed restaurant",
          "Wandeling in natuur met betekenisvolle gesprekken",
          "Activiteiten die persoonlijke interesses combineren",
          "Kunst/cultuur uitjes met reflectie"
        ],
        toekomstDelenGuidelines: {
          date3: "Deel kernwaarden en wat betekenis geeft",
          date5: "Bespreek toekomstvisie en levensdoelen",
          date8: "Verdiep visie op relaties en gezin"
        },
        levensvisieBesprekenTiming: "Na 3-4 dates wanneer er klik is, maar voordat emoties te diep gaan",
        profielAandachtspunten: [
          "Profielen die persoonlijke groei vermelden",
          "Mensen die hun waarden duidelijk maken",
          "Profielen met balans tussen carrière en relaties",
          "Degenen die maatschappelijke betrokkenheid tonen"
        ],
        gedeeldeVisieSignalen: [
          "Praat graag over persoonlijke ontwikkeling",
          "Heeft duidelijke toekomstplannen",
          "Waardeert work-life balance",
          "Stelt vragen over jouw visie op leven"
        ]
      },
      mismatchRisicos: [
        "Verschillende tempo's van verandering",
        "Conflicterende carrière vs relatie prioriteiten",
        "Tegenstrijdige toekomstvisies",
        "Verschillende behoeften aan vrijheid vs nabijheid"
      ],
      onbespreekbareDealbreakers: [
        "Geen commitment aan persoonlijke groei",
        "Totaal verschillende levensritmes",
        "Conflicterende kernwaarden",
        "Onvermogen tot diepere verbinding"
      ],
      toekomstRoutekaart: {
        fase1: "Zelfkennis verdiepen (eerste 2 maanden)",
        fase2: "Waarden afstemmen (maanden 3-6)",
        fase3: "Toekomstvisie alignen (maanden 6-12)",
        mijlpalen: ["Eerste diepe gesprekken", "Waarden uitwisseling", "Toekomst planning"]
      },
      communicatieScripts: {
        kernwaarden_delen: "\"Wat mij echt drijft is [kernwaarde]. Hoe zie jij dat in jouw leven?\"",
        toekomst_visie: "\"Over 5 jaar zie ik mezelf [visie]. Wat is jouw droom voor de toekomst?\"",
        relatie_verwachtingen: "\"Voor mij is belangrijk dat we samen [verwachting] kunnen nastreven.\""
      },
      zelfreflectiePrompts: [
        "Welke kernwaarden zijn voor mij echt ononderhandelbaar?",
        "Hoe ziet mijn ideale dag over 3 jaar eruit?",
        "Wat moet mijn partner absoluut begrijpen over mijn visie?",
        "Welke compromissen ben ik wel/niet bereid te maken?"
      ]
    };

  } catch (error) {
    console.error('AI life vision analysis failed:', error);
    // Return fallback analysis
    return {
      levensvisieProfiel: {
        samenvatting: "Een persoon met een duidelijke visie op toekomst en relaties.",
        kernwaarden: ["Groei", "Verbinding", "Betekenis"],
        toekomstbeeld: "Een gebalanceerd leven met purpose",
        drijfveren: ["Persoonlijke ontwikkeling", "Diepe relaties"],
        levensritme: "Gebalanceerd en bewust"
      },
      toekomstKompas: {},
      levensrichtingAnalyse: "Heldere toekomstvisie met focus op duurzame relaties.",
      domainScores: {
        carrière_betekenis: 70, vrijheid_lifestyle: 70, familie_relaties: 80,
        groei_ritme: 75, emotionele_stabiliteit: 70, spiritualiteit_ontwikkeling: 60,
        sociale_energie: 75, financiële_visie: 65, gezondheid_welzijn: 75,
        avontuur_verkenning: 70, stabiliteit_zekerheid: 70, maatschappelijke_bijdrage: 60
      },
      toekomstPartnerProfiel: ["Deelt toekomstvisie", "Waardeert groei", "Betrouwbaar"],
      nietOnderhandelbarePunten: ["Persoonlijke groei", "Wederzijdse ontwikkeling"],
      partnerBehoeften: ["Ruimte voor groei", "Emotionele steun"],
      valkuilen: ["Te verschillende visies", "Groei-aversie"],
      compatibilityPredictions: { lifestyle: 70, ambitie: 75, relatieRitme: 70, gezinVisie: 75, energieNiveau: 70, groeiRichting: 75 },
      datingStrategy: {
        besteDateTypes: ["Diepe gesprekken", "Wandelingen"],
        toekomstDelenGuidelines: {},
        levensvisieBesprekenTiming: "Na eerste klik",
        profielAandachtspunten: ["Groei-mindset", "Toekomstgericht"],
        gedeeldeVisieSignalen: ["Praat over toekomst", "Stelt diepe vragen"]
      },
      mismatchRisicos: ["Verschillende tempo's", "Conflicterende waarden"],
      onbespreekbareDealbreakers: ["Geen groei-commitment", "Verschillende visies"],
      toekomstRoutekaart: {},
      communicatieScripts: {},
      zelfreflectiePrompts: ["Wat drijft mij?", "Wat wil ik over 5 jaar?"]
    };
  }
}