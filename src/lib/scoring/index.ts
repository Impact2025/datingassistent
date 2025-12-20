/**
 * Scoring Module - World-class psychological assessments
 *
 * This module provides scientifically-grounded scoring algorithms
 * for the Dating Snapshot onboarding experience.
 */

// Attachment Style Calculator
export {
  calculateAttachmentStyle,
  getAttachmentStyleSimple,
  type AttachmentQuestionAnswers,
  type AttachmentResult,
  type AttachmentDimensions,
} from './attachment-style';

// Energy Profile Calculator
export {
  calculateEnergyProfile,
  getEnergyProfileSimple,
  type EnergyQuestionAnswers,
  type EnergyProfileResult,
} from './energy-profile';
