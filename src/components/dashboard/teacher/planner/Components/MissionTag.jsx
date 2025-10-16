import React from 'react'
import { motion } from 'framer-motion'
import { missionNumberMap } from '@/services/teacher/missionService'
import { cardVariants, buttonVariants } from '@/utils/animationVariants'

/**
 * Helper function to determine if a color is dark or light
 * @param {string} hexColor - Hex color string (e.g., '#FF5733')
 * @returns {boolean} - True if color is dark, false if light
 */
const isColorDark = (hexColor) => {
  // Convert hex to RGB
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  // Calculate luminance using the relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Return true if dark (luminance < 0.5)
  return luminance < 0.5
}

/**
 * Renders a mission tag for the calendar view
 * @param {Object} props
 * @param {Object} props.mission - Mission data
 * @param {Function} props.onClick - Function to call when mission tag is clicked
 * @param {number} props.dayNumber - Day number to display in top-left corner (no longer used)
 * @param {string} props.bgColor - Background color for the mission tag
 */
const MissionTag = ({ mission, onClick, dayNumber, bgColor }) => {
  // Get fixed mission number based on mission name
  const fixedMissionNumber = mission.missionNumber
    ? missionNumberMap[mission.missionName]
    : mission.missionNumber

  console.log('fixedMissionNumber', fixedMissionNumber, mission.missionName)

  // Determine text color based on background color
  const textColor = isColorDark(bgColor) ? '#FFFFFF' : '#000000'

  return (
    <motion.div
      className='teacher-planner__mission-tag'
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        // Add a small delay to prevent glitching
        setTimeout(() => {
          onClick(mission)
        }, 50)
      }}
      variants={cardVariants}
      whileHover='hover'
      whileTap={{ scale: 0.95 }}
      initial='hidden'
      animate='visible'
      transition={{ duration: 0.3 }}
      style={{
        position: 'relative',
        zIndex: 2,
        backgroundColor: bgColor,
        color: textColor
      }}
    >
      <motion.div
        className='teacher-planner__day-number'
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <span>{dayNumber}</span>
        <span className='teacher-planner__class-name'>{mission.className}</span>
      </motion.div>
      {/* Move mission number to the value position (center-left) and remove top-right info */}
      <div className='teacher-planner__mission-info'>
        <motion.div
          className='mission-code'
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          Mission {fixedMissionNumber}
        </motion.div>

        {/* Mission title - bottom left */}
        <motion.div
          className='mission-title'
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {mission.displayTitle || mission.missionName || 'Cyberbullying'}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default MissionTag
