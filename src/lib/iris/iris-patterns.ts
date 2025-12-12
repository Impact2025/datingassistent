/**
 * Iris Pattern Detection Engine
 *
 * Detecteert patronen in gebruiker reflecties over tijd:
 * - Growth: Positievere taal, meer zelfvertrouwen
 * - Recurring Themes: Angsten/triggers die vaak terugkomen
 * - Breakthrough: Grote shifts in toon en inzicht
 * - Stagnation: Repetitieve antwoorden zonder groei
 *
 * Dit is het brein achter Iris' memory - waardoor ze deelnemers
 * echt leert kennen en groei kan vieren.
 */

export type PatternType = 'growth' | 'recurring_theme' | 'breakthrough' | 'stagnation';

export interface Pattern {
  type: PatternType;
  insight: string;
  relatedDays: number[];
  confidenceScore: number; // 0-1
  quotes?: string[]; // Relevante quotes uit reflecties
  keywords?: string[]; // Gedetecteerde keywords
}

export interface ReflectionData {
  day_number: number;
  question_type: string; // 'spiegel', 'identiteit', 'actie'
  answer: string;
  created_at: string;
}

// Sentiment keywords voor pattern detection
const POSITIVE_KEYWORDS = [
  'blij', 'gelukkig', 'trots', 'zelfverzekerd', 'sterk', 'goed', 'beter',
  'snap', 'begrijp', 'duidelijk', 'kan', 'durf', 'wil', 'ga',
  'vooruitgang', 'groei', 'leren', 'ontwikkelen', 'verbeteren',
  'succesvol', 'gelukt', 'bereikt', 'gedaan', 'voltooid'
];

const NEGATIVE_KEYWORDS = [
  'bang', 'angst', 'onzeker', 'twijfel', 'moeilijk', 'lastig', 'zwaar',
  'niet', 'geen', 'nooit', 'kan niet', 'durf niet', 'weet niet',
  'falen', 'mislukken', 'afwijzing', 'alleen', 'eenzaam',
  'hopeloos', 'verloren', 'vastgelopen', 'gestopt'
];

const FEAR_KEYWORDS = [
  'angst', 'bang', 'afwijzing', 'alleen', 'niet goed genoeg',
  'falen', 'beoordeel', 'kritiek', 'verlaten', 'eenzaam',
  'pijn', 'gekwetst', 'teleurstellen', 'niet interessant'
];

const CONFIDENCE_KEYWORDS = [
  'zelfverzekerd', 'durf', 'kan', 'sterk', 'trots', 'goed genoeg',
  'waardevol', 'aantrekkelijk', 'interessant', 'uniek', 'speciaal',
  'capabel', 'in staat', 'vertrouwen'
];

const BREAKTHROUGH_PHRASES = [
  'nu snap ik', 'plotseling duidelijk', 'aha moment', 'dit helpt',
  'ineens zie ik', 'nu begrijp ik', 'dit verandert', 'eye opener',
  'voor het eerst', 'nooit eerder', 'nu realiseer ik'
];

/**
 * Detecteer sentiment in een tekst (simple keyword-based)
 */
function detectSentiment(text: string): number {
  const lowerText = text.toLowerCase();
  let score = 0;

  // Count positive keywords
  POSITIVE_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) score += matches.length;
  });

  // Count negative keywords (subtract)
  NEGATIVE_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) score -= matches.length;
  });

  // Normalize to -1 to 1
  return Math.max(-1, Math.min(1, score / 10));
}

/**
 * Detecteer specifieke keywords in tekst
 */
function detectKeywords(text: string, keywords: string[]): string[] {
  const lowerText = text.toLowerCase();
  return keywords.filter(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    return regex.test(lowerText);
  });
}

/**
 * Check of tekst breakthrough phrases bevat
 */
function hasBreakthroughPhrase(text: string): boolean {
  const lowerText = text.toLowerCase();
  return BREAKTHROUGH_PHRASES.some(phrase => lowerText.includes(phrase));
}

/**
 * Detecteer GROWTH patroon
 * Kijkt naar sentiment verbetering over tijd
 */
function detectGrowth(reflections: ReflectionData[]): Pattern | null {
  if (reflections.length < 3) return null;

  const sentiments = reflections.map(r => ({
    day: r.day_number,
    sentiment: detectSentiment(r.answer),
    answer: r.answer
  }));

  // Check trend: zijn recente reflecties positiever dan vroege?
  const early = sentiments.slice(0, Math.ceil(sentiments.length / 2));
  const recent = sentiments.slice(-Math.ceil(sentiments.length / 2));

  const earlyAvg = early.reduce((sum, s) => sum + s.sentiment, 0) / early.length;
  const recentAvg = recent.reduce((sum, s) => sum + s.sentiment, 0) / recent.length;

  const improvement = recentAvg - earlyAvg;

  // Als er significant positieve trend is (>0.3)
  if (improvement > 0.3) {
    // Find best quote showing growth
    const bestRecent = recent.sort((a, b) => b.sentiment - a.sentiment)[0];
    const worstEarly = early.sort((a, b) => a.sentiment - b.sentiment)[0];

    return {
      type: 'growth',
      insight: `Je taal wordt positiever. Op dag ${worstEarly.day} gebruikte je meer twijfelende woorden, nu (dag ${bestRecent.day}) zie ik veel meer zelfvertrouwen. Dit is echte groei!`,
      relatedDays: [worstEarly.day, bestRecent.day],
      confidenceScore: Math.min(0.9, 0.5 + improvement),
      quotes: [
        `Dag ${worstEarly.day}: "${worstEarly.answer.slice(0, 100)}..."`,
        `Dag ${bestRecent.day}: "${bestRecent.answer.slice(0, 100)}..."`
      ]
    };
  }

  return null;
}

/**
 * Detecteer RECURRING THEME patroon
 * Kijkt naar keywords die 3+ keer voorkomen
 */
function detectRecurringTheme(reflections: ReflectionData[]): Pattern | null {
  if (reflections.length < 3) return null;

  // Detect recurring fears
  const fearOccurrences: Record<string, { count: number; days: number[]; quotes: string[] }> = {};

  reflections.forEach(r => {
    const fears = detectKeywords(r.answer, FEAR_KEYWORDS);
    fears.forEach(fear => {
      if (!fearOccurrences[fear]) {
        fearOccurrences[fear] = { count: 0, days: [], quotes: [] };
      }
      fearOccurrences[fear].count++;
      fearOccurrences[fear].days.push(r.day_number);
      fearOccurrences[fear].quotes.push(r.answer.slice(0, 80));
    });
  });

  // Find most recurring fear (3+ times)
  const recurring = Object.entries(fearOccurrences)
    .filter(([_, data]) => data.count >= 3)
    .sort((a, b) => b[1].count - a[1].count)[0];

  if (recurring) {
    const [keyword, data] = recurring;
    return {
      type: 'recurring_theme',
      insight: `Dit is de ${data.count}e keer dat '${keyword}' terugkomt in je reflecties. Dit patroon is belangrijk - het wijst op een diepere angst die aandacht nodig heeft. Laten we dit samen doorbreken.`,
      relatedDays: data.days,
      confidenceScore: Math.min(0.95, 0.6 + (data.count * 0.1)),
      quotes: data.quotes.slice(0, 3).map((q, i) => `Dag ${data.days[i]}: "${q}..."`),
      keywords: [keyword]
    };
  }

  return null;
}

/**
 * Detecteer BREAKTHROUGH patroon
 * Grote shift in toon + breakthrough phrases
 */
function detectBreakthrough(reflections: ReflectionData[]): Pattern | null {
  if (reflections.length < 2) return null;

  // Check laatste 3 reflecties voor breakthrough
  const recent = reflections.slice(-3);

  for (const reflection of recent) {
    const hasPhrase = hasBreakthroughPhrase(reflection.answer);
    const sentiment = detectSentiment(reflection.answer);
    const confidenceWords = detectKeywords(reflection.answer, CONFIDENCE_KEYWORDS);

    // Breakthrough = phrase + positive sentiment + confidence
    if (hasPhrase && sentiment > 0.3 && confidenceWords.length > 0) {
      return {
        type: 'breakthrough',
        insight: `Wow! Op dag ${reflection.day_number} gebeurde er iets. Je schreef: "${reflection.answer.slice(0, 120)}..." - dit voelt als een doorbraak moment! Voel je dit ook?`,
        relatedDays: [reflection.day_number],
        confidenceScore: 0.85,
        quotes: [`"${reflection.answer}"`],
        keywords: confidenceWords
      };
    }
  }

  return null;
}

/**
 * Detecteer STAGNATION patroon
 * Repetitieve antwoorden, lage engagement
 */
function detectStagnation(reflections: ReflectionData[]): Pattern | null {
  if (reflections.length < 4) return null;

  const recent = reflections.slice(-4);

  // Check for very short answers (< 20 chars)
  const shortAnswers = recent.filter(r => r.answer.length < 20);
  if (shortAnswers.length >= 3) {
    return {
      type: 'stagnation',
      insight: `Je laatste reflecties zijn kort. Misschien zit je vast? Laten we een nieuwe invalshoek proberen. Wat zou je helpen om weer scherp te worden?`,
      relatedDays: recent.map(r => r.day_number),
      confidenceScore: 0.7,
      quotes: recent.map(r => `Dag ${r.day_number}: "${r.answer}"`)
    };
  }

  // Check for very similar answers
  const answers = recent.map(r => r.answer.toLowerCase());
  let similarityCount = 0;
  for (let i = 0; i < answers.length - 1; i++) {
    const similarity = calculateSimilarity(answers[i], answers[i + 1]);
    if (similarity > 0.7) similarityCount++;
  }

  if (similarityCount >= 2) {
    return {
      type: 'stagnation',
      insight: `Je laatste reflecties lijken op elkaar. Dit kan betekenen dat je een plateau hebt bereikt. Tijd voor een nieuwe challenge of perspectief!`,
      relatedDays: recent.map(r => r.day_number),
      confidenceScore: 0.65
    };
  }

  return null;
}

/**
 * Simple text similarity (Jaccard index)
 */
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.split(/\s+/));
  const words2 = new Set(text2.split(/\s+/));

  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Main pattern detection functie
 * Analyseert alle reflecties en returnt top patterns
 */
export async function detectPatterns(
  reflections: ReflectionData[]
): Promise<Pattern[]> {
  if (reflections.length === 0) return [];

  const patterns: Pattern[] = [];

  // Detect all pattern types
  const growth = detectGrowth(reflections);
  if (growth) patterns.push(growth);

  const recurring = detectRecurringTheme(reflections);
  if (recurring) patterns.push(recurring);

  const breakthrough = detectBreakthrough(reflections);
  if (breakthrough) patterns.push(breakthrough);

  const stagnation = detectStagnation(reflections);
  if (stagnation) patterns.push(stagnation);

  // Sort by confidence score (highest first)
  patterns.sort((a, b) => b.confidenceScore - a.confidenceScore);

  // Return top 2 patterns
  return patterns.slice(0, 2);
}

/**
 * Format pattern voor display in UI
 */
export function formatPatternForDisplay(pattern: Pattern): {
  emoji: string;
  title: string;
  message: string;
  color: string;
} {
  switch (pattern.type) {
    case 'growth':
      return {
        emoji: '🚀',
        title: 'Ik zie groei!',
        message: pattern.insight,
        color: 'green'
      };
    case 'recurring_theme':
      return {
        emoji: '🔄',
        title: 'Terugkerend patroon',
        message: pattern.insight,
        color: 'orange'
      };
    case 'breakthrough':
      return {
        emoji: '💡',
        title: 'Doorbraak moment!',
        message: pattern.insight,
        color: 'purple'
      };
    case 'stagnation':
      return {
        emoji: '🤔',
        title: 'Tijd voor iets nieuws?',
        message: pattern.insight,
        color: 'gray'
      };
  }
}
