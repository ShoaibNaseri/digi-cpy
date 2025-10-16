import { useState, useEffect } from 'react'
import StudentQuizCard from './StudentQuizCard'
import './StudentQuizzes.css'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  createStudentQuiz,
  fetchStudentQuizzes
} from '@/services/studentService'
import { FaBell } from 'react-icons/fa'
import { getAllMissions } from '@/utils/jsnMissions'
import QuizCustomDropdown from '@/components/common/QuizCustomDropdown'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import PageHeader from '@/components/common/dashboard-header/common/PageHeader'
import useStudentMenuItems from '@/hooks/useStudentMenuItems'
import PagePreloader from '@/components/common/preloaders/PagePreloader'

const StudentQuizzes = ({ isChild = false }) => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [currentUserId, setCurrentUserId] = useState(null)
  const queryClient = useQueryClient()
  const studentMenuItems = useStudentMenuItems()
  // Filters
  const [missionFilter, setMissionFilter] = useState('All Missions')
  const [statusFilter, setStatusFilter] = useState('All Status')

  const missionList = getAllMissions()
  const colorPalette = ['#7B34BF', '#0454AC', '#EF0067', '#00C6FF']

  const getQuizColor = (quiz, index) =>
    quiz.headerColor || colorPalette[index % colorPalette.length]

  const getMissionOptions = () => [
    'All Missions',
    ...missionList.map((m) => m.title).filter(Boolean)
  ]

  const getStatusOptions = () => ['All Status', 'Completed', 'In Progress']

  // Resolve current user ID
  useEffect(() => {
    if (isChild) {
      const stored = localStorage.getItem('selectedProfile')
      const user = stored ? JSON.parse(stored) : null
      setCurrentUserId(user?.childId || null)
    } else {
      setCurrentUserId(currentUser?.uid || null)
    }
  }, [isChild, currentUser])

  // Fetch quizzes with React Query
  const {
    data: quizzes = [],
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['studentQuizzes', currentUserId],
    queryFn: () => fetchStudentQuizzes(currentUserId),
    enabled: !!currentUserId,
    refetchInterval: 1800000, // refresh every 30 minutes
    staleTime: 1800000, // consider fresh for 30 minutes
    refetchOnWindowFocus: true, // refresh when window/tab is focused
    refetchOnMount: true // refresh when navigating back to this page
  })

  const getFilteredQuizzes = () => {
    let filtered = quizzes.filter((quiz) => {
      if (
        missionFilter !== 'All Missions' &&
        quiz.missionTitle !== missionFilter
      ) {
        return false
      }
      if (statusFilter !== 'All Status') {
        const quizStatus = (quiz.status || '').toLowerCase()
        const filterStatus = statusFilter.toLowerCase()
        if (filterStatus === 'completed' && quizStatus !== 'completed')
          return false
        if (filterStatus === 'in progress' && quizStatus !== 'in-progress')
          return false
      }
      return true
    })

    filtered.sort((a, b) => {
      const aIndex = missionList.findIndex((m) => m.title === a.missionTitle)
      const bIndex = missionList.findIndex((m) => m.title === b.missionTitle)
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
      if (aIndex !== -1) return -1
      if (bIndex !== -1) return 1
      return (a.missionTitle || '').localeCompare(b.missionTitle || '')
    })

    return filtered
  }

  const handleQuizClick = async (quiz) => {
    try {
      if (quiz.isExpired && !currentUser) return

      if (isChild) {
        if (!quiz.originalQuizId) {
          const studentQuizData = {
            ...quiz,
            originalQuizId: quiz.id,
            studentId: currentUserId,
            answers: [],
            score: 0
          }
          const studentQuiz = await createStudentQuiz(studentQuizData)

          // 🔥 Invalidate quizzes so the list refreshes immediately
          queryClient.invalidateQueries(['studentQuizzes', currentUserId])

          navigate(`/dashboard/child/quiz/${studentQuiz.id}`)
        } else {
          navigate(`/dashboard/child/quiz/${quiz.id}`)
        }
      } else {
        if (!quiz.originalQuizId) {
          const studentQuizData = {
            ...quiz,
            originalQuizId: quiz.id,
            studentId: currentUserId,
            answers: [],
            score: 0
          }
          if (currentUser.schoolId)
            studentQuizData.schoolId = currentUser.schoolId
          if (currentUser.classId) studentQuizData.classId = currentUser.classId

          const studentQuiz = await createStudentQuiz(studentQuizData)

          queryClient.invalidateQueries(['studentQuizzes', currentUserId])

          navigate(`/dashboard/student/quiz/${studentQuiz.id}`)
        } else {
          navigate(`/dashboard/student/quiz/${quiz.id}`)
        }
      }
    } catch (error) {
      console.error('Error creating student quiz:', error)
    }
  }

  const filteredQuizzes = getFilteredQuizzes()

  return (
    <div className='student-quizzes__container'>
      <div className='student-quizzes__content-wrapper'>
        {/* Header Section */}
        <PageHeader
          title='Quizzes'
          subtitle='Complete quizzes to earn points and track your progress'
          menuItems={studentMenuItems}
        />
        {/* Filter Dropdowns */}
        <div className='student-quizzes__filter-container'>
          <div className='student-quizzes__filter-dropdown'>
            <QuizCustomDropdown
              value={missionFilter}
              onChange={(value) => setMissionFilter(value)}
              options={getMissionOptions()}
              placeholder='Select mission'
              width='300px'
              height='350px'
            />
          </div>
          <div className='student-quizzes__filter-dropdown'>
            <QuizCustomDropdown
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              options={getStatusOptions()}
              placeholder='Select status'
            />
          </div>
        </div>

        {/* Quiz List */}
        <div className='student-quizzes__list'>
          {isLoading ? (
            <div className='student-quizzes__no-results'>
              <PagePreloader color='black' textData='Loading quizzes...' />
            </div>
          ) : isError ? (
            <div className='student-quizzes__no-results'>
              <p>No quizzes found</p>
            </div>
          ) : filteredQuizzes.length > 0 ? (
            filteredQuizzes.map((quiz, index) => (
              <StudentQuizCard
                key={quiz.id}
                title={quiz.quizTitle}
                status={quiz.status}
                score={
                  quiz.status === 'completed'
                    ? quiz.score
                    : quiz.quizPassingScore
                }
                questions={quiz.questions?.length}
                duration={quiz.quizDuration}
                remainingTime={quiz.remainingTime}
                passingScore={quiz.quizPassingScore}
                progress={quiz.progress}
                onClick={() => handleQuizClick(quiz)}
                isExpired={quiz.isExpired}
                headerColor={getQuizColor(quiz, index)}
              />
            ))
          ) : (
            <div className='student-quizzes__no-results'>
              <p>No quizzes match the selected filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentQuizzes
