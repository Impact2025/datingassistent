/**
 * AI Context Manager - Cross-tool memory system
 * Manages user preferences, personality data, and AI insights across all tools
 */

import { sql } from '@vercel/postgres';

export interface UserAIContext {
  // Basic user info
  userId: number;
  name?: string;
  age?: number;
  gender?: string;

  // Personality & preferences
  personalityType?: string;
  communicationStyle?: 'casual' | 'formal' | 'flirty' | 'intellectual' | 'funny';
  energyLevel?: 'low' | 'medium' | 'high';
  humorStyle?: string;

  // Dating preferences
  lookingFor?: string;
  relationshipGoals?: string[];
  dealBreakers?: string[];

  // Interests & hobbies
  interests?: string[];
  hobbies?: string[];

  // Communication patterns
  preferredTopics?: string[];
  conversationStarters?: string[];
  successfulOpeners?: string[];

  // AI tool usage history
  toolUsage?: {
    chatCoach: number;
    openers: number;
    icebreakers: number;
    safetyCheck: number;
    profileBuilder: number;
    photoAnalysis: number;
    platformMatch: number;
  };

  // Success metrics
  matchRate?: number;
  responseRate?: number;
  dateSuccessRate?: number;

  // Date analysis history
  dateAnalysisHistory?: {
    totalAnalyses: number;
    lastAnalysisDate?: Date;
    commonThemes?: string[];
    improvementAreas?: string[];
    strengths?: string[];
    datePatterns?: {
      successfulElements?: string[];
      challenges?: string[];
      preferences?: string[];
    };
  };

  // Pro Welcome Data
  proWelcomeCompleted?: boolean;
  writingStyle?: 'informeel_speels' | 'warm_empathisch' | 'zelfverzekerd_direct' | 'rustig_duidelijk' | 'neutraal';
  datingApps?: string[];
  genderPreference?: 'mannen' | 'vrouwen' | 'iedereen';
  reminderPreference?: 'ja_graag' | 'nee' | 'later_beslissen';
  proWelcomeCompletedAt?: Date;

  // Attachment Style Assessment Data
  attachmentStyle?: {
    primaryStyle: string;
    secondaryStyle?: string;
    scores: {
      secure: number;
      anxious: number;
      avoidant: number;
      fearful_avoidant: number;
    };
    confidence: number;
    completedAt: Date;
    keyInsights: string[];
    redFlags: string[];
    goldenFlags: string[];
    practicalTips: string[];
  };

  // Dating Style Assessment Data
  datingStyle?: {
    primaryStyle: string;
    secondaryStyles: Array<{style: string, percentage: number}>;
    scores: Record<string, number>;
    blindspotIndex: number;
    confidence: number;
    completedAt: Date;
    keyInsights: string[];
    blindSpots: string[];
    chatScripts: any;
    microExercises: any[];
  };

  // Waarden Kompas Assessment Data
  waardenKompas?: {
    coreValues: Array<{key: string, name: string, description: string}>;
    valuesMeaning: Record<string, string>;
    redFlags: string[];
    greenFlags: string[];
    datingStrategies: string[];
    completedAt: Date;
  };

  // Emotionele Readiness Assessment Data
  emotioneelReadiness?: {
    readinessScore: number;
    readinessLevel: 'niet_klaar' | 'bijna_klaar' | 'klaar' | 'zeer_klaar';
    emotioneleDraagkracht: number;
    intentiesScore: number;
    reboundRisico: number;
    selfEsteemScore: number;
    stressScore: number;
    aiConclusie: string;
    readinessAnalyse: string;
    watWerktNu: string[];
    watLastigKanZijn: string[];
    directeAanbevelingen: string[];
    completedAt: Date;
  };

  // Levensvisie Assessment Data
  levensvisie?: {
    levensVisieProfiel: string;
    toekomstKompas: string;
    carriereBetekenisScore: number;
    vrijheidLifestyleScore: number;
    familieRelatiesScore: number;
    groeiRitmeScore: number;
    toekomstPartnerProfiel: string;
    nietOnderhandelbarePunten: string[];
    partnerBehoeften: string[];
    valkuilen: string[];
    lifestyleMatchPredictie: number;
    ambitieMatchPredictie: number;
    besteDataTypes: string[];
    mismatchRisicos: string[];
    onbespreekbareDealbreakers: string[];
    completedAt: Date;
  };

