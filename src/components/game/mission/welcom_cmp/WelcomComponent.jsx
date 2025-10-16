import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { createTypingAnimation } from '@/utils/typingAnimation'
import { useDeviceRotation } from '@/utils/deviceRotation'
import { FaPlay } from 'react-icons/fa'
import './welcomeComponent.css'
import { saveMissionProgressUniversal } from '@/utils/missionProgressUtils'
import GamePreloader from '@/components/common/GamePreloader'
// Removed the local import of mission data since we're getting it from props

const WelcomComponent = ({
  mainBackground,
  onComplete,
  missionData,
  interfaceBG,
  robotroImage,
  currentStep
}) => {
  const [titleText, setTitleText] = useState('')
  const [typedContent, setTypedContent] = useState('')
  const [isTypingContent, setIsTypingContent] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const typingAnimationController = useRef(null)
  const textContainerRef = useRef(null) // Ref for the text area if needed for scrolling
  const audioRef = useRef(new Audio())
  const [isLoading, setIsLoading] = useState(true)
  const [loadingContent, setLoadingContent] = useState(
    'Saving mission progress...'
  )
  const { missionId } = useParams()
  // Use the rotation hook
  const needsRotation = useDeviceRotation()

  // --- Placeholder Functions (Implement or Remove if not needed) ---
  const playSoundEffect = (type) => {
    // Replace with actual sound logic
  }

  // Effect for typing animation
  useEffect(() => {
    // Check for rotation or missing mission data
    if (
      needsRotation ||
      !missionData ||
      !missionData.title ||
      !missionData.welcome_message
    ) {
      // Stop animation if running
      if (typingAnimationController.current) {
        typingAnimationController.current.stop()
      }
      // Stop narration if playing
      if (audioRef.current.src) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      // Reset states

      setIsTypingContent(false)
      setShowControls(false)
      setTitleText('') // Clear title if rotating or no data
      setTypedContent('') // Clear content

      // Set default text if data is missing but rotation is ok
      if (!missionData && !needsRotation) {
        setTitleText('Mission Data Missing') // Provide informative title
        setTypedContent('Could not load mission details.')
      }
      return // Exit effect early
    }

    // --- Start Typing Animation ---
    const title = missionData.title
    const content = missionData.welcome_message
    const narration = missionData.narration
    const desiredDuration = missionData.duration || 10 // Example: 10 seconds

    // Set title immediately
    setTitleText(title)

    // Stop any previous animation
    if (typingAnimationController.current) {
      typingAnimationController.current.stop()
    }

    // Reset states before starting new animation
    setTypedContent('')
    setIsTypingContent(true)
    setShowControls(false)

    // Add 1 second delay before starting narration and typing
    const delayTimeout = setTimeout(() => {
      // Play narration after delay
      if (!needsRotation && narration) {
        audioRef.current.src = `/assets/${narration}`
        audioRef.current.currentTime = 0
        audioRef.current.play().catch((err) => {
          console.error('Error playing audio:', err)
        })
      }

      // Create and start the typing animation controller after delay
      typingAnimationController.current = createTypingAnimation({
        content: content,
        durationSeconds: desiredDuration,
        onUpdate: (newTypedContent) => {
          setTypedContent(newTypedContent)
          // Auto-scroll logic (optional)
          if (textContainerRef.current) {
            textContainerRef.current.scrollTop =
              textContainerRef.current.scrollHeight
          }
        },
        onComplete: () => {
          setIsTypingContent(false)
          playSoundEffect('complete')
          setTimeout(() => setShowControls(true), 500)
        },
        onTick: () => {
          // playSoundEffect('typing') // Maybe too noisy? Uncomment if needed
        }
      })

      // Start the animation
      typingAnimationController.current.start()
    }, 1000) // 1 second delay

    // Cleanup function
    return () => {
      clearTimeout(delayTimeout)
      if (typingAnimationController.current) {
        typingAnimationController.current.stop()
      }
      setIsTypingContent(false) // Ensure state is reset
    }
    // Re-run if mission data changes, rotation status changes
  }, [missionData, needsRotation]) // Dependency on missionData from props
  useEffect(() => {
    setTimeout(() => {
      setLoadingContent('Saving mission progress...')
      const missionDatas = {
        missionId: missionId,
        step: currentStep,
        progress: 10
      }
      saveMissionProgressUniversal(missionDatas)
      setIsLoading(false)
    }, 1000)
  }, [])
  const handleFinish = () => {
    playSoundEffect('click')
    if (onComplete) {
      onComplete(missionData?.next_scene) // Call the callback passed via props
    } else {
      console.warn('WelcomComponent: onFinish prop not provided.') // Warn if handler is missing
    }
  }

  // --- Component Return ---
  return (
    <>
      {needsRotation && (
        <div className='rotation-overlay'>
          <span className='rotation-icon'>🔄</span>
          <p>Please rotate your device to landscape mode.</p>
        </div>
      )}
      {!needsRotation && (
        <div
          className='content-container'
          style={{
            backgroundImage: interfaceBG ? `url(${interfaceBG})` : 'none'
          }}
        >
          {isLoading && (
            <GamePreloader content={loadingContent} isLoading={isLoading} />
          )}
          <div className='final-content-block'>
            {/* Display Title - Ensure titleText state is updated */}
            <h1>{titleText ? titleText.toUpperCase() : 'LOADING...'}</h1>
            <div ref={textContainerRef} className='final-text-area'>
              {typedContent.split('\n').map((line, index) => (
                // Use index for key only if lines don't change order/identity
                <p key={index}>{line || '\u00A0'}</p> // Render empty lines correctly
              ))}
              {/* Cursor visibility based on typing state */}
              <span
                className={`final-cursor ${isTypingContent ? '' : 'hidden'}`}
              >
                _
              </span>
            </div>
          </div>

          {/* Controls (Finish Button) - Conditionally render based on showControls */}

          <div className='final-controls'>
            <button
              style={{ visibility: showControls ? 'visible' : 'hidden' }}
              className='final-button'
              onClick={handleFinish}
            >
              <span className='btn-icon'>
                <FaPlay size={20} />
              </span>{' '}
              START
            </button>
          </div>
          <div className='welcome-final-image'>
            {/* <img src={robotroImage} alt='Robotoro' /> */}
          </div>
        </div>
      )}
    </>
  )
}

export default WelcomComponent
