import React from 'react'
import { useNavigate } from 'react-router-dom'
import './HelpYourChild.css'
import LandingPageButton from '../../../components/landingPage/Button/LandingPageButton'

const HelpYourChild = () => {
  // Using useNavigate hook from react-router-dom
  const navigate = useNavigate()

  // Function to handle register redirection
  const handleRegisterRedirect = () => {
    navigate('/register')
  }

  return (
    <div className='digipalz-landing-cta__background'>
      <div className='digipalz-landing-cta__container'>
        <h2 className='digipalz-landing-cta__heading'>
          Help Your Child Outsmart Online Dangers
        </h2>

        <p className='digipalz-landing-cta__subheading'>
          Join a growing community of students already learning with Digipalz.
        </p>
        <LandingPageButton text='START FREE TRIAL' />
        <p className='digipalz-landing-cta__trial-text'>14-day free trial</p>
      </div>
    </div>
  )
}

export default HelpYourChild
