import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './DigitalFootprint.css'
import { RiFootprintFill } from 'react-icons/ri'
import { FaTrophy } from 'react-icons/fa6'
import { AiFillThunderbolt } from 'react-icons/ai'

const GAME_DURATION = 60 // 60 seconds
const TRAIL_SPAWN_INTERVAL = 3000 // 3 seconds between trails

// Falling Particles Component
const FallingParticles = () => {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const particleTypes = ['square', 'diamond', 'circle', 'triangle']
    const colors = [
      '#ffeb3b',
      '#e91e63',
      '#00bcd4',
      '#4caf50',
      '#ff9800',
      '#9c27b0'
    ]

    const createParticle = () => ({
      id: Math.random(),
      type: particleTypes[Math.floor(Math.random() * particleTypes.length)],
      left: Math.random() * 100,
      animationDuration: Math.random() * 3 + 2, // 2-5 seconds
      size: Math.random() * 6 + 4 // 4-10px
    })

    const generateParticles = () => {
      setParticles((prev) => [
        ...prev.slice(-50), // Keep max 50 particles
        ...Array(5).fill().map(createParticle)
      ])
    }

    generateParticles()
    const interval = setInterval(generateParticles, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className='footprint-game-particles'>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`footprint-game-particle ${particle.type}`}
          style={{
            left: `${particle.left}%`,
            animationDuration: `${particle.animationDuration}s`,
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  )
}

const DigitalFootprint = ({ onComplete }) => {
  const [gameState, setGameState] = useState('introduction') // introduction, playing, gameOver
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [footprints, setFootprints] = useState([])
  const [currentTrail, setCurrentTrail] = useState([])
  const [scoreAnimations, setScoreAnimations] = useState([])
  const [trailDirection, setTrailDirection] = useState(0) // 0: left-right, 1: bottom-top, 2: top-bottom, 3: right-left
  const [totalFootprints, setTotalFootprints] = useState(0) // Track total footprints spawned
  const [clickedFootprints, setClickedFootprints] = useState(0) // Track successful clicks

  const gameAreaRef = useRef(null)
  const spawnTimerRef = useRef(null)
  const gameTimerRef = useRef(null)
  const footprintIdRef = useRef(0)

  // Calculate game stats
  const precision =
    totalFootprints > 0
      ? Math.round((clickedFootprints / totalFootprints) * 100)
      : 100
  const speed =
    Math.round((clickedFootprints / (GAME_DURATION - timeLeft)) * 60) || 0

  // Footprint colors
  const footprintColors = [
    '#ff6b6b',
    '#4ecdc4',
    '#45b7d1',
    '#96ceb4',
    '#ffeaa7',
    '#dda0dd',
    '#98d8c8',
    '#ff9ff3',
    '#54a0ff',
    '#5f27cd',
    '#00d2d3',
    '#ff9f43',
    '#ee5a52',
    '#0abde3',
    '#10ac84'
  ]

  // Trail directions
  const directions = ['left-right', 'bottom-top', 'top-bottom', 'right-left']

  // Generate trail of footprints
  const generateTrail = useCallback(() => {
    const trailCount = Math.floor(Math.random() * 3) + 4 // 4-6 footprints
    const currentDirection = directions[trailDirection]
    const newTrail = []

    const margin = 80
    const screenWidth = window.innerWidth - margin * 2
    const screenHeight = window.innerHeight - margin * 2

    // Set rotation based on direction
    let trailRotation
    switch (currentDirection) {
      case 'left-right':
        trailRotation = 90
        break
      case 'top-bottom':
        trailRotation = 180
        break
      case 'right-left':
        trailRotation = 270
        break
      case 'bottom-top':
        trailRotation = 0
        break
      default:
        trailRotation = 90
    }

    let startX, startY, deltaX, deltaY

    // Determine starting position and direction based on trail direction
    // Balanced spacing for natural formations
    switch (currentDirection) {
      case 'left-right':
        startX = margin
        startY = margin + Math.random() * screenHeight
        deltaX = screenWidth / (trailCount + 6) // Balanced spacing
        deltaY = 0
        break
      case 'right-left':
        startX = screenWidth + margin
        startY = margin + Math.random() * screenHeight
        deltaX = -screenWidth / (trailCount + 6) // Balanced spacing
        deltaY = 0
        break
      case 'bottom-top':
        startX = margin + Math.random() * screenWidth
        startY = screenHeight + margin
        deltaX = 0
        deltaY = -screenHeight / (trailCount + 6) // Balanced spacing
        break
      case 'top-bottom':
        startX = margin + Math.random() * screenWidth
        startY = margin
        deltaX = 0
        deltaY = screenHeight / (trailCount + 6) // Balanced spacing
        break
      default:
        startX = margin
        startY = margin + Math.random() * screenHeight
        deltaX = screenWidth / (trailCount + 6) // Balanced spacing
        deltaY = 0
    }

    // Create footprints in trail
    for (let i = 0; i < trailCount; i++) {
      const footprint = {
        id: footprintIdRef.current++,
        x: startX + deltaX * (i + 1),
        y: startY + deltaY * (i + 1),
        color:
          footprintColors[Math.floor(Math.random() * footprintColors.length)],
        size: Math.random() * 80 + 70, // 70-150px for much bigger containers
        iconSize: Math.random() * 10 + 3, // 3-13x size multiplier for much bigger icons
        rotation: trailRotation, // Direction-based rotation for all footprints in this trail
        delay: i * 0.08 // Even faster stagger animation for quicker appearance
      }
      newTrail.push(footprint)
    }

    setCurrentTrail(newTrail)
    setFootprints(newTrail)
    setTotalFootprints((prev) => prev + trailCount) // Track total footprints

    // Move to next direction
    setTrailDirection((prev) => (prev + 1) % directions.length)
  }, [trailDirection, footprintColors, directions])

  // Start game
  const startGame = useCallback(() => {
    // Clear any existing intervals first and reset refs
    if (spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current)
      spawnTimerRef.current = null
    }
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current)
      gameTimerRef.current = null
    }

    setGameState('playing')
    setScore(0)
    setTimeLeft(GAME_DURATION)
    setFootprints([])
    setCurrentTrail([])
    setScoreAnimations([])
    setTrailDirection(0)
    setTotalFootprints(0)
    setClickedFootprints(0)
    footprintIdRef.current = 0

    // Generate initial trail
    setTimeout(() => {
      generateTrail()
    }, 1000)

    // Start game timer only (remove the trail spawning timer)
    gameTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Clear timers before setting game over
          if (spawnTimerRef.current) {
            clearInterval(spawnTimerRef.current)
            spawnTimerRef.current = null
          }
          if (gameTimerRef.current) {
            clearInterval(gameTimerRef.current)
            gameTimerRef.current = null
          }
          setGameState('gameOver')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [generateTrail])

  // End game
  const endGame = useCallback(() => {
    // Clear all timers immediately
    if (spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current)
      spawnTimerRef.current = null
    }
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current)
      gameTimerRef.current = null
    }
    setGameState('gameOver')
  }, [])

  // Handle footprint click
  const handleFootprintClick = useCallback(
    (footprintId, event) => {
      const footprint = footprints.find((fp) => fp.id === footprintId)
      if (!footprint) return

      // Remove footprint from both arrays
      setFootprints((prev) => prev.filter((fp) => fp.id !== footprintId))
      setCurrentTrail((prev) => prev.filter((fp) => fp.id !== footprintId))

      // Update score
      setScore((prev) => prev + 10)

      // Add score animation
      const rect = event.currentTarget.getBoundingClientRect()
      setScoreAnimations((prev) => [
        ...prev,
        {
          id: Date.now(),
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          points: 10
        }
      ])

      // Check if trail is complete and spawn new one
      const remainingFootprints = footprints.filter(
        (fp) => fp.id !== footprintId
      )
      if (remainingFootprints.length === 0) {
        setTimeout(() => {
          generateTrail()
        }, 500) // Reduced delay for faster gameplay
      }

      setClickedFootprints((prev) => prev + 1)
    },
    [footprints, generateTrail]
  )

  // Clean up timers
  useEffect(() => {
    return () => {
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current)
        spawnTimerRef.current = null
      }
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current)
        gameTimerRef.current = null
      }
    }
  }, [])

  // Clean up score animations
  useEffect(() => {
    if (scoreAnimations.length > 0) {
      const timer = setTimeout(() => {
        setScoreAnimations((prev) => prev.slice(1))
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [scoreAnimations])

  // Auto-end game when time runs out
  useEffect(() => {
    if (timeLeft <= 0 && gameState === 'playing') {
      endGame()
    }
  }, [timeLeft, gameState, endGame])

  const playAgain = () => {
    // Force clear all timers before starting again
    if (spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current)
      spawnTimerRef.current = null
    }
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current)
      gameTimerRef.current = null
    }

    // Small delay to ensure cleanup, then start game
    setTimeout(() => {
      startGame()
    }, 100)
  }

  const continueGame = () => {
    if (onComplete) {
      onComplete()
    }
  }

  return (
    <div className='footprint-game-container'>
      <AnimatePresence mode='wait'>
        {gameState === 'introduction' && (
          <motion.div
            key='introduction'
            className='footprint-game-introduction'
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className='footprint-game-introduction-header'>
              <div className='footprint-game-header-left'>
                <span className='footprint-game-footprint-icon1'>
                  <RiFootprintFill />
                </span>
                <span className='footprint-game-header-title'>
                  Digital Footprint Trail
                </span>
              </div>
              <div className='footprint-game-header-right'>
                <span className='footprint-game-header-score'>Score: 0</span>
                <span className='footprint-game-header-timer'>⏰ 60 sec</span>
              </div>
            </div>

            {/* Main Content */}
            <div className='footprint-game-introduction-main'>
              <motion.h1
                className='footprint-game-main-title'
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Digital Footprint Trail Game
              </motion.h1>

              <motion.p
                className='footprint-game-main-subtitle'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Click all footprints in each trail to clear them and progress!
              </motion.p>

              <motion.button
                className='footprint-game-start-btn'
                onClick={startGame}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Ready, set, Go!
              </motion.button>
            </div>

            {/* Bottom Stats */}
            <div className='footprint-game-introduction-stats'>
              <motion.div
                className='footprint-game-stat-item'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <div className='footprint-game-stat-icon'>
                  <FaTrophy color='orange' />
                </div>
                <div className='footprint-game-stat-label1'>High Score</div>
                <div className='footprint-game-stat-value'>0</div>
              </motion.div>

              <motion.div
                className='footprint-game-stat-item'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <div className='footprint-game-stat-icon'>⚙️</div>
                <div className='footprint-game-stat-label1'>Precision</div>
                <div className='footprint-game-stat-value precision'>100%</div>
              </motion.div>

              <motion.div
                className='footprint-game-stat-item'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <div className='footprint-game-stat-icon'>
                  <AiFillThunderbolt color='#ff6b6b' />
                </div>
                <div className='footprint-game-stat-label1'>Speed</div>
                <div className='footprint-game-stat-value speed'>0/min</div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div
            key='playing'
            className='footprint-game-playing'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            ref={gameAreaRef}
          >
            {/* Game UI */}
            <div className='footprint-game-ui'>
              <motion.div
                className='footprint-game-score-display'
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Score: {score}
              </motion.div>

              <motion.div
                className='footprint-game-timer-display'
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Time: {timeLeft}s
              </motion.div>
            </div>

            {/* Footprints */}
            <AnimatePresence>
              {footprints.map((footprint) => (
                <motion.div
                  key={footprint.id}
                  className='footprint-game-footprint'
                  style={{
                    left: footprint.x,
                    top: footprint.y,
                    width: footprint.size,
                    height: footprint.size
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.4, delay: footprint.delay }}
                  onClick={(e) => handleFootprintClick(footprint.id, e)}
                  whileTap={{
                    scale: 0.85,
                    transition: { duration: 0.1 }
                  }}
                >
                  <RiFootprintFill
                    className='footprint-game-footprint-icon'
                    style={{
                      color: footprint.color,
                      fontSize: `${footprint.iconSize}em`,
                      transform: `rotate(${footprint.rotation}deg)`
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Score animations */}
            <AnimatePresence>
              {scoreAnimations.map((anim) => (
                <motion.div
                  key={anim.id}
                  className='footprint-game-score-animation'
                  style={{
                    left: anim.x,
                    top: anim.y
                  }}
                  initial={{ opacity: 1, y: 0, scale: 1 }}
                  animate={{ opacity: 0, y: -50, scale: 1.2 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2 }}
                >
                  +{anim.points}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {gameState === 'gameOver' && (
          <motion.div
            key='gameOver'
            className='footprint-game-game-over'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <FallingParticles />

            <motion.div
              className='footprint-game-game-over-content'
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className='footprint-game-trophy-icon'>
                <FaTrophy />
              </div>

              <div className='footprint-game-score-title'>Final Score</div>

              <div className='footprint-game-final-score-number'>{score}</div>

              <div className='footprint-game-progress-bar'>
                <motion.div
                  className='footprint-game-progress-fill'
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(score / 10, 100)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>

              <div className='footprint-game-stats-row'>
                <div className='footprint-game-stat'>
                  <div className='footprint-game-stat-label'>Precision</div>
                  <div className='footprint-game-stat-value precision'>
                    {precision}%
                  </div>
                </div>
                <div className='footprint-game-stat'>
                  <div className='footprint-game-stat-label'>Speed</div>
                  <div className='footprint-game-stat-value speed'>
                    {speed}/min
                  </div>
                </div>
              </div>

              <motion.button
                className='footprint-game-back-button'
                onClick={continueGame}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back to the Mission!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DigitalFootprint
