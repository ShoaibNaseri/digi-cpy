import { FaPlus } from 'react-icons/fa6'
import './QuizBuilderActionButtons.css'
import { useAdminQuizBuilder } from '@/context/AdminQuizBuilderContext'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-toastify'
import { quizService } from '@/services/quizService'

const QuizBuilderActionButtons = ({ validateQuizData }) => {
  const {
    isQuestionsFormOpen,
    setIsQuestionsFormOpen,
    quizData,
    setQuizData,
    quizId,
    QUIZ_TYPES
  } = useAdminQuizBuilder()
  const { currentUser } = useAuth()

  const handleAddQuestion = () => {
    setIsQuestionsFormOpen(!isQuestionsFormOpen)
  }

  const handleSaveDraft = async (status) => {
    if (!validateQuizData()) {
      toast.error('Please fix the validation errors before saving')
      return
    }

    if (quizData.questions.length === 0) {
      toast.error('Please add at least one question before saving')
      return
    }

    try {
      // Prepare quiz data - only include passing score for multiple choice
      const quizDataToSave = { ...quizData }
      if (quizData.quizType !== QUIZ_TYPES.MULTIPLE_CHOICE) {
        delete quizDataToSave.quizPassingScore
      }

      const result = await quizService.saveQuiz(
        quizDataToSave,
        status,
        currentUser,
        quizId
      )
      toast.success(result.message)

      if (!quizId) {
        setQuizData({
          quizTitle: '',
          quizDuration: '',
          quizPassingScore: '',
          quizType: QUIZ_TYPES.MULTIPLE_CHOICE,
          questions: []
        })
      }
    } catch (error) {
      console.error('Error saving quiz: ', error)
      toast.error('Error saving quiz')
    }
  }

  return (
    <div className='action-buttons'>
      <button
        className='action-buttons__btn-add-question'
        onClick={handleAddQuestion}
      >
        <FaPlus />
        <span>Add Question</span>
      </button>
      <div className='action-buttons__buttons'>
        <button
          className='action-buttons__btn-save-draft'
          onClick={() => handleSaveDraft('draft')}
        >
          Save Draft
        </button>
        <button
          className='action-buttons__btn-publish-quiz'
          onClick={() => handleSaveDraft('published')}
        >
          Publish Quiz
        </button>
      </div>
    </div>
  )
}

export default QuizBuilderActionButtons
