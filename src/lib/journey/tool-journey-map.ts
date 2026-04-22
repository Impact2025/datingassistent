/**
 * tool-journey-map.ts — Centrale bron: welke tool hoort bij welk moment in de reis
 *
 * Gebruikt door:
 *  - ModuleToolCard (Transformatie lessen)
 *  - EnhancedPadTab (5-fase reis)
 *  - VandaagTab (dagelijkse suggestie)
 *  - Profiel Toolkit (escape hatch)
 */

export interface JourneyTool {
  name: string;
  description: string;
  duration: string;
  route: string;
  icon: string;          // naam van lucide icon
  color: 'coral' | 'blue' | 'purple' | 'green' | 'amber';
  cta: string;           // knoptekst
  journeyPhase: 1 | 2 | 3 | 4 | 5;
  isScan?: boolean;      // true = assessment/scan, false = interactieve tool
}

// ─── Gedeelde tool definities ────────────────────────────────────────────────

const HECHTINGSSTIJL: JourneyTool = {
  name: 'Hechtingsstijl Scan',
  description: 'Begrijp hoe jouw gehechtheidspatroon je datingleven beïnvloedt',
  duration: '15 min',
  route: '/hechtingsstijl',
  icon: 'Heart',
  color: 'coral',
  cta: 'Start Hechtingsstijl Scan',
  journeyPhase: 1,
  isScan: true,
};

const WAARDEN_KOMPAS: JourneyTool = {
  name: 'Waarden Kompas',
  description: 'Ontdek jouw kernwaarden en wat je écht zoekt in een relatie',
  duration: '10 min',
  route: '/waarden-kompas',
  icon: 'Compass',
  color: 'coral',
  cta: 'Open Waarden Kompas',
  journeyPhase: 1,
  isScan: false,
};

const EMOTIONELE_READINESS: JourneyTool = {
  name: 'Emotionele Readiness Check',
  description: 'Ben jij emotioneel klaar voor dating? Check het in 4 minuten',
  duration: '4 min',
  route: '/emotionele-readiness',
  icon: 'Brain',
  color: 'blue',
  cta: 'Start Readiness Check',
  journeyPhase: 1,
  isScan: true,
};

const VIBE_CHECK: JourneyTool = {
  name: 'Vibe Check Simulator',
  description: 'Transformeer je profiel naar een magnetische aanwezigheid',
  duration: '12 min',
  route: '/tools/vibe-check',
  icon: 'Zap',
  color: 'purple',
  cta: 'Start Vibe Check',
  journeyPhase: 2,
  isScan: false,
};

const ENERGIE_BATTERIJ: JourneyTool = {
  name: 'Energie Batterij',
  description: 'Slim swipen zonder burnout — ontdek jouw datingritme',
  duration: '8 min',
  route: '/tools/energie-batterij',
  icon: 'Zap',
  color: 'green',
  cta: 'Check je Energie Batterij',
  journeyPhase: 2,
  isScan: false,
};

const VRAGEN_BOT: JourneyTool = {
  name: '36 Vragen Bot',
  description: "Oefen diepgaande gesprekken met Arthur Aron's 36 vragen",
  duration: '20 min',
  route: '/tools/36-vragen',
  icon: 'MessageCircle',
  color: 'blue',
  cta: 'Start 36 Vragen',
  journeyPhase: 3,
  isScan: false,
};

const CHAT_COACH: JourneyTool = {
  name: 'Chat Coach AI',
  description: 'Verbeter je chatgesprekken met real-time AI coaching',
  duration: 'Doorlopend',
  route: '/chat',
  icon: 'MessageCircle',
  color: 'blue',
  cta: 'Open Chat Coach',
  journeyPhase: 3,
  isScan: false,
};

const DATE_IDEAS: JourneyTool = {
  name: 'Date Ideeën Generator',
  description: 'Unieke en creatieve date-ideeën op maat voor jouw situatie',
  duration: '5 min',
  route: '/date-planner',
  icon: 'Calendar',
  color: 'amber',
  cta: 'Genereer Date Ideeën',
  journeyPhase: 4,
  isScan: false,
};

const GHOSTING_REFRAMER: JourneyTool = {
  name: 'Ghosting Reframer',
  description: 'Verwerk afwijzing vanuit kracht met narratieve therapie',
  duration: '10 min',
  route: '/tools/ghosting-reframer',
  icon: 'Heart',
  color: 'purple',
  cta: 'Open Ghosting Reframer',
  journeyPhase: 5,
  isScan: false,
};

const RELATIEPATRONEN: JourneyTool = {
  name: 'Relatiepatronen Analyse',
  description: 'Herken terugkerende patronen en ontdek groeistrategieën',
  duration: '20 min',
  route: '/dashboard?tab=profiel',
  icon: 'Repeat',
  color: 'purple',
  cta: 'Start Relatiepatronen Analyse',
  journeyPhase: 5,
  isScan: true,
};

const GOAL_TRACKER: JourneyTool = {
  name: 'Goal Tracker',
  description: 'Consolideer je groei en stel je toekomstdoelen vast',
  duration: '15 min',
  route: '/dashboard?tab=profiel',
  icon: 'Target',
  color: 'green',
  cta: 'Open Goal Tracker',
  journeyPhase: 5,
  isScan: false,
};

// ─── Transformatie: ai_tool_name (DB) → tool config ──────────────────────────

export const TRANSFORMATIE_TOOL_MAP: Record<string, JourneyTool> = {
  // Module 1 — Design Your Love Life
  'Waarden Kompas':        WAARDEN_KOMPAS,
  // Module 2 — Jouw Relatie-DNA
  'Hechtingsstijl Scan':   HECHTINGSSTIJL,
  // Module 3 — Magnetische Identiteit
  'Vibe Check Simulator':  VIBE_CHECK,
  // Module 4 — Bewust Matchen
  'Energie Batterij':      ENERGIE_BATTERIJ,
  // Module 5 — Verbinding & Diepgang
  '36 Vragen Bot':         VRAGEN_BOT,
  // Module 6 — De Selectie & Veiligheid
  'Match Analyse': {
    name: 'Match Analyse',
    description: 'Onderscheid chemie van compatibiliteit bij potentiële matches',
    duration: '10 min',
    route: '/dashboard?tab=profiel',
    icon: 'Target',
    color: 'blue',
    cta: 'Open Match Analyse',
    journeyPhase: 4,
    isScan: false,
  },
  // Module 7 — De Ontmoeting
  'Date Planner':          DATE_IDEAS,
  // Module 8 — Communicatie Meesterschap
  'Chat Coach':            CHAT_COACH,
  'Gesprek Coach':         CHAT_COACH,
  // Module 9 — De Transitie
  'Relationship Coach': {
    name: 'Relationship Coach',
    description: 'Persoonlijk advies voor relatieopbouw en de DTR-conversatie',
    duration: 'Doorlopend',
    route: '/dashboard?tab=coach',
    icon: 'Heart',
    color: 'coral',
    cta: 'Open Relationship Coach',
    journeyPhase: 5,
    isScan: false,
  },
  // Module 11 — Integratie & Veerkracht
  'Ghosting Reframer':     GHOSTING_REFRAMER,
  // Module 12 — Onbreekbare Mindset
  'Goal Tracker':          GOAL_TRACKER,
  // Extra tools referenced in AI_TOOL_ROUTES
  'Dating Stijl Scan': {
    name: 'Dating Stijl Scan',
    description: 'Ontdek je datingpatronen en blinde vlekken',
    duration: '15 min',
    route: '/dating-stijl-scan',
    icon: 'Target',
    color: 'purple',
    cta: 'Start Dating Stijl Scan',
    journeyPhase: 1,
    isScan: true,
  },
  'Emotionele Readiness':  EMOTIONELE_READINESS,
  'Foto Advies': {
    name: 'Foto Analyse',
    description: "AI-feedback op je profielfoto's voor meer matches",
    duration: '5 min',
    route: '/foto',
    icon: 'Camera',
    color: 'amber',
    cta: "Analyseer mijn foto's",
    journeyPhase: 2,
    isScan: false,
  },
  'Bio Generator': {
    name: 'Bio Generator',
    description: "Genereer een unieke profieltekst die jou écht laat zien",
    duration: '8 min',
    route: '/dashboard?tab=profiel',
    icon: 'FileText',
    color: 'green',
    cta: 'Genereer mijn bio',
    journeyPhase: 2,
    isScan: false,
  },
};

// ─── 5-fase reis: fase nummer → tools (in volgorde van introductie) ───────────

export const PHASE_TOOLS_MAP: Record<number, JourneyTool[]> = {
  1: [HECHTINGSSTIJL, EMOTIONELE_READINESS, WAARDEN_KOMPAS],
  2: [
    {
      name: 'Profiel Bouwer',
      description: 'Bouw een aantrekkelijk profiel met AI-begeleiding',
      duration: '20 min',
      route: '/dashboard?tab=profiel',
      icon: 'User',
      color: 'blue',
      cta: 'Start Profiel Bouwer',
      journeyPhase: 2,
      isScan: false,
    },
    VIBE_CHECK,
    {
      name: 'Platform Match Tool',
      description: 'Ontdek welke dating-app het beste bij jou past',
      duration: '5 min',
      route: '/dashboard?tab=profiel',
      icon: 'Sparkles',
      color: 'green',
      cta: 'Vind mijn platform',
      journeyPhase: 2,
      isScan: false,
    },
  ],
  3: [
    {
      name: 'Bio Generator',
      description: "Genereer een profieltekst die jou écht laat zien",
      duration: '8 min',
      route: '/dashboard?tab=profiel',
      icon: 'FileText',
      color: 'green',
      cta: 'Genereer mijn bio',
      journeyPhase: 3,
      isScan: false,
    },
    {
      name: 'Openingszinnen Generator',
      description: 'Genereer effectieve openingsberichten voor meer reacties',
      duration: '5 min',
      route: '/dashboard?tab=tools',
      icon: 'MessageCircle',
      color: 'blue',
      cta: 'Genereer openingszinnen',
      journeyPhase: 3,
      isScan: false,
    },
    CHAT_COACH,
  ],
  4: [
    DATE_IDEAS,
    {
      name: 'Dating Activity Logger',
      description: 'Log je dates en reflecteer op je voortgang',
      duration: '5 min',
      route: '/dashboard?tab=profiel',
      icon: 'TrendingUp',
      color: 'green',
      cta: 'Open Logger',
      journeyPhase: 4,
      isScan: false,
    },
  ],
  5: [RELATIEPATRONEN, GHOSTING_REFRAMER, GOAL_TRACKER],
};

// ─── Lookup functies ──────────────────────────────────────────────────────────

export function getToolForModuleName(aiToolName: string): JourneyTool | null {
  return TRANSFORMATIE_TOOL_MAP[aiToolName] ?? null;
}

export function getToolsForPhase(phase: number): JourneyTool[] {
  return PHASE_TOOLS_MAP[phase] ?? [];
}

export function getAllTools(): JourneyTool[] {
  return Object.values(TRANSFORMATIE_TOOL_MAP);
}
