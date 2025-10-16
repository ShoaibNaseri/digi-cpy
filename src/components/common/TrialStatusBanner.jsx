import React, { useState, useEffect } from 'react'
import { FaClock, FaCheck, FaExclamationTriangle } from 'react-icons/fa'
import { checkTrialExpiration } from '@/services/paymentService'
import { useAuth } from '@/context/AuthContext'
import './TrialStatusBanner.css'

const TrialStatusBanner = () => {
  const { currentUser } = useAuth()
  const [trialStatus, setTrialStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrialStatus = async () => {
      if (currentUser) {
        try {
          const result = await checkTrialExpiration(currentUser.uid)
          if (result.success) {
            setTrialStatus(result)
          }
        } catch (error) {
          console.error('Error fetching trial status:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchTrialStatus()
  }, [currentUser])

  if (
    loading ||
    !trialStatus ||
    (!trialStatus.isTrialActive && !trialStatus.trialExpired)
  ) {
    return null
  }

  const { isTrialActive, trialExpired, daysRemaining } = trialStatus

  if (trialExpired) {
    return (
      <div className='trial-banner trial-expired'>
        <FaExclamationTriangle className='trial-icon' />
        <div className='trial-content'>
          <h3>Your free trial has expired</h3>
          <p>Subscribe now to continue enjoying all features</p>
        </div>
        <button className='trial-cta-button'>Subscribe Now</button>
      </div>
    )
  }

  if (isTrialActive) {
    const isUrgent = daysRemaining <= 3

    return (
      <div
        className={`trial-banner ${isUrgent ? 'trial-urgent' : 'trial-active'}`}
      >
        <FaClock className='trial-icon' />
        <div className='trial-content'>
          <h3>Free Trial Active</h3>
          <p>
            {daysRemaining === 0
              ? 'Your trial expires today'
              : `${daysRemaining} day${
                  daysRemaining !== 1 ? 's' : ''
                } remaining in your free trial`}
          </p>
        </div>
        {isUrgent && (
          <button className='trial-cta-button'>Subscribe Now</button>
        )}
      </div>
    )
  }

  return null
}

export default TrialStatusBanner
