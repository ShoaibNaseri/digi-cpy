import { getParentSubscriptionStatus } from '@/services/paymentService'

/**
 * Check if user has active access (trial or paid subscription)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Access status and details
 */
export const checkUserAccess = async (userId) => {
  try {
    const { success, subscription, trial } = await getParentSubscriptionStatus(
      userId
    )

    if (!success) {
      return { hasAccess: false, reason: 'Unable to check subscription' }
    }

    // Check trial status
    if (trial) {
      const trialEndDate = new Date(trial.trialEnd)
      const now = new Date()
      const isTrialActive = trial.status === 'active' && now < trialEndDate

      if (isTrialActive) {
        const daysRemaining = Math.ceil(
          (trialEndDate - now) / (1000 * 60 * 60 * 24)
        )
        return {
          hasAccess: true,
          accessType: 'trial',
          daysRemaining,
          trialEndDate: trialEndDate.toISOString()
        }
      }
    }

    // Check subscription status
    if (subscription) {
      switch (subscription.status) {
        case 'active':
          return {
            hasAccess: true,
            accessType: 'subscription',
            planType: subscription.planType
          }

        case 'past_due':
          return {
            hasAccess: false,
            reason: 'Payment failed',
            accessType: 'past_due',
            canRetry: true
          }

        case 'cancelled':
          return {
            hasAccess: false,
            reason: 'Subscription cancelled',
            accessType: 'cancelled'
          }

        default:
          return {
            hasAccess: false,
            reason: `Subscription status: ${subscription.status}`,
            accessType: 'unknown'
          }
      }
    }

    return { hasAccess: false, reason: 'No active subscription or trial' }
  } catch (error) {
    console.error('Error checking user access:', error)
    return { hasAccess: false, reason: 'Error checking access' }
  }
}

/**
 * Get user-friendly message based on subscription status
 * @param {Object} accessStatus - Result from checkUserAccess
 * @returns {Object} User message and action
 */
export const getAccessMessage = (accessStatus) => {
  if (accessStatus.hasAccess) {
    if (accessStatus.accessType === 'trial') {
      return {
        type: 'success',
        title: 'Free Trial Active',
        message: `${accessStatus.daysRemaining} days remaining in your trial`,
        action: 'none'
      }
    } else {
      return {
        type: 'success',
        title: 'Subscription Active',
        message: `Your ${accessStatus.planType} plan is active`,
        action: 'none'
      }
    }
  } else {
    switch (accessStatus.accessType) {
      case 'past_due':
        return {
          type: 'warning',
          title: 'Payment Required',
          message: 'Your payment failed. Please update your payment method.',
          action: 'update_payment'
        }

      case 'cancelled':
        return {
          type: 'error',
          title: 'Subscription Cancelled',
          message:
            'Your subscription has been cancelled. Resubscribe to continue.',
          action: 'resubscribe'
        }

      default:
        return {
          type: 'info',
          title: 'Subscription Required',
          message: 'Start your free trial to access all features.',
          action: 'start_trial'
        }
    }
  }
}
