import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import './ConsentModal.css'

const ConsentModal = ({ isOpen, onClose, onSave, isLoading }) => {
  const { currentUser } = useAuth()
  const [consentSettings, setConsentSettings] = useState({
    basicAnalytics: false,
    advancedAnalytics: false,
    marketingCommunications: false,
    personalizedContent: false,
    chatbotInteraction: false,
    researchParticipation: false,
    marketingEmails: false
  })

  useEffect(() => {
    if (isOpen && currentUser?.consentSettings) {
      setConsentSettings(currentUser.consentSettings)
    }
  }, [isOpen, currentUser])

  const handleChange = (setting) => {
    setConsentSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting]
    }))
  }

  const handleSave = () => {
    onSave(consentSettings)
  }

  const handleClose = () => {
    // Reset to current user settings when closing without saving
    if (currentUser?.consentSettings) {
      setConsentSettings(currentUser.consentSettings)
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='consent-modal-overlay'>
      <div className='consent-modal'>
        <div className='consent-modal__header'>
          <h2>Manage Consent Settings</h2>
          <button className='close-button' onClick={handleClose}>
            &times;
          </button>
        </div>

        <div className='consent-modal__content'>
          <div className='consent-section'>
            <label className='consent-option'>
              <input
                type='checkbox'
                checked={consentSettings.basicAnalytics}
                onChange={() => handleChange('basicAnalytics')}
              />
              <div className='consent-text'>
                <h3>Basic Analytics (Opt-Out)</h3>
                <p>Tracks gameplay engagement to improve user experience</p>
              </div>
            </label>

            <label className='consent-option'>
              <input
                type='checkbox'
                checked={consentSettings.advancedAnalytics}
                onChange={() => handleChange('advancedAnalytics')}
              />
              <div className='consent-text'>
                <h3>Advanced Analytics (Opt-In)</h3>
                <p>
                  Tracks behavior patterns to improve platform features or
                  learning outcomes
                </p>
              </div>
            </label>

            <label className='consent-option'>
              <input
                type='checkbox'
                checked={consentSettings.marketingCommunications}
                onChange={() => handleChange('marketingCommunications')}
              />
              <div className='consent-text'>
                <h3>Marketing Communications (Opt-In)</h3>
                <p>
                  Allows emails or messages about updates, offers, or new
                  features
                </p>
              </div>
            </label>

            <label className='consent-option'>
              <input
                type='checkbox'
                checked={consentSettings.personalizedContent}
                onChange={() => handleChange('personalizedContent')}
              />
              <div className='consent-text'>
                <h3>Personalized Content (Opt-In)</h3>
                <p>Tailors in-game content based on user activity</p>
              </div>
            </label>

            <label className='consent-option'>
              <input
                type='checkbox'
                checked={consentSettings.chatbotInteraction}
                onChange={() => handleChange('chatbotInteraction')}
              />
              <div className='consent-text'>
                <h3>Chatbot Interaction with Personal Data (Opt-In)</h3>
                <p>
                  Enables AI to respond based on user inputs involving name or
                  sensitive data
                </p>
              </div>
            </label>

            <label className='consent-option'>
              <input
                type='checkbox'
                checked={consentSettings.researchParticipation}
                onChange={() => handleChange('researchParticipation')}
              />
              <div className='consent-text'>
                <h3>Participation in Research / Feedback (Opt-In)</h3>
                <p>
                  Includes surveys, focus groups, or data used in educational
                  studies
                </p>
              </div>
            </label>

            <label className='consent-option'>
              <input
                type='checkbox'
                checked={consentSettings.marketingEmails}
                onChange={() => handleChange('marketingEmails')}
              />
              <div className='consent-text'>
                <h3>Marketing and promotional emails</h3>
                <p>Receive marketing and promotional emails from us</p>
              </div>
            </label>
          </div>

          <div className='core-consent-notice'>
            <h3>Core Gameplay Consent</h3>
            <p>
              This is required for core gameplay functionality. To withdraw
              consent, please email{' '}
              <a href='mailto:samantha@digipalz.com'>samantha@digipalz.com</a>{' '}
              to opt out.
            </p>
          </div>
        </div>

        <div className='consent-modal__footer'>
          <button className='cancel-button' onClick={handleClose}>
            Cancel
          </button>
          <button
            className='confirm-button'
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Confirm Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConsentModal
