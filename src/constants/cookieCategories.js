/**
 * Cookie Categories and Types Configuration
 * Defines standard cookie categories for GDPR, CCPA, and PIPEDA compliance
 */

export const COOKIE_CATEGORIES = {
  ESSENTIAL: 'essential',
  PERFORMANCE: 'performance', 
  FUNCTIONAL: 'functional',
  MARKETING: 'marketing'
};

export const COOKIE_CATEGORY_CONFIG = {
  [COOKIE_CATEGORIES.ESSENTIAL]: {
    name: 'Essential Cookies',
    description: 'These cookies are necessary for the website to function properly. They enable basic functionality like page navigation, access to secure areas, and authentication.',
    required: true,
    enabled: true,
    examples: ['Authentication tokens', 'Session management', 'Security cookies', 'Load balancing'],
    retention: 'Session or up to 1 year'
  },
  [COOKIE_CATEGORIES.PERFORMANCE]: {
    name: 'Performance Cookies',
    description: 'These cookies help us understand how visitors use our website by collecting anonymous information about page visits, time spent, and any errors encountered.',
    required: false,
    enabled: false,
    examples: ['Google Analytics', 'Performance monitoring', 'Error tracking', 'Page load times'],
    retention: 'Up to 2 years'
  },
  [COOKIE_CATEGORIES.FUNCTIONAL]: {
    name: 'Functional Cookies',
    description: 'These cookies enable enhanced functionality and personalization, such as remembering your preferences, language settings, and customizations.',
    required: false,
    enabled: false,
    examples: ['Language preferences', 'Theme settings', 'Accessibility options', 'User preferences'],
    retention: 'Up to 1 year'
  },
  [COOKIE_CATEGORIES.MARKETING]: {
    name: 'Marketing Cookies',
    description: 'These cookies are used to track visitors across websites to display relevant advertisements and measure the effectiveness of marketing campaigns.',
    required: false,
    enabled: false,
    examples: ['Advertising cookies', 'Social media plugins', 'Retargeting pixels', 'Campaign tracking'],
    retention: 'Up to 2 years'
  }
};

export const COOKIE_NAMES = {
  // Essential cookies
  VISITOR_ID: 'digipalz_visitor_id',
  USER_ID: 'digipalz_user_id',
  SESSION_ID: 'digipalz_session',
  CSRF_TOKEN: 'digipalz_csrf',
  
  // Consent management
  CONSENT_PREFERENCES: 'digipalz_consent_prefs',
  CONSENT_TIMESTAMP: 'digipalz_consent_time',
  CONSENT_VERSION: 'digipalz_consent_v',
  
  // Performance cookies
  ANALYTICS_ID: 'digipalz_analytics',
  PERFORMANCE_DATA: 'digipalz_perf',
  
  // Functional cookies
  LANGUAGE_PREF: 'digipalz_lang',
  THEME_PREF: 'digipalz_theme',
  ACCESSIBILITY_PREF: 'digipalz_a11y',
  
  // Marketing cookies (for future use)
  MARKETING_ID: 'digipalz_marketing',
  CAMPAIGN_ID: 'digipalz_campaign'
};

export const DEFAULT_CONSENT_PREFERENCES = {
  [COOKIE_CATEGORIES.ESSENTIAL]: true,
  [COOKIE_CATEGORIES.PERFORMANCE]: false,
  [COOKIE_CATEGORIES.FUNCTIONAL]: false,
  [COOKIE_CATEGORIES.MARKETING]: false
};

export const COOKIE_EXPIRY = {
  SESSION: 0, // Session cookie
  ONE_HOUR: 1 / 24,
  ONE_DAY: 1,
  ONE_WEEK: 7,
  ONE_MONTH: 30,
  THREE_MONTHS: 90,
  SIX_MONTHS: 180,
  ONE_YEAR: 365,
  TWO_YEARS: 730
};
