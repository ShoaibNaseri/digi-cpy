import React from 'react'
import './ViewQuizModal.css'

const ViewQuizModal = ({ quiz, onClose }) => {
  if (!quiz) return null

  return (
    <div className='view-quiz-modal__overlay'>
      <div className='view-quiz-modal__content'>
        <div className='view-quiz-modal__header'>
          <h2 className='view-quiz-modal__title'>{quiz.quizTitle}</h2>
          <button className='view-quiz-modal__close' onClick={onClose}>
            ×
          </button>
        </div>

        <div className='view-quiz-modal__body'>
          {quiz.questions &&
            quiz.questions.map((question, index) => (
              <div key={index} className='view-quiz-modal__question'>
                <h3 className='view-quiz-modal__question-number'>
                  Question {index + 1}
                </h3>
                <p className='view-quiz-modal__question-text'>
                  {question.question}
                </p>

                <div className='view-quiz-modal__options'>
                  {question.options &&
                    question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`view-quiz-modal__option ${
                          option === question.correctAnswer
                            ? 'view-quiz-modal__option--correct'
                            : ''
                        }`}
                      >
                        {option}
                        {option === question.correctAnswer && (
                          <span className='view-quiz-modal__correct-badge'>
                            Correct Answer
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default ViewQuizModal
