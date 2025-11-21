import { NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai-service';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@/lib/auth';
import type { UserProfile } from '@/lib/types';
import { getClientIdentifier, rateLimitExpensiveAI, createRateLimitHeaders } from '@/lib/rate-limit';
import { trackFeatureUsage } from '@/lib/neon-usage-tracking';
import { checkAndEnforceLimit } from '@/lib/api-helpers';

/**
 * API endpoint voor AI-gegenereerde date ideeën
 * Gebruik: POST http://localhost:9001/api/date-ideas
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

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // 🔒 SUBSCRIPTION: Check feature limit before processing (skip in development)
    if (process.env.NODE_ENV !== 'development') {
      const limitCheck = await checkAndEnforceLimit(user.id, 'date_idea');
      if (limitCheck) {
        return limitCheck;
      }
    }

    // Fetch user profile from database
    const profileResult = await sql`
      SELECT profile FROM users WHERE id = ${user.id}
    `;

    let userProfile: UserProfile | null = null;
    if (profileResult.rows.length > 0 && profileResult.rows[0].profile) {
      userProfile = profileResult.rows[0].profile as UserProfile;
    }

    const { city } = await request.json();

    if (!city || typeof city !== 'string' || city.trim().length === 0) {
      return NextResponse.json(
        { error: 'City is required' },
        { status: 400 }
      );
    }

    // Build user context
    let userContext = '';
    if (userProfile) {
      userContext = '\n\nGebruikersprofiel:';
      if (userProfile.age) userContext += `\n- Leeftijd: ${userProfile.age}`;
      if (userProfile.gender) userContext += `\n- Geslacht: ${userProfile.gender}`;
      if (userProfile.seekingGender && userProfile.seekingGender.length > 0) {
        userContext += `\n- Zoekt: ${userProfile.seekingGender.join(', ')}`;
      }
      if (userProfile.seekingType) userContext += `\n- Type relatie: ${userProfile.seekingType}`;
      if (userProfile.interests && userProfile.interests.length > 0) {
        userContext += `\n- Interesses: ${userProfile.interests.join(', ')}`;
      }
    }

    const systemPrompt = `Je bent een ervaren dating coach uit Nederland. De gebruiker zoekt date-ideeën in ${city}.${userContext}

Genereer 3 creatieve, realistische en leuke date-ideeën voor ${city} of de regio eromheen.

BELANGRIJK: Gebruik GEEN specifieke bedrijfsnamen of locatienamen die mogelijk niet bestaan! In plaats daarvan:
- Gebruik algemene beschrijvingen zoals "een gezellige koffiebar in het centrum"
- Of geef een TYPE locatie aan zoals "een lokale bakkerij" of "het stadspark"
- Of verwijs naar bekende algemene categorieën zoals "een museum", "de bioscoop", "een cocktailbar"
- Voor grote steden mag je bekende bezienswaardigheden noemen (bijv. Vondelpark in Amsterdam)

Voor elk idee:
1. Geef een specifiek, uitvoerbaar date-idee met een TYPE locatie (geen specifieke namen tenzij zeer bekend)
2. Leg kort uit waarom dit een goed idee is (max 2 zinnen)
3. Schrijf een kant-en-klaar voorbeeldbericht dat de gebruiker kan sturen

Houd rekening met:
- Het seizoen (het is ${new Date().toLocaleDateString('nl-NL', { month: 'long' })})
- De locatie (${city} - denk aan wat typisch beschikbaar is in zo'n plaats)
- Het gebruikersprofiel (interesses, leeftijd, etc.)
- Variatie: mix actieve, culturele en ontspannen opties
- Bestaanbaarheid: suggesties moeten realistisch zijn voor ${city}

Format elk idee EXACT als volgt (gebruik markdown):
**Idee:** [Beschrijving van het date-idee]

**Waarom dit werkt:** [Korte uitleg]

**Voorbeeldbericht:** "[Een kant-en-klaar bericht om te sturen]"

**Tip:** [Korte tip hoe ze zelf een geschikte locatie kunnen vinden, bijv. "Zoek op Google Maps naar 'koffiebar ${city}' of vraag lokale aanbevelingen"]

---

Geef alleen de 3 date-ideeën terug, geen extra tekst ervoor of erna.`;

    // Get response from AI service
    const response = await chatCompletion(
      [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Geef me 3 leuke date-ideeën voor ${city}${userContext ? ' gebaseerd op mijn profiel' : ''}.`
        }
      ],
      {
        provider: 'openrouter',
        maxTokens: 1500,
        temperature: 0.8
      }
    );

    // Parse the response into individual ideas (split by ---)
    const ideas = response.split('---').filter(idea => idea.trim().length > 0);

    // Track usage (skip in development)
    if (process.env.NODE_ENV !== 'development') {
      await trackFeatureUsage(user.id, 'date_idea');
    }

    return NextResponse.json({
      ideas: ideas.map(idea => idea.trim()),
      city
    }, { status: 200 });
  } catch (error) {
    console.error('❌ Date ideas generation error:', error);
    return NextResponse.json(
      {
        error: 'Date ideas generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
