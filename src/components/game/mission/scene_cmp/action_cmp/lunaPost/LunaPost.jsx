import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import lunaPostImg from '@/assets/game/missions/mission_2/action_imgs/digital_footprint_posts/luna_vampire.png'
import './LunaPost.css'

const LunaPost = ({ onComplete }) => {
  const [isHovered, setIsHovered] = useState(true)

  const handleClose = () => {
    onComplete()
  }

  return (
    <div className='luna-post-container'>
      <motion.div
        className='luna-post-img-container'
        initial={{ scale: 0, opacity: 0, rotateY: 180 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{
          duration: 0.8,
          ease: 'easeOut',
          type: 'spring',
          bounce: 0.4
        }}
        whileHover={{
          scale: 1.02,
          rotateZ: 1,
          transition: { duration: 0.3 }
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(true)}
      >
        <motion.img
          src={lunaPostImg}
          alt='Luna Post'
          initial={{ filter: 'blur(10px)' }}
          animate={{ filter: 'blur(0px)' }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />

        <AnimatePresence>
          {isHovered && (
            <motion.div
              className='close-icon'
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default LunaPost
