import { FaStar } from 'react-icons/fa6'
import { useState, useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import './StateCard.css'
import { MdShowChart } from 'react-icons/md'

const StateCard = ({
  title,
  color,
  gradientColor,
  value,
  hasContent = false,
  animateCountdown = false
}) => {
  const [finalColor, setFinalColor] = useState('')
  const [finalIconColor, setFinalIconColor] = useState('')
  const [displayValue, setDisplayValue] = useState(0)

  // Motion values for countdown animation
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))

  useEffect(() => {
    if (value > 0) {
      setFinalColor(color)
      setFinalIconColor(gradientColor)
    } else {
      setFinalColor('#4B5563')
      setFinalIconColor(
        'linear-gradient(139deg,rgb(169, 163, 169) 0%,rgb(147, 139, 150) 100%)'
      )
    }
  }, [value, color, gradientColor])

  // Countdown animation effect
  useEffect(() => {
    if (animateCountdown && value > 0) {
      const controls = animate(count, value, {
        duration: 1.5,
        ease: 'easeOut',
        onUpdate: (latest) => {
          setDisplayValue(Math.round(latest))
        }
      })

      return controls.stop
    } else {
      setDisplayValue(value)
    }
  }, [animateCountdown, value, count])

  return (
    <motion.div
      className='gr-stat-card'
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{
        y: -5,
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      <motion.div
        className='gr-state-top-bar'
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <motion.div
          style={{ background: finalIconColor }}
          className='gr-stat-icon'
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          whileHover={{
            scale: 1.1,
            rotate: 5,
            transition: { duration: 0.2 }
          }}
        >
          <MdShowChart color='white' size={35} />
        </motion.div>
        {hasContent && (
          <motion.div
            className='gr-stat-content'
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <p style={{ color: finalColor }}> Completion Rate</p>
          </motion.div>
        )}
      </motion.div>
      <motion.div
        className='gr-stat-data'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <motion.div
          className='gr-stat-title'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          {title}
        </motion.div>
        <motion.p
          style={{ color: finalColor }}
          className='gr-stat-value'
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          {displayValue}%
        </motion.p>
      </motion.div>
    </motion.div>
  )
}

export default StateCard
