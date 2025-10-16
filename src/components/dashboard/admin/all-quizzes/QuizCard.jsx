import React, { useState } from 'react'
import { FaRegClock, FaQuestion, FaRedo, FaEdit, FaTrash } from 'react-icons/fa'
import { TiWarning } from 'react-icons/ti'
import './QuizCard.css'
import ConfirmationModal from '@/components/common/ConfirmationModal'

const QuizCard = ({
  title,
  duration,
  questions,
  status,
  onEdit,
  canUserRetryQuiz = false,
  onToggleRetry,
  onDelete,
  id
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleDelete = () => {
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    onDelete(id)
    setShowDeleteModal(false)
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
  }

  return (
    <>
      <div className='all-quiz-card'>
        <div className='all-quiz-card-header'>
          <h2>{title}</h2>
          <span className={`status-badge ${status}`}>
            {status.toUpperCase()}
          </span>
        </div>

        <div className='all-quiz-card-stats'>
          <div className='all-quiz-card-stat-item'>
            <FaRegClock size={20} />
            <span>{duration} minutes</span>
          </div>
          <div className='all-quiz-card-stat-item'>
            <FaQuestion size={20} />
            <span>{questions} questions</span>
          </div>
        </div>

        <div className='all-quiz-card-actions'>
          <button className='all-quiz-card-edit-button' onClick={onEdit}>
            <FaEdit /> Edit
          </button>

          <button
            className='all-quiz-card-delete-button'
            onClick={handleDelete}
          >
            <FaTrash /> Delete
          </button>

          <div className='all-quiz-card-retry-toggle'>
            <div className='all-quiz-card-retry-label'>
              <FaRedo /> Allow Retry
            </div>
            <label className='all-quiz-card-switch'>
              <input
                type='checkbox'
                checked={canUserRetryQuiz}
                onChange={onToggleRetry}
              />
              <span className='all-quiz-card-slider'></span>
            </label>
          </div>
        </div>
      </div>

      <ConfirmationModal
        type='delete'
        open={showDeleteModal}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title='Delete Quiz'
        description='Are you sure you want to delete this quiz? This will also delete all student attempts for this quiz. This action cannot be undone.'
        icon={<TiWarning />}
      />
    </>
  )
}

export default QuizCard
