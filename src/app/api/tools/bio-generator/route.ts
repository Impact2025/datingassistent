import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { OpenRouterClient } from '@/lib/openrouter';

const STYLE_PROMPTS: Record<string, string> = {
  fun: 'energiek, humoristisch en speels — toont levenslust zonder overdreven te zijn',
  serious: 'betrouwbaar, ambitieus en oprecht — stabiel en zelfverzekerd',
  flirty: 'charmant, licht flirterig en warm — nodigt uit tot contact',
  mysterious: 'intrigerend en subtiel — laat ruimte voor nieuwsgierigheid',
};

const LENGTH_CHARS: Record<string, { range: string; min: number; max: number }> = {
  short:  { range: '60-80 karakters',   min: 60,  max: 80  },
  medium: { range: '80-120 karakters',  min: 80,  max: 120 },
  long:   { range: '120-150 karakters', min: 120, max: 150 },
};

export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);

    const { userInput, style, length } = await request.json();

    if (!userInput?.trim()) {
      return NextResponse.json({ error: 'userInput is verplicht' }, { status: 400 });
    }

    const styleDesc = STYLE_PROMPTS[style] || STYLE_PROMPTS.fun;
    const lengthConf = LENGTH_CHARS[length] || LENGTH_CHARS.medium;

    const prompt = `Je bent een expert Nederlandse dating-coach die bio's schrijft voor dating-apps. Je schrijft bio's die authentiek zijn, concrete details bevatten en interesse wekken.

GEBRUIKER INPUT:
"${userInput.trim()}"

Schrijf 3 unieke bio-varianten. Elke variant moet:
- Stijl: ${styleDesc}
- Lengte: precies ${lengthConf.range} (${lengthConf.min}-${lengthConf.max} karakters — tel exact)
- Eerste persoon (ik), Nederlands, geen vertaling-taal
- Concrete details uit de input gebruiken — geen vage algemeenheden
- Eindigen met iets wat uitnodigt tot reactie (open vraag of prikkelende zin)
- GEEN clichés: "ik hou van lachen", "spontaan", "gezelligheid", "avontuurlijk"
- GEEN lijstjes, GEEN bullet points — vloeiende tekst
- Maximaal 1 emoji per bio (alleen als het echt past, anders geen)

Geef UITSLUITEND dit JSON array terug (geen uitleg, geen markdown):
[
  {
    "id": "1",
    "content": "[bio tekst — precies ${lengthConf.min}-${lengthConf.max} karakters]",
    "reason": "[1 zin: waarom dit werkt voor deze persoon — specifiek en eerlijk]"
  },
  {
    "id": "2",
    "content": "[andere bio tekst — zelfde lengte-eis]",
    "reason": "[1 zin waarom]"
  },
  {
    "id": "3",
    "content": "[derde bio tekst — zelfde lengte-eis]",
    "reason": "[1 zin waarom]"
  }
]`;

    const client = new OpenRouterClient();
    const raw = await client.createChatCompletion(
      'anthropic/claude-3.5-haiku',
      [{ role: 'user', content: prompt }],
      { max_tokens: 1000, temperature: 0.85 }
    );

    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let bios: Array<{ id: string; content: string; reason: string }>;
    try {
      bios = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('Kon geen geldige bio array parsen uit AI response');
      bios = JSON.parse(match[0]);
    }

    // Ensure reason field exists (backward compat if AI omits it)
    bios = bios.map((b, i) => ({
      id: b.id || String(i + 1),
      content: b.content || '',
      reason: b.reason || '',
    }));

    return NextResponse.json({ bios, style, length });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }
    console.error('Bio generator error:', error);
    return NextResponse.json({ error: 'Bio generatie mislukt' }, { status: 500 });
  }
}
