import React, { useState, useEffect, useRef } from 'react'
import './QuickAssignModal.css'
import { icons } from '../../../../../config/teacherDash/images.js'

// icon
const IoIosFlash = icons.lightningIcon

const QuickAssignModal = ({ onClose, onSubmit }) => {
  // State for toggle switch
  const [allModulesEnabled, setAllModulesEnabled] = useState(true)

  // State for selected grades
  const [selectedGrades, setSelectedGrades] = useState({
    4: true,
    5: true,
    6: true
  })

  // Format date as YYYY-MM-DD to work with date picker
  const [dateRange, setDateRange] = useState({
    startDate: '2025-01-15',
    endDate: '2025-05-30'
  })

  // Set date range constraints
  const minDate = '2025-01-01'
  const maxDate = '2025-12-31'

  // Ref for modal content to detect clicks outside
  const modalRef = useRef(null)

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside)

    // Block scrolling on body
    document.body.style.overflow = 'hidden'

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'auto'
    }
  }, [onClose])

  // Handle grade selection toggle
  const toggleGradeSelection = (grade) => {
    setSelectedGrades({
      ...selectedGrades,
      [grade]: !selectedGrades[grade]
    })
  }

  // Handle toggle switch change
  const handleToggleChange = () => {
    setAllModulesEnabled(!allModulesEnabled)
  }

  // Handle date change
  const handleDateChange = (field, e) => {
    setDateRange({
      ...dateRange,
      [field]: e.target.value
    })
  }

  // Handle form submission
  const handleSubmit = () => {
    // Validate the form
    if (!allModulesEnabled) {
      alert('Please enable all modules to continue.')
      return
    }

    const anyGradeSelected = Object.values(selectedGrades).some(
      (value) => value
    )
    if (!anyGradeSelected) {
      alert('Please select at least one grade.')
      return
    }

    const start = new Date(dateRange.startDate)
    const end = new Date(dateRange.endDate)
    if (start >= end) {
      alert('End date must be after start date.')
      return
    }

    // Prepare and submit the form data
    const formData = {
      allModulesEnabled,
      selectedGrades,
      dateRange
    }

    onSubmit(formData)
  }

  // Prevent propagation of clicks within the modal
  const handleModalClick = (e) => {
    e.stopPropagation()
  }

  return (
    <div className='quickAssignModal-overlay' onClick={handleModalClick}>
      <div className='quickAssignModal-container' ref={modalRef}>
        <div className='quickAssignModal-header'>
          <h2 className='quickAssignModal-title'>Quick Assign All Modules</h2>
          <button className='quickAssignModal-closeBtn' onClick={onClose}>
            ×
          </button>
        </div>

        <div className='quickAssignModal-content'>
          <div className='quickAssignModal-moduleSelection'>
            <div className='quickAssignModal-moduleOption'>
              <div className='quickAssignModal-moduleText'>
                <h3 className='quickAssignModal-moduleTitle'>
                  All Cybersafety Modules
                </h3>
                <p className='quickAssignModal-moduleDescription'>
                  Automatically schedule all modules with recommended intervals
                </p>
              </div>
              <label className='quickAssignModal-toggleSwitch'>
                <input
                  type='checkbox'
                  checked={allModulesEnabled}
                  onChange={handleToggleChange}
                />
                <span className='quickAssignModal-toggleSlider'></span>
              </label>
            </div>
          </div>

          <div className='quickAssignModal-dateContainer'>
            <div className='quickAssignModal-dateField'>
              <label className='quickAssignModal-dateLabel'>Start Date</label>
              <input
                type='date'
                className='quickAssignModal-dateInput'
                value={dateRange.startDate}
                onChange={(e) => handleDateChange('startDate', e)}
                min={minDate}
                max={dateRange.endDate}
                placeholder='mm/dd/yyyy'
              />
            </div>

            <div className='quickAssignModal-dateField'>
              <label className='quickAssignModal-dateLabel'>End Date</label>
              <input
                type='date'
                className='quickAssignModal-dateInput'
                value={dateRange.endDate}
                onChange={(e) => handleDateChange('endDate', e)}
                min={dateRange.startDate}
                max={maxDate}
                placeholder='mm/dd/yyyy'
              />
            </div>
          </div>

          <div className='quickAssignModal-gradesSection'>
            <label className='quickAssignModal-gradesLabel'>
              Selected Grades
            </label>
            <div className='quickAssignModal-gradesOptions'>
              <button
                className={`quickAssignModal-gradeBtn ${
                  selectedGrades[4] ? 'quickAssignModal-gradeSelected' : ''
                }`}
                onClick={() => toggleGradeSelection(4)}
              >
                Grade 4
              </button>
              <button
                className={`quickAssignModal-gradeBtn ${
                  selectedGrades[5] ? 'quickAssignModal-gradeSelected' : ''
                }`}
                onClick={() => toggleGradeSelection(5)}
              >
                Grade 5
              </button>
              <button
                className={`quickAssignModal-gradeBtn ${
                  selectedGrades[6] ? 'quickAssignModal-gradeSelected' : ''
                }`}
                onClick={() => toggleGradeSelection(6)}
              >
                Grade 6
              </button>
            </div>
          </div>

          <div className='quickAssignModal-actions'>
            <button
              className='quickAssignModal-submitBtn'
              onClick={handleSubmit}
              disabled={
                !allModulesEnabled ||
                !Object.values(selectedGrades).some((v) => v)
              }
            >
              <IoIosFlash
                className='quickAssignModal-lightningIcon'
                size={20}
              />
              <span className='quickAssignModal-buttonText'>
                Quick Assign All
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickAssignModal
