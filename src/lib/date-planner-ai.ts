/**
 * Date Planner AI Service
 * Professional AI-powered date planning with Dutch cultural focus
 */

import { chatCompletion } from './ai-service';

export interface DatePlanRequest {
  // From Date Ideas integration
  dateIdeaId?: string;
  dateType: 'koffie' | 'drankje' | 'diner' | 'activiteit' | 'wandeldate' | 'thuisdate' | 'anders';
  location: string;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  vibe: string;
  activities: string[];

  // User input
  dateTime?: Date;
  energyLevel: 'laag' | 'gemiddeld' | 'hoog';
  desiredStyle: 'speels' | 'zelfverzekerd' | 'relaxed' | 'romantisch';
  budget: 'laag' | 'normaal' | 'luxe';
  dateInfo?: string; // What user knows about date
  insecurities?: string[]; // User's concerns
  userGoals?: string; // Personal objectives
  initiator?: 'ik' | 'zij/hij' | 'beiden';
}

export interface DatePlanResponse {
  id: string;
  userId: string;
  createdAt: Date;

  // Core content
  mindset: string;
  checklist: ChecklistItem[];
  timeline: TimelineItem[];
  outfit: OutfitAdvice;
  items: string[]; // What to bring
  openers: string[]; // 3 conversation starters
  topics: ConversationTopic[]; // 5 conversation themes
  warnings: string[]; // Do's and don'ts
  closers: string[]; // 3 closing options
  followUp: FollowUpAdvice;
  planB: ContingencyPlan;
  whatsapp: string; // Ready-to-send invitation

  // Metadata
  aiVersion: string;
  qualityScore: number;
  personalizationLevel: 'basic' | 'standard' | 'premium';
}

export interface ChecklistItem {
  category: 'praktisch' | 'kleding' | 'voorbereiding' | 'mental';
  item: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface TimelineItem {
  time: string; // "19:30"
  action: string;
  duration?: number; // minutes
  location?: string;
}

export interface OutfitAdvice {
  style: string;
  items: string[];
  reasoning: string;
  weatherConsiderations?: string;
}

export interface ConversationTopic {
  theme: string;
  questions: string[];
  why: string; // Why this topic works
}

export interface FollowUpAdvice {
  immediate: string[]; // Same day
  nextDay: string[]; // Day after
  timing: string; // When to follow up
}

export interface ContingencyPlan {
  weather: string; // Plan B for bad weather
  noShow: string; // What to do if date doesn't show
  emergency: string; // General backup plan
}

class DatePlannerAIService {
  private readonly AI_VERSION = '1.0';

  /**
   * Generate a personalized date plan using AI
   */
  async generateDatePlan(request: DatePlanRequest, userId: string): Promise<DatePlanResponse> {
    try {
      const prompt = this.buildPrompt(request);
      const messages = [
        {
          role: 'system' as const,
          content: this.getSystemPrompt()
        },
        {
          role: 'user' as const,
          content: prompt
        }
      ];

      const aiResponse = await chatCompletion(messages, {
        provider: 'openrouter',
        maxTokens: 2000,
        temperature: 0.7
      });

      const parsedPlan = this.parseAIResponse(aiResponse, request);

      return {
        id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        createdAt: new Date(),
        ...parsedPlan,
        aiVersion: this.AI_VERSION,
        qualityScore: this.calculateQualityScore(parsedPlan),
        personalizationLevel: this.determinePersonalizationLevel(request)
      };

    } catch (error) {
      console.error('Failed to generate date plan:', error);
      throw new Error('Kon geen date plan genereren. Probeer het opnieuw.');
    }
  }

