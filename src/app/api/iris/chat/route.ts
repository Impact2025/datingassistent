import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const { vraag, lesContext } = await req.json();

    if (!vraag) {
      return NextResponse.json({ error: 'Vraag is verplicht' }, { status: 400 });
    }

    const contextPrompt = lesContext
      ? `CONTEXT: Gebruiker is bezig met "${lesContext}" en stelt een vraag.`
      : 'CONTEXT: Algemene vraag over dating en relaties.';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `${IRIS_SYSTEEM_PROMPT}\n\n${contextPrompt}\n\nOPDRACHT: Beantwoord de vraag helpend en relevant. Max 4-5 zinnen tenzij meer nodig.`
        },
        { role: 'user', content: vraag }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const antwoord = completion.choices[0].message.content;

    return NextResponse.json({
      antwoord,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Iris chat error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het verwerken van je vraag' },
      { status: 500 }
    );
  }
}