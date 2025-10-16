import { useState, useEffect, useRef } from 'react'
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import './SavePasswordAction.css'

const SavePasswordAction = ({ onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showButtons, setShowButtons] = useState(false)
  const [isPlayingAnswer, setIsPlayingAnswer] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [hasStartedAudio, setHasStartedAudio] = useState(false)
  const questionAudioRef = useRef(null)
  const answerAudioRef = useRef(null)

  const questions = [
    {
      questionText: 'Should you save your password on a ',
      question: 'SCHOOL COMPUTER',
      audio: '/assets/game/missions/mission_3/narrations/Luna_1606.mp3',
      answers: [
        {
          yes: '/assets/game/missions/mission_3/narrations/Luna_1917.mp3',
          no: '/assets/game/missions/mission_3/narrations/Luna_1613.mp3'
        }
      ]
    },
    {
      questionText: 'Should you save your password on your',
      question: 'HOME COMPUTER',
      audio: '/assets/game/missions/mission_3/narrations/Luna_1614.mp3',
      answers: [
        {
          yes: '/assets/game/missions/mission_3/narrations/Luna_1615.mp3',
          no: '/assets/game/missions/mission_3/narrations/Luna_1616.mp3'
        }
      ]
    },
    {
      questionText: 'Should you save your password on your ',
      question: "FRIEND'S PHONE",
      audio: '/assets/game/missions/mission_3/narrations/Luna_1909.mp3',
      answers: [
        {
          yes: '/assets/game/missions/mission_3/narrations/Luna_1623.mp3',
          no: '/assets/game/missions/mission_3/narrations/Luna_1628.mp3'
        }
      ]
    }
  ]

  useEffect(() => {
    if (currentQuestionIndex < questions.length) {
      // Reset state for new question
      setShowButtons(false)
      setIsPlaying(false)
      setIsPlayingAnswer(false)
      setIsAnimating(true)
      setHasStartedAudio(false)

      // Stop any currently playing audio
      if (questionAudioRef.current) {
        questionAudioRef.current.pause()
        questionAudioRef.current.currentTime = 0
      }
      if (answerAudioRef.current) {
        answerAudioRef.current.pause()
        answerAudioRef.current.currentTime = 0
      }

      // Audio will start after animation completes (handled in onAnimationComplete)
    }
  }, [currentQuestionIndex])

  const handleAnimationComplete = () => {
    setIsAnimating(false)

    // Only start audio if we haven't already started it for this question
    if (!hasStartedAudio) {
      setHasStartedAudio(true)
      // Start playing audio after animation completes
      setTimeout(() => {
        playQuestionAudio()
      }, 200) // Small delay to ensure smooth transition
    }
  }

  const playQuestionAudio = () => {
    const currentQuestion = questions[currentQuestionIndex]

    if (questionAudioRef.current && currentQuestion) {
      questionAudioRef.current.src = currentQuestion.audio
      questionAudioRef.current.load() // Force reload the audio

      questionAudioRef.current
        .play()
        .then(() => {
          setIsPlaying(true)
          setShowButtons(false)
          setIsPlayingAnswer(false)
        })
        .catch((error) => {
          // If audio fails to play, show buttons anyway
          setShowButtons(true)
        })
    }
  }

  const handleQuestionAudioEnded = () => {
    setIsPlaying(false)
    setShowButtons(true)
  }

  const handleAnswer = (answerType) => {
    const currentQuestion = questions[currentQuestionIndex]
    const audioFile =
      answerType === 'yes'
        ? currentQuestion.answers[0].yes
        : currentQuestion.answers[0].no

    if (answerAudioRef.current) {
      answerAudioRef.current.src = audioFile
      answerAudioRef.current.load() // Force reload the audio

      answerAudioRef.current
        .play()
        .then(() => {
          setIsPlaying(true)
          setIsPlayingAnswer(true)
          setShowButtons(false)
        })
        .catch((error) => {
          // If audio fails to play, proceed to next question
          handleAnswerAudioEnded()
        })
    }
  }

  const handleAnswerAudioEnded = () => {
    setIsPlaying(false)
    setIsPlayingAnswer(false)

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      // All questions completed
      if (onComplete) {
        onComplete()
      }
    }
  }

  const currentQuestion = questions[currentQuestionIndex]

  const cardVariants = {
    initial: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      rotateX: -15
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: -30,
      transition: {
        duration: 0.3,
        ease: 'easeIn'
      }
    }
  }

  const buttonVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
        staggerChildren: 0.1
      }
    }
  }

  const buttonItemVariants = {
    hidden: {
      opacity: 0,
      scale: 0.5
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  }

  return (
    <div className='save-pass-action-container'>
      <AnimatePresence mode='wait'>
        <motion.div
          key={currentQuestionIndex}
          className='save-pass-action-card'
          variants={cardVariants}
          initial='initial'
          animate='animate'
          exit='exit'
          onAnimationComplete={handleAnimationComplete}
        >
          <h1 className='save-pass-action-question'>
            {currentQuestion.questionText} <br />
            <span className='save-pass-action-question-place'>
              {currentQuestion.question}?
            </span>
          </h1>

          <motion.div
            className='save-pass-action-buttons'
            variants={buttonVariants}
            initial='hidden'
            animate={showButtons ? 'visible' : 'hidden'}
          >
            <motion.button
              className='save-pass-action-btn save-pass-action-thumbs-up'
              onClick={() => handleAnswer('yes')}
              disabled={isPlaying}
              variants={buttonItemVariants}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaThumbsUp />
            </motion.button>
            <motion.button
              className='save-pass-action-btn save-pass-action-thumbs-down'
              onClick={() => handleAnswer('no')}
              disabled={isPlaying}
              variants={buttonItemVariants}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaThumbsDown />
            </motion.button>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Separate audio elements for question and answer */}
      <audio
        ref={questionAudioRef}
        onEnded={handleQuestionAudioEnded}
        preload='auto'
      />
      <audio
        ref={answerAudioRef}
        onEnded={handleAnswerAudioEnded}
        preload='auto'
      />
    </div>
  )
}

export default SavePasswordAction
