import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai-service';
import { verifyAuth } from '@/lib/auth';
import { getClientIdentifier, rateLimitExpensiveAI, createRateLimitHeaders } from '@/lib/rate-limit';
import { sql } from '@/lib/db';
import { getAgeRange } from '@/lib/ai-privacy';

interface ProfileData {
  bio: string;
  interests: string;
  age: string;
  location: string;
  occupation: string;
  education: string;
  photos: string[];
  prompts: { question: string; answer: string }[];
  app?: string;
}

interface ProfileAnalysis {
  overallScore: number;
  sections: {
    bio: SectionAnalysis;
    photos: SectionAnalysis;
    interests: SectionAnalysis;
    prompts: SectionAnalysis;
    demographics: SectionAnalysis;
  };
  bioRewrite: {
    original: string;
    rewritten: string;
    explanation: string;
  };
  openingLines: string[];
  appSpecificTips: string[];
  optimizationSuggestions: OptimizationSuggestion[];
  competitorAnalysis: CompetitorAnalysis;
  predictedPerformance: PredictedPerformance;
}

interface SectionAnalysis {
  score: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

interface OptimizationSuggestion {
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  expectedImpact: number;
  effort: 'low' | 'medium' | 'high';
  actionableSteps: string[];
}

interface CompetitorAnalysis {
  percentileRank: number;
  topPerformingElements: string[];
  commonWeaknesses: string[];
  marketPosition: string;
}

interface PredictedPerformance {
  currentMatches: number;
  optimizedMatches: number;
  improvement: number;
  confidence: number;
  timeToResults: string;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request);
    const rateLimit = await rateLimitExpensiveAI(identifier);

    if (!rateLimit.success) {
      const headers = createRateLimitHeaders(rateLimit);
      const resetDate = new Date(rateLimit.resetAt);
      return NextResponse.json(
        {
          error: 'rate_limit_exceeded',
          message: `Te veel verzoeken. Probeer opnieuw na ${resetDate.toLocaleTimeString('nl-NL')}.`,
          resetAt: resetDate.toISOString(),
        },
        { status: 429, headers }
      );
    }

    const user = await verifyAuth(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { profileData }: { profileData: ProfileData } = await request.json();

    if (!profileData) {
      return NextResponse.json(
        { error: 'Profile data is required' },
        { status: 400 }
      );
    }

    // Analyze profile using AI
    const analysis = await analyzeProfile(profileData);

    // Save analysis results to database for persistence
    try {
      await sql`
        INSERT INTO profile_analyses (
          user_id,
          profile_data,
          overall_score,
          category_scores,
          optimization_suggestions,
          competitor_analysis,
          predicted_performance
        ) VALUES (
          ${user.id},
          ${JSON.stringify(profileData)},
          ${analysis.overallScore},
          ${JSON.stringify(analysis.sections)},
          ${JSON.stringify(analysis.optimizationSuggestions)},
          ${JSON.stringify(analysis.competitorAnalysis)},
          ${JSON.stringify(analysis.predictedPerformance)}
        )
      `;

      // Check for milestone achievements
      await checkAndCreateMilestones(user.id, analysis.overallScore);

    } catch (dbError) {
      console.error('Failed to save profile analysis:', dbError);
      // Don't fail the request if database save fails - analysis still works
    }

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Profile optimization error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze profile' },
      { status: 500 }
    );
  }
}

