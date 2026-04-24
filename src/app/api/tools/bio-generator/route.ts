import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { OpenRouterClient } from '@/lib/openrouter';

const STYLE_PROMPTS: Record<string, string> = {
  fun: 'energiek, humoristisch en speels van toon',
  serious: 'betrouwbaar, ambitieus en serieus van toon',
  flirty: 'charmant, speels en licht flirterig van toon',
  mysterious: 'intrigerend, mysterieus en subtiel van toon',
};

const LENGTH_CHARS: Record<string, string> = {
  short: '60-80 karakters',
  medium: '80-120 karakters',
  long: '120-150 karakters',
};

export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);

    const { userInput, style, length } = await request.json();

    if (!userInput?.trim()) {
      return NextResponse.json({ error: 'userInput is verplicht' }, { status: 400 });
    }

    const styleDesc = STYLE_PROMPTS[style] || STYLE_PROMPTS.fun;
    const lengthDesc = LENGTH_CHARS[length] || LENGTH_CHARS.medium;

    const prompt = `Je bent een expert dating-coach die Nederlandse dating-profielbio's schrijft die echt matchen opleveren.

Schrijf 3 unieke dating-bio varianten voor iemand met de volgende info:
"${userInput.trim()}"

Eisen per bio:
- Stijl: ${styleDesc}
- Lengte: precies ${lengthDesc}
- Geschreven in de eerste persoon (ik)
- Nederlands, authentiek en persoonlijk
- Eindigt idealiter met een impliciete of expliciete gespreksopener (vraag of open einde)
- Gebruik maximaal 1-2 emoji's per bio
- Geen clichés zoals "ik hou van lachen" of "ik zoek iemand die van avontuur houdt"
- Noem concrete details uit de input, geen vage algemeenheden

Geef je antwoord UITSLUITEND als een JSON array in dit formaat (geen andere tekst, geen markdown):
[
  {"id":"1","content":"[bio tekst]","score":90},
  {"id":"2","content":"[bio tekst]","score":85},
  {"id":"3","content":"[bio tekst]","score":80}
]

De score (0-100) reflecteert hoe aantrekkelijk en effectief de bio is voor matches.`;

    const client = new OpenRouterClient();
    const raw = await client.createChatCompletion(
      'anthropic/claude-3.5-haiku',
      [{ role: 'user', content: prompt }],
      { max_tokens: 800, temperature: 0.85 }
    );

    // Strip markdown code blocks if present
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let bios: Array<{ id: string; content: string; score: number }>;
    try {
      bios = JSON.parse(cleaned);
    } catch {
      // Fallback: extract JSON array from the response
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('Kon geen geldige bio array parsen uit AI response');
      bios = JSON.parse(match[0]);
    }

    return NextResponse.json({ bios, style, length });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }
    console.error('Bio generator error:', error);
    return NextResponse.json({ error: 'Bio generatie mislukt' }, { status: 500 });
  }
}
