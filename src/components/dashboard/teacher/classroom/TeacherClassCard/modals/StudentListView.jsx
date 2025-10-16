import React, { useState, useEffect, useRef } from 'react'
import './StudentListView.css'
import { updateStudents } from '@/services/teacherService'

import { FaSearch, FaEdit, FaTimes } from 'react-icons/fa'

const StudentListModal = ({
  onClose,
  onSave,
  students,
  classTitle,
  classId
}) => {
  // Create a copy of students array to work with
  const [studentList, setStudentList] = useState([])
  const [hasChanges, setHasChanges] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [isClosing, setIsClosing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [editableStudentIndex, setEditableStudentIndex] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  // Use refs to maintain focus
  const inputRefs = useRef({})

  useEffect(() => {
    // Deep copy of students array to avoid direct mutation
    setStudentList(students.map((student) => ({ ...student })))

    // Add class to body to prevent background scrolling
    document.body.classList.add('modal-open')

    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [students])

  // Validation functions
  const validateName = (name) => {
    return /^[A-Za-z\s]+$/.test(name)
  }

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validateId = (id) => {
    // ID validation removed to allow special characters
    // Just checking that it's not empty when validating
    return id.trim() !== ''
  }

  // Handle student information change with focus preservation
  const handleStudentChange = (index, field, value) => {
    // Store current selection state before update
    const input = inputRefs.current[`${index}-${field}`]
    let selectionStart = null
    let selectionEnd = null

    if (input) {
      selectionStart = input.selectionStart
      selectionEnd = input.selectionEnd
    }

    // Update the student data
    const updatedStudents = [...studentList]
    updatedStudents[index] = {
      ...updatedStudents[index],
      [field]: value
    }

    setStudentList(updatedStudents)
    setHasChanges(true)

    // Validation logic
    let isValid = true

    if (field === 'firstName' && value.trim() !== '') {
      isValid = validateName(value)
    } else if (field === 'lastName' && value.trim() !== '') {
      isValid = validateName(value)
    } else if (field === 'email' && value.trim() !== '') {
      isValid = validateEmail(value)
    } else if (field === 'studentId' && value.trim() !== '') {
      isValid = validateId(value)
    }

    // Update validation errors
    setValidationErrors((prev) => ({
      ...prev,
      [`${index}-${field}`]: !isValid
    }))

    // Restore focus after state update
    if (field === 'studentId') {
      setTimeout(() => {
        const inputElement = inputRefs.current[`${index}-${field}`]
        if (inputElement && selectionStart !== null && selectionEnd !== null) {
          inputElement.focus()
          inputElement.setSelectionRange(selectionStart, selectionEnd)
        }
      }, 0)
    }
  }

  // Handle close with animation
  const handleCloseWithAnimation = () => {
    setIsClosing(true)
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      onClose()
    }, 200) // Match the animation duration in CSS
  }

  // Save changes and return to main dashboard
  const handleSave = async () => {
    // Validate all fields before saving
    let newValidationErrors = {}
    let hasError = false

    studentList.forEach((student, index) => {
      if (student.firstName && !validateName(student.firstName)) {
        newValidationErrors[`${index}-firstName`] = true
        hasError = true
      }

      if (student.lastName && !validateName(student.lastName)) {
        newValidationErrors[`${index}-lastName`] = true
        hasError = true
      }

      if (student.email && !validateEmail(student.email)) {
        newValidationErrors[`${index}-email`] = true
        hasError = true
      }

      if (student.studentId && !validateId(student.studentId)) {
        newValidationErrors[`${index}-studentId`] = true
        hasError = true
      }
    })

    if (hasError) {
      setValidationErrors(newValidationErrors)
      return
    }

    setIsSaving(true)

    try {
      // Save the updated student data to the database
      await updateStudents(classId, studentList)

      // If all validations pass, save the data
      setIsClosing(true)
      setTimeout(() => {
        onSave(studentList)
      }, 200) // Match the animation duration in CSS
    } catch (error) {
      console.error('Error updating students:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Get error class for an input field
  const getInputErrorClass = (index, field) => {
    return validationErrors[`${index}-${field}`]
      ? 'student-list-modal-input-error'
      : ''
  }

  // Handle click outside modal content to close
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseWithAnimation()
    }
  }

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode)
    // Reset editable student when toggling edit mode off
    if (isEditMode) {
      setEditableStudentIndex(null)
    }
  }

  // Toggle student edit mode
  const toggleStudentEdit = (index) => {
    if (editableStudentIndex === index) {
      setEditableStudentIndex(null)
    } else {
      setEditableStudentIndex(index)
    }
  }

  // Export student list to CSV and download
  const exportToCSV = () => {
    // Define the CSV headers
    const headers = ['First Name', 'Last Name', 'Student ID', 'Email']

    // Map student data to CSV format
    const csvData = studentList.map((student) => [
      student.firstName || '',
      student.lastName || '',
      student.studentId || '',
      student.email || ''
    ])

    // Add headers to the beginning
    csvData.unshift(headers)

    // Convert to CSV string
    const csvContent = csvData
      .map((row) =>
        row
          .map((cell) =>
            // Handle commas, quotes, and special characters in data
            typeof cell === 'string' && cell.includes(',')
              ? `"${cell.replace(/"/g, '""')}"`
              : cell
          )
          .join(',')
      )
      .join('\n')

    // Create a Blob containing the CSV data
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

    // Create a download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    // Set up the link
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `student-list-${classTitle.replace(/\s+/g, '-').toLowerCase()}.csv`
    )
    link.style.visibility = 'hidden'

    // Append the link to the document
    document.body.appendChild(link)

    // Trigger the download
    link.click()

    // Clean up
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Filter students based on search term
  const filteredStudents = studentList.filter((student) => {
    if (!searchTerm) return true

    const searchTermLower = searchTerm.toLowerCase()
    return (
      student.firstName?.toLowerCase().includes(searchTermLower) ||
      student.lastName?.toLowerCase().includes(searchTermLower) ||
      student.studentId?.toLowerCase().includes(searchTermLower) ||
      student.email?.toLowerCase().includes(searchTermLower)
    )
  })

  return (
    <div
      className={`student-list-modal-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleOverlayClick}
    >
      <div
        className={`student-list-modal-container ${isClosing ? 'closing' : ''}`}
      >
        <div className='student-list-modal-content'>
          {/* Header Section */}
          <div className='student-list-modal-header'>
            <div className='student-list-modal-header-left'>
              <h1 className='student-list-modal-title'>
                Student List - {classTitle}
              </h1>
              <p className='student-list-modal-description'>
                View and edit students in this class
              </p>
            </div>
            <div className='student-list-modal-header-buttons'></div>
            <div className='student-list-modal-header-actions'>
              {!isEditMode ? (
                <>
                  <div className='student-list-modal-search-container'>
                  <FaSearch 
                      size={24}
                      color="#6B7280"
                      className='student-list-modal-search-icon'
                    />
                    <input
                      type='text'
                      placeholder='Search students...'
                      className='student-list-modal-search-input'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button
                    className={`student-list-modal-top-button student-list-modal-edit-button ${
                      isEditMode ? 'active' : ''
                    }`}
                    onClick={toggleEditMode}
                  >
                    <span className='student-list-modal-button-icon'>
                      <FaEdit />
                    </span>
                    Edit
                  </button>
                </>
              ) : (
                <button
                  className='student-list-modal-action-button student-list-modal-save-button'
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
              <button
                className='student-list-modal-close-button'
                onClick={handleCloseWithAnimation}
                disabled={isSaving}
              >
                <span className=''>
                  <FaTimes />
                </span>
              </button>
            </div>
            {/* Action Buttons */}
          </div>

          {/* Student List Section */}
          <div className='student-list-modal-section'>
            {/* <div className='student-list-modal-field-requirements'>
              <span className='student-list-modal-field-requirement'>
                Name: alphabetic characters only
              </span>
              <span className='student-list-modal-field-requirement'>
                ID: all characters allowed including special characters
              </span>
              <span className='student-list-modal-field-requirement'>
                Email: must be a valid email format
              </span>
            </div> */}

            <div className='student-list-modal-table-container'>
              {filteredStudents.length > 0 ? (
                <table className='student-list-modal-table student-list-modal-editable-table'>
                  <thead>
                    <tr>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Student ID</th>
                      <th>Email</th>
                      {isEditMode && (
                        <th className='student-list-modal-actions-column'>
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, index) => {
                      const originalIndex = studentList.findIndex(
                        (s) =>
                          s.studentId === student.studentId ||
                          (s.firstName === student.firstName &&
                            s.lastName === student.lastName &&
                            s.email === student.email)
                      )

                      const isEditable = editableStudentIndex === originalIndex

                      return (
                        <tr key={student.studentId || originalIndex}>
                          <td>
                            {isEditable ? (
                              <div className='student-list-modal-input-container'>
                                <input
                                  type='text'
                                  value={student.firstName || ''}
                                  onChange={(e) =>
                                    handleStudentChange(
                                      originalIndex,
                                      'firstName',
                                      e.target.value
                                    )
                                  }
                                  placeholder='Student Name'
                                  className={`student-list-modal-input ${getInputErrorClass(
                                    originalIndex,
                                    'firstName'
                                  )}`}
                                  ref={(el) =>
                                    (inputRefs.current[
                                      `${originalIndex}-firstName`
                                    ] = el)
                                  }
                                />
                                {validationErrors[
                                  `${originalIndex}-firstName`
                                ] && (
                                  <div className='student-list-modal-error-message'>
                                    Name must contain only alphabetic characters
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className='student-list-modal-data-field'>
                                {student.firstName || ''}
                              </span>
                            )}
                          </td>
                          <td>
                            {isEditable ? (
                              <div className='student-list-modal-input-container'>
                                <input
                                  type='text'
                                  value={student.lastName || ''}
                                  onChange={(e) =>
                                    handleStudentChange(
                                      originalIndex,
                                      'lastName',
                                      e.target.value
                                    )
                                  }
                                  placeholder='Student Last Name'
                                  className={`student-list-modal-input ${getInputErrorClass(
                                    originalIndex,
                                    'lastName'
                                  )}`}
                                  ref={(el) =>
                                    (inputRefs.current[
                                      `${originalIndex}-lastName`
                                    ] = el)
                                  }
                                />
                                {validationErrors[
                                  `${originalIndex}-lastName`
                                ] && (
                                  <div className='student-list-modal-error-message'>
                                    Name must contain only alphabetic characters
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className='student-list-modal-data-field'>
                                {student.lastName || ''}
                              </span>
                            )}
                          </td>
                          <td>
                            {isEditable ? (
                              <div className='student-list-modal-input-container'>
                                <input
                                  type='text'
                                  value={student.studentId || ''}
                                  onChange={(e) =>
                                    handleStudentChange(
                                      originalIndex,
                                      'studentId',
                                      e.target.value
                                    )
                                  }
                                  placeholder='Student ID'
                                  className={`student-list-modal-input ${getInputErrorClass(
                                    originalIndex,
                                    'studentId'
                                  )}`}
                                  ref={(el) =>
                                    (inputRefs.current[
                                      `${originalIndex}-studentId`
                                    ] = el)
                                  }
                                />
                                {validationErrors[
                                  `${originalIndex}-studentId`
                                ] && (
                                  <div className='student-list-modal-error-message'>
                                    ID cannot be empty
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className='student-list-modal-data-field'>
                                {student.studentId || ''}
                              </span>
                            )}
                          </td>
                          <td>
                            {isEditable ? (
                              <div className='student-list-modal-input-container'>
                                <input
                                  type='email'
                                  value={student.email || ''}
                                  onChange={(e) =>
                                    handleStudentChange(
                                      originalIndex,
                                      'email',
                                      e.target.value
                                    )
                                  }
                                  placeholder='Email'
                                  className={`student-list-modal-input ${getInputErrorClass(
                                    originalIndex,
                                    'email'
                                  )}`}
                                  ref={(el) =>
                                    (inputRefs.current[
                                      `${originalIndex}-email`
                                    ] = el)
                                  }
                                />
                                {validationErrors[`${originalIndex}-email`] && (
                                  <div className='student-list-modal-error-message'>
                                    Please enter a valid email address
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className='student-list-modal-data-field'>
                                {student.email || ''}
                              </span>
                            )}
                          </td>
                          {isEditMode && (
                            <td className='student-list-modal-action-cell'>
                              <button
                                className={`student-list-modal-row-edit-button ${
                                  isEditable ? 'active' : ''
                                }`}
                                onClick={() => toggleStudentEdit(originalIndex)}
                              >
                                <FaEdit />
                              </button>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <div className='student-list-modal-empty-message'>
                  <p>No students in this class.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentListModal
