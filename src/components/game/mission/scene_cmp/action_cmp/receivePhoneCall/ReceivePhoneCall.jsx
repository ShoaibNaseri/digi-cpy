import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './ReceivePhoneCall.css'
import { characterImages } from '@/utils/gameImagesRegistry'

const ReceivePhoneCall = ({ data, onComplete }) => {
  const [callState, setCallState] = useState('incoming') // incoming, answered, ended
  const [callTimer, setCallTimer] = useState(0)
  const [currentNarrationIndex, setCurrentNarrationIndex] = useState(0)
  const [allNarrationsPlayed, setAllNarrationsPlayed] = useState(false)
  const audioRef = useRef(null)
  const timerRef = useRef(null)

  const { callerName, callerImage, callNarrations } = data

  // Fallback values to prevent undefined issues
  const safeCallerName = callerName || 'Unknown Caller'
  const safeCallNarrations = callNarrations || []

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

  const pulseVariants = {
    initial: { scale: 0.3, opacity: 0 },
    animate: {
      scale: [0.3, 1, 0.3],
      opacity: [0, 1, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }

  const avatarVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 150,
        damping: 20,
        delay: 0.3
      }
    }
  }

  const waveVariants = {
    animate: {
      scaleY: [1, 1.5, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`
  }

  // Handle answer button click
  const handleAnswer = () => {
    setCallState('answered')
    setAllNarrationsPlayed(false)
    startCallTimer()
    playNarrations()
  }

  // Handle decline button click
  const handleDecline = () => {
    setCallState('ended')
    onComplete()
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
      setCurrentNarrationIndex(0)
      playNarrationAtIndex(0)
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
      // All narrations completed - enable the end call button
      setAllNarrationsPlayed(true)
    }
  }

  // End call
  const endCall = () => {
    setCallState('ended')
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
    <div className='receive-phone-call-container'>
      <motion.div
        className='phone-device'
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        <div className='mute-switch'></div>
        <div className='lock-button'></div>

        <div className='phone-screen'>
          <AnimatePresence mode='wait'>
            {callState === 'incoming' && (
              <motion.div
                key='incoming'
                className='incoming-call-screen'
                variants={screenVariants}
                initial='initial'
                animate='animate'
                exit='exit'
              >
                <div className='incoming-call-info'>
                  <motion.p
                    className='incoming-label'
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    Incoming call
                  </motion.p>
                  <motion.div
                    className='caller-avatar'
                    variants={avatarVariants}
                    initial='initial'
                    animate='animate'
                  >
                    <img
                      src={characterImages[callerImage]}
                      alt={safeCallerName}
                    />
                  </motion.div>
                  <motion.h2
                    className='caller-name'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    {safeCallerName}
                  </motion.h2>
                  <div className='incoming-animation'>
                    {[0, 1, 2].map((index) => (
                      <motion.div
                        key={index}
                        className='pulse-ring'
                        variants={pulseVariants}
                        initial='initial'
                        animate='animate'
                        style={{ animationDelay: `${index * 0.7}s` }}
                      />
                    ))}
                  </div>
                </div>

                <motion.div
                  className='incoming-call-actions'
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <motion.button
                    className='answer-button answer-button-glow'
                    onClick={handleAnswer}
                    variants={buttonVariants}
                    initial='initial'
                    animate='animate'
                    whileTap='tap'
                    whileHover='hover'
                  >
                    <span className='answer-icon'>📞</span>
                  </motion.button>
                  <motion.button
                    className='decline-button decline-button-disabled'
                    onClick={handleDecline}
                    disabled={true}
                    variants={buttonVariants}
                    initial='initial'
                    animate='animate'
                    style={{ opacity: 0.5 }}
                  >
                    <span className='decline-icon'>📞</span>
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {callState === 'answered' && (
              <motion.div
                key='answered'
                className='answered-call-screen'
                variants={screenVariants}
                initial='initial'
                animate='animate'
                exit='exit'
              >
                <div className='answered-call-info'>
                  <motion.div
                    className='caller-avatar'
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <img
                      src={characterImages[callerImage]}
                      alt={safeCallerName}
                    />
                  </motion.div>
                  <motion.h2
                    className='caller-name'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {safeCallerName}
                  </motion.h2>
                  <motion.p
                    className='call-timer'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {formatTime(callTimer)}
                  </motion.p>
                  <motion.div
                    className='call-indicator'
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className='sound-waves'>
                      {[0, 1, 2, 3].map((index) => (
                        <motion.div
                          key={index}
                          className='wave'
                          variants={waveVariants}
                          animate='animate'
                          style={{ animationDelay: `${index * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  className='answered-call-controls'
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.button
                    className={`hangup-button ${
                      !allNarrationsPlayed ? 'hangup-disabled' : ''
                    }`}
                    onClick={endCall}
                    disabled={!allNarrationsPlayed}
                    variants={buttonVariants}
                    initial='initial'
                    animate='animate'
                    whileTap='tap'
                    whileHover={allNarrationsPlayed ? 'hover' : {}}
                  >
                    <span className='hangup-icon'>📞</span>
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className='phone-home-button'></div>
      </motion.div>

      <audio ref={audioRef} onEnded={handleNarrationEnd} preload='metadata' />
    </div>
  )
}

export default ReceivePhoneCall
