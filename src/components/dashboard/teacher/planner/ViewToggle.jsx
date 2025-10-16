import React from 'react'
import { motion } from 'framer-motion'
import { BsListUl } from 'react-icons/bs'
import { FaCalendarAlt } from 'react-icons/fa'
import { buttonVariants, fadeInVariants } from '@/utils/animationVariants'

/**
 * Toggle between list and calendar views
 * @param {Object} props
 * @param {String} props.displayView - Current view (list or calendar)
 * @param {Function} props.onViewChange - Function to handle view change
 */
const ViewToggle = ({ displayView, onViewChange }) => {
  return (
    <motion.div
      className='teacher-planner__view-toggle-options'
      variants={fadeInVariants}
      initial='hidden'
      animate='visible'
    >
      <div className='teacher-planner__view-toggle-buttons'>
        <motion.button
          className={`teacher-planner__view-toggle-btn ${
            displayView === 'list'
              ? 'teacher-planner__view-toggle-btn--active'
              : ''
          }`}
          onClick={() => onViewChange('list')}
          variants={buttonVariants}
          whileHover='hover'
          whileTap='tap'
          animate={{
            scale: displayView === 'list' ? 1.05 : 1,
            backgroundColor: displayView === 'list' ? '' : '',
            color: displayView === 'list' ? '' : ''
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <motion.div transition={{ duration: 0.2 }}>
            <BsListUl size={24} />
          </motion.div>
          List View
        </motion.button>
        <motion.button
          className={`teacher-planner__view-toggle-btn ${
            displayView === 'calendar'
              ? 'teacher-planner__view-toggle-btn--active'
              : ''
          }`}
          onClick={() => onViewChange('calendar')}
          variants={buttonVariants}
          whileHover='hover'
          whileTap='tap'
          animate={{
            scale: displayView === 'calendar' ? 1.05 : 1,
            backgroundColor: displayView === 'calendar' ? '' : '',
            color: displayView === 'calendar' ? '' : ''
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <motion.div transition={{ duration: 0.2 }}>
            <FaCalendarAlt size={24} />
          </motion.div>
          Calendar View
        </motion.button>
      </div>
    </motion.div>
  )
}

export default ViewToggle
