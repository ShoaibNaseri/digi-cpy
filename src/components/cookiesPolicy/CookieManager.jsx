/**
 * Cookie Manager Component
 * Main coordinator component that manages banner and modal states
 * Handles consent flow and integrates with app authentication
 */

import React, { useState, useEffect, useCallback } from 'react'
import CookieBanner from './CookieBanner.jsx'
import CookieSettings from './CookieSettings.jsx'
import {
  initializeCookiePolicy,
  consentService,
  trackingService,
  geoLocationService,
  shouldShowCookieBanner
} from '../../utils/cookiesPolicy/index.js'

const CookieManager = ({
  user = null,
  onConsentChange = null,
  onUserUpgrade = null,
  forceShow = false
}) => {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [locationInfo, setLocationInfo] = useState(null)
  const [currentPreferences, setCurrentPreferences] = useState(null)
  const [hasValidConsent, setHasValidConsent] = useState(false)

  // Initialize cookie policy system
  useEffect(() => {
    initializeSystem()
  }, [])

  // Handle user authentication changes
  useEffect(() => {
    if (user && isInitialized) {
      handleUserAuthentication(user)
    }
  }, [user, isInitialized])

  // Handle force show banner
  useEffect(() => {
    if (forceShow && isInitialized) {
      setShowBanner(true)
    }
  }, [forceShow, isInitialized])

  const initializeSystem = async () => {
    try {
      const result = await initializeCookiePolicy()

      if (result.initialized) {
        setLocationInfo(result.locationInfo)
        setCurrentPreferences(result.preferences)
        setHasValidConsent(result.hasValidConsent)
        setShowBanner(result.showBanner && !result.hasValidConsent)
        setIsInitialized(true)
      } else {
        // Fallback initialization
        console.warn('Cookie policy initialization failed, using fallbacks')
        setLocationInfo({
          region: 'eu',
          complianceRules: { requiresExplicitConsent: true }
        })
        setShowBanner(true)
        setIsInitialized(true)
      }
    } catch (error) {
      console.error('Error initializing cookie manager:', error)
      // Show banner on error for safety
      setShowBanner(true)
      setIsInitialized(true)
    }
  }

  const handleUserAuthentication = async (userData) => {
    try {
      // Upgrade visitor tracking to user tracking
      const userId = userData.id || userData.uid
      if (userId) {
        trackingService.upgradeToUserTracking(userId)

        if (onUserUpgrade) {
          onUserUpgrade(userId)
        }
      }
    } catch (error) {
      console.error('Error handling user authentication:', error)
    }
  }

  const handleBannerAcceptAll = useCallback(async () => {
    try {
      // Get updated preferences
      const preferences = consentService.getConsentPreferences()
      setCurrentPreferences(preferences)
      setHasValidConsent(true)
      setShowBanner(false)

      // Notify parent component
      if (onConsentChange) {
        onConsentChange({
          action: 'accept_all',
          preferences,
          timestamp: new Date().toISOString()
        })
      }

      // Track consent event
      trackingService.trackConsentEvent('accept_all', preferences)
    } catch (error) {
      console.error('Error handling accept all:', error)
    }
  }, [onConsentChange])

  const handleBannerRejectAll = useCallback(async () => {
    try {
      // Get updated preferences
      const preferences = consentService.getConsentPreferences()
      setCurrentPreferences(preferences)
      setHasValidConsent(true)
      setShowBanner(false)

      // Notify parent component
      if (onConsentChange) {
        onConsentChange({
          action: 'reject_all',
          preferences,
          timestamp: new Date().toISOString()
        })
      }

      // Track consent event
      trackingService.trackConsentEvent('reject_all', preferences)
    } catch (error) {
      console.error('Error handling reject all:', error)
    }
  }, [onConsentChange])

  const handleBannerCustomize = useCallback(() => {
    setShowSettings(true)
  }, [])

  const handleBannerClose = useCallback(() => {
    setShowBanner(false)
  }, [])

  const handleSettingsSave = useCallback(
    async (preferences) => {
      try {
        setCurrentPreferences(preferences)
        setHasValidConsent(true)
        setShowBanner(false)
        setShowSettings(false)

        // Notify parent component
        if (onConsentChange) {
          onConsentChange({
            action: 'save_preferences',
            preferences,
            timestamp: new Date().toISOString()
          })
        }

        // Track consent event
        trackingService.trackConsentEvent('save_preferences', preferences)
      } catch (error) {
        console.error('Error handling settings save:', error)
      }
    },
    [onConsentChange]
  )

  const handleSettingsClose = useCallback(() => {
    setShowSettings(false)
  }, [])

  // Public methods for external control
  const publicAPI = {
    showBanner: () => setShowBanner(true),
    showSettings: () => setShowSettings(true),
    hideBanner: () => setShowBanner(false),
    hideSettings: () => setShowSettings(false),
    getPreferences: () => currentPreferences,
    hasValidConsent: () => hasValidConsent,
    getLocationInfo: () => locationInfo,
    withdrawConsent: async () => {
      try {
        const success = consentService.withdrawConsent(locationInfo?.region)
        if (success) {
          setHasValidConsent(false)
          setShowBanner(true)
          const preferences = consentService.getConsentPreferences()
          setCurrentPreferences(preferences)

          if (onConsentChange) {
            onConsentChange({
              action: 'withdraw_consent',
              preferences,
              timestamp: new Date().toISOString()
            })
          }
        }
        return success
      } catch (error) {
        console.error('Error withdrawing consent:', error)
        return false
      }
    },
    exportData: () => {
      return {
        consent: consentService.exportConsentData(),
        tracking: trackingService.exportTrackingData(),
        location: locationInfo
      }
    }
  }

  // Expose API to parent component via ref
  React.useImperativeHandle(
    React.forwardRef(() => {}),
    () => publicAPI
  )

  // Attach to window for debugging (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      window.digipalzCookieManager = publicAPI
    }
  }, [publicAPI])

  // Don't render anything until initialized
  if (!isInitialized) {
    return null
  }

  return (
    <>
      {/* Cookie Banner */}
      {showBanner && (
        <CookieBanner
          isVisible={showBanner}
          onAcceptAll={handleBannerAcceptAll}
          onRejectAll={handleBannerRejectAll}
          onCustomize={handleBannerCustomize}
          onClose={handleBannerClose}
        />
      )}

      {/* Cookie Settings Modal */}
      {showSettings && (
        <CookieSettings
          isOpen={showSettings}
          initialPreferences={currentPreferences}
          onSave={handleSettingsSave}
          onClose={handleSettingsClose}
        />
      )}
    </>
  )
}

// HOC for easy integration with authentication
export const withCookieManager = (WrappedComponent) => {
  return React.forwardRef((props, ref) => {
    const [cookieManagerRef, setCookieManagerRef] = useState(null)

    const cookieManagerProps = {
      user: props.user || null,
      onConsentChange: props.onConsentChange || null,
      onUserUpgrade: props.onUserUpgrade || null,
      forceShow: props.forceShowCookieBanner || false
    }

    // Attach cookie manager API to wrapped component
    React.useImperativeHandle(ref, () => ({
      ...WrappedComponent.prototype,
      cookieManager: cookieManagerRef
    }))

    return (
      <>
        <WrappedComponent {...props} ref={ref} />
        <CookieManager {...cookieManagerProps} ref={setCookieManagerRef} />
      </>
    )
  })
}

// Utility hook for using cookie manager in functional components
export const useCookieManager = () => {
  const [manager, setManager] = useState(null)

  useEffect(() => {
    // Try to get the global manager if it exists
    if (window.digipalzCookieManager) {
      setManager(window.digipalzCookieManager)
    }
  }, [])

  return manager
}

export default CookieManager