  // Relatiepatronen Assessment Data
  relatiepatronen?: {
    primaryPattern: string;
    patternIntensity: number;
    destructievePatronen: string[];
    triggers: string[];
    copingMechanismes: string[];
    relatieDraadAnalyse: string;
    patroonDoorbrekingStrategieen: string[];
    completedAt: Date;
  };

  // Zelfbeeld & Eerste Indruk Assessment Data
  zelfbeeld?: {
    warmteScore: number;
    charismaScore: number;
    stabiliteitScore: number;
    speelsheidsScore: number;
    emotioneelOpenheidsScore: number;
    mysteryFactorScore: number;
    socialeEnergieScore: number;
    personaAnalyse: string;
    eersteIndrukVoorspelling: string;
    profileOptimizationTips: string[];
    completedAt: Date;
  };

  // Last updated
  lastUpdated: Date;
}

export class AIContextManager {
  /**
   * Get user's AI context from database
   */
  static async getUserContext(userId: number): Promise<UserAIContext | null> {
    try {
      // For development, return a basic context if database is not available
      if (process.env.NODE_ENV === 'development' && !process.env.POSTGRES_URL) {
        console.log('⚠️ Database not configured in development, returning basic context');
        return {
          userId,
          communicationStyle: 'casual',
          energyLevel: 'medium',
          toolUsage: {
            chatCoach: 0,
            openers: 0,
            icebreakers: 0,
            safetyCheck: 0,
            profileBuilder: 0,
            photoAnalysis: 0,
            platformMatch: 0
          },
          lastUpdated: new Date()
        };
      }

      const result = await sql`
        SELECT ai_context FROM users WHERE id = ${userId}
      `;

      let baseContext: Partial<UserAIContext>;

      if (result.rows.length === 0 || !result.rows[0].ai_context) {
        baseContext = {
          userId,
          communicationStyle: 'casual',
          energyLevel: 'medium',
          toolUsage: {
            chatCoach: 0,
            openers: 0,
            icebreakers: 0,
            safetyCheck: 0,
            profileBuilder: 0,
            photoAnalysis: 0,
            platformMatch: 0
          },
          lastUpdated: new Date()
        };
      } else {
        const contextData = result.rows[0].ai_context;
        // Handle case where ai_context might be stored as JSON object instead of string
        if (typeof contextData === 'object') {
          baseContext = contextData as UserAIContext;
        } else {
          baseContext = JSON.parse(contextData);
        }
      }

      // Enrich with assessment data
      const enrichedContext = await this.enrichContextWithAssessments(userId, baseContext);

      return enrichedContext as UserAIContext;
    } catch (error) {
      console.error('Error getting user AI context:', error);
      // Return basic context as fallback
      return {
        userId,
        communicationStyle: 'casual',
        energyLevel: 'medium',
        toolUsage: {
          chatCoach: 0,
          openers: 0,
          icebreakers: 0,
          safetyCheck: 0,
          profileBuilder: 0,
          photoAnalysis: 0,
          platformMatch: 0
        },
        lastUpdated: new Date()
      };
    }
  }

  /**
   * Save user's AI context to database
   */
  static async saveUserContext(userId: number, context: Partial<UserAIContext>): Promise<void> {
    try {
      // For development, skip database save if not configured
      if (process.env.NODE_ENV === 'development' && !process.env.POSTGRES_URL) {
        console.log(`⚠️ Database not configured in development, skipping AI context save for user ${userId}`);
        return;
      }

      // Get existing context
      const existingContext = await this.getUserContext(userId) || {
        userId,
        lastUpdated: new Date()
      };

      // Merge with new data
      const updatedContext: UserAIContext = {
        ...existingContext,
        ...context,
        userId,
        lastUpdated: new Date()
      };

      await sql`
        UPDATE users
        SET ai_context = ${JSON.stringify(updatedContext)}
        WHERE id = ${userId}
      `;

      console.log(`✅ AI context saved for user ${userId}`);
    } catch (error) {
      console.error('Error saving user AI context:', error);
      // Don't throw error in development to prevent breaking functionality
      if (process.env.NODE_ENV !== 'development') {
        throw error;
      }
    }
  }

  /**
   * Update specific context fields
   */
  static async updateContextField(
    userId: number,
    field: keyof UserAIContext,
    value: any
  ): Promise<void> {
    try {
      const context = await this.getUserContext(userId) || {
        userId,
        lastUpdated: new Date()
      };

      (context as any)[field] = value;
      context.lastUpdated = new Date();

      await this.saveUserContext(userId, context);
    } catch (error) {
      console.error(`Error updating context field ${field}:`, error);
      throw error;
    }
  }

  /**
   * Track tool usage
   */
  static async trackToolUsage(userId: number, toolName: string): Promise<void> {
    try {
      // For development, skip tracking if database is not configured
      if (process.env.NODE_ENV === 'development' && !process.env.POSTGRES_URL) {
        console.log(`⚠️ Database not configured in development, skipping tool usage tracking for ${toolName}`);
        return;
      }

      const context = await this.getUserContext(userId) || {
        userId,
        toolUsage: {
          chatCoach: 0,
          openers: 0,
          icebreakers: 0,
          safetyCheck: 0,
          profileBuilder: 0,
          photoAnalysis: 0,
          platformMatch: 0
        },
        lastUpdated: new Date()
      };

      if (!context.toolUsage) {
        context.toolUsage = {
          chatCoach: 0,
          openers: 0,
          icebreakers: 0,
          safetyCheck: 0,
          profileBuilder: 0,
          photoAnalysis: 0,
          platformMatch: 0
        };
      }

      // Map tool names to context fields
      const toolMapping: { [key: string]: keyof typeof context.toolUsage } = {
        'chat-coach': 'chatCoach',
        'openingszinnen-generator': 'openers',
        'ijsbreker-generator': 'icebreakers',
        'veiligheidscheck': 'safetyCheck',
        'interactive-profile-coach': 'profileBuilder',
        'photo-analysis-tab': 'photoAnalysis',
        'platform-match-tool': 'platformMatch'
      };

      const contextField = toolMapping[toolName];
      if (contextField && context.toolUsage[contextField] !== undefined) {
        context.toolUsage[contextField]++;
        await this.saveUserContext(userId, context);
      }
    } catch (error) {
      console.error('Error tracking tool usage:', error);
      // Don't throw error in development
      if (process.env.NODE_ENV !== 'development') {
        throw error;
      }
    }
  }

  /**
   * Get AI context summary for prompts
   */
  static getContextSummary(context: UserAIContext | null): string {
    if (!context) return '';

    let summary = '';

    // Basic personality
    if (context.personalityType) {
      summary += `Persoonlijkheid: ${context.personalityType}. `;
    }

    if (context.communicationStyle) {
      summary += `Communicatiestijl: ${context.communicationStyle}. `;
    }

    if (context.energyLevel) {
      summary += `Energie niveau: ${context.energyLevel}. `;
    }

    if (context.interests && context.interests.length > 0) {
      summary += `Interesses: ${context.interests.slice(0, 3).join(', ')}. `;
    }

    if (context.humorStyle) {
      summary += `Humor stijl: ${context.humorStyle}. `;
    }

    if (context.successfulOpeners && context.successfulOpeners.length > 0) {
      summary += `Succesvolle openers: ${context.successfulOpeners.length} opgeslagen. `;
    }

    // Hechtingsstijl
    if (context.attachmentStyle) {
      summary += `Hechtingsstijl: ${context.attachmentStyle.primaryStyle}`;
      if (context.attachmentStyle.secondaryStyle) {
        summary += ` (secundair: ${context.attachmentStyle.secondaryStyle})`;
      }
      if (context.attachmentStyle.keyInsights && context.attachmentStyle.keyInsights.length > 0) {
        summary += ` - Key insight: "${context.attachmentStyle.keyInsights[0]}"`;
      }
      summary += '. ';
    }

    // Dating Style
    if (context.datingStyle) {
      summary += `Datingstijl: ${context.datingStyle.primaryStyle}`;
      if (context.datingStyle.secondaryStyles && context.datingStyle.secondaryStyles.length > 0) {
        summary += ` (secundair: ${context.datingStyle.secondaryStyles[0].style})`;
      }
      if (context.datingStyle.blindSpots && context.datingStyle.blindSpots.length > 0) {
        summary += ` - Blind spot: "${context.datingStyle.blindSpots[0]}"`;
      }
      summary += '. ';
    }

    // Waarden Kompas
    if (context.waardenKompas) {
      const topValues = context.waardenKompas.coreValues.slice(0, 3).map(v => v.name).join(', ');
      summary += `Core waarden: ${topValues}. `;

      if (context.waardenKompas.redFlags && context.waardenKompas.redFlags.length > 0) {
        summary += `Red flags voor deze persoon: ${context.waardenKompas.redFlags.slice(0, 2).join('; ')}. `;
      }

      if (context.waardenKompas.greenFlags && context.waardenKompas.greenFlags.length > 0) {
        summary += `Green flags voor deze persoon: ${context.waardenKompas.greenFlags.slice(0, 2).join('; ')}. `;
      }
    }

    // Emotionele Readiness
    if (context.emotioneelReadiness) {
      summary += `Emotionele readiness: ${context.emotioneelReadiness.readinessLevel} (score: ${context.emotioneelReadiness.readinessScore}/10)`;

      if (context.emotioneelReadiness.reboundRisico > 50) {
        summary += ` - Rebound risico hoog (${context.emotioneelReadiness.reboundRisico}%)`;
      }

      if (context.emotioneelReadiness.aiConclusie) {
        summary += ` - "${context.emotioneelReadiness.aiConclusie}"`;
      }
      summary += '. ';

      if (context.emotioneelReadiness.directeAanbevelingen && context.emotioneelReadiness.directeAanbevelingen.length > 0) {
        summary += `Aanbeveling: ${context.emotioneelReadiness.directeAanbevelingen[0]}. `;
      }
    }

    // Levensvisie
    if (context.levensvisie) {
      summary += `Levensvisie: ${context.levensvisie.levensVisieProfiel}. `;

      if (context.levensvisie.nietOnderhandelbarePunten && context.levensvisie.nietOnderhandelbarePunten.length > 0) {
        summary += `Dealbreakers: ${context.levensvisie.nietOnderhandelbarePunten.slice(0, 2).join(', ')}. `;
      }

      if (context.levensvisie.toekomstPartnerProfiel) {
        summary += `Ideale partner: ${context.levensvisie.toekomstPartnerProfiel}. `;
      }

      const compatibilityScores = [
        { type: 'lifestyle', score: context.levensvisie.lifestyleMatchPredictie },
        { type: 'ambitie', score: context.levensvisie.ambitieMatchPredictie }
      ].filter(s => s.score !== undefined);

      if (compatibilityScores.length > 0) {
        const avgScore = compatibilityScores.reduce((sum, s) => sum + (s.score || 0), 0) / compatibilityScores.length;
        summary += `Compatibility focus: lifestyle & ambitie match belangrijk (${Math.round(avgScore)}/10). `;
      }
    }

    // Relatiepatronen
    if (context.relatiepatronen) {
      summary += `Relatie patroon: ${context.relatiepatronen.primaryPattern} (intensiteit: ${context.relatiepatronen.patternIntensity}/10). `;

      if (context.relatiepatronen.destructievePatronen && context.relatiepatronen.destructievePatronen.length > 0) {
        summary += `Destructieve patronen: ${context.relatiepatronen.destructievePatronen.slice(0, 2).join(', ')}. `;
      }

      if (context.relatiepatronen.triggers && context.relatiepatronen.triggers.length > 0) {
        summary += `Triggers: ${context.relatiepatronen.triggers.slice(0, 2).join(', ')}. `;
      }
    }

    // Zelfbeeld
    if (context.zelfbeeld) {
      const vibes = [
        { name: 'warmte', score: context.zelfbeeld.warmteScore },
        { name: 'charisma', score: context.zelfbeeld.charismaScore },
        { name: 'speelsheid', score: context.zelfbeeld.speelsheidsScore }
      ].sort((a, b) => (b.score || 0) - (a.score || 0));

      summary += `Vibe profiel: sterk in ${vibes[0].name} (${vibes[0].score}/10). `;

      if (context.zelfbeeld.eersteIndrukVoorspelling) {
        summary += `Eerste indruk: ${context.zelfbeeld.eersteIndrukVoorspelling}. `;
      }
    }

    return summary.trim();
  }

  /**
   * Initialize AI context from user profile and personality scan
   */
  static async initializeFromProfile(userId: number, userProfile: any, personalityScan?: any): Promise<void> {
    try {
      const context: Partial<UserAIContext> = {
        userId,
        name: userProfile?.name,
        age: userProfile?.age,
        gender: userProfile?.gender,
        interests: userProfile?.interests || [],
        lookingFor: userProfile?.lookingFor,
        communicationStyle: 'casual', // Default, can be updated by tools
        energyLevel: 'medium', // Default, can be updated by tools
        toolUsage: {
          chatCoach: 0,
          openers: 0,
          icebreakers: 0,
          safetyCheck: 0,
          profileBuilder: 0,
          photoAnalysis: 0,
          platformMatch: 0
        }
      };

      // Extract personality insights if available
      if (personalityScan) {
        if (personalityScan.personality_type) {
          context.personalityType = personalityScan.personality_type;
        }

        if (personalityScan.communication_style) {
          context.communicationStyle = personalityScan.communication_style;
        }

        if (personalityScan.energy_level) {
          context.energyLevel = personalityScan.energy_level;
        }

        if (personalityScan.humor_style) {
          context.humorStyle = personalityScan.humor_style;
        }
      }

      await this.saveUserContext(userId, context);
      console.log(`✅ AI context initialized for user ${userId}`);
    } catch (error) {
      console.error('Error initializing AI context:', error);
    }
  }

  /**
   * Load Attachment Style (Hechtingsstijl) data for a user
   */
  static async loadAttachmentStyleData(userId: number): Promise<any> {
    try {
      // Get most recent completed assessment from hechtingsstijl_results
      const result = await sql`
        SELECT
          stijl_type as primary_style,
          score,
          veilig_score,
          angstig_score,
          vermijdend_score,
          angstig_vermijdend_score,
          key_insights,
          relationship_patterns,
          red_flags,
          golden_flags,
          practical_tips,
          completed_at
        FROM hechtingsstijl_results
        WHERE user_id = ${userId}
        ORDER BY completed_at DESC
        LIMIT 1
      `;

      if (result.rows.length === 0) {
        return null;
      }

      const r = result.rows[0];

      // Determine secondary style based on scores
      const scores = {
        secure: r.veilig_score || 0,
        anxious: r.angstig_score || 0,
        avoidant: r.vermijdend_score || 0,
        fearful_avoidant: r.angstig_vermijdend_score || 0
      };

      const sortedStyles = Object.entries(scores)
        .sort(([,a], [,b]) => b - a);

      const secondaryStyle = sortedStyles[1] ? sortedStyles[1][0] : undefined;

      return {
        primaryStyle: r.primary_style,
        secondaryStyle: secondaryStyle,
        scores: scores,
        confidence: r.score || 0,
        completedAt: r.completed_at,
        keyInsights: r.key_insights ? (typeof r.key_insights === 'string' ? JSON.parse(r.key_insights) : r.key_insights) : [],
        redFlags: r.red_flags ? (typeof r.red_flags === 'string' ? JSON.parse(r.red_flags) : r.red_flags) : [],
        goldenFlags: r.golden_flags ? (typeof r.golden_flags === 'string' ? JSON.parse(r.golden_flags) : r.golden_flags) : [],
        practicalTips: r.practical_tips ? (typeof r.practical_tips === 'string' ? JSON.parse(r.practical_tips) : r.practical_tips) : [],
        relationshipPatterns: r.relationship_patterns ? (typeof r.relationship_patterns === 'string' ? JSON.parse(r.relationship_patterns) : r.relationship_patterns) : []
      };
    } catch (error) {
      console.log('No Hechtingsstijl data found or table does not exist');
      return null;
    }
  }

