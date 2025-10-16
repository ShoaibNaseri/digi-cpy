import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import hero4 from '@/assets/LandingPage/4.png'
import hero2 from '@/assets/LandingPage/2.png'
import hero5 from '@/assets/LandingPage/5.png'
import digipalzLogo from '@/assets/digipalz_b.png'
import '@/pages/auth/login/Login.css'
import { FaArrowLeft } from 'react-icons/fa'
import { FaHome } from 'react-icons/fa'
import PagePreloader from '@/components/common/preloaders/PagePreloader'

const AuthPageShell = ({
  children,
  showBrand = true,
  showBackToLogin = false
}) => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

  // Function to preload images efficiently
  const preloadImages = () => {
    const images = [hero4, hero2, hero5]
    if (showBrand) {
      images.push(digipalzLogo)
    }

    const imagePromises = images.map((src) => {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = resolve
        img.onerror = resolve // Continue even if image fails to load
        img.src = src
      })
    })

    // Return image promises without artificial delay
    return Promise.all(imagePromises)
  }

  useEffect(() => {
    preloadImages()
      .then(() => {
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Error preloading images:', error)
        // Still show the component even if images fail to load
        setIsLoading(false)
      })
  }, [showBrand])

  if (isLoading) {
    return <PagePreloader textData='Loading Authentications...' />
  }

  return (
    <div className='login-container'>
      <div className='login-layout'>
        <div className='login-left'>
          <div className='login-home-button'>
            <FaHome onClick={() => navigate('/')} />
          </div>
          <div className='login-card-wrapper'>
            <div className='login-card'>
              <div className='login-card-body'>
                {showBrand && (
                  <div className='login-brand'>
                    <img
                      src={digipalzLogo}
                      alt='Digipalz logo'
                      className='login-brand-logo'
                      onClick={() => navigate('/')}
                      loading='eager'
                    />
                  </div>
                )}
                {children}
              </div>
            </div>
          </div>
        </div>
        <div className='login-right'>
          <div className='login-characters tight'>
            <img
              src={hero4}
              alt=''
              aria-hidden='true'
              className='login-character tight-img'
              loading='lazy'
            />
            <img
              src={hero2}
              alt=''
              aria-hidden='true'
              className='login-character tight-img'
              loading='lazy'
            />
            <img
              src={hero5}
              alt=''
              aria-hidden='true'
              className='login-character tight-img'
              loading='lazy'
            />
          </div>
        </div>
      </div>
      {showBackToLogin && (
        <button onClick={() => navigate('/login')} className='back-to-login'>
          <FaArrowLeft /> Back to Login
        </button>
      )}
    </div>
  )
}

export default AuthPageShell
