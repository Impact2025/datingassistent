/**
 * Cursus access logic — centralized truth for who can access what.
 *
 * cursus_type tiers (low → high):
 *   gratis → starter → groeier → expert → vip
 *
 * Enrolled programs (from /prijzen):
 *   kickstart (€47)      → gratis + starter
 *   transformatie (€147) → gratis + starter + groeier
 *   vip (€797)           → all
 *
 * Legacy subscription_type (sociaal/core/pro/premium packages):
 *   sociaal  → gratis + starter
 *   core     → gratis + starter + groeier
 *   pro      → gratis + starter + groeier + expert
 *   premium  → all
 */

export const PROGRAM_CURSUS_ACCESS: Record<string, string[]> = {
  free:          ['gratis'],
  kickstart:     ['gratis', 'starter'],
  transformatie: ['gratis', 'starter', 'groeier'],
  vip:           ['gratis', 'starter', 'groeier', 'expert', 'vip'],
};

/**
 * Maps a legacy subscription_type or MembershipTier value to the equivalent
 * programTier slug used in program_enrollments.
 *   free / sociaal  → 'kickstart'
 *   core / pro      → 'transformatie'
 *   premium         → 'vip'
 */
export function subscriptionTypeToProgram(subscriptionType: string): string {
  const map: Record<string, string> = {
    sociaal:  'kickstart',
    core:     'transformatie',
    pro:      'transformatie',
    premium:  'vip',
  };
  return map[subscriptionType] ?? 'free';
}

const SUBSCRIPTION_ACCESS: Record<string, string[]> = {
  kickstart:    ['gratis', 'starter'],
  transformatie: ['gratis', 'starter', 'groeier'],
  vip:          ['gratis', 'starter', 'groeier', 'expert', 'vip'],
  sociaal:      ['gratis', 'starter'],
  core:         ['gratis', 'starter', 'groeier'],
  pro:          ['gratis', 'starter', 'groeier', 'expert'],
  premium:      ['gratis', 'starter', 'groeier', 'expert', 'vip'],
};

/**
 * Determines the minimum program/plan a user needs to access a cursus.
 * Returns the plan slug or null for free courses.
 */
export function getMinimumPlanForCursusType(cursusType: string): string | null {
  if (cursusType === 'gratis') return null;
  if (cursusType === 'starter') return 'kickstart';
  if (cursusType === 'groeier') return 'transformatie';
  return 'vip';
}

/**
 * Returns true if the user has access to a cursus based on their
 * enrolled programs and/or subscription_type.
 */
export function getCursusAccess(
  cursusType: string,
  subscriptionType: string | null,
  enrolledProgramSlugs: string[]
): boolean {
  if (cursusType === 'gratis') return true;

  for (const slug of enrolledProgramSlugs) {
    if (PROGRAM_CURSUS_ACCESS[slug]?.includes(cursusType)) return true;
  }

  // Check legacy subscription_type field
  if (subscriptionType && SUBSCRIPTION_ACCESS[subscriptionType]?.includes(cursusType)) {
    return true;
  }

  return false;
}
