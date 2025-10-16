import { useState, useEffect, useRef } from 'react'
import './missionBrief.css'
import { useParams } from 'react-router-dom'
import { createTypingAnimation } from '@/utils/typingAnimation'
import { useDeviceRotation } from '@/utils/deviceRotation'
import { saveMissionProgressUniversal } from '@/utils/missionProgressUtils'

const MissionBriefComponent = ({
  mainBackground,
  interfaceBG,
  data,
  onComplete,
  robotroImage,
  currentStep
}) => {
  const [titleText, setTitleText] = useState('')
  const [typedContent, setTypedContent] = useState('')
  const [isTypingContent, setIsTypingContent] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [currentBriefIndex, setCurrentBriefIndex] = useState(0) // Track current brief index
  const [briefCount, setBriefCount] = useState(0) // Total number of briefs
  const [imageLoaded, setImageLoaded] = useState(false) // Track image loading state
  const typingAnimationController = useRef(null)
  const textContainerRef = useRef(null) // Ref for the text area if needed for scrolling
  const narrationAudio = useRef(null) // Ref for audio element to play narration
  const imageRef = useRef(null) // Ref for the robotoro image
  // Use the rotation hook
  const needsRotation = useDeviceRotation()
  const { missionId } = useParams()
  // Sound effects
  const playSoundEffect = (type) => {}

  const saveProgress = async () => {
    const missionDatas = {
      missionId: missionId,
      step: currentStep,
      progress: 40
    }
    await saveMissionProgressUniversal(missionDatas)
  }

  // Preload the robotoro image to prevent partial loading
  useEffect(() => {
    if (robotroImage) {
      const img = new Image()
      img.onload = () => {
        setImageLoaded(true)
      }
      img.onerror = () => {
        console.warn('Failed to preload robotoro image')
        setImageLoaded(true) // Still show the image even if preload fails
      }
      img.src = robotroImage
    }
  }, [robotroImage])

  // Initialize component with data
  useEffect(() => {
    // Check if data is an array and set briefCount
    if (data && Array.isArray(data) && data.length > 0) {
      setBriefCount(data.length)
    } else {
      setBriefCount(0)
    }

    // Reset to first brief when data changes
    setCurrentBriefIndex(0)
  }, [data])

  // Effect to handle the current brief display and typing animation
  useEffect(() => {
    // Check for rotation or missing mission data
    if (needsRotation || !data || !Array.isArray(data) || data.length === 0) {
      // Stop animation if running
      if (typingAnimationController.current) {
        typingAnimationController.current.stop()
      }
      // Stop narration if playing
      if (narrationAudio.current) {
        narrationAudio.current.pause()
        narrationAudio.current.currentTime = 0
      }
      // Reset states
      setIsTypingContent(false)
      setShowControls(false)
      setTitleText('') // Clear title if rotating or no data
      setTypedContent('') // Clear content

      // Set default text if data is missing but rotation is ok
      if (
        (!data || !Array.isArray(data) || data.length === 0) &&
        !needsRotation
      ) {
        setTitleText('Mission Data Missing') // Provide informative title
        setTypedContent('Could not load mission details.')
      }
      return // Exit effect early
    }

    // Get current brief data
    const currentBrief = data[currentBriefIndex]

    if (!currentBrief || !currentBrief.title || !currentBrief.description) {
      // Invalid brief data, skip
      setShowControls(true)
      return
    }

    // --- Start Typing Animation ---
    const title = currentBrief.title
    const content = currentBrief.description
    const narration = currentBrief.narration || ''
    const desiredDuration = currentBrief.duration || 10 // Example: 10 seconds

    // Set title immediately
    setTitleText(title)

    // Stop any previous animation
    if (typingAnimationController.current) {
      typingAnimationController.current.stop()
    }

    // Stop previous narration if any
    if (narrationAudio.current) {
      narrationAudio.current.pause()
      narrationAudio.current.currentTime = 0
    }

    // Reset states before starting new animation
    setTypedContent('')
    setIsTypingContent(true)
    setShowControls(false)

    // Add 1 second delay before starting narration and typing
    const delayTimeout = setTimeout(() => {
      // Play narration if available after delay
      if (narration) {
        // Create a new Audio element for the narration
        narrationAudio.current = new Audio(`/assets/${narration}`)
        narrationAudio.current.play().catch((error) => {
          console.warn('Failed to play narration:', error)
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
          setTimeout(() => setShowControls(true), desiredDuration)
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
      if (narrationAudio.current) {
        narrationAudio.current.pause()
        narrationAudio.current = null
      }
      setIsTypingContent(false) // Ensure state is reset
    }
    // Re-run if current brief index changes or rotation status changes
  }, [currentBriefIndex, data, needsRotation])

  const handleNextOrFinish = () => {
    playSoundEffect('click')

    // If there are more briefs, show the next one
    if (currentBriefIndex < briefCount - 1) {
      setCurrentBriefIndex((prevIndex) => prevIndex + 1)
    }
    // Otherwise, complete the mission brief section
    else {
      if (onComplete) {
        saveProgress()
        onComplete(data[currentBriefIndex].next_scene) // Call the callback passed via props
      } else {
        console.warn('MissionBriefComponent: onFinish prop not provided.') // Warn if handler is missing
      }
    }
  }

  // Determine button text based on whether this is the last brief
  const getButtonText = () => {
    return currentBriefIndex < briefCount - 1 ? 'CONTINUE' : 'NEXT'
  }

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
          <div className='final-content-block'>
            <h1>{titleText ? titleText.toUpperCase() : 'LOADING...'}</h1>
            <div ref={textContainerRef} className='final-text-area'>
              {typedContent.split('\n').map((line, index) => (
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
          {/* Controls (Next/Finish Button) - Conditionally render based on showControls */}

          <div className='final-controls'>
            <button
              style={{ visibility: showControls ? 'visible' : 'hidden' }}
              className='final-button'
              onClick={handleNextOrFinish}
            >
              <span className='btn-icon'>✓</span> {getButtonText()}
            </button>
          </div>
          {/* Updated robotoro image with proper styling and loading state */}
          <div className='welcome-final-image'>
            <img
              ref={imageRef}
              src={robotroImage}
              alt='Robotoro'
              style={{
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out'
              }}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageLoaded(true) // Still show the container even if image fails
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}
export default MissionBriefComponent
