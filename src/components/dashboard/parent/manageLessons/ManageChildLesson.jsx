import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getAllMissions } from '@/utils/jsnMissions'
import './ManageChildLesson.css'
import {
  getChildProfile,
  getChildMissionProgressDetails
} from '@/services/parentService'
import { useAuth } from '@/context/AuthContext'
import Avatar from '@/components/common/avatar/Avatar'
import { FaSyncAlt } from 'react-icons/fa'
import {
  IoCheckmark,
  IoEllipsisHorizontal,
  IoLockClosed
} from 'react-icons/io5'
import { FaUserSecret } from 'react-icons/fa'
const ManageChildLesson = () => {
  const { childId } = useParams()
  const { currentUser } = useAuth()
  const missionsList = getAllMissions()
  const [childProfile, setChildProfile] = useState(null)
  const [missionProgress, setMissionProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accessStates, setAccessStates] = useState({})

  useEffect(() => {
    const fetchChildData = async () => {
      try {
        setLoading(true)
        const [profile, progress] = await Promise.all([
          getChildProfile(currentUser.uid, childId),
          getChildMissionProgressDetails(currentUser.uid, childId)
        ])
        setChildProfile(profile)
        setMissionProgress(progress)

        // Initialize access states (you can load this from a database if needed)
        const initialAccessStates = {}
        progress.missionDetails.forEach((mission) => {
          initialAccessStates[mission.missionId] =
            mission.status !== 'not_started'
        })
        setAccessStates(initialAccessStates)
      } catch (error) {
        console.error('Error fetching child data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (currentUser?.uid && childId) {
      fetchChildData()
    }
  }, [currentUser?.uid, childId])

  const handleAccessToggle = (missionId) => {
    setAccessStates((prev) => ({
      ...prev,
      [missionId]: !prev[missionId]
    }))

    // Here you would typically save this to your database
    // For now, we'll just update the local state
    console.log(
      `Mission ${missionId} access toggled to: ${!accessStates[missionId]}`
    )
  }
  console.log('avc', missionProgress)
  const getProgressPercentage = (missionId) => {
    if (!missionProgress) return 0

    const mission = missionProgress.missionDetails.find(
      (m) => m.missionId === missionId
    )
    return mission ? Math.round(mission.progress) : 0
  }

  const getMissionStatus = (missionId) => {
    if (!missionProgress) return 'not_started'

    const mission = missionProgress.missionDetails.find(
      (m) => m.missionId === missionId
    )
    return mission ? mission.status : 'not_started'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4CAF50'
      case 'in_progress':
        return '#FF9800'
      case 'not_started':
        return '#9E9E9E'
      default:
        return '#9E9E9E'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in_progress':
        return 'In Progress'
      case 'not_started':
        return 'Not Started'
      default:
        return 'Not Started'
    }
  }

  const handleSwitchChild = () => {
    // Navigate to child selection page
    window.history.back()
  }

  if (loading) {
    return (
      <div className='manage-lessons-loading'>
        <div className='loading-spinner'></div>
        <p>Loading lessons...</p>
      </div>
    )
  }

  if (!childProfile) {
    return (
      <div className='manage-lessons-error'>
        <p>Child profile not found</p>
      </div>
    )
  }

  return (
    <div className='manage-lessons-page'>
      {/* Page Header */}
      <div className='manage-lessons-header'>
        <h1>Manage Lessons</h1>
      </div>
      <div className='child-profile-section'>
        <div className='child-profile-card'>
          <div className='child-avatar'>
            <Avatar
              name={`${childProfile.firstName} ${childProfile.lastName}`}
              size={80}
            />
          </div>
          <div className='child-info'>
            <h2 className='child-name'>
              {childProfile.firstName} {childProfile.lastName}
            </h2>
            <p className='child-details'>Grade 5 • Age 11</p>
            <p className='current-mission'>
              Current Mission: IP Addresses & Digital Footprint
            </p>
          </div>
          <button className='switch-child-btn' onClick={handleSwitchChild}>
            <FaSyncAlt />
            Switch Child
          </button>
        </div>
      </div>
      <div className='manage-lessons-content'>
        {/* Left Column - Main Content */}

        <div className='manage-lessons-left-column'>
          {/* Child Profile Section */}

          {/* Lesson List */}
          <div className='lesson-list'>
            {missionsList.map((mission) => {
              const progress = getProgressPercentage(mission.id)
              const status = getMissionStatus(mission.id)
              const hasAccess = accessStates[mission.id] || false

              // Determine card styling based on status
              let cardClass = 'lesson-card'
              let statusIcon = null
              let statusText = null
              let actionButton = null

              if (status === 'completed') {
                cardClass += ' completed'
                statusIcon = <IoCheckmark />
                statusText = 'Completed'
                actionButton = (
                  <div className='lesson-score'>Score: {progress}%</div>
                )
              } else if (status === 'in_progress') {
                cardClass += ' in-progress'
                statusIcon = <IoEllipsisHorizontal />
                statusText = 'In Progress'
                actionButton = (
                  <button className='preview-lesson-btn'>Preview Lesson</button>
                )
              } else {
                cardClass += ' locked'
                statusIcon = <IoLockClosed />
                statusText = 'Not Started'
                actionButton = (
                  <button className='review-lesson-btn' disabled>
                    Review Lesson
                  </button>
                )
              }

              return (
                <div className={cardClass} key={mission.id}>
                  <div className='lesson-status'>
                    <div className={`status-icon ${status}`}>{statusIcon}</div>
                  </div>
                  <div className='lesson-content'>
                    <div className='lesson-meta'>
                      <span className='lesson-number'>
                        Mission #{mission.id} /{' '}
                        {status === 'completed'
                          ? statusText
                          : `Available ${new Date(
                              Date.now() + mission.id * 30 * 24 * 60 * 60 * 1000
                            ).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}`}
                      </span>
                    </div>
                    <h3 className='lesson-title'>{mission.title}</h3>
                  </div>
                  <div className='lesson-actions'>
                    {actionButton}
                    <div className='access-toggle'>
                      <span className='toggle-label'>
                        {hasAccess ? 'Allow Access' : 'Restrict Access'}
                      </span>
                      <label className='toggle-switch'>
                        <input
                          type='checkbox'
                          checked={hasAccess}
                          onChange={() => handleAccessToggle(mission.id)}
                          disabled={status === 'not_started'}
                        />
                        <span className='toggle-slider'></span>
                      </label>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className='manage-lessons-right-sidebar'>
          {/* Lesson Progress Card */}
          <div className='sidebar-card lesson-progress-card'>
            <h3>Lesson Progress</h3>
            <div className='progress-container'>
              <div className='progress-circle'>
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
                        (missionProgress?.summary.missionsCompleted || 0)) /
                        (missionsList.length || 0)
                    }
                    transform='rotate(-90 60 60)'
                  />
                </svg>
                <div className='progress-text'>
                  {Math.round(
                    ((missionProgress?.summary.missionsCompleted || 0) /
                      (missionsList.length || 0)) *
                      100
                  )}
                  %
                </div>
              </div>
              <p className='progress-summary'>
                {missionProgress?.summary.missionsCompleted} of{' '}
                {missionsList.length} Lessons Completed
              </p>
            </div>
            <p className='progress-description'>
              Complete the lesson to unlock the mission quiz and earn your
              badge.
            </p>
          </div>

          {/* Mission Badge Card */}
          <div className='sidebar-card mission-badge-card'>
            <h3>Mission Badge</h3>
            <div className='badge-content'>
              <div className='badge-info'>
                <h4 className='badge-name'>Secret Keeper</h4>
                <p className='badge-description'>
                  Awarded for mastering the art of digital privacy!
                </p>
              </div>
              <div className='badge-icon'>
                <div className='detective-icon'>
                  <FaUserSecret />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManageChildLesson
