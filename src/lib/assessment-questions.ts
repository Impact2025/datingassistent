/**
 * DatingAssistent - Assessment Questions Configuration
 * Sprint 2: Outcome-Based Program Recommendation
 *
 * 7 carefully designed questions to match users with the right program
 */

export interface AssessmentOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  // Scoring weights for each program
  scores: {
    kickstart: number;    // 0-10
    transformatie: number; // 0-10
    vip: number;          // 0-10
  };
}

export interface AssessmentQuestion {
  id: number;
  key: string; // database column name
  question: string;
  subtitle?: string;
  type: 'single-choice' | 'multiple-choice';
  options: AssessmentOption[];
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // Question 1: Dating Goal
  {
    id: 1,
    key: 'question_1',
    question: 'Wat is je belangrijkste dating doel?',
    subtitle: 'Kies wat het beste bij je past',
    type: 'single-choice',
    options: [
      {
        value: 'relatie',
        label: 'Een serieuze relatie vinden',
        description: 'Ik zoek een langdurige, betekenisvolle relatie',
        icon: '❤️',
        scores: { kickstart: 3, transformatie: 10, vip: 8 }
      },
      {
        value: 'dates',
        label: 'Meer en betere dates',
        description: 'Ik wil vaker op date en met mensen die echt bij me passen',
        icon: '🌟',
        scores: { kickstart: 8, transformatie: 7, vip: 5 }
      },
      {
        value: 'zelfvertrouwen',
        label: 'Zelfvertrouwen opbouwen',
        description: 'Ik wil zekerder worden in daten en mezelf presenteren',
        icon: '💪',
        scores: { kickstart: 5, transformatie: 9, vip: 10 }
      },
      {
        value: 'exploreren',
        label: 'Ontdekken wat ik zoek',
        description: 'Ik ben aan het experimenteren en wil uitvinden wat ik wil',
        icon: '🎯',
        scores: { kickstart: 10, transformatie: 6, vip: 3 }
      }
    ]
  },

  // Question 2: Biggest Challenge
  {
    id: 2,
    key: 'question_2',
    question: 'Wat is je grootste uitdaging in dating?',
    subtitle: 'Waar loop je het meest tegenaan?',
    type: 'single-choice',
    options: [
      {
        value: 'profiel',
        label: 'Mijn profiel werkt niet',
        description: 'Weinig matches of niet de juiste mensen',
        icon: '📸',
        scores: { kickstart: 10, transformatie: 5, vip: 3 }
      },
      {
        value: 'gesprekken',
        label: 'Gesprekken op gang houden',
        description: 'Ik weet niet wat ik moet zeggen of gesprekken doodbloeden',
        icon: '💬',
        scores: { kickstart: 8, transformatie: 8, vip: 6 }
      },
      {
        value: 'dates',
        label: 'Van chat naar date komen',
        description: 'Gesprekken leiden niet tot echte ontmoetingen',
        icon: '📅',
        scores: { kickstart: 6, transformatie: 9, vip: 7 }
      },
      {
        value: 'patronen',
        label: 'Doorbreken van oude patronen',
        description: 'Ik blijf dezelfde fouten maken of trek verkeerde mensen aan',
        icon: '🔄',
        scores: { kickstart: 2, transformatie: 10, vip: 10 }
      }
    ]
  },

  // Question 3: Time Commitment
  {
    id: 3,
    key: 'question_3',
    question: 'Hoeveel tijd kun je investeren per week?',
    subtitle: 'Realistisch inschatten helpt ons je beter te begeleiden',
    type: 'single-choice',
    options: [
      {
        value: '1-2u',
        label: '1-2 uur per week',
        description: 'Ik heb weinig tijd, maar wil wel vooruitgang',
        icon: '⏰',
        scores: { kickstart: 10, transformatie: 3, vip: 2 }
      },
      {
        value: '3-5u',
        label: '3-5 uur per week',
        description: 'Ik kan regelmatig tijd vrijmaken',
        icon: '📆',
        scores: { kickstart: 7, transformatie: 8, vip: 5 }
      },
      {
        value: '5-10u',
        label: '5-10 uur per week',
        description: 'Dating is een prioriteit voor mij',
        icon: '🎯',
        scores: { kickstart: 4, transformatie: 10, vip: 8 }
      },
      {
        value: '10+u',
        label: '10+ uur per week',
        description: 'Ik wil er echt voor gaan en veel tijd investeren',
        icon: '🚀',
        scores: { kickstart: 2, transformatie: 7, vip: 10 }
      }
    ]
  },

  // Question 4: Experience Level
  {
    id: 4,
    key: 'question_4',
    question: 'Wat is je ervaring met online dating?',
    subtitle: 'Geen oordeel - we passen de begeleiding aan op jouw niveau',
    type: 'single-choice',
    options: [
      {
        value: 'nieuw',
        label: 'Helemaal nieuw',
        description: 'Ik ben net begonnen of nog niet actief',
        icon: '🌱',
        scores: { kickstart: 10, transformatie: 6, vip: 4 }
      },
      {
        value: 'beginner',
        label: 'Beginner (< 6 maanden)',
        description: 'Ik heb het geprobeerd maar weinig succes gehad',
        icon: '📚',
        scores: { kickstart: 9, transformatie: 8, vip: 5 }
      },
      {
        value: 'ervaren',
        label: 'Ervaren (6+ maanden)',
        description: 'Ik date al een tijdje maar wil betere resultaten',
        icon: '💡',
        scores: { kickstart: 5, transformatie: 10, vip: 8 }
      },
      {
        value: 'expert',
        label: 'Expert (jaren actief)',
        description: 'Ik heb veel ervaring maar loop vast of wil dieper',
        icon: '🎓',
        scores: { kickstart: 2, transformatie: 7, vip: 10 }
      }
    ]
  },

