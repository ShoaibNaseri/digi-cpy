import React, { useState } from 'react'
import './AccessCodeManagement.css'
import ClassAccessCodeModal from './ClassAccessCodeModal.jsx'
import { icons } from '../../../../../config/teacherDash/images.js'

const TeacherAccessCode = ({ onClose }) => {
  // State for the newly generated code
  const [generatedCode, setGeneratedCode] = useState({
    code: 'ABC-123-XYZ',
    expiresIn: '23:45:12'
  })

  // State to control modal visibility
  const [showModal, setShowModal] = useState(false)

  // Active access codes
  const [activeAccessCodes, setActiveAccessCodes] = useState([
    {
      code: 'XYZ-789-ABC',
      grade: 'Grade 4',
      generated: '2 hours ago',
      expiresIn: '21:45:30'
    },
    {
      code: 'DEF-456-GHI',
      grade: 'Grade 5',
      generated: '5 hours ago',
      expiresIn: '18:15:45'
    }
  ])

  // Expired access codes
  const [expiredAccessCodes, setExpiredAccessCodes] = useState([
    {
      code: 'JKL-321-MNO',
      grade: 'Grade 4',
      date: 'March 10, 2025'
    },
    {
      code: 'PQR-654-STU',
      grade: 'Grade 5',
      date: 'March 8, 2025'
    }
  ])

  // Selected class for new code
  const [selectedClass, setSelectedClass] = useState('Grade 4')

  // Handle class selection for generating new code
  const handleClassChange = (e) => {
    setSelectedClass(e.target.value)
  }

  // Handle generating a new access code
  const handleGenerateNewCode = () => {
    // In a real app, this would call an API to generate a code
    // For now, we'll just simulate it
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'

    // Generate a random code in format XXX-XXXX-XXX
    const part1 = [...Array(4)]
      .map(() => characters[Math.floor(Math.random() * characters.length)])
      .join('')
    const part2 = [...Array(4)]
      .map(() => numbers[Math.floor(Math.random() * numbers.length)])
      .join('')
    const part3 = [...Array(3)]
      .map(() => characters[Math.floor(Math.random() * characters.length)])
      .join('')

    const newCode = `${part1}-${part2}-${part3}`

    // Set expiration time to 24 hours from now
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const hours = String(expiresAt.getHours()).padStart(2, '0')
    const minutes = String(expiresAt.getMinutes()).padStart(2, '0')
    const seconds = String(expiresAt.getSeconds()).padStart(2, '0')
    const expiresInFormatted = `${hours}:${minutes}:${seconds}`

    // Update state with new code
    setGeneratedCode({
      code: newCode,
      expiresIn: expiresInFormatted
    })

    // Show the modal with the new code
    setShowModal(true)
  }

  // Handle copying a code to clipboard
  const handleCopyCode = (code) => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        // Could show a toast notification here
        console.log('Code copied to clipboard:', code)
      })
      .catch((err) => {
        console.error('Failed to copy code:', err)
      })
  }

  // Handle deleting an access code
  const handleDeleteCode = (codeToDelete) => {
    // Filter out the code to delete
    const updatedCodes = activeAccessCodes.filter(
      (codeItem) => codeItem.code !== codeToDelete
    )
    setActiveAccessCodes(updatedCodes)
  }

  return (
    <div className='teacher-access-code-management-container'>
      <div className='teacher-access-code-management-header'>
        <h1 className='teacher-access-code-management-title'>
          Access Code Management
        </h1>
        <p className='teacher-access-code-management-subtitle'>
          Generate and manage access codes for your classes
        </p>

        <button
          className='teacher-access-code-generate-button'
          onClick={handleGenerateNewCode}
        >
          <span className='teacher-access-code-generate-icon'>+</span>
          Generate New Code
        </button>
      </div>

      {/* Generate Access Code Section */}
      <div className='teacher-access-code-section'>
        <h2 className='teacher-access-code-section-title'>
          Generate Access Code
        </h2>
        <p className='teacher-access-code-expiry-note'>
          The access code will expire in 24 hours.
        </p>

        <div className='teacher-access-code-form'>
          <div className='teacher-access-code-form-group'>
            <label className='teacher-access-code-form-label'>
              Select Class
            </label>
            <div className='teacher-access-code-select-wrapper'>
              <select
                className='teacher-access-code-select'
                value={selectedClass}
                onChange={handleClassChange}
              >
                <option value='Grade 4'>Grade 4</option>
                <option value='Grade 5'>Grade 5</option>
                <option value='Grade 6'>Grade 6</option>
              </select>
              <span className='teacher-access-code-select-arrow'>▼</span>
            </div>
          </div>

          <div className='teacher-access-code-display'>
            <div className='teacher-access-code-value'>
              {generatedCode.code}
            </div>
            <div className='teacher-access-code-expiry'>
              Expires in: {generatedCode.expiresIn}
            </div>
          </div>
        </div>
      </div>

      {/* Active Access Codes Section */}
      <div className='teacher-access-code-section'>
        <h2 className='teacher-access-code-section-title'>
          Active Access Codes
        </h2>

        <div className='teacher-access-code-list'>
          {activeAccessCodes.map((codeItem, index) => (
            <div key={index} className='teacher-access-code-list-item'>
              <div className='teacher-access-code-list-info'>
                <div className='teacher-access-code-list-code'>
                  {codeItem.code}
                </div>
                <div className='teacher-access-code-list-details'>
                  {codeItem.grade} - Generated {codeItem.generated}
                </div>
              </div>
              <div className='teacher-access-code-list-actions'>
                <div className='teacher-access-code-list-expiry'>
                  Expires in {codeItem.expiresIn}
                </div>
                <button
                  className='teacher-access-code-copy-btn'
                  onClick={() => handleCopyCode(codeItem.code)}
                  aria-label='Copy code'
                >
                  <img src={icons.copyIcon} alt='copyIcon' />
                </button>
                <button
                  className='teacher-access-code-delete-btn'
                  onClick={() => handleDeleteCode(codeItem.code)}
                  aria-label='Delete code'
                >
                  <img src={icons.deleteIcon} alt='deleteIcon' />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expired Access Codes Section */}
      <div className='teacher-access-code-section'>
        <h2 className='teacher-access-code-section-title'>
          Expired Access Codes
        </h2>

        <div className='teacher-access-code-list'>
          {expiredAccessCodes.map((codeItem, index) => (
            <div
              key={index}
              className='teacher-access-code-list-item teacher-access-code-list-item-expired'
            >
              <div className='teacher-access-code-list-info'>
                <div className='teacher-access-code-list-code'>
                  {codeItem.code}
                </div>
                <div className='teacher-access-code-list-details'>
                  {codeItem.grade} - {codeItem.date}
                </div>
              </div>
              <div className='teacher-access-code-list-actions'>
                <div className='teacher-access-code-expired-label'>Expired</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Class Access Code Modal */}
      {showModal && (
        <ClassAccessCodeModal
          accessCode={generatedCode.code}
          onClose={() => setShowModal(false)}
          onGenerateNew={() => {
            handleGenerateNewCode()
            // No need to call setShowModal(true) here since handleGenerateNewCode already does it
          }}
        />
      )}
    </div>
  )
}

export default TeacherAccessCode
