import React from 'react'
import PropTypes from 'prop-types'

const ClassFormSummary = ({
  formData,
  getFormattedClassDays,
  getFormattedFrequency,
  getFormattedDate,
  formatTime
}) => {
  return (
    <div className='tcr-form-field-group'>
      <div className='tcr-summary-section'>
        <h3 className='tcr-section-title'>Summary</h3>

        <div className='tcr-summary-grid'>
          <div className='tcr-summary-item'>
            <div className='tcr-summary-label'>Class</div>
            <div className='tcr-summary-value'>
              {formData.className || 'Not specified'}
            </div>
          </div>

          <div className='tcr-summary-item'>
            <div className='tcr-summary-label'>Grade Level</div>
            <div className='tcr-summary-value'>
              {formData.grade ? `Grade ${formData.grade}` : 'Not specified'}
            </div>
          </div>

          <div className='tcr-summary-item'>
            <div className='tcr-summary-label'>Mission</div>
            <div className='tcr-summary-value'>All Missions</div>
          </div>

          <div className='tcr-summary-item'>
            <div className='tcr-summary-label'>Time</div>
            <div className='tcr-summary-value'>
              {formatTime(formData.scheduleTime)}
            </div>
          </div>

          <div className='tcr-summary-item'>
            <div className='tcr-summary-label'>Frequency</div>
            <div className='tcr-summary-value'>{getFormattedFrequency()}</div>
          </div>

          <div className='tcr-summary-item'>
            <div className='tcr-summary-label'>Class Days</div>
            <div className='tcr-summary-value'>
              {getFormattedClassDays() || 'Not specified'}
            </div>
          </div>

          <div className='tcr-summary-item'>
            <div className='tcr-summary-label'>First Mission Date</div>
            <div className='tcr-summary-value'>{getFormattedDate()}</div>
          </div>

          {formData.students && formData.students.length > 0 && (
            <div className='tcr-summary-item'>
              <div className='tcr-summary-label'>Students</div>
              <div className='tcr-summary-value tcr-students-imported'>
                {formData.students.length} students imported
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

ClassFormSummary.propTypes = {
  formData: PropTypes.object.isRequired,
  getFormattedClassDays: PropTypes.func.isRequired,
  getFormattedFrequency: PropTypes.func.isRequired,
  getFormattedDate: PropTypes.func.isRequired,
  formatTime: PropTypes.func.isRequired
}

export default ClassFormSummary
