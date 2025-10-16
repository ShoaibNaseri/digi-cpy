import React, { useState, useRef, useEffect } from 'react'
import { IoChevronDownOutline } from 'react-icons/io5'
import './CustomDropdown.css'

const CustomDropdown = ({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Select an option',
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value)
  const dropdownRef = useRef(null)

  useEffect(() => {
    setSelectedValue(value)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  const handleOptionClick = (optionValue) => {
    setSelectedValue(optionValue)
    onChange(optionValue)
    setIsOpen(false)
  }

  const selectedOption = options.find(option => 
    typeof option === 'string' ? option === selectedValue : option.value === selectedValue
  )

  const displayValue = typeof selectedOption === 'string' ? selectedOption : selectedOption?.label || selectedValue

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <div 
        className={`custom-dropdown-header ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={handleToggle}
      >
        <span className="custom-dropdown-value">
          {displayValue || placeholder}
        </span>
        <span className={`custom-dropdown-arrow ${isOpen ? 'rotated' : ''}`}>
          <IoChevronDownOutline 
            size={24}
          />
        </span>
      </div>
      
      {isOpen && (
        <div className="custom-dropdown-menu">
          {options.map((option, index) => {
            const optionValue = typeof option === 'string' ? option : option.value
            const optionLabel = typeof option === 'string' ? option : option.label
            const isSelected = optionValue === selectedValue
            
            return (
              <div
                key={index}
                className={`custom-dropdown-option ${isSelected ? 'selected' : ''}`}
                onClick={() => handleOptionClick(optionValue)}
              >
                {optionLabel}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CustomDropdown
