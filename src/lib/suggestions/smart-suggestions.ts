/**
 * Smart Suggestions Engine
 * Genereer context-aware suggesties op basis van user journey, assessments, en activiteit
 */

export interface UserContext {
  userId: number;
  journeyPhase?: number; // 1-5
  completedAssessments?: string[];
  hasProfilePhoto?: boolean;
  hasProfileText?: boolean;
  lastActivity?: Date;
  goals?: string[];
  subscriptionType?: 'free' | 'premium';
}

export interface Suggestion {
  id: string;
  type: 'action' | 'tip' | 'challenge';
  priority: number; // 1-10, higher = more important
  title: string;
  description: string;
  actionText: string;
  actionHref?: string;
  actionTab?: string;
  icon: string;
  color: string;
  category: 'profiel' | 'communicatie' | 'dating' | 'groei' | 'leren';
}

/**
 * Genereer slimme dagelijkse suggesties op basis van user context
 */
export function generateDailySuggestions(context: UserContext): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // FASE 1: FUNDAMENT - Focus op zelfkennis
  if (context.journeyPhase === 1 || !context.journeyPhase) {
    // Hechtingsstijl nog niet gedaan
    if (!context.completedAssessments?.includes('hechtingsstijl')) {
      suggestions.push({
        id: 'hechtingsstijl-scan',
        type: 'action',
        priority: 10,
        title: 'Ontdek je hechtingsstijl',
        description: 'De basis van hoe jij liefhebt en verbindt. 5 min scan.',
        actionText: 'Start Hechtingsstijl Scan',
        actionHref: '/hechtingsstijl',
        icon: 'Brain',
        color: 'purple-pink',
        category: 'profiel'
      });
    }

    // Emotionele readiness check
    if (!context.completedAssessments?.includes('emotionele-readiness')) {
      suggestions.push({
        id: 'emotionele-ready',
        type: 'action',
        priority: 9,
        title: 'Ben je klaar om te daten?',
        description: 'Check je emotionele beschikbaarheid en dating preparedness',
        actionText: 'Start Ready Scan',
        actionHref: '/emotionele-readiness',
        icon: 'Sparkles',
        color: 'blue',
        category: 'profiel'
      });
    }

    // Zelfbeeld assessment
    if (!context.completedAssessments?.includes('zelfbeeld')) {
      suggestions.push({
        id: 'zelfbeeld-scan',
        type: 'action',
        priority: 8,
        title: 'Ontdek hoe je overkomt',
        description: 'AI-gedreven eerste indruk analyse',
        actionText: 'Start Zelfbeeld Scan',
        actionHref: '/profiel?tool=zelfbeeld',
        icon: 'User',
        color: 'purple',
        category: 'profiel'
      });
    }
  }

  // FASE 2: PROFIEL - Focus op profile building
  if (context.journeyPhase === 2) {
    // Geen profielfoto
    if (!context.hasProfilePhoto) {
      suggestions.push({
        id: 'upload-photo',
        type: 'action',
        priority: 10,
        title: 'Upload je eerste foto',
        description: 'Krijg AI feedback op je profielfoto',
        actionText: 'Foto Uploaden',
        actionTab: 'profiel',
        icon: 'Camera',
        color: 'indigo',
        category: 'profiel'
      });
    }

    // Geen profiel tekst
    if (!context.hasProfileText) {
      suggestions.push({
        id: 'write-bio',
        type: 'action',
        priority: 9,
        title: 'Schrijf je profiel bio',
        description: 'Laat AI je helpen met een pakkende, authentieke bio',
        actionText: 'Bio Maken',
        actionTab: 'profiel',
        icon: 'FileText',
        color: 'green',
        category: 'profiel'
      });
    }

    // Dating style scan
    if (!context.completedAssessments?.includes('dating-stijl')) {
      suggestions.push({
        id: 'dating-style',
        type: 'action',
        priority: 8,
        title: 'Ontdek je dating stijl',
        description: 'Krijg inzicht in hoe jij date en wat bij je past',
        actionText: 'Start Dating Stijl Scan',
        actionHref: '/datingstijl',
        icon: 'Heart',
        color: 'rose',
        category: 'profiel'
      });
    }
  }

  // FASE 3: COMMUNICATIE - Focus op gesprekken
  if (context.journeyPhase === 3) {
    suggestions.push({
      id: 'practice-openers',
      type: 'action',
      priority: 9,
      title: 'Oefen je openingszinnen',
      description: 'Genereer en test verschillende openers',
      actionText: 'Start Oefenen',
      actionTab: 'coach',
      icon: 'MessageCircle',
      color: 'blue',
      category: 'communicatie'
    });

    suggestions.push({
      id: 'conversation-tips',
      type: 'tip',
      priority: 7,
      title: 'Gesprekstip van de dag',
      description: 'Stel open vragen en toon oprechte interesse',
      actionText: 'Meer Tips',
      actionTab: 'coach',
      icon: 'Lightbulb',
      color: 'yellow',
      category: 'communicatie'
    });
  }

  // FASE 4: ACTIEF DATEN - Focus op dates en practice
  if (context.journeyPhase === 4) {
    suggestions.push({
      id: 'plan-date',
      type: 'action',
      priority: 10,
      title: 'Plan je volgende date',
      description: 'Krijg AI hulp bij het kiezen van de perfecte date plek',
      actionText: 'Date Plannen',
      actionTab: 'coach',
      icon: 'Calendar',
      color: 'purple',
      category: 'dating'
    });

    suggestions.push({
      id: 'date-prep',
      type: 'challenge',
      priority: 8,
      title: 'Date voorbereiding',
      description: 'Bereid je voor op je volgende date met AI coaching',
      actionText: 'Start Voorbereiding',
      actionTab: 'coach',
      icon: 'Rocket',
      color: 'orange',
      category: 'dating'
    });
  }

  // FASE 5: VERDIEPING - Focus op relatie building
  if (context.journeyPhase === 5) {
    suggestions.push({
      id: 'relationship-patterns',
      type: 'action',
      priority: 9,
      title: 'Analyseer je relatiepatronen',
      description: 'Ontdek terugkerende patronen in je relaties',
      actionText: 'Start Analyse',
      actionHref: '/relatiepatronen',
      icon: 'TrendingUp',
      color: 'teal',
      category: 'groei'
    });
  }

  // ALGEMENE SUGGESTIES (altijd relevant)

  // Daily check-in reminder (als lang niet actief)
  const daysSinceLastActivity = context.lastActivity
    ? Math.floor((Date.now() - context.lastActivity.getTime()) / (1000 * 60 * 60 * 24))
    : 7;

  if (daysSinceLastActivity > 2) {
    suggestions.push({
      id: 'iris-checkin',
      type: 'tip',
      priority: 6,
      title: 'Praat met Iris',
      description: 'Check in met je AI coach - deel hoe het gaat',
      actionText: 'Start Gesprek',
      actionTab: 'coach',
      icon: 'Sparkles',
      color: 'pink',
      category: 'groei'
    });
  }

  // Premium features (voor free users)
  if (context.subscriptionType === 'free') {
    suggestions.push({
      id: 'upgrade-premium',
      type: 'tip',
      priority: 3,
      title: 'Unlock Premium Features',
      description: 'Krijg toegang tot alle AI tools en premium coaching',
      actionText: 'Bekijk Premium',
      actionHref: '/select-package',
      icon: 'Crown',
      color: 'gold',
      category: 'groei'
    });
  }

  // Sort by priority (highest first) en return top 5
  return suggestions
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5);
}

/**
 * Genereer fase-specifieke quick actions
 */
export function getPhaseQuickActions(phase: number = 1): Array<{
  title: string;
  description: string;
  href?: string;
  tab?: string;
  icon: string;
  color: string;
}> {
  const phaseActions = {
    1: [ // FUNDAMENT
      {
        title: 'Hechtingsstijl Scan',
        description: 'Ontdek hoe jij liefhebt',
        href: '/hechtingsstijl',
        icon: 'Brain',
        color: 'purple-pink'
      },
      {
        title: 'Emotionele Ready Check',
        description: 'Ben je klaar om te daten?',
        href: '/emotionele-readiness',
        icon: 'Sparkles',
        color: 'blue'
      },
      {
        title: 'Praat met Iris',
        description: 'Je AI dating coach',
        tab: 'coach',
        icon: 'MessageCircle',
        color: 'purple'
      }
    ],
    2: [ // PROFIEL
      {
        title: 'Profiel Bouwer',
        description: 'Maak je perfecte bio',
        tab: 'profiel',
        icon: 'FileText',
        color: 'green'
      },
      {
        title: 'Foto Analyse',
        description: 'AI feedback op je foto\'s',
        tab: 'profiel',
        icon: 'Camera',
        color: 'indigo'
      },
      {
        title: 'Platform Match',
        description: 'Welke app past bij jou?',
        tab: 'profiel',
        icon: 'Target',
        color: 'teal'
      }
    ],
    3: [ // COMMUNICATIE
      {
        title: 'Gesprek Starter',
        description: 'Genereer openers',
        tab: 'coach',
        icon: 'MessageSquare',
        color: 'blue'
      },
      {
        title: 'Chat Coach',
        description: 'AI hulp bij gesprekken',
        tab: 'coach',
        icon: 'Bot',
        color: 'purple'
      },
      {
        title: 'Bio Generator',
        description: 'Pakkende profiel teksten',
        tab: 'profiel',
        icon: 'Wand',
        color: 'pink'
      }
    ],
    4: [ // ACTIEF DATEN
      {
        title: 'Date Planner',
        description: 'Plan je perfecte date',
        tab: 'coach',
        icon: 'Calendar',
        color: 'orange'
      },
      {
        title: 'Date Voorbereiding',
        description: 'Bereid je voor met AI',
        tab: 'coach',
        icon: 'Briefcase',
        color: 'purple'
      },
      {
        title: 'Reflectie Tool',
        description: 'Leer van je dates',
        tab: 'coach',
        icon: 'BookOpen',
        color: 'blue'
      }
    ],
    5: [ // VERDIEPING
      {
        title: 'Relatiepatronen',
        description: 'Analyseer je patronen',
        href: '/relatiepatronen',
        icon: 'TrendingUp',
        color: 'teal'
      },
      {
        title: 'Levensvisie',
        description: 'Waar wil jij naartoe?',
        href: '/levensvisie',
        icon: 'Compass',
        color: 'purple'
      },
      {
        title: 'Relationship Coach',
        description: 'Diepgaande relatie hulp',
        tab: 'coach',
        icon: 'Heart',
        color: 'rose'
      }
    ]
  };

  return phaseActions[phase as keyof typeof phaseActions] || phaseActions[1];
}

/**
 * Get next recommended action based on user progress
 */
export function getNextRecommendedAction(context: UserContext): Suggestion | null {
  const suggestions = generateDailySuggestions(context);
  return suggestions.length > 0 ? suggestions[0] : null;
}
