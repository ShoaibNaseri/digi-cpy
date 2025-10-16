import React, { useState } from 'react'
import {
  FaCalendar,
  FaCheck,
  FaStar,
  FaUsers,
  FaArrowLeft,
  FaGift,
  FaCheckCircle,
  FaSpinner
} from 'react-icons/fa'
import { RiCalendarFill } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { redirectToParentCheckout } from '@/services/paymentService'
import {
  SINGLE_CHILD_PLANS,
  MULTIPLE_CHILDREN_PLANS,
  TRIAL_BANNER,
  PLAN_TYPES
} from '@/utils/staticData/subscriptionPlan'
import './ParentPlanOptions.css'

const ParentPlanOptions = ({ childType = 'multiple' }) => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSelectPlan = async (planType) => {
    if (!currentUser) {
      navigate('/auth/login')
      return
    }

    setSelectedPlan(planType)
    setLoading(true)

    try {
      const result = await redirectToParentCheckout(
        planType,
        currentUser.uid,
        currentUser.email
      )

      if (!result.success) {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert(`Payment error: ${error.message}`)
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  // Helper function to render plan card
  const renderPlanCard = (plan) => {
    const isSelected = selectedPlan === plan.id
    const isLoading = loading && selectedPlan === plan.id

    return (
      <div
        key={plan.id}
        className={`plan-card ${plan.isFeatured ? 'featured-plan' : ''} ${
          isSelected ? 'selected' : ''
        }`}
        onClick={() => !loading && handleSelectPlan(plan.id)}
      >
        {plan.isFeatured && (
          <div className='parent-best-value-banner'>
            <FaStar className='parent-star-icon' />
            BEST VALUE
          </div>
        )}

        <div className='parent-plan-card-header'>
          <div className='parent-plan-card-header-left'>
            <RiCalendarFill
              color={plan.isFeatured ? '#10b981' : undefined}
              className='parent-plan-icon'
            />
            <h2 className='parent-plan-title'>{plan.title}</h2>
          </div>
          {plan.savings && (
            <div className='parent-save-badge'>{plan.savings}</div>
          )}
        </div>

        <div className='parent-plan-price'>
          <h3>{plan.price}</h3>
          <span className='parent-plan-period'>{plan.period}</span>
        </div>

        <ul className='parent-plan-features'>
          {plan.features.map((feature, index) => (
            <li key={index}>
              <span className='parent-check-icon'>
                <FaCheckCircle />
              </span>
              {feature}
            </li>
          ))}
        </ul>

        <button
          className={`parent-select-plan-button ${
            plan.isFeatured ? 'best-value' : ''
          } ${isLoading ? 'loading' : ''}`}
          disabled={loading}
        >
          {isLoading ? (
            <>
              <FaSpinner className='parent-spinner' />
              Processing...
            </>
          ) : (
            plan.buttonText
          )}
        </button>
      </div>
    )
  }

  return (
    <div className='parent-plan-options-container'>
      {/* <button className='parent-back-button' onClick={handleBack}>
        <FaArrowLeft /> Back
      </button> */}

      {/* Free Trial Banner */}
      <div className='parent-trial-banner'>
        <div className='parent-trial-banner-header'>
          <FaGift className='parent-' /> {TRIAL_BANNER.header}
        </div>
        <h2>{TRIAL_BANNER.title}</h2>
        <p>{TRIAL_BANNER.description}</p>
      </div>

      <div className='parent-plan-cards-container'>
        {childType === 'single' &&
          Object.values(SINGLE_CHILD_PLANS).map(renderPlanCard)}
        {childType === 'multiple' &&
          Object.values(MULTIPLE_CHILDREN_PLANS).map(renderPlanCard)}
      </div>
    </div>
  )
}

export default ParentPlanOptions
