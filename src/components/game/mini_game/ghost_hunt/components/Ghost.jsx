import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './Ghost.css'
// Import ghost image from the correct path
import ghostImage from './ghost.png'

const Ghost = ({
  id,
  type,
  x,
  y,
  speed,
  direction,
  points,
  color,
  size,
  onCatch,
  onRemove,
  isPaused = false,
  gameAreaRef
}) => {
  const [position, setPosition] = useState({ x, y })
  const [currentDirection, setCurrentDirection] = useState(direction)
  const [isCaught, setIsCaught] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)
  const animationRef = useRef(null)
  const lastUpdateRef = useRef(0)

  // Preload ghost image
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImageLoaded(true)
    }
    img.onerror = (e) => {
      console.error('Ghost image failed to preload for:', id)
      console.error('Error:', e)
      setImageLoaded(false)
    }
    img.src = ghostImage
  }, [id])

  // Ultra-smooth movement with frame rate limiting
  const moveGhost = (timestamp) => {
    if (isPaused || isCaught) return

    // Limit to 60fps for smooth movement
    if (timestamp - lastUpdateRef.current < 16) {
      animationRef.current = requestAnimationFrame(moveGhost)
      return
    }
    lastUpdateRef.current = timestamp

    setPosition((prevPos) => {
      const newX = prevPos.x + Math.cos(currentDirection) * speed * 2
      const newY = prevPos.y + Math.sin(currentDirection) * speed * 2

      // Get game area bounds
      const gameArea = gameAreaRef?.current
      if (!gameArea) {
        // Use window dimensions as fallback
        const windowWidth = window.innerWidth
        const windowHeight = window.innerHeight
        const ghostSize = 160 // 2x bigger

        let newDirection = currentDirection
        let boundedX = newX
        let boundedY = newY

        // Smooth wall bouncing
        if (newX <= ghostSize / 2) {
          newDirection =
            Math.PI - currentDirection + (Math.random() - 0.5) * 0.2
          boundedX = ghostSize / 2
        } else if (newX >= windowWidth - ghostSize / 2) {
          newDirection =
            Math.PI - currentDirection + (Math.random() - 0.5) * 0.2
          boundedX = windowWidth - ghostSize / 2
        }

        if (newY <= ghostSize / 2) {
          newDirection = -currentDirection + (Math.random() - 0.5) * 0.2
          boundedY = ghostSize / 2
        } else if (newY >= windowHeight - ghostSize / 2) {
          newDirection = -currentDirection + (Math.random() - 0.5) * 0.2
          boundedY = windowHeight - ghostSize / 2
        }

        // Very gentle direction changes (1% chance per frame)
        if (Math.random() < 0.01) {
          newDirection += (Math.random() - 0.5) * 0.1
        }

        setCurrentDirection(newDirection)

        return {
          x: boundedX,
          y: boundedY
        }
      }

      const gameRect = gameArea.getBoundingClientRect()
      const ghostSize = 160 // 2x bigger

      let newDirection = currentDirection
      let boundedX = newX
      let boundedY = newY

      // Smooth wall bouncing
      if (newX <= ghostSize / 2) {
        newDirection = Math.PI - currentDirection + (Math.random() - 0.5) * 0.2
        boundedX = ghostSize / 2
      } else if (newX >= gameRect.width - ghostSize / 2) {
        newDirection = Math.PI - currentDirection + (Math.random() - 0.5) * 0.2
        boundedX = gameRect.width - ghostSize / 2
      }

      if (newY <= ghostSize / 2) {
        newDirection = -currentDirection + (Math.random() - 0.5) * 0.2
        boundedY = ghostSize / 2
      } else if (newY >= gameRect.height - ghostSize / 2) {
        newDirection = -currentDirection + (Math.random() - 0.5) * 0.2
        boundedY = gameRect.height - ghostSize / 2
      }

      // Very gentle direction changes (1% chance per frame)
      if (Math.random() < 0.01) {
        newDirection += (Math.random() - 0.5) * 0.1
      }

      setCurrentDirection(newDirection)

      return {
        x: boundedX,
        y: boundedY
      }
    })
  }

  // Ultra-smooth animation loop
  useEffect(() => {
    if (!isPaused && !isCaught) {
      const animate = (timestamp) => {
        moveGhost(timestamp)
        animationRef.current = requestAnimationFrame(animate)
      }
      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPaused, isCaught, speed, currentDirection])

  // Handle ghost click
  const handleClick = (e) => {
    e.stopPropagation()
    if (isCaught) return

    setIsCaught(true)

    // Add catch animation
    setTimeout(() => {
      if (onCatch) {
        onCatch(id, type, points)
      }
      setIsVisible(false)
      setTimeout(() => {
        if (onRemove) {
          onRemove(id)
        }
      }, 300)
    }, 200)
  }

  // Fade out effect when ghost expires
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        if (onRemove) {
          onRemove(id)
        }
      }, 500)
    }, 6000) // 6 second lifespan

    return () => clearTimeout(timer)
  }, [id, onRemove])

  // Animation variants - NO ROTATION
  const ghostVariants = {
    initial: {
      scale: 0,
      opacity: 0,
      y: 0
    },
    animate: {
      scale: 1,
      opacity: 1,
      y: [0, -10, 0], // Only vertical floating, no rotation
      transition: {
        scale: { duration: 0.3, ease: 'easeOut' },
        opacity: { duration: 0.3, ease: 'easeOut' },
        y: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
      }
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: 'easeIn'
      }
    },
    caught: {
      scale: [1, 1.3, 0],
      opacity: [1, 0.8, 0],
      transition: {
        duration: 0.6,
        ease: 'easeInOut'
      }
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        className='ghost-game-ghost'
        style={{
          left: position.x,
          top: position.y,
          width: '160px', // 2x bigger
          height: '160px', // 2x bigger
          position: 'absolute',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '6rem', // 2x bigger emoji
          zIndex: 5
        }}
        variants={ghostVariants}
        initial='initial'
        animate={isCaught ? 'caught' : 'animate'}
        exit='exit'
        onClick={handleClick}
        whileHover={{
          scale: 1.1,
          transition: { duration: 0.2 }
        }}
        whileTap={{
          scale: 0.95,
          transition: { duration: 0.1 }
        }}
      >
        {imageLoaded ? (
          <motion.img
            src={ghostImage}
            alt='Ghost'
            className='ghost-game-ghost-image'
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <motion.div
            className='ghost-game-ghost-fallback'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            👻
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default Ghost
