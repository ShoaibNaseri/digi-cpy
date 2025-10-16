import React, { useState } from 'react'
import './FeedbackModal.css'
import { FaTimes, FaStar } from 'react-icons/fa'
import { useAuth } from '@/context/AuthContext'
import { saveFeedback } from '@/services/feedbackService'
import { toast } from 'sonner'
import { IoCheckmarkDoneCircle } from 'react-icons/io5'
const FeedbackModal = ({
  isOpen,
  onClose,
  resourceTitle = '',
  resourceId = ''
}) => {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [shareContactInfo, setShareContactInfo] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const { currentUser } = useAuth()
  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('feedback-modal-backdrop')) {
      handleClose()
    }
  }

  // Handle modal close
  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      // Reset form after a delay to avoid visual glitch
      setTimeout(() => {
        setRating(0)
        setHoveredRating(0)
        setComment('')
        setShareContactInfo(false)
        setSubmitted(false)
      }, 300)
    }
  }

  // Handle star click
  const handleStarClick = (starValue) => {
    setRating(starValue)
  }

  // Handle star hover
  const handleStarHover = (starValue) => {
    setHoveredRating(starValue)
  }

  // Handle star hover leave
  const handleStarLeave = () => {
    setHoveredRating(0)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!rating) {
      toast.error('Please select a rating')
      return
    }

    if (!currentUser) {
      toast.error('You must be logged in to submit feedback')
      return
    }

    setIsSubmitting(true)

    try {
      const feedbackData = {
        rating,
        comment: comment.trim(),
        resourceTitle,
        resourceId,
        userUid: currentUser.uid,

        userName: shareContactInfo
          ? currentUser.firstName + ' ' + currentUser.lastName || 'Anonymous'
          : 'Anonymous',
        userEmail: shareContactInfo ? currentUser.email : null,
        userRole: currentUser.role || 'user',
        shareContactInfo,
        isConsentGiven: shareContactInfo,
        timestamp: new Date(),
        submittedAt: new Date().toISOString()
      }

      await saveFeedback(feedbackData)
      setSubmitted(true)
      toast.success('Feedback submitted successfully')
      //   Auto close after 2 seconds
      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className='feedback-modal-backdrop' onClick={handleBackdropClick}>
      <div className='feedback-modal-container'>
        {/* Modal Header */}
        <div className='feedback-modal-header'>
          <h2 className='feedback-modal-title'>
            {submitted ? 'Thank You!' : 'Provide Feedback'}
          </h2>
          <button
            className='feedback-modal-close-btn'
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <FaTimes />
          </button>
        </div>

        {/* Modal Content */}
        <div className='feedback-modal-content'>
          {submitted ? (
            <div className='feedback-success'>
              <div className='feedback-success-icon'>
                <IoCheckmarkDoneCircle />
              </div>
              <p className='feedback-success-message'>
                Your feedback has been submitted successfully!
              </p>
              <p className='feedback-success-submessage'>
                Thank you for helping us improve.
              </p>
            </div>
          ) : (
            <>
              {resourceTitle && (
                <div className='feedback-resource-info'>
                  <p className='feedback-resource-title'>
                    Feedback for: <strong>{resourceTitle}</strong>
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className='feedback-form'>
                {/* Star Rating */}
                <div className='feedback-rating-section'>
                  <label className='feedback-label'>
                    How would you rate this resource?
                  </label>
                  <div className='feedback-stars'>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type='button'
                        className={`feedback-star ${
                          star <= (hoveredRating || rating) ? 'active' : ''
                        }`}
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => handleStarHover(star)}
                        onMouseLeave={handleStarLeave}
                        disabled={isSubmitting}
                      >
                        <FaStar />
                      </button>
                    ))}
                    {rating > 0 && (
                      <div className='feedback-rating-text'>
                        {rating === 1 && 'Poor'}
                        {rating === 2 && 'Fair'}
                        {rating === 3 && 'Good'}
                        {rating === 4 && 'Very Good'}
                        {rating === 5 && 'Excellent'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Comment Section */}
                <div className='feedback-comment-section'>
                  <label className='feedback-label' htmlFor='feedback-comment'>
                    Additional Comments (Optional)
                  </label>
                  <textarea
                    id='feedback-comment'
                    className='feedback-textarea'
                    placeholder='Share your thoughts about this resource...'
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={isSubmitting}
                    rows={4}
                    maxLength={500}
                  />
                  <div className='feedback-char-count'>
                    {comment.length}/500 characters
                  </div>
                </div>

                {/* Contact Info Sharing */}
                <div className='feedback-contact-section'>
                  <label className='feedback-checkbox-container'>
                    <input
                      type='checkbox'
                      className='feedback-checkbox'
                      checked={shareContactInfo}
                      onChange={(e) => setShareContactInfo(e.target.checked)}
                      disabled={isSubmitting}
                    />
                    <span className='feedback-checkbox-checkmark'></span>
                    <span className='feedback-checkbox-text'>
                      Share my email and name with this feedback for follow-up
                      purposes
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className='feedback-submit-section'>
                  <button
                    type='submit'
                    className='feedback-submit-btn'
                    disabled={!rating || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className='feedback-spinner'></div>
                        Submitting...
                      </>
                    ) : (
                      'Submit Feedback'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default FeedbackModal
