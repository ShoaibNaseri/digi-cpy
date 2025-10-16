import './StudentQuestionSummary.css'
import QuestionSummaryHeader from './QuestionSummaryHeader'

// Quiz type constants (matching admin context)
const QUIZ_TYPES = {
  MULTIPLE_CHOICE: 'multiple-choice',
  CONFIDENCE_BASED: 'confidence-based',
  AGREE_BASED: 'agree-based',
  TEXT_INPUT: 'text-input'
}

const StudentQuestionSummary = ({ questions, answers, quiz }) => {
  const renderQuestionSummary = (question, index) => {
    const userAnswer = answers[index]
    const questionType =
      question.type || quiz.quizType || QUIZ_TYPES.MULTIPLE_CHOICE

    switch (questionType) {
      case QUIZ_TYPES.MULTIPLE_CHOICE:
        return renderMultipleChoiceSummary(question, userAnswer, index)

      case QUIZ_TYPES.CONFIDENCE_BASED:
        return renderConfidenceBasedSummary(question, userAnswer, index)

      case QUIZ_TYPES.AGREE_BASED:
        return renderAgreeBasedSummary(question, userAnswer, index)

      case QUIZ_TYPES.TEXT_INPUT:
        return renderTextInputSummary(question, userAnswer, index)

      default:
        return renderMultipleChoiceSummary(question, userAnswer, index)
    }
  }

  const renderMultipleChoiceSummary = (question, userAnswer, index) => {
    const isCorrect = userAnswer === question.correctAnswer

    return (
      <div key={index} className='questions-list__item'>
        <div className='questions-list__content'>
          <h4 className='questions-list__question'>
            {index + 1}. {question.question}
          </h4>
          <div className='questions-list__options'>
            {question.options.map((option, optionIndex) => {
              const isUserAnswer = option === userAnswer
              const isCorrectAnswer = option === question.correctAnswer

              return (
                <div
                  key={optionIndex}
                  className={`questions-list__option ${
                    isCorrectAnswer ? 'questions-list__option--correct' : ''
                  } ${
                    isUserAnswer && !isCorrect
                      ? 'questions-list__option--wrong'
                      : ''
                  }`}
                >
                  <span className='questions-list__option-label'>
                    {String.fromCharCode(65 + optionIndex)}. {option}
                  </span>
                  {isUserAnswer && !isCorrect && (
                    <span className='questions-list__wrong-indicator'>
                      Your Answer
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderConfidenceBasedSummary = (question, userAnswer, index) => {
    return (
      <div key={index} className='questions-list__item'>
        <div className='questions-list__content'>
          <h4 className='questions-list__question'>
            {index + 1}. {question.question}
          </h4>
          {userAnswer && (
            <div className='questions-list__confidence-summary'>
              <strong>Your Confidence Level:</strong> {userAnswer}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderAgreeBasedSummary = (question, userAnswer, index) => {
    return (
      <div key={index} className='questions-list__item'>
        <div className='questions-list__content'>
          <h4 className='questions-list__question'>
            {index + 1}. {question.question}
          </h4>
          {question.explanation && (
            <div className='questions-list__explanation-summary'>
              <strong>Context:</strong> {question.explanation}
            </div>
          )}
          <div className='questions-list__user-answer'>
            <strong>Your Response:</strong> {userAnswer || 'No answer provided'}
          </div>
        </div>
      </div>
    )
  }

  const renderTextInputSummary = (question, userAnswer, index) => {
    return (
      <div key={index} className='questions-list__item'>
        <div className='questions-list__content'>
          <h4 className='questions-list__question'>
            {index + 1}. {question.question}
          </h4>
          <div className='questions-list__text-answer'>
            <strong>Your Answer:</strong>
            <div className='questions-list__text-answer-content'>
              {userAnswer || 'No answer provided'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // const renderQuestionDetails = (question, index) => {
  //   const answer = answers[index]
  //   const questionType = question.type || QUIZ_TYPES.MULTIPLE_CHOICE

  //   switch (questionType) {
  //     case QUIZ_TYPES.MULTIPLE_CHOICE:
  //       return (
  //         <div className='question-summary__details'>
  //           <div className='question-summary__options'>
  //             {question.options.map((option, optionIndex) => (
  //               <div
  //                 key={optionIndex}
  //                 className={`question-summary__option ${
  //                   option === answer
  //                     ? 'question-summary__option--selected'
  //                     : ''
  //                 } ${
  //                   option === question.correctAnswer
  //                     ? 'question-summary__option--correct'
  //                     : ''
  //                 }`}
  //               >
  //                 {String.fromCharCode(65 + optionIndex)}. {option}
  //                 {option === answer && (
  //                   <span className='question-summary__selected-badge'>
  //                     Your Answer
  //                   </span>
  //                 )}
  //                 {option === question.correctAnswer && (
  //                   <span className='question-summary__correct-badge'>
  //                     Correct Answer
  //                   </span>
  //                 )}
  //               </div>
  //             ))}
  //           </div>
  //         </div>
  //       )

  //     case QUIZ_TYPES.CONFIDENCE_BASED:
  //       return (
  //         <div className='question-summary__details'>
  //           <div className='question-summary__confidence-answer'>
  //             <strong>Your Confidence Level:</strong>
  //             <div className='question-summary__confidence-display'>
  //               {answer || 'Not answered'}
  //             </div>
  //           </div>
  //         </div>
  //       )

  //     case QUIZ_TYPES.AGREE_BASED:
  //       return (
  //         <div className='question-summary__details'>
  //           <div className='question-summary__explanation'>
  //             <strong>Explanation:</strong>
  //             <p>{question.explanation}</p>
  //           </div>
  //           <div className='question-summary__agree-answer'>
  //             <strong>Your Response:</strong>
  //             <div className='question-summary__agree-display'>
  //               {answer || 'Not answered'}
  //             </div>
  //           </div>
  //         </div>
  //       )

  //     case QUIZ_TYPES.TEXT_INPUT:
  //       return (
  //         <div className='question-summary__details'>
  //           <div className='question-summary__text-answer'>
  //             <strong>Your Answer:</strong>
  //             <div className='question-summary__text-display'>
  //               {answer || 'Not answered'}
  //             </div>
  //           </div>
  //         </div>
  //       )

  //     default:
  //       return null
  //   }
  // }

  return (
    <div className='quiz-summary'>
      <QuestionSummaryHeader quiz={quiz} />
      <div className='questions-list__container'>
        {questions.map((question, index) =>
          renderQuestionSummary(question, index)
        )}
      </div>
    </div>
  )
}

export default StudentQuestionSummary
