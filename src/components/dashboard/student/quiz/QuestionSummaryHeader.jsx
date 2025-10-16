import { format } from 'date-fns'
import {
  FaTrophy,
  FaCheckCircle,
  FaClock,
  FaCalendarAlt,
  FaRedo
} from 'react-icons/fa'
import './QuestionSummaryHeader.css'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import { quizService } from '@/services/quizService'

const QuestionSummaryHeader = ({ quiz }) => {
  const { currentUser } = useAuth()
  const [canUserRetryQuiz, setCanUserRetryQuiz] = useState(false)
  const isMultipleChoice = quiz.quizType === 'multiple-choice'

  useEffect(() => {
    const fetchQuiz = async () => {
      if (quiz) {
        const canRetry = await quizService.getQuizRetryStatus(
          quiz.originalQuizId
        )
        setCanUserRetryQuiz(canRetry)
      }
    }
    fetchQuiz()
  }, [quiz])

  const handleRetry = async () => {
    try {
      const newQuizId = await quizService.createQuizRetry(quiz, currentUser.uid)
      window.location.href = `/dashboard/student/quiz/${newQuizId}`
    } catch (error) {
      console.error('Error creating new quiz attempt:', error)
    }
  }

  return (
    <div className='quiz-summary__header'>
      <div className='quiz-summary__header-top'>
        <h2 className='quiz-summary__title'>Quiz Results:</h2>
        {canUserRetryQuiz && (
          <button className='quiz-summary__retry-button' onClick={handleRetry}>
            <FaRedo /> Retry Quiz
          </button>
        )}
      </div>
      <div className='quiz-summary__stats'>
        {isMultipleChoice &&
          quiz.score !== null &&
          quiz.score !== undefined && (
            <div className='quiz-summary__stat'>
              <div className='quiz-summary__stat-icon'>
                <FaTrophy />
              </div>
              <div className='quiz-summary__stat-content'>
                <span className='quiz-summary__stat-label'>Score</span>
                <span className='quiz-summary__stat-value'>{quiz.score}%</span>
              </div>
            </div>
          )}
        {isMultipleChoice && quiz.quizPassingScore && (
          <div className='quiz-summary__stat'>
            <div className='quiz-summary__stat-icon'>
              <FaCheckCircle />
            </div>
            <div className='quiz-summary__stat-content'>
              <span className='quiz-summary__stat-label'>Passing Score</span>
              <span className='quiz-summary__stat-value'>
                {quiz.quizPassingScore}%
              </span>
            </div>
          </div>
        )}
        <div className='quiz-summary__stat'>
          <div className='quiz-summary__stat-icon'>
            <FaClock />
          </div>
          <div className='quiz-summary__stat-content'>
            <span className='quiz-summary__stat-label'>Time Remaining</span>
            <span className='quiz-summary__stat-value'>
              {quizService.formatTime(quiz.remainingTime)}
            </span>
          </div>
        </div>
        <div className='quiz-summary__stat'>
          <div className='quiz-summary__stat-icon'>
            <FaCalendarAlt />
          </div>
          <div className='quiz-summary__stat-content'>
            <span className='quiz-summary__stat-label'>Completed At</span>
            <span className='quiz-summary__stat-value'>
              {quiz.completedAt
                ? format(quiz.completedAt.toDate(), 'MMM dd, yyyy HH:mm')
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionSummaryHeader
