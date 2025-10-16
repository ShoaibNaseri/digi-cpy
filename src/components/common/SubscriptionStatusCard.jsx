import React, { useState, useEffect } from 'react'
import {
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaCreditCard,
  FaRedo
} from 'react-icons/fa'
import { useAuth } from '@/context/AuthContext'
import { checkUserAccess, getAccessMessage } from '@/utils/subscriptionHelper'
import { redirectToParentCheckout } from '@/services/paymentService'
import './SubscriptionStatusCard.css'

const SubscriptionStatusCard = ({ showDetails = true }) => {
  const { currentUser } = useAuth()
  const [accessStatus, setAccessStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const checkAccess = async () => {
      if (currentUser) {
        try {
          const status = await checkUserAccess(currentUser.uid)
          setAccessStatus(status)
        } catch (error) {
          console.error('Error checking access:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    checkAccess()
  }, [currentUser])

  const handleAction = async (action) => {
    setActionLoading(true)

    try {
      switch (action) {
        case 'update_payment':
          // Redirect to Stripe customer portal for payment update
          window.open(
            'https://billing.stripe.com/p/login/test_000000000',
            '_blank'
          )
          break

        case 'resubscribe':
          // Restart subscription flow
          const result = await redirectToParentCheckout(
            'monthly',
            currentUser.uid,
            currentUser.email
          )
          if (!result.success) {
            throw new Error(result.error)
          }
          break

        case 'start_trial':
          // Start new trial
          const trialResult = await redirectToParentCheckout(
            'monthly',
            currentUser.uid,
            currentUser.email
          )
          if (!trialResult.success) {
            throw new Error(trialResult.error)
          }
          break

        default:
          console.log('No action needed')
      }
    } catch (error) {
      console.error('Action error:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='subscription-status-card loading'>
        <div className='loading-spinner'></div>
        <p>Checking subscription status...</p>
      </div>
    )
  }

  if (!accessStatus) {
    return null
  }

  const message = getAccessMessage(accessStatus)
  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return accessStatus.accessType === 'trial' ? (
          <FaClock />
        ) : (
          <FaCheckCircle />
        )
      case 'warning':
        return <FaExclamationTriangle />
      case 'error':
        return <FaTimesCircle />
      default:
        return <FaClock />
    }
  }

  const getActionButton = () => {
    if (message.action === 'none') return null

    const buttonProps = {
      className: `subscription-action-btn ${message.type}`,
      disabled: actionLoading,
      onClick: () => handleAction(message.action)
    }

    switch (message.action) {
      case 'update_payment':
        return (
          <button {...buttonProps}>
            <FaCreditCard /> Update Payment Method
          </button>
        )
      case 'resubscribe':
        return (
          <button {...buttonProps}>
            <FaRedo /> Resubscribe
          </button>
        )
      case 'start_trial':
        return (
          <button {...buttonProps}>
            <FaClock /> Start Free Trial
          </button>
        )
      default:
        return null
    }
  }

  return (
    <div className={`subscription-status-card ${message.type}`}>
      <div className='status-header'>
        <div className='status-icon'>{getIcon()}</div>
        <div className='status-content'>
          <h3>{message.title}</h3>
          <p>{message.message}</p>
        </div>
      </div>

      {showDetails && accessStatus.hasAccess && (
        <div className='status-details'>
          {accessStatus.accessType === 'trial' && (
            <>
              <div className='detail-item'>
                <span>Trial ends:</span>
                <span>
                  {new Date(accessStatus.trialEndDate).toLocaleDateString()}
                </span>
              </div>
              <div className='detail-item'>
                <span>Days remaining:</span>
                <span>{accessStatus.daysRemaining}</span>
              </div>
            </>
          )}
          {accessStatus.accessType === 'subscription' && (
            <div className='detail-item'>
              <span>Plan:</span>
              <span>{accessStatus.planType?.toUpperCase()}</span>
            </div>
          )}
        </div>
      )}

      {getActionButton()}
    </div>
  )
}

export default SubscriptionStatusCard
