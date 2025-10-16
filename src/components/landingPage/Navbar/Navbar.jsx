import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Navbar.css'
import blackTitle from '../../../assets/LandingPage/Digipalz_bl.png'

const Navbar = () => {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [deviceType, setDeviceType] = useState('desktop')
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // set screen size and device type
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth
      if (width >= 1024) {
        setDeviceType('desktop')
      } else if (width >= 768 && width <= 1023) {
        setDeviceType('tablet')
      } else if (width <= 767) {
        setDeviceType('mobile')
      }
    }

    checkDeviceType()
    window.addEventListener('resize', checkDeviceType)
    return () => {
      window.removeEventListener('resize', checkDeviceType)
    }
  }, [])

  // Handle scroll direction for navbar visibility
  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past 100px
        setIsVisible(false)
        setMenuOpen(false) // Close mobile menu when hiding navbar
      } else if (currentScrollY < lastScrollY || currentScrollY <= 100) {
        // Scrolling up or at top
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', controlNavbar)
    return () => {
      window.removeEventListener('scroll', controlNavbar)
    }
  }, [lastScrollY])

  useEffect(() => {
    if (!menuOpen) return
    const handleClickOutside = (event) => {
      const navbar = document.querySelector('.digipalz-landing-navbar__content')
      if (navbar && !navbar.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [menuOpen])

  // Functions to handle redirections using useNavigate
  const handleLoginRedirect = () => {
    navigate('/login')
  }

  const handleRegisterRedirect = () => {
    navigate('/register')
  }

  const handleParentsRedirect = () => {
    navigate('/parent-plan-options')
  }

  const handleEducatorsRedirect = () => {
    navigate('/educator-plan-options')
  }

  const handleHomeRedirect = () => {
    navigate('/')
  }

  return (
    <nav
      className={`digipalz-landing-navbar ${
        isVisible
          ? 'digipalz-landing-navbar--visible'
          : 'digipalz-landing-navbar--hidden'
      }`}
    >
      <div className='digipalz-landing-navbar__content'>
        <div className='digipalz-landing-navbar__left'>
          <img
            src={blackTitle}
            alt='Digipalz'
            className='digipalz-landing-navbar__logo-title'
            onClick={handleHomeRedirect}
            style={{ cursor: 'pointer' }}
          />
        </div>

        {(deviceType === 'mobile' || deviceType === 'tablet') && (
          <button
            className='digipalz-landing-navbar__toggle'
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label='Toggle menu'
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        )}

        <ul
          className={`digipalz-landing-navbar__center ${
            (deviceType === 'mobile' || deviceType === 'tablet') && menuOpen
              ? 'digipalz-landing-navbar__center--active'
              : ''
          }`}
        >
          <li>
            <a
              onClick={() => {
                handleHomeRedirect()
                setMenuOpen(false)
              }}
            >
              Home
            </a>
          </li>
          <li>
            <a
              onClick={() => {
                handleParentsRedirect()
                setMenuOpen(false)
              }}
            >
              Parents
            </a>
          </li>
          <li>
            <a
              onClick={() => {
                handleEducatorsRedirect()
                setMenuOpen(false)
              }}
            >
              Educators
            </a>
          </li>
          <li>
            <a
              href='#'
              onClick={(e) => {
                e.preventDefault()
                navigate('/pricing')
                setMenuOpen(false)
              }}
            >
              Pricing
            </a>
          </li>
          {(deviceType === 'mobile' || deviceType === 'tablet') && (
            <>
              <li>
                <a
                  onClick={() => {
                    handleLoginRedirect()
                    setMenuOpen(false)
                  }}
                >
                  Login
                </a>
              </li>
              <li>
                <a
                  onClick={() => {
                    handleRegisterRedirect()
                    setMenuOpen(false)
                  }}
                >
                  Start Free Trial
                </a>
              </li>
            </>
          )}
        </ul>

        {deviceType === 'desktop' && (
          <div className='digipalz-landing-navbar__right'>
            <button
              className='digipalz-landing-navbar__login-btn'
              onClick={handleLoginRedirect}
            >
              Login
            </button>
            <button
              className='digipalz-landing-navbar__trial-btn'
              onClick={handleRegisterRedirect}
            >
              START FREE TRIAL
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
