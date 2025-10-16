import React, { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaChevronUp, FaChevronDown } from 'react-icons/fa'
import {
  buttonVariants,
  fadeInVariants,
  slideUpVariants
} from '@/utils/animationVariants'

/**
 * Reusable dropdown component for filters
 * @param {Object} props
 * @param {String} props.selectedItem - Currently selected item
 * @param {Array} props.items - List of items to display
 * @param {Function} props.onSelect - Function to call when an item is selected
 * @param {Boolean} props.isOpen - Whether the dropdown is open
 * @param {Function} props.onToggle - Function to toggle dropdown
 */
const FilterDropdown = ({
  selectedItem,
  items,
  onSelect,
  isOpen,
  onToggle
}) => {
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (isOpen) {
          onToggle(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onToggle])

  return (
    <div className='teacher-planner__dropdown-container' ref={dropdownRef}>
      <motion.button
        className='teacher-planner__all-classes-btn'
        onClick={() => onToggle(!isOpen)}
        variants={buttonVariants}
        whileHover='hover'
        whileTap='tap'
      >
        {selectedItem}
        <motion.span
          className={`teacher-planner__dropdown-icon ${
            isOpen ? 'teacher-planner__dropdown-icon--open' : ''
          }`}
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </motion.span>
      </motion.button>

      <AnimatePresence mode='wait'>
        {isOpen && (
          <motion.div
            className='teacher-planner__dropdown-menu'
            variants={slideUpVariants}
            initial='hidden'
            animate='visible'
            exit='hidden'
          >
            {items.map((item, index) => (
              <motion.div
                key={item}
                className='teacher-planner__dropdown-item'
                onClick={() => {
                  onSelect(item)
                  onToggle(false)
                }}
                variants={fadeInVariants}
                initial='hidden'
                animate='visible'
                transition={{ delay: index * 0.05 }}
                whileHover={{
                  backgroundColor: '#f3f4f6',
                  scale: 1.02,
                  x: 5
                }}
              >
                {item}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FilterDropdown