  /**
   * Load Dating Style data for a user
   */
  static async loadDatingStyleData(userId: number): Promise<any> {
    try {
      // Get most recent completed assessment from dating_style_results
      const result = await sql`
        SELECT
          primary_style,
          secondary_styles,
          style_scores,
          blindspot_index,
          confidence_score,
          key_insights,
          blind_spots,
          chat_scripts,
          micro_exercises,
          completed_at
        FROM dating_style_results
        WHERE user_id = ${userId}
        ORDER BY completed_at DESC
        LIMIT 1
      `;

      if (result.rows.length === 0) {
        return null;
      }

      const r = result.rows[0];

      return {
        primaryStyle: r.primary_style,
        secondaryStyles: r.secondary_styles ? (typeof r.secondary_styles === 'string' ? JSON.parse(r.secondary_styles) : r.secondary_styles) : [],
        scores: r.style_scores ? (typeof r.style_scores === 'string' ? JSON.parse(r.style_scores) : r.style_scores) : {},
        blindspotIndex: r.blindspot_index || 0,
        confidence: r.confidence_score || 0,
        completedAt: r.completed_at,
        keyInsights: r.key_insights ? (typeof r.key_insights === 'string' ? JSON.parse(r.key_insights) : r.key_insights) : [],
        blindSpots: r.blind_spots ? (typeof r.blind_spots === 'string' ? JSON.parse(r.blind_spots) : r.blind_spots) : [],
        chatScripts: r.chat_scripts ? (typeof r.chat_scripts === 'string' ? JSON.parse(r.chat_scripts) : r.chat_scripts) : {},
        microExercises: r.micro_exercises ? (typeof r.micro_exercises === 'string' ? JSON.parse(r.micro_exercises) : r.micro_exercises) : []
      };
    } catch (error) {
      console.log('No Dating Style data found or table does not exist');
      return null;
    }
  }

  /**
   * Load Waarden Kompas data for a user
   */
  static async loadWaardenKompasData(userId: number): Promise<any> {
    try {
      // Get most recent completed Waarden Kompas session
      const sessionResult = await sql`
        SELECT id, current_phase, completed_at
        FROM waarden_kompas_sessions
        WHERE user_id = ${userId} AND current_phase = 'completed'
        ORDER BY completed_at DESC
        LIMIT 1
      `;

      if (sessionResult.rows.length === 0) {
        return null;
      }

      const session = sessionResult.rows[0];

      // Get results
      const resultsResult = await sql`
        SELECT core_values, values_meaning, red_flags, green_flags, dating_strategies
        FROM waarden_kompas_results
        WHERE session_id = ${session.id}
        ORDER BY generated_at DESC
        LIMIT 1
      `;

      if (resultsResult.rows.length === 0) {
        return null;
      }

      const results = resultsResult.rows[0];

      return {
        coreValues: JSON.parse(results.core_values as string),
        valuesMeaning: JSON.parse(results.values_meaning as string),
        redFlags: JSON.parse(results.red_flags as string),
        greenFlags: JSON.parse(results.green_flags as string),
        datingStrategies: JSON.parse(results.dating_strategies as string),
        completedAt: session.completed_at
      };
    } catch (error) {
      console.error('Error loading Waarden Kompas data:', error);
      return null;
    }
  }

  /**
   * Load Emotionele Readiness data for a user
   */
  static async loadEmotioneelReadinessData(userId: number): Promise<any> {
    try {
      // Get most recent completed assessment
      const assessmentResult = await sql`
        SELECT id, created_at
        FROM emotionele_readiness_assessments
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 1
      `;

      if (assessmentResult.rows.length === 0) {
        return null;
      }

      const assessment = assessmentResult.rows[0];

      // Get results
      const resultsResult = await sql`
        SELECT
          readiness_score, readiness_level, emotionele_draagkracht,
          intenties_score, rebound_risico, self_esteem_score, stress_score,
          ai_conclusie, readiness_analyse, wat_werkt_nu, wat_lastig_kan_zijn,
          directe_aanbevelingen
        FROM emotionele_readiness_results
        WHERE assessment_id = ${assessment.id}
        LIMIT 1
      `;

      if (resultsResult.rows.length === 0) {
        return null;
      }

      const results = resultsResult.rows[0];

      return {
        readinessScore: results.readiness_score,
        readinessLevel: results.readiness_level,
        emotioneleDraagkracht: results.emotionele_draagkracht,
        intentiesScore: results.intenties_score,
        reboundRisico: results.rebound_risico,
        selfEsteemScore: results.self_esteem_score,
        stressScore: results.stress_score,
        aiConclusie: results.ai_conclusie,
        readinessAnalyse: results.readiness_analyse,
        watWerktNu: JSON.parse(results.wat_werkt_nu as string || '[]'),
        watLastigKanZijn: JSON.parse(results.wat_lastig_kan_zijn as string || '[]'),
        directeAanbevelingen: JSON.parse(results.directe_aanbevelingen as string || '[]'),
        completedAt: assessment.created_at
      };
    } catch (error) {
      console.error('Error loading Emotionele Readiness data:', error);
      return null;
    }
  }

  /**
   * Load Levensvisie data for a user
   */
  static async loadLevensvisieData(userId: number): Promise<any> {
    try {
      // Get most recent completed assessment
      const assessmentResult = await sql`
        SELECT id, created_at
        FROM levensvisie_assessments
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 1
      `;

      if (assessmentResult.rows.length === 0) {
        return null;
      }

      const assessment = assessmentResult.rows[0];

      // Get results
      const resultsResult = await sql`
        SELECT
          levensvisie_profiel, toekomst_kompas,
          carrière_betekenis_score, vrijheid_lifestyle_score, familie_relaties_score, groei_ritme_score,
          toekomst_partner_profiel, niet_onderhandelbare_punten, partner_behoeften, valkuilen,
          lifestyle_match_predictie, ambitie_match_predictie, beste_date_types,
          mismatch_risicos, onbespreekbare_dealbreakers
        FROM levensvisie_results
        WHERE assessment_id = ${assessment.id}
        LIMIT 1
      `;

      if (resultsResult.rows.length === 0) {
        return null;
      }

      const results = resultsResult.rows[0];

      return {
        levensVisieProfiel: results.levensvisie_profiel,
        toekomstKompas: results.toekomst_kompas,
        carriereBetekenisScore: results.carrière_betekenis_score,
        vrijheidLifestyleScore: results.vrijheid_lifestyle_score,
        familieRelatiesScore: results.familie_relaties_score,
        groeiRitmeScore: results.groei_ritme_score,
        toekomstPartnerProfiel: results.toekomst_partner_profiel,
        nietOnderhandelbarePunten: JSON.parse(results.niet_onderhandelbare_punten as string || '[]'),
        partnerBehoeften: JSON.parse(results.partner_behoeften as string || '[]'),
        valkuilen: JSON.parse(results.valkuilen as string || '[]'),
        lifestyleMatchPredictie: results.lifestyle_match_predictie,
        ambitieMatchPredictie: results.ambitie_match_predictie,
        besteDataTypes: JSON.parse(results.beste_date_types as string || '[]'),
        mismatchRisicos: JSON.parse(results.mismatch_risicos as string || '[]'),
        onbespreekbareDealbreakers: JSON.parse(results.onbespreekbare_dealbreakers as string || '[]'),
        completedAt: assessment.created_at
      };
    } catch (error) {
      console.error('Error loading Levensvisie data:', error);
      return null;
    }
  }

  /**
   * Load Relatiepatronen data for a user
   */
  static async loadRelatiepatronenData(userId: number): Promise<any> {
    try {
      // Get most recent completed assessment
      const assessmentResult = await sql`
        SELECT id, created_at, status
        FROM relationship_patterns_assessments
        WHERE user_id = ${userId} AND status = 'completed'
        ORDER BY created_at DESC
        LIMIT 1
      `;

      if (assessmentResult.rows.length === 0) {
        return null;
      }

      const assessment = assessmentResult.rows[0];

      // Get results
      const resultsResult = await sql`
        SELECT
          primary_pattern, pattern_intensity, destructieve_patronen,
          triggers, coping_mechanismes, relatie_draad_analyse,
          patroon_doorbreking_strategieen
        FROM relationship_patterns_results
        WHERE assessment_id = ${assessment.id}
        LIMIT 1
      `;

      if (resultsResult.rows.length === 0) {
        return null;
      }

      const results = resultsResult.rows[0];

      return {
        primaryPattern: results.primary_pattern,
        patternIntensity: results.pattern_intensity,
        destructievePatronen: JSON.parse(results.destructieve_patronen as string || '[]'),
        triggers: JSON.parse(results.triggers as string || '[]'),
        copingMechanismes: JSON.parse(results.coping_mechanismes as string || '[]'),
        relatieDraadAnalyse: results.relatie_draad_analyse,
        patroonDoorbrekingStrategieen: JSON.parse(results.patroon_doorbreking_strategieen as string || '[]'),
        completedAt: assessment.created_at
      };
    } catch (error) {
      console.error('Error loading Relatiepatronen data:', error);
      return null;
    }
  }

  /**
   * Load Zelfbeeld data for a user
   */
  static async loadZelfbeeldData(userId: number): Promise<any> {
    try {
      // Get most recent completed assessment
      const assessmentResult = await sql`
        SELECT id, created_at, status
        FROM zelfbeeld_assessments
        WHERE user_id = ${userId} AND status = 'completed'
        ORDER BY created_at DESC
        LIMIT 1
      `;

      if (assessmentResult.rows.length === 0) {
        return null;
      }

      const assessment = assessmentResult.rows[0];

      // Get vibe meters
      const vibeResult = await sql`
        SELECT
          warmte_score, charisma_score, stabiliteit_score, speelsheid_score,
          emotionele_openheid_score, mystery_factor_score, sociale_energie_score
        FROM zelfbeeld_vibe_meters
        WHERE assessment_id = ${assessment.id}
        LIMIT 1
      `;

      // Get results
      const resultsResult = await sql`
        SELECT persona_analyse, eerste_indruk_voorspelling, profile_optimization_tips
        FROM zelfbeeld_results
        WHERE assessment_id = ${assessment.id}
        LIMIT 1
      `;

      if (vibeResult.rows.length === 0 || resultsResult.rows.length === 0) {
        return null;
      }

      const vibe = vibeResult.rows[0];
      const results = resultsResult.rows[0];

      return {
        warmteScore: vibe.warmte_score,
        charismaScore: vibe.charisma_score,
        stabiliteitScore: vibe.stabiliteit_score,
        speelsheidsScore: vibe.speelsheid_score,
        emotioneelOpenheidsScore: vibe.emotionele_openheid_score,
        mysteryFactorScore: vibe.mystery_factor_score,
        socialeEnergieScore: vibe.sociale_energie_score,
        personaAnalyse: results.persona_analyse,
        eersteIndrukVoorspelling: results.eerste_indruk_voorspelling,
        profileOptimizationTips: JSON.parse(results.profile_optimization_tips as string || '[]'),
        completedAt: assessment.created_at
      };
    } catch (error) {
      console.error('Error loading Zelfbeeld data:', error);
      return null;
    }
  }

  /**
   * Load all assessment data and enrich AI context
   * NOW LOADS ALL 7 ASSESSMENTS!
   */
  static async enrichContextWithAssessments(userId: number, context: Partial<UserAIContext>): Promise<Partial<UserAIContext>> {
    try {
      // Load ALL 7 assessment data in parallel for performance
      const [
        attachmentStyle,
        datingStyle,
        waardenKompas,
        emotioneelReadiness,
        levensvisie,
        relatiepatronen,
        zelfbeeld
      ] = await Promise.all([
        this.loadAttachmentStyleData(userId),
        this.loadDatingStyleData(userId),
        this.loadWaardenKompasData(userId),
        this.loadEmotioneelReadinessData(userId),
        this.loadLevensvisieData(userId),
        this.loadRelatiepatronenData(userId),
        this.loadZelfbeeldData(userId)
      ]);

      // Enrich context with ALL 7 assessments
      if (attachmentStyle) {
        context.attachmentStyle = attachmentStyle;
      }

      if (datingStyle) {
        context.datingStyle = datingStyle;
      }

      if (waardenKompas) {
        context.waardenKompas = waardenKompas;
      }

      if (emotioneelReadiness) {
        context.emotioneelReadiness = emotioneelReadiness;
      }

      if (levensvisie) {
        context.levensvisie = levensvisie;
      }

      if (relatiepatronen) {
        context.relatiepatronen = relatiepatronen;
      }

      if (zelfbeeld) {
        context.zelfbeeld = zelfbeeld;
      }

      console.log(`✅ Context enriched with ALL 7 assessments for user ${userId}`);
      return context;
    } catch (error) {
      console.error('Error enriching context with assessments:', error);
      return context;
    }
  }
}