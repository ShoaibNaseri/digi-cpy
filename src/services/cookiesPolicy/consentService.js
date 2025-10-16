/**
 * Consent Management Service
 * Handles user consent preferences, compliance rules, and consent history
 * Provides GDPR, CCPA, and PIPEDA compliant consent management
 */

import cookieService from './cookieService.js'
import {
  COOKIE_NAMES,
  COOKIE_CATEGORIES,
  DEFAULT_CONSENT_PREFERENCES,
  COOKIE_EXPIRY
} from '../../constants/cookieCategories.js'
import {
  COMPLIANCE_RULES,
  REGIONS,
  CONSENT_ACTIONS
} from '../../constants/complianceRules.js'

class ConsentService {
  constructor() {
    this.consentVersion = '1.0'
    this.listeners = new Set()
  }

  /**
   * Save user consent preferences
   * @param {object} preferences - User's consent preferences
   * @param {string} action - Consent action taken
   * @param {string} region - User's region
   */
  saveConsentPreferences(
    preferences,
    action = CONSENT_ACTIONS.SAVE_PREFERENCES,
    region = REGIONS.OTHER
  ) {
    try {
      const timestamp = new Date().toISOString()
      const { currentId, isUser } = cookieService.getCurrentIdentifier()

      // Ensure essential cookies are always enabled
      const finalPreferences = {
        ...preferences,
        [COOKIE_CATEGORIES.ESSENTIAL]: true
      }

      // Save preferences
      cookieService.setCookie(
        COOKIE_NAMES.CONSENT_PREFERENCES,
        finalPreferences,
        {
          expires: COOKIE_EXPIRY.ONE_YEAR
        }
      )

      // Save consent metadata
      const consentData = {
        version: this.consentVersion,
        timestamp,
        action,
        region,
        userId: isUser ? currentId : null,
        visitorId: isUser ? null : currentId,
        preferences: finalPreferences,
        userAgent: navigator.userAgent,
        ip: null // Will be set server-side if needed
      }

      cookieService.setCookie(COOKIE_NAMES.CONSENT_TIMESTAMP, timestamp)
      cookieService.setCookie(COOKIE_NAMES.CONSENT_VERSION, this.consentVersion)

      // Store detailed consent record (for compliance audits)
      this.recordConsentAction(consentData)

      // Notify listeners about consent change
      this.notifyListeners(finalPreferences, action)

      return true
    } catch (error) {
      console.error('Error saving consent preferences:', error)
      return false
    }
  }

  /**
   * Get current consent preferences
   * @returns {object|null} Current consent preferences or null
   */
  getConsentPreferences() {
    try {
      const preferences = cookieService.getCookie(
        COOKIE_NAMES.CONSENT_PREFERENCES,
        true
      )

      if (!preferences) {
        return null
      }

      // Ensure essential cookies are always enabled
      return {
        ...preferences,
        [COOKIE_CATEGORIES.ESSENTIAL]: true
      }
    } catch (error) {
      console.error('Error getting consent preferences:', error)
      return null
    }
  }

  /**
   * Check if user has valid consent
   * @param {string} region - User's region for compliance rules
   * @returns {boolean} True if consent is valid
   */
  hasValidConsent(region = REGIONS.OTHER) {
    try {
      const preferences = this.getConsentPreferences()
      const timestamp = cookieService.getCookie(COOKIE_NAMES.CONSENT_TIMESTAMP)
      const version = cookieService.getCookie(COOKIE_NAMES.CONSENT_VERSION)

      if (!preferences || !timestamp || !version) {
        return false
      }

      // Check if consent has expired
      const consentDate = new Date(timestamp)
      const now = new Date()
      const daysSinceConsent = (now - consentDate) / (1000 * 60 * 60 * 24)
      const rules = COMPLIANCE_RULES[region] || COMPLIANCE_RULES[REGIONS.OTHER]

      if (daysSinceConsent > rules.consentExpiryDays) {
        return false
      }

      // Check if consent version is current
      if (version !== this.consentVersion) {
        return false
      }

      return true
    } catch (error) {
      console.error('Error checking consent validity:', error)
      return false
    }
  }

