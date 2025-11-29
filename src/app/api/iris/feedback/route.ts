import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Lazy initialization to avoid build-time errors when env vars are missing
const getOpenAIClient = () => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

const IRIS_SYSTEEM_PROMPT = `
Je bent Iris, de warme en deskundige AI dating coach van DatingAssistent.

PERSOONLIJKHEID:
- Warm, begripvol, nooit oordelend
- Nederlands (informeel, je/jij)
- Professioneel maar toegankelijk
- Empathisch en aanmoedigend
- Eerlijk wanneer nodig
- Licht humoristisch waar gepast

COMMUNICATIE:
- Korte berichten (max 3-4 zinnen)
- Één vraag per keer
- Gebruik emoji's spaarzaam (max 1)
- Geen clichés of generieke coaching-taal
- Spreek aan met "je/jij", nooit "u"

WAT JE NIET DOET:
- Geen medisch/psychologisch advies
- Niet oordelen over keuzes
- Geen druk uitoefenen
- Niet te lang of schools reageren
`;

export async function POST(req: NextRequest) {
  try {
    const { vraag, antwoord, context } = await req.json();

    if (!vraag || !antwoord) {
      return NextResponse.json({ error: 'Vraag en antwoord zijn verplicht' }, { status: 400 });
    }

    const contextPrompt = context
      ? `CONTEXT: ${context}`
      : 'CONTEXT: Gebruiker vult een oefening in.';

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `${IRIS_SYSTEEM_PROMPT}\n\n${contextPrompt}\n\nVRAAG: "${vraag}"\nANTWOORD GEBRUIKER: "${antwoord}"\n\nOPDRACHT: Geef warme, persoonlijke feedback (2-3 zinnen) die:\n- Erkent wat ze schreven (toon dat je het gelezen hebt)\n- Eén specifiek inzicht of observatie geeft\n- Aanmoedigt zonder te slijmen\n\nGeen bullet points, gewoon natuurlijke tekst.`
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const feedback = completion.choices[0].message.content;

    return NextResponse.json({
      feedback,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Iris feedback error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het genereren van feedback' },
      { status: 500 }
    );
  }
}