import React, { useState, useEffect } from 'react'
import './StaticsFact.css'
import LandingPageButton from '@/components/landingPage/Button/LandingPageButton'

const StaticsFact = () => {
  // State to track which indicator is active (0, 1, or 2)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAutoRotating, setIsAutoRotating] = useState(true)

  // Content data for each slide
  const contentData = [
    {
      statistic: (
        <>
          <span style={{ fontWeight: 'bold' }}>40% of kids</span> in grades 4-8
          have chatted <br /> with a stranger online.
        </>
      ),
      source: 'Center for Cyber Safety and Education, 2019'
    },
    {
      statistic: (
        <>
          <span style={{ fontWeight: 'bold' }}> 1 in 4</span> young people
          report being solicited to engage in sexual activity over the internet
          in return for something of value before turning 18.
        </>
      ),
      source: 'Thorn, 2025'
    },
    {
      statistic: (
        <>
          <span style={{ fontWeight: 'bold' }}>1 in 3</span> children globally
          have <br /> experienced cyberbullying.
        </>
      ),
      source: 'UNICEF, 2019'
    }
  ]

  // Auto-rotation effect - changes content every 3 seconds
  useEffect(() => {
    if (!isAutoRotating) return

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % contentData.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [isAutoRotating, contentData.length])

  // Function to handle indicator click
  const handleIndicatorClick = (index) => {
    setActiveIndex(index)
    // Pause auto-rotation for 6 seconds when user manually clicks
    setIsAutoRotating(false)
    setTimeout(() => setIsAutoRotating(true), 6000)
  }

  return (
    <section className='digipalz-landing-content__section'>
      <div className='digipalz-landing-statistics__background-overlay'></div>
      <div className='digipalz-landing-statistics__container'>
        <h2 className='digipalz-landing-statistics__title'>
          Kids Need Online Protection Now
        </h2>

        <div className='digipalz-landing-statistics__content'>
          <p className='digipalz-landing-statistics__statistic'>
            {contentData[activeIndex].statistic}
          </p>

          <p className='digipalz-landing-statistics__source'>
            {contentData[activeIndex].source}
          </p>
        </div>

        <div className='digipalz-landing-statistics__indicators'>
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className={`digipalz-landing-statistics__indicator ${
                index === activeIndex
                  ? 'digipalz-landing-statistics__indicator--active'
                  : ''
              }`}
              onClick={() => handleIndicatorClick(index)}
            ></span>
          ))}
        </div>

        <div>
          <LandingPageButton marginLeft='0' bgColor='#cafd06' text='JOIN NOW' />
        </div>
      </div>
    </section>
  )
}

export default StaticsFact