async function analyzeProfile(profileData: ProfileData): Promise<ProfileAnalysis> {
  const app = profileData.app || 'tinder';
  const appNames: Record<string, string> = {
    tinder: 'Tinder',
    hinge: 'Hinge',
    bumble: 'Bumble',
    lexa: 'Lexa',
    relatieplanet: 'Relatieplanet',
    other: 'dating app'
  };
  const appName = appNames[app] || 'Tinder';

  const hingePromptsText = profileData.prompts?.length
    ? profileData.prompts.map(p => `  Prompt: "${p.question}"\n  Antwoord: "${p.answer}"`).join('\n\n')
    : 'Geen prompts opgegeven';

  const prompt = `Je bent een expert dating coach en copywriter gespecialiseerd in Nederlandse dating apps. Analyseer dit ${appName} profiel en geef concrete, eerlijke, bruikbare feedback in het Nederlands.

PROFIEL:
- App: ${appName}
- Leeftijdsgroep: ${profileData.age ? getAgeRange(parseInt(profileData.age)) : 'onbekend'}
- Interesses: ${profileData.interests || 'niet opgegeven'}
- Bio: "${profileData.bio}"
${app === 'hinge' ? `- Hinge Prompts:\n${hingePromptsText}` : ''}

OPDRACHT: Geef een diepgaande analyse en schrijf een verbeterde bio. Wees eerlijk en specifiek — geen vage algemeenheden.

Retourneer ALLEEN geldig JSON (geen markdown, geen uitleg buiten de JSON):
{
  "overallScore": number (0-100, wees realistisch: gemiddeld profiel = 45-60),
  "bioRewrite": {
    "original": "de originele bio exact zoals opgegeven",
    "rewritten": "jouw verbeterde versie van de bio — specifiek, persoonlijk, met een hook en call-to-action. Herschrijf echt, kopieer niet",
    "explanation": "in 1-2 zinnen: wat je veranderd hebt en waarom"
  },
  "openingLines": [
    "3 concrete openingszinnen die goed aansluiten bij DIT specifieke profiel en persoonlijkheid. Geen generieke vragen, maar iets wat aansluit op wat in de bio staat."
  ],
  "appSpecificTips": [
    "4-5 concrete tips specifiek voor ${appName}: hoe het algoritme werkt, wat het platform beloont, wanneer swipe/like, foto-volgorde etc."
  ],
  "sections": {
    "bio": {
      "score": number,
      "grade": "A+ | A | B+ | B | C+ | C | D | F",
      "strengths": ["wat werkt goed en waarom — wees specifiek"],
      "weaknesses": ["wat werkt niet en waarom — wees direct"],
      "recommendations": ["concrete actie om dit te verbeteren"]
    },
    "photos": {
      "score": number (geef 65 als basis als er geen foto info is, leg uit dat we foto's niet kunnen zien),
      "grade": "B",
      "strengths": ["algemene foto tips die altijd werken"],
      "weaknesses": ["meest voorkomende fout bij foto's op ${appName}"],
      "recommendations": ["concrete foto-advies voor ${appName}"]
    },
    "interests": {
      "score": number,
      "grade": "...",
      "strengths": ["..."],
      "weaknesses": ["..."],
      "recommendations": ["..."]
    },
    "prompts": {
      "score": number (als geen prompts: 50 met uitleg dat ze missen),
      "grade": "...",
      "strengths": ["..."],
      "weaknesses": ["..."],
      "recommendations": ["..."]
    },
    "demographics": {
      "score": number,
      "grade": "...",
      "strengths": ["..."],
      "weaknesses": ["..."],
      "recommendations": ["..."]
    }
  },
  "optimizationSuggestions": [
    {
      "priority": "high",
      "category": "Bio",
      "title": "concrete actietitel",
      "description": "uitleg wat en waarom",
      "expectedImpact": number (realistisch: 10-40),
      "effort": "low | medium | high",
      "actionableSteps": ["stap 1", "stap 2", "stap 3"]
    }
  ],
  "competitorAnalysis": {
    "percentileRank": number (1-100),
    "topPerformingElements": ["wat goed werkt in dit profiel"],
    "commonWeaknesses": ["wat ontbreekt vergeleken met top profielen"],
    "marketPosition": "eerlijke omschrijving van hoe dit profiel scoort"
  },
  "predictedPerformance": {
    "currentMatches": number (realistisch geschat per week op basis van profiel kwaliteit),
    "optimizedMatches": number (na alle verbeteringen),
    "improvement": number (percentage verbetering),
    "confidence": number (0-100),
    "timeToResults": "1-2 weken"
  }
}

Wees eerlijk en direct. Een slechte bio is een slechte bio — zeg het. De gebruiker heeft meer aan harde waarheid dan aan valse geruststelling.`;

  try {
    const response = await chatCompletion(
      [
        {
          role: 'system',
          content: 'Je bent een expert dating coach en bio copywriter voor Nederlandse dating apps. Je geeft eerlijke, directe feedback en schrijft echt betere bio\'s. Retourneer ALTIJD geldig JSON zonder markdown code blocks.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      {
        provider: 'openrouter',
        maxTokens: 3500,
        temperature: 0.7
      }
    );

    const content = response;

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Validate and provide defaults if needed
    return {
      overallScore: Math.max(0, Math.min(100, analysis.overallScore || 70)),
      bioRewrite: {
        original: analysis.bioRewrite?.original || profileData.bio,
        rewritten: analysis.bioRewrite?.rewritten || profileData.bio,
        explanation: analysis.bioRewrite?.explanation || 'Bio geanalyseerd.'
      },
      openingLines: Array.isArray(analysis.openingLines) ? analysis.openingLines : [],
      appSpecificTips: Array.isArray(analysis.appSpecificTips) ? analysis.appSpecificTips : [],
      sections: {
        bio: validateSection(analysis.sections?.bio),
        photos: validateSection(analysis.sections?.photos),
        interests: validateSection(analysis.sections?.interests),
        prompts: validateSection(analysis.sections?.prompts),
        demographics: validateSection(analysis.sections?.demographics)
      },
      optimizationSuggestions: analysis.optimizationSuggestions || [],
      competitorAnalysis: {
        percentileRank: Math.max(1, Math.min(100, analysis.competitorAnalysis?.percentileRank || 50)),
        topPerformingElements: analysis.competitorAnalysis?.topPerformingElements || ['Goede bio', 'Duidelijke foto\'s'],
        commonWeaknesses: analysis.competitorAnalysis?.commonWeaknesses || ['Te korte bio', 'Geen specifieke interesses'],
        marketPosition: analysis.competitorAnalysis?.marketPosition || 'Gemiddeld'
      },
      predictedPerformance: {
        currentMatches: Math.max(0, analysis.predictedPerformance?.currentMatches || 5),
        optimizedMatches: Math.max(0, analysis.predictedPerformance?.optimizedMatches || 8),
        improvement: Math.max(0, analysis.predictedPerformance?.improvement || 60),
        confidence: Math.max(0, Math.min(100, analysis.predictedPerformance?.confidence || 75)),
        timeToResults: analysis.predictedPerformance?.timeToResults || '1-2 weken'
      }
    };

  } catch (error) {
    console.error('AI analysis error:', error);

    // Return fallback analysis
    return {
      overallScore: 55,
      bioRewrite: {
        original: profileData.bio,
        rewritten: profileData.bio,
        explanation: 'Analyse tijdelijk niet beschikbaar — probeer het opnieuw.'
      },
      openingLines: [],
      appSpecificTips: [
        'Zorg voor minimaal 4 foto\'s op je profiel',
        'Wees actief in de avonduren voor meer zichtbaarheid',
        'Reageer snel op matches om je ranking te verbeteren'
      ],
      sections: {
        bio: {
          score: 55,
          grade: 'C+' as const,
          strengths: ['Bio aanwezig'],
          weaknesses: ['Kon niet volledig worden geanalyseerd'],
          recommendations: ['Probeer de analyse opnieuw']
        },
        photos: {
          score: 65,
          grade: 'B' as const,
          strengths: ['Foto\'s zijn het belangrijkst op dating apps'],
          weaknesses: ['We kunnen je foto\'s niet zien'],
          recommendations: ['Gebruik duidelijke, goed belichte foto\'s met een glimlach']
        },
        interests: {
          score: 55,
          grade: 'C+' as const,
          strengths: ['Interesses aanwezig'],
          weaknesses: ['Te algemeen'],
          recommendations: ['Wees specifieker over je hobby\'s']
        },
        prompts: {
          score: 50,
          grade: 'C' as const,
          strengths: [],
          weaknesses: ['Geen prompts opgegeven'],
          recommendations: ['Voeg Hinge prompts toe voor meer gespreksstarters']
        },
        demographics: {
          score: 70,
          grade: 'B' as const,
          strengths: ['Basisinformatie aanwezig'],
          weaknesses: [],
          recommendations: ['Voeg beroep en locatie toe']
        }
      },
      optimizationSuggestions: [
        {
          priority: 'high' as const,
          category: 'Bio',
          title: 'Maak je bio persoonlijker',
          description: 'Een specifieke, persoonlijke bio trekt 3x meer matches',
          expectedImpact: 30,
          effort: 'low' as const,
          actionableSteps: [
            'Noem één concreet verhaal of feit over jezelf',
            'Voeg een lichte grap of zelfreflectie toe',
            'Eindig met een vraag of call-to-action'
          ]
        }
      ],
      competitorAnalysis: {
        percentileRank: 50,
        topPerformingElements: ['Persoonlijke bio'],
        commonWeaknesses: ['Te generiek profiel'],
        marketPosition: 'Gemiddeld'
      },
      predictedPerformance: {
        currentMatches: 3,
        optimizedMatches: 6,
        improvement: 100,
        confidence: 50,
        timeToResults: '1-2 weken'
      }
    };
  }
}

function validateSection(section: any): SectionAnalysis {
  return {
    score: Math.max(0, Math.min(100, section?.score || 70)),
    grade: (section?.grade || 'B') as SectionAnalysis['grade'],
    strengths: section?.strengths || ['Goede basis'],
    weaknesses: section?.weaknesses || ['Ruimte voor verbetering'],
    recommendations: section?.recommendations || ['Optimaliseer verder']
  };
}

async function checkAndCreateMilestones(userId: number, overallScore: number) {
  try {
    // Check if this is the user's first analysis
    const existingAnalyses = await sql`
      SELECT COUNT(*) as count FROM profile_analyses WHERE user_id = ${userId}
    `;

    const isFirstAnalysis = existingAnalyses[0].count === 1; // 1 because we just inserted one

    if (isFirstAnalysis) {
      await sql`
        INSERT INTO profile_milestones (user_id, milestone_type, milestone_name, milestone_description, achieved, achieved_date)
        VALUES (${userId}, 'first_analysis', 'Eerste Analyse', 'Je eerste profiel analyse voltooid!', true, NOW())
      `;
    }

    // Check for score milestones
    if (overallScore >= 80) {
      const existingMilestone = await sql`
        SELECT id FROM profile_milestones
        WHERE user_id = ${userId} AND milestone_type = 'score_80' AND achieved = true
      `;

      if (existingMilestone.length === 0) {
        await sql`
          INSERT INTO profile_milestones (user_id, milestone_type, milestone_name, milestone_description, achieved, achieved_date, analysis_score)
          VALUES (${userId}, 'score_80', 'Top Profiel', 'Je profiel scoort 80+ punten!', true, NOW(), ${overallScore})
        `;
      }
    }

  } catch (error) {
    console.error('Failed to create milestones:', error);
    // Don't fail the main request if milestone creation fails
  }
}