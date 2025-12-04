/**
 * Kickstart Onboarding Types
 * Complete type definitions for 21-day Kickstart program onboarding
 */

export interface KickstartIntakeData {
  // Basic Info
  preferredName: string;
  gender: 'man' | 'vrouw' | 'anders';
  lookingFor: 'vrouwen' | 'mannen' | 'beiden';
  region: string;
  age: number;

  // Dating Situation
  datingStatus: 'single' | 'matching-no-dates' | 'dating-no-click' | 'recent-breakup';
  singleDuration: 'less-than-month' | '1-3-months' | '3-6-months' | '6-12-months' | '1-year-plus';

  // App Usage
  datingApps: string[]; // ['tinder', 'bumble', 'hinge', 'happn', 'once', 'inner-circle']
  weeklyMatches: '0-2' | '3-5' | '6-10' | '10-plus';

  // Challenges (CRITICAL for Iris)
  biggestFrustration: string; // Open text
  profileDescription: 'few-photos' | 'boring-bio' | 'no-idea' | 'good-but-not-working';
  biggestDifficulty: 'starting-convos' | 'getting-matches' | 'planning-dates' | 'presenting-self';

  // Goals & Desires
  relationshipGoal: 'serious' | 'open' | 'dates-first' | 'connections';
  confidenceLevel: number; // 1-10
  biggestFear: string; // Open text - deep psychological insight
  idealOutcome: string; // Open text - 3 month dream goal
}

export interface KickstartOnboardingRecord extends KickstartIntakeData {
  id: number;
  user_id: number;
  program_enrollment_id?: number;
  completed_at: string;
  created_at: string;
  updated_at: string;
}

export interface KickstartOnboardingStatus {
  completed: boolean;
  data?: KickstartOnboardingRecord;
}

export interface IrisKickstartContext {
  user_id: number;
  user_name: string;
  email: string;
  preferred_name?: string;
  gender?: string;
  looking_for?: string;
  region?: string;
  age?: number;
  dating_status?: string;
  single_duration?: string;
  dating_apps?: string[];
  weekly_matches?: string;
  biggest_frustration?: string;
  profile_description?: string;
  biggest_difficulty?: string;
  relationship_goal?: string;
  confidence_level?: number;
  biggest_fear?: string;
  ideal_outcome?: string;
  onboarding_completed_at?: string;
  completed_days: number;
  last_completed_day?: number;
  next_day?: number;
  enrolled_at: string;
  enrollment_status: string;
  kickstart_onboarding_completed: boolean;
}
