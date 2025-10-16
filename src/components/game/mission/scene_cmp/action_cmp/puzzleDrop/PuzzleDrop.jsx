import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import img1 from '@/assets/game/missions/mission_2/action_imgs/puzzle_drop/img1.png'
import img2 from '@/assets/game/missions/mission_2/action_imgs/puzzle_drop/img2.png'
import img3 from '@/assets/game/missions/mission_2/action_imgs/puzzle_drop/img3.png'
import price10 from '@/assets/game/missions/mission_2/action_imgs/puzzle_drop/price-10.png'
import price11 from '@/assets/game/missions/mission_2/action_imgs/puzzle_drop/price-11.png'
import price12 from '@/assets/game/missions/mission_2/action_imgs/puzzle_drop/price-12.png'

import sparkle from '@/assets/game/game_sounds/sparkle.wav'
import './PuzzleDrop.css'

const PuzzleDrop = ({ onComplete }) => {
  const [puzzles] = useState([
    { id: 1, img: img1, price: price10, alt: 'Puzzle piece 1' },
    { id: 2, img: img2, price: price11, alt: 'Puzzle piece 2' },
    { id: 3, img: img3, price: price12, alt: 'Puzzle piece 3' }
  ])

  const [visiblePuzzles, setVisiblePuzzles] = useState([])
  const [clickedPuzzles, setClickedPuzzles] = useState(new Set())
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const sparkleAudioRef = useRef(null)

  // Preload assets
  useEffect(() => {
    const preloadAssets = async () => {
      const imagePromises = puzzles.map((puzzle) => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = resolve
          img.onerror = reject
          img.src = puzzle.img
        })
      })

      // Add price image preloading
      const pricePromises = puzzles.map((puzzle) => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = resolve
          img.onerror = reject
          img.src = puzzle.price
        })
      })

      const audioPromise = new Promise((resolve, reject) => {
        const audio = new Audio(sparkle)
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

  // Drop puzzles one by one from top
  useEffect(() => {
    if (!assetsLoaded) return

    puzzles.forEach((_, index) => {
      setTimeout(() => {
        setVisiblePuzzles((prev) => [...prev, index])
      }, index * 800)
    })
  }, [assetsLoaded, puzzles])

  const handlePuzzleClick = (puzzleIndex) => {
    if (clickedPuzzles.has(puzzleIndex)) return

    // Play sparkle sound
    if (sparkleAudioRef.current) {
      sparkleAudioRef.current.currentTime = 0
      sparkleAudioRef.current.volume = 0.8
      sparkleAudioRef.current
        .play()
        .catch((e) => console.log('Audio play failed:', e))
    }

    // Mark puzzle as clicked
    setClickedPuzzles((prev) => new Set([...prev, puzzleIndex]))

    // Check if all puzzles are clicked
    if (clickedPuzzles.size + 1 === puzzles.length) {
      setTimeout(() => {
        onComplete?.()
      }, 2500)
    }
  }

  const getDropPosition = (index) => {
    const positions = [
      { x: -100, rotation: -15 },
      { x: 0, rotation: 0 },
      { x: 100, rotation: 15 }
    ]
    return positions[index] || positions[0]
  }

  if (!assetsLoaded) {
    return (
      <div className='puzzle-drop-loading'>
        <div className='loading-spinner'></div>
        <p>Loading puzzle pieces...</p>
      </div>
    )
  }

  return (
    <div className='puzzle-drop-container'>
      <audio ref={sparkleAudioRef} src={sparkle} preload='auto' />

      <div className='puzzles-display'>
        <AnimatePresence>
          {puzzles.map(
            (puzzle, index) =>
              visiblePuzzles.includes(index) && (
                <motion.div
                  key={puzzle.id}
                  className={`puzzle-wrapper ${
                    clickedPuzzles.has(index) ? 'clicked' : ''
                  }`}
                  initial={{
                    y: -window.innerHeight - 200,
                    x: getDropPosition(index).x,
                    rotate: getDropPosition(index).rotation,
                    opacity: 0.9
                  }}
                  animate={{
                    y: [-window.innerHeight - 200, 50, -20, 10, -5, 0],
                    x: getDropPosition(index).x,
                    rotate: 0,
                    opacity: 1
                  }}
                  transition={{
                    duration: 2,
                    times: [0, 0.6, 0.75, 0.85, 0.95, 1],
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                  whileHover={{
                    scale: 1.05,
                    y: -10,
                    transition: { duration: 0.3 }
                  }}
                  onClick={() => handlePuzzleClick(index)}
                >
                  {!clickedPuzzles.has(index) ? (
                    <>
                      <motion.img
                        src={puzzle.img}
                        alt={puzzle.alt}
                        className='puzzle-image'
                        whileTap={{ scale: 0.95 }}
                        initial={{ filter: 'brightness(0.9)' }}
                        animate={{ filter: 'brightness(1)' }}
                        transition={{ delay: 1, duration: 0.5 }}
                      />
                      {/* Puzzledrop price tag */}
                      <motion.div
                        className='puzzledrop-price-tag'
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 2.5, duration: 0.8 }}
                        whileHover={{
                          scale: 1.05,
                          rotate: 360,
                          x: '-50%',
                          transition: { duration: 0.6 }
                        }}
                      >
                        <img src={puzzle.price} alt={`${puzzle.alt} price`} />
                      </motion.div>
                    </>
                  ) : (
                    <motion.div
                      className='confetti-explosion'
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                    >
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={i}
                          className={`confetti-piece confetti-${i + 1}`}
                        ></div>
                      ))}
                      <div className='sparkle-container'>
                        {Array.from({ length: 15 }).map((_, i) => (
                          <div
                            key={i}
                            className={`sparkle sparkle-${i + 1}`}
                          ></div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
          )}
        </AnimatePresence>

        {/* Render price tags separately during exit to prevent position changes */}
        {puzzles.map(
          (puzzle, index) =>
            visiblePuzzles.includes(index) &&
            clickedPuzzles.has(index) && (
              <motion.div
                key={`price-${puzzle.id}`}
                className={`puzzledrop-price-tag puzzledrop-price-tag-exit puzzle-position-${index}`}
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
                <img src={puzzle.price} alt={`${puzzle.alt} price`} />
              </motion.div>
            )
        )}
      </div>
    </div>
  )
}

export default PuzzleDrop
