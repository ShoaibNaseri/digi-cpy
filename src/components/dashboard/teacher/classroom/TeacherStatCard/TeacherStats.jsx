// TeacherStats.jsx (new file)
import React from 'react'
import { motion } from 'framer-motion'
import TeacherStatCard from './TeacherStatCard'
import profileIcon from '@/assets/icons/profile.svg'
import bulidingIcon from '@/assets/icons/buliding.svg'
import tasksquare from '@/assets/icons/task-square.svg'
import starIcon from '@/assets/icons/star.svg'
import { staggeredGridVariants } from '@/utils/animationVariants'

const TeacherStats = ({ stats, icons }) => {
  return (
    <motion.div
      className='teacher-classroom__stats'
      variants={staggeredGridVariants}
      initial='hidden'
      animate='visible'
    >
      <TeacherStatCard
        title='Active Students'
        icon={profileIcon}
        value={stats.totalStudents}
      />
      <TeacherStatCard
        title='Active Classes'
        icon={bulidingIcon}
        value={stats.totalClasses}
      />
      <TeacherStatCard
        title='Quizzes'
        icon={tasksquare}
        value={stats.quizCount}
      />
      <TeacherStatCard
        title='Average Score'
        icon={starIcon}
        value={`${stats.averageScore}`}
      />
    </motion.div>
  )
}

export default TeacherStats
