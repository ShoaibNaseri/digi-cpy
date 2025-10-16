import { useNavigate } from 'react-router-dom'
import './LandingPageButton.css'
const LandingPageButton = ({ bgColor, text, marginLeft }) => {
  const navigate = useNavigate()
  const handleRegisterRedirect = () => {
    navigate('/register')
  }
  return (
    <button
      className='digipalz-landing-hero__cta-button'
      onClick={handleRegisterRedirect}
    >
      {text}
    </button>
  )
}

export default LandingPageButton
