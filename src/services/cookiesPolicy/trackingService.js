/**
 * Tracking Service
 * Handles visitor and user tracking with consent-aware analytics
 * Manages transition from visitor ID to user ID tracking
 */

import cookieService from './cookieService.js'
import consentService from './consentService.js'
import {
  COOKIE_CATEGORIES,
  COOKIE_NAMES
} from '../../constants/cookieCategories.js'

class TrackingService {
  constructor() {
    this.isInitialized = false
    this.trackingQueue = []
    this.analytics = null // Will store analytics instance when available
  }

  /**
   * Initialize visitor tracking
   * @returns {string} Visitor ID
   */
  initializeVisitorTracking() {
    try {
      if (this.isInitialized) {
        return cookieService.getCurrentIdentifier().currentId
      }

      // Get or create visitor ID
      const visitorId = cookieService.getOrCreateVisitorId()

      // Track initial visit
      this.trackEvent('visitor_initialized', {
        visitorId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        url: window.location.href
      })

      this.isInitialized = true

      return visitorId
    } catch (error) {
      console.error('Error initializing visitor tracking:', error)
      return null
    }
  }

  /**
   * Upgrade to user tracking when user creates account
   * @param {string} userId - User's unique identifier
   * @returns {string} User ID
   */
  upgradeToUserTracking(userId) {
    try {
      const { visitorId } = cookieService.getCurrentIdentifier()
      const newUserId = cookieService.upgradeToUserId(userId)

      // Track the upgrade event
      this.trackEvent('visitor_upgraded_to_user', {
        previousVisitorId: visitorId,
        newUserId,
        userId,
        timestamp: new Date().toISOString(),
        url: window.location.href
      })

      return newUserId
    } catch (error) {
      console.error('Error upgrading to user tracking:', error)
      return null
    }
  }

  /**
   * Track page view with consent awareness
   * @param {object} pageData - Page view data
   */
  trackPageView(pageData = {}) {
    if (!consentService.isConsentedForCategory(COOKIE_CATEGORIES.PERFORMANCE)) {
      return
    }

    try {
      const { currentId, isUser } = cookieService.getCurrentIdentifier()

      const trackingData = {
        event: 'page_view',
        timestamp: new Date().toISOString(),
        userId: isUser ? currentId : null,
        visitorId: isUser ? null : currentId,
        url: window.location.href,
        title: document.title,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        ...pageData
      }

      this.sendTrackingData(trackingData)
    } catch (error) {
      console.error('Error tracking page view:', error)
    }
  }

  /**
   * Track user action/event with consent awareness
   * @param {string} action - Action name
   * @param {object} data - Event data
   */
  trackUserAction(action, data = {}) {
    if (!consentService.isConsentedForCategory(COOKIE_CATEGORIES.PERFORMANCE)) {
      return
    }

    try {
      const { currentId, isUser } = cookieService.getCurrentIdentifier()

      const trackingData = {
        event: 'user_action',
        action,
        timestamp: new Date().toISOString(),
        userId: isUser ? currentId : null,
        visitorId: isUser ? null : currentId,
        url: window.location.href,
        ...data
      }

      this.sendTrackingData(trackingData)
    } catch (error) {
      console.error('Error tracking user action:', error)
    }
  }

  /**
   * Track custom event
   * @param {string} eventName - Event name
   * @param {object} eventData - Event data
   */
  trackEvent(eventName, eventData = {}) {
    try {
      const { currentId, isUser } = cookieService.getCurrentIdentifier()

      const trackingData = {
        event: eventName,
        timestamp: new Date().toISOString(),
        userId: isUser ? currentId : null,
        visitorId: isUser ? null : currentId,
        url: window.location.href,
        ...eventData
      }

      // Always allow essential tracking events (like consent changes)
      const isEssentialEvent = [
        'visitor_initialized',
        'visitor_upgraded_to_user',
        'consent_given',
        'consent_withdrawn'
      ].includes(eventName)

      if (
        isEssentialEvent ||
        consentService.isConsentedForCategory(COOKIE_CATEGORIES.PERFORMANCE)
      ) {
        this.sendTrackingData(trackingData)
      } else {
      }
    } catch (error) {
      console.error('Error tracking event:', error)
    }
  }

  /**
   * Send tracking data to analytics service
   * @param {object} data - Tracking data
   */
  sendTrackingData(data) {
    try {
      // If analytics is not initialized yet, queue the data
      if (!this.analytics) {
        this.trackingQueue.push(data)
        return
      }

      // Send to analytics service (Google Analytics, etc.)
      if (this.analytics && typeof this.analytics.track === 'function') {
        this.analytics.track(data)
      }

      // For now, just log to console (replace with actual analytics service)

      // Store in local tracking cookie for debugging/audit
      this.storeTrackingData(data)
    } catch (error) {
      console.error('Error sending tracking data:', error)
    }
  }

  /**
   * Store tracking data locally (for audit/debugging)
   * @param {object} data - Tracking data
   */
  storeTrackingData(data) {
    if (!consentService.isConsentedForCategory(COOKIE_CATEGORIES.PERFORMANCE)) {
      return
    }

    try {
      const existingData =
        cookieService.getCookie('digipalz_tracking_log', true) || []
      const newData = [data, ...existingData.slice(0, 49)] // Keep last 50 events

      cookieService.setCookie('digipalz_tracking_log', newData, {
        expires: 7 // 7 days
      })
    } catch (error) {
      console.error('Error storing tracking data:', error)
    }
  }

  /**
   * Initialize analytics service (Google Analytics, etc.)
   * @param {object} analyticsConfig - Analytics configuration
   */
  initializeAnalytics(analyticsConfig = {}) {
    if (!consentService.isConsentedForCategory(COOKIE_CATEGORIES.PERFORMANCE)) {
      return
    }

    try {
      // This is where you would initialize your analytics service
      // Example for Google Analytics 4:
      /*
      if (window.gtag) {
        window.gtag('config', analyticsConfig.measurementId, {
          anonymize_ip: true,
          cookie_flags: 'SameSite=Lax;Secure'
        });
        this.analytics = {
          track: (data) => {
            window.gtag('event', data.event, data);
          }
        };
      }
      */

      // For now, create a mock analytics object
      this.analytics = {
        track: (data) => {}
      }

      // Process queued tracking data
      this.processTrackingQueue()
    } catch (error) {
      console.error('Error initializing analytics:', error)
    }
  }

  /**
   * Process queued tracking data
   */
  processTrackingQueue() {
    while (this.trackingQueue.length > 0) {
      const data = this.trackingQueue.shift()
      this.sendTrackingData(data)
    }
  }

  /**
   * Get current tracking status
   * @returns {object} Tracking status information
   */
  getTrackingStatus() {
    const { currentId, isUser, userId, visitorId } =
      cookieService.getCurrentIdentifier()

    return {
      isInitialized: this.isInitialized,
      currentId,
      isUser,
      userId,
      visitorId,
      hasPerformanceConsent: consentService.isConsentedForCategory(
        COOKIE_CATEGORIES.PERFORMANCE
      ),
      hasAnalytics: !!this.analytics,
      queuedEvents: this.trackingQueue.length
    }
  }

  /**
   * Track user session data
   */
  trackSession() {
    if (!consentService.isConsentedForCategory(COOKIE_CATEGORIES.PERFORMANCE)) {
      return
    }

    try {
      const sessionData = {
        sessionStart: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        cookiesEnabled: navigator.cookieEnabled,
        onlineStatus: navigator.onLine
      }

      this.trackEvent('session_started', sessionData)
    } catch (error) {
      console.error('Error tracking session:', error)
    }
  }

  /**
   * Track consent-related events
   * @param {string} action - Consent action
   * @param {object} preferences - Consent preferences
   * @param {object} metadata - Additional metadata for the event
   */
  trackConsentEvent(action, preferences, metadata = {}) {
    this.trackEvent('consent_event', {
      action,
      preferences,
      consentTimestamp: new Date().toISOString(),
      ...metadata
    })
  }

  /**
   * Track opt-out events specifically (for CCPA/CPRA compliance)
   * @param {string} optOutType - Type of opt-out (do_not_sell, data_deletion, etc.)
   * @param {object} preferences - Updated preferences
   * @param {object} metadata - Additional compliance metadata
   */
  trackOptOutEvent(optOutType, preferences, metadata = {}) {
    const optOutData = {
      eventType: 'opt_out',
      optOutType,
      preferences,
      timestamp: new Date().toISOString(),
      compliance: metadata.compliance || 'CCPA/CPRA',
      userAgent: navigator.userAgent,
      region: metadata.region || 'unknown',
      ...metadata
    }

    // Track the opt-out event
    this.trackEvent('user_opt_out', optOutData)

    // Also record in consent history for audit trail
    this.trackConsentEvent('opt_out', preferences, {
      optOutType,
      compliance: metadata.compliance
    })
  }

  /**
   * Reset tracking (for logout or data deletion)
   */
  resetTracking() {
    try {
      this.isInitialized = false
      this.trackingQueue = []

      // Clear tracking cookies
      cookieService.deleteCookie('digipalz_tracking_log')
      cookieService.deleteCookie(COOKIE_NAMES.ANALYTICS_ID)
      cookieService.deleteCookie(COOKIE_NAMES.PERFORMANCE_DATA)
    } catch (error) {
      console.error('Error resetting tracking:', error)
    }
  }

  /**
   * Get tracking data for export (GDPR data portability)
   * @returns {object} User's tracking data
   */
  exportTrackingData() {
    try {
      const trackingLog =
        cookieService.getCookie('digipalz_tracking_log', true) || []
      const { currentId, isUser } = cookieService.getCurrentIdentifier()

      return {
        userId: isUser ? currentId : null,
        visitorId: isUser ? null : currentId,
        trackingHistory: trackingLog,
        exportTimestamp: new Date().toISOString(),
        dataFormat: 'JSON'
      }
    } catch (error) {
      console.error('Error exporting tracking data:', error)
      return null
    }
  }
}

// Create and export singleton instance
const trackingService = new TrackingService()
export default trackingService
