import { useNavigate } from 'react-router-dom'
import './MissionNotFoundModal.css'
import { FaLock } from 'react-icons/fa'

const MissionNotFoundModal = ({ isOpen, onClose, missionTitle }) => {
  const navigate = useNavigate()

  const handleGoBack = () => {
    // Only navigate back if we're actually on a different page
    // Otherwise just close the modal (for cases where modal is shown on the same page)
    if (window.location.pathname.includes('/game/mission/')) {
      navigate(-1)
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='mission-not-found-overlay'>
      <div className='mission-not-found-container'>
        <div className='mission-not-found-header'>
          <div className='mission-error-icon-large'>
            <span>
              <FaLock size={40}></FaLock>
            </span>
          </div>
          <h2 className='mission-not-found-title'>Mission Locked!</h2>
        </div>

        <div className='mission-not-found-body'>
          <p className='mission-not-found-message'>
            {missionTitle ? (
              <>
                This mission is top secret for now. You need to finish your
                current mission before this one unlocks. <br /> <br /> Keep
                going, <strong>Digipal</strong> — you’re almost there!
              </>
            ) : (
              <>
                This mission is locked for now. <br /> <br /> Ask{' '}
                <strong>Digipalz</strong> — to unlock it!
              </>
            )}
          </p>
        </div>

        <div className='mission-not-found-footer'>
          <button
            className='mission-not-found-button primary'
            onClick={handleGoBack}
          >
            <span className='mission-btn-icon'></span>
            {window.location.pathname.includes('/game/mission/')
              ? 'Got It'
              : 'Got It'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MissionNotFoundModal
