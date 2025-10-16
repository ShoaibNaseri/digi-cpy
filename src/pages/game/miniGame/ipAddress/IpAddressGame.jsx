import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Howl } from 'howler'
import { motion, AnimatePresence } from 'framer-motion'
import './IpAddressGame.css'

// collectable items
import routerImg from '@/assets/game/mini_game/ip_address_game/img/9.png'
import mobileImg from '@/assets/game/mini_game/ip_address_game/img/10.png'
import router2Img from '@/assets/game/mini_game/ip_address_game/img/11.png'
import tabletImg from '@/assets/game/mini_game/ip_address_game/img/12.png'
import appleWatchImg from '@/assets/game/mini_game/ip_address_game/img/13.png'
import wifiGooglesImg from '@/assets/game/mini_game/ip_address_game/img/14.png'
import electronicGoolgeImg from '@/assets/game/mini_game/ip_address_game/img/15.png'
import pspGameingPhoneImg from '@/assets/game/mini_game/ip_address_game/img/16.png'
import laptopImg from '@/assets/game/mini_game/ip_address_game/img/17.png'
import applevisionProImg from '@/assets/game/mini_game/ip_address_game/img/18.png'

//none collectable items
import fakeMobileImg from '@/assets/game/mini_game/ip_address_game/img/23.png'
import toasterImg from '@/assets/game/mini_game/ip_address_game/img/24.png'
import playStatinPad from '@/assets/game/mini_game/ip_address_game/img/25.png'
import ballImg from '@/assets/game/mini_game/ip_address_game/img/26.png'
import bagImg from '@/assets/game/mini_game/ip_address_game/img/27.png'
import trophyImg from '@/assets/game/mini_game/ip_address_game/img/28.png'
import fishImg from '@/assets/game/mini_game/ip_address_game/img/29.png'
import lobsterImg from '@/assets/game/mini_game/ip_address_game/img/30.png'
import starfishImg from '@/assets/game/mini_game/ip_address_game/img/31.png'
import mouseImg from '@/assets/game/mini_game/ip_address_game/img/32.png'
import hairdryerImg from '@/assets/game/mini_game/ip_address_game/img/33.png'
import alarmClockImg from '@/assets/game/mini_game/ip_address_game/img/34.png'

import failSound from '@/assets/game/game_sounds/fail.wav'
import successCatch from '@/assets/game/game_sounds/success.mp3'

import bgImg from '@/assets/game/mini_game/ip_address_game/ip_game_bg.webp'
import titleImage from '@/assets/game/mini_game/ip_address_game/title_image.png'
import titleHowToPlay from '@/assets/game/mini_game/ip_address_game/how_to_play.png'
import backgroundMusic from '@/assets/game/bg_musics/ip_address_music.mp3'

const IpAddressGame = ({ onComplete }) => {
  const [gameState, setGameState] = useState('loading') // loading, intro, instructions, playing, gameOver
  const [titleAnimationPhase, setTitleAnimationPhase] = useState('fadeIn') // fadeIn, movingToTop, atTop
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [basketPosition, setBasketPosition] = useState(50)
  const [fallingItems, setFallingItems] = useState([])
  const [fallingSpeed, setFallingSpeed] = useState(0.5) // Reduced from 0.5
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const [scoreAnimations, setScoreAnimations] = useState([])
  const [collectableCount, setCollectableCount] = useState({})
  const [collectedItems, setCollectedItems] = useState(new Set())

  const gameAreaRef = useRef(null)
  const intervalRef = useRef(null)
  const gameBackgroundMusic = useRef(null)
  const successSound = useRef(null)
  const failSoundRef = useRef(null)
  const previousBackgroundMusic = useRef(null)

  const collectableItems = [
    { img: routerImg, name: 'router', width: 8 },
    { img: mobileImg, name: 'mobile', width: 6 },
    { img: router2Img, name: 'router2', width: 8 },
    { img: tabletImg, name: 'tablet', width: 10 },
    { img: appleWatchImg, name: 'appleWatch', width: 5 },
    { img: wifiGooglesImg, name: 'wifiGoogles', width: 7 },
    { img: electronicGoolgeImg, name: 'electronicGoogle', width: 9 },
    { img: pspGameingPhoneImg, name: 'pspGaming', width: 8 },
    { img: laptopImg, name: 'laptop', width: 12 },
    { img: applevisionProImg, name: 'applevisionPro', width: 11 }
  ]

  const nonCollectableItems = [
    { img: fakeMobileImg, name: 'fakeMobile', width: 6 },
    { img: toasterImg, name: 'toaster', width: 8 },
    { img: playStatinPad, name: 'playStation', width: 10 },
    { img: ballImg, name: 'ball', width: 5 },
    { img: bagImg, name: 'bag', width: 7 },
    { img: trophyImg, name: 'trophy', width: 6 },
    { img: fishImg, name: 'fish', width: 8 },
    { img: lobsterImg, name: 'lobster', width: 9 },
    { img: starfishImg, name: 'starfish', width: 6 },
    { img: mouseImg, name: 'mouse', width: 4 },
    { img: hairdryerImg, name: 'hairdryer', width: 8 },
    { img: alarmClockImg, name: 'alarmClock', width: 7 }
  ]

  const preloadAssets = useCallback(() => {
    const allImages = [
      ...collectableItems.map((item) => item.img),
      ...nonCollectableItems.map((item) => item.img),
      bgImg,
      titleImage,
      titleHowToPlay
    ]

    let loadedCount = 0
    const totalAssets = allImages.length + 3 // +3 for audio files

    const checkComplete = () => {
      loadedCount++
      if (loadedCount >= totalAssets) {
        setAssetsLoaded(true)
        setTimeout(() => setGameState('intro'), 500)
      }
    }

    // Preload images
    allImages.forEach((src) => {
      const img = new Image()
      img.onload = checkComplete
      img.onerror = checkComplete
      img.src = src
    })

    // Setup audio
    gameBackgroundMusic.current = new Howl({
      src: [backgroundMusic],
      loop: true,
      volume: 0.5,
      onload: checkComplete
    })

    successSound.current = new Howl({
      src: [successCatch],
      volume: 0.7,
      onload: checkComplete
    })

    failSoundRef.current = new Howl({
      src: [failSound],
      volume: 0.7,
      onload: checkComplete
    })
  }, [])

  useEffect(() => {
    preloadAssets()

    // Stop any existing background music and store reference
    if (
      window.currentBackgroundMusic &&
      window.currentBackgroundMusic.playing()
    ) {
      previousBackgroundMusic.current = window.currentBackgroundMusic
      window.currentBackgroundMusic.pause()
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (gameBackgroundMusic.current) gameBackgroundMusic.current.stop()

      // Resume previous background music
      if (previousBackgroundMusic.current) {
        previousBackgroundMusic.current.play()
      }
    }
  }, [preloadAssets])

  // Handle automatic title animation and transition to instructions
  useEffect(() => {
    if (gameState === 'intro') {
      // After fade in, wait 2 seconds then start moving to top
      const fadeInTimer = setTimeout(() => {
        setTitleAnimationPhase('movingToTop')
      }, 2000)

      // After moving to top (2s animation), show instructions
      const instructionsTimer = setTimeout(() => {
        setTitleAnimationPhase('atTop')
        setGameState('instructions')
      }, 4500)

      return () => {
        clearTimeout(fadeInTimer)
        clearTimeout(instructionsTimer)
      }
    }
  }, [gameState])

  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setTimeLeft(60)
    setFallingItems([])
    setFallingSpeed(0.3) // Start with slower speed
    setCollectableCount({})
    setScoreAnimations([])
    setCollectedItems(new Set())

    gameBackgroundMusic.current?.play()

    // Game timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Item spawning - spawn items every 3 seconds (increased from 1.5)
    const spawner = setInterval(() => {
      createFallingItem()
    }, 3000)

    intervalRef.current = { timer, spawner }
  }

  const endGame = () => {
    setGameState('gameOver')
    if (intervalRef.current) {
      clearInterval(intervalRef.current.timer)
      clearInterval(intervalRef.current.spawner)
    }
    gameBackgroundMusic.current?.stop()

    // Resume previous background music
    if (previousBackgroundMusic.current) {
      previousBackgroundMusic.current.play()
    }
  }

  const createFallingItem = () => {
    // Limit to maximum 2 items falling at once
    if (fallingItems.length >= 2) {
      return
    }

    const isCollectable = Math.random() > 0.4
    const availableItems = isCollectable
      ? collectableItems.filter((item) => !collectedItems.has(item.name))
      : nonCollectableItems.filter((item) => !collectedItems.has(item.name))

    if (availableItems.length === 0) {
      console.log('No available items to spawn')
      return
    }

    const item =
      availableItems[Math.floor(Math.random() * availableItems.length)]

    const newItem = {
      id: Date.now() + Math.random(),
      ...item,
      isCollectable,
      x: Math.random() * 65 + 17.5,
      y: -20,
      speed: fallingSpeed + Math.random() * 0.2 // Reduced speed variation
    }

    setFallingItems((prev) => {
      const updated = [...prev, newItem]

      return updated
    })
  }

  const updateGameObjects = useCallback(() => {
    setFallingItems((prev) => {
      const updated = prev
        .map((item) => ({ ...item, y: item.y + item.speed }))
        .filter((item) => item.y < 100)

      return updated
    })
  }, [])

  useEffect(() => {
    if (gameState === 'playing') {
      const gameLoop = setInterval(updateGameObjects, 40)
      return () => clearInterval(gameLoop)
    }
  }, [gameState, updateGameObjects])

  const handleKeyPress = useCallback(
    (e) => {
      if (gameState !== 'playing') return

      if (e.key === 'ArrowLeft') {
        setBasketPosition((prev) => Math.max(8, prev - 8))
      } else if (e.key === 'ArrowRight') {
        setBasketPosition((prev) => Math.min(92, prev + 8))
      }
    },
    [gameState]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  const checkCollisions = useCallback(() => {
    setFallingItems((prev) => {
      const remaining = []

      prev.forEach((item) => {
        // Calculate item boundaries
        const itemLeft = item.x
        const itemRight = item.x + item.width
        const itemTop = item.y
        const itemBottom = item.y + item.width // Assuming square items for height

        // Calculate basket boundaries - make it more generous
        const basketLeft = basketPosition - 8 // Increased from 6 to 8
        const basketRight = basketPosition + 8 // Increased from 6 to 8
        const basketTop = 88
        const basketBottom = 92

        // Check if item touches the basket (any overlap)
        const horizontalOverlap =
          itemRight >= basketLeft && itemLeft <= basketRight
        const verticalOverlap =
          itemBottom >= basketTop && itemTop <= basketBottom

        if (horizontalOverlap && verticalOverlap) {
          // Collision detected - item touches the basket
          const points = item.isCollectable ? 60 : -60

          setScore((current) => current + points)
          setScoreAnimations((anims) => [
            ...anims,
            {
              id: Date.now(),
              points,
              x: basketPosition,
              y: 80
            }
          ])

          if (item.isCollectable) {
            successSound.current?.play()
            setCollectedItems((prev) => new Set([...prev, item.name]))
            setFallingSpeed((speed) => Math.min(speed + 0.02, 0.8)) // Reduced speed increase
          } else {
            failSoundRef.current?.play()
          }
        } else {
          remaining.push(item)
        }
      })

      return remaining
    })
  }, [basketPosition])

  useEffect(() => {
    if (gameState === 'playing') {
      const collisionCheck = setInterval(checkCollisions, 40)
      return () => clearInterval(collisionCheck)
    }
  }, [gameState, checkCollisions])

  useEffect(() => {
    const timer = setTimeout(() => {
      setScoreAnimations((prev) => prev.slice(1))
    }, 2000)
    return () => clearTimeout(timer)
  }, [scoreAnimations])

  const playAgain = () => {
    // Directly restart the game without going through intro/instructions
    setGameState('playing')
    setScore(0)
    setTimeLeft(60)
    setFallingItems([])
    setFallingSpeed(0.3) // Reset to slower speed
    setCollectableCount({})
    setScoreAnimations([])
    setBasketPosition(50)
    setCollectedItems(new Set())

    gameBackgroundMusic.current?.play()

    // Game timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Item spawning - spawn items every 3 seconds
    const spawner = setInterval(() => {
      createFallingItem()
    }, 3000)

    intervalRef.current = { timer, spawner }
  }

  const continueGame = () => {
    // This would typically navigate back to the main game or level selection
    onComplete()
  }

  if (!assetsLoaded) {
    return (
      <div className='ip-address-loading-screen'>
        <div className='ip-address-loading-text'>Loading assets...</div>
      </div>
    )
  }

  return (
    <div
      className='ip-address-game-container'
      style={{ backgroundImage: `url(${bgImg})` }}
      ref={gameAreaRef}
    >
      {/* Overlay for better text visibility */}
      <div className='ip-address-game-overlay' />

      {/* Game UI */}
      {gameState === 'playing' && (
        <>
          {/* Score and Timer */}
          <div className='ip-address-game-ui'>
            <div className='ip-address-score-display'>Score: {score}</div>
            <div className='ip-address-timer-display'>Time: {timeLeft}s</div>
          </div>

          {/* Score Animations */}
          {scoreAnimations.map((anim) => (
            <div
              key={anim.id}
              className={`ip-address-score-animation ${
                anim.points > 0
                  ? 'ip-address-score-positive'
                  : 'ip-address-score-negative'
              }`}
              style={{
                left: `${anim.x}%`,
                top: `${anim.y}%`
              }}
            >
              {anim.points > 0 ? '+' : ''}
              {anim.points}
            </div>
          ))}

          {/* Falling Items */}
          {fallingItems.map((item) => (
            <img
              key={item.id}
              src={item.img}
              alt={item.name}
              className='ip-address-falling-item'
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`
              }}
            />
          ))}

          {/* Basket */}
          <div
            className='ip-address-game-basket'
            style={{
              left: `${basketPosition}%`
            }}
          >
            <div className='ip-address-basket-mesh' />
            <div className='ip-address-basket-rim' />
            <div className='ip-address-basket-handle-left' />
            <div className='ip-address-basket-handle-right' />
          </div>
        </>
      )}

      {/* Title Screen */}
      <AnimatePresence>
        {gameState === 'intro' && (
          <div className='ip-address-title-screen'>
            <motion.div
              className='ip-address-title-container'
              initial={{ opacity: 0, y: 50, scale: 1 }}
              animate={
                titleAnimationPhase === 'fadeIn'
                  ? { opacity: 1, y: 0, scale: 1 }
                  : titleAnimationPhase === 'movingToTop'
                  ? { opacity: 1, y: -250, scale: 0.6 }
                  : { opacity: 1, y: -250, scale: 0.6 }
              }
              exit={{
                opacity: 0,
                scale: 0.3,
                y: -400,
                rotateX: 90,
                filter: 'blur(10px)'
              }}
              transition={{
                duration: titleAnimationPhase === 'fadeIn' ? 1 : 2,
                ease: 'easeInOut',
                exit: { duration: 0.8, ease: 'easeInOut' }
              }}
            >
              <img
                src={titleImage}
                alt="Let's Fish Title"
                className='ip-address-game-title-image'
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <AnimatePresence>
        {gameState === 'instructions' && (
          <div className='ip-address-instructions-screen'>
            {/* Instructions content */}
            <motion.div
              className='ip-address-instructions-content'
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{
                duration: 0.8,
                ease: 'easeOut',
                delay: 0.3
              }}
            >
              <motion.img
                src={titleHowToPlay}
                alt='How to Play'
                className='ip-address-instructions-title-image'
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              />

              <div className='ip-address-instructions-list'>
                <motion.div
                  className='ip-address-instruction-item'
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  {/* <span className='ip-address-instruction-number'>1</span> */}
                  <span className='ip-address-instruction-text'>
                    To move the basket, use
                  </span>
                  <div className='ip-address-keyboard-keys'>
                    <div className='ip-address-keyboard-key'>←</div>
                    <div className='ip-address-keyboard-key'>→</div>
                  </div>
                  <span className='ip-address-instruction-text'>
                    arrow keys
                  </span>
                </motion.div>

                <motion.div
                  className='ip-address-instruction-item'
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                >
                  {/* <span className='ip-address-instruction-number'>2</span> */}
                  <span className='ip-address-instruction-text'>
                    To collect points, only catch the items that have an IP
                    Address!
                  </span>
                </motion.div>
              </div>

              <motion.button
                onClick={startGame}
                className='ip-address-start-game-button'
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ delay: 1.1, duration: 0.6 }}
              >
                Start Game
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      {gameState === 'gameOver' && (
        <div className='ip-address-game-over-screen'>
          <motion.div
            className='ip-address-game-over-modal'
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <h2 className='ip-address-game-over-title'>Game Over!</h2>
            <div className='ip-address-final-score'>{score}</div>
            <p className='ip-address-score-label'>Final Score</p>

            <div className='ip-address-game-over-buttons'>
              <motion.button
                onClick={playAgain}
                className='ip-address-play-again-button'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Play Again
              </motion.button>

              <motion.button
                onClick={continueGame}
                className='ip-address-continue-game-button'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Continue
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default IpAddressGame
