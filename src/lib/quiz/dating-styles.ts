/**
 * Dating Styles - Wereldklasse branding
 * Memorabele, shareable persoonlijkheden
 */

export interface DatingStyle {
  key: string;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  description: string;
  strengths: string[];
  challenges: string[];
  percentage: number; // Percentage of population
  scores: {
    authenticiteit: number;
    actiegericht: number;
    reflectie: number;
    openheid: number;
    stabiliteit: number;
  };
  recommendation: 'kickstart' | 'transformatie';
  famousPeople: string[];
}

export const DATING_STYLES: Record<string, DatingStyle> = {
  'architect': {
    key: 'architect',
    title: 'De Architect',
    subtitle: 'Bouwt relaties met intentie',
    emoji: '🏗️',
    color: '#6366f1', // Indigo
    description: 'Jij bent een strategische denker die relaties benadert als een meesterwerk dat gebouwd moet worden. Je neemt de tijd om een sterke fundering te leggen en elke stap bewust te zetten.',
    strengths: [
      'Diepgaande zelfreflectie',
      'Lange termijn visie',
      'Emotionele intelligentie',
      'Geduld en doorzettingsvermogen'
    ],
    challenges: [
      'Analyse paralysis',
      'Perfectionisme houdt je tegen',
      'Overdenkt elke interactie',
      'Mist spontane momenten'
    ],
    percentage: 18,
    scores: {
      authenticiteit: 85,
      actiegericht: 45,
      reflectie: 95,
      openheid: 70,
      stabiliteit: 80
    },
    recommendation: 'transformatie',
    famousPeople: ['Barack Obama', 'Emma Watson', 'Bill Gates']
  },

  'vuurwerk': {
    key: 'vuurwerk',
    title: 'Het Vuurwerk',
    subtitle: 'Laat vonken spatten',
    emoji: '🎆',
    color: '#f59e0b', // Amber
    description: 'Jij brengt energie en enthousiasme in elke interactie. Je durft risico\'s te nemen, springt in het diepe en leert door te doen. Dating is voor jou een avontuur.',
    strengths: [
      'Natuurlijk charismatisch',
      'Neemt initiatief',
      'Leert snel uit ervaring',
      'Spontaan en speels'
    ],
    challenges: [
      'Verliest interesse bij routine',
      'Oppervlakkige connecties',
      'Burn-out door te veel dates',
      'Mist diepte in gesprekken'
    ],
    percentage: 25,
    scores: {
      authenticiteit: 70,
      actiegericht: 95,
      reflectie: 40,
      openheid: 90,
      stabiliteit: 50
    },
    recommendation: 'kickstart',
    famousPeople: ['Ryan Reynolds', 'Jennifer Lawrence', 'Elon Musk']
  },

  'goudzoeker': {
    key: 'goudzoeker',
    title: 'De Goudzoeker',
    subtitle: 'Wacht op de perfecte match',
    emoji: '💎',
    color: '#ec4899', // Pink
    description: 'Jij bent selectief en neemt de tijd om de juiste persoon te vinden. Je waardeert authenticiteit boven kwantiteit en wilt een connectie die echt voelt.',
    strengths: [
      'Trouw aan je waarden',
      'Herkent red flags snel',
      'Authentiek in elk gesprek',
      'Zorgvuldig met je hart'
    ],
    challenges: [
      'Te kritisch op jezelf én anderen',
      'Laat kansen liggen',
      'Angst om verkeerde keuze te maken',
      'Isolatie door selectiviteit'
    ],
    percentage: 22,
    scores: {
      authenticiteit: 95,
      actiegericht: 35,
      reflectie: 85,
      openheid: 60,
      stabiliteit: 75
    },
    recommendation: 'transformatie',
    famousPeople: ['Keanu Reeves', 'Zendaya', 'Leonardo DiCaprio']
  },

  'magneet': {
    key: 'magneet',
    title: 'De Magneet',
    subtitle: 'Trekt de juiste mensen aan',
    emoji: '🧲',
    color: '#10b981', // Emerald
    description: 'Jij bent comfortabel in je eigen huid en dat straalt. Je weet wat je wilt, durft jezelf te zijn en trekt daardoor naturally de juiste matches aan.',
    strengths: [
      'Natuurlijk zelfvertrouwen',
      'Emotioneel beschikbaar',
      'Weet wat je wilt',
      'Authentiek en direct'
    ],
    challenges: [
      'Ongeduldig met games',
      'Kan te direct zijn',
      'Selecteert snel uit',
      'Weinig tolerantie voor bullshit'
    ],
    percentage: 15,
    scores: {
      authenticiteit: 95,
      actiegericht: 80,
      reflectie: 70,
      openheid: 85,
      stabiliteit: 90
    },
    recommendation: 'kickstart',
    famousPeople: ['Michelle Obama', 'Dwayne Johnson', 'Rihanna']
  },

  'feniks': {
    key: 'feniks',
    title: 'De Feniks',
    subtitle: 'Herrijst uit pijnlijke ervaringen',
    emoji: '🔥',
    color: '#ef4444', // Red
    description: 'Jij hebt pijnlijke dating ervaringen gehad maar bent niet gebroken. Je bent aan het herstellen, groeit en wilt het deze keer anders doen.',
    strengths: [
      'Veerkrachtig en sterk',
      'Leert van het verleden',
      'Emotioneel bewust',
      'Klaar voor iets echts'
    ],
    challenges: [
      'Draagt nog oude wonden',
      'Vermijdt kwetsbaarheid',
      'Ziet patronen overal',
      'Moeite met vertrouwen'
    ],
    percentage: 20,
    scores: {
      authenticiteit: 80,
      actiegericht: 55,
      reflectie: 90,
      openheid: 50,
      stabiliteit: 60
    },
    recommendation: 'transformatie',
    famousPeople: ['Adele', 'Matthew McConaughey', 'Lady Gaga']
  }
};

export function calculateDatingStyle(answers: Record<string, string>): string {
  // Enhanced algorithm
  const goal = answers['1'];
  const frustration = answers['2'];
  const comfort = answers['4'];
  const attachment = answers['5'];
  const timeAvailable = answers['6'];

  // Scoring logic
  const scores = {
    architect: 0,
    vuurwerk: 0,
    goudzoeker: 0,
    magneet: 0,
    feniks: 0
  };

  // Attachment style (strongest indicator)
  if (attachment === 'secure') {
    scores.magneet += 40;
    scores.architect += 20;
  } else if (attachment === 'anxious') {
    scores.feniks += 40;
    scores.goudzoeker += 20;
  } else if (attachment === 'avoidant') {
    scores.feniks += 30;
    scores.vuurwerk += 20;
  } else if (attachment === 'fearful') {
    scores.feniks += 35;
    scores.goudzoeker += 25;
  }

  // Comfort level
  if (comfort === 'very_comfortable') {
    scores.magneet += 30;
    scores.vuurwerk += 20;
  } else if (comfort === 'comfortable') {
    scores.architect += 20;
    scores.magneet += 15;
  } else if (comfort === 'okay') {
    scores.architect += 25;
    scores.goudzoeker += 20;
  } else {
    scores.goudzoeker += 30;
    scores.feniks += 20;
  }

  // Goal
  if (goal === 'serious') {
    scores.architect += 20;
    scores.goudzoeker += 20;
  } else if (goal === 'casual') {
    scores.vuurwerk += 30;
  } else {
    scores.feniks += 15;
  }

  // Frustration
  if (frustration === 'conversations_die') {
    scores.goudzoeker += 15;
    scores.architect += 10;
  } else if (frustration === 'no_matches') {
    scores.architect += 15;
  } else if (frustration === 'no_relationships') {
    scores.feniks += 20;
    scores.architect += 15;
  }

  // Time available
  if (timeAvailable === '5+') {
    scores.vuurwerk += 15;
    scores.magneet += 10;
  } else if (timeAvailable === '1-2') {
    scores.architect += 15;
    scores.goudzoeker += 10;
  }

  // Find highest score
  const entries = Object.entries(scores);
  entries.sort((a, b) => b[1] - a[1]);

  return entries[0][0];
}

export function getRandomTestimonial(styleKey: string): string {
  const testimonials: Record<string, string[]> = {
    architect: [
      '"Eindelijk iemand die begrijpt dat dating meer is dan swipen." - Lisa, 28',
      '"De structuur gaf me de rust om authentiek te blijven." - Mark, 32'
    ],
    vuurwerk: [
      '"Ik leerde mijn energie te focussen op quality over quantity." - Sophie, 25',
      '"Van 50 matches naar 5 échte dates. Game changer." - David, 29'
    ],
    goudzoeker: [
      '"Ik dacht dat ik te kieskeurig was, maar dit leerde me mijn waarde kennen." - Emma, 31',
      '"Minder daten, betere matches. Precies wat ik nodig had." - Tom, 34'
    ],
    magneet: [
      '"Bevestigde wat ik al wist: ik ben op de goede weg." - Sarah, 27',
      '"Gaf me de laatste push om voor mijzelf te kiezen." - Alex, 30'
    ],
    feniks: [
      '"Hielp me om oude patronen los te laten en opnieuw te beginnen." - Nina, 33',
      '"Van bang voor dating naar excited voor nieuwe connecties." - Chris, 29'
    ]
  };

  const options = testimonials[styleKey] || testimonials['architect'];
  return options[Math.floor(Math.random() * options.length)];
}
