import React from 'react'

const TextInputQuestion = ({ question, textAnswer, setTextAnswer }) => {
  return (
    <div className='student-quiz__text-input'>
      <div className='student-quiz__text-input-field'>
        <textarea
          placeholder='Type your answer here...'
          value={textAnswer}
          onChange={(e) => setTextAnswer(e.target.value)}
          rows={6}
          className='student-quiz__text-area'
        />
      </div>
      <div className='student-quiz__text-input-help'>
        <p>
          Please provide a detailed answer. You can include explanations,
          examples, and your reasoning.
        </p>
      </div>
    </div>
  )
}

export default TextInputQuestion
