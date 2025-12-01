// Module 3: Profieltekst die wel werkt (A.C.T.I.E. Model) - Type Definitions

export type Module3Phase = 'authenticiteit' | 'connectie' | 'trigger' | 'evidence' | 'intentie' | 'completed';

export type HechtingsAuditEnum = 'ZELFSTANDIG' | 'GERUSTSTELLEND' | 'ACTIVEREND';

export interface ClaimProof {
  claim: string;
  proof: string;
}

export interface TriggerAnalysisResult {
  scores: number[]; // Array of 3 scores (1-5)
  bestIndex: number;
  feedback: string[];
}

export interface Module3Progress {
  currentPhase: Module3Phase;
  completedPhases: Module3Phase[];
  authenticiteitValidated: boolean;
  clichéScore: number; // 0-10
  triggerBestScore: number; // 1-5
  proofCount: number; // 0-3
  hechtingsAudit?: HechtingsAuditEnum;
  completedAt?: Date;
  lastUpdated?: Date;
}

export interface Module3UserProfile {
  // Existing fields from gebruiker_profielen
  gebruiker_id?: string;
  id?: number;
  topmagneetkrachten?: string[];
  hechtingsstijl?: string;
  hechtingscoreangst?: number;

  // Subscription info
  subscription_type?: string;
  subscriptionType?: string;

  // Module 3 specific fields
  profieltekst_kernkrachten_validatie?: boolean;
  profieltekst_cliché_score?: number;
  trigger_zin_kwaliteit_score?: number;
  profieltekst_proof_count?: number;
  profieltekst_hechtings_audit?: HechtingsAuditEnum;
  module3_completed_at?: Date;
  module3_last_updated?: Date;

  // Additional fields that might be present
  [key: string]: any;
}

// Component Props Interfaces
export interface BaseLessonProps {
  userProfile?: Module3UserProfile;
  onComplete: (data: any) => void;
  onProgress?: (progress: Partial<Module3Progress>) => void;
}

export interface Les3_1_AuthenticiteitProps extends BaseLessonProps {
  onComplete: (data: { validated: boolean }) => void;
}

export interface Les3_2_ConnectieProps extends BaseLessonProps {
  userProfile?: Module3UserProfile;
  onComplete: (data: { score: number }) => void;
}

export interface Les3_3_TriggerProps extends BaseLessonProps {
  userProfile?: Module3UserProfile;
  onComplete: (data: { bestScore: number; scores: number[] }) => void;
}

export interface Les3_4_EvidenceProps extends BaseLessonProps {
  userProfile?: Module3UserProfile;
  onComplete: (data: { proofs: ClaimProof[]; count: number }) => void;
}

export interface Les3_5_IntentieProps extends BaseLessonProps {
  onComplete: (data: { attachmentStyle: HechtingsAuditEnum }) => void;
}

// AI Service Interfaces
export interface TriggerQualityRequest {
  triggerLines: string[];
}

export interface TriggerQualityResponse {
  scores: number[];
  feedback: string[];
  bestIndex: number;
}

export interface AIFeedbackRequest {
  profielTekstClichéScore: number;
  topMagneetkrachten: string[];
  uploadedText: string;
  profielTekstHechtingsAudit?: HechtingsAuditEnum;
  hechtingScoreAngst?: number;
}

export interface AIFeedbackResponse {
  clichéFeedback?: string;
  intentieFeedback?: string;
  recommendations: string[];
}

// UI Component Props
export interface LessonCardProps {
  title: string;
  emoji: string;
  children: React.ReactNode;
  className?: string;
}

export interface ScoreDisplayProps {
  score: number;
  maxScore: number;
  title: string;
  feedback: string;
  className?: string;
}

export interface PremiumGateProps {
  title: string;
  description: string;
  features: string[];
  onUpgrade?: () => void;
}

// Progress and Navigation
export interface Module3NavigationProps {
  currentPhase: Module3Phase;
  completedPhases: Module3Phase[];
  onNavigate: (phase: Module3Phase) => void;
}

export interface Module3ProgressIndicatorProps {
  progress: Module3Progress;
  className?: string;
}

// Constants
export const MODULE3_PHASES: Module3Phase[] = [
  'authenticiteit',
  'connectie',
  'trigger',
  'evidence',
  'intentie'
];

export const PHASE_LABELS: Record<Module3Phase, string> = {
  authenticiteit: 'Authenticiteit (A)',
  connectie: 'Connectie (C)',
  trigger: 'Trigger (T)',
  evidence: 'Evidence (E)',
  intentie: 'Intentie (I)',
  completed: 'Voltooid'
};

export const PHASE_EMOJIS: Record<Module3Phase, string> = {
  authenticiteit: '🎭',
  connectie: '🔗',
  trigger: '🎯',
  evidence: '📊',
  intentie: '💭',
  completed: '✅'
};

// Validation helpers
export const validateClaim = (claim: string): boolean => {
  return claim.trim().length >= 3 && claim.trim().split(' ').length <= 3;
};

export const validateProof = (proof: string): boolean => {
  return proof.trim().split(' ').length >= 5;
};

export const calculateProgressPercentage = (progress: Module3Progress): number => {
  const completedCount = progress.completedPhases?.length || 0;
  const totalPhases = MODULE3_PHASES.length;
  return Math.round((completedCount / totalPhases) * 100);
};