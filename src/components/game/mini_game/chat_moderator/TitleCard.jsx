import { useState, useEffect, useRef } from 'react'
import { FaArrowRight } from 'react-icons/fa'
import { createTypingAnimation } from '@/utils/typingAnimation'

const TitleCard = ({
  titleCardsData,
  titleCardIndex,
  dialogBoxImg,
  onNext,
  onStart
}) => {
  const [typedDescription, setTypedDescription] = useState('')
  const [isTypingContent, setIsTypingContent] = useState(false)
  const [showButtons, setShowButtons] = useState(false)
  const [narrationDuration, setNarrationDuration] = useState(null)
  const typingAnimationController = useRef(null)
  const narrationRef = useRef(null)

  const currentTitleCard = titleCardsData[titleCardIndex] || {}

  useEffect(() => {
    // Reset state when title card index changes
    setShowButtons(false)
    setTypedDescription('')
    setIsTypingContent(false)

    // Play narration with a short delay
    setTimeout(() => {
      playNarration()
    }, 300)

    // Cleanup function
    return () => {
      if (typingAnimationController.current) {
        typingAnimationController.current.stop()
      }
      if (narrationRef.current) {
        narrationRef.current.pause()
      }
    }
  }, [titleCardIndex, titleCardsData])

  const startTypingAnimation = (description, duration) => {
    // Stop any existing animation
    if (typingAnimationController.current) {
      typingAnimationController.current.stop()
    }

    // Reset states
    setTypedDescription('')
    setIsTypingContent(true)
    setShowButtons(false)

    // Create and start new animation
    typingAnimationController.current = createTypingAnimation({
      content: description,
      durationSeconds: duration / 1000 || 5, // Convert ms to seconds, default 5s
      onUpdate: (newTypedContent) => {
        setTypedDescription(newTypedContent)
      },
      onComplete: () => {
        setIsTypingContent(false)
        // Only show buttons after typing is complete
        setTimeout(() => {
          setShowButtons(true)
        }, 100)
      },
      onTick: () => {
        // Optional sound effect logic can go here
      }
    })

    typingAnimationController.current.start()
  }

  const playNarration = () => {
    try {
      // Hide buttons immediately when narration starts
      setShowButtons(false)

      if (!narrationRef.current) return

      const narrationFile = currentTitleCard?.narration
      if (!narrationFile) {
        console.error('No narration file found')
        return
      }

      // Ensure valid path
      let fullPath =
        narrationFile.startsWith('/') || narrationFile.startsWith('http')
          ? narrationFile
          : `/assets/${narrationFile}`

      narrationRef.current.src = fullPath

      // Capture duration when metadata is loaded
      narrationRef.current.onloadedmetadata = () => {
        const duration = narrationRef.current.duration * 1000
        setNarrationDuration(duration)

        // Start typing animation with the description and duration
        const currentDescription = currentTitleCard?.description || ''
        startTypingAnimation(currentDescription, duration)
      }

      narrationRef.current.onerror = (e) => {
        console.error('Error playing narration:', e)
        // If narration fails, still show description with a default duration
        const currentDescription = currentTitleCard?.description || ''
        startTypingAnimation(currentDescription, 5000) // Default 5 seconds
      }

      narrationRef.current.play().catch((err) => {
        console.error('Failed to play narration:', err)
        // If narration fails, still show description with a default duration
        const currentDescription = currentTitleCard?.description || ''
        startTypingAnimation(currentDescription, 5000) // Default 5 seconds
      })
    } catch (err) {
      console.error('Error in playNarration:', err)
      // Try to show typing animation with default duration
      try {
        const currentDescription = currentTitleCard?.description || ''
        startTypingAnimation(currentDescription, 5000) // Default 5 seconds
      } catch (innerErr) {
        console.error('Failed to start typing animation after error:', innerErr)
        // Only set showButtons as true if everything else fails
        setTimeout(() => setShowButtons(true), 3000)
      }
    }
  }

  const handleNextClick = () => {
    if (narrationRef.current) {
      narrationRef.current.pause()
    }
    onNext()
  }

  const handleStartClick = () => {
    if (narrationRef.current) {
      narrationRef.current.pause()
    }
    onStart()
  }

  return (
    <div className='title-card-container'>
      <div
        className='title-card'
        style={{ backgroundImage: `url(${dialogBoxImg})` }}
      >
        <audio
          ref={narrationRef}
          onError={(e) => console.error('Audio error in JSX:', e)}
        />
        <h1>
          {currentTitleCard.title || 'Welcome to the Chat Moderator Game'}
        </h1>
        <div className='title-card-p'>
          {typedDescription}
          {isTypingContent && <span className='typing-cursor'> |</span>}
        </div>
        {titleCardIndex === 0 ? (
          <button
            className='title-card-button'
            onClick={handleNextClick}
            style={{ display: showButtons ? 'flex' : 'none' }}
          >
            <span>LET'S GO</span>
            <FaArrowRight />
          </button>
        ) : (
          <button
            className='title-card-button'
            onClick={handleStartClick}
            style={{ display: showButtons ? 'flex' : 'none' }}
          >
            LET'S BEGIN!
          </button>
        )}
      </div>
    </div>
  )
}

export default TitleCard
