import './StudentQuizCard.css'
import { FaEye } from 'react-icons/fa'

const StudentQuizCard = ({
  title,
  status,
  score,
  questions,
  duration,
  remainingTime,
  progress,
  onClick,
  passingScore,
  isExpired,
  headerColor
}) => {
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} minutes`
  }

  // Get header background color - use provided color or fallback to default
  const getHeaderColor = () => {
    // If headerColor is provided, use it
    if (headerColor) {
      return headerColor
    }

    // Fallback to dynamic color based on quiz title if no color provided
    const titleLower = title.toLowerCase()
    if (titleLower.includes('cyberbullying')) return '#7B34BF'
    if (
      titleLower.includes('ip address') ||
      titleLower.includes('digital footprint')
    )
      return '#0454AC'
    if (titleLower.includes('password') || titleLower.includes('device safety'))
      return '#EF0067'
    if (
      titleLower.includes('personal') ||
      titleLower.includes('private information')
    )
      return '#00C6FF'
    return '#7B34BF' // Default purple
  }

  // Get status badge styling
  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return {
          text: 'Completed',
          className: 'student-quizzes__status-badge completed'
        }
      case 'in-progress':
        return {
          text: 'In Progress',
          className: 'student-quizzes__status-badge in-progress'
        }
      case 'draft':
        return {
          text: 'Ready to Start',
          className: 'student-quizzes__status-badge ready'
        }
      case 'coming-up':
        return {
          text: 'Coming Up',
          className: 'student-quizzes__status-badge locked'
        }
      case 'expired':
        return {
          text: 'Past Due',
          className: 'student-quizzes__status-badge expired'
        }
      default:
        return {
          text: 'Ready to Start',
          className: 'student-quizzes__status-badge ready'
        }
    }
  }

  // Get action buttons based on status
  const getActionButtons = () => {
    switch (status) {
      case 'completed':
        return (
          <button
            className='student-quizzes__view-results-button'
            onClick={onClick}
          >
            <FaEye className='student-quizzes__button-icon' />
            View Results
          </button>
        )
      case 'in-progress':
        return (
          <button className='student-quizzes__edit-button' onClick={onClick}>
            Continue Quiz
          </button>
        )
      case 'draft':
        return (
          <button className='student-quizzes__edit-button' onClick={onClick}>
            Start Quiz
          </button>
        )
      case 'coming-up':
        return (
          <button className='student-quizzes__edit-button' disabled>
            Coming Up
          </button>
        )
      case 'expired':
        return (
          <button className='student-quizzes__edit-button' disabled>
            Past Due
          </button>
        )
      default:
        return (
          <button className='student-quizzes__edit-button' onClick={onClick}>
            Start Quiz
          </button>
        )
    }
  }

  // Get card content based on status
  const getCardContent = () => {
    switch (status) {
      case 'completed':
        return (
          <>
            <div className='student-quizzes__metric-row'>
              <span className='student-quizzes__metric-label'>
                Total Score:
              </span>
              <span className='student-quizzes__metric-value'>{score}%</span>
            </div>
            <div className='student-quizzes__metric-row'>
              <span className='student-quizzes__metric-label'>
                Passing Score:
              </span>
              <span className='student-quizzes__metric-value'>
                {passingScore}%
              </span>
            </div>
            <div className='student-quizzes__metric-row'>
              <span className='student-quizzes__metric-label'>
                Total Questions:
              </span>
              <span className='student-quizzes__metric-value'>{questions}</span>
            </div>
          </>
        )
      case 'in-progress':
        return (
          <>
            <div className='student-quizzes__metric-row'>
              <span className='student-quizzes__metric-label'>
                Total Questions:
              </span>
              <span className='student-quizzes__metric-value'>{questions}</span>
            </div>
            <div className='student-quizzes__metric-row'>
              <span className='student-quizzes__metric-label'>
                Remaining Time:
              </span>
              <span className='student-quizzes__metric-value'>
                {formatTime(
                  remainingTime !== undefined ? remainingTime : duration * 60
                )}
              </span>
            </div>
            <div className='student-quizzes__metric-row'>
              <span className='student-quizzes__metric-label'>Progress:</span>
              <div className='student-quizzes__progress-bar'>
                <div
                  className='student-quizzes__progress-fill'
                  style={{ width: `${progress || 0}%` }}
                ></div>
              </div>
            </div>
          </>
        )
      case 'published':
        return (
          <>
            <div className='student-quizzes__metric-row'>
              <span className='student-quizzes__metric-label'>
                Total Questions:
              </span>
              <span className='student-quizzes__metric-value'>{questions}</span>
            </div>
            <div className='student-quizzes__metric-row'>
              <span className='student-quizzes__metric-label'>
                Passing Score:
              </span>
              <span className='student-quizzes__metric-value'>{score}%</span>
            </div>
            <div className='student-quizzes__metric-row'>
              <span className='student-quizzes__metric-label'>Duration:</span>
              <span className='student-quizzes__metric-value'>
                {duration} minutes
              </span>
            </div>
          </>
        )
      default:
        return null
    }
  }

  const statusBadge = getStatusBadge()
  const dynamicHeaderColor = getHeaderColor()

  return (
    <div
      className={`student-quizzes__card ${
        isExpired ? 'student-quizzes__card--expired' : ''
      }`}
    >
      {/* Header Section */}
      <div
        className='student-quizzes__card-header'
        style={{ backgroundColor: dynamicHeaderColor }}
      >
        <div className='student-quizzes__card-title-section'>
          <h2 className='student-quizzes__card-title'>{title}</h2>
          <p className='student-quizzes__card-meta'>
            {questions} questions • {duration} minutes
          </p>
        </div>
      </div>

      {/* Card Info Section */}
      <div className='student-quizzes__card-info'>
        <div className='student-quizzes__metrics-section'>
          <div className='student-quizzes__metric-row'>
            <span className='student-quizzes__metric-label'>Status:</span>
            <div className={statusBadge.className}>{statusBadge.text}</div>
          </div>
          {getCardContent()}
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className='student-quizzes__action-buttons'>
        {getActionButtons()}
      </div>
    </div>
  )
}

export default StudentQuizCard
