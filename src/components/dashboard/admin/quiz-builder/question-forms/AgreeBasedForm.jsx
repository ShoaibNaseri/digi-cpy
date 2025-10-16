import React from 'react'

const AgreeBasedForm = ({ formData, setFormData, errors, setErrors }) => {
  const handleExplanationChange = (e) => {
    setFormData({ ...formData, explanation: e.target.value })
    if (errors.explanation) {
      setErrors({ ...errors, explanation: '' })
    }
  }

  return (
    <>
      <div className='questions-form__group'>
        <label className='questions-form__label'>
          Agreement Options (Students will see these)
        </label>
        <div className='questions-form__agree-options'>
          {formData.agreeOptions.map((option, index) => (
            <div key={index} className='questions-form__agree-option'>
              <span>{option}</span>
            </div>
          ))}
        </div>
        <p className='questions-form__help-text'>
          Students will rate their agreement with the statement using these
          options.
        </p>
      </div>

      <div className='questions-form__group'>
        <label className='questions-form__label'>Explanation</label>
        <textarea
          type='text'
          id='explanation'
          placeholder='Provide an explanation for this statement or question'
          rows={3}
          value={formData.explanation}
          onChange={handleExplanationChange}
          className={errors.explanation ? 'error' : ''}
        />
        {errors.explanation && (
          <span className='error-message'>{errors.explanation}</span>
        )}
        <p className='questions-form__help-text'>
          This explanation will help students understand the context and
          reasoning behind the statement.
        </p>
      </div>
    </>
  )
}

export default AgreeBasedForm
