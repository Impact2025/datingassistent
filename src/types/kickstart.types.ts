// ============================================
// KICKSTART 21-DAGEN TYPES
// Wereldklasse TypeScript definities
// ============================================

// ============================================
// VIDEO SCRIPT TYPES
// ============================================
export interface VideoSection {
  titel: string;
  content: string;
}

export interface VideoScript {
  hook: string;
  intro: string;
  secties: VideoSection[];
  opdracht: string;
  outro: string;
}

// ============================================
// QUIZ TYPES
// ============================================
export interface QuizOption {
  tekst: string;
  correct: boolean;
}

export interface QuizQuestion {
  vraag: string;
  opties: QuizOption[];
  feedback_correct: string;
  feedback_incorrect: string;
}

export interface Quiz {
  vragen: QuizQuestion[];
}

export interface QuizAnswer {
  questionIndex: number;
  selectedOptionIndex: number;
  isCorrect: boolean;
}

// ============================================
// REFLECTIE TYPES
// ============================================
export interface ReflectieItem {
  type: string; // 'spiegel', 'identiteit', 'actie'
  titel: string;
  beschrijving: string;
  vraag: string;
  emoji?: string;
}

export interface Reflectie {
  // Legacy single question format
  vraag?: string;
  doel?: string;
  // New multiple questions format
  items?: ReflectieItem[];
}

// ============================================
// WERKBOEK TYPES
// ============================================
export interface Werkboek {
  titel: string;
  stappen: string[];
}

export interface WerkboekAnswer {
  stap: string;
  antwoord: string;
  completed: boolean;
}

// ============================================
// UPSELL TYPES
// ============================================
export interface Upsell {
  programma: string;
  korting_cents: number;
  boodschap: string;
}

// ============================================
// DAY TYPES
// ============================================
export type DayType = 'VIDEO' | 'LIVE' | 'EXERCISE' | 'REVIEW';

export interface ProgramDay {
  id: number;
  week_id: number;
  program_id: number;
  dag_nummer: number;
  titel: string;
  emoji: string;
  dag_type: DayType;
  duur_minuten: number;

  // AI Tool
  ai_tool: string | null;
  ai_tool_slug: string | null;

  // Video
  video_url: string | null;
  video_thumbnail: string | null;
  video_script: VideoScript | null;

  // Interactive content
  quiz: Quiz | null;
  reflectie: Reflectie | null;
  werkboek: Werkboek | null;
  upsell: Upsell | null;

  // Metadata
  unlock_na_dag: number | null;
  is_preview: boolean;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// WEEK TYPES
// ============================================
export interface ProgramWeek {
  id: number;
  program_id: number;
  week_nummer: number;
  titel: string;
  thema: string;
  kpi: string;
  emoji: string;
  is_published: boolean;
  created_at: string;

  // Enriched data
  days?: ProgramDay[];
  progress?: WeekProgress;
}

// ============================================
// PROGRESS TYPES
// ============================================
export type DayStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface DayProgress {
  id: number;
  user_id: number;
  program_id: number;
  day_id: number;
  status: DayStatus;
  started_at: string | null;
  completed_at: string | null;

  // Video
  video_watched_seconds: number;
  video_completed: boolean;

  // Quiz
  quiz_completed: boolean;
  quiz_score: number | null;
  quiz_answers: QuizAnswer[] | null;

  // Reflectie
  reflectie_completed: boolean;
  reflectie_antwoord: string | null;

  // Werkboek
  werkboek_completed: boolean;
  werkboek_antwoorden: WerkboekAnswer[] | null;

  created_at: string;
  updated_at: string;
}

export interface WeekProgress {
  week_nummer: number;
  total_days: number;
  completed_days: number;
  percentage: number;
}

export interface ProgramProgress {
  program_id: number;
  total_days: number;
  completed_days: number;
  percentage: number;
  current_day: number;
  current_week: number;
  weeks: WeekProgress[];
}

// ============================================
// WEEKLY METRICS TYPES
// ============================================
export interface WeeklyMetrics {
  id: number;
  user_id: number;
  program_id: number;
  week_nummer: number;
  matches_count: number | null;
  gesprekken_count: number | null;
  dates_count: number | null;
  foto_score: number | null;
  bio_score: number | null;
  notities: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface KickstartOverview {
  program: {
    id: number;
    slug: string;
    name: string;
    tagline: string;
    duration_days: number;
  };
  weeks: ProgramWeek[];
  progress: ProgramProgress;
  metrics: {
    start: WeeklyMetrics | null;
    current: WeeklyMetrics | null;
  };
}

export interface DayDetailResponse {
  day: ProgramDay;
  week: ProgramWeek;
  progress: DayProgress | null;
  navigation: {
    previous: { dag_nummer: number; titel: string } | null;
    next: { dag_nummer: number; titel: string } | null;
  };
}

// ============================================
// INPUT TYPES (for API calls)
// ============================================
export interface UpdateDayProgressInput {
  day_id: number;
  video_watched_seconds?: number;
  video_completed?: boolean;
  quiz_answers?: QuizAnswer[];
  quiz_completed?: boolean;
  reflectie_antwoord?: string;
  reflectie_completed?: boolean;
  werkboek_antwoorden?: WerkboekAnswer[];
  werkboek_completed?: boolean;
}

export interface UpdateWeeklyMetricsInput {
  week_nummer: number;
  matches_count?: number;
  gesprekken_count?: number;
  dates_count?: number;
  foto_score?: number;
  bio_score?: number;
  notities?: string;
}

// ============================================
// UI STATE TYPES
// ============================================
export interface DayViewerState {
  activeTab: 'video' | 'quiz' | 'reflectie' | 'werkboek';
  isVideoPlaying: boolean;
  quizState: {
    currentQuestion: number;
    answers: QuizAnswer[];
    isSubmitted: boolean;
  };
  reflectieState: {
    antwoord: string;
    isSubmitted: boolean;
  };
  werkboekState: {
    antwoorden: WerkboekAnswer[];
    isSubmitted: boolean;
  };
}

// ============================================
// HELPER TYPES
// ============================================
export function isDayCompleted(progress: DayProgress | null): boolean {
  if (!progress) return false;
  return progress.status === 'completed';
}

export function isDayAvailable(
  dayNumber: number,
  completedDays: number[]
): boolean {
  // Day 1 is always available
  if (dayNumber === 1) return true;
  // Other days require previous day to be completed
  return completedDays.includes(dayNumber - 1);
}

export function calculateDayCompletionPercentage(
  day: ProgramDay,
  progress: DayProgress | null
): number {
  if (!progress) return 0;

  let total = 1; // Video is always counted
  let completed = progress.video_completed ? 1 : 0;

  if (day.quiz) {
    total++;
    if (progress.quiz_completed) completed++;
  }

  if (day.reflectie) {
    total++;
    if (progress.reflectie_completed) completed++;
  }

  if (day.werkboek) {
    total++;
    if (progress.werkboek_completed) completed++;
  }

  return Math.round((completed / total) * 100);
}
