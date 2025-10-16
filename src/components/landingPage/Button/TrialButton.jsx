import { useNavigate } from 'react-router-dom'
import './TrialButton.css'
const TrialButton = () => {
  const navigate = useNavigate()
  const handleRegisterRedirect = () => {
    navigate('/register')
  }
  return (
    <button
      style={{ fontSize: '14px' }}
      className='digipalz-landing-hero__trial-button'
      onClick={handleRegisterRedirect}
    >
      START FREE TRIAL
    </button>
  )
}

export default TrialButton
