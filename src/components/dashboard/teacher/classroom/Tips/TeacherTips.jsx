import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import '../TeacherClassroom.css'
import lampOnIcon from '@/assets/icons/lamp-on.svg'
import clockIcon from '@/assets/icons/clock.svg'
import {
  tipsVariants,
  tipItemVariants,
  sectionTitleVariants
} from '@/utils/animationVariants'

/**
 * Teacher Tip Item Component
 * Displays a teacher tip with an icon and text
 */
const TeacherTipItem = ({ icon, text }) => (
  <motion.div
    className='teacher-classroom__tip-item'
    variants={tipItemVariants}
    whileHover='hover'
  >
    <motion.img
      src={icon}
      alt='Tip icon'
      className='teacher-classroom__tip-icon'
      whileHover={{ scale: 1.1 }}
      transition={{ duration: 0.2 }}
    />
    <p className='teacher-classroom__tip-text'>{text}</p>
  </motion.div>
)

/**
 * Teacher Tips Container Component
 * Displays a section with all teacher tips
 */
const TeacherTips = ({ tips, icons, onHideTips }) => {
  const [showTips, setShowTips] = useState(true)
  const [isVisible, setIsVisible] = useState(true)

  // Check local storage on component mount
  useEffect(() => {
    const dontShowAgain = localStorage.getItem('teacher-tips-dont-show')
    if (dontShowAgain === 'true') {
      setShowTips(false)
      setIsVisible(false)
    }
  }, [])

  // If tips are provided as props, use them, otherwise use default tips
  const tipsList = tips || [
    {
      id: 1,
      icon: lampOnIcon,
      text: 'After students complete missions, you might consider reviewing their submissions collectively'
    },
    {
      id: 2,
      icon: clockIcon,
      text: 'Recommended mission exploration time: 30-45 minutes per session'
    }
  ]

  const handleDontShowAgain = () => {
    localStorage.setItem('teacher-tips-dont-show', 'true')
    setShowTips(false)
    setIsVisible(false)
    if (onHideTips) {
      onHideTips()
    }
  }

  const handleOk = () => {
    setShowTips(false)
    setIsVisible(false)
    if (onHideTips) {
      onHideTips()
    }
  }

  // Don't render if user chose not to show tips
  if (!isVisible) {
    return null
  }

  return (
    <motion.div
      className='teacher-classroom__tips'
      variants={tipsVariants}
      initial='hidden'
      animate='visible'
      exit='hidden'
    >
      <motion.h2
        className='teacher-classroom__section-title'
        variants={sectionTitleVariants}
      >
        Teacher Tips
      </motion.h2>
      <motion.div
        className='teacher-classroom__tips-list'
        variants={tipsVariants}
      >
        {tipsList.map((tip) => (
          <TeacherTipItem key={tip.id} icon={tip.icon} text={tip.text} />
        ))}
      </motion.div>

      {/* Action buttons */}
      <motion.div
        className='teacher-classroom__tips-actions'
        variants={tipsVariants}
      >
        <button className='teacher-classroom__tips-ok-btn' onClick={handleOk}>
          OK
        </button>
        <button
          className='teacher-classroom__tips-dont-show-btn'
          onClick={handleDontShowAgain}
        >
          Don't show again
        </button>
      </motion.div>
    </motion.div>
  )
}

export default TeacherTips
