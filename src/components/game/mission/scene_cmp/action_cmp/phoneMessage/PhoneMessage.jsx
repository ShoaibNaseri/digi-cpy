import { useState, useEffect, useRef } from 'react'
import './PhoneMessage.css'
import notificationSound from '@/assets/game/game_sounds/notification.wav'
import { characterImages } from '@/utils/gameImagesRegistry'

const PhoneMessage = ({ data, onComplete }) => {
  const [showMessage, setShowMessage] = useState(false)
  const [messageAnimating, setMessageAnimating] = useState(false)
  const audioRef = useRef(null)

  const { callerName, callerImage, message, animation = 'fadeIn' } = data

  // Fallback values to prevent undefined issues
  const safeCallerName = callerName || 'Unknown'
  const safeMessage = message || 'No message'

  // Get current time and date
  const getCurrentTime = () => {
    const now = new Date()
    return now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getCurrentDate = () => {
    const now = new Date()
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
  }

  useEffect(() => {
    // Show message after a brief delay
    const showTimer = setTimeout(() => {
      setShowMessage(true)
      setMessageAnimating(true)

      // Play notification sound
      if (audioRef.current) {
        audioRef.current.play().catch(console.error)
      }
    }, 500)

    return () => clearTimeout(showTimer)
  }, [])

  const handleDismiss = () => {
    setMessageAnimating(false)
    setTimeout(() => {
      if (onComplete) {
        onComplete()
      }
    }, 300)
  }

  return (
    <div className='phone-message-container'>
      <div className='phone-device'>
        <div className='mute-switch'></div>
        <div className='lock-button'></div>

        <div className='phone-screen'>
          <div className='message-screen'>
            {/* Lock Screen Background with Gradient */}
            <div className='lock-screen-bg'>
              <div className='status-bar'>
                <span className='carrier'>Digipalz</span>
                <div className='status-icons'>
                  <span>📶</span>
                  <span>📶</span>
                  <span>🔋</span>
                </div>
              </div>

              <div className='lock-screen-content'>
                <div className='time-date-container'>
                  <h1 className='lock-time'>{getCurrentTime()}</h1>
                  <p className='lock-date'>{getCurrentDate()}</p>
                </div>

                {/* Notification Area */}
                <div className='notification-area'>
                  {showMessage && (
                    <div
                      className={`message-notification ${
                        messageAnimating ? animation : 'fadeOut'
                      }`}
                    >
                      <div className='message-header'>
                        <div className='message-avatar'>
                          <img
                            src={characterImages[callerImage]}
                            alt={safeCallerName}
                          />
                        </div>
                        <div className='message-info'>
                          <h3 className='sender-name'>{safeCallerName}</h3>
                          <p className='message-time'>now</p>
                        </div>
                      </div>

                      <div className='message-content-1'>
                        <p className='message-text'>{safeMessage}</p>
                      </div>

                      <div className='message-actions'>
                        <button
                          className='dismiss-button'
                          onClick={handleDismiss}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='phone-home-button'></div>
      </div>

      <audio ref={audioRef} src={notificationSound} preload='metadata' />
    </div>
  )
}

export default PhoneMessage
