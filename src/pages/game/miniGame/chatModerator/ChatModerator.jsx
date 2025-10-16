import chatIcon from '@/assets/game/mini_game/img/chat_moderator/Chaticon.png'

import user1 from '@/assets/game/mini_game/img/chat_moderator/avatar/Ellipse1.png'
import user2 from '@/assets/game/mini_game/img/chat_moderator/avatar/Ellipse2.png'
import user3 from '@/assets/game/mini_game/img/chat_moderator/avatar/Ellipse3.png'
import questions from '@/assets/game/mini_game/json/chat_moderator/chatmoderator.json'
import dialogBoxImg from '@/assets/game/2.png'
import backgroundImg from '@/assets/game/mini_game/img/chat_moderator/game_bg.png'
import wrongAnswerSound from '@/assets/game/game_sounds/wrong_answer.mp3'
import correctAnswerSound from '@/assets/game/game_sounds/correct_answer.m4a'
import messageSound from '@/assets/game/game_sounds/notification1.wav'
import './chatmoderator.css'
import { useState, useEffect } from 'react'

// Import components
import LoadingIndicator from '@/components/common/GamePreloader'
import { loadGameAssets } from '@/utils/assetLoader'
import TitleCard from '@/components/game/mini_game/chat_moderator/TitleCard'
import InstructionsCard from '@/components/game/mini_game/chat_moderator/InstructionsCard'
import ChatSidebar from '@/components/game/mini_game/chat_moderator/ChatSidebar'
import ChatMessages from '@/components/game/mini_game/chat_moderator/ChatMessages'
import InfoPanel from '@/components/game/mini_game/chat_moderator/InfoPanel'
import GameCompleteModal from '@/components/game/mini_game/chat_moderator/GameCompleteModal'

const ChatModerator = ({ onComplete }) => {
  // Game state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showCorrectFeedback, setShowCorrectFeedback] = useState(false)
  const [showIncorrectFeedback, setShowIncorrectFeedback] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [showTitleCard, setShowTitleCard] = useState(true)
  const [showInstructions, setShowInstructions] = useState(false)
  const [titleCardIndex, setTitleCardIndex] = useState(0)
  const [isGameComplete, setIsGameComplete] = useState(false)
  const [randomizedOptions, setRandomizedOptions] = useState([])
  const [shuffledQuestionIndices, setShuffledQuestionIndices] = useState([])
  const [isLoadingAssets, setIsLoadingAssets] = useState(true)

  // Define all assets that need to be preloaded
  const gameAssets = [
    chatIcon,
    user1,
    user2,
    user3,
    dialogBoxImg,
    backgroundImg,
    wrongAnswerSound,
    correctAnswerSound,
    messageSound
  ]

  // Load assets on component mount
  useEffect(() => {
    const loadAssets = async () => {
      setIsLoadingAssets(true)
      try {
        await loadGameAssets(gameAssets)
      } catch (error) {
        console.error('Error loading game assets:', error)
      } finally {
        setIsLoadingAssets(false)
      }
    }

    loadAssets()
  }, [])

  // Helper function to get avatar based on index
  const getAvatar = (index) => {
    // Cycle through the three avatars
    switch (index % 3) {
      case 0:
        return user1
      case 1:
        return user2
      case 2:
        return user3
      default:
        return user1
    }
  }

  // Function to play message sound
  const playMessageSound = () => {
    const audioElement = new Audio(messageSound)
    audioElement.volume = 0.3 // Lower volume for message sounds
    audioElement.play().catch((error) => {
      console.log('Message sound play failed:', error)
    })
  }

  // Function to shuffle answer options
  const shuffleOptions = () => {
    const options = [
      'Harassment',
      'Hate Speech',
      'Intimidation',
      'Sharing photos without permission'
    ]

    // Fisher-Yates shuffle algorithm
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[options[i], options[j]] = [options[j], options[i]]
    }

    setRandomizedOptions(options)
  }

  // Function to shuffle question indices
  const shuffleQuestions = () => {
    const indices = Array.from(
      { length: questions.question_data.length },
      (_, i) => i
    )

    // Fisher-Yates shuffle algorithm
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }

    setShuffledQuestionIndices(indices)
  }

  // Initialize shuffled questions when component mounts
  useEffect(() => {
    shuffleQuestions()
  }, [])

  // Initialize randomized options when question changes
  useEffect(() => {
    shuffleOptions()
  }, [currentQuestionIndex])

  const handleAnswerClick = (answer) => {
    const currentActualQuestionIndex =
      shuffledQuestionIndices[currentQuestionIndex]
    const correctAnswer = questions.question_data[
      currentActualQuestionIndex
    ].messages.find((msg) => msg.isQuestion).answer

    setSelectedAnswer(answer)

    if (answer === correctAnswer) {
      setShowCorrectFeedback(true)
      setShowIncorrectFeedback(false)
      const audioElement = new Audio(correctAnswerSound)
      audioElement.play()

      setTimeout(() => {
        if (currentQuestionIndex === shuffledQuestionIndices.length - 1) {
          setIsGameComplete(true)
        } else {
          setCurrentQuestionIndex((prevIndex) => prevIndex + 1)
          setSelectedAnswer(null)
          setSelectedQuestion(null)
          setShowCorrectFeedback(false)
        }
      }, 1500)
    } else {
      setShowIncorrectFeedback(true)
      setShowCorrectFeedback(false)
      const audioElement = new Audio(wrongAnswerSound)
      audioElement.play()

      setTimeout(() => {
        setShowIncorrectFeedback(false)
        setSelectedAnswer(null)
      }, 1000)
    }
  }

  const handleQuestionClick = (message) => {
    if (message.isQuestion) {
      if (selectedQuestion !== message) {
        setSelectedQuestion(message)
        shuffleOptions() // Shuffle options when a new question is selected
      } else {
        setSelectedQuestion(null)
      }

      setSelectedAnswer(null)
      setShowCorrectFeedback(false)
      setShowIncorrectFeedback(false)
    }
  }

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      setSelectedQuestion(null)
      setSelectedAnswer(null)
      setShowCorrectFeedback(false)
      setShowIncorrectFeedback(false)
    }
  }

  const handleReplayGame = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setSelectedQuestion(null)
    setShowCorrectFeedback(false)
    setShowIncorrectFeedback(false)
    setIsGameComplete(false)
    setShowTitleCard(true)
    setShowInstructions(false)
    setTitleCardIndex(0)
    shuffleQuestions() // Reshuffle questions for replay
  }

  const handleContinueGame = () => {
    setIsGameComplete(false)
    if (onComplete) {
      onComplete()
    } else {
      console.error('Game Complete')
    }
  }

  // Title card handlers
  const handleNextTitleCard = () => {
    setTitleCardIndex(1)
  }

  const handleStartGame = () => {
    setShowTitleCard(false)
    setShowInstructions(true)
  }

  const handleStartActualGame = () => {
    setShowInstructions(false)
  }

  const currentQuestion =
    shuffledQuestionIndices.length > 0
      ? questions.question_data[shuffledQuestionIndices[currentQuestionIndex]]
      : questions.question_data[0] // Fallback for initial render
  const titleCardsData = questions.title_cards || []

  return (
    <div className='game-container'>
      {/* Show loading indicator while assets are loading */}
      {isLoadingAssets && (
        <LoadingIndicator content='Loading game assets...' isLoading={true} />
      )}

      {/* Show game content only after assets are loaded */}
      {!isLoadingAssets && (
        <>
          {/* Cards Container with Background - only render when cards are shown */}
          {(showTitleCard || showInstructions) && (
            <div
              className='cards-background-container'
              style={{ backgroundImage: `url(${backgroundImg})` }}
            >
              {showTitleCard && (
                <TitleCard
                  titleCardsData={titleCardsData}
                  titleCardIndex={titleCardIndex}
                  dialogBoxImg={dialogBoxImg}
                  onNext={handleNextTitleCard}
                  onStart={handleStartGame}
                />
              )}

              {showInstructions && (
                <InstructionsCard
                  dialogBoxImg={dialogBoxImg}
                  onStart={handleStartActualGame}
                  voice={questions.instruction.voice}
                />
              )}
            </div>
          )}

          {/* Main Chat App */}
          {!showTitleCard && !showInstructions && (
            <div className='chat-app' onClick={handleBackgroundClick}>
              <ChatSidebar
                chatIcon={chatIcon}
                onlineUsers={currentQuestion.online_users}
                getAvatar={getAvatar}
              />

              <ChatMessages
                messages={currentQuestion.messages}
                getAvatar={getAvatar}
                selectedQuestion={selectedQuestion}
                randomizedOptions={randomizedOptions}
                selectedAnswer={selectedAnswer}
                showCorrectFeedback={showCorrectFeedback}
                showIncorrectFeedback={showIncorrectFeedback}
                handleQuestionClick={handleQuestionClick}
                handleAnswerClick={handleAnswerClick}
                playMessageSound={playMessageSound}
              />

              <InfoPanel selectedQuestion={selectedQuestion} />

              {isGameComplete && (
                <GameCompleteModal
                  onReplay={handleReplayGame}
                  onContinue={handleContinueGame}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ChatModerator
