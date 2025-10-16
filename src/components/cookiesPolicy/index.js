/**
 * Cookie Policy Components - Main Export File
 * Provides convenient access to all cookie policy components
 */

// Core Components
export { default as CookieBanner } from './CookieBanner.jsx'
export { default as CookieSettings } from './CookieSettings.jsx'
export {
  default as CookieManager,
  withCookieManager,
  useCookieManager
} from './CookieManager.jsx'

// Provider Components (Recommended)
export {
  default as CookieConsentProvider,
  CookieConsentContextProvider,
  CookieConsentUI,
  CookieControls
} from './CookieConsentProvider.jsx'

// Context and Hooks
export { useCookieConsent } from '../../context/CookieConsentContext.jsx'
export {
  useCookieRouteIntegration,
  withCookieRouteIntegration,
  usePrivacyPageCookies
} from '../../hooks/useCookieRouteIntegration.jsx'

// Re-export utilities for convenience
export * from '../../utils/cookiesPolicy/index.js'
