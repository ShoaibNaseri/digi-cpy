/**
 * GTM Hook
 * React hook for Google Tag Manager integration with cookie consent
 */

import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCookieConsent } from '../context/CookieConsentContext'
import gtmService from '../services/gtm/gtmService'
import { getGTMConfig, GTM_EVENTS } from '../config/gtm'

export const useGTM = (options = {}) => {
  const { currentUser } = useAuth()
  const { preferences, hasValidConsent } = useCookieConsent()
  const isInitialized = useRef(false)
  const lastConsentHash = useRef(null)

  // Initialize GTM
  useEffect(() => {
    const initializeGTM = async () => {
      if (isInitialized.current) return

      const gtmConfig = getGTMConfig()
      if (!gtmConfig) {
        console.warn('GTM configuration not available')
        return
      }

      try {
        // Initialize GTM service
        gtmService.initialize({
          ...gtmConfig,
          ...options
        })

        isInitialized.current = true
        console.log('GTM initialized via hook')
      } catch (error) {
        console.error('Error initializing GTM:', error)
      }
    }

    initializeGTM()
  }, [options])

  // Update consent when preferences change
  useEffect(() => {
    if (!isInitialized.current || !preferences) return

    const consentHash = JSON.stringify(preferences)
    if (lastConsentHash.current === consentHash) return

    console.log('Consent preferences changed, updating GTM')
    gtmService.updateConsentMode()
    lastConsentHash.current = consentHash
  }, [preferences])

  // Track user authentication state
  useEffect(() => {
    if (!isInitialized.current) return

    if (currentUser) {
      gtmService.pushEvent(GTM_EVENTS.LOGIN, {
        user_id: currentUser.uid,
        user_type: currentUser.role || 'student',
        method: 'email'
      })
    }
  }, [currentUser])

  // Tracking functions
  const trackEvent = useCallback((eventName, properties = {}) => {
    if (!isInitialized.current) {
      console.warn('GTM not initialized, event not tracked:', eventName)
      return
    }

    gtmService.trackEvent(eventName, properties)
  }, [])

  const trackPageView = useCallback((pageData = {}) => {
    if (!isInitialized.current) return

    gtmService.trackPageView(pageData)
  }, [])

  const trackLogin = useCallback((userData = {}) => {
    if (!isInitialized.current) return

    gtmService.trackLogin(userData)
  }, [])

  const trackRegistration = useCallback((userData = {}) => {
    if (!isInitialized.current) return

    gtmService.trackRegistration(userData)
  }, [])

  const trackPurchase = useCallback((purchaseData = {}) => {
    if (!isInitialized.current) return

    gtmService.trackPurchase(purchaseData)
  }, [])

  const trackGameInteraction = useCallback((gameData = {}) => {
    if (!isInitialized.current) return

    gtmService.trackGameInteraction(gameData)
  }, [])

  const trackContentEngagement = useCallback((contentData = {}) => {
    if (!isInitialized.current) return

    gtmService.trackContentEngagement(contentData)
  }, [])

  // Enhanced tracking functions for educational platform
  const trackLessonStart = useCallback(
    (lessonData = {}) => {
      trackEvent(GTM_EVENTS.LESSON_START, {
        event_category: 'Education',
        event_label: lessonData.lesson_name,
        lesson_id: lessonData.lesson_id,
        grade_level: lessonData.grade_level,
        subject: lessonData.subject,
        ...lessonData
      })
    },
    [trackEvent]
  )

  const trackLessonComplete = useCallback(
    (lessonData = {}) => {
      trackEvent(GTM_EVENTS.LESSON_COMPLETE, {
        event_category: 'Education',
        event_label: lessonData.lesson_name,
        lesson_id: lessonData.lesson_id,
        completion_time: lessonData.completion_time,
        score: lessonData.score,
        ...lessonData
      })
    },
    [trackEvent]
  )

  const trackQuizStart = useCallback(
    (quizData = {}) => {
      trackEvent(GTM_EVENTS.QUIZ_START, {
        event_category: 'Assessment',
        event_label: quizData.quiz_name,
        quiz_id: quizData.quiz_id,
        question_count: quizData.question_count,
        ...quizData
      })
    },
    [trackEvent]
  )

  const trackQuizComplete = useCallback(
    (quizData = {}) => {
      trackEvent(GTM_EVENTS.QUIZ_COMPLETE, {
        event_category: 'Assessment',
        event_label: quizData.quiz_name,
        quiz_id: quizData.quiz_id,
        score: quizData.score,
        total_possible: quizData.total_possible,
        completion_time: quizData.completion_time,
        passed: quizData.passed,
        ...quizData
      })
    },
    [trackEvent]
  )

  const trackGameStart = useCallback(
    (gameData = {}) => {
      trackEvent(GTM_EVENTS.GAME_START, {
        event_category: 'Games',
        event_label: gameData.game_name,
        game_id: gameData.game_id,
        game_type: gameData.game_type,
        difficulty_level: gameData.difficulty_level,
        ...gameData
      })
    },
    [trackEvent]
  )

  const trackGameComplete = useCallback(
    (gameData = {}) => {
      trackEvent(GTM_EVENTS.GAME_COMPLETE, {
        event_category: 'Games',
        event_label: gameData.game_name,
        game_id: gameData.game_id,
        score: gameData.score,
        level_reached: gameData.level_reached,
        completion_time: gameData.completion_time,
        success: gameData.success,
        ...gameData
      })
    },
    [trackEvent]
  )

  const trackSubscription = useCallback(
    (subscriptionData = {}) => {
      trackEvent(GTM_EVENTS.SUBSCRIPTION_START, {
        event_category: 'Ecommerce',
        plan_name: subscriptionData.plan_name,
        plan_price: subscriptionData.plan_price,
        billing_cycle: subscriptionData.billing_cycle,
        currency: subscriptionData.currency || 'USD',
        ...subscriptionData
      })
    },
    [trackEvent]
  )

  const trackSearch = useCallback(
    (searchData = {}) => {
      trackEvent(GTM_EVENTS.SEARCH, {
        event_category: 'Site Search',
        search_term: searchData.search_term,
        search_results: searchData.search_results,
        search_category: searchData.search_category,
        ...searchData
      })
    },
    [trackEvent]
  )

  // Get current status
  const getStatus = useCallback(() => {
    return {
      isInitialized: isInitialized.current,
      hasValidConsent,
      consentStatus: gtmService.getConsentStatus(),
      debugInfo: gtmService.getDebugInfo()
    }
  }, [hasValidConsent])

  return {
    // Status
    isInitialized: isInitialized.current,
    hasValidConsent,

    // Basic tracking
    trackEvent,
    trackPageView,
    trackLogin,
    trackRegistration,
    trackPurchase,
    trackGameInteraction,
    trackContentEngagement,

    // Educational tracking
    trackLessonStart,
    trackLessonComplete,
    trackQuizStart,
    trackQuizComplete,
    trackGameStart,
    trackGameComplete,
    trackSubscription,
    trackSearch,

    // Utilities
    getStatus
  }
}

export default useGTM
