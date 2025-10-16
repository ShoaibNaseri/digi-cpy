import React, { useState } from 'react'
import './AddStudentModal.css'
import { FaTimes, FaPlus } from 'react-icons/fa'
import {
  checkSchoolHasEnoughSeats,
  updateSchoolSeatUsage
} from '@/services/seatsManageService'

const AddStudentModal = ({
  onClose,
  onAddStudent,
  existingStudents = [],
  currentUser,
  classId
}) => {
  // State for dynamic student fields
  const [studentFields, setStudentFields] = useState([
    { id: 1, firstName: '', lastName: '', studentId: '', email: '' }
  ])

  // State for form validation
  const [errors, setErrors] = useState({})

  // Additional states for seat management
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [seatError, setSeatError] = useState(null)

  // Handle input change for any field
  const handleInputChange = (e, fieldId, fieldName) => {
    let value = e.target.value

    // For name field, allow only alphabetic characters and spaces
    if (fieldName === 'firstName' || fieldName === 'lastName') {
      value = value.replace(/[^A-Za-z\s]/g, '')
    }

    const updatedFields = studentFields.map((field) => {
      if (field.id === fieldId) {
        return { ...field, [fieldName]: value }
      }
      return field
    })

    setStudentFields(updatedFields)

    // Clear error for this field if exists
    if (errors[`${fieldName}_${fieldId}`]) {
      const updatedErrors = { ...errors }
      delete updatedErrors[`${fieldName}_${fieldId}`]
      setErrors(updatedErrors)
    }

    // Clear seat error if exists
    if (seatError) {
      setSeatError(null)
    }
  }

  // Add another student field
  const handleAddAnotherField = () => {
    const newId =
      studentFields.length > 0
        ? Math.max(...studentFields.map((field) => field.id)) + 1
        : 1

    // Append a new empty student row below existing ones
    setStudentFields([
      ...studentFields,
      { id: newId, firstName: '', lastName: '', studentId: '', email: '' }
    ])

    // Reset validation and seat error
    setErrors({})
    setSeatError(null)
  }

  // Remove a student field
  const handleRemoveField = (fieldId) => {
    // Don't allow removing the last field
    if (studentFields.length <= 1) return

    const updatedFields = studentFields.filter((field) => field.id !== fieldId)
    setStudentFields(updatedFields)

    // Remove any errors associated with this field
    const updatedErrors = { ...errors }
    ;['firstName', 'lastName', 'studentId', 'email'].forEach((fieldName) => {
      if (updatedErrors[`${fieldName}_${fieldId}`]) {
        delete updatedErrors[`${fieldName}_${fieldId}`]
      }
    })
    setErrors(updatedErrors)

    // Clear seat error if exists
    if (seatError) {
      setSeatError(null)
    }
  }

  // Check if email already exists in the existing students
  const isEmailDuplicate = (email) => {
    // First check in existing students (if any)
    if (existingStudents && existingStudents.length > 0) {
      const isDuplicateInExisting = existingStudents.some(
        (student) =>
          student.email && student.email.toLowerCase() === email.toLowerCase()
      )

      if (isDuplicateInExisting) return true
    }

    // Then check in the current form for duplicate emails (in case user adds multiple students at once)
    const emailCount = studentFields.filter(
      (field) => field.email.toLowerCase() === email.toLowerCase()
    ).length

    return emailCount > 1
  }

  // Validate the form
  const validateForm = () => {
    const newErrors = {}
    let isValid = true

    studentFields.forEach((field) => {
      // Validate name (must be alphabetic)
      if (!field.firstName.trim()) {
        newErrors[`firstName_${field.id}`] = 'Student first name is required'
        isValid = false
      } else if (!/^[A-Za-z\s]+$/.test(field.firstName)) {
        newErrors[`firstName_${field.id}`] =
          'Student first name must contain only alphabetic characters'
        isValid = false
      }

      if (!field.lastName.trim()) {
        newErrors[`lastName_${field.id}`] = 'Student last name is required'
        isValid = false
      } else if (!/^[A-Za-z\s]+$/.test(field.lastName)) {
        newErrors[`lastName_${field.id}`] =
          'Student last name must contain only alphabetic characters'
        isValid = false
      }

      // Validate student ID
      if (!field.studentId.trim()) {
        newErrors[`studentId_${field.id}`] = 'Student ID is required'
        isValid = false
      }

      // Validate email (required)
      if (!field.email.trim()) {
        newErrors[`email_${field.id}`] = 'Email is required'
        isValid = false
      } else if (!isValidEmail(field.email)) {
        newErrors[`email_${field.id}`] = 'Please enter a valid email address'
        isValid = false
      } else if (isEmailDuplicate(field.email)) {
        // Add duplicate email check
        newErrors[`email_${field.id}`] =
          'This email already exists in the class'
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  // Basic email validation
  const isValidEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(email)
  }

  // Check if the first student has all required fields filled
  const isFirstStudentComplete = () => {
    if (studentFields.length === 0) return false
    
    const firstStudent = studentFields[0]
    return (
      firstStudent.firstName.trim() !== '' &&
      firstStudent.lastName.trim() !== '' &&
      firstStudent.studentId.trim() !== '' &&
      firstStudent.email.trim() !== '' &&
      isValidEmail(firstStudent.email) &&
      !isEmailDuplicate(firstStudent.email)
    )
  }

  // Handle form submission with seat availability check
  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSeatError(null)

    try {
      // Create student data objects from the fields
      const studentsData = studentFields.map((field) => ({
        firstName: field.firstName.trim(),
        lastName: field.lastName.trim(),
        id: field.studentId.trim(),
        email: field.email.trim()
      }))

      // Only check seat availability if we're adding to an existing class (classId exists)
      if (classId && currentUser?.schoolId) {
        // Check if school has enough seats
        const studentsCount = studentsData.length
        const seatCheckResult = await checkSchoolHasEnoughSeats(
          currentUser.schoolId,
          'unified',
          studentsCount
        )

        if (!seatCheckResult.hasEnoughSeats) {
          setSeatError(
            `Not enough seats available. Available: ${seatCheckResult.availableSeats}, Used: ${seatCheckResult.usedSeats}, Required: ${studentsCount}`
          )
          setIsSubmitting(false)
          return
        }

        // Update school's seat usage count
        await updateSchoolSeatUsage(
          currentUser.schoolId,
          'unified',
          studentsCount
        )
      }

      // Call the original onAddStudent function
      onAddStudent(studentsData)
    } catch (error) {
      console.error('Error adding students:', error)
      setSeatError('Failed to add students. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='add-student-modal__overlay'>
      <div className='add-student-modal__container'>
   
        <div className='add-student-modal__header'>
        <button
            className='add-student-modal__close-btn'
            onClick={onClose}
            aria-label='Close'
          >
            <FaTimes />
          </button>
          <h2 className='add-student-modal__title'>Add New Student</h2>
          
        </div>
        

        <div className='add-student-modal__content'>
          {studentFields.map((field) => (
            <div className='add-student-modal__student-entry' key={field.id}>
              {/* Remove button positioned over the content card */}
              {studentFields.length > 1 && (
                <button
                  className='add-student-modal__remove-field-btn'
                  onClick={() => handleRemoveField(field.id)}
                  aria-label='Remove student'
                >
                  ×
                </button>
              )}
              
              <div className='add-student-modal__entry-header'>
                <h3 className='add-student-modal__entry-title'></h3>
              </div>

              {/* Student Name Field - Only alphabetic characters */}
              <div className='add-student-modal__form-group'>
                <label
                  className='add-student-modal__form-label'
                  htmlFor={`student-first-name-${field.id}`}
                >
                  First Name
                  <span className='add-student-modal__required'>*</span>
                </label>
                <input
                  id={`student-first-name-${field.id}`}
                  type='text'
                  className={`add-student-modal__form-input ${
                    errors[`firstName_${field.id}`]
                      ? 'add-student-modal__form-input--error'
                      : ''
                  }`}
                  placeholder="Enter student's first name (alphabetic characters only)"
                  value={field.firstName}
                  onChange={(e) => handleInputChange(e, field.id, 'firstName')}
                />
                {errors[`firstName_${field.id}`] && (
                  <div className='add-student-modal__error-message'>
                    {errors[`firstName_${field.id}`]}
                  </div>
                )}
              </div>

              <div className='add-student-modal__form-group'>
                <label
                  className='add-student-modal__form-label'
                  htmlFor={`student-last-name-${field.id}`}
                >
                  Last Name
                  <span className='add-student-modal__required'>*</span>
                </label>
                <input
                  id={`student-last-name-${field.id}`}
                  type='text'
                  className={`add-student-modal__form-input ${
                    errors[`lastName_${field.id}`]
                      ? 'add-student-modal__form-input--error'
                      : ''
                  }`}
                  placeholder="Enter student's last name (alphabetic characters only)"
                  value={field.lastName}
                  onChange={(e) => handleInputChange(e, field.id, 'lastName')}
                />
                {errors[`lastName_${field.id}`] && (
                  <div className='add-student-modal__error-message'>
                    {errors[`lastName_${field.id}`]}
                  </div>
                )}
              </div>

              <div className='add-student-modal__form-group'>
                <label
                  className='add-student-modal__form-label'
                  htmlFor={`student-email-${field.id}`}
                >
                  Email Address
                  <span className='add-student-modal__required'>*</span>
                </label>
                <input
                  id={`student-email-${field.id}`}
                  type='email'
                  className={`add-student-modal__form-input ${
                    errors[`email_${field.id}`]
                      ? 'add-student-modal__form-input--error'
                      : ''
                  }`}
                  placeholder="Enter student's email"
                  value={field.email}
                  onChange={(e) => handleInputChange(e, field.id, 'email')}
                />
                {errors[`email_${field.id}`] && (
                  <div className='add-student-modal__error-message'>
                    {errors[`email_${field.id}`]}
                  </div>
                )}
              </div>

              {/* Student ID Field - All characters allowed */}
              <div className='add-student-modal__form-group'>
                <label
                  className='add-student-modal__form-label'
                  htmlFor={`student-id-${field.id}`}
                >
                  Student ID
                </label>
                <input
                  id={`student-id-${field.id}`}
                  type='text'
                  className={`add-student-modal__form-input ${
                    errors[`studentId_${field.id}`]
                      ? 'add-student-modal__form-input--error'
                      : ''
                  }`}
                  placeholder='Enter Studen ID (all Characters Allowed)'
                  value={field.studentId}
                  onChange={(e) => handleInputChange(e, field.id, 'studentId')}
                />
                {errors[`studentId_${field.id}`] && (
                  <div className='add-student-modal__error-message'>
                    {errors[`studentId_${field.id}`]}
                  </div>
                )}
              </div>

              <div className='add-student-modal__divider'></div>
            </div>
          ))}

    
          {/* Seat error message */}
          {seatError && (
            <div className='add-student-modal__error-message add-student-modal__error-message--seat'>
              {seatError}
            </div>
          )}

          <div className='add-student-modal__actions'>
            <button
              className='add-student-modal__button add-student-modal__button--cancel'
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className='add-student-modal__button add-student-modal__button--submit'
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Processing...'
                : `Add Student${studentFields.length > 1 ? 's' : ''}`}
            </button>
          </div>
          <button
            className='add-student-modal__add-field-btn'
            onClick={handleAddAnotherField}
            disabled={!isFirstStudentComplete()}
          >
            <FaPlus className='add-student-modal__add-icon' /> Add Another
            Student
          </button>

        </div>
      </div>
    </div>
  )
}

export default AddStudentModal
