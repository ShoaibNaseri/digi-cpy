import React, { useState, useEffect, useRef } from 'react'
import { FaSearch, FaTimes, FaChevronRight } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './SearchModal.css'

const SearchModal = ({ isOpen, onClose, menuItems = [] }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchInputRef = useRef(null)
  const modalRef = useRef(null)

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.15,
        ease: 'easeIn'
      }
    }
  }

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: -50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -50,
      transition: {
        duration: 0.2,
        ease: 'easeIn'
      }
    }
  }

  const inputVariants = {
    hidden: {
      opacity: 0,
      y: -10
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1,
        duration: 0.2,
        ease: 'easeOut'
      }
    }
  }

  const resultsVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  }

  const resultItemVariants = {
    hidden: {
      opacity: 0,
      x: -20
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    }
  }

  // Flatten menu items for search
  const flattenMenuItems = (items) => {
    const flattened = []

    items.forEach((section) => {
      if (section.items && Array.isArray(section.items)) {
        section.items.forEach((item) => {
          // Add main item
          flattened.push({
            ...item,
            section: section.label,
            type: 'main',
            fullPath: item.path
          })

          // Add children if they exist
          if (item.children && Array.isArray(item.children)) {
            item.children.forEach((child) => {
              flattened.push({
                ...child,
                section: section.label,
                parent: item.text,
                type: 'child',
                fullPath: child.path
              })
            })
          }
        })
      } else {
        // Handle flat structure
        flattened.push({
          ...item,
          section: 'Navigation',
          type: 'main',
          fullPath: item.path
        })
      }
    })

    return flattened
  }

  const allMenuItems = flattenMenuItems(menuItems)

  // Fallback test data if no menuItems provided
  const testMenuItems = [
    {
      text: 'Dashboard',
      path: '/dashboard/educator',
      section: 'MAIN',
      type: 'main',
      fullPath: '/dashboard/educator'
    },
    {
      text: 'School Details',
      path: '/dashboard/educator/school-details',
      section: 'MAIN',
      type: 'main',
      fullPath: '/dashboard/educator/school-details'
    },
    {
      text: 'Billing',
      path: '/dashboard/educator/billing',
      section: 'MANAGEMENT',
      type: 'main',
      fullPath: '/dashboard/educator/billing'
    }
  ]

  const itemsToSearch = allMenuItems.length > 0 ? allMenuItems : testMenuItems

  // Search function
  const searchItems = (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    const results = itemsToSearch.filter(
      (item) =>
        item.text.toLowerCase().includes(query.toLowerCase()) ||
        (item.parent &&
          item.parent.toLowerCase().includes(query.toLowerCase())) ||
        item.section.toLowerCase().includes(query.toLowerCase())
    )

    setSearchResults(results)
    setSelectedIndex(-1)
  }

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    searchItems(query)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return

    switch (e.key) {
      case 'Escape':
        onClose()
        break
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : searchResults.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          // Navigate to selected item
          window.location.href = searchResults[selectedIndex].fullPath
          onClose()
        }
        break
    }
  }

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  // Reset search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setSearchResults([])
      setSelectedIndex(-1)
    }
  }, [isOpen])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className='search-modal-overlay'
          variants={overlayVariants}
          initial='hidden'
          animate='visible'
          exit='exit'
        >
          <motion.div
            className='search-modal'
            ref={modalRef}
            variants={modalVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
          >
            <motion.div
              className='dash-search__header'
              variants={inputVariants}
              initial='hidden'
              animate='visible'
            >
              <div className='dash-search__input-container'>
                <FaSearch className='dash-search__search-icon' />
                <input
                  ref={searchInputRef}
                  type='text'
                  placeholder='Search menu items...'
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  className='dash-search__input'
                  autoComplete='off'
                />
              </div>
              <motion.button
                className='dash-search__close-button'
                onClick={onClose}
                aria-label='Close search'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaTimes />
              </motion.button>
            </motion.div>

            <div className='dash-search__content'>
              {searchQuery && searchResults.length === 0 ? (
                <motion.div
                  className='dash-search__no-results'
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p>No results found for "{searchQuery}"</p>
                </motion.div>
              ) : searchQuery && searchResults.length > 0 ? (
                <motion.div
                  className='dash-search__results'
                  variants={resultsVariants}
                  initial='hidden'
                  animate='visible'
                >
                  {searchResults.map((item, index) => (
                    <motion.div
                      key={`${item.fullPath}-${index}`}
                      variants={resultItemVariants}
                      whileHover={{
                        scale: 1.02,
                        transition: { duration: 0.1 }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to={item.fullPath}
                        className={`dash-search__result-item ${
                          index === selectedIndex ? 'selected' : ''
                        } ${item.disabled ? 'disabled' : ''}`}
                        onClick={onClose}
                      >
                        <div className='dash-search__result-content'>
                          <div className='dash-search__result-main'>
                            <span className='dash-search__result-icon'>
                              {item.icon}
                            </span>
                            <span className='dash-search__result-text'>
                              {item.text}
                            </span>
                          </div>
                          <div className='dash-search__result-meta'>
                            <span className='dash-search__result-section'>
                              {item.section}
                            </span>
                            {item.parent && (
                              <span className='dash-search__result-parent'>
                                → {item.parent}
                              </span>
                            )}
                          </div>
                        </div>
                        <FaChevronRight className='dash-search__result-arrow' />
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  className='dash-search__placeholder'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <motion.div
                    animate={{
                      rotate: [0, 5, -5, 0],
                      transition: {
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3
                      }
                    }}
                  >
                    <FaSearch className='dash-search__placeholder-icon' />
                  </motion.div>
                  <p>Start typing to search through menu items</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SearchModal
