/**
 * De Dating Snapshot - TypeScript Type Definitions
 *
 * Complete type system for the world-class onboarding experience.
 */

// =====================================================
// ENUMS
// =====================================================

export type EnergyProfile = 'introvert' | 'ambivert' | 'extrovert';

export type AttachmentStyle = 'secure' | 'anxious' | 'avoidant' | 'fearful_avoidant';

export type RelationshipGoal = 'serious_relationship' | 'casual_dating' | 'marriage' | 'unsure';

export type PainPoint =
  | 'few_matches'
  | 'conversations_die'
  | 'no_dates'
  | 'ghosting'
  | 'burnout'
  | 'wrong_people'
  | 'confidence'
  | 'second_dates';

export type RecommendedPace = 'slow' | 'normal' | 'intensive';

export type GhostingFrequency = 'never' | 'once' | 'rarely' | 'sometimes' | 'often' | 'very_often';

export type SingleSince =
  | 'less_than_3_months'
  | '3_to_6_months'
  | '6_to_12_months'
  | '1_to_2_years'
  | '2_to_5_years'
  | 'more_than_5_years'
  | 'always';

export type ConversationPreference = 'deep_1on1' | 'light_groups' | 'mixed';

export type PostDateNeed = 'alone_time' | 'more_contact' | 'depends';

export type RechargeMethod = 'alone' | 'close_friends' | 'activities' | 'sleep';

export type TimelinePreference = 'no_rush' | 'within_year' | 'asap' | 'exploring';

export type LastDateRecency =
  | 'this_week'
  | 'this_month'
  | '1_3_months'
  | '3_6_months'
  | '6_12_months'
  | 'more_than_year'
  | 'never';

// =====================================================
// QUESTION TYPES
// =====================================================

export type QuestionType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'multi_select'
  | 'scale'
  | 'slider'
  | 'ranking'
  | 'boolean';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface ScaleLabels {
  [key: number]: string;
}

export interface ValidationRules {
  min_length?: number;
  max_length?: number;
  min?: number;
  max?: number;
  required?: boolean;
}

export interface ConditionalDisplay {
  field: string;
  equals?: any;
  not_equals?: any;
  contains?: any;
  not_contains?: any;
}

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  label: string;
  required: boolean;
  helper_text?: string;
  placeholder?: string;
  show_if?: ConditionalDisplay;
  validation?: ValidationRules;
}

export interface TextQuestion extends BaseQuestion {
  type: 'text' | 'textarea';
}

export interface NumberQuestion extends BaseQuestion {
  type: 'number';
  min?: number;
  max?: number;
}

export interface SelectQuestion extends BaseQuestion {
  type: 'select';
  options: SelectOption[];
}

export interface MultiSelectQuestion extends BaseQuestion {
  type: 'multi_select';
  options: SelectOption[];
  max_selections?: number;
}

export interface ScaleQuestion extends BaseQuestion {
  type: 'scale';
  min: number;
  max: number;
  scale_type: 'labeled' | 'agreement' | 'frequency';
  labels: ScaleLabels;
}

export interface SliderQuestion extends BaseQuestion {
  type: 'slider';
  min: number;
  max: number;
  step: number;
  default?: number;
  unit?: string;
  labels?: ScaleLabels;
}

export interface RankingQuestion extends BaseQuestion {
  type: 'ranking';
  options: SelectOption[];
  instruction?: string;
}

export interface BooleanQuestion extends BaseQuestion {
  type: 'boolean';
  options: { value: boolean; label: string }[];
  description?: string;
}

export type Question =
  | TextQuestion
  | NumberQuestion
  | SelectQuestion
  | MultiSelectQuestion
  | ScaleQuestion
  | SliderQuestion
  | RankingQuestion
  | BooleanQuestion;

// =====================================================
// ONBOARDING SECTION
// =====================================================

export interface OnboardingSection {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  estimated_minutes: number;
  intro_text: string;
  instruction?: string;
  outro_text?: string;
  questions: Question[];
}

// =====================================================
// USER ONBOARDING PROFILE
// =====================================================

export interface UserOnboardingProfile {
  id: number;
  userId: number;
  courseId?: number;

  // Section 1: Basis
  displayName: string;
  age?: number;
  locationCity?: string;
  occupation?: string;
  singleSince?: SingleSince;
  longestRelationshipMonths?: number;

  // Section 2: Dating Situatie
  appsUsed: string[];
  primaryApp?: string;
  appExperienceMonths?: number;
  matchesPerWeek?: number;
  matchesToConversationsPct?: number;
  conversationsToDatesPct?: number;
  datesLast3Months?: number;
  lastDateRecency?: LastDateRecency;

  // Section 3: Energie Profiel
  energyAfterSocial?: number;
  conversationPreference?: ConversationPreference;
  callPreparation?: number;
  postDateNeed?: PostDateNeed;
  rechargeMethod?: RechargeMethod;
  socialBatteryCapacity?: number;
  socialMediaFatigue?: number;
  introvertScore?: number;
  energyProfile?: EnergyProfile;

  // Section 4: Pijnpunten
  painPointsRanked: PainPoint[];
  primaryPainPoint?: PainPoint;
  secondaryPainPoint?: PainPoint;
  painPointSeverity?: number;
  biggestFrustration?: string;
  triedSolutions?: string[];

