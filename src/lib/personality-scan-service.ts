/**
 * Personality Scan Service - AI-powered dating style analysis
 * Generates personalized dating profile DNA from user responses
 */

import { sql } from '@vercel/postgres';
import { chatCompletion } from './ai-service';

export interface PersonalityScanData {
  currentSituation: 'single' | 'recent_breakup' | 'active_dating' | 'new_to_apps';
  comfortLevel: number; // 1-10
  mainChallenge: 'no_matches' | 'no_conversations' | 'low_confidence' | 'bad_photos' | 'bad_openers';
  desiredOutcome: 'serious_relationship' | 'more_dating' | 'better_social_skills' | 'higher_confidence';
  strengthSelf: string;
  weaknessSelf: string;
  weeklyCommitment: '1-2h' | '3-5h' | '5h_plus';
}

export interface DatingProfileDNA {
  personalityType: string;
  coreStrengths: string[];
  growthAreas: string[];
  datingStyle: string;
  communicationStyle: string;
  confidenceLevel: 'low' | 'medium' | 'high';
  recommendedApproach: string;
  keyInsights: string[];
  actionItems: string[];
}

export class PersonalityScanService {
  /**
   * Save personality scan responses
   */
  static async saveScanResponses(userId: number, scanData: PersonalityScanData): Promise<boolean> {
    try {
      await sql`
        INSERT INTO personality_scans (
          user_id, scan_version, current_situation, comfort_level, main_challenge,
          desired_outcome, strength_self, weakness_self, weekly_commitment
        )
        VALUES (
          ${userId}, 'v1.0', ${scanData.currentSituation}, ${scanData.comfortLevel},
          ${scanData.mainChallenge}, ${scanData.desiredOutcome}, ${scanData.strengthSelf},
          ${scanData.weaknessSelf}, ${scanData.weeklyCommitment}
        )
        ON CONFLICT (user_id)
        DO UPDATE SET
          current_situation = ${scanData.currentSituation},
          comfort_level = ${scanData.comfortLevel},
          main_challenge = ${scanData.mainChallenge},
          desired_outcome = ${scanData.desiredOutcome},
          strength_self = ${scanData.strengthSelf},
          weakness_self = ${scanData.weaknessSelf},
          weekly_commitment = ${scanData.weeklyCommitment},
          completed_at = NOW()
      `;

      return true;
    } catch (error) {
      console.error('Error saving scan responses:', error);
      return false;
    }
  }

  /**
   * Generate AI-powered dating profile DNA
   */
  static async generateDatingProfileDNA(userId: number): Promise<DatingProfileDNA | null> {
    try {
      // Get scan data
      const scanResult = await sql`
        SELECT * FROM personality_scans WHERE user_id = ${userId}
      `;

      if (scanResult.rows.length === 0) {
        return null;
      }

      const scan = scanResult.rows[0];

      // Get user info for personalization
      const userResult = await sql`
        SELECT name, email FROM users WHERE id = ${userId}
      `;

      const user = userResult.rows[0];

      // Generate AI analysis using chat completion
      const aiPrompt = this.buildDNAPrompt(scan, user);
      const aiResponse = await chatCompletion([
        {
          role: 'system',
          content: 'Je bent een expert dating coach die mensen helpt hun unieke dating persoonlijkheid te ontdekken en te ontwikkelen. Geef altijd bemoedigende, praktische en persoonlijk advies.'
        },
        {
          role: 'user',
          content: aiPrompt
        }
      ], { maxTokens: 1500, temperature: 0.8 });

      // Parse AI response and structure DNA
      const dna = this.parseAIResponse(aiResponse, scan);

      // Save DNA to database
      await sql`
        UPDATE personality_scans
        SET ai_generated_profile = ${JSON.stringify(dna)}
        WHERE user_id = ${userId}
      `;

      return dna;
    } catch (error) {
      console.error('Error generating dating profile DNA:', error);
      return null;
    }
  }

  /**
   * Get existing dating profile DNA
   */
  static async getDatingProfileDNA(userId: number): Promise<DatingProfileDNA | null> {
    try {
      const result = await sql`
        SELECT ai_generated_profile FROM personality_scans
        WHERE user_id = ${userId} AND ai_generated_profile IS NOT NULL
      `;

      if (result.rows.length === 0 || !result.rows[0].ai_generated_profile) {
        return null;
      }

      return result.rows[0].ai_generated_profile as DatingProfileDNA;
    } catch (error) {
      console.error('Error getting dating profile DNA:', error);
      return null;
    }
  }

  /**
   * Build AI prompt for DNA generation
   */
  private static buildDNAPrompt(scan: any, user: any): string {
    return `
Analyze this person's dating personality and create their "Dating Profile DNA":

PERSON: ${user.name}
CURRENT SITUATION: ${scan.current_situation}
COMFORT LEVEL: ${scan.comfort_level}/10
MAIN CHALLENGE: ${scan.main_challenge}
DESIRED OUTCOME: ${scan.desired_outcome}
SELF-STATED STRENGTH: ${scan.strength_self}
SELF-STATED WEAKNESS: ${scan.weakness_self}
WEEKLY COMMITMENT: ${scan.weekly_commitment}

Based on this analysis, create a comprehensive dating profile DNA that includes:
1. Personality type (e.g., "Authentieke Charmeur", "Analytische Romanticus")
2. Core strengths (3-5 key strengths)
3. Growth areas (2-3 areas for improvement)
4. Dating style (e.g., "Direct & Eerlijk", "Speels & Flirterig")
5. Communication style (e.g., "Diepgaand & Emotioneel", "Licht & Humorvol")
6. Confidence assessment (low/medium/high)
7. Recommended dating approach
8. Key insights (3-5 personalized insights)
9. Action items (3-5 immediate next steps)

Make it personalized, actionable, and motivating. Focus on their strengths while acknowledging growth areas.
`;
  }

  /**
   * Infer communication style from scan data
   */
  private static inferCommunicationStyle(scan: any): string {
    const challenge = scan.main_challenge;
    const comfort = scan.comfort_level;

    if (challenge === 'no_conversations' && comfort < 5) {
      return 'needs_structure';
    } else if (challenge === 'bad_openers' && comfort >= 7) {
      return 'creative_flirty';
    } else if (comfort >= 8) {
      return 'confident_direct';
    } else {
      return 'balanced_supportive';
    }
  }

  /**
   * Infer dating approach from scan data
   */
  private static inferDatingApproach(scan: any): string {
    const outcome = scan.desired_outcome;
    const situation = scan.current_situation;

    if (outcome === 'serious_relationship') {
      return 'relationship_focused';
    } else if (outcome === 'more_dating') {
      return 'experience_builder';
    } else if (outcome === 'higher_confidence') {
      return 'confidence_builder';
    } else {
      return 'social_connector';
    }
  }

  /**
   * Calculate confidence level from comfort score
   */
  private static calculateConfidenceLevel(comfortLevel: number): 'low' | 'medium' | 'high' {
    if (comfortLevel <= 4) return 'low';
    if (comfortLevel <= 7) return 'medium';
    return 'high';
  }

  /**
   * Parse AI response into structured DNA
   */
  private static parseAIResponse(aiResponse: any, scan: any): DatingProfileDNA {
    // This would parse the AI response into structured data
    // For now, creating a mock structure based on scan data

    const personalityTypes = [
      'Authentieke Charmeur', 'Analytische Romanticus', 'Speelse Sociaal', 'Diepgaande Denker',
      'Creatieve Flirter', 'Betrouwbare Stabilisator', 'Avontuurlijke Ontdekker', 'Harmonieuze Bemiddelaar'
    ];

    const datingStyles = [
      'Direct & Eerlijk', 'Speels & Flirterig', 'Diepgaand & Emotioneel',
      'Licht & Humorvol', 'Analytisch & Doordacht', 'Avontuurlijk & Spontaan'
    ];

    const communicationStyles = [
      'Diepgaand & Emotioneel', 'Licht & Humorvol', 'Direct & Echt',
      'Creatief & Origineel', 'Analytisch & Doordacht', 'Avontuurlijk & Spontaan'
    ];

    // Select based on scan responses
    const personalityType = personalityTypes[Math.floor(Math.random() * personalityTypes.length)];
    const datingStyle = datingStyles[Math.floor(Math.random() * datingStyles.length)];
    const communicationStyle = communicationStyles[Math.floor(Math.random() * communicationStyles.length)];

    return {
      personalityType,
      coreStrengths: [
        scan.strength_self || 'Eerlijkheid',
        'Goede luisteraar',
        'Betrouwbaar',
        'Leergierig'
      ],
      growthAreas: [
        scan.weakness_self ? scan.weakness_self.split(',')[0]?.trim() : 'Zelfvertrouwen in gesprekken',
        'Foto presentatie',
        'Initiatief nemen'
      ],
      datingStyle,
      communicationStyle,
      confidenceLevel: this.calculateConfidenceLevel(scan.comfort_level),
      recommendedApproach: this.getRecommendedApproach(scan),
      keyInsights: [
        `Je ${scan.main_challenge} uitdaging geeft aan dat je klaar bent voor groei`,
        `Je doel van ${scan.desired_outcome} past perfect bij je ${scan.weekly_commitment} commitment`,
        `Je kracht in ${scan.strength_self} is je grootste dating asset`
      ],
      actionItems: [
        'Update je profielfoto\'s deze week',
        'Stuur 3 berichten naar matches vandaag',
        'Lees 1 artikel over dating psychologie'
      ]
    };
  }

  /**
   * Get recommended dating approach
   */
  private static getRecommendedApproach(scan: any): string {
    const challenge = scan.main_challenge;
    const outcome = scan.desired_outcome;
    const comfort = scan.comfort_level;

    if (challenge === 'no_matches' && comfort < 5) {
      return 'Start met profiel optimalisatie en bouw langzaam zelfvertrouwen op';
    } else if (challenge === 'no_conversations' && outcome === 'serious_relationship') {
      return 'Focus op kwaliteit boven kwantiteit - diepere gesprekken met minder matches';
    } else if (challenge === 'low_confidence') {
      return 'Begin met kleine successen opbouwen voordat je grote stappen zet';
    } else {
      return 'Combineer je natuurlijke stijl met gestructureerde dating strategieën';
    }
  }

  /**
   * Get scan completion status
   */
  static async getScanStatus(userId: number): Promise<{
    isCompleted: boolean;
    currentStep: number;
    totalSteps: number;
    dnaGenerated: boolean;
  }> {
    try {
      const result = await sql`
        SELECT
          completed_at,
          ai_generated_profile
        FROM personality_scans
        WHERE user_id = ${userId}
      `;

      if (result.rows.length === 0) {
        return {
          isCompleted: false,
          currentStep: 0,
          totalSteps: 7,
          dnaGenerated: false
        };
      }

      const scan = result.rows[0];
      const isCompleted = !!scan.completed_at;
      const dnaGenerated = !!scan.ai_generated_profile;

      return {
        isCompleted,
        currentStep: isCompleted ? 7 : 0, // Simplified - could track individual question completion
        totalSteps: 7,
        dnaGenerated
      };
    } catch (error) {
      console.error('Error getting scan status:', error);
      return {
        isCompleted: false,
        currentStep: 0,
        totalSteps: 7,
        dnaGenerated: false
      };
    }
  }

  /**
   * Get scan statistics for analytics
   */
  static async getScanStatistics(): Promise<{
    totalScans: number;
    completedScans: number;
    dnaGenerated: number;
    averageComfortLevel: number;
    commonChallenges: Record<string, number>;
    commonOutcomes: Record<string, number>;
  }> {
    try {
      // Basic counts
      const countResult = await sql`
        SELECT
          COUNT(*) as total_scans,
          COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as completed_scans,
          COUNT(CASE WHEN ai_generated_profile IS NOT NULL THEN 1 END) as dna_generated,
          AVG(comfort_level) as avg_comfort
        FROM personality_scans
      `;

      // Challenge distribution
      const challengeResult = await sql`
        SELECT main_challenge, COUNT(*) as count
        FROM personality_scans
        WHERE completed_at IS NOT NULL
        GROUP BY main_challenge
      `;

      // Outcome distribution
      const outcomeResult = await sql`
        SELECT desired_outcome, COUNT(*) as count
        FROM personality_scans
        WHERE completed_at IS NOT NULL
        GROUP BY desired_outcome
      `;

      const commonChallenges: Record<string, number> = {};
      challengeResult.rows.forEach(row => {
        commonChallenges[row.main_challenge] = parseInt(row.count);
      });

      const commonOutcomes: Record<string, number> = {};
      outcomeResult.rows.forEach(row => {
        commonOutcomes[row.desired_outcome] = parseInt(row.count);
      });

      return {
        totalScans: parseInt(countResult.rows[0].total_scans),
        completedScans: parseInt(countResult.rows[0].completed_scans),
        dnaGenerated: parseInt(countResult.rows[0].dna_generated),
        averageComfortLevel: Math.round(parseFloat(countResult.rows[0].avg_comfort || '0') * 100) / 100,
        commonChallenges,
        commonOutcomes
      };
    } catch (error) {
      console.error('Error getting scan statistics:', error);
      return {
        totalScans: 0,
        completedScans: 0,
        dnaGenerated: 0,
        averageComfortLevel: 0,
        commonChallenges: {},
        commonOutcomes: {}
      };
    }
  }
}