import { NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai-service';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@/lib/auth';
import type { UserProfile } from '@/lib/types';
import { getClientIdentifier, rateLimitExpensiveAI, createRateLimitHeaders } from '@/lib/rate-limit';
import { trackFeatureUsage } from '@/lib/neon-usage-tracking';
import { checkAndEnforceLimit } from '@/lib/api-helpers';

/**
 * API endpoint voor AI-gegenereerde ijsbrekers/openingszinnen
 * Gebruik: POST http://localhost:9001/api/icebreakers
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

    // 🔒 SUBSCRIPTION: Check feature limit before processing
    const limitCheck = await checkAndEnforceLimit(user.id, 'icebreaker');
    if (limitCheck) {
      return limitCheck;
    }

    // Fetch user profile from database
    const profileResult = await sql`
      SELECT profile FROM users WHERE id = ${user.id}
    `;

    let userProfile: UserProfile | null = null;
    if (profileResult.rows.length > 0 && profileResult.rows[0].profile) {
      userProfile = profileResult.rows[0].profile as UserProfile;
    }

    const { topic } = await request.json();

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Build user context
    let userContext = '';
    if (userProfile) {
      userContext = '\n\nJouw profiel:';
      if (userProfile.name) userContext += `\n- Naam: ${userProfile.name}`;
      if (userProfile.age) userContext += `\n- Leeftijd: ${userProfile.age}`;
      if (userProfile.gender) userContext += `\n- Geslacht: ${userProfile.gender}`;
      if (userProfile.interests && userProfile.interests.length > 0) {
        userContext += `\n- Jouw interesses: ${userProfile.interests.join(', ')}`;
      }
    }

    const systemPrompt = `Je bent een ervaren dating coach en creative copywriter uit Nederland. Je taak is om **originele, aantrekkelijke en creatieve openingszinnen** te schrijven voor online dating.

De gebruiker wil een gesprek beginnen met iemand die geïnteresseerd is in: "${topic}"${userContext}

Genereer 3 **unieke, creatieve en aantrekkelijke** openingszinnen die:

✅ **MOET:**
- Origineel en verrassend zijn (GEEN clichés!)
- Een vraag stellen die uitnodigt tot een gesprek
- Humor, speelsheid of intriges gebruiken
- Persoonlijk aanvoelen, niet generiek
- Laten zien dat je echt interesse hebt
- Niet té lang zijn (max 2-3 zinnen)
- Authentiek klinken, niet overdreven of geforceerd

❌ VERMIJD:
- Saaie vragen zoals "Wat maakt X voor jou zo verslavend?"
- Clichés zoals "Ik zag dat je gek bent op..."
- Te formele taal
- Oneliners die nergens op slaan
- Overdreven complimenten
- Te directe of opdringerige opmerkingen

💡 **CREATIEVE TECHNIEKEN:**
1. **Playful uitdaging:** "Ik wed dat ik een betere [topic]-playlist heb dan jij. Bewijs me ongelijk?"
2. **Gedeelde ervaring:** "Als je [topic] net zo serieus neemt als ik, moeten we echt praten over [specifiek aspect]"
3. **Grappige observatie:** "Eindelijk iemand die snapt dat [grappige opmerking over topic]!"
4. **Intrigue:** "Oké, snelle vraag: [interessante hypothetische vraag over topic]?"
5. **Gemeenschappelijke grond:** Gebruik het gebruikersprofiel om raakvlakken te vinden

**Voorbeelden van GOEDE openingszinnen:**

Voor "ze houdt van dansen":
- "Plot twist: ik dans als een giraffe op rolschaatsen, maar ik geef nooit op. Denk je dat je me kunt redden op de dansvloer? 🦒"
- "Serieuze vraag: wat is de move die je altijd probeert maar eigenlijk nooit lukt? Bij mij is het de moonwalk..."
- "Als we spontaan moeten dansen op een willekeurig nummer, welk nummer mag het absoluut NIET zijn?"

Voor "hij houdt van koken":
- "Ik heb een theorie dat je iemands karakter kunt zien aan hoe ze scrambled eggs maken. Wat zegt jouw techniek over jou?"
- "Snelle check: pineapple op pizza – deal breaker of guilty pleasure? Dit bepaalt onze hele toekomst 🍕"
- "Als je één gerecht voor de rest van je leven perfect moet kunnen maken, welke kies je?"

Format: Geef alleen de 3 openingszinnen terug, elk op een nieuwe regel, zonder nummering of extra uitleg.`;

    // Get response from AI service
    const response = await chatCompletion(
      [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Genereer 3 creatieve openingszinnen voor iemand die geïnteresseerd is in: ${topic}`
        }
      ],
      {
        provider: 'openrouter',
        maxTokens: 800, // Verhoogd voor echt creatieve, uitgewerkte openingszinnen
        temperature: 0.9 // Higher temperature for more creativity
      }
    );

    // Split response into individual icebreakers
    const icebreakers = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      // Remove numbering if present
      .map(line => line.replace(/^[\d\-\.\)]+\s*/, ''))
      .filter(line => line.length > 10); // Filter out very short lines

    // Track usage
    await trackFeatureUsage(user.id, 'icebreaker');

    return NextResponse.json({
      icebreakers: icebreakers.slice(0, 3), // Ensure we only return 3
      topic
    }, { status: 200 });
  } catch (error) {
    console.error('❌ Icebreaker generation error:', error);
    return NextResponse.json(
      {
        error: 'Icebreaker generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
