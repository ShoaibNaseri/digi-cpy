// MeetTheTeam.jsx
import React from 'react'
import './MeetTheTeam.css'
import CEO from '../../../assets/LandingPage/team/sam.jpeg'
import SE from '../../../assets/LandingPage/team/shoaib.jpeg'
import EPA from '../../../assets/LandingPage/team/sandra.jpg'
import BR from '../../../assets/LandingPage/team/Breno.jpeg'

const MeetTheTeam = () => {
  const teamMembers = [
    {
      name: 'SAMANTHA TENUS',
      role: 'CHIEF EXECUTIVE OFFICER',
      bgColor: 'digipalz-landing-team__info--pink',
      img: CEO
    },
    {
      name: 'SHOAIB NASERI',
      role: 'HEAD OF TECHNOLOGY',
      bgColor: 'digipalz-landing-team__info--cyan',
      img: SE
    },
    {
      name: 'SANDRA LIVINGSTONE',
      role: 'EDUCATION & PSYCHOTHERAPY ADVISOR',
      bgColor: 'digipalz-landing-team__info--purple',
      img: EPA
    },
    {
      name: 'BRENNO RIBEIRO',
      role: 'SENIOR LEGAL ADVISOR',
      bgColor: 'digipalz-landing-team__info--blue',
      img: BR
    }
  ]

  return (
    <section className='digipalz-landing-team__background'>
      <div className='digipalz-landing-team__content'>
        <h2 className='digipalz-landing-team__title'>Meet the Team</h2>

        <div className='digipalz-landing-team__container'>
          {teamMembers.map((member, index) => (
            <div className='digipalz-landing-team__member' key={index}>
              <div className='digipalz-landing-team__image-wrapper'>
                {member.img ? (
                  <img src={member.img} alt={member.name} loading='lazy' />
                ) : (
                  <div className='digipalz-landing-team__image-placeholder'>
                    No Image
                  </div>
                )}
              </div>

              <div className={`digipalz-landing-team__info ${member.bgColor}`}>
                <h3 className='digipalz-landing-team__name'>{member.name}</h3>
                <p className='digipalz-landing-team__role'>{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MeetTheTeam
