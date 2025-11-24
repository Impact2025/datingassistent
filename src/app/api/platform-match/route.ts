import { NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai-service';
import { verifyToken } from '@/lib/auth';
import { getClientIdentifier, rateLimitExpensiveAI, createRateLimitHeaders } from '@/lib/rate-limit';
import { trackFeatureUsage } from '@/lib/usage-tracking';
import { sql } from '@vercel/postgres';

interface PlatformRecommendation {
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

interface UserPreferences {
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
}

interface UserProfile {
  age?: number;
  gender?: string;
  location?: string;
  name?: string;
}

/**
 * API endpoint voor AI-dating platform matches
 * Gebruik: POST http://localhost:9001/api/platform-match
 * 🔒 SECURITY: Authenticated + Rate limited
 */
export async function POST(request: Request) {
  try {
    // 🔒 SECURITY: Rate limiting to prevent API cost abuse
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

    const {
      userProfile,
      preferences
    }: {
      userProfile: UserProfile;
      preferences: UserPreferences;
    } = await request.json();

    // Validate required fields
    if (!preferences.relationshipGoal || !preferences.agePreference || !preferences.genderPreference) {
      return NextResponse.json(
        { error: 'Relatie doel, leeftijd voorkeur en geslacht voorkeur zijn verplicht' },
        { status: 400 }
      );
    }

    const systemPrompt = `Je bent een professionele dating platform consultant met expertise in Nederlandse en internationale dating apps.

**GEBRUIKERSPROFIEL (van registratie):**
- Leeftijd: ${userProfile?.age || 'Niet bekend'}
- Geslacht: ${userProfile?.gender || 'Niet bekend'}
- Locatie: ${userProfile?.location || 'Niet bekend'}
- Naam: ${userProfile?.name || 'Niet bekend'}

**GEBRUIKERSVOORKEUREN (van vragenlijst):**
- Relatie doel: ${preferences.relationshipGoal}
- Leeftijd voorkeur: ${preferences.agePreference}
- Geslacht voorkeur: ${preferences.genderPreference}
- Locatie voorkeur: ${preferences.locationPreference || 'Geen voorkeur'}
- Belang opleiding: ${preferences.educationImportance || 'Geen voorkeur'}
- Belang achtergrond: ${preferences.backgroundImportance || 'Geen voorkeur'}
- Belang interesses: ${preferences.interestsImportance || 'Geen voorkeur'}
- App verwachtingen: ${preferences.appExpectations.length > 0 ? preferences.appExpectations.join(', ') : 'Geen specifieke verwachtingen'}
- Ontmoeting snelheid: ${preferences.meetingSpeed || 'Flexibel'}
- Budget: ${preferences.budget || 'Geen voorkeur'}
- Privacy belang: ${preferences.privacyImportance || 'Gemiddeld'}
- Vorige ervaring: ${preferences.pastExperience || 'Geen eerdere ervaring vermeld'}
- Tijd investering: ${preferences.timeInvestment || 'Gemiddeld'}
- AI hulp wensen: ${preferences.aiHelp.length > 0 ? preferences.aiHelp.join(', ') : 'Geen specifieke wensen'}
- Communicatie stijl: ${preferences.communicationStyle.length > 0 ? preferences.communicationStyle.join(', ') : 'Flexibel'}

**BELANGRIJKSTE CRITERIA WAAROP PLATFORMS VERSCHILLEN:**
1. **Algoritme**: Swipen (looks-based) vs diepgaand matching (profiel/personality-based)
2. **Doelgroep**: Algemeen vs niche (leeftijd, opleiding, religie, LGBTQ+, etc.)
3. **Features**: Basis matching vs advanced filters, video, AI hulp
4. **Safety**: Basis verificatie vs uitgebreid safety systeem
5. **Pricing**: Gratis vs premium features vs volledig betaald

**TAAK:**
Analyseer dit profiel en geef 4-6 platform aanbevelingen. Voor elk platform:

1. Specifiek ingaan op waarom dit platform bij DIT profiel past
2. Concrete features en sfeer beschrijven
3. Eerlijke voor- en nadelen
4. Strategie voor succes (3-4 concrete stappen)

**VEREISTEN:**
- Focus op Nederlandse/Belgische platforms waar relevant
- Include internationale platforms als ze significant beter passen
- Wees evidence-based en professioneel
- Sorteer op match score (hoogste eerst)
- Elk platform moet uniek zijn en verschillende niches bedienen

**KRITIEK BELANGRIJK - OUTPUT FORMAT:**
Retourneer ALLEEN een geldig JSON array, GEEN markdown, GEEN code blocks, GEEN extra tekst.
Gebruik dit EXACTE format:

[{
  "platform": "Platform naam",
  "matchScore": 8,
  "reasoning": "2-3 zinnen waarom dit perfect past",
  "targetAudience": "Specifieke doelgroep",
  "algorithm": "Swipen/Matching type",
  "niche": "Algemeen/25+/Opgeleid/etc",
  "pros": ["Voordeel 1", "Voordeel 2", "Voordeel 3"],
  "cons": ["Nadeel 1", "Nadeel 2"],
  "strategy": "Concrete strategie in 3-4 stappen",
  "pricing": "Gratis/Premium €X/maand",
  "safety": "Basis/Advanced/Top-tier"
}]`;

    // Get response from AI service
    const response = await chatCompletion(
      [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: 'Analyseer dit profiel en geef de beste platform aanbevelingen in JSON format.'
        }
      ],
      {
        provider: 'openrouter',
        maxTokens: 3000,
        temperature: 0.2
      }
    );

    console.log('🤖 AI Response:', response.substring(0, 200) + '...');

    // Parse JSON response with robust error handling
    let recommendations: PlatformRecommendation[];
    try {
      // Remove markdown code blocks if present
      let cleanResponse = response.trim();

      // Try 1: Remove markdown code blocks
      if (cleanResponse.includes('```')) {
        const codeBlockMatch = cleanResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
          cleanResponse = codeBlockMatch[1];
        } else {
          cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        }
      }

      // Try 2: Extract JSON array
      const arrayMatch = cleanResponse.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        cleanResponse = arrayMatch[0];
      }

      recommendations = JSON.parse(cleanResponse);

      // Validate the response structure
      if (!Array.isArray(recommendations)) {
        throw new Error('Response is not an array');
      }

      // Validate and normalize each recommendation
      recommendations = recommendations
        .filter(rec => rec.platform && typeof rec.matchScore === 'number')
        .map(rec => ({
          platform: rec.platform,
          matchScore: Math.min(10, Math.max(1, rec.matchScore)),
          reasoning: rec.reasoning || 'Geen uitleg beschikbaar',
          targetAudience: rec.targetAudience || 'Algemeen publiek',
          algorithm: rec.algorithm || 'Standaard matching',
          niche: rec.niche || 'Algemeen',
          pros: Array.isArray(rec.pros) ? rec.pros : [],
          cons: Array.isArray(rec.cons) ? rec.cons : [],
          strategy: rec.strategy || 'Begin met het maken van een compleet profiel',
          pricing: rec.pricing || 'Gratis met premium opties',
          safety: rec.safety || 'Standaard veiligheid'
        }))
        .sort((a, b) => b.matchScore - a.matchScore);

      if (recommendations.length === 0) {
        throw new Error('No valid recommendations found');
      }

      console.log(`✅ Successfully parsed ${recommendations.length} recommendations`);

    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError);
      console.error('Raw response:', response);

      return NextResponse.json(
        {
          error: 'parse_error',
          message: 'Kon de AI response niet verwerken. Probeer het opnieuw.',
          details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
        },
        { status: 500 }
      );
    }

    // Save recommendations to database
    try {
      await sql`
        INSERT INTO platform_match_results (
          user_id,
          preferences,
          recommendations,
          created_at
        ) VALUES (
          ${user.id},
          ${JSON.stringify(preferences)},
          ${JSON.stringify(recommendations)},
          NOW()
        )
      `;
      console.log('✅ Saved recommendations to database');
    } catch (dbError) {
      // Don't fail the request if DB save fails
      console.error('⚠️  Failed to save to database:', dbError);
    }

    // Track usage
    await trackFeatureUsage(user.id, 'platform_match');

    return NextResponse.json({
      recommendations,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Platform match error:', error);
    return NextResponse.json(
      {
        error: 'platform_match_failed',
        message: error instanceof Error ? error.message : 'Er ging iets mis bij het genereren van aanbevelingen',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
