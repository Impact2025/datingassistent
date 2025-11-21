import { NextResponse } from 'next/server';
import { cachedChatCompletion } from '@/lib/ai-service';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@/lib/auth';
import type { UserProfile } from '@/lib/types';
import { getClientIdentifier, rateLimitExpensiveAI, createRateLimitHeaders } from '@/lib/rate-limit';
import { trackFeatureUsage } from '@/lib/neon-usage-tracking';
import { checkAndEnforceLimit } from '@/lib/api-helpers';

/**
 * API endpoint voor AI-gegenereerde openingszinnen op basis van profiel
 * Gebruik: POST http://localhost:9001/api/openers
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
    const limitCheck = await checkAndEnforceLimit(user.id, 'opener');
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

    const body = await request.json();
    const { profileText, yourInterests, conversationStyle } = body;

    // Validate request size - prevent 413 errors
    const requestSize = JSON.stringify(body).length;
    const maxRequestSize = 50000; // 50KB limit

    if (requestSize > maxRequestSize) {
      return NextResponse.json(
        { error: 'Request too large', message: 'De ingevoerde tekst is te lang. Probeer kortere beschrijvingen te gebruiken.' },
        { status: 413 }
      );
    }

    // Validate profile text
    if (!profileText || typeof profileText !== 'string' || profileText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Profile text is required' },
        { status: 400 }
      );
    }

    // Validate text lengths
    if (profileText.length > 10000) {
      return NextResponse.json(
        { error: 'Profile text too long', message: 'De profielbeschrijving is te lang (max 10.000 karakters). Maak het korter.' },
        { status: 400 }
      );
    }

    if (yourInterests && yourInterests.length > 5000) {
      return NextResponse.json(
        { error: 'Interests text too long', message: 'De interesses beschrijving is te lang (max 5.000 karakters). Maak het korter.' },
        { status: 400 }
      );
    }

    // Build user context
    let userContext = '';
    if (userProfile) {
      userContext = '\n\nJouw eigen profiel:';
      if (userProfile.name) userContext += `\n- Naam: ${userProfile.name}`;
      if (userProfile.age) userContext += `\n- Leeftijd: ${userProfile.age}`;
      if (userProfile.interests && userProfile.interests.length > 0) {
        userContext += `\n- Jouw interesses: ${userProfile.interests.join(', ')}`;
      }
    }

    const systemPrompt = `Je bent een ervaren dating coach en creative copywriter uit Nederland. Je taak is om **originele, aantrekkelijke en persoonlijke openingszinnen** te schrijven voor online dating.

De gebruiker wil contact leggen met iemand met dit profiel:
"${profileText}"${userContext}

Genereer 3 **unieke, creatieve en aantrekkelijke** openingszinnen die:

✅ **MOET:**
- Specifiek inspelen op iets in het profiel (hobby, opmerking, humor)
- Een vraag stellen die uitnodigt tot een gesprek
- Origineel en verrassend zijn (GEEN clichés!)
- Humor, speelsheid of intriges gebruiken
- Laten zien dat je het profiel echt hebt gelezen
- Persoonlijk aanvoelen, niet als een template
- Niet té lang zijn (max 2-3 zinnen)
- Authentiek klinken, niet overdreven

❌ VERMIJD:
- Saaie vragen zoals "Hoe is die passie begonnen?"
- Generieke zinnen zoals "Je profiel straalt iets uit..."
- Clichés zoals "Wat triggerde me was..."
- Te formele of stijve taal
- Oneliners die nergens op slaan
- Overdreven complimenten
- Te directe of opdringerige opmerkingen

💡 **STRATEGIEËN:**
1. **Pak een specifiek detail:** Als ze schrijven "Ik hou van Italiaans eten" → "Oké, belangrijke vraag: carbonara met of zonder room? Dit bepaalt of we vrienden kunnen zijn 😄"
2. **Gedeelde interesse:** Als jij en zij dezelfde hobby hebben → "Eindelijk iemand anders die [hobby] snapt! Wat is jouw grootste [hobby]-blunder?"
3. **Playful teasing:** Als ze iets grappigs schrijven → "Je had me bij [quote uit profiel]. Vertel me dat je ook [gerelateerde vraag]?"
4. **Open vraag over passie:** "Als je [hun hobby] zou moeten uitleggen aan een 5-jarige, hoe zou je het doen?"
5. **Scenario/hypothetisch:** "Stel je voor: je hebt 24 uur in [hun interesse-onderwerp], wat ga je doen?"

**Voorbeelden van GOEDE openingszinnen:**

Profiel: "Reislustige fotograaf met liefde voor Italiaans eten"
- "Plot twist: ik claim dat ik de beste cacio e pepe maak. Durf je mijn bluf te callen? 🍝"
- "Als je één foto zou mogen nemen die je hele reis samenvat, welk moment kies je dan?"
- "Belangrijke vraag: heb je ooit per ongeluk een duif gefotografeerd die vervolgens je lunch stal? Vraag voor een vriend..."

Profiel: "Gek op honden en vintage vinyl"
- "Oké, maar welke plaat draai je als je hond een slechte dag heeft gehad? Ik moet dit weten 🐕"
- "Eerlijke vraag: hoeveel platen heb je gekocht 'voor de hoeskunst' en nooit gedraaid?"

**Gebruik raakvlakken uit JOUW profiel als die er zijn!**

Format: Geef alleen de 3 openingszinnen terug, elk op een nieuwe regel, zonder nummering of extra uitleg.`;

    // Get response from AI service (with caching)
    const response = await cachedChatCompletion(
      [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Genereer 3 persoonlijke openingszinnen voor dit profiel:\n\n${profileText}`
        }
      ],
      {
        provider: 'openrouter',
        maxTokens: 800, // Verhoogd voor persoonlijke, doordachte openingszinnen
        temperature: 0.9 // Higher temperature for more creativity
      }
    );

    // Split response into individual openers
    const openers = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      // Remove numbering if present
      .map(line => line.replace(/^[\d\-\.\)]+\s*/, ''))
      .filter(line => line.length > 10); // Filter out very short lines

    // Track usage
    await trackFeatureUsage(user.id, 'opener');

    return NextResponse.json({
      openers: openers.slice(0, 3), // Ensure we only return 3
    }, { status: 200 });
  } catch (error) {
    console.error('❌ Opener generation error:', error);
    return NextResponse.json(
      {
        error: 'Opener generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
