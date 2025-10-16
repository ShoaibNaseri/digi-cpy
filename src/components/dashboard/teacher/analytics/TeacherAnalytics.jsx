import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './TeacherAnalytics.css'
import {
  getTeacherClassroom,
  getStudentQuizzes,
  getIncidentReports
} from '@/services/teacherService'
import { useAuth } from '@/context/AuthContext'
import { FaChevronDown, FaExclamationTriangle } from 'react-icons/fa'
import IncidentModal from './IncidentModal'
import StateCard from '@/components/common/cards/StateCard'
import { TbDeviceDesktopOff } from 'react-icons/tb'
import {
  containerVariants,
  itemVariants,
  headerTextVariants,
  subtitleVariants,
  buttonVariants,
  sectionTitleVariants,
  loadingVariants,
  emptyStateVariants,
  staggeredGridVariants,
  overlayVariants,
  fadeInVariants,
  slideUpVariants,
  scaleVariants,
  cardVariants,
  dropdownVariants
} from '@/utils/animationVariants'
import { getAllMissions } from '@/utils/jsnMissions'

const missionList = getAllMissions()

const TeacherAnalytics = () => {
  const { currentUser } = useAuth()
  const [selectedClass, setSelectedClass] = useState('All Classes')
  const [selectedTime, setSelectedTime] = useState('All Time')
  const [classrooms, setClassrooms] = useState([])
  const [missionData, setMissionData] = useState([])
  const [incidentData, setIncidentData] = useState([])
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [classDropdownOpen, setClassDropdownOpen] = useState(false)
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false)

  const classDropdownRef = useRef(null)
  const timeDropdownRef = useRef(null)

  // Helper function to get the display text for selected class
  const getSelectedClassDisplay = () => {
    if (selectedClass === 'All Classes') return 'All Classes'
    const selectedClassroom = classrooms.find(
      (c) => c.classId === selectedClass
    )
    return selectedClassroom ? selectedClassroom.className : 'Unknown Class'
  }

  const closeModal = () => {
    setSelectedIncident(null)
  }

  const openIncidentModal = (incident) => {
    setSelectedIncident(incident)
  }

  const getSelectedClassName = () => {
    if (selectedClass === 'All Classes') return 'All Classes'
    const selectedClassroom = classrooms.find(
      (c) => c.classId === selectedClass
    )
    return selectedClassroom ? selectedClassroom.className : 'Unknown Class'
  }

  useEffect(() => {
    const fetchClassrooms = async () => {
      if (currentUser?.schoolId) {
        const teacherClassrooms = await getTeacherClassroom(
          currentUser.uid,
          currentUser.schoolId
        )
        setClassrooms(teacherClassrooms)
      }
    }
    fetchClassrooms()
  }, [currentUser])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        classDropdownRef.current &&
        !classDropdownRef.current.contains(event.target)
      ) {
        setClassDropdownOpen(false)
      }
      if (
        timeDropdownRef.current &&
        !timeDropdownRef.current.contains(event.target)
      ) {
        setTimeDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const fetchMissionData = async () => {
      if (currentUser?.schoolId) {
        const classIds =
          selectedClass === 'All Classes'
            ? classrooms.map((c) => c.classId)
            : selectedClass

        const quizzes = await getStudentQuizzes(currentUser.schoolId, classIds)

        const now = new Date()
        const filteredQuizzes = quizzes.filter((quiz) => {
          const quizDate = new Date(quiz.createdAt)
          switch (selectedTime) {
            case 'Last Week':
              const oneWeekAgo = new Date(
                now.getTime() - 7 * 24 * 60 * 60 * 1000
              )
              return quizDate >= oneWeekAgo
            case 'Last Month':
              const oneMonthAgo = new Date(
                now.getTime() - 30 * 24 * 60 * 60 * 1000
              )
              return quizDate >= oneMonthAgo
            case 'Last Quarter':
              const threeMonthsAgo = new Date(
                now.getTime() - 90 * 24 * 60 * 60 * 1000
              )
              return quizDate >= threeMonthsAgo
            default:
              return true
          }
        })

        const missionStats = missionList.map((mission) => {
          const missionQuizzes = filteredQuizzes.filter(
            (q) => q.missionTitle === mission.title
          )
          const totalStudents = missionQuizzes.length
          const completedQuizzes = missionQuizzes.filter(
            (q) => q.status === 'completed'
          ).length

          const completionRate =
            totalStudents > 0
              ? Math.round((completedQuizzes / totalStudents) * 100)
              : 0

          return {
            ...mission,
            completionRate,
            totalStudents,
            completedQuizzes
          }
        })

        setMissionData(missionStats)
      }
    }

    fetchMissionData()
  }, [currentUser, selectedClass, classrooms, selectedTime])

  useEffect(() => {
    const fetchIncidentData = async () => {
      if (currentUser?.schoolId) {
        const classIds =
          selectedClass === 'All Classes'
            ? classrooms.map((c) => c.classId)
            : selectedClass

        const reports = await getIncidentReports(currentUser.schoolId, classIds)

        const now = new Date()
        const filteredReports = reports.filter((report) => {
          const reportDate = new Date(report.dateReported)
          switch (selectedTime) {
            case 'Last Week':
              const oneWeekAgo = new Date(
                now.getTime() - 7 * 24 * 60 * 60 * 1000
              )
              return reportDate >= oneWeekAgo
            case 'Last Month':
              const oneMonthAgo = new Date(
                now.getTime() - 30 * 24 * 60 * 60 * 1000
              )
              return reportDate >= oneMonthAgo
            case 'Last Quarter':
              const threeMonthsAgo = new Date(
                now.getTime() - 90 * 24 * 60 * 60 * 1000
              )
              return reportDate >= threeMonthAgo
            default:
              return true
          }
        })

        const parsedReports = filteredReports
          .map((report) => {
            try {
              const parsedData = JSON.parse(report.incidentReport)
              return {
                id: report.reportId,
                ...parsedData,
                rawReport: report
              }
            } catch (error) {
              console.error('Error parsing report:', error)
              return null
            }
          })
          .filter(Boolean)

        setIncidentData(parsedReports)
      }
    }

    fetchIncidentData()
  }, [currentUser, selectedClass, classrooms, selectedTime])

  return (
    <motion.div
      className='teacher-analytics-dashboard'
      variants={containerVariants}
      initial='hidden'
      animate='visible'
    >
      <motion.div
        className='teacher-analytics-dashboard-header'
        variants={itemVariants}
      >
        <motion.header
          className='teacher-analytics-header'
          variants={itemVariants}
        >
          <motion.h1
            className='teacher-analytics-title'
            variants={headerTextVariants}
          >
            Analytics
          </motion.h1>
          <motion.p
            className='teacher-analytics-subtitle'
            variants={subtitleVariants}
          >
            Track learning performance and incident reports
          </motion.p>
        </motion.header>

        <motion.div
          className='teacher-analytics-filters'
          variants={staggeredGridVariants}
          initial='hidden'
          animate='visible'
        >
          <motion.div
            className='teacher-analytics-filter-wrapper'
            ref={classDropdownRef}
            variants={itemVariants}
          >
            <motion.div
              className='teacher-analytics-filter-select'
              onClick={() => setClassDropdownOpen(!classDropdownOpen)}
              variants={buttonVariants}
              whileHover='hover'
              whileTap='tap'
            >
              <span>{getSelectedClassDisplay()}</span>
              <motion.span
                className='teacher-analytics-filter-chevron'
                animate={{ rotate: classDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <FaChevronDown />
              </motion.span>
            </motion.div>

            <AnimatePresence mode='wait'>
              {classDropdownOpen && (
                <motion.div
                  className='teacher-analytics-dropdown-menu'
                  variants={dropdownVariants}
                  initial='hidden'
                  animate='visible'
                  exit='hidden'
                >
                  <motion.div
                    className={`teacher-analytics-dropdown-item ${
                      selectedClass === 'All Classes' ? 'active' : ''
                    }`}
                    onClick={() => {
                      setSelectedClass('All Classes')
                      setClassDropdownOpen(false)
                    }}
                    variants={itemVariants}
                    whileHover={{ backgroundColor: '#f3f4f6', x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    All Classes
                  </motion.div>
                  {classrooms.map((classroom, index) => (
                    <motion.div
                      key={classroom.classId}
                      className={`teacher-analytics-dropdown-item ${
                        selectedClass === classroom.classId ? 'active' : ''
                      }`}
                      onClick={() => {
                        setSelectedClass(classroom.classId)
                        setClassDropdownOpen(false)
                      }}
                      variants={itemVariants}
                      initial='hidden'
                      animate='visible'
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ backgroundColor: '#f3f4f6', x: 5 }}
                    >
                      {classroom.className}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            className='teacher-analytics-filter-wrapper'
            ref={timeDropdownRef}
            variants={itemVariants}
          >
            <motion.div
              className='teacher-analytics-filter-select'
              onClick={() => setTimeDropdownOpen(!timeDropdownOpen)}
              variants={buttonVariants}
              whileHover='hover'
              whileTap='tap'
            >
              <span>{selectedTime}</span>
              <motion.span
                className='teacher-analytics-filter-chevron'
                animate={{ rotate: timeDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <FaChevronDown />
              </motion.span>
            </motion.div>

            <AnimatePresence mode='wait'>
              {timeDropdownOpen && (
                <motion.div
                  className='teacher-analytics-dropdown-menu'
                  variants={dropdownVariants}
                  initial='hidden'
                  animate='visible'
                  exit='hidden'
                >
                  <motion.div
                    className={`teacher-analytics-dropdown-item ${
                      selectedTime === 'All Time' ? 'active' : ''
                    }`}
                    onClick={() => {
                      setSelectedTime('All Time')
                      setTimeDropdownOpen(false)
                    }}
                    variants={itemVariants}
                    whileHover={{ backgroundColor: '#f3f4f6', x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    All Time
                  </motion.div>
                  <motion.div
                    className={`teacher-analytics-dropdown-item ${
                      selectedTime === 'Last Week' ? 'active' : ''
                    }`}
                    onClick={() => {
                      setSelectedTime('Last Week')
                      setTimeDropdownOpen(false)
                    }}
                    variants={itemVariants}
                    whileHover={{ backgroundColor: '#f3f4f6', x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    Last Week
                  </motion.div>
                  <motion.div
                    className={`teacher-analytics-dropdown-item ${
                      selectedTime === 'Last Month' ? 'active' : ''
                    }`}
                    onClick={() => {
                      setSelectedTime('Last Month')
                      setTimeDropdownOpen(false)
                    }}
                    variants={itemVariants}
                    whileHover={{ backgroundColor: '#f3f4f6', x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    Last Month
                  </motion.div>
                  <motion.div
                    className={`teacher-analytics-dropdown-item ${
                      selectedTime === 'Last Quarter' ? 'active' : ''
                    }`}
                    onClick={() => {
                      setSelectedTime('Last Quarter')
                      setTimeDropdownOpen(false)
                    }}
                    variants={itemVariants}
                    whileHover={{ backgroundColor: '#f3f4f6', x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    Last Quarter
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.section
        className='teacher-analytics-performance-section'
        variants={itemVariants}
      >
        <motion.div
          className='teacher-analytics-lesson-grid'
          variants={staggeredGridVariants}
          initial='hidden'
          animate='visible'
        >
          {missionData.map((mission, index) => (
            <motion.div
              key={mission.id}
              variants={cardVariants}
              initial='hidden'
              animate='visible'
              transition={{ delay: index * 0.1 }}
              whileHover='hover'
            >
              <StateCard
                title={mission.title}
                value={mission.completionRate}
                hasContent={true}
                color={'#D60C7B'}
                gradientColor={
                  'linear-gradient(139deg, #D60C7B 0%, #8B2DB3 100%)'
                }
                animateCountdown={mission.completionRate > 0}
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        className='teacher-analytics-incidents-section'
        variants={itemVariants}
      >
        <motion.h2
          className='teacher-analytics-section-title'
          variants={sectionTitleVariants}
        >
          Optional Assessments for {getSelectedClassName()}
        </motion.h2>

        <AnimatePresence mode='wait'>
          {incidentData.length > 0 ? (
            <motion.div
              className='teacher-analytics-lesson-grid'
              variants={staggeredGridVariants}
              initial='hidden'
              animate='visible'
            >
              {incidentData.map((incident, index) => (
                <motion.div
                  key={incident.id}
                  className='teacher-analytics-lesson-card'
                  variants={cardVariants}
                  initial='hidden'
                  animate='visible'
                  transition={{ delay: index * 0.1 }}
                  whileHover='hover'
                >
                  <p>{incident.anonymousSummary}</p>
                  <motion.button
                    className='teacher-analytics-view-btn'
                    onClick={() => openIncidentModal(incident)}
                    variants={buttonVariants}
                    whileHover='hover'
                    whileTap='tap'
                  >
                    View Details
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className='teacher-analytics-no-incidents'
              variants={emptyStateVariants}
              initial='hidden'
              animate='visible'
            >
              <motion.div
                className='teacher-analytics-no-data-icon'
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <TbDeviceDesktopOff size={45} />
              </motion.div>
              <p className='teacher-analytics-no-data-text'>
                No incident reports to display
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode='wait'>
          {selectedIncident && (
            <motion.div
              variants={overlayVariants}
              initial='hidden'
              animate='visible'
              exit='exit'
            >
              <IncidentModal incident={selectedIncident} onClose={closeModal} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </motion.div>
  )
}

export default TeacherAnalytics
