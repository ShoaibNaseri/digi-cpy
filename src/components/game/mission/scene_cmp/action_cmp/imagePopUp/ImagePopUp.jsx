import { useState, useEffect, useRef } from 'react'
import { getActionImage } from '@/utils/gameImagesRegistry'
import { motion, AnimatePresence } from 'framer-motion'
import { Howl } from 'howler'
import ActionPreloader from '@/components/common/ActionPreloader'
import './ImagePopUp.css'

const ImagePopUp = ({ data, onComplete }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissing, setIsDismissing] = useState(false)
  const [sound, setSound] = useState(null)
  const imageRef = useRef(null)
  const shouldPlayOnAppear = useRef(false)

  // Handle asset loading completion
  const handleAssetsLoaded = () => {
    setIsLoading(false)
    // Start the appearance animation
    setTimeout(() => setIsVisible(true), 100)

    // Mark that we should play sound on appearance if configured
    if (data.has_sound && data.sound_play === 'onAppear') {
      shouldPlayOnAppear.current = true
      // If sound is already loaded, play it now
      if (sound) {
        playSound()
      }
    }
  }

  // Handle asset loading error
  const handleLoadError = (error) => {
    console.error('Failed to load action assets:', error)
    setIsLoading(false)
    setIsVisible(true) // Show anyway
  }

  // Initialize sound if needed
  useEffect(() => {
    if (data.has_sound && data.sound_url) {
      const soundPath = data.sound_url.startsWith('/')
        ? data.sound_url
        : `/assets/game/game_sounds/${data.sound_url}`

      const howlSound = new Howl({
        src: [soundPath],
        volume: data.sound_volume || 1,
        onload: () => {
          // If we should play on appear and the component is already visible, play now
          if (shouldPlayOnAppear.current && !isLoading) {
            howlSound.play()
          }
        },
        onloaderror: (id, error) => {
          console.error('Failed to load sound:', error)
        }
      })

      setSound(howlSound)

      return () => {
        howlSound.unload()
      }
    }
  }, [data, isLoading])

  // Play sound function
  const playSound = () => {
    if (sound) {
      sound.play()

      // Auto-complete after sound duration if specified
      if (data.sound_duration) {
        setTimeout(() => {
          if (onComplete) onComplete()
        }, data.sound_duration)
      }
    }
  }

  // Handle dismiss with effect
  const handleDismiss = () => {
    if (data.has_dismiss_effect && data.dismiss_effect_type) {
      setIsDismissing(true)

      // Wait for dismiss animation to complete before calling onComplete
      const dismissDuration = getDismissAnimationDuration(
        data.dismiss_effect_type
      )
      setTimeout(() => {
        if (onComplete) onComplete()
      }, dismissDuration)
    } else {
      // No dismiss effect, complete immediately
      if (onComplete) onComplete()
    }
  }

  // Get dismiss animation duration based on effect type
  const getDismissAnimationDuration = (effectType) => {
    switch (effectType) {
      case 'sparkle':
        return 800
      case 'fadeOut':
        return 500
      case 'zoomOut':
        return 600
      case 'slideOut':
        return 700
      default:
        return 500
    }
  }

  // Handle image click
  const handleImageClick = () => {
    if (data.has_sound && data.sound_play === 'onClick') {
      playSound()
    } else {
      handleDismiss()
    }
  }

  // Get animation variants based on animation type
  const getAnimationVariants = () => {
    const baseVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    }

    switch (data.animation) {
      case 'fadeIn':
        return {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { duration: 0.6, ease: 'easeOut' }
          }
        }
      case 'slideUp':
        return {
          hidden: { opacity: 0, y: 50 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: 'easeOut' }
          }
        }
      case 'slideDown':
        return {
          hidden: { opacity: 0, y: -50 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: 'easeOut' }
          }
        }
      case 'zoomIn':
        return {
          hidden: { opacity: 0, scale: 0.3 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: {
              duration: 0.6,
              ease: 'easeOut',
              scale: {
                type: 'spring',
                damping: 20,
                stiffness: 300
              }
            }
          }
        }
      case 'bounceIn':
        return {
          hidden: { opacity: 0, scale: 0.3 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: {
              type: 'spring',
              damping: 12,
              stiffness: 200,
              duration: 0.8
            }
          }
        }
      default:
        return baseVariants
    }
  }

  // Get dismiss animation variants
  const getDismissVariants = () => {
    if (!data.has_dismiss_effect || !data.dismiss_effect_type) {
      return { exit: { opacity: 0 } }
    }

    switch (data.dismiss_effect_type) {
      case 'sparkle':
        return {
          exit: {
            opacity: 0,
            scale: [1, 1.2, 0.8, 0],
            rotate: [0, 15, -15, 0],
            filter: [
              'brightness(1)',
              'brightness(1.5)',
              'brightness(0.5)',
              'brightness(0)'
            ],
            transition: {
              duration: 0.8,
              ease: 'easeInOut',
              times: [0, 0.3, 0.7, 1]
            }
          }
        }
      case 'fadeOut':
        return {
          exit: {
            opacity: 0,
            transition: { duration: 0.5, ease: 'easeOut' }
          }
        }
      case 'zoomOut':
        return {
          exit: {
            opacity: 0,
            scale: 0,
            transition: { duration: 0.6, ease: 'easeIn' }
          }
        }
      case 'slideOut':
        return {
          exit: {
            opacity: 0,
            y: 100,
            transition: { duration: 0.7, ease: 'easeIn' }
          }
        }
      default:
        return { exit: { opacity: 0 } }
    }
  }

  // Get the image from the registry or fallback to original path
  const actionImage = getActionImage(data.image_url)
  const imagePath =
    actionImage || data.image_url.startsWith('/')
      ? data.image_url
      : `/src/assets/game/action_imgs/${data.image_url}`

  if (isLoading) {
    return (
      <ActionPreloader
        actionData={{ ...data, image_url: imagePath }}
        onComplete={handleAssetsLoaded}
        onError={handleLoadError}
      />
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        className='popup-image-container'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className='popup-image-overlay'
          onClick={handleDismiss}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.img
            ref={imageRef}
            src={actionImage}
            alt='Action Image'
            className='popup-image'
            variants={getAnimationVariants()}
            initial='hidden'
            animate={isVisible && !isDismissing ? 'visible' : 'hidden'}
            exit={getDismissVariants().exit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation()
              handleImageClick()
            }}
          />

          {/* Sparkle effect overlay */}
          {data.has_dismiss_effect &&
            data.dismiss_effect_type === 'sparkle' &&
            isDismissing && (
              <div className='popup-image-sparkle-overlay'>
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className='popup-image-sparkle'
                    initial={{
                      opacity: 0,
                      scale: 0,
                      x: 0,
                      y: 0
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: Math.cos((i * 30 * Math.PI) / 180) * 100,
                      y: Math.sin((i * 30 * Math.PI) / 180) * 100
                    }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.05,
                      ease: 'easeOut'
                    }}
                  />
                ))}
              </div>
            )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ImagePopUp
