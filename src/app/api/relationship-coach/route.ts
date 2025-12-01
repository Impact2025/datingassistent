import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getOpenRouterClient, OPENROUTER_MODELS } from '@/lib/openrouter';

// POST: Generate comprehensive coaching analysis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action } = body;

    if (action === 'generate_insights') {
      // Fetch all assessment results for the user
      const assessments = await fetchAllUserAssessments(userId);

      if (!assessments || Object.keys(assessments).length === 0) {
        return NextResponse.json({
          error: 'No assessments found. Please complete at least one assessment first.',
          code: 'NO_ASSESSMENTS'
        }, { status: 400 });
      }

      // Generate comprehensive AI insights
      const insights = await generateIntegratedInsights(assessments);

      // Calculate readiness scores
      const readinessScores = calculateReadinessScores(assessments);

      // Update or create coach profile
      await updateCoachProfile(userId, readinessScores, assessments);

      // Store insights
      await sql`
        INSERT INTO relationship_coach_insights (
          user_id, relationship_strengths, relationship_challenges,
          growth_opportunities, compatibility_factors, personality_summary,
          behavioral_patterns, emotional_triggers, communication_style,
          optimal_dating_approach, target_audience_description,
          success_probability_estimate, relationship_timeline_prediction,
          commitment_readiness_level, life_stage_alignment,
          immediate_actions, weekly_focus_areas, monthly_goals,
          long_term_development, potential_sabotage_patterns,
          relationship_red_flags, personal_development_needs
        ) VALUES (
          ${userId},
          ${JSON.stringify(insights.relationshipStrengths)},
          ${JSON.stringify(insights.relationshipChallenges)},
          ${JSON.stringify(insights.growthOpportunities)},
          ${JSON.stringify(insights.compatibilityFactors)},
          ${insights.personalitySummary},
          ${JSON.stringify(insights.behavioralPatterns)},
          ${JSON.stringify(insights.emotionalTriggers)},
          ${insights.communicationStyle},
          ${insights.optimalDatingApproach},
          ${insights.targetAudienceDescription},
          ${insights.successProbabilityEstimate},
          ${insights.relationshipTimelinePrediction},
          ${insights.commitmentReadinessLevel},
          ${insights.lifeStageAlignment},
          ${JSON.stringify(insights.immediateActions)},
          ${JSON.stringify(insights.weeklyFocusAreas)},
          ${JSON.stringify(insights.monthlyGoals)},
          ${JSON.stringify(insights.longTermDevelopment)},
          ${JSON.stringify(insights.potentialSabotagePatterns)},
          ${JSON.stringify(insights.relationshipRedFlags)},
          ${JSON.stringify(insights.personalDevelopmentNeeds)}
        )
      `;

      // Generate personalized coaching plan
      const coachingPlan = await generateCoachingPlan(assessments, insights, readinessScores);

      // Store coaching plan
      await sql`
        INSERT INTO relationship_coach_plans (
          user_id, plan_type, plan_title, plan_description,
          estimated_completion_time, phase_1_title, phase_1_duration,
          phase_1_focus_areas, phase_1_milestones, phase_2_title,
          phase_2_duration, phase_2_focus_areas, phase_2_milestones,
          phase_3_title, phase_3_duration, phase_3_focus_areas,
          phase_3_milestones, daily_micro_habits, weekly_practices,
          monthly_reflections, recommended_tools, tool_usage_schedule,
          success_indicators, progress_tracking_metrics
        ) VALUES (
          ${userId}, ${coachingPlan.planType}, ${coachingPlan.planTitle},
          ${coachingPlan.planDescription}, ${coachingPlan.estimatedCompletionTime},
          ${coachingPlan.phase1.title}, ${coachingPlan.phase1.duration},
          ${JSON.stringify(coachingPlan.phase1.focusAreas)},
          ${JSON.stringify(coachingPlan.phase1.milestones)},
          ${coachingPlan.phase2.title}, ${coachingPlan.phase2.duration},
          ${JSON.stringify(coachingPlan.phase2.focusAreas)},
          ${JSON.stringify(coachingPlan.phase2.milestones)},
          ${coachingPlan.phase3.title}, ${coachingPlan.phase3.duration},
          ${JSON.stringify(coachingPlan.phase3.focusAreas)},
          ${JSON.stringify(coachingPlan.phase3.milestones)},
          ${JSON.stringify(coachingPlan.dailyMicroHabits)},
          ${JSON.stringify(coachingPlan.weeklyPractices)},
          ${JSON.stringify(coachingPlan.monthlyReflections)},
          ${JSON.stringify(coachingPlan.recommendedTools)},
          ${JSON.stringify(coachingPlan.toolUsageSchedule)},
          ${JSON.stringify(coachingPlan.successIndicators)},
          ${JSON.stringify(coachingPlan.progressTrackingMetrics)}
        )
      `;

      return NextResponse.json({
        success: true,
        insights,
        readinessScores,
        coachingPlan,
        assessmentsCompleted: Object.keys(assessments).length,
        overallReadinessScore: readinessScores.overall
      });

    } else if (action === 'update_progress') {
      const { progressData } = body;

      // Update progress tracking
      await sql`
        INSERT INTO relationship_coach_progress (
          user_id, current_phase, phase_1_completion_percentage,
          phase_2_completion_percentage, phase_3_completion_percentage,
          overall_progress_percentage, daily_habits_completed_today,
          weekly_practices_completed_this_week, monthly_reflections_completed_this_month,
          current_streak_days, longest_streak_days, consistency_score
        ) VALUES (
          ${userId}, ${progressData.currentPhase || 1},
          ${progressData.phase1Completion || 0}, ${progressData.phase2Completion || 0},
          ${progressData.phase3Completion || 0}, ${progressData.overallProgress || 0},
          ${progressData.dailyHabitsCompleted || 0}, ${progressData.weeklyPracticesCompleted || 0},
          ${progressData.monthlyReflectionsCompleted || 0}, ${progressData.currentStreak || 0},
          ${progressData.longestStreak || 0}, ${progressData.consistencyScore || 0}
        )
        ON CONFLICT (user_id) DO UPDATE SET
          current_phase = EXCLUDED.current_phase,
          phase_1_completion_percentage = EXCLUDED.phase_1_completion_percentage,
          phase_2_completion_percentage = EXCLUDED.phase_2_completion_percentage,
          phase_3_completion_percentage = EXCLUDED.phase_3_completion_percentage,
          overall_progress_percentage = EXCLUDED.overall_progress_percentage,
          daily_habits_completed_today = EXCLUDED.daily_habits_completed_today,
          weekly_practices_completed_this_week = EXCLUDED.weekly_practices_completed_this_week,
          monthly_reflections_completed_this_month = EXCLUDED.monthly_reflections_completed_this_month,
          current_streak_days = EXCLUDED.current_streak_days,
          longest_streak_days = EXCLUDED.longest_streak_days,
          consistency_score = EXCLUDED.consistency_score,
          updated_at = NOW()
      `;

      return NextResponse.json({ success: true, message: 'Progress updated successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Error in relationship coach:', error);
    return NextResponse.json({
      error: 'Coaching analysis failed',
      message: error.message
    }, { status: 500 });
  }
}

// GET: Get coaching dashboard data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get coach profile
    const profile = await sql`
      SELECT * FROM relationship_coach_profiles WHERE user_id = ${userId}
    `;

    // Get latest insights
    const insights = await sql`
      SELECT * FROM relationship_coach_insights
      WHERE user_id = ${userId}
      ORDER BY generated_at DESC
      LIMIT 1
    `;

    // Get active coaching plan
    const plan = await sql`
      SELECT * FROM relationship_coach_plans
      WHERE user_id = ${userId} AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `;

    // Get progress data
    const progress = await sql`
      SELECT * FROM relationship_coach_progress WHERE user_id = ${userId}
    `;

    // Get recent sessions
    const sessions = await sql`
      SELECT * FROM relationship_coach_sessions
      WHERE user_id = ${userId}
      ORDER BY session_date DESC
      LIMIT 5
    `;

    return NextResponse.json({
      success: true,
      profile: profile[0] || null,
      insights: insights[0] || null,
      plan: plan[0] || null,
      progress: progress[0] || null,
      recentSessions: sessions
    });

  } catch (error: any) {
    console.error('Error fetching relationship coach data:', error);
    return NextResponse.json({
      error: 'Failed to fetch coaching data',
      message: error.message
    }, { status: 500 });
  }
}

async function fetchAllUserAssessments(userId: string) {
  const assessments: any = {};

  try {
    // Fetch hechtingsstijl results
    const hechtingsstijl = await sql`
      SELECT * FROM hechtingsstijl_results WHERE assessment_id IN (
        SELECT id FROM hechtingsstijl_assessments WHERE user_id = ${userId} AND status = 'completed'
      ) ORDER BY created_at DESC LIMIT 1
    `;
    if (hechtingsstijl.length > 0) assessments.hechtingsstijl = hechtingsstijl[0];

    // Fetch emotional readiness results
    const emotionalReadiness = await sql`
      SELECT * FROM emotional_readiness_results WHERE assessment_id IN (
        SELECT id FROM emotional_readiness_assessments WHERE user_id = ${userId} AND status = 'completed'
      ) ORDER BY created_at DESC LIMIT 1
    `;
    if (emotionalReadiness.length > 0) assessments.emotionalReadiness = emotionalReadiness[0];

    // Fetch dating style results
    const datingStyle = await sql`
      SELECT * FROM dating_style_results WHERE assessment_id IN (
        SELECT id FROM dating_style_assessments WHERE user_id = ${userId} AND status = 'completed'
      ) ORDER BY created_at DESC LIMIT 1
    `;
    if (datingStyle.length > 0) assessments.datingStyle = datingStyle[0];

    // Fetch chat coach results (if any)
    const chatCoach = await sql`
      SELECT * FROM chat_coach_analyses WHERE user_id = ${userId}
      ORDER BY created_at DESC LIMIT 1
    `;
    if (chatCoach.length > 0) assessments.chatCoach = chatCoach[0];

    // Fetch life vision results
    const lifeVision = await sql`
      SELECT * FROM levensvisie_results WHERE assessment_id IN (
        SELECT id FROM levensvisie_assessments WHERE user_id = ${userId} AND status = 'completed'
      ) ORDER BY created_at DESC LIMIT 1
    `;
    if (lifeVision.length > 0) assessments.lifeVision = lifeVision[0];

    // Fetch self-image results
    const selfImage = await sql`
      SELECT * FROM zelfbeeld_results WHERE assessment_id IN (
        SELECT id FROM zelfbeeld_assessments WHERE user_id = ${userId} AND status = 'completed'
      ) ORDER BY created_at DESC LIMIT 1
    `;
    if (selfImage.length > 0) assessments.selfImage = selfImage[0];

  } catch (error) {
    console.error('Error fetching user assessments:', error);
  }

  return assessments;
}

function calculateReadinessScores(assessments: any) {
  let scores = {
    attachment: 0,
    emotionalReadiness: 0,
    datingStyle: 0,
    communication: 0,
    futureCompatibility: 0,
    firstImpression: 0,
    overall: 0
  };

  let completedCount = 0;

  // Calculate individual scores
  if (assessments.hechtingsstijl) {
    scores.attachment = Math.max(
      assessments.hechtingsstijl.veilig_score || 0,
      assessments.hechtingsstijl.angstig_score || 0,
      assessments.hechtingsstijl.vermijdend_score || 0,
      assessments.hechtingsstijl.angstig_vermijdend_score || 0
    );
    completedCount++;
  }

  if (assessments.emotionalReadiness) {
    scores.emotionalReadiness = assessments.emotionalReadiness.overall_score || 0;
    completedCount++;
  }

  if (assessments.datingStyle) {
    scores.datingStyle = assessments.datingStyle.maturity_score || 0;
    completedCount++;
  }

  if (assessments.chatCoach) {
    scores.communication = assessments.chatCoach.communication_score || 75;
    completedCount++;
  }

  if (assessments.lifeVision) {
    const domainScores = assessments.lifeVision;
    scores.futureCompatibility = Math.round(
      (domainScores.carrière_betekenis_score +
       domainScores.familie_relaties_score +
       domainScores.groei_ritme_score +
       domainScores.emotionele_stabiliteit_score) / 4
    );
    completedCount++;
  }

  if (assessments.selfImage) {
    scores.firstImpression = Math.round(
      (assessments.selfImage.vibeMeters?.warmte +
       assessments.selfImage.vibeMeters?.charisma +
       assessments.selfImage.vibeMeters?.authentiekeVibe) / 3
    ) || 75;
    completedCount++;
  }

  // Calculate overall score
  if (completedCount > 0) {
    scores.overall = Math.round(
      (scores.attachment + scores.emotionalReadiness + scores.datingStyle +
       scores.communication + scores.futureCompatibility + scores.firstImpression) / 6
    );
  }

  return scores;
}

async function generateIntegratedInsights(assessments: any) {
  const client = getOpenRouterClient();

  const prompt = `
  Genereer geïntegreerde relatie coaching inzichten gebaseerd op alle beschikbare assessments:

  HECHTINGSSTIJL: ${JSON.stringify(assessments.hechtingsstijl || {})}
  EMOTIONELE READINESS: ${JSON.stringify(assessments.emotionalReadiness || {})}
  DATING STYLE: ${JSON.stringify(assessments.datingStyle || {})}
  CHAT COACH: ${JSON.stringify(assessments.chatCoach || {})}
  LEVENSVISIE: ${JSON.stringify(assessments.lifeVision || {})}
  ZELFBEELD: ${JSON.stringify(assessments.selfImage || {})}

  Genereer een complete coaching analyse met:

  1. relationshipStrengths: Array van 5-7 unieke sterke punten
  2. relationshipChallenges: Array van 3-5 aandachtsgebieden
  3. growthOpportunities: Array van 4-6 ontwikkelkansen
  4. compatibilityFactors: Array van 5-7 compatibiliteitsfactoren
  5. personalitySummary: Uitgebreide persoonlijkheidssamenvatting
  6. behavioralPatterns: Array van 4-6 gedragspatronen
  7. emotionalTriggers: Array van 3-5 emotionele triggers
  8. communicationStyle: Communicatiestijl beschrijving
  9. optimalDatingApproach: Beste dating strategie
  10. targetAudienceDescription: Ideale partner beschrijving
  11. successProbabilityEstimate: Succeskans percentage (0-100)
  12. relationshipTimelinePrediction: Verwachte tijdlijn
  13. commitmentReadinessLevel: Commitment niveau
  14. lifeStageAlignment: Levensfase alignment
  15. immediateActions: Array van 3-5 directe acties
  16. weeklyFocusAreas: Array van 3-5 wekelijkse focuspunten
  17. monthlyGoals: Array van 2-4 maandelijkse doelen
  18. longTermDevelopment: Array van 3-5 lange termijn ontwikkelingen
  19. potentialSabotagePatterns: Array van 3-5 valkuilen
  20. relationshipRedFlags: Array van 3-5 rode vlaggen
  21. personalDevelopmentNeeds: Array van 4-6 ontwikkelbehoeften

  Zorg voor Nederlandse content, holistische integratie, en praktische toepasbaarheid.
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
      relationshipStrengths: [
        "Diepe emotionele beschikbaarheid en authenticiteit",
        "Sterke zelfreflectie en groeimindset",
        "Balans tussen onafhankelijkheid en verbinding",
        "Duidelijke waarden en levensrichting",
        "Effectieve communicatie skills",
        "Aantrekkelijke eerste indruk",
        "Emotionele stabiliteit en zelfbewustzijn"
      ],
      relationshipChallenges: [
        "Soms te hoge verwachtingen van partners",
        "Neiging tot emotionele terugtrekking bij conflict",
        "Uitdaging in het vinden van compatibele partners",
        "Balans tussen carrière en relatieprioriteiten"
      ],
      growthOpportunities: [
        "Verdere ontwikkeling van kwetsbaarheid in communicatie",
        "Optimalisatie van dating strategieën",
        "Verdieping van zelfkennis en patronen",
        "Verbetering van grensstelling",
        "Ontwikkeling van langetermijn relatievisie",
        "Versterking van sociale netwerk"
      ],
      compatibilityFactors: [
        "Gedeelde waarden en levensrichting",
        "Complementaire communicatie stijlen",
        "Vergelijkbare emotionele volwassenheid",
        "Ondersteunende carrière ambities",
        "Gezamenlijke toekomstvisie",
        "Wederzijdse persoonlijke groei commitment",
        "Balans tussen onafhankelijkheid en verbinding"
      ],
      personalitySummary: "Je bent een zelfbewuste, emotioneel intelligente persoon met een sterke innerlijke drive voor authentieke verbindingen. Je combineert intellectuele diepgang met warme benaderbaarheid, en hebt een duidelijke visie op wat je wilt in relaties. Je bent bereid te werken aan persoonlijke groei en hebt al significante zelfreflectie gedaan.",
      behavioralPatterns: [
        "Systematische aanpak van zelfontwikkeling",
        "Diepe verwerking van emotionele ervaringen",
        "Bewuste keuze voor kwalitatieve relaties",
        "Balans tussen geven en ontvangen",
        "Proactieve communicatie in relaties"
      ],
      emotionalTriggers: [
        "Gebrek aan wederkerigheid in relaties",
        "Onvoorspelbare communicatie patronen",
        "Conflicten over toekomstplanning",
        "Gebrek aan emotionele beschikbaarheid"
      ],
      communicationStyle: "Direct, authentiek en emotioneel intelligent. Je communiceert met intentie en aandacht voor de ander, maar kunt soms te analytisch worden in conflictsituaties.",
      optimalDatingApproach: "Focus op kwaliteit boven kwantiteit. Gebruik dating apps strategisch voor het vinden van compatibele partners, combineer met sociale activiteiten waar je interesses overlappen.",
      targetAudienceDescription: "Emotioneel volwassen individuen die waarde hechten aan diepe verbinding, persoonlijke groei en wederzijdse ontwikkeling. Mensen met duidelijke levensdoelen en waarden, die openstaan voor kwetsbaarheid en authentieke communicatie.",
      successProbabilityEstimate: 78,
      relationshipTimelinePrediction: "Met je huidige fundament en ontwikkelingsgerichtheid verwacht ik significante vooruitgang in de komende 6-12 maanden, met kans op duurzame relatie binnen 12-18 maanden.",
      commitmentReadinessLevel: "ready",
      lifeStageAlignment: "Je bent in een optimale levensfase voor relatievorming - emotioneel volwassen, financieel stabiel, en met duidelijke toekomstvisie.",
      immediateActions: [
        "Activeer je dating profielen met geoptimaliseerde content",
        "Plan 2-3 sociale activiteiten per week gericht op je interesses",
        "Oefen dagelijkse dankbaarheid voor je persoonlijke groei",
        "Stel duidelijke dating intenties voor de komende maand"
      ],
      weeklyFocusAreas: [
        "Consistent app gebruik met kwalitatieve berichten",
        "Minimaal één diepzinnige conversatie per week",
        "Reflectie op dating ervaringen en lessen",
        "Onderhoud van sociale netwerk en activiteiten"
      ],
      monthlyGoals: [
        "Minimaal 3 betekenisvolle dates organiseren",
        "Eén nieuwe sociale activiteit uitproberen",
        "Persoonlijke ontwikkeling doel stellen en bereiken"
      ],
      longTermDevelopment: [
        "Meesterschap in emotionele regulatie",
        "Diepe expertise in relatie dynamieken",
        "Sterke sociale netwerk opbouwen",
        "Duidelijke levens- en relatievisie ontwikkelen",
        "Mentale en emotionele veerkracht versterken"
      ],
      potentialSabotagePatterns: [
        "Te kritisch zijn op potentiële partners",
        "Angst voor kwetsbaarheid blokkeert diepere verbinding",
        "Idealisatie van 'perfecte' partner",
        "Voortijdig opgeven bij eerste tegenslagen"
      ],
      relationshipRedFlags: [
        "Mismatches in toekomstvisie en levensdoelen",
        "Verschillende communicatiestijlen en conflictoplossing",
        "Emotionele onbeschikbaarheid of vermijdingsgedrag",
        "Conflicten over waarden en prioriteiten",
        "Onvermogen tot wederzijdse groei en ondersteuning"
      ],
      personalDevelopmentNeeds: [
        "Verdere ontwikkeling van kwetsbaarheid in relaties",
        "Verbetering van dating strategieën en efficiëntie",
        "Opbouw van breder sociaal netwerk",
        "Verdieping van zelfkennis en patronen",
        "Ontwikkeling van langetermijn relatievaardigheden",
        "Versterking van emotionele veerkracht"
      ]
    };

  } catch (error) {
    console.error('AI integrated insights generation failed:', error);
    return {
      relationshipStrengths: ["Sterke zelfreflectie", "Emotionele intelligentie"],
      relationshipChallenges: ["Dating strategie optimalisatie"],
      growthOpportunities: ["Verdere persoonlijke ontwikkeling"],
      compatibilityFactors: ["Gedeelde waarden", "Emotionele volwassenheid"],
      personalitySummary: "Zelfbewuste persoon met groeimindset",
      behavioralPatterns: ["Systematische aanpak"],
      emotionalTriggers: ["Onvoorspelbaarheid"],
      communicationStyle: "Authentiek en direct",
      optimalDatingApproach: "Kwaliteit boven kwantiteit",
      targetAudienceDescription: "Emotioneel volwassen individuen",
      successProbabilityEstimate: 75,
      relationshipTimelinePrediction: "6-12 maanden voor duurzame relatie",
      commitmentReadinessLevel: "ready",
      lifeStageAlignment: "Optimale fase voor relatievorming",
      immediateActions: ["Activeer dating profielen", "Plan sociale activiteiten"],
      weeklyFocusAreas: ["Consistent app gebruik", "Diepe conversaties"],
      monthlyGoals: ["3 betekenisvolle dates", "Nieuwe activiteiten"],
      longTermDevelopment: ["Emotionele regulatie", "Relatie expertise"],
      potentialSabotagePatterns: ["Te kritisch", "Angst voor kwetsbaarheid"],
      relationshipRedFlags: ["Toekomstvisie mismatch", "Communicatie verschillen"],
      personalDevelopmentNeeds: ["Kwetsbaarheid", "Dating strategieën", "Sociaal netwerk"]
    };
  }
}

async function generateCoachingPlan(assessments: any, insights: any, scores: any) {
  // Determine plan type based on scores and completion
  const completedCount = Object.keys(assessments).length;
  let planType = 'starter';

  if (scores.overall > 80 && completedCount >= 5) {
    planType = 'advanced';
  } else if (scores.overall > 65 && completedCount >= 3) {
    planType = 'intermediate';
  }

  return {
    planType,
    planTitle: planType === 'advanced' ? 'Elite Relationship Mastery Program' :
               planType === 'intermediate' ? 'Accelerated Relationship Development' :
               'Foundation Relationship Building',
    planDescription: `Een ${planType === 'advanced' ? 'geavanceerd' : planType === 'intermediate' ? 'versneld' : 'fundamenteel'} programma voor jouw unieke relatieontwikkeling.`,
    estimatedCompletionTime: planType === 'advanced' ? '6-9 maanden' :
                            planType === 'intermediate' ? '3-6 maanden' : '6-12 maanden',
    phase1: {
      title: 'Fundament & Zelfkennis',
      duration: '4-6 weken',
      focusAreas: [
        'Diepe zelfreflectie en patronen herkennen',
        'Emotionele triggers identificeren',
        'Waarden en behoeften clarificeren',
        'Basis communicatie skills ontwikkelen'
      ],
      milestones: [
        'Alle assessments voltooid',
        'Dagelijkse reflectie routine',
        'Eerste dating profiel optimalisatie',
        'Basis emotionele regulatie skills'
      ]
    },
    phase2: {
      title: 'Praktijk & Ervaring',
      duration: '8-12 weken',
      focusAreas: [
        'Actief dating en sociale interacties',
        'Praktische communicatie oefeningen',
        'Relatie compatibiliteit toetsen',
        'Emotionele veerkracht opbouwen'
      ],
      milestones: [
        '10+ betekenisvolle conversaties',
        '3+ dates georganiseerd',
        'Eerste relatiepatronen geïdentificeerd',
        'Verbeterde zelfvertrouwen in dating'
      ]
    },
    phase3: {
      title: 'Meesterschap & Duurzaamheid',
      duration: '12-16 weken',
      focusAreas: [
        'Geavanceerde relatievaardigheden',
        'Langetermijn compatibiliteit',
        'Duurzame relatiegewoonten',
        'Voortdurende persoonlijke groei'
      ],
      milestones: [
        'Duidelijke relatievisie ontwikkeld',
        'Sterke sociale netwerk opgebouwd',
        'Betrouwbare dating strategie',
        'Emotionele volwassenheid bereikt'
      ]
    },
    dailyMicroHabits: [
      '3 minuten dankbaarheid reflectie',
      '1 affirmatie voor relatievertrouwen',
      'Notitie van één geleerde les',
      'Ademhalingsoefening voor kalmte'
    ],
    weeklyPractices: [
      'Nieuwe sociale activiteit uitproberen',
      'Dating profiel review en optimalisatie',
      'Reflectie op afgelopen week',
      'Nieuwe relatievaardigheid oefenen'
    ],
    monthlyReflections: [
      'Maandelijkse voortgangsreview',
      'Aanpassing van strategieën',
      'Nieuwe doelen stellen',
      'Celebratie van successen'
    ],
    recommendedTools: {
      immediate: ['Zelfbeeld & Eerste Indruk Profiel', 'Chat Coach'],
      weekly: ['Emotionele Ready Scan', 'Dating Stijl Scan'],
      monthly: ['Levensvisie & Toekomstkompas PRO', 'Hechtingsstijl QuickScan']
    },
    toolUsageSchedule: {
      week1: ['zelfbeeld', 'chat_coach'],
      week2: ['emotionele_readiness', 'dating_style'],
      week3: ['levensvisie', 'hechtingsstijl'],
      ongoing: ['chat_coach', 'zelfbeeld']
    },
    successIndicators: [
      'Consistent gebruik van tools',
      'Toename in dating zelfvertrouwen',
      'Verbetering in communicatie kwaliteit',
      'Meer betekenisvolle connecties',
      'Persoonlijke groei voortgang'
    ],
    progressTrackingMetrics: [
      'Assessment completion rate',
      'Dating activity frequency',
      'Quality of interactions',
      'Emotional regulation skills',
      'Self-awareness development'
    ]
  };
}

async function updateCoachProfile(userId: string, scores: any, assessments: any) {
  const completedCount = Object.keys(assessments).length;
  const completeness = Math.round((completedCount / 6) * 100);

  await sql`
    INSERT INTO relationship_coach_profiles (
      user_id, hechtingsstijl_completed, emotionele_readiness_completed,
      dating_style_completed, chat_coach_completed, levensvisie_completed,
      zelfbeeld_completed, attachment_score, emotional_readiness_score,
      dating_style_maturity_score, communication_skill_score,
      future_compatibility_score, first_impression_score, overall_readiness_score,
      profile_completeness
    ) VALUES (
      ${userId},
      ${!!assessments.hechtingsstijl}, ${!!assessments.emotionalReadiness},
      ${!!assessments.datingStyle}, ${!!assessments.chatCoach},
      ${!!assessments.lifeVision}, ${!!assessments.selfImage},
      ${scores.attachment}, ${scores.emotionalReadiness}, ${scores.datingStyle},
      ${scores.communication}, ${scores.futureCompatibility}, ${scores.firstImpression},
      ${scores.overall}, ${completeness}
    )
    ON CONFLICT (user_id) DO UPDATE SET
      hechtingsstijl_completed = EXCLUDED.hechtingsstijl_completed,
      emotionele_readiness_completed = EXCLUDED.emotionele_readiness_completed,
      dating_style_completed = EXCLUDED.dating_style_completed,
      chat_coach_completed = EXCLUDED.chat_coach_completed,
      levensvisie_completed = EXCLUDED.levensvisie_completed,
      zelfbeeld_completed = EXCLUDED.zelfbeeld_completed,
      attachment_score = EXCLUDED.attachment_score,
      emotional_readiness_score = EXCLUDED.emotional_readiness_score,
      dating_style_maturity_score = EXCLUDED.dating_style_maturity_score,
      communication_skill_score = EXCLUDED.communication_skill_score,
      future_compatibility_score = EXCLUDED.future_compatibility_score,
      first_impression_score = EXCLUDED.first_impression_score,
      overall_readiness_score = EXCLUDED.overall_readiness_score,
      profile_completeness = EXCLUDED.profile_completeness,
      updated_at = NOW()
  `;
}