import React, { useState } from 'react'
import {
  FaCalendar,
  FaCheck,
  FaStar,
  FaUsers,
  FaArrowLeft
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import './PlanOptions.css'

const PlanOptions = () => {
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState(null)

  const handleSelectPlan = (planType) => {
    setSelectedPlan(planType)
    navigate(`/onboarding/payment?plan=${planType}`)
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className='plan-options-container'>
      <button className='back-button' onClick={handleBack}>
        <FaArrowLeft /> Back
      </button>
      <h1 className='plan-options-title'>Choose Your Plan</h1>
      <p className='plan-options-subtitle'>
        Select the perfect subscription that fits your needs
      </p>

      <div className='plan-cards-container'>
        <div
          className={`plan-card ${
            selectedPlan === 'monthly' ? 'selected' : ''
          }`}
          onClick={() => handleSelectPlan('monthly')}
        >
          <div className='plan-card-header'>
            <FaCalendar className='plan-icon' />
            <h2 className='plan-title'>Monthly Plan</h2>
          </div>

          <div className='plan-price'>
            <h3>$9.99</h3>
            <span className='plan-period'>per month</span>
          </div>

          <ul className='plan-features'>
            <li>
              <span className='check-icon'>
                <FaCheck />
              </span>
              Complete access to all cyber safety missions
            </li>
            <li>
              <span className='check-icon'>
                <FaCheck />
              </span>
              Interactive gameplay with real-world safety scenarios
            </li>
            <li>
              <span className='check-icon'>
                <FaCheck />
              </span>
              Personal progress tracking
            </li>
          </ul>

          <button className='select-plan-button'>Select Plan</button>
        </div>

        <div
          className={`plan-card featured-plan ${
            selectedPlan === 'yearly' ? 'selected' : ''
          }`}
          onClick={() => handleSelectPlan('yearly')}
        >
          <div className='plan-card-header'>
            <FaStar className='plan-icon' />
            <h2 className='plan-title'>Yearly Plan</h2>
          </div>

          <div className='save-badge'>Save 20%!</div>

          <div className='plan-price'>
            <h3>$99</h3>
            <span className='plan-period'>per year</span>
          </div>

          <ul className='plan-features'>
            <li>
              <span className='check-icon'>
                <FaCheck />
              </span>
              Two months free
            </li>
            <li>
              <span className='check-icon'>
                <FaCheck />
              </span>
              Complete access to all cyber safety missions
            </li>
            <li>
              <span className='check-icon'>
                <FaCheck />
              </span>
              Interactive gameplay with real-world safety scenarios
            </li>
            <li>
              <span className='check-icon'>
                <FaCheck />
              </span>
              Personal progress tracking
            </li>
          </ul>

          <button className='select-plan-button best-value'>
            Best Value - Select Plan
          </button>
        </div>

        <div
          className={`plan-card ${selectedPlan === 'family' ? 'selected' : ''}`}
          onClick={() => handleSelectPlan('family')}
        >
          <div className='plan-card-header'>
            <FaUsers className='plan-icon' />
            <h2 className='plan-title'>Family Plan</h2>
          </div>

          <div className='plan-price'>
            <h3>$149</h3>
            <span className='plan-period'>per year</span>
          </div>

          <ul className='plan-features'>
            <li>
              <span className='check-icon'>
                <FaCheck />
              </span>
              Access for up to 3 family members under one account
            </li>
            <li>
              <span className='check-icon'>
                <FaCheck />
              </span>
              Centralized parental controls and monitoring
            </li>
            <li>
              <span className='check-icon'>
                <FaCheck />
              </span>
              Age-appropriate content filters for each user profile
            </li>
          </ul>

          <button className='select-plan-button'>Select Plan</button>
        </div>
      </div>
    </div>
  )
}

export default PlanOptions
