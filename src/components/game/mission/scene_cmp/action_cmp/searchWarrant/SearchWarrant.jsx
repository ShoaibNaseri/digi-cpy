import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import searchWarrantImg from '@/assets/game/missions/mission_2/action_imgs/search_warrant/search_warrant.png'
import './SearchWarrant.css'

const SearchWarrant = ({ onComplete }) => {
  const [isHovered, setIsHovered] = useState(true)

  return (
    <div className='search-warrant-container'>
      <motion.div
        className='search-warrant-img-container'
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          ease: 'easeOut',
          type: 'spring',
          stiffness: 100
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(true)}
      >
        <motion.img
          src={searchWarrantImg}
          alt='search warrant'
          animate={{
            rotate: [0, 1, -1, 0],
            filter: ['brightness(1)', 'brightness(1.05)', 'brightness(1)']
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        <AnimatePresence>
          {isHovered && (
            <motion.div
              className='close-icon-container'
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              onClick={onComplete}
            >
              <motion.div
                className='close-icon'
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default SearchWarrant
