import React from 'react'

const ConfidenceBasedForm = ({ formData }) => {
  return (
    <div className='questions-form__group'>
      <label className='questions-form__label'>
        Confidence Levels (Students will see these)
      </label>
      <div className='questions-form__confidence-levels'>
        {formData.confidenceLevels.map((level, index) => (
          <div key={index} className='questions-form__confidence-level'>
            <span>{level}</span>
          </div>
        ))}
      </div>
      <p className='questions-form__help-text'>
        Students will rate their confidence level in knowing the answer to this
        question using these options.
      </p>
    </div>
  )
}

export default ConfidenceBasedForm
