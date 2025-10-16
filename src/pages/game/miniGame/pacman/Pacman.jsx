import React, { useState, useEffect, useRef, useCallback } from 'react'
import ghost from '@/assets/game/mini_game/img/pacman/ghost.png'
import pacman from '@/assets/game/mini_game/img/pacman/katie.png'
import './pacman.css'
import IntroductionStep from '@/components/game/mini_games/pacman/IntroductionStep'

// import constants - pacmanGame.js
import {
  CELL_SIZE,
  PACMAN_SIZE,
  GHOST_SIZE,
  DOT_SIZE,
  BLOCK_POWERUP_SIZE,
  LINE_THICKNESS,
  PACMAN_SPEED,
  PHONE_COUNTDOWN_DURATION,
  IMMUNITY_DURATION,
  GHOST_FREEZE_DURATION,
  GHOST_MOVE_INTERVAL,
  DOT_ANIMATION_DURATION,
  mazeLayout, // Import layout
  powerupGridPositions, // Import powerup positions
  getGridCoords,
  getCenterPixelCoords,
  calculateStartPosition,
  calculateInitialDots,
  isWallCollision // Import collision checker
} from '@/utils/pacmanUtils' // Pacman game utils location

// Calculate maze dimensions based on imported constants
const mazeHeight = mazeLayout.length * CELL_SIZE
const mazeWidth = mazeLayout[0].length * CELL_SIZE

// Calculate initial state values using imported functions and constants
const initialStartPosition = calculateStartPosition(
  mazeLayout,
  PACMAN_SIZE,
  CELL_SIZE
)
const initialDotsData = calculateInitialDots(
  mazeLayout,
  powerupGridPositions,
  CELL_SIZE,
  DOT_SIZE
)
const initialBlockPowerups = [] // Remove all block powerups from board
const initialGhostPosition = () => {
  const centerCoords = getCenterPixelCoords({ row: 8, col: 10 }, CELL_SIZE) // Pass CELL_SIZE
  return {
    top: centerCoords.top - GHOST_SIZE / 2,
    left: centerCoords.left - GHOST_SIZE / 2
  }
}

const Pacman = ({ onComplete }) => {
  const [pacmanPos, setPacmanPos] = useState(initialStartPosition)
  const [pacmanDirection, setPacmanDirection] = useState('stop')
  const [intendedDirection, setIntendedDirection] = useState('stop')
  const [isStepsCompleted, setIsStepsCompleted] = useState(false)
  const [blockPowerups, setBlockPowerups] = useState(initialBlockPowerups)
  const [dots, setDots] = useState(initialDotsData)
  const [score, setScore] = useState(0)
  const [isImmune, setIsImmune] = useState(false)
  const [immunityTimer, setImmunityTimer] = useState(0)
  const [showPhone, setShowPhone] = useState(false)
  const [phoneTimer, setPhoneTimer] = useState(PHONE_COUNTDOWN_DURATION)
  const [phoneBlocked, setPhoneBlocked] = useState(false)
  const [isPhoneShrinking, setIsPhoneShrinking] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [gameOverReason, setGameOverReason] = useState('')
  const [showWinModal, setShowWinModal] = useState(false)
  const [showConfirmCloseModal, setShowConfirmCloseModal] = useState(false)
  const [pacmanRotation, setPacmanRotation] = useState(0)
  const [ghostPos, setGhostPos] = useState(initialGhostPosition)
  const [ghostTargetPos, setGhostTargetPos] = useState(initialGhostPosition)
  const phoneIntervalRef = useRef(null)
  const immunityIntervalRef = useRef(null)
  const freezeIntervalRef = useRef(null)
  const phoneTimeoutRef = useRef(null)
  const animationFrameRef = useRef(null)
  const lastFrameTimeRef = useRef(performance.now())
  const timeSinceLastGhostMoveRef = useRef(0)
  const dotRemovalTimeouts = useRef({})
  const [isGhostNearby, setIsGhostNearby] = useState(false)
  const [isKatieFlashing, setIsKatieFlashing] = useState(false)
  const [lastGhostDirection, setLastGhostDirection] = useState({
    dx: 0,
    dy: 0
  })
  const [isGhostFrozen, setIsGhostFrozen] = useState(false)
  const [freezeTimer, setFreezeTimer] = useState(0)
  const [showCloseButton, setShowCloseButton] = useState(false)

  const clearPhoneTimer = () => {
    if (phoneIntervalRef.current) {
      clearInterval(phoneIntervalRef.current)
      phoneIntervalRef.current = null
    }
    if (phoneTimeoutRef.current) {
      clearTimeout(phoneTimeoutRef.current)
      phoneTimeoutRef.current = null
    }
  }

  const clearImmunityTimer = () => {
    if (immunityIntervalRef.current) {
      clearInterval(immunityIntervalRef.current)
      immunityIntervalRef.current = null
    }
    if (freezeIntervalRef.current) {
      clearInterval(freezeIntervalRef.current)
      freezeIntervalRef.current = null
    }
  }

  const clearDotTimeouts = () => {
    Object.values(dotRemovalTimeouts.current).forEach(clearTimeout)
    dotRemovalTimeouts.current = {}
  }

  //keyboard listeners
  const handleKeyDown = useCallback(
    (e) => {
      // Handle Enter key for blocking when phone is shown
      if (showPhone && e.key === 'Enter') {
        e.preventDefault()
        handleBlockClick()
        return
      }

      if (showPhone || gameOver) return
      let newIntendedDirection = 'stop'
      switch (e.key) {
        case 'ArrowUp':
          newIntendedDirection = 'up'
          break
        case 'ArrowDown':
          newIntendedDirection = 'down'
          break
        case 'ArrowLeft':
          newIntendedDirection = 'left'
          break
        case 'ArrowRight':
          newIntendedDirection = 'right'
          break
        default:
          return
      }
      if (newIntendedDirection !== 'stop') {
        setIntendedDirection(newIntendedDirection)
      }
    },
    [showPhone, gameOver]
  )

  useEffect(() => {
    if (gameOver || showPhone || showWinModal || showConfirmCloseModal) return

    const pacmanRect = {
      top: pacmanPos.top,
      bottom: pacmanPos.top + PACMAN_SIZE,
      left: pacmanPos.left,
      right: pacmanPos.left + PACMAN_SIZE,
      centerX: pacmanPos.left + PACMAN_SIZE / 2,
      centerY: pacmanPos.top + PACMAN_SIZE / 2
    }

    // Power-up Collision
    blockPowerups.forEach((powerup) => {
      if (!powerup.visible) return
      const blockRect = {
        top: powerup.top,
        bottom: powerup.top + BLOCK_POWERUP_SIZE,
        left: powerup.left,
        right: powerup.left + BLOCK_POWERUP_SIZE
      }
      if (
        pacmanRect.left < blockRect.right &&
        pacmanRect.right > blockRect.left &&
        pacmanRect.top < blockRect.bottom &&
        pacmanRect.bottom > blockRect.top
      ) {
        setBlockPowerups((prevPowerups) =>
          prevPowerups.map((p) =>
            p.id === powerup.id ? { ...p, visible: false } : p
          )
        )
        triggerPhoneSequence()
      }
    })

    // Dot Collision
    dots.forEach((dot) => {
      if (dot.collected || dotRemovalTimeouts.current[dot.id]) return
      const dotRect = {
        top: dot.top,
        bottom: dot.top + DOT_SIZE,
        left: dot.left,
        right: dot.left + DOT_SIZE
      }
      const collide =
        pacmanRect.left < dotRect.right &&
        pacmanRect.right > dotRect.left &&
        pacmanRect.top < dotRect.bottom &&
        pacmanRect.bottom > dotRect.top
      if (collide) {
        setScore((s) => s + 10)
        setDots((prevDots) =>
          prevDots.map((d) => (d.id === dot.id ? { ...d, collected: true } : d))
        )
        dotRemovalTimeouts.current[dot.id] = setTimeout(() => {
          setDots((prevDots) => prevDots.filter((d) => d.id !== dot.id))
          delete dotRemovalTimeouts.current[dot.id]
        }, DOT_ANIMATION_DURATION)
      }
    })

    // Win Condition - FIX THIS PART
    const allDotsCollected = dots.every(
      (dot) => dot.collected || dotRemovalTimeouts.current[dot.id]
    )

    if (
      allDotsCollected &&
      dots.length > 0 &&
      initialDotsData.length > 0 &&
      !gameOver &&
      !showWinModal
    ) {
      console.log('You Win! All dots collected!')
      setShowWinModal(true)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }

    // Ghost Collision
    const ghostRect = {
      top: ghostPos.top,
      bottom: ghostPos.top + GHOST_SIZE,
      left: ghostPos.left,
      right: ghostPos.left + GHOST_SIZE
    }
    if (
      pacmanRect.left < ghostRect.right &&
      pacmanRect.right > ghostRect.left &&
      pacmanRect.top < ghostRect.bottom &&
      pacmanRect.bottom > ghostRect.top
    ) {
      if (isImmune) {
        setGhostPos(() => {
          const centerCoords = getCenterPixelCoords(
            { row: 8, col: 10 },
            CELL_SIZE
          ) // Pass CELL_SIZE
          const startPos = {
            top: centerCoords.top - GHOST_SIZE / 2,
            left: centerCoords.left - GHOST_SIZE / 2
          }
          setGhostTargetPos(startPos)
          return startPos
        })
      } else if (isGhostFrozen) {
        // Do nothing if ghost is frozen
        return
      } else {
        // Show popup instead of immediately ending game
        if (!showPhone && !gameOver) {
          triggerPhoneSequence()
        }
      }
    }
  }, [
    pacmanPos,
    blockPowerups,
    showPhone,
    dots,
    ghostPos,
    isImmune,
    gameOver,
    showWinModal,
    showConfirmCloseModal
  ])

  // Ghost Follow Pacman Login AI Generated  - explanation file stored in work/digi/pacaman_game/GhostFollowPacman.txt
  const calculateNextGhostTarget = useCallback(
    (currentGhostPos, currentPacmanPos) => {
      // Use imported helper functions, passing CELL_SIZE
      const ghostGrid = getGridCoords(currentGhostPos, GHOST_SIZE, CELL_SIZE)
      const pacmanGrid = getGridCoords(currentPacmanPos, PACMAN_SIZE, CELL_SIZE)

      if (
        ghostGrid.row < 0 ||
        ghostGrid.col < 0 ||
        pacmanGrid.row < 0 ||
        pacmanGrid.col < 0 ||
        ghostGrid.row >= mazeLayout.length ||
        ghostGrid.col >= mazeLayout[0].length ||
        pacmanGrid.row >= mazeLayout.length ||
        pacmanGrid.col >= mazeLayout[0].length
      ) {
        console.warn(
          'Invalid grid coords for ghost/pacman',
          ghostGrid,
          pacmanGrid
        )
        const centerCoords = getCenterPixelCoords(ghostGrid, CELL_SIZE) // Pass CELL_SIZE
        return {
          top: centerCoords.top - GHOST_SIZE / 2,
          left: centerCoords.left - GHOST_SIZE / 2
        }
      }

      const potentialMoves = [
        { dr: -1, dc: 0, dir: 'up' },
        { dr: 1, dc: 0, dir: 'down' },
        { dr: 0, dc: -1, dir: 'left' },
        { dr: 0, dc: 1, dir: 'right' }
      ]
      let bestGridMove = null
      let minDistance = Infinity

      for (const move of potentialMoves) {
        const neighborRow = ghostGrid.row + move.dr
        const neighborCol = ghostGrid.col + move.dc
        if (
          neighborRow < 0 ||
          neighborRow >= mazeLayout.length ||
          neighborCol < 0 ||
          neighborCol >= mazeLayout[0].length ||
          mazeLayout[neighborRow][neighborCol] === 1
        )
          continue
        const distance =
          Math.abs(neighborRow - pacmanGrid.row) +
          Math.abs(neighborCol - pacmanGrid.col)
        if (distance < minDistance) {
          minDistance = distance
          bestGridMove = { row: neighborRow, col: neighborCol }
        }
      }

      if (bestGridMove) {
        const targetCenter = getCenterPixelCoords(bestGridMove, CELL_SIZE) // Pass CELL_SIZE
        return {
          top: targetCenter.top - GHOST_SIZE / 2,
          left: targetCenter.left - GHOST_SIZE / 2
        }
      }

      const currentCenter = getCenterPixelCoords(ghostGrid, CELL_SIZE) // Pass CELL_SIZE
      return {
        top: currentCenter.top - GHOST_SIZE / 2,
        left: currentCenter.left - GHOST_SIZE / 2
      }
    },
    [] // No direct dependencies on component state/props here
  )

  const triggerPhoneSequence = () => {
    clearPhoneTimer()
    setPhoneTimer(PHONE_COUNTDOWN_DURATION)
    setPhoneBlocked(false)
    setIsPhoneShrinking(false)
    setShowPhone(true)

    phoneIntervalRef.current = setInterval(() => {
      setPhoneTimer((prev) => {
        if (prev <= 1) {
          clearInterval(phoneIntervalRef.current)
          phoneIntervalRef.current = null
          handlePhoneClose(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }
  const handleBlockClick = () => {
    if (phoneIntervalRef.current) {
      clearPhoneTimer()
      setPhoneBlocked(true)
      startGhostFreeze()
      handlePhoneClose(true)
    }
  }
  const handlePhoneClose = (success) => {
    clearPhoneTimer()
    if (success) {
      setIsPhoneShrinking(true)

      phoneTimeoutRef.current = setTimeout(() => {
        setShowPhone(false)
        setIsPhoneShrinking(false)
      }, 500)
    } else {
      // User failed to respond in time - end the game
      setShowPhone(false)
      setIsPhoneShrinking(false)
      setGameOver(true)
      setGameOverReason('Phone Blocked')
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }

  const startGhostFreeze = () => {
    clearInterval(freezeIntervalRef.current)
    setIsGhostFrozen(true)
    setFreezeTimer(GHOST_FREEZE_DURATION)

    freezeIntervalRef.current = setInterval(() => {
      setFreezeTimer((prev) => {
        if (prev <= 1) {
          clearInterval(freezeIntervalRef.current)
          freezeIntervalRef.current = null
          setIsGhostFrozen(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const startImmunity = () => {
    clearImmunityTimer()
    setIsImmune(true)
    setImmunityTimer(IMMUNITY_DURATION)

    immunityIntervalRef.current = setInterval(() => {
      setImmunityTimer((prev) => {
        if (prev <= 1) {
          clearInterval(immunityIntervalRef.current)
          immunityIntervalRef.current = null
          setIsImmune(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => {
    let newRotation = pacmanRotation
    switch (pacmanDirection) {
      case 'right':
        newRotation = 0
        break
      case 'down':
        newRotation = 90
        break
      case 'left':
        newRotation = 180
        break
      case 'up':
        newRotation = 270
        break
    }
    if (pacmanDirection !== 'stop' && newRotation !== pacmanRotation) {
      setPacmanRotation(newRotation)
    }
  }, [pacmanDirection])

  useEffect(() => {
    if (gameOver || showWinModal || showConfirmCloseModal) return
    if (!isStepsCompleted) return

    let lastUpdateTime = performance.now()

    const gameLoop = (currentTime) => {
      if (gameOver || showWinModal || showConfirmCloseModal) return

      // Pause game movement when phone popup is showing
      if (showPhone) {
        animationFrameRef.current = requestAnimationFrame(gameLoop)
        return
      }

      const deltaTime = currentTime - lastUpdateTime
      lastUpdateTime = currentTime
      if (deltaTime > 200) return
      const dtSeconds = deltaTime / 1000

      // Pacman Update
      setPacmanPos((prevPos) => {
        let currentDirection = pacmanDirection
        let nextPos = { ...prevPos }
        if (
          intendedDirection !== 'stop' &&
          intendedDirection !== currentDirection
        ) {
          const tempNextPos = { ...prevPos }
          const checkDistance = 1
          if (intendedDirection === 'up') tempNextPos.top -= checkDistance
          else if (intendedDirection === 'down')
            tempNextPos.top += checkDistance
          else if (intendedDirection === 'left')
            tempNextPos.left -= checkDistance
          else if (intendedDirection === 'right')
            tempNextPos.left += checkDistance

          if (
            !isWallCollision(
              tempNextPos,
              PACMAN_SIZE,
              mazeLayout,
              CELL_SIZE,
              LINE_THICKNESS
            )
          ) {
            currentDirection = intendedDirection
            setPacmanDirection(intendedDirection)
          }
        }

        const moveDistance = PACMAN_SPEED * dtSeconds
        let moved = false
        if (currentDirection === 'up') {
          nextPos.top -= moveDistance
          moved = true
        } else if (currentDirection === 'down') {
          nextPos.top += moveDistance
          moved = true
        } else if (currentDirection === 'left') {
          nextPos.left -= moveDistance
          moved = true
        } else if (currentDirection === 'right') {
          nextPos.left += moveDistance
          moved = true
        }

        if (!moved) return prevPos

        if (
          isWallCollision(
            nextPos,
            PACMAN_SIZE,
            mazeLayout,
            CELL_SIZE,
            LINE_THICKNESS
          )
        ) {
          setPacmanDirection('stop')
          return prevPos
        }
        return nextPos
      })

      timeSinceLastGhostMoveRef.current += deltaTime
      if (timeSinceLastGhostMoveRef.current >= GHOST_MOVE_INTERVAL) {
        timeSinceLastGhostMoveRef.current = 0
        // Only update ghost target if not frozen
        if (!isGhostFrozen) {
          setGhostTargetPos(calculateNextGhostTarget(ghostPos, pacmanPos))
        }
      }
      setGhostPos((prevGhostPos) => {
        const dx = ghostTargetPos.left - prevGhostPos.left
        const dy = ghostTargetPos.top - prevGhostPos.top
        const distance = Math.sqrt(dx * dx + dy * dy)

        const ghostSpeed = (CELL_SIZE / GHOST_MOVE_INTERVAL) * 1000
        const moveDistance = ghostSpeed * dtSeconds

        if (isGhostFrozen) {
          return prevGhostPos
        }

        if (distance < moveDistance || distance === 0) {
          return ghostTargetPos
        } else {
          return {
            left: prevGhostPos.left + (dx / distance) * moveDistance,
            top: prevGhostPos.top + (dy / distance) * moveDistance
          }
        }
      })

      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }
    animationFrameRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      clearDotTimeouts()
    }
  }, [
    gameOver,
    showWinModal,
    showConfirmCloseModal,
    isStepsCompleted,
    pacmanDirection,
    intendedDirection,
    calculateNextGhostTarget,
    ghostPos,
    pacmanPos,
    ghostTargetPos,
    isGhostFrozen,
    showPhone
  ])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  // Show close button after 60 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCloseButton(true)
    }, 60000) // 60 seconds

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    return () => {
      clearPhoneTimer()
      clearImmunityTimer()
      clearDotTimeouts()
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const resetGame = () => {
    // Use imported calculation functions/constants for initial state
    setPacmanPos(initialStartPosition)
    setPacmanDirection('stop')
    setIntendedDirection('stop')
    setDots(
      calculateInitialDots(
        mazeLayout,
        powerupGridPositions,
        CELL_SIZE,
        DOT_SIZE
      )
    )
    setBlockPowerups(initialBlockPowerups.map((p) => ({ ...p, visible: true })))
    setScore(0)
    setIsImmune(false)
    setImmunityTimer(0)
    setIsGhostFrozen(false)
    setFreezeTimer(0)
    setShowPhone(false)
    setGameOver(false)
    setGameOverReason('')
    setShowWinModal(false)
    setShowConfirmCloseModal(false)
    setPacmanRotation(0)
    setGhostPos(initialGhostPosition)
    setGhostTargetPos(initialGhostPosition)
    setShowCloseButton(false)
    clearImmunityTimer()
    clearPhoneTimer()
    clearDotTimeouts()
    lastFrameTimeRef.current = performance.now()
  }

  const handleReplay = () => {
    resetGame()
  }
  const handleContinue = () => {
    setShowWinModal(false)
    onComplete()
  }
  const handleCloseClick = () => {
    setShowConfirmCloseModal(true)

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }
  const handleConfirmClose = () => {
    onComplete()
    setShowConfirmCloseModal(false)
  }
  const handleCancelClose = () => {
    setShowConfirmCloseModal(false)
  }

  // Add function to make ghost retreat in opposite direction
  const reverseGhostDirection = useCallback(() => {
    setGhostTargetPos((prevTarget) => {
      // Calculate opposite direction
      const dx = prevTarget.left - ghostPos.left
      const dy = prevTarget.top - ghostPos.top

      // Store direction for reference
      setLastGhostDirection({ dx, dy })

      // Calculate new target position in opposite direction
      const ghostGrid = getGridCoords(ghostPos, GHOST_SIZE, CELL_SIZE)

      // Find direction vector
      const dirVector = {
        x: dx !== 0 ? -Math.sign(dx) : 0,
        y: dy !== 0 ? -Math.sign(dy) : 0
      }

      // If no direction, default to moving away from pacman
      if (dirVector.x === 0 && dirVector.y === 0) {
        const pacmanCenter = {
          x: pacmanPos.left + PACMAN_SIZE / 2,
          y: pacmanPos.top + PACMAN_SIZE / 2
        }
        const ghostCenter = {
          x: ghostPos.left + GHOST_SIZE / 2,
          y: ghostPos.top + GHOST_SIZE / 2
        }
        dirVector.x = ghostCenter.x > pacmanCenter.x ? 1 : -1
        dirVector.y = ghostCenter.y > pacmanCenter.y ? 1 : -1
      }

      // Find an available cell in the opposite direction
      const potentialMoves = [
        {
          dr: -1,
          dc: 0,
          priority: Math.abs(dirVector.y) > 0 && dirVector.y < 0 ? 1 : 3
        },
        {
          dr: 1,
          dc: 0,
          priority: Math.abs(dirVector.y) > 0 && dirVector.y > 0 ? 1 : 3
        },
        {
          dr: 0,
          dc: -1,
          priority: Math.abs(dirVector.x) > 0 && dirVector.x < 0 ? 1 : 3
        },
        {
          dr: 0,
          dc: 1,
          priority: Math.abs(dirVector.x) > 0 && dirVector.x > 0 ? 1 : 3
        }
      ].sort((a, b) => a.priority - b.priority)

      for (const move of potentialMoves) {
        const newRow = ghostGrid.row + move.dr
        const newCol = ghostGrid.col + move.dc

        if (
          newRow >= 0 &&
          newRow < mazeLayout.length &&
          newCol >= 0 &&
          newCol < mazeLayout[0].length &&
          mazeLayout[newRow][newCol] !== 1
        ) {
          const newCenter = getCenterPixelCoords(
            { row: newRow, col: newCol },
            CELL_SIZE
          )
          return {
            top: newCenter.top - GHOST_SIZE / 2,
            left: newCenter.left - GHOST_SIZE / 2
          }
        }
      }

      // If no valid move found, stay in place
      return prevTarget
    })
  }, [ghostPos, pacmanPos, GHOST_SIZE, PACMAN_SIZE, CELL_SIZE, mazeLayout])

  // Check distance between ghost and pacman
  useEffect(() => {
    if (gameOver || showWinModal || showConfirmCloseModal) return

    const pacmanCenter = {
      x: pacmanPos.left + PACMAN_SIZE / 2,
      y: pacmanPos.top + PACMAN_SIZE / 2
    }

    const ghostCenter = {
      x: ghostPos.left + GHOST_SIZE / 2,
      y: ghostPos.top + GHOST_SIZE / 2
    }

    // Calculate grid distance between ghost and pacman
    const pacmanGrid = getGridCoords(pacmanPos, PACMAN_SIZE, CELL_SIZE)
    const ghostGrid = getGridCoords(ghostPos, GHOST_SIZE, CELL_SIZE)

    const gridDistance =
      Math.abs(pacmanGrid.row - ghostGrid.row) +
      Math.abs(pacmanGrid.col - ghostGrid.col)

    // Set flag if ghost is nearby (within 7 cells)
    const isNearby = gridDistance <= 7
    setIsGhostNearby(isNearby)

    // Toggle flashing effect when nearby (but don't auto-trigger popup)
    if (isNearby && !showPhone && !isGhostFrozen) {
      setIsKatieFlashing(true)
    } else {
      setIsKatieFlashing(false)
    }
  }, [
    pacmanPos,
    ghostPos,
    gameOver,
    showWinModal,
    showConfirmCloseModal,
    showPhone,
    isGhostFrozen
  ])

  if (!isStepsCompleted) {
    return <IntroductionStep setIsStepsCompleted={setIsStepsCompleted} />
  }

  //pacman eye direction calculation
  const eyeDirectionClass =
    pacmanDirection === 'stop' ? 'dir-right' : `dir-${pacmanDirection}` // Default to right if stopped

  const countdownBarWidth = showPhone
    ? (phoneTimer / PHONE_COUNTDOWN_DURATION) * 100
    : 0

  const eyeTranslateX =
    pacmanRotation === 180 || pacmanRotation === 270 ? -4 : 4

  return (
    <div className='pacman-game'>
      {showCloseButton && (
        <button className='close-game-button' onClick={handleCloseClick}>
          X
        </button>
      )}

      <div
        className='maze-container'
        style={{ width: `${mazeWidth}px`, height: `${mazeHeight}px` }}
      >
        {mazeLayout.map((row, y) =>
          row.map((cell, x) => {
            if (cell === 1) {
              const style = {
                position: 'absolute',
                top: `${y * CELL_SIZE}px`,
                left: `${x * CELL_SIZE}px`,
                width: `${CELL_SIZE}px`,
                height: `${CELL_SIZE}px`,
                borderTop: 'none',
                borderBottom: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                boxSizing: 'border-box'
              }
              const lineStyle = `${LINE_THICKNESS}px solid white`

              const isPathAbove = y > 0 && mazeLayout[y - 1][x] === 0
              const isPathBelow =
                y < mazeLayout.length - 1 && mazeLayout[y + 1][x] === 0
              const isPathLeft = x > 0 && mazeLayout[y][x - 1] === 0
              const isPathRight =
                x < mazeLayout[0].length - 1 && mazeLayout[y][x + 1] === 0

              if (y === 0 || isPathAbove) style.borderTop = lineStyle
              if (y === mazeLayout.length - 1 || isPathBelow)
                style.borderBottom = lineStyle
              if (x === 0 || isPathLeft) style.borderLeft = lineStyle
              if (x === mazeLayout[0].length - 1 || isPathRight)
                style.borderRight = lineStyle

              if (
                style.borderTop !== 'none' ||
                style.borderBottom !== 'none' ||
                style.borderLeft !== 'none' ||
                style.borderRight !== 'none'
              ) {
                return (
                  <div
                    key={`wall-${y}-${x}`}
                    className='maze-wall'
                    style={style}
                  />
                )
              }
            }
            return null
          })
        )}
        {dots.map((dot) => (
          <div
            key={dot.id}
            className={`dot ${dot.collected ? 'collected' : ''}`}
            style={{
              top: `${dot.top}px`,
              left: `${dot.left}px`,
              width: `${DOT_SIZE}px`,
              height: `${DOT_SIZE}px`
            }}
          />
        ))}
        <div
          className={`pacman ${isImmune ? 'immune' : ''} ${
            isKatieFlashing ? 'flashing' : ''
          }`}
          style={{
            top: `${pacmanPos.top}px`,
            left: `${pacmanPos.left}px`,
            width: `${PACMAN_SIZE}px`,
            height: `${PACMAN_SIZE}px`,
            backgroundImage: `url(${pacman})`
          }}
        >
          <div className={`pacman-eye ${eyeDirectionClass}`} />
        </div>
        <div
          className='ghost'
          style={{
            top: `${ghostPos.top}px`,
            left: `${ghostPos.left}px`,
            width: `${GHOST_SIZE}px`,
            height: `${GHOST_SIZE}px`,
            backgroundImage: `url(${ghost})`
          }}
        />
      </div>
      {showPhone && (
        <div className={`phone-overlay ${showPhone ? 'visible' : ''}`}>
          <div className={`phone ${isPhoneShrinking ? 'shrinking' : ''}`}>
            <div
              className='countdown-bar'
              style={{ width: `${countdownBarWidth}%` }}
            />
            <button
              className={`phone-block-button ${phoneBlocked ? 'blocked' : ''}`}
              onClick={handleBlockClick}
              disabled={phoneBlocked || isPhoneShrinking}
            >
              BLOCK
            </button>
          </div>
        </div>
      )}
      <div className='game-score-display'>Score: {score}</div>
      {isImmune && (
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 10,
            color: 'blue',
            background: 'rgba(255,255,255,0.7)',
            padding: '5px'
          }}
        >
          Immunity: {immunityTimer}s
        </div>
      )}
      {isGhostFrozen && (
        <div
          style={{
            position: 'absolute',
            top: 40,
            right: 10,
            color: 'red',
            background: 'rgba(255,255,255,0.7)',
            padding: '5px'
          }}
        >
          Frozen: {freezeTimer}s
        </div>
      )}
      {gameOver && (
        <div className='modal-overlay'>
          <div className='modal-content'>
            <h2>GAME OVER!</h2>
            <p>
              {gameOverReason ? `${gameOverReason}!` : 'The Bully Got You!'}
            </p>
            <div className='modal-buttons'>
              <button onClick={handleReplay}>Play Again</button>
            </div>
          </div>
        </div>
      )}
      {showWinModal && (
        <div className='modal-overlay'>
          <div className='modal-content'>
            <h2>YOU WIN!</h2>
            <p>You collected all the dots!</p>
            <div className='modal-score'>Score: {score}</div>
            <div className='modal-buttons'>
              <button onClick={handleReplay}>Play Again</button>
              <button onClick={handleContinue} className='secondary'>
                CONTINUE
              </button>
            </div>
          </div>
        </div>
      )}
      {showConfirmCloseModal && (
        <div className='modal-overlay'>
          <div className='modal-content'>
            <h2>Confirm Close</h2>
            <p>
              Are you sure you want to close? Your current score will be lost.
            </p>
            <div className='modal-buttons'>
              <button onClick={handleConfirmClose}>Yes, Close</button>
              <button onClick={handleCancelClose} className='secondary'>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Pacman
