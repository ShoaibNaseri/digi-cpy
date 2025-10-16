import { useState, useEffect, useRef, useMemo } from 'react'
import './TeacherQuizzes.css'
import QuizzReport from './QuizzReport'
import ViewQuizModal from './ViewQuizModal'
import {
  FaEdit,
  FaList,
  FaChevronDown,
  FaChevronUp,
  FaEye
} from 'react-icons/fa'
import { useAuth } from '@/context/AuthContext'
import getMissionTitleBySlug from '@/utils/getMissionTitleBySlug'
import PagePreloader from '@/components/common/preloaders/PagePreloader'
import {
  useTeacherClassrooms,
  useStudentQuizzes,
  useQuiz
} from '@/hooks/useTeacherQueries'
// Custom Dropdown Component for Teacher Quizzes page
const QuizCustomDropdown = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value)
  const dropdownRef = useRef(null)

  useEffect(() => {
    setSelectedValue(value)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  const handleOptionClick = (optionValue) => {
    setSelectedValue(optionValue)
    onChange(optionValue)
    setIsOpen(false)
  }

  const selectedOption = options.find((option) =>
    typeof option === 'string'
      ? option === selectedValue
      : option.value === selectedValue
  )

  const displayValue =
    typeof selectedOption === 'string'
      ? selectedOption
      : selectedOption?.label || selectedValue

  return (
    <div className='custom-dropdown' ref={dropdownRef}>
      <div
        className={`custom-dropdown-header ${isOpen ? 'open' : ''} ${
          disabled ? 'disabled' : ''
        }`}
        onClick={handleToggle}
      >
        <span className='custom-dropdown-value'>
          {displayValue || placeholder}
        </span>
        <span className='custom-dropdown-arrow'>
          {isOpen ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
        </span>
      </div>

      {isOpen && (
        <div className='custom-dropdown-menu'>
          {options.map((option, index) => {
            const optionValue =
              typeof option === 'string' ? option : option.value
            const optionLabel =
              typeof option === 'string' ? option : option.label
            const isSelected = optionValue === selectedValue

            return (
              <div
                key={index}
                className={`custom-dropdown-option ${
                  isSelected ? 'selected' : ''
                }`}
                onClick={() => handleOptionClick(optionValue)}
              >
                {optionLabel}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const TeacherQuizzes = () => {
  const { currentUser } = useAuth()
  // State for filters
  const [gradeFilter, setGradeFilter] = useState('All Classes')
  const [statusFilter, setStatusFilter] = useState('All Status')

  // State for view management
  const [currentView, setCurrentView] = useState('quizzes')
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [selectedGrade, setSelectedGrade] = useState(null)
  const [selectedStudents, setSelectedStudents] = useState([])
  const [viewQuizData, setViewQuizData] = useState(null)

  // React Query hooks
  const {
    data: teacherClassrooms = [],
    isLoading: classroomsLoading,
    error: classroomsError
  } = useTeacherClassrooms(
    currentUser?.uid,
    currentUser?.schoolId,
    !!currentUser?.uid && !!currentUser?.schoolId
  )

  // Get classroom IDs for student quizzes query
  const classroomIds = useMemo(() => {
    return teacherClassrooms
      .map((classroom) => classroom.classId)
      .filter(Boolean)
  }, [teacherClassrooms])

  const {
    data: studentQuizzes = [],
    isLoading: studentQuizzesLoading,
    error: studentQuizzesError
  } = useStudentQuizzes(
    currentUser?.schoolId,
    classroomIds,
    !!currentUser?.schoolId && classroomIds.length > 0
  )

  // Quiz query for viewing specific quiz
  const {
    data: quizData,
    isLoading: quizLoading,
    refetch: refetchQuiz
  } = useQuiz(viewQuizData?.id, !!viewQuizData?.id)

  // Derived state from React Query data
  const loading = classroomsLoading || studentQuizzesLoading
  const error = classroomsError || studentQuizzesError

  // Create class names mapping
  const classNames = useMemo(() => {
    const classNamesMap = {}
    teacherClassrooms.forEach((classroom) => {
      const classId = classroom.classId
      if (classId) {
        classNamesMap[classId] =
          classroom.className || classroom.title || 'Unnamed Class'
      }
    })
    return classNamesMap
  }, [teacherClassrooms])

  // Extract available classes for dropdown
  const availableClasses = useMemo(() => {
    return teacherClassrooms
      .map((classroom) => ({
        id: classroom.classId,
        name: classroom.className || classroom.title || 'Unnamed Class'
      }))
      .filter((classroom) => classroom.id)
  }, [teacherClassrooms])

  // Collect all quiz class IDs
  const quizClassIds = useMemo(() => {
    const allQuizClassIds = new Set()
    studentQuizzes.forEach((quiz) => {
      if (quiz && quiz.classId) {
        allQuizClassIds.add(quiz.classId)
      }
    })
    return Array.from(allQuizClassIds)
  }, [studentQuizzes])

  // Transform quizzes data function
  const transformQuizzesData = (studentQuizzes) => {
    const quizMap = new Map()

    studentQuizzes.forEach((quiz) => {
      // Skip invalid quizzes
      if (!quiz) return

      const missionKey = quiz.mission || quiz.quizTitle
      const classKey = quiz.classId

      if (!quizMap.has(missionKey)) {
        quizMap.set(missionKey, {
          id: missionKey,
          title: quiz.quizTitle,
          passingScore: quiz.quizPassingScore,
          questions: quiz.questions ? quiz.questions.length : 0,
          minutes: quiz.quizDuration ? parseInt(quiz.quizDuration) : 0,
          originalQuizId: quiz.originalQuizId,
          grades: {}
        })
      }
      const quizData = quizMap.get(missionKey)
      if (!quizData.grades[classKey]) {
        quizData.grades[classKey] = {
          title: quiz.quizTitle,
          completed: 0,
          total: 0,
          status: 'In Progress',
          scores: [],
          passingScore: quiz.quizPassingScore
        }
      }
      quizData.grades[classKey].total += 1
      if ((quiz.status || '').toLowerCase() === 'completed') {
        quizData.grades[classKey].completed += 1
        // Add score if available (assuming score is stored in quiz.score or similar)
        if (quiz.score !== undefined) {
          quizData.grades[classKey].scores.push(quiz.score)
        }
      }
    })

    quizMap.forEach((quizData) => {
      Object.entries(quizData.grades).forEach(([classKey, gradeData]) => {
        gradeData.students = `${gradeData.completed}/${gradeData.total}`
        gradeData.status =
          gradeData.completed === gradeData.total && gradeData.total > 0
            ? 'Completed'
            : 'In Progress'

        // Calculate average score
        if (gradeData.scores.length > 0) {
          const totalScore = gradeData.scores.reduce(
            (sum, score) => sum + score,
            0
          )
          gradeData.averageScore = Math.round(
            totalScore / gradeData.scores.length
          )
        } else {
          gradeData.averageScore = 0
        }
      })
    })

    return Array.from(quizMap.values())
  }

  // Transform quizzes data
  const quizzes = useMemo(() => {
    return transformQuizzesData(studentQuizzes)
  }, [studentQuizzes])

  // Update viewQuizData when quizData changes
  useEffect(() => {
    if (quizData && viewQuizData?.id) {
      setViewQuizData(quizData)
    }
  }, [quizData, viewQuizData?.id])

  // Function to handle view results click
  const handleViewResults = (quiz, grade) => {
    const students = studentQuizzes.filter(
      (q) =>
        (q.mission || q.quizTitle) === quiz.id &&
        String(q.classId) === String(grade)
    )
    setSelectedQuiz(quiz)
    setSelectedGrade(grade)
    setSelectedStudents(students)
    setCurrentView('reports')
  }

  // Function to handle back to quizzes
  const handleBackToQuizzes = () => {
    setCurrentView('quizzes')
  }

  // Check if two IDs are similar (handling 0 and O confusion)
  const isSimilarId = (id1, id2) => {
    if (!id1 || !id2) return false
    // Convert both IDs to strings and ignore case
    const str1 = String(id1).toLowerCase()
    const str2 = String(id2).toLowerCase()

    // Direct comparison
    if (str1 === str2) return true

    // Replace '0' with 'o' and compare
    const norm1 = str1.replace(/0/g, 'o')
    const norm2 = str2.replace(/0/g, 'o')

    return norm1 === norm2
  }

  // Filter function to apply both grade and status filters
  const filterQuizzes = () => {
    if (loading) return []

    // Get effective grade filter
    let effectiveGradeFilter = gradeFilter

    // Start with all quizzes
    let filteredQuizzes = [...quizzes]

    // Grade filter
    if (effectiveGradeFilter !== 'All Classes') {
      filteredQuizzes = filteredQuizzes.filter((quiz) => {
        // Check for direct match
        const directMatch = quiz.grades[effectiveGradeFilter] !== undefined

        if (directMatch) return true

        // Check for similar ID match
        const similarMatch = Object.keys(quiz.grades).some((gradeId) =>
          isSimilarId(gradeId, effectiveGradeFilter)
        )

        return similarMatch
      })
    }

    // Status filter
    if (statusFilter !== 'All Status') {
      filteredQuizzes = filteredQuizzes.filter((quiz) => {
        if (effectiveGradeFilter !== 'All Classes') {
          // Check direct match
          if (quiz.grades[effectiveGradeFilter]?.status === statusFilter) {
            return true
          }

          // Check similar ID match
          return Object.entries(quiz.grades).some(([gradeId, gradeData]) => {
            return (
              isSimilarId(gradeId, effectiveGradeFilter) &&
              gradeData.status === statusFilter
            )
          })
        } else {
          return Object.values(quiz.grades).some(
            (grade) => grade.status === statusFilter
          )
        }
      })
    }

    return filteredQuizzes
  }

  // Get filtered quizzes
  const filteredQuizzes = filterQuizzes()

  // Function to determine if a grade card should be displayed
  const shouldShowGradeCard = (quiz, classId) => {
    // Ensure quiz.grades[classId] exists
    if (!quiz.grades[classId]) return false

    // If specific class selected, check if matches current class ID
    if (gradeFilter !== 'All Classes') {
      // Check if the current classId matches or is similar to the filter
      if (gradeFilter !== classId && !isSimilarId(gradeFilter, classId)) {
        return false
      }
    }

    // If status filter selected
    if (
      statusFilter !== 'All Status' &&
      quiz.grades[classId].status !== statusFilter
    ) {
      return false
    }

    return true
  }

  const displayCards = useMemo(() => {
    const cards = []
    filteredQuizzes.forEach((quiz) => {
      Object.entries(quiz.grades).forEach(([classId, gradeData]) => {
        if (shouldShowGradeCard(quiz, classId)) {
          cards.push({
            quizId: quiz.id,
            quizTitle: quiz.title,
            quizQuestions: quiz.questions,
            quizMinutes: quiz.minutes,
            originalQuizId: quiz.originalQuizId,
            classId: classId,
            gradeData: gradeData
          })
        }
      })
    })
    return cards
  }, [
    filteredQuizzes,
    gradeFilter,
    statusFilter,
    isSimilarId,
    shouldShowGradeCard
  ]) // Added dependencies

  // Render appropriate view based on state
  if (currentView === 'reports' && selectedQuiz && selectedGrade) {
    return (
      <QuizzReport
        quiz={selectedQuiz}
        grade={selectedGrade}
        students={selectedStudents}
        onBack={handleBackToQuizzes}
      />
    )
  }

  const handleViewQuiz = (quiz) => {
    if (!quiz.originalQuizId) {
      return
    }

    // Set the quiz ID to trigger the React Query
    setViewQuizData({ id: quiz.originalQuizId })
  }
  // if (loading) {
  //   return <PagePreloader color='black' textData='Loading quizzes...' />
  // }

  // Render quiz management view
  return (
    <div className='teacher-quizzes__container'>
      {viewQuizData && (
        <ViewQuizModal
          quiz={quizData || viewQuizData}
          onClose={() => setViewQuizData(null)}
        />
      )}
      <div className='teacher-quizzes__content-wrapper'>
        {/* Header */}
        <header className='teacher-quizzes__header'>
          <div className='teacher-quizzes__header-content'>
            <h1 className='teacher-quizzes__title'>Quizzes</h1>
            <p className='teacher-quizzes__subtitle'>
              Manage and track student quiz progress
            </p>
          </div>
        </header>

        {/* Filter Dropdowns */}
        <div className='teacher-quizzes__filter-container'>
          <div className='teacher-quizzes__filter-dropdown'>
            <QuizCustomDropdown
              value={gradeFilter}
              onChange={(value) => setGradeFilter(value)}
              options={[
                'All Classes',
                ...availableClasses.map((classroom) => ({
                  value: classroom.id,
                  label: classroom.name
                }))
              ]}
              placeholder='Select class'
            />
          </div>
          <div className='teacher-quizzes__filter-dropdown'>
            <QuizCustomDropdown
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              options={['All Status', 'Completed', 'In Progress']}
              placeholder='Select status'
            />
          </div>
        </div>

        {/* Quiz List */}
        <div className='teacher-quizzes__list'>
          {error ? (
            <div className='teacher-quizzes__error'>
              <p>Error loading quizzes. Please try again.</p>
            </div>
          ) : loading ? (
            <div className='teacher-quizzes__loading'>
              <PagePreloader color='black' textData='Loading quizzes...' />
            </div>
          ) : displayCards.length > 0 ? (
            displayCards.map((card) => (
              <div
                key={`${card.quizId}-${card.classId}`}
                className='teacher-quizzes__grade-card'
              >
                {/* Header Section */}
                <div className='teacher-quizzes__card-header-wrapper'>
                  <div className='teacher-quizzes__card-title-section'>
                    <h2 className='teacher-quizzes__card-title'>
                      {card.quizTitle}
                    </h2>
                    <p className='teacher-quizzes__card-meta'>
                      {card.quizQuestions} questions • {card.quizMinutes}{' '}
                      minutes
                    </p>
                  </div>
                </div>

                {/* Status and Metrics Section */}
                <div className='teacher-quizzes__metrics-section'>
                  <div className='teacher-quizzes__metric-row'>
                    <span className='teacher-quizzes__metric-label'>
                      Status:
                    </span>
                    <div
                      className={`teacher-quizzes__status-badge ${
                        card.gradeData.status === 'Completed'
                          ? 'completed'
                          : 'in-progress'
                      }`}
                    >
                      {card.gradeData.status}
                    </div>
                  </div>
                  <div className='teacher-quizzes__metric-row'>
                    <span className='teacher-quizzes__metric-label'>
                      Students Completed:
                    </span>
                    <span className='teacher-quizzes__metric-value'>
                      {Math.round(
                        (card.gradeData.completed / card.gradeData.total) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className='teacher-quizzes__metric-row'>
                    <span className='teacher-quizzes__metric-label'>
                      Passing Score:
                    </span>
                    <span className='teacher-quizzes__metric-value'>
                      {card.gradeData.passingScore}%
                    </span>
                  </div>
                  <div className='teacher-quizzes__metric-row'>
                    <span className='teacher-quizzes__metric-label'>
                      Average Score:
                    </span>
                    <span className='teacher-quizzes__metric-value'>
                      {card.gradeData.averageScore || 0}%
                    </span>
                  </div>
                </div>

                {/* Action Buttons Section */}
                <div className='teacher-quizzes__action-buttons'>
                  <button
                    className='teacher-quizzes__edit-button'
                    onClick={() =>
                      handleViewQuiz({ originalQuizId: card.originalQuizId })
                    }
                  >
                    <FaEye className='teacher-quizzes__button-icon' />
                    View Quiz
                  </button>
                  <button
                    className='teacher-quizzes__view-results-button'
                    onClick={() =>
                      handleViewResults({ id: card.quizId }, card.classId)
                    }
                  >
                    <FaList className='teacher-quizzes__button-icon' />
                    View Class Results
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className='teacher-quizzes__no-results'>
              <p>No quizzes match the selected filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TeacherQuizzes
