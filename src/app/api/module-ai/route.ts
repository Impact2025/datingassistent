import { NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai-service';
import { verifyToken } from '@/lib/auth';
import { getClientIdentifier, rateLimitExpensiveAI, createRateLimitHeaders } from '@/lib/rate-limit';
import { trackFeatureUsage } from '@/lib/neon-usage-tracking';
import { checkAndEnforceLimit } from '@/lib/api-helpers';

/**
 * API endpoint voor AI feedback op cursus module oefeningen
 * Gebruik: POST http://localhost:9001/api/module-ai
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
    const limitCheck = await checkAndEnforceLimit(user.id, 'module_ai');
    if (limitCheck) {
      return limitCheck;
    }

    const { moduleId, userInput, moduleTitle, moduleDescription } = await request.json();

    if (!moduleId || !userInput || typeof userInput !== 'string' || userInput.trim().length === 0) {
      return NextResponse.json(
        { error: 'Module ID and user input are required' },
        { status: 400 }
      );
    }

    // Define prompts for each module type
    const getModulePrompt = (id: number): string => {
      const baseContext = moduleTitle && moduleDescription
        ? `Context: Dit is module "${moduleTitle}" - ${moduleDescription}\n\n`
        : '';

      switch (id) {
        case 1: // Persoonlijkheidsanalyse
          return `${baseContext}Je bent een ervaren dating coach. De gebruiker heeft een lijst met eigenschappen of interesses opgegeven.

Analyseer deze en geef:
1. Een korte samenvatting van hun kernpersoonlijkheid (2-3 zinnen)
2. Wat dit vertelt over wat ze kunnen bieden in een relatie
3. Welk type partner hier goed bij zou passen

Houd het warm, positief en bemoedigend. Maximaal 100 woorden.

Gebruikersinput: ${userInput}`;

        case 2: // Karaktertrekken beschrijven
          return `${baseContext}Je bent een dating profiel expert. De gebruiker heeft een karaktertrek genoemd die ze belangrijk vinden.

Geef feedback op:
1. Hoe kunnen ze dit LATEN ZIEN in plaats van alleen vertellen? (met concreet voorbeeld)
2. Wat is een betere, authentiekere manier om dit te verwoorden?

Gebruik de "show don't tell" methode. Maximaal 80 woorden.

Karaktertrek: ${userInput}`;

        case 3: // Profieltekst schrijven
          return `${baseContext}Je bent een creatieve copywriter voor dating profielen. De gebruiker heeft een concept voor hun profiel geschreven.

Geef:
1. Wat gaat er goed (2 dingen)
2. Een herschreven versie die pakkender en authentieker is
3. Eén tip om het nog beter te maken

Maximaal 120 woorden.

Concept tekst: ${userInput}`;

        case 5: // Omgaan met situaties
          return `${baseContext}Je bent een dating coach gespecialiseerd in communicatie. De gebruiker beschrijft een ongemakkelijke dating situatie.

Geef:
1. Empathische erkenning van de situatie
2. Een concrete, respectvolle manier om hiermee om te gaan
3. Een voorbeeldzin die ze kunnen gebruiken

Maximaal 100 woorden.

Situatie: ${userInput}`;

        case 6: // Volgende stappen
          return `${baseContext}Je bent een dating coach die helpt met het plannen van de volgende stap. De gebruiker beschrijft waar ze nu staan.

Geef:
1. 2-3 concrete, laagdrempelige acties die ze kunnen nemen
2. Waarom elke actie nuttig is
3. Een bemoedigende afsluiting

Gebruik genummerde lijst. Maximaal 120 woorden.

Situatie: ${userInput}`;

        default:
          return `${baseContext}Je bent een behulpzame dating coach. Analyseer de input van de gebruiker en geef constructieve, persoonlijke feedback.

Gebruikersinput: ${userInput}`;
      }
    };

    // Get response from AI service
    const response = await chatCompletion(
      [
        {
          role: 'system',
          content: 'Je bent een warme, empathische dating coach uit Nederland. Geef altijd constructieve, persoonlijke en bemoedigende feedback. Gebruik markdown voor opmaak waar nodig. Alle responses in het Nederlands.'
        },
        {
          role: 'user',
          content: getModulePrompt(moduleId)
        }
      ],
      {
        provider: 'openrouter',
        maxTokens: 800, // Verhoogd voor uitgebreide module feedback met voorbeelden
        temperature: 0.7
      }
    );

    // Track usage
    await trackFeatureUsage(user.id, 'module_ai');

    return NextResponse.json({ feedback: response }, { status: 200 });
  } catch (error) {
    console.error('❌ Module AI feedback error:', error);
    return NextResponse.json(
      {
        error: 'Module AI feedback failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
