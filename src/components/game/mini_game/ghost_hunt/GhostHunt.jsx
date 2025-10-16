import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGhostHunt } from './hooks/useGhostHunt'
import Ghost from './components/Ghost'
import './GhostHunt.css'
import ghostImage from './components/ghost.png'
import ghostClickSound from '@/assets/game/game_sounds/hunt.mp3'

const GhostHunt = ({ backgroundImage, onComplete }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)
  const gameAreaRef = useRef(null)
  const audioRef = useRef(null)

  // Initialize audio
  useEffect(() => {
    if (ghostClickSound) {
      audioRef.current = new Audio(ghostClickSound)
      audioRef.current.volume = 0.4 // Set volume to 70%
      audioRef.current.preload = 'auto'
    }
  }, [])

  // Preload ghost image before starting game
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImageLoaded(true)
      setIsLoading(false)
    }
    img.onerror = (e) => {
      setImageLoaded(false)
      setIsLoading(false) // Start game even if image fails
    }
    img.src = ghostImage
  }, [])

  const {
    gameState,
    score,
    timeLeft,
    ghosts,
    combo,
    isPaused,
    gameStats,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    spawnGhost,
    handleGhostClick,
    removeGhost
  } = useGhostHunt(gameAreaRef)

  // Play ghost click sound
  const playGhostClickSound = () => {
    if (audioRef.current) {
      try {
        // Reset audio to beginning and play
        audioRef.current.currentTime = 0
        audioRef.current.play().catch((error) => {
          console.log('Audio play failed:', error)
        })
      } catch (error) {
        console.log('Audio error:', error)
      }
    }
  }

  // Handle ghost click
  const onGhostClick = (id, type, points) => {
    // Play sound effect
    playGhostClickSound()

    // Handle the click logic
    handleGhostClick(id, type, points)
  }

  // Handle ghost removal
  const onGhostRemove = (id) => {
    removeGhost(id)
  }

  // Handle continue button click
  const handleContinue = () => {
    if (onComplete) {
      onComplete({
        score,
        ghostsCaught: gameStats.ghostsCaught,
        bestCombo: gameStats.bestCombo,
        timeLeft: 0
      })
    }
  }

  // Test spawn ghost function
  const testSpawnGhost = () => {
    spawnGhost()
  }

  // Add test ghost function
  const addTestGhost = () => {
    const testGhost = {
      id: `test-${Date.now()}`,
      type: 'friendly',
      x: 200,
      y: 200,
      speed: 1.2,
      direction: Math.random() * Math.PI * 2,
      points: 10,
      color: '#4CAF50',
      size: 'medium'
    }
  }

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.3, ease: 'easeIn' }
    }
  }

  // Loading screen
  if (isLoading) {
    return (
      <motion.div
        className='ghost-game-container'
        style={{ backgroundImage: `url(${backgroundImage})` }}
        variants={pageVariants}
        initial='initial'
        animate='animate'
        exit='exit'
      >
        <motion.div
          className='ghost-game-loading'
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            className='ghost-game-loading-ghost'
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            {imageLoaded ? (
              <motion.img
                src={ghostImage}
                alt='Loading Ghost'
                className='ghost-game-loading-image'
                draggable={false}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              />
            ) : (
              <motion.div
                className='ghost-game-loading-emoji'
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                👻
              </motion.div>
            )}
          </motion.div>
          <motion.div
            className='ghost-game-loading-text'
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.h2
              animate={{
                textShadow: [
                  '0 0 20px rgba(255, 255, 255, 0.8)',
                  '0 0 40px rgba(0, 150, 255, 0.6)',
                  '0 0 20px rgba(255, 255, 255, 0.8)'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              Loading Ghost Hunt...
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Preparing spooky adventures!
            </motion.p>
            <motion.div
              className='ghost-game-loading-bar'
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 2, delay: 0.8 }}
            >
              <motion.div
                className='ghost-game-loading-progress'
                animate={{ x: ['-100%', '100%'] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    )
  }

  // Start game screen
  if (gameState === 'idle') {
    return (
      <motion.div
        className='ghost-game-container'
        style={{ backgroundImage: `url(${backgroundImage})` }}
        variants={pageVariants}
        initial='initial'
        animate='animate'
        exit='exit'
      >
        <motion.div
          className='ghost-game-start-screen'
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div
            className='ghost-game-title'
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.h1
              animate={{
                textShadow: [
                  '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(0, 150, 255, 0.6), 0 0 60px rgba(100, 200, 255, 0.4)',
                  '0 0 30px rgba(255, 255, 255, 1), 0 0 60px rgba(0, 150, 255, 0.8), 0 0 90px rgba(100, 200, 255, 0.6)',
                  '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(0, 150, 255, 0.6), 0 0 60px rgba(100, 200, 255, 0.4)'
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              👻 Ghost Hunt 👻
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Catch as many ghosts as you can!
            </motion.p>
          </motion.div>

          <motion.div
            className='ghost-game-instructions'
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h3>How to Play:</h3>
            <ul>
              <li>Click on ghosts to catch them</li>
              <li>Build combos for bonus points</li>
              <li>Don't let them escape!</li>
              <li>You have 90 seconds</li>
            </ul>
          </motion.div>

          <motion.div
            className='ghost-game-start-controls'
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <motion.button
              className='ghost-game-button ghost-game-start'
              onClick={startGame}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 30px rgba(76, 175, 80, 0.8)'
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              Start Game
            </motion.button>
          </motion.div>

          <motion.div
            className='ghost-game-preview-ghost'
            animate={{
              y: [0, -15, 0],
              rotate: [0, 3, -3, 0],
              scale: 1,
              opacity: 1
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            initial={{ scale: 0, opacity: 0 }}
          >
            {imageLoaded ? (
              <motion.img
                src={ghostImage}
                alt='Preview Ghost'
                className='ghost-game-preview-image'
                draggable={false}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 1.4 }}
              />
            ) : (
              <motion.div
                className='ghost-game-preview-emoji'
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 1.4 }}
              >
                👻
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className='ghost-game-container'
      style={{ backgroundImage: `url(${backgroundImage})` }}
      ref={gameAreaRef}
      variants={pageVariants}
      initial='initial'
      animate='animate'
      exit='exit'
    >
      {/* Game UI */}
      <motion.div
        className='ghost-game-ui'
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.div
          style={{
            transform: 'none'
          }}
          className='ghost-game-score'
          whileHover={{ scale: 1.05 }}
        >
          <span className='ghost-game-label'>Score:</span>
          <motion.span
            className='ghost-game-value'
            key={score}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {score}
          </motion.span>
        </motion.div>

        <div className='ghost-game-timer'>
          <span className='ghost-game-label'>Time:</span>
          <span
            className='ghost-game-value'
            style={{ color: timeLeft <= 10 ? '#FF4444' : '#FFD700' }}
          >
            {timeLeft}s
          </span>
        </div>

        <motion.div className='ghost-game-combo' whileHover={{ scale: 1.05 }}>
          <span className='ghost-game-label'>Combo:</span>
          <motion.span
            className='ghost-game-value'
            key={combo}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            x{combo}
          </motion.span>
        </motion.div>
      </motion.div>

      {/* Game Controls */}
      <motion.div
        className='ghost-game-controls'
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {gameState === 'playing' && (
          <motion.button
            className='ghost-game-button ghost-game-pause'
            onClick={pauseGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            Pause
          </motion.button>
        )}

        {gameState === 'paused' && (
          <motion.button
            className='ghost-game-button ghost-game-resume'
            onClick={resumeGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            Resume
          </motion.button>
        )}

        {(gameState === 'paused' || gameState === 'gameOver') && (
          <motion.button
            className='ghost-game-button ghost-game-reset'
            onClick={resetGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            Reset
          </motion.button>
        )}
      </motion.div>

      {/* Game Area */}
      <div className='ghost-game-area'>
        <AnimatePresence>
          {ghosts.map((ghost) => (
            <Ghost
              key={ghost.id}
              id={ghost.id}
              type={ghost.type}
              x={ghost.x}
              y={ghost.y}
              speed={ghost.speed}
              direction={ghost.direction}
              points={ghost.points}
              color={ghost.color}
              size={ghost.size}
              onCatch={onGhostClick}
              onRemove={onGhostRemove}
              isPaused={isPaused}
              gameAreaRef={gameAreaRef}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameState === 'gameOver' && (
          <motion.div
            className='ghost-game-modal'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className='ghost-game-modal-content'
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 50 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <motion.h2
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                Game Over!
              </motion.h2>
              <motion.div
                className='ghost-game-final-score'
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <span className='ghost-game-label'>Final Score:</span>
                <motion.span
                  className='ghost-game-value'
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  {score}
                </motion.span>
              </motion.div>
              <motion.div
                className='ghost-game-stats'
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <motion.div
                  className='ghost-game-stat'
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <span className='ghost-game-label'>Ghosts Caught:</span>
                  <span className='ghost-game-value'>
                    {gameStats.ghostsCaught}
                  </span>
                </motion.div>
                <motion.div
                  className='ghost-game-stat'
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  <span className='ghost-game-label'>Best Combo:</span>
                  <span className='ghost-game-value'>
                    x{gameStats.bestCombo}
                  </span>
                </motion.div>
              </motion.div>
              <motion.div
                className='ghost-game-modal-buttons'
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                <motion.button
                  className='ghost-game-button ghost-game-play-again'
                  onClick={resetGame}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Play Again
                </motion.button>
                {onComplete && (
                  <motion.button
                    className='ghost-game-button ghost-game-continue'
                    onClick={handleContinue}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Continue
                  </motion.button>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default GhostHunt
