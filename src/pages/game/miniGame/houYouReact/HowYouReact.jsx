import { useState, useEffect, useRef } from 'react'
import './howyoureact.css'
import GameInstructions from './GameInstructions'
import { GiAlarmClock } from 'react-icons/gi'
import { FaStar, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import phone_chat from '@/assets/game/mini_game/how_you_react/phone_chat.svg'
import social_media from '@/assets/game/mini_game/how_you_react/social_media.svg'
import email from '@/assets/game/mini_game/how_you_react/email_chat.svg'
import game_chat from '@/assets/game/mini_game/how_you_react/chat_room_chat.svg'
import bg from '@/assets/game/mini_game/how_you_react/bg.png'

// Utility function to shuffle array
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Example bullying scenarios
const CYBERBULLYING_EXAMPLES = [
  {
    platform: 'Text Message',
    image: phone_chat,
    orientation: 'vertical',
    scale: 1.9
  },
  {
    platform: 'Social Media',
    image: social_media,
    orientation: 'vertical',
    scale: 1.9
  },
  {
    platform: 'Email',
    image: email,
    orientation: 'horizontal',
    scale: 1.3
  },
  {
    platform: 'Online Game Chat',
    image: game_chat,
    orientation: 'horizontal',
    scale: 1.9
  }
]

const RESPONSE_OPTIONS = [
  { id: 'stop', text: 'Stop Engaging' },
  { id: 'screenshot', text: 'Screenshot' },
  { id: 'block', text: 'Block Number' },
  { id: 'tell', text: 'Report to an adult' }
]

// The correct order with flexibility for first two steps
const validateOrder = (order) => {
  // Both "stop, screenshot" and "screenshot, stop" are valid for first two positions
  const validFirstTwoOptions =
    (order[0] === 'stop' && order[1] === 'screenshot') ||
    (order[0] === 'screenshot' && order[1] === 'stop')

  // The last two must be in exact order: block, tell
  const validLastTwoOptions = order[2] === 'block' && order[3] === 'tell'

  return validFirstTwoOptions && validLastTwoOptions
}

const HowYouReact = ({ onComplete }) => {
  const [gameState, setGameState] = useState('instructions') // instructions, intro, playing, feedback, complete
  const [currentExample, setCurrentExample] = useState(0)
  const [dropZoneContent, setDropZoneContent] = useState([
    null,
    null,
    null,
    null
  ])
  const [shuffledOptions, setShuffledOptions] = useState(
    shuffleArray(RESPONSE_OPTIONS)
  )
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [introTimer, setIntroTimer] = useState(5)
  const draggedItem = useRef(null)

  useEffect(() => {
    let timer
    if (gameState === 'intro' && introTimer > 0) {
      timer = setTimeout(() => {
        setIntroTimer(introTimer - 1)
      }, 1000)
    } else if (gameState === 'intro' && introTimer === 0) {
      setGameState('playing')
    }

    return () => clearTimeout(timer)
  }, [gameState, introTimer])

  const handleDragStart = (e, option) => {
    draggedItem.current = option

    // Add dragging class to provide visual feedback
    e.target.classList.add('dragging-element')

    // Set the drag image to be the actual element for real dragging look
    // Adjust this to fine-tune the grip point of the drag
    const rect = e.target.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top

    // This delay is needed for the dragging-element class to take effect
    setTimeout(() => {
      e.dataTransfer.setDragImage(e.target, offsetX, offsetY)
    }, 0)
  }

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging-element')
    draggedItem.current = null

    // Remove any lingering drag-over classes
    document
      .querySelectorAll('.drop-zone')
      .forEach((zone) => zone.classList.remove('drag-over'))
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    // Add drag-over class to the current drop zone
    const dropZones = document.querySelectorAll('.drop-zone')
    dropZones.forEach((zone) => zone.classList.remove('drag-over'))
    e.currentTarget.classList.add('drag-over')
  }

  // Add handler to remove drag-over class when leaving drop zone
  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over')
  }

  // Touch handling for mobile
  const touchStartPos = useRef({ x: 0, y: 0 })
  const touchedElement = useRef(null)
  const touchedOption = useRef(null)
  const touchMoving = useRef(false)
  const clonedElement = useRef(null)

  const handleTouchStart = (e, option) => {
    // Prevent default only if we confirm a drag operation later
    // This allows normal touch scrolling to work

    const touch = e.touches[0]
    touchStartPos.current = { x: touch.clientX, y: touch.clientY }
    touchedElement.current = e.currentTarget
    touchedOption.current = option
    touchMoving.current = false

    // We'll wait to see if this is a drag or just a tap
  }

  const handleTouchMove = (e) => {
    if (!touchedElement.current) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartPos.current.x
    const deltaY = touch.clientY - touchStartPos.current.y

    // If movement is significant enough, start dragging
    if (
      !touchMoving.current &&
      (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)
    ) {
      touchMoving.current = true
      e.preventDefault() // Now we can prevent default as we're dragging

      // Create and style the clone that will follow the finger
      const original = touchedElement.current
      const clone = original.cloneNode(true)

      // Position clone absolutely
      clone.style.position = 'fixed'
      clone.style.top = `${touch.clientY - 30}px` // Adjust grip point
      clone.style.left = `${touch.clientX - 30}px`
      clone.style.width = `${original.offsetWidth}px`
      clone.style.pointerEvents = 'none'
      clone.style.opacity = '0.9'
      clone.style.zIndex = '1000'
      clone.style.transform = 'scale(1.05) rotate(4deg)'
      clone.style.transition = 'none'
      clone.classList.add('dragging-clone')

      document.body.appendChild(clone)
      clonedElement.current = clone

      // Apply visual feedback to original
      original.classList.add('touch-dragging')
    }

    // Update the clone position if we're dragging
    if (touchMoving.current && clonedElement.current) {
      clonedElement.current.style.top = `${touch.clientY - 30}px`
      clonedElement.current.style.left = `${touch.clientX - 30}px`

      // Check if we're over a drop zone
      const dropZones = document.querySelectorAll('.drop-zone')
      let found = false

      dropZones.forEach((zone, index) => {
        const rect = zone.getBoundingClientRect()

        if (
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom
        ) {
          zone.classList.add('drag-over')
          found = true
        } else {
          zone.classList.remove('drag-over')
        }
      })
    }
  }

  const handleTouchEnd = (e) => {
    if (!touchedElement.current) return

    // Remove the clone if it exists
    if (clonedElement.current) {
      document.body.removeChild(clonedElement.current)
      clonedElement.current = null
    }

    // Clean up visual styles
    if (touchedElement.current) {
      touchedElement.current.classList.remove('touch-dragging')
    }

    if (touchMoving.current) {
      // This was a drag operation, check if we're over a drop zone
      const touch = e.changedTouches[0]
      const dropZones = document.querySelectorAll('.drop-zone')
      let dropped = false

      dropZones.forEach((zone, index) => {
        const rect = zone.getBoundingClientRect()

        if (
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom
        ) {
          zone.classList.remove('drag-over')

          // Only proceed if this zone is empty
          if (dropZoneContent[index] === null) {
            const newDropZoneContent = [...dropZoneContent]
            newDropZoneContent[index] = touchedOption.current
            setDropZoneContent(newDropZoneContent)
            dropped = true

            // Check if all positions are filled
            if (newDropZoneContent.every((item) => item !== null)) {
              const order = newDropZoneContent.map((item) => item.id)
              const correct = validateOrder(order)

              setIsCorrect(correct)
              setShowFeedback(true)

              if (correct) {
                setScore(score + 1)
              }
            }
          }
        }
      })
    }

    // Reset touch tracking
    touchedElement.current = null
    touchedOption.current = null
    touchMoving.current = false
  }

  const handleDrop = (e, index) => {
    e.preventDefault()

    // Clean up all drag-over classes
    const dropZones = document.querySelectorAll('.drop-zone')
    dropZones.forEach((zone) => zone.classList.remove('drag-over'))

    // Don't allow drop if spot is already filled
    if (dropZoneContent[index] !== null) return

    // Create a new array with the dragged item placed at the drop position
    const newDropZoneContent = [...dropZoneContent]
    newDropZoneContent[index] = draggedItem.current

    // Update state
    setDropZoneContent(newDropZoneContent)

    // If all positions are filled, check the order
    if (newDropZoneContent.every((item) => item !== null)) {
      const order = newDropZoneContent.map((item) => item.id)
      const correct = validateOrder(order)

      setIsCorrect(correct)
      setShowFeedback(true)

      if (correct) {
        setScore(score + 1)
      }
    }
  }

  const handleResetOptions = () => {
    setDropZoneContent([null, null, null, null])
    setShowFeedback(false)
    // Shuffle options when resetting for a retry
    setShuffledOptions(shuffleArray(RESPONSE_OPTIONS))
  }

  const handleNextExample = () => {
    handleResetOptions()

    if (currentExample < CYBERBULLYING_EXAMPLES.length - 1) {
      setCurrentExample(currentExample + 1)
      setGameState('intro')
      setIntroTimer(15)
      // Shuffle options for the new question
      setShuffledOptions(shuffleArray(RESPONSE_OPTIONS))
    } else {
      setGameState('complete')
    }
  }

  const handleGameComplete = () => {
    onComplete()
  }

  const availableOptions = shuffledOptions.filter(
    (option) => !dropZoneContent.some((item) => item?.id === option.id)
  )

  const currentOrientation = CYBERBULLYING_EXAMPLES[currentExample].orientation

  // Add handler to start the game from instructions
  const handleStartGame = () => {
    setGameState('intro')
    // Shuffle options when starting the game
    setShuffledOptions(shuffleArray(RESPONSE_OPTIONS))
  }

  return (
    <div
      style={{ backgroundImage: `url(${bg})` }}
      className='howyoureact-container'
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {gameState === 'intro' && (
        <div className='game-3-timer'>
          <GiAlarmClock size={50} color='yellow' />
          {'  '} {introTimer} seconds
        </div>
      )}
      {gameState === 'instructions' && (
        <GameInstructions onStart={handleStartGame} />
      )}

      {gameState === 'intro' && (
        <div className='intro-screen'>
          <div className={`example-card ${currentOrientation}`}>
            <div className='intro-message-content'>
              <img
                src={CYBERBULLYING_EXAMPLES[currentExample].image}
                alt='Chat screenshot'
                className='intro-message-image'
              />
            </div>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div className='game-screen'>
          <div className={`example-card slide-left ${currentOrientation}`}>
            <div className='message-content'>
              <img
                src={CYBERBULLYING_EXAMPLES[currentExample].image}
                alt='Chat screenshot'
                className='message-image'
                style={{
                  transform: `scale(${CYBERBULLYING_EXAMPLES[currentExample].scale})`
                }}
              />
            </div>
          </div>

          <div className='game-interaction'>
            <h3>What should you do? Drag the options in the correct order:</h3>

            <div className='drop-zones'>
              {dropZoneContent.map((item, index) => (
                <div
                  key={`drop-${index}`}
                  className={`drop-zone compact ${item ? 'filled' : ''}`}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  {item ? (
                    <div className='game-option-card compact' data-id={item.id}>
                      {/* <span className='option-number'>{index + 1}</span> */}
                      <span className='option-text'>{item.text}</span>
                    </div>
                  ) : (
                    <span className='placeholder'>Drop here</span>
                  )}
                </div>
              ))}
            </div>

            <div className='game-3-options-container'>
              {availableOptions.map((option) => (
                <div
                  key={option.id}
                  className='game-option-card draggable compact'
                  data-id={option.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, option)}
                  onDragEnd={handleDragEnd}
                  onTouchStart={(e) => handleTouchStart(e, option)}
                >
                  <span className='option-text'>{option.text}</span>
                </div>
              ))}
            </div>

            {showFeedback && (
              <div
                className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}
              >
                <div className='feedback-header'>
                  <div className='feedback-icon'>
                    {isCorrect ? (
                      <FaCheckCircle size={60} color='#4caf50' />
                    ) : (
                      <FaExclamationTriangle size={60} color='#f44336' />
                    )}
                  </div>
                  <h3>{isCorrect ? 'Great job!' : 'Oops! Wrong Answer'}</h3>
                  <button
                    className='feedback-button'
                    onClick={isCorrect ? handleNextExample : handleResetOptions}
                  >
                    {isCorrect ? 'Next Question' : 'Try Again'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {gameState === 'complete' && (
        <div className='outro-section'>
          <div className='outro-content-square'>
            {/* Corners */}
            <div className='corner top-left'></div>
            <div className='corner top-right'></div>
            <div className='corner bottom-left'></div>
            <div className='corner bottom-right'></div>

            <div className='outro-content-title'>Score Board</div>
            <div className='autro-content-score'>
              {score}/{CYBERBULLYING_EXAMPLES.length}
            </div>
            <div className='outro-content-stars'>
              <FaStar className='outro-star' />
              <FaStar className='outro-star' />
              <FaStar className='outro-star' />
              <FaStar className='outro-star' />
            </div>
            <div className='outro-content-button'>
              <button onClick={handleGameComplete}>Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HowYouReact
