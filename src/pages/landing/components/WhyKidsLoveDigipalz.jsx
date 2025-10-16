import React from 'react'

import './WhyKidsLoveDigipalz.css'

import { FaStar, FaTrophy } from 'react-icons/fa'
import { IoShieldCheckmarkSharp } from 'react-icons/io5'
import LandingPageButton from '../../../components/landingPage/Button/LandingPageButton'

const WhyKidsLoveDigipalz = () => {
  return (
    <div className='digipalz-landing-features__section'>
      <h2 className='digipalz-landing-features__title'>
        Why Kids Love Digipalz
      </h2>
      <div className='digipalz-landing-features__container'>
        {/* First Feature */}
        <div className='digipalz-landing-features__item'>
          <div className='digipalz-landing-features__icon digipalz-landing-features__icon--pink'>
            <FaStar size={80} color='white' />
          </div>
          <h3 className='digipalz-landing-features__item-title'>
            Fun Challenges
          </h3>
          <p className='digipalz-landing-features__item-text'>
            Interactive games that makes <br /> learning exciting and rewarding
          </p>
        </div>

        {/* Second Feature */}
        <div className='digipalz-landing-features__item'>
          <div className='digipalz-landing-features__icon digipalz-landing-features__icon--blue'>
            <FaTrophy size={80} color='white' />
          </div>
          <h3 className='digipalz-landing-features__item-title'>
            Rewards Systems
          </h3>
          <p className='digipalz-landing-features__item-text'>
            Earn points and unlock <br /> achievements as you learn
          </p>
        </div>

        {/* Third Feature */}
        <div className='digipalz-landing-features__item'>
          <div className='digipalz-landing-features__icon digipalz-landing-features__icon--purple'>
            <IoShieldCheckmarkSharp size={80} color='white' />
          </div>
          <h3 className='digipalz-landing-features__item-title'>
            Safe Environment
          </h3>
          <p className='digipalz-landing-features__item-text'>
            Parent-controlled, secure <br /> platform for peace of mind
          </p>
        </div>
      </div>

      {/* Call to Action Button */}
      <div className='digipalz-landing-features__cta-container'>
        <LandingPageButton text='START PLAYING NOW' />
      </div>
    </div>
  )
}

export default WhyKidsLoveDigipalz
