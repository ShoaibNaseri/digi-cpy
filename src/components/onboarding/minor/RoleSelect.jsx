import { IoPerson } from 'react-icons/io5'
import { MdLockPerson } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import './RoleSelect.css'

const RoleSelect = () => {
  const navigate = useNavigate()

  const handleCreateProfile = () => {
    navigate('/onboarding/minor/plan-options')
  }

  const handleJoinClassroom = () => {
    console.log('Join Classroom clicked')
  }

  return (
    <div className='modal-container'>
      <div className='modal-content-role-select'>
        <h2 className='modal-title'>Start Your Digipalz Journey</h2>
        <p className='modal-description'>
          Choose how you'd like to get started with DigiPalz
        </p>

        <div className='options-container'>
          <div className='option-card' onClick={handleCreateProfile}>
            <div className='icon-container'>
              <IoPerson className='child-icon' />
            </div>
            <h3>Create Profile</h3>
            <p className='option-description'>Set up a new personal account</p>
          </div>

          <div className='option-card' onClick={handleJoinClassroom}>
            <div className='icon-container'>
              <MdLockPerson className='children-icon' />
            </div>
            <h3>Join Classroom</h3>
            <p className='option-description'>
              Connect with a teacher's classroom using a code
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoleSelect
