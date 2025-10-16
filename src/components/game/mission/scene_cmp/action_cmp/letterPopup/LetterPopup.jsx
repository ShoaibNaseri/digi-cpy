import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import letterClose from '@/assets/game/action_imgs/declan_letter_close.png'
import letterOpen from '@/assets/game/action_imgs/declan_letter_open.png'
import letterOpenSound from '@/assets/game/game_sounds/letter_open_sound.wav'
import './LetterPopup.css'

const LetterPopup = ({ onComplete }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [audio] = useState(new Audio(letterOpenSound))

  const handleLetterClick = () => {
    if (!isOpen) {
      setIsOpen(true)
      audio.play().catch((error) => console.log('Audio play failed:', error))
    } else {
      onComplete()
    }
  }

  return (
    <motion.div
      className='letter-popup-container'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence mode='wait'>
        {!isOpen ? (
          <motion.div
            key='closed'
            className='letter-popup-content'
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            onClick={handleLetterClick}
          >
            <img
              src={letterClose}
              alt='Closed Letter'
              className='letter-popup-image'
            />
          </motion.div>
        ) : (
          <motion.div
            key='open'
            className='letter-popup-content'
            initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotateY: 90 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            onClick={handleLetterClick}
          >
            <img
              src={letterOpen}
              alt='Open Letter'
              className='letter-popup-image'
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default LetterPopup
