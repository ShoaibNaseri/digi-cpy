import React from 'react'
import './ClassAccessCodeModal.css'
import { icons } from '../../../../config/teacherDash/images.js'
import { FaDownload, FaLock, FaTimes } from 'react-icons/fa'
import {
  calculateTimeRemaining,
  formatTimeRemaining
} from '@/services/accessCodeService'

//icon
const IoIosKey = icons.IoIosKey
const IoMdCopyIcon = icons.IoMdCopyIcon
const IoIosSync = icons.IoIosSync

const ClassAccessCodeModal = ({
  accessCode,
  className,
  grade,
  expiresAt,
  onClose,
  onGenerateNew
}) => {
  // Handle copying the code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard
      .writeText(accessCode)
      .then(() => {})
      .catch((err) => {
        console.error('Failed to copy code:', err)
      })
  }

  // Handle downloading instructions
  const handleDownloadInstructions = () => {
    // Create content for the instructions
    const instructionsContent = `
Class Access Code Instructions

Class: ${className} - Grade ${grade}
Access Code: ${accessCode || 'YOUR-ACCESS-CODE-HERE'}
Expires: ${expiresAt ? new Date(expiresAt).toLocaleString() : 'Unknown'}

Instructions for Students:
1. Visit www.digipalz.io
2. Click on "Login"
3. On the login page, click on "Join Class"
4. Enter the access code
5. Create profile

Note: This access code will expire in 24 hours from generation.
    `

    // Create a blob with the content
    const blob = new Blob([instructionsContent.trim()], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)

    // Create a temporary link and trigger download
    const a = document.createElement('a')
    a.href = url
    a.download = `access-instructions-${className.replace(/\s+/g, '-')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Calculate time remaining for display
  const timeRemaining = expiresAt ? calculateTimeRemaining(expiresAt) : null
  const timeRemainingFormatted = timeRemaining
    ? formatTimeRemaining(timeRemaining)
    : 'Unknown'

  return (
    <div className='class-access-code-modal-overlay'>
      <div className='class-access-code-modal-container'>
        <div className='class-access-code-modal-header'>
          <button
            className='class-access-code-modal-close-button'
            onClick={onClose}
          >
            <FaTimes size={20} />
          </button>

          <div className='class-access-code-modal-key-icon'>
            <FaLock size={20} />
          </div>
          <h2 className='class-access-code-modal-title'>Class Access Code</h2>
          <p className='class-access-code-modal-subtitle'>
            {/* Share this code with your students to join {className} - Grade{' '}
            {grade} */}
            Ask your students to login using this code
          </p>
          {expiresAt && (
            <p className='class-access-code-modal-expiry'>
              Expires in: <strong>{timeRemainingFormatted}</strong>
            </p>
          )}
        </div>

        <div className='class-access-code-modal-code-display'>
          <div className='class-access-code-modal-code'>{accessCode}</div>

          <div className='class-access-code-modal-actions'>
            {accessCode && (
              <button
                className='class-access-code-modal-copy-btn'
                onClick={handleCopyCode}
              >
                <span className='class-access-code-modal-copy-icon'>
                  <IoMdCopyIcon className='' size={20} />
                </span>
                Copy Code
              </button>
            )}

            <button
              className='class-access-code-modal-generate-btn'
              onClick={onGenerateNew}
            >
              <span className='class-access-code-modal-generate-icon'>
                <IoIosSync size={18} />
              </span>
              Generate New
            </button>
          </div>
        </div>

        <div className='class-access-code-modal-instructions-section'>
          <div className='class-access-code-modal-instructions-header'>
            <h3 className='class-access-code-modal-instructions-title'>
              Instructions for Students:
            </h3>
            <span className='class-access-code-modal-info-icon'>
              <svg
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <circle
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='2'
                />
                <path
                  d='M12 7V12'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
                <circle cx='12' cy='16' r='1' fill='currentColor' />
              </svg>
            </span>
          </div>

          <ol className='class-access-code-modal-steps'>
            <li className='class-access-code-modal-step'>
              Visit{' '}
              <span className='class-access-code-modal-highlight'>
                www.digipalz.io/login
              </span>
            </li>
            <li className='class-access-code-modal-step'>
              On the login page, click on{' '}
              <span className='class-access-code-modal-highlight'>
                "Join Class with Access Code"
              </span>
            </li>
            <li className='class-access-code-modal-step'>
              Enter the access code: <strong>{accessCode}</strong>
            </li>
            <li className='class-access-code-modal-step'>
              Create your profile
            </li>
          </ol>
        </div>

        <div className='class-access-code-modal-footer'>
          <button
            className='class-access-code-modal-close-btn'
            onClick={onClose}
          >
            <span className='class-access-code-modal-close-icon'>
              <svg
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M6 6L18 18'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
                <path
                  d='M18 6L6 18'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
              </svg>
            </span>
            Close
          </button>
          <button
            className='class-access-code-modal-download-btn'
            onClick={handleDownloadInstructions}
            data-keyboard-enhanced='true'
          >
            <FaDownload size={16} color='white' />
            Download Instructions
          </button>
        </div>
      </div>
    </div>
  )
}

export default ClassAccessCodeModal
