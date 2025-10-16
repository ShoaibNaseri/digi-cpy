import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import './RemoveStudentModal.css'
import { removeStudent } from '@/services/teacherService'
import { useAuth } from '@/context/AuthContext'
import arrowDownIcon from '@/assets/icons/arrow-down.svg'

// Lightweight custom dropdown to allow styling of menu items
const RSMSelect = ({
  value,
  onChange,
  options,
  placeholder,
  hasError = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = React.useRef(null)
  const triggerRef = React.useRef(null)
  const [menuStyle, setMenuStyle] = useState({})
  const [openDirection, setOpenDirection] = useState('down')

  const selectedOption = options.find((opt) => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const recalcPosition = () => {
      if (!triggerRef.current) return
      const rect = triggerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight
      const spaceBelow = viewportHeight - rect.bottom - 8
      const spaceAbove = rect.top - 8
      const desiredMaxHeight = 260
      const openUp = spaceBelow < Math.min(desiredMaxHeight, spaceAbove)
      setOpenDirection(openUp ? 'up' : 'down')

      const maxHeight = openUp ? Math.min(desiredMaxHeight, spaceAbove) : Math.min(desiredMaxHeight, spaceBelow)

      setMenuStyle({
        position: 'fixed',
        top: openUp ? rect.top - 8 - maxHeight : rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        maxHeight: Math.max(120, maxHeight),
        overflow: 'auto',
        zIndex: 2000
      })
    }

    recalcPosition()

    const modalScrollParent = containerRef.current?.closest('.rsm-modal-container')
    window.addEventListener('resize', recalcPosition)
    window.addEventListener('scroll', recalcPosition, true)
    if (modalScrollParent) {
      modalScrollParent.addEventListener('scroll', recalcPosition, { passive: true })
    }
    return () => {
      window.removeEventListener('resize', recalcPosition)
      window.removeEventListener('scroll', recalcPosition, true)
      if (modalScrollParent) {
        modalScrollParent.removeEventListener('scroll', recalcPosition)
      }
    }
  }, [isOpen])

  const handleSelect = (val) => {
    onChange(val)
    setIsOpen(false)
  }

  const hasOptions = Array.isArray(options) && options.length > 0

  return (
    <div
      ref={containerRef}
      className={`rsm-select-wrapper ${isOpen ? 'open' : ''}`}
    >
      <button
        type='button'
        ref={triggerRef}
        className={`rsm-dropdown-trigger ${hasError ? 'rsm-input-error' : ''}`}
        onClick={() => {
          if (disabled || !hasOptions) return
          setIsOpen((prev) => !prev)
        }}
        aria-haspopup='listbox'
        aria-expanded={isOpen}
        disabled={disabled || !hasOptions}
      >
        <span className={selectedOption ? '' : 'rsm-dropdown-placeholder'}>
          {selectedOption
            ? selectedOption.label
            : hasOptions
              ? placeholder
              : 'No students found'}
        </span>
      </button>
      <img
        src={arrowDownIcon}
        alt=''
        aria-hidden='true'
        className='rsm-select-arrow'
        width={24}
        height={24}
      />
      {isOpen && hasOptions &&
        ReactDOM.createPortal(
          (
            <ul
              className={`rsm-dropdown-list ${openDirection === 'up' ? 'drop-up' : 'drop-down'}`}
              role='listbox'
              style={menuStyle}
            >
              {options.map((opt) => (
                <li
                  key={opt.value}
                  role='option'
                  aria-selected={opt.value === value}
                  className={`rsm-dropdown-item ${opt.value === value ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          ),
          document.body
        )}
    </div>
  )
}

const RemoveStudentModal = ({
  onClose,
  onRemoveStudent,
  studentData,
  classStudents = []
}) => {
  const { currentUser } = useAuth()

  // Default student data if not provided
  const defaultStudent = {
    name: '',
    id: '',
    classId: ''
  }

  // Use provided student data or default
  const student = studentData || defaultStudent

  // State for form fields
  const [selectedStudent, setSelectedStudent] = useState(student.id || '')
  const [removalReason, setRemovalReason] = useState(
    'Student transferred to another school'
  )
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form values when studentData changes
  useEffect(() => {
    if (studentData) {
      setSelectedStudent(studentData.id || '')
    }
  }, [studentData])

  // Define the grade name based on classId
  const gradeName =
    student.classId === 'grade4'
      ? 'Grade 4'
      : student.classId === 'grade5'
      ? 'Grade 5'
      : 'Unknown Grade'

  // Available reasons for removal
  const removalReasons = [
    'Student transferred to another school',
    'Student graduated',
    'Student no longer enrolled',
    'Administrative removal',
    'Parent/guardian request',
    'Other'
  ]

  // Handle student selection change
  const handleStudentChange = (e) => {
    setSelectedStudent(e.target.value)
    // Clear error when user selects a student
    if (formErrors.student) {
      setFormErrors({ ...formErrors, student: null })
    }
  }

  // Handle reason change
  const handleReasonChange = (e) => {
    setRemovalReason(e.target.value)
  }

  // Handle notes change
  const handleNotesChange = (e) => {
    setAdditionalNotes(e.target.value)
  }

  // Validate form
  const validateForm = () => {
    const errors = {}

    if (!selectedStudent) {
      errors.student = 'Please select a student'
    }

    if (!removalReason) {
      errors.reason = 'Please select a reason for removal'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle removal confirmation
  const handleRemove = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const selectedStudentData = classStudents.find(
        (s) => s.id === selectedStudent
      )

      if (!selectedStudentData) {
        throw new Error('Selected student not found in class data')
      }

      const removalData = {
        student: selectedStudentData,
        reason: removalReason,
        notes: additionalNotes,
        removedBy: currentUser.uid,
        timestamp: new Date().toISOString()
      }

      // Call removeStudent to remove the student from the database
      await removeStudent(selectedStudent, removalData)

      // After successful database update, notify parent component to update UI
      onRemoveStudent(removalData)
    } catch (error) {
      console.error('Error removing student:', error)
      setFormErrors({
        ...formErrors,
        submit: `Failed to remove student: ${error.message}. Please try again.`
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='rsm-modal-overlay'>
      <div className='rsm-modal-container'>
        <div className='rsm-modal-header'>
          <h2 className='rsm-modal-title'>Remove Student</h2>
          <button
            className='rsm-modal-close-btn'
            onClick={onClose}
            aria-label='Close'
          >
            ×
          </button>
        </div>

        <div className='rsm-modal-content'>
          <div className='rsm-student-info'>
            <div className='rsm-form-group' style={{ marginBottom: '8px' }}>
              <RSMSelect
                value={selectedStudent}
                onChange={(val) => {
                  const syntheticEvent = { target: { value: val } }
                  handleStudentChange(syntheticEvent)
                }}
                options={classStudents.map((s) => ({
                  value: s.id,
                  label: `${s.firstName} ${s.lastName}${s.studentId ? ` - ${s.studentId}` : ''}`
                }))}
                placeholder='Select a student'
                hasError={!!formErrors.student}
                disabled={!classStudents || classStudents.length === 0}
              />
              {formErrors.student && (
                <div className='rsm-error-message'>{formErrors.student}</div>
              )}
            </div>
          </div>

          {/* Info card section */}
          <div className='rsm-info-card'>
            <div>
              <p className='rsm-info-title'>Removing this student will:</p>
              <ul className='rsm-info-list'>
                <li>Remove access to all assigned missions</li>
                <li>Archive their progress data</li>
                <li>Remove them from the class roster</li>
                <li>Keep their data for record-keeping purposes</li>
              </ul>
            </div>
            <div className='rsm-info-icon'>⚠️</div>
          </div>

            <div className='rsm-form-group'>
            <label className='rsm-form-label'>Reason for removal</label>
            <RSMSelect
              value={removalReason}
              onChange={(val) => handleReasonChange({ target: { value: val } })}
              options={removalReasons.map((r) => ({ value: r, label: r }))}
              placeholder='Select a reason'
              hasError={!!formErrors.reason}
            />
            {formErrors.reason && (
              <div className='rsm-error-message'>{formErrors.reason}</div>
            )}
          </div>

          <div className='rsm-form-group'>
            <label className='rsm-form-label rsm-form-label-optional'>
              Additional notes (optional)
            </label>
            <textarea
              className='rsm-form-textarea'
              placeholder='Enter any additional information...'
              value={additionalNotes}
              onChange={handleNotesChange}
              rows={4}
            ></textarea>
          </div>

          {formErrors.submit && (
            <div className='rsm-error-message rsm-error-message--global'>
              {formErrors.submit}
            </div>
          )}

          <div className='rsm-action-buttons'>
            <button
              className='rsm-cancel-btn'
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className='rsm-remove-btn'
              onClick={handleRemove}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Removing...' : 'Remove Student'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RemoveStudentModal
