import React from 'react'

const ConfidenceBasedQuestion = ({
  question,
  selectedAnswer,
  setSelectedAnswer,
  confidenceLevel,
  setConfidenceLevel
}) => {
  const confidenceLevels = [
    'Very Confident',
    'Confident',
    'Somewhat Confident',
    'Not Confident'
  ]

  return (
    <div className='student-quiz__confidence-based'>
      <div className='student-quiz__question-context'>
        <h3>Rate your confidence level:</h3>
        <p>How confident are you in knowing the answer to this question?</p>
      </div>

      <div className='student-quiz__confidence-section'>
        <div className='student-quiz__confidence-options'>
          {confidenceLevels.map((level, index) => (
            <label
              key={index}
              className={`student-quiz__confidence-option ${
                confidenceLevel === level ? 'selected' : ''
              }`}
            >
              <input
                type='radio'
                name='confidence'
                value={level}
                checked={confidenceLevel === level}
                onChange={(e) => setConfidenceLevel(e.target.value)}
              />
              <span className='student-quiz__confidence-label'>{level}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ConfidenceBasedQuestion
