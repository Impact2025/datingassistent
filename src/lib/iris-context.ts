// ============================================================================
// IRIS CONTEXT BUILDER
//
// Bouwt de complete context voor Iris AI Coach
// Verzamelt alle relevante info over de gebruiker voor gepersonaliseerde responses
// WERELDKLASSE UPGRADE: Integratie met AIContextManager voor alle 7 assessments
// ============================================================================

import { sql } from '@vercel/postgres';
import type { IrisContextForPrompt, IrisUserContext, CursusLes } from '../types/cursus.types';
import { AIContextManager } from './ai-context-manager';

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

/**
 * 🚀 WERELDKLASSE: Haalt VERRIJKTE Iris context op met ALLE 7 assessments
 * Gebruikt AIContextManager voor complete persoonlijke context
 */
export async function getEnrichedIrisContext(userId: number): Promise<IrisContextForPrompt & { aiContext: any }> {
  // 1. Haal basis Iris context op (voor cursus/les info)
  const baseContext = await getIrisContext(userId);

  // 2. Haal AI Context Manager data op (ALLE 7 assessments!)
  const aiContext = await AIContextManager.getUserContext(userId);

  // 3. Merge en return
  return {
    ...baseContext,
    aiContext: aiContext || {}, // Voeg complete AI context toe
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
 * 🚀 WERELDKLASSE: Bouw de system prompt voor Iris met ALLE assessment data
 */
export function buildIrisSystemPrompt(context: IrisContextForPrompt & { aiContext?: any }): string {
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
  if (aiContext) {
    parts.push(`
💡 HOE JE DEZE DATA GEBRUIKT:
- Gebruik hechtingsstijl om relatie adviezen te personaliseren
- Verwijs naar core waarden bij match/date beslissingen
- Wees voorzichtig als rebound risico hoog is
- Gebruik blinde vlekken om blinde vlekken te helpen zien
- Match advies aan hun levensvisie doelen
- Herken triggers en geef preventieve tips
- Bouw op hun profile strengths bij profiel advies`);
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
