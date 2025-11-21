import { NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai-service';
import { verifyToken } from '@/lib/auth';
import { getClientIdentifier, rateLimitExpensiveAI, createRateLimitHeaders } from '@/lib/rate-limit';
import { trackFeatureUsage } from '@/lib/neon-usage-tracking';
import { checkAndEnforceLimit } from '@/lib/api-helpers';

/**
 * API endpoint voor conversatie veiligheidscheck (red flags detectie)
 * Gebruik: POST http://localhost:9001/api/safety-check
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
    const limitCheck = await checkAndEnforceLimit(user.id, 'safety_check');
    if (limitCheck) {
      return limitCheck;
    }

    const { conversationLog } = await request.json();

    if (!conversationLog || typeof conversationLog !== 'string' || conversationLog.trim().length === 0) {
      return NextResponse.json(
        { error: 'Conversation log is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `Je bent een veiligheidsexpert gespecialiseerd in online dating gesprekken. Je taak is om gesprekken te analyseren op potentiële "rode vlaggen" (red flags) en gebruikers te helpen veilig te blijven.

**Rode vlaggen om op te letten:**

🚩 **Persoonlijke informatie te snel vragen**
- Direct vragen naar adres, volledige naam, werkplek
- Vragen naar financiële situatie
- Te persoonlijke vragen voor de fase van het contact

🚩 **Dwingend of manipulatief gedrag**
- Druk uitoefenen om snel af te spreken
- Boos worden bij grenzen
- Guilt-tripping ("Als je me echt leuk vond...")
- Love bombing (overdreven complimenten vroeg in gesprek)

🚩 **Ontwijkend gedrag**
- Vage antwoorden op simpele vragen
- Niet willen videobellen
- Tegenstrijdige verhalen
- Vermijden om over zichzelf te praten

🚩 **Ongepaste inhoud**
- Te snel seksueel worden
- Ongepaste opmerkingen
- Negeren van grenzen

🚩 **Verdachte situaties**
- Vragen om geld of "hulp"
- Te perfect verhaal
- Foto's die niet echt lijken
- Alleen op vreemde tijden beschikbaar

**Jouw taak:**

1. **Analyseer het gesprek** op bovenstaande rode vlaggen
2. **Geef een eerlijke beoordeling** - is dit een veilig gesprek?
3. **Als er rode vlaggen zijn:**
   - Benoem ze specifiek
   - Leg uit waarom het een red flag is
   - Geef concrete tips hoe te reageren
4. **Als er geen rode vlaggen zijn:**
   - Geef geruststellende feedback
   - Benoem positieve signalen
   - Moedig de gebruiker aan

**Toon:**
- Empathisch en ondersteunend
- Direct en eerlijk (geen dingen verzwijgen)
- Niet overdreven alarmerend, maar wel serieus

**Format:**
Gebruik markdown voor duidelijke structuur:
- **Vetgedrukte koppen** voor secties
- Bullet points voor tips
- Duidelijke alinea's

Houd je analyse tussen 150-300 woorden.`;

    // Get response from AI service
    const response = await chatCompletion(
      [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Analyseer dit gesprek op veiligheid en rode vlaggen:\n\n${conversationLog}`
        }
      ],
      {
        provider: 'openrouter',
        maxTokens: 1200, // Verhoogd voor grondige veiligheidsanalyse met voorbeelden
        temperature: 0.6 // Lower temperature for more consistent safety analysis
      }
    );

    // Track usage
    await trackFeatureUsage(user.id, 'safety_check');

    return NextResponse.json({ analysis: response }, { status: 200 });
  } catch (error) {
    console.error('❌ Safety check error:', error);
    return NextResponse.json(
      {
        error: 'Safety check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
