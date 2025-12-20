/**
 * Dating Snapshot Validation Schema
 *
 * World-class Zod validation for the Dating Snapshot onboarding.
 * Ensures data integrity and prevents malicious input.
 */

import { z } from 'zod';

// =====================================================
// ENUM SCHEMAS
// =====================================================

export const SingleSinceSchema = z.enum([
  'less_than_3_months',
  '3_to_6_months',
  '6_to_12_months',
  '1_to_2_years',
  '2_to_5_years',
  'more_than_5_years',
  'always',
]);

export const ConversationPreferenceSchema = z.enum([
  'deep_1on1',
  'light_groups',
  'mixed',
]);

export const PostDateNeedSchema = z.enum([
  'alone_time',
  'more_contact',
  'depends',
]);

export const RechargeMethodSchema = z.enum([
  'alone',
  'close_friends',
  'activities',
  'sleep',
]);

export const RelationshipGoalSchema = z.enum([
  'serious_relationship',
  'casual_dating',
  'marriage',
  'unsure',
]);

export const TimelinePreferenceSchema = z.enum([
  'no_rush',
  'within_year',
  'asap',
  'exploring',
]);

export const GhostingFrequencySchema = z.enum([
  'once',
  'rarely',
  'sometimes',
  'often',
  'very_often',
]);

export const PainPointSchema = z.enum([
  'few_matches',
  'conversations_die',
  'no_dates',
  'ghosting',
  'burnout',
  'wrong_people',
  'confidence',
  'second_dates',
]);

export const EnergyProfileSchema = z.enum([
  'introvert',
  'ambivert',
  'extrovert',
]);

export const AttachmentStyleSchema = z.enum([
  'secure',
  'anxious',
  'avoidant',
  'fearful_avoidant',
]);

export const DatingAppSchema = z.enum([
  'tinder',
  'bumble',
  'hinge',
  'happn',
  'inner_circle',
  'badoo',
  'lexa',
  'parship',
  'none',
]);

// =====================================================
// ANSWER SCHEMAS
// =====================================================

/**
 * Section 1: Basis Profiel
 */
const BasisProfielSchema = z.object({
  display_name: z
    .string()
    .min(2, 'Naam moet minimaal 2 karakters zijn')
    .max(50, 'Naam mag maximaal 50 karakters zijn')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Naam bevat ongeldige karakters'),
  age: z.coerce
    .number()
    .int('Leeftijd moet een geheel getal zijn')
    .min(18, 'Je moet minimaal 18 jaar zijn')
    .max(99, 'Ongeldige leeftijd'),
  location_city: z.string().max(100).optional().nullable(),
  occupation: z.string().max(100).optional().nullable(),
  single_since: SingleSinceSchema,
  longest_relationship_months: z.coerce.number().min(0).max(600).optional().nullable(),
});

/**
 * Section 2: Dating Situatie
 */
const DatingSituatieSchema = z.object({
  apps_used: z.array(DatingAppSchema).min(1, 'Selecteer minimaal 1 app'),
  app_experience_months: z.coerce.number().min(0).max(120).optional().nullable(),
  matches_per_week: z.coerce.number().min(0).max(100).optional().nullable(),
  matches_to_conversations_pct: z.coerce.number().min(0).max(100),
  conversations_to_dates_pct: z.coerce.number().min(0).max(100),
  dates_last_3_months: z.coerce.number().min(0).max(100).optional().nullable(),
});

/**
 * Section 3: Energie Profiel
 */
const EnergieProfielSchema = z.object({
  energy_after_social: z.coerce.number().int().min(1).max(5),
  conversation_preference: ConversationPreferenceSchema,
  call_preparation: z.coerce.number().int().min(1).max(5),
  post_date_need: PostDateNeedSchema,
  recharge_method: RechargeMethodSchema,
  social_battery_capacity: z.coerce.number().int().min(1).max(10),
});

/**
 * Section 4: Pijnpunten
 */
const PijnpuntenSchema = z.object({
  pain_points_ranked: z
    .array(PainPointSchema)
    .min(1, 'Rangschik minimaal 1 pijnpunt')
    .max(8),
  pain_point_severity: z.coerce.number().int().min(1).max(10),
  biggest_frustration: z.string().max(500).optional().nullable(),
  tried_solutions: z.array(z.string()).optional().nullable(),
});

/**
 * Section 5: Hechtingsstijl
 *
 * Based on: Brennan, Clark & Shaver (1998) ECR Scale
 * Questions mapped to anxiety/avoidance dimensions
 */
const HechtingsstijlSchema = z.object({
  attachment_q1_abandonment: z.coerce.number().int().min(1).max(5),
  attachment_q2_trust: z.coerce.number().int().min(1).max(5),
  attachment_q3_intimacy: z.coerce.number().int().min(1).max(5),
  attachment_q4_validation: z.coerce.number().int().min(1).max(5),
  attachment_q5_withdraw: z.coerce.number().int().min(1).max(5),
  attachment_q6_independence: z.coerce.number().int().min(1).max(5),
  attachment_q7_closeness: z.coerce.number().int().min(1).max(5),
});

/**
 * Section 6: Doelen
 */
const DoelenSchema = z.object({
  relationship_goal: RelationshipGoalSchema,
  timeline_preference: TimelinePreferenceSchema,
  one_year_vision: z
    .string()
    .min(20, 'Beschrijf je visie in minimaal 20 karakters')
    .max(500),
  success_definition: z
    .string()
    .min(10, 'Beschrijf succes in minimaal 10 karakters')
    .max(300),
  commitment_level: z.coerce.number().int().min(1).max(10),
  weekly_time_available: z.coerce.number().min(1).max(20).optional().nullable(),
});

/**
 * Section 7: Context
 */
const ContextSchema = z.object({
  has_been_ghosted: z.boolean(),
  ghosting_frequency: GhostingFrequencySchema.optional().nullable(),
  ghosting_impact: z.coerce.number().int().min(1).max(10).optional().nullable(),
  has_experienced_burnout: z.boolean(),
  burnout_severity: z.coerce.number().int().min(1).max(10).optional().nullable(),
  previous_coaching: z.boolean().optional().nullable(),
  how_found_us: z.string().max(50).optional().nullable(),
});

// =====================================================
// COMPLETE ANSWERS SCHEMA
// =====================================================

export const DatingSnapshotAnswersSchema = BasisProfielSchema
  .merge(DatingSituatieSchema)
  .merge(EnergieProfielSchema)
  .merge(PijnpuntenSchema)
  .merge(HechtingsstijlSchema)
  .merge(DoelenSchema)
  .merge(ContextSchema)
  .partial() // All fields optional for progressive save
  .extend({
    // Required core fields
    display_name: z.string().min(2).max(50),
  });

// =====================================================
// SCORES SCHEMA
// =====================================================

export const DatingSnapshotScoresSchema = z.object({
  introvertScore: z
    .number()
    .min(0, 'Introvert score moet minimaal 0 zijn')
    .max(100, 'Introvert score mag maximaal 100 zijn'),
  energyProfile: EnergyProfileSchema,
  attachmentStyle: AttachmentStyleSchema,
  attachmentConfidence: z
    .number()
    .min(0)
    .max(100),
  primaryPainPoint: PainPointSchema,
});

// =====================================================
// COMPLETE REQUEST SCHEMA
// =====================================================

export const DatingSnapshotRequestSchema = z.object({
  answers: DatingSnapshotAnswersSchema,
  scores: DatingSnapshotScoresSchema,
});

// =====================================================
// PROGRESS SAVE SCHEMA
// =====================================================

export const DatingSnapshotProgressSchema = z.object({
  sectionId: z.number().int().min(1).max(7),
  answers: z.record(z.string(), z.unknown()),
});

// =====================================================
// TYPE EXPORTS
// =====================================================

export type DatingSnapshotAnswers = z.infer<typeof DatingSnapshotAnswersSchema>;
export type DatingSnapshotScores = z.infer<typeof DatingSnapshotScoresSchema>;
export type DatingSnapshotRequest = z.infer<typeof DatingSnapshotRequestSchema>;
export type DatingSnapshotProgress = z.infer<typeof DatingSnapshotProgressSchema>;

// =====================================================
// VALIDATION HELPER
// =====================================================

export function validateDatingSnapshot(data: unknown): {
  success: boolean;
  data?: DatingSnapshotRequest;
  errors?: z.ZodError['errors'];
  fieldErrors?: Record<string, string[]>;
} {
  const result = DatingSnapshotRequestSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Format errors for API response
  const fieldErrors: Record<string, string[]> = {};
  for (const error of result.error.errors) {
    const path = error.path.join('.');
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(error.message);
  }

  return {
    success: false,
    errors: result.error.errors,
    fieldErrors,
  };
}
