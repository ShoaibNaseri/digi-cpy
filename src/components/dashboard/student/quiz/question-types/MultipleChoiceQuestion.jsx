import React from 'react'

const MultipleChoiceQuestion = ({
  question,
  selectedAnswer,
  setSelectedAnswer
}) => {
  return (
    <div className='student-quiz__options'>
      {question.options.map((option, index) => (
        <label
          key={index}
          className={`student-quiz__option ${
            selectedAnswer === option ? 'selected' : ''
          }`}
        >
          <input
            type='radio'
            name='answer'
            value={option}
            checked={selectedAnswer === option}
            onChange={(e) => setSelectedAnswer(e.target.value)}
          />
          <span className='student-quiz__option-label'>
            {String.fromCharCode(65 + index)}. {option}
          </span>
        </label>
      ))}
    </div>
  )
}

export default MultipleChoiceQuestion
