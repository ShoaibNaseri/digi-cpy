/**
 * Geolocation Detection Service
 * Detects user's location for compliance rule determination
 * Uses IP-based geolocation with fallback strategies
 */

import { REGIONS, COMPLIANCE_RULES } from '../../constants/complianceRules.js'

class GeoLocationService {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 24 * 60 * 60 * 1000 // 24 hours
    this.detectionPromise = null
  }

  /**
   * Detect user's region with caching and fallback strategies
   * @returns {Promise<string>} User's region code
   */
  async detectUserRegion() {
    try {
      // Check for testing override first
      const testRegion = this.getTestRegionOverride()
      if (testRegion) {
        // Cache the test region
        this.cacheRegion(testRegion)
        return testRegion
      }

      // Check cache first
      const cachedRegion = this.getCachedRegion()
      if (cachedRegion) {
        return cachedRegion
      }

      // Prevent multiple simultaneous detection calls
      if (this.detectionPromise) {
        return await this.detectionPromise
      }

      // Start detection process
      this.detectionPromise = this.performDetection()
      const region = await this.detectionPromise
      this.detectionPromise = null

      return region
    } catch (error) {
      console.error('Error detecting user region:', error)
      return this.getFallbackRegion()
    }
  }

  /**
   * Perform the actual geolocation detection
   * @returns {Promise<string>} Detected region
   */
  async performDetection() {
    const detectionMethods = [
      () => this.detectViaIPAPI(),
      () => this.detectViaTimezone(),
      () => this.detectViaLanguage(),
      () => this.detectViaUserAgent()
    ]

    for (const method of detectionMethods) {
      try {
        const region = await method()
        if (region && region !== REGIONS.OTHER) {
          this.cacheRegion(region)
          return region
        }
      } catch (error) {
        console.warn(`Detection method ${method.name} failed:`, error)
        continue
      }
    }

    // If all methods fail, use fallback
    const fallbackRegion = this.getFallbackRegion()
    this.cacheRegion(fallbackRegion)
    return fallbackRegion
  }

  /**
   * Detect region using IP-API service
   * @returns {Promise<string>} Region code
   */
  async detectViaIPAPI() {
    try {
      const response = await fetch('https://ipapi.co/json/', {
        method: 'GET',
        timeout: 5000,
        headers: {
          Accept: 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`IP-API request failed: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(`IP-API error: ${data.reason}`)
      }

      const countryCode = data.country_code?.toUpperCase()
      const region = this.mapCountryToRegion(
        countryCode,
        data.region,
        data.country_name
      )

      return region
    } catch (error) {
      console.warn('IP-API detection failed:', error)
      throw error
    }
  }

  /**
   * Detect region using timezone
   * @returns {string} Region code based on timezone
   */
  detectViaTimezone() {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

      // Map common timezones to regions
      const timezoneRegionMap = {
        // European timezones
        'Europe/London': REGIONS.UK,
        'Europe/Dublin': REGIONS.EU,
        'Europe/Paris': REGIONS.EU,
        'Europe/Berlin': REGIONS.EU,
        'Europe/Madrid': REGIONS.EU,
        'Europe/Rome': REGIONS.EU,
        'Europe/Amsterdam': REGIONS.EU,
        'Europe/Brussels': REGIONS.EU,
        'Europe/Vienna': REGIONS.EU,
        'Europe/Prague': REGIONS.EU,
        'Europe/Warsaw': REGIONS.EU,
        'Europe/Stockholm': REGIONS.EU,
        'Europe/Helsinki': REGIONS.EU,
        'Europe/Athens': REGIONS.EU,
        'Europe/Lisbon': REGIONS.EU,
        'Europe/Zurich': REGIONS.EU,

        // North American timezones
        'America/Los_Angeles': REGIONS.US_CALIFORNIA,
        'America/San_Francisco': REGIONS.US_CALIFORNIA,
        'America/Tijuana': REGIONS.US_CALIFORNIA,
        'America/New_York': REGIONS.US_OTHER,
        'America/Chicago': REGIONS.US_OTHER,
        'America/Denver': REGIONS.US_OTHER,
        'America/Phoenix': REGIONS.US_OTHER,
        'America/Anchorage': REGIONS.US_OTHER,
        'Pacific/Honolulu': REGIONS.US_OTHER,

        // Canadian timezones
        'America/Toronto': REGIONS.CANADA,
        'America/Vancouver': REGIONS.CANADA,
        'America/Montreal': REGIONS.CANADA,
        'America/Halifax': REGIONS.CANADA,
        'America/Winnipeg': REGIONS.CANADA,
        'America/Edmonton': REGIONS.CANADA,
        'America/St_Johns': REGIONS.CANADA
      }

      const region = timezoneRegionMap[timezone]
      if (region) {
        return region
      }

      // Fallback timezone analysis
      if (timezone.startsWith('Europe/')) return REGIONS.EU
      if (timezone.startsWith('America/')) {
        if (
          timezone.includes('Los_Angeles') ||
          timezone.includes('San_Francisco')
        ) {
          return REGIONS.US_CALIFORNIA
        }
        return timezone.includes('Canada') ? REGIONS.CANADA : REGIONS.US_OTHER
      }

      return REGIONS.OTHER
    } catch (error) {
      console.warn('Timezone detection failed:', error)
      throw error
    }
  }

  /**
   * Detect region using browser language
   * @returns {string} Region code based on language
   */
  detectViaLanguage() {
    try {
      const languages = navigator.languages || [navigator.language]
      const primaryLanguage = languages[0]?.toLowerCase()

      // Map language codes to regions
      const languageRegionMap = {
        'en-gb': REGIONS.UK,
        'en-uk': REGIONS.UK,
        'en-ca': REGIONS.CANADA,
        'fr-ca': REGIONS.CANADA,
        'en-us': REGIONS.US_OTHER,
        'es-us': REGIONS.US_OTHER,

        // European languages
        de: REGIONS.EU,
        'de-de': REGIONS.EU,
        'de-at': REGIONS.EU,
        'de-ch': REGIONS.EU,
        fr: REGIONS.EU,
        'fr-fr': REGIONS.EU,
        'fr-be': REGIONS.EU,
        es: REGIONS.EU,
        'es-es': REGIONS.EU,
        it: REGIONS.EU,
        'it-it': REGIONS.EU,
        nl: REGIONS.EU,
        'nl-nl': REGIONS.EU,
        'nl-be': REGIONS.EU,
        pt: REGIONS.EU,
        'pt-pt': REGIONS.EU,
        pl: REGIONS.EU,
        'pl-pl': REGIONS.EU,
        sv: REGIONS.EU,
        'sv-se': REGIONS.EU,
        da: REGIONS.EU,
        'da-dk': REGIONS.EU,
        no: REGIONS.EU,
        'no-no': REGIONS.EU,
        fi: REGIONS.EU,
        'fi-fi': REGIONS.EU,
        el: REGIONS.EU,
        'el-gr': REGIONS.EU,
        cs: REGIONS.EU,
        'cs-cz': REGIONS.EU,
        hu: REGIONS.EU,
        'hu-hu': REGIONS.EU,
        ro: REGIONS.EU,
        'ro-ro': REGIONS.EU,
        bg: REGIONS.EU,
        'bg-bg': REGIONS.EU,
        hr: REGIONS.EU,
        'hr-hr': REGIONS.EU,
        sk: REGIONS.EU,
        'sk-sk': REGIONS.EU,
        sl: REGIONS.EU,
        'sl-si': REGIONS.EU,
        et: REGIONS.EU,
        'et-ee': REGIONS.EU,
        lv: REGIONS.EU,
        'lv-lv': REGIONS.EU,
        lt: REGIONS.EU,
        'lt-lt': REGIONS.EU,
        mt: REGIONS.EU,
        'mt-mt': REGIONS.EU
      }

      const region = languageRegionMap[primaryLanguage]
      if (region) {
        return region
      }

      // Check for language prefix matches
      const languagePrefix = primaryLanguage?.split('-')[0]
      if (languagePrefix === 'en') {
        // Default English to US unless specified
        return REGIONS.US_OTHER
      }

      return REGIONS.OTHER
    } catch (error) {
      console.warn('Language detection failed:', error)
      throw error
    }
  }

  /**
   * Detect region using User Agent analysis
   * @returns {string} Region code based on User Agent
   */
  detectViaUserAgent() {
    try {
      const userAgent = navigator.userAgent.toLowerCase()

      // This is a very basic analysis - User Agent is not reliable for geolocation
      // but can provide some hints

      if (userAgent.includes('windows nt')) {
        // Windows is common worldwide, not very helpful
        return REGIONS.OTHER
      }

      // This method is intentionally basic as User Agent is not a reliable
      // geolocation method and should only be used as a last resort
      return REGIONS.OTHER
    } catch (error) {
      console.warn('User Agent detection failed:', error)
      throw error
    }
  }

  /**
   * Map country code to compliance region
   * @param {string} countryCode - ISO country code
   * @param {string} regionName - Region/state name
   * @param {string} country - Country name
   * @returns {string} Compliance region
   */
  mapCountryToRegion(countryCode, regionName = '', country = '') {
    if (!countryCode) return REGIONS.OTHER

    // EU countries
    const euCountries = [
      'AT',
      'BE',
      'BG',
      'HR',
      'CY',
      'CZ',
      'DK',
      'EE',
      'FI',
      'FR',
      'DE',
      'GR',
      'HU',
      'IE',
      'IT',
      'LV',
      'LT',
      'LU',
      'MT',
      'NL',
      'PL',
      'PT',
      'RO',
      'SK',
      'SI',
      'ES',
      'SE'
    ]

    if (countryCode === 'GB' || countryCode === 'UK') {
      return REGIONS.UK
    }

    if (euCountries.includes(countryCode)) {
      return REGIONS.EU
    }

    if (countryCode === 'US') {
      // Check if it's California
      const californiaKeywords = ['california', 'ca', 'calif']
      const regionLower = regionName?.toLowerCase() || ''

      if (californiaKeywords.some((keyword) => regionLower.includes(keyword))) {
        return REGIONS.US_CALIFORNIA
      }
      return REGIONS.US_OTHER
    }

    if (countryCode === 'CA') {
      return REGIONS.CANADA
    }

    return REGIONS.OTHER
  }

  /**
   * Get compliance rules for detected region
   * @param {string} region - Region code
   * @returns {object} Compliance rules
   */
  getComplianceRules(region) {
    return COMPLIANCE_RULES[region] || COMPLIANCE_RULES[REGIONS.OTHER]
  }

  /**
   * Check if GDPR banner should be shown
   * @param {string} region - Region code
   * @returns {boolean} Whether to show GDPR banner
   */
  shouldShowGDPRBanner(region) {
    const rules = this.getComplianceRules(region)
    return rules.requiresExplicitConsent && rules.regulation.includes('GDPR')
  }

  /**
   * Check if CCPA notice should be shown
   * @param {string} region - Region code
   * @returns {boolean} Whether to show CCPA notice
   */
  shouldShowCCPANotice(region) {
    const rules = this.getComplianceRules(region)
    return region === REGIONS.US_CALIFORNIA
  }

  /**
   * Check if PIPEDA notice should be shown
   * @param {string} region - Region code
   * @returns {boolean} Whether to show PIPEDA notice
   */
  shouldShowPIPEDANotice(region) {
    return region === REGIONS.CANADA
  }

  /**
   * Get test region override from URL parameters
   * @returns {string|null} Test region or null
   */
  getTestRegionOverride() {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const testRegion = urlParams.get('region')?.toLowerCase()

      if (testRegion && Object.values(REGIONS).includes(testRegion)) {
        // Clear any existing consent when testing different regions
        if (testRegion !== localStorage.getItem('digipalz_last_test_region')) {
          localStorage.removeItem('digipalz_consent_preferences')
          localStorage.removeItem('digipalz_consent_timestamp')
          localStorage.removeItem('digipalz_last_consent_version')
          localStorage.setItem('digipalz_last_test_region', testRegion)
        }

        return testRegion
      }

      return null
    } catch (error) {
      console.warn('Error getting test region override:', error)
      return null
    }
  }

  /**
   * Get cached region if valid
   * @returns {string|null} Cached region or null
   */
  getCachedRegion() {
    try {
      const cached = localStorage.getItem('digipalz_detected_region')
      if (!cached) return null

      const data = JSON.parse(cached)
      const now = Date.now()

      if (now - data.timestamp > this.cacheTimeout) {
        localStorage.removeItem('digipalz_detected_region')
        return null
      }

      return data.region
    } catch (error) {
      console.warn('Error reading cached region:', error)
      localStorage.removeItem('digipalz_detected_region')
      return null
    }
  }

  /**
   * Cache detected region
   * @param {string} region - Region to cache
   */
  cacheRegion(region) {
    try {
      const data = {
        region,
        timestamp: Date.now(),
        version: '1.0'
      }
      localStorage.setItem('digipalz_detected_region', JSON.stringify(data))
    } catch (error) {
      console.warn('Error caching region:', error)
    }
  }

  /**
   * Get fallback region when all detection methods fail
   * @returns {string} Fallback region
   */
  getFallbackRegion() {
    // Use most restrictive rules (GDPR) as fallback to ensure compliance
    return REGIONS.EU
  }

  /**
   * Clear cached region data
   */
  clearCache() {
    try {
      localStorage.removeItem('digipalz_detected_region')
      localStorage.removeItem('digipalz_detection_method')
      this.cache.clear()
      this.detectionPromise = null
    } catch (error) {
      console.warn('Error clearing geolocation cache:', error)
    }
  }

  /**
   * Force re-detection of region (clears cache and detects again)
   * @returns {Promise<string>} Newly detected region
   */
  async forceRedetection() {
    this.clearCache()
    return await this.detectUserRegion()
  }

  /**
   * Get detailed geolocation information
   * @returns {Promise<object>} Detailed location info
   */
  async getDetailedLocationInfo() {
    try {
      const region = await this.detectUserRegion()
      const rules = this.getComplianceRules(region)

      return {
        region,
        complianceRules: rules,
        shouldShowGDPRBanner: this.shouldShowGDPRBanner(region),
        shouldShowCCPANotice: this.shouldShowCCPANotice(region),
        shouldShowPIPEDANotice: this.shouldShowPIPEDANotice(region),
        detectionMethod: this.getLastDetectionMethod(),
        cached: !!this.getCachedRegion(),
        testOverride: !!this.getTestRegionOverride()
      }
    } catch (error) {
      console.error('Error getting detailed location info:', error)
      const fallbackRegion = this.getFallbackRegion()
      const fallbackRules = this.getComplianceRules(fallbackRegion)

      return {
        region: fallbackRegion,
        complianceRules: fallbackRules,
        shouldShowGDPRBanner: true, // Most restrictive fallback
        shouldShowCCPANotice: false,
        shouldShowPIPEDANotice: false,
        detectionMethod: 'fallback',
        cached: false,
        testOverride: false,
        error: error.message
      }
    }
  }

  /**
   * Get last detection method used (for debugging)
   * @returns {string} Detection method
   */
  getLastDetectionMethod() {
    return localStorage.getItem('digipalz_detection_method') || 'unknown'
  }

  /**
   * Debug helper - get current state
   * @returns {object} Debug information
   */
  getDebugInfo() {
    const urlParams = new URLSearchParams(window.location.search)
    const testRegion = urlParams.get('region')?.toLowerCase()

    return {
      currentURL: window.location.href,
      testRegionParam: testRegion,
      testRegionValid:
        testRegion && Object.values(REGIONS).includes(testRegion),
      cachedRegion: this.getCachedRegion(),
      lastTestRegion: localStorage.getItem('digipalz_last_test_region'),
      availableRegions: Object.values(REGIONS),
      hasConsentData: !!localStorage.getItem('digipalz_consent_preferences')
    }
  }
}

// Create and export singleton instance
const geoLocationService = new GeoLocationService()
export default geoLocationService
