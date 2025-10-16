import { useState } from 'react'
import { IoChevronDown, IoChevronUp } from 'react-icons/io5'
import { BiTargetLock, BiUserCheck, BiAward } from 'react-icons/bi'
import Avatar from '@/components/common/avatar/Avatar'

const ChildProfileCard = ({ child, navigate }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleManageLessons = (childId) => {
    navigate(`/dashboard/parent/manage-lessons/${childId}`)
  }

  return (
    <div className='parent-dashboard-child-profile-card'>
      <div className='child-header'>
        <div className='child-info'>
          <Avatar name={child?.firstName || 'Declan'} size={60} />
          <div className='child-details'>
            <h3>{child?.firstName || 'Declan'}</h3>
            <p> Age 11</p>
          </div>
        </div>
        <button
          className={`expand-btn ${isExpanded ? 'expanded' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <IoChevronUp /> : <IoChevronDown />}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Progress Bar */}
          <div className='lesson-progress'>
            <div className='progress-header'>
              <h4>Lesson Progress</h4>
              <span className='progress-summary'>
                {child?.missionsCompleted || 0} of 12 Missions Completed
              </span>
            </div>
            <div className='progress-bar-container'>
              <div
                className='progress-bar'
                style={{
                  width: `${((child?.missionsCompleted || 0) / 12) * 100}%`
                }}
              ></div>
            </div>
          </div>

          {/* Mission Info Grid */}
          <div className='mission-info-grid'>
            <div className='mission-info-item'>
              <h4>Current Mission</h4>
              <p>IP Addresses & Digital Footprints</p>
            </div>
            <div className='mission-info-item'>
              <h4>Next Mission</h4>
              <p>Passwords & Device Safety</p>
            </div>
            <div className='mission-info-item'>
              <h4>Latest Badge</h4>
              <p>Privacy Master</p>
            </div>
          </div>

          <div className='parent-child-card-footer'>
            {/* Lesson Progress Icons */}
            <div className='parent-dashbaord-child-lesson-progress-icons'>
              <div className='lesson-progress-title'>Lesson Progress</div>
              <div className='lesson-progress-icons'>
                <div className='lesson-progress-icon'>
                  <BiTargetLock />
                </div>
                <div className='lesson-progress-icon'>
                  <BiUserCheck />
                </div>
                <div className='lesson-progress-icon'>
                  <BiAward />
                </div>
              </div>
            </div>

            {/* Manage Lessons Button */}
            <button
              className='manage-lessons-btn'
              onClick={() => handleManageLessons(child?.childId)}
            >
              Manage Lessons
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ChildProfileCard
