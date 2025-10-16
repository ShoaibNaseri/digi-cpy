import React, { useState } from 'react'
import './AssignMissionModal.css'
import { db, auth } from '../../../../../firebase/config'
import {
  doc,
  collection,
  addDoc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore'

const AssignMissionModal = ({
  onClose,
  onAssign,
  missionOptions,
  classId,
  classData
}) => {
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

  // State for time - set current time as default value
  const [scheduleTime, setScheduleTime] = useState(() => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`
  })

  // State for saving status
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Handle mission selection
  const handleMissionChange = (e) => {
    setSelectedMission(e.target.value)
    setSaveError('') // Clear any errors when making changes
  }

  // Handle time change
  const handleTimeChange = (e) => {
    setScheduleTime(e.target.value)
    setSaveError('') // Clear any errors when making changes
  }

  // Save mission to Firebase and link it to the specified class
  const saveMissionToFirebase = async (assignmentData) => {
    try {
      const currentUser = auth.currentUser

      if (!currentUser) {
        throw new Error('No user is signed in')
      }

      const userId = currentUser.uid

      // Create a reference to the missions collection for this user
      const missionsCollectionRef = collection(db, 'users', userId, 'missions')

      // Convert scheduleTime to Firestore timestamp
      const timeParts = assignmentData.scheduleTime.split(':')

      const dueDateObj = new Date()
      dueDateObj.setHours(parseInt(timeParts[0])) // hours
      dueDateObj.setMinutes(parseInt(timeParts[1])) // minutes

      // Get class information from the passed classData
      const grade = classData ? classData.grade : ''
      const className = classData ? classData.className : ''
      const classTitle =
        className && grade ? `${className} - Grade ${grade}` : className || ''

      // Prepare mission data to store in Firestore with individual fields
      const missionData = {
        // Individual fields that can be accessed and updated separately
        missionName: assignmentData.mission,
        grade: grade, // Grade from class
        className: className, // Class Subject
        classTitle: classTitle, // Full title for display

        // Date fields stored separately
        dueDate: dueDateObj,
        scheduleTime: assignmentData.scheduleTime,

        // Class associations stored separately
        classes: assignmentData.classes || [],
        classIds: [classId], // Store classId as array for consistency

        // Metadata
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      // Add the mission to Firestore
      const missionDocRef = await addDoc(missionsCollectionRef, missionData)

      // If we have a specific classId, we need to associate this mission with that class
      if (classId) {
        const classRef = doc(db, 'users', userId, 'classes', classId)

        // Update the class document to include this mission
        await updateDoc(classRef, {
          assignmentsPending: 1, // Set to 1 for the first mission
          missions: [
            {
              id: missionDocRef.id,
              name: assignmentData.mission,
              dueDate: dueDateObj
            }
          ]
        })

      }

      return missionDocRef.id
    } catch (error) {
      console.error('Error saving mission to Firebase:', error)
      throw error
    }
  }

  // Handle assignment confirmation
  const handleConfirm = async () => {
    // Check if time is selected
    if (!scheduleTime) {
      setSaveError('Please select a time')
      return
    }

    // Prepare assignment data with class information
    const assignmentData = {
      mission: selectedMission,
      scheduleTime: scheduleTime, // Format: HH:MM

      // Include class information from CreateClassForm
      grade: classData ? classData.grade : '',
      className: classData ? classData.className : '',

      // Create a simple classes array for compatibility
      classes: [
        {
          id: classId,
          name: classData
            ? `${classData.className} - Grade ${classData.grade}`
            : 'Class',
          students: classData ? classData.numberOfStudents : 0
        }
      ]
    }

    // Set saving state
    setIsSaving(true)
    setSaveError('')

    try {
      // Save to Firebase
      const missionId = await saveMissionToFirebase(assignmentData)

      // Add mission ID to the data for parent component
      assignmentData.missionId = missionId

      // If successful, call the onAssign function to update local state in parent component
      if (typeof onAssign === 'function') {
        onAssign(assignmentData)
      } else {
        console.error('onAssign is not a function', onAssign)
        // If onAssign is not a function, we can still close the modal
        if (typeof onClose === 'function') {
          onClose()
        }
      }
    } catch (error) {
      console.error('Error in handleConfirm:', error)
      setSaveError('Failed to save mission. Please try again.')
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
              <span className='assign-mission-select-arrow'>▼</span>
            </div>
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

          <div className='assign-mission-actions'>
            <button
              className='assign-mission-confirm-btn'
              onClick={handleConfirm}
              disabled={isSaving}
              style={{
                marginLeft: 'auto'
              }} /* Add auto margin to keep it right-aligned */
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