  // Section 5: Hechtingsstijl
  attachmentQ1Abandonment?: number;
  attachmentQ2Trust?: number;
  attachmentQ3Intimacy?: number;
  attachmentQ4Validation?: number;
  attachmentQ5Withdraw?: number;
  attachmentQ6Independence?: number;
  attachmentQ7Closeness?: number;
  attachmentStylePredicted?: AttachmentStyle;
  attachmentConfidence?: number;

  // Section 6: Doelen
  relationshipGoal?: RelationshipGoal;
  timelinePreference?: TimelinePreference;
  oneYearVision?: string;
  successDefinition?: string;
  commitmentLevel?: number;
  weeklyTimeAvailable?: number;

  // Section 7: Eerdere Ervaringen
  hasBeenGhosted?: boolean;
  ghostingFrequency?: GhostingFrequency;
  ghostingImpact?: number;
  hasExperiencedBurnout?: boolean;
  burnoutSeverity?: number;
  previousCoaching?: boolean;
  howFoundUs?: string;

  // Calculated Scores
  datingReadinessScore?: number;
  urgencyScore?: number;
  complexityScore?: number;

  // Personalization Flags
  enableIntrovertMode: boolean;
  needsExtraGhostingSupport: boolean;
  needsBurnoutPrevention: boolean;
  needsConfidenceBuilding: boolean;
  needsExtraValidation: boolean;
  recommendedPace: RecommendedPace;

  // Progress
  currentSection: number;
  completedSections: number[];
  answersJson: Record<string, any>;

  // Meta
  startedAt: Date;
  completedAt?: Date;
  completionTimeSeconds?: number;
  completionPercentage: number;
  isComplete: boolean;
  lastUpdated: Date;
}

// =====================================================
// ONBOARDING PROGRESS
// =====================================================

export interface OnboardingProgress {
  currentSection: number;
  completedSections: number[];
  answers: Record<string, any>;
  completionPercentage: number;
}

// =====================================================
// WELCOME MESSAGE
// =====================================================

export interface WelcomeMessageVariables {
  name: string;
  primary_pain_point_text: string;
  attachment_style_text: string;
  goal_text: string;
  energy_profile: EnergyProfile;
  introvert_score: number;
  matches_per_week: number;
  one_year_vision: string;
}

export interface WelcomeMessage {
  subject: string;
  body: string;
}

// =====================================================
// PERSONALIZATION MAPPINGS
// =====================================================

export const PAIN_POINT_TEXTS: Record<PainPoint, string> = {
  few_matches: 'te weinig matches krijgen',
  conversations_die: 'gesprekken die doodlopen',
  no_dates: 'gesprekken die niet tot dates leiden',
  ghosting: 'geghostd worden',
  burnout: 'dating burnout en uitputting',
  wrong_people: 'steeds op de verkeerde mensen vallen',
  confidence: 'onzekerheid en niet durven beginnen',
  second_dates: 'eerste dates die niet tot tweede dates leiden',
};

export const ATTACHMENT_STYLE_TEXTS: Record<AttachmentStyle, string> = {
  secure: 'veilig gehecht',
  anxious: 'angstig gehecht',
  avoidant: 'vermijdend gehecht',
  fearful_avoidant: 'angstig-vermijdend gehecht',
};

export const GOAL_TEXTS: Record<RelationshipGoal, string> = {
  serious_relationship: 'een serieuze relatie',
  casual_dating: 'casual daten',
  marriage: 'een levenspartner',
  unsure: 'ontdekken wat je wilt',
};

export const ENERGY_PROFILE_TEXTS: Record<EnergyProfile, string> = {
  introvert: 'introvert',
  extrovert: 'extrovert',
  ambivert: 'ambivert',
};

// =====================================================
// API TYPES
// =====================================================

export interface StartOnboardingRequest {
  userId: number;
}

export interface StartOnboardingResponse {
  onboardingId: number;
  profile: Partial<UserOnboardingProfile>;
}

export interface SaveProgressRequest {
  sectionId: number;
  answers: Record<string, any>;
}

export interface SaveProgressResponse {
  success: boolean;
  completionPercentage: number;
  nextSection?: number;
  calculatedScores?: {
    introvertScore?: number;
    energyProfile?: EnergyProfile;
    attachmentStyle?: AttachmentStyle;
    attachmentConfidence?: number;
  };
}

export interface CompleteOnboardingResponse {
  success: boolean;
  profile: UserOnboardingProfile;
  welcomeMessage: WelcomeMessage;
  summary: {
    energyProfile: EnergyProfile;
    attachmentStyle: AttachmentStyle;
    primaryPainPoint: PainPoint;
    personalizationFlags: string[];
  };
}

// =====================================================
// COMPONENT PROPS
// =====================================================

export interface QuestionProps<T = any> {
  question: Question;
  value: T;
  onChange: (value: T) => void;
  error?: string;
  disabled?: boolean;
}

export interface OnboardingSectionProps {
  section: OnboardingSection;
  answers: Record<string, any>;
  onAnswer: (questionId: string, value: any) => void;
  onNext: () => void;
  onPrevious?: () => void;
  isFirst: boolean;
  isLast: boolean;
  isSubmitting?: boolean;
}

// =====================================================
// VALIDATION
// =====================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
