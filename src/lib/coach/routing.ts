/**
 * Tool Routing System
 * Detecteert user intent en suggereert relevante tools
 */

import { Camera, MessageSquare, Heart, Shield, Zap, BookOpen, Target, TrendingUp, Sparkles, Users, Battery, CameraIcon, Ghost } from 'lucide-react';
import type { ToolRoute } from './types';
import type { ToolSuggestion } from '@/components/coach';

// Tool database met keywords en intents
const TOOL_ROUTES: ToolRoute[] = [
  // Profiel Tools
  {
    keywords: ['foto', 'profiel foto', 'profielfoto', 'photo', 'picture', 'selfie', 'afbeelding'],
    intent: 'profile_photo',
    toolId: 'foto-advies',
    toolName: 'Foto Advies',
    toolDescription: 'AI-analyse van je profielfoto\'s met concrete verbeterpunten',
    toolHref: '/foto',
    category: 'Profiel',
    confidence: 0.9
  },
  {
    keywords: ['bio', 'profiel tekst', 'beschrijving', 'profieltekst', 'about me', 'over mij'],
    intent: 'profile_bio',
    toolId: 'bio-generator',
    toolName: 'Bio Generator',
    toolDescription: 'Creëer een aantrekkelijke profieltekst die bij jou past',
    toolHref: '/dashboard?tab=profiel',
    category: 'Profiel',
    confidence: 0.9
  },

  // Communicatie Tools
  {
    keywords: ['opener', 'openingszin', 'eerste bericht', 'first message', 'aanspreken', 'beginnen'],
    intent: 'opening_line',
    toolId: 'openingszinnen',
    toolName: 'Openingszinnen Generator',
    toolDescription: 'Genereer persoonlijke, effectieve openingszinnen',
    toolHref: '/opener',
    category: 'Communicatie',
    confidence: 0.95
  },
  {
    keywords: ['gesprek', 'chatten', 'conversation', 'praten', 'bericht', 'reactie'],
    intent: 'conversation_help',
    toolId: 'gesprek-coach',
    toolName: 'Gesprek Coach',
    toolDescription: 'Krijg real-time advies tijdens je gesprekken',
    toolHref: '/chat',
    category: 'Communicatie',
    confidence: 0.85
  },
  {
    keywords: ['ijsbreker', 'icebreaker', 'gespreksonderwerp', 'vraag stellen'],
    intent: 'icebreaker',
    toolId: 'ijsbrekers',
    toolName: 'IJsbrekers',
    toolDescription: 'Creatieve gespreksopeners en vragen',
    toolHref: '/dashboard?tab=communicatie',
    category: 'Communicatie',
    confidence: 0.8
  },

  // Dating Tools
  {
    keywords: ['date', 'afspraak', 'date idee', 'date planning', 'wat doen'],
    intent: 'date_planning',
    toolId: 'date-planner',
    toolName: 'Date Planner',
    toolDescription: 'Plan de perfecte date met AI-suggesties',
    toolHref: '/date-planner',
    category: 'Daten',
    confidence: 0.9
  },
  {
    keywords: ['veiligheid', 'safety', 'check', 'catfish', 'oplichter', 'scam'],
    intent: 'safety_check',
    toolId: 'veiligheidscheck',
    toolName: 'Veiligheidscheck',
    toolDescription: 'Controleer profielen op rode vlaggen',
    toolHref: '/veiligheid',
    category: 'Veiligheid',
    confidence: 0.95
  },
  {
    keywords: ['match', 'platform', 'app', 'tinder', 'bumble', 'happn'],
    intent: 'platform_match',
    toolId: 'platform-match',
    toolName: 'Platform Match',
    toolDescription: 'Vind de beste dating apps voor jou',
    toolHref: '/match',
    category: 'Strategie',
    confidence: 0.8
  },

  // Assessment Tools
  {
    keywords: ['hechtingsstijl', 'attachment', 'hechting', 'binding'],
    intent: 'attachment_style',
    toolId: 'hechtingsstijl',
    toolName: 'Hechtingsstijl Scan',
    toolDescription: 'Ontdek je attachment style en patronen',
    toolHref: '/hechtingsstijl',
    category: 'Zelfinzicht',
    confidence: 0.95
  },
  {
    keywords: ['dating stijl', 'datingstijl', 'dating style', 'type'],
    intent: 'dating_style',
    toolId: 'dating-stijl',
    toolName: 'Dating Stijl Scan',
    toolDescription: 'Ontdek je unieke dating stijl',
    toolHref: '/dating-stijl-scan',
    category: 'Zelfinzicht',
    confidence: 0.95
  },
  {
    keywords: ['emotioneel', 'emotionele readiness', 'klaar', 'ready', 'readiness'],
    intent: 'emotional_readiness',
    toolId: 'emotionele-readiness',
    toolName: 'Emotionele Readiness',
    toolDescription: 'Check of je klaar bent voor daten',
    toolHref: '/emotionele-readiness',
    category: 'Zelfinzicht',
    confidence: 0.9
  },
  {
    keywords: ['zelfbeeld', 'zelfvertrouwen', 'self image', 'confidence'],
    intent: 'self_image',
    toolId: 'zelfbeeld',
    toolName: 'Zelfbeeld Assessment',
    toolDescription: 'Werk aan je zelfvertrouwen',
    toolHref: '/dashboard?tab=profiel',
    category: 'Zelfinzicht',
    confidence: 0.85
  },
  {
    keywords: ['waarden', 'values', 'waardenKompas', 'normen'],
    intent: 'values_compass',
    toolId: 'waarden-kompas',
    toolName: 'Waarden Kompas',
    toolDescription: 'Ontdek wat echt belangrijk voor je is',
    toolHref: '/waarden-kompas',
    category: 'Zelfinzicht',
    confidence: 0.9
  },

  // Transformatie 3.0 Tools
  {
    keywords: ['vibe', 'vibe check', 'uitstraling', 'emotie foto', 'hoe kom ik over', 'eerste indruk'],
    intent: 'vibe_check',
    toolId: 'vibe-check-simulator',
    toolName: 'Vibe Check Simulator',
    toolDescription: 'Ontdek hoe je foto\'s overkomen op potentiële matches',
    toolHref: '/tools/vibe-check',
    category: 'Profiel',
    confidence: 0.95
  },
  {
    keywords: ['energie', 'batterij', 'burnout', 'moe', 'uitgeput', 'introvert', 'swipen'],
    intent: 'energy_check',
    toolId: 'energie-batterij',
    toolName: 'Energie Batterij',
    toolDescription: 'Meet je sociale energie en voorkom dating burnout',
    toolHref: '/tools/energie-batterij',
    category: 'Zelfinzicht',
    confidence: 0.95
  },
  {
    keywords: ['36 vragen', 'diepgaand gesprek', 'intimiteit', 'verbinding', 'kwetsbaar'],
    intent: 'deep_conversation',
    toolId: '36-vragen-oefen-bot',
    toolName: '36 Vragen Bot',
    toolDescription: 'Oefen diepgaande gesprekken voor echte connectie',
    toolHref: '/tools/36-vragen',
    category: 'Communicatie',
    confidence: 0.95
  },
  {
    keywords: ['ghosting', 'ghost', 'geen reactie', 'stilte', 'afwijzing', 'verwerken'],
    intent: 'ghosting_support',
    toolId: 'ghosting-reframer',
    toolName: 'Ghosting Reframer',
    toolDescription: 'Verwerk ghosting-ervaringen op een gezonde manier',
    toolHref: '/tools/ghosting-reframer',
    category: 'Zelfinzicht',
    confidence: 0.95
  },

  // Leren
  {
    keywords: ['cursus', 'course', 'leren', 'training', 'les'],
    intent: 'courses',
    toolId: 'cursussen',
    toolName: 'Cursussen',
    toolDescription: 'Gestructureerde dating trainingen',
    toolHref: '/cursussen',
    category: 'Leren',
    confidence: 0.9
  }
];

/**
 * Detecteer tools op basis van user message
 */
export function detectTools(message: string, maxSuggestions: number = 3): ToolSuggestion[] {
  const lowerMessage = message.toLowerCase();
  const matches: { route: ToolRoute; score: number }[] = [];

  // Score elke tool route
  for (const route of TOOL_ROUTES) {
    let score = 0;

    // Check keywords
    for (const keyword of route.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        score += route.confidence;
      }
    }

    if (score > 0) {
      matches.push({ route, score });
    }
  }

  // Sorteer op score (hoogste eerst)
  matches.sort((a, b) => b.score - a.score);

  // Neem top N
  const topMatches = matches.slice(0, maxSuggestions);

  // Convert naar ToolSuggestion format
  return topMatches.map(match => ({
    id: match.route.toolId,
    title: match.route.toolName,
    description: match.route.toolDescription,
    icon: getIconForCategory(match.route.category),
    category: match.route.category,
    href: match.route.toolHref
  }));
}

/**
 * Get icon voor category
 */
function getIconForCategory(category: string) {
  const iconMap: Record<string, any> = {
    'Profiel': Camera,
    'Communicatie': MessageSquare,
    'Daten': Heart,
    'Veiligheid': Shield,
    'Strategie': Target,
    'Zelfinzicht': Sparkles,
    'Leren': BookOpen
  };

  return iconMap[category] || Zap;
}

/**
 * Get all available tools (voor discovery)
 */
export function getAllTools(): ToolSuggestion[] {
  return TOOL_ROUTES.map(route => ({
    id: route.toolId,
    title: route.toolName,
    description: route.toolDescription,
    icon: getIconForCategory(route.category),
    category: route.category,
    href: route.toolHref
  }));
}

/**
 * Get tools by category
 */
export function getToolsByCategory(category: string): ToolSuggestion[] {
  return TOOL_ROUTES
    .filter(route => route.category === category)
    .map(route => ({
      id: route.toolId,
      title: route.toolName,
      description: route.toolDescription,
      icon: getIconForCategory(route.category),
      category: route.category,
      href: route.toolHref
    }));
}