  // Question 5: Support Preference
  {
    id: 5,
    key: 'question_5',
    question: 'Welk type begeleiding past bij jou?',
    subtitle: 'Hoe werk jij het liefst aan je groei?',
    type: 'single-choice',
    options: [
      {
        value: 'zelfstandig',
        label: 'Zelfstandig met tools',
        description: 'Ik pak dingen graag zelf op met de juiste tools',
        icon: '🛠️',
        scores: { kickstart: 10, transformatie: 5, vip: 2 }
      },
      {
        value: 'ai-hulp',
        label: '24/7 AI coaching',
        description: 'Ik wil altijd hulp kunnen vragen aan AI',
        icon: '🤖',
        scores: { kickstart: 8, transformatie: 9, vip: 6 }
      },
      {
        value: 'intensief',
        label: 'Intensieve begeleiding',
        description: 'Ik wil een compleet systeem met veel structuur',
        icon: '📊',
        scores: { kickstart: 4, transformatie: 10, vip: 8 }
      },
      {
        value: 'persoonlijk',
        label: 'Persoonlijke 1-op-1 coaching',
        description: 'Ik wil direct contact met een menselijke coach',
        icon: '👨‍🏫',
        scores: { kickstart: 1, transformatie: 5, vip: 10 }
      }
    ]
  },

  // Question 6: Budget/Investment
  {
    id: 6,
    key: 'question_6',
    question: 'Wat wil je investeren in je dating succes?',
    subtitle: 'Eerlijk zijn helpt ons het juiste programma aan te bevelen',
    type: 'single-choice',
    options: [
      {
        value: '<100',
        label: 'Onder €100',
        description: 'Ik wil klein beginnen en kijken wat het brengt',
        icon: '💰',
        scores: { kickstart: 10, transformatie: 3, vip: 0 }
      },
      {
        value: '100-300',
        label: '€100 - €300',
        description: 'Ik zie de waarde en wil serieus investeren',
        icon: '💎',
        scores: { kickstart: 7, transformatie: 10, vip: 3 }
      },
      {
        value: '300-1000',
        label: '€300 - €1000',
        description: 'Dating is belangrijk genoeg voor een flinke investering',
        icon: '👑',
        scores: { kickstart: 3, transformatie: 8, vip: 8 }
      },
      {
        value: '1000+',
        label: '€1000+',
        description: 'Ik wil het beste resultaat en investeer daar graag in',
        icon: '✨',
        scores: { kickstart: 0, transformatie: 4, vip: 10 }
      }
    ]
  },

  // Question 7: Timeline
  {
    id: 7,
    key: 'question_7',
    question: 'Wanneer wil je resultaat zien?',
    subtitle: 'Realistische verwachtingen leiden tot beter succes',
    type: 'single-choice',
    options: [
      {
        value: '1-maand',
        label: 'Binnen 1 maand',
        description: 'Ik wil snel een paar quick wins en verbetering zien',
        icon: '⚡',
        scores: { kickstart: 10, transformatie: 4, vip: 2 }
      },
      {
        value: '3-maanden',
        label: '3 maanden',
        description: 'Ik wil een echte transformatie in een kwartaal',
        icon: '🎯',
        scores: { kickstart: 6, transformatie: 10, vip: 7 }
      },
      {
        value: '6-maanden',
        label: '6 maanden',
        description: 'Ik wil diepe verandering en neem de tijd',
        icon: '🌳',
        scores: { kickstart: 3, transformatie: 7, vip: 10 }
      },
      {
        value: 'flexibel',
        label: 'Flexibel / Geen haast',
        description: 'Kwaliteit boven snelheid, ik ga in mijn eigen tempo',
        icon: '🧘',
        scores: { kickstart: 5, transformatie: 8, vip: 9 }
      }
    ]
  }
];

/**
 * Calculate program scores based on assessment answers
 */
export function calculateProgramScores(answers: Record<string, string>): {
  kickstart: number;
  transformatie: number;
  vip: number;
} {
  const scores = {
    kickstart: 0,
    transformatie: 0,
    vip: 0
  };

  ASSESSMENT_QUESTIONS.forEach(question => {
    const answer = answers[question.key];
    if (!answer) return;

    const selectedOption = question.options.find(opt => opt.value === answer);
    if (selectedOption) {
      scores.kickstart += selectedOption.scores.kickstart;
      scores.transformatie += selectedOption.scores.transformatie;
      scores.vip += selectedOption.scores.vip;
    }
  });

  return scores;
}

/**
 * Get recommended program based on scores
 */
export function getRecommendedProgram(answers: Record<string, string>): {
  program: 'kickstart' | 'transformatie' | 'vip-reis';
  confidence: number;
  scores: { kickstart: number; transformatie: number; vip: number };
} {
  const scores = calculateProgramScores(answers);

  // Find highest score
  const maxScore = Math.max(scores.kickstart, scores.transformatie, scores.vip);
  const totalScore = scores.kickstart + scores.transformatie + scores.vip;

  // Calculate confidence (how much higher is the winner vs others)
  const confidence = Math.round((maxScore / totalScore) * 100);

  let program: 'kickstart' | 'transformatie' | 'vip-reis';
  if (scores.vip === maxScore) {
    program = 'vip-reis';
  } else if (scores.transformatie === maxScore) {
    program = 'transformatie';
  } else {
    program = 'kickstart';
  }

  return { program, confidence, scores };
}
