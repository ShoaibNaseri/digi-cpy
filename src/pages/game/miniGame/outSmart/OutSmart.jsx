import './OutSmart.css'
import { useState, useEffect, useRef } from 'react'
import kitchenImg from '@/assets/game/bg_imgs/kitchen.jpg'
import wrongAnswerSound from '@/assets/game/game_sounds/wrong_answer.mp3'
import correctAnswerSound from '@/assets/game/game_sounds/correct.wav'

const OutSmart = ({ onComplete }) => {
  const voiceLocation = 'game/missions/mission_3/narrations/Milo_1629.mp3'
  const Question = [
    {
      id: 1,
      type: 'oven',
      question: 'Setting Up a New Smart Air Fryer',
      answers: [
        {
          id: 1,
          answer:
            'Ignore the privacy settings and connect it to Wi-Fi without making any changes.',
          isCorrect: false
        },
        {
          id: 2,
          answer:
            'Turn on all features to use the air fryer remotely, including voice control and audio recording.',
          isCorrect: false
        },
        {
          id: 3,
          answer:
            'Disable unnecessary features like voice activation and camera, and check the privacy policy to understand what data is shared.',
          isCorrect: true
        }
      ]
    },
    {
      id: 2,
      type: 'game_console',
      question: 'Installing a New Game Console',
      answers: [
        {
          id: 1,
          answer:
            'Connect to the home Wi-Fi, but enable the security settings and firewall.',
          isCorrect: true
        },
        {
          id: 2,
          answer: 'Use the neighbour’s open Wi-Fi to save your data plan.',
          isCorrect: false
        },
        {
          id: 3,
          answer:
            'Skip the Wi-Fi setup for now and leave the device unsecured.',
          isCorrect: false
        }
      ]
    },
    {
      id: 3,
      type: 'kitchen-speaker',
      question: 'Setting Up a New Smart Speaker',
      answers: [
        {
          id: 1,
          answer: 'Set up a strong, unique password for the device.',
          isCorrect: true
        },
        {
          id: 2,
          answer: 'Use the same password you use for everything else.',
          isCorrect: false
        },
        {
          id: 3,
          answer: 'Don’t set a password, it’s faster this way.',
          isCorrect: false
        }
      ]
    },
    {
      id: 4,
      type: 'kitchen-mobile',
      question: 'Phone Software Updates',
      answers: [
        {
          id: 1,
          answer:
            'Update the software immediately to protect against the latest threats.',
          isCorrect: true
        },
        {
          id: 2,
          answer: 'Ignore the update and continue using the phone.',
          isCorrect: false
        },
        {
          id: 3,
          answer: 'Postpone the update until next month.',
          isCorrect: false
        }
      ]
    }
  ]

  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set())
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const [voiceFinished, setVoiceFinished] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const voiceAudioRef = useRef(null)
  const wrongSoundRef = useRef(null)
  const correctSoundRef = useRef(null)

  // Load all assets
  useEffect(() => {
    const loadAssets = async () => {
      try {
        // Preload audio files
        wrongSoundRef.current = new Audio(wrongAnswerSound)
        correctSoundRef.current = new Audio(correctAnswerSound)

        // Load voice audio
        voiceAudioRef.current = new Audio(`/assets/${voiceLocation}`)

        setAssetsLoaded(true)
      } catch (error) {
        console.error('Error loading assets:', error)
        setAssetsLoaded(true) // Continue even if some assets fail
      }
    }

    loadAssets()
  }, [])

  // Handle image load and start voice
  useEffect(() => {
    if (assetsLoaded && imageLoaded && voiceAudioRef.current) {
      // Start playing voice
      voiceAudioRef.current.play()

      // Listen for voice completion
      voiceAudioRef.current.addEventListener('ended', () => {
        setVoiceFinished(true)
      })

      // Handle any errors
      voiceAudioRef.current.addEventListener('error', () => {
        setVoiceFinished(true)
      })
    }
  }, [assetsLoaded, imageLoaded])

  const showAnswers = (questionType) => {
    if (!voiceFinished) return // Prevent clicking before voice finishes

    const question = Question.find((q) => q.type === questionType)
    if (question && !answeredQuestions.has(questionType)) {
      setCurrentQuestion(question)
      setShowQuestionModal(true)
    }
  }

  const handleAnswerClick = (answer) => {
    if (answer.isCorrect) {
      // Play correct sound
      if (correctSoundRef.current) {
        correctSoundRef.current.currentTime = 0
        correctSoundRef.current.play()
      }

      setAnsweredQuestions((prev) => new Set([...prev, currentQuestion.type]))
      setShowQuestionModal(false)
      setCurrentQuestion(null)

      // Check if all questions are answered
      const newAnsweredQuestions = new Set([
        ...answeredQuestions,
        currentQuestion.type
      ])
      if (newAnsweredQuestions.size === Question.length) {
        // All questions answered, call onComplete
        onComplete()
      }
    } else {
      // Play wrong sound
      if (wrongSoundRef.current) {
        wrongSoundRef.current.currentTime = 0
        wrongSoundRef.current.play()
      }
    }
  }

  const closeModal = () => {
    setShowQuestionModal(false)
    setCurrentQuestion(null)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  return (
    <div className='out-smart__container'>
      <img
        className='out-smart__background'
        src={kitchenImg}
        alt='background'
        onLoad={handleImageLoad}
      />

      <div
        className={`hotspot oven ${!voiceFinished ? 'disabled' : ''}`}
        onClick={() => showAnswers('oven')}
      >
        <div className='hotspot-text'></div>
      </div>

      <div
        className={`hotspot game_console ${!voiceFinished ? 'disabled' : ''}`}
        onClick={() => showAnswers('game_console')}
      >
        <div className='hotspot-text'></div>
      </div>

      <div
        className={`hotspot kitchen-speaker ${
          !voiceFinished ? 'disabled' : ''
        }`}
        onClick={() => showAnswers('kitchen-speaker')}
      >
        <div className='hotspot-text'></div>
      </div>

      <div
        className={`hotspot kitchen-mobile ${!voiceFinished ? 'disabled' : ''}`}
        onClick={() => showAnswers('kitchen-mobile')}
      >
        <div className='hotspot-text'></div>
      </div>

      {/* Loading indicator */}
      {!assetsLoaded && (
        <div className='loading-overlay'>
          <div className='loading-spinner'>Loading...</div>
        </div>
      )}

      {/* Voice playing indicator */}
      {/* {assetsLoaded && imageLoaded && !voiceFinished && (
        <div className='voice-playing-overlay'>
          <div className='voice-indicator'>🎤 Playing voice...</div>
        </div>
      )} */}

      {/* Question Modal */}
      {showQuestionModal && currentQuestion && (
        <div className='question-modal-overlay'>
          <div className='question-modal'>
            <div className='question-content'>
              <div className='question-text-container'>
                <p className='question-text'>{currentQuestion.question}</p>
              </div>
              <div className='answers-container'>
                {currentQuestion.answers.map((answer) => (
                  <button
                    key={answer.id}
                    className={`out-samrt-asnwer-btn ${
                      answer.isCorrect ? 'correct' : 'incorrect'
                    }`}
                    onClick={() => handleAnswerClick(answer)}
                  >
                    {answer.answer}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OutSmart
