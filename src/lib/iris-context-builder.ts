/**
 * Iris Context Builder
 * Builds comprehensive coaching context from Kickstart onboarding data
 */

import { sql } from '@vercel/postgres';
import type { IrisKickstartContext } from '@/types/kickstart-onboarding.types';

/**
 * Get complete Iris context for a user
 * Returns rich context string with all onboarding data + current progress
 */
export async function buildIrisContext(userId: number): Promise<string> {
  try {
    // Get context from view
    const result = await sql`
      SELECT * FROM iris_kickstart_context
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      // User has no Kickstart enrollment or onboarding
      return buildDefaultContext(userId);
    }

    const context = result.rows[0] as IrisKickstartContext;

    // If onboarding not completed, return minimal context
    if (!context.kickstart_onboarding_completed || !context.preferred_name) {
      return buildMinimalContext(userId, context);
    }

    // Build full context for coaching
    return buildFullContext(context);

  } catch (error) {
    console.error('Error building Iris context:', error);
    return buildFallbackContext(userId);
  }
}

/**
 * Build full coaching context with all onboarding data
 */
function buildFullContext(context: IrisKickstartContext): string {
  const {
    preferred_name,
    gender,
    looking_for,
    region,
    age,
    dating_status,
    single_duration,
    dating_apps,
    weekly_matches,
    biggest_frustration,
    profile_description,
    biggest_difficulty,
    relationship_goal,
    confidence_level,
    biggest_fear,
    ideal_outcome,
    completed_days,
    last_completed_day,
    next_day,
  } = context;

  // Format dating apps
  const appsUsed = dating_apps && dating_apps.length > 0
    ? dating_apps.join(', ')
    : 'Geen apps opgegeven';

  // Translate status labels for better readability
  const statusLabels: Record<string, string> = {
    'single': 'Helemaal single, weinig actie',
    'matching-no-dates': 'Matched maar geen dates',
    'dating-no-click': 'Dated maar geen klik',
    'recent-breakup': 'Net uit een relatie'
  };

  const durationLabels: Record<string, string> = {
    'less-than-month': 'Minder dan een maand',
    '1-3-months': '1-3 maanden',
    '3-6-months': '3-6 maanden',
    '6-12-months': '6-12 maanden',
    '1-year-plus': 'Langer dan een jaar'
  };

  const profileLabels: Record<string, string> = {
    'few-photos': 'Weinig foto\'s',
    'boring-bio': 'Saaie bio',
    'no-idea': 'Geen idee wat te doen',
    'good-but-not-working': 'Best goed maar werkt niet'
  };

  const difficultyLabels: Record<string, string> = {
    'starting-convos': 'Gesprekken starten',
    'getting-matches': 'Matches krijgen',
    'planning-dates': 'Dates plannen',
    'presenting-self': 'Zichzelf presenteren'
  };

  const goalLabels: Record<string, string> = {
    'serious': 'Serieuze relatie',
    'open': 'Open staan voor wat komt',
    'dates-first': 'Eerst dates, dan zien',
    'connections': 'Leuke connecties'
  };

  // Gender and looking for labels
  const genderLabels: Record<string, string> = {
    'man': 'Man',
    'vrouw': 'Vrouw',
    'anders': 'Anders'
  };

  const lookingForLabels: Record<string, string> = {
    'vrouwen': 'Vrouwen',
    'mannen': 'Mannen',
    'beiden': 'Beiden'
  };

  const contextString = `
# USER CONTEXT FOR COACHING

## Basic Information
- **Name**: ${preferred_name} (${age} jaar)
- **Gender**: ${genderLabels[gender || ''] || gender || 'Onbekend'}
- **Looking for**: ${lookingForLabels[looking_for || ''] || looking_for || 'Onbekend'}
- **Region**: ${region || 'Onbekend'}
- **Program**: Kickstart 21-Day Dating Program
- **Current Progress**: Dag ${next_day || 1}/21 (${completed_days} dagen voltooid)
${last_completed_day ? `- **Last Completed**: Dag ${last_completed_day}` : ''}

## Dating Situation
- **Status**: ${statusLabels[dating_status || ''] || dating_status || 'Onbekend'}
- **Single for**: ${durationLabels[single_duration || ''] || single_duration || 'Onbekend'}
- **Dating apps gebruikt**: ${appsUsed}
- **Matches per week**: ${weekly_matches || 'Onbekend'}

## Challenges & Struggles (CRITICAL FOR COACHING!)
${biggest_frustration ? `
### Biggest Frustration (in hun eigen woorden):
"${biggest_frustration}"

**COACHING NOTE**: Dit is wat ${preferred_name} het MEEST frustreert. Verwijs hier regelmatig naar en help specifiek hiermee.
` : ''}

- **Profiel probleem**: ${profileLabels[profile_description || ''] || profile_description || 'Onbekend'}
- **Grootste moeilijkheid**: ${difficultyLabels[biggest_difficulty || ''] || biggest_difficulty || 'Onbekend'}

${biggest_fear ? `
### Biggest Fear (DEEP psychological insight):
"${biggest_fear}"

**COACHING NOTE**: Dit is de diepste angst van ${preferred_name}. Wees empathisch en help ze deze angst te overwinnen. Verwijs hier subtiel naar wanneer relevant.
` : ''}

## Goals & Desires
- **Relationship goal**: ${goalLabels[relationship_goal || ''] || relationship_goal || 'Onbekend'}
- **Confidence level**: ${confidence_level || 'Onbekend'}/10
${confidence_level && confidence_level <= 4 ? '  (⚠️ LOW - needs confidence building)' : ''}
${confidence_level && confidence_level >= 8 ? '  (✅ HIGH - leverage this strength)' : ''}

${ideal_outcome ? `
### Ideal Outcome (Dream goal in 3 months):
"${ideal_outcome}"

**COACHING NOTE**: Dit is waar ${preferred_name} naartoe wil. Herinner ze hieraan, visualiseer dit samen, en laat zien hoe jullie stappen richting dit doel maken.
` : ''}

## Coaching Instructions
1. **Always use their preferred name**: ${preferred_name}
2. **Gender-aware coaching**: ${preferred_name} is een ${genderLabels[gender || ''] || 'persoon'} die zoekt naar ${lookingForLabels[looking_for || ''] || 'een partner'}
3. **Region-aware tips**: Geef eventueel tips voor dating spots in ${region || 'hun regio'}
4. **Reference their specific frustrations** when giving advice (especially: "${biggest_frustration?.substring(0, 50)}...")
5. **Connect coaching to their ideal outcome**: "${ideal_outcome?.substring(0, 50)}..."
6. **Be empathetic about their fears**: "${biggest_fear?.substring(0, 50)}..."
7. **Celebrate progress** in context of their starting confidence (${confidence_level}/10)
8. **Day-aware coaching**: They're on Dag ${next_day || 1}, so reference relevant day content
9. **App-specific tips**: They use ${appsUsed}, tailor examples to these platforms

## Tone & Approach
- Supportive and encouraging (especially given confidence level: ${confidence_level}/10)
- Specific and actionable (not generic advice)
- Reference their onboarding data naturally in conversation
- Celebrate small wins (they need momentum!)
${confidence_level && confidence_level <= 5 ? '- Extra gentle and confidence-building (low self-confidence detected)' : ''}
${biggest_frustration?.toLowerCase().includes('gesprek') ? '- Focus heavily on conversation skills (their main frustration)' : ''}
${biggest_frustration?.toLowerCase().includes('match') ? '- Focus on profile optimization (their main frustration)' : ''}

## MINDSET COACHING LAYER (Pilarczyk-Style)

### Core Philosophy
Je bent niet alleen een dating coach - je helpt ${preferred_name} om te transformeren van BINNEN naar BUITEN.
De tips zijn belangrijk, maar de MINDSET erachter bepaalt het succes.

### Pilarczyk Principes (subtiel verwerken):
1. **Identiteit bepaalt gedrag**: "Wie wil je ZIJN in dating? De man die dat is, doet automatisch de juiste dingen."
2. **Detachment van uitkomst**: "Het antwoord op je bericht is informatie over compatibility, geen oordeel over je waarde."
3. **Nieuwsgierigheid boven behoefte**: "Wat als je niet hoopte op een match, maar nieuwsgierig was naar wie ze is?"
4. **Design Your Life**: "Jij kiest hoe je dit aanpakt. Dating overkomt je niet - je DOET het."

### Coaching Technieken:
- Begin met valideren: "Ik snap dat dit frustrerend is..."
- Daag dan voorzichtig uit: "En wat als je het anders zou bekijken..."
- Koppel tips aan identiteit: "Dit is niet alleen een techniek - dit is wie je aan het worden bent"
- Normaliseer ongemak: "Als dit ongemakkelijk voelt, ben je op de goede weg"

### Transformationele Vragen die je kunt stellen:
- "Wie wil je zijn als je dat bericht stuurt?"
- "Wat zou de meest zelfverzekerde versie van jezelf hier doen?"
- "Stel dat je wist dat je niet kon falen - wat zou je dan doen?"
- "Is dit angst die je beschermt, of angst die je tegenhoudt?"

### Dag-Specifieke Mindset Focus:
- Week 1 (Dag 1-7): IDENTITEIT DOOR BEELD - "Je foto's vertellen een verhaal over wie je bent"
- Week 2 (Dag 8-14): IDENTITEIT DOOR WOORDEN - "Je bio is geen CV, het is een uitnodiging"
- Week 3 (Dag 15-21): IDENTITEIT DOOR CONNECTIE - "Gesprekken zijn spiegels van wie je bent"

### Response Format:
1. Valideer hun gevoel/situatie eerst
2. Geef praktische tip of antwoord
3. Voeg mindset-laag toe (waarom dit ertoe doet voor wie ze zijn)
4. Eindig met empowering statement of vraag
  `.trim();

  return contextString;
}

/**
 * Build minimal context when onboarding is not completed
 */
function buildMinimalContext(userId: number, context: Partial<IrisKickstartContext>): string {
  return `
# USER CONTEXT (MINIMAL)

User ${userId} has enrolled in Kickstart but hasn't completed onboarding yet.
${context.user_name ? `Name: ${context.user_name}` : ''}

**Coaching approach**: Encourage them to complete onboarding so you can provide personalized coaching.
  `.trim();
}

/**
 * Build default context when user has no Kickstart enrollment
 */
function buildDefaultContext(userId: number): string {
  return `
# USER CONTEXT (DEFAULT)

User ${userId} is not enrolled in Kickstart or has not completed onboarding.

**Coaching approach**: General dating advice. Suggest they consider the Kickstart program for structured guidance.
  `.trim();
}

/**
 * Fallback context in case of errors
 */
function buildFallbackContext(userId: number): string {
  return `
# USER CONTEXT (FALLBACK)

Unable to load detailed context for user ${userId}.

**Coaching approach**: Provide general supportive dating advice. Ask questions to understand their situation better.
  `.trim();
}

/**
 * Get just the onboarding data (for API responses)
 */
export async function getKickstartOnboarding(userId: number) {
  try {
    const result = await sql`
      SELECT * FROM kickstart_onboarding
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching Kickstart onboarding:', error);
    return null;
  }
}

/**
 * Get Kickstart progress summary
 */
export async function getKickstartProgress(userId: number) {
  try {
    const result = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'completed') as completed_days,
        MAX(pd.dag_nummer) FILTER (WHERE udp.status = 'completed') as last_completed_day,
        MIN(pd.dag_nummer) FILTER (WHERE udp.status IN ('available', 'in_progress')) as next_day,
        MAX(udp.updated_at) as last_activity
      FROM user_day_progress udp
      JOIN program_days pd ON pd.id = udp.day_id
      JOIN programs p ON p.id = udp.program_id
      WHERE udp.user_id = ${userId}
        AND p.slug = 'kickstart'
    `;

    const progress = result.rows[0];

    return {
      completedDays: parseInt(progress.completed_days) || 0,
      lastCompletedDay: progress.last_completed_day || null,
      currentDay: progress.next_day || 1,
      lastActivity: progress.last_activity || null,
    };
  } catch (error) {
    console.error('Error fetching Kickstart progress:', error);
    return {
      completedDays: 0,
      lastCompletedDay: null,
      currentDay: 1,
      lastActivity: null,
    };
  }
}

/**
 * Get formatted reflections for Iris context building
 * Returns reflections grouped and formatted for AI consumption
 */
export async function getIrisReflectionContext(userId: number, programSlug: string = 'kickstart') {
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
        AND program_slug = ${programSlug}
      ORDER BY day_number DESC, question_type
      LIMIT 30
    `;

    // Format for Iris
    const formatted = result.rows.map(r => ({
      dag: r.day_number,
      type: r.question_type,
      vraag: r.question_text,
      antwoord: r.answer_text,
      datum: r.created_at
    }));

    return formatted;
  } catch (error) {
    console.error('Error getting Iris reflection context:', error);
    return [];
  }
}
