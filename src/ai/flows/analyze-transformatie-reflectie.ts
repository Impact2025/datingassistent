'use server';

import { chatCompletion } from '@/lib/ai-service';

export interface ReflectieFeedbackInput {
  moduleTitle: string;
  lessonTitle: string;
  phase: 'DESIGN' | 'ACTION' | 'SURRENDER';
  reflectieType: 'spiegel' | 'identiteit' | 'actie';
  question: string;
  answer: string;
}

export interface ReflectieFeedbackOutput {
  feedback: string;
}

const PHASE_CONTEXT: Record<string, string> = {
  DESIGN: 'zelfkennis en bewustwording (wie ben ik als dater?)',
  ACTION: 'actie en toepassing in de echte wereld (wat doe ik?)',
  SURRENDER: 'relatieopbouw en integratie (hoe laat ik liefde toe?)',
};

const TYPE_GUIDANCE: Record<string, string> = {
  spiegel: 'patroonherkenning — reflecteer op wat de gebruiker ziet over zichzelf, benoem een concreet patroon of stel een verdiepende vraag',
  identiteit: 'groeirichting — reageer op wie de gebruiker wil worden, bied een uitdagende maar liefdevolle spiegel',
  actie: 'concrete toepassing — geef korte, specifieke aanmoediging of een scherpere formulering van de stap die ze gaan zetten',
};

export async function analyzeTransformatieReflectie(
  input: ReflectieFeedbackInput
): Promise<ReflectieFeedbackOutput> {
  const systemPrompt = `Je bent een warme maar scherpe dating coach van DatingAssistent.
Je geeft feedback op reflectie-antwoorden van gebruikers die het 90-dagen Transformatie programma volgen.

Jouw coaching-stijl:
- Warm en eerlijk — geen loze complimenten, maar ook geen kritiek
- Benoem één concreet patroon of inzicht dat jij ziet in het antwoord
- Stel eventueel één vervolgvraag die dieper gaat
- Schrijf in het Nederlands, in de jij/je-vorm
- Maximaal 3 zinnen — bondig en krachtig
- Nooit beginnen met "Goed dat je..." of "Wat mooi dat..."`;

  const userPrompt = `Module: "${input.moduleTitle}" (les: "${input.lessonTitle}")
Fase: ${input.phase} — gericht op ${PHASE_CONTEXT[input.phase]}
Type reflectie: ${input.reflectieType} — ${TYPE_GUIDANCE[input.reflectieType]}

Vraag: "${input.question}"
Antwoord van de gebruiker: "${input.answer}"

Geef je coaching-feedback:`;

  const response = await chatCompletion(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    { provider: 'openrouter', maxTokens: 200, temperature: 0.75 }
  );

  return { feedback: response.trim() };
}
