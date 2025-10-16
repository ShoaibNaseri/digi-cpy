import React from 'react'
import PropTypes from 'prop-types'

const StudentFormRow = ({
  field,
  errors,
  onInputChange,
  onRemoveField,
  showRemoveButton
}) => {
  return (
    <div className='add-student-modal__student-entry'>
      <div className='add-student-modal__entry-header'>
        <h3 className='add-student-modal__entry-title'></h3>
        {showRemoveButton && (
          <button
            className='add-student-modal__remove-field-btn'
            onClick={() => onRemoveField(field.id)}
            aria-label='Remove student'
          >
            ×
          </button>
        )}
      </div>

      {/* Student First Name Field */}
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
          onChange={(e) => onInputChange(e, field.id, 'firstName')}
        />
        {errors[`firstName_${field.id}`] && (
          <div className='add-student-modal__error-message'>
            {errors[`firstName_${field.id}`]}
          </div>
        )}
      </div>

      {/* Student Last Name Field */}
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
          onChange={(e) => onInputChange(e, field.id, 'lastName')}
        />
        {errors[`lastName_${field.id}`] && (
          <div className='add-student-modal__error-message'>
            {errors[`lastName_${field.id}`]}
          </div>
        )}
      </div>

      {/* Student Email Field */}
      <div className='add-student-modal__form-group'>
        <label
          className='add-student-modal__form-label'
          htmlFor={`student-email-${field.id}`}
        >
          Email
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
          onChange={(e) => onInputChange(e, field.id, 'email')}
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
          placeholder='Enter student ID (all characters allowed)'
          value={field.studentId}
          onChange={(e) => onInputChange(e, field.id, 'studentId')}
        />
        {errors[`studentId_${field.id}`] && (
          <div className='add-student-modal__error-message'>
            {errors[`studentId_${field.id}`]}
          </div>
        )}
      </div>

      <div className='add-student-modal__divider'></div>
    </div>
  )
}

StudentFormRow.propTypes = {
  field: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onRemoveField: PropTypes.func.isRequired,
  showRemoveButton: PropTypes.bool.isRequired
}

export default StudentFormRow
