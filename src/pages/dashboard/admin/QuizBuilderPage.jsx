import QuizBuilder from '../../../components/dashboard/admin/quiz-builder/QuizBuilder'
import { AdminQuizBuilderProvider } from '../../../context/AdminQuizBuilderContext'
import { useParams } from 'react-router-dom'

const QuizBuilderPage = () => {
  const { quizId } = useParams()

  return (
    <AdminQuizBuilderProvider quizId={quizId}>
      <QuizBuilder />
    </AdminQuizBuilderProvider>
  )
}

export default QuizBuilderPage
