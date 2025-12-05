/**
 * Kickstart ↔ Cursussen Mapping Configuration
 *
 * Intelligente koppeling tussen het 21-dagen Kickstart programma
 * en de bestaande cursussen voor een naadloze leerervaring.
 */

export interface CursusMapping {
  cursusSlug: string;
  lesSlug?: string;
  type: 'deepDive' | 'bonus' | 'nextStep' | 'tool';
  title: string;
  description: string;
  isPremium: boolean;
  discount?: number; // Korting percentage voor Kickstart deelnemers
}

export interface DayMapping {
  dayNumber: number;
  weekNumber: 1 | 2 | 3;
  theme: string;
  cursussen: CursusMapping[];
}

export interface WeekRecommendation {
  weekNumber: 1 | 2 | 3;
  title: string;
  description: string;
  completionBonus: {
    cursusSlug: string;
    title: string;
    type: 'unlock' | 'discount';
    value?: number;
  };
  cursussen: CursusMapping[];
}

export interface PostKickstartJourney {
  scenario: 'still_dating' | 'found_match' | 'in_relationship';
  title: string;
  description: string;
  recommendations: CursusMapping[];
}

// =============================================================================
// DAG-NAAR-CURSUS MAPPINGS
// =============================================================================

export const dayMappings: Record<number, DayMapping> = {
  // WEEK 1: FOTO'S
  1: {
    dayNumber: 1,
    weekNumber: 1,
    theme: 'Dating Audit',
    cursussen: [
      {
        cursusSlug: 'profielfoto-5-stappen',
        type: 'deepDive',
        title: 'De Perfecte Profielfoto',
        description: 'Complete mini-cursus over profielfoto\'s - perfect als verdieping bij vandaag',
        isPremium: false,
      },
      {
        cursusSlug: 'dating-fundament-pro',
        lesSlug: 'wat-zoek-je-echt',
        type: 'bonus',
        title: 'Wat Zoek Je Écht?',
        description: 'Diepere reflectie op je dating doelen',
        isPremium: true,
        discount: 20,
      }
    ]
  },
  2: {
    dayNumber: 2,
    weekNumber: 1,
    theme: 'Psychologie van Foto\'s',
    cursussen: [
      {
        cursusSlug: 'profielfoto-5-stappen',
        lesSlug: 'psychologie-goede-lach',
        type: 'deepDive',
        title: 'De Psychologie van een Goede Lach',
        description: 'Waarom een echte glimlach je geheime wapen is',
        isPremium: false,
      },
      {
        cursusSlug: 'dating-fundament-pro',
        lesSlug: 'de-wetenschap-van-fotos',
        type: 'bonus',
        title: 'De Wetenschap van Foto\'s',
        description: 'Wat mensen zien in de eerste 3 seconden',
        isPremium: true,
        discount: 20,
      }
    ]
  },
  3: {
    dayNumber: 3,
    weekNumber: 1,
    theme: 'AI Foto Check',
    cursussen: [
      {
        cursusSlug: 'profielfoto-5-stappen',
        lesSlug: 'technische-checklist',
        type: 'tool',
        title: 'De Technische Checklist',
        description: 'Belichting, achtergrond en compositie',
        isPremium: false,
      }
    ]
  },
  4: {
    dayNumber: 4,
    weekNumber: 1,
    theme: 'Perfecte Selfie',
    cursussen: [
      {
        cursusSlug: 'profielfoto-5-stappen',
        lesSlug: '3-grote-foto-fouten',
        type: 'deepDive',
        title: 'De 3 Grote Foto-Fouten',
        description: 'Vermijd deze klassieke valkuilen',
        isPremium: false,
      }
    ]
  },
  5: {
    dayNumber: 5,
    weekNumber: 1,
    theme: 'Foto Selectie & Upload',
    cursussen: [
      {
        cursusSlug: 'profielfoto-5-stappen',
        type: 'deepDive',
        title: 'Complete Profielfoto Cursus',
        description: 'Je hebt de basis - nu de volledige cursus afronden',
        isPremium: false,
      }
    ]
  },
  6: {
    dayNumber: 6,
    weekNumber: 1,
    theme: 'Weekend Foto Challenge',
    cursussen: [] // Praktijk dag - geen cursus aanbevelingen
  },
  7: {
    dayNumber: 7,
    weekNumber: 1,
    theme: 'Week 1 Review',
    cursussen: [
      {
        cursusSlug: 'dating-fundament-pro',
        type: 'nextStep',
        title: 'Dating Fundament PRO',
        description: 'Klaar voor de volgende stap? Krijg 20% korting als Week 1 afsluiter',
        isPremium: true,
        discount: 20,
      }
    ]
  },

  // WEEK 2: PROFIEL & OPENINGS
  8: {
    dayNumber: 8,
    weekNumber: 2,
    theme: 'Bio Psychologie',
    cursussen: [
      {
        cursusSlug: 'dating-fundament-pro',
        lesSlug: 'platform-strategie',
        type: 'deepDive',
        title: 'Platform Strategie',
        description: 'Waar zit jouw ideale match?',
        isPremium: true,
        discount: 20,
      }
    ]
  },
  9: {
    dayNumber: 9,
    weekNumber: 2,
    theme: 'AI Profiel Coach',
    cursussen: [
      {
        cursusSlug: 'dating-fundament-pro',
        lesSlug: 'de-lancering',
        type: 'bonus',
        title: 'De Lancering',
        description: 'Live gaan met maximale impact',
        isPremium: true,
        discount: 20,
      }
    ]
  },
  10: {
    dayNumber: 10,
    weekNumber: 2,
    theme: 'Perfecte Opening',
    cursussen: [
      {
        cursusSlug: 'dating-fundament-pro',
        lesSlug: 'de-perfecte-opener',
        type: 'deepDive',
        title: 'De Perfecte Opener',
        description: 'Voorbij "hey" en "hoi" - de complete les',
        isPremium: true,
        discount: 20,
      }
    ]
  },
  11: {
    dayNumber: 11,
    weekNumber: 2,
    theme: 'Platform Optimalisatie',
    cursussen: [
      {
        cursusSlug: 'dating-fundament-pro',
        lesSlug: 'hoe-algoritmes-werken',
        type: 'bonus',
        title: 'Hoe Algoritmes Werken',
        description: 'Begrijp het spel dat je speelt',
        isPremium: true,
        discount: 20,
      }
    ]
  },
  12: {
    dayNumber: 12,
    weekNumber: 2,
    theme: 'Prompts & Antwoorden',
    cursussen: [
      {
        cursusSlug: 'dating-fundament-pro',
        lesSlug: 'profielen-lezen',
        type: 'deepDive',
        title: 'Profielen Lezen',
        description: 'Red flags en green flags herkennen',
        isPremium: true,
        discount: 20,
      },
      {
        cursusSlug: 'red-flags-5',
        type: 'bonus',
        title: 'Herken de 5 Red Flags',
        description: 'Bescherm jezelf in het dating proces',
        isPremium: true,
        discount: 15,
      }
    ]
  },
  13: {
    dayNumber: 13,
    weekNumber: 2,
    theme: 'Live Q&A',
    cursussen: [] // Live dag - focus op interactie
  },
  14: {
    dayNumber: 14,
    weekNumber: 2,
    theme: 'Week 2 Review',
    cursussen: [
      {
        cursusSlug: 'dating-fundament-pro',
        type: 'nextStep',
        title: 'Dating Fundament PRO',
        description: 'Week 2 voltooid! Unlock de complete cursus met 25% korting',
        isPremium: true,
        discount: 25,
      }
    ]
  },

  // WEEK 3: GESPREKKEN & DATES
  15: {
    dayNumber: 15,
    weekNumber: 3,
    theme: 'Gesprek Psychologie',
    cursussen: [
      {
        cursusSlug: 'dating-fundament-pro',
        lesSlug: 'gesprek-gaande-houden',
        type: 'deepDive',
        title: 'Gesprek Gaande Houden',
        description: 'Van oppervlakkig naar interessant',
        isPremium: true,
        discount: 25,
      }
    ]
  },
  16: {
    dayNumber: 16,
    weekNumber: 3,
    theme: 'IJsbreker Mastery',
    cursussen: [
      {
        cursusSlug: 'dating-fundament-pro',
        lesSlug: 'spanning-en-flirten',
        type: 'bonus',
        title: 'Spanning en Flirten',
        description: 'Het verschil tussen vriendelijk en interessant',
        isPremium: true,
        discount: 25,
      }
    ]
  },
  17: {
    dayNumber: 17,
    weekNumber: 3,
    theme: 'Gesprek Flow',
    cursussen: [
      {
        cursusSlug: 'dating-fundament-pro',
        lesSlug: 'naar-de-date',
        type: 'deepDive',
        title: 'Naar de Date',
        description: 'Wanneer en hoe voorstellen',
        isPremium: true,
        discount: 25,
      }
    ]
  },
  18: {
    dayNumber: 18,
    weekNumber: 3,
    theme: 'De Date Ask',
    cursussen: [
      {
        cursusSlug: 'dating-fundament-pro',
        lesSlug: 'date-planning',
        type: 'deepDive',
        title: 'Date Planning',
        description: 'Waar, wanneer, hoe lang',
        isPremium: true,
        discount: 25,
      },
      {
        cursusSlug: 'dating-fundament-pro',
        lesSlug: 'gesprekken-op-de-date',
        type: 'bonus',
        title: 'Gesprekken op de Date',
        description: 'Diepgang zonder interview',
        isPremium: true,
        discount: 25,
      }
    ]
  },
  19: {
    dayNumber: 19,
    weekNumber: 3,
    theme: 'Live Gesprek Coaching',
    cursussen: [] // Live dag
  },
  20: {
    dayNumber: 20,
    weekNumber: 3,
    theme: 'Mindset & Afwijzing',
    cursussen: [
      {
        cursusSlug: 'dating-fundament-pro',
        lesSlug: 'omgaan-met-afwijzing',
        type: 'deepDive',
        title: 'Omgaan met Afwijzing',
        description: 'Het hoort erbij - de complete les',
        isPremium: true,
        discount: 25,
      },
      {
        cursusSlug: 'dating-fundament-pro',
        lesSlug: 'patronen-doorbreken',
        type: 'bonus',
        title: 'Patronen Doorbreken',
        description: 'Waarom je steeds hetzelfde aantrekt',
        isPremium: true,
        discount: 25,
      }
    ]
  },
  21: {
    dayNumber: 21,
    weekNumber: 3,
    theme: 'De Grote Finale',
    cursussen: [
      {
        cursusSlug: 'meesterschap-in-relaties',
        type: 'nextStep',
        title: 'Meesterschap in Relaties',
        description: 'Je bent klaar voor de volgende fase. Van dating naar duurzame relatie.',
        isPremium: true,
        discount: 30,
      },
      {
        cursusSlug: 'dating-fundament-pro',
        type: 'nextStep',
        title: 'Dating Fundament PRO',
        description: 'Alle 23 lessen voor diepgaand begrip - 30% Kickstart korting',
        isPremium: true,
        discount: 30,
      }
    ]
  }
};

// =============================================================================
// WEEK AANBEVELINGEN (verschijnen na week voltooiing)
// =============================================================================

export const weekRecommendations: WeekRecommendation[] = [
  {
    weekNumber: 1,
    title: 'Week 1 Voltooid: Foto Meesterschap',
    description: 'Je hebt de basis van je dating profiel neergezet. Tijd om te verdiepen!',
    completionBonus: {
      cursusSlug: 'profielfoto-5-stappen',
      title: 'Profielfoto Cursus Gratis Unlocked',
      type: 'unlock',
    },
    cursussen: [
      {
        cursusSlug: 'profielfoto-5-stappen',
        type: 'bonus',
        title: 'De Perfecte Profielfoto',
        description: 'Je hebt deze verdiend! Complete cursus nu gratis beschikbaar.',
        isPremium: false,
      },
      {
        cursusSlug: 'dating-fundament-pro',
        type: 'nextStep',
        title: 'Dating Fundament PRO',
        description: 'Ga dieper met 20% Kickstart korting',
        isPremium: true,
        discount: 20,
      }
    ]
  },
  {
    weekNumber: 2,
    title: 'Week 2 Voltooid: Profiel & Opening Pro',
    description: 'Je profiel staat en je weet hoe je het gesprek start. Tijd voor de gesprekken!',
    completionBonus: {
      cursusSlug: 'dating-fundament-pro',
      title: '25% Korting op Dating Fundament PRO',
      type: 'discount',
      value: 25,
    },
    cursussen: [
      {
        cursusSlug: 'red-flags-5',
        type: 'bonus',
        title: 'Herken de 5 Red Flags',
        description: 'Bescherm jezelf nu je meer matches krijgt',
        isPremium: true,
        discount: 20,
      },
      {
        cursusSlug: 'dating-fundament-pro',
        type: 'nextStep',
        title: 'Dating Fundament PRO',
        description: 'Alle 23 lessen - nu met 25% korting',
        isPremium: true,
        discount: 25,
      }
    ]
  },
  {
    weekNumber: 3,
    title: 'Kickstart Voltooid! Je Transformatie Begint',
    description: 'Je hebt alle 21 dagen voltooid. Dit is pas het begin van je dating journey.',
    completionBonus: {
      cursusSlug: 'dating-fundament-pro',
      title: '30% Korting op Alle Cursussen',
      type: 'discount',
      value: 30,
    },
    cursussen: [
      {
        cursusSlug: 'dating-fundament-pro',
        type: 'nextStep',
        title: 'Dating Fundament PRO',
        description: 'De complete cursus - exclusieve 30% Kickstart Graduate korting',
        isPremium: true,
        discount: 30,
      },
      {
        cursusSlug: 'meesterschap-in-relaties',
        type: 'nextStep',
        title: 'Meesterschap in Relaties',
        description: 'Van dating naar duurzame relatie - 30% korting',
        isPremium: true,
        discount: 30,
      },
      {
        cursusSlug: 'red-flags-5',
        type: 'bonus',
        title: 'Herken de 5 Red Flags',
        description: 'Bescherm jezelf in elke fase - 20% korting',
        isPremium: true,
        discount: 20,
      }
    ]
  }
];

// =============================================================================
// POST-KICKSTART JOURNEY (gepersonaliseerde aanbevelingen na afloop)
// =============================================================================

export const postKickstartJourneys: PostKickstartJourney[] = [
  {
    scenario: 'still_dating',
    title: 'Blijf Groeien in Dating',
    description: 'Je bent nog bezig met het dating proces. Deze cursussen helpen je verder.',
    recommendations: [
      {
        cursusSlug: 'dating-fundament-pro',
        type: 'nextStep',
        title: 'Dating Fundament PRO',
        description: 'Alle 23 lessen voor diepgaand begrip van online dating',
        isPremium: true,
        discount: 30,
      },
      {
        cursusSlug: 'red-flags-5',
        type: 'bonus',
        title: 'Herken de 5 Red Flags',
        description: 'Bescherm jezelf terwijl je date',
        isPremium: true,
        discount: 20,
      }
    ]
  },
  {
    scenario: 'found_match',
    title: 'Je Hebt Een Match!',
    description: 'Gefeliciteerd! Nu is het tijd om de relatie goed te starten.',
    recommendations: [
      {
        cursusSlug: 'red-flags-5',
        type: 'bonus',
        title: 'Herken de 5 Red Flags',
        description: 'Zorg dat je de juiste persoon hebt gevonden',
        isPremium: true,
        discount: 25,
      },
      {
        cursusSlug: 'meesterschap-in-relaties',
        lesSlug: 'de-90-dagen-realiteitscheck',
        type: 'deepDive',
        title: 'De 90-Dagen Realiteitscheck',
        description: 'Hoe je iemand écht leert kennen',
        isPremium: true,
        discount: 30,
      }
    ]
  },
  {
    scenario: 'in_relationship',
    title: 'Van Dating naar Relatie',
    description: 'Je bent in een relatie. Tijd om het fundament te leggen voor de lange termijn.',
    recommendations: [
      {
        cursusSlug: 'meesterschap-in-relaties',
        type: 'nextStep',
        title: 'Meesterschap in Relaties',
        description: 'De complete transformatie naar een duurzame relatie',
        isPremium: true,
        discount: 30,
      }
    ]
  }
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getRecommendationsForDay(dayNumber: number): CursusMapping[] {
  return dayMappings[dayNumber]?.cursussen || [];
}

export function getWeekRecommendation(weekNumber: 1 | 2 | 3): WeekRecommendation | undefined {
  return weekRecommendations.find(w => w.weekNumber === weekNumber);
}

export function getWeekForDay(dayNumber: number): 1 | 2 | 3 {
  if (dayNumber <= 7) return 1;
  if (dayNumber <= 14) return 2;
  return 3;
}

export function getPostKickstartJourney(scenario: 'still_dating' | 'found_match' | 'in_relationship'): PostKickstartJourney | undefined {
  return postKickstartJourneys.find(j => j.scenario === scenario);
}

export function calculateDiscountedPrice(originalPrice: number, discountPercentage: number): number {
  return Math.round(originalPrice * (1 - discountPercentage / 100));
}

export function isWeekComplete(completedDays: number[], weekNumber: 1 | 2 | 3): boolean {
  const weekDays = {
    1: [1, 2, 3, 4, 5, 6, 7],
    2: [8, 9, 10, 11, 12, 13, 14],
    3: [15, 16, 17, 18, 19, 20, 21]
  };

  return weekDays[weekNumber].every(day => completedDays.includes(day));
}
