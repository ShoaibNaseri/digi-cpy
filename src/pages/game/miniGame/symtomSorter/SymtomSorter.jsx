import './symtomsorter.css'
import { useState, useEffect, useRef } from 'react'
import wrongAnswerSound from '@/assets/game/game_sounds/wrong_answer.mp3'
import correctAnswerSound from '@/assets/game/game_sounds/correct_answer.m4a'
import dialogBoxImg from '@/assets/game/2.png'
import { FaCheck, FaHandPointer } from 'react-icons/fa'
import TitleCard from '@/components/game/mini_game/symptom_sorter/TitleCard'
import GameCompleteModal from '@/components/game/mini_game/symptom_sorter/GameCompleteModal'
import narrationAudio from '@/assets/game/mini_game/narrations/Sorter_932.mp3'

const SymtomSorter = ({ onComplete }) => {
  const symtoms = [
    {
      id: 1,
      name: 'Irritable',
      type: 'emotional'
    },
    {
      id: 2,
      name: 'Nightmares',
      type: 'emotional'
    },
    {
      id: 3,
      name: 'Racing Heart',
      type: 'physical'
    },
    {
      id: 4,
      name: 'Loss of Appetite',
      type: 'physical'
    },
    {
      id: 5,
      name: 'Feeling Helpless',
      type: 'emotional'
    },
    {
      id: 6,
      name: 'Stomach Ache',
      type: 'physical'
    },
    {
      id: 7,
      name: 'Feeling Ashamed & Embarrassed',
      type: 'emotional'
    },
    {
      id: 8,
      name: 'Nauseous',
      type: 'physical'
    },
    {
      id: 9,
      name: 'Get Angry Easily',
      type: 'emotional'
    },
    {
      id: 10,
      name: 'Feeling Sick',
      type: 'physical'
    },
    {
      id: 11,
      name: 'Low Self-Confidence',
      type: 'emotional'
    },
    {
      id: 12,
      name: 'Feeling Sad & Depressed',
      type: 'emotional'
    },
    {
      id: 13,
      name: 'Feeling Lonely & Isolated',
      type: 'emotional'
    },
    {
      id: 14,
      name: "Don't want to go to school",
      type: 'emotional'
    },
    {
      id: 15,
      name: 'Not Sleeping well',
      type: 'physical'
    },
    {
      id: 16,
      name: "Can't concentrate",
      type: 'emotional'
    },
    {
      id: 17,
      name: 'Throwing up',
      type: 'physical'
    },
    {
      id: 18,
      name: "Don't Care about anything",
      type: 'emotional'
    },
    {
      id: 19,
      name: 'Feeling Guilty',
      type: 'emotional'
    },
    {
      id: 20,
      name: 'No Energy',
      type: 'physical'
    },
    {
      id: 21,
      name: ' Anxious or Sad',
      type: 'emotional'
    },
    {
      id: 22,
      name: "Don't want to participate in activities",
      type: 'emotional'
    },
    {
      id: 23,
      name: 'Headaches',
      type: 'physical'
    }
  ]

  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(90) // Changed to 90 seconds as per requirements
  const [activeSymptoms, setActiveSymptoms] = useState([])
  const [emotionalSymptoms, setEmotionalSymptoms] = useState([])
  const [physicalSymptoms, setPhysicalSymptoms] = useState([])
  const [wrongItem, setWrongItem] = useState(null)
  const wrongItemRef = useRef(null)
  const [touchedSymptom, setTouchedSymptom] = useState(null)
  const [showEndModal, setShowEndModal] = useState(false)
  // Add state for touch dragging
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const emotionalDropRef = useRef(null)
  const physicalDropRef = useRef(null)
  // Add state for drop zone highlighting
  const [emotionalDragOver, setEmotionalDragOver] = useState(false)
  const [physicalDragOver, setPhysicalDragOver] = useState(false)
  // Add state for mobile hint
  const [showMobileHint, setShowMobileHint] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  // Add state for title card
  const [showTitleCard, setShowTitleCard] = useState(true)

  // Title card data - using only the second card
  const titleCardData = {
    title: 'Symptom Sorter',
    description:
      'Digipalz, your goal is to sort and drag the emotional symptoms to the left column and the physical symptoms to the right column in 90 seconds. Good luck!'
  }

  const handleStartGame = () => {
    setShowTitleCard(false)
    startGame()
  }

  // Check if user is on mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice =
        'ontouchstart' in window || navigator.maxTouchPoints > 0
      setIsMobile(isTouchDevice)
      if (isTouchDevice) {
        setShowMobileHint(true)
        // Hide hint after a few seconds
        setTimeout(() => setShowMobileHint(false), 5000)
      }
    }

    checkMobile()
  }, [])

  // Initialize the game
  const startGame = () => {
    setGameStarted(true)
    setScore(0)
    setTime(90)
    setActiveSymptoms([...symtoms])
    setEmotionalSymptoms([])
    setPhysicalSymptoms([])
    setShowEndModal(false)

    // Show mobile hint briefly when game starts if on mobile
    if (isMobile) {
      setShowMobileHint(true)
      setTimeout(() => setShowMobileHint(false), 5000)
    }
  }

  // Continue function for the modal
  const handleContinue = () => {
    setShowEndModal(false)
    if (onComplete) {
      onComplete()
    } else {
      console.warn('onComplete prop not provided to SymtomSorter')
    }
  }

  // Timer functionality
  useEffect(() => {
    let interval
    if (gameStarted && time > 0 && !showEndModal) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1)
      }, 1000)
    } else if (time === 0 && gameStarted) {
      setGameStarted(false)
      setShowEndModal(true)
    }

    return () => clearInterval(interval)
  }, [gameStarted, time, showEndModal])

  // Format time as minutes:seconds
  const formatTime = () => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  // Check if game is complete (no active symptoms left)
  const checkCompletion = (updatedActiveSymptoms) => {
    if (updatedActiveSymptoms.length === 0) {
      setGameStarted(false)
      setShowEndModal(true)
    }
  }

  // Drag handlers
  const handleDragStart = (e, symptom) => {
    e.dataTransfer.setData('symptomId', symptom.id)

    // Set aria-grabbed attribute to style the dragged element
    e.target.setAttribute('aria-grabbed', 'true')

    // Highlight appropriate drop zone based on symptom type
    if (symptom.type === 'emotional') {
      setEmotionalDragOver(true)
      setPhysicalDragOver(false)
    } else {
      setEmotionalDragOver(false)
      setPhysicalDragOver(true)
    }
  }

  // Update dragOver to track the pointer position instead of relying on zone
  const handleDragOver = (e) => {
    e.preventDefault()
    // Get the center point of each drop zone
    const emotionalRect = emotionalDropRef.current?.getBoundingClientRect()
    const physicalRect = physicalDropRef.current?.getBoundingClientRect()

    // Get cursor position
    const cursorX = e.clientX
    const cursorY = e.clientY

    // Check if cursor is over emotional drop zone
    if (
      emotionalRect &&
      cursorX >= emotionalRect.left &&
      cursorX <= emotionalRect.right &&
      cursorY >= emotionalRect.top &&
      cursorY <= emotionalRect.bottom
    ) {
      setEmotionalDragOver(true)
      setPhysicalDragOver(false)
    }
    // Check if cursor is over physical drop zone
    else if (
      physicalRect &&
      cursorX >= physicalRect.left &&
      cursorX <= physicalRect.right &&
      cursorY >= physicalRect.top &&
      cursorY <= physicalRect.bottom
    ) {
      setPhysicalDragOver(true)
      setEmotionalDragOver(false)
    }
    // Not over any drop zone
    else {
      setEmotionalDragOver(false)
      setPhysicalDragOver(false)
    }
  }

  // Add drag end handler to reset highlights
  const handleDragEnd = (e) => {
    // Reset aria-grabbed attribute
    if (e.target) {
      e.target.setAttribute('aria-grabbed', 'false')
    }

    setEmotionalDragOver(false)
    setPhysicalDragOver(false)
  }

  // Update the drop handlers to check the drop zone specifically
  const handleDrop = (e, targetType) => {
    e.preventDefault()
    setEmotionalDragOver(false)
    setPhysicalDragOver(false)
    const symptomId = parseInt(e.dataTransfer.getData('symptomId'))
    const symptom = activeSymptoms.find((s) => s.id === symptomId)

    if (symptom) {
      if (symptom.type === targetType) {
        // Correct placement
        const audioElement = new Audio(correctAnswerSound)
        audioElement.play()
        setScore((prevScore) => prevScore + 10)

        setActiveSymptoms((prevSymptoms) => {
          const newActive = prevSymptoms.filter((s) => s.id !== symptomId)
          checkCompletion(newActive)
          return newActive
        })

        if (targetType === 'emotional') {
          setEmotionalSymptoms((prev) => [...prev, symptom])
        } else {
          setPhysicalSymptoms((prev) => [...prev, symptom])
        }
      } else {
        // Incorrect placement - animate shake effect
        const audioElement = new Audio(wrongAnswerSound)
        audioElement.play()
        setScore((prevScore) => Math.max(0, prevScore - 5))

        // Set the wrong item to trigger animation
        setWrongItem(symptomId)

        // Clear the wrong item after animation completes
        setTimeout(() => {
          setWrongItem(null)
        }, 500)
      }
    }
  }

  // Update handleDragLeave
  const handleDragLeave = (e) => {
    // Only clear a drop zone if the mouse actually leaves it
    // This prevents issues when moving between symptoms within the same drop zone
    const relatedTarget = e.relatedTarget
    const emotionalDropElement = emotionalDropRef.current
    const physicalDropElement = physicalDropRef.current

    // Check if we're leaving for an element outside our drop zones
    if (
      !emotionalDropElement?.contains(relatedTarget) &&
      !physicalDropElement?.contains(relatedTarget)
    ) {
      setEmotionalDragOver(false)
      setPhysicalDragOver(false)
    }
  }

  // Enhanced touch handlers for better mobile experience
  const handleTouchStart = (symptom) => {
    return (e) => {
      // Hide hint when user starts interacting
      setShowMobileHint(false)

      // Store the currently touched symptom in state
      setTouchedSymptom(symptom)
      setIsDragging(true)

      // Get the touch coordinates
      const touch = e.touches[0]
      setTouchPosition({
        x: touch.clientX,
        y: touch.clientY
      })
    }
  }

  const handleTouchMove = (e) => {
    if (!touchedSymptom || !isDragging) return

    e.preventDefault() // Prevent scrolling while dragging

    // Update the touch position as the finger moves
    const touch = e.touches[0]
    const newX = touch.clientX
    const newY = touch.clientY

    setTouchPosition({
      x: newX,
      y: newY
    })

    // Check if touch is over drop zones to update visual feedback
    const emotionalRect = emotionalDropRef.current?.getBoundingClientRect()
    const physicalRect = physicalDropRef.current?.getBoundingClientRect()

    // Update drop zone highlighting state
    if (
      emotionalRect &&
      newX >= emotionalRect.left &&
      newX <= emotionalRect.right &&
      newY >= emotionalRect.top &&
      newY <= emotionalRect.bottom
    ) {
      setEmotionalDragOver(true)
      setPhysicalDragOver(false)
    } else if (
      physicalRect &&
      newX >= physicalRect.left &&
      newX <= physicalRect.right &&
      newY >= physicalRect.top &&
      newY <= physicalRect.bottom
    ) {
      setPhysicalDragOver(true)
      setEmotionalDragOver(false)
    } else {
      setEmotionalDragOver(false)
      setPhysicalDragOver(false)
    }
  }

  const handleTouchEnd = (e) => {
    if (!touchedSymptom || !isDragging) return

    // Check if touch ended over a drop zone
    const touchX = touchPosition.x
    const touchY = touchPosition.y

    // Get rectangle dimensions of drop zones
    const emotionalRect = emotionalDropRef.current?.getBoundingClientRect()
    const physicalRect = physicalDropRef.current?.getBoundingClientRect()

    // Check if the touch position is inside the emotional symptoms area
    if (
      emotionalRect &&
      touchX >= emotionalRect.left &&
      touchX <= emotionalRect.right &&
      touchY >= emotionalRect.top &&
      touchY <= emotionalRect.bottom
    ) {
      handleSymptomPlacement('emotional')
    }
    // Check if the touch position is inside the physical symptoms area
    else if (
      physicalRect &&
      touchX >= physicalRect.left &&
      touchX <= physicalRect.right &&
      touchY >= physicalRect.top &&
      touchY <= physicalRect.bottom
    ) {
      handleSymptomPlacement('physical')
    }

    // Reset drag state
    setIsDragging(false)
    setTouchedSymptom(null)
    setEmotionalDragOver(false)
    setPhysicalDragOver(false)
  }

  // Common function for handling symptom placement
  const handleSymptomPlacement = (targetType) => {
    if (!touchedSymptom) return

    if (touchedSymptom.type === targetType) {
      // Correct placement
      const audioElement = new Audio(correctAnswerSound)
      audioElement.play()
      setScore((prevScore) => prevScore + 10)

      setActiveSymptoms((prevSymptoms) => {
        const newActive = prevSymptoms.filter((s) => s.id !== touchedSymptom.id)
        checkCompletion(newActive)
        return newActive
      })

      if (targetType === 'emotional') {
        setEmotionalSymptoms((prev) => [...prev, touchedSymptom])
      } else {
        setPhysicalSymptoms((prev) => [...prev, touchedSymptom])
      }
    } else {
      // Incorrect placement
      const audioElement = new Audio(wrongAnswerSound)
      audioElement.play()
      setScore((prevScore) => Math.max(0, prevScore - 5))
      setWrongItem(touchedSymptom.id)
      setTimeout(() => {
        setWrongItem(null)
      }, 500)
    }
  }

  // Function to get a color based on symptom id
  const getSymptomColor = (id) => {
    // Array of distinct colors for symptoms
    const colors = [
      '#FF5733', // Red-Orange
      '#33FF57', // Green
      '#3357FF', // Blue
      '#FF33A8', // Pink
      '#33FFF5', // Cyan
      '#F533FF', // Magenta
      '#FFD633', // Yellow
      '#8A33FF', // Purple
      '#FF8A33', // Orange
      '#33FFAA', // Mint
      '#D4FF33', // Lime
      '#335BFF', // Royal Blue
      '#FF33F5', // Hot Pink
      '#33FFD4', // Turquoise
      '#FF5733', // Repeating colors for more symptoms
      '#33FF57',
      '#3357FF',
      '#FF33A8',
      '#33FFF5',
      '#F533FF',
      '#FFD633',
      '#8A33FF',
      '#FF8A33'
    ]

    // Use modulo to ensure we don't go out of bounds
    return colors[(id - 1) % colors.length]
  }

  // Style for the floating dragged item
  const getDraggedItemStyle = () => {
    if (!touchedSymptom) return {}

    return {
      position: 'fixed',
      left: `${touchPosition.x}px`,
      top: `${touchPosition.y}px`,
      transform: 'translate(-50%, -50%)',
      zIndex: 1000,
      opacity: 0.9, // Increased opacity for better visibility
      pointerEvents: 'none',
      padding: '10px 15px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)', // Add shadow for better depth
      fontWeight: 'bold',
      color: '#fff',
      minWidth: '120px', // Ensure minimum width for better visibility
      textAlign: 'center',
      fontSize: '16px' // Slightly larger font for better visibility
    }
  }

  // Preload audio files
  useEffect(() => {
    // Preload narration audio
    const preloadNarration = new Audio(narrationAudio)
    preloadNarration.preload = 'auto'

    console.log('Preloading narration audio:', narrationAudio)

    // Also preload other game sounds
    const preloadWrong = new Audio(wrongAnswerSound)
    const preloadCorrect = new Audio(correctAnswerSound)

    preloadWrong.preload = 'auto'
    preloadCorrect.preload = 'auto'

    return () => {
      // Clean up preload objects
      preloadNarration.src = ''
      preloadWrong.src = ''
      preloadCorrect.src = ''
    }
  }, [])

  // Render title card if showTitleCard is true
  if (showTitleCard) {
    return (
      <TitleCard
        titleCardData={titleCardData}
        dialogBoxImg={dialogBoxImg}
        onStart={handleStartGame}
        narrationFile={narrationAudio}
      />
    )
  }

  return (
    <div
      className='symtomsorter-container'
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className='symtomsorter-header'>
        <div
          className={`symtomsorter-header-timer ${
            time < 10 ? 'timer-warning' : ''
          }`}
        >
          {formatTime()}
        </div>
        {!gameStarted && !showEndModal && (
          <div className='symtomsorter-header-button' onClick={startGame}>
            Start Game
          </div>
        )}
        <div className='symtomsorter-header-score'>
          Score: <span>{score}</span>
        </div>
      </div>
      <div className='symtomsorter-body'>
        <div
          className={`symtomsorter-body-left ${
            emotionalDragOver ? 'drag-over' : ''
          }`}
          ref={emotionalDropRef}
          onDrop={(e) => handleDrop(e, 'emotional')}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <h1 className='symtomsorter-body-left-title'>Emotional Symptoms</h1>
          <div className='symtomsorter-body-symptoms'>
            {emotionalSymptoms.map((symptom) => (
              <div
                key={symptom.id}
                className='symtomsorter-symptom-item correct-item'
                style={{ backgroundColor: 'green' }}
              >
                <span className='symptom-text'>{symptom.name}</span>
                <span className='check-icon'>
                  <FaCheck />
                </span>
              </div>
            ))}
          </div>
        </div>
        <div
          className={`symtomsorter-body-right ${
            physicalDragOver ? 'drag-over' : ''
          }`}
          ref={physicalDropRef}
          onDrop={(e) => handleDrop(e, 'physical')}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <h1 className='symtomsorter-body-right-title'>Physical Symptoms</h1>
          <div className='symtomsorter-body-symptoms'>
            {physicalSymptoms.map((symptom) => (
              <div
                key={symptom.id}
                className='symtomsorter-symptom-item correct-item'
                style={{ backgroundColor: 'green' }}
              >
                <span className='symptom-text'>{symptom.name}</span>
                <span className='check-icon'>
                  <FaCheck />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className='symtomsorter-footer'>
        <div className='symtomsorter-footer-question'>
          {gameStarted
            ? activeSymptoms.map((symptom) => (
                <div
                  key={symptom.id}
                  ref={wrongItem === symptom.id ? wrongItemRef : null}
                  className={`symtomsorter-symptom-item ${
                    wrongItem === symptom.id ? 'shake-animation' : ''
                  }`}
                  style={{ backgroundColor: getSymptomColor(symptom.id) }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, symptom)}
                  onDragEnd={handleDragEnd}
                  onTouchStart={handleTouchStart(symptom)}
                >
                  {symptom.name}
                </div>
              ))
            : !showEndModal && (
                <div className='start-game-message'>Press Start Game</div>
              )}
        </div>
      </div>

      {/* Mobile hint for touch users */}
      {showMobileHint && gameStarted && (
        <div className='mobile-hint'>
          <FaHandPointer /> Drag symptoms to their correct category
        </div>
      )}

      {/* Visual feedback for touch dragging */}
      {isDragging && touchedSymptom && (
        <div
          className='touch-dragging-element'
          style={{
            ...getDraggedItemStyle(),
            backgroundColor: getSymptomColor(touchedSymptom.id)
          }}
        >
          {touchedSymptom.name}
        </div>
      )}

      {showEndModal && (
        <GameCompleteModal
          score={score}
          isSuccess={activeSymptoms.length === 0}
          onReplay={startGame}
          onContinue={handleContinue}
        />
      )}
    </div>
  )
}

export default SymtomSorter
