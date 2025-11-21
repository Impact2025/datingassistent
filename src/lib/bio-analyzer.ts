// ============================================
// BIO ANALYZER - Core Analysis Logic
// ============================================
// Real-time bio analysis with 6 health metrics
// ============================================

export interface BioAnalysisResult {
  overallScore: number; // 0-100
  metrics: {
    specificity: MetricResult;
    clicheDetection: MetricResult;
    lengthOptimization: MetricResult;
    conversationHooks: MetricResult;
    tone: MetricResult;
    authenticity: MetricResult;
  };
  suggestions: Suggestion[];
  highlightedIssues: HighlightedIssue[];
  improvementPotential: number; // How much score can improve
}

export interface MetricResult {
  score: number; // 0-10
  status: 'excellent' | 'good' | 'needs_improvement' | 'poor';
  description: string;
  issues: Issue[];
  examples?: {
    bad: string;
    good: string;
  };
}

export interface Issue {
  text: string;
  suggestion: string;
  severity: 'low' | 'medium' | 'high';
  position?: {start: number; end: number};
}

export interface Suggestion {
  type: string;
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  exampleBefore?: string;
  exampleAfter?: string;
}

export interface HighlightedIssue {
  text: string;
  type: 'cliche' | 'vague' | 'negative' | 'generic';
  position: {start: number; end: number};
  tooltip: string;
  alternative?: string;
}

// ============================================
// COMMON CLICHÉS DATABASE
// ============================================

interface ClichePattern {
  pattern: RegExp;
  type: string;
  alternative: string;
  severity: 'high' | 'medium' | 'low';
  usagePercentage: number; // % of profiles using this
}

const COMMON_CLICHES: ClichePattern[] = [
  {
    pattern: /\b(hou van|love) (traveling|reizen)\b/gi,
    type: 'travel',
    alternative: 'Vertel over een specifieke reis of ervaring',
    severity: 'high',
    usagePercentage: 67
  },
  {
    pattern: /\b(lekker|goed) eten\b/gi,
    type: 'food',
    alternative: 'Noem een specifieke keuken of gerecht',
    severity: 'high',
    usagePercentage: 73
  },
  {
    pattern: /\b(spontaan|spontaneous)\b/gi,
    type: 'personality',
    alternative: 'Geef een voorbeeld van spontane actie',
    severity: 'high',
    usagePercentage: 54
  },
  {
    pattern: /\b(avontuurlijk|adventurous)\b/gi,
    type: 'personality',
    alternative: 'Beschrijf een concreet avontuur',
    severity: 'high',
    usagePercentage: 48
  },
  {
    pattern: /werk hard.*(play|speel) harder/gi,
    type: 'lifestyle',
    alternative: 'Te cliché - verwijder of vervang door specifiek gedrag',
    severity: 'high',
    usagePercentage: 31
  },
  {
    pattern: /\b(positief ingesteld|positive mindset)\b/gi,
    type: 'personality',
    alternative: 'Toon dit door verhaal, niet door te zeggen',
    severity: 'medium',
    usagePercentage: 42
  },
  {
    pattern: /\b(family.?oriented|familie.?mens)\b/gi,
    type: 'values',
    alternative: 'Beschrijf HOE je dit toont (bijv. zondagse oma-calls)',
    severity: 'medium',
    usagePercentage: 38
  },
  {
    pattern: /\b(fitness|sport)\b(?!.*\w)/gi, // "fitness" or "sport" without details
    type: 'hobby',
    alternative: 'Welke sport? Hoe vaak? Waarom?',
    severity: 'medium',
    usagePercentage: 61
  },
  {
    pattern: /\bnetflix\b/gi,
    type: 'hobby',
    alternative: 'Noem een specifieke serie of genre',
    severity: 'low',
    usagePercentage: 44
  },
  {
    pattern: /\b(laid.?back|relaxed|rustig)\b/gi,
    type: 'personality',
    alternative: 'Beschrijf hoe dit eruitziet in gedrag',
    severity: 'medium',
    usagePercentage: 35
  },
  {
    pattern: /\b(looking for|op zoek naar) (the one|de ware|my soulmate|mijn zielsverwant)\b/gi,
    type: 'seeking',
    alternative: 'Te zwaar - vertel wat je zoekt in gedrag/waarden',
    severity: 'high',
    usagePercentage: 29
  },
  {
    pattern: /\bno drama\b/gi,
    type: 'negative',
    alternative: 'Negatief framen - vertel wat je WEL wilt',
    severity: 'high',
    usagePercentage: 18
  },
  {
    pattern: /\b(just ask|vraag maar)\b/gi,
    type: 'lazy',
    alternative: 'Te weinig informatie - vertel nu iets interessants',
    severity: 'high',
    usagePercentage: 22
  },
  {
    pattern: /\b(liefhebber|lover) van (muziek|music)\b/gi,
    type: 'hobby',
    alternative: 'Noem een genre, artiest of wat je doet met muziek',
    severity: 'medium',
    usagePercentage: 39
  },
  {
    pattern: /\b(hond|kat|dog|cat) (?:lover|liefhebber)\b/gi,
    type: 'pet',
    alternative: 'Vertel over JE huisdier specifiek',
    severity: 'low',
    usagePercentage: 41
  }
];

// ============================================
// VAGUE TERMS
// ============================================

const VAGUE_TERMS = [
  /\b(dingen|things)\b/gi,
  /\b(veel|often)\b/gi,
  /\b(soms|sometimes)\b/gi,
  /\b(meestal|usually)\b/gi,
  /\b(leuk|nice|fun)\b/gi,
  /\b(mooi|beautiful)\b/gi,
  /\b(fijn|good)\b/gi,
  /\b(aardig|kind)\b/gi,
];

// ============================================
// SPECIFIC MARKERS (positive indicators)
// ============================================

const SPECIFIC_MARKERS = [
  /\b(laatst|recent|vorige week|last week|gisteren|yesterday)\b/gi, // Time markers
  /\b[A-Z][a-z]{2,}/g, // Proper nouns (capitalized words)
  /\b\d+\b/g, // Numbers
  /\"[^\"]+\"/g, // Quoted text
  /\b(probeer|leerde|ontdekte|verzamel|creëer|try|learned|discovered|collect|create)\b/gi, // Specific verbs
];

// ============================================
// MAIN ANALYSIS FUNCTION
// ============================================

export function analyzeBio(bioText: string): BioAnalysisResult {
  if (!bioText || bioText.trim().length === 0) {
    return getEmptyAnalysis();
  }

  const metrics = {
    specificity: analyzeSpecificity(bioText),
    clicheDetection: analyzeCliches(bioText),
    lengthOptimization: analyzeLength(bioText),
    conversationHooks: analyzeConversationHooks(bioText),
    tone: analyzeTone(bioText),
    authenticity: analyzeAuthenticity(bioText)
  };

  const overallScore = calculateOverallScore(metrics);
  const suggestions = generateSuggestions(metrics, bioText);
  const highlightedIssues = highlightIssues(bioText, metrics);
  const improvementPotential = 100 - overallScore;

  return {
    overallScore,
    metrics,
    suggestions,
    highlightedIssues,
    improvementPotential
  };
}

// ============================================
// METRIC ANALYZERS
// ============================================

function analyzeSpecificity(text: string): MetricResult {
  let specificCount = 0;
  let vagueCount = 0;

  // Count specific markers
  SPECIFIC_MARKERS.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) specificCount += matches.length;
  });

  // Count vague terms
  VAGUE_TERMS.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) vagueCount += matches.length;
  });

  const ratio = specificCount / Math.max(1, vagueCount + specificCount);
  const score = Math.min(10, Math.round(ratio * 15));

  const issues: Issue[] = [];
  if (vagueCount > specificCount) {
    issues.push({
      text: `${vagueCount} vage termen gevonden`,
      suggestion: 'Vervang algemene woorden door concrete voorbeelden',
      severity: 'medium'
    });
  }

  return {
    score,
    status: score >= 8 ? 'excellent' : score >= 6 ? 'good' : score >= 4 ? 'needs_improvement' : 'poor',
    description: score >= 7
      ? `Goed! Je gebruikt ${specificCount} specifieke details.`
      : `Je bio bevat te veel vage termen (${vagueCount}). Voeg meer concrete voorbeelden toe.`,
    issues,
    examples: {
      bad: 'Ik hou van muziek en ga vaak naar concerten',
      good: 'Vorige week naar Stromae in de Ziggo Dome - front row schreeuwen blijft magisch'
    }
  };
}

function analyzeCliches(text: string): MetricResult {
  const foundCliches: Issue[] = [];
  const highlightPositions: Array<{start: number; end: number; cliche: ClichePattern}> = [];

  COMMON_CLICHES.forEach(cliche => {
    let match;
    const regex = new RegExp(cliche.pattern.source, cliche.pattern.flags);

    while ((match = regex.exec(text)) !== null) {
      foundCliches.push({
        text: `"${match[0]}" (gebruikt door ${cliche.usagePercentage}% van profielen)`,
        suggestion: cliche.alternative,
        severity: cliche.severity
      });

      highlightPositions.push({
        start: match.index,
        end: match.index + match[0].length,
        cliche
      });
    }
  });

  const score = Math.max(0, 10 - (foundCliches.length * 2.5));
  const status = score >= 8 ? 'excellent' : score >= 6 ? 'good' : score >= 4 ? 'needs_improvement' : 'poor';

  return {
    score,
    status,
    description: foundCliches.length === 0
      ? 'Geen clichés gevonden! Je bio is uniek.'
      : `${foundCliches.length} cliché(s) die je bio generiek maken.`,
    issues: foundCliches,
    examples: {
      bad: 'Ik hou van reizen en nieuwe culturen ontdekken',
      good: 'Laatst verdwaald in Marrakech - best mistake ever'
    }
  };
}

function analyzeLength(text: string): MetricResult {
  const length = text.trim().length;
  const wordCount = text.trim().split(/\s+/).length;
  const idealMin = 120;
  const idealMax = 280;

  let score = 10;
  let status: MetricResult['status'] = 'excellent';
  let description = '';
  const issues: Issue[] = [];

  if (length < idealMin) {
    score = Math.max(3, Math.round((length / idealMin) * 10));
    status = 'needs_improvement';
    description = `Te kort (${length} karakters). Ideaal is ${idealMin}-${idealMax}.`;
    issues.push({
      text: 'Bio is te kort',
      suggestion: `Voeg nog ${idealMin - length} karakters toe met concrete details`,
      severity: 'high'
    });
  } else if (length > idealMax) {
    const excess = length - idealMax;
    score = Math.max(5, 10 - Math.round(excess / 50));
    status = excess > 100 ? 'needs_improvement' : 'good';
    description = `Een beetje lang (${length} karakters). Probeer te verkorten naar ${idealMin}-${idealMax}.`;
    issues.push({
      text: 'Bio is te lang',
      suggestion: `Verwijder ${excess} karakters - houd het puntig`,
      severity: excess > 100 ? 'medium' : 'low'
    });
  } else {
    description = `Perfecte lengte! (${length} karakters, ~${Math.round(length / 5)} seconden leestijd)`;
  }

  return {
    score,
    status,
    description,
    issues,
    examples: {
      bad: 'Hoi',
      good: 'Bio tussen 120-280 karakters met concrete details en persoonlijkheid'
    }
  };
}

function analyzeConversationHooks(text: string): MetricResult {
  let hookCount = 0;
  const issues: Issue[] = [];

  // Check for questions
  const questions = text.match(/\?/g);
  if (questions) hookCount += questions.length;

  // Check for open loops (mentions without closure)
  const openLoops = text.match(/\b(laatst|recent|probeer|aan het leren|working on)\b/gi);
  if (openLoops) hookCount += openLoops.length * 0.5;

  // Check for niche interests (specific enough to spark conversation)
  const nicheMarkers = text.match(/\b(verzamel|collector|obsessed with|fanaat van)\b/gi);
  if (nicheMarkers) hookCount += nicheMarkers.length;

  // Check for ending with invitation
  const hasInvitation = /\b(vertel|tell me|what about you|jij\?|you\?)\b/gi.test(text);
  if (hasInvitation) hookCount += 1;

  const score = Math.min(10, Math.round(hookCount * 2.5));
  const status = score >= 7 ? 'excellent' : score >= 5 ? 'good' : score >= 3 ? 'needs_improvement' : 'poor';

  if (hookCount < 2) {
    issues.push({
      text: 'Weinig conversation starters',
      suggestion: 'Voeg een vraag of niche interesse toe aan het einde',
      severity: 'high'
    });
  }

  if (!hasInvitation) {
    issues.push({
      text: 'Geen uitnodiging tot gesprek',
      suggestion: 'Eindig met een vraag of "vertel me over..."',
      severity: 'medium'
    });
  }

  return {
    score,
    status,
    description: `${Math.floor(hookCount)} conversation hooks gevonden.`,
    issues,
    examples: {
      bad: 'Ik hou van films en muziek.',
      good: 'Ik probeer elke week een film uit een ander land te kijken. Deze week: Koreaanse thriller. Aanbevelingen?'
    }
  };
}

