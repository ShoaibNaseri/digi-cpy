import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ipAddressScrapImg from '@/assets/game/missions/mission_2/action_imgs/ip_address_scrap/ip_address_scrap.png'
import writingSound from '@/assets/game/game_sounds/writing.mp3'
import './IpAddressScrap.css'

const IpAddressScrap = ({ onComplete }) => {
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const [soundFinished, setSoundFinished] = useState(false)
  const [showImage, setShowImage] = useState(false)
  const [isHovered, setIsHovered] = useState(true)

  useEffect(() => {
    const loadAssets = async () => {
      const promises = [
        // Preload image
        new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = resolve
          img.onerror = reject
          img.src = ipAddressScrapImg
        }),
        // Preload audio
        new Promise((resolve, reject) => {
          const audio = new Audio()
          audio.oncanplaythrough = resolve
          audio.onerror = reject
          audio.src = writingSound
        })
      ]

      try {
        await Promise.all(promises)
        setAssetsLoaded(true)
      } catch (error) {
        console.error('Error loading assets:', error)
        setAssetsLoaded(true) // Continue even if assets fail to load
      }
    }

    loadAssets()
  }, [])

  useEffect(() => {
    if (!assetsLoaded) return

    const audio = new Audio(writingSound)
    audio.volume = 0.6

    const playSound = async () => {
      try {
        await audio.play()

        // Stop sound after 5 seconds and show image
        setTimeout(() => {
          audio.pause()
          audio.currentTime = 0
          setSoundFinished(true)

          // Small delay before showing image for smooth transition
          setTimeout(() => {
            setShowImage(true)
          }, 200)
        }, 5000)
      } catch (error) {
        console.error('Error playing sound:', error)
        // If sound fails, still show image after 5 seconds
        setTimeout(() => {
          setSoundFinished(true)
          setTimeout(() => setShowImage(true), 200)
        }, 5000)
      }
    }

    playSound()

    return () => {
      audio.pause()
      audio.currentTime = 0
    }
  }, [assetsLoaded])

  if (!assetsLoaded) {
    return (
      <div className='ip-address-scrap-container'>
        <div className='loading-indicator'>Loading...</div>
      </div>
    )
  }

  return (
    <div className='ip-address-scrap-container'>
      {showImage && (
        <motion.div
          className='ip-address-img-wrapper'
          initial={{
            scale: 0.3,
            opacity: 0,
            y: 100,
            rotateY: -90
          }}
          animate={{
            scale: 1,
            opacity: 1,
            y: 0,
            rotateY: 0
          }}
          transition={{
            duration: 1.2,
            ease: 'easeOut',
            type: 'spring',
            stiffness: 80,
            damping: 15
          }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(true)}
        >
          <motion.img
            src={ipAddressScrapImg}
            alt='ip address scrap'
            className='ip-address-img'
            initial={{ filter: 'blur(10px)' }}
            animate={{ filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.3 }
            }}
          />

          <AnimatePresence>
            {isHovered && (
              <motion.div
                className='close-icon-container'
                initial={{ opacity: 1, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 1, scale: 0.5 }}
                transition={{ duration: 0.2 }}
                onClick={onComplete}
              >
                <motion.div
                  className='close-icon'
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

export default IpAddressScrap
