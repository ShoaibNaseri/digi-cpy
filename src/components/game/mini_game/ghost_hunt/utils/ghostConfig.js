// Ghost Configuration - Single Ghost Type with Random Edge Spawning

export const GHOST_TYPES = {
  friendly: {
    speed: 1.2, // Smooth speed
    points: 10,
    color: '#4CAF50',
    size: 'medium',
    image: '/src/components/game/mini_game/ghost_hunt/ghost.png',
    spawnWeight: 100, // 100% chance to spawn (only type)
    lifespan: 8000, // 8 seconds
    description: 'Catch the friendly ghost!'
  }
}

export const GAME_CONFIG = {
  duration: 60, // seconds
  maxGhosts: 5, // Good number for 2x bigger ghosts
  spawnRate: 2500, // Good spawn rate
  comboTimeout: 2000, // milliseconds to maintain combo
  difficulty: 'easy',
  screenPadding: 200, // Increased padding for 2x bigger ghosts
  ghostSizes: {
    medium: 160 // 2x bigger size
  }
}

export const DIFFICULTY_LEVELS = {
  easy: {
    spawnRate: 2500,
    maxGhosts: 4,
    ghostSpeedMultiplier: 1,
    comboTimeout: 3000
  },
  medium: {
    spawnRate: 2000,
    maxGhosts: 5,
    ghostSpeedMultiplier: 1.2,
    comboTimeout: 2500
  },
  hard: {
    spawnRate: 1500,
    maxGhosts: 6,
    ghostSpeedMultiplier: 1.5,
    comboTimeout: 2000
  }
}

// Helper function to get random ghost type (always friendly now)
export const getRandomGhostType = () => {
  return 'friendly' // Only one type
}

// Helper function to get spawn position - RANDOM EDGE SPAWNING
export const getSpawnPosition = (gameAreaRef) => {
  if (!gameAreaRef?.current) {
    // Use window dimensions as fallback
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    const ghostSize = 160
    const padding = 100

    // Random edge selection (0: top, 1: right, 2: bottom, 3: left)
    const edge = Math.floor(Math.random() * 4)

    switch (edge) {
      case 0: // top edge
        return {
          x: Math.random() * (windowWidth - padding * 2) + padding,
          y: padding
        }
      case 1: // right edge
        return {
          x: windowWidth - padding,
          y: Math.random() * (windowHeight - padding * 2) + padding
        }
      case 2: // bottom edge
        return {
          x: Math.random() * (windowWidth - padding * 2) + padding,
          y: windowHeight - padding
        }
      case 3: // left edge
        return {
          x: padding,
          y: Math.random() * (windowHeight - padding * 2) + padding
        }
      default:
        return {
          x: Math.random() * (windowWidth - padding * 2) + padding,
          y: Math.random() * (windowHeight - padding * 2) + padding
        }
    }
  }

  const gameRect = gameAreaRef.current.getBoundingClientRect()
  const padding = GAME_CONFIG.screenPadding
  const ghostSize = 160

  // Random edge selection (0: top, 1: right, 2: bottom, 3: left)
  const edge = Math.floor(Math.random() * 4)

  switch (edge) {
    case 0: // top edge
      const topX = Math.random() * (gameRect.width - padding * 2) + padding

      return {
        x: topX,
        y: padding
      }
    case 1: // right edge
      const rightY = Math.random() * (gameRect.height - padding * 2) + padding

      return {
        x: gameRect.width - padding,
        y: rightY
      }
    case 2: // bottom edge
      const bottomX = Math.random() * (gameRect.width - padding * 2) + padding

      return {
        x: bottomX,
        y: gameRect.height - padding
      }
    case 3: // left edge
      const leftY = Math.random() * (gameRect.height - padding * 2) + padding

      return {
        x: padding,
        y: leftY
      }
    default:
      return {
        x: Math.random() * (gameRect.width - padding * 2) + padding,
        y: Math.random() * (gameRect.height - padding * 2) + padding
      }
  }
}

// Helper function to get random direction
export const getRandomDirection = () => {
  return Math.random() * Math.PI * 2
}

// Helper function to calculate combo multiplier
export const getComboMultiplier = (combo) => {
  return Math.min(combo + 1, 3) // Max 3x multiplier
}

// Helper function to calculate final points
export const calculatePoints = (ghostType, combo) => {
  const basePoints = GHOST_TYPES[ghostType].points
  const multiplier = getComboMultiplier(combo)
  return basePoints * multiplier
}
