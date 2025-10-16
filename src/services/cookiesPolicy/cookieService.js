/**
 * Cookie Management Service
 * Handles all cookie operations including setting, getting, and deleting cookies
 * Provides secure cookie handling with encryption support
 */

import Cookies from 'js-cookie'
import { v4 as uuidv4 } from 'uuid'
import {
  COOKIE_NAMES,
  COOKIE_EXPIRY,
  COOKIE_CATEGORIES
} from '../../constants/cookieCategories.js'

class CookieService {
  constructor() {
    this.domain = window.location.hostname
    this.isSecure = window.location.protocol === 'https:'
  }

  /**
   * Set a cookie with secure default options
   * @param {string} name - Cookie name
   * @param {string|object} value - Cookie value
   * @param {object} options - Cookie options
   */
  setCookie(name, value, options = {}) {
    try {
      const defaultOptions = {
        expires: COOKIE_EXPIRY.ONE_YEAR,
        secure: this.isSecure,
        sameSite: 'Lax',
        path: '/',
        ...options
      }

      // Convert object values to JSON string
      const cookieValue =
        typeof value === 'object' ? JSON.stringify(value) : value

      Cookies.set(name, cookieValue, defaultOptions)

      return true
    } catch (error) {
      console.error('Error setting cookie:', error)
      return false
    }
  }

  /**
   * Get a cookie value
   * @param {string} name - Cookie name
   * @param {boolean} parseJSON - Whether to parse JSON values
   * @returns {string|object|null} Cookie value or null if not found
   */
  getCookie(name, parseJSON = false) {
    try {
      const value = Cookies.get(name)

      if (!value) {
        return null
      }

      if (parseJSON) {
        try {
          return JSON.parse(value)
        } catch {
          return value
        }
      }

      return value
    } catch (error) {
      console.error('Error getting cookie:', error)
      return null
    }
  }

  /**
   * Delete a cookie
   * @param {string} name - Cookie name
   * @param {object} options - Cookie options
   */
  deleteCookie(name, options = {}) {
    try {
      const deleteOptions = {
        path: '/',
        domain: this.domain,
        ...options
      }

      Cookies.remove(name, deleteOptions)

      return true
    } catch (error) {
      console.error('Error deleting cookie:', error)
      return false
    }
  }

  /**
   * Check if cookies are enabled in the browser
   * @returns {boolean} True if cookies are enabled
   */
  areCookiesEnabled() {
    try {
      const testCookie = 'test_cookie_support'
      this.setCookie(testCookie, 'test', { expires: COOKIE_EXPIRY.SESSION })
      const isEnabled = this.getCookie(testCookie) === 'test'
      this.deleteCookie(testCookie)
      return isEnabled
    } catch {
      return false
    }
  }

  /**
   * Generate a unique visitor ID
   * @returns {string} Unique visitor ID
   */
  generateVisitorId() {
    return `visitor_${uuidv4()}`
  }

  /**
   * Generate a unique user ID
   * @param {string} userId - User's unique identifier
   * @returns {string} Formatted user ID
   */
  generateUserId(userId) {
    return `user_${userId}`
  }

  /**
   * Get or create visitor ID
   * @returns {string} Visitor ID
   */
  getOrCreateVisitorId() {
    let visitorId = this.getCookie(COOKIE_NAMES.VISITOR_ID)

    if (!visitorId) {
      visitorId = this.generateVisitorId()
      this.setCookie(COOKIE_NAMES.VISITOR_ID, visitorId, {
        expires: COOKIE_EXPIRY.TWO_YEARS
      })
    }

    return visitorId
  }

  /**
   * Upgrade visitor ID to user ID when user creates account
   * @param {string} userId - User's unique identifier
   * @returns {string} User ID
   */
  upgradeToUserId(userId) {
    const formattedUserId = this.generateUserId(userId)

    // Set user ID cookie
    this.setCookie(COOKIE_NAMES.USER_ID, formattedUserId, {
      expires: COOKIE_EXPIRY.TWO_YEARS
    })

    // Keep visitor ID for tracking purposes but mark as upgraded
    const visitorId = this.getCookie(COOKIE_NAMES.VISITOR_ID)
    if (visitorId) {
      this.setCookie(`${COOKIE_NAMES.VISITOR_ID}_upgraded`, visitorId, {
        expires: COOKIE_EXPIRY.TWO_YEARS
      })
    }

    return formattedUserId
  }

  /**
   * Get current user identifier (user ID or visitor ID)
   * @returns {object} Current identifier info
   */
  getCurrentIdentifier() {
    const userId = this.getCookie(COOKIE_NAMES.USER_ID)
    const visitorId = this.getCookie(COOKIE_NAMES.VISITOR_ID)

    return {
      userId,
      visitorId,
      currentId: userId || visitorId,
      isUser: !!userId,
      isVisitor: !userId
    }
  }

  /**
   * Check if user has given consent for cookie category
   * @param {string} category - Cookie category
   * @returns {boolean} True if consent given
   */
  hasConsentForCategory(category) {
    const preferences = this.getCookie(COOKIE_NAMES.CONSENT_PREFERENCES, true)

    if (!preferences) {
      // Essential cookies are always allowed
      return category === COOKIE_CATEGORIES.ESSENTIAL
    }

    return preferences[category] === true
  }

  /**
   * Get all cookies set by the application
   * @returns {object} All application cookies
   */
  getAllAppCookies() {
    const cookies = {}

    Object.values(COOKIE_NAMES).forEach((cookieName) => {
      const value = this.getCookie(cookieName, true)
      if (value !== null) {
        cookies[cookieName] = value
      }
    })

    return cookies
  }

  /**
   * Clear all application cookies (for data deletion requests)
   * @param {boolean} keepEssential - Whether to keep essential cookies
   */
  clearAllAppCookies(keepEssential = true) {
    const essentialCookies = [COOKIE_NAMES.SESSION_ID, COOKIE_NAMES.CSRF_TOKEN]

    Object.values(COOKIE_NAMES).forEach((cookieName) => {
      if (keepEssential && essentialCookies.includes(cookieName)) {
        return // Skip essential cookies
      }

      this.deleteCookie(cookieName)
    })
  }

  /**
   * Set session cookie
   * @param {string} sessionId - Session identifier
   */
  setSessionCookie(sessionId) {
    this.setCookie(COOKIE_NAMES.SESSION_ID, sessionId, {
      expires: COOKIE_EXPIRY.SESSION,
      httpOnly: false, // Note: Cannot set httpOnly from JavaScript
      secure: this.isSecure,
      sameSite: 'Strict'
    })
  }

  /**
   * Get browser cookie support info
   * @returns {object} Cookie support information
   */
  getCookieSupportInfo() {
    return {
      cookiesEnabled: this.areCookiesEnabled(),
      secureContext: this.isSecure,
      domain: this.domain,
      userAgent: navigator.userAgent,
      thirdPartyCookiesEnabled: this.areThirdPartyCookiesEnabled()
    }
  }

  /**
   * Check if third-party cookies are enabled (basic check)
   * @returns {boolean} Estimated third-party cookie support
   */
  areThirdPartyCookiesEnabled() {
    // This is a basic check - full detection requires more complex methods
    try {
      return navigator.cookieEnabled && !navigator.globalPrivacyControl
    } catch {
      return navigator.cookieEnabled
    }
  }
}

// Create and export singleton instance
const cookieService = new CookieService()
export default cookieService
