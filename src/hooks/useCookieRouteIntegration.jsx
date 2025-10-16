/**
 * Cookie Route Integration Hook
 * Handles route-based cookie banner and settings display
 * Automatically shows cookie settings on privacy-related pages
 */

import React, { useEffect, useState } from 'react'
import { useCookieConsent } from '../context/CookieConsentContext'

/**
 * Hook to integrate cookie consent with routing
 * Uses window.location instead of useLocation to avoid Router context issues
 * @param {object} options - Configuration options
 * @returns {object} Route integration utilities
 */
export const useCookieRouteIntegration = (options = {}) => {
  const [location, setLocation] = useState({
    pathname: window.location.pathname,
    search: window.location.search
  })

  // Listen for route changes using window events
  useEffect(() => {
    const handleLocationChange = () => {
      setLocation({
        pathname: window.location.pathname,
        search: window.location.search
      })
    }

    // Listen for browser navigation
    window.addEventListener('popstate', handleLocationChange)

    // Listen for programmatic navigation (for SPAs)
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = function (...args) {
      originalPushState.apply(history, args)
      handleLocationChange()
    }

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args)
      handleLocationChange()
    }

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
    }
  }, [])
  const {
    showCookieSettings,
    hideCookieSettings,
    showCookieBanner,
    hideCookieBanner,
    shouldShowBannerForRoute,
    hasValidConsent,
    isInitialized
  } = useCookieConsent()

  const {
    autoShowSettingsOnPrivacyPages = true,
    privacyRoutes = [
      '/privacy-policy',
      '/cookie-policy',
      '/data-rights',
      '/terms-of-service'
    ],
    settingsParam = 'cookies',
    debugMode = false
  } = options

  // Handle route changes
  useEffect(() => {
    if (!isInitialized) return

    const currentPath = location.pathname
    const searchParams = new URLSearchParams(location.search)

    // if (debugMode) {
    //   console.log(
    //     'Route changed:',
    //     currentPath,
    //     'Params:',
    //     Object.fromEntries(searchParams)
    //   )
    // }

    // Check for cookie settings URL parameter
    if (searchParams.get(settingsParam) === 'show') {
      showCookieSettings()
      return
    }

    // Auto-show settings on privacy-related pages
    if (autoShowSettingsOnPrivacyPages && privacyRoutes.includes(currentPath)) {
      // Small delay to let the page load first
      const timer = setTimeout(() => {
        showCookieSettings()
      }, 500)

      return () => clearTimeout(timer)
    }

    // Check if banner should be shown for this route
    if (shouldShowBannerForRoute(currentPath)) {
      if (!hasValidConsent) {
        showCookieBanner()
      }
    }
  }, [
    location.pathname,
    location.search,
    isInitialized,
    autoShowSettingsOnPrivacyPages,
    privacyRoutes,
    settingsParam,
    debugMode,
    showCookieSettings,
    showCookieBanner,
    shouldShowBannerForRoute,
    hasValidConsent
  ])

  // Utility functions for manual control
  const routeUtils = {
    /**
     * Navigate to privacy page with cookie settings
     */
    goToPrivacyWithSettings: () => {
      window.location.href = '/privacy-policy?cookies=show'
    },

    /**
     * Navigate to cookie policy with settings
     */
    goToCookiePolicyWithSettings: () => {
      window.location.href = '/cookie-policy?cookies=show'
    },

    /**
     * Add cookie settings parameter to current URL
     */
    showSettingsForCurrentPage: () => {
      const url = new URL(window.location)
      url.searchParams.set(settingsParam, 'show')
      window.history.pushState({}, '', url.toString())
      showCookieSettings()
    },

    /**
     * Remove cookie settings parameter from URL
     */
    hideSettingsFromUrl: () => {
      const url = new URL(window.location)
      url.searchParams.delete(settingsParam)
      window.history.replaceState({}, '', url.toString())
      hideCookieSettings()
    },

    /**
     * Check if current route should show privacy notices
     */
    isPrivacyRoute: () => {
      return privacyRoutes.includes(location.pathname)
    },

    /**
     * Get cookie settings URL for any page
     */
    getCookieSettingsUrl: (path = location.pathname) => {
      const url = new URL(path, window.location.origin)
      url.searchParams.set(settingsParam, 'show')
      return url.toString()
    }
  }

  return {
    currentPath: location.pathname,
    isPrivacyRoute: routeUtils.isPrivacyRoute(),
    routeUtils
  }
}

/**
 * Component wrapper for route-based cookie integration
 * Use this to wrap components that need automatic cookie handling
 */
export const withCookieRouteIntegration = (WrappedComponent, options = {}) => {
  return (props) => {
    const routeIntegration = useCookieRouteIntegration(options)

    return (
      <WrappedComponent {...props} cookieRouteIntegration={routeIntegration} />
    )
  }
}

/**
 * Higher-order hook for pages that should always show cookie controls
 * Useful for privacy policy, cookie policy, and data rights pages
 */
export const usePrivacyPageCookies = () => {
  const { showCookieSettings, isInitialized } = useCookieConsent()

  useEffect(() => {
    if (isInitialized) {
      // Always show settings on privacy pages after a short delay
      const timer = setTimeout(() => {
        showCookieSettings()
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [isInitialized, showCookieSettings])

  return useCookieConsent()
}
