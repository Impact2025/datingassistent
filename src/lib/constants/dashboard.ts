/**
 * Dashboard Constants & Configuration
 * Centralized constants for type-safe dashboard management
 */

// Tab names - single source of truth
export const DASHBOARD_TABS = {
  HOME: 'home',
  PAD: 'pad',
  COACH: 'coach',
  PROFIEL: 'profiel',
  CURSUSSEN: 'cursussen',
  SETTINGS: 'settings',
  SUBSCRIPTION: 'subscription',
  DATA_MANAGEMENT: 'data-management',

  // Legacy tabs for compatibility
  DASHBOARD: 'dashboard',
  PROFIEL_PERSOONLIJKHEID: 'profiel-persoonlijkheid',
  COMMUNICATIE_MATCHING: 'communicatie-matching',
  DATEN_RELATIES: 'daten-relaties',
  GROEI_DOELEN: 'groei-doelen',
  LEREN_ONTWIKKELEN: 'leren-ontwikkelen',
  COMMUNITY: 'community',
  BADGES: 'badges',
  DATING_ACTIVITY: 'dating-activity',
} as const;

export type DashboardTab = typeof DASHBOARD_TABS[keyof typeof DASHBOARD_TABS];

// Scan types - centralized configuration
export const SCAN_TYPES = {
  HECHTINGSSTIJL: 'hechtingsstijl',
  DATING_STYLE: 'dating-style',
  DATINGSTIJL: 'datingstijl',
  EMOTIONELE_READINESS: 'emotionele-readiness',
  LEVENSVISIE: 'levensvisie',
  RELATIEPATRONEN: 'relatiepatronen',
  BLIND_VLEKKEN: 'blind-vlekken',
} as const;

export type ScanType = typeof SCAN_TYPES[keyof typeof SCAN_TYPES];

// Scan URLs for easy reference
export const SCAN_URLS: Record<string, string> = {
  [SCAN_TYPES.HECHTINGSSTIJL]: '/hechtingsstijl',
  [SCAN_TYPES.DATING_STYLE]: '/datingstijl',
  [SCAN_TYPES.DATINGSTIJL]: '/datingstijl',
  [SCAN_TYPES.EMOTIONELE_READINESS]: '/emotionele-readiness',
  [SCAN_TYPES.LEVENSVISIE]: '/levensvisie',
  [SCAN_TYPES.RELATIEPATRONEN]: '/relatiepatronen',
  [SCAN_TYPES.BLIND_VLEKKEN]: '/blind-vlekken',
};

// Check if a URL is a scan
export const isScanUrl = (url: string): boolean => {
  return Object.values(SCAN_URLS).some(scanUrl => url.includes(scanUrl));
};

// Extract scan type from URL
export const getScanTypeFromUrl = (url: string): ScanType | null => {
  const entry = Object.entries(SCAN_URLS).find(([_, scanUrl]) => url.includes(scanUrl));
  return entry ? (entry[0] as ScanType) : null;
};

// Tab redirect map for legacy support
export const TAB_REDIRECT_MAP: Record<string, DashboardTab> = {
  'online-cursus': DASHBOARD_TABS.CURSUSSEN,
  'profiel-coach': DASHBOARD_TABS.PROFIEL_PERSOONLIJKHEID,
  'dateplanner': DASHBOARD_TABS.DATEN_RELATIES,
  'skills-assessment': DASHBOARD_TABS.LEREN_ONTWIKKELEN,
  'voortgang': DASHBOARD_TABS.GROEI_DOELEN,
  'doelen': DASHBOARD_TABS.GROEI_DOELEN,
  'profiel-analyse': DASHBOARD_TABS.PROFIEL_PERSOONLIJKHEID,
  'foto-advies': DASHBOARD_TABS.PROFIEL_PERSOONLIJKHEID,
  'gesprek-starter': DASHBOARD_TABS.COMMUNICATIE_MATCHING,
  'chat-coach': DASHBOARD_TABS.COMMUNICATIE_MATCHING,
  'recommendations': DASHBOARD_TABS.LEREN_ONTWIKKELEN,
};

// Tabs that require URL navigation
export const NAVIGATION_TABS: Record<string, string> = {
  'community-forum': '/community/forum',
  'select-package': '/select-package',
  'hechtingsstijl-redirect': '/hechtingsstijl',
  'hechtingsstijl': '/hechtingsstijl',
  'datingstijl': '/datingstijl',
};

// Loading messages for different states
export const LOADING_MESSAGES = {
  DASHBOARD: 'Dashboard laden...',
  USER_DATA: 'Je gegevens ophalen...',
  KICKSTART: 'Je ervaring voorbereiden...',
  PROGRAMS: 'Je programma\'s laden...',
  COACH: 'Coach wordt geladen...',
  CHECKING_ACCESS: 'Even geduld, we controleren je toegang',
} as const;

// Animation delays for staggered loading
export const ANIMATION_DELAYS = {
  WELCOME: 0,
  PROGRAMS: 0.05,
  TOOLS: 0.1,
  QUICK_WINS: 0.15,
  SCANS: 0.2,
  SUGGESTIONS: 0.25,
  PROGRESS: 0.3,
  GAMIFICATION: 0.4,
} as const;

// Featured tool IDs
export const FEATURED_TOOL_IDS = {
  HECHTINGSSTIJL: 'hechtingsstijl',
  PHOTO_ANALYSIS: 'photo-analysis',
  CHAT_COACH: 'chat-coach',
  OPENERS: 'openers',
} as const;

// Color mappings for consistent styling
export const COLOR_MAP: Record<string, string> = {
  pink: 'bg-pink-100 text-pink-600',
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600',
  green: 'bg-green-100 text-green-600',
  indigo: 'bg-indigo-100 text-indigo-600',
  teal: 'bg-teal-100 text-teal-600',
  orange: 'bg-orange-100 text-orange-600',
  rose: 'bg-rose-100 text-rose-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  gold: 'bg-yellow-100 text-yellow-600',
  'purple-pink': 'bg-gradient-to-br from-purple-500 to-pink-500 text-white',
};

export const BORDER_COLOR_MAP: Record<string, string> = {
  pink: 'border-pink-200 hover:border-pink-300',
  blue: 'border-blue-200 hover:border-blue-300',
  purple: 'border-purple-200 hover:border-purple-300',
  green: 'border-green-200 hover:border-green-300',
  indigo: 'border-indigo-200 hover:border-indigo-300',
  teal: 'border-teal-200 hover:border-teal-300',
  orange: 'border-orange-200 hover:border-orange-300',
  rose: 'border-rose-200 hover:border-rose-300',
  yellow: 'border-yellow-200 hover:border-yellow-300',
  gold: 'border-yellow-200 hover:border-yellow-300',
  'purple-pink': 'border-purple-300 hover:border-pink-400',
};

// Cache keys for localStorage
export const CACHE_KEYS = {
  WELCOME_VIDEO_DISMISSED: 'dashboard_welcome_video_dismissed',
  LAST_ACTIVE_TAB: 'dashboard_last_active_tab',
  ONBOARDING_COMPLETE: 'dashboard_onboarding_complete',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  USER_PROFILE: (userId: number) => `/api/user/profile?userId=${userId}`,
  JOURNEY_STATUS: (userId: number) => `/api/journey/status?userId=${userId}`,
  SCAN_STATUS: (userId: number) => `/api/scans/status?userId=${userId}`,
  ENROLLED_PROGRAMS: '/api/user/enrolled-programs',
  KICKSTART_CHECK: '/api/kickstart/check-enrollment',
  ADMIN_CHECK: '/api/auth/check-admin',
  DATING_LOG_LAST: '/api/dating-log/last-log',
} as const;

// Debug logger - only logs in development
const isDev = process.env.NODE_ENV === 'development';

export const debugLog = {
  info: (message: string, ...args: unknown[]) => {
    if (isDev) console.log(`ℹ️ ${message}`, ...args);
  },
  success: (message: string, ...args: unknown[]) => {
    if (isDev) console.log(`✅ ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    if (isDev) console.warn(`⚠️ ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    // Errors always log
    console.error(`❌ ${message}`, ...args);
  },
  action: (message: string, ...args: unknown[]) => {
    if (isDev) console.log(`🎯 ${message}`, ...args);
  },
  navigate: (message: string, ...args: unknown[]) => {
    if (isDev) console.log(`🔄 ${message}`, ...args);
  },
  render: (message: string, ...args: unknown[]) => {
    if (isDev) console.log(`🎨 ${message}`, ...args);
  },
};
