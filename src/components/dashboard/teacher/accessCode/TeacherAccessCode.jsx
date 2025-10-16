import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTeacherData } from '../classroom/Hooks/useTeacherData'
import CustomDropdown from '../profile/CustomDropdown'
import {
  createAccessCode,
  subscribeToAccessCodes,
  deleteAccessCode,
  updateAccessCodeStatus,
  ACCESS_CODE_STATUS,
  calculateTimeRemaining,
  formatTimeRemaining
} from '@/services/accessCodeService'
import './TeacherAccessCode.css'
import ClassAccessCodeModal from './ClassAccessCodeModal'
import { FaBarcode, FaCopy, FaInfo, FaClock, FaCheck } from 'react-icons/fa'
import { FaTrash } from 'react-icons/fa6'
import { formatDistanceToNow } from 'date-fns'
import PagePreloader from '@/components/common/preloaders/PagePreloader'
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal'

const TeacherAccessCode = ({ onClose }) => {
  const { currentUser } = useAuth()
  const { classes, loading: classesLoading } = useTeacherData(currentUser)

  // State management
  const [accessCodes, setAccessCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedClassId, setSelectedClassId] = useState('')
  const [generatedCode, setGeneratedCode] = useState(null)
  const [error, setError] = useState(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [codeToDelete, setCodeToDelete] = useState(null)
  const [copiedCodeId, setCopiedCodeId] = useState(null)

  // Get class options from real Firebase data
  const getClassOptions = () => {
    if (!classes || Object.keys(classes).length === 0) return []

    return Object.entries(classes).map(([classId, classData]) => ({
      classId,
      value: classId,
      label: `${classData.className} - Grade ${classData.grade}`,
      className: classData.className,
      grade: classData.grade
    }))
  }

  // Set default selected class
  useEffect(() => {
    const classOptions = getClassOptions()
    if (classOptions.length > 0 && !selectedClassId) {
      setSelectedClassId(classOptions[0].classId)
    }
  }, [classes, selectedClassId])

  // Subscribe to access codes in real-time
  useEffect(() => {
    if (!currentUser?.uid || !currentUser?.schoolId) return

    setLoading(true)
    const unsubscribe = subscribeToAccessCodes(
      currentUser.uid,
      currentUser.schoolId,
      (codes) => {
        setAccessCodes(codes)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [currentUser])

  // Timer for real-time countdown updates
  useEffect(() => {
    const timer = setInterval(() => {
      setAccessCodes((prevCodes) =>
        prevCodes.map((code) => {
          if (code.status === ACCESS_CODE_STATUS.ACTIVE) {
            const timeRemaining = calculateTimeRemaining(code.expiresAt)
            if (timeRemaining.expired) {
              // Update status to expired
              updateAccessCodeStatus(code.id, ACCESS_CODE_STATUS.EXPIRED)
              return { ...code, status: ACCESS_CODE_STATUS.EXPIRED }
            }
          }
          return code
        })
      )
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Handle class selection for generating new code
  const handleClassChange = (value) => {
    setSelectedClassId(value)
  }

  // Check if class already has an active access code
  const hasActiveCodeForClass = (classId) => {
    return activeAccessCodes.some((code) => code.classId === classId)
  }

  // Get the active access code for a specific class
  const getActiveCodeForClass = (classId) => {
    return activeAccessCodes.find((code) => code.classId === classId)
  }

  // Handle generating a new access code
  const handleGenerateNewCode = async () => {
    try {
      setError(null)

      if (!selectedClassId) {
        setError('Please select a class')
        return
      }

      const selectedClass = classes[selectedClassId]
      if (!selectedClass) {
        setError('Selected class not found')
        return
      }

      // Check if class already has an active access code
      if (hasActiveCodeForClass(selectedClassId)) {
        setError(
          'This class already has an active access code. Please delete the existing code or wait for it to expire before generating a new one.'
        )
        return
      }

      const accessCodeData = {
        classId: selectedClassId,
        className: selectedClass.className,
        grade: selectedClass.grade,
        schoolId: currentUser.schoolId
      }

      const newCode = await createAccessCode(accessCodeData)
      setGeneratedCode(newCode)
      setShowModal(true)
    } catch (error) {
      console.error('Error generating access code:', error)
      setError('Failed to generate access code. Please try again.')
    }
  }

  // Handle copying a code to clipboard
  const handleCopyCode = async (code, codeId) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCodeId(codeId)

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedCodeId(null)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  // Handle delete button click - show confirmation
  const handleDeleteClick = (code) => {
    setCodeToDelete(code)
    setShowDeleteConfirmation(true)
  }

  // Handle deleting an access code after confirmation
  const handleDeleteCode = async () => {
    if (!codeToDelete) return

    const codeToDeleteId = codeToDelete.id
    setCodeToDelete(null)

    try {
      await deleteAccessCode(codeToDeleteId)
    } catch (error) {
      console.error('Error deleting access code:', error)
      setError('Failed to delete access code. Please try again.')
    }
  }

  // Handle canceling delete
  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false)
    setCodeToDelete(null)
  }

  // Handle marking access code as invalid
  const handleMarkInvalid = async (accessCodeId) => {
    try {
      await updateAccessCodeStatus(accessCodeId, ACCESS_CODE_STATUS.INVALID)
    } catch (error) {
      console.error('Error marking access code as invalid:', error)
      setError('Failed to update access code status. Please try again.')
    }
  }

  // Access code filtering utilities - standard approach
  const accessCodeFilters = {
    byStatus: (codes, status) => codes.filter((code) => code.status === status),
    byMultipleStatuses: (codes, statuses) =>
      codes.filter((code) => statuses.includes(code.status)),
    active: (codes) =>
      codes.filter((code) => code.status === ACCESS_CODE_STATUS.ACTIVE),
    expired: (codes) =>
      codes.filter(
        (code) =>
          code.status === ACCESS_CODE_STATUS.EXPIRED ||
          code.status === ACCESS_CODE_STATUS.INVALID
      )
  }

  // Filter access codes using standard utility functions
  const activeAccessCodes = accessCodeFilters.active(accessCodes)
  const expiredAccessCodes = accessCodeFilters.expired(accessCodes)

  // Format access code for display
  const formatAccessCodeItem = (code) => {
    const timeRemaining = calculateTimeRemaining(code.expiresAt)
    const createdDate = code.createdAt?.toDate?.() || new Date()

    return {
      ...code,
      displayName: `${code.className} - Grade ${code.grade}`,
      timeAgo: formatDistanceToNow(createdDate, { addSuffix: true }),
      timeRemaining: formatTimeRemaining(timeRemaining),
      isExpired: timeRemaining.expired
    }
  }

  // Get class options for dropdown
  const classOptions = getClassOptions()

  // Show loading state
  if (classesLoading || loading) {
    return (
      <div className='teacher-access-code-management-container'>
        <PagePreloader color='black' textData='Loading access codes' />
      </div>
    )
  }

  // Show message if no classes exist
  if (classOptions.length === 0) {
    return (
      <div className='teacher-access-code-management-container'>
        <div className='teacher-access-code-management-header'>
          <h1 className='teacher-access-code-management-title'>
            Access Code Management
          </h1>
          <p className='teacher-access-code-management-subtitle'>
            You need to create a class first before generating access codes
          </p>
        </div>
        <div className='teacher-access-code-no-classes'>
          <p>
            No classes found. Please create a class first to generate access
            codes.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='teacher-access-code-management-container'>
      <h2 className='teacher-access-code-management-title'>
        Access Code Management
      </h2>
      <p className='teacher-access-code-management-subtitle'>
        Onboard your students using an access code.
      </p>
      {/* Error Display */}
      {error && (
        <div className='teacher-access-code-error'>
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Generate Class Access Code Section */}
      <div className='teacher-access-code-section'>
        <h2 className='teacher-access-code-section-title'>
          Generate Class Access Code
        </h2>
        <p className='teacher-access-code-expiry-note'>
          The access code will expire in 24 hours.
        </p>

        <div className='teacher-access-code-form-container'>
          <div className='teacher-access-code-form'>
            <div className='teacher-access-code-form-group'>
              <label className='teacher-access-code-form-label'>
                Select Class
              </label>
              <div className='teacher-access-code-dropdown-wrapper'>
                <CustomDropdown
                  value={selectedClassId}
                  onChange={handleClassChange}
                  options={classOptions}
                  placeholder='Select a class'
                />
              </div>
            </div>

            <button
              className='teacher-access-code-generate-button'
              onClick={handleGenerateNewCode}
              disabled={
                !selectedClassId || hasActiveCodeForClass(selectedClassId)
              }
            >
              {hasActiveCodeForClass(selectedClassId)
                ? 'Class Has Active Code'
                : '+ Generate New Code'}
            </button>
          </div>

          {/* {generatedCode && (
            <div className='teacher-access-code-display'>
              <div className='teacher-access-code-value'>
                {generatedCode.code}
              </div>
              <div className='teacher-access-code-expiry'>
                Expires in:{' '}
                {formatTimeRemaining(
                  calculateTimeRemaining(generatedCode.expiresAt)
                )}
              </div>
            </div>
          )} */}

          {/* Show active code info for selected class */}
          {selectedClassId && hasActiveCodeForClass(selectedClassId) && (
            <div className='teacher-access-code-active-info'>
              <p>
                <strong>Note:</strong> This class already has an active access
                code. Please delete the existing code or wait for it to expire
                before generating a new one.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Active Access Code Section */}
      <div className='teacher-access-code-section'>
        <h2 className='teacher-access-code-section-title'>
          Active Access Code
        </h2>

        <div className='teacher-access-code-list'>
          {activeAccessCodes.length === 0 ? (
            <div className='teacher-access-code-empty'>
              No active access codes. Generate a new code to get started.
            </div>
          ) : (
            activeAccessCodes.map((code) => {
              const formattedCode = formatAccessCodeItem(code)
              return (
                <div key={code.id} className='teacher-access-code-list-item'>
                  <div className='teacher-access-code-list-info'>
                    <div className='teacher-access-code-list-code'>
                      {code.code}
                    </div>
                    <div className='teacher-access-code-list-details'>
                      <strong>
                        {code.className}- Grade {code.grade}{' '}
                      </strong>{' '}
                      - Active Access Code
                    </div>
                  </div>
                  <div className='teacher-access-code-list-actions'>
                    <div className='teacher-access-code-list-expiry'>
                      <FaClock size={14} />
                      Expires in: {formattedCode.timeRemaining}
                    </div>
                    <button
                      className={`teacher-access-code-copy-btn ${
                        copiedCodeId === code.id ? 'copied' : ''
                      }`}
                      onClick={() => handleCopyCode(code.code, code.id)}
                      aria-label='Copy code'
                    >
                      {copiedCodeId === code.id ? (
                        <>
                          <FaCheck size={16} />
                          Copied
                        </>
                      ) : (
                        <>
                          <FaCopy size={16} />
                          Copy Code
                        </>
                      )}
                    </button>
                    <button
                      className='teacher-access-code-delete-btn'
                      onClick={() => handleDeleteClick(code)}
                      aria-label='Delete code'
                    >
                      <FaTrash size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Expired Access Code Section */}
      <div className='teacher-access-code-section'>
        <h2 className='teacher-access-code-section-title'>
          Expired Access Code
        </h2>

        <div className='teacher-access-code-list'>
          {expiredAccessCodes.length === 0 ? (
            <div className='teacher-access-code-empty'>
              No expired or invalid access codes.
            </div>
          ) : (
            expiredAccessCodes.map((code) => {
              const formattedCode = formatAccessCodeItem(code)
              const expiredDate =
                code.expiresAt?.toLocaleDateString?.() || 'Unknown'

              return (
                <div
                  key={code.id}
                  className='teacher-access-code-list-item teacher-access-code-list-item-expired'
                >
                  <div className='teacher-access-code-list-info'>
                    <div className='teacher-access-code-list-code'>
                      {code.code}
                    </div>
                    <div className='teacher-access-code-list-details'>
                      {code.className} - <strong>Grade {code.grade}</strong> -{' '}
                      {expiredDate}
                    </div>
                  </div>
                  <div className='teacher-access-code-list-actions'>
                    <div className='teacher-access-code-expired-label'>
                      {code.status === ACCESS_CODE_STATUS.INVALID
                        ? 'Invalid'
                        : 'Expired'}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Class Access Code Modal */}
      {showModal && (
        <ClassAccessCodeModal
          accessCode={generatedCode?.code}
          className={generatedCode?.className}
          grade={generatedCode?.grade}
          expiresAt={generatedCode?.expiresAt}
          onClose={() => setShowModal(false)}
          onGenerateNew={handleGenerateNewCode}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={handleCancelDelete}
        onConfirm={handleDeleteCode}
        title='Confirm Delete'
        message={`Are you sure you want to delete the access code "${codeToDelete?.code}"?`}
        warningText='This action cannot be undone.'
        confirmButtonText='Yes'
        cancelButtonText='Cancel'
      />
    </div>
  )
}

export default TeacherAccessCode
