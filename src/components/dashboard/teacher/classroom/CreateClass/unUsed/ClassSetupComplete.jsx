import React, { useState, useEffect } from 'react'
import './ClassSetupComplete.css'
import { icons } from '../../../../../../config/teacherDash/images.js'

const ClassSetupComplete = ({ onClose, classId }) => {
  const [emailResults, setEmailResults] = useState({
    sent: 0,
    failed: 0,
    total: 0
  })

  // Make sure we're properly destructuring the icons
  // The error likely comes from undefined icon components
  const {
    IoCheckmarkCircle,
    IoAlertCircle,
    IoMailOutline // Add mail icon if exists
  } = icons

  // Use useEffect to fetch email results when component mounts
  useEffect(() => {
    try {
      const savedResults = sessionStorage.getItem('emailNotificationResults')
      if (savedResults) {
        setEmailResults(JSON.parse(savedResults))
      }
    } catch (e) {
      console.error('Error reading email results', e)
    }
  }, [])

  // Modify close handler to clean up email results
  const handleClose = () => {
    try {
      sessionStorage.removeItem('emailNotificationResults')
    } catch (e) {
      console.error('Error clearing email results', e)
    }
    onClose()
  }

  // Function to render email notification results
  const renderEmailResults = () => {
    if (!emailResults || emailResults.total === 0) {
      return null // Don't show anything if no emails were sent
    }

    return (
      <div className='class-setup-info-box email-notification-results'>
        <div className='class-setup-info-icon'>
          {/* Use mail icon if exists */}
          {IoMailOutline ? (
            <IoMailOutline className='class-setup-note-icon' size={20} />
          ) : (
            // Fallback to a simple mail icon
            <svg
              className='class-setup-note-icon'
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          )}
        </div>
        <div className='class-setup-info-content'>
          <p className='class-setup-info-text'>
            <strong>Email Notifications</strong>
          </p>
          {emailResults.sent === emailResults.total ? (
            <p className='class-setup-info-subtext'>
              We’ve emailed all students in your class a link to create their
              Digipalz profiles. Please ask them to check their inboxes and
              follow the instructions.
            </p>
          ) : emailResults.sent > 0 ? (
            <p className='class-setup-info-subtext'>
              Sent {emailResults.sent} of {emailResults.total} notifications.{' '}
              {emailResults.failed} failed.
            </p>
          ) : (
            <p className='class-setup-info-subtext'>
              Unable to send notifications to students. Please try again later.
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className='class-setup-complete-overlay'>
      <div className='class-setup-complete-container'>
        <div className='class-setup-success-icon'>
          {/* Check if the icon exists before rendering it */}
          {IoCheckmarkCircle ? (
            <IoCheckmarkCircle className='class-setup-icon' size={24} />
          ) : (
            // Fallback to a simple checkmark
            <svg
              className='class-setup-icon'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z'
                fill='currentColor'
              />
            </svg>
          )}
        </div>

        <h2 className='class-setup-title'>Class Setup Complete!</h2>
        <p className='class-setup-description'>
          Your classroom is ready for students to join
        </p>

        {/* Add email notification results */}
        {renderEmailResults()}

        <div className='class-setup-actions-centered'>
          <button className='class-setup-close-button' onClick={handleClose}>
            Complete
          </button>
        </div>
      </div>
    </div>
  )
}

export default ClassSetupComplete
