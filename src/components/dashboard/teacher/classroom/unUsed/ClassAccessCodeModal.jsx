import React from 'react'
import './ClassAccessCodeModal.css'
import { icons } from '../../../../../config/teacherDash/images.js'

const ClassAccessCodeModal = ({ accessCode, onClose, onGenerateNew }) => {
  // Handle copying the code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard
      .writeText(accessCode)
      .then(() => {
        console.log('Code copied to clipboard:', accessCode)
      })
      .catch((err) => {
        console.error('Failed to copy code:', err)
      })
  }

  // Handle downloading instructions
  const handleDownloadInstructions = () => {
    // Create content for the instructions
    const instructionsContent = `
    Class Access Code Instructions
    
    1. Visit www.digipalz.io
    2. Click on "Join Class"
    3. Enter the access code: ${accessCode}
    4. Create their profile
    `

    // Create a blob with the content
    const blob = new Blob([instructionsContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)

    // Create a temporary link and trigger download
    const a = document.createElement('a')
    a.href = url
    a.download = 'class-access-instructions.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className='class-access-code-modal-overlay'>
      <div className='class-access-code-modal-container'>
        <div className='class-access-code-modal-header'>
          <div className='class-access-code-modal-key-icon'>
            <img src={icons.keyIcon} alt='keyIcon' />
          </div>
          <h2 className='class-access-code-modal-title'>Class Access Code</h2>
          <p className='class-access-code-modal-subtitle'>
            Share this code with your students to join the class
          </p>
        </div>

        <div className='class-access-code-modal-code-display'>
          <div className='class-access-code-modal-code'>{accessCode}</div>

          <div className='class-access-code-modal-actions'>
            <button
              className='class-access-code-modal-copy-btn'
              onClick={handleCopyCode}
            >
              <span className='class-access-code-modal-copy-icon'>
                <svg
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M8 4V16C8 16.5523 8.44772 17 9 17H19C19.5523 17 20 16.5523 20 16V7.41421C20 7.149 19.8946 6.89464 19.7071 6.70711L16.2929 3.29289C16.1054 3.10536 15.851 3 15.5858 3H9C8.44772 3 8 3.44772 8 4Z'
                    stroke='currentColor'
                    strokeWidth='2'
                  />
                  <path d='M16 3V7H20' stroke='currentColor' strokeWidth='2' />
                  <path
                    d='M4 8V20C4 20.5523 4.44772 21 5 21H15C15.5523 21 16 20.5523 16 20V17'
                    stroke='currentColor'
                    strokeWidth='2'
                  />
                </svg>
              </span>
              Copy Code
            </button>

            <button
              className='class-access-code-modal-generate-btn'
              onClick={onGenerateNew}
            >
              <span className='class-access-code-modal-generate-icon'>
                <svg
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M4 12H20'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                  />
                  <path
                    d='M12 4V20'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                  />
                </svg>
              </span>
              Generate New
            </button>
          </div>
        </div>

        <div className='class-access-code-modal-instructions'>
          <div className='class-access-code-modal-instructions-header'>
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
            <h3 className='class-access-code-modal-instructions-title'>
              Instructions for Students:
            </h3>
          </div>

          <ol className='class-access-code-modal-steps'>
            <li className='class-access-code-modal-step'>
              Visit{' '}
              <span className='class-access-code-modal-highlight'>
                www.digipalz.io
              </span>
            </li>
            <li className='class-access-code-modal-step'>
              Click on "Join Class"
            </li>
            <li className='class-access-code-modal-step'>
              Enter the access code above
            </li>
            <li className='class-access-code-modal-step'>
              Create their profile
            </li>
          </ol>
        </div>

        <div className='class-access-code-modal-footer'>
          <button
            className='class-access-code-modal-download-btn'
            onClick={handleDownloadInstructions}
          >
            <span className='class-access-code-modal-download-icon'>
              <svg
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M4 17V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V17'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
                <path
                  d='M12 3V16'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
                <path
                  d='M8 12L12 16L16 12'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </span>
            Download Instructions
          </button>

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
        </div>
      </div>
    </div>
  )
}

export default ClassAccessCodeModal
