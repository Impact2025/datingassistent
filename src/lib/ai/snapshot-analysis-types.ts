/**
 * AI Snapshot Analysis - TypeScript Type Definitions
 *
 * Types for the world-class AI-powered Dating Snapshot analysis.
 */

import type { EnergyProfile, AttachmentStyle, PainPoint } from '@/types/dating-snapshot.types';

// =====================================================
// ANALYSIS RESULT TYPES
// =====================================================

export interface SnapshotAIAnalysis {
  id: string;
  userId: number;
  generatedAt: Date;
  model: string;

  // Structured insights
  energyProfileAnalysis: EnergyProfileInsight;
  attachmentStyleAnalysis: AttachmentStyleInsight;
  painPointAnalysis: PainPointInsight;
  crossCorrelationInsights: CrossCorrelationInsight[];
  coachingPreview: CoachingPreview;

  // Meta
  confidenceScore: number;
  processingTimeMs: number;
  cached: boolean;
}

export interface EnergyProfileInsight {
  profile: EnergyProfile;
  score: number;
  nuancedInterpretation: string;
  datingImplications: string[];
  strengthsInDating: string[];
  watchOuts: string[];
}

export interface AttachmentStyleInsight {
  style: AttachmentStyle;
  confidence: number;
  interpretation: string;
  triggerPatterns: string[];
  relationshipPatterns: string[];
  growthAreas: string[];
  isProvisional: true;
}

export interface PainPointInsight {
  primary: PainPoint;
  secondary?: PainPoint;
  rootCauseAnalysis: string;
  connectionToProfile: string;
  immediateActionSteps: string[];
  howProgramHelps: string;
}

export interface CrossCorrelationInsight {
  factors: string[];
  insight: string;
  implication: string;
  recommendation: string;
}

export interface CoachingPreview {
  personalizedGreeting: string;
  whatIrisNoticed: string[];
  focusAreasForProgram: string[];
  expectedBreakthroughs: string[];
  firstWeekFocus: string;
}

// =====================================================
// AI RAW OUTPUT TYPE (from Claude)
// =====================================================

export interface AIAnalysisRawOutput {
  energyProfileAnalysis: {
    nuancedInterpretation: string;
    datingImplications: string[];
    strengthsInDating: string[];
    watchOuts: string[];
  };
  attachmentStyleAnalysis: {
    interpretation: string;
    triggerPatterns: string[];
    relationshipPatterns: string[];
    growthAreas: string[];
  };
  painPointAnalysis: {
    rootCauseAnalysis: string;
    connectionToProfile: string;
    immediateActionSteps: string[];
    howProgramHelps: string;
  };
  crossCorrelationInsights: Array<{
    factors: string[];
    insight: string;
    implication: string;
    recommendation: string;
  }>;
  coachingPreview: {
    personalizedGreeting: string;
    whatIrisNoticed: string[];
    focusAreasForProgram: string[];
    expectedBreakthroughs: string[];
    firstWeekFocus: string;
  };
}

// =====================================================
// STREAMING TYPES
// =====================================================

export type AnalysisStreamChunk =
  | { type: 'start'; message: string }
  | { type: 'chunk'; text: string }
  | { type: 'phase'; phase: AnalysisPhase; progress: number }
  | { type: 'complete'; data: SnapshotAIAnalysis }
  | { type: 'cached'; data: SnapshotAIAnalysis }
  | { type: 'error'; message: string };

export type AnalysisPhase =
  | 'connecting'
  | 'analyzing'
  | 'correlating'
  | 'personalizing'
  | 'complete';

// =====================================================
// INPUT TYPES
// =====================================================

export interface SnapshotAnswers {
  // Section 1: Basis
  display_name: string;
  age?: number;
  location_city?: string;
  occupation?: string;
  single_since?: string;
  longest_relationship_months?: number;

  // Section 2: Dating Situatie
  apps_used?: string[];
  primary_app?: string;
  app_experience_months?: number;
  matches_per_week?: number;
  matches_to_conversations_pct?: number;
  conversations_to_dates_pct?: number;
  dates_last_3_months?: number;
  last_date_recency?: string;

  // Section 3: Energie Profiel
  energy_after_social?: number;
  conversation_preference?: string;
  call_preparation?: number;
  post_date_need?: string;
  recharge_method?: string;
  social_battery_capacity?: number;
  social_media_fatigue?: number;

  // Section 4: Pijnpunten
  pain_points_ranked?: string[];
  pain_point_severity?: number;
  biggest_frustration?: string;
  tried_solutions?: string[];

  // Section 5: Hechtingsstijl
  attachment_q1_abandonment?: number;
  attachment_q2_trust?: number;
  attachment_q3_intimacy?: number;
  attachment_q4_validation?: number;
  attachment_q5_withdraw?: number;
  attachment_q6_independence?: number;
  attachment_q7_closeness?: number;

  // Section 6: Doelen
  relationship_goal?: string;
  timeline_preference?: string;
  one_year_vision?: string;
  success_definition?: string;
  commitment_level?: number;
  weekly_time_available?: number;

  // Section 7: Context
  has_been_ghosted?: boolean;
  ghosting_frequency?: string;
  ghosting_impact?: number;
  has_experienced_burnout?: boolean;
  burnout_severity?: number;
  previous_coaching?: boolean;
  how_found_us?: string;
}

export interface SnapshotScores {
  introvertScore: number;
  energyProfile: EnergyProfile;
  attachmentStyle: AttachmentStyle;
  attachmentConfidence: number;
  primaryPainPoint: PainPoint;
  secondaryPainPoint?: PainPoint;
}

// =====================================================
// API TYPES
// =====================================================

export interface AnalyzeSnapshotRequest {
  streaming?: boolean;
}

export interface AnalyzeSnapshotResponse {
  success: boolean;
  analysis: SnapshotAIAnalysis;
}
