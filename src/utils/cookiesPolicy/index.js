/**
 * Cookie Policy Utilities - Main Export File
 * Provides convenient access to all cookie policy services and utilities
 */

// Core Services
export { default as cookieService } from '../../services/cookiesPolicy/cookieService.js'
export { default as consentService } from '../../services/cookiesPolicy/consentService.js'
export { default as trackingService } from '../../services/cookiesPolicy/trackingService.js'

// Utilities
export { default as geoLocationService } from './geoLocation.js'
export * from './cookieUtils.js'

// Constants
export * from '../../constants/cookieCategories.js'
export * from '../../constants/complianceRules.js'

/**
 * Initialize cookie policy system
 * @param {object} options - Initialization options
 * @returns {Promise<object>} Initialization result
 */
export const initializeCookiePolicy = async (options = {}) => {
  try {
    const {
      cookieService,
      consentService,
      trackingService,
      geoLocationService
    } = await import('./index.js')

    // Initialize GTM if configured
    if (options.gtm?.enabled) {
      try {
        const gtmService = await import('../../services/gtm/gtmService.js')
        const { getGTMConfig } = await import('../../config/gtm.js')

        const gtmConfig = getGTMConfig()
        if (gtmConfig) {
          gtmService.default.initialize({
            ...gtmConfig,
            ...options.gtm
          })
        }
      } catch (gtmError) {
        console.warn('GTM initialization failed:', gtmError)
      }
    }

    // Detect user's region
    const locationInfo = await geoLocationService.getDetailedLocationInfo()

    // Initialize visitor tracking
    const visitorId = trackingService.initializeVisitorTracking()

    // Check existing consent
    const hasValidConsent = consentService.hasValidConsent(locationInfo.region)
    const preferences = consentService.getConsentPreferencesForRegion(
      locationInfo.region
    )

    // Initialize analytics if consent given
    if (consentService.isConsentedForCategory('performance')) {
      trackingService.initializeAnalytics(options.analytics || {})
    }

    const result = {
      initialized: true,
      visitorId,
      locationInfo,
      hasValidConsent,
      preferences,
      showBanner: !hasValidConsent,
      services: {
        cookieService,
        consentService,
        trackingService,
        geoLocationService
      }
    }

    return result
  } catch (error) {
    console.error('Error initializing cookie policy system:', error)

    return {
      initialized: false,
      error: error.message,
      showBanner: true, // Show banner on error for safety
      locationInfo: {
        region: 'eu', // Fallback to most restrictive
        complianceRules: { requiresExplicitConsent: true }
      }
    }
  }
}

/**
 * Quick setup for common use cases
 */
export const quickSetup = {
  /**
   * Accept all cookies
   * @param {string} region - User's region
   */
  acceptAll: async (region = 'other') => {
    const { consentService, trackingService } = await import('./index.js')

    const success = consentService.acceptAllCookies(region)
    if (success) {
      trackingService.initializeAnalytics()
      trackingService.trackConsentEvent(
        'accept_all',
        consentService.getConsentPreferences()
      )
    }
    return success
  },

  /**
   * Reject all non-essential cookies
   * @param {string} region - User's region
   */
  rejectAll: async (region = 'other') => {
    const { consentService, trackingService } = await import('./index.js')

    const success = consentService.rejectAllCookies(region)
    if (success) {
      trackingService.trackConsentEvent(
        'reject_all',
        consentService.getConsentPreferences()
      )
    }
    return success
  },

  /**
   * Save custom preferences
   * @param {object} preferences - Cookie preferences
   * @param {string} region - User's region
   */
  savePreferences: async (preferences, region = 'other') => {
    const { consentService, trackingService } = await import('./index.js')

    const success = consentService.saveConsentPreferences(
      preferences,
      'save_preferences',
      region
    )
    if (success) {
      if (consentService.isConsentedForCategory('performance')) {
        trackingService.initializeAnalytics()
      }
      trackingService.trackConsentEvent('save_preferences', preferences)
    }
    return success
  }
}
