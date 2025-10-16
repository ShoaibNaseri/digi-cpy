import React from 'react'
import './TopicsWeCover.css'
import azabuki from '../../../assets/LandingPage/robotoro.png'

const TopicsWeCover = () => {
  const topics = [
    { name: 'Online Predators', bgColor: 'digikelz-landing-topic--purple' },
    { name: 'Identity Theft', bgColor: 'digikelz-landing-topic--blue' },
    { name: 'Sexual Exploitation', bgColor: 'digikelz-landing-topic--navy' },
    { name: 'Privacy', bgColor: 'digikelz-landing-topic--purple' },
    { name: 'Cyberbullying', bgColor: 'digikelz-landing-topic--yellow' },
    { name: 'Scams', bgColor: 'digikelz-landing-topic--pink' },
    { name: 'Social Media', bgColor: 'digikelz-landing-topic--cyan' },
    { name: 'Responsible Use', bgColor: 'digikelz-landing-topic--magenta' },
    { name: 'Personal Data', bgColor: 'digikelz-landing-topic--pink' },
    { name: 'Social Engineering', bgColor: 'digikelz-landing-topic--cyan' },
    { name: 'Grooming', bgColor: 'digikelz-landing-topic--magenta' },
    { name: 'Password Protection', bgColor: 'digikelz-landing-topic--yellow' },
    {
      name: 'Artificial Intelligence',
      bgColor: 'digikelz-landing-topic--navy'
    },
    { name: 'Deepfakes', bgColor: 'digikelz-landing-topic--pink' }
  ]

  return (
    <div className='digikelz-landing-topics__background'>
      <div className='digikelz-landing-topics__content'>
        <div className='digikelz-landing-topics__section'>
          {/* Topics container */}
          <div className='digikelz-landing-topics__container'>
            <h2 className='digikelz-landing-topics__title'>Topics We Cover</h2>

            <div className='digikelz-landing-topics__grid'>
              {topics.map((topic, index) => (
                <div
                  key={index}
                  className={`digikelz-landing-topics__button ${topic.bgColor}`}
                >
                  {topic.name}
                </div>
              ))}
            </div>
          </div>

          {/* Person image directly in the section */}
          <img
            src={azabuki}
            alt='Character representing cyber safety education'
            className='digikelz-landing-topics__image'
            loading='lazy'
          />
        </div>
      </div>
    </div>
  )
}

export default TopicsWeCover
