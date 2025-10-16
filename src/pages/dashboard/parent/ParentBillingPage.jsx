import PaymentInformation from '@/components/dashboard/profile/PaymentInformation'
import PaymentHistory from '@/components/dashboard/profile/PaymentHistory'
import { ProfileProvider } from '@/context/ProfileContext'

import './ParentBillingPage.css'
import { useAuth } from '@/context/AuthContext'
import { useState, useEffect } from 'react'
import {
  getSubscriptionByUserId,
  getParentSubscriptionDetails,
  syncParentSubscription,
  redirectToParentCheckout
} from '@/services/paymentService'
import {
  MultipleYearly,
  SINGLE_CHILD_PLANS,
  MULTIPLE_CHILDREN_PLANS,
  PLAN_TYPES
} from '@/utils/staticData/subscriptionPlan'
import PagePreloader from '@/components/common/preloaders/PagePreloader'
import { formatUnixTimestamp } from '@/utils/dates/formatDate'
// Utility function to handle Firestore timestamps and Date objects
const convertTimestampToDate = (timestamp) => {
  if (!timestamp) return null

  if (timestamp.toDate) {
    // Firestore timestamp
    return timestamp.toDate()
  } else if (timestamp.seconds) {
    // Firestore timestamp with seconds
    return new Date(timestamp.seconds * 1000)
  } else if (timestamp instanceof Date) {
    // Regular Date object
    return timestamp
  } else {
    // Try to parse as regular date
    return new Date(timestamp)
  }
}

const ParentBillingPage = () => {
  const { currentUser } = useAuth()
  const [activeSubscription, setActiveSubscription] = useState(null)
  const [allSubscriptions, setAllSubscriptions] = useState(null)
  const [stripeSubscription, setStripeSubscription] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)

  useEffect(() => {
    if (currentUser) {
      setIsLoading(true)
      const fetchSubscription = async () => {
        const subscription = await getSubscriptionByUserId(currentUser.uid)
        console.log('subscription:', subscription)
        setActiveSubscription(subscription.activeSubscription)
        setAllSubscriptions(subscription.subscriptions)

        // If we have an active subscription
        if (subscription?.activeSubscription) {
          console.log('=== BILLING PAGE DEBUG ===')
          console.log(
            '1. Initial activeSubscription:',
            subscription.activeSubscription
          )
          console.log('2. All subscriptions:', subscription.subscriptions)

          // Check if trial has expired
          const shouldSync = checkTrialExpiration(
            subscription.activeSubscription
          )

          console.log('=== TRIAL EXPIRATION CHECK ===')
          console.log('Should sync:', shouldSync)
          console.log(
            'Active subscription status:',
            subscription.activeSubscription.status
          )
          console.log(
            'Active subscription trialEnd:',
            subscription.activeSubscription.trialEnd
          )
          console.log(
            'Active subscription stripeSubscriptionId:',
            subscription.activeSubscription.stripeSubscriptionId
          )
          console.log('=== END TRIAL EXPIRATION CHECK ===')

          if (shouldSync) {
            console.log('3. Trial has expired, calling sync functions')

            const syncResult = await syncParentSubscription(
              currentUser.uid,
              subscription.activeSubscription.email
            )

            console.log('4. Sync result:', syncResult)

            if (syncResult.success) {
              console.log('5. Sync successful:', syncResult.data)
              // Refresh the subscription data
              const refreshedSubscription = await getSubscriptionByUserId(
                currentUser.uid
              )
              console.log(
                '6. Refreshed subscription after sync:',
                refreshedSubscription
              )
              setActiveSubscription(refreshedSubscription.activeSubscription)
              setAllSubscriptions(refreshedSubscription.subscriptions)

              // Get Stripe details after sync only if stripeSubscriptionId exists
              if (
                refreshedSubscription.activeSubscription.stripeSubscriptionId
              ) {
                console.log(
                  '7. Getting Stripe details for subscription ID:',
                  refreshedSubscription.activeSubscription.stripeSubscriptionId
                )
                console.log('7a. Calling getParentSubscriptionDetails with:', {
                  subscriptionId:
                    refreshedSubscription.activeSubscription
                      .stripeSubscriptionId,
                  userId: currentUser.uid
                })

                const stripeDetails = await getParentSubscriptionDetails(
                  refreshedSubscription.activeSubscription.stripeSubscriptionId
                )

                console.log('8. Stripe details response:', stripeDetails)
                console.log(
                  '8a. Full stripeDetails object:',
                  JSON.stringify(stripeDetails, null, 2)
                )

                if (stripeDetails.success) {
                  console.log(
                    '9. Setting Stripe subscription data:',
                    stripeDetails.subscription.subscription?.items.data[0]
                  )
                  console.log(
                    '9a. Full subscription object:',
                    stripeDetails.subscription
                  )
                  setStripeSubscription(
                    stripeDetails.subscription.subscription?.items?.data[0]
                  )
                } else {
                  console.error(
                    '9. Failed to get Stripe details:',
                    stripeDetails.error
                  )
                  console.error('9a. Full error details:', stripeDetails)
                }
              } else {
                console.log('7. No stripeSubscriptionId found after sync')
                console.log(
                  '7a. Available subscription fields:',
                  Object.keys(refreshedSubscription.activeSubscription)
                )
              }
            } else {
              console.log('5. Sync failed:', syncResult.error)
              console.error('Sync error details:', syncResult.error)
            }
          } else {
            console.log(
              '3. Trial is still active or not in trial status, skipping sync'
            )
            console.log(
              '3a. Checking if we should call getParentSubscriptionDetails anyway...'
            )
            console.log(
              '3b. Has stripeSubscriptionId?',
              !!subscription.activeSubscription.stripeSubscriptionId
            )

            // Check if we should call getParentSubscriptionDetails even without sync
            if (subscription.activeSubscription.stripeSubscriptionId) {
              console.log(
                '3c. Calling getParentSubscriptionDetails without sync...'
              )
              try {
                const stripeDetails = await getParentSubscriptionDetails(
                  subscription.activeSubscription.stripeSubscriptionId
                )
                console.log('3d. Direct stripeDetails response:', stripeDetails)
                console.log(
                  '3e. Full stripeDetails object:',
                  JSON.stringify(stripeDetails, null, 2)
                )

                if (stripeDetails.success) {
                  console.log('3f. Setting Stripe subscription data directly')
                  setStripeSubscription(
                    stripeDetails.subscription.subscription?.items?.data[0]
                  )
                }
              } catch (error) {
                console.error(
                  '3g. Error calling getParentSubscriptionDetails directly:',
                  error
                )
              }
            }

            // Show existing trial data if still trialing
            if (subscription.activeSubscription.status === 'trialing') {
              console.log('4. Using existing trial data')
              setStripeSubscription({
                next_billing_date: subscription.activeSubscription.trialEnd,
                plan: {
                  amount: subscription.activeSubscription.amount,
                  interval: subscription.activeSubscription.interval || 'month'
                }
              })
            }
          }
          console.log('=== END BILLING PAGE DEBUG ===')
        }
        setIsLoading(false)
      }
      fetchSubscription()
    }
  }, [currentUser])

  // Helper function to check if trial has expired
  const checkTrialExpiration = (subscription) => {
    if (subscription.status !== 'trialing') {
      return false
    }

    if (!subscription.trialEnd) {
      return false
    }

    const trialEndDate = convertTimestampToDate(subscription.trialEnd)
    const currentDate = new Date()

    console.log('Trial end date:', trialEndDate)
    console.log('Current date:', currentDate)
    console.log('Trial expired:', trialEndDate < currentDate)

    return trialEndDate < currentDate
  }

  // Helper function to check if user can upgrade
  const canUpgrade = () => {
    if (!activeSubscription) return false

    const upgradeablePlans = [
      'singleMonthly',
      'singleYearly',
      'multipleMonthly'
    ]
    return upgradeablePlans.includes(activeSubscription.planType)
  }

  // Handle upgrade to Multiple Yearly plan
  const handleUpgrade = async () => {
    if (!currentUser) {
      console.error('No current user found')
      return
    }

    setIsUpgrading(true)

    try {
      const result = await redirectToParentCheckout(
        'multipleYearly',
        currentUser.uid,
        currentUser.email
      )

      if (!result.success) {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      alert(`Upgrade error: ${error.message}`)
    } finally {
      setIsUpgrading(false)
    }
  }

  // Get current plan features based on planType
  const getCurrentPlanFeatures = () => {
    if (!activeSubscription?.planType) return []

    const planType = activeSubscription.planType

    // Check single child plans
    if (SINGLE_CHILD_PLANS[planType]) {
      return SINGLE_CHILD_PLANS[planType].features
    }

    // Check multiple children plans
    if (MULTIPLE_CHILDREN_PLANS[planType]) {
      return MULTIPLE_CHILDREN_PLANS[planType].features
    }

    // Fallback to default features
    return [
      'Core safety curriculum',
      'Quizzes',
      'Automated Grading',
      'Parental Controls',
      'Progress Tracking Dashboard'
    ]
  }

  if (isLoading) {
    return <PagePreloader textData='Fetching subscription details....' />
  }

  return (
    <ProfileProvider>
      <div className='parent-billing-page'>
        {/* Header */}
        <div className='parent-billing-page__header'>
          <h1>Billing & Subscription</h1>
          <p>Manage your subscription, billing history, and payment methods.</p>
        </div>

        {/* Main Content - Left Column */}
        <div className='parent-billing-page__content-wrapper'>
          <div className='parent-billing-page__left-column'>
            {/* Current Plan Header - Outside Card */}
            <div className='current-plan__outer-container'>
              <div className='current-plan__outer-header'>
                <h2>
                  Current Plan{' '}
                  <span className='current-plan__status'>Active</span>
                </h2>
                {activeSubscription?.status === 'trialing' ? (
                  <span className='current-plan__status'>Free Trial</span>
                ) : (
                  <span className=''>Manage Subscription</span>
                )}
              </div>

              {/* Current Plan Card */}
              <div className='parent-billing-page__current-plan'>
                <div className='current-plan__details'>
                  <div className='current-plan__title-row'>
                    <h3 className='current-plan__name'>
                      {activeSubscription?.planType === 'singleYearly' ||
                      activeSubscription?.planType === 'singleMonthly'
                        ? 'Individual Plan'
                        : 'Family Plan'}{' '}
                      / Plan
                    </h3>
                    <div className='current-plan__price'>
                      <span className='price__amount'>
                        ${activeSubscription?.amount}
                      </span>
                      <span className='price__period'>
                        /
                        {activeSubscription?.interval === 'month'
                          ? 'month'
                          : 'year'}
                      </span>
                    </div>
                  </div>
                  <p className='current-plan__description'>
                    Perfect for growing families.
                  </p>
                  <ul className='current-plan__features'>
                    {getCurrentPlanFeatures().map((feature, index) => (
                      <li key={index} className='current-plan__feature-item'>
                        <span className='feature__check'>✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Current Plan Footer - Outside Card */}
              <div className='current-plan__outer-footer'>
                <p className='current-plan__next-billing'>
                  {activeSubscription?.status === 'trialing' ? (
                    <>
                      Trial ends :
                      {activeSubscription?.trialEnd
                        ? new Date(
                            activeSubscription.trialEnd
                          ).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Loading...'}
                    </>
                  ) : (
                    <>
                      Next billing date:{' '}
                      {stripeSubscription?.current_period_end
                        ? formatUnixTimestamp(
                            stripeSubscription?.current_period_end
                          )
                        : activeSubscription?.currentPeriodEnd
                        ? (() => {
                            const dateObj = convertTimestampToDate(
                              activeSubscription.currentPeriodEnd
                            )
                            return dateObj
                              ? dateObj.toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                              : 'Invalid date'
                          })()
                        : 'Loading...'}
                    </>
                  )}
                </p>

                {canUpgrade() && (
                  <div className='current-plan__btn-container'>
                    <button
                      className='current-plan__upgrade-btn'
                      onClick={handleUpgrade}
                      disabled={isUpgrading}
                    >
                      {isUpgrading ? 'Processing...' : 'Upgrade Plan'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Billing History */}
            <div className='parent-billing-page__billing-history'>
              <h2>Billing History</h2>
              <div className='billing-history__list'>
                <div className='billing-history__item'>
                  <div className='billing-history__icon'>📄</div>
                  <div className='billing-history__details'>
                    <div className='billing-history__invoice'>
                      Invoice #NV-2024-003
                    </div>
                    <div className='billing-history__date'>
                      February 15, 2024
                    </div>
                  </div>
                  <div className='billing-history__amount'>$20.00</div>
                  <div className='billing-history__status'>Paid</div>
                  <button className='billing-history__download'>⬇</button>
                </div>
                <div className='billing-history__item'>
                  <div className='billing-history__icon'>📄</div>
                  <div className='billing-history__details'>
                    <div className='billing-history__invoice'>
                      Invoice #NV-2024-002
                    </div>
                    <div className='billing-history__date'>
                      January 15, 2024
                    </div>
                  </div>
                  <div className='billing-history__amount'>$20.00</div>
                  <div className='billing-history__status'>Paid</div>
                  <button className='billing-history__download'>⬇</button>
                </div>
                <div className='billing-history__item'>
                  <div className='billing-history__icon'>📄</div>
                  <div className='billing-history__details'>
                    <div className='billing-history__invoice'>
                      Invoice #NV-2024-001
                    </div>
                    <div className='billing-history__date'>
                      December 15, 2023
                    </div>
                  </div>
                  <div className='billing-history__amount'>$10.00</div>
                  <div className='billing-history__status'>Paid</div>
                  <button className='billing-history__download'>⬇</button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Separate Container */}
          <div className='parent-billing-page__right-container'>
            {/* Payment Method */}
            <div className='parent-billing-page__payment-method'>
              <div className='payment-method__header'>
                <h2>Payment Method</h2>
                <button className='payment-method__update'>Update Card</button>
              </div>
              <div className='payment-method__content'>
                <div className='payment-method__card'>
                  <div className='card__icon'>💳</div>
                  <div className='card__details'>
                    <div className='card__number'>**** 4242</div>
                    <div className='card__expires'>Expires 12/26</div>
                  </div>
                </div>
                <div className='payment-method__info'>
                  <div className='cardholder__name'>Jane Doe</div>
                  <div className='cardholder__email'>john@example.com</div>
                  <span className='payment-method__default'>Default</span>
                </div>
              </div>
            </div>

            {/* Upgrade Options */}
            {canUpgrade() && (
              <div className='parent-billing-page__upgrade-options'>
                <h2>Upgrade Options</h2>
                <div className='upgrade-options__card'>
                  <div className='upgrade-options__header'>
                    <h3>{MultipleYearly.title}</h3>
                    <span className='upgrade-options__recommended'>
                      {MultipleYearly.savings}
                    </span>
                  </div>
                  <div className='upgrade-options__price'>
                    <span className='price__amount'>
                      {MultipleYearly.price}
                    </span>
                    <span className='price__period'>
                      {MultipleYearly.period}
                    </span>
                  </div>
                  <ul className='upgrade-options__features'>
                    {MultipleYearly.features.map((feature, index) => (
                      <li key={index}>
                        <span className='feature__check'>✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    className='upgrade-options__btn'
                    onClick={handleUpgrade}
                    disabled={isUpgrading}
                  >
                    {isUpgrading
                      ? 'Processing...'
                      : `Upgrade to ${MultipleYearly.title}`}
                  </button>
                </div>
              </div>
            )}

            {/* Billing Summary */}
            <div className='parent-billing-page__billing-summary'>
              <h2>Billing Summary</h2>
              <div className='billing-summary__content'>
                <div className='billing-summary__row'>
                  <span>Current Plan:</span>
                  <span>
                    $
                    {stripeSubscription?.plan?.amount
                      ? stripeSubscription.plan.amount.toFixed(2)
                      : activeSubscription?.amount || '0'}
                    /
                    {stripeSubscription?.plan?.interval ||
                      activeSubscription?.interval ||
                      'monthly'}
                  </span>
                </div>
                <div className='billing-summary__row'>
                  <span>Next Billing:</span>
                  <span>
                    {stripeSubscription?.current_period_end
                      ? formatUnixTimestamp(
                          stripeSubscription?.current_period_end
                        )
                      : activeSubscription?.trialEnd
                      ? (() => {
                          const dateObj = convertTimestampToDate(
                            activeSubscription.trialEnd
                          )
                          return dateObj
                            ? dateObj.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'Invalid date'
                        })()
                      : 'Loading...'}
                  </span>
                </div>
                <div className='billing-summary__row billing-summary__total'>
                  <span>Total:</span>
                  <span>
                    $
                    {stripeSubscription?.plan?.amount
                      ? stripeSubscription.plan.amount.toFixed(2)
                      : activeSubscription?.amount || '0'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Keep existing components for functionality */}
        <div style={{ display: 'none' }}>
          <PaymentInformation />
          <PaymentHistory />
        </div>
      </div>
    </ProfileProvider>
  )
}

export default ParentBillingPage