  /**
   * Get consent preferences for a specific region with defaults
   * @param {string} region - User's region
   * @returns {object} Consent preferences with regional defaults
   */
  getConsentPreferencesForRegion(region) {
    const existingPreferences = this.getConsentPreferences()
    const rules = COMPLIANCE_RULES[region] || COMPLIANCE_RULES[REGIONS.OTHER]

    if (existingPreferences && this.hasValidConsent(region)) {
      return existingPreferences
    }

    // Return default preferences based on region
    const defaultPrefs = { ...DEFAULT_CONSENT_PREFERENCES }

    if (rules.defaultConsent) {
      // For regions that allow default consent (like US), enable non-essential cookies
      Object.keys(defaultPrefs).forEach((category) => {
        if (category !== COOKIE_CATEGORIES.ESSENTIAL) {
          defaultPrefs[category] = true
        }
      })
    }

    return defaultPrefs
  }

  /**
   * Record consent action for audit trail
   * @param {object} consentData - Consent action data
   */
  recordConsentAction(consentData) {
    try {
      // Get existing consent history
      const historyKey = 'digipalz_consent_history'
      const existingHistory = cookieService.getCookie(historyKey, true) || []

      // Add new consent record
      const newHistory = [consentData, ...existingHistory.slice(0, 9)] // Keep last 10 records

      cookieService.setCookie(historyKey, newHistory, {
        expires: COOKIE_EXPIRY.TWO_YEARS
      })
    } catch (error) {
      console.error('Error recording consent action:', error)
    }
  }

  /**
   * Withdraw all consent (GDPR right to withdraw)
   * @param {string} region - User's region
   */
  withdrawConsent(region = REGIONS.OTHER) {
    try {
      // Set all non-essential cookies to false
      const withdrawnPreferences = {
        [COOKIE_CATEGORIES.ESSENTIAL]: true,
        [COOKIE_CATEGORIES.PERFORMANCE]: false,
        [COOKIE_CATEGORIES.FUNCTIONAL]: false,
        [COOKIE_CATEGORIES.MARKETING]: false
      }

      this.saveConsentPreferences(
        withdrawnPreferences,
        CONSENT_ACTIONS.WITHDRAW_CONSENT,
        region
      )

      // Clear non-essential cookies
      this.clearNonEssentialCookies()

      return true
    } catch (error) {
      console.error('Error withdrawing consent:', error)
      return false
    }
  }

  /**
   * Accept all cookies
   * @param {string} region - User's region
   */
  acceptAllCookies(region = REGIONS.OTHER) {
    const allAcceptedPreferences = {
      [COOKIE_CATEGORIES.ESSENTIAL]: true,
      [COOKIE_CATEGORIES.PERFORMANCE]: true,
      [COOKIE_CATEGORIES.FUNCTIONAL]: true,
      [COOKIE_CATEGORIES.MARKETING]: true
    }

    return this.saveConsentPreferences(
      allAcceptedPreferences,
      CONSENT_ACTIONS.ACCEPT_ALL,
      region
    )
  }

  /**
   * Reject all non-essential cookies
   * @param {string} region - User's region
   */
  rejectAllCookies(region = REGIONS.OTHER) {
    const rejectedPreferences = {
      [COOKIE_CATEGORIES.ESSENTIAL]: true,
      [COOKIE_CATEGORIES.PERFORMANCE]: false,
      [COOKIE_CATEGORIES.FUNCTIONAL]: false,
      [COOKIE_CATEGORIES.MARKETING]: false
    }

    const success = this.saveConsentPreferences(
      rejectedPreferences,
      CONSENT_ACTIONS.REJECT_ALL,
      region
    )

    if (success) {
      this.clearNonEssentialCookies()
    }

    return success
  }

  /**
   * Clear non-essential cookies based on preferences
   */
  clearNonEssentialCookies() {
    const preferences = this.getConsentPreferences()

    if (!preferences) return

    // Clear performance cookies if not consented
    if (!preferences[COOKIE_CATEGORIES.PERFORMANCE]) {
      cookieService.deleteCookie(COOKIE_NAMES.ANALYTICS_ID)
      cookieService.deleteCookie(COOKIE_NAMES.PERFORMANCE_DATA)
    }

    // Clear functional cookies if not consented
    if (!preferences[COOKIE_CATEGORIES.FUNCTIONAL]) {
      cookieService.deleteCookie(COOKIE_NAMES.LANGUAGE_PREF)
      cookieService.deleteCookie(COOKIE_NAMES.THEME_PREF)
      cookieService.deleteCookie(COOKIE_NAMES.ACCESSIBILITY_PREF)
    }

    // Clear marketing cookies if not consented
    if (!preferences[COOKIE_CATEGORIES.MARKETING]) {
      cookieService.deleteCookie(COOKIE_NAMES.MARKETING_ID)
      cookieService.deleteCookie(COOKIE_NAMES.CAMPAIGN_ID)
    }
  }

  /**
   * Clear cookies by specific category
   * @param {string} category - Cookie category to clear
   */
  clearCookiesByCategory(category) {
    switch (category) {
      case COOKIE_CATEGORIES.PERFORMANCE:
        cookieService.deleteCookie(COOKIE_NAMES.ANALYTICS_ID)
        cookieService.deleteCookie(COOKIE_NAMES.PERFORMANCE_DATA)
        // Also clear any third-party analytics cookies
        this.clearThirdPartyAnalyticsCookies()
        break

      case COOKIE_CATEGORIES.FUNCTIONAL:
        cookieService.deleteCookie(COOKIE_NAMES.LANGUAGE_PREF)
        cookieService.deleteCookie(COOKIE_NAMES.THEME_PREF)
        cookieService.deleteCookie(COOKIE_NAMES.ACCESSIBILITY_PREF)
        break

      case COOKIE_CATEGORIES.MARKETING:
        cookieService.deleteCookie(COOKIE_NAMES.MARKETING_ID)
        cookieService.deleteCookie(COOKIE_NAMES.CAMPAIGN_ID)
        // Clear common third-party marketing cookies
        this.clearThirdPartyMarketingCookies()
        break

      case COOKIE_CATEGORIES.ESSENTIAL:
        // Never clear essential cookies
        console.warn(
          'Cannot clear essential cookies - they are required for basic functionality'
        )
        break

      default:
        console.warn(`Unknown cookie category: ${category}`)
    }
  }

  /**
   * Clear common third-party analytics cookies
   */
  clearThirdPartyAnalyticsCookies() {
    const analyticsCookies = [
      '_ga',
      '_ga_*',
      '_gid',
      '_gat',
      '_gat_*', // Google Analytics
      '_fbp',
      '_fbc', // Facebook Pixel
      '_hjid',
      '_hjFirstSeen', // Hotjar
      '__utma',
      '__utmb',
      '__utmc',
      '__utmz' // Legacy Google Analytics
    ]

    analyticsCookies.forEach((cookieName) => {
      if (cookieName.includes('*')) {
        // Handle wildcard cookies - find all matching cookies
        const baseName = cookieName.replace('*', '')
        document.cookie.split(';').forEach((cookie) => {
          const name = cookie.trim().split('=')[0]
          if (name.startsWith(baseName)) {
            cookieService.deleteCookie(name)
          }
        })
      } else {
        cookieService.deleteCookie(cookieName)
      }
    })
  }

  /**
   * Clear common third-party marketing cookies
   */
  clearThirdPartyMarketingCookies() {
    const marketingCookies = [
      '_gcl_au',
      '_gcl_aw', // Google Ads
      '_fbp',
      '_fbc', // Facebook
      'IDE',
      'DSID',
      'FLC', // Google DoubleClick
      'tr',
      'fr', // Facebook
      '_ttp', // TikTok
      '_pin_unauth',
      'v3' // Pinterest
    ]

    marketingCookies.forEach((cookieName) => {
      cookieService.deleteCookie(cookieName)
      // Also try to delete from different domains/paths
      cookieService.deleteCookie(cookieName, { domain: '.google.com' })
      cookieService.deleteCookie(cookieName, { domain: '.facebook.com' })
      cookieService.deleteCookie(cookieName, { domain: '.doubleclick.net' })
    })
  }

  /**
   * Export user's consent data (GDPR data portability)
   * @returns {object} User's consent data
   */
  exportConsentData() {
    try {
      const { currentId, isUser } = cookieService.getCurrentIdentifier()
      const preferences = this.getConsentPreferences()
      const timestamp = cookieService.getCookie(COOKIE_NAMES.CONSENT_TIMESTAMP)
      const version = cookieService.getCookie(COOKIE_NAMES.CONSENT_VERSION)
      const history =
        cookieService.getCookie('digipalz_consent_history', true) || []

      return {
        userId: isUser ? currentId : null,
        visitorId: isUser ? null : currentId,
        currentPreferences: preferences,
        consentTimestamp: timestamp,
        consentVersion: version,
        consentHistory: history,
        exportTimestamp: new Date().toISOString(),
        dataFormat: 'JSON'
      }
    } catch (error) {
      console.error('Error exporting consent data:', error)
      return null
    }
  }

  /**
   * Check if specific cookie category is consented
   * @param {string} category - Cookie category
   * @returns {boolean} True if consented
   */
  isConsentedForCategory(category) {
    const preferences = this.getConsentPreferences()

    if (!preferences) {
      return category === COOKIE_CATEGORIES.ESSENTIAL
    }

    return preferences[category] === true
  }

  /**
   * Add consent change listener
   * @param {function} callback - Callback function
   */
  addConsentListener(callback) {
    this.listeners.add(callback)
  }

  /**
   * Remove consent change listener
   * @param {function} callback - Callback function
   */
  removeConsentListener(callback) {
    this.listeners.delete(callback)
  }

  /**
   * Notify all listeners about consent changes
   * @param {object} preferences - New preferences
   * @param {string} action - Action taken
   */
  notifyListeners(preferences, action) {
    this.listeners.forEach((callback) => {
      try {
        callback(preferences, action)
      } catch (error) {
        console.error('Error in consent listener:', error)
      }
    })
  }

  /**
   * Get consent summary for display
   * @returns {object} Consent summary
   */
  getConsentSummary() {
    const preferences = this.getConsentPreferences()
    const timestamp = cookieService.getCookie(COOKIE_NAMES.CONSENT_TIMESTAMP)

    if (!preferences) {
      return {
        hasConsent: false,
        consentDate: null,
        categoriesAccepted: 0,
        totalCategories: Object.keys(COOKIE_CATEGORIES).length
      }
    }

    const acceptedCategories = Object.values(preferences).filter(Boolean).length

    return {
      hasConsent: true,
      consentDate: timestamp ? new Date(timestamp) : null,
      categoriesAccepted: acceptedCategories,
      totalCategories: Object.keys(COOKIE_CATEGORIES).length,
      preferences,
      hasOptedOutOfSale: this.hasOptedOutOfDataSale()
    }
  }

  /**
   * Check if user has opted out of data sale/sharing (CCPA compliance)
   * @returns {boolean} True if user has opted out
   */
  hasOptedOutOfDataSale() {
    const preferences = this.getConsentPreferences()

    if (!preferences) return false

    // Consider opted out if both marketing and performance are disabled
    // (performance can be used for tracking/profiling)
    return (
      preferences[COOKIE_CATEGORIES.MARKETING] === false &&
      preferences[COOKIE_CATEGORIES.PERFORMANCE] === false
    )
  }

  /**
   * Get opt-out status for compliance reporting
   * @returns {object} Detailed opt-out status
   */
  getOptOutStatus() {
    const preferences = this.getConsentPreferences()
    const history =
      cookieService.getCookie('digipalz_consent_history', true) || []

    // Find the most recent opt-out action
    const lastOptOut = history.find(
      (record) => record.action === 'opt_out' || record.action === 'do_not_sell'
    )

    return {
      hasOptedOut: this.hasOptedOutOfDataSale(),
      optOutDate: lastOptOut?.timestamp || null,
      optOutType: lastOptOut?.action || null,
      marketingDisabled: preferences?.[COOKIE_CATEGORIES.MARKETING] === false,
      performanceDisabled:
        preferences?.[COOKIE_CATEGORIES.PERFORMANCE] === false,
      preferences
    }
  }
}

// Create and export singleton instance
const consentService = new ConsentService()
export default consentService
