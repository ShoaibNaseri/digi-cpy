import React from 'react'
import { motion } from 'framer-motion'
import {
  statsCardVariants,
  iconVariants,
  valueCounterVariants
} from '@/utils/animationVariants'
import './TeacherStatCard.css'

const TeacherStatCard = ({ title, icon, value }) => (
  <motion.div
    className='teacher-classroom__stat-card'
    variants={statsCardVariants}
    whileHover='hover'
  >
    {icon && (
      <motion.img
        src={icon}
        alt={title}
        className='teacher-classroom__stat-icon'
        variants={iconVariants}
      />
    )}
    <motion.h2
      className='teacher-classroom__stat-title'
      variants={valueCounterVariants}
    >
      {title}
    </motion.h2>
    <motion.p
      className='teacher-classroom__stat-value'
      variants={valueCounterVariants}
    >
      {value}
    </motion.p>
  </motion.div>
)

export default TeacherStatCard
