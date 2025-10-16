import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GamePreloader from '@/components/common/GamePreloader'
import snappyIcon from '@/assets/game/missions/mission_2/action_imgs/snappy_pals/snappyPals_Icon.png'
import snappyProfileCard from '@/assets/game/missions/mission_2/action_imgs/snappy_pals/snappyPals_profileCard.png'
import './SnappyPal.css'

const SnappyPal = ({ onComplete }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  // Preload assets
  useEffect(() => {
    const preloadAssets = async () => {
      try {
        const imagePromises = [
          new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = resolve
            img.onerror = reject
            img.src = snappyIcon
          }),
          new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = resolve
            img.onerror = reject
            img.src = snappyProfileCard
          })
        ]

        await Promise.all(imagePromises)
        setAssetsLoaded(true)

        // Add a small delay for smooth transition
        setTimeout(() => {
          setIsLoading(false)
        }, 500)
      } catch (error) {
        console.error('Error preloading SnappyPal assets:', error)
        setIsLoading(false)
      }
    }

    preloadAssets()
  }, [])

  const handleIconClick = () => {
    setShowProfile(true)
  }

  const handleComplete = () => {
    if (onComplete) {
      onComplete()
    }
  }

  if (isLoading || !assetsLoaded) {
    return <GamePreloader content='Loading Action...' isLoading={true} />
  }

  // Kid-friendly animation variants
  const iconVariants = {
    initial: {
      scale: 0,
      rotate: -180,
      opacity: 0
    },
    animate: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15,
        duration: 0.8
      }
    },
    hover: {
      scale: 1.1,
      rotate: [0, -10, 10, -10, 0],
      transition: {
        rotate: {
          repeat: Infinity,
          duration: 2,
          ease: 'easeInOut'
        },
        scale: {
          duration: 0.3
        }
      }
    },
    tap: {
      scale: 0.95,
      rotate: 360,
      transition: { duration: 0.6, ease: 'easeInOut' }
    }
  }

  const profileVariants = {
    initial: {
      scale: 0,
      y: 100,
      opacity: 0,
      rotateY: -90
    },
    animate: {
      scale: 1,
      y: 0,
      opacity: 1,
      rotateY: 0,
      transition: {
        type: 'spring',
        stiffness: 150,
        damping: 20,
        delay: 0.2
      }
    },
    exit: {
      scale: 0,
      y: -100,
      opacity: 0,
      rotateY: 90,
      transition: {
        duration: 0.5,
        ease: 'easeInOut'
      }
    }
  }

  const closeButtonVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay: 0.5
      }
    },
    hover: {
      scale: 1.2,
      rotate: 90,
      backgroundColor: '#ff6b6b',
      transition: { duration: 0.3 }
    },
    tap: {
      scale: 0.8,
      rotate: 180
    }
  }

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  }

  return (
    <motion.div
      className='snappy-pal-container'
      variants={containerVariants}
      initial='initial'
      animate='animate'
    >
      <div className='snappy-content'>
        {/* SnappyPals Icon - Always visible */}
        <motion.div
          className='snappy-icon'
          variants={iconVariants}
          initial='initial'
          animate='animate'
          whileHover='hover'
          whileTap='tap'
          onClick={handleIconClick}
          style={{ cursor: 'pointer' }}
        >
          <img src={snappyIcon} alt='SnappyPals Icon' />
          <motion.div
            className='glow-effect'
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.1, 1]
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: 'easeInOut'
            }}
          />
        </motion.div>

        {/* Profile Card - Shows after icon click */}
        <AnimatePresence>
          {showProfile && (
            <motion.div
              className='profile-card-wrapper'
              variants={profileVariants}
              initial='initial'
              animate='animate'
              exit='exit'
            >
              <motion.img
                src={snappyProfileCard}
                alt='SnappyPals Profile Card'
                className='profile-card-image'
                whileHover={{
                  scale: 1.02,
                  rotateY: [0, 5, -5, 0],
                  transition: {
                    rotateY: { duration: 1.5, ease: 'easeInOut' },
                    scale: { duration: 0.3 }
                  }
                }}
              />
              <motion.button
                className='close-button always-visible'
                variants={closeButtonVariants}
                initial='initial'
                animate='animate'
                whileHover='hover'
                whileTap='tap'
                onClick={handleComplete}
                aria-label='Close SnappyPals'
              >
                ×
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fun floating elements for extra kid-friendly atmosphere */}
        {showProfile && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className='floating-star'
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: Math.random() * 200 - 100,
                  y: Math.random() * 200 - 100
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  y: [0, -50, -100],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              />
            ))}
          </>
        )}
      </div>
    </motion.div>
  )
}

export default SnappyPal
