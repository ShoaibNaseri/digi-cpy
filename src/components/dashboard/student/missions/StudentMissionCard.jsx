import './StudentMissionCard.css'
import schoolyardImage from '../../../../assets/images/schoolyard.png'
import { FaLock, FaCheck, FaPlay } from 'react-icons/fa'
import { RiProgress7Fill } from 'react-icons/ri'

const StudentMissionCard = ({
  title,
  icon, // Keep this prop for backward compatibility
  isSelected = false,
  onClick,
  missionProgress = {},
  analytics = {},
  isLocked = false,
  formatDuration,
  discription
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  // Determine if mission is completed
  const isCompleted = missionProgress?.isComplete === true

  return (
    <div
      className={`mission ${isSelected ? 'mission--selected' : ''} ${
        isLocked ? 'mission--locked' : ''
      }`}
      onClick={handleClick}
    >
      <div className='mission-card-wrapper'>
        <div className='mission__container'>
          <img src={icon} alt={title} className='mission__icon' />
        </div>

        {/* Status badges below image, above title */}
        {isLocked && (
          <div className='mission__status-badge mission__status-badge--locked'>
            <FaLock className='mission__status-badge-lock-icon' />
            Locked
          </div>
        )}
        {isCompleted && !isLocked && (
          <div className='mission__status-badge-container'>
            <div className='mission__status-badge mission__status-badge--completed'>
              <FaCheck className='' />
              Completed
            </div>
            <div className='mission__status-badge-progress-completed'>
              {missionProgress.progress}%
            </div>
          </div>
        )}
        {!isCompleted && !isLocked && (
          <div className='mission__status-badge-container'>
            <div className='mission__status-badge mission__status-badge--not-completed'>
              <RiProgress7Fill
                size={18}
                className='mission__status-badge-lock-icon'
              />
              In Progress
            </div>
            <div className='mission__status-badge-progress-in-progress'>
              {missionProgress.progress}%
            </div>
          </div>
        )}

        <div className='mission__content'>
          <div className='mission__title-container'>
            <p className='mission__title'>{title}</p>
            <p className='mission__subtitle'>{discription}</p>
          </div>

          {isLocked ? (
            <div className='mission__button mission__button--locked'>
              <FaLock className='mission__button-lock-icon' />
              Locked
            </div>
          ) : (
            <div className='mission__button'>
              <FaPlay className='mission__button-play-icon' />
              {isCompleted
                ? 'Replay Mission'
                : missionProgress.progress === 0 || !missionProgress.progress
                ? 'Start Mission'
                : 'Continue Mission'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentMissionCard
