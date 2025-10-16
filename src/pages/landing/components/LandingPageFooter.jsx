import React from 'react'
import { useNavigate } from 'react-router-dom'
import './LandingPageFooter.css'

import digipalzWhiteLogo from '../../../assets/LandingPage/Digipalz_wh.png'
import { FaLinkedinIn } from 'react-icons/fa'
import { useCookieConsent } from '../../../context/CookieConsentContext'

const LandingPageFooter = () => {
  // Use the useNavigate hook from react-router-dom
  const navigate = useNavigate()

  // Cookie consent context
  const { showCookieSettings } = useCookieConsent()

  // Functions to handle internal redirections
  const handleHomeRedirect = () => navigate('/')
  const handleEducatorsRedirect = () => navigate('/dashboard/teacher')
  const handleParentsRedirect = () => navigate('/dashboard/student')
  const handlePricingRedirect = () => navigate('/pricing')
  const handlePrivacyRedirect = () => navigate('/privacy-policy-en')
  const handleTermsRedirect = () => navigate('/terms-of-service-en')
  const handleCookieRedirect = () => navigate('/cookie-policy-en')

  // Handle cookie settings click - show modal instead of navigating
  const handleCookieSettingsClick = () => {
    showCookieSettings()
  }
  // For external links, we still use window.open
  const handleLinkedInRedirect = () => {
    window.open('https://www.linkedin.com/company/digipalz', '_blank')
  }

  return (
    <div className='digipalz-landing-footer__background'>
      <div className='digipalz-landing-footer__content-wrapper'>
        <div className='digipalz-landing-footer__brand-info'>
          <div className='digipalz-landing-footer__logo-container'>
            {/* <img
              className='digipalz-landing-footer__logo-icon'
              alt='Redesigned icon logo'
              src={footerLogo}
            /> */}
            <img
              className='digipalz-landing-footer__logo-text'
              alt='Digipalz white logo'
              src={digipalzWhiteLogo}
            />
          </div>

          <p className='digipalz-landing-footer__brand-description'>
            Protecting children in the digital world through gamified learning.
          </p>
        </div>

        <div className='digipalz-landing-footer__links-wrapper'>
          {/* Quick Links Column */}
          <div className='digipalz-landing-footer__links-column'>
            <div className='digipalz-landing-footer__section-title'>
              Quick Links
            </div>
            <div
              className='digipalz-landing-footer__nav-link digipalz-landing-footer__nav-link--clickable'
              onClick={handleHomeRedirect}
            >
              Home
            </div>
            <div
              className='digipalz-landing-footer__nav-link digipalz-landing-footer__nav-link--clickable'
              onClick={handleEducatorsRedirect}
            >
              Educators
            </div>
            <div
              className='digipalz-landing-footer__nav-link digipalz-landing-footer__nav-link--clickable'
              onClick={handleParentsRedirect}
            >
              Parents
            </div>
            <div
              className='digipalz-landing-footer__nav-link digipalz-landing-footer__nav-link--clickable'
              onClick={handlePricingRedirect}
            >
              Pricing
            </div>
          </div>

          {/* Legal Column */}
          <div className='digipalz-landing-footer__links-column'>
            <div className='digipalz-landing-footer__section-title'>Legal</div>
            <div
              className='digipalz-landing-footer__legal-link digipalz-landing-footer__legal-link--clickable'
              onClick={handlePrivacyRedirect}
            >
              Privacy Policy
            </div>
            <div
              className='digipalz-landing-footer__legal-link digipalz-landing-footer__legal-link--clickable'
              onClick={handleTermsRedirect}
            >
              Terms of Service
            </div>
            <div
              className='digipalz-landing-footer__legal-link digipalz-landing-footer__legal-link--clickable'
              onClick={handleCookieRedirect}
            >
              Cookie Policy
            </div>
            <div
              className='digipalz-landing-footer__legal-link digipalz-landing-footer__legal-link--clickable'
              onClick={handleCookieSettingsClick}
            >
              Cookie Settings
            </div>
          </div>

          {/* Follow Us Column */}
          <div className='digipalz-landing-footer__links-column'>
            <div className='digipalz-landing-footer__section-title'>
              Follow Us
            </div>
            <div className='landing-page-social-media-icons'>
              <div
                className='digipalz-landing-footer__social-wrapper digipalz-landing-footer__social-wrapper--clickable'
                onClick={handleLinkedInRedirect}
              >
                <FaLinkedinIn className='digipalz-landing-footer__social-icon' />
              </div>
              {/* <div
                className='digipalz-landing-footer__social-wrapper digipalz-landing-footer__social-wrapper--clickable'
                onClick={handleLinkedInRedirect}
              >
                <FaFacebook className='digipalz-landing-footer__social-icon' />
              </div> */}
              {/* <div
                className='digipalz-landing-footer__social-wrapper digipalz-landing-footer__social-wrapper--clickable'
                onClick={handleLinkedInRedirect}
              >
                <FaInstagram className='digipalz-landing-footer__social-icon' />
              </div>
              <div
                className='digipalz-landing-footer__social-wrapper digipalz-landing-footer__social-wrapper--clickable'
                onClick={handleLinkedInRedirect}
              >
                <FaTwitter className='digipalz-landing-footer__social-icon' />
              </div>
              <div
                className='digipalz-landing-footer__social-wrapper digipalz-landing-footer__social-wrapper--clickable'
                onClick={handleLinkedInRedirect}
              >
                <FaYoutube className='digipalz-landing-footer__social-icon' />
              </div> */}
            </div>
          </div>
        </div>
      </div>

      <p className='digipalz-landing-footer__copyright-text'>
        2025 Digipalz. All rights reserved.
      </p>
    </div>
  )
}

export default LandingPageFooter
