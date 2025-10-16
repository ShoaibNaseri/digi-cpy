import React from 'react'
import { useNavigate } from 'react-router-dom'
import './HeroBanner.css'
import KidsHero1 from '@/assets/LandingPage/banner.webp'
import LandingPageButton from '@/components/landingPage/Button/LandingPageButton'

const HeroBanner = () => {
  // Using the useNavigate hook from react-router-dom
  const navigate = useNavigate()

  // Function to handle register redirection
  const handleRegisterRedirect = () => {
    navigate('/register')
  }

  return (
    <div className='digipalz-landing-hero__background'>
      <div className='digipalz-landing-hero__content'>
        {/* Section 1 - Hero Section */}
        <div className='digipalz-landing-hero__container'>
          <div className='digipalz-landing-hero__text-container'>
            <div className='digipalz-landing-hero__title-wrapper'>
              <h1 className='digipalz-landing-hero__heading'>
                Teach Kids Online Safety Through Games
              </h1>
            </div>
            <p className='digipalz-landing-hero__subtitle'>
              Games that teach kids online safety, critical thinking skills and
              smart online choices.
            </p>
            <LandingPageButton text='Get Started' />
          </div>
          <div className='digipalz-landing-hero__image-container'>
            <div className='hero-image-content'>
              <img src={KidsHero1} alt='Kid Hero 1' loading='eager' />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroBanner
