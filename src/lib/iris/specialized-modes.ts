// ============================================================================
// IRIS SPECIALIZED COACHING MODES
//
// 🚀 WERELDKLASSE: Context-aware coaching modes voor specifieke situaties
// Elk mode heeft een aangepaste prompt en coaching style
// ============================================================================

import type { UserAIContext } from '../ai-context-manager';

export type CoachingMode =
  | 'general'           // Algemeen advies
  | 'profile-review'    // Profile feedback
  | 'match-analysis'    // Match compatibility
  | 'date-prep'         // Date voorbereiding
  | 'text-review'       // Bericht review
  | 'conversation'      // Gesprek analyse
  | 'relationship'      // Relatie advies
  | 'breakup-support';  // Breakup support

export interface ModeConfig {
  mode: CoachingMode;
  specialInstructions: string;
  focusAreas: string[];
  tone: 'warm' | 'direct' | 'empathetic' | 'analytical';
}

/**
 * 🎯 Bouw gespecialiseerde prompt voor een specifieke coaching mode
 */
export function buildModePrompt(
  mode: CoachingMode,
  context: UserAIContext | null,
  additionalContext?: string
): string {
  const modeConfig = getModeConfig(mode);
  const parts: string[] = [];

  // Mode-specific instructies
  parts.push(`🎯 COACHING MODE: ${mode.toUpperCase()}`);
  parts.push(`\n${modeConfig.specialInstructions}\n`);

  // Focus areas
  if (modeConfig.focusAreas.length > 0) {
    parts.push(`FOCUS OP:\n${modeConfig.focusAreas.map(area => `- ${area}`).join('\n')}\n`);
  }

  // Tone aanpassing
  parts.push(getToneInstructions(modeConfig.tone));

  // Context-specific aanpassingen
  if (context) {
    parts.push(buildContextualGuidance(mode, context));
  }

  // Additional context (bijv. profile text, match info)
  if (additionalContext) {
    parts.push(`\nADDITIONELE CONTEXT:\n${additionalContext}\n`);
  }

  return parts.join('\n');
}

/**
 * 📋 Haal mode configuratie op
 */
function getModeConfig(mode: CoachingMode): ModeConfig {
  const configs: Record<CoachingMode, ModeConfig> = {
    general: {
      mode: 'general',
      specialInstructions: 'Geef algemeen dating advies en beantwoord vragen.',
      focusAreas: ['Luisteren', 'Praktische tips', 'Empathie'],
      tone: 'warm',
    },

    'profile-review': {
      mode: 'profile-review',
      specialInstructions: `Je bent een EXPERT in dating profiel optimalisatie.

JOUW TAAK:
- Analyseer het profiel KRITISCH maar constructief
- Geef SPECIFIEKE verbeter suggesties (niet algemeen!)
- Focus op: eerlijkheid, authenticiteit, aantrekkingskracht
- Gebruik emoji's en voorbeelden
- Geef een score van 1-10 met rationale

FORMAT:
1. Eerste indruk (1 zin)
2. Wat werkt goed (2-3 bullets)
3. Wat kan beter (2-3 bullets met concrete voorbeelden)
4. Overall score (/10) + rationale
5. Quick win tips (3 concrete acties)`,
      focusAreas: [
        'Authenticiteit vs clichés',
        'Aantrekkingskracht & intrigue',
        'Spelling & grammatica',
        'Foto kwaliteit & variatie',
        'Red flags elimineren',
      ],
      tone: 'direct',
    },

    'match-analysis': {
      mode: 'match-analysis',
      specialInstructions: `Je bent een RELATIONSHIP COMPATIBILITY EXPERT.

JOUW TAAK:
- Analyseer compatibility op basis van values, attachment, goals
- Identificeer potentiële rode vlaggen
- Geef eerlijk advies (ook als match niet ideaal is!)
- Gebruik de user's assessment data voor DIEPGAANDE analyse

FORMAT:
1. Compatibility score (/10)
2. Groene vlaggen (waarom dit zou kunnen werken)
3. Rode vlaggen (potentiële problemen)
4. Advies: doorzetten, voorzichtig zijn, of stoppen?
5. Specifieke gesprek starters gebaseerd op shared values`,
      focusAreas: [
        'Values alignment (gebruik Waarden Kompas)',
        'Attachment compatibility (gebruik Hechtingsstijl)',
        'Life vision match (gebruik Levensvisie)',
        'Red flags detection',
        'Realistic verwachtingen',
      ],
      tone: 'analytical',
    },

    'date-prep': {
      mode: 'date-prep',
      specialInstructions: `Je bent een DATE PREPARATION COACH.

JOUW TAAK:
- Help de user zich voor te bereiden op een date
- Geef PRAKTISCHE tips (niet clichés!)
- Adresseer nervositeit en anxiety (VOORAL bij anxious attachment)
- Geef gesprek starters gebaseerd op hun values

FORMAT:
1. Mindset check (hoe voel je je?)
2. Logistieke tips (locatie, timing, outfit)
3. Gesprek starters (3-5 concrete voorbeelden)
4. Do's en Don'ts specifiek voor hun hechtingsstijl
5. Exit strategie (als date niet goed gaat)
6. Motivatie & encouragement`,
      focusAreas: [
        'Anxiety management (vooral anxious attachment)',
        'Authentiek blijven',
        'Gesprek starters gebaseerd op values',
        'Boundaries stellen',
        'Red flags herkennen tijdens date',
      ],
      tone: 'warm',
    },

    'text-review': {
      mode: 'text-review',
      specialInstructions: `Je bent een MESSAGING EXPERT voor dating apps.

JOUW TAAK:
- Beoordeel of het bericht aantrekkelijk, authentiek en effectief is
- Check voor red flags: desperate, needy, boring, te lang, te kort
- Geef SPECIFIEKE herschrijf suggesties
- Pas advies aan op basis van hechtingsstijl

FORMAT:
1. Eerste indruk van het bericht
2. Score (/10) - eerlijkheid, interesse, humor, lengte
3. Wat werkt wel
4. Wat werkt niet (specifiek!)
5. Herschreven versie (2-3 alternatieven)
6. Timing advies (wanneer versturen?)`,
      focusAreas: [
        'Tone (playful, genuine, interested)',
        'Lengte (niet te lang, niet te kort)',
        'Spelling & grammatica',
        'Attachment-aware (niet needy bij anxious!)',
        'Vraag stellen (engagement)',
      ],
      tone: 'direct',
    },

    conversation: {
      mode: 'conversation',
      specialInstructions: `Je bent een CONVERSATION DYNAMICS EXPERT.

JOUW TAAK:
- Analyseer de flow van het gesprek
- Identificeer patronen (wie investeert meer?)
- Geef advies over engagement en reciprocity
- Detecteer red/green flags in communicatie stijl

FORMAT:
1. Overall vibe check (gaat het goed?)
2. Engagement analyse (wie investeert meer?)
3. Patronen (timing, lengte, enthousiasme)
4. Red flags (ghosting risk, one-sided, etc)
5. Next step advies`,
      focusAreas: [
        'Reciprocity (balanced effort)',
        'Timing patterns',
        'Enthusiasm level',
        'Red flags (breadcrumbing, ghosting signs)',
        'When to ask for date',
      ],
      tone: 'analytical',
    },

    relationship: {
      mode: 'relationship',
      specialInstructions: `Je bent een RELATIONSHIP COUNSELOR.

JOUW TAAK:
- Geef advies over lopende relaties
- Gebruik attachment theory & relationship patterns
- Wees EERLIJK (ook als relatie niet gezond is)
- Focus op communicatie, boundaries, growth

FORMAT:
1. Situatie samenvatting
2. Attachment dynamics analyse
3. Gezonde vs ongezonde patronen
4. Concrete actie stappen
5. Communication scripts (als relevant)`,
      focusAreas: [
        'Attachment dynamics (anxious-avoidant dance)',
        'Communication patterns',
        'Boundaries & respect',
        'Triggers & emotional regulation',
        'Growth vs toxicity',
      ],
      tone: 'empathetic',
    },

    'breakup-support': {
      mode: 'breakup-support',
      specialInstructions: `Je bent een BREAKUP SUPPORT COACH.

JOUW TAAK:
- Bied empathie en emotionele support
- Help met healing proces
- Voorkom rebound dating (check emotionele readiness!)
- Geef praktische next steps

TONE: Zeer warm, empathisch, geduldig

FORMAT:
1. Validatie van gevoelens
2. Healing fase identificatie
3. Praktische coping tips
4. Wanneer weer klaar voor dating? (rebound risk!)
5. Growth opportunities uit deze ervaring`,
      focusAreas: [
        'Emotionele validatie',
        'Grieving process',
        'Rebound prevention (CRUCIAAL)',
        'Self-care & healing',
        'Learning & growth',
      ],
      tone: 'empathetic',
    },
  };

  return configs[mode];
}

/**
 * 🎨 Tone instructies
 */
function getToneInstructions(tone: 'warm' | 'direct' | 'empathetic' | 'analytical'): string {
  const tones = {
    warm: `TONE: Warm en vriendelijk
- Gebruik emoticons waar passend
- Encouragement en positivity
- Persoonlijk en benaderbaar`,

    direct: `TONE: Direct en eerlijk
- Geen sugarcoating, wel respectvol
- Concrete feedback
- Actionable advies`,

    empathetic: `TONE: Empathisch en ondersteunend
- Valideer gevoelens eerst
- Luister zonder oordelen
- Wees geduldig en begripvol`,

    analytical: `TONE: Analytisch en objectief
- Data-driven insights
- Patterns identificeren
- Nuance en complexity erkennen`,
  };

  return tones[tone];
}

/**
 * 🧠 Bouw contextual guidance op basis van user's assessment data
 */
function buildContextualGuidance(mode: CoachingMode, context: UserAIContext): string {
  const guidance: string[] = [];

  // Attachment-aware guidance
  if (context.attachmentStyle) {
    if (mode === 'text-review' || mode === 'conversation') {
      if (context.attachmentStyle.primaryStyle === 'anxious') {
        guidance.push(`⚠️ ATTACHMENT ALERT: User heeft anxious attachment
- Check voor overthinking & neediness in berichten
- Moedig aan om niet te snel/veel te texten
- Help met anxiety management`);
      }

      if (context.attachmentStyle.primaryStyle === 'avoidant') {
        guidance.push(`⚠️ ATTACHMENT ALERT: User heeft avoidant attachment
- Check of ze genoeg engagement tonen
- Moedig aan om opener te zijn
- Help met vulnerability`);
      }
    }
  }

  // Rebound risk warning
  if (context.emotioneelReadiness?.reboundRisico > 60) {
    if (mode === 'match-analysis' || mode === 'date-prep' || mode === 'relationship') {
      guidance.push(`🚨 REBOUND ALERT: Rebound risico = ${context.emotioneelReadiness.reboundRisico}%
- Wees voorzichtig met enthousiasme temperen
- Check of ze dating uit juiste redenen
- Suggest healing tijd als nodig`);
    }
  }

  // Values-based guidance
  if (context.waardenKompas && mode === 'match-analysis') {
    const topValues = context.waardenKompas.coreValues.slice(0, 3).map(v => v.name).join(', ');
    guidance.push(`💎 VALUES CONTEXT: User's top waarden zijn: ${topValues}
- Check of match aligned is met deze waarden
- Gebruik values voor compatibility analyse`);

    if (context.waardenKompas.redFlags.length > 0) {
      guidance.push(`🚩 RED FLAGS CONTEXT: User's red flags: ${context.waardenKompas.redFlags.slice(0, 2).join(', ')}
- Check of match heeft deze eigenschappen
- Wees eerlijk als je red flags ziet`);
    }
  }

  return guidance.length > 0 ? `\n🧠 CONTEXT-AWARE GUIDANCE:\n${guidance.join('\n\n')}\n` : '';
}

/**
 * 🔍 Detecteer automatisch welke mode het beste past bij de vraag
 */
export function detectMode(userMessage: string): CoachingMode {
  const lowerMessage = userMessage.toLowerCase();

  // Profile review keywords
  if (
    lowerMessage.includes('profiel') ||
    lowerMessage.includes('bio') ||
    lowerMessage.includes('tekst') ||
    lowerMessage.includes('review m')
  ) {
    return 'profile-review';
  }

  // Text review keywords
  if (
    lowerMessage.includes('bericht') ||
    lowerMessage.includes('appje') ||
    lowerMessage.includes('sturen') ||
    lowerMessage.includes('wat moet ik zeggen')
  ) {
    return 'text-review';
  }

  // Match analysis keywords
  if (
    lowerMessage.includes('match') ||
    lowerMessage.includes('compatible') ||
    lowerMessage.includes('past bij me') ||
    lowerMessage.includes('wat vind je van')
  ) {
    return 'match-analysis';
  }

  // Date prep keywords
  if (
    lowerMessage.includes('date') ||
    lowerMessage.includes('afspraak') ||
    lowerMessage.includes('zenuwachtig') ||
    lowerMessage.includes('eerste keer')
  ) {
    return 'date-prep';
  }

  // Breakup support keywords
  if (
    lowerMessage.includes('uit elkaar') ||
    lowerMessage.includes('gedumpt') ||
    lowerMessage.includes('break') ||
    lowerMessage.includes('verdrietig')
  ) {
    return 'breakup-support';
  }

  // Conversation analysis keywords
  if (
    lowerMessage.includes('gesprek') ||
    lowerMessage.includes('praten') ||
    lowerMessage.includes('contact') ||
    lowerMessage.includes('reageert')
  ) {
    return 'conversation';
  }

  // Relationship keywords
  if (
    lowerMessage.includes('relatie') ||
    lowerMessage.includes('verkering') ||
    lowerMessage.includes('samen')
  ) {
    return 'relationship';
  }

  // Default
  return 'general';
}

/**
 * 🎯 Get quick action suggestions voor een mode
 */
export function getModeSuggestions(mode: CoachingMode): string[] {
  const suggestions: Record<CoachingMode, string[]> = {
    general: [
      'Hoe maak ik een goed profiel?',
      'Wat zijn goede gespreksstarters?',
      'Hoe weet ik of iemand geïnteresseerd is?',
    ],
    'profile-review': [
      'Review mijn profiel tekst',
      'Zijn mijn foto\'s goed genoeg?',
      'Hoe maak ik mijn bio interessanter?',
    ],
    'match-analysis': [
      'Past deze match bij me?',
      'Zie jij rode vlaggen?',
      'Wat zijn goede gespreksonderwerpen?',
    ],
    'date-prep': [
      'Hoe bereid ik me voor?',
      'Waar moeten we heen?',
      'Hoe kom ik over mijn zenuwen heen?',
    ],
    'text-review': [
      'Is dit een goed bericht?',
      'Hoe moet ik reageren?',
      'Wanneer moet ik dit sturen?',
    ],
    conversation: [
      'Gaat dit gesprek goed?',
      'Investeert deze persoon genoeg?',
      'Wanneer moet ik vragen om te daten?',
    ],
    relationship: [
      'Is dit gezond?',
      'Hoe los ik dit conflict op?',
      'Moet ik hierover praten?',
    ],
    'breakup-support': [
      'Hoe kom ik hieroverheen?',
      'Wanneer ben ik klaar om weer te daten?',
      'Hoe voorkom ik dit in de toekomst?',
    ],
  };

  return suggestions[mode];
}
