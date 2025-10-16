/**
 * Google Tag Manager Configuration
 * Environment-specific GTM settings and configuration
 */

// GTM Container IDs for different environments
const GTM_CONFIG = {
  development: {
    gtmId: import.meta.env.VITE_GTM_ID_DEV || 'GTM-WZ23R6L2', // Your dev container ID
    dataLayerName: 'dataLayer',
    debug: true,
    preview: true
  },
  staging: {
    gtmId: import.meta.env.VITE_GTM_ID_STAGING || 'GTM-XXXXXXX', // Replace with your staging container ID
    dataLayerName: 'dataLayer',
    debug: true,
    preview: false
  },
  production: {
    gtmId: import.meta.env.VITE_GTM_ID || 'GTM-XXXXXXX', // Replace with your production container ID
    dataLayerName: 'dataLayer',
    debug: false,
    preview: false
  }
}

/**
 * Get GTM configuration for current environment
 * @returns {object} GTM configuration
 */
export const getGTMConfig = () => {
  const environment = import.meta.env.MODE || 'development'
  const config = GTM_CONFIG[environment] || GTM_CONFIG.development

  // Validate GTM ID
  if (!config.gtmId || config.gtmId === 'GTM-XXXXXXX') {
    console.warn('GTM ID not configured for environment:', environment)
    return null
  }

  return {
    ...config,
    environment
  }
}

/**
 * Default consent configuration
 * Used for GTM consent mode initialization
 */
export const DEFAULT_CONSENT_CONFIG = {
  // Wait for consent before loading non-essential tags
  wait_for_update: 2000, // 2 seconds timeout

  // Default consent state (before user interaction)
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted'
}

/**
 * Custom dimensions and metrics mapping
 * Map internal tracking to GTM custom dimensions/metrics
 */
export const GTM_CUSTOM_MAPPING = {
  dimensions: {
    user_type: 'custom_dimension_1', // student, educator, admin
    subscription_plan: 'custom_dimension_2', // free, premium, school
    region: 'custom_dimension_3', // EU, US, CA, etc.
    consent_status: 'custom_dimension_4', // full, partial, essential_only
    user_role: 'custom_dimension_5', // student, teacher, parent, admin
    school_type: 'custom_dimension_6', // public, private, homeschool
    grade_level: 'custom_dimension_7', // k-2, 3-5, 6-8, 9-12
    device_type: 'custom_dimension_8' // mobile, tablet, desktop
  },
  metrics: {
    session_duration: 'custom_metric_1',
    game_completion_time: 'custom_metric_2',
    lesson_progress: 'custom_metric_3',
    quiz_score: 'custom_metric_4'
  }
}

/**
 * Standard event names for consistent tracking
 */
export const GTM_EVENTS = {
  // Authentication events
  LOGIN: 'login',
  LOGOUT: 'logout',
  SIGNUP: 'sign_up',

  // Page tracking
  PAGE_VIEW: 'page_view',

  // Educational content
  LESSON_START: 'lesson_start',
  LESSON_COMPLETE: 'lesson_complete',
  QUIZ_START: 'quiz_start',
  QUIZ_COMPLETE: 'quiz_complete',

  // Game interactions
  GAME_START: 'game_start',
  GAME_COMPLETE: 'game_complete',
  GAME_LEVEL_UP: 'level_up',
  ACHIEVEMENT_UNLOCK: 'achievement_unlock',

  // E-commerce
  PURCHASE: 'purchase',
  SUBSCRIPTION_START: 'subscription_start',
  SUBSCRIPTION_CANCEL: 'subscription_cancel',

  // Engagement
  VIDEO_PLAY: 'video_play',
  VIDEO_COMPLETE: 'video_complete',
  DOWNLOAD: 'download',
  SEARCH: 'search',

  // Cookie consent
  CONSENT_GRANTED: 'consent_granted',
  CONSENT_DENIED: 'consent_denied',
  CONSENT_UPDATED: 'consent_updated',

  // Custom events
  CUSTOM_EVENT: 'custom_event'
}

/**
 * Enhanced ecommerce product categories
 */
export const PRODUCT_CATEGORIES = {
  SUBSCRIPTION: 'subscription',
  INDIVIDUAL_LESSON: 'lesson',
  GAME_ACCESS: 'game',
  PREMIUM_FEATURE: 'feature',
  CERTIFICATION: 'certification'
}

/**
 * User journey stages for funnel analysis
 */
export const USER_JOURNEY_STAGES = {
  VISITOR: 'visitor',
  REGISTERED: 'registered',
  ONBOARDED: 'onboarded',
  ACTIVE_USER: 'active_user',
  PREMIUM_USER: 'premium_user',
  CHURNED: 'churned'
}

export default {
  getGTMConfig,
  DEFAULT_CONSENT_CONFIG,
  GTM_CUSTOM_MAPPING,
  GTM_EVENTS,
  PRODUCT_CATEGORIES,
  USER_JOURNEY_STAGES
}
