import React from 'react'
import { motion } from 'framer-motion'
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5'
import { FaCalendarAlt } from 'react-icons/fa'
import {
  buttonVariants,
  fadeInVariants,
  itemVariants
} from '@/utils/animationVariants'

const CalendarControls = ({
  scheduleView,
  onViewChange,
  onPrevious,
  onNext,
  headerText
}) => {
  return (
    <motion.div
      className='teacher-planner__calendar-controls'
      variants={fadeInVariants}
      initial='hidden'
      animate='visible'
    >
      {/* Month Navigation - LEFT SIDE */}
      <motion.div
        className='teacher-planner__month-navigation'
        variants={itemVariants}
      >
        <div className='teacher-planner__chevron-counter'>
          <motion.button
            className='teacher-planner__nav-btn'
            onClick={onPrevious}
            variants={buttonVariants}
            whileHover='hover'
            whileTap='tap'
          >
            <motion.div whileHover={{ x: -2 }} transition={{ duration: 0.2 }}>
              <IoChevronBackOutline size={20} />
            </motion.div>
          </motion.button>
          <motion.div
            className='teacher-planner__month-display'
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h2>{headerText}</h2>
          </motion.div>
          <motion.button
            className='teacher-planner__nav-btn'
            onClick={onNext}
            variants={buttonVariants}
            whileHover='hover'
            whileTap='tap'
          >
            <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
              <IoChevronForwardOutline size={20} />
            </motion.div>
          </motion.button>
        </div>
      </motion.div>

      {/* Schedule Buttons - RIGHT SIDE */}
      <motion.div
        className='teacher-planner__scheduling-options'
        variants={itemVariants}
      >
        <div className='teacher-planner__scheduling-buttons'>
          <motion.button
            className={`teacher-planner__schedule-btn ${
              scheduleView === 'weekly'
                ? 'teacher-planner__schedule-btn--active'
                : ''
            }`}
            onClick={() => onViewChange('weekly')}
            variants={buttonVariants}
            whileHover='hover'
            whileTap='tap'
            animate={{
              scale: scheduleView === 'weekly' ? 1.05 : 1,
              backgroundColor: scheduleView === 'weekly' ? '' : '',
              color: scheduleView === 'weekly' ? '' : ''
            }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <motion.div transition={{ duration: 0.2 }}>
              <FaCalendarAlt size={20} />
            </motion.div>
            Weekly Schedule
          </motion.button>
          <motion.button
            className={`teacher-planner__schedule-btn ${
              scheduleView === 'biweekly'
                ? 'teacher-planner__schedule-btn--active'
                : ''
            }`}
            onClick={() => onViewChange('biweekly')}
            variants={buttonVariants}
            whileHover='hover'
            whileTap='tap'
            animate={{
              scale: scheduleView === 'biweekly' ? 1.05 : 1,
              backgroundColor: scheduleView === 'biweekly' ? '' : '',
              color: scheduleView === 'biweekly' ? '' : ''
            }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <motion.div transition={{ duration: 0.2 }}>
              <FaCalendarAlt size={20} />
            </motion.div>
            Bi-Weekly Schedule
          </motion.button>
          <motion.button
            className={`teacher-planner__schedule-btn ${
              scheduleView === 'monthly'
                ? 'teacher-planner__schedule-btn--active'
                : ''
            }`}
            onClick={() => onViewChange('monthly')}
            variants={buttonVariants}
            whileHover='hover'
            whileTap='tap'
            animate={{
              scale: scheduleView === 'monthly' ? 1.05 : 1,
              backgroundColor: scheduleView === 'monthly' ? '' : '',
              color: scheduleView === 'monthly' ? '' : ''
            }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <motion.div transition={{ duration: 0.2 }}>
              <FaCalendarAlt size={20} />
            </motion.div>
            Monthly Schedule
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default CalendarControls
