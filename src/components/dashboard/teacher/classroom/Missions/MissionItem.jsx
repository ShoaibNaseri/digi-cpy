// MissionItem.jsx
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import '../TeacherClassroom.css'
import { useAuth } from '@/context/AuthContext'
import { getTeacherMissions } from '@/services/missionService'
import storyIcon from '@/assets/icons/story.svg'
import {
  missionItemVariants,
  buttonVariants,
  scheduleVariants
} from '@/utils/animationVariants'

/**
 * Mission Container and Item Component
 * Integrated component for handling mission data fetching and display
 *
 * Usage:
 * <MissionItem.Container />
 */

// Individual mission item display component
const MissionItemView = ({
  mission,
  formatMissionTime,
  getMissionDuration
}) => (
  <motion.div
    className='teacher-classroom__schedule-item'
    variants={missionItemVariants}
    whileHover='hover'
  >
    {/* Mission Icon Container */}
    <motion.div
      className='teacher-classroom__schedule-icon-container'
      whileHover={{ scale: 1.1 }}
      transition={{ duration: 0.2 }}
    >
      <img
        src={storyIcon}
        alt='Story'
        className='teacher-classroom__schedule-icon'
      />
    </motion.div>

    {/* Mission Content */}
    <div className='teacher-classroom__schedule-content'>
      <div className='teacher-classroom__schedule-topic'>
        {mission.missionName}
      </div>
      <div className='teacher-classroom__schedule-subject'>
        Science - Grade {mission.grade}
      </div>
    </div>

    {/* Start Mission Button */}
    <motion.button
      className='teacher-classroom__schedule-start-button'
      variants={buttonVariants}
      whileHover='hover'
      whileTap='tap'
    >
      Start Mission
      <span className='teacher-classroom__schedule-arrow'>→</span>
    </motion.button>
  </motion.div>
)

// Define PropTypes for type checking
MissionItemView.propTypes = {
  mission: PropTypes.shape({
    id: PropTypes.string,
    missionName: PropTypes.string.isRequired,
    grade: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    dueDate: PropTypes.instanceOf(Date).isRequired,
    duration: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired,
  formatMissionTime: PropTypes.func.isRequired,
  getMissionDuration: PropTypes.func.isRequired
}

/**
 * Container component - handles mission data fetching and state management
 */
const MissionContainer = () => {
  const { currentUser } = useAuth()
  const [todayMissions, setTodayMissions] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch today's missions data
  useEffect(() => {
    const fetchTodayMissions = async () => {
      setLoading(true)

      try {
        if (!currentUser) {
          throw new Error('No user is signed in')
        }

        const missionsSnapshot = await getTeacherMissions(
          currentUser.uid,
          currentUser.schoolId
        )

        // Filter for today's missions
        const today = new Date()
        const missions = []

        missionsSnapshot.forEach((mission) => {
          if (mission.dueDate) {
            const missionDate = mission.dueDate.toDate() // Convert Firestore timestamp to JS Date

            // Only add missions that are due today
            if (
              missionDate.getDate() === today.getDate() &&
              missionDate.getMonth() === today.getMonth() &&
              missionDate.getFullYear() === today.getFullYear()
            ) {
              missions.push({
                id: mission.id,
                missionName: mission.missionName,
                grade: mission.grade,
                dueDate: mission.dueDate,
                duration: mission.duration
              })
            }
          }
        })

        setTodayMissions(missions)
      } catch (error) {
        console.error("Error fetching today's missions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTodayMissions()
  }, [currentUser])

  // Helper functions for formatting
  const formatMissionTime = (date) => {
    if (!date) return 'No due date'
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getMissionDuration = (duration) => {
    if (!duration) return 'Duration not specified'
    return `${duration} minutes`
  }

  // Render loading state
  if (loading) {
    return (
      <motion.div
        className='teacher-classroom__schedule-loading'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        Loading today's missions...
      </motion.div>
    )
  }

  // Render empty state
  if (todayMissions.length === 0) {
    return (
      <motion.div
        className='teacher-classroom__schedule--empty'
        variants={scheduleVariants}
        initial='hidden'
        animate='visible'
      >
        <p>No missions scheduled for today.</p>
      </motion.div>
    )
  }

  // Render missions
  return (
    <motion.div
      className='teacher-classroom__schedule-container'
      variants={scheduleVariants}
      initial='hidden'
      animate='visible'
    >
      {todayMissions.map((mission) => (
        <MissionItemView
          key={mission.id}
          mission={mission}
          formatMissionTime={formatMissionTime}
          getMissionDuration={getMissionDuration}
        />
      ))}
    </motion.div>
  )
}

// Export both the container and individual view
export default {
  Container: MissionContainer,
  View: MissionItemView
}
