/**
 * GTM Tracker Utility
 * Convenient wrapper functions for tracking common events in the educational platform
 * Provides type-safe event tracking with automatic consent checking
 */

import gtmService from '../services/gtm/gtmService'
import {
  GTM_EVENTS,
  GTM_CUSTOM_MAPPING,
  PRODUCT_CATEGORIES,
  USER_JOURNEY_STAGES
} from '../config/gtm'
import consentService from '../services/cookiesPolicy/consentService'
import { COOKIE_CATEGORIES } from '../constants/cookieCategories'

class GTMTracker {
  constructor() {
    this.isEnabled = true
    this.debugMode = import.meta.env.MODE === 'development'
  }

  /**
   * Check if tracking is allowed based on consent
   * @param {string} category - Cookie category required for tracking
   * @returns {boolean} True if tracking is allowed
   */
  canTrack(category = COOKIE_CATEGORIES.PERFORMANCE) {
    if (!this.isEnabled) return false

    const hasConsent = consentService.isConsentedForCategory(category)
    if (!hasConsent && this.debugMode) {
    }

    return hasConsent
  }

  /**
   * Base tracking method with consent checking
   * @param {string} eventName - Event name
   * @param {object} properties - Event properties
   * @param {string} requiredCategory - Required cookie category
   */
  track(
    eventName,
    properties = {},
    requiredCategory = COOKIE_CATEGORIES.PERFORMANCE
  ) {
    if (!this.canTrack(requiredCategory)) return

    gtmService.trackEvent(eventName, {
      timestamp: new Date().toISOString(),
      ...properties
    })

    if (this.debugMode) {
    }
  }

  // === AUTHENTICATION EVENTS ===

  /**
   * Track user login
   * @param {object} userData - User data
   */
  trackLogin(userData = {}) {
    this.track(
      GTM_EVENTS.LOGIN,
      {
        method: userData.method || 'email',
        user_type: userData.user_type || 'student',
        first_login: userData.first_login || false,
        [GTM_CUSTOM_MAPPING.dimensions.user_type]: userData.user_type,
        [GTM_CUSTOM_MAPPING.dimensions.user_role]: userData.role
      },
      COOKIE_CATEGORIES.ESSENTIAL
    )
  }

  /**
   * Track user registration
   * @param {object} userData - User data
   */
  trackRegistration(userData = {}) {
    this.track(
      GTM_EVENTS.SIGNUP,
      {
        method: userData.method || 'email',
        user_type: userData.user_type || 'student',
        registration_source: userData.source || 'direct',
        [GTM_CUSTOM_MAPPING.dimensions.user_type]: userData.user_type,
        [GTM_CUSTOM_MAPPING.dimensions.user_role]: userData.role
      },
      COOKIE_CATEGORIES.ESSENTIAL
    )
  }

  /**
   * Track user logout
   */
  trackLogout() {
    this.track(
      GTM_EVENTS.LOGOUT,
      {
        session_duration: this.getSessionDuration()
      },
      COOKIE_CATEGORIES.ESSENTIAL
    )
  }

  // === EDUCATIONAL CONTENT EVENTS ===

  /**
   * Track lesson start
   * @param {object} lessonData - Lesson data
   */
  trackLessonStart(lessonData = {}) {
    this.track(GTM_EVENTS.LESSON_START, {
      lesson_id: lessonData.lesson_id,
      lesson_name: lessonData.lesson_name,
      lesson_type: lessonData.lesson_type,
      subject: lessonData.subject,
      grade_level: lessonData.grade_level,
      difficulty: lessonData.difficulty,
      estimated_duration: lessonData.estimated_duration,
      [GTM_CUSTOM_MAPPING.dimensions.grade_level]: lessonData.grade_level
    })
  }

  /**
   * Track lesson completion
   * @param {object} lessonData - Lesson data
   */
  trackLessonComplete(lessonData = {}) {
    this.track(GTM_EVENTS.LESSON_COMPLETE, {
      lesson_id: lessonData.lesson_id,
      lesson_name: lessonData.lesson_name,
      completion_time: lessonData.completion_time,
      completion_percentage: lessonData.completion_percentage || 100,
      score: lessonData.score,
      attempts: lessonData.attempts || 1,
      success: lessonData.success !== false,
      [GTM_CUSTOM_MAPPING.metrics.lesson_progress]:
        lessonData.completion_percentage
    })
  }

