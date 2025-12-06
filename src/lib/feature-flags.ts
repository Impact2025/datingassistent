/**
 * Feature Flags System
 * Enables gradual rollouts, A/B testing, and safe feature deployments
 */

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number; // 0-100
  conditions?: FeatureConditions;
  metadata?: Record<string, any>;
}

export interface FeatureConditions {
  userId?: string[];
  emailDomain?: string[];
  userRole?: string[];
  environment?: ('development' | 'staging' | 'production')[];
  customCondition?: (context: FeatureContext) => boolean;
}

export interface FeatureContext {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  environment: 'development' | 'staging' | 'production';
  userAgent?: string;
  ipAddress?: string;
  timestamp: number;
  [key: string]: any;
}

// Default feature flags
const DEFAULT_FEATURE_FLAGS: FeatureFlag[] = [
  {
    key: 'new_chatbot_ui',
    name: 'New Chatbot UI',
    description: 'Enhanced chatbot interface with improved UX',
    enabled: false,
    rolloutPercentage: 0,
  },
  {
    key: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Detailed analytics dashboard for admins',
    enabled: true,
    rolloutPercentage: 100,
    conditions: {
      userRole: ['admin'],
    },
  },
  {
    key: 'beta_features',
    name: 'Beta Features',
    description: 'Access to experimental features',
    enabled: false,
    rolloutPercentage: 10,
  },
  {
    key: 'performance_monitoring',
    name: 'Performance Monitoring',
    description: 'Real-time Core Web Vitals tracking',
    enabled: true,
    rolloutPercentage: 100,
  },
  {
    key: 'ai_course_recommendations',
    name: 'AI Course Recommendations',
    description: 'Personalized course suggestions using AI',
    enabled: false,
    rolloutPercentage: 25,
  },
];

// Feature flags store (in production, this would come from a database or external service)
const featureFlags: FeatureFlag[] = [...DEFAULT_FEATURE_FLAGS];

/**
 * Check if a feature is enabled for the current context
 */
export function isFeatureEnabled(
  featureKey: string,
  context: Partial<FeatureContext> = {}
): boolean {
  const feature = featureFlags.find(f => f.key === featureKey);

  if (!feature || !feature.enabled) {
    return false;
  }

  // Check rollout percentage
  if (feature.rolloutPercentage < 100) {
    const userHash = generateUserHash(context.userId || context.userEmail || 'anonymous');
    const userPercentage = (userHash % 100) + 1;

    if (userPercentage > feature.rolloutPercentage) {
      return false;
    }
  }

  // Check conditions
  if (feature.conditions) {
    return evaluateConditions(feature.conditions, context);
  }

  return true;
}

/**
 * Evaluate feature conditions
 */
function evaluateConditions(
  conditions: FeatureConditions,
  context: Partial<FeatureContext>
): boolean {
  // Check user ID whitelist
  if (conditions.userId && context.userId) {
    if (!conditions.userId.includes(context.userId)) {
      return false;
    }
  }

  // Check email domain
  if (conditions.emailDomain && context.userEmail) {
    const domain = context.userEmail.split('@')[1];
    if (!conditions.emailDomain.includes(domain)) {
      return false;
    }
  }

  // Check user role
  if (conditions.userRole && context.userRole) {
    if (!conditions.userRole.includes(context.userRole)) {
      return false;
    }
  }

  // Check environment
  if (conditions.environment) {
    const currentEnv = process.env.NODE_ENV as 'development' | 'staging' | 'production' || 'development';
    if (!conditions.environment.includes(currentEnv)) {
      return false;
    }
  }

  // Check custom condition
  if (conditions.customCondition) {
    return conditions.customCondition(context as FeatureContext);
  }

  return true;
}

/**
 * Generate a consistent hash for user-based rollouts
 */
function generateUserHash(identifier: string): number {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    const char = identifier.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Get all feature flags
 */
export function getAllFeatureFlags(): FeatureFlag[] {
  return [...featureFlags];
}

/**
 * Update a feature flag (admin function)
 */
export function updateFeatureFlag(
  featureKey: string,
  updates: Partial<FeatureFlag>
): boolean {
  const index = featureFlags.findIndex(f => f.key === featureKey);

  if (index === -1) {
    return false;
  }

  featureFlags[index] = { ...featureFlags[index], ...updates };
  return true;
}

/**
 * Add a new feature flag
 */
export function addFeatureFlag(flag: FeatureFlag): boolean {
  if (featureFlags.some(f => f.key === flag.key)) {
    return false; // Flag already exists
  }

  featureFlags.push(flag);
  return true;
}

/**
 * Remove a feature flag
 */
export function removeFeatureFlag(featureKey: string): boolean {
  const index = featureFlags.findIndex(f => f.key === featureKey);

  if (index === -1) {
    return false;
  }

  featureFlags.splice(index, 1);
  return true;
}

/**
 * Get feature flags for a specific user context
 */
export function getEnabledFeaturesForUser(context: Partial<FeatureContext> = {}): string[] {
  return featureFlags
    .filter(flag => isFeatureEnabled(flag.key, context))
    .map(flag => flag.key);
}

/**
 * React hook for feature flags (client-side)
 */
export function useFeatureFlag(featureKey: string): boolean {
  // In a real implementation, this would use React context and server state
  // For now, return the server-side evaluation
  return isFeatureEnabled(featureKey);
}

/**
 * A/B Testing utilities
 */
export interface ABTest {
  name: string;
  variants: string[];
  weights?: number[];
  enabled: boolean;
}

const AB_TESTS: ABTest[] = [
  {
    name: 'homepage_design',
    variants: ['original', 'new_design'],
    weights: [70, 30],
    enabled: true,
  },
  {
    name: 'pricing_display',
    variants: ['monthly_first', 'yearly_first'],
    weights: [50, 50],
    enabled: false,
  },
];

/**
 * Get A/B test variant for user
 */
export function getABTestVariant(
  testName: string,
  userId?: string
): string | null {
  const test = AB_TESTS.find(t => t.name === testName && t.enabled);

  if (!test) {
    return null;
  }

  const identifier = userId || 'anonymous';
  const userHash = generateUserHash(identifier);
  const randomValue = (userHash % 100) / 100;

  let cumulativeWeight = 0;
  for (let i = 0; i < test.variants.length; i++) {
    const weight = test.weights?.[i] || (100 / test.variants.length);
    cumulativeWeight += weight;

    if (randomValue * 100 <= cumulativeWeight) {
      return test.variants[i];
    }
  }

  return test.variants[0]; // Fallback
}

/**
 * Track A/B test conversion
 */
export function trackABTestConversion(
  testName: string,
  variant: string,
  userId?: string,
  event: string = 'conversion'
) {
  // In a real implementation, this would send to analytics service
  console.log(`A/B Test Conversion: ${testName} - ${variant} - ${event}`, { userId });
}