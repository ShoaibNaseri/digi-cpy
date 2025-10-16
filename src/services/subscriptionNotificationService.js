import { saveUserNotification } from './notificationService'

/**
 * Create trial reminder notifications
 * @param {string} userId - User ID
 * @param {number} daysRemaining - Days left in trial
 */
export const createTrialReminderNotification = async (
  userId,
  daysRemaining
) => {
  let notification

  if (daysRemaining === 7) {
    notification = {
      title: '7 Days Left in Your Free Trial',
      message:
        'Your free trial expires in 7 days. Your subscription will automatically start after the trial ends.',
      type: 'info',
      action: 'view_subscription'
    }
  } else if (daysRemaining === 3) {
    notification = {
      title: '3 Days Left in Your Free Trial',
      message:
        'Your free trial expires soon. Make sure your payment method is ready.',
      type: 'warning',
      action: 'view_subscription'
    }
  } else if (daysRemaining === 1) {
    notification = {
      title: 'Last Day of Your Free Trial',
      message: 'Your trial expires tomorrow. Billing will begin automatically.',
      type: 'warning',
      action: 'view_subscription'
    }
  }

  if (notification) {
    await saveUserNotification(userId, notification)
  }
}

/**
 * Create subscription status change notifications
 * @param {string} userId - User ID
 * @param {string} status - New subscription status
 * @param {string} planType - Plan type
 */
export const createSubscriptionStatusNotification = async (
  userId,
  status,
  planType
) => {
  let notification

  switch (status) {
    case 'active':
      notification = {
        title: 'Subscription Activated!',
        message: `Your ${planType} plan is now active. Enjoy full access to all features.`,
        type: 'success',
        action: 'view_features'
      }
      break

    case 'past_due':
      notification = {
        title: 'Payment Required',
        message:
          'Your payment failed. Please update your payment method to continue your subscription.',
        type: 'error',
        action: 'update_payment'
      }
      break

    case 'cancelled':
      notification = {
        title: 'Subscription Cancelled',
        message:
          'Your subscription has been cancelled. You can resubscribe anytime.',
        type: 'info',
        action: 'resubscribe'
      }
      break

    case 'unpaid':
      notification = {
        title: 'Subscription Suspended',
        message:
          'Your subscription is suspended due to unpaid invoices. Please update your payment.',
        type: 'error',
        action: 'update_payment'
      }
      break
  }

  if (notification) {
    await saveUserNotification(userId, notification)
  }
}
