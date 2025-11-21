/**
 * Personality Profile Data
 * Interactive personality assessment voor dating profile optimization
 */

export interface PersonalityDimension {
  id: string;
  name: string;
  description: string;
  icon: string;
  questions: PersonalityQuestion[];
  writingTips: WritingTip[];
}

export interface PersonalityQuestion {
  id: string;
  text: string;
  options: PersonalityOption[];
  category: 'values' | 'lifestyle' | 'social' | 'interests' | 'humor';
}

export interface PersonalityOption {
  id: string;
  text: string;
  score: number; // 1-5 scale
  archetype: string; // bijv. 'adventurer', 'homebody', 'creative', etc.
  bioTemplate?: string; // Optionele template voor bio text
}

export interface WritingTip {
  archetype: string;
  doExample: string;
  dontExample: string;
  explanation: string;
}

export interface PersonalityProfile {
  dimensions: {
    [key: string]: number; // dimension id -> score (0-100)
  };
  primaryArchetype: string;
  secondaryArchetype?: string;
  strengths: string[];
  bioSuggestions: string[];
  toneRecommendations: string[];
}

/**
 * 5 Core Personality Dimensions voor Dating Profiles
 */
export const PERSONALITY_DIMENSIONS: PersonalityDimension[] = [
  {
    id: 'adventure-comfort',
    name: 'Adventure vs Comfort',
    description: 'Hoe balanceer je tussen avontuur zoeken en comfort prefereren?',
    icon: '🏔️',
    questions: [
      {
        id: 'weekend-style',
        text: 'Wat is jouw ideale weekend?',
        category: 'lifestyle',
        options: [
          {
            id: 'extreme-adventure',
            text: 'Spontaan een vliegtuig pakken naar een nieuwe stad',
            score: 5,
            archetype: 'adventurer',
            bioTemplate: 'Laatste spontane trip: {detail}'
          },
          {
            id: 'planned-adventure',
            text: 'Een geplande wandeling of roadtrip',
            score: 4,
            archetype: 'explorer',
            bioTemplate: 'Mijn favoriete weekend escape: {detail}'
          },
          {
            id: 'balanced',
            text: 'Mix van uitproberen en chillen',
            score: 3,
            archetype: 'balanced',
            bioTemplate: 'Weekend goals: {detail}'
          },
          {
            id: 'planned-comfort',
            text: 'Gezellig restaurant en Netflix binge',
            score: 2,
            archetype: 'homebody',
            bioTemplate: 'Perfect weekend: {detail}'
          },
          {
            id: 'pure-comfort',
            text: 'Boek lezen in mijn favoriete koffietent',
            score: 1,
            archetype: 'cozy-enthusiast',
            bioTemplate: 'Je vindt me meestal: {detail}'
          }
        ]
      },
      {
        id: 'new-experiences',
        text: 'Hoe sta je tegenover nieuwe ervaringen?',
        category: 'interests',
        options: [
          {
            id: 'thrill-seeker',
            text: 'Ik zoek constant nieuwe thrills (bungeejumpen, skydiven)',
            score: 5,
            archetype: 'adventurer'
          },
          {
            id: 'culture-explorer',
            text: 'Ik hou van nieuwe culturen en smaken ontdekken',
            score: 4,
            archetype: 'explorer'
          },
          {
            id: 'selective-new',
            text: 'Open voor nieuwe dingen, maar selectief',
            score: 3,
            archetype: 'balanced'
          },
          {
            id: 'familiar-twist',
            text: 'Ik hou van familiar things met een kleine twist',
            score: 2,
            archetype: 'homebody'
          },
          {
            id: 'routine-lover',
            text: 'Ik vind comfort in routines en bekende plekken',
            score: 1,
            archetype: 'cozy-enthusiast'
          }
        ]
      },
      {
        id: 'spontaneity',
        text: 'Hoe spontaan ben je?',
        category: 'lifestyle',
        options: [
          {
            id: 'extremely-spontaneous',
            text: 'Last-minute plans zijn de beste plans',
            score: 5,
            archetype: 'adventurer',
            bioTemplate: 'Spontaneous move die ik maakte: {detail}'
          },
          {
            id: 'flexible-spontaneous',
            text: 'Flexibel, maar met een loose plan',
            score: 4,
            archetype: 'explorer'
          },
          {
            id: 'moderate',
            text: '50/50 tussen plannen en spontaan zijn',
            score: 3,
            archetype: 'balanced'
          },
          {
            id: 'prefer-planning',
            text: 'Ik plan graag vooruit, maar kan flexibel zijn',
            score: 2,
            archetype: 'homebody'
          },
          {
            id: 'detailed-planner',
            text: 'Ik plan alles van tevoren in detail',
            score: 1,
            archetype: 'cozy-enthusiast'
          }
        ]
      }
    ],
    writingTips: [
      {
        archetype: 'adventurer',
        doExample: 'Laatste spontane avontuur: midnight food tour door Tokyo omdat ik niet kon slapen',
        dontExample: 'Ik hou van reizen',
        explanation: 'Toon een specifiek verhaal dat je adventurous spirit laat zien'
      },
      {
        archetype: 'explorer',
        doExample: 'Mijn weekenden: nieuwe restaurants scouten, local art exhibitions, of een random roadtrip',
        dontExample: 'Ik ben open-minded',
        explanation: 'Geef concrete voorbeelden van hoe je exploreert'
      },
      {
        archetype: 'balanced',
        doExample: 'Even blij met een hike naar een hidden waterval als met een lazy brunch in bed',
        dontExample: 'Ik kan beide',
        explanation: 'Laat beide kanten zien met specifieke voorbeelden'
      },
      {
        archetype: 'homebody',
        doExample: 'Perfecte vrijdag: nieuwe cocktail recipe uitproberen, friends bellen, dan deep dive in een HBO serie',
        dontExample: 'Ik ben een homebody',
        explanation: 'Maak je comfort zone interessant en specifiek'
      },
      {
        archetype: 'cozy-enthusiast',
        doExample: 'Mijn happy place: die ene corner spot bij mijn favoriete café met een goede fantasy novel',
        dontExample: 'Ik hou van lezen',
        explanation: 'Paint a cozy, inviting picture met sensory details'
      }
    ]
  },
  {
    id: 'social-energy',
    name: 'Social Energy',
    description: 'Waar haal je je energie vandaan?',
    icon: '⚡',
    questions: [
      {
        id: 'social-battery',
        text: 'Wat geeft je energie?',
        category: 'social',
        options: [
          {
            id: 'extrovert-plus',
            text: 'Grote groepen, parties, festivals - hoe meer mensen hoe beter',
            score: 5,
            archetype: 'social-butterfly'
          },
          {
            id: 'social-extrovert',
            text: 'Dineren met vrienden, spontane hangouts',
            score: 4,
            archetype: 'social-connector'
          },
          {
            id: 'ambivert',
            text: 'Mix van social time en alone time',
            score: 3,
            archetype: 'ambivert'
          },
          {
            id: 'selective-social',
            text: 'Klein groepje close friends',
            score: 2,
            archetype: 'intimate-connector'
          },
          {
            id: 'introvert',
            text: 'One-on-one conversations en solo activities',
            score: 1,
            archetype: 'thoughtful-introvert'
          }
        ]
      },
      {
        id: 'ideal-date',
        text: 'Wat is jouw ideale eerste date?',
        category: 'social',
        options: [
          {
            id: 'high-energy-public',
            text: 'Busy markt of populair festival',
            score: 5,
            archetype: 'social-butterfly',
            bioTemplate: 'Eerste date idee: {detail}'
          },
          {
            id: 'active-social',
            text: 'Cocktail bar met live muziek',
            score: 4,
            archetype: 'social-connector',
            bioTemplate: 'Perfect date spot: {detail}'
          },
          {
            id: 'balanced-activity',
            text: 'Museum of galerij, dan koffie',
            score: 3,
            archetype: 'ambivert',
            bioTemplate: 'Ideale date: {detail}'
          },
          {
            id: 'intimate-activity',
            text: 'Rustig restaurant met goede conversatie',
            score: 2,
            archetype: 'intimate-connector',
            bioTemplate: 'Ik waardeer: {detail}'
          },
          {
            id: 'quiet-connection',
            text: 'Walk in het park of coffee shop met weinig mensen',
            score: 1,
            archetype: 'thoughtful-introvert',
            bioTemplate: 'Mijn happy place voor een date: {detail}'
          }
        ]
      },
      {
        id: 'friday-night',
        text: 'Jouw ideale vrijdagavond?',
        category: 'lifestyle',
        options: [
          {
            id: 'party-mode',
            text: 'Uitgaan naar een drukke bar of club',
            score: 5,
            archetype: 'social-butterfly'
          },
          {
            id: 'social-gathering',
            text: 'Dinner party bij vrienden',
            score: 4,
            archetype: 'social-connector'
          },
          {
            id: 'flexible-social',
            text: 'Hangt van mijn mood af',
            score: 3,
            archetype: 'ambivert'
          },
          {
            id: 'small-intimate',
            text: 'Board game night met een paar close friends',
            score: 2,
            archetype: 'intimate-connector'
          },
          {
            id: 'solo-recharge',
            text: 'Lekker thuis met een film of boek',
            score: 1,
            archetype: 'thoughtful-introvert'
          }
        ]
      }
    ],
    writingTips: [
      {
        archetype: 'social-butterfly',
        doExample: 'Je vindt me op festivals, spontane feestjes, of die ene persoon die strangers aan elkaar voorstelt',
        dontExample: 'Ik ben sociaal',
        explanation: 'Toon hoe je social energy zich uit in concrete situaties'
      },
      {
        archetype: 'social-connector',
        doExample: 'Ik organiseer regelmatig dinners waar ik vrienden uit verschillende vriendengroepen connect',
        dontExample: 'Ik hou van mensen',
        explanation: 'Laat je rol als connector zien met voorbeelden'
      },
      {
        archetype: 'ambivert',
        doExample: 'Even happy met een spontaan weekend trip met friends als een solo museum visit',
        dontExample: 'Ik ben ambivert',
        explanation: 'Illustreer beide kanten van je social energie'
      },
      {
        archetype: 'intimate-connector',
        doExample: 'Ik prefereer deep conversations bij een good wine over small talk bij een crowded bar',
        dontExample: 'Ik hou niet van grote groepen',
        explanation: 'Frame je preference positief met wat je WEL wilt'
      },
      {
        archetype: 'thoughtful-introvert',
        doExample: 'Mijn ideale zondag: morning run, daarna journaling met coffee, en diep duiken in een podcast series',
        dontExample: 'Ik ben introvert',
        explanation: 'Maak je solo tijd interessant en appealing'
      }
    ]
  },
  {
    id: 'communication-style',
    name: 'Communication Style',
    description: 'Hoe communiceer je?',
    icon: '💬',
    questions: [
      {
        id: 'humor-style',
        text: 'Wat is jouw humor style?',
        category: 'humor',
        options: [
          {
            id: 'sarcastic-witty',
            text: 'Sarcasme en witty comebacks',
            score: 5,
            archetype: 'witty-banter'
          },
          {
            id: 'playful-teasing',
            text: 'Playful teasing en woordgrappen',
            score: 4,
            archetype: 'playful'
          },
          {
            id: 'situational',
            text: 'Observational humor over dagelijkse dingen',
            score: 3,
            archetype: 'observant'
          },
          {
            id: 'wholesome',
            text: 'Wholesome en silly humor',
            score: 2,
            archetype: 'warm'
          },
          {
            id: 'subtle',
            text: 'Subtiel en dry humor',
            score: 1,
            archetype: 'thoughtful'
          }
        ]
      },
      {
        id: 'conversation-depth',
        text: 'Wat voor conversations vind je het leukst?',
        category: 'social',
        options: [
          {
            id: 'debate-ideas',
            text: 'Debatteren over grote ideeën en filosofie',
            score: 5,
            archetype: 'intellectual',
            bioTemplate: 'Onderwerpen waar ik over kan praten: {detail}'
          },
          {
            id: 'deep-analytical',
            text: 'Analyzing why things work the way they do',
            score: 4,
            archetype: 'analytical'
          },
          {
            id: 'stories-experiences',
            text: 'Verhalen delen over ervaringen',
            score: 3,
            archetype: 'storyteller'
          },
          {
            id: 'emotional-connection',
            text: 'Emotionele connection en empathy',
            score: 2,
            archetype: 'empathetic'
          },
          {
            id: 'light-fun',
            text: 'Luchtig, fun, en easy-going',
            score: 1,
            archetype: 'easygoing'
          }
        ]
      },
      {
        id: 'texting-style',
        text: 'Hoe zou je jouw texting style beschrijven?',
        category: 'social',
        options: [
          {
            id: 'quick-witty',
            text: 'Snelle, witty responses met memes',
            score: 5,
            archetype: 'witty-banter'
          },
          {
            id: 'enthusiastic',
            text: 'Enthusiastisch met veel emojis',
            score: 4,
            archetype: 'playful'
          },
          {
            id: 'balanced-responsive',
            text: 'Balanced - soms snel, soms thoughtful',
            score: 3,
            archetype: 'balanced'
          },
          {
            id: 'thoughtful-detailed',
            text: 'Thoughtful messages met context',
            score: 2,
            archetype: 'thoughtful'
          },
          {
            id: 'concise-meaningful',
            text: 'Kort maar meaningful',
            score: 1,
            archetype: 'concise'
          }
        ]
      }
    ],
    writingTips: [
      {
        archetype: 'witty-banter',
        doExample: 'Mijn humor is sarcasme met een vleugje absurditeit. Als je Friends quotes kan parry-en, we\'ll get along',
        dontExample: 'Ik ben grappig',
        explanation: 'Toon je humor style, niet claimen'
      },
      {
        archetype: 'playful',
        doExample: 'Fair warning: ik communiceer 60% in woordgrappen, 30% food references, 10% echte woorden',
        dontExample: 'Ik ben playful',
        explanation: 'Laat playfulness zien in hoe je schrijft'
      },
      {
        archetype: 'intellectual',
        doExample: 'Ik kan urenlang praten over waarom fictional characters betere role models zijn dan real people',
        dontExample: 'Ik hou van diepe gesprekken',
        explanation: 'Geef een quirky voorbeeld van je intellectual side'
      },
      {
        archetype: 'empathetic',
        doExample: 'Ik ben die persoon die je belt wanneer je moet ventileren over je dag',
        dontExample: 'Ik ben een goede luisteraar',
        explanation: 'Toon empathy door je rol te beschrijven'
      },
      {
        archetype: 'easygoing',
        doExample: 'Life\'s te kort voor drama - geef mij good vibes, spontane plans, en people die niet alles serieus nemen',
        dontExample: 'Ik ben relaxed',
        explanation: 'Laat je easygoing vibe zien door je values'
      }
    ]
  },
  {
    id: 'values-priorities',
    name: 'Values & Priorities',
    description: 'Wat vind je belangrijk in het leven?',
    icon: '🎯',
    questions: [
      {
        id: 'life-priority',
        text: 'Wat heeft momenteel je hoogste prioriteit?',
        category: 'values',
        options: [
          {
            id: 'career-ambition',
            text: 'Carrière en professionele groei',
            score: 5,
            archetype: 'ambitious'
          },
          {
            id: 'personal-growth',
            text: 'Persoonlijke ontwikkeling en leren',
            score: 4,
            archetype: 'growth-focused'
          },
          {
            id: 'balanced-life',
            text: 'Balans tussen werk, fun, en relationships',
            score: 3,
            archetype: 'balanced'
          },
          {
            id: 'relationships',
            text: 'Relaties en connecties met mensen',
            score: 2,
            archetype: 'relationship-focused'
          },
          {
            id: 'experiences',
            text: 'Ervaringen verzamelen en memories maken',
            score: 1,
            archetype: 'experience-collector'
          }
        ]
      },
      {
        id: 'success-definition',
        text: 'Hoe definieer je succes?',
        category: 'values',
        options: [
          {
            id: 'achievement-impact',
            text: 'Impact maken en goals bereiken',
            score: 5,
            archetype: 'ambitious',
            bioTemplate: 'Success voor mij: {detail}'
          },
          {
            id: 'continuous-learning',
            text: 'Constant nieuwe skills leren',
            score: 4,
            archetype: 'growth-focused'
          },
          {
            id: 'happiness-fulfillment',
            text: 'Gelukkig zijn en fulfilled voelen',
            score: 3,
            archetype: 'balanced'
          },
          {
            id: 'meaningful-connections',
            text: 'Meaningful relationships hebben',
            score: 2,
            archetype: 'relationship-focused'
          },
          {
            id: 'living-fully',
            text: 'Fully leven zonder regrets',
            score: 1,
            archetype: 'experience-collector'
          }
        ]
      },
      {
        id: 'free-time',
        text: 'Wat doe je in je vrije tijd?',
        category: 'interests',
        options: [
          {
            id: 'side-hustle',
            text: 'Side projects of skill development',
            score: 5,
            archetype: 'ambitious'
          },
          {
            id: 'learning-hobbies',
            text: 'Nieuwe hobbies en interests leren',
            score: 4,
            archetype: 'growth-focused'
          },
          {
            id: 'variety-activities',
            text: 'Mix van productief en relaxen',
            score: 3,
            archetype: 'balanced'
          },
          {
            id: 'social-activities',
            text: 'Quality time met vrienden en familie',
            score: 2,
            archetype: 'relationship-focused'
          },
          {
            id: 'exploration',
            text: 'Exploring en nieuwe dingen proberen',
            score: 1,
            archetype: 'experience-collector'
          }
        ]
      }
    ],
    writingTips: [
      {
        archetype: 'ambitious',
        doExample: 'Building my own design agency terwijl ik fulltime werk - sleep is overrated anyway',
        dontExample: 'Ik ben ambitieus',
        explanation: 'Laat je ambition zien door wat je DOET'
      },
      {
        archetype: 'growth-focused',
        doExample: 'Momenteel: Spaans leren (via telenovelas), perfecting my sourdough, en diep in behavioural psychology',
        dontExample: 'Ik hou van leren',
        explanation: 'Toon je growth mindset met concrete voorbeelden'
      },
      {
        archetype: 'balanced',
        doExample: 'Werk hard tijdens de week, maar mijn weekenden zijn sacred - dat is mijn time voor adventures en recharge',
        dontExample: 'Ik waardeer work-life balance',
        explanation: 'Beschrijf hoe je balance creëert'
      },
      {
        archetype: 'relationship-focused',
        doExample: 'Die persoon die monthly dinners organiseert om iedereen connected te houden',
        dontExample: 'Relaties zijn belangrijk voor mij',
        explanation: 'Toon hoe je relationships prioriteert'
      },
      {
        archetype: 'experience-collector',
        doExample: 'Mijn bucketlist is langer dan mijn grocery list: wild swimming in Schotland, pottery class, en leren kitesurfen',
        dontExample: 'Ik verzamel ervaringen',
        explanation: 'Deel je bucketlist - het is een conversation starter'
      }
    ]
  },
  {
    id: 'passion-expression',
    name: 'Passion Expression',
    description: 'Hoe uit je je passies en interesses?',
    icon: '🔥',
    questions: [
      {
        id: 'passion-intensity',
        text: 'Hoe intense zijn je passies?',
        category: 'interests',
        options: [
          {
            id: 'obsessive-deep',
            text: 'Ik deep dive volledig - all or nothing',
            score: 5,
            archetype: 'passionate'
          },
          {
            id: 'dedicated-focused',
            text: 'Dedicated aan een paar key interests',
            score: 4,
            archetype: 'focused'
          },
          {
            id: 'multiple-moderate',
            text: 'Meerdere interests waar ik redelijk in invest',
            score: 3,
            archetype: 'multi-passionate'
          },
          {
            id: 'casual-enjoy',
            text: 'Casual enjoyment van verschillende dingen',
            score: 2,
            archetype: 'curious'
          },
          {
            id: 'explorer-variety',
            text: 'Constant nieuwe interests ontdekken',
            score: 1,
            archetype: 'explorer'
          }
        ]
      },
      {
        id: 'sharing-passion',
        text: 'Hoe deel je je passies?',
        category: 'social',
        options: [
          {
            id: 'teach-others',
            text: 'Ik teach anderen erover / start communities',
            score: 5,
            archetype: 'passionate',
            bioTemplate: 'Passie die ik graag deel: {detail}'
          },
          {
            id: 'active-participant',
            text: 'Actief in communities en events',
            score: 4,
            archetype: 'focused'
          },
          {
            id: 'selective-sharing',
            text: 'Deel met mensen die same interest hebben',
            score: 3,
            archetype: 'multi-passionate'
          },
          {
            id: 'casual-conversation',
            text: 'Praat erover als het ter sprake komt',
            score: 2,
            archetype: 'curious'
          },
          {
            id: 'mostly-solo',
            text: 'Vooral solo, maar open to sharing',
            score: 1,
            archetype: 'explorer'
          }
        ]
      },
      {
        id: 'creative-outlet',
        text: 'Heb je een creative outlet?',
        category: 'interests',
        options: [
          {
            id: 'serious-creative',
            text: 'Ja, ik neem het serieus (art, muziek, schrijven)',
            score: 5,
            archetype: 'creative'
          },
          {
            id: 'regular-hobby',
            text: 'Creative hobby waar ik regelmatig tijd in steek',
            score: 4,
            archetype: 'creative-hobbyist'
          },
          {
            id: 'occasional-creative',
            text: 'Soms, als de mood me pakt',
            score: 3,
            archetype: 'occasional-creative'
          },
          {
            id: 'appreciate-consume',
            text: 'Meer consumer (museum, concerts, films)',
            score: 2,
            archetype: 'appreciator'
          },
          {
            id: 'not-creative',
            text: 'Niet echt mijn ding',
            score: 1,
            archetype: 'practical'
          }
        ]
      }
    ],
    writingTips: [
      {
        archetype: 'passionate',
        doExample: 'Waarschuwing: als je me vraagt over film photography ga ik je volledig nerden over aperture settings',
        dontExample: 'Ik ben gepassioneerd over fotografie',
        explanation: 'Toon je passion intensity op een self-aware manier'
      },
      {
        archetype: 'focused',
        doExample: 'Mijn drie obsessions: specialty coffee (I have opinions), indie music (obscure bands only), en rock climbing',
        dontExample: 'Ik heb verschillende hobbies',
        explanation: 'Lijst je top passies met personality'
      },
      {
        archetype: 'creative',
        doExample: 'Weekends vind je me bij open mic nights waar ik mijn poetry shares (ja echt, no shame)',
        dontExample: 'Ik schrijf poetry',
        explanation: 'Embrace je creative side met confidence'
      },
      {
        archetype: 'multi-passionate',
        doExample: 'Ik kan niet kiezen tussen één ding: yoga instructor by morning, coder by day, salsa dancer by night',
        dontExample: 'Ik doe veel verschillende dingen',
        explanation: 'Maak je variety interessant en concrete'
      },
      {
        archetype: 'explorer',
        doExample: 'Elke maand een nieuwe skill: vorige maand pottery, deze maand cocktail making, volgende maand... wie weet',
        dontExample: 'Ik probeer graag nieuwe dingen',
        explanation: 'Toon je exploration pattern met voorbeelden'
      }
    ]
  }
];

/**
 * Calculate personality profile from answers
 */
export function calculatePersonalityProfile(
  answers: { [questionId: string]: string }
): PersonalityProfile {
  const dimensionScores: { [key: string]: number[] } = {};
  const archetypes: { [key: string]: number } = {};

  // Process each answer
  PERSONALITY_DIMENSIONS.forEach(dimension => {
    dimension.questions.forEach(question => {
      const answerId = answers[question.id];
      if (!answerId) return;

      const selectedOption = question.options.find(opt => opt.id === answerId);
      if (!selectedOption) return;

      // Track scores per dimension
      if (!dimensionScores[dimension.id]) {
        dimensionScores[dimension.id] = [];
      }
      dimensionScores[dimension.id].push(selectedOption.score);

      // Track archetype frequency
      archetypes[selectedOption.archetype] = (archetypes[selectedOption.archetype] || 0) + 1;
    });
  });

  // Calculate average scores per dimension (0-100 scale)
  const dimensions: { [key: string]: number } = {};
  Object.entries(dimensionScores).forEach(([dimId, scores]) => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    dimensions[dimId] = Math.round((avg / 5) * 100); // Convert 1-5 to 0-100
  });

  // Find primary and secondary archetypes
  const sortedArchetypes = Object.entries(archetypes)
    .sort(([, a], [, b]) => b - a);

  const primaryArchetype = sortedArchetypes[0]?.[0] || 'balanced';
  const secondaryArchetype = sortedArchetypes[1]?.[0];

  // Generate strengths based on archetypes
  const strengths = generateStrengths(primaryArchetype, secondaryArchetype);

  // Generate bio suggestions
  const bioSuggestions = generateBioSuggestions(primaryArchetype, dimensions, answers);

  // Generate tone recommendations
  const toneRecommendations = generateToneRecommendations(primaryArchetype, secondaryArchetype);

  return {
    dimensions,
    primaryArchetype,
    secondaryArchetype,
    strengths,
    bioSuggestions,
    toneRecommendations
  };
}

function generateStrengths(primary: string, secondary?: string): string[] {
  const strengthMap: { [key: string]: string[] } = {
    'adventurer': ['Spontaneous', 'Open-minded', 'Energetic', 'Adventurous'],
    'explorer': ['Curious', 'Flexible', 'Culturally aware', 'Open to new experiences'],
    'balanced': ['Well-rounded', 'Adaptable', 'Grounded', 'Reliable'],
    'social-butterfly': ['Outgoing', 'Energetic', 'Fun-loving', 'Connector'],
    'witty-banter': ['Quick-witted', 'Humorous', 'Sharp', 'Engaging'],
    'passionate': ['Dedicated', 'Enthusiastic', 'Deep', 'Committed'],
    'creative': ['Artistic', 'Expressive', 'Original', 'Imaginative'],
    'ambitious': ['Goal-oriented', 'Driven', 'Focused', 'Determined'],
    'empathetic': ['Understanding', 'Supportive', 'Caring', 'Good listener']
  };

  const strengths = new Set<string>();

  if (strengthMap[primary]) {
    strengthMap[primary].forEach(s => strengths.add(s));
  }

  if (secondary && strengthMap[secondary]) {
    strengthMap[secondary].slice(0, 2).forEach(s => strengths.add(s));
  }

  return Array.from(strengths).slice(0, 5);
}

function generateBioSuggestions(
  archetype: string,
  dimensions: { [key: string]: number },
  answers: { [questionId: string]: string }
): string[] {
  const suggestions: string[] = [];

  // Find dimension with highest score
  const topDimension = Object.entries(dimensions)
    .sort(([, a], [, b]) => b - a)[0];

  if (topDimension) {
    const [dimId] = topDimension;
    const dimension = PERSONALITY_DIMENSIONS.find(d => d.id === dimId);

    if (dimension) {
      // Get writing tips for this archetype
      const tips = dimension.writingTips.filter(tip => tip.archetype === archetype);
      tips.forEach(tip => {
        suggestions.push(tip.doExample);
      });
    }
  }

  // Add bio templates from selected options
  PERSONALITY_DIMENSIONS.forEach(dimension => {
    dimension.questions.forEach(question => {
      const answerId = answers[question.id];
      const option = question.options.find(opt => opt.id === answerId);

      if (option?.bioTemplate) {
        suggestions.push(option.bioTemplate);
      }
    });
  });

  return suggestions.slice(0, 5);
}

function generateToneRecommendations(primary: string, secondary?: string): string[] {
  const toneMap: { [key: string]: string[] } = {
    'adventurer': ['Energetic', 'Spontaneous', 'Exciting'],
    'witty-banter': ['Playful', 'Sharp', 'Witty'],
    'passionate': ['Enthusiastic', 'Authentic', 'Bold'],
    'thoughtful': ['Reflective', 'Genuine', 'Thoughtful'],
    'creative': ['Original', 'Expressive', 'Imaginative'],
    'balanced': ['Warm', 'Approachable', 'Genuine']
  };

  const tones = new Set<string>();

  if (toneMap[primary]) {
    toneMap[primary].forEach(t => tones.add(t));
  }

  if (secondary && toneMap[secondary]) {
    toneMap[secondary].slice(0, 1).forEach(t => tones.add(t));
  }

  if (tones.size === 0) {
    return ['Authentic', 'Warm', 'Approachable'];
  }

  return Array.from(tones);
}
