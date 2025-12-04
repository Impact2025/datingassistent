/**
 * GA4 Analytics Events - Professional Event Tracking
 *
 * Centralized GA4 event tracking for DatingAssistent.
 * Follows Google Analytics 4 recommended events and parameters.
 *
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events
 */

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// ============================================================================
// TYPES
// ============================================================================

export type GA4EventName =
  // Authentication Events
  | 'sign_up'
  | 'login'
  | 'logout'
  // Onboarding Events
  | 'tutorial_begin'
  | 'tutorial_complete'
  | 'onboarding_step'
  // E-commerce Events
  | 'view_item'
  | 'add_to_cart'
  | 'begin_checkout'
  | 'purchase'
  | 'refund'
  // Engagement Events
  | 'page_view'
  | 'screen_view'
  | 'tool_used'
  | 'feature_click'
  | 'assessment_start'
  | 'assessment_complete'
  | 'lesson_start'
  | 'lesson_complete'
  | 'video_start'
  | 'video_complete'
  // Custom Events
  | 'chat_message_sent'
  | 'profile_updated'
  | 'goal_set'
  | 'goal_completed'
  | 'upgrade_prompt_shown'
  | 'upgrade_prompt_clicked';

export interface GA4UserProperties {
  user_id?: string;
  subscription_tier?: 'free' | 'core' | 'pro' | 'premium' | 'premium_plus';
  account_created_at?: string;
  journey_phase?: number;
  total_tools_used?: number;
}

export interface GA4EcommerceItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price: number;
  quantity?: number;
  currency?: string;
}

// ============================================================================
// CORE TRACKING FUNCTION
// ============================================================================

/**
 * Check if gtag is available
 */
function isGtagAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/**
 * Send event to GA4
 */
function sendEvent(eventName: string, parameters?: Record<string, any>): void {
  if (!isGtagAvailable()) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[GA4 Event] ${eventName}`, parameters);
    }
    return;
  }

  try {
    window.gtag('event', eventName, {
      ...parameters,
      send_to: process.env.NEXT_PUBLIC_GA4_PROPERTY_ID || 'G-CLGV5SLPFW',
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`[GA4] Event sent: ${eventName}`, parameters);
    }
  } catch (error) {
    console.error('[GA4] Error sending event:', error);
  }
}

/**
 * Set user properties
 */
export function setUserProperties(properties: GA4UserProperties): void {
  if (!isGtagAvailable()) return;

  try {
    window.gtag('set', 'user_properties', properties);

    if (properties.user_id) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA4_PROPERTY_ID || 'G-CLGV5SLPFW', {
        user_id: properties.user_id,
      });
    }
  } catch (error) {
    console.error('[GA4] Error setting user properties:', error);
  }
}

// ============================================================================
// AUTHENTICATION EVENTS
// ============================================================================

/**
 * Track user sign up
 */
export function trackSignUp(params: {
  method: 'email' | 'google' | 'apple';
  user_id?: string;
  plan?: string;
}): void {
  sendEvent('sign_up', {
    method: params.method,
    user_id: params.user_id,
    selected_plan: params.plan,
  });
}

/**
 * Track user login
 */
export function trackLogin(params: {
  method: 'email' | 'google' | 'apple' | 'magic_link';
  user_id?: string;
}): void {
  sendEvent('login', {
    method: params.method,
    user_id: params.user_id,
  });
}

/**
 * Track user logout
 */
export function trackLogout(): void {
  sendEvent('logout');
}

// ============================================================================
// ONBOARDING EVENTS
// ============================================================================

/**
 * Track tutorial/onboarding start
 */
export function trackTutorialBegin(params?: {
  tutorial_name?: string;
  user_id?: string;
}): void {
  sendEvent('tutorial_begin', {
    tutorial_name: params?.tutorial_name || 'main_onboarding',
    user_id: params?.user_id,
  });
}

/**
 * Track tutorial/onboarding complete
 */
export function trackTutorialComplete(params?: {
  tutorial_name?: string;
  duration_seconds?: number;
  user_id?: string;
}): void {
  sendEvent('tutorial_complete', {
    tutorial_name: params?.tutorial_name || 'main_onboarding',
    duration_seconds: params?.duration_seconds,
    user_id: params?.user_id,
  });
}

/**
 * Track individual onboarding step
 */
export function trackOnboardingStep(params: {
  step_number: number;
  step_name: string;
  completed: boolean;
}): void {
  sendEvent('onboarding_step', {
    step_number: params.step_number,
    step_name: params.step_name,
    completed: params.completed,
  });
}

// ============================================================================
// E-COMMERCE EVENTS
// ============================================================================

/**
 * Track viewing a product/plan
 */
export function trackViewItem(params: {
  item_id: string;
  item_name: string;
  price: number;
  currency?: string;
}): void {
  sendEvent('view_item', {
    currency: params.currency || 'EUR',
    value: params.price,
    items: [{
      item_id: params.item_id,
      item_name: params.item_name,
      price: params.price,
      quantity: 1,
    }],
  });
}

/**
 * Track checkout start
 */
export function trackBeginCheckout(params: {
  plan_id: string;
  plan_name: string;
  price: number;
  billing_cycle?: 'monthly' | 'yearly';
  currency?: string;
  coupon?: string;
}): void {
  sendEvent('begin_checkout', {
    currency: params.currency || 'EUR',
    value: params.price,
    coupon: params.coupon,
    items: [{
      item_id: params.plan_id,
      item_name: params.plan_name,
      item_category: 'subscription',
      item_variant: params.billing_cycle,
      price: params.price,
      quantity: 1,
    }],
  });
}

/**
 * Track successful purchase
 */
export function trackPurchase(params: {
  transaction_id: string;
  plan_id: string;
  plan_name: string;
  price: number;
  billing_cycle?: 'monthly' | 'yearly';
  currency?: string;
  coupon?: string;
  tax?: number;
}): void {
  sendEvent('purchase', {
    transaction_id: params.transaction_id,
    currency: params.currency || 'EUR',
    value: params.price,
    tax: params.tax || 0,
    coupon: params.coupon,
    items: [{
      item_id: params.plan_id,
      item_name: params.plan_name,
      item_category: 'subscription',
      item_variant: params.billing_cycle,
      price: params.price,
      quantity: 1,
    }],
  });
}

/**
 * Track refund
 */
export function trackRefund(params: {
  transaction_id: string;
  value: number;
  currency?: string;
}): void {
  sendEvent('refund', {
    transaction_id: params.transaction_id,
    currency: params.currency || 'EUR',
    value: params.value,
  });
}

// ============================================================================
// TOOL & FEATURE USAGE EVENTS
// ============================================================================

/**
 * Track tool usage
 */
export function trackToolUsed(params: {
  tool_name: string;
  tool_category?: string;
  duration_seconds?: number;
  completed?: boolean;
  result?: string;
}): void {
  sendEvent('tool_used', {
    tool_name: params.tool_name,
    tool_category: params.tool_category,
    duration_seconds: params.duration_seconds,
    completed: params.completed,
    result: params.result,
  });
}

/**
 * Track feature click
 */
export function trackFeatureClick(params: {
  feature_name: string;
  feature_location: string;
  feature_category?: string;
}): void {
  sendEvent('feature_click', {
    feature_name: params.feature_name,
    feature_location: params.feature_location,
    feature_category: params.feature_category,
  });
}

/**
 * Track assessment start
 */
export function trackAssessmentStart(params: {
  assessment_type: string;
  assessment_name: string;
}): void {
  sendEvent('assessment_start', {
    assessment_type: params.assessment_type,
    assessment_name: params.assessment_name,
  });
}

/**
 * Track assessment complete
 */
export function trackAssessmentComplete(params: {
  assessment_type: string;
  assessment_name: string;
  score?: number;
  result?: string;
  duration_seconds?: number;
}): void {
  sendEvent('assessment_complete', {
    assessment_type: params.assessment_type,
    assessment_name: params.assessment_name,
    score: params.score,
    result: params.result,
    duration_seconds: params.duration_seconds,
  });
}

// ============================================================================
// LEARNING EVENTS
// ============================================================================

/**
 * Track lesson start
 */
export function trackLessonStart(params: {
  lesson_id: string;
  lesson_name: string;
  course_name?: string;
  module_name?: string;
}): void {
  sendEvent('lesson_start', {
    lesson_id: params.lesson_id,
    lesson_name: params.lesson_name,
    course_name: params.course_name,
    module_name: params.module_name,
  });
}

/**
 * Track lesson complete
 */
export function trackLessonComplete(params: {
  lesson_id: string;
  lesson_name: string;
  course_name?: string;
  duration_seconds?: number;
  score?: number;
}): void {
  sendEvent('lesson_complete', {
    lesson_id: params.lesson_id,
    lesson_name: params.lesson_name,
    course_name: params.course_name,
    duration_seconds: params.duration_seconds,
    score: params.score,
  });
}

/**
 * Track video start
 */
export function trackVideoStart(params: {
  video_id: string;
  video_title: string;
  video_duration?: number;
}): void {
  sendEvent('video_start', {
    video_id: params.video_id,
    video_title: params.video_title,
    video_duration: params.video_duration,
  });
}

/**
 * Track video complete
 */
export function trackVideoComplete(params: {
  video_id: string;
  video_title: string;
  watch_time_seconds?: number;
  completion_percentage?: number;
}): void {
  sendEvent('video_complete', {
    video_id: params.video_id,
    video_title: params.video_title,
    watch_time_seconds: params.watch_time_seconds,
    completion_percentage: params.completion_percentage,
  });
}

// ============================================================================
// ENGAGEMENT EVENTS
// ============================================================================

/**
 * Track chat message sent
 */
export function trackChatMessageSent(params?: {
  chat_type?: 'coach' | 'support' | 'iris';
  message_length?: number;
}): void {
  sendEvent('chat_message_sent', {
    chat_type: params?.chat_type || 'iris',
    message_length: params?.message_length,
  });
}

/**
 * Track profile update
 */
export function trackProfileUpdated(params: {
  fields_updated: string[];
  completion_percentage?: number;
}): void {
  sendEvent('profile_updated', {
    fields_updated: params.fields_updated.join(','),
    fields_count: params.fields_updated.length,
    completion_percentage: params.completion_percentage,
  });
}

/**
 * Track goal set
 */
export function trackGoalSet(params: {
  goal_type: string;
  goal_name: string;
}): void {
  sendEvent('goal_set', {
    goal_type: params.goal_type,
    goal_name: params.goal_name,
  });
}

/**
 * Track goal completed
 */
export function trackGoalCompleted(params: {
  goal_type: string;
  goal_name: string;
  days_to_complete?: number;
}): void {
  sendEvent('goal_completed', {
    goal_type: params.goal_type,
    goal_name: params.goal_name,
    days_to_complete: params.days_to_complete,
  });
}

// ============================================================================
// CONVERSION EVENTS
// ============================================================================

/**
 * Track upgrade prompt shown
 */
export function trackUpgradePromptShown(params: {
  prompt_location: string;
  current_plan?: string;
  suggested_plan?: string;
}): void {
  sendEvent('upgrade_prompt_shown', {
    prompt_location: params.prompt_location,
    current_plan: params.current_plan,
    suggested_plan: params.suggested_plan,
  });
}

/**
 * Track upgrade prompt clicked
 */
export function trackUpgradePromptClicked(params: {
  prompt_location: string;
  current_plan?: string;
  target_plan?: string;
}): void {
  sendEvent('upgrade_prompt_clicked', {
    prompt_location: params.prompt_location,
    current_plan: params.current_plan,
    target_plan: params.target_plan,
  });
}

// ============================================================================
// PAGE VIEW TRACKING
// ============================================================================

/**
 * Track page view (for SPAs)
 */
export function trackPageView(params: {
  page_path: string;
  page_title?: string;
  page_location?: string;
}): void {
  sendEvent('page_view', {
    page_path: params.page_path,
    page_title: params.page_title || document?.title,
    page_location: params.page_location || window?.location?.href,
  });
}

// ============================================================================
// DASHBOARD TAB TRACKING
// ============================================================================

/**
 * Track dashboard tab change
 */
export function trackDashboardTab(params: {
  tab_name: string;
  previous_tab?: string;
}): void {
  sendEvent('feature_click', {
    feature_name: `dashboard_tab_${params.tab_name}`,
    feature_location: 'dashboard',
    feature_category: 'navigation',
    previous_tab: params.previous_tab,
  });
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export const GA4 = {
  // User
  setUserProperties,

  // Auth
  trackSignUp,
  trackLogin,
  trackLogout,

  // Onboarding
  trackTutorialBegin,
  trackTutorialComplete,
  trackOnboardingStep,

  // E-commerce
  trackViewItem,
  trackBeginCheckout,
  trackPurchase,
  trackRefund,

  // Tools & Features
  trackToolUsed,
  trackFeatureClick,
  trackAssessmentStart,
  trackAssessmentComplete,

  // Learning
  trackLessonStart,
  trackLessonComplete,
  trackVideoStart,
  trackVideoComplete,

  // Engagement
  trackChatMessageSent,
  trackProfileUpdated,
  trackGoalSet,
  trackGoalCompleted,

  // Conversion
  trackUpgradePromptShown,
  trackUpgradePromptClicked,

  // Navigation
  trackPageView,
  trackDashboardTab,
};

export default GA4;
