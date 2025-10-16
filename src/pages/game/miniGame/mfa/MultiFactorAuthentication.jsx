import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './multiFactorAuthentication.css'
import notificationSound from '@/assets/game/game_sounds/notification.wav'
import { AiFillMessage } from 'react-icons/ai'
import { TbPasswordMobilePhone } from 'react-icons/tb'
import { RiVerifiedBadgeFill } from 'react-icons/ri'
import Loader from '@/components/common/Loader/Loader'
import useAssetLoader from '@/hooks/useAssetLoader'

const MultiFactorAuthentication = ({ onComplete }) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showNotification, setShowNotification] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [inputCode, setInputCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [hasVoicePlayed, setHasVoicePlayed] = useState(false)
  const audioRef = useRef(null)
  const inputRefs = useRef([])
  const voiceAudioRef = useRef(null)
  const voiceTimerRef = useRef(null)

  const voiceLocation = 'game/missions/mission_3/narrations/Luna_1383.mp3'

  // Assets to preload
  const assets = [notificationSound]
  const { isLoading: assetsLoading, error: assetsError } =
    useAssetLoader(assets)

  // Clear voice timer
  const clearVoiceTimer = () => {
    if (voiceTimerRef.current) {
      clearTimeout(voiceTimerRef.current)
      voiceTimerRef.current = null
    }
  }

  // Play voice narration
  const playVoiceNarration = () => {
    if (!hasVoicePlayed && voiceAudioRef.current) {
      voiceAudioRef.current.play().catch((error) => {
        console.log('Voice narration playback failed:', error)
      })
      setHasVoicePlayed(true)
    }
  }

  // Generate random 6-digit code
  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Generate code and show notification after 1 second
  useEffect(() => {
    const code = generateCode()
    setGeneratedCode(code)
    const notificationTimer = setTimeout(() => {
      setShowNotification(true)

      // Start 5-second timer for voice narration
      voiceTimerRef.current = setTimeout(() => {
        playVoiceNarration()
      }, 10000)
    }, 1000)
    return () => {
      clearTimeout(notificationTimer)
      clearVoiceTimer()
    }
  }, [])

  // Play notification sound when notification appears
  useEffect(() => {
    if (showNotification && audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.log('Audio playback failed:', error)
      })
    }
  }, [showNotification])

  // Clear timer when component unmounts or completes
  useEffect(() => {
    return () => {
      clearVoiceTimer()
    }
  }, [])

  // Conditional rendering based on asset loading status
  if (assetsLoading) {
    return <Loader message='Loading game assets...' />
  }

  if (assetsError) {
    return (
      <div className='error-message'>Error loading assets: {assetsError}</div>
    )
  }

  // Format time display
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Format date display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  // Handle input change
  const handleInputChange = (index, value) => {
    if (value.length > 1) return // Prevent multiple characters

    // Clear voice timer when user starts entering code
    clearVoiceTimer()

    const newInputCode = [...inputCode]
    newInputCode[index] = value
    setInputCode(newInputCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !inputCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6)
    const newInputCode = [...inputCode]

    for (let i = 0; i < pastedData.length; i++) {
      newInputCode[i] = pastedData[i]
    }

    setInputCode(newInputCode)

    // Focus the next empty input or the last one
    const nextEmptyIndex = newInputCode.findIndex((digit) => digit === '')
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex
    inputRefs.current[focusIndex]?.focus()
  }

  // Check if all digits are entered
  const isFormComplete = inputCode.every((digit) => digit !== '')

  // Handle submit
  const handleSubmit = async () => {
    if (!isFormComplete) return

    const enteredCode = inputCode.join('')

    if (enteredCode === generatedCode) {
      setIsLoading(true)

      // Show loading for 3 seconds
      setTimeout(() => {
        setIsLoading(false)
        setIsComplete(true)

        // Call onComplete after a short delay
        // setTimeout(() => {
        //   if (onComplete) {
        //     onComplete()
        //   }
        // }, 500)
      }, 3000)
    } else {
      // Wrong code - shake animation
      const inputs = inputRefs.current
      inputs.forEach((input) => {
        if (input) {
          input.style.animation = 'shake 0.5s ease-in-out'
          setTimeout(() => {
            input.style.animation = ''
          }, 500)
        }
      })

      // Clear the form
      setInputCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        duration: 0.8
      }
    }
  }

  const notificationVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20,
        duration: 0.6
      }
    }
  }

  const formVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        duration: 0.8,
        delay: 0.3
      }
    }
  }

  const inputVariants = {
    focus: {
      scale: 1.1,
      boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.3)',
      transition: { duration: 0.2 }
    }
  }

  const buttonVariants = {
    enabled: {
      scale: 1,
      backgroundColor: '#6366f1',
      transition: { duration: 0.2 }
    },
    disabled: {
      scale: 1,
      backgroundColor: '#9ca3af',
      transition: { duration: 0.2 }
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  }

  return (
    <div className='mfa-container'>
      {/* Hidden audio element for notification sound */}
      <audio ref={audioRef} src={notificationSound} preload='auto' />

      {/* Hidden audio element for voice narration */}
      <audio
        ref={voiceAudioRef}
        src={`/assets/${voiceLocation}`}
        preload='auto'
      />

      <div className='mfa-game-content-container'>
        {/* Left Side - Phone */}
        <div className='mfa-game-content-left'>
          <motion.div
            className='mfa-phone-device'
            variants={containerVariants}
            initial='hidden'
            animate='visible'
          >
            <div className='mfa-phone-mute-switch'></div>
            <div className='mfa-phone-lock-button'></div>

            <div className='mfa-phone-screen'>
              <motion.div
                className='mfa-phone-home-screen'
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                {/* Main Content */}
                <div className='mfa-phone-main-content'>
                  <motion.div
                    className='mfa-phone-date-time-display'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h1 className='mfa-phone-time-display'>
                      {formatTime(currentTime)}
                    </h1>
                    <p className='mfa-phone-date-display'>
                      {formatDate(currentTime)}
                    </p>
                  </motion.div>

                  {/* Notification */}
                  <AnimatePresence>
                    {showNotification && (
                      <motion.div
                        className='mfa-phone-notification'
                        variants={notificationVariants}
                        initial='hidden'
                        animate='visible'
                      >
                        <div className='mfa-phone-notification-header'>
                          <div className='mfa-phone-notification-icon'>
                            <AiFillMessage size={18} color='#2056eb' />
                          </div>
                          <div className='mfa-phone-notification-app'>
                            <span className='mfa-phone-notification-app-name'>
                              Digipalz
                            </span>
                            <span className='mfa-phone-notification-time'>
                              now
                            </span>
                          </div>
                        </div>
                        <div className='mfa-phone-notification-content'>
                          <div className='mfa-phone-notification-title'>
                            Verification Code
                          </div>
                          <div className='mfa-phone-notification-message'>
                            Your 6-digit verification code is:
                          </div>
                          <div className='mfa-phone-notification-code'>
                            <span className='mfa-phone-notification-code-digit'>
                              {generatedCode[0]}
                            </span>
                            <span className='mfa-phone-notification-code-digit'>
                              {generatedCode[1]}
                            </span>
                            <span className='mfa-phone-notification-code-digit'>
                              {generatedCode[2]}
                            </span>
                            <span className='mfa-phone-notification-code-digit'>
                              {generatedCode[3]}
                            </span>
                            <span className='mfa-phone-notification-code-digit'>
                              {generatedCode[4]}
                            </span>
                            <span className='mfa-phone-notification-code-digit'>
                              {generatedCode[5]}
                            </span>
                          </div>
                          <div className='mfa-phone-notification-footer'>
                            <span className='mfa-phone-notification-expiry'>
                              Expires in 10 Minutes
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Form */}
        <div className='mfa-game-content-right'>
          {!isComplete ? (
            <motion.div
              className='mfa-form-container'
              variants={formVariants}
              initial='hidden'
              animate='visible'
            >
              <div className='mfa-form-header'>
                <motion.div
                  className='mfa-form-icon'
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.5,
                    type: 'spring',
                    stiffness: 200
                  }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                      damping: 10,
                      duration: 0.8
                    }}
                  >
                    <TbPasswordMobilePhone size={70} />
                  </motion.div>
                </motion.div>
                <h2 className='mfa-form-title'>Enter Your Verification Code</h2>
                <p className='mfa-form-subtitle'>
                  Check your phone for the 6-digit code
                </p>
              </div>

              <div className='mfa-form-body'>
                <div className='mfa-code-inputs-container'>
                  {inputCode.map((digit, index) => (
                    <motion.input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type='text'
                      inputMode='numeric'
                      maxLength='1'
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className='mfa-code-input'
                      variants={inputVariants}
                      whileFocus='focus'
                      autoComplete='off'
                      autoCorrect='off'
                      autoCapitalize='off'
                      spellCheck='false'
                    />
                  ))}
                </div>

                <motion.button
                  className={`mfa-submit-button ${
                    isFormComplete ? 'enabled' : 'disabled'
                  }`}
                  onClick={handleSubmit}
                  disabled={!isFormComplete || isLoading}
                  variants={buttonVariants}
                  animate={isFormComplete ? 'enabled' : 'disabled'}
                  whileHover={isFormComplete ? 'hover' : {}}
                  whileTap={isFormComplete ? 'tap' : {}}
                >
                  {isLoading ? (
                    <span className='mfa-spinner'></span>
                  ) : (
                    'Verify Code'
                  )}
                </motion.button>

                {/* Removed the old isLoading text, as it's now part of the Loader component */}
                {/* {isLoading && (
                  <motion.p
                    className='mfa-loading-text'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Verifying your code...
                  </motion.p>
                )} */}
              </div>
            </motion.div>
          ) : (
            <motion.div
              className='mfa-form-container'
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 15,
                duration: 0.8,
                delay: 0.2
              }}
            >
              <div className='mfa-form-header'>
                <motion.div
                  className='mfa-form-icon'
                  transition={{
                    delay: 0.5,
                    type: 'spring',
                    stiffness: 200
                  }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                      damping: 10,
                      duration: 0.8
                    }}
                  >
                    <RiVerifiedBadgeFill size={70} />
                  </motion.div>
                </motion.div>
                <h2 className='mfa-form-title'>
                  Dear User, Welcome to Digipalz!
                </h2>
                <p className='mfa-form-subtitle'>
                  Your account has been verified successfully.
                </p>
              </div>
              <motion.button
                className='mfa-continue-button'
                onClick={onComplete}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Continue
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MultiFactorAuthentication
