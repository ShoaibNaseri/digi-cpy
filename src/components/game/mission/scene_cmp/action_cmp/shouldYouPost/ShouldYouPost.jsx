import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './ShouldYouPost.css'
import post1 from '@/assets/game/action_imgs/shouldYouPost/Should-you-post-1-highres.png'
import post1b from '@/assets/game/action_imgs/shouldYouPost/Should-you-post-1b-highres.png'
import post2 from '@/assets/game/action_imgs/shouldYouPost/Should-you-post-2-highres.png'
import post2b from '@/assets/game/action_imgs/shouldYouPost/Should-you-post-2b-highres.png'
// import post3 from '@/assets/game/action_imgs/shouldYouPost/Should-you-post-3-highres.png'
// import post3b from '@/assets/game/action_imgs/shouldYouPost/Should-you-post-3b-highres.png'
import post4 from '@/assets/game/action_imgs/shouldYouPost/Should-you-post-4-highres.png'
import post4b from '@/assets/game/action_imgs/shouldYouPost/Should-you-post-4b-highres.png'
import post5 from '@/assets/game/action_imgs/shouldYouPost/Should-you-post-5-highres.png'
import post5b from '@/assets/game/action_imgs/shouldYouPost/Should-you-post-5b-highres.png'

import post1Correct from '@/assets/game/action_narrations/Astra_1821.mp3'
import post1Wrong from '@/assets/game/action_narrations/Astra_1824.mp3'
import post2Correct from '@/assets/game/action_narrations/Astra_1826.mp3'
import post2Wrong from '@/assets/game/action_narrations/Astra_1899.mp3'
import post4Correct from '@/assets/game/action_narrations/Astra_1828.mp3'
import post4Wrong from '@/assets/game/action_narrations/Astra_1821.mp3'
import post5Correct from '@/assets/game/action_narrations/Astra_1829.mp3'
import post5Wrong from '@/assets/game/action_narrations/Astra_1830.mp3'

const posts = [
  {
    id: 1,
    optionA: post1,
    optionB: post1b,
    correctOption: 'A',
    correctSound: post1Correct,
    wrongSound: post1Wrong
  },
  {
    id: 2,
    optionA: post2,
    optionB: post2b,
    correctOption: 'A',
    correctSound: post2Correct,
    wrongSound: post2Wrong
  },
  {
    id: 4,
    optionA: post4,
    optionB: post4b,
    correctOption: 'B',
    correctSound: post4Correct,
    wrongSound: post4Wrong
  },
  {
    id: 5,
    optionA: post5,
    optionB: post5b,
    correctOption: 'B',
    correctSound: post5Correct,
    wrongSound: post5Wrong
  }
]

const ShouldYouPost = ({ onComplete }) => {
  const [currentPostIndex, setCurrentPostIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const audioRef = useRef(null)

  // Preload all assets
  useEffect(() => {
    const loadAssets = async () => {
      const imagePromises = []
      const audioPromises = []

      posts.forEach((post) => {
        // Load images
        imagePromises.push(
          new Promise((resolve, reject) => {
            const imgA = new Image()
            imgA.onload = resolve
            imgA.onerror = reject
            imgA.src = post.optionA
          }),
          new Promise((resolve, reject) => {
            const imgB = new Image()
            imgB.onload = resolve
            imgB.onerror = reject
            imgB.src = post.optionB
          })
        )

        // Load audio
        audioPromises.push(
          fetch(post.correctSound).then((res) => res.blob()),
          fetch(post.wrongSound).then((res) => res.blob())
        )
      })

      try {
        await Promise.all([...imagePromises, ...audioPromises])
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading assets:', error)
        setIsLoading(false)
      }
    }

    loadAssets()
  }, [])

  const handleOptionSelect = async (option) => {
    if (selectedOption) return // Prevent multiple selections

    setSelectedOption(option)
    const currentPost = posts[currentPostIndex]
    const isCorrect = option === currentPost.correctOption
    const soundToPlay = isCorrect
      ? currentPost.correctSound
      : currentPost.wrongSound

    // Play sound
    if (audioRef.current) {
      audioRef.current.src = soundToPlay
      try {
        await audioRef.current.play()

        // Wait for audio to finish
        audioRef.current.onended = () => {
          handleNextPost()
        }
      } catch (error) {
        console.error('Error playing audio:', error)
        // Move to next post even if audio fails
        setTimeout(handleNextPost, 1500)
      }
    }
  }

  const handleNextPost = () => {
    if (currentPostIndex < posts.length - 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentPostIndex((prev) => prev + 1)
        setSelectedOption(null)
        setIsTransitioning(false)
      }, 300)
    } else {
      // All posts completed
      if (onComplete) {
        onComplete()
      }
    }
  }

  if (isLoading) {
    return (
      <motion.div
        className='should-you-post-loading'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className='loading-spinner'></div>
        <p>Loading posts...</p>
      </motion.div>
    )
  }

  const currentPost = posts[currentPostIndex]

  return (
    <motion.div
      className='should-you-post-container'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <audio ref={audioRef} />

      <motion.h2
        className='should-you-post-title'
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Should You Post This?
      </motion.h2>

      <motion.div
        className='post-counter'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Post {currentPostIndex + 1} of {posts.length}
      </motion.div>

      <AnimatePresence mode='wait'>
        <motion.div
          key={currentPost.id}
          className='posts-wrapper'
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={`post-option ${
              selectedOption === 'A' ? 'selected' : ''
            } ${
              selectedOption && currentPost.correctOption === 'A'
                ? 'correct'
                : ''
            } ${
              selectedOption === 'A' && currentPost.correctOption !== 'A'
                ? 'incorrect'
                : ''
            }`}
            onClick={() => handleOptionSelect('A')}
            whileHover={!selectedOption ? { scale: 1.02 } : {}}
            whileTap={!selectedOption ? { scale: 0.98 } : {}}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <img src={currentPost.optionA} alt='Option A' />
            {selectedOption === 'A' && (
              <motion.div
                className='selection-indicator'
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {currentPost.correctOption === 'A' ? '✓' : '✗'}
              </motion.div>
            )}
          </motion.div>

          <motion.div
            className='vs-divider'
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span>OR</span>
          </motion.div>

          <motion.div
            className={`post-option ${
              selectedOption === 'B' ? 'selected' : ''
            } ${
              selectedOption && currentPost.correctOption === 'B'
                ? 'correct'
                : ''
            } ${
              selectedOption === 'B' && currentPost.correctOption !== 'B'
                ? 'incorrect'
                : ''
            }`}
            onClick={() => handleOptionSelect('B')}
            whileHover={!selectedOption ? { scale: 1.02 } : {}}
            whileTap={!selectedOption ? { scale: 0.98 } : {}}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <img src={currentPost.optionB} alt='Option B' />
            {selectedOption === 'B' && (
              <motion.div
                className='selection-indicator'
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {currentPost.correctOption === 'B' ? '✓' : '✗'}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <motion.div
        className='.should-you-post-progress-bar'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <motion.div
          className='.should-you-post-progress-fill'
          initial={{ width: 0 }}
          animate={{
            width: `${((currentPostIndex + 1) / posts.length) * 100}%`
          }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>
    </motion.div>
  )
}

export default ShouldYouPost