  /**
   * Build the AI prompt from request data
   */
  private buildPrompt(request: DatePlanRequest): string {
    const dateTimeStr = request.dateTime
      ? request.dateTime.toLocaleString('nl-NL', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Datum nog niet bekend';

    return `
Date type: ${request.dateType}
Locatie: ${request.location}
Datum/tijd: ${dateTimeStr}
Duur: ${request.duration} minuten
Energie level: ${request.energyLevel}
Gewenste stijl: ${request.desiredStyle}
Budget: ${request.budget}
Initiatief: ${request.initiator || 'niet gespecificeerd'}
Info over date: ${request.dateInfo || 'Geen specifieke info'}
Onzekerheden: ${request.insecurities?.join(', ') || 'Geen specifieke onzekerheden'}
Doelen: ${request.userGoals || 'Leuke connectie maken'}
Vibe: ${request.vibe}
Activiteiten: ${request.activities?.join(', ') || 'Geen specifieke activiteiten'}

Maak een uitgebreid Date Plan met Nederlandse focus:
1. Korte, motiverende mindset intro (2-3 zinnen)
2. Uitgebreide checklist (minimaal 8 items, verdeeld over categorieën)
3. Uur-tot-uur tijdschema (${Math.ceil(request.duration / 60)} uur)
4. Locatie-specifieke reserveer-advies
5. Kledingadvies afgestemd op weer/type (inclusief 3-4 items)
6. Wat je meeneemt (3-5 praktische items)
7. 3 realistische openingszinnen
8. 5 gespreksthema's met vragen gebaseerd op interesses
9. Specifieke do's & don'ts voor dit type date (minimaal 6)
10. 3 afsluit-opties (zowel speels als warm)
11. Follow-up stappen voor de dag erna
12. Plan B voor slecht weer/no-show
13. Kant-en-klare WhatsApp uitnodiging

Wees persoonlijk, warm, concreet en slim. Gebruik Nederlandse cultuur elementen.
Focus op ${request.energyLevel} energie level en ${request.desiredStyle} communicatiestijl.
`.trim();
  }

  /**
   * Get the system prompt for Iris
   */
  private getSystemPrompt(): string {
    return `Je bent Iris, 's werelds beste Nederlandse datingcoach.
Je maakt helder, warm, concreet, persoonlijk en superpraktisch Date Plan.
Je ondersteunt, stelt gerust en geeft structuur. Geen clichés; alles is origineel,
uitvoerbaar en afgestemd op deze Nederlandse gebruiker.

BELANGRIJK:
- Gebruik natuurlijke, Nederlandse taal
- Focus op Nederlandse cultuur en gebruiken (gezelligheid, directheid, etc.)
- Wees praktisch en realistisch
- Vermijd cheesy of generieke adviezen
- Personaliseer alles op basis van de input
- Houd rekening met energie levels en communicatiestijlen
- Maak alles uitvoerbaar en tijdsgebonden

OUTPUT FORMAT: Geef een JSON object terug met deze exacte structuur:
{
  "mindset": "string",
  "checklist": [{"category": "praktisch|kleding|voorbereiding|mental", "item": "string", "priority": "high|medium|low"}],
  "timeline": [{"time": "HH:MM", "action": "string", "duration": number?, "location": "string"?}],
  "outfit": {"style": "string", "items": ["string"], "reasoning": "string", "weatherConsiderations": "string"?},
  "items": ["string"],
  "openers": ["string"],
  "topics": [{"theme": "string", "questions": ["string"], "why": "string"}],
  "warnings": ["string"],
  "closers": ["string"],
  "followUp": {"immediate": ["string"], "nextDay": ["string"], "timing": "string"},
  "planB": {"weather": "string", "noShow": "string", "emergency": "string"},
  "whatsapp": "string"
}`;
  }

  /**
   * Parse AI response into structured data
   */
  private parseAIResponse(aiResponse: string, request: DatePlanRequest): Omit<DatePlanResponse, 'id' | 'userId' | 'createdAt' | 'aiVersion' | 'qualityScore' | 'personalizationLevel'> {
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.mindset || !parsed.checklist || !parsed.timeline) {
        throw new Error('Missing required fields in AI response');
      }

      return parsed;

    } catch (error) {
      console.error('Failed to parse AI response:', error);
      // Return a fallback plan
      return this.generateFallbackPlan(request);
    }
  }

  /**
   * Generate a fallback plan if AI fails
   */
  private generateFallbackPlan(request: DatePlanRequest): Omit<DatePlanResponse, 'id' | 'userId' | 'createdAt' | 'aiVersion' | 'qualityScore' | 'personalizationLevel'> {
    const baseTime = request.dateTime || new Date();
    const startHour = baseTime.getHours();
    const startMinute = baseTime.getMinutes();

    return {
      mindset: "Blijf jezelf en geniet van het moment. Je hebt dit helemaal onder controle!",
      checklist: [
        { category: 'praktisch', item: 'Controleer reservering indien nodig', completed: false, priority: 'high' },
        { category: 'praktisch', item: 'Check route naar locatie', completed: false, priority: 'high' },
        { category: 'kleding', item: 'Kies outfit die bij je gevoel past', completed: false, priority: 'medium' },
        { category: 'voorbereiding', item: 'Bedenk 2-3 gespreksonderwerpen', completed: false, priority: 'medium' },
        { category: 'mental', item: 'Herinner jezelf aan je sterke punten', completed: false, priority: 'high' }
      ],
      timeline: [
        { time: `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`, action: 'Aankomst bij locatie', location: request.location },
        { time: `${(startHour + 1).toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`, action: 'Start van de date', duration: request.duration - 60 }
      ],
      outfit: {
        style: 'Comfortabel en zelfverzekerd',
        items: ['Favoriete outfit', 'Comfortabele schoenen', 'Eventueel een jas'],
        reasoning: 'Kies iets waarin je je zelfverzekerd voelt'
      },
      items: ['Telefoon', 'Portemonnee', 'Sleutels'],
      openers: [
        'Hé! Leuk je te ontmoeten.',
        'Wat een gave locatie heb je uitgekozen!',
        'Ik ben benieuwd naar je verhaal.'
      ],
      topics: [
        {
          theme: 'Dagelijkse leven',
          questions: ['Wat doe je in je vrije tijd?', 'Wat is je favoriete weekend activiteit?'],
          why: 'Geeft inzicht in elkaars routine en interesses'
        }
      ],
      warnings: [
        'Wees op tijd',
        'Luister actief',
        'Blijf jezelf',
        'Stel vragen',
        'Geniet van het moment'
      ],
      closers: [
        'Het was super leuk! Zullen we dit nog eens doen?',
        'Bedankt voor de leuke avond, ik heb genoten.',
        'Leuk je ontmoet te hebben!'
      ],
      followUp: {
        immediate: ['Stuur een bedankje als je thuis bent'],
        nextDay: ['Stuur een appje om te laten weten dat je het leuk vond'],
        timing: 'Binnen 24 uur na de date'
      },
      planB: {
        weather: 'Binnen optie zoeken of date verplaatsen',
        noShow: 'Wacht 15 minuten, stuur een berichtje, ga dan naar huis',
        emergency: 'Neem contact op met een vriend als je je niet goed voelt'
      },
      whatsapp: `Hé! Zullen we ${request.dateType} doen bij ${request.location}? Ik heb gereserveerd voor ${baseTime.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}. Tot dan! 😊`
    };
  }

  /**
   * Calculate quality score for the generated plan
   */
  private calculateQualityScore(plan: any): number {
    let score = 50; // Base score

    // Checklist completeness
    if (plan.checklist && plan.checklist.length >= 8) score += 10;
    else if (plan.checklist && plan.checklist.length >= 5) score += 5;

    // Timeline detail
    if (plan.timeline && plan.timeline.length >= 3) score += 10;
    else if (plan.timeline && plan.timeline.length >= 2) score += 5;

    // Conversation content
    if (plan.openers && plan.openers.length >= 3) score += 5;
    if (plan.topics && plan.topics.length >= 3) score += 5;

    // Practical advice
    if (plan.outfit && plan.outfit.items && plan.outfit.items.length >= 3) score += 5;
    if (plan.warnings && plan.warnings.length >= 5) score += 5;

    // Dutch elements (basic check)
    const dutchWords = ['gezellig', 'lekker', 'leuk', 'super', 'geweldig'];
    const content = JSON.stringify(plan).toLowerCase();
    const dutchCount = dutchWords.filter(word => content.includes(word)).length;
    score += Math.min(10, dutchCount * 2);

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Determine personalization level
   */
  private determinePersonalizationLevel(request: DatePlanRequest): 'basic' | 'standard' | 'premium' {
    let score = 0;

    if (request.dateInfo) score += 1;
    if (request.insecurities && request.insecurities.length > 0) score += 1;
    if (request.userGoals) score += 1;
    if (request.initiator) score += 1;
    if (request.dateTime) score += 1;

    if (score >= 4) return 'premium';
    if (score >= 2) return 'standard';
    return 'basic';
  }
}

// Singleton instance
export const datePlannerAI = new DatePlannerAIService();