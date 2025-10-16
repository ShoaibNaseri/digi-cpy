import React from 'react'
import MissionItem from './MissionItem'

// Month names for formatting dates
const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

/**
 * Renders a list of missions grouped by class
 * @param {Object} props
 * @param {Object} props.missionsByClass - Missions grouped by class
 * @param {Function} props.onMissionClick - Function to call when a mission is clicked
 * @param {boolean} props.loading - Whether missions are loading
 * @param {Error} props.error - Error object if missions failed to load
 */
const MissionListView = ({
  missionsByClass,
  onMissionClick,
  loading,
  error
}) => {
  if (loading) {
    return (
      <div className='teacher-planner__missions-loading'>
        Loading missions...
      </div>
    )
  }

  if (error) {
    return (
      <div className='teacher-planner__error'>
        <div>
          <strong>Error loading missions:</strong>{' '}
          {error.message || 'Something went wrong'}
        </div>
        <button
          className='teacher-planner__retry-button'
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    )
  }

  if (Object.keys(missionsByClass).length === 0) {
    return (
      <div className='teacher-planner__mission-item teacher-planner__mission-item--empty'>
        <div>No missions scheduled yet</div>
      </div>
    )
  }

  return (
    <div className='teacher-planner__mission-lists teacher-planner__mission-lists--single-column'>
      <div className='teacher-planner__mission-section'>
        {/* Header section with title and Add New Mission button */}
        <div className='teacher-planner__mission-section-header'>
          <h2>Missions by Classes</h2>
          <button className='teacher-planner__add-mission-btn'>
            <span className='teacher-planner__add-icon'>+</span>
            Add New Mission
          </button>
        </div>

        {Object.values(missionsByClass).map((classGroup, index) => (
          <div
            className='teacher-planner__mission-class-group'
            key={classGroup.id || index}
          >
            <div className='teacher-planner__mission-class-header'>
              <h3>{classGroup.title}</h3>
              <span className='teacher-planner__mission-count'>
                {classGroup.missions.length} Missions
              </span>
            </div>
            <div className='teacher-planner__mission-items'>
              {classGroup.missions.map((mission) => (
                <MissionItem
                  key={mission.id}
                  mission={mission}
                  onClick={onMissionClick}
                  monthNames={monthNames}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MissionListView
