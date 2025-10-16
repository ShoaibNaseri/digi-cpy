import './QuizBuilder.css'
import QuizForm from './QuizForm'
import { useAdminQuizBuilder } from '@/context/AdminQuizBuilderContext'

const QuizBuilder = () => {
  const { isLoading } = useAdminQuizBuilder()

  if (isLoading) {
    return <div className='loading'>Loading quiz...</div>
  }

  return (
    <>
      <div className='quizzes-header'>
        <h1>Quiz Builder</h1>
        <p>Add questions and answers for your quiz</p>
      </div>
      <div className='quizzes'>
        <QuizForm />
      </div>
    </>
  )
}

export default QuizBuilder
