import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './TeacherPlanner.css'

// React Query hooks
import {
  useMissionsAndClasses,
  useDeleteMission,
  useUpdateMission
} from '@/hooks/useMissionQueries'

// Components
import FilterDropdown from './Components/FilterDropdown'
import ViewToggle from './ViewToggle'
import CalendarControls from './Components/CalendarControl'
import MissionListView from './Components/MissionListView'
import EditMissionModal from './Modals/EditMissionModal'
import MissionTipsPopup from './Components/MissionTipsPopup'
import MissionTag from './Components/MissionTag'

// Calendar views
import WeeklyView from './Components/WeeklyView'
import BiWeeklyView from './Components/BiWeeklyView'
import MonthlyView from './Components/MonthlyView'

// Utils
import { generateCalendarData } from '@/utils/calendarUtils'
import { useAuth } from '@/context/AuthContext'
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
  cardVariants
} from '@/utils/animationVariants'
import PagePreloader from '../../../common/preloaders/PagePreloader'
import { useNavigate } from 'react-router-dom'

// Mission Details Modal Component (wrapper)
const MissionDetailsModal = ({
  isOpen,
  onClose,
  mission,
  onSave,
  onDelete,
  teacherClasses
}) => {
  return (
    <EditMissionModal
      isOpen={isOpen}
      onClose={onClose}
      mission={mission}
      onSave={onSave}
      onDelete={onDelete}
      teacherClasses={teacherClasses}
    />
  )
}

const TeacherMissionPlanner = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  // State for date and navigation
  const [currentDate, setCurrentDate] = useState(new Date())

  // State for dropdowns
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false)
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState('All Grades')
  const [selectedMenu, setSelectedMenu] = useState('All Missions')

  // View states
  const [scheduleView, setScheduleView] = useState('monthly')
  const [displayView, setDisplayView] = useState('calendar')

  // Mission data states
  const [deletingMissions, setDeletingMissions] = useState([])
  const [showMissionDetails, setShowMissionDetails] = useState(false)
  const [selectedMission, setSelectedMission] = useState(null)
  const [missionColors, setMissionColors] = useState({}) // Add this line

  // React Query hooks
  const {
    data: missionsData,
    isLoading: loading,
    error: missionsError
  } = useMissionsAndClasses(
    currentUser?.uid,
    currentUser?.schoolId,
    selectedClass,
    selectedMenu,
    !!currentUser?.uid && !!currentUser?.schoolId
  )

  const deleteMissionMutation = useDeleteMission()
  const updateMissionMutation = useUpdateMission()

  // Extract data from React Query
  const assignedMissions = missionsData?.assignedMissions || []
  const missionsByClass = missionsData?.missionsByClass || {}
  const teacherClasses = missionsData?.teacherClasses || []

  // Tips popup state
  const [showTipsPopup, setShowTipsPopup] = useState(() => {
    // Check localStorage on initial load
    const hideTips = localStorage.getItem('hideMissionTips')
    return hideTips !== 'true'
  })

  // Get current year and month
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  const colors = ['#D7FD44']

  // Month names for formatting
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  // Format month title
  const formattedMonth = `${monthNames[currentMonth]} ${currentYear}`

  // Lists for dropdowns
  const classList = [
    'All Grades',
    'Grade 1',
    'Grade 2',
    'Grade 3',
    'Grade 4',
    'Grade 5',
    'Grade 6'
  ]

  const menuList = [
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

  // Function that temporarily hides the popup
  const handleCloseTipsPopup = () => {
    setShowTipsPopup(false)
  }

  // Hide tips forever and save setting to localStorage
  const handleHideTipsForever = () => {
    setShowTipsPopup(false)
    localStorage.setItem('hideMissionTips', 'true')
  }

  const handleMoreHelp = () => {
    navigate('/dashboard/teacher/help')
  }

  // Error handling for missions
  if (missionsError) {
    console.error('Error fetching missions:', missionsError)
  }

  // Delete a mission
  const handleDeleteMission = async (missionId, e) => {
    // Stop event propagation to prevent opening modal when delete is clicked
    if (e) {
      e.stopPropagation()
    }

    // Confirm deletion
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this mission?'
    )

    if (confirmDelete) {
      try {
        // Add mission ID to deleting state to show loading indicator
        setDeletingMissions((prev) => [...prev, missionId])

        if (!currentUser) {
          throw new Error('No user is signed in')
        }

        await deleteMissionMutation.mutateAsync({
          missionId,
          userId: currentUser.uid
        })

        // Close the modal after deleting
        closeMissionDetails()
      } catch (error) {
        console.error('Error deleting mission:', error)
      } finally {
        // Remove mission ID from deleting state
        setDeletingMissions((prev) => prev.filter((id) => id !== missionId))
      }
    }
  }

  // Save edited mission
  const handleSaveMission = async (updatedMission) => {
    try {
      await updateMissionMutation.mutateAsync(updatedMission)

      // Close the modal after saving
      closeMissionDetails()
    } catch (error) {
      console.error('Error updating mission:', error)
    }
  }

  // Note: Data fetching is now handled by React Query hooks
  // The useMissionsAndClasses hook will automatically refetch when selectedClass, selectedMenu, or currentUser changes

  // Check if mission should be displayed based on selected filters
  const shouldShowMission = (mission) => {
    if (!mission) return false

    // Filter by grade/class
    let passesGradeFilter = true
    if (selectedClass !== 'All Grades') {
      // Extract grade number from the selected class (e.g., "Grade 4" -> 4)
      const selectedGradeNum = selectedClass.replace('Grade ', '')
      // Only show missions for the selected grade
      passesGradeFilter = mission.grade === selectedGradeNum
    }

    // Filter by mission type/topic
    let passesMissionFilter = true
    if (selectedMenu !== 'All Missions') {
      // Only show missions with the selected topic
      passesMissionFilter = mission.missionName === selectedMenu
    }

    // Mission passes filter if it passes both the grade filter and mission filter
    return passesGradeFilter && passesMissionFilter
  }

  // Open mission details modal
  const openMissionDetails = (mission) => {
    setSelectedMission(mission)
    setShowMissionDetails(true)
  }

  // Close mission details modal
  const closeMissionDetails = () => {
    setShowMissionDetails(false)
    setSelectedMission(null)
  }

  // Get calendar data
  const calendarData = generateCalendarData(
    assignedMissions,
    currentYear,
    currentMonth
  )

  const weekdays = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ]

  // Navigate to previous month/week
  const navigatePrevious = () => {
    if (scheduleView === 'weekly') {
      // Go back one week
      const newDate = new Date(currentDate)
      newDate.setDate(currentDate.getDate() - 7)
      setCurrentDate(newDate)
    } else if (scheduleView === 'biweekly') {
      // Go back two weeks
      const newDate = new Date(currentDate)
      newDate.setDate(currentDate.getDate() - 14)
      setCurrentDate(newDate)
    } else {
      // Go back one month (monthly view)
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
    }
  }

  // Navigate to next month/week
  const navigateNext = () => {
    if (scheduleView === 'weekly') {
      // Go forward one week
      const newDate = new Date(currentDate)
      newDate.setDate(currentDate.getDate() + 7)
      setCurrentDate(newDate)
    } else if (scheduleView === 'biweekly') {
      // Go forward two weeks
      const newDate = new Date(currentDate)
      newDate.setDate(currentDate.getDate() + 14)
      setCurrentDate(newDate)
    } else {
      // Go forward one month (monthly view)
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
    }
  }

  // Toggle dropdown handlers
  const toggleClassDropdown = () => {
    setIsClassDropdownOpen(!isClassDropdownOpen)
    // Close the other dropdown if open
    if (isMenuDropdownOpen) setIsMenuDropdownOpen(false)
  }

  const toggleMenuDropdown = () => {
    setIsMenuDropdownOpen(!isMenuDropdownOpen)
    // Close the other dropdown if open
    if (isClassDropdownOpen) setIsClassDropdownOpen(false)
  }

  // Generate weekly calendar data (for current week)
  const generateWeeklyCalendarData = () => {
    // Start of the week (Sunday)
    const startDate = new Date(currentDate)
    const currentDayOfWeek = currentDate.getDay() // 0 = Sunday, 1 = Monday, etc.
    startDate.setDate(currentDate.getDate() - currentDayOfWeek)

    const weekData = []

    // Generate 7 days of data
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startDate)
      currentDay.setDate(startDate.getDate() + i)

      // Find missions assigned to this date
      const dayMissions = assignedMissions.filter((mission) => {
        const missionDate = new Date(mission.dueDate)
        return (
          missionDate.getDate() === currentDay.getDate() &&
          missionDate.getMonth() === currentDay.getMonth() &&
          missionDate.getFullYear() === currentDay.getFullYear()
        )
      })

      weekData.push({
        date: currentDay,
        day: currentDay.getDate(),
        month: currentDay.getMonth(),
        year: currentDay.getFullYear(),
        missions: dayMissions
      })
    }

    return weekData
  }

  // Generate bi-weekly calendar data
  const generateBiWeeklyCalendarData = () => {
    // Start of the week (Sunday)
    const startDate = new Date(currentDate)
    const currentDayOfWeek = currentDate.getDay() // 0 = Sunday, 1 = Monday, etc.
    startDate.setDate(currentDate.getDate() - currentDayOfWeek)

    const biWeekData = []

    // Generate 14 days of data (2 weeks)
    for (let i = 0; i < 14; i++) {
      const currentDay = new Date(startDate)
      currentDay.setDate(startDate.getDate() + i)

      // Find missions assigned to this date
      const dayMissions = assignedMissions.filter((mission) => {
        const missionDate = new Date(mission.dueDate)
        return (
          missionDate.getDate() === currentDay.getDate() &&
          missionDate.getMonth() === currentDay.getMonth() &&
          missionDate.getFullYear() === currentDay.getFullYear()
        )
      })

      biWeekData.push({
        date: currentDay,
        day: currentDay.getDate(),
        month: currentDay.getMonth(),
        year: currentDay.getFullYear(),
        missions: dayMissions
      })
    }

    return biWeekData
  }

  // Format date for week/biweekly view header
  const formatDateRange = () => {
    if (scheduleView === 'weekly') {
      const weekData = generateWeeklyCalendarData()
      const startDay = weekData[0]
      const endDay = weekData[6]
      return `${monthNames[startDay.month]} ${startDay.day} - ${
        monthNames[endDay.month]
      } ${endDay.day}, ${endDay.year}`
    } else if (scheduleView === 'biweekly') {
      const biWeekData = generateBiWeeklyCalendarData()
      const startDay = biWeekData[0]
      const endDay = biWeekData[13]
      return `${monthNames[startDay.month]} ${startDay.day} - ${
        monthNames[endDay.month]
      } ${endDay.day}, ${endDay.year}`
    }
    return formattedMonth
  }

  // Helper function to get a consistent color for each mission
  const getMissionColor = (missionId) => {
    // If mission already has a color assigned, return it
    if (missionColors[missionId]) {
      return missionColors[missionId]
    }

    // If no color assigned, get a random one and store it
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    setMissionColors((prev) => ({
      ...prev,
      [missionId]: randomColor
    }))
    return randomColor
  }

  // Render mission tags for a day's missions
  const renderMissionTags = (missions, dayNumber) => {
    // Filter missions to only show those that match current filters
    const filteredMissions = missions.filter((mission) =>
      shouldShowMission(mission)
    )

    // Render mission tags
    return filteredMissions.map((mission, index) => (
      <MissionTag
        key={`${mission.id}-${index}`}
        mission={mission}
        onClick={openMissionDetails}
        dayNumber={dayNumber}
        bgColor={getMissionColor(mission.id)}
      />
    ))
  }

  // Render the appropriate view based on scheduleView state
  const renderCalendarView = () => {
    switch (scheduleView) {
      case 'weekly':
        return (
          <WeeklyView
            weekData={generateWeeklyCalendarData()}
            weekdays={weekdays}
            renderMissionTags={renderMissionTags}
          />
        )
      case 'biweekly':
        return (
          <BiWeeklyView
            biWeekData={generateBiWeeklyCalendarData()}
            weekdays={weekdays}
            renderMissionTags={renderMissionTags}
          />
        )
      case 'monthly':
      default:
        return (
          <MonthlyView
            calendarData={calendarData}
            weekdays={weekdays}
            renderMissionTags={renderMissionTags}
          />
        )
    }
  }

  return (
    <motion.div
      className='teacher-planner__container'
      variants={containerVariants}
      initial='hidden'
      animate='visible'
    >
      <div className='teacher-planner__content'>
        <motion.div
          className='teacher-planner__header-container'
          variants={itemVariants}
        >
          <div className='teacher-planner__header-title'>
            <motion.h1
              variants={headerTextVariants}
              initial='hidden'
              animate='visible'
            >
              <span className='teacher-planner__gradient-text'>
                Mission Planner
              </span>
            </motion.h1>
            <motion.p
              variants={subtitleVariants}
              initial='hidden'
              animate='visible'
            >
              Schedule and manage your classroom missions
            </motion.p>
          </div>
          <motion.div
            className='teacher-planner__header-buttons'
            variants={staggeredGridVariants}
            initial='hidden'
            animate='visible'
          >
            {/* Mission Type Dropdown */}
            <motion.div variants={itemVariants}>
              <FilterDropdown
                selectedItem={selectedMenu}
                items={menuList}
                onSelect={(item) => setSelectedMenu(item)}
                isOpen={isMenuDropdownOpen}
                onToggle={() => toggleMenuDropdown()}
              />
            </motion.div>

            {/* Grade Dropdown */}
            <motion.div variants={itemVariants}>
              <FilterDropdown
                selectedItem={selectedClass}
                items={classList}
                onSelect={(item) => setSelectedClass(item)}
                isOpen={isClassDropdownOpen}
                onToggle={() => toggleClassDropdown()}
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* View Toggle */}
        <motion.div variants={itemVariants}>
          <ViewToggle
            displayView={displayView}
            onViewChange={(view) => setDisplayView(view)}
          />
        </motion.div>

        {/* Calendar View */}
        <AnimatePresence mode='wait'>
          {displayView === 'calendar' && (
            <motion.div
              className='teacher-planner__calendar-container'
              variants={fadeInVariants}
              initial='hidden'
              animate='visible'
              exit='hidden'
              style={{ position: 'relative', zIndex: 1 }}
            >
              <motion.div variants={itemVariants}>
                <CalendarControls
                  scheduleView={scheduleView}
                  onViewChange={(view) => setScheduleView(view)}
                  onPrevious={navigatePrevious}
                  onNext={navigateNext}
                  headerText={formatDateRange()}
                />
              </motion.div>

              {/* Show loading spinner when fetching missions */}
              {loading ? (
                <motion.div
                  className='teacher-planner__missions-loading'
                  variants={loadingVariants}
                  initial='hidden'
                  animate='visible'
                >
                  <PagePreloader
                    color='black'
                    textData='Getting Lessons Scheduled...'
                  />
                </motion.div>
              ) : missionsError ? (
                <motion.div
                  className='teacher-planner__error'
                  variants={fadeInVariants}
                  initial='hidden'
                  animate='visible'
                >
                  <div>
                    <strong>Error loading missions:</strong>{' '}
                    {missionsError.message || 'Something went wrong'}
                  </div>
                  <button
                    className='teacher-planner__retry-button'
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </button>
                </motion.div>
              ) : (
                /* Dynamic Calendar Grid based on selected view */
                <motion.div
                  variants={slideUpVariants}
                  initial='hidden'
                  animate='visible'
                >
                  {renderCalendarView()}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* List View */}
        <AnimatePresence mode='wait'>
          {displayView === 'list' && (
            <motion.div
              variants={fadeInVariants}
              initial='hidden'
              animate='visible'
              exit='hidden'
              style={{ position: 'relative', zIndex: 1 }}
            >
              <MissionListView
                missionsByClass={missionsByClass}
                onMissionClick={openMissionDetails}
                loading={loading}
                error={missionsError}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mission Details Modal with Edit Functionality */}
      <AnimatePresence mode='wait'>
        {showMissionDetails && (
          <motion.div
            className='modal-overlay'
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)'
            }}
            variants={overlayVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
          >
            <MissionDetailsModal
              isOpen={showMissionDetails}
              onClose={closeMissionDetails}
              mission={selectedMission}
              onSave={handleSaveMission}
              onDelete={handleDeleteMission}
              teacherClasses={teacherClasses}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mission Tips Popup - Bottom right corner */}
      <AnimatePresence mode='wait'>
        {showTipsPopup && (
          <motion.div
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              zIndex: 999
            }}
            variants={scaleVariants}
            initial='hidden'
            animate='visible'
            exit='hidden'
          >
            <MissionTipsPopup
              show={showTipsPopup}
              onClose={handleCloseTipsPopup}
              onHideForever={handleHideTipsForever}
              handleMoreHelp={handleMoreHelp}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default TeacherMissionPlanner
