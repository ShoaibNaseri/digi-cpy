// --- Constants ---
export const CELL_SIZE = 60
export const PACMAN_SIZE = Math.floor(CELL_SIZE * 0.8)
export const GHOST_SIZE = Math.floor(CELL_SIZE * 0.7)
export const DOT_SIZE = Math.floor(CELL_SIZE * 0.45)
export const BLOCK_POWERUP_SIZE = Math.floor(CELL_SIZE * 0.9)
export const LINE_THICKNESS = 12
export const PACMAN_SPEED = CELL_SIZE * 4.5
export const PHONE_COUNTDOWN_DURATION = 3
export const IMMUNITY_DURATION = 5
export const GHOST_FREEZE_DURATION = 10
export const GHOST_MOVE_INTERVAL = 300
export const DOT_ANIMATION_DURATION = 300

export const mazeLayout = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1],
  [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]

export const powerupGridPositions = [
  { id: 'bp-1', row: 3, col: 3 },
  { id: 'bp-2', row: 7, col: 15 }
]

// --- Helper Functions ---

// Get grid coords from pixel coords (center-based)
export const getGridCoords = (pixelPos, size, cellSize) => {
  const centerX = pixelPos.left + size / 2
  const centerY = pixelPos.top + size / 2
  const col = Math.floor(centerX / cellSize)
  const row = Math.floor(centerY / cellSize)
  return { row, col }
}

// Get pixel coords for center of a grid cell
export const getCenterPixelCoords = (gridCoords, cellSize) => {
  const left = gridCoords.col * cellSize + cellSize / 2
  const top = gridCoords.row * cellSize + cellSize / 2
  return { top, left }
}

// Calculate initial Pacman start position
export const calculateStartPosition = (layout, pacmanSize, cellSize) => {
  for (let y = 0; y < layout.length; y++) {
    for (let x = 0; x < layout[y].length; x++) {
      if (layout[y][x] === 0) {
        const centerCoords = getCenterPixelCoords({ row: y, col: x }, cellSize)
        return {
          top: centerCoords.top - pacmanSize / 2,
          left: centerCoords.left - pacmanSize / 2
        }
      }
    }
  }
  // Fallback if no path found (shouldn't happen with valid maze)
  const fallbackCenter = getCenterPixelCoords({ row: 1, col: 1 }, cellSize)
  return {
    top: fallbackCenter.top - pacmanSize / 2,
    left: fallbackCenter.left - pacmanSize / 2
  }
}

// Calculate initial dot positions
export const calculateInitialDots = (
  layout,
  powerupPositions,
  cellSize,
  dotSize
) => {
  const dots = []
  layout.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === 0) {
        const isPowerupLocation = powerupPositions.some(
          (p) => p.row === y && p.col === x
        )
        if (!isPowerupLocation) {
          dots.push({
            id: `dot-${y}-${x}`,
            top: y * cellSize + cellSize / 2 - dotSize / 2,
            left: x * cellSize + cellSize / 2 - dotSize / 2,
            collected: false
          })
        }
      }
    })
  })
  return dots
}

// Check for wall collision
export const isWallCollision = (pos, size, layout, cellSize, lineThickness) => {
  const buffer = Math.max(2, Math.floor(lineThickness / 2) + 1)
  const minX = Math.floor((pos.left + buffer) / cellSize)
  const maxX = Math.floor((pos.left + size - buffer) / cellSize)
  const minY = Math.floor((pos.top + buffer) / cellSize)
  const maxY = Math.floor((pos.top + size - buffer) / cellSize)

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (
        y < 0 ||
        y >= layout.length ||
        x < 0 ||
        x >= layout[0].length ||
        (layout[y] && layout[y][x] === 1)
      ) {
        return true // Collision with boundary or wall
      }
    }
  }
  return false // No collision
}
