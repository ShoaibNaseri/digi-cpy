import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { createTypingAnimation } from '@/utils/typingAnimation'
import { useDeviceRotation } from '@/utils/deviceRotation'
import { FaPlay } from 'react-icons/fa'
import './azabukiCheckComponent.css'
import { saveMissionProgressUniversal } from '@/utils/missionProgressUtils'
// Removed the local import of mission data since we're getting it from props

const AzabukiCheckComponent = ({
  missionData,
  onComplete,
  voiceNarration,
  characterImage,
  interfaceBG,
  currentStep
}) => {
  const [titleText, setTitleText] = useState('')
  const [typedContent, setTypedContent] = useState('')
  const [isTypingContent, setIsTypingContent] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [audioDuration, setAudioDuration] = useState(0)
  const typingAnimationController = useRef(null)
  const textContainerRef = useRef(null) // Ref for the text area if needed for scrolling
  const audioRef = useRef(new Audio())
  const { missionId } = useParams()
  // Use the rotation hook
  const needsRotation = useDeviceRotation()

  // --- Placeholder Functions (Implement or Remove if not needed) ---
  const playSoundEffect = (type) => {}

  const saveProgress = async () => {
    const missionDatas = {
      missionId: missionId,
      step: currentStep,
      progress: 30
    }
    await saveMissionProgressUniversal(missionDatas)
  }

  // Function to start typing animation with audio duration
  const startTypingAnimation = (content, duration) => {
    // Stop any previous animation
    if (typingAnimationController.current) {
      typingAnimationController.current.stop()
    }

    // Reset states before starting new animation
    setTypedContent('')
    setIsTypingContent(true)
    setShowControls(false)

    // Create and start the typing animation controller with actual audio duration
    typingAnimationController.current = createTypingAnimation({
      content: content,
      durationSeconds: duration,
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
  }

  // Effect for loading audio and getting duration
  useEffect(() => {
    if (!missionData?.narration || needsRotation) {
      return
    }

    const audio = audioRef.current

    // Set up audio source
    audio.src = `/assets/${missionData.narration}`

    // Event listener for when audio metadata is loaded (duration available)
    const handleLoadedMetadata = () => {
      const duration = audio.duration
      setAudioDuration(duration)
    }

    // Event listener for when audio ends
    const handleAudioEnded = () => {}

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleAudioEnded)

    // Cleanup
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleAudioEnded)
    }
  }, [missionData?.narration, needsRotation])

  // Effect for typing animation - starts when audio duration is available
  useEffect(() => {
    // Check for rotation or missing mission data
    if (
      needsRotation ||
      !missionData ||
      !missionData.message ||
      !missionData.title
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
    const content = missionData.message
    const narration = missionData.narration

    // Set title immediately
    setTitleText(title)

    // Start both audio and typing animation immediately when ready
    const startAnimationAndAudio = () => {
      const duration = audioDuration > 0 ? audioDuration : 10 // Fallback to 10 seconds if audio duration not available

      // Start narration immediately
      if (!needsRotation && narration) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch((err) => {
          console.error('Error playing audio:', err)
        })
      }

      // Start typing animation immediately (synchronized with audio)
      startTypingAnimation(content, duration)
    }

    let animationTimeout

    // Start immediately if we have audio duration, otherwise wait for it
    if (audioDuration > 0) {
      startAnimationAndAudio()
    } else {
      // Wait for audio metadata to load, then start immediately
      const handleMetadataLoaded = () => {
        startAnimationAndAudio()
        audioRef.current.removeEventListener(
          'loadedmetadata',
          handleMetadataLoaded
        )
      }

      if (audioRef.current.readyState >= 1) {
        // Metadata already loaded
        startAnimationAndAudio()
      } else {
        audioRef.current.addEventListener(
          'loadedmetadata',
          handleMetadataLoaded
        )
      }
    }

    // Cleanup function
    return () => {
      if (animationTimeout) clearTimeout(animationTimeout)
      if (typingAnimationController.current) {
        typingAnimationController.current.stop()
      }
      setIsTypingContent(false) // Ensure state is reset
    }
    // Re-run if mission data changes, rotation status changes, or audio duration changes
  }, [missionData, needsRotation, audioDuration]) // Added audioDuration to dependencies

  const handleFinish = () => {
    playSoundEffect('click')
    if (onComplete) {
      saveProgress()
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
              style={{
                visibility: showControls ? 'visible' : 'hidden'
              }}
              className='final-button'
              onClick={handleFinish}
            >
              <span className='btn-icon'>
                <FaPlay size={20} />
              </span>{' '}
              START
            </button>
          </div>
          <div className='aza-check-final-image'>
            <img src={characterImage} alt='azabuki' />
          </div>
        </div>
      )}
    </>
  )
}

export default AzabukiCheckComponent
