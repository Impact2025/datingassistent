// Module 3: Profieltekst die wel werkt (A.C.T.I.E. Model) - Main Exports

// Main Container
export { Module3Container } from './Module3Container';

// Lesson Components
export { Les3_1_Authenticiteit } from './lessons/Les3_1_Authenticiteit';
export { Les3_2_Connectie } from './lessons/Les3_2_Connectie';
export { Les3_3_Trigger } from './lessons/Les3_3_Trigger';
export { Les3_4_Evidence } from './lessons/Les3_4_Evidence';
export { Les3_5_Intentie } from './lessons/Les3_5_Intentie';

// Shared Components
export { LessonCard } from './shared/LessonCard';
export { ScoreDisplay } from './shared/ScoreDisplay';
export { PremiumGate } from './shared/PremiumGate';

// Types
export type {
  Module3Phase,
  Module3UserProfile,
  Module3Progress,
  HechtingsAuditEnum,
  ClaimProof,
  TriggerAnalysisResult,
  Les3_1_AuthenticiteitProps,
  Les3_2_ConnectieProps,
  Les3_3_TriggerProps,
  Les3_4_EvidenceProps,
  Les3_5_IntentieProps,
  AIFeedbackRequest,
  AIFeedbackResponse,
  TriggerQualityRequest,
  TriggerQualityResponse
} from './types/module3.types';

export {
  PHASE_LABELS,
  PHASE_EMOJIS,
  MODULE3_PHASES,
  calculateProgressPercentage,
  validateClaim,
  validateProof
} from './types/module3.types';