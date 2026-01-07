/**
 * Pattern Quiz Library
 *
 * Export all utilities for the Dating Pattern Quiz.
 */

// Types
export * from './pattern-types';

// Questions
export { PATTERN_QUESTIONS, TOTAL_QUESTIONS } from './pattern-questions';

// Scoring
export {
  calculatePatternScore,
  PATTERN_DISTRIBUTION,
} from './pattern-scoring';

// Results
export {
  PATTERN_RESULTS,
  getPatternResult,
  getAllPatternResults,
} from './pattern-results';
