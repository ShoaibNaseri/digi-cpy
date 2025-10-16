import React, { useState, useEffect, useRef } from 'react'
import { Howl } from 'howler'
import { motion, AnimatePresence } from 'framer-motion'
import './BookPage.css'
import ActionLoadingIndicator from '@/components/common/ActionLoadingIndicator'

// Import all page images statically
import page1 from '@/assets/game/action_imgs/page1.png'
import page2 from '@/assets/game/action_imgs/page2.png'
import page3 from '@/assets/game/action_imgs/page3.png'
import page4 from '@/assets/game/action_imgs/page4.png'
import page5 from '@/assets/game/action_imgs/page5.png'
import page6 from '@/assets/game/action_imgs/page6.png'
import page7 from '@/assets/game/action_imgs/page7.png'
import page8 from '@/assets/game/action_imgs/page8.png'
import page9 from '@/assets/game/action_imgs/page9.png'
import page10 from '@/assets/game/action_imgs/page10.png'

// Import next page sound
import nextPage from '@/assets/game/game_sounds/next.mp3'

// Import all sound files statically
import Astra_1836 from '@/assets/game/action_narrations/Astra_1836.mp3'
import Astra_1837 from '@/assets/game/action_narrations/Astra_1837.mp3'
import Astra_1838 from '@/assets/game/action_narrations/Astra_1838.mp3'
import Astra_1839 from '@/assets/game/action_narrations/Astra_1839.mp3'
import Astra_1840 from '@/assets/game/action_narrations/Astra_1840.mp3'
import Astra_1841 from '@/assets/game/action_narrations/Astra_1841.mp3'
import Astra_1842 from '@/assets/game/action_narrations/Astra_1842.mp3'
import Astra_1843 from '@/assets/game/action_narrations/Astra_1843.mp3'
import Robotoro_1722 from '@/assets/game/action_narrations/Robotoro_1722.mp3'
import Robotoro_1723 from '@/assets/game/action_narrations/Robotoro_1723.mp3'
import Robotoro_1724 from '@/assets/game/action_narrations/Robotoro_1724.mp3'
import Milo_1864 from '@/assets/game/action_narrations/Milo_1864.mp3'
import Milo_1865 from '@/assets/game/action_narrations/Milo_1865.mp3'
import Milo_1866 from '@/assets/game/action_narrations/Milo_1866.mp3'

const BookPage = ({ data, onComplete }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showNextButton, setShowNextButton] = useState(false)
  const [isPlayingSound, setIsPlayingSound] = useState(false)
  const [pages, setPages] = useState([])
  const [sounds, setSounds] = useState({})
  const [currentSoundIndex, setCurrentSoundIndex] = useState(0)
  const [assetsLoaded, setAssetsLoaded] = useState(false)

  const audioRefs = useRef({})
  const imageRefs = useRef({})
  const soundQueueRef = useRef([])
  const currentSoundIndexRef = useRef(0)
  const isPlayingRef = useRef(false)
  const nextPageSoundRef = useRef(null)
  const soundStartTimeoutRef = useRef(null)

  // Asset mapping
  const imageMap = {
    'page1.png': page1,
    'page2.png': page2,
    'page3.png': page3,
    'page4.png': page4,
    'page5.png': page5,
    'page6.png': page6,
    'page7.png': page7,
    'page8.png': page8,
    'page9.png': page9,
    'page10.png': page10
  }

  const soundMap = {
    'Astra_1836.mp3': Astra_1836,
    'Astra_1837.mp3': Astra_1837,
    'Astra_1838.mp3': Astra_1838,
    'Astra_1839.mp3': Astra_1839,
    'Astra_1840.mp3': Astra_1840,
    'Astra_1841.mp3': Astra_1841,
    'Astra_1842.mp3': Astra_1842,
    'Astra_1843.mp3': Astra_1843,
    'Robotoro_1722.mp3': Robotoro_1722,
    'Robotoro_1723.mp3': Robotoro_1723,
    'Robotoro_1724.mp3': Robotoro_1724,
    'Milo_1864.mp3': Milo_1864,
    'Milo_1865.mp3': Milo_1865,
    'Milo_1866.mp3': Milo_1866
  }

  // Initialize next page sound
  useEffect(() => {
    nextPageSoundRef.current = new Howl({
      src: [nextPage],
      volume: 0.6
    })
  }, [])

  // Function to play sounds sequentially
  const playSoundQueue = (soundFiles) => {
    if (!soundFiles || soundFiles.length === 0) {
      setIsPlayingSound(false)
      setShowNextButton(true)
      return
    }

    // Stop any currently playing sounds
    Object.values(sounds).forEach((sound) => {
      if (sound && sound.playing()) {
        sound.stop()
      }
    })

    soundQueueRef.current = soundFiles
    currentSoundIndexRef.current = 0
    setCurrentSoundIndex(0)
    setIsPlayingSound(true)
    isPlayingRef.current = false
    playNextSound()
  }

  // Function to play the next sound in the queue
  const playNextSound = () => {
    // Check if we're already playing a sound
    if (isPlayingRef.current) {
      return
    }

    // Check if we've finished all sounds
    if (currentSoundIndexRef.current >= soundQueueRef.current.length) {
      setIsPlayingSound(false)
      setShowNextButton(true)
      return
    }

    const currentSoundFile = soundQueueRef.current[currentSoundIndexRef.current]
    const sound = sounds[currentSoundFile]

    if (sound) {
      isPlayingRef.current = true

      // Set up the onend callback for this sound
      sound.off('end') // Remove any existing callbacks
      sound.once('end', () => {
        isPlayingRef.current = false
        currentSoundIndexRef.current += 1
        setCurrentSoundIndex(currentSoundIndexRef.current)

        // Small delay before playing next sound
        setTimeout(() => {
          playNextSound()
        }, 200)
      })

      sound.play()
    } else {
      // If sound not found, move to next
      currentSoundIndexRef.current += 1
      setCurrentSoundIndex(currentSoundIndexRef.current)
      setTimeout(() => playNextSound(), 100)
    }
  }

  // Load all assets first
  useEffect(() => {
    const loadAllAssets = async () => {
      try {
        const loadedPages = []
        const loadedSounds = {}

        // Process each page
        for (let i = 0; i < data.pages.length; i++) {
          const page = data.pages[i]
          const imageSrc = imageMap[page.image_url]

          if (!imageSrc) {
            console.warn(`Image not found: ${page.image_url}`)
            continue
          }

          loadedPages.push({
            ...page,
            imageSrc: imageSrc
          })

          // Load sounds for this page if they exist
          if (page.hasSound && page.sounds) {
            for (const soundFile of page.sounds) {
              const soundSrc = soundMap[soundFile]
              if (soundSrc && !loadedSounds[soundFile]) {
                loadedSounds[soundFile] = new Howl({
                  src: [soundSrc],
                  volume: 0.8
                })
              }
            }
          }
        }

        setPages(loadedPages)
        setSounds(loadedSounds)
        setAssetsLoaded(true)
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading assets:', error)
        setIsLoading(false)
      }
    }

    if (data && data.pages) {
      loadAllAssets()
    }
  }, [data])

  // Handle page navigation
  const handleNextPage = () => {
    // Clear any existing sound start timeout
    if (soundStartTimeoutRef.current) {
      clearTimeout(soundStartTimeoutRef.current)
    }

    // Play next page sound effect
    if (nextPageSoundRef.current) {
      nextPageSoundRef.current.play()
    }

    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1)
      setShowNextButton(false)

      // Check if next page has sound
      const nextPage = pages[currentPageIndex + 1]
      if (nextPage.hasSound && nextPage.sounds) {
        // Start sound after 1 second delay
        soundStartTimeoutRef.current = setTimeout(() => {
          playSoundQueue(nextPage.sounds)
        }, 1000)
      } else {
        // No sound, show next button immediately
        setShowNextButton(true)
      }
    }
  }

  // Handle continue (last page)
  const handleContinue = () => {
    // Clear any existing sound start timeout
    if (soundStartTimeoutRef.current) {
      clearTimeout(soundStartTimeoutRef.current)
    }

    onComplete()
  }

  // Handle first page load
  useEffect(() => {
    if (assetsLoaded && pages.length > 0) {
      const firstPage = pages[0]
      if (firstPage.hasSound && firstPage.sounds) {
        // Start sound after 1 second delay
        soundStartTimeoutRef.current = setTimeout(() => {
          playSoundQueue(firstPage.sounds)
        }, 1000)
      } else {
        // No sound, show next button immediately
        setShowNextButton(true)
      }
    }
  }, [assetsLoaded, pages, sounds])

  // Cleanup sounds and timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(sounds).forEach((sound) => {
        if (sound && sound.stop) {
          sound.stop()
        }
      })
      if (nextPageSoundRef.current) {
        nextPageSoundRef.current.stop()
      }
      if (soundStartTimeoutRef.current) {
        clearTimeout(soundStartTimeoutRef.current)
      }
    }
  }, [sounds])

  if (isLoading) {
    return (
      <div className='book-page-action-container'>
        <ActionLoadingIndicator message='Loading game assets...' />
      </div>
    )
  }

  if (!pages.length) {
    return <div className='book-page-error'>No pages found</div>
  }

  const currentPage = pages[currentPageIndex]
  const isLastPage = currentPageIndex === pages.length - 1

  return (
    <div className='book-page-container'>
      <div className='book-page-content'>
        <motion.div
          key={currentPageIndex}
          className='book-page-image-container'
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{
            duration: 0.4,
            ease: 'easeInOut'
          }}
        >
          <img
            src={currentPage.imageSrc}
            alt={`Page ${currentPageIndex + 1}`}
            className='book-page-image'
            ref={(el) => (imageRefs.current[currentPageIndex] = el)}
          />
        </motion.div>
      </div>

      <div className='book-page-navigation'>
        {showNextButton && !isPlayingSound && (
          <motion.button
            className={`book-page-navigation-button ${
              isLastPage ? 'book-page-continue-button' : 'book-page-next-button'
            }`}
            onClick={isLastPage ? handleContinue : handleNextPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLastPage ? 'Continue' : 'Next'}
          </motion.button>
        )}
      </div>
    </div>
  )
}

export default BookPage
