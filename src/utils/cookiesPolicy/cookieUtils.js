/**
 * Cookie Utility Functions
 * Helper functions for cookie operations, validation, and formatting
 */

import {
  COOKIE_CATEGORIES,
  COOKIE_CATEGORY_CONFIG
} from '../../constants/cookieCategories.js'
import { COMPLIANCE_RULES, REGIONS } from '../../constants/complianceRules.js'

/**
 * Validate cookie preferences object
 * @param {object} preferences - Cookie preferences to validate
 * @returns {object} Validation result
 */
export const validateCookiePreferences = (preferences) => {
  const errors = []
  const validCategories = Object.values(COOKIE_CATEGORIES)

  if (!preferences || typeof preferences !== 'object') {
    return {
      isValid: false,
      errors: ['Preferences must be an object'],
      sanitized: null
    }
  }

  const sanitized = {}

  // Validate each category
  Object.keys(preferences).forEach((category) => {
    if (!validCategories.includes(category)) {
      errors.push(`Invalid cookie category: ${category}`)
      return
    }

    const value = preferences[category]
    if (typeof value !== 'boolean') {
      errors.push(`Category ${category} must be a boolean value`)
      return
    }

    sanitized[category] = value
  })

  // Ensure essential cookies are always true
  sanitized[COOKIE_CATEGORIES.ESSENTIAL] = true

  // Add missing categories with default false
  validCategories.forEach((category) => {
    if (!(category in sanitized)) {
      sanitized[category] = category === COOKIE_CATEGORIES.ESSENTIAL
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  }
}

/**
 * Format cookie preferences for display
 * @param {object} preferences - Cookie preferences
 * @returns {array} Formatted preferences for UI
 */
export const formatPreferencesForDisplay = (preferences) => {
  if (!preferences) return []

  return Object.values(COOKIE_CATEGORIES).map((category) => {
    const config = COOKIE_CATEGORY_CONFIG[category]
    const isEnabled = preferences[category] || false

    return {
      category,
      name: config.name,
      description: config.description,
      examples: config.examples,
      retention: config.retention,
      required: config.required,
      enabled: isEnabled,
      canToggle: !config.required
    }
  })
}

/**
 * Calculate consent statistics
 * @param {object} preferences - Cookie preferences
 * @returns {object} Consent statistics
 */
export const calculateConsentStats = (preferences) => {
  if (!preferences) {
    return {
      totalCategories: Object.keys(COOKIE_CATEGORIES).length,
      acceptedCategories: 1, // Essential always accepted
      rejectedCategories: Object.keys(COOKIE_CATEGORIES).length - 1,
      acceptanceRate: 0.25 // 1/4 for essential only
    }
  }

  const totalCategories = Object.keys(COOKIE_CATEGORIES).length
  const acceptedCategories = Object.values(preferences).filter(Boolean).length
  const rejectedCategories = totalCategories - acceptedCategories
  const acceptanceRate = acceptedCategories / totalCategories

  return {
    totalCategories,
    acceptedCategories,
    rejectedCategories,
    acceptanceRate: Math.round(acceptanceRate * 100) / 100
  }
}

/**
 * Get regional compliance requirements
 * @param {string} region - User's region
 * @returns {object} Compliance requirements
 */
export const getRegionalRequirements = (region) => {
  return COMPLIANCE_RULES[region] || COMPLIANCE_RULES[REGIONS.OTHER]
}

/**
 * Check if cookie banner should be shown
 * @param {boolean} hasValidConsent - Whether user has valid consent
 * @param {string} region - User's region
 * @returns {boolean} Whether to show banner
 */
export const shouldShowCookieBanner = (
  hasValidConsent,
  region = REGIONS.OTHER
) => {
  const rules = getRegionalRequirements(region)

  // Always show if no valid consent
  if (!hasValidConsent) {
    return true
  }

  // For regions that require explicit consent, show banner if not consented
  if (rules.requiresExplicitConsent && !hasValidConsent) {
    return true
  }

  return false
}

/**
 * Generate cookie policy text based on region
 * @param {string} region - User's region
 * @returns {object} Cookie policy text
 */
export const generateCookiePolicyText = (region) => {
  const rules = getRegionalRequirements(region)

  const baseText = {
    title: 'Cookie Policy',
    intro:
      'We use cookies to enhance your experience on our website. This policy explains how we use cookies and your choices regarding them.',

    essential: {
      title: 'Essential Cookies',
      description:
        'These cookies are necessary for the website to function properly and cannot be disabled.',
      required: true
    },

    performance: {
      title: 'Performance Cookies',
      description:
        'These cookies help us understand how visitors use our website by collecting anonymous information.',
      required: false
    },

    functional: {
      title: 'Functional Cookies',
      description:
        'These cookies enable enhanced functionality and personalization of the website.',
      required: false
    },

    marketing: {
      title: 'Marketing Cookies',
      description:
        'These cookies are used to track visitors across websites to display relevant advertisements.',
      required: false
    }
  }

  // Add region-specific requirements
  if (rules.requiresExplicitConsent) {
    baseText.consentNotice =
      'We require your explicit consent before using non-essential cookies. You can withdraw your consent at any time.'
  }


  if (rules.requiresRightToBeforgotten) {
    baseText.dataRightsNotice =
      'You have the right to request deletion of your personal data at any time.'
  }

  return baseText
}

/**
 * Parse cookie value safely
 * @param {string} value - Cookie value to parse
 * @param {any} defaultValue - Default value if parsing fails
 * @returns {any} Parsed value or default
 */
export const safeParseCookieValue = (value, defaultValue = null) => {
  if (!value || typeof value !== 'string') {
    return defaultValue
  }

  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

/**
 * Format cookie expiry date
 * @param {number} days - Number of days
 * @returns {Date} Expiry date
 */
export const formatCookieExpiry = (days) => {
  const date = new Date()
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
  return date
}

/**
 * Check if browser supports cookies
 * @returns {boolean} Whether cookies are supported
 */
export const isCookieSupported = () => {
  try {
    // Test cookie support
    const testKey = 'test_cookie_support'
    const testValue = 'test'

    document.cookie = `${testKey}=${testValue}; path=/; SameSite=Lax`
    const supported = document.cookie.indexOf(`${testKey}=${testValue}`) !== -1

    // Clean up test cookie
    document.cookie = `${testKey}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`

    return supported
  } catch {
    return false
  }
}

/**
 * Get cookie size in bytes
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @returns {number} Size in bytes
 */
export const getCookieSize = (name, value) => {
  return new Blob([`${name}=${value}`]).size
}

/**
 * Check if we're approaching cookie limits
 * @returns {object} Cookie limit information
 */
export const checkCookieLimits = () => {
  const cookieString = document.cookie
  const cookieCount = cookieString ? cookieString.split(';').length : 0
  const cookieSize = new Blob([cookieString]).size

  return {
    count: cookieCount,
    size: cookieSize,
    maxCount: 300, // Browser limit (approximate)
    maxSize: 4096, // 4KB limit per cookie
    isNearLimit: cookieCount > 250 || cookieSize > 3500
  }
}

/**
 * Convert preferences to analytics consent mode
 * @param {object} preferences - Cookie preferences
 * @returns {object} Google Analytics consent mode object
 */
export const toAnalyticsConsentMode = (preferences) => {
  if (!preferences) {
    return {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      functionality_storage: 'denied',
      personalization_storage: 'denied'
    }
  }

  return {
    analytics_storage: preferences[COOKIE_CATEGORIES.PERFORMANCE]
      ? 'granted'
      : 'denied',
    ad_storage: preferences[COOKIE_CATEGORIES.MARKETING] ? 'granted' : 'denied',
    functionality_storage: preferences[COOKIE_CATEGORIES.FUNCTIONAL]
      ? 'granted'
      : 'denied',
    personalization_storage: preferences[COOKIE_CATEGORIES.FUNCTIONAL]
      ? 'granted'
      : 'denied'
  }
}
