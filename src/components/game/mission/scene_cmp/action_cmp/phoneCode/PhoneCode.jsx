import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './PhoneCode.css'

import notificationSound from '@/assets/game/game_sounds/notification.wav'

const PhoneCode = ({ onComplete }) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showNotification, setShowNotification] = useState(false)
  const [showCloseButton, setShowCloseButton] = useState(false)
  const audioRef = useRef(null)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Show notification after 4 seconds
  useEffect(() => {
    const notificationTimer = setTimeout(() => {
      setShowNotification(true)
    }, 1000)

    return () => clearTimeout(notificationTimer)
  }, [])

  // Play notification sound when notification appears
  useEffect(() => {
    if (showNotification && audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.log('Audio playback failed:', error)
      })
    }
  }, [showNotification])

  // Show close button after notification appears
  useEffect(() => {
    if (showNotification) {
      const closeButtonTimer = setTimeout(() => {
        setShowCloseButton(true)
      }, 1000)
      return () => clearTimeout(closeButtonTimer)
    }
  }, [showNotification])

  const handleClose = () => {
    if (onComplete) {
      onComplete()
    } else {
      console.log('onComplete is not defined')
    }
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

  // Animation variants
  const containerVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50
    },
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

  const screenVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.3
      }
    }
  }

  const notificationVariants = {
    hidden: {
      opacity: 0,
      y: -50,
      scale: 0.8
    },
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

  const buttonVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20
      }
    },
    tap: { scale: 0.95 },
    hover: { scale: 1.05 }
  }

  return (
    <div className='phone-code-container'>
      {/* Hidden audio element for notification sound */}
      <audio ref={audioRef} src={notificationSound} preload='auto' />

      <motion.div
        className='phone-code-device'
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        <div className='phone-code-mute-switch'></div>
        <div className='phone-code-lock-button'></div>

        <div className='phone-code-screen'>
          <motion.div
            className='phone-code-home-screen'
            variants={screenVariants}
            initial='initial'
            animate='animate'
          >
            {/* Main Content */}
            <div className='phone-code-main-content'>
              <motion.div
                className='phone-code-date-time-display'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className='phone-code-time-display'>
                  {formatTime(currentTime)}
                </h1>
                <p className='phone-code-date-display'>
                  {formatDate(currentTime)}
                </p>
              </motion.div>

              {/* Notification */}
              <AnimatePresence>
                {showNotification && (
                  <motion.div
                    className='phone-code-notification'
                    variants={notificationVariants}
                    initial='hidden'
                    animate='visible'
                  >
                    <div className='phone-code-notification-content'>
                      <p className='phone-code-notification-message'>
                        Use code <strong>12345</strong> to verify your login
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Close Button */}
            <AnimatePresence>
              {showCloseButton && (
                <motion.div
                  className='phone-code-close-button-container'
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.button
                    className='phone-code-close-button'
                    onClick={handleClose}
                    variants={buttonVariants}
                    initial='initial'
                    animate='animate'
                    whileTap='tap'
                    whileHover='hover'
                  >
                    <span className='phone-code-close-icon'>✕</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className='phone-code-home-button'></div>
      </motion.div>
    </div>
  )
}

export default PhoneCode
