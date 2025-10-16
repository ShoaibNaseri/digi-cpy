import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import tshirt1 from '@/assets/game/missions/mission_2/action_imgs/t_shirt/tshirt1.png'
import tshirt2 from '@/assets/game/missions/mission_2/action_imgs/t_shirt/tshirt2.png'
import tshirt3 from '@/assets/game/missions/mission_2/action_imgs/t_shirt/tshirt3.png'
import price7 from '@/assets/game/missions/mission_2/action_imgs/t_shirt/price-7.png'
import price8 from '@/assets/game/missions/mission_2/action_imgs/t_shirt/price-8.png'
import price9 from '@/assets/game/missions/mission_2/action_imgs/t_shirt/price-9.png'

import pop from '@/assets/game/game_sounds/pop.wav'
import './Tshirt.css'

const Tshirt = ({ onComplete }) => {
  const [tshirts] = useState([
    { id: 1, img: tshirt1, price: price7, alt: 'T-shirt 1', position: 'left' },
    {
      id: 2,
      img: tshirt2,
      price: price8,
      alt: 'T-shirt 2',
      position: 'center'
    },
    { id: 3, img: tshirt3, price: price9, alt: 'T-shirt 3', position: 'right' }
  ])

  const [visibleTshirts, setVisibleTshirts] = useState([])
  const [clickedTshirts, setClickedTshirts] = useState(new Set())
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const popAudioRef = useRef(null)

  // Preload assets
  useEffect(() => {
    const preloadAssets = async () => {
      const imagePromises = tshirts.map((tshirt) => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = resolve
          img.onerror = reject
          img.src = tshirt.img
        })
      })

      // Add price image preloading
      const pricePromises = tshirts.map((tshirt) => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = resolve
          img.onerror = reject
          img.src = tshirt.price
        })
      })

      const audioPromise = new Promise((resolve, reject) => {
        const audio = new Audio(pop)
        audio.addEventListener('canplaythrough', resolve)
        audio.addEventListener('error', reject)
        audio.load()
      })

      try {
        await Promise.all([...imagePromises, ...pricePromises, audioPromise])
        setAssetsLoaded(true)
      } catch (error) {
        console.error('Error loading assets:', error)
        setAssetsLoaded(true)
      }
    }

    preloadAssets()
  }, [])

  // Show t-shirts with entrance animations
  useEffect(() => {
    if (!assetsLoaded) return

    // Show all t-shirts at the same time
    setVisibleTshirts([0, 1, 2])
  }, [assetsLoaded, tshirts])

  const handleTshirtClick = (tshirtIndex) => {
    if (clickedTshirts.has(tshirtIndex)) return

    // Play POP sound
    if (popAudioRef.current) {
      popAudioRef.current.currentTime = 0
      popAudioRef.current.volume = 0.8
      popAudioRef.current
        .play()
        .catch((e) => console.log('Audio play failed:', e))
    }

    // Mark t-shirt as clicked
    setClickedTshirts((prev) => new Set([...prev, tshirtIndex]))

    // Check if all t-shirts are clicked
    if (clickedTshirts.size + 1 === tshirts.length) {
      setTimeout(() => {
        onComplete?.()
      }, 2000)
    }
  }

  const getEntranceAnimation = (position) => {
    switch (position) {
      case 'left':
        return {
          initial: { x: -window.innerWidth - 200, opacity: 0, rotate: -10 },
          animate: { x: 0, opacity: 1, rotate: 0 },
          transition: {
            type: 'spring',
            stiffness: 60,
            damping: 15,
            duration: 1.5
          }
        }
      case 'center':
        return {
          initial: { scale: 0, opacity: 0 },
          animate: { scale: 1.1, opacity: 1 },
          transition: {
            type: 'spring',
            stiffness: 100,
            damping: 10,
            duration: 1.5,
            bounce: 0.4
          }
        }
      case 'right':
        return {
          initial: { x: window.innerWidth + 200, opacity: 0, rotate: 10 },
          animate: { x: 0, opacity: 1, rotate: 0 },
          transition: {
            type: 'spring',
            stiffness: 60,
            damping: 15,
            duration: 1.5
          }
        }
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 1 }
        }
    }
  }

  const getExitAnimation = (position) => {
    return {
      scale: [1, 1.1, 0],
      rotate: [0, 180, 720],
      opacity: [1, 0.8, 0],
      transition: {
        duration: 1.5,
        times: [0, 0.3, 1],
        ease: 'easeInOut',
        delay: 0.7 // Wait for price tag to disappear first
      }
    }
  }

  if (!assetsLoaded) {
    return (
      <div className='tshirt-loading'>
        <div className='loading-spinner'></div>
        <p>Loading t-shirts...</p>
      </div>
    )
  }

  return (
    <div className='tshirt-container'>
      <audio ref={popAudioRef} src={pop} preload='auto' />

      <div className='tshirts-display'>
        <AnimatePresence>
          {tshirts.map(
            (tshirt, index) =>
              visibleTshirts.includes(index) && (
                <motion.div
                  key={tshirt.id}
                  className={`tshirt-wrapper ${tshirt.position} ${
                    clickedTshirts.has(index) ? 'clicked' : ''
                  }`}
                  {...(!clickedTshirts.has(index)
                    ? getEntranceAnimation(tshirt.position)
                    : {})}
                  whileHover={
                    !clickedTshirts.has(index) && tshirt.position === 'center'
                      ? { scale: 1.25, y: -5, transition: { duration: 0.3 } }
                      : !clickedTshirts.has(index)
                      ? { scale: 1.05, y: -5, transition: { duration: 0.3 } }
                      : {}
                  }
                  onClick={() => handleTshirtClick(index)}
                >
                  {!clickedTshirts.has(index) ? (
                    <>
                      <motion.img
                        src={tshirt.img}
                        alt={tshirt.alt}
                        className='tshirt-image'
                        whileTap={{ scale: 0.95 }}
                      />
                      {/* Tshirt price tag */}
                      <motion.div
                        className='tshirt-price-tag'
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        whileHover={{
                          scale: 1.05,
                          rotate: 360,
                          x: '-50%',
                          transition: { duration: 0.6 }
                        }}
                      >
                        <img src={tshirt.price} alt={`${tshirt.alt} price`} />
                      </motion.div>
                    </>
                  ) : (
                    <div className='tshirt-exit-container'>
                      <motion.div
                        className='tshirt-exit'
                        animate={getExitAnimation(tshirt.position)}
                      >
                        <img
                          src={tshirt.img}
                          alt={tshirt.alt}
                          className='tshirt-image'
                        />
                        <div className='spark-explosion'>
                          {Array.from({ length: 16 }).map((_, i) => (
                            <div
                              key={i}
                              className={`spark-piece spark-${i + 1}`}
                            ></div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              )
          )}
        </AnimatePresence>

        {/* Render price tags separately during exit to prevent position changes */}
        {tshirts.map(
          (tshirt, index) =>
            visibleTshirts.includes(index) &&
            clickedTshirts.has(index) && (
              <motion.div
                key={`price-${tshirt.id}`}
                className={`tshirt-price-tag tshirt-price-tag-exit ${tshirt.position}`}
                animate={{
                  scale: [1, 0.8, 0],
                  opacity: [1, 0.5, 0],
                  transition: {
                    duration: 0.6,
                    times: [0, 0.5, 1],
                    ease: 'easeInOut'
                  }
                }}
              >
                <img src={tshirt.price} alt={`${tshirt.alt} price`} />
              </motion.div>
            )
        )}
      </div>
    </div>
  )
}

export default Tshirt
