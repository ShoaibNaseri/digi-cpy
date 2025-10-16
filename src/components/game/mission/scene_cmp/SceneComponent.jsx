import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'

//action components

import ActionOverlay from './ActionOverlay'
import { FaArrowCircleRight, FaPauseCircle, FaPlayCircle } from 'react-icons/fa'

import { FaArrowCircleLeft } from 'react-icons/fa'

//Digipalz Headquarter
import digipalzHeadquarterBg from '@/assets/game/bg_imgs/digipalz_headquarter.webp'

const SceneComponent = ({
  comingData,
  dialogues = {},
  characters = {},
  onSceneComplete,
  bgImage,
  isFirstScene = false,
  characterImageMap = {},
  dialogueBoxImage,
  isDigipalzHeadquarter = false
}) => {
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0)
  const [isBgAnimationComplete, setIsBgAnimationComplete] = useState(false)
  const [canCharactersAnimate, setCanCharactersAnimate] = useState(false)
  const [showDocument, setShowDocument] = useState(false)
  const [scene, setScene] = useState(null)
  const [currentBackgroundImage, setCurrentBackgroundImage] = useState(null)
  const [currentDialogue, setCurrentDialogue] = useState(null)
  const [waitForUserInput, setWaitForUserInput] = useState(false)
  const [showContinuePrompt, setShowContinuePrompt] = useState(false)
  const [isNarrationPlaying, setIsNarrationPlaying] = useState(false)
  const [canGoBack, setCanGoBack] = useState(false)
  const speakerId = currentDialogue?.speaker
  const audioRef = useRef(new Audio())
  const sceneContainerRef = useRef(null)
  const dialogueTextRef = useRef(null)
  const [animationKey, setAnimationKey] = useState(0) // Add a key to force animation re-render
  const [dialogueNarrationDuration, setDialogueNarrationDuration] = useState(0)
  const [startTypingAnimation, setStartTypingAnimation] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [wasTypingPaused, setWasTypingPaused] = useState(false)
  const [typingProgress, setTypingProgress] = useState(0)
  const [typingIntervalId, setTypingIntervalId] = useState(null)
  const [originalTypingSpeed, setOriginalTypingSpeed] = useState(0)

  useEffect(() => {
    // Safety check: if currentDialogueIndex is out of bounds, reset to 0
    if (currentDialogueIndex >= dialogues.length) {
      console.warn('Current dialogue index out of bounds, resetting to 0')
      setCurrentDialogueIndex(0)
      return
    }

    setScene(comingData)
    setCurrentDialogue(dialogues[currentDialogueIndex])

    // Get the current speaker ID
    const currentSpeakerId = dialogues[currentDialogueIndex]?.speaker

    // Determine which background to use based on speaker and isDigipalzHeadquarter flag
    let backgroundToUse
    if (isDigipalzHeadquarter) {
      // If isDigipalzHeadquarter is true, always use headquarters background
      backgroundToUse = digipalzHeadquarterBg
    } else {
      // Check if the original background is already headquarters
      const originalBgIsHeadquarters = bgImage === digipalzHeadquarterBg

      if (originalBgIsHeadquarters) {
        // If original background is already headquarters, keep it regardless of speaker
        backgroundToUse = digipalzHeadquarterBg
      } else {
        // Only change to headquarters when Robotoro speaks (and original bg is not headquarters)
        backgroundToUse =
          currentSpeakerId?.toLowerCase() === 'robotoro'
            ? digipalzHeadquarterBg
            : bgImage
      }
    }

    // For the initial load or when currentDialogueIndex is 0 (new scene)
    if (currentDialogueIndex === 0) {
      setIsBgAnimationComplete(false)
      setCanCharactersAnimate(false)
      setCurrentBackgroundImage(null)

      // Reset all interaction states
      setWaitForUserInput(false)
      setShowContinuePrompt(false)
      setIsNarrationPlaying(false)
      setStartTypingAnimation(false)
      setShowDocument(false)
      setCanGoBack(false)
      setIsPaused(false)
      setWasTypingPaused(false)
      setTypingProgress(0)
      setOriginalTypingSpeed(0)
      if (typingIntervalId) {
        clearInterval(typingIntervalId)
        setTypingIntervalId(null)
      }

      // Increment animation key to force re-animation
      setAnimationKey((prev) => prev + 1)

      // If isDigipalzHeadquarter is true, always use digipalzHeadquarterBg
      // Otherwise, use the calculated backgroundToUse
      const finalBackground = isDigipalzHeadquarter
        ? digipalzHeadquarterBg
        : backgroundToUse

      // Use finalBackground with a slight delay for animation to be noticeable
      setTimeout(() => {
        setCurrentBackgroundImage(finalBackground)
      }, 50)

      // Apply background animation complete after animation finishes (1.2 seconds)
      setTimeout(() => {
        setIsBgAnimationComplete(true)
      }, 1200)
    } else {
      // For dialogue changes within the same scene

      // For dialogue changes, check if we need to change the background based on speaker
      // Skip background change if isDigipalzHeadquarter is true OR if original background is already headquarters
      if (!isDigipalzHeadquarter && bgImage !== digipalzHeadquarterBg) {
        const currentBgIsHeadquarter =
          currentBackgroundImage === digipalzHeadquarterBg
        const shouldBeHeadquarter =
          currentSpeakerId?.toLowerCase() === 'robotoro'

        // If the background needs to change based on speaker
        if (
          (shouldBeHeadquarter && !currentBgIsHeadquarter) ||
          (!shouldBeHeadquarter && currentBgIsHeadquarter)
        ) {
          // Set background to null first to trigger animation
          setCurrentBackgroundImage(null)

          // Increment animation key to force re-animation
          setAnimationKey((prev) => prev + 1)

          // Apply new background with slight delay
          setTimeout(() => {
            setCurrentBackgroundImage(backgroundToUse)
          }, 50)

          // Reset animation flags to trigger proper sequence
          setIsBgAnimationComplete(false)
          setCanCharactersAnimate(false)

          // Set animation complete after delay
          setTimeout(() => {
            setIsBgAnimationComplete(true)
          }, 1200)
        } else {
          // No background change needed - enable characters immediately for dialogue transitions

          setIsBgAnimationComplete(true)
          setCanCharactersAnimate(true)
        }
      } else {
        // Headquarters mode or already headquarters - enable characters immediately

        setIsBgAnimationComplete(true)
        setCanCharactersAnimate(true)
      }

      // Update canGoBack based on current index for dialogue changes
      setCanGoBack(currentDialogueIndex > 0)

      // Reset interaction flags when dialogue changes
      setWaitForUserInput(false)
      setShowContinuePrompt(false)
      setIsNarrationPlaying(false)
      setStartTypingAnimation(false)
      setShowDocument(false)
      setIsPaused(false)
      setWasTypingPaused(false)
      setTypingProgress(0)
      setOriginalTypingSpeed(0)
      if (typingIntervalId) {
        clearInterval(typingIntervalId)
        setTypingIntervalId(null)
      }
    }
  }, [
    comingData,
    dialogues,
    currentDialogueIndex,
    bgImage,
    isDigipalzHeadquarter
  ])

  useEffect(() => {
    let timerId
    //animation for the scene background changes
    if (isBgAnimationComplete) {
      // Only use 2-second delay for initial scene load (currentDialogueIndex === 0)
      // For dialogue transitions, enable immediately
      const delay = currentDialogueIndex === 0 ? 2000 : 0

      timerId = setTimeout(() => {
        setCanCharactersAnimate(true)
      }, delay)
    }
    // Cleanup timer if component unmounts or isBgAnimationComplete changes before timeout
    return () => clearTimeout(timerId)
  }, [isBgAnimationComplete, currentDialogueIndex]) // Add currentDialogueIndex to dependencies

  // Add a useEffect hook to set up audio ended event listener
  useEffect(() => {
    // Set up a listener for when the audio finishes playing
    const handleAudioEnded = () => {
      setIsNarrationPlaying(false)

      // If this is a dialogue without action, enable user input now that audio has finished
      // But skip if this is a hasOnlyNarration dialogue (let its specific handler manage it)
      if (!currentDialogue?.hasAction) {
        setWaitForUserInput(true)

        // Only show continue prompt for first dialogue of first scene
        if (isFirstScene && currentDialogueIndex === 0) {
          setShowContinuePrompt(true)
        }
      } else {
      }
    }

    // Remove any existing listeners before adding a new one
    audioRef.current.removeEventListener('ended', handleAudioEnded)

    // Add the listener
    audioRef.current.addEventListener('ended', handleAudioEnded)

    // Make sure loop is explicitly set to false
    audioRef.current.loop = false

    // Cleanup function
    return () => {
      audioRef.current.removeEventListener('ended', handleAudioEnded)
    }
  }, [currentDialogue, isFirstScene, currentDialogueIndex, showDocument])

  useEffect(() => {
    if (!canCharactersAnimate || !currentDialogue) return // Ensure dialogue exists

    // Handle hasOnlyAction: show action immediately (only for first dialogue)
    if (currentDialogue?.hasOnlyAction && currentDialogue?.action?.type) {
      setShowDocument(true)
      return
    }

    // Handle hasOnlyNarration: play narration only
    if (currentDialogue?.hasOnlyNarration && currentDialogue?.narration) {
      // Reset the audio element
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current.loop = false

      setIsNarrationPlaying(true)
      audioRef.current.src = `/assets/${currentDialogue.narration}`

      // Set up audio ended handler for hasOnlyNarration
      const handleNarrationOnlyEnded = () => {
        setIsNarrationPlaying(false)

        // Clean up hasOnlyNarration audio listeners before transitioning
        audioRef.current.removeEventListener('ended', handleNarrationOnlyEnded)
        audioRef.current.oncanplaythrough = null

        // Wait for user input instead of auto-advancing
        setWaitForUserInput(true)

        // Only show continue prompt for first dialogue of first scene
        if (isFirstScene && currentDialogueIndex === 0) {
          setShowContinuePrompt(true)
        }
      }

      audioRef.current.removeEventListener('ended', handleNarrationOnlyEnded)
      audioRef.current.addEventListener('ended', handleNarrationOnlyEnded)

      audioRef.current.oncanplaythrough = () => {
        audioRef.current.play().catch((error) => {
          console.error('Error playing hasOnlyNarration audio:', error)
          setIsNarrationPlaying(false)

          // Clean up hasOnlyNarration audio listeners before transitioning (error case)
          audioRef.current.removeEventListener(
            'ended',
            handleNarrationOnlyEnded
          )
          audioRef.current.oncanplaythrough = null

          // If audio fails, still wait for user input
          setWaitForUserInput(true)
          if (isFirstScene && currentDialogueIndex === 0) {
            setShowContinuePrompt(true)
          }
        })
        audioRef.current.oncanplaythrough = null
      }

      return
    }

    // Regular dialogue logic
    const narration = currentDialogue?.narration || null
    const hasAction =
      currentDialogue?.hasAction && currentDialogue?.action?.type // Check if there's an action

    // Reset the audio element completely before trying to play a new narration
    audioRef.current.pause()
    audioRef.current.currentTime = 0
    audioRef.current.loop = false

    // Reset typing animation state
    setStartTypingAnimation(false)

    // Play narration if applicable
    if (narration) {
      setIsNarrationPlaying(true) // Set narration playing state
      audioRef.current.src = `/assets/${narration}`
      audioRef.current.onloadedmetadata = () => {
        const duration = audioRef.current.duration * 1000
        setDialogueNarrationDuration(duration)

        // Set action timer here after we know the actual duration
        if (hasAction) {
          setTimeout(() => {
            setShowDocument(true)
            // Don't pause narration - let it complete naturally
          }, duration)
        }
      }
      audioRef.current.oncanplaythrough = () => {
        // Start audio and typing animation simultaneously
        audioRef.current
          .play()
          .then(() => {
            // Trigger typing animation when audio starts playing
            setStartTypingAnimation(true)
            if (currentDialogue?.text) {
              // Use the duration that was set in onloadedmetadata
              const duration = audioRef.current.duration * 1000
              startTypingWithPause(currentDialogue.text, duration)
            }
          })
          .catch((error) => {
            console.error('Error playing audio:', error)
            // If audio can't be played, still start typing with default duration
            setDialogueNarrationDuration(3000)
            setStartTypingAnimation(true)
            if (currentDialogue?.text) {
              startTypingWithPause(currentDialogue.text, 3000)
            }
            setIsNarrationPlaying(false)
            if (!hasAction && !currentDialogue?.hasOnlyNarration) {
              setWaitForUserInput(true)
              // Only show continue prompt for first dialogue of first scene
              if (isFirstScene && currentDialogueIndex === 0) {
                setShowContinuePrompt(true)
              }
            }
            // Set action timer with default duration if audio fails and there's an action
            if (hasAction) {
              setTimeout(() => {
                setShowDocument(true)
              }, 3000)
            }
          })
        // Clear the handler to prevent multiple plays
        audioRef.current.oncanplaythrough = null
      }
    } else {
      // If there's no narration, set a default duration and start typing immediately
      const defaultDuration = 3000
      setDialogueNarrationDuration(defaultDuration) // Default 3 seconds for typing
      setStartTypingAnimation(true)
      if (currentDialogue?.text) {
        startTypingWithPause(currentDialogue.text, defaultDuration)
      }
      if (!hasAction) {
        setWaitForUserInput(true)
        // Only show continue prompt for first dialogue of first scene
        if (isFirstScene && currentDialogueIndex === 0) {
          setShowContinuePrompt(true)
        }
      }

      // Set action timer with default duration if there's no narration but there's an action
      if (hasAction) {
        setTimeout(() => {
          setShowDocument(true)
        }, defaultDuration)
      }
    }

    return () => {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsNarrationPlaying(false)
      // Clear any pending events
      audioRef.current.oncanplaythrough = null

      setShowDocument(false)

      // Cleanup typing animation
      if (typingIntervalId) {
        clearInterval(typingIntervalId)
        setTypingIntervalId(null)
      }
    }
  }, [
    canCharactersAnimate,
    currentDialogueIndex,
    dialogues.length,
    currentDialogue,
    onSceneComplete,
    comingData?.id, // Add scene ID as dependency to ensure reset on scene change
    isFirstScene
  ])

  const handleContinue = () => {
    // Skip if narration is still playing
    if (isNarrationPlaying) {
      return
    }

    setShowContinuePrompt(false) // Hide prompt immediately
    setWaitForUserInput(false) // Stop waiting

    if (currentDialogueIndex === dialogues.length - 1) {
      // Reset state and call onSceneComplete for the last dialogue

      setIsBgAnimationComplete(false)
      setCurrentDialogueIndex(0) // Reset for potential reuse
      onSceneComplete()
    } else {
      setCurrentDialogueIndex((prevIndex) => prevIndex + 1)
    }
  }
  // --- useEffect for handling user input (now checks for isNarrationPlaying) ---
  useEffect(() => {
    if (!waitForUserInput) return // Only run when waiting

    // New handler for going back to previous dialogue
    const handleGoBack = () => {
      // Skip if narration is still playing or can't go back (first dialogue)
      if (isNarrationPlaying || !canGoBack) {
        return
      }

      setShowContinuePrompt(false) // Hide prompt immediately
      setWaitForUserInput(false) // Stop waiting

      // Go back to previous dialogue
      setCurrentDialogueIndex((prevIndex) => Math.max(0, prevIndex - 1))
    }

    const handleKeyDown = (event) => {
      // if (event.key === ' ') {
      //   event.preventDefault() // Prevent page scroll
      //   handleContinue()
      // } else if (event.key === 'Backspace' || event.key === 'Delete') {
      //   event.preventDefault() // Prevent default behavior
      //   handleGoBack()
      // }
    }

    // Add listeners
    const currentSceneContainer = sceneContainerRef.current
    if (currentSceneContainer) {
      currentSceneContainer.addEventListener('click', (event) => {
        // Block dialogue box clicks
        if (event.target.closest('.dialogue-box')) {
          return
          // if (isNarrationPlaying) {
          //   return
          // } else {
          //   handleContinue()
          // }
        }

        // Only allow clicks on the nx-btn (forward button)
        if (event.target.closest('.nx-btn')) {
          handleContinue()
        }
      })
    }
    window.addEventListener('keydown', handleKeyDown)

    // Cleanup function
    return () => {
      if (currentSceneContainer) {
        currentSceneContainer.removeEventListener('click', handleContinue)
      }
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [
    waitForUserInput,
    currentDialogueIndex,
    dialogues.length,
    onSceneComplete,
    isNarrationPlaying,
    canGoBack,
    handleContinue,
    comingData?.id // Add scene ID to ensure proper cleanup/setup on scene change
  ])

  // Character Layer - Stagger children animations
  const characterLayerVariants = {
    hidden: { opacity: 0 }, // Explicitly start hidden
    visible: {
      opacity: 1, // Explicitly become visible
      transition: {
        // No delayChildren needed here, parent animate trigger controls start
        staggerChildren: 0.01
        // Add a small delay for the layer itself to fade in slightly before children
        // delay: 0.1, // Optional: slight delay for layer fade-in
      }
    }
  }

  // Character Variants - Revised for entry and speaking focus
  const characterVariants = {
    // Initial state (off-screen or invisible)
    hidden: (position) => {
      switch (position) {
        case 'left':
          return { x: '0vw', opacity: 0 } // Start further off-screen
        case 'right':
          return { x: '100vw', opacity: 0 } // Start further off-screen
        default:
          // Keep center characters visible initially but faded? Or animate from below?
          // Let's stick with animating from below for consistency.
          return { y: '50vh', opacity: 0 } // Start below screen (for center)
      }
    },
    // State when NOT speaking (becomes the hidden/exit state)
    idle: {
      x: 0, // Ensure horizontal position is reset
      opacity: 0, // Completely hide character
      scale: 0.9, // Scale down slightly as it hides
      y: 10, // Move down slightly as it hides
      zIndex: 1, // Default stacking
      transition: { duration: 0.1, type: 'tween', ease: 'easeIn' } // Smooth transition out
    },
    // State when speaking
    speaking: {
      x: 0, // Ensure horizontal position is reset
      y: -15, // Move slightly up
      opacity: 1, // Fully visible
      scale: 1.1, // Scale up
      zIndex: 10, // Bring character forward
      transition: { duration: 0.4, type: 'tween', ease: 'easeOut' } // Quicker transition to focus
    }
  }

  const getCharacter = (id) => characters[id]
  const currentSpeakerDetails = speakerId ? getCharacter(speakerId) : null
  const speakerCharImgSrc = currentSpeakerDetails
    ? characterImageMap[currentSpeakerDetails?.image]
    : null

  const handleCloseDocument = () => {
    setShowDocument(false) // Hide the action overlay/component

    // Check if the action we just closed belonged to the last dialogue
    if (currentDialogueIndex === dialogues.length - 1) {
      // If it was the last dialogue, scene will change so we reset animation flags
      // The actual animation will happen in the useEffect when the new scene loads
      onSceneComplete() // Call the scene completion callback
    } else {
      // If it wasn't the last dialogue, advance to the next one within the same scene
      const nextIndex = currentDialogueIndex + 1

      // Check if next index is within bounds
      if (nextIndex >= dialogues.length) {
        onSceneComplete()
        return
      }

      const nextDialogue = dialogues[nextIndex]

      // Ensure proper animation states for the next dialogue
      if (nextDialogue) {
        if (nextDialogue.hasOnlyNarration) {
          // Next dialogue is narration only, ensure animation states are ready

          setCanCharactersAnimate(true)
          setIsBgAnimationComplete(false)
        } else if (nextDialogue.hasOnlyAction) {
          setIsBgAnimationComplete(false)
          setCanCharactersAnimate(false)
        } else if (
          !nextDialogue.hasOnlyAction &&
          !nextDialogue.hasOnlyNarration
        ) {
          // Next dialogue is regular, ensure animation states are ready

          setIsBgAnimationComplete(true)
          setCanCharactersAnimate(true)
        }
      }

      setCurrentDialogueIndex(nextIndex)

      setShowDocument(false)
    }
  }
  // Add a new function to handle back button click
  const handleBackButtonClick = (event) => {
    // Stop event propagation to prevent the container click from triggering
    event.stopPropagation()

    // Only go back if we can (not at first dialogue) and not during narration
    if (canGoBack && !isNarrationPlaying && !showDocument) {
      // Pause any playing audio
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      // Go back to previous dialogue
      setCurrentDialogueIndex((prevIndex) => Math.max(0, prevIndex - 1))

      // Reset states
      setShowContinuePrompt(false)
      setWaitForUserInput(false)
    }
  }
  const handleContinueButtonClick = (event) => {
    event.stopPropagation()
    handleContinue()
  }

  // Custom typing animation with pause/resume capability
  const startTypingWithPause = (text, duration, forceStart = false) => {
    if (!dialogueTextRef.current || !text) return

    // Clear any existing typing animation
    if (typingIntervalId) {
      clearInterval(typingIntervalId)
      setTypingIntervalId(null)
    }

    const totalChars = text.length
    const remainingChars = totalChars - typingProgress

    // Prevent division by zero
    if (remainingChars <= 0) {
      return
    }

    const interval = duration / remainingChars

    // Store original typing speed for resume functionality (only on first start)
    if (typingProgress === 0) {
      setOriginalTypingSpeed(interval)
    }

    let currentIndex = typingProgress

    // Clear the dialogue text and add already typed characters
    dialogueTextRef.current.innerHTML = ''
    dialogueTextRef.current.textContent = text.substring(0, typingProgress)

    const intervalId = setInterval(() => {
      // Use forceStart parameter to bypass isPaused check when resuming
      if (!forceStart && isPaused) {
        clearInterval(intervalId)
        setTypingIntervalId(null)
        return
      }

      if (currentIndex < totalChars) {
        dialogueTextRef.current.textContent += text.charAt(currentIndex)
        currentIndex++
        setTypingProgress(currentIndex)

        // Auto-scroll to keep the typing text in view
        if (dialogueTextRef.current) {
          dialogueTextRef.current.scrollTop =
            dialogueTextRef.current.scrollHeight
        }
      } else {
        clearInterval(intervalId)
        setTypingIntervalId(null)
        setTypingProgress(0) // Reset for next dialogue
      }
    }, interval)

    setTypingIntervalId(intervalId)
  }

  // Pause/Play functionality
  const handlePausePlay = () => {
    if (isPaused) {
      // Resume functionality - set isPaused to false first
      setIsPaused(false)

      if (audioRef.current && isNarrationPlaying) {
        audioRef.current.play().catch((error) => {
          console.error('Error resuming audio:', error)
        })
      }
      if (wasTypingPaused && currentDialogue?.text) {
        // Resume typing from where it was paused with original speed
        const totalChars = currentDialogue.text.length
        const remainingChars = totalChars - typingProgress
        const resumeDuration = remainingChars * originalTypingSpeed
        startTypingWithPause(currentDialogue.text, resumeDuration, true) // forceStart = true
        setWasTypingPaused(false)
      }
    } else {
      // Pause functionality
      if (audioRef.current && isNarrationPlaying) {
        audioRef.current.pause()
      }
      if (typingIntervalId) {
        clearInterval(typingIntervalId)
        setTypingIntervalId(null)
        setWasTypingPaused(true)
      }
      setIsPaused(true)
    }
  }
  return (
    <div ref={sceneContainerRef} className='scene-container'>
      {/* Background layer with fade-in animation - add key to force re-render */}
      <div
        key={`bg-${animationKey}`}
        className='scene-bg-layer fade-in-bg'
        style={{ backgroundImage: `url(${currentBackgroundImage})` }}
      />

      {/* Character Layer - Animates only when canCharactersAnimate is true */}
      <motion.div
        className='character-layer'
        variants={characterLayerVariants}
        initial='hidden'
        animate={canCharactersAnimate ? 'visible' : 'hidden'}
      >
        {Object.entries(characters).map(([id, charData]) => {
          const isSpeaking = speakerId === id
          const charImgSrc = characterImageMap[charData.image]

          // Check if we're in headquarters background mode (not intro scene and robotoro speaking)
          const isHeadquartersMode =
            !isDigipalzHeadquarter &&
            speakerId?.toLowerCase() === 'robotoro' &&
            currentBackgroundImage === digipalzHeadquarterBg

          // Dynamically modify character properties based on headquarters mode
          let modifiedCharData = { ...charData }

          if (isHeadquartersMode) {
            if (id.toLowerCase() === 'robotoro') {
              // Make Robotoro non-animating and position left
              modifiedCharData.canAnimate = false
              modifiedCharData.position = 'left'
            } else {
              // Make other characters animating (so they can be hidden via animation)
              modifiedCharData.canAnimate = true
            }
          }

          // Check if this specific character should animate
          const canThisCharacterAnimate = modifiedCharData.canAnimate !== false // Default to true if not specified

          // Hide other characters when in headquarters mode (except robotoro)
          const shouldHideOtherCharacters =
            isHeadquartersMode && id.toLowerCase() !== 'robotoro'

          if (!charImgSrc) {
            console.warn(
              `Image key "${charData.image}" not found in characterImageMap. Check JSON and import map.`
            )
            return null
          }
          return (
            <motion.div
              key={id}
              className={`character character-${modifiedCharData.position}`}
              custom={modifiedCharData.position} // Pass position for variant logic
              variants={characterVariants}
              animate={
                !canThisCharacterAnimate
                  ? 'speaking' // If character's canAnimate is false, keep it visible without animation
                  : canCharactersAnimate
                  ? shouldHideOtherCharacters
                    ? 'idle' // Hide other characters in headquarters mode
                    : isSpeaking
                    ? 'speaking'
                    : 'idle'
                  : 'hidden' // Ensure stays hidden before canCharactersAnimate
              }
            >
              {isBgAnimationComplete &&
                currentDialogue &&
                currentSpeakerDetails &&
                speakerCharImgSrc &&
                canCharactersAnimate && (
                  <img
                    src={charImgSrc}
                    alt={modifiedCharData.name}
                    className=''
                  />
                )}
            </motion.div>
          )
        })}
      </motion.div>
      {/* Dialogue Box - Only show for regular dialogues (not hasOnlyAction or hasOnlyNarration) */}
      {canCharactersAnimate &&
        currentDialogue &&
        currentSpeakerDetails &&
        speakerCharImgSrc && (
          <div
            className='dialogue-box'
            style={{ '--dialog-bg-image': `url(${dialogueBoxImage})` }}
          >
            {/* Speaker image and text content */}
            <div className='dialogue-speaker-image'></div>
            <div className='dialogue-content'>
              <div className='speaker-name'>
                {/* Back button - only show if we can go back */}
                {/* {canGoBack && ( */}

                {/* )} */}
                {/* Add blinking dot indicator for narration playing */}
                {/* {isNarrationPlaying && <span className='narration-dot'></span>} */}
                <div className='speaker-name-text'>
                  {currentSpeakerDetails.name}
                </div>
                <div className='back-button-container'>
                  <div
                    className='bck-btn'
                    onClick={handleBackButtonClick}
                    aria-label='Go back to previous dialogue'
                    title='Go back to previous dialogue'
                    disabled={isNarrationPlaying || showDocument || !canGoBack}
                  >
                    <FaArrowCircleLeft></FaArrowCircleLeft>
                    {/* Left arrow character */}
                  </div>

                  <div
                    className='scenes-pause-btn'
                    onClick={handlePausePlay}
                    title={isPaused ? 'Resume narration' : 'Pause narration'}
                  >
                    {isPaused ? <FaPlayCircle /> : <FaPauseCircle />}
                  </div>
                  <div
                    className='nx-btn'
                    onClick={handleContinueButtonClick}
                    aria-label='Go forward to next dialogue'
                    title='Go forward to next dialogue'
                    disabled={isNarrationPlaying || showDocument}
                  >
                    <FaArrowCircleRight></FaArrowCircleRight>
                  </div>
                </div>
              </div>

              <div className='dialogue-text' ref={dialogueTextRef}>
                {/* Custom typing animation with pause/resume capability */}

                {/* Restore original continue prompt only for first dialogue */}
                {showContinuePrompt && (
                  <div className='continue-prompt'>
                    {' '}
                    Click{' '}
                    <span>
                      <FaArrowCircleRight />
                    </span>
                    to Continue
                  </div>
                )}
              </div>
              {/* Add back navigation prompt if we can go back */}
            </div>
          </div>
        )}
      {/* Action Overlay - Shows the document-actions-games when triggered */}
      <ActionOverlay
        showDocument={showDocument}
        currentDialogue={currentDialogue}
        onCloseDocument={handleCloseDocument}
      />
    </div>
  )
}

export default SceneComponent
