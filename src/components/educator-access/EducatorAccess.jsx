import { useNavigate } from 'react-router-dom'
import { icons, images } from '@/config/images'
import './EducatorAccess.css'

const EducatorAccess = () => {
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/educator-access/school-onboarding')
  }

  return (
    <div className='educator-access'>
      <div className='educator-access__header'>
        <img src={images.educatorAccessImage} alt='educator access' />
        <h1 className='educator-access__title'>Educator Access</h1>
        <p className='educator-access__description'>
          Please enter your access code to continue
        </p>
      </div>
      <div className='educator-access__form'>
        <form onSubmit={handleSubmit}>
          <div className='educator-access__form-group'>
            <label htmlFor='access-code'>Access Code</label>
            <input type='text' placeholder='Enter your access code' />
            <p className='educator-access__form-group-helper-text'>
              Enter the code provided by your institution
            </p>
          </div>
          <button className='educator-access__form-button' type='submit'>
            Access Platform
          </button>
          <p className='educator-access__form-group-contact'>
            Need an access code?{' '}
            <a href='mailto:support@digipalz.com'>Contact administrator</a>
          </p>
        </form>
      </div>
      <div className='educator-access__form-group-footer'>
        <p>Protected education platform</p>
        <div className='educator-access__form-group-footer-icons'>
          <img src={icons.shieldIcon} alt='Shield' />
          <img src={icons.schoolIcon} alt='School' />
          <img src={icons.graduationHatIcon} alt='Graduation Hat' />
        </div>
      </div>
    </div>
  )
}

export default EducatorAccess
