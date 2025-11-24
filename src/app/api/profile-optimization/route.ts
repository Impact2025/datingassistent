import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai-service';
import { verifyToken } from '@/lib/auth';
import { getClientIdentifier, rateLimitExpensiveAI, createRateLimitHeaders } from '@/lib/rate-limit';
import { sql } from '@/lib/db';

interface ProfileData {
  bio: string;
  interests: string;
  age: string;
  location: string;
  occupation: string;
  education: string;
  photos: string[];
  prompts: { question: string; answer: string }[];
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

    // Get user from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
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
  const profileText = `
Profiel gegevens:
- Leeftijd: ${profileData.age}
- Locatie: ${profileData.location}
- Beroep: ${profileData.occupation}
- Opleiding: ${profileData.education}
- Bio: ${profileData.bio}
- Interesses: ${profileData.interests}
- Aantal foto's: ${profileData.photos.length}
- Aantal prompts: ${profileData.prompts.length}
  `;

  const prompt = `
Analyseer dit dating profiel en geef een gedetailleerde optimalisatie analyse in het Nederlands. Focus op Nederlandse dating cultuur en Tinder/Bumble optimalisatie.

Profiel:
${profileText}

Geef een JSON object terug met:
{
  "overallScore": number (0-100),
  "sections": {
    "bio": {"score": number, "grade": "A+ | A | B+ | B | C+ | C | D | F", "strengths": ["sterkte1"], "weaknesses": ["zwakte1"], "recommendations": ["advies1"]},
    "photos": {"score": number, "grade": "...", "strengths": [...], "weaknesses": [...], "recommendations": [...]},
    "interests": {"score": number, "grade": "...", "strengths": [...], "weaknesses": [...], "recommendations": [...]},
    "prompts": {"score": number, "grade": "...", "strengths": [...], "weaknesses": [...], "recommendations": [...]},
    "demographics": {"score": number, "grade": "...", "strengths": [...], "weaknesses": [...], "recommendations": [...]}
  },
  "optimizationSuggestions": [
    {
      "priority": "high | medium | low",
      "category": "string",
      "title": "string",
      "description": "string",
      "expectedImpact": number (percentage),
      "effort": "low | medium | high",
      "actionableSteps": ["stap1", "stap2"]
    }
  ],
  "competitorAnalysis": {
    "percentileRank": number (1-100),
    "topPerformingElements": ["element1"],
    "commonWeaknesses": ["zwakte1"],
    "marketPosition": "string"
  },
  "predictedPerformance": {
    "currentMatches": number,
    "optimizedMatches": number,
    "improvement": number,
    "confidence": number (0-100),
    "timeToResults": "string (bijv. '1-2 weken')"
  }
}

Wees specifiek voor Nederlandse dating apps en geef praktische, uitvoerbare adviezen.
  `;

  try {
    const response = await chatCompletion(
      [
        {
          role: 'system',
          content: 'Je bent een expert dating profile optimizer voor Nederlandse dating apps. Geef altijd een geldig JSON antwoord.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      {
        provider: 'openrouter',
        maxTokens: 2000,
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
      overallScore: 70,
      sections: {
        bio: {
          score: 75,
          grade: 'B' as const,
          strengths: ['Duidelijke schrijfstijl'],
          weaknesses: ['Kan persoonlijker'],
          recommendations: ['Voeg meer details toe over je leven']
        },
        photos: {
          score: 70,
          grade: 'B' as const,
          strengths: ['Goede kwaliteit'],
          weaknesses: ['Meer variatie gewenst'],
          recommendations: ['Voeg foto\'s toe van verschillende activiteiten']
        },
        interests: {
          score: 65,
          grade: 'C+' as const,
          strengths: ['Enkele goede interesses'],
          weaknesses: ['Te algemeen'],
          recommendations: ['Wees specifieker over je hobby\'s']
        },
        prompts: {
          score: 60,
          grade: 'C' as const,
          strengths: ['Basis aanwezig'],
          weaknesses: ['Ontbreken diepgang'],
          recommendations: ['Gebruik meer creatieve prompts']
        },
        demographics: {
          score: 80,
          grade: 'A' as const,
          strengths: ['Complete informatie'],
          weaknesses: ['Kan meer context'],
          recommendations: ['Voeg meer over je achtergrond toe']
        }
      },
      optimizationSuggestions: [
        {
          priority: 'high' as const,
          category: 'Bio',
          title: 'Verbeter je bio met verhalen',
          description: 'Je bio is goed maar kan meer persoonlijkheid gebruiken',
          expectedImpact: 25,
          effort: 'medium' as const,
          actionableSteps: [
            'Voeg een specifiek verhaal toe',
            'Gebruik humoristische elementen',
            'Maak duidelijk wat je zoekt'
          ]
        }
      ],
      competitorAnalysis: {
        percentileRank: 65,
        topPerformingElements: ['Persoonlijke verhalen', 'Goede foto kwaliteit'],
        commonWeaknesses: ['Te korte bio', 'Geen specifieke interesses'],
        marketPosition: 'Boven gemiddeld'
      },
      predictedPerformance: {
        currentMatches: 5,
        optimizedMatches: 8,
        improvement: 60,
        confidence: 75,
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