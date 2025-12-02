/**
 * Recommendation Algorithm for User Onboarding
 * Determines the best learning path and tools based on user intake
 */

export interface IntakeData {
  primaryGoal: string;
  biggestChallenge: string;
  experienceLevel: number; // 1-3
}

export interface RecommendationResult {
  path: 'profile' | 'conversation' | 'dating' | 'confidence';
  priorityTools: string[];
  irisPersonality: 'supportive' | 'direct' | 'motivational';
  pathTitle: string;
  pathDescription: string;
}

// Challenge to path mapping
const CHALLENGE_PATH_MAP: Record<string, RecommendationResult['path']> = {
  'weinig-matches': 'profile',
  'gesprekken-dood': 'conversation',
  'geen-dates': 'dating',
  'geen-zelfvertrouwen': 'confidence',
  'fotos-niet-goed': 'profile',
  'weet-niet-wat-zeggen': 'conversation',
};

// Priority tools per path
const PATH_TOOLS_MAP: Record<RecommendationResult['path'], string[]> = {
  profile: ['profiel-analyse', 'bio-builder', 'foto-coach'],
  conversation: ['chat-coach', 'eerste-bericht', 'gespreksstarters'],
  dating: ['date-prep', 'gespreksonderwerpen', 'date-coach'],
  confidence: ['zelfbeeld-analyse', 'affirmaties', 'profiel-analyse'],
};

// Path metadata
const PATH_INFO: Record<RecommendationResult['path'], { title: string; description: string }> = {
  profile: {
    title: 'Profiel Optimalisatie',
    description: 'Verbeter je profiel om meer en betere matches te krijgen',
  },
  conversation: {
    title: 'Gesprekstechnieken',
    description: 'Leer boeiende gesprekken voeren die naar dates leiden',
  },
  dating: {
    title: 'Date Succes',
    description: 'Van match naar memorabele dates die indruk maken',
  },
  confidence: {
    title: 'Zelfvertrouwen Boost',
    description: 'Bouw een sterk fundament van zelfvertrouwen op',
  },
};

/**
 * Calculate the recommended path based on user intake data
 */
export function getRecommendedPath(intake: IntakeData): RecommendationResult {
  const { biggestChallenge, experienceLevel } = intake;

  // Determine path from challenge
  const path = CHALLENGE_PATH_MAP[biggestChallenge] || 'profile';

  // Get priority tools for this path
  const priorityTools = PATH_TOOLS_MAP[path];

  // Determine Iris personality based on experience level
  let irisPersonality: RecommendationResult['irisPersonality'];
  if (experienceLevel === 1) {
    irisPersonality = 'supportive'; // More encouraging for beginners
  } else if (experienceLevel === 2) {
    irisPersonality = 'motivational'; // Push them forward
  } else {
    irisPersonality = 'direct'; // Straight to the point for experts
  }

  // Get path info
  const pathInfo = PATH_INFO[path];

  return {
    path,
    priorityTools,
    irisPersonality,
    pathTitle: pathInfo.title,
    pathDescription: pathInfo.description,
  };
}

/**
 * Get tool details for display
 */
export function getToolDetails(toolSlug: string): {
  name: string;
  description: string;
  icon: string;
  estimatedTime: string;
} | null {
  const tools: Record<string, { name: string; description: string; icon: string; estimatedTime: string }> = {
    'profiel-analyse': {
      name: 'AI Profiel Analyse',
      description: 'Laat AI je profiel analyseren en krijg concrete verbeterpunten',
      icon: '🔍',
      estimatedTime: '5 min',
    },
    'bio-builder': {
      name: 'Bio Builder',
      description: 'Genereer een pakkende bio die jouw persoonlijkheid laat zien',
      icon: '✍️',
      estimatedTime: '3 min',
    },
    'foto-coach': {
      name: 'Foto Coach',
      description: 'Krijg feedback op je foto\'s en tips voor betere profielfoto\'s',
      icon: '📸',
      estimatedTime: '5 min',
    },
    'chat-coach': {
      name: 'Chat Coach',
      description: 'Real-time begeleiding bij je gesprekken',
      icon: '💬',
      estimatedTime: 'Doorlopend',
    },
    'eerste-bericht': {
      name: 'Eerste Bericht Generator',
      description: 'Creëer opvallende eerste berichten die reacties krijgen',
      icon: '👋',
      estimatedTime: '2 min',
    },
    'gespreksstarters': {
      name: 'Gespreksstarters',
      description: 'Nooit meer een awkward stilte met deze gespreksopeners',
      icon: '🎯',
      estimatedTime: '1 min',
    },
    'date-prep': {
      name: 'Date Voorbereiding',
      description: 'Bereid je perfect voor op je date',
      icon: '📅',
      estimatedTime: '5 min',
    },
    'gespreksonderwerpen': {
      name: 'Gespreksonderwerpen',
      description: 'Interessante onderwerpen om over te praten tijdens je date',
      icon: '🗣️',
      estimatedTime: '3 min',
    },
    'date-coach': {
      name: 'Date Coach',
      description: 'Live begeleiding tijdens en na je date',
      icon: '🎭',
      estimatedTime: 'Doorlopend',
    },
    'zelfbeeld-analyse': {
      name: 'Zelfbeeld Analyse',
      description: 'Ontdek je sterke punten en werk aan je mindset',
      icon: '🪞',
      estimatedTime: '10 min',
    },
    'affirmaties': {
      name: 'Dagelijkse Affirmaties',
      description: 'Bouw zelfvertrouwen met gepersonaliseerde affirmaties',
      icon: '💪',
      estimatedTime: '2 min/dag',
    },
  };

  return tools[toolSlug] || null;
}

/**
 * Get roadmap phases based on path
 */
export function getRoadmapPhases(path: RecommendationResult['path']) {
  const phases = {
    profile: [
      {
        week: '1-3',
        title: 'Fundament',
        subtitle: 'Profiel optimalisatie',
        tools: ['profiel-analyse', 'foto-coach', 'bio-builder'],
        focus: 'Maak je profiel onweerstaanbaar',
      },
      {
        week: '4-8',
        title: 'Connectie',
        subtitle: 'Gesprekstechnieken',
        tools: ['eerste-bericht', 'chat-coach', 'gespreksstarters'],
        focus: 'Leer connecties maken die leiden tot dates',
      },
      {
        week: '9-12',
        title: 'Dates',
        subtitle: 'Van match naar relatie',
        tools: ['date-prep', 'date-coach', 'gespreksonderwerpen'],
        focus: 'Maak van dates succesvolle connecties',
      },
    ],
    conversation: [
      {
        week: '1-3',
        title: 'Fundament',
        subtitle: 'Gespreksbasis',
        tools: ['chat-coach', 'eerste-bericht', 'gespreksstarters'],
        focus: 'Leer de basis van goede gesprekken',
      },
      {
        week: '4-8',
        title: 'Verdieping',
        subtitle: 'Diepere connecties',
        tools: ['profiel-analyse', 'bio-builder'],
        focus: 'Maak echte connecties via je gesprekken',
      },
      {
        week: '9-12',
        title: 'Dates',
        subtitle: 'Gesprekken op dates',
        tools: ['date-prep', 'date-coach', 'gespreksonderwerpen'],
        focus: 'Vertaal je online gesprekken naar geweldige dates',
      },
    ],
    dating: [
      {
        week: '1-3',
        title: 'Fundament',
        subtitle: 'Date mindset',
        tools: ['date-prep', 'zelfbeeld-analyse'],
        focus: 'Bouw het juiste mindset voor dates',
      },
      {
        week: '4-8',
        title: 'Praktijk',
        subtitle: 'Date skills',
        tools: ['date-coach', 'gespreksonderwerpen', 'gespreksstarters'],
        focus: 'Oefen en verbeter je date skills',
      },
      {
        week: '9-12',
        title: 'Mastery',
        subtitle: 'Relatie bouwen',
        tools: ['chat-coach', 'affirmaties'],
        focus: 'Maak van dates betekenisvolle relaties',
      },
    ],
    confidence: [
      {
        week: '1-3',
        title: 'Fundament',
        subtitle: 'Zelfkennis',
        tools: ['zelfbeeld-analyse', 'affirmaties'],
        focus: 'Ontdek je sterke punten en werk aan je mindset',
      },
      {
        week: '4-8',
        title: 'Groei',
        subtitle: 'Profiel & Communicatie',
        tools: ['profiel-analyse', 'bio-builder', 'foto-coach'],
        focus: 'Presenteer jezelf met zelfvertrouwen',
      },
      {
        week: '9-12',
        title: 'Actie',
        subtitle: 'In de praktijk',
        tools: ['chat-coach', 'date-prep', 'date-coach'],
        focus: 'Pas je nieuwe zelfvertrouwen toe in de praktijk',
      },
    ],
  };

  return phases[path];
}
