import React from 'react'
import './HowWeTeach.css'
import mic from '../../../assets/LandingPage/mic.webp'
import mirror from '../../../assets/LandingPage/mirror.webp'
import chat from '../../../assets/LandingPage/chat.webp'

const HowWeTeach = () => {
  return (
    <div className='digipalz-landing-teaching__background'>
      <div className='digipalz-landing-teaching__content'>
        <div className='digipalz-landing-teaching__section'>
          <div className='digipalz-landing-teaching__title-container'>
            <h2 className='digipalz-landing-teaching__main-title'>
              How We Teach
            </h2>
            <p className='digipalz-landing-teaching__description digipalz-landing-teaching__description--centered'>
              <span className='digipalz-landing-teaching__highlight'>
                Digipalz
              </span>{' '}
              is an online ecosystem of gamified{' '}
              <span className='digipalz-landing-teaching__highlight'>
                cyber safety curriculum
              </span>
              , transforming lessons into interactive "missions" that build
              digital literacy and help children stay safe online.
            </p>
          </div>

          <div className='digipalz-landing-teaching__steps-container'>
            <div className='digipalz-landing-teaching__step'>
              <div className='digipalz-landing-teaching__step-number digipalz-landing-teaching__step-number--orange'>
                1
              </div>
              <h3 className='digipalz-landing-teaching__step-title'>
                Start With Story
              </h3>
              <div className='digipalz-landing-teaching__icon-container'>
                <img
                  src={mic}
                  alt='Microphone icon'
                  className='digipalz-landing-teaching__step-icon'
                  loading='lazy'
                />
              </div>
              <p className='digipalz-landing-teaching__step-text'>
                All lessons begin with a real-life news story. This helps
                children understand the implications of the issues being
                addressed in the lesson.
              </p>
            </div>

            <div
              className='digipalz-landing-teaching__arrow-container'
              style={{ pointerEvents: 'none' }}
            >
              {/* <img
                src={arrow}
                alt='Arrow to next step'
                className='digipalz-landing-teaching__arrow-image-2'
                style={{ pointerEvents: 'none' }}
              /> */}
            </div>

            <div className='digipalz-landing-teaching__step'>
              <div className='digipalz-landing-teaching__step-number digipalz-landing-teaching__step-number--blue'>
                2
              </div>
              <h3 className='digipalz-landing-teaching__step-title'>
                Solve a Mission
              </h3>
              <div className='digipalz-landing-teaching__icon-container'>
                <img
                  src={mirror}
                  alt='Mirror icon'
                  className='digipalz-landing-teaching__step-icon'
                  loading='lazy'
                />
              </div>
              <p className='digipalz-landing-teaching__step-text'>
                Curriculum is delivered through character interactions and
                puzzle solving. Children must apply the learnings to complete
                the mission.
              </p>
            </div>

            <div
              className='digipalz-landing-teaching__arrow-container'
              style={{ pointerEvents: 'none' }}
            >
              {/* <img
                src={arrow2}
                alt='Arrow to next step'
                className='digipalz-landing-teaching__arrow-image'
                style={{ pointerEvents: 'none' }}
              /> */}
            </div>

            <div className='digipalz-landing-teaching__step'>
              <div className='digipalz-landing-teaching__step-number digipalz-landing-teaching__step-number--purple'>
                3
              </div>
              <h3 className='digipalz-landing-teaching__step-title'>
                Spark Discussion
              </h3>
              <div className='digipalz-landing-teaching__icon-container'>
                <img
                  src={chat}
                  alt='Chat icon'
                  className='digipalz-landing-teaching__step-icon'
                  loading='lazy'
                />
              </div>
              <p className='digipalz-landing-teaching__step-text'>
                Lessons end with discussion prompts for parents and teachers to
                lead engaging discussions with learners and foster critical
                thinking skills.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HowWeTeach
