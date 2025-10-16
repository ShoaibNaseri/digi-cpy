import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './PostBook.css'
import confetti from '@/assets/game/game_sounds/confetti.wav'
import shining from '@/assets/game/game_sounds/shining.wav'

import img1 from '@/assets/game/missions/mission_2/action_imgs/post_books_action/book1.png'
import img2 from '@/assets/game/missions/mission_2/action_imgs/post_books_action/book2.png'
import img3 from '@/assets/game/missions/mission_2/action_imgs/post_books_action/book3.png'
import price10 from '@/assets/game/missions/mission_2/action_imgs/puzzle_drop/price-10.png'
import price11 from '@/assets/game/missions/mission_2/action_imgs/puzzle_drop/price-11.png'
import price12 from '@/assets/game/missions/mission_2/action_imgs/puzzle_drop/price-12.png'

const PostBook = ({ onComplete }) => {
  const [visibleBooks, setVisibleBooks] = useState([])
  const [clickedBooks, setClickedBooks] = useState(new Set())
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const confettiAudioRef = useRef(null)
  const shiningAudioRef = useRef(null)

  const books = [
    { id: 1, img: img1, alt: 'Book 1', position: 'left', price: price10 },
    { id: 2, img: img2, alt: 'Book 2', position: 'right', price: price11 },
    { id: 3, img: img3, alt: 'Book 3', position: 'top', price: price12 }
  ]

  // Preload assets
  useEffect(() => {
    const preloadAssets = async () => {
      const imagePromises = books.map((book) => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = resolve
          img.onerror = reject
          img.src = book.img
        })
      })

      const audioPromises = [
        new Promise((resolve, reject) => {
          const audio = new Audio(confetti)
          audio.addEventListener('canplaythrough', resolve)
          audio.addEventListener('error', reject)
          audio.load()
        }),
        new Promise((resolve, reject) => {
          const audio = new Audio(shining)
          audio.addEventListener('canplaythrough', resolve)
          audio.addEventListener('error', reject)
          audio.load()
        })
      ]

      try {
        await Promise.all([...imagePromises, ...audioPromises])
        setAssetsLoaded(true)
      } catch (error) {
        console.error('Error loading assets:', error)
        setAssetsLoaded(true) // Continue anyway
      }
    }

    preloadAssets()
  }, [])

  // Show books one by one with sound effects
  useEffect(() => {
    if (!assetsLoaded) return

    books.forEach((_, index) => {
      setTimeout(() => {
        // Start the book animation
        setVisibleBooks((prev) => [...prev, index])

        // Play shining sound effect after animation completes
        setTimeout(() => {
          if (shiningAudioRef.current) {
            shiningAudioRef.current.currentTime = 0
            shiningAudioRef.current.volume = 0.5
            shiningAudioRef.current
              .play()
              .catch((e) => console.log('Audio play failed:', e))
          }
        }, 1500) // Wait for animation to complete (1.5s duration)
      }, index * 800 + 300) // Added 300ms initial delay for all books
    })
  }, [assetsLoaded])

  const handleBookClick = (bookIndex) => {
    if (clickedBooks.has(bookIndex)) return

    // Play confetti sound
    if (confettiAudioRef.current) {
      confettiAudioRef.current.currentTime = 0
      confettiAudioRef.current.volume = 0.7
      confettiAudioRef.current
        .play()
        .catch((e) => console.log('Audio play failed:', e))
    }

    // Mark book as clicked
    setClickedBooks((prev) => new Set([...prev, bookIndex]))

    // Check if all books are clicked
    if (clickedBooks.size + 1 === books.length) {
      setTimeout(() => {
        onComplete?.()
      }, 3000) // Wait for confetti animation to complete
    }
  }

  const getInitialPosition = (index) => {
    switch (index) {
      case 0: // First book from left
        return { x: -window.innerWidth - 200, y: 0 }
      case 1: // Second book from right
        return { x: window.innerWidth + 200, y: 0 }
      case 2: // Third book from top (positions in middle)
        return { x: 0, y: -window.innerHeight - 200 }
      default:
        return { x: 0, y: 0 }
    }
  }

  const getAnimationConfig = (index) => {
    const baseConfig = {
      type: 'spring',
      stiffness: 80, // Increased from 50 for faster animation
      damping: 15, // Reduced from 18 for less resistance
      mass: 0.8, // Reduced from 1.2 for lighter feel
      duration: 1.5 // Reduced from 2.5 for faster animation
    }

    // Add slight bounce for kid-friendly feel
    return {
      ...baseConfig,
      bounce: 0.3,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }

  if (!assetsLoaded) {
    return (
      <div className='post-book-loading'>
        <div className='loading-spinner'></div>
        <p>Loading magical books...</p>
      </div>
    )
  }

  return (
    <div className='post-book-container'>
      <audio ref={confettiAudioRef} src={confetti} preload='auto' />
      <audio ref={shiningAudioRef} src={shining} preload='auto' />
      <div className='post-book-title'>
        <h1>Click on the books</h1>
      </div>
      <div className='books-display'>
        <AnimatePresence>
          {books.map(
            (book, index) =>
              visibleBooks.includes(index) && (
                <motion.div
                  key={book.id}
                  className={`book-wrapper ${
                    clickedBooks.has(index) ? 'clicked' : ''
                  } ${book.position}`}
                  initial={{
                    opacity: 0,
                    scale: 0.3,
                    ...getInitialPosition(index),
                    rotate: index === 2 ? 0 : index === 0 ? -15 : 15
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: 0,
                    y: 0,
                    rotate: 0
                  }}
                  transition={getAnimationConfig(index)}
                  whileHover={{
                    scale: 1.05,
                    rotateY: 5,
                    transition: { duration: 0.3 }
                  }}
                  onClick={() => handleBookClick(index)}
                >
                  {!clickedBooks.has(index) ? (
                    <>
                      <motion.img
                        src={book.img}
                        alt={book.alt}
                        className='book-image'
                        whileTap={{ scale: 0.95 }}
                        initial={{ filter: 'brightness(0.8)' }}
                        animate={{ filter: 'brightness(1)' }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                      />
                      <motion.img
                        src={book.price}
                        alt={`Price tag for ${book.alt}`}
                        className='postb-price-tag'
                        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{
                          delay: 1.8,
                          duration: 0.6,
                          type: 'spring',
                          stiffness: 200
                        }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      />
                    </>
                  ) : (
                    <div className='confetti-explosion'>
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div
                          key={i}
                          className={`confetti-piece confetti-${i + 1}`}
                        ></div>
                      ))}
                      <div className='sparkle-container'>
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div
                            key={i}
                            className={`sparkle sparkle-${i + 1}`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default PostBook
