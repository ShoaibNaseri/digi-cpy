import './trustedAdults.css'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  fetchTrustedAdults,
  saveTrustedAdults
} from '@/services/trustedAdultsService'

const TrustedAdults = ({ onComplete }) => {
  const { currentUser } = useAuth()
  const [trustedAdults, setTrustedAdults] = useState(['', '', ''])
  const [errors, setErrors] = useState([false, false, false])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)

  // Fetch existing trusted adults data if available
  useEffect(() => {
    const loadTrustedAdults = async () => {
      if (!currentUser?.uid) return

      try {
        const adults = await fetchTrustedAdults(currentUser.uid)
        setTrustedAdults(adults)
      } catch (error) {
        setFeedbackMessage('Failed to load existing data')
        setShowFeedback(true)
      }
    }

    loadTrustedAdults()
  }, [currentUser])

  // Handle input change
  const handleChange = (index, value) => {
    const newTrustedAdults = [...trustedAdults]
    newTrustedAdults[index] = value
    setTrustedAdults(newTrustedAdults)

    // Clear error for this field if user is typing
    if (errors[index]) {
      const newErrors = [...errors]
      newErrors[index] = false
      setErrors(newErrors)
    }
  }

  // Validate inputs
  const validateInputs = () => {
    const newErrors = trustedAdults.map((adult) => !adult.trim())
    setErrors(newErrors)
    return !newErrors.some((error) => error)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate inputs
    const isValid = validateInputs()
    if (!isValid) {
      setFeedbackMessage('Please fill in all fields')
      setShowFeedback(true)
      setIsSubmitting(false)
      return
    }

    // Save using service
    try {
      await saveTrustedAdults(currentUser.uid, trustedAdults)
      setFeedbackMessage('Trusted adults saved successfully!')
      setShowFeedback(true)

      // Wait a bit for the user to see the success message
      setTimeout(() => {
        onComplete()
      }, 1500)
    } catch (error) {
      setFeedbackMessage('Failed to save. Please try again.')
      setShowFeedback(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='trusted-adults-container'>
      <div className='trusted-adults-content'>
        <form onSubmit={handleSubmit}>
          <div className='trusted-adults-header'>
            CAN YOU NAME 3 TRUSTED ADULTS WHO YOU CAN GO TO FOR HELP?
          </div>

          {/* Feedback Message */}
          {showFeedback && (
            <div
              className={`feedback-message ${
                feedbackMessage.includes('success') ? 'success' : 'error'
              }`}
            >
              {feedbackMessage}
            </div>
          )}

          {trustedAdults.map((adult, index) => (
            <div key={index} className='futuristic-input-outer'>
              <div
                className={`futuristic-input-wrapper ${
                  errors[index] ? 'error' : ''
                }`}
              >
                <input
                  type='text'
                  className='futuristic-input'
                  placeholder='|'
                  value={adult}
                  onChange={(e) => handleChange(index, e.target.value)}
                />
                {errors[index] && <div className='input-error-indicator'></div>}
              </div>
            </div>
          ))}

          <button
            className='trusted-adults-button'
            type='submit'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'SAVING...' : 'SAVE'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default TrustedAdults
