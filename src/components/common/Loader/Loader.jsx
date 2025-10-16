import React from 'react'
import { motion } from 'framer-motion'
import './Loader.css'

const Loader = ({ message = 'Loading...' }) => {
  return (
    <motion.div
      className='loader-container'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className='loader-spinner'
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        ⏳
      </motion.div>
      <p className='loader-message'>{message}</p>
    </motion.div>
  )
}

export default Loader
