/**
 * TypeScript Types voor Content Delivery System
 * Sprint 3: Premium Program Content
 */

// ============================================
// CORE CONTENT TYPES
// ============================================

export type ContentType = 'video' | 'text' | 'quiz' | 'exercise' | 'download';
export type VideoProvider = 'cloudflare' | 'vimeo' | 'youtube' | 'custom';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type CriteriaType = 'lesson_count' | 'module_complete' | 'time_based' | 'streak';

// ============================================
// PROGRAM MODULE
// ============================================

export interface ProgramModule {
  id: number;
  program_id: number;
  module_number: number;
  title: string;
  description: string | null;
  learning_objectives: string[] | null;

  // Unlocking
  unlock_after_module_id: number | null;
  unlock_immediately: boolean;

  // Metadata
  estimated_duration_minutes: number | null;
  icon_emoji: string;
  cover_image_url: string | null;

  // Ordering
  display_order: number;
  is_published: boolean;

  created_at: Date;
  updated_at: Date;
}

// Module with calculated progress (for API responses)
export interface ProgramModuleWithProgress extends ProgramModule {
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  is_unlocked: boolean;
  user_progress?: UserModuleProgress;
}

// ============================================
// LESSON
// ============================================

export interface Lesson {
  id: number;
  module_id: number;
  lesson_number: number;

  // Content
  title: string;
  description: string | null;
  content_type: ContentType;

  // Video Content
  video_provider: VideoProvider | null;
  video_id: string | null;
  video_url: string | null;
  video_thumbnail_url: string | null;
  duration_seconds: number | null;

  // Text Content
  text_content: string | null;

  // Quiz/Exercise
  quiz_data: QuizData | null;

  // Download
  download_url: string | null;
  download_filename: string | null;
  download_size_bytes: number | null;

  // Transcript
  transcript: string | null;

  // Unlocking
  unlock_after_lesson_id: number | null;
  requires_previous_completion: boolean;

  // Metadata
  is_preview: boolean;
  estimated_duration_minutes: number | null;
  difficulty_level: DifficultyLevel | null;
  tags: string[] | null;

  // Ordering
  display_order: number;
  is_published: boolean;

  created_at: Date;
  updated_at: Date;
}

// Lesson with user progress (for API responses)
export interface LessonWithProgress extends Lesson {
  is_unlocked: boolean;
  is_completed: boolean;
  watched_percentage?: number;
  last_position_seconds?: number;
  user_progress?: UserLessonProgress;
}

// ============================================
// QUIZ DATA
// ============================================

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'open_ended';
  options?: string[];
  correct_answer?: string | number;
  explanation?: string;
  points?: number;
}

export interface QuizData {
  questions: QuizQuestion[];
  passing_score?: number; // Percentage needed to pass
  allow_retries?: boolean;
  max_attempts?: number;
  time_limit_minutes?: number;
}

export interface QuizAnswer {
  question_id: string;
  user_answer: string | number;
  is_correct?: boolean;
  points_earned?: number;
}

// ============================================
// USER PROGRESS
// ============================================

export interface UserLessonProgress {
  id: number;
  user_id: number;
  lesson_id: number;

  // Progress
  started_at: Date | null;
  completed_at: Date | null;
  is_completed: boolean;

  // Video Progress
  watch_time_seconds: number;
  last_position_seconds: number;
  watched_percentage: number;

  // Quiz Results
  quiz_score: number | null;
  quiz_attempts: number;
  quiz_passed: boolean;
  quiz_answers: QuizAnswer[] | null;

  // Engagement
  time_spent_seconds: number;
  revisit_count: number;
  last_accessed_at: Date | null;

  created_at: Date;
  updated_at: Date;
}

export interface UserModuleProgress {
  id: number;
  user_id: number;
  module_id: number;

  // Progress
  started_at: Date | null;
  completed_at: Date | null;
  is_completed: boolean;

  // Calculated
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;

  // Time
  total_time_spent_seconds: number;
  last_accessed_at: Date | null;

  created_at: Date;
  updated_at: Date;
}

export interface UserProgramProgress {
  id: number;
  user_id: number;
  program_id: number;

  // Progress
  started_at: Date | null;
  completed_at: Date | null;
  is_completed: boolean;

  // Calculated
  total_modules: number;
  completed_modules: number;
  total_lessons: number;
  completed_lessons: number;
  overall_progress_percentage: number;

  // Current Position
  current_module_id: number | null;
  current_lesson_id: number | null;

  // Time
  total_time_spent_seconds: number;
  last_accessed_at: Date | null;

  // Certificate
  certificate_issued: boolean;
  certificate_issued_at: Date | null;
  certificate_url: string | null;

  created_at: Date;
  updated_at: Date;
}

// ============================================
// ACHIEVEMENTS
// ============================================

export interface Achievement {
  id: number;
  achievement_key: string;
  title: string;
  description: string | null;
  icon_emoji: string | null;
  badge_image_url: string | null;

  // Criteria
  criteria_type: CriteriaType;
  criteria_value: number | null;

  points: number;
  rarity: AchievementRarity;

  created_at: Date;
}

export interface UserAchievement {
  id: number;
  user_id: number;
  achievement_id: number;
  unlocked_at: Date;
  is_viewed: boolean;

  // Joined data (from API)
  achievement?: Achievement;
}

// ============================================
// BOOKMARKS & NOTES
// ============================================

export interface UserLessonBookmark {
  id: number;
  user_id: number;
  lesson_id: number;
  note: string | null;
  video_timestamp_seconds: number | null;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

// Request to update lesson progress
export interface UpdateLessonProgressRequest {
  lessonId: number;
  watch_time_seconds?: number;
  last_position_seconds?: number;
  is_completed?: boolean;
  quiz_answers?: QuizAnswer[];
  time_spent_seconds?: number;
}

// Response for lesson progress update
export interface UpdateLessonProgressResponse {
  success: boolean;
  progress: UserLessonProgress;
  achievements_unlocked?: Achievement[];
  module_completed?: boolean;
  program_completed?: boolean;
}

// Request to get program content
export interface GetProgramContentRequest {
  programSlug: string;
  includeProgress?: boolean;
}

// Response for program content
export interface ProgramContentResponse {
  program: {
    id: number;
    name: string;
    slug: string;
    description: string;
  };
  modules: ProgramModuleWithProgress[];
  user_progress?: UserProgramProgress;
  next_lesson?: LessonWithProgress;
  has_access: boolean; // User is enrolled
  is_authenticated: boolean; // User is logged in
}

// Request to get lesson details
export interface GetLessonRequest {
  lessonId: number;
}

// Response for lesson details
export interface LessonResponse {
  lesson: LessonWithProgress;
  module: ProgramModule;
  next_lesson: LessonWithProgress | null;
  previous_lesson: LessonWithProgress | null;
  program: {
    id: number;
    name: string;
    slug: string;
  };
}

// ============================================
// HELPER TYPES
// ============================================

export interface LessonContentBlock {
  id: number;
  lesson_id: number;
  block_type: 'paragraph' | 'heading' | 'video' | 'image' | 'callout' | 'code' | 'bullet_list';
  content: string | null;
  metadata: Record<string, any> | null;
  display_order: number;
  created_at: Date;
}

// Formatted duration helper
export interface FormattedDuration {
  hours: number;
  minutes: number;
  seconds: number;
  display: string; // "1h 23m" or "15m 30s"
}

// Progress summary for dashboard
export interface ProgressSummary {
  total_programs: number;
  active_programs: number;
  completed_programs: number;
  total_lessons_completed: number;
  total_time_spent_hours: number;
  current_streak_days: number;
  achievements_count: number;
  completion_rate: number; // Percentage
}

// ============================================
// UTILITY FUNCTIONS (Type Guards)
// ============================================

export function isVideoLesson(lesson: Lesson): boolean {
  return lesson.content_type === 'video';
}

export function isQuizLesson(lesson: Lesson): boolean {
  return lesson.content_type === 'quiz';
}

export function isTextLesson(lesson: Lesson): boolean {
  return lesson.content_type === 'text';
}

export function isExerciseLesson(lesson: Lesson): boolean {
  return lesson.content_type === 'exercise';
}

export function isDownloadLesson(lesson: Lesson): boolean {
  return lesson.content_type === 'download';
}

// ============================================
// FORMATTING HELPERS
// ============================================

export function formatDuration(seconds: number): FormattedDuration {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  let display = '';
  if (hours > 0) display += `${hours}h `;
  if (minutes > 0 || hours > 0) display += `${minutes}m`;
  if (hours === 0 && minutes === 0) display = `${secs}s`;

  return {
    hours,
    minutes,
    seconds: secs,
    display: display.trim()
  };
}

export function calculateWatchedPercentage(
  watchTime: number,
  duration: number
): number {
  if (duration === 0) return 0;
  return Math.min(100, Math.round((watchTime / duration) * 100));
}

export function calculateQuizScore(
  answers: QuizAnswer[],
  questions: QuizQuestion[]
): number {
  if (questions.length === 0) return 0;

  const correctAnswers = answers.filter(a => a.is_correct).length;
  return Math.round((correctAnswers / questions.length) * 100);
}
