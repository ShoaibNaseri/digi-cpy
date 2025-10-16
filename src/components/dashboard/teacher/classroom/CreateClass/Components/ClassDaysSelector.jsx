import React from 'react'
import PropTypes from 'prop-types'

const ClassDaysSelector = ({ classDays, onCheckboxChange }) => {
  // Handle Enter key press
  const handleKeyDown = (e, day) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onCheckboxChange(day)
    }
  }

  return (
    <div className='tcr-form-field-group'>
      <label className='tcr-section-label tcr-section-label-days tcr-section-label-days-create-class'>
        Which day of the week would you like to schedule your lessons?
      </label>
      <div className='tcr-checkbox-group'>
        {[
          { key: 'Mon', label: 'Monday' },
          { key: 'Tue', label: 'Tuesday' },
          { key: 'Wed', label: 'Wednesday' },
          { key: 'Thu', label: 'Thursday' },
          { key: 'Fri', label: 'Friday' },
          { key: 'Sat', label: 'Saturday' },
          { key: 'Sun', label: 'Sunday' }
        ].map((day) => (
          <div key={day.key} className='tcr-checkbox-item'>
            <input
              type='checkbox'
              id={day.key}
              checked={classDays[day.key]}
              onChange={() => onCheckboxChange(day.key)}
              tabIndex='0'
              onKeyDown={(e) => handleKeyDown(e, day.key)}
              aria-label={`Select ${day.label}`}
              role='checkbox'
              aria-checked={classDays[day.key]}
            />
            <label htmlFor={day.key}>{day.label}</label>
          </div>
        ))}
      </div>
      <div className='tcr-form-help-text'>Please select at least one day</div>
    </div>
  )
}

ClassDaysSelector.propTypes = {
  classDays: PropTypes.object.isRequired,
  onCheckboxChange: PropTypes.func.isRequired
}

export default ClassDaysSelector
