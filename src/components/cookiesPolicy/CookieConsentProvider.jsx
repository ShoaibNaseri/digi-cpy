/**
 * Cookie Consent Provider Component
 * Main provider that combines context, banner, and modal
 * Handles the complete cookie consent flow with optimal security
 */

import React from 'react'
import { CookieConsentProvider as ContextProvider } from '../../context/CookieConsentContext'
import { useCookieConsent } from '../../context/CookieConsentContext'
import CookieBanner from './CookieBanner'
import CookieSettings from './CookieSettings'
import { useCookieRouteIntegration } from '../../hooks/useCookieRouteIntegration.jsx'

/**
 * Internal component that renders banner and modal
 * This is separated to access the context after provider initialization
 */
const CookieConsentUIInternal = ({ routeIntegrationOptions = {} }) => {
  const {
    showBanner,
    showSettings,
    preferences,
    acceptAllCookies,
    rejectAllCookies,
    savePreferences,
    hideCookieBanner,
    hideCookieSettings,
    showCookieSettings,
    loading,
    isInitialized
  } = useCookieConsent()

  // Integrate with routing
  useCookieRouteIntegration(routeIntegrationOptions)

  // Don't render until initialized
  if (!isInitialized || loading) {
    return null
  }

  const handleBannerAcceptAll = async () => {
    try {
      await acceptAllCookies()
    } catch (error) {
      console.error('Error accepting cookies:', error)
    }
  }

  const handleBannerRejectAll = async () => {
    try {
      await rejectAllCookies()
    } catch (error) {
      console.error('Error rejecting cookies:', error)
    }
  }

  const handleBannerCustomize = () => {
    showCookieSettings()
  }

  const handleSettingsSave = async (newPreferences) => {
    try {
      await savePreferences(newPreferences)
    } catch (error) {
      console.error('Error saving preferences:', error)
    }
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
          onClose={hideCookieBanner}
        />
      )}

      {/* Cookie Settings Modal */}
      {showSettings && (
        <CookieSettings
          isOpen={showSettings}
          initialPreferences={preferences}
          onSave={handleSettingsSave}
          onClose={hideCookieSettings}
        />
      )}
    </>
  )
}

/**
 * Main Cookie Consent Provider Component
 * Wraps the entire cookie consent system
 */
export const CookieConsentProvider = ({
  children,
  routeIntegrationOptions = {},
  gtmOptions = {},
  disabled = false
}) => {
  // Allow disabling the entire system (useful for testing or opt-out scenarios)
  if (disabled) {
    return children
  }

  return (
    <ContextProvider gtmOptions={gtmOptions}>
      {children}
      <CookieConsentUIInternal
        routeIntegrationOptions={routeIntegrationOptions}
      />
    </ContextProvider>
  )
}

/**
 * Minimal Cookie Consent Provider (context only, no UI)
 * Use this when you want to manage the UI manually
 */
export const CookieConsentContextProvider = ({
  children,
  disabled = false
}) => {
  if (disabled) {
    return children
  }

  return <ContextProvider>{children}</ContextProvider>
}

/**
 * Cookie Consent UI Only (no context provider)
 * Use this when you already have the context provider higher up
 */
export const CookieConsentUI = ({ routeIntegrationOptions = {} }) => {
  return (
    <CookieConsentUIInternal
      routeIntegrationOptions={routeIntegrationOptions}
    />
  )
}

/**
 * Manual Cookie Controls Component
 * Provides manual controls for cookie management (useful for settings pages)
 */
export const CookieControls = ({ className = '', showLabels = true }) => {
  const {
    hasValidConsent,
    acceptAllCookies,
    rejectAllCookies,
    withdrawConsent,
    showCookieSettings,
    exportUserData,
    getConsentSummary,
    loading
  } = useCookieConsent()

  const summary = getConsentSummary()

  const handleExportData = () => {
    const data = exportUserData()
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `digipalz-cookie-data-${
      new Date().toISOString().split('T')[0]
    }.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`cookie-controls ${className}`}>
      {showLabels && (
        <div className='cookie-controls__status'>
          <h3>Cookie Preferences</h3>
          <p>
            {hasValidConsent
              ? `You have consented to ${summary.categoriesAccepted} of ${summary.totalCategories} cookie categories.`
              : 'No cookie preferences set.'}
          </p>
          {summary.consentDate && (
            <p className='cookie-controls__date'>
              Last updated: {new Date(summary.consentDate).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      <div className='cookie-controls__actions'>
        <button
          type='button'
          className='cookie-controls__button cookie-controls__button--settings'
          onClick={showCookieSettings}
          disabled={loading}
        >
          {showLabels ? 'Manage Cookie Preferences' : 'Cookie Settings'}
        </button>

        <button
          type='button'
          className='cookie-controls__button cookie-controls__button--accept'
          onClick={acceptAllCookies}
          disabled={loading}
        >
          {showLabels ? 'Accept All Cookies' : 'Accept All'}
        </button>

        <button
          type='button'
          className='cookie-controls__button cookie-controls__button--reject'
          onClick={rejectAllCookies}
          disabled={loading}
        >
          {showLabels ? 'Reject Non-Essential' : 'Reject All'}
        </button>

        {hasValidConsent && (
          <button
            type='button'
            className='cookie-controls__button cookie-controls__button--withdraw'
            onClick={withdrawConsent}
            disabled={loading}
          >
            {showLabels ? 'Withdraw Consent' : 'Withdraw'}
          </button>
        )}

        <button
          type='button'
          className='cookie-controls__button cookie-controls__button--export'
          onClick={handleExportData}
          disabled={loading}
        >
          {showLabels ? 'Export My Data' : 'Export'}
        </button>
      </div>

      <style jsx>{`
        .cookie-controls {
          font-family: 'Urbanist', system-ui, sans-serif;
        }

        .cookie-controls__status {
          margin-bottom: 20px;
        }

        .cookie-controls__status h3 {
          margin: 0 0 8px 0;
          font-size: 1.125rem;
          font-weight: 700;
          color: #1f2937;
        }

        .cookie-controls__status p {
          margin: 0 0 4px 0;
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.5;
        }

        .cookie-controls__date {
          font-size: 0.75rem !important;
          color: #9ca3af !important;
        }

        .cookie-controls__actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .cookie-controls__button {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 36px;
        }

        .cookie-controls__button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cookie-controls__button--settings {
          background: linear-gradient(90deg, #7b34bf 0%, #8b2db3 100%);
          color: #ffffff;
        }

        .cookie-controls__button--settings:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(123, 52, 191, 0.3);
        }

        .cookie-controls__button--accept {
          background: #10b981;
          color: #ffffff;
        }

        .cookie-controls__button--accept:hover:not(:disabled) {
          background: #059669;
        }

        .cookie-controls__button--reject {
          background: #f3f4f6;
          color: #6b7280;
          border: 1px solid #e5e7eb;
        }

        .cookie-controls__button--reject:hover:not(:disabled) {
          background: #e5e7eb;
          color: #374151;
        }

        .cookie-controls__button--withdraw {
          background: #ef4444;
          color: #ffffff;
        }

        .cookie-controls__button--withdraw:hover:not(:disabled) {
          background: #dc2626;
        }

        .cookie-controls__button--export {
          background: #ffffff;
          color: #7b34bf;
          border: 1px solid #7b34bf;
        }

        .cookie-controls__button--export:hover:not(:disabled) {
          background: #7b34bf;
          color: #ffffff;
        }

        @media (max-width: 640px) {
          .cookie-controls__actions {
            flex-direction: column;
          }

          .cookie-controls__button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}

export default CookieConsentProvider
