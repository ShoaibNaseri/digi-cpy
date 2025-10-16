import { useState, useEffect, useRef } from 'react'
import { getActionImage } from '@/utils/gameImagesRegistry'
import { motion, AnimatePresence } from 'framer-motion'
import { Howl } from 'howler'
import ActionPreloader from '@/components/common/ActionPreloader'
import './ImageSoundAction.css'

const ImageSoundAction = ({ data, onComplete }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showNextButton, setShowNextButton] = useState(false)
  const [sound, setSound] = useState(null)
  const [assetsLoaded, setAssetsLoaded] = useState(false)

  const audioRef = useRef(null)

  // Prepare action data for preloader
  const getActionData = () => {
    // Handle both data structures: full action object or direct action_data
    const actionData = data?.action_data || data
    const images = actionData?.images

    if (!images || images.length === 0) return []

    return images.map((img) => {
      // Handle voiceover path for preloader
      let soundUrl = img.voiceover
      if (soundUrl && !soundUrl.startsWith('/')) {
        if (soundUrl.startsWith('game/')) {
          soundUrl = `/assets/${soundUrl}`
        } else {
          soundUrl = `/assets/game/game_sounds/${soundUrl}`
        }
      }

      return {
        image_url: getActionImage(img.image) || img.image,
        has_sound: !!img.voiceover,
        sound_url: soundUrl
      }
    })
  }

  // Handle asset loading completion
  const handleAssetsLoaded = () => {
    setIsLoading(false)
    setAssetsLoaded(true)

    // Handle both data structures: full action object or direct action_data
    const actionData = data?.action_data || data
    const images = actionData?.images

    // Start playing voiceover if available
    if (images?.[currentIndex]?.voiceover) {
      playVoiceover()
    } else {
      // If no voiceover, show next button immediately
      setShowNextButton(true)
    }
  }

  // Handle asset loading error
  const handleLoadError = (error) => {
    console.error('Failed to load action assets:', error)
    setIsLoading(false)
    setAssetsLoaded(true)
    setShowNextButton(true)
  }

  // Initialize and play voiceover
  const playVoiceover = () => {
    // Handle both data structures: full action object or direct action_data
    const actionData = data?.action_data || data
    const images = actionData?.images
    const currentImage = images?.[currentIndex]

    if (!currentImage?.voiceover) return

    // Stop any currently playing sound
    if (sound) {
      sound.stop()
      sound.unload()
    }

    // Create new sound instance
    // Handle voiceover paths - they should be relative to public/assets
    let voiceoverPath = currentImage.voiceover

    // If it's already a full path starting with /, use as is
    if (voiceoverPath.startsWith('/')) {
      voiceoverPath = voiceoverPath
    }
    // If it starts with 'game/', it's already in the correct format for public/assets
    else if (voiceoverPath.startsWith('game/')) {
      voiceoverPath = `/assets/${voiceoverPath}`
    }
    // Otherwise, assume it's a filename in the game_sounds folder
    else {
      voiceoverPath = `/assets/game/game_sounds/${voiceoverPath}`
    }

    const newSound = new Howl({
      src: [voiceoverPath],
      volume: actionData?.volume || 1,
      onplay: () => {
        setIsPlaying(true)
        setShowNextButton(false)
      },
      onend: () => {
        setIsPlaying(false)
        setShowNextButton(true)
      },
      onloaderror: (id, error) => {
        console.error('Failed to load voiceover:', error)
        setIsPlaying(false)
        setShowNextButton(true)
      }
    })

    setSound(newSound)
    newSound.play()

    return () => {
      newSound.unload()
    }
  }

  // Handle next button click
  const handleNext = () => {
    if (sound) {
      sound.stop()
      sound.unload()
    }

    // Handle both data structures: full action object or direct action_data
    const actionData = data?.action_data || data
    const images = actionData?.images

    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowNextButton(false)
      setIsLoading(true)
      setAssetsLoaded(false)
    } else {
      // All images shown, complete the action
      if (onComplete) {
        onComplete()
      }
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.stop()
        sound.unload()
      }
    }
  }, [sound])

  // Animation variants for image appearance
  const imageVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      rotateY: -15
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20,
        duration: 0.8
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      rotateY: 15,
      transition: {
        duration: 0.4,
        ease: 'easeInOut'
      }
    }
  }

  const nextButtonVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
        duration: 0.5
      }
    }
  }

  // Show preloader while loading
  if (isLoading) {
    return (
      <ActionPreloader
        actionData={getActionData()}
        onComplete={handleAssetsLoaded}
        onError={handleLoadError}
      />
    )
  }

  // Check if we have valid data
  // Handle both data structures: full action object or direct action_data
  const actionData = data?.action_data || data
  const images = actionData?.images

  if (!images || images.length === 0) {
    return <div>No images to display</div>
  }

  const currentImage = images[currentIndex]

  return (
    <div className='image-sound-action'>
      <div className='image-sound-container'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentIndex}
            className='image-wrapper'
            variants={imageVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
          >
            <img
              className='action-image'
              src={getActionImage(currentImage.image)}
            />
          </motion.div>{' '}
        </AnimatePresence>

        {/* Voiceover indicator */}

        {/* Next button */}
        <AnimatePresence>
          <motion.button
            className='next-button'
            onClick={showNextButton ? handleNext : null}
            variants={nextButtonVariants}
            initial='hidden'
            animate={showNextButton ? 'visible' : 'hidden'}
            exit='hidden'
            whileHover={{
              scale: 1.05,
              boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            {currentIndex < images.length - 1
              ? actionData?.buttonText || 'Next'
              : 'Complete'}
          </motion.button>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ImageSoundAction
