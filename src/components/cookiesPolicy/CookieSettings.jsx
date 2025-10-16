/**
 * Cookie Settings Modal Component
 * Modal for granular cookie preference management
 * Provides detailed information and toggle controls for each category
 */

import React, { useState, useEffect } from 'react'
import './styles/CookieSettings.css'
import {
  consentService,
  geoLocationService,
  formatPreferencesForDisplay,
  calculateConsentStats,
  quickSetup,
  COOKIE_CATEGORIES
} from '../../utils/cookiesPolicy/index.js'

const CookieSettings = ({
  isOpen = false,
  onClose,
  onSave,
  initialPreferences = null
}) => {
  const [preferences, setPreferences] = useState({})
  const [categoryInfo, setCategoryInfo] = useState([])
  const [locationInfo, setLocationInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [stats, setStats] = useState({})
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      initializeModal()
      document.body.style.overflow = 'hidden' // Prevent background scrolling
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    updateStats()
  }, [preferences])

  const initializeModal = async () => {
    try {
      setIsLoading(true)

      // Get location info
      const info = await geoLocationService.getDetailedLocationInfo()
      setLocationInfo(info)

      // Get current preferences or use initial/defaults
      let currentPrefs = initialPreferences
      if (!currentPrefs) {
        currentPrefs = consentService.getConsentPreferencesForRegion(
          info.region
        )
      }

      setPreferences(currentPrefs)

      // Format category information for display
      const categoryData = formatPreferencesForDisplay(currentPrefs)
      setCategoryInfo(categoryData)

      setIsLoading(false)
    } catch (error) {
      console.error('Error initializing cookie settings:', error)

      // Fallback data
      const fallbackPrefs = {
        [COOKIE_CATEGORIES.ESSENTIAL]: true,
        [COOKIE_CATEGORIES.PERFORMANCE]: false,
        [COOKIE_CATEGORIES.FUNCTIONAL]: false,
        [COOKIE_CATEGORIES.MARKETING]: false
      }

      setPreferences(fallbackPrefs)
      setCategoryInfo(formatPreferencesForDisplay(fallbackPrefs))
      setLocationInfo({
        region: 'eu',
        complianceRules: { requiresExplicitConsent: true }
      })
      setIsLoading(false)
    }
  }

  const updateStats = () => {
    const newStats = calculateConsentStats(preferences)
    setStats(newStats)
  }

  const handleCategoryToggle = (category) => {
    if (category === COOKIE_CATEGORIES.ESSENTIAL) {
      return // Essential cookies cannot be toggled off
    }

    const newPreferences = {
      ...preferences,
      [category]: !preferences[category]
    }

    setPreferences(newPreferences)

    // Update category info with new preferences
    const updatedCategoryInfo = formatPreferencesForDisplay(newPreferences)
    setCategoryInfo(updatedCategoryInfo)
  }

  const handleAcceptAll = () => {
    const allAccepted = {
      [COOKIE_CATEGORIES.ESSENTIAL]: true,
      [COOKIE_CATEGORIES.PERFORMANCE]: true,
      [COOKIE_CATEGORIES.FUNCTIONAL]: true,
      [COOKIE_CATEGORIES.MARKETING]: true
    }

    setPreferences(allAccepted)
    setCategoryInfo(formatPreferencesForDisplay(allAccepted))
  }

  const handleRejectAll = () => {
    const allRejected = {
      [COOKIE_CATEGORIES.ESSENTIAL]: true,
      [COOKIE_CATEGORIES.PERFORMANCE]: false,
      [COOKIE_CATEGORIES.FUNCTIONAL]: false,
      [COOKIE_CATEGORIES.MARKETING]: false
    }

    setPreferences(allRejected)
    setCategoryInfo(formatPreferencesForDisplay(allRejected))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      const success = await quickSetup.savePreferences(
        preferences,
        locationInfo?.region
      )

      if (success && onSave) {
        onSave(preferences)
      }

      handleClose()
    } catch (error) {
      console.error('Error saving preferences:', error)
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      if (onClose) {
        onClose()
      }
      setIsClosing(false)
    }, 200) // Match animation duration
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose()
    }
  }

  if (!isOpen && !isClosing) {
    return null
  }

  return (
    <div
      className={`cookie-settings-overlay ${
        isClosing ? 'cookie-settings-overlay--closing' : ''
      }`}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role='dialog'
      aria-modal='true'
      aria-labelledby='cookie-settings-title'
    >
      <div
        className={`cookie-settings-modal ${
          isClosing ? 'cookie-settings-modal--closing' : ''
        }`}
      >
        {/* Header */}
        <div className='cookie-settings__header'>
          <h2 id='cookie-settings-title' className='cookie-settings__title'>
            Cookie Preferences
          </h2>
          <button
            type='button'
            className='cookie-settings__close'
            onClick={handleClose}
            aria-label='Close cookie settings'
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className='cookie-settings__content'>
          {isLoading ? (
            <div className='cookie-settings__loading'>
              <div className='cookie-settings__spinner'></div>
              <p>Loading cookie preferences...</p>
            </div>
          ) : (
            <>
              <div className='cookie-settings__description'>
                <div className='cookie-settings__description-content'>
                  <p>
                    We use cookies and similar technologies to provide core site
                    functionality, improve your browsing experience, analyze
                    traffic, and serve personalized ads. Some cookies are
                    necessary and cannot be disabled. Others are optional and
                    require your consent. You may withdraw or change your
                    consent at any time by visiting [Cookie Preferences]. For
                    U.S. residents, you also have the right to opt out of the
                    sale or sharing of personal information [here]. For Canadian
                    residents, we ensure your consent is meaningful by providing
                    clear explanations of what each cookie does and how your
                    information will be used.
                  </p>
                </div>
              </div>
              {/* Description */}
              <div className='cookie-settings__description'>
                <p>
                  Choose which cookies you want to allow. You can change these
                  settings at any time.
                  {locationInfo?.complianceRules?.requiresExplicitConsent && (
                    <>
                      {' '}
                      Your explicit consent is required for non-essential
                      cookies.
                    </>
                  )}
                </p>

                {locationInfo?.testOverride && (
                  <div className='cookie-settings__test-notice'>
                    🧪 Test Mode: {locationInfo.region.toUpperCase()} compliance
                    rules
                  </div>
                )}
              </div>

              {/* Cookie Categories */}
              <div className='cookie-settings__categories'>
                {categoryInfo.map((category) => (
                  <div
                    key={category.category}
                    className={`cookie-settings__category ${
                      category.required
                        ? 'cookie-settings__category--required'
                        : ''
                    }`}
                  >
                    <div className='cookie-settings__category-header'>
                      <div className='cookie-settings__category-info'>
                        <h3 className='cookie-settings__category-name'>
                          {category.name}
                          {category.required && (
                            <span className='cookie-settings__required-badge'>
                              Required
                            </span>
                          )}
                        </h3>
                        <p className='cookie-settings__category-description'>
                          {category.description}
                        </p>
                      </div>

                      <div className='cookie-settings__toggle-wrapper'>
                        <label className='cookie-settings__toggle'>
                          <input
                            type='checkbox'
                            checked={category.enabled}
                            onChange={() =>
                              handleCategoryToggle(category.category)
                            }
                            disabled={category.required}
                            aria-describedby={`${category.category}-description`}
                          />
                          <span className='cookie-settings__slider'></span>
                        </label>
                      </div>
                    </div>

                    {/* Category Details */}
                    <div className='cookie-settings__category-details'>
                      <div className='cookie-settings__detail-grid'>
                        <div className='cookie-settings__detail'>
                          <strong>Used for:</strong>
                          <ul>
                            {category.examples.map((example, index) => (
                              <li key={index}>{example}</li>
                            ))}
                          </ul>
                        </div>
                        <div className='cookie-settings__detail'>
                          <strong>Data retention:</strong> {category.retention}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className='cookie-settings__quick-actions'>
                <button
                  type='button'
                  className='cookie-settings__quick-button cookie-settings__quick-button--reject'
                  onClick={handleRejectAll}
                  disabled={isSaving}
                >
                  Reject All Non-Essential
                </button>
                <button
                  type='button'
                  className='cookie-settings__quick-button cookie-settings__quick-button--accept'
                  onClick={handleAcceptAll}
                  disabled={isSaving}
                >
                  Accept All
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className='cookie-settings__footer'>
          <div className='cookie-settings__footer-info'>
            {locationInfo?.complianceRules?.regulation && (
              <span className='cookie-settings__compliance-info'>
                {locationInfo.complianceRules.regulation} Compliant
              </span>
            )}
            <div className='cookie-settings__footer-links'>
              <a
                href='/privacy-policy'
                target='_blank'
                rel='noopener noreferrer'
              >
                Privacy Policy
              </a>
            </div>
          </div>

          <div className='cookie-settings__actions'>
            <button
              type='button'
              className='cookie-settings__button cookie-settings__button--cancel'
              onClick={handleClose}
              disabled={isSaving}
            >
              Cancel
            </button>

            <button
              type='button'
              className='cookie-settings__button cookie-settings__button--save'
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className='cookie-settings__button-spinner'></span>
                  Saving...
                </>
              ) : (
                'Save Preferences'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CookieSettings
