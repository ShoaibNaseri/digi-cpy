import { useState, useEffect, useRef } from 'react'
import './PhoneCall.css'
import dialing from '@/assets/game/game_sounds/dialing.mp3'
import { characterImages } from '@/utils/gameImagesRegistry'

const PhoneCall = ({ data, onComplete }) => {
  const [callState, setCallState] = useState('idle') // idle, dialing, calling
  const [callTimer, setCallTimer] = useState(0)
  const [currentNarrationIndex, setCurrentNarrationIndex] = useState(0)
  const [typedNumber, setTypedNumber] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [showCallButton, setShowCallButton] = useState(false)
  const [allNarrationsPlayed, setAllNarrationsPlayed] = useState(false)
  const audioRef = useRef(null)
  const dialingAudioRef = useRef(null)
  const timerRef = useRef(null)
  const typingTimerRef = useRef(null)

  const {
    phoneNumber,
    callerName,
    callingTo,
    callingToImage,
    callerImage,
    callNarrations
  } = data

  // Fallback values to prevent undefined issues
  const safePhoneNumber = phoneNumber || '000-000-0000'
  const safeCallingTo = callingTo || 'Unknown'
  const safeCallNarrations = callNarrations || []

  // Auto-type phone number on component mount
  useEffect(() => {
    if (callState === 'idle') {
      startTyping()
    }
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
    }
  }, [callState])

  const startTyping = () => {
    setTypedNumber('')
    setIsTyping(true)
    setShowCallButton(false)

    // Add safety check for phoneNumber
    if (!safePhoneNumber) {
      setIsTyping(false)
      return
    }

    let currentIndex = 0

    const typeNextDigit = () => {
      if (currentIndex < safePhoneNumber.length) {
        const currentChar = safePhoneNumber[currentIndex]

        // Play dialing sound for each character (including dashes)
        if (dialingAudioRef.current) {
          dialingAudioRef.current.currentTime = 0
          dialingAudioRef.current.play().catch(console.error)
        }

        setTypedNumber((prev) => prev + currentChar)
        currentIndex++

        typingTimerRef.current = setTimeout(typeNextDigit, 400) // Type every 400ms
      } else {
        // Typing complete - stop audio
        if (dialingAudioRef.current) {
          dialingAudioRef.current.pause()
          dialingAudioRef.current.currentTime = 0
        }

        setIsTyping(false)
        setTimeout(() => {
          setShowCallButton(true)
        }, 500)
      }
    }

    // Start typing after a brief delay
    typingTimerRef.current = setTimeout(typeNextDigit, 800)
  }

  // Format phone number for display with typed digits
  const formatPhoneNumber = (number) => {
    return number.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
  }

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`
  }

  // Handle call button click
  const handleCall = () => {
    if (isTyping || !showCallButton) return

    setCallState('dialing')
    setAllNarrationsPlayed(false) // Reset narration state

    // After 2 seconds, start the call
    setTimeout(() => {
      setCallState('calling')
      startCallTimer()
      playNarrations()
    }, 2000)
  }

  // Start call timer
  const startCallTimer = () => {
    timerRef.current = setInterval(() => {
      setCallTimer((prev) => prev + 1)
    }, 1000)
  }

  // Play narrations sequentially
  const playNarrations = () => {
    if (safeCallNarrations && safeCallNarrations.length > 0) {
      setCurrentNarrationIndex(0) // Start from index 0
      playNarrationAtIndex(0) // Play first narration
    } else {
      // No narrations to play, enable end call button immediately
      setAllNarrationsPlayed(true)
    }
  }

  const playNarrationAtIndex = (index) => {
    if (index < safeCallNarrations.length) {
      const audioPath = safeCallNarrations[index]
      setCurrentNarrationIndex(index)
      if (audioRef.current) {
        audioRef.current.src = `/assets/${audioPath}`
        audioRef.current.play().catch(console.error)
      }
    }
  }

  // Handle narration end
  const handleNarrationEnd = () => {
    const nextIndex = currentNarrationIndex + 1

    if (nextIndex < safeCallNarrations.length) {
      // More narrations to play
      setTimeout(() => {
        playNarrationAtIndex(nextIndex)
      }, 500) // Small pause between narrations
    } else {
      // All narrations completed - just enable the end call button
      setAllNarrationsPlayed(true)
      // Do NOT call endCall() automatically - wait for user to click
    }
  }

  // End call
  const endCall = () => {
    setCallState('idle')
    setCallTimer(0)
    setCurrentNarrationIndex(0)
    setAllNarrationsPlayed(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    if (onComplete) {
      onComplete()
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  return (
    <div className='phone-call-container'>
      <div className='phone-device'>
        <div className='mute-switch'></div>
        <div className='lock-button'></div>

        <div className='phone-screen'>
          {callState === 'idle' && (
            <div className='dialing-screen'>
              <div className='phone-number-display'>
                <span className='calling-to-label'></span>
                <h2
                  style={{ visibility: isTyping ? 'hidden' : 'visible' }}
                  className='contact-name'
                >
                  {safeCallingTo}
                </h2>
                <p className='phone-number'>
                  {typedNumber}
                  {isTyping && <span className='typing-cursor'>|</span>}
                </p>
              </div>

              <div className='dialing-pad'>
                <div className='number-grid'>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map(
                    (num, index) => (
                      <button key={index} className='number-button' disabled>
                        {num}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className='call-actions'>
                {showCallButton && (
                  <button
                    className={`call-button ${
                      showCallButton ? 'call-button-glow' : ''
                    }`}
                    onClick={handleCall}
                    disabled={isTyping || !showCallButton}
                  >
                    <span className='call-icon'>📞</span>
                  </button>
                )}
                {!showCallButton && (
                  <button className='call-button call-button-disabled' disabled>
                    <span className='call-icon'>📞</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {callState === 'dialing' && (
            <div className='calling-screen'>
              <div className='contact-info'>
                <div className='contact-avatar'>
                  <img
                    src={characterImages[callingToImage]}
                    alt={safeCallingTo}
                  />
                </div>
                <h2 className='contact-name'>{safeCallingTo}</h2>
                <p className='call-status'>Calling...</p>
                <div className='dialing-animation'>
                  <div className='pulse-ring'></div>
                  <div className='pulse-ring'></div>
                  <div className='pulse-ring'></div>
                </div>
              </div>
            </div>
          )}

          {callState === 'calling' && (
            <div className='in-call-screen'>
              <div className='contact-info'>
                <div className='contact-avatar'>
                  <img
                    src={characterImages[callingToImage]}
                    alt={safeCallingTo}
                  />
                </div>
                <h2 className='contact-name'>{safeCallingTo}</h2>
                <p className='call-timer'>{formatTime(callTimer)}</p>
                <div className='call-indicator'>
                  <div className='sound-waves'>
                    <div className='wave'></div>
                    <div className='wave'></div>
                    <div className='wave'></div>
                    <div className='wave'></div>
                  </div>
                </div>
              </div>

              <div className='call-controls'>
                <button
                  className={`end-call-button ${
                    !allNarrationsPlayed ? 'end-call-disabled' : ''
                  }`}
                  onClick={endCall}
                  disabled={!allNarrationsPlayed}
                >
                  <span className='end-call-icon'>📞</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className='phone-home-button'></div>
      </div>

      <audio ref={audioRef} onEnded={handleNarrationEnd} preload='metadata' />
      <audio ref={dialingAudioRef} src={dialing} preload='metadata' />
    </div>
  )
}

export default PhoneCall