  /**
   * Track quiz start
   * @param {object} quizData - Quiz data
   */
  trackQuizStart(quizData = {}) {
    this.track(GTM_EVENTS.QUIZ_START, {
      quiz_id: quizData.quiz_id,
      quiz_name: quizData.quiz_name,
      quiz_type: quizData.quiz_type,
      question_count: quizData.question_count,
      subject: quizData.subject,
      difficulty: quizData.difficulty,
      time_limit: quizData.time_limit
    })
  }

  /**
   * Track quiz completion
   * @param {object} quizData - Quiz data
   */
  trackQuizComplete(quizData = {}) {
    this.track(GTM_EVENTS.QUIZ_COMPLETE, {
      quiz_id: quizData.quiz_id,
      quiz_name: quizData.quiz_name,
      score: quizData.score,
      total_possible: quizData.total_possible,
      percentage: quizData.percentage,
      passed: quizData.passed,
      completion_time: quizData.completion_time,
      attempts: quizData.attempts || 1,
      [GTM_CUSTOM_MAPPING.metrics.quiz_score]: quizData.score
    })
  }

  // === GAME EVENTS ===

  /**
   * Track game start
   * @param {object} gameData - Game data
   */
  trackGameStart(gameData = {}) {
    this.track(GTM_EVENTS.GAME_START, {
      game_id: gameData.game_id,
      game_name: gameData.game_name,
      game_type: gameData.game_type,
      difficulty_level: gameData.difficulty_level,
      educational_topic: gameData.educational_topic,
      multiplayer: gameData.multiplayer || false
    })
  }

  /**
   * Track game completion
   * @param {object} gameData - Game data
   */
  trackGameComplete(gameData = {}) {
    this.track(GTM_EVENTS.GAME_COMPLETE, {
      game_id: gameData.game_id,
      game_name: gameData.game_name,
      score: gameData.score,
      level_reached: gameData.level_reached,
      completion_time: gameData.completion_time,
      success: gameData.success,
      achievements_unlocked: gameData.achievements_unlocked || [],
      [GTM_CUSTOM_MAPPING.metrics.game_completion_time]:
        gameData.completion_time
    })
  }

  /**
   * Track level up in games
   * @param {object} levelData - Level data
   */
  trackLevelUp(levelData = {}) {
    this.track(GTM_EVENTS.GAME_LEVEL_UP, {
      game_id: levelData.game_id,
      game_name: levelData.game_name,
      previous_level: levelData.previous_level,
      new_level: levelData.new_level,
      score_earned: levelData.score_earned,
      time_to_level: levelData.time_to_level
    })
  }

  /**
   * Track achievement unlock
   * @param {object} achievementData - Achievement data
   */
  trackAchievementUnlock(achievementData = {}) {
    this.track(GTM_EVENTS.ACHIEVEMENT_UNLOCK, {
      achievement_id: achievementData.achievement_id,
      achievement_name: achievementData.achievement_name,
      achievement_type: achievementData.achievement_type,
      game_id: achievementData.game_id,
      rarity: achievementData.rarity,
      points_earned: achievementData.points_earned
    })
  }

  // === E-COMMERCE EVENTS ===

  /**
   * Track subscription purchase
   * @param {object} subscriptionData - Subscription data
   */
  trackSubscription(subscriptionData = {}) {
    this.track(
      GTM_EVENTS.SUBSCRIPTION_START,
      {
        transaction_id: subscriptionData.transaction_id,
        plan_name: subscriptionData.plan_name,
        plan_type: subscriptionData.plan_type,
        billing_cycle: subscriptionData.billing_cycle,
        price: subscriptionData.price,
        currency: subscriptionData.currency || 'USD',
        discount_applied: subscriptionData.discount_applied || false,
        discount_amount: subscriptionData.discount_amount || 0,
        payment_method: subscriptionData.payment_method,
        [GTM_CUSTOM_MAPPING.dimensions.subscription_plan]:
          subscriptionData.plan_name
      },
      COOKIE_CATEGORIES.MARKETING
    )
  }

  /**
   * Track purchase events (for individual items)
   * @param {object} purchaseData - Purchase data
   */
  trackPurchase(purchaseData = {}) {
    this.track(
      GTM_EVENTS.PURCHASE,
      {
        transaction_id: purchaseData.transaction_id,
        value: purchaseData.value,
        currency: purchaseData.currency || 'USD',
        items: purchaseData.items || [],
        coupon: purchaseData.coupon,
        shipping: purchaseData.shipping || 0,
        tax: purchaseData.tax || 0
      },
      COOKIE_CATEGORIES.MARKETING
    )
  }

  // === ENGAGEMENT EVENTS ===

  /**
   * Track video play
   * @param {object} videoData - Video data
   */
  trackVideoPlay(videoData = {}) {
    this.track(GTM_EVENTS.VIDEO_PLAY, {
      video_id: videoData.video_id,
      video_title: videoData.video_title,
      video_duration: videoData.video_duration,
      video_provider: videoData.video_provider || 'internal',
      educational_topic: videoData.educational_topic
    })
  }

  /**
   * Track video completion
   * @param {object} videoData - Video data
   */
  trackVideoComplete(videoData = {}) {
    this.track(GTM_EVENTS.VIDEO_COMPLETE, {
      video_id: videoData.video_id,
      video_title: videoData.video_title,
      watch_time: videoData.watch_time,
      completion_percentage: videoData.completion_percentage || 100,
      interactions: videoData.interactions || 0
    })
  }

  /**
   * Track file downloads
   * @param {object} downloadData - Download data
   */
  trackDownload(downloadData = {}) {
    this.track(GTM_EVENTS.DOWNLOAD, {
      file_name: downloadData.file_name,
      file_type: downloadData.file_type,
      file_size: downloadData.file_size,
      download_source: downloadData.download_source,
      educational_topic: downloadData.educational_topic
    })
  }

  /**
   * Track search events
   * @param {object} searchData - Search data
   */
  trackSearch(searchData = {}) {
    this.track(GTM_EVENTS.SEARCH, {
      search_term: searchData.search_term,
      search_category: searchData.search_category,
      results_count: searchData.results_count,
      search_filters: searchData.search_filters || {}
    })
  }

  // === COOKIE CONSENT EVENTS ===

  /**
   * Track consent events
   * @param {string} action - Consent action
   * @param {object} preferences - Consent preferences
   */
  trackConsent(action, preferences = {}) {
    const eventName = `consent_${action.toLowerCase()}`

    gtmService.pushEvent(eventName, {
      consent_action: action,
      preferences,
      categories_granted: Object.keys(preferences).filter(
        (key) => preferences[key]
      ),
      categories_denied: Object.keys(preferences).filter(
        (key) => !preferences[key]
      ),
      timestamp: new Date().toISOString()
    })

    if (this.debugMode) {
    }
  }

  // === PAGE TRACKING ===

  /**
   * Track page views
   * @param {object} pageData - Page data
   */
  trackPageView(pageData = {}) {
    if (!this.canTrack()) return

    gtmService.trackPageView({
      page_title: pageData.page_title || document.title,
      page_location: pageData.page_location || window.location.href,
      page_path: pageData.page_path || window.location.pathname,
      content_group: pageData.content_group,
      [GTM_CUSTOM_MAPPING.dimensions.device_type]: this.getDeviceType()
    })
  }

  // === UTILITY METHODS ===

  /**
   * Get session duration
   * @returns {number} Session duration in seconds
   */
  getSessionDuration() {
    const sessionStart = sessionStorage.getItem('session_start')
    if (!sessionStart) return 0

    return Math.floor((Date.now() - parseInt(sessionStart)) / 1000)
  }

  /**
   * Detect device type
   * @returns {string} Device type
   */
  getDeviceType() {
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  /**
   * Set user properties
   * @param {object} userProperties - User properties
   */
  setUserProperties(userProperties = {}) {
    if (!this.canTrack()) return

    gtmService.pushEvent('user_properties_set', {
      user_properties: userProperties,
      [GTM_CUSTOM_MAPPING.dimensions.user_type]: userProperties.user_type,
      [GTM_CUSTOM_MAPPING.dimensions.subscription_plan]:
        userProperties.subscription_plan,
      [GTM_CUSTOM_MAPPING.dimensions.user_role]: userProperties.user_role
    })
  }

  /**
   * Track custom events
   * @param {string} eventName - Custom event name
   * @param {object} properties - Event properties
   */
  trackCustomEvent(eventName, properties = {}) {
    this.track(GTM_EVENTS.CUSTOM_EVENT, {
      custom_event_name: eventName,
      ...properties
    })
  }

  /**
   * Enable/disable tracking
   * @param {boolean} enabled - Enable or disable tracking
   */
  setEnabled(enabled) {
    this.isEnabled = enabled
    if (this.debugMode) {
    }
  }

  /**
   * Get debug information
   * @returns {object} Debug information
   */
  getDebugInfo() {
    return {
      isEnabled: this.isEnabled,
      debugMode: this.debugMode,
      canTrackPerformance: this.canTrack(COOKIE_CATEGORIES.PERFORMANCE),
      canTrackMarketing: this.canTrack(COOKIE_CATEGORIES.MARKETING),
      gtmService: gtmService.getDebugInfo()
    }
  }
}

// Create and export singleton instance
const gtmTracker = new GTMTracker()
export default gtmTracker
