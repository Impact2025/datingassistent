import { NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai-service';
import { getClientIdentifier, rateLimitExpensiveAI, createRateLimitHeaders } from '@/lib/rate-limit';
import { requireAuth } from '@/lib/auth';
import { trackFeatureUsage } from '@/lib/usage-tracking';

const DEFAULT_TONE_PROMPT = 'vlot, energiek en uitnodigend';

type BioGeneratorBody = {
  tone?: string;
  draft?: string;
  context?: {
    tonePrompt?: string;
    summary?: string;
    userBasics?: string;
    fields?: Record<string, unknown>;
  };
};

export async function POST(request: Request) {
  try {
    // 🔒 SECURITY: Require authentication
    const user = await requireAuth(request);

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

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        {
          error: 'ai_unavailable',
          message: 'AI Bio Generator is tijdelijk niet beschikbaar (API-sleutel ontbreekt).',
        },
        { status: 503 }
      );
    }

    const body = (await request.json()) as BioGeneratorBody;

    const draft = typeof body?.draft === 'string' ? body.draft.trim() : '';
    if (!draft) {
      return NextResponse.json({ error: 'draft_required' }, { status: 400 });
    }

    const tonePrompt = body?.context?.tonePrompt?.trim() || DEFAULT_TONE_PROMPT;
    const summary = body?.context?.summary?.trim() ?? '';
    const userBasics = body?.context?.userBasics?.trim() ?? '';
    const fields = body?.context?.fields ?? {};

    const contextPieces: string[] = [];
    if (summary) contextPieces.push(summary);
    if (userBasics) contextPieces.push(`Basisinformatie:\n${userBasics}`);

    const wordList = Array.isArray((fields as any)?.words)
      ? ((fields as any).words as unknown[])
          .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
          .join(', ')
      : '';
    if (wordList) contextPieces.push(`Drie kernwoorden: ${wordList}`);

    if (typeof (fields as any)?.freeDay === 'string' && (fields as any).freeDay.trim()) {
      contextPieces.push(`Ideale vrije dag: ${(fields as any).freeDay}`);
    }
    if (typeof (fields as any)?.firstImpression === 'string' && (fields as any).firstImpression.trim()) {
      contextPieces.push(`Eerste indruk: ${(fields as any).firstImpression}`);
    }
    if (typeof (fields as any)?.values === 'string' && (fields as any).values.trim()) {
      contextPieces.push(`Belangrijk in connectie: ${(fields as any).values}`);
    }
    if (typeof (fields as any)?.feelings === 'string' && (fields as any).feelings.trim()) {
      contextPieces.push(`Zo wil ik dat iemand zich voelt: ${(fields as any).feelings}`);
    }
    if (typeof (fields as any)?.clicheRewrite === 'string' && (fields as any).clicheRewrite.trim()) {
      contextPieces.push(`Herschreven cliché: ${(fields as any).clicheRewrite}`);
    }

    const contextBlock = contextPieces.join('\n\n') || 'Geen aanvullende context beschikbaar.';

    const messages = [
      {
        role: 'system' as const,
        content:
          'Je bent een datingcoach die deelnemers helpt hun dating bio te verfijnen. Lever altijd drie varianten met een positieve, uitnodigende toon.',
      },
      {
        role: 'user' as const,
        content: `Maak drie varianten van een dating bio in het Nederlands.

Toon/stijl: ${tonePrompt}.

Concepttekst:
${draft}

Aanvullende context:
${contextBlock}

Regels:
- Houd elke variant 2-3 alinea's lang (ongeveer 150-250 woorden per variant).
- Laat persoonlijkheid en energie zien, vermijd clichés.
- Sluit elke variant af met een uitnodigende zin of haakje.
- Zorg dat elke variant duidelijk anders is qua invalshoek of detail.
- Gebruik ALLEEN Nederlands - geen enkele Engelse tekst.

Geef het resultaat terug als geldige JSON met dit formaat:
{
 "variants": ["variant 1", "variant 2", "variant 3"],
 "coachingTip": "optionele coach tip (max 1 zin)"
}`,
      },
    ];

    const rawResponse = await chatCompletion(messages, {
      provider: 'openrouter',
      maxTokens: 1200, // Verhoogd voor 3 uitgebreide, kwalitatieve bio varianten
      temperature: 0.75,
    });

    let variants: string[] = [];
    let coachingTip: string | null = null;

    try {
      const parsed = JSON.parse(rawResponse);
      if (Array.isArray(parsed?.variants)) {
        variants = parsed.variants.filter((item: unknown): item is string => typeof item === 'string' && item.trim().length > 0);
      }
      if (typeof parsed?.coachingTip === 'string' && parsed.coachingTip.trim()) {
        coachingTip = parsed.coachingTip.trim();
      }
    } catch (error) {
      console.warn('Kon JSON van bio generator niet parsen, val terug op tekst split.', error);
      variants = rawResponse
        .split(/\n+/)
        .map((line) => line.replace(/^[\-\d\.\s]+/, '').trim())
        .filter((line) => line.length > 0)
        .slice(0, 3);
    }

    if (!variants.length) {
      return NextResponse.json(
        {
          error: 'no_variants',
          message: 'De AI leverde geen bruikbare varianten.',
        },
        { status: 502 }
      );
    }

    // Track usage
    await trackFeatureUsage(user.id, 'profile_rewrite');

    return NextResponse.json({ variants, coachingTip });
  } catch (error) {
    console.error('Bio generator mislukte', error);

    // 🔒 SECURITY: Handle authentication errors
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          {
            error: 'unauthorized',
            message: 'Je moet ingelogd zijn om de bio generator te gebruiken.',
          },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'bio_generation_failed',
        message: 'Het genereren van bio-varianten is mislukt. Probeer het later opnieuw.',
      },
      { status: 500 }
    );
  }
}
