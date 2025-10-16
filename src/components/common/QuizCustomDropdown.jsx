import { useState, useEffect, useRef } from 'react'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'
import './QuizCustomDropdown.css'

// Custom Dropdown Component for Quiz pages
const QuizCustomDropdown = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
  width,
  height
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

  const selectedOption = options.find((option) =>
    typeof option === 'string'
      ? option === selectedValue
      : option.value === selectedValue
  )

  const displayValue =
    typeof selectedOption === 'string'
      ? selectedOption
      : selectedOption?.label || selectedValue

  return (
    <div
      style={{ width: width }}
      className='quiz-custom-dropdown'
      ref={dropdownRef}
    >
      <div
        className={`quiz-custom-dropdown-header ${isOpen ? 'open' : ''} ${
          disabled ? 'disabled' : ''
        }`}
        onClick={handleToggle}
      >
        <span className='quiz-custom-dropdown-value'>
          {displayValue || placeholder}
        </span>
        <span className='quiz-custom-dropdown-arrow'>
          {isOpen ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
        </span>
      </div>

      {isOpen && (
        <div
          className='quiz-custom-dropdown-menu'
          style={{ maxHeight: height }}
        >
          {options.map((option, index) => {
            const optionValue =
              typeof option === 'string' ? option : option.value
            const optionLabel =
              typeof option === 'string' ? option : option.label
            const isSelected = optionValue === selectedValue

            return (
              <div
                key={index}
                className={`quiz-custom-dropdown-option ${
                  isSelected ? 'selected' : ''
                }`}
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

export default QuizCustomDropdown
