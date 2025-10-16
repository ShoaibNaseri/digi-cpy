import React from 'react'

const MultipleChoiceForm = ({ formData, setFormData, errors, setErrors }) => {
  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
    if (errors.options[index]) {
      const newErrors = { ...errors, options: [...errors.options] }
      newErrors.options[index] = ''
      setErrors(newErrors)
    }
  }

  const handleCorrectAnswerChange = (index) => {
    setFormData({ ...formData, correctAnswer: index })
    if (errors.correctAnswer) {
      setErrors({ ...errors, correctAnswer: '' })
    }
  }

  return (
    <div className='questions-form__group'>
      <div className='questions-form__group-bottom'>
        <div className='questions-form__group-bottom-left'>
          {formData.options.map((option, index) => (
            <div key={index}>
              <input
                type='radio'
                name='correct-answer'
                id={`option${index + 1}-radio`}
                checked={formData.correctAnswer === index}
                onChange={() => handleCorrectAnswerChange(index)}
              />
              <input
                type='text'
                id={`option${index + 1}`}
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className={errors.options[index] ? 'error' : ''}
              />
              {errors.options[index] && (
                <span className='error-message'>{errors.options[index]}</span>
              )}
            </div>
          ))}
        </div>
      </div>
      {errors.correctAnswer && (
        <span className='error-message'>{errors.correctAnswer}</span>
      )}
    </div>
  )
}

export default MultipleChoiceForm
