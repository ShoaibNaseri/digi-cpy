import React, { useState, useEffect, useRef } from 'react'
import './GradeReports.css'
import { icons } from '@/config/teacherDash/images.js'
import {
  FaArrowLeftLong,
  FaArrowRightLong,
  FaChevronDown,
  FaChevronRight,
  FaChevronLeft,
  FaStar
} from 'react-icons/fa6'
import getStudentStatus from '@/utils/getStudentStatus'
import { useAuth } from '@/context/AuthContext'
import { getTeacherClassroom } from '@/services/teacherService'
import {
  subscribeToTeacherClasses,
  convertClassArrayToObject
} from '@/services/classService'
// Import the student report services
import {
  fetchStudentQuizReports,
  fetchStudentInfos,
  calculateQuizStatistics,
  prepareExportData,
  filterQuizzes,
  getStudentName
} from '@/services/studentReportService'

import StatCard from '@/components/common/cards/StateCard'
const GradeReport = ({ onClose, classInfo }) => {
  const { currentUser } = useAuth()
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false)
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false)
  const [isMissionDropdownOpen, setIsMissionDropdownOpen] = useState(false)
  // Initialize states
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [studentsPerPage] = useState(8)
  const [selectedClass, setSelectedClass] = useState(classInfo)
  const [selectedMission, setSelectedMission] = useState('all')
  const [studentInfos, setStudentInfos] = useState({})
  const [studentQuizzes, setStudentQuizzes] = useState([])
  const [allClasses, setAllClasses] = useState({})
  const [loading, setLoading] = useState(true)

  const classDropdownRef = useRef(null)
  const missionDropdownRef = useRef(null)

  // Fetch student quiz attempts
  useEffect(() => {
    const fetchStudentQuizAttempts = async () => {
      setLoading(true)
      try {
        if (!currentUser || !selectedClass?.classId) {
          setStudentQuizzes([])
          setLoading(false)
          return
        }

        const quizzes = await fetchStudentQuizReports(
          currentUser.schoolId,
          selectedClass.classId
        )

        setStudentQuizzes(quizzes)
      } catch (e) {
        console.error('Error fetching quizzes:', e)
        setStudentQuizzes([])
      }
      setLoading(false)
    }
    fetchStudentQuizAttempts()
  }, [selectedClass, currentUser])

  // Student fetch logic
  useEffect(() => {
    const loadStudentInfos = async () => {
      if (!studentQuizzes.length) return

      const infos = await fetchStudentInfos(studentQuizzes)
      setStudentInfos(infos)
    }

    loadStudentInfos()
  }, [studentQuizzes])

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        classDropdownRef.current &&
        !classDropdownRef.current.contains(event.target)
      ) {
        setIsClassDropdownOpen(false)
      }
      if (
        missionDropdownRef.current &&
        !missionDropdownRef.current.contains(event.target)
      ) {
        setIsMissionDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Fetch class information
  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true)
      try {
        if (!currentUser) {
          throw new Error('No user is signed in')
        }

        const userId = currentUser.uid
        const classesData = await getTeacherClassroom(
          userId,
          currentUser.schoolId
        )

        // Convert array to object using the service function
        const classesDataObj = convertClassArrayToObject(classesData)
        setAllClasses(classesDataObj)

        // If no class is selected, automatically select the first one with complete data
        if (!selectedClass && Object.keys(classesDataObj).length > 0) {
          const firstClass = classesDataObj[Object.keys(classesDataObj)[0]]
          if (firstClass && firstClass.className && firstClass.grade) {
            setSelectedClass(firstClass)
          }
        }

        // Set up real-time listener using the service function
        const unsubscribe = subscribeToTeacherClasses(
          userId,
          currentUser.schoolId,
          (updatedClassesData) => {
            setAllClasses(updatedClassesData)
            if (!selectedClass && Object.keys(updatedClassesData).length > 0) {
              const firstClass =
                updatedClassesData[Object.keys(updatedClassesData)[0]]
              if (firstClass && firstClass.className && firstClass.grade) {
                setSelectedClass(firstClass)
              }
            }
          }
        )

        setLoading(false)
        return unsubscribe
      } catch (error) {
        console.error('Error fetching classes:', error)
        setLoading(false)
        return () => {}
      }
    }

    fetchClasses()
  }, [currentUser, selectedClass])

  // Course list
  const missionLists = [
    'All Missions',
    'Cyberbullying',
    'IP Addresses & Digital Footprints',
    'Online Scams & Password Protection',
    'Personal Information & Identity Theft',
    'Artificial Intelligence and Deepfakes',
    'Extortion',
    'Catfishing & Fake Profiles',
    'Grooming',
    'Online Predators',
    'Social Engineering'
  ]
  const missionList = [
    { label: 'All Missions', value: 'all' },
    { label: 'Cyberbullying', value: 'cyberbullying' },
    {
      label: 'IP Addresses & Digital Footprints',
      value: 'ip-addresses-and-digital-footprints'
    },
    {
      label: 'Online Scams & Password Protection',
      value: 'online-scams-and-password-protection'
    },
    {
      label: 'Personal Information & Identity Theft',
      value: 'personal-information-and-identity-theft'
    },
    {
      label: 'Artificial Intelligence and Deepfakes',
      value: 'artificial-intelligence-and-deepfakes'
    },
    { label: 'Extortion', value: 'extortion' },
    {
      label: 'Catfishing & Fake Profiles',
      value: 'catfishing-and-fake-profiles'
    },
    { label: 'Grooming', value: 'grooming' },
    { label: 'Online Predators', value: 'online-predators' },
    { label: 'Social Engineering', value: 'social-engineering' }
  ]

  // Filter quizzes - now using the service
  const filteredQuizzes = filterQuizzes(
    studentQuizzes,
    selectedMission,
    selectedClass?.classId,
    searchTerm,
    studentInfos
  )

  // Pagination calculations
  const indexOfLastStudent = currentPage * studentsPerPage
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage
  const paginatedStudents = filteredQuizzes.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  )
  const totalPages = Math.ceil(filteredQuizzes.length / studentsPerPage)

  // Calculate statistics - now using the service
  const stats = calculateQuizStatistics(filteredQuizzes)

  // Display student name function - now using the service
  const renderStudentName = (quiz) => {
    return getStudentName(quiz, studentInfos)
  }

  // Get mission label
  const getMissionLabel = (missionValue) => {
    const mission = missionList.find((m) => m.value === missionValue)
    return mission ? mission.label : missionValue || 'N/A'
  }

  // Export to CSV function - now using the service
  const exportToCSV = () => {
    if (filteredQuizzes.length === 0) {
      alert('No data to export')
      return
    }

    const className = selectedClass?.className || 'All Classes'
    const missionName =
      selectedMission === 'all'
        ? 'All Missions'
        : getMissionLabel(selectedMission)

    const exportData = prepareExportData(
      filteredQuizzes,
      renderStudentName,
      getMissionLabel,
      className,
      missionName
    )

    if (!exportData) {
      alert('Failed to prepare export data')
      return
    }

    // Create and trigger download
    const blob = new Blob([exportData.csvContent], {
      type: 'text/csv;charset=utf-8;'
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.setAttribute('download', exportData.fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Back button handler
  const handleBackClick = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className='gr-modal-container'>
      <div className='gr-modal-content'>
        {/* Header */}
        <div className='gr-header-section'>
          <div className='gr-header-left'>
            <button className='gr-back-button' onClick={handleBackClick}>
              <FaArrowLeftLong size={20} />
              <h1 className='gr-title'>Grade Reports</h1>
            </button>
          </div>
          <div className='gr-header-right'>
            {/* Mission selection */}
            <div className='gr-dropdown'>
              <div className='dropdown-wrapper' ref={missionDropdownRef}>
                <div
                  className='dropdown-select'
                  onClick={() =>
                    setIsMissionDropdownOpen(!isMissionDropdownOpen)
                  }
                >
                  <span>
                    {selectedMission === 'all'
                      ? 'All Missions'
                      : missionList.find((m) => m.value === selectedMission)
                          ?.label || selectedMission}
                  </span>
                  <span
                    className={`dropdown-chevron ${
                      isMissionDropdownOpen ? 'rotated' : ''
                    }`}
                  >
                    <FaChevronDown />
                  </span>
                </div>
                {isMissionDropdownOpen && (
                  <div className='dropdown-menu'>
                    {missionList.map((mission) => (
                      <div
                        key={mission.value}
                        className={`dropdown-item ${
                          selectedMission === mission.value ? 'active' : ''
                        }`}
                        onClick={() => {
                          setSelectedMission(mission.value)
                          setIsMissionDropdownOpen(false)
                        }}
                      >
                        {mission.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Class selection */}
            <div className='gr-dropdown'>
              <div className='dropdown-wrapper' ref={classDropdownRef}>
                <div
                  className='dropdown-select'
                  onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                >
                  <span>
                    {selectedClass &&
                    selectedClass.className &&
                    selectedClass.grade
                      ? `${selectedClass.className} - Grade ${selectedClass.grade}`
                      : 'Select Class'}
                  </span>
                  <span
                    className={`dropdown-chevron ${
                      isClassDropdownOpen ? 'rotated' : ''
                    }`}
                  >
                    <FaChevronDown />
                  </span>
                </div>
                {isClassDropdownOpen && (
                  <div className='dropdown-menu'>
                    {!loading &&
                      Object.values(allClasses).length > 0 &&
                      Object.values(allClasses)
                        .filter(
                          (classData) =>
                            classData && classData.className && classData.grade
                        )
                        .map((classData) => (
                          <div
                            key={classData.classId}
                            className={`dropdown-item ${
                              selectedClass?.classId === classData.classId
                                ? 'active'
                                : ''
                            }`}
                            onClick={() => {
                              setSelectedClass(classData)
                              setIsClassDropdownOpen(false)
                            }}
                          >
                            {classData.className} - Grade {classData.grade}
                          </div>
                        ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className='gr-stats-grid'>
          <StatCard
            title='Average Score'
            color={'#7B34BF'}
            gradientColor={'linear-gradient(139deg, #7B34BF 0%, #8B2DB3 100%)'}
            value={stats.averageScore}
          />
          <StatCard
            title='Highest Score'
            color={'#00C6FF'}
            gradientColor={'linear-gradient(139deg, #00C6FF 0%, #0072FF 100%)'}
            value={stats.highestScore}
          />
          <StatCard
            title='Lowest Score'
            color={'#EF0067'}
            gradientColor={'linear-gradient(139deg, #EF0067 0%, #FF3F34 100%)'}
            value={stats.lowestScore}
          />
          <StatCard
            title='Completion Rate'
            color={'#34C18D'}
            gradientColor={'linear-gradient(139deg, #34C18D 0%, #008060 100%)'}
            value={stats.completionRate}
          />
        </div>

        {/* Student results area */}
        <div className='gr-results-container'>
          <div className='gr-results-header'>
            <h2 className='gr-section-title'>Student Results</h2>
            <div className='gr-action-buttons'>
              <button className='gr-export-button' onClick={exportToCSV}>
                <span className='gr-export-icon'>↓</span> Export
              </button>
              <input
                type='text'
                placeholder='Search students...'
                className='gr-search-input'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className='gr-table-container'>
            <table className='gr-students-table'>
              <thead>
                <tr>
                  <th className='borderRight'>Student</th>
                  <th>Mission</th>
                  <th>Quiz Name</th>
                  <th className=''>Submission Date</th>
                  <th className=''>Score</th>
                  <th className='borderLeft'>Status</th>
                </tr>
              </thead>
              <br />

              <tbody className='gr-table-body'>
                {loading ? (
                  <tr>
                    <td
                      colSpan='6'
                      style={{ textAlign: 'center', padding: '2rem' }}
                    >
                      Loading student data...
                    </td>
                  </tr>
                ) : paginatedStudents.length > 0 ? (
                  paginatedStudents.map((quiz, idx) => {
                    let submissionDate = 'N/A'
                    if (quiz.completedAt) {
                      submissionDate = new Date(
                        quiz.completedAt.seconds
                          ? quiz.completedAt.seconds * 1000
                          : quiz.completedAt
                      ).toLocaleDateString()
                    }

                    const rowKey =
                      quiz.id ||
                      (quiz.studentId && quiz.quizTitle
                        ? `${quiz.studentId}-${quiz.quizTitle}`
                        : `student-quiz-${idx}`)

                    return (
                      <tr key={rowKey}>
                        <td className='borderRight'>
                          {renderStudentName(quiz)}
                        </td>
                        <td>{getMissionLabel(quiz.mission)}</td>
                        <td>{quiz.quizTitle || 'N/A'}</td>
                        <td>{submissionDate}</td>
                        <td>
                          {typeof quiz.score === 'number'
                            ? `${quiz.score}%`
                            : quiz.score || 'N/A'}
                        </td>
                        <td className='borderLeft'>
                          <span
                            className={`gr-status-text ${
                              (quiz.status || '').toLowerCase() === 'completed'
                                ? 'gr-complete'
                                : 'gr-incomplete'
                            }`}
                          >
                            <span className='gr-status-label'>
                              {getStudentStatus(quiz.status)}
                            </span>
                          </span>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td
                      colSpan='6'
                      style={{ textAlign: 'center', padding: '2rem' }}
                    >
                      No students found matching your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className='gr-pagination-container'>
              <div className='gr-pagination-info'>
                Showing{' '}
                {filteredQuizzes.length > 0 ? indexOfFirstStudent + 1 : 0}-
                {Math.min(indexOfLastStudent, filteredQuizzes.length)} of{' '}
                {filteredQuizzes.length} students
              </div>
              <div className='gr-pagination-controls'>
                <button
                  className='gr-pagination-button gr-prev'
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <FaChevronLeft size={10} />
                </button>

                {/* Page buttons */}
                {[...Array(Math.min(totalPages, 5)).keys()].map((i) => {
                  const pageNum = i + 1
                  return (
                    <button
                      key={pageNum}
                      className={`gr-pagination-button ${
                        currentPage === pageNum ? 'gr-active' : ''
                      }`}
                      onClick={() => setCurrentPage(pageNum)}
                    ></button>
                  )
                })}

                <button
                  className='gr-pagination-button gr-next'
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  <FaChevronRight size={10} />
                </button>
              </div>
            </div>
          </div>

          {/* Pagination */}
        </div>
      </div>
    </div>
  )
}

export default GradeReport
