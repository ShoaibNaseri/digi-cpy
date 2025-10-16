/**
 * GTM Debug Utilities
 * Helper functions to debug GTM integration
 */

import gtmService from '../services/gtm/gtmService'
import { getGTMConfig } from '../config/gtm'

/**
 * Check GTM status and configuration
 */
export const checkGTMStatus = () => {
  // Check environment variables

  // Check GTM configuration
  const config = getGTMConfig()

  // Check GTM service status
  const debugInfo = gtmService.getDebugInfo()

  // Check if GTM script is loaded
  const gtmScripts = document.querySelectorAll(
    'script[src*="googletagmanager.com"]'
  )
  gtmScripts.forEach((script, index) => {
    // Script found
  })

  // Check data layer

  // Check gtag function

  // Check noscript iframe
  const iframes = document.querySelectorAll(
    'iframe[src*="googletagmanager.com"]'
  )
  iframes.forEach((iframe, index) => {
    // Iframe found
  })

  return {
    environment: {
      gtmIdDev: import.meta.env.VITE_GTM_ID_DEV,
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV
    },
    config,
    service: debugInfo,
    scripts: gtmScripts.length,
    dataLayer: {
      exists: typeof window.dataLayer !== 'undefined',
      length: window.dataLayer?.length || 0,
      contents: window.dataLayer
    },
    gtag: {
      available: typeof window.gtag !== 'undefined',
      type: typeof window.gtag
    },
    iframes: iframes.length
  }
}

/**
 * Force initialize GTM (for testing)
 */
export const forceInitializeGTM = () => {
  const config = getGTMConfig()
  if (!config) {
    console.error('❌ No GTM configuration available')
    return
  }

  gtmService.initialize(config)
}

/**
 * Test GTM event tracking
 */
export const testGTMEvent = () => {
  gtmService.pushEvent('test_event', {
    test_property: 'debug_value',
    timestamp: new Date().toISOString(),
    source: 'debug_utility'
  })
}

/**
 * Check consent status
 */
export const checkConsentStatus = () => {
  const consentStatus = gtmService.getConsentStatus()

  return consentStatus
}

// Make functions available globally for browser console
if (typeof window !== 'undefined') {
  window.gtmDebug = {
    checkStatus: checkGTMStatus,
    forceInit: forceInitializeGTM,
    testEvent: testGTMEvent,
    checkConsent: checkConsentStatus
  }
}

export default {
  checkGTMStatus,
  forceInitializeGTM,
  testGTMEvent,
  checkConsentStatus
}
