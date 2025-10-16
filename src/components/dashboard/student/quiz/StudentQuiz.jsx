import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import StudentQuestionSummary from './StudentQuestionSummary'
import Timer from './Timer'
import { FaCircleCheck } from 'react-icons/fa6'
import { PiLightbulbFilamentFill } from 'react-icons/pi'
import { FaArrowRight } from 'react-icons/fa'
import { images } from '@/config/images'
import './StudentQuiz.css'
import MultipleChoiceQuestion from './question-types/MultipleChoiceQuestion'
import ConfidenceBasedQuestion from './question-types/ConfidenceBasedQuestion'
import AgreeBasedQuestion from './question-types/AgreeBasedQuestion'
import TextInputQuestion from './question-types/TextInputQuestion'
import { quizService } from '@/services/quizService'
import PagePreloader from '@/components/common/preloaders/PagePreloader'
import { useQueryClient } from '@tanstack/react-query'
// Quiz type constants (matching admin context)
const QUIZ_TYPES = {
  MULTIPLE_CHOICE: 'multiple-choice',
  CONFIDENCE_BASED: 'confidence-based',
  AGREE_BASED: 'agree-based',
  TEXT_INPUT: 'text-input'
}

const StudentQuiz = () => {
  const { quizId } = useParams()
  const [quiz, setQuiz] = useState(null)
  const queryClient = useQueryClient()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [confidenceLevel, setConfidenceLevel] = useState(null)
  const [textAnswer, setTextAnswer] = useState('')
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(null)
  const [remainingTime, setRemainingTime] = useState(null)
  const [showWelcomeModal, setShowWelcomeModal] = useState(true)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizData = await quizService.getStudentQuiz(quizId)
        if (quizData) {
          setQuiz(quizData)
          setCurrentQuestionIndex(quizData.currentQuestionIndex || 0)
          setAnswers(quizData.answers || {})
          setRemainingTime(quizData.remainingTime || quizData.quizDuration * 60)
          setShowWelcomeModal(quizData.status === 'in-progress')
        } else {
          setError('Quiz not found')
        }
      } catch (err) {
        setError('Error fetching quiz')
        console.error('Error fetching quiz:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [quizId])

  if (loading) {
    return <PagePreloader color='black' textData='Loading quiz...' />
  }

  if (error) {
    return <div className='student-quiz'>{error}</div>
  }

  if (!quiz || !quiz.questions) {
    return <div className='student-quiz'>Quiz not found</div>
  }

  if (quiz.status === 'completed' || isSubmitted) {
    return (
      <StudentQuestionSummary
        questions={quiz.questions}
        answers={answers}
        quiz={quiz}
      />
    )
  }

  const handleStartQuiz = () => {
    setShowWelcomeModal(false)
    setHasStarted(true)
  }

  const getQuizTypeInstructions = () => {
    const quizType = quiz.quizType || QUIZ_TYPES.MULTIPLE_CHOICE

    switch (quizType) {
      case QUIZ_TYPES.MULTIPLE_CHOICE:
        return (
          <>
            <p>For each question, make sure to:</p>
            <ul>
              <li>
                <span className='welcome-modal__instruction-icon'>
                  <FaCircleCheck />{' '}
                </span>
                Read the question carefully
              </li>
              <li>
                <span className='welcome-modal__instruction-icon'>
                  <FaCircleCheck />{' '}
                </span>
                Look at all the choices
              </li>
              <li>
                <span className='welcome-modal__instruction-icon'>
                  <FaCircleCheck />{' '}
                </span>
                Pick the best answer
              </li>
            </ul>
          </>
        )

      case QUIZ_TYPES.CONFIDENCE_BASED:
        return (
          <>
            <p>For each question, you will:</p>
            <ul>
              <li>
                <span>
                  <FaCircleCheck />{' '}
                </span>
                Answer the question first
              </li>
              <li>
                <span className='welcome-modal__instruction-icon'>
                  <FaCircleCheck />{' '}
                </span>
                Then rate your confidence level
              </li>
              <li>
                <span className='welcome-modal__instruction-icon'>
                  <FaCircleCheck />{' '}
                </span>
                Be honest about how sure you are
              </li>
            </ul>
          </>
        )

      case QUIZ_TYPES.AGREE_BASED:
        return (
          <>
            <p>For each statement, you will:</p>
            <ul>
              <li>
                <span className='welcome-modal__instruction-icon'>
                  <FaCircleCheck />{' '}
                </span>
                Read the statement carefully
              </li>
              <li>
                <span className='welcome-modal__instruction-icon'>
                  <FaCircleCheck />{' '}
                </span>
                Choose how much you agree or disagree
              </li>
              <li>
                <span className='welcome-modal__instruction-icon'>
                  <FaCircleCheck />{' '}
                </span>
                Consider the explanation provided
              </li>
            </ul>
          </>
        )

      case QUIZ_TYPES.TEXT_INPUT:
        return (
          <>
            <p>For each question, you will:</p>
            <ul>
              <li>
                <span className='welcome-modal__instruction-icon'>
                  <FaCircleCheck />{' '}
                </span>
                Read the question carefully
              </li>
              <li>
                <span className='welcome-modal__instruction-icon'>
                  <FaCircleCheck />{' '}
                </span>
                Type your detailed answer
              </li>
              <li>
                <span className='welcome-modal__instruction-icon'>
                  <FaCircleCheck />{' '}
                </span>
                Provide thorough explanations
              </li>
            </ul>
          </>
        )

      default:
        return (
          <>
            <p>For each question, make sure to:</p>
            <ul>
              <li>
                <span className='welcome-modal__instruction-icon'>
                  <FaCircleCheck />{' '}
                </span>
                Read the question carefully
              </li>
              <li>
                <span className='welcome-modal__instruction-icon'>
                  <FaCircleCheck />{' '}
                </span>
                Provide your best answer
              </li>
            </ul>
          </>
        )
    }
  }

  if (showWelcomeModal && quiz.status === 'in-progress') {
    return (
      <div className='welcome-modal-overlay'>
        <div className='welcome-modal'>
          <div className='welcome-modal__icon'>
            <PiLightbulbFilamentFill />
          </div>
          <h2 className='welcome-modal__title'>Ready for Your Quiz?</h2>
          <p className='welcome-modal__message'>
            Hey there! 👋 You're about to start a{' '}
            {quiz.quizType
              ? quiz.quizType.replace('-', ' ')
              : 'multiple choice'}{' '}
            quiz!
          </p>
          <div className='welcome-modal__instructions'>
            {getQuizTypeInstructions()}
          </div>
          <button
            className='welcome-modal__start-btn'
            onClick={handleStartQuiz}
          >
            Let's Start! <FaArrowRight />
          </button>
        </div>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
      const previousAnswer = answers[currentQuestionIndex - 1]
      if (previousAnswer) {
        if (
          typeof previousAnswer === 'object' &&
          previousAnswer.answer !== undefined
        ) {
          setSelectedAnswer(previousAnswer.answer)
          setConfidenceLevel(previousAnswer.confidenceLevel)
        } else {
          setSelectedAnswer(previousAnswer)
        }
      } else {
        setSelectedAnswer(null)
        setConfidenceLevel(null)
      }
      setTextAnswer(answers[currentQuestionIndex - 1] || '')
    }
  }

  const handleNext = async () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      let answerToSave = null

      // Save answer based on quiz type
      const quizType = quiz.quizType || QUIZ_TYPES.MULTIPLE_CHOICE
      if (quizType === QUIZ_TYPES.CONFIDENCE_BASED) {
        answerToSave = confidenceLevel
      } else if (quizType === QUIZ_TYPES.TEXT_INPUT) {
        answerToSave = textAnswer
      } else {
        answerToSave = selectedAnswer
      }

      const newAnswers = {
        ...answers,
        [currentQuestionIndex]: answerToSave
      }
      setAnswers(newAnswers)

      setCurrentQuestionIndex((prev) => prev + 1)

      // Load next question's answer
      const nextAnswer = answers[currentQuestionIndex + 1]
      if (nextAnswer) {
        if (typeof nextAnswer === 'object' && nextAnswer.answer !== undefined) {
          setSelectedAnswer(nextAnswer.answer)
          setConfidenceLevel(nextAnswer.confidenceLevel)
        } else {
          setSelectedAnswer(nextAnswer)
          setConfidenceLevel(nextAnswer)
        }
      } else {
        setSelectedAnswer(null)
        setConfidenceLevel(null)
      }
      setTextAnswer(answers[currentQuestionIndex + 1] || '')

      try {
        await quizService.updateQuizProgress(quizId, {
          currentQuestionIndex: currentQuestionIndex + 1,
          answers: newAnswers,
          remainingTime: remainingTime,
          progress: progress
        })
      } catch (error) {
        console.error('Error updating quiz:', error)
      }
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    let answerToSave = null

    // Save answer based on quiz type
    const quizType = quiz.quizType || QUIZ_TYPES.MULTIPLE_CHOICE
    if (quizType === QUIZ_TYPES.CONFIDENCE_BASED) {
      answerToSave = confidenceLevel
    } else if (quizType === QUIZ_TYPES.TEXT_INPUT) {
      answerToSave = textAnswer
    } else {
      answerToSave = selectedAnswer
    }

    const finalAnswers = {
      ...answers,
      [currentQuestionIndex]: answerToSave
    }

    // Only calculate score for multiple choice quizzes
    let finalScore = null
    if (quizType === QUIZ_TYPES.MULTIPLE_CHOICE) {
      finalScore = calculateScore(finalAnswers)
      setScore(finalScore)
    }

    // Update local answers state immediately so it shows in the summary
    setAnswers(finalAnswers)

    try {
      const updatedQuizData = await quizService.submitQuiz(quizId, {
        answers: finalAnswers,
        score: finalScore,
        remainingTime: remainingTime,
        progress: progress
      })

      if (updatedQuizData) {
        setQuiz(updatedQuizData)
      }
      queryClient.invalidateQueries({ queryKey: ['studentQuizzes'] })
      setIsSubmitted(true)
    } catch (error) {
      console.error('Error submitting quiz:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateScore = (answersToCheck) => {
    let correctCount = 0
    quiz.questions.forEach((question, index) => {
      const answer = answersToCheck[index]
      if (answer) {
        if (typeof answer === 'object' && answer.answer !== undefined) {
          // Legacy confidence based question (with answer)
          if (answer.answer === question.correctAnswer) {
            correctCount++
          }
        } else if (typeof answer === 'string') {
          // Multiple choice, text input, or new confidence based (only confidence level)
          if (answer === question.correctAnswer) {
            correctCount++
          }
        }
      }
    })
    const scorePercentage = (correctCount / quiz.questions.length) * 100
    return Math.round(scorePercentage)
  }

  const isAnswerValid = () => {
    const quizType = quiz.quizType || QUIZ_TYPES.MULTIPLE_CHOICE

    switch (quizType) {
      case QUIZ_TYPES.MULTIPLE_CHOICE:
      case QUIZ_TYPES.AGREE_BASED:
        return selectedAnswer !== null

      case QUIZ_TYPES.CONFIDENCE_BASED:
        return confidenceLevel !== null

      case QUIZ_TYPES.TEXT_INPUT:
        return textAnswer.trim() !== ''

      default:
        return selectedAnswer !== null
    }
  }

  const renderQuestion = () => {
    const quizType = quiz.quizType || QUIZ_TYPES.MULTIPLE_CHOICE

    switch (quizType) {
      case QUIZ_TYPES.MULTIPLE_CHOICE:
        return (
          <MultipleChoiceQuestion
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            setSelectedAnswer={setSelectedAnswer}
          />
        )

      case QUIZ_TYPES.CONFIDENCE_BASED:
        return (
          <ConfidenceBasedQuestion
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            setSelectedAnswer={setSelectedAnswer}
            confidenceLevel={confidenceLevel}
            setConfidenceLevel={setConfidenceLevel}
          />
        )

      case QUIZ_TYPES.AGREE_BASED:
        return (
          <AgreeBasedQuestion
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            setSelectedAnswer={setSelectedAnswer}
          />
        )

      case QUIZ_TYPES.TEXT_INPUT:
        return (
          <TextInputQuestion
            question={currentQuestion}
            textAnswer={textAnswer}
            setTextAnswer={setTextAnswer}
          />
        )

      default:
        return (
          <MultipleChoiceQuestion
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            setSelectedAnswer={setSelectedAnswer}
          />
        )
    }
  }

  return (
    <div className='student-quiz'>
      {/* <div className='student-quiz__header'>
        <Timer
          duration={quiz.quizDuration}
          onTimeUp={handleSubmit}
          initialTime={remainingTime}
          onTimeUpdate={setRemainingTime}
          isActive={hasStarted}
        />
      </div> */}

      <div className='student-quiz__progress'>
        <div className='student-quiz__progress-text'>
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
          <div className='student-quiz__progress-percent'>
            Progress: {Math.round(progress)}%
          </div>
        </div>
        <div className='student-quiz__progress-bar'>
          <div
            className='student-quiz__progress-fill'
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className='student-quiz__question'>
        <h2>
          {currentQuestionIndex + 1}. {currentQuestion.question}
        </h2>
        {renderQuestion()}
      </div>
      <div className='student-quiz__navigation'>
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className='student-quiz__nav-button student-quiz__nav-button--previous '
        >
          Previous
        </button>
        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            disabled={!isAnswerValid() || isSubmitting}
            className='student-quiz__nav-button student-quiz__nav-button--submit'
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!isAnswerValid()}
            className='student-quiz__nav-button student-quiz__nav-button--next'
          >
            Next
          </button>
        )}
      </div>
    </div>
  )
}

export default StudentQuiz
