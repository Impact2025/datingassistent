/**
 * UNIFIED AI SERVICE LAYER
 * Professional consolidation of all AI functionality
 * Created: 2025-11-21
 * Author: AI Architecture Specialist
 */

import { chatCompletion } from './ai-service';
import { getOpenRouterClient, OPENROUTER_MODELS } from './openrouter';
import { getAgeRange, createAnonymizedContext } from './ai-privacy';
import type { UserProfile } from './types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ChatRequest {
  message: string;
  history: Array<{ role: string; content: string; timestamp?: string }>;
  userId: string;
  userProfile?: UserProfile;
  context?: string;
}

export interface ChatResponse {
  message: string;
  coachingPhase: string;
  suggestedActions: string[];
  psychologicalInsights: string[];
  culturalTips: string[];
  confidence: number;
}

export interface PhotoAnalysisRequest {
  imageBuffer: Buffer;
  mimeType: string;
  context: 'profile_photo' | 'date_photo';
  userId: string;
}

export interface PhotoAnalysisResult {
  overall_score: number;
  analysis: {
    lighting: { score: number; feedback: string };
    composition: { score: number; feedback: string };
    authenticity: { score: number; feedback: string };
    facial_expression: { score: number; feedback: string };
  };
  tips: string[];
  suggestions: {
    alternative_angles: string[];
    background: string[];
    overall: string;
  };
}

export interface ProfileGenerationRequest {
  personalityAnswers: Array<{ questionId: string; answerId: string; label: string }>;
  authenticityData: {
    writingSamples?: string;
    petPeeve?: string;
    vividMemory?: string;
    ambition?: string;
    habit?: string;
  };
  userProfile: UserProfile;
  userId: string;
}

export interface ProfileOption {
  id: string;
  title: string;
  content: string;
  score: number;
  strengths: string[];
  improvements: string[];
}

export interface PlatformMatchRequest {
  userPreferences: {
    relationshipGoal: string;
    agePreference: string;
    genderPreference: string;
    locationPreference: string;
    educationImportance: string;
    backgroundImportance: string;
    interestsImportance: string;
    appExpectations: string[];
    meetingSpeed: string;
    budget: string;
    privacyImportance: string;
    pastExperience: string;
    timeInvestment: string;
    aiHelp: string[];
    communicationStyle: string[];
  };
  userProfile: UserProfile;
  availablePlatforms: string[];
  userId: string;
}

export interface PlatformRecommendation {
  platform: string;
  matchScore: number;
  reasoning: string;
  targetAudience: string;
  algorithm: string;
  niche: string;
  pros: string[];
  cons: string[];
  strategy: string;
  pricing: string;
  safety: string;
}

// ============================================================================
// UNIFIED AI SERVICE CLASS
// ============================================================================

export class UnifiedAIService {
  private static instance: UnifiedAIService;
  private openRouter = getOpenRouterClient();

  // ============================================================================
  // SINGLETON PATTERN
  // ============================================================================

  public static getInstance(): UnifiedAIService {
    if (!UnifiedAIService.instance) {
      UnifiedAIService.instance = new UnifiedAIService();
    }
    return UnifiedAIService.instance;
  }

  // ============================================================================
  // CHAT COACH SERVICE
  // ============================================================================

  async generateChatResponse(request: ChatRequest): Promise<ChatResponse> {
    try {
      // Create system prompt with user profile information
      let systemPrompt = `You are DatingAssistent, the Netherlands' most trusted AI dating coach. You are a warm, empathetic, and highly knowledgeable dating expert who has helped thousands of singles find love. Your responses are always in Dutch and combine psychological insights with practical dating strategies.

## YOUR EXPERTISE:
- Modern Dutch dating culture and apps (Tinder, Bumble, Happn, etc.)
- Psychology of attraction and relationships
- Communication strategies for different personality types
- Safety and red flags in online dating
- Building confidence and self-improvement
- Cultural nuances in Dutch dating

## RESPONSE STYLE:
- **Conversational & Friendly**: Like talking to a wise friend who really gets dating
- **Actionable**: Every response includes 2-3 concrete steps users can take immediately
- **Evidence-Based**: Reference psychological principles or dating research when relevant
- **Culturally Aware**: Understand Dutch dating norms and expectations
- **Encouraging**: Focus on growth and possibilities, not problems

## FORMATTING RULES:
- Use proper paragraph breaks (double line breaks) to separate ideas
- Use numbered lists for step-by-step advice (1. First step\\n2. Second step)
- Use bullet points (- or *) for non-sequential tips
- Use **bold** for emphasis on key points
- Keep paragraphs short (2-4 sentences max) for readability
- Structure longer responses with clear sections

Example response format:
Hallo! Leuk dat je dat vraagt. [introductie]

**Hier zijn enkele tips:**

1. Eerste tip met uitleg
2. Tweede tip met uitleg

Let op: [belangrijke opmerking]

Succes ermee!`;

      // Add anonymized user profile information to the system prompt if available
      // Privacy: No name, no exact age, no specific location
      if (request.userProfile) {
        systemPrompt += '\n\n' + createAnonymizedContext({
          age: request.userProfile.age,
          gender: request.userProfile.gender,
          seekingGender: request.userProfile.seekingGender
          // Note: name and location are intentionally excluded for privacy
        });
      }

      // Convert history to the format expected by our AI service
      const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
        { role: 'system', content: systemPrompt }
      ];

      // Map history messages
      request.history.forEach((msg) => {
        messages.push({
          role: msg.role === 'model' ? 'assistant' : 'user',
          content: msg.content
        });
      });

      // Add the new user message
      messages.push({ role: 'user', content: request.message });

      // Get AI response
      const aiResponse = await chatCompletion(messages, {
        maxTokens: 1000,
        temperature: 0.7
      });

      return {
        message: aiResponse,
        coachingPhase: 'assessment',
        suggestedActions: ['Blijf doorgaan met oefenen', 'Stel vragen als je hulp nodig hebt'],
        psychologicalInsights: ['Consistentie is belangrijk in dating'],
        culturalTips: ['In Nederland wordt authenticiteit gewaardeerd'],
        confidence: 0.8
      };
    } catch (error) {
      console.error('Chat response error:', error);
      throw error;
    }
  }

  // ============================================================================
  // PHOTO ANALYSIS SERVICE
  // ============================================================================

  async analyzePhoto(request: PhotoAnalysisRequest): Promise<PhotoAnalysisResult> {
    try {
      const base64 = request.imageBuffer.toString('base64');

      const prompt = `Je bent een STRIKTE dating foto expert. Analyseer deze ${request.context === 'profile_photo' ? 'EERSTE PROFIELFOTO' : 'date foto'} voor dating apps met hoge STANDARDS.

BELANGRIJK: Wees HONEST en STRIKT - alleen PERFECTE foto's krijgen hoge scores. De meeste foto's voldoen NIET aan professionele dating criteria.

Geef ALLEEN een JSON object terug.

JSON Structuur:
{
  "overall_score": 6.5,
  "analysis": {
    "lighting": { "score": 7, "feedback": "Acceptabele natuurlijke belichting, maar gezicht zou helderder kunnen zijn" },
    "composition": { "score": 6, "feedback": "Close-up compositie maar gezicht vult slechts 50% van frame - te ver weg" },
    "authenticity": { "score": 8, "feedback": "Natuurlijke uitstraling maar enigszins stijf - meer ontspanning nodig" },
    "facial_expression": { "score": 5, "feedback": "Glimlach aanwezig maar tanden niet zichtbaar, oogcontact matig" }
  },
  "tips": ["❌ NIET perfect voor eerste profielfoto - verbeterpunten nodig", "💡 Neem een dichtere close-up (hoofd/schouders)"],
  "suggestions": {
    "alternative_angles": ["Close-up portret: alleen hoofd, nek en schouders zichtbaar"],
    "background": ["Volledig neutrale achtergrond - geen afleiding"],
    "overall": "Deze foto heeft potentieel maar voldoet nog niet aan criteria voor perfecte eerste profielfoto."
  }
}`;

      const response = await chatCompletion([
        { role: 'user', content: prompt }
      ], {
        maxTokens: 1500,
        temperature: 0.8
      });

      // Parse JSON response
      const cleanedResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      try {
        return JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('Failed to parse photo analysis:', parseError);
        // Fallback analysis
        return {
          overall_score: 7.0,
          analysis: {
            lighting: { score: 7.0, feedback: 'Kon de foto niet volledig analyseren' },
            composition: { score: 7.0, feedback: 'Analyse mislukt' },
            authenticity: { score: 7.0, feedback: 'Analyse mislukt' },
            facial_expression: { score: 7.0, feedback: 'Analyse mislukt' }
          },
          tips: ['⚠️ Er ging iets mis bij de analyse', '🔄 Probeer het opnieuw'],
          suggestions: {
            alternative_angles: ['Probeer een andere hoek'],
            background: ['Kies een neutrale achtergrond'],
            overall: 'Probeer het opnieuw met een duidelijkere foto'
          }
        };
      }
    } catch (error) {
      console.error('Photo analysis error:', error);
      throw error;
    }
  }

  // ============================================================================
  // PROFILE GENERATION SERVICE
  // ============================================================================

  async generateProfiles(request: ProfileGenerationRequest): Promise<ProfileOption[]> {
    try {
      // Extract different types of answers
      const personalityAnswers = request.personalityAnswers.filter(a =>
        ['personality', 'social_energy', 'relationship', 'confidence_level', 'style', 'romantic_style', 'content', 'tone'].includes(a.questionId)
      );

      // Create comprehensive profile data
      const profileData = {
        personality: personalityAnswers.map(a => a.label).join(', '),
        writingSamples: request.authenticityData.writingSamples || '',
        petPeeve: request.authenticityData.petPeeve || '',
        vividMemory: request.authenticityData.vividMemory || '',
        ambition: request.authenticityData.ambition || '',
        habit: request.authenticityData.habit || '',
      };

      // Generate 3 profile variations
      const profiles: ProfileOption[] = [];
      const variations = ['luchtig', 'serieus', 'mysterieus'];

      for (let i = 0; i < 3; i++) {
        const variation = variations[i];

        // Create enhanced keywords
        const enhancedKeywords = [
          profileData.personality,
          profileData.writingSamples && `Schrijfstijl: ${profileData.writingSamples.substring(0, 100)}`,
          profileData.petPeeve && `Ergernis: ${profileData.petPeeve}`,
          profileData.vividMemory && `Herinnering: ${profileData.vividMemory.substring(0, 100)}`,
          profileData.ambition && `Ambitie: ${profileData.ambition}`,
          profileData.habit && `Gewoonte: ${profileData.habit}`,
        ].filter(Boolean).join('. ');

        // Privacy: No name, use age range, no specific location
        const profileAgeRange = request.userProfile?.age ? getAgeRange(request.userProfile.age) : '25-29';

        const prompt = `Schrijf een dating profiel.

Gebruik deze informatie:
- Leeftijdsgroep: ${profileAgeRange}
- Geslacht: ${request.userProfile?.gender || 'niet gespecificeerd'}
- Land: Nederland
- Persoonlijkheid: ${enhancedKeywords}

Stijl: ${variation} en aantrekkelijk
Lengte: 200-300 woorden
Taal: Nederlands
Doel: Aantrekkelijk en authentiek profiel

Maak het persoonlijk en uniek. Focus op positieve eigenschappen en gedeelde interesses.`;

        const content = await chatCompletion(
          [{ role: 'user', content: prompt }],
          { maxTokens: 800, temperature: 0.7 }
        );

        // Calculate quality score (simplified)
        const qualityMetrics = this.calculateProfileQuality(content);

        profiles.push({
          id: `profile-${i + 1}`,
          title: i === 0 ? 'Lichtvoetig & Aantrekkelijk' :
                i === 1 ? 'Serieus & Betrouwbaar' :
                'Mysterieus & Intrigerend',
          content,
          score: qualityMetrics.overallScore,
          strengths: qualityMetrics.strengths,
          improvements: qualityMetrics.improvements
        });
      }

      return profiles.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('Profile generation error:', error);
      throw error;
    }
  }

  // ============================================================================
  // PLATFORM MATCHING SERVICE
  // ============================================================================

  async matchPlatforms(request: PlatformMatchRequest): Promise<PlatformRecommendation[]> {
    try {
      // Privacy: Use age ranges instead of exact age, no location
      const ageRange = request.userProfile?.age ? getAgeRange(request.userProfile.age) : 'niet opgegeven';

      const systemPrompt = `Je bent een ervaren dating coach en expert op het gebied van Nederlandse dating apps en websites. Je kent alle platforms goed en weet precies welke doelgroepen ze bedienen.

Gebruikersprofiel (geanonimiseerd):
- Leeftijdsgroep: ${ageRange}
- Geslacht: ${request.userProfile?.gender || 'niet opgegeven'}
- Zoekt: ${request.userPreferences.genderPreference || 'niet opgegeven'}
- Relatietype: ${request.userPreferences.relationshipGoal || 'niet opgegeven'}
- Land: Nederland

Voorkeuren:
- Platform type: ${request.userPreferences.appExpectations?.join(', ') || 'geen voorkeur'}
- Budget: ${request.userPreferences.budget || 'geen voorkeur'}
- Tijdsinvestering: ${request.userPreferences.timeInvestment || 'geen voorkeur'}
- Privacy belang: ${request.userPreferences.privacyImportance || 'gemiddeld'}

Beschikbare platforms: ${request.availablePlatforms.join(', ')}

Geef ALLEEN een JSON array terug met 3-4 platform aanbevelingen. Elke aanbeveling moet deze structuur hebben:
{
  "platform": "Platform naam",
  "matchScore": 8,
  "reasoning": "Waarom dit platform past (3-4 zinnen)",
  "targetAudience": "Doelgroep beschrijving",
  "algorithm": "Swipen/diepgaand matching/etc.",
  "niche": "Algemeen/25+/hoger opgeleid/etc.",
  "pros": ["3 voordelen"],
  "cons": ["2 nadelen"],
  "strategy": "Gebruik strategie (2-3 stappen)",
  "pricing": "Gratis/Premium vanaf €x/maand",
  "safety": "Basis verificatie/Advanced safety"
}`;

      const aiResponse = await chatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Geef platform aanbevelingen voor dit profiel.' }
      ], {
        maxTokens: 1200,
        temperature: 0.7
      });

      // Parse JSON response
      const cleanedResponse = aiResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      try {
        const recommendations = JSON.parse(cleanedResponse);
        return Array.isArray(recommendations)
          ? recommendations.sort((a: PlatformRecommendation, b: PlatformRecommendation) => b.matchScore - a.matchScore)
          : [];
      } catch (parseError) {
        console.error('Failed to parse platform recommendations:', parseError);
        return [{
          platform: 'Diverse platforms',
          matchScore: 7,
          reasoning: 'Op basis van je voorkeuren raden we aan verschillende platforms te proberen.',
          targetAudience: 'Algemeen publiek',
          algorithm: 'Swipen',
          niche: 'Algemeen',
          pros: ['Gebruiksvriendelijk', 'Groot gebruikersbestand'],
          cons: ['Algoritme niet altijd accuraat'],
          strategy: 'Begin met 2-3 platforms tegelijkertijd.',
          pricing: 'Gratis met premium opties',
          safety: 'Basis verificatie'
        }];
      }
    } catch (error) {
      console.error('Platform matching error:', error);
      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private calculateProfileQuality(content: string): {
    overallScore: number;
    strengths: string[];
    improvements: string[];
  } {
    let score = 75; // Base score
    const strengths: string[] = [];
    const improvements: string[] = [];

    // Length check (200-300 words ideal)
    const wordCount = content.split(' ').length;
    if (wordCount >= 200 && wordCount <= 300) {
      score += 10;
      strengths.push('Optimale lengte');
    } else if (wordCount < 150) {
      score -= 15;
      improvements.push('Kan langer voor meer diepgang');
    }

    // Authenticity indicators
    if (content.includes('ik') || content.includes('mijn') || content.includes('hou van')) {
      score += 5;
      strengths.push('Persoonlijk en authentiek');
    }

    // Humor/interests
    if (content.includes('😊') || content.includes('lachen') || content.includes('hobby')) {
      score += 5;
      strengths.push('Toont persoonlijkheid');
    }

    // Structure check
    if (content.includes('\n') || content.split('. ').length > 3) {
      score += 5;
      strengths.push('Goede structuur');
    }

    return {
      overallScore: Math.max(0, Math.min(100, score)),
      strengths: strengths.length > 0 ? strengths : ['Goede basis'],
      improvements: improvements.length > 0 ? improvements : ['Kleine verbeteringen mogelijk']
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const unifiedAIService = UnifiedAIService.getInstance();