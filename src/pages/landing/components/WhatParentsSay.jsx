import React from 'react'
import { useNavigate } from 'react-router-dom'
import './WhatParentsSay.css'

import Sarah from '../../../assets/LandingPage/Sarah.png'
import Michael from '../../../assets/LandingPage/michael1.png'
import Lisa from '../../../assets/LandingPage/Lisa.png'
import TrialButton from '../../../components/landingPage/Button/TrialButton'

const WhatParentsSay = () => {
  // Use the useNavigate hook from react-router-dom
  const navigate = useNavigate()

  // Function to handle register redirection
  const handleRegisterRedirect = () => {
    navigate('/register')
  }

  const reviews = [
    {
      name: 'Sarah M.',
      quote:
        '"Digipalz has taken the pressure off me having to explain online safety. My kids are learning it on their own, and they actually look forward to their lessons!"',
      avatarSrc: Sarah,
      gradient:
        'linear-gradient(144deg, rgba(123,53,192,1)0%, rgba(240,0,104,1)100%)' // Purple to pink gradient
    },
    {
      name: 'Michael R.',
      quote:
        '"I didn\'t want to scare my kids about the internet, but I knew they needed to be prepared. Digipalz strikes the perfect balance between teaching them how to stay safe without making them anxious. My wife and I are blown away by how in-depth it is."',
      avatarSrc: Michael,
      gradient:
        'linear-gradient(144deg, rgba(226,146,149,1)0%, rgba(240,0,104,1)100%)' // Light pink to dark pink gradient
    },
    {
      name: 'Lisa K.',
      quote:
        '"I thought my son would roll his eyes at another "lesson", but he actually loves playing Digipalz. He\'s learning how to spot online dangers without even realizing it\'s educational."',
      avatarSrc: Lisa,
      gradient:
        'linear-gradient(144deg, rgba(0,122,255,1)0%, rgba(240,0,104,1)100%)' // Light blue to dark blue gradient
    }
  ]

  return (
    <section className='digipalz-landing-reviews__section'>
      <div className='digipalz-landing-reviews__container'>
        <div className='digipalz-landing-reviews__header'>
          <h2 className='digipalz-landing-reviews__title'>What Parents Say</h2>
          <p className='digipalz-landing-reviews__subtitle'>
            From worry to confidence — how parents feel after using Digipalz.
          </p>
        </div>

        <div className='digipalz-landing-reviews__feedback-container'>
          {reviews.map((review, index) => (
            <div
              key={index}
              className='digipalz-landing-reviews__card'
              style={{ background: review.gradient }}
            >
              <div className='digipalz-landing-reviews__card-content'>
                {/* Avatar */}
                <div className='digipalz-landing-reviews__avatar-container'>
                  <img
                    src={review.avatarSrc}
                    alt={`${review.name} avatar`}
                    className='digipalz-landing-reviews__avatar'
                    loading='lazy'
                  />
                </div>

                {/* Quote */}
                <p className='digipalz-landing-reviews__quote'>
                  {review.quote}
                </p>

                {/* Name */}
                <p className='digipalz-landing-reviews__name'>{review.name}</p>

                {/* CTA Button with onClick handler */}
                <TrialButton />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhatParentsSay
