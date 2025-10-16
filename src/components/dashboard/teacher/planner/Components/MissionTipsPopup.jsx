import React from 'react'
import { motion } from 'framer-motion'
import { VscDebugBreakpointUnsupported } from 'react-icons/vsc'
import {
  buttonVariants,
  fadeInVariants,
  slideUpVariants
} from '@/utils/animationVariants'

const MissionTipsPopup = ({ show, onClose, onHideForever, handleMoreHelp }) => {
  if (!show) return null

  return (
    <motion.div
      className='teacher-planner__tips-popup'
      variants={slideUpVariants}
      initial='hidden'
      animate='visible'
      exit='hidden'
    >
      <motion.div
        className='teacher-planner__tips-popup-header'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h3>Mission Editing Tips</h3>
        <motion.button
          className='teacher-planner__tips-popup-close'
          onClick={onClose}
          variants={buttonVariants}
          whileHover='hover'
          whileTap='tap'
        >
          ×
        </motion.button>
      </motion.div>

      <motion.div
        className='teacher-planner__tips-popup-content'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <ul className='teacher-planner__tips-list'>
          {/* <li>
              <VscDebugBreakpointUnsupported size={21}/>
              Click on any day to add a new mission
            </li> */}
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <VscDebugBreakpointUnsupported size={21} />
            </motion.div>
            Click on any existing mission to view or edit details
          </motion.li>
          {/* <li>
              <VscDebugBreakpointUnsupported size={21}/>
              Drag and drop missions to reschedule them
            </li> */}
        </ul>
      </motion.div>

      <motion.div
        className='teacher-planner__tips-popup-footer'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <motion.button
          className='teacher-planner__tips-btn teacher-planner__dont-show-btn'
          onClick={onHideForever}
          variants={buttonVariants}
          whileHover='hover'
          whileTap='tap'
        >
          Don't show again
        </motion.button>
        <motion.button
          className='teacher-planner__tips-btn teacher-planner__more-help-btn'
          onClick={() => {
            handleMoreHelp()
          }}
          variants={buttonVariants}
          whileHover='hover'
          whileTap='tap'
        >
          More help
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

export default MissionTipsPopup
