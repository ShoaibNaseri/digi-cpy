/**
 * Cookie Banner Component
 * Bottom banner with region-specific compliance messages
 * Smooth animations and modern design matching app color scheme
 */

import React, { useState, useEffect } from 'react'
import './styles/CookieBanner.css'
import {
  geoLocationService,
  consentService,
  quickSetup,
  generateCookiePolicyText
} from '../../utils/cookiesPolicy/index.js'

const CookieBanner = ({
  onAcceptAll,
  onRejectAll,
  onCustomize,
  onClose,
  isVisible = true
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [locationInfo, setLocationInfo] = useState(null)
  const [policyText, setPolicyText] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    initializeBanner()
  }, [])

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      // Trigger entrance animation
      setTimeout(() => setIsAnimating(false), 100)
    }
  }, [isVisible])

  const initializeBanner = async () => {
    try {
      const info = await geoLocationService.getDetailedLocationInfo()
      const text = generateCookiePolicyText(info.region)

      setLocationInfo(info)
      setPolicyText(text)
      setIsLoading(false)
    } catch (error) {
      console.error('Error initializing banner:', error)
      // Use fallback data
      setLocationInfo({
        region: 'eu',
        complianceRules: { requiresExplicitConsent: true, showRejectAll: true }
      })
      setPolicyText(generateCookiePolicyText('eu'))
      setIsLoading(false)
    }
  }

  const handleAcceptAll = async () => {
    try {
      setIsLoading(true)
      const success = await quickSetup.acceptAll(locationInfo?.region)

      if (success && onAcceptAll) {
        onAcceptAll()
      }

      handleClose()
    } catch (error) {
      console.error('Error accepting cookies:', error)
      setIsLoading(false)
    }
  }

  const handleRejectAll = async () => {
    try {
      setIsLoading(true)
      const success = await quickSetup.rejectAll(locationInfo?.region)

      if (success && onRejectAll) {
        onRejectAll()
      }

      handleClose()
    } catch (error) {
      console.error('Error rejecting cookies:', error)
      setIsLoading(false)
    }
  }

  const handleCustomize = () => {
    if (onCustomize) {
      onCustomize()
    }
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      if (onClose) {
        onClose()
      }
    }, 300) // Match animation duration
  }

  const getComplianceMessage = () => {
    if (!locationInfo) return ''

    const { region, complianceRules } = locationInfo

    if (
      complianceRules.regulation === 'GDPR' ||
      complianceRules.regulation === 'UK GDPR'
    ) {
      return 'We need your consent to use cookies on this website. You can choose which cookies to allow.'
    }

    if (complianceRules.regulation === 'CCPA/CPRA') {
      return 'We use cookies to improve your experience. You can opt out of non-essential cookies.'
    }

    if (complianceRules.regulation === 'PIPEDA') {
      return 'We use cookies to enhance your experience. We need your consent for non-essential cookies.'
    }

    return 'We use cookies to enhance your experience on our website.'
  }

  const getButtonConfiguration = () => {
    if (!locationInfo) return { showRejectAll: true }

    const { complianceRules } = locationInfo

    return {
      showRejectAll: complianceRules.showRejectAll !== false,
      acceptText: 'Accept All',
      rejectText: 'Reject All'
    }
  }

  if (!isVisible || isLoading) {
    return null
  }

  const buttonConfig = getButtonConfiguration()

  return (
    <div
      className={`cookie-banner ${
        isVisible && !isLoading ? 'cookie-banner--visible' : ''
      } ${isAnimating ? 'cookie-banner--entering' : ''} ${
        isClosing ? 'cookie-banner--closing' : ''
      }`}
      role='dialog'
      aria-labelledby='cookie-banner-title'
      aria-describedby='cookie-banner-description'
    >
      {/* Background overlay for better visibility */}
      <div className='cookie-banner__overlay' />

      <div className='cookie-banner__container'>
        <div className='cookie-banner__content'>
          <div className='cookie-banner__icon'>🍪</div>

          <div className='cookie-banner__text'>
            <h3 id='cookie-banner-title' className='cookie-banner__title'>
              Cookie Settings
            </h3>
            <p
              id='cookie-banner-description'
              className='cookie-banner__description'
            >
              {getComplianceMessage()}
            </p>

            {locationInfo?.testOverride && (
              <div className='cookie-banner__test-notice'>
                🧪 Test Mode: {locationInfo.region.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div className='cookie-banner__actions'>
          <div className='cookie-banner__button-group'>
            {buttonConfig.showRejectAll && (
              <button
                type='button'
                className='cookie-banner__button cookie-banner__button--reject'
                onClick={handleRejectAll}
                aria-label={`${buttonConfig.rejectText} cookies`}
              >
                {buttonConfig.rejectText}
              </button>
            )}

            <button
              type='button'
              className='cookie-banner__button cookie-banner__button--customize'
              onClick={handleCustomize}
              aria-label='Customize cookie preferences'
            >
              Customize
            </button>

            <button
              type='button'
              className='cookie-banner__button cookie-banner__button--accept'
              onClick={handleAcceptAll}
              aria-label={`${buttonConfig.acceptText} cookies`}
            >
              {buttonConfig.acceptText}
            </button>
          </div>

          <div className='cookie-banner__links'>
            <a
              href='/privacy-policy'
              className='cookie-banner__link'
              target='_blank'
              rel='noopener noreferrer'
            >
              Privacy Policy
            </a>
            <span className='cookie-banner__separator'>•</span>
            <a
              href='/cookie-policy'
              className='cookie-banner__link'
              target='_blank'
              rel='noopener noreferrer'
            >
              Cookie Policy
            </a>
          </div>
        </div>

        {/* Close button for accessibility */}
        <button
          type='button'
          className='cookie-banner__close'
          onClick={handleClose}
          aria-label='Close cookie banner'
        >
          ×
        </button>
      </div>

      {/* Compliance indicators */}
      <div className='cookie-banner__compliance'>
        {locationInfo?.complianceRules?.regulation && (
          <span className='cookie-banner__compliance-badge'>
            {locationInfo.complianceRules.regulation}
          </span>
        )}
      </div>
    </div>
  )
}

export default CookieBanner
