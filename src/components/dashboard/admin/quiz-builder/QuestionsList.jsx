import './QuestionsList.css'
import { FaTrash, FaEdit } from 'react-icons/fa'
import { useAdminQuizBuilder } from '../../../../context/AdminQuizBuilderContext'
import { QUIZ_TYPES } from '../../../../context/AdminQuizBuilderContext'

const QuestionsList = () => {
  const {
    quizData,
    setQuizData,
    setIsQuestionsFormOpen,
    setEditingQuestionIndex
  } = useAdminQuizBuilder()

  const handleEditQuestion = (index) => {
    setEditingQuestionIndex(index)
    setIsQuestionsFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteQuestion = (index) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      setQuizData({
        ...quizData,
        questions: quizData.questions.filter((_, i) => i !== index)
      })
    }
  }

  const renderQuestionDetails = (question, index) => {
    switch (question.type) {
      case QUIZ_TYPES.MULTIPLE_CHOICE:
        return (
          <div className='questions-list__question-details'>
            <div className='questions-list__options'>
              <strong>Options:</strong>
              <ul>
                {question.options.map((option, optionIndex) => (
                  <li
                    key={optionIndex}
                    className={
                      option === question.correctAnswer ? 'correct' : ''
                    }
                  >
                    {option}
                    {option === question.correctAnswer && (
                      <span className='correct-badge'>✓ Correct</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )

      case QUIZ_TYPES.CONFIDENCE_BASED:
        return (
          <div className='questions-list__question-details'>
            <div className='questions-list__confidence-info'>
              <strong>Type:</strong> Confidence Assessment
              <p>
                Students will rate their confidence level for this question.
              </p>
            </div>
          </div>
        )

      case QUIZ_TYPES.AGREE_BASED:
        return (
          <div className='questions-list__question-details'>
            <div className='questions-list__explanation'>
              <strong>Explanation:</strong>
              <p>{question.explanation}</p>
            </div>
            <div className='questions-list__options'>
              <strong>Options:</strong>
              <ul>
                {question.options.map((option, optionIndex) => (
                  <li key={optionIndex}>{option}</li>
                ))}
              </ul>
            </div>
          </div>
        )

      case QUIZ_TYPES.TEXT_INPUT:
        return (
          <div className='questions-list__question-details'>
            <div className='questions-list__text-info'>
              <p>Students will provide a written response to this question.</p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className='questions-list'>
      <h3 className='questions-list__title'>Created Questions</h3>
      {quizData.questions.length === 0 ? (
        <p className='questions-list__empty'>No questions added yet</p>
      ) : (
        <div className='questions-list__container'>
          {quizData.questions.map((question, index) => (
            <div key={index} className='questions-list__item'>
              <div className='questions-list__content'>
                <h4 className='questions-list__question'>
                  {index + 1}. {question.question}
                </h4>
                {renderQuestionDetails(question, index)}
              </div>
              <div className='questions-list__actions'>
                <button
                  className='questions-list__btn-edit'
                  onClick={() => handleEditQuestion(index)}
                >
                  <FaEdit /> Edit
                </button>
                <button
                  className='questions-list__btn-delete'
                  onClick={() => handleDeleteQuestion(index)}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default QuestionsList
