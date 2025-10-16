import { createContext, useContext, useState, useEffect } from 'react'
import { quizService } from '@/services/quizService'

export const AdminQuizBuilderContext = createContext()

// Quiz type constants
export const QUIZ_TYPES = {
  MULTIPLE_CHOICE: 'multiple-choice',
  CONFIDENCE_BASED: 'confidence-based',
  AGREE_BASED: 'agree-based',
  TEXT_INPUT: 'text-input'
}

export const QUIZ_TYPE_LABELS = {
  [QUIZ_TYPES.MULTIPLE_CHOICE]: 'Multiple Choice',
  [QUIZ_TYPES.CONFIDENCE_BASED]: 'Confidence Based',
  [QUIZ_TYPES.AGREE_BASED]: 'Agree/Disagree Based',
  [QUIZ_TYPES.TEXT_INPUT]: 'Text Input'
}

export const AdminQuizBuilderProvider = ({ children, quizId }) => {
  const [isQuestionsFormOpen, setIsQuestionsFormOpen] = useState(false)
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null)
  const [isLoading, setIsLoading] = useState(!!quizId)

  const [quizData, setQuizData] = useState({
    quizTitle: '',
    quizDuration: '',
    quizPassingScore: '',
    quizType: QUIZ_TYPES.MULTIPLE_CHOICE,
    mission: '',
    missionTitle: '',
    dueDate: '',
    questions: []
  })

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!quizId) return

      try {
        const data = await quizService.getQuizById(quizId)
        if (data) {
          setQuizData({
            ...data,
            quizType: data.quizType || QUIZ_TYPES.MULTIPLE_CHOICE // Default for existing quizzes
          })
        }
      } catch (error) {
        console.error('Error fetching quiz:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuizData()
  }, [quizId])

  return (
    <AdminQuizBuilderContext.Provider
      value={{
        isQuestionsFormOpen,
        setIsQuestionsFormOpen,
        quizData,
        setQuizData,
        editingQuestionIndex,
        setEditingQuestionIndex,
        quizId,
        isLoading,
        QUIZ_TYPES,
        QUIZ_TYPE_LABELS
      }}
    >
      {children}
    </AdminQuizBuilderContext.Provider>
  )
}

export const useAdminQuizBuilder = () => {
  const context = useContext(AdminQuizBuilderContext)

  if (!context) {
    throw new Error(
      'useAdminQuizBuilder must be used within a AdminQuizBuilderProvider'
    )
  }

  return context
}
