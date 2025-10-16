import { useState, useEffect, useMemo } from 'react'
import './EducatorLesson.css'
import PageHeader from '@/components/common/dashboard-header/common/PageHeader'
import useEducatorMenuItems from '@/hooks/useEducatorMenuItems'
import { getAllMissions } from '@/utils/jsnMissions'
import { useAuth } from '@/context/AuthContext'
import PDFModal from '@/components/common/PDFModal/PDFModal'
import { LuNotebookText } from 'react-icons/lu'
import {
  IoCheckmark,
  IoEllipsisHorizontal,
  IoLockClosed
} from 'react-icons/io5'
import { FaBook, FaClock, FaUsers } from 'react-icons/fa'

const EducatorLesson = () => {
  const menuItems = useEducatorMenuItems()
  const allMissions = getAllMissions()
  const { currentUser } = useAuth()
  const [accessStates, setAccessStates] = useState({})
  const [loading, setLoading] = useState(false)
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false)
  const [selectedMission, setSelectedMission] = useState(null)

  // Filter missions based on plan type - memoized to prevent recalculations
  const missionsList = useMemo(() => {
    return allMissions.filter((mission) => {
      // If user has premium plan, show all missions
      if (currentUser?.planType === 'premium') {
        return true
      }
      // For non-premium users, only show missions 1-10
      return mission.id <= 10
    })
  }, [allMissions, currentUser?.planType])

  useEffect(() => {
    // Initialize access states - by default all missions are accessible
    const initialAccessStates = {}
    missionsList.forEach((mission) => {
      initialAccessStates[mission.id] = true // Default to allowing access
    })
    setAccessStates(initialAccessStates)

    // Cleanup function to prevent memory leaks
    return () => {
      // Reset states on unmount if needed
      setLoading(false)
    }
  }, [currentUser?.planType, missionsList.length]) // Use length instead of the array itself

  const handleAccessToggle = (missionId) => {
    setAccessStates((prev) => ({
      ...prev,
      [missionId]: !prev[missionId]
    }))

    // Here you would save this to your database
    console.log(
      `Mission ${missionId} access toggled to: ${!accessStates[
        missionId
      ]} (Plan: ${currentUser?.planType || 'basic'})`
    )
  }

  // Handle opening PDF modal
  const handleLessonPlanClick = (mission) => {
    setSelectedMission(mission)
    setIsPDFModalOpen(true)
  }

  // Handle closing PDF modal
  const handleClosePDFModal = () => {
    setIsPDFModalOpen(false)
    setSelectedMission(null)
  }

  const getSchoolStats = () => {
    const totalMissions = missionsList.length
    const accessibleMissions =
      Object.values(accessStates).filter(Boolean).length
    const restrictedMissions = totalMissions - accessibleMissions

    return {
      totalMissions,
      accessibleMissions,
      restrictedMissions
    }
  }

  const stats = getSchoolStats()

  if (loading) {
    return (
      <div className='educator-lessons-loading'>
        <div className='loading-spinner'></div>
        <p>Loading lessons...</p>
      </div>
    )
  }

  return (
    <div className='educator-lesson-page'>
      <PageHeader
        title='Lesson Management'
        subtitle='Control which lessons your students can access.'
        menuItems={menuItems}
      />

      {/* Overview Section */}
      <div className='educator-lesson-page-section'>
        {/* Stats Overview */}
        <div className='educator-sdp-lesson__grid educator-sdp-lesson__grid--view'>
          <div className='educator-sdp-lesson__field'>
            <div className='educator-sdp-lesson__field-icon'>
              <FaBook />
            </div>
            <div className='educator-sdp-lesson__field-content'>
              <span className='educator-sdp-lesson__label'>Total Lessons</span>
              <div className='educator-sdp-lesson__value'>
                {missionsList.length || 'N/A'}
              </div>
            </div>
          </div>

          <div className='educator-sdp-lesson__field'>
            <div className='educator-sdp-lesson__field-icon'>
              <FaUsers />
            </div>
            <div className='educator-sdp-lesson__field-content'>
              <span className='educator-sdp-lesson__label'>
                Accessible Lessons
              </span>
              <div className='educator-sdp-lesson__value'>
                {Object.values(accessStates).filter(Boolean).length || 'N/A'}
              </div>
            </div>
          </div>

          <div className='educator-sdp-lesson__field'>
            <div className='educator-sdp-lesson__field-icon'>
              <FaClock />
            </div>
            <div className='educator-sdp-lesson__field-content'>
              <span className='educator-sdp-lesson__label'>
                Restricted Lessons
              </span>
              <div className='educator-sdp-lesson__value'>
                {missionsList.length -
                  Object.values(accessStates).filter(Boolean).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission List Section */}
      <div className='educator-lesson-page-section'>
        <div className='educator-lesson-page-section-header'>
          <h2>Lessons</h2>
          <p>
            Manage access to individual lessons
            {currentUser?.planType === 'premium'
              ? ` (${missionsList.length} lessons available - Premium Plan)`
              : ` (${missionsList.length} lessons available - Upgrade to Premium for missions 11-12)`}
          </p>
        </div>

        <div className='educator-lesson-page-content'>
          {/* Left Column - Main Content */}
          <div className='educator-lesson-page-left-column'>
            {/* Lesson List */}
            <div className='educator-lesson-page-lesson-list'>
              {missionsList.map((mission) => {
                const hasAccess = accessStates[mission.id] || false
                const isPremiumMission = mission.id > 10

                // Determine card styling based on access status
                let cardClass = 'educator-lesson-page-lesson-card'
                let statusIcon = null
                let statusText = null

                if (hasAccess) {
                  cardClass += ' accessible'
                  statusIcon = <IoCheckmark />
                  statusText = 'Accessible'
                } else {
                  cardClass += ' restricted'
                  statusIcon = <IoLockClosed />
                  statusText = 'Restricted'
                }

                return (
                  <div className={cardClass} key={mission.id}>
                    <div className='educator-lesson-page-lesson-status'>
                      <div
                        className={`educator-lesson-page-status-icon ${
                          hasAccess ? 'accessible' : 'restricted'
                        }`}
                      >
                        {statusIcon}
                      </div>
                    </div>
                    <div className='educator-lesson-page-lesson-content'>
                      <div className='educator-lesson-page-lesson-meta'>
                        <span className='educator-lesson-page-lesson-number'>
                          Mission #{mission.id} / {statusText}
                          {isPremiumMission && (
                            <span className='educator-lesson-page-premium-badge'>
                              PREMIUM
                            </span>
                          )}
                        </span>
                      </div>
                      <h3 className='educator-lesson-page-lesson-title'>
                        {mission.title}
                      </h3>
                    </div>
                    <div className='educator-lesson-page-lesson-actions'>
                      <div className='educator-lesson-page-access-toggle'>
                        <span className='educator-lesson-page-toggle-label'>
                          {hasAccess ? 'Allow Access' : 'Restrict Access'}
                        </span>
                        <label className='educator-lesson-page-toggle-switch'>
                          <input
                            type='checkbox'
                            checked={hasAccess}
                            onChange={() => handleAccessToggle(mission.id)}
                          />
                          <span className='educator-lesson-page-toggle-slider'></span>
                        </label>
                      </div>
                      <div className='educator-lesson-page-access-toggle'>
                        <button
                          className='educator-lesson-plan-button'
                          onClick={() => handleLessonPlanClick(mission)}
                        >
                          <LuNotebookText /> Lesson Plan
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className='educator-lesson-page-right-sidebar'>
            {/* Lesson Overview Card */}
            <div className='educator-lesson-page-sidebar-card educator-lesson-page-lesson-overview-card'>
              <h3>Lesson Overview</h3>
              <div className='educator-lesson-page-overview-container'>
                <div className='educator-lesson-page-overview-circle'>
                  <svg width='120' height='120' viewBox='0 0 120 120'>
                    <circle
                      cx='60'
                      cy='60'
                      r='50'
                      fill='none'
                      stroke='#e5e7eb'
                      strokeWidth='8'
                    />
                    <circle
                      cx='60'
                      cy='60'
                      r='50'
                      fill='none'
                      stroke='#D60C7B'
                      strokeWidth='8'
                      strokeDasharray='314'
                      strokeDashoffset={
                        314 -
                        (314 *
                          Object.values(accessStates).filter(Boolean).length) /
                          (missionsList.length || 1)
                      }
                      transform='rotate(-90 60 60)'
                    />
                  </svg>
                  <div className='educator-lesson-page-overview-text'>
                    {Math.round(
                      (Object.values(accessStates).filter(Boolean).length /
                        (missionsList.length || 1)) *
                        100
                    )}
                    %
                  </div>
                </div>
                <p className='educator-lesson-page-overview-summary'>
                  {Object.values(accessStates).filter(Boolean).length} of{' '}
                  {missionsList.length} Lessons Accessible
                </p>
              </div>
              <p className='educator-lesson-page-overview-description'>
                Control which lessons your students can access and complete.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Modal */}
      <PDFModal
        isOpen={isPDFModalOpen}
        onClose={handleClosePDFModal}
        pdfUrl={selectedMission ? `/${selectedMission.pdfLocation}` : ''}
        title={
          selectedMission
            ? `${selectedMission.title} - Lesson Plan`
            : 'Lesson Plan'
        }
        downloadFileName={
          selectedMission
            ? `${selectedMission.title
                .replace(/\s+/g, '_')
                .toLowerCase()}_lesson_plan.pdf`
            : 'lesson_plan.pdf'
        }
      />
    </div>
  )
}

export default EducatorLesson
