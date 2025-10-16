/**
 * Cookie Consent Context
 * Provides secure, centralized cookie consent state management
 * Integrates with AuthContext for automatic user tracking upgrades
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo
} from 'react'
import { useAuth } from './AuthContext'
import {
  initializeCookiePolicy,
  consentService,
  trackingService,
  geoLocationService,
  cookieService,
  shouldShowCookieBanner
} from '../utils/cookiesPolicy/index.js'

const CookieConsentContext = createContext()

export function useCookieConsent() {
  const context = useContext(CookieConsentContext)
  if (!context) {
    throw new Error(
      'useCookieConsent must be used within a CookieConsentProvider'
    )
  }
  return context
}

export function CookieConsentProvider({ children, gtmOptions = {} }) {
  // State management
  const [isInitialized, setIsInitialized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [hasValidConsent, setHasValidConsent] = useState(false)
  const [preferences, setPreferences] = useState(null)
  const [locationInfo, setLocationInfo] = useState(null)
  const [visitorId, setVisitorId] = useState(null)
  const [consentTimestamp, setConsentTimestamp] = useState(null)

  // Auth integration
  const { currentUser, loading: authLoading } = useAuth()

  // Initialize the cookie consent system
  const initializeSystem = useCallback(async () => {
    try {
      setLoading(true)

      const result = await initializeCookiePolicy({
        gtm: gtmOptions
      })

      if (result.initialized) {
        setLocationInfo(result.locationInfo)
        setPreferences(result.preferences)
        setHasValidConsent(result.hasValidConsent)
        setVisitorId(result.visitorId)
        setConsentTimestamp(
          cookieService.getCookie('digipalz_consent_timestamp')
        )

        // Only show banner if no valid consent
        const shouldShow = !result.hasValidConsent
        setShowBanner(shouldShow)

        setIsInitialized(true)
      } else {
        throw new Error('Failed to initialize cookie system')
      }
    } catch (error) {
      console.error('Error initializing cookie consent system:', error)

      // Secure fallback - show banner with most restrictive settings
      setLocationInfo({
        region: 'eu',
        complianceRules: { requiresExplicitConsent: true, showRejectAll: true }
      })
      setShowBanner(true)
      setIsInitialized(true)
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle user authentication (visitor -> user upgrade)
  const handleUserAuthentication = useCallback(async (user) => {
    try {
      // Upgrade visitor tracking to user tracking
      const upgradedUserId = trackingService.upgradeToUserTracking(user.uid)

      if (upgradedUserId) {
        // Track user authentication event
        trackingService.trackEvent('user_authenticated', {
          userId: user.uid,
          email: user.email,
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Error handling user authentication for cookies:', error)
    }
  }, [])

  // Handle user logout
  const handleUserLogout = useCallback(async () => {
    try {
      // Track logout event before resetting
      trackingService.trackEvent('user_logged_out', {
        timestamp: new Date().toISOString()
      })

      // Reset to visitor tracking but keep consent preferences
      trackingService.resetTracking()
      const newVisitorId = trackingService.initializeVisitorTracking()
      setVisitorId(newVisitorId)
    } catch (error) {
      console.error('Error handling user logout for cookies:', error)
    }
  }, [])

  // Accept all cookies
  const acceptAllCookies = useCallback(async () => {
    try {
      setLoading(true)

      const success = consentService.acceptAllCookies(locationInfo?.region)

      if (success) {
        const newPreferences = consentService.getConsentPreferences()
        setPreferences(newPreferences)
        setHasValidConsent(true)
        setConsentTimestamp(new Date().toISOString())
        setShowBanner(false)

        // Initialize analytics if not already done
        trackingService.initializeAnalytics()

        return true
      }

      return false
    } catch (error) {
      console.error('Error accepting all cookies:', error)
      return false
    } finally {
      setLoading(false)
    }
  }, [locationInfo])

  // Reject all non-essential cookies
  const rejectAllCookies = useCallback(async () => {
    try {
      setLoading(true)

      const success = consentService.rejectAllCookies(locationInfo?.region)

      if (success) {
        const newPreferences = consentService.getConsentPreferences()
        setPreferences(newPreferences)
        setHasValidConsent(true)
        setConsentTimestamp(new Date().toISOString())
        setShowBanner(false)

        return true
      }

      return false
    } catch (error) {
      console.error('Error rejecting cookies:', error)
      return false
    } finally {
      setLoading(false)
    }
  }, [locationInfo])

  // Save custom preferences
  const savePreferences = useCallback(
    async (customPreferences) => {
      try {
        setLoading(true)

        const success = consentService.saveConsentPreferences(
          customPreferences,
          'save_preferences',
          locationInfo?.region
        )

        if (success) {
          setPreferences(customPreferences)
          setHasValidConsent(true)
          setConsentTimestamp(new Date().toISOString())
          setShowBanner(false)
          setShowSettings(false)

          // Initialize analytics if performance cookies are enabled
          if (customPreferences.performance) {
            trackingService.initializeAnalytics()
          }

          return true
        }

        return false
      } catch (error) {
        console.error('Error saving preferences:', error)
        return false
      } finally {
        setLoading(false)
      }
    },
    [locationInfo]
  )

  // Withdraw consent (GDPR right)
  const withdrawConsent = useCallback(async () => {
    try {
      setLoading(true)

      const success = consentService.withdrawConsent(locationInfo?.region)

      if (success) {
        const newPreferences = consentService.getConsentPreferences()
        setPreferences(newPreferences)
        setHasValidConsent(false)
        setConsentTimestamp(null)
        setShowBanner(true)

        return true
      }

      return false
    } catch (error) {
      console.error('Error withdrawing consent:', error)
      return false
    } finally {
      setLoading(false)
    }
  }, [locationInfo])

  // Show cookie settings modal
  const showCookieSettings = useCallback(() => {
    setShowSettings(true)
  }, [])

  // Hide cookie settings modal
  const hideCookieSettings = useCallback(() => {
    setShowSettings(false)
  }, [])

  // Force show banner (for testing or manual trigger)
  const showCookieBanner = useCallback(() => {
    setShowBanner(true)
  }, [])

  // Hide banner
  const hideCookieBanner = useCallback(() => {
    setShowBanner(false)
  }, [])

  // Check if specific category is consented
  const isCategoryConsented = useCallback((category) => {
    return consentService.isConsentedForCategory(category)
  }, [])

  // Get consent summary for display
  const getConsentSummary = useCallback(() => {
    return consentService.getConsentSummary()
  }, [])

  // Export user data (GDPR data portability)
  const exportUserData = useCallback(() => {
    return {
      consent: consentService.exportConsentData(),
      tracking: trackingService.exportTrackingData(),
      location: locationInfo,
      exportedAt: new Date().toISOString()
    }
  }, [locationInfo])

  // Check if banner should be shown based on route
  const shouldShowBannerForRoute = useCallback((pathname) => {
    // Show settings on privacy/cookie policy pages
    const settingsRoutes = ['/privacy-policy', '/cookie-policy', '/data-rights']
    return settingsRoutes.includes(pathname)
  }, [])

  // Initialize cookie system when auth is ready and page has loaded
  useEffect(() => {
    if (!authLoading) {
      // Wait for page to load completely before showing banner
      const initializeWithDelay = () => {
        // Check if page is already loaded
        if (document.readyState === 'complete') {
          // Additional delay to ensure animations/content are settled
          setTimeout(() => {
            initializeSystem()
          }, 1500) // 1.5 second delay after page load
        } else {
          // Wait for page to load completely
          window.addEventListener(
            'load',
            () => {
              setTimeout(() => {
                initializeSystem()
              }, 1500)
            },
            { once: true }
          )
        }
      }

      initializeWithDelay()
    }
  }, [authLoading, initializeSystem])

  // Handle user authentication state changes
  useEffect(() => {
    if (isInitialized && currentUser) {
      handleUserAuthentication(currentUser)
    } else if (isInitialized && !currentUser) {
      handleUserLogout()
    }
  }, [currentUser, isInitialized, handleUserAuthentication, handleUserLogout])

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      // State
      isInitialized,
      loading: loading || authLoading,
      showBanner,
      showSettings,
      hasValidConsent,
      preferences,
      locationInfo,
      visitorId,
      consentTimestamp,

      // Actions
      acceptAllCookies,
      rejectAllCookies,
      savePreferences,
      withdrawConsent,
      showCookieSettings,
      hideCookieSettings,
      showCookieBanner,
      hideCookieBanner,

      // Utilities
      isCategoryConsented,
      getConsentSummary,
      exportUserData,
      shouldShowBannerForRoute,

      // Services (for advanced usage)
      services: {
        consentService,
        trackingService,
        geoLocationService
      }
    }),
    [
      isInitialized,
      loading,
      authLoading,
      showBanner,
      showSettings,
      hasValidConsent,
      preferences,
      locationInfo,
      visitorId,
      consentTimestamp,
      acceptAllCookies,
      rejectAllCookies,
      savePreferences,
      withdrawConsent,
      showCookieSettings,
      hideCookieSettings,
      showCookieBanner,
      hideCookieBanner,
      isCategoryConsented,
      getConsentSummary,
      exportUserData,
      shouldShowBannerForRoute
    ]
  )

  return (
    <CookieConsentContext.Provider value={contextValue}>
      {children}
    </CookieConsentContext.Provider>
  )
}
