import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GamePreloader from '@/components/common/GamePreloader'
import snappyDeclan from '@/assets/game/missions/mission_2/action_imgs/snappy_pals/snappyPals_declan.png'
import snappyMap from '@/assets/game/missions/mission_2/action_imgs/snappy_pals/snappyPals_map.png'
import './SnappyPalMap.css'

const SnappyPalMap = ({ onComplete }) => {
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [showDeclan, setShowDeclan] = useState(false)

  // Assets to preload
  const assets = [snappyMap, snappyDeclan]

  useEffect(() => {
    // Preload all assets
    const preloadAssets = async () => {
      try {
        const imagePromises = assets.map((src) => {
          return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = resolve
            img.onerror = reject
            img.src = src
          })
        })

        await Promise.all(imagePromises)
        setAssetsLoaded(true)

        // After assets are loaded, show map animation
        setTimeout(() => {
          setMapLoaded(true)

          // Show Declan animation after map loads
          setTimeout(() => {
            setShowDeclan(true)
          }, 800)
        }, 500)
      } catch (error) {
        console.error('Error preloading assets:', error)
        // Still proceed even if some assets fail to load
        setAssetsLoaded(true)
        setMapLoaded(true)
      }
    }

    preloadAssets()
  }, [])

  const handleComplete = () => {
    if (onComplete) {
      onComplete()
    }
  }

  // Animation variants
  const mapVariants = {
    initial: { scale: 0, opacity: 0, rotateY: -90 },
    animate: {
      scale: 1,
      opacity: 1,
      rotateY: 0,
      transition: {
        type: 'spring',
        stiffness: 150,
        damping: 20,
        duration: 1
      }
    }
  }

  const declanVariants = {
    initial: {
      scale: 0,
      opacity: 0,
      x: '0%', // Start from center
      y: '0%' // Start from center
    },
    animate: {
      scale: 1,
      opacity: 1,
      x: 'calc(180% - 70px)', // Move to Blue Mountain position (10px left from original)
      y: '-170%', // Move to Blue Mountain position (up)
      transition: {
        type: 'spring',
        stiffness: 120,
        damping: 15,
        duration: 2
      }
    }
  }

  // Show preloader while assets are loading
  if (!assetsLoaded) {
    return <GamePreloader loadingText='Loading Map...' />
  }

  return (
    <div className='snappy-map-container'>
      <motion.div
        className='map-wrapper'
        variants={mapVariants}
        initial='initial'
        animate={mapLoaded ? 'animate' : 'initial'}
      >
        {/* Map Image Background */}
        <div className='map-image-container'>
          <img src={snappyMap} alt='Blue Mountain Map' className='map-image' />

          {/* Blue Mountain Indicator (Red Pin) */}
          {/* <div className='blue-mountain-indicator'>
            <div className='location-pin'>
              <div className='pin-circle'></div>
              <div className='pin-stem'></div>
            </div>
          </div> */}

          {/* Snappy Declan Animation */}
          <AnimatePresence>
            {showDeclan && (
              <motion.div
                className='declan-container'
                variants={declanVariants}
                initial='initial'
                animate='animate'
                whileHover={{
                  scale: 1.15,
                  transition: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                    duration: 0.4
                  }
                }}
                onClick={handleComplete}
              >
                <div className='character-pin'>
                  <img
                    src={snappyDeclan}
                    alt='Snappy Declan'
                    className='declan-icon'
                  />
                </div>

                {/* Hover Tooltip */}
                <div className='declan-tooltip'>Declan's Location</div>

                <motion.div
                  className='declan-glow'
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.7, 0.4]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.5,
                    ease: 'easeInOut'
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sparkle effects when Declan appears */}
          {showDeclan && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className='map-sparkle'
                  initial={{
                    opacity: 0,
                    scale: 0,
                    x: `${50 + Math.random() * 20}%`,
                    y: `${40 + Math.random() * 20}%`
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    rotate: [0, 180, 360],
                    y: [0, -20, -40]
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 0.3 + 1.5, // Start after Declan reaches destination
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                />
              ))}
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default SnappyPalMap
