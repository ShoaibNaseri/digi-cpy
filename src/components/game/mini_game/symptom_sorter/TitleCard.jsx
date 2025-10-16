import React, { useState, useEffect, useRef } from 'react'
import './titlecard.css'
import { createTypingAnimation } from '@/utils/typingAnimation'

const TitleCard = ({ titleCardData, dialogBoxImg, onStart, narrationFile }) => {
  const [typedDescription, setTypedDescription] = useState('')
  const [isTypingContent, setIsTypingContent] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const typingAnimationController = useRef(null)
  const narrationRef = useRef(null)
  const animationStarted = useRef(false)

  // Fallback description in case something goes wrong
  const fallbackDescription =
    'Digipalz, your goal is to sort and drag the emotional symptoms to the left column and the physical symptoms to the right column in 90 seconds. Good luck!'

  useEffect(() => {
    // Don't show any text initially to make space for the animation
    setTypedDescription('')
    setIsTypingContent(true)

    let typingDuration = 5 // Default 5 seconds if no narration
    let typingComplete = false
    let narrationComplete = false

    const checkBothComplete = () => {
      if (typingComplete && narrationComplete) {
        setShowButton(true)
      }
    }

    const startAnimations = () => {

      // Start typing animation with narration duration
      const textToUse = titleCardData?.description || fallbackDescription
      startTypingAnimation(textToUse, typingDuration, () => {
        typingComplete = true
        checkBothComplete()
      })

      // Start narration if available
      if (narrationFile && narrationRef.current) {
        narrationRef.current.play().catch((err) => {
          console.error('Failed to play narration:', err)
          narrationComplete = true // Mark as complete if it fails
          checkBothComplete()
        })
      } else {
        // If no narration, mark as complete immediately
        narrationComplete = true
      }
    }

    // If we have narration, load it first to get duration
    if (narrationFile && narrationRef.current) {

      narrationRef.current.onloadedmetadata = () => {
        try {
          typingDuration = narrationRef.current.duration
        } catch (err) {
          console.error('Error getting audio duration:', err)
        }
      }

      narrationRef.current.onended = () => {
        narrationComplete = true
        checkBothComplete()
      }

      narrationRef.current.onerror = (e) => {
        console.error('Narration loading error:', e)
        narrationComplete = true // Mark as complete if it fails
        checkBothComplete()
      }

      // Load the audio
      narrationRef.current.load()
    }

    // Start both typing and narration after 1 second delay
    const startTimer = setTimeout(() => {
      startAnimations()
    }, 1000) // 1 second delay

    // Emergency fallback button timer in case something goes wrong
    const emergencyTimer = setTimeout(() => {
      if (!showButton) {
        setShowButton(true)
        if (typedDescription === '') {
          setTypedDescription(titleCardData?.description || fallbackDescription)
          setIsTypingContent(false)
        }
      }
    }, 15000) // 15 second emergency fallback

    return () => {
      clearTimeout(startTimer)
      clearTimeout(emergencyTimer)
      if (typingAnimationController.current) {
        typingAnimationController.current.stop()
      }
      if (narrationRef.current) {
        narrationRef.current.pause()
      }
    }
  }, [])

  const startTypingAnimation = (description, duration, onComplete) => {
    // Prevent multiple animation starts
    if (animationStarted.current) {
      return
    }

    animationStarted.current = true
    // Use fallback if no description
    const textToUse = description || fallbackDescription

    // Stop any existing animation
    if (typingAnimationController.current) {
      typingAnimationController.current.stop()
    }

    // Reset states
    setTypedDescription('')
    setIsTypingContent(true)
    setShowButton(false)

    // Create animation
    try {
      typingAnimationController.current = createTypingAnimation({
        content: textToUse,
        durationSeconds: duration, // Already in seconds
        onUpdate: (newText) => {
          setTypedDescription(newText)
        },
        onComplete: () => {
          setIsTypingContent(false)
          if (onComplete) onComplete()
        }
      })

      typingAnimationController.current.start()
    } catch (error) {
      console.error('Error creating typing animation:', error)
      // Fallback to showing full text
      setTypedDescription(textToUse)
      setIsTypingContent(false)
      if (onComplete) onComplete()
    }
  }

  const handleStartClick = () => {
    if (narrationRef.current) {
      narrationRef.current.pause()
    }
    onStart()
  }

  return (
    <div className='title-card-container'>
      <div className='title-card-symptom'>
        <div className='title-card-content'>
          <div
            className='title-card-dialog'
            style={{ backgroundImage: `url(${dialogBoxImg})` }}
          >
            <h1 className='title-card-title-symptom'>
              {titleCardData?.title || 'Symptom Sorter'}
            </h1>
            <div className='title-card-description'>
              {typedDescription}
              {isTypingContent && <span className='typing-cursor'> |</span>}
            </div>

            {showButton && (
              <button className='title-card-button' onClick={handleStartClick}>
                Start Game
              </button>
            )}

            {/* Hidden audio element for narration */}
            <audio
              ref={narrationRef}
              src={narrationFile}
              preload='auto'
              onError={(e) => console.error('Audio element error:', e)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TitleCard
