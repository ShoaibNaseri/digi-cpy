/**
 * Google Tag Manager Service
 * Handles GTM initialization, data layer management, and cookie consent integration
 * Complies with GDPR, CCPA, and PIPEDA requirements
 */

import { COOKIE_CATEGORIES } from '../../constants/cookieCategories.js'
import consentService from '../cookiesPolicy/consentService.js'

class GTMService {
  constructor() {
    this.gtmId = null
    this.isInitialized = false
    this.dataLayerName = 'dataLayer'
    this.consentUpdateQueue = []
    this.consentMode = {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'denied',
      personalization_storage: 'denied',
      security_storage: 'granted' // Always granted for essential cookies
    }
  }

  /**
   * Initialize GTM with configuration
   * @param {object} config - GTM configuration
   * @param {string} config.gtmId - GTM container ID (GTM-XXXXXXX)
   * @param {string} config.dataLayerName - Custom data layer name (optional)
   * @param {object} config.defaultConsent - Default consent configuration
   */
  initialize(config = {}) {
    if (this.isInitialized) {
      console.warn('GTM already initialized')
      return
    }

    if (!config.gtmId) {
      console.error('❌ GTM ID is required for initialization')
      return
    }

    this.gtmId = config.gtmId
    this.dataLayerName = config.dataLayerName || 'dataLayer'

    try {
      // Initialize data layer
      this.initializeDataLayer()

      // Set initial consent mode based on current consent preferences
      this.updateConsentMode()

      // Load GTM script
      this.loadGTMScript()

      // Listen for consent changes
      this.setupConsentListener()

      this.isInitialized = true

      // Push initialization event
      this.pushEvent('gtm_initialized', {
        gtm_id: this.gtmId,
        consent_mode: this.consentMode,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error initializing GTM:', error)
    }
  }

  /**
   * Initialize or get data layer
   */
  initializeDataLayer() {
    if (!window[this.dataLayerName]) {
      window[this.dataLayerName] = []
    }
    return window[this.dataLayerName]
  }

  /**
   * Load GTM script dynamically
   */
  loadGTMScript() {
    const dataLayer = this.initializeDataLayer()

    // Set up GTM configuration
    dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    })

    // Create and append GTM script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtm.js?id=${this.gtmId}`

    script.onload = () => {
      this.processConsentUpdateQueue()
    }

    script.onerror = () => {
      console.error('❌ Failed to load GTM script')
    }

    document.head.appendChild(script)

    // Add noscript fallback
    this.addNoScriptFallback()
  }

  /**
   * Add noscript fallback for GTM
   */
  addNoScriptFallback() {
    const noscript = document.createElement('noscript')
    const iframe = document.createElement('iframe')
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${this.gtmId}`
    iframe.height = '0'
    iframe.width = '0'
    iframe.style.display = 'none'
    iframe.style.visibility = 'hidden'

    noscript.appendChild(iframe)
    document.body.insertBefore(noscript, document.body.firstChild)
  }

  /**
   * Update consent mode based on current consent preferences
   */
  updateConsentMode() {
    const preferences = consentService.getConsentPreferences()

    if (!preferences) {
      // No consent given - deny all except security
      this.consentMode = {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        functionality_storage: 'denied',
        personalization_storage: 'denied',
        security_storage: 'granted'
      }
    } else {
      // Map cookie categories to GTM consent types
      this.consentMode = {
        // Marketing cookies -> ad consent
        ad_storage: preferences[COOKIE_CATEGORIES.MARKETING]
          ? 'granted'
          : 'denied',
        ad_user_data: preferences[COOKIE_CATEGORIES.MARKETING]
          ? 'granted'
          : 'denied',
        ad_personalization: preferences[COOKIE_CATEGORIES.MARKETING]
          ? 'granted'
          : 'denied',

        // Performance cookies -> analytics consent
        analytics_storage: preferences[COOKIE_CATEGORIES.PERFORMANCE]
          ? 'granted'
          : 'denied',

        // Functional cookies -> functionality consent
        functionality_storage: preferences[COOKIE_CATEGORIES.FUNCTIONAL]
          ? 'granted'
          : 'denied',
        personalization_storage: preferences[COOKIE_CATEGORIES.FUNCTIONAL]
          ? 'granted'
          : 'denied',

        // Essential cookies -> always granted
        security_storage: 'granted'
      }
    }

    // Push consent update to GTM
    this.pushConsent(this.consentMode)
  }

  /**
   * Push consent configuration to GTM
   * @param {object} consentConfig - Consent configuration object
   */
  pushConsent(consentConfig) {
    const consentData = {
      consent: 'update',
      ...consentConfig
    }

    if (this.isInitialized) {
      this.pushToDataLayer(consentData)
    } else {
      // Queue for later if GTM not ready
      this.consentUpdateQueue.push(consentData)
    }
  }

  /**
   * Process queued consent updates
   */
  processConsentUpdateQueue() {
    while (this.consentUpdateQueue.length > 0) {
      const consentData = this.consentUpdateQueue.shift()
      this.pushToDataLayer(consentData)
    }
  }

  /**
   * Push event to data layer
   * @param {string} eventName - Event name
   * @param {object} eventData - Event data
   */
  pushEvent(eventName, eventData = {}) {
    const eventObject = {
      event: eventName,
      timestamp: new Date().toISOString(),
      ...eventData
    }

    this.pushToDataLayer(eventObject)
  }

  /**
   * Push data to GTM data layer
   * @param {object} data - Data to push
   */
  pushToDataLayer(data) {
    const dataLayer = this.initializeDataLayer()
    dataLayer.push(data)
  }

  /**
   * Setup listener for consent changes
   */
  setupConsentListener() {
    consentService.addConsentListener((preferences, action) => {
      // Update consent mode
      this.updateConsentMode()

      // Push consent change event
      this.pushEvent('consent_updated', {
        action,
        preferences,
        consent_mode: this.consentMode,
        categories_enabled: Object.keys(preferences).filter(
          (key) => preferences[key]
        ),
        categories_disabled: Object.keys(preferences).filter(
          (key) => !preferences[key]
        )
      })
    })
  }

  /**
   * Track custom event
   * @param {string} action - Event action
   * @param {object} properties - Event properties
   */
  trackEvent(action, properties = {}) {
    if (!this.isInitialized) {
      console.warn('GTM not initialized, event not tracked:', action)
      return
    }

    this.pushEvent('custom_event', {
      event_action: action,
      ...properties
    })
  }

  /**
   * Track page view
   * @param {object} pageData - Page data
   */
  trackPageView(pageData = {}) {
    if (!this.isInitialized) {
      console.warn('GTM not initialized, page view not tracked')
      return
    }

    const pageViewData = {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      ...pageData
    }

    this.pushEvent('page_view', pageViewData)
  }

  /**
   * Track user login
   * @param {object} userData - User data
   */
  trackLogin(userData = {}) {
    if (!this.isInitialized) return

    this.pushEvent('login', {
      method: 'email', // or social, etc.
      ...userData
    })
  }

  /**
   * Track user registration
   * @param {object} userData - User data
   */
  trackRegistration(userData = {}) {
    if (!this.isInitialized) return

    this.pushEvent('sign_up', {
      method: 'email',
      ...userData
    })
  }

  /**
   * Track purchase/subscription
   * @param {object} purchaseData - Purchase data
   */
  trackPurchase(purchaseData = {}) {
    if (!this.isInitialized) return

    this.pushEvent('purchase', {
      currency: 'USD',
      ...purchaseData
    })
  }

  /**
   * Track game interactions
   * @param {object} gameData - Game interaction data
   */
  trackGameInteraction(gameData = {}) {
    if (!this.isInitialized) return

    this.pushEvent('game_interaction', {
      event_category: 'Games',
      ...gameData
    })
  }

  /**
   * Track educational content engagement
   * @param {object} contentData - Content data
   */
  trackContentEngagement(contentData = {}) {
    if (!this.isInitialized) return

    this.pushEvent('content_engagement', {
      event_category: 'Education',
      ...contentData
    })
  }

  /**
   * Get current consent status
   * @returns {object} Current consent mode
   */
  getConsentStatus() {
    return {
      consent_mode: this.consentMode,
      preferences: consentService.getConsentPreferences(),
      last_updated: consentService.getConsentSummary().consentDate
    }
  }

  /**
   * Reset GTM (for testing purposes)
   */
  reset() {
    this.isInitialized = false
    this.gtmId = null
    this.consentUpdateQueue = []

    // Clear data layer
    if (window[this.dataLayerName]) {
      window[this.dataLayerName].length = 0
    }
  }

  /**
   * Get debug information
   * @returns {object} Debug information
   */
  getDebugInfo() {
    return {
      isInitialized: this.isInitialized,
      gtmId: this.gtmId,
      dataLayerName: this.dataLayerName,
      consentMode: this.consentMode,
      queueLength: this.consentUpdateQueue.length,
      dataLayerLength: window[this.dataLayerName]?.length || 0
    }
  }
}

// Create and export singleton instance
const gtmService = new GTMService()
export default gtmService
