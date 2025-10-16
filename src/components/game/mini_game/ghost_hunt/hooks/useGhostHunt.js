import { useState, useEffect, useRef, useCallback } from 'react'
import {
  GHOST_TYPES,
  GAME_CONFIG,
  DIFFICULTY_LEVELS,
  getRandomGhostType,
  getSpawnPosition,
  getRandomDirection,
  calculatePoints
} from '../utils/ghostConfig'

export const useGhostHunt = (gameAreaRef) => {
  // Game state
  const [gameState, setGameState] = useState('idle')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.duration)
  const [ghosts, setGhosts] = useState([])
  const [combo, setCombo] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [gameStats, setGameStats] = useState({
    ghostsCaught: 0,
    ghostsMissed: 0,
    bestCombo: 0,
    accuracy: 0
  })

  // Refs
  const gameLoopRef = useRef(null)
  const spawnTimerRef = useRef(null)
  const comboTimeoutRef = useRef(null)
  const ghostIdCounter = useRef(0)

  // Get current difficulty config
  const currentConfig = {
    ...GAME_CONFIG,
    ...DIFFICULTY_LEVELS['easy']
  }

  // Spawn a new ghost
  const spawnGhost = useCallback(() => {
    if (ghosts.length >= currentConfig.maxGhosts) {
      return
    }

    const ghostType = getRandomGhostType()
    const ghostConfig = GHOST_TYPES[ghostType]

    // Get spawn position using the game area ref
    const spawnPos = getSpawnPosition(gameAreaRef)
    const direction = getRandomDirection()

    const newGhost = {
      id: `ghost_${++ghostIdCounter.current}_${Date.now()}`,
      type: ghostType,
      x: spawnPos.x,
      y: spawnPos.y,
      speed: ghostConfig.speed * currentConfig.ghostSpeedMultiplier,
      direction,
      points: ghostConfig.points,
      color: ghostConfig.color,
      size: ghostConfig.size,
      createdAt: Date.now(),
      lifespan: ghostConfig.lifespan
    }

    setGhosts((prev) => {
      const newGhosts = [...prev, newGhost]

      return newGhosts
    })

    // Remove ghost after lifespan
    setTimeout(() => {
      setGhosts((prev) => {
        const updated = prev.filter((ghost) => ghost.id !== newGhost.id)
        if (prev.length > updated.length) {
          setGameStats((prevStats) => ({
            ...prevStats,
            ghostsMissed: prevStats.ghostsMissed + 1
          }))
        }
        return updated
      })
    }, newGhost.lifespan)
  }, [ghosts.length, currentConfig, gameAreaRef])

  // Handle ghost catch
  const handleGhostClick = useCallback(
    (ghostId, ghostType, basePoints) => {
      const points = calculatePoints(ghostType, combo)

      setScore((prev) => prev + points)
      setCombo((prev) => {
        const newCombo = prev + 1
        setGameStats((prevStats) => ({
          ...prevStats,
          ghostsCaught: prevStats.ghostsCaught + 1,
          bestCombo: Math.max(prevStats.bestCombo, newCombo)
        }))
        return newCombo
      })

      // Reset combo timeout
      if (comboTimeoutRef.current) {
        clearTimeout(comboTimeoutRef.current)
      }
      comboTimeoutRef.current = setTimeout(() => {
        setCombo(0)
      }, currentConfig.comboTimeout)

      // Remove ghost
      setGhosts((prev) => prev.filter((ghost) => ghost.id !== ghostId))

      return points
    },
    [combo, currentConfig.comboTimeout]
  )

  // Handle ghost removal
  const removeGhost = useCallback((ghostId) => {
    setGhosts((prev) => prev.filter((ghost) => ghost.id !== ghostId))
  }, [])

  // Start ghost spawning
  const startGhostSpawning = useCallback(() => {
    if (spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current)
    }

    // Spawn immediately
    spawnGhost()

    // Then continue spawning
    spawnTimerRef.current = setInterval(() => {
      spawnGhost()
    }, currentConfig.spawnRate)
  }, [spawnGhost, currentConfig.spawnRate])

  // Stop ghost spawning
  const stopGhostSpawning = useCallback(() => {
    if (spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current)
      spawnTimerRef.current = null
    }
  }, [])

  // Game loop
  useEffect(() => {
    if (gameState === 'playing' && !isPaused) {
      // Start game timer
      gameLoopRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState('gameOver')
            return 0
          }
          return prev - 1
        })
      }, 1000)

      // Start ghost spawning
      startGhostSpawning()
    } else {
      // Stop game timer
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
        gameLoopRef.current = null
      }

      // Stop ghost spawning
      stopGhostSpawning()
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
      stopGhostSpawning()
    }
  }, [gameState, isPaused, startGhostSpawning, stopGhostSpawning])

  // Calculate accuracy
  useEffect(() => {
    const totalGhosts = gameStats.ghostsCaught + gameStats.ghostsMissed
    if (totalGhosts > 0) {
      setGameStats((prev) => ({
        ...prev,
        accuracy: Math.round((prev.ghostsCaught / totalGhosts) * 100)
      }))
    }
  }, [gameStats.ghostsCaught, gameStats.ghostsMissed])

  // Game controls
  const startGame = useCallback(() => {
    setGameState('playing')
    setScore(0)
    setTimeLeft(currentConfig.duration)
    setGhosts([])
    setCombo(0)
    setIsPaused(false)
    setGameStats({
      ghostsCaught: 0,
      ghostsMissed: 0,
      bestCombo: 0,
      accuracy: 0
    })
  }, [currentConfig.duration])

  const pauseGame = useCallback(() => {
    console.log('=== PAUSING GAME ===')
    setIsPaused(true)
    setGameState('paused')
  }, [])

  const resumeGame = useCallback(() => {
    console.log('=== RESUMING GAME ===')
    setIsPaused(false)
    setGameState('playing')
  }, [])

  const resetGame = useCallback(() => {
    console.log('=== RESETTING GAME ===')
    setGameState('idle')
    setScore(0)
    setTimeLeft(currentConfig.duration)
    setGhosts([])
    setCombo(0)
    setIsPaused(false)
    setGameStats({
      ghostsCaught: 0,
      ghostsMissed: 0,
      bestCombo: 0,
      accuracy: 0
    })
  }, [currentConfig.duration])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current)
      }
      if (comboTimeoutRef.current) {
        clearTimeout(comboTimeoutRef.current)
      }
    }
  }, [])

  return {
    // State
    gameState,
    score,
    timeLeft,
    ghosts,
    combo,
    isPaused,
    gameStats,

    // Actions
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    spawnGhost,
    handleGhostClick,
    removeGhost
  }
}
