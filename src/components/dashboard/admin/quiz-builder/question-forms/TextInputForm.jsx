import React from 'react'

const TextInputForm = () => {
  return (
    <div className='questions-form__group'>
      <label className='questions-form__label'>Student Instructions</label>
      <div className='questions-form__student-instructions'>
        <p>
          Students will see a text input field where they can type their answer.
        </p>
        <p>They can provide detailed responses and explanations.</p>
      </div>
    </div>
  )
}

export default TextInputForm
