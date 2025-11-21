import { NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai-service';
import { verifyToken } from '@/lib/auth';
import { getClientIdentifier, rateLimitExpensiveAI, createRateLimitHeaders } from '@/lib/rate-limit';
import { trackFeatureUsage } from '@/lib/usage-tracking';

interface PlatformSuggestion {
  name: string;
  rationale: string;
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
      age,
      gender,
      seekingGender,
      seekingType,
      identityGroup,
      interests,
      location,
      platformPref,
      costPref,
      timePref,
      techComfort,
      availablePlatforms
    } = await request.json();

    if (!age || !availablePlatforms) {
      return NextResponse.json(
        { error: 'Age and available platforms are required' },
        { status: 400 }
      );
    }

    const systemPrompt = `Je bent een ervaren dating coach en expert op het gebied van Nederlandse dating apps en websites. Je kent alle platforms goed en weet precies welke doelgroepen ze bedienen.

**Gebruikersprofiel:**
- Leeftijd: ${age} jaar
- Geslacht: ${gender || 'niet opgegeven'}
- Zoekt: ${seekingGender ? (Array.isArray(seekingGender) ? seekingGender.join(', ') : seekingGender) : 'niet opgegeven'}
- Relatietype: ${seekingType || 'niet opgegeven'}
- Identiteitsgroep: ${identityGroup || 'algemeen'}
${location ? `- Locatie: ${location}` : ''}
${interests && Array.isArray(interests) && interests.length > 0 ? `- Interesses: ${interests.join(', ')}` : ''}

**Voorkeuren:**
- Platform type: ${platformPref || 'geen voorkeur'}
- Budget: ${costPref || 'geen voorkeur'}
- Tijdsinvestering: ${timePref || 'geen voorkeur'}
- Comfort met technologie/AI: ${techComfort || 'gemiddeld'}

**Beschikbare platforms:**
${JSON.stringify(availablePlatforms, null, 2)}

**Jouw taak:**
Analyseer dit profiel grondig en adviseer de beste 2-3 platforms. Voor elk platform geef je een **uitgebreide, persoonlijke uitleg** waarin je:

1. **Specifiek ingaat op waarom dit platform bij DIT profiel past**
   - Benoem concrete kenmerken van de gebruiker (leeftijd, voorkeuren, etc.)
   - Leg uit hoe het platform hierop aansluit

2. **Geef praktische informatie:**
   - Wat maakt dit platform uniek?
   - Wat is de sfeer/cultuur van het platform?
   - Wat voor type mensen vind je er?
   - Wat zijn de belangrijkste features?
   - Kosten details (gratis vs betaald, wat krijg je ervoor?)

3. **Geef eerlijke voor- en nadelen:**
   - Waarom zou dit goed werken voor deze gebruiker?
   - Zijn er ook minpunten om rekening mee te houden?

4. **Geef een concreet advies:**
   - Hoe te starten op dit platform?
   - Tips voor succes specifiek voor dit profiel

Maak de uitleg **persoonlijk, informatief en behulpzaam**. Denk aan 6-8 zinnen per platform, niet 2-3!

**Format:**
Geef je antwoord als een JSON array met objecten die elk hebben:
- "name": de naam van het platform
- "rationale": uitgebreide, persoonlijke uitleg (6-8 zinnen, in het Nederlands)

BELANGRIJK:
- Geef ALLEEN de JSON array terug, geen extra tekst ervoor of erna
- Gebruik alleen platforms uit de beschikbare lijst
- Zorg dat de JSON geldig is en geparsed kan worden
- Gebruik markdown formatting in de rationale: **vet** voor kopjes, bullet points waar relevant
- Maak het echt persoonlijk en specifiek voor dit profiel`;

    // Get response from AI service
    const response = await chatCompletion(
      [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: 'Geef me de beste platform matches voor dit profiel.'
        }
      ],
      {
        provider: 'openrouter',
        maxTokens: 1200,
        temperature: 0.7
      }
    );

    // Parse JSON response
    let suggestions: PlatformSuggestion[];
    try {
      // Remove markdown code blocks if present
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/g, '');
      }

      suggestions = JSON.parse(cleanResponse);

      // Validate the response structure
      if (!Array.isArray(suggestions)) {
        throw new Error('Response is not an array');
      }

      // Ensure each suggestion has required fields
      suggestions = suggestions.map(s => ({
        name: s.name || 'Onbekend platform',
        rationale: s.rationale || 'Geen uitleg beschikbaar'
      }));

    } catch (parseError) {
      console.error('Failed to parse AI response:', response);
      // Fallback: create a simple suggestion
      suggestions = [{
        name: 'Diverse platforms',
        rationale: 'Op basis van je voorkeuren raden we aan verschillende platforms te proberen. Bekijk de beschikbare opties en kies wat bij je past.'
      }];
    }

    // Track usage
    await trackFeatureUsage(user.id, 'platform_advice');

    return NextResponse.json({ suggestions }, { status: 200 });
  } catch (error) {
    console.error('❌ Platform match error:', error);
    return NextResponse.json(
      {
        error: 'Platform match failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
