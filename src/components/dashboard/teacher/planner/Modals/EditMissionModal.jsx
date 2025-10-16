import { useState, useEffect } from 'react'
import { FaCalendarAlt } from 'react-icons/fa'
import { IoClose } from 'react-icons/io5'
import { missionNumberMap } from '@/services/teacher/missionService'

const EditMissionModal = ({
  isOpen,
  onClose,
  mission,
  onSave,
  onDelete,
  teacherClasses
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedMission, setEditedMission] = useState({
    missionName: '',
    classTitle: '',
    dueDate: '',
    dueTime: ''
  })

  // Initialize form data when mission changes
  useEffect(() => {
    if (mission && isOpen) {
      // Extract date and time from dueDate
      const date = new Date(mission.dueDate)
      const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD format
      const timeStr = date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      }) // HH:MM format

      setEditedMission({
        missionName: mission.missionName || '',
        classTitle:
          mission.classTitle || `${mission.className} - Grade ${mission.grade}`,
        dueDate: dateStr,
        dueTime: timeStr
      })
    }
  }, [mission, isOpen])

  if (!isOpen || !mission) return null

  // Get fixed mission number based on mission name
  const fixedMissionNumber = mission.missionName
    ? missionNumberMap[mission.missionName] || mission.missionNumber
    : mission.missionNumber

  // Format the date for display in view mode
  const formatDate = (date) => {
    if (!date) return ''

    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }

    return date.toLocaleDateString(undefined, options)
  }

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditedMission((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = () => {
    // Combine date and time into a single Date object
    const combinedDateTime = new Date(
      `${editedMission.dueDate}T${editedMission.dueTime}`
    )

    // Create updated mission object
    const updatedMission = {
      ...mission,
      missionName: editedMission.missionName,
      classTitle: editedMission.classTitle,
      dueDate: combinedDateTime,
      displayTitle: editedMission.missionName
    }

    onSave(updatedMission)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this mission?')) {
      onDelete(mission.id)
      onClose()
    }
  }

  // View mode (original modal)
  if (!isEditing) {
    return (
      <div
        className={`teacher-planner__mission-details-modal ${
          isOpen ? 'teacher-planner__mission-details-modal--open' : ''
        }`}
      >
        <div className='teacher-planner__modal-content teacher-planner__modal-content--view'>
          <button
            className='teacher-planner__close-modal-btn teacher-planner__close-modal-btn--floating'
            onClick={onClose}
            aria-label='Close'
          >
            <IoClose size={24} className='teacher-planner__close-modal-icon' />
          </button>
          <div className='teacher-planner__modal-header teacher-planner__modal-header--centered'>
            <h2>Mission Details</h2>
          </div>
         
          <div className='teacher-planner__detail-section'>
          <div className='teacher-planner__mission-info-row'>
            <div className='teacher-planner__mission-number teacher-planner__mission-number--view'>
              Mission {fixedMissionNumber}
            </div>
            <div className='teacher-planner__mission-name teacher-planner__mission-name--view'>
              {mission.missionName}
            </div>
          </div>
            <div className='teacher-planner__detail-row'>
              <h3>Date & Time</h3>
              <p>{formatDate(mission.dueDate)}</p>
            </div>
          </div>
          <div className='teacher-planner__detail-section'>
            <div className='teacher-planner__detail-row'>
              <h3>Class</h3>
              <p>
                {mission.classTitle ||
                  `${mission.className} - Grade ${mission.grade}`}
              </p>
            </div>
          </div>
          <div className='teacher-planner__detail-section'>
            <h3 className='below-border'>Description</h3>
            <p>
              This is a detailed description for Mission {fixedMissionNumber}.
              It explains what the students need to accomplish.
            </p>
          </div>
          <button
            className='teacher-planner__edit-mission-btn'
            onClick={handleEditToggle}
          >
            <FaCalendarAlt className='teacher-planner__edit-mission-btn-icon' size={24} />
            Reschedule
          </button>
        </div>
      </div>
    )
  }

  // Edit mode (new modal) - Updated to use layer modal style like in the image
  return (
    <>
      {/* Modal Overlay */}
      <div
        className={`teacher-planner__modal-overlay ${
          isEditing ? 'teacher-planner__modal-overlay--open' : ''
        }`}
        onClick={() => setIsEditing(false)}
      />

      {/* Edit Modal with centered layer style */}
      <div
        className={`teacher-planner__edit-mission-modal-layer ${
          isEditing ? 'teacher-planner__edit-mission-modal-layer--open' : ''
        }`}
      >
        <div className='teacher-planner__modal-header'>
          <div className='teacher-planner__modal-header-content'>
            <button
              className='teacher-planner__back-btn'
              onClick={() => setIsEditing(false)}
            >
              ←
            </button>
            <h2>Edit Schedule</h2>
          </div>
          <button
            className='teacher-planner__close-modal-btn'
            onClick={() => setIsEditing(false)}
            // Modified: Return to view mode instead of closing completely
            aria-label='Close edit'
          >
            <IoClose size={20} className='teacher-planner__close-modal-icon' />
          </button>
        </div>
        <div className='teacher-planner__modal-content teacher-planner__modal-content--edit'>
          <div className='teacher-planner__form-group'>
            <label>Mission Name</label>
            {mission.missionName}
          </div>

          <div className='teacher-planner__form-group'>
            <label>Assigned Class</label>
            <p>{editedMission.classTitle}</p>
          </div>

          <div className='teacher-planner__form-group'>
            <label>Scheduled Date</label>
            <input
              type='date'
              name='dueDate'
              value={editedMission.dueDate}
              onChange={handleInputChange}
              className='teacher-planner__form-input'
            />
          </div>

          <div className='teacher-planner__form-group'>
            <label>Mission Time</label>
            <input
              type='time'
              name='dueTime'
              value={editedMission.dueTime}
              onChange={handleInputChange}
              className='teacher-planner__form-input'
            />
          </div>

          <div className='teacher-planner__form-actions'>
            <button
              className='teacher-planner__delete-btn'
              onClick={handleDelete}
            >
              Delete Mission
            </button>
            <button className='teacher-planner__save-btn' onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default EditMissionModal
