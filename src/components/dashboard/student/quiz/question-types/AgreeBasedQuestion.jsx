import React from 'react'

const AgreeBasedQuestion = ({
  question,
  selectedAnswer,
  setSelectedAnswer
}) => {
  const agreeOptions = [
    'Strongly Agree',
    'Agree',
    'Disagree',
    'Strongly Disagree'
  ]

  return (
    <div className='student-quiz__agree-based'>
      {question.explanation && (
        <div className='student-quiz__explanation'>
          <h3>Context:</h3>
          <p>{question.explanation}</p>
        </div>
      )}

      <div className='student-quiz__options'>
        <h3>Rate your agreement:</h3>
        {agreeOptions.map((option, index) => (
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
            <span className='student-quiz__option-label'>{option}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

export default AgreeBasedQuestion
