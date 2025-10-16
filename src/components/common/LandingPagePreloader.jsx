import React from 'react'
import './LandingPagePreloader.css'
import digipalzWhiteLogo from '@/assets/LandingPage/Digipalz_wh.png'
import PageSpinner from './preloaders/PageSpinner'
const LandingPagePreloader = ({ isLoading = true, progress = 0 }) => {
  if (!isLoading) return null

  return (
    <div className='landing-page-preloader'>
      <div className='landing-page-preloader-content'>
        {/* <div className='landing-page-preloader-logo'>
          <img
            src={digipalzWhiteLogo}
            alt='Digipalz Logo'
            className='landing-page-preloader-logo-img'
          />
        </div> */}

        <PageSpinner color={'white'} />
        <div className='landing-page-preloader-text'>
          Loading amazing experiences...
        </div>
        {/* <div className='landing-page-preloader-progress'>
          <div className='landing-page-progress-bar'>
            <div
              className='landing-page-progress-fill'
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className='landing-page-progress-text'>{progress}%</div>
        </div> */}
      </div>
    </div>
  )
}

export default LandingPagePreloader
