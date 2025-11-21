import {
  COURSE_GROUPS,
  MEMBERSHIP_LABELS,
  MEMBERSHIP_RANK,
  MEMBERSHIP_FEATURES,
  MODULES,
} from './data';
import type {
  CourseGroup,
  CourseGroupId,
  MembershipFeature,
  MembershipTier,
  ModuleDefinition,
} from './data';

const FALLBACK_TIER: MembershipTier = 'free';

const TIER_MAP: Record<string, MembershipTier> = {
  free: 'free',
  gratis: 'free',
  sociaal: 'sociaal',
  social: 'sociaal',
  core: 'core',
  'sociaal_core': 'core',
  'sociaal-core': 'core',
  'sociaal&core': 'core',
  pro: 'pro',
  premium: 'premium',
};

export function normalizeMembershipTier(value?: string | null): MembershipTier {
  if (!value) {
    return FALLBACK_TIER;
  }

  const normalized = value.toLowerCase().trim();
  return TIER_MAP[normalized] ?? FALLBACK_TIER;
}

export function getTierLabel(tier: MembershipTier): string {
  return MEMBERSHIP_LABELS[tier];
}

export function hasModuleAccess(
  subscriptionType: string | MembershipTier | null | undefined,
  moduleId: number
): boolean {
  const tier =
    typeof subscriptionType === 'string'
      ? normalizeMembershipTier(subscriptionType)
      : subscriptionType ?? FALLBACK_TIER;

  const module = MODULES.find((item) => item.id === moduleId);
  if (!module) {
    return false;
  }

  return MEMBERSHIP_RANK[tier] >= MEMBERSHIP_RANK[module.minTier];
}

export function getModuleAccessState(
  subscriptionType: string | MembershipTier | null | undefined,
  moduleId: number
): {
  module: ModuleDefinition | undefined;
  isLocked: boolean;
  requiredTier: MembershipTier | null;
} {
  const module = MODULES.find((item) => item.id === moduleId);

  if (!module) {
    return { module: undefined, isLocked: true, requiredTier: null };
  }

  const tier =
    typeof subscriptionType === 'string'
      ? normalizeMembershipTier(subscriptionType)
      : subscriptionType ?? FALLBACK_TIER;

  const isLocked = MEMBERSHIP_RANK[tier] < MEMBERSHIP_RANK[module.minTier];

  return {
    module,
    isLocked,
    requiredTier: module.minTier,
  };
}

export function getModulesForCourse(courseId: CourseGroupId): ModuleDefinition[] {
  return MODULES.filter((module) => module.courseId === courseId);
}

export function getCourseById(courseId: CourseGroupId): CourseGroup | undefined {
  return COURSE_GROUPS.find((course) => course.id === courseId);
}

export function isCourseLocked(
  subscriptionType: string | MembershipTier | null | undefined,
  courseId: CourseGroupId
): boolean {
  const course = getCourseById(courseId);
  if (!course) {
    return true;
  }

  const tier =
    typeof subscriptionType === 'string'
      ? normalizeMembershipTier(subscriptionType)
      : subscriptionType ?? FALLBACK_TIER;

  return MEMBERSHIP_RANK[tier] < MEMBERSHIP_RANK[course.minTier];
}

export function getFeatureAccess(
  subscriptionType: string | MembershipTier | null | undefined
): {
  available: MembershipFeature[];
  locked: MembershipFeature[];
} {
  const tier =
    typeof subscriptionType === 'string'
      ? normalizeMembershipTier(subscriptionType)
      : subscriptionType ?? FALLBACK_TIER;

  const available = MEMBERSHIP_FEATURES.filter(
    (feature) => MEMBERSHIP_RANK[tier] >= MEMBERSHIP_RANK[feature.minTier]
  );

  const locked = MEMBERSHIP_FEATURES.filter(
    (feature) => MEMBERSHIP_RANK[tier] < MEMBERSHIP_RANK[feature.minTier]
  );

  return {
    available,
    locked,
  };
}

export function sortFeaturesByTier(features: MembershipFeature[]): MembershipFeature[] {
  return [...features].sort((a, b) => {
    const rankDiff = MEMBERSHIP_RANK[a.minTier] - MEMBERSHIP_RANK[b.minTier];
    if (rankDiff !== 0) {
      return rankDiff;
    }
    return a.title.localeCompare(b.title, 'nl');
  });
}
