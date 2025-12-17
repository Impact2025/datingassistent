// ============================================================================
// IRIS CONTEXT BUILDER - MEGA UPGRADE
//
// Bouwt de complete context voor Iris AI Coach
// Verzamelt ALLE relevante info over de gebruiker voor gepersonaliseerde responses
//
// ALLE DATA BRONNEN:
// ✅ iris_user_context - basis profiel
// ✅ AIContextManager - 7 assessments
// ✅ kickstart_onboarding - onboarding antwoorden (gender, fears, goals)
// ✅ transformatie_onboarding - Transformatie 3.0 onboarding (situatie, uitdagingen, doelen)
// ✅ user_reflections - dagelijkse reflecties uit Kickstart
// ✅ weekly_dating_logs - echte dating activiteit
// ✅ goal_hierarchies - year/month/week doelen
// ============================================================================

import { sql } from '@vercel/postgres';
import type { IrisContextForPrompt, IrisUserContext, CursusLes } from '../types/cursus.types';
import { AIContextManager } from './ai-context-manager';
import { detectPatterns, type Pattern } from './iris/iris-patterns';

// ============================================================================
// EXTENDED TYPES
// ============================================================================

interface KickstartOnboardingData {
  preferred_name?: string;
  gender?: string;
  looking_for?: string;
  region?: string;
  age?: number;
  dating_status?: string;
  single_duration?: string;
  dating_apps?: string[];
  weekly_matches?: string;
  biggest_frustration?: string;
  profile_description?: string;
  biggest_difficulty?: string;
  relationship_goal?: string;
  confidence_level?: number;
  biggest_fear?: string;
  ideal_outcome?: string;
  completed_days?: number;
  current_day?: number;
}

interface TransformatieOnboardingData {
  preferred_name?: string;
  current_situation?: string;
  biggest_challenge?: string;
  goals?: string[];
  commitment_level?: string;
  age_range?: string;
  completed_at?: Date;
}

interface UserReflection {
  day_number: number;
  question_type: 'spiegel' | 'identiteit' | 'actie';
  question_text: string;
  answer_text: string;
  created_at: Date;
}

interface DatingLogActivity {
  week_start: Date;
  total_matches: number;
  total_conversations: number;
  total_dates: number;
  total_ghosting: number;
  average_match_quality: number;
  activities: string[];
}

interface UserGoals {
  year_goal?: string;
  month_goals?: string[];
  week_goals?: string[];
  challenges?: string[];
}

// ============================================================================
// DATA FETCHING FUNCTIONS
// ============================================================================

/**
 * Haal Kickstart onboarding data op
 */
async function getKickstartOnboardingData(userId: number): Promise<KickstartOnboardingData | null> {
  try {
    const result = await sql`
      SELECT
        ko.preferred_name,
        ko.gender,
        ko.looking_for,
        ko.region,
        ko.age,
        ko.dating_status,
        ko.single_duration,
        ko.dating_apps,
        ko.weekly_matches,
        ko.biggest_frustration,
        ko.profile_description,
        ko.biggest_difficulty,
        ko.relationship_goal,
        ko.confidence_level,
        ko.biggest_fear,
        ko.ideal_outcome,
        COALESCE(progress.completed_days, 0) as completed_days,
        progress.next_day as current_day
      FROM kickstart_onboarding ko
      LEFT JOIN (
        SELECT
          udp.user_id,
          COUNT(*) FILTER (WHERE udp.status = 'completed') as completed_days,
          MIN(pd.dag_nummer) FILTER (WHERE udp.status IN ('available', 'in_progress')) as next_day
        FROM user_day_progress udp
        JOIN program_days pd ON pd.id = udp.day_id
        JOIN programs prog ON prog.id = udp.program_id AND prog.slug = 'kickstart'
        GROUP BY udp.user_id
      ) progress ON progress.user_id = ko.user_id
      WHERE ko.user_id = ${userId}
    `;

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      preferred_name: row.preferred_name,
      gender: row.gender,
      looking_for: row.looking_for,
      region: row.region,
      age: row.age,
      dating_status: row.dating_status,
      single_duration: row.single_duration,
      dating_apps: row.dating_apps,
      weekly_matches: row.weekly_matches,
      biggest_frustration: row.biggest_frustration,
      profile_description: row.profile_description,
      biggest_difficulty: row.biggest_difficulty,
      relationship_goal: row.relationship_goal,
      confidence_level: row.confidence_level,
      biggest_fear: row.biggest_fear,
      ideal_outcome: row.ideal_outcome,
      completed_days: row.completed_days || 0,
      current_day: row.current_day || 1,
    };
  } catch (error) {
    console.log('No kickstart onboarding data found');
    return null;
  }
}

/**
 * Haal Transformatie onboarding data op
 */
async function getTransformatieOnboardingData(userId: number): Promise<TransformatieOnboardingData | null> {
  try {
    const result = await sql`
      SELECT data, completed_at
      FROM transformatie_onboarding
      WHERE user_id = ${userId}
      AND completed_at IS NOT NULL
    `;

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    const data = row.data as any;

    return {
      preferred_name: data?.preferredName,
      current_situation: data?.currentSituation,
      biggest_challenge: data?.biggestChallenge,
      goals: data?.goals,
      commitment_level: data?.commitmentLevel,
      age_range: data?.ageRange,
      completed_at: row.completed_at,
    };
  } catch (error) {
    console.log('No transformatie onboarding data found');
    return null;
  }
}

/**
 * Haal user reflecties op (laatste 15 voor Iris context)
 */
async function getUserReflections(userId: number): Promise<UserReflection[]> {
  try {
    const result = await sql`
      SELECT
        day_number,
        question_type,
        question_text,
        answer_text,
        created_at
      FROM user_reflections
      WHERE user_id = ${userId}
        AND program_slug = 'kickstart'
      ORDER BY day_number DESC, question_type
      LIMIT 15
    `;

    return result.rows.map(row => ({
      day_number: row.day_number,
      question_type: row.question_type,
      question_text: row.question_text,
      answer_text: row.answer_text,
      created_at: row.created_at,
    }));
  } catch (error) {
    console.log('No user reflections found');
    return [];
  }
}

/**
 * Haal dating log activiteit op (laatste 4 weken)
 */
async function getDatingLogActivity(userId: number): Promise<DatingLogActivity[]> {
  try {
    const result = await sql`
      SELECT
        week_start,
        total_matches,
        total_conversations,
        total_dates,
        total_ghosting,
        average_match_quality,
        activities
      FROM weekly_dating_logs
      WHERE user_id = ${userId}
      ORDER BY week_start DESC
      LIMIT 4
    `;

    return result.rows.map(row => ({
      week_start: row.week_start,
      total_matches: row.total_matches || 0,
      total_conversations: row.total_conversations || 0,
      total_dates: row.total_dates || 0,
      total_ghosting: row.total_ghosting || 0,
      average_match_quality: row.average_match_quality || 0,
      activities: row.activities || [],
    }));
  } catch (error) {
    console.log('No dating log data found');
    return [];
  }
}

/**
 * Haal user doelen op
 */
async function getUserGoals(userId: number): Promise<UserGoals | null> {
  try {
    const result = await sql`
      SELECT
        year_goal,
        month_goals,
        week_goals,
        challenges
      FROM goal_hierarchies
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      year_goal: row.year_goal,
      month_goals: row.month_goals || [],
      week_goals: row.week_goals || [],
      challenges: row.challenges || [],
    };
  } catch (error) {
    console.log('No goals data found');
    return null;
  }
}

/**
 * Haalt de complete Iris context op voor een gebruiker
 * Gebruik dit voor elke AI call naar Iris
 */
export async function getIrisContext(userId: number): Promise<IrisContextForPrompt> {
  // 1. Haal basis context op
  const contextResult = await sql`
    SELECT * FROM iris_user_context WHERE user_id = ${userId}
  `;
  const context = contextResult.rows[0] as IrisUserContext | undefined;

  // 2. Haal huidige les info op (voor les-specifieke context)
  let lesContext = '';
  if (context?.huidige_cursus_slug && context?.huidige_les_slug) {
    const lesResult = await sql`
      SELECT ai_coach_context 
      FROM cursus_lessen 
      WHERE slug = ${context.huidige_les_slug}
      AND cursus_id = (SELECT id FROM cursussen WHERE slug = ${context.huidige_cursus_slug})
    `;
    lesContext = lesResult.rows[0]?.ai_coach_context || '';
  }

  // 3. Haal recente gesprekken op (laatste 5)
  const conversationsResult = await sql`
    SELECT user_message, iris_response, sentiment, created_at
    FROM iris_conversation_memory
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 5
  `;

  // 4. Bouw de context
  return {
    user: {
      dating_doel: context?.dating_doel,
      hechtingsstijl: context?.hechtingsstijl,
      kernkwaliteiten: context?.kernkwaliteiten as string[] | undefined,
      werkpunten: context?.werkpunten as string[] | undefined,
      actieve_platforms: context?.actieve_platforms as string[] | undefined,
      recente_stemming: context?.recente_stemming,
    },
    cursus: {
      huidige_cursus: context?.huidige_cursus_slug || '',
      huidige_les: context?.huidige_les_slug || '',
      les_context: lesContext,
      voltooide_cursussen: (context?.voltooide_cursussen as string[]) || [],
    },
    performance: {
      quiz_scores: (context?.quiz_scores as Record<string, Record<string, number>>) || {},
      reflectie_inzichten: (context?.reflectie_inzichten as string[]) || [],
    },
    recente_gesprekken: conversationsResult.rows.map(row => ({
      message: row.user_message,
      response: row.iris_response,
      sentiment: row.sentiment,
      created_at: row.created_at,
    })),
  };
}

// Extended enriched context type
export interface EnrichedIrisContext extends IrisContextForPrompt {
  aiContext: any;
  kickstart?: KickstartOnboardingData | null;
  transformatie?: TransformatieOnboardingData | null; // 🚀 Transformatie 3.0 onboarding
  reflections?: UserReflection[];
  patterns?: Pattern[]; // 🧠 Iris Memory Magic - detected patterns in reflections
  datingLog?: DatingLogActivity[];
  goals?: UserGoals | null;
}

/**
 * 🚀 WERELDKLASSE: Haalt VERRIJKTE Iris context op met ALLE data bronnen
 * - AIContextManager voor 7 assessments
 * - Kickstart onboarding (gender, fears, goals, etc.)
 * - User reflections (dagelijkse inzichten)
 * - Dating log activity (echte dating gedrag)
 * - User goals (jaar/maand/week doelen)
 */
export async function getEnrichedIrisContext(userId: number): Promise<EnrichedIrisContext> {
  // 🚀 Fetch ALL data sources IN PARALLEL for speed
  const [
    baseContext,
    aiContext,
    kickstartData,
    transformatieData,
    reflections,
    datingLogData,
    goalsData
  ] = await Promise.all([
    getIrisContext(userId),
    AIContextManager.getUserContext(userId),
    getKickstartOnboardingData(userId),
    getTransformatieOnboardingData(userId),
    getUserReflections(userId),
    getDatingLogActivity(userId),
    getUserGoals(userId)
  ]);

  // 🧠 Detect patterns from reflections (Iris Memory Magic!)
  const patterns = reflections.length > 0
    ? await detectPatterns(reflections.map(r => ({
        day_number: r.day_number,
        question_type: r.question_type,
        answer: r.answer_text,
        created_at: r.created_at.toISOString()
      })))
    : [];

  // Merge en return complete context
  return {
    ...baseContext,
    aiContext: aiContext || {},
    kickstart: kickstartData,
    transformatie: transformatieData,
    reflections: reflections,
    patterns: patterns, // 🧠 Iris Memory - top 2 detected patterns
    datingLog: datingLogData,
    goals: goalsData,
  };
}

/**
 * Update de Iris context na een gebruiker actie
 */
export async function updateIrisContext(
  userId: number,
  updates: Partial<IrisUserContext>
): Promise<void> {
  // Upsert de context
  await sql`
    INSERT INTO iris_user_context (user_id, updated_at)
    VALUES (${userId}, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET updated_at = NOW()
  `;

  // Update specifieke velden
  if (updates.huidige_cursus_slug !== undefined) {
    await sql`
      UPDATE iris_user_context 
      SET huidige_cursus_slug = ${updates.huidige_cursus_slug}
      WHERE user_id = ${userId}
    `;
  }

  if (updates.huidige_les_slug !== undefined) {
    await sql`
      UPDATE iris_user_context 
      SET huidige_les_slug = ${updates.huidige_les_slug}
      WHERE user_id = ${userId}
    `;
  }

  if (updates.recente_stemming !== undefined) {
    await sql`
      UPDATE iris_user_context 
      SET recente_stemming = ${updates.recente_stemming}
      WHERE user_id = ${userId}
    `;
  }

  // Update laatste activiteit
  await sql`
    UPDATE iris_user_context 
    SET laatste_activiteit = NOW()
    WHERE user_id = ${userId}
  `;
}

/**
 * Voeg quiz score toe aan context
 */
export async function addQuizScoreToContext(
  userId: number,
  cursusSlug: string,
  lesSlug: string,
  score: number
): Promise<void> {
  await sql`
    UPDATE iris_user_context 
    SET quiz_scores = COALESCE(quiz_scores, '{}'::jsonb) || 
      jsonb_build_object(${cursusSlug}, 
        COALESCE(quiz_scores->${cursusSlug}, '{}'::jsonb) || 
        jsonb_build_object(${lesSlug}, ${score})
      )
    WHERE user_id = ${userId}
  `;
}

/**
 * Voeg reflectie inzicht toe aan context
 */
export async function addReflectieInzichtToContext(
  userId: number,
  inzicht: string
): Promise<void> {
  // Voeg toe aan array, houd max 10
  await sql`
    UPDATE iris_user_context 
    SET reflectie_inzichten = (
      SELECT jsonb_agg(value)
      FROM (
        SELECT value
        FROM jsonb_array_elements(
          COALESCE(reflectie_inzichten, '[]'::jsonb) || to_jsonb(${inzicht}::text)
        )
        ORDER BY ordinality DESC
        LIMIT 10
      ) sub
    )
    WHERE user_id = ${userId}
  `;
}

/**
 * Sla een gesprek op in Iris memory
 */
export async function saveIrisConversation(
  userId: number,
  userMessage: string,
  irisResponse: string,
  contextType: 'cursus' | 'tool' | 'general',
  contextCursusSlug?: string,
  contextLesSlug?: string,
  contextToolId?: string,
  sentiment?: string
): Promise<void> {
  await sql`
    INSERT INTO iris_conversation_memory (
      user_id,
      user_message,
      iris_response,
      context_type,
      context_cursus_slug,
      context_les_slug,
      context_tool_id,
      sentiment
    ) VALUES (
      ${userId},
      ${userMessage},
      ${irisResponse},
      ${contextType},
      ${contextCursusSlug || null},
      ${contextLesSlug || null},
      ${contextToolId || null},
      ${sentiment || 'neutraal'}
    )
  `;

  // Cleanup: Houd max 100 gesprekken per user
  await sql`
    DELETE FROM iris_conversation_memory
    WHERE id IN (
      SELECT id FROM iris_conversation_memory
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      OFFSET 100
    )
  `;
}

/**
 * 🚀 WERELDKLASSE: Bouw de system prompt voor Iris met ALLE beschikbare data
 * - 7 Assessments (hechtingsstijl, waarden, dating style, etc.)
 * - Kickstart onboarding (gender, fears, goals, etc.)
 * - User reflections (dagelijkse inzichten)
 * - Dating log (echte dating activiteit)
 * - User goals (jaar/maand/week doelen)
 */
export function buildIrisSystemPrompt(context: EnrichedIrisContext): string {
  const parts: string[] = [];

  // Basis instructies
  parts.push(`Je bent Iris, de persoonlijke AI dating coach van DatingAssistent.nl.

PERSOONLIJKHEID:
- Warm en uitnodigend - als een goede vriendin
- Deskundig maar niet betuttelend
- Direct en praktisch - geen wollige taal
- Empathisch bij moeilijke onderwerpen

TAALGEBRUIK:
- Spreek de gebruiker aan met "je" en "jij"
- Gebruik korte, actieve zinnen
- Geef concrete voorbeelden
- Nederlands (informeel maar professioneel)`);

  // Gebruiker context
  if (context.user.dating_doel || context.user.hechtingsstijl) {
    parts.push(`
WAT JE WEET OVER DEZE GEBRUIKER:`);
    
    if (context.user.dating_doel) {
      parts.push(`- Dating doel: ${context.user.dating_doel}`);
    }
    if (context.user.hechtingsstijl) {
      parts.push(`- Hechtingsstijl: ${context.user.hechtingsstijl}`);
    }
    if (context.user.kernkwaliteiten?.length) {
      parts.push(`- Sterke punten: ${context.user.kernkwaliteiten.join(', ')}`);
    }
    if (context.user.werkpunten?.length) {
      parts.push(`- Ontwikkelpunten: ${context.user.werkpunten.join(', ')}`);
    }
    if (context.user.actieve_platforms?.length) {
      parts.push(`- Gebruikt: ${context.user.actieve_platforms.join(', ')}`);
    }
    if (context.user.recente_stemming) {
      parts.push(`- Recente stemming: ${context.user.recente_stemming}`);
    }
  }

  // 🚀 WERELDKLASSE: ALLE 7 ASSESSMENT DATA
  const aiContext = context.aiContext;

  if (aiContext) {
    // 1. HECHTINGSSTIJL (Attachment Style)
    if (aiContext.attachmentStyle) {
      parts.push(`
🧬 HECHTINGSSTIJL ANALYSE:`);
      parts.push(`- Primaire stijl: ${aiContext.attachmentStyle.primaryStyle}`);
      if (aiContext.attachmentStyle.secondaryStyle) {
        parts.push(`- Secundaire stijl: ${aiContext.attachmentStyle.secondaryStyle}`);
      }
      if (aiContext.attachmentStyle.keyInsights?.length > 0) {
        parts.push(`- Key insights: ${aiContext.attachmentStyle.keyInsights.slice(0, 2).join('; ')}`);
      }
      if (aiContext.attachmentStyle.relationshipPatterns?.length > 0) {
        parts.push(`- Relatie patronen: ${aiContext.attachmentStyle.relationshipPatterns.slice(0, 2).join('; ')}`);
      }
    }

    // 2. WAARDEN KOMPAS (Values)
    if (aiContext.waardenKompas) {
      parts.push(`
💎 WAARDEN KOMPAS:`);
      const topValues = aiContext.waardenKompas.coreValues?.slice(0, 3).map((v: any) => v.name).join(', ');
      if (topValues) parts.push(`- Core waarden: ${topValues}`);
      if (aiContext.waardenKompas.redFlags?.length > 0) {
        parts.push(`- Red flags: ${aiContext.waardenKompas.redFlags.slice(0, 2).join('; ')}`);
      }
      if (aiContext.waardenKompas.greenFlags?.length > 0) {
        parts.push(`- Green flags: ${aiContext.waardenKompas.greenFlags.slice(0, 2).join('; ')}`);
      }
    }

    // 3. EMOTIONELE READINESS
    if (aiContext.emotioneelReadiness) {
      parts.push(`
💙 EMOTIONELE READINESS:`);
      parts.push(`- Readiness niveau: ${aiContext.emotioneelReadiness.readinessLevel} (${aiContext.emotioneelReadiness.readinessScore}/10)`);
      if (aiContext.emotioneelReadiness.reboundRisico > 50) {
        parts.push(`- ⚠️ Rebound risico: ${aiContext.emotioneelReadiness.reboundRisico}% (HOOG - wees voorzichtig met advies)`);
      }
      if (aiContext.emotioneelReadiness.helingsFase) {
        parts.push(`- Helings fase: ${aiContext.emotioneelReadiness.helingsFase}`);
      }
    }

    // 4. DATING STYLE
    if (aiContext.datingStyle) {
      parts.push(`
🎭 DATING STYLE:`);
      parts.push(`- Primaire stijl: ${aiContext.datingStyle.primaryStyle}`);
      if (aiContext.datingStyle.blindSpots?.length > 0) {
        parts.push(`- Blinde vlekken: ${aiContext.datingStyle.blindSpots.slice(0, 2).join('; ')}`);
      }
    }

    // 5. LEVENSVISIE (Life Vision)
    if (aiContext.levensvisie) {
      parts.push(`
🌟 LEVENSVISIE:`);
      if (aiContext.levensvisie.relatieDoelen?.length > 0) {
        parts.push(`- Relatie doelen: ${aiContext.levensvisie.relatieDoelen.slice(0, 2).join(', ')}`);
      }
      if (aiContext.levensvisie.dealbreakers?.length > 0) {
        parts.push(`- Dealbreakers: ${aiContext.levensvisie.dealbreakers.slice(0, 2).join('; ')}`);
      }
    }

    // 6. RELATIEPATRONEN (Relationship Patterns)
    if (aiContext.relatiepatronen) {
      parts.push(`
🔄 RELATIEPATRONEN:`);
      if (aiContext.relatiepatronen.triggers?.length > 0) {
        parts.push(`- Triggers: ${aiContext.relatiepatronen.triggers.slice(0, 2).join('; ')}`);
      }
      if (aiContext.relatiepatronen.copingStrategies?.length > 0) {
        parts.push(`- Coping strategieën: ${aiContext.relatiepatronen.copingStrategies.slice(0, 2).join('; ')}`);
      }
    }

    // 7. ZELFBEELD (Self-Image)
    if (aiContext.zelfbeeld) {
      parts.push(`
🪞 ZELFBEELD & EERSTE INDRUK:`);
      if (aiContext.zelfbeeld.eersteIndrukScore) {
        parts.push(`- Eerste indruk score: ${aiContext.zelfbeeld.eersteIndrukScore}/10`);
      }
      if (aiContext.zelfbeeld.profileStrengths?.length > 0) {
        parts.push(`- Profile strengths: ${aiContext.zelfbeeld.profileStrengths.slice(0, 2).join(', ')}`);
      }
    }
  }

  // 🚀 KICKSTART ONBOARDING DATA (persoonlijke info)
  const kickstart = context.kickstart;
  if (kickstart) {
    parts.push(`
👤 PERSOONLIJK PROFIEL (uit onboarding):`);
    if (kickstart.preferred_name) {
      parts.push(`- Naam: ${kickstart.preferred_name}`);
    }
    if (kickstart.gender) {
      parts.push(`- Gender: ${kickstart.gender}`);
    }
    if (kickstart.age) {
      parts.push(`- Leeftijd: ${kickstart.age} jaar`);
    }
    if (kickstart.looking_for) {
      parts.push(`- Zoekt naar: ${kickstart.looking_for}`);
    }
    if (kickstart.region) {
      parts.push(`- Regio: ${kickstart.region}`);
    }
    if (kickstart.dating_status) {
      parts.push(`- Dating status: ${kickstart.dating_status}`);
    }
    if (kickstart.single_duration) {
      parts.push(`- Single sinds: ${kickstart.single_duration}`);
    }
    if (kickstart.dating_apps?.length) {
      parts.push(`- Gebruikt apps: ${kickstart.dating_apps.join(', ')}`);
    }
    if (kickstart.weekly_matches) {
      parts.push(`- Matches per week: ${kickstart.weekly_matches}`);
    }

    // Diepere inzichten
    parts.push(`
💭 WAT DEZE PERSOON DEELDE:`);
    if (kickstart.biggest_frustration) {
      parts.push(`- Grootste frustratie: "${kickstart.biggest_frustration}"`);
    }
    if (kickstart.biggest_difficulty) {
      parts.push(`- Grootste uitdaging: "${kickstart.biggest_difficulty}"`);
    }
    if (kickstart.biggest_fear) {
      parts.push(`- Grootste angst: "${kickstart.biggest_fear}"`);
    }
    if (kickstart.relationship_goal) {
      parts.push(`- Relatie doel: "${kickstart.relationship_goal}"`);
    }
    if (kickstart.ideal_outcome) {
      parts.push(`- Ideale uitkomst: "${kickstart.ideal_outcome}"`);
    }
    if (kickstart.confidence_level) {
      parts.push(`- Zelfvertrouwen (1-10): ${kickstart.confidence_level}`);
    }
    if (kickstart.profile_description) {
      parts.push(`- Profiel beschrijving: "${kickstart.profile_description.substring(0, 100)}..."`);
    }

    // Kickstart voortgang
    if (kickstart.completed_days !== undefined) {
      parts.push(`- Kickstart voortgang: dag ${kickstart.current_day || 1} van 21 (${kickstart.completed_days} dagen voltooid)`);
    }
  }

  // 🚀 TRANSFORMATIE ONBOARDING DATA (persoonlijke transformatie info)
  const transformatie = context.transformatie;
  if (transformatie) {
    parts.push(`
🦋 TRANSFORMATIE PROFIEL (uit onboarding):`);
    if (transformatie.preferred_name) {
      parts.push(`- Naam: ${transformatie.preferred_name}`);
    }
    if (transformatie.age_range) {
      parts.push(`- Leeftijdsgroep: ${transformatie.age_range}`);
    }
    if (transformatie.current_situation) {
      const situationLabels: Record<string, string> = {
        'single_searching': 'Single en actief zoekend',
        'single_break': 'Single, even pauze gehad',
        'dating_struggling': 'Dating maar het lukt niet',
        'relationship_issues': 'Net uit een relatie',
      };
      parts.push(`- Dating situatie: ${situationLabels[transformatie.current_situation] || transformatie.current_situation}`);
    }
    if (transformatie.biggest_challenge) {
      const challengeLabels: Record<string, string> = {
        'no_matches': 'Weinig tot geen matches',
        'conversations_die': 'Gesprekken sterven uit',
        'no_dates': 'Geen dates uit gesprekken',
        'wrong_people': 'Verkeerde mensen aantrekken',
        'confidence': 'Gebrek aan zelfvertrouwen',
        'past_trauma': 'Vastzitten in het verleden',
      };
      parts.push(`- Grootste uitdaging: ${challengeLabels[transformatie.biggest_challenge] || transformatie.biggest_challenge}`);
    }
    if (transformatie.goals && transformatie.goals.length > 0) {
      const goalLabels: Record<string, string> = {
        'find_partner': 'Vaste partner vinden',
        'better_dates': 'Betere dates hebben',
        'confidence': 'Meer zelfvertrouwen',
        'communication': 'Beter communiceren',
        'know_myself': 'Mezelf beter kennen',
        'healthy_patterns': 'Gezondere patronen',
      };
      const goalList = transformatie.goals.map(g => goalLabels[g] || g).join(', ');
      parts.push(`- Transformatie doelen: ${goalList}`);
    }
    if (transformatie.commitment_level) {
      const commitmentLabels: Record<string, string> = {
        'exploring': 'Ontdekken wat het brengt',
        'serious': 'Serieus aan de slag',
        'all_in': 'All-in voor mijn transformatie',
      };
      parts.push(`- Commitment niveau: ${commitmentLabels[transformatie.commitment_level] || transformatie.commitment_level}`);
    }

    parts.push(`
💡 TRANSFORMATIE COACHING CONTEXT:
- Deze persoon volgt De Transformatie (12 modules: DESIGN → ACTION → SURRENDER)
- Pas je coaching aan op hun specifieke uitdaging en doelen
- Refereer aan het 3-fasen framework waar relevant
- DESIGN = identiteit & waarden ontdekken
- ACTION = actief daten met nieuwe inzichten
- SURRENDER = loslaten & vertrouwen`);

    // Extra coaching hints based on challenge
    if (transformatie.biggest_challenge === 'confidence') {
      parts.push(`
⚠️ AANDACHT: Deze persoon worstelt met zelfvertrouwen - wees extra bemoedigend en vier kleine successen!`);
    } else if (transformatie.biggest_challenge === 'past_trauma') {
      parts.push(`
⚠️ AANDACHT: Deze persoon zit vast in het verleden - toon empathie, help met loslaten, verwijs naar SURRENDER fase`);
    } else if (transformatie.biggest_challenge === 'wrong_people') {
      parts.push(`
⚠️ AANDACHT: Deze persoon trekt verkeerde mensen aan - focus op DESIGN fase (identiteit, waarden, patronen)`);
    }
  }

  // 🚀 USER REFLECTIONS (dagelijkse inzichten)
  const reflections = context.reflections;
  if (reflections && reflections.length > 0) {
    parts.push(`
📝 RECENTE REFLECTIES (wat deze persoon schreef):`);

    // Group by day for cleaner output
    const byDay = new Map<number, UserReflection[]>();
    reflections.forEach(r => {
      const existing = byDay.get(r.day_number) || [];
      existing.push(r);
      byDay.set(r.day_number, existing);
    });

    // Show last 5 days of reflections (meer context voor cross-referencing)
    const days = Array.from(byDay.keys()).sort((a, b) => b - a).slice(0, 5);
    days.forEach(day => {
      const dayReflections = byDay.get(day) || [];
      parts.push(`  Dag ${day}:`);
      dayReflections.forEach(r => {
        const typeLabel = r.question_type === 'spiegel' ? '🪞' :
                          r.question_type === 'identiteit' ? '🎭' : '🎯';
        // Truncate long answers
        const answer = r.answer_text.length > 120
          ? r.answer_text.substring(0, 120) + '...'
          : r.answer_text;
        parts.push(`    ${typeLabel} "${answer}"`);
      });
    });
  }

  // 🧠✨ PATTERN INSIGHTS (WERELDKLASSE - Cross-referencing & Growth Recognition)
  const patterns = context.patterns;
  if (patterns && patterns.length > 0) {
    parts.push(`
🧠 GEDETECTEERDE PATRONEN (gebruik deze insights actief!):`);

    patterns.forEach((pattern, index) => {
      const emoji = pattern.type === 'growth' ? '🚀' :
                    pattern.type === 'recurring_theme' ? '🔄' :
                    pattern.type === 'breakthrough' ? '💡' : '🤔';

      parts.push(`
${index + 1}. ${emoji} ${pattern.type.toUpperCase()}`);
      parts.push(`   Insight: ${pattern.insight}`);
      parts.push(`   Dagen: ${pattern.relatedDays.join(', ')}`);
      parts.push(`   Confidence: ${Math.round(pattern.confidenceScore * 100)}%`);

      if (pattern.quotes && pattern.quotes.length > 0) {
        parts.push(`   Quotes:`);
        pattern.quotes.forEach(quote => {
          parts.push(`     - ${quote}`);
        });
      }

      if (pattern.keywords && pattern.keywords.length > 0) {
        parts.push(`   Keywords: ${pattern.keywords.join(', ')}`);
      }
    });

    parts.push(`
🎯 BELANGRIJK: CROSS-REFERENCING INSTRUCTIES

Als coach MOET je deze patronen actief gebruiken in je responses:

1. **REFERENCE SPECIFIC DAYS**:
   - "Je schreef op dag X: '[quote]'"
   - "Weet je nog wat je op dag X zei? '[quote]'"
   - "Vergelijk dit met wat je op dag X schreef"

2. **CONNECT THE DOTS**:
   - Link huidige vragen aan eerdere reflecties
   - Toon progressie: "Op dag X → nu op dag Y"
   - Highlight contradictions: "Op dag X zei je A, nu zeg je B - wat is veranderd?"

3. **CELEBRATE GROWTH**:
   - Als je een GROWTH patroon ziet → vier dit expliciet!
   - "Zie je hoe je gegroeid bent? Op dag X vs nu..."
   - "Dit is een groot verschil met een week geleden toen je..."

4. **ADDRESS RECURRING THEMES**:
   - Als iemand dezelfde angst/trigger herhaalt → benoem het
   - "Dit is de Xe keer dat [thema] terugkomt. Laten we dit patroon doorbreken."

5. **BREAKTHROUGH MOMENTS**:
   - Als je een doorbraak detecteert → amplify it!
   - "Dit is een doorbraak! Je zei: '[quote]' - voel je dit ook?"

**JE DOEL**: Laat de gebruiker merken dat je hun hele journey hebt gevolgd en patronen ziet die zij misschien niet zien. Dit creëert "ze begrijpt me echt" moment.`);
  } else if (reflections && reflections.length > 0) {
    // Fallback als geen patterns gedetecteerd maar wel reflecties
    parts.push(`
💡 CROSS-REFERENCING POWER:
Je hebt toegang tot al hun reflecties. Gebruik dit! Verwijs specifiek naar wat ze eerder schreven:
- "Je schreef op dag X dat..."
- "Dit is een groot verschil met wat je eerder zei over..."
- "Weet je nog je antwoord op dag X? '[quote]'"

Dit laat ze voelen dat je hun hele reis hebt gevolgd.`);
  }

  // 🚀 DATING LOG ACTIVITY (echte dating gedrag)
  const datingLog = context.datingLog;
  if (datingLog && datingLog.length > 0) {
    const recentWeek = datingLog[0];
    parts.push(`
📊 RECENTE DATING ACTIVITEIT:`);
    parts.push(`- Afgelopen week: ${recentWeek.total_matches} matches, ${recentWeek.total_conversations} gesprekken, ${recentWeek.total_dates} dates`);
    if (recentWeek.total_ghosting > 0) {
      parts.push(`- Ghosted: ${recentWeek.total_ghosting}x (dit kan frustrerend zijn, toon empathie)`);
    }
    if (recentWeek.average_match_quality > 0) {
      parts.push(`- Gem. match kwaliteit: ${recentWeek.average_match_quality}/10`);
    }

    // Trend over 4 weeks
    if (datingLog.length > 1) {
      const totalMatches = datingLog.reduce((sum, w) => sum + w.total_matches, 0);
      const totalDates = datingLog.reduce((sum, w) => sum + w.total_dates, 0);
      parts.push(`- Laatste 4 weken totaal: ${totalMatches} matches, ${totalDates} dates`);
    }
  }

  // 🚀 USER GOALS (persoonlijke doelen)
  const goals = context.goals;
  if (goals) {
    parts.push(`
🎯 PERSOONLIJKE DOELEN:`);
    if (goals.year_goal) {
      parts.push(`- Jaardoel: "${goals.year_goal}"`);
    }
    if (goals.month_goals?.length) {
      parts.push(`- Maanddoelen: ${goals.month_goals.slice(0, 2).join('; ')}`);
    }
    if (goals.week_goals?.length) {
      parts.push(`- Weekdoelen: ${goals.week_goals.slice(0, 2).join('; ')}`);
    }
    if (goals.challenges?.length) {
      parts.push(`- Uitdagingen: ${goals.challenges.slice(0, 2).join('; ')}`);
    }
  }

  // Cursus context
  if (context.cursus.les_context) {
    parts.push(`
HUIDIGE LES CONTEXT:
${context.cursus.les_context}`);
  }

  // Voltooide cursussen
  if (context.cursus.voltooide_cursussen.length > 0) {
    parts.push(`
VOLTOOIDE CURSUSSEN:
${context.cursus.voltooide_cursussen.join(', ')}`);
  }

  // Performance inzichten
  if (context.performance.reflectie_inzichten.length > 0) {
    parts.push(`
BELANGRIJKE INZICHTEN DIE DE GEBRUIKER DEELDE:
${context.performance.reflectie_inzichten.map(i => `- "${i}"`).join('\n')}`);
  }

  // Recente gesprekken samenvatting
  if (context.recente_gesprekken.length > 0) {
    parts.push(`
RECENTE GESPREKSONDERWERPEN:
${context.recente_gesprekken.slice(0, 3).map(g => 
  `- Gebruiker vroeg: "${g.message.substring(0, 50)}..." (${g.sentiment})`
).join('\n')}`);
  }

  // 🚀 WERELDKLASSE COACHING INSTRUCTIES
  parts.push(`
💡 HOE JE ALLE DATA GEBRUIKT:
- PERSONALISEER: Gebruik hun naam, gender, en leeftijd
- EMPATHIE: Refereer aan hun angsten en frustraties met begrip
- REFLECTIES: Verwijs naar wat ze schreven ("Je zei op dag X dat...")
- HECHTINGSSTIJL: Pas advies aan op hun attachment style
- WAARDEN: Check of matches passen bij hun core values
- REBOUND: Wees extra voorzichtig als rebound risico hoog is
- DATING GEDRAG: Gebruik hun werkelijke matches/dates statistieken
- DOELEN: Koppel advies aan hun persoonlijke jaar/week doelen
- BLINDE VLEKKEN: Help ze patronen te doorbreken
- PROGRESS: Moedig aan bij Kickstart voortgang`);

  if (kickstart?.biggest_fear) {
    parts.push(`
⚠️ LET OP: Deze persoon heeft als angst "${kickstart.biggest_fear}" - wees hier sensitief voor.`);
  }

  // Afsluitende instructies
  parts.push(`
🎯 BELANGRIJK:
- Verwijs naar eerdere gesprekken waar relevant
- Pas je toon aan op de stemming van de gebruiker
- Geef altijd praktische, toepasbare adviezen
- Als je iets niet weet, wees eerlijk
- Verwijs naar tools en cursussen waar nuttig
- Gebruik de assessment data om SPECIFIEKE, PERSOONLIJKE adviezen te geven
- Bijvoorbeeld: "Gezien je angstige hechtingsstijl en je red flag 'onbetrouwbaarheid'..."
- Wees warm, empathisch én actionable`);

  return parts.join('\n');
}