function analyzeTone(text: string): MetricResult {
  let positiveCount = 0;
  let negativeCount = 0;

  // Positive markers
  const positivePatterns = [
    /\b(love|hou van|enjoy|geniet|leuk|fijn|mooi|geweldig|fantastisch)\b/gi,
    /\b(gelukkig|blij|happy|excited|enthousiast)\b/gi,
    /\!/g // Exclamation marks (in moderation)
  ];

  positivePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) positiveCount += matches.length;
  });

  // Negative markers
  const negativePatterns = [
    /\b(no drama|geen drama|not into|niet van|hate|haat)\b/gi,
    /\b(boring|saai|stupid|dom|annoying|irritant)\b/gi,
    /\b(ex|exes|ex.?vriendin|ex.?boyfriend)\b/gi
  ];

  negativePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) negativeCount += matches.length;
  });

  const issues: Issue[] = [];
  if (negativeCount > 0) {
    issues.push({
      text: `${negativeCount} negatieve term(en) gevonden`,
      suggestion: 'Verwijder negativiteit - focus op wat je WEL wilt',
      severity: 'high'
    });
  }

  const ratio = positiveCount / Math.max(1, positiveCount + negativeCount);
  const score = negativeCount > 0
    ? Math.max(3, 10 - (negativeCount * 3))
    : Math.min(10, Math.round(ratio * 10) + 5);

  return {
    score,
    status: score >= 8 ? 'excellent' : score >= 6 ? 'good' : score >= 4 ? 'needs_improvement' : 'poor',
    description: negativeCount > 0
      ? `Te negatief (${negativeCount} negatieve termen). Herformuleer positief.`
      : `Goede toon! ${positiveCount > 0 ? 'Positief en uitnodigend.' : 'Neutraal en authentiek.'}`,
    issues,
    examples: {
      bad: 'Geen drama please, mijn ex was crazy',
      good: 'Op zoek naar iemand die communicatie waardeert en open staat voor groei'
    }
  };
}

function analyzeAuthenticity(text: string): MetricResult {
  let authenticityScore = 5; // Start neutral

  // Check for "I" statements (shows ownership)
  const iStatements = text.match(/\b(ik|i|mijn|my)\b/gi);
  if (iStatements && iStatements.length >= 3) {
    authenticityScore += 2;
  }

  // Check for behavioral examples (not just labels)
  const behavioralPatterns = [
    /\b(ik ben (het type|die persoon|degene) die)\b/gi,
    /\b(laatst|vorige week|gisteren)\b/gi,
    /\b(altijd|vaak|meestal) \w+ ik\b/gi
  ];

  behavioralPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) authenticityScore += matches.length * 0.5;
  });

  // Penalize for copy-paste generic phrases
  const genericPhrases = [
    /partner in crime/gi,
    /better half/gi,
    /second half/gi,
    /other half/gi
  ];

  genericPhrases.forEach(pattern => {
    if (pattern.test(text)) authenticityScore -= 2;
  });

  const score = Math.min(10, Math.max(0, Math.round(authenticityScore)));
  const issues: Issue[] = [];

  if (!iStatements || iStatements.length < 2) {
    issues.push({
      text: 'Weinig persoonlijke ownership',
      suggestion: 'Gebruik "ik" statements om het persoonlijker te maken',
      severity: 'medium'
    });
  }

  return {
    score,
    status: score >= 8 ? 'excellent' : score >= 6 ? 'good' : score >= 4 ? 'needs_improvement' : 'poor',
    description: score >= 7
      ? 'Je bio voelt authentiek en persoonlijk'
      : 'Maak het persoonlijker door specifieke voorbeelden van JOU te delen',
    issues,
    examples: {
      bad: 'Ik ben spontaan en avontuurlijk',
      good: 'Laatst besloot ik op donderdag om vrijdag naar Berlijn te gaan. Geen hotel, geen plan - beste weekend ooit.'
    }
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateOverallScore(metrics: BioAnalysisResult['metrics']): number {
  const weights = {
    specificity: 0.20,
    clicheDetection: 0.25,
    lengthOptimization: 0.15,
    conversationHooks: 0.20,
    tone: 0.10,
    authenticity: 0.10
  };

  let weightedSum = 0;
  Object.entries(metrics).forEach(([key, metric]) => {
    const weight = weights[key as keyof typeof weights];
    weightedSum += (metric.score / 10) * weight;
  });

  return Math.round(weightedSum * 100);
}

function generateSuggestions(
  metrics: BioAnalysisResult['metrics'],
  bioText: string
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // Get all issues sorted by severity
  const allIssues: Array<{metric: string; issue: Issue}> = [];

  Object.entries(metrics).forEach(([metricName, metric]) => {
    metric.issues.forEach(issue => {
      allIssues.push({metric: metricName, issue});
    });
  });

  // Sort by severity
  const severityOrder = {high: 3, medium: 2, low: 1};
  allIssues.sort((a, b) =>
    severityOrder[b.issue.severity] - severityOrder[a.issue.severity]
  );

  // Convert top issues to suggestions
  allIssues.slice(0, 5).forEach(({metric, issue}) => {
    suggestions.push({
      type: metric,
      priority: issue.severity,
      title: issue.text,
      description: issue.suggestion,
      exampleBefore: metrics[metric as keyof typeof metrics].examples?.bad,
      exampleAfter: metrics[metric as keyof typeof metrics].examples?.good
    });
  });

  return suggestions;
}

function highlightIssues(
  bioText: string,
  metrics: BioAnalysisResult['metrics']
): HighlightedIssue[] {
  const highlighted: HighlightedIssue[] = [];

  // Highlight clichés
  COMMON_CLICHES.forEach(cliche => {
    let match;
    const regex = new RegExp(cliche.pattern.source, cliche.pattern.flags);

    while ((match = regex.exec(bioText)) !== null) {
      highlighted.push({
        text: match[0],
        type: 'cliche',
        position: {start: match.index, end: match.index + match[0].length},
        tooltip: `Cliché (${cliche.usagePercentage}% van profielen gebruikt dit)`,
        alternative: cliche.alternative
      });
    }
  });

  // Highlight vague terms
  VAGUE_TERMS.forEach(pattern => {
    let match;
    while ((match = pattern.exec(bioText)) !== null) {
      highlighted.push({
        text: match[0],
        type: 'vague',
        position: {start: match.index, end: match.index + match[0].length},
        tooltip: 'Vaag - wees specifieker',
        alternative: 'Vervang door concreet voorbeeld'
      });
    }
  });

  return highlighted;
}

function getEmptyAnalysis(): BioAnalysisResult {
  return {
    overallScore: 0,
    metrics: {
      specificity: {score: 0, status: 'poor', description: 'Geen tekst om te analyseren', issues: []},
      clicheDetection: {score: 0, status: 'poor', description: 'Geen tekst om te analyseren', issues: []},
      lengthOptimization: {score: 0, status: 'poor', description: 'Geen tekst om te analyseren', issues: []},
      conversationHooks: {score: 0, status: 'poor', description: 'Geen tekst om te analyseren', issues: []},
      tone: {score: 0, status: 'poor', description: 'Geen tekst om te analyseren', issues: []},
      authenticity: {score: 0, status: 'poor', description: 'Geen tekst om te analyseren', issues: []}
    },
    suggestions: [],
    highlightedIssues: [],
    improvementPotential: 100
  };
}

// ============================================
// EXPORT
// ============================================

export {
  COMMON_CLICHES,
  VAGUE_TERMS,
  SPECIFIC_MARKERS
};
