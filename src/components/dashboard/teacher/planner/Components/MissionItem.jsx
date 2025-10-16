import React from 'react'
import { FaCalendarAlt, FaTasks } from 'react-icons/fa'
import { missionNumberMap } from '@/services/teacher/missionService'
import { GiSlashedShield } from 'react-icons/gi'
import { TbFingerprintScan } from 'react-icons/tb'
import { MdVpnKey } from 'react-icons/md'
import { MdPersonalInjury } from 'react-icons/md'
import { GiArtificialIntelligence } from 'react-icons/gi'
import { GiDoctorFace } from 'react-icons/gi'
import { FaUserSecret } from 'react-icons/fa6'
import { HiOutlineUserGroup } from 'react-icons/hi'
import { LiaUserSecretSolid } from 'react-icons/lia'
import { TbSocial } from 'react-icons/tb'
import { motion } from 'framer-motion'

/**
 * Renders a single mission item for the list view
 * @param {Object} props
 * @param {Object} props.mission - Mission data
 * @param {Function} props.onClick - Function to call when mission is clicked
 * @param {Array} props.monthNames - Array of month names
 */
const MissionItem = ({ mission, onClick, monthNames }) => {
  const missionList = [
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
  const renderIcon = (missionName) => {
    switch (missionName) {
      case 'Cyberbullying':
        return <GiSlashedShield size={20} color='#9333EA' />
      case 'IP Addresses & Digital Footprints':
        return <TbFingerprintScan size={20} color='#DB2777' />
      case 'Online Scams & Password Protection':
        return <MdVpnKey size={20} color='#2563EB' />
      case 'Personal Information & Identity Theft':
        return <MdPersonalInjury size={20} color='red' />
      case 'Artificial Intelligence and Deepfakes':
        return <GiArtificialIntelligence size={20} color='#062243' />
      case 'Extortion':
        return <GiDoctorFace size={20} color='#a50636' />
      case 'Catfishing & Fake Profiles':
        return <FaUserSecret size={20} color='#9333EA' />
      case 'Grooming':
        return <HiOutlineUserGroup size={20} color='#9333EA' />
      case 'Online Predators':
        return <LiaUserSecretSolid size={20} color='#DB2777' />
      case 'Social Engineering':
        return <TbSocial size={20} color='#9333EA' />
      default:
        return <GiArtificialIntelligence size={20} color='#9333EA' />
    }
  }
  // Get fixed mission number based on mission name
  const fixedMissionNumber = mission.missionName
    ? missionNumberMap[mission.missionName] || mission.missionNumber
    : mission.missionNumber

  // Function to get the formatted mission date for display
  const getMissionDisplayDate = (date) => {
    if (!date) return ''
    return `${
      monthNames[date.getMonth()]
    } ${date.getDate()}, ${date.getFullYear()}`
  }

  return (
    <motion.div
      className='teacher-planner__mission-item'
      onClick={() => onClick(mission)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      {/* Mission icon on the left side */}
      <motion.div
        className='teacher-planner__mission-icon'
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
      >
        {renderIcon(mission.missionName)}
      </motion.div>

      <div className='mission-content'>
        <div className='teacher-planner__mission-name'>
          Mission {fixedMissionNumber}: {mission.displayTitle}
        </div>
        <div className='teacher-planner__mission-date'>
          {getMissionDisplayDate(mission.dueDate)}
        </div>
      </div>
      <motion.button
        className='teacher-planner__mission-action-btn teacher-planner__reschedule-btn'
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation() // Prevent triggering the parent's onClick
          // Add a small delay to prevent glitching
          setTimeout(() => {
            onClick(mission)
          }, 50)
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
        style={{ position: 'relative', zIndex: 2 }}
      >
        <FaCalendarAlt
          size={24}
          className='teacher-planner__FaCalendarAlt-btn'
        />
        Reschedule
      </motion.button>
    </motion.div>
  )
}

export default MissionItem
