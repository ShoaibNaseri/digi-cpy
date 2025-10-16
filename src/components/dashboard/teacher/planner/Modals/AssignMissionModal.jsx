import React, { useState, useEffect } from 'react'
import { FaChevronDown } from 'react-icons/fa'
import './AssignMissionModal.css'
import { auth } from '@/firebase/config'
import { saveMissionAssignment } from '@/services/missionService'

const AssignMissionModal = ({ onClose, onAssign, missionOptions }) => {
  // Default mission options if not provided by parent component
  const defaultMissionOptions = [
    'Cyberbullying',
    'IP Addresses & Digital Footprints',
    'Online Scams & Password Protection',
    'Personal Information & Identity Theft',
    'Artificial Intelligence and Deepfakes',
    'Extortion',
    'Catfishing & Fake Profiles',
    'Grooming',
    'Online Predators',
    'Social Engineering'
  ]

  // Use provided mission options or fallback to defaults
  const availableMissionOptions = missionOptions || defaultMissionOptions

  // State for selected mission - use first option as default
  const [selectedMission, setSelectedMission] = useState(
    availableMissionOptions[0]
  )

  // State for due date - set today as default value
  const [dueDate, setDueDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0] // Format: YYYY-MM-DD
  })

  // State for time - set current time as default value
  const [scheduleTime, setScheduleTime] = useState(() => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`
  })

  // State for selected grades (instead of individual classes)
  const [selectedGrades, setSelectedGrades] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false
  })

  // State for saving status
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Grade information - simplified to just show grade names
  const gradeInfo = {
    1: { name: 'Grade 1' },
    2: { name: 'Grade 2' },
    3: { name: 'Grade 3' },
    4: { name: 'Grade 4' },
    5: { name: 'Grade 5' },
    6: { name: 'Grade 6' }
  }

  // Class mapping (for compatibility with existing code)
  const gradeToClassMapping = {
    1: ['1A', '1B'],
    2: ['2A', '2B'],
    3: ['3A', '3B'],
    4: ['4A', '4B'],
    5: ['5A', '5B'],
    6: ['6A', '6B']
  }

  // Class information (needed for the return data structure)
  const classInfo = {
    '1A': { name: 'Grade 1A - Morning', students: 22 },
    '1B': { name: 'Grade 1B - Afternoon', students: 20 },
    '2A': { name: 'Grade 2A - Morning', students: 24 },
    '2B': { name: 'Grade 2B - Afternoon', students: 23 },
    '3A': { name: 'Grade 3A - Morning', students: 25 },
    '3B': { name: 'Grade 3B - Afternoon', students: 24 },
    '4A': { name: 'Grade 4A - Morning', students: 25 },
    '4B': { name: 'Grade 4B - Afternoon', students: 23 },
    '5A': { name: 'Grade 5A - Morning', students: 27 },
    '5B': { name: 'Grade 5B - Afternoon', students: 24 },
    '6A': { name: 'Grade 6A - Morning', students: 26 },
    '6B': { name: 'Grade 6B - Afternoon', students: 25 }
  }

  // Handle mission selection
  const handleMissionChange = (e) => {
    setSelectedMission(e.target.value)
    setSaveError('') // Clear any errors when making changes
  }

  // Handle due date change
  const handleDateChange = (e) => {
    setDueDate(e.target.value)
    setSaveError('') // Clear any errors when making changes
  }

  // Handle time change
  const handleTimeChange = (e) => {
    setScheduleTime(e.target.value)
    setSaveError('') // Clear any errors when making changes
  }

  // Handle grade selection toggle
  const handleGradeToggle = (gradeId) => {
    setSelectedGrades({
      ...selectedGrades,
      [gradeId]: !selectedGrades[gradeId]
    })
    setSaveError('') // Clear any errors when making changes
  }

  // Handle assignment confirmation
  const handleConfirm = async () => {
    // Check if at least one grade is selected
    const selectedGradeIds = Object.keys(selectedGrades).filter(
      (gradeId) => selectedGrades[gradeId]
    )

    if (selectedGradeIds.length === 0) {
      setSaveError('Please select at least one grade')
      return
    }

    // Check if date is selected
    if (!dueDate) {
      setSaveError('Please select a date')
      return
    }

    // Check if time is selected
    if (!scheduleTime) {
      setSaveError('Please select a time')
      return
    }

    // Convert selected grades to classes for the expected data structure
    let selectedClassIds = []
    selectedGradeIds.forEach((gradeId) => {
      selectedClassIds = [...selectedClassIds, ...gradeToClassMapping[gradeId]]
    })

    const assignmentData = {
      mission: selectedMission,
      dueDate: dueDate, // Format: YYYY-MM-DD
      scheduleTime: scheduleTime, // Format: HH:MM
      classes: selectedClassIds.map((classId) => ({
        id: classId,
        name: classInfo[classId].name,
        students: classInfo[classId].students
      }))
    }

    // Set saving state
    setIsSaving(true)
    setSaveError('')

    try {
      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error('No user is signed in')
      }

      // Save to Firebase using the service
      await saveMissionAssignment(currentUser.uid, assignmentData)

      // If successful, call the onAssign function to update local state in parent component
      onAssign(assignmentData)
    } catch (error) {
      setSaveError('Failed to save mission. Please try again.')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className='assign-mission-page'>
      <div className='assign-mission-container'>
        <div className='assign-mission-header'>
          <h2 className='assign-mission-title'>Assign Mission</h2>
          <button className='assign-mission-close-btn' onClick={onClose}>
            ×
          </button>
        </div>

        <div className='assign-mission-content'>
          <div className='assign-mission-form-group'>
            <label className='assign-mission-label'>Select Mission</label>
            <div className='assign-mission-select-wrapper'>
              <select
                className='assign-mission-select'
                value={selectedMission}
                onChange={handleMissionChange}
              >
                {availableMissionOptions.map((mission) => (
                  <option key={mission} value={mission}>
                    {mission}
                  </option>
                ))}
              </select>
              <span className='assign-mission-select-arrow'>
                <FaChevronDown />
              </span>
            </div>
          </div>

          <div className='assign-mission-form-group'>
            <label className='assign-mission-label'>Select Date</label>
            <input
              type='date'
              className='assign-mission-date-input'
              value={dueDate}
              onChange={handleDateChange}
              placeholder='mm/dd/yyyy'
              required
            />
          </div>

          <div className='assign-mission-form-group'>
            <label className='assign-mission-label'>Schedule Time</label>
            <input
              type='time'
              className='assign-mission-time-input'
              value={scheduleTime}
              onChange={handleTimeChange}
              required
            />
          </div>

          <div className='assign-mission-form-group'>
            <label className='assign-mission-label'>Select Grades</label>
            <div className='assign-mission-classes-list'>
              {Object.entries(gradeInfo).map(([gradeId, info]) => (
                <div key={gradeId} className='assign-mission-class-item'>
                  <label className='assign-mission-checkbox-container'>
                    <input
                      type='checkbox'
                      checked={selectedGrades[gradeId]}
                      onChange={() => handleGradeToggle(gradeId)}
                    />
                    <span className='assign-mission-checkbox'></span>
                    <span className='assign-mission-class-name'>
                      {info.name}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {saveError && <div className='assign-mission-error'>{saveError}</div>}

          <div className='assign-mission-actions'>
            <button
              className='assign-mission-cancel-btn'
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              className='assign-mission-confirm-btn'
              onClick={handleConfirm}
              disabled={isSaving}
            >
              {isSaving ? (
                <span className='assign-mission-loading'>Saving...</span>
              ) : (
                <>
                  <svg
                    className='assign-mission-check-icon'
                    viewBox='0 0 24 24'
                  >
                    <path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z' />
                  </svg>
                  Confirm Assignment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignMissionModal
