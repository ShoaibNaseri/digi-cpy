import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FaLock, FaRegCreditCard } from 'react-icons/fa'
import { loadStripe } from '@stripe/stripe-js'
import { useAuth } from '@/context/AuthContext'
import {
  savePaymentRecord,
  checkAndSavePaymentRecord
} from '@/services/paymentService'
import stripeConfig from '@/config/stripe'
import './PaymentForm.css'
import PaymentSuccess from './PaymentSuccess'
const stripePromise = loadStripe(stripeConfig.stripePublicKey)

const PLAN_PRICE_IDS = {
  monthly: stripeConfig.stripeMonthlyPriceId,
  yearly: stripeConfig.stripeYearlyPriceId,
  family: stripeConfig.stripeFamilyPriceId
}

const PaymentForm = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [searchParams] = useSearchParams()
  const [planType, setPlanType] = useState('premium')
  const [planPrice, setPlanPrice] = useState(9.99)
  const [planDescription, setPlanDescription] = useState('Premium Tier License')
  const [planDetails, setPlanDetails] = useState('Includes 3,500 student seats')
  const [loading, setLoading] = useState(false)
  const [paymentSaved, setPaymentSaved] = useState(false)

  useEffect(() => {
    const plan = searchParams.get('plan')
    if (plan) {
      switch (plan) {
        case 'monthly':
          setPlanType('monthly')
          setPlanPrice(9.99)
          setPlanDescription('Monthly Plan')
          setPlanDetails('Complete access to all cyber safety missions')
          break
        case 'yearly':
          setPlanType('yearly')
          setPlanPrice(99)
          setPlanDescription('Yearly Plan')
          setPlanDetails('Complete access with two months free')
          break
        case 'family':
          setPlanType('family')
          setPlanPrice(120)
          setPlanDescription('Family Plan')
          setPlanDetails('Access for up to 5 family members')
          break
        default:
          break
      }
    }

    const success = searchParams.get('success')
    const sessionId = searchParams.get('session_id')
    const isTrial = searchParams.get('trial') === 'true'

    // Only process payment records for non-trial payments
    // Trial payments (parent subscriptions) are handled by Firebase functions and webhooks
    if (success === 'true' && !paymentSaved && sessionId && !isTrial) {
      setLoading(false)
      const savedPlanType = searchParams.get('planType') || planType
      const savedAmount = parseFloat(searchParams.get('amount')) || planPrice

      // Check if payment already exists to prevent duplicates
      checkAndSavePaymentRecord(
        currentUser.uid,
        currentUser.email,
        savedPlanType,
        savedAmount,
        sessionId
      )
        .then(() => {
          setPaymentSaved(true)
          // Removed auto-redirect - user stays on success page
        })
        .catch((error) => {
          console.error('Error saving payment:', error)
        })
    } else if (success === 'true' && isTrial) {
      // For trial payments, just set as processed without creating payment records
      setPaymentSaved(true)
      setLoading(false)
    }
  }, [searchParams, navigate, currentUser, planType, planPrice, paymentSaved])

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)

    try {
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      const priceId = PLAN_PRICE_IDS[planType]

      if (!priceId) {
        throw new Error('Invalid plan selected')
      }

      const { error } = await stripe.redirectToCheckout({
        mode: planType === 'family' ? 'payment' : 'subscription',
        lineItems: [
          {
            price: priceId,
            quantity: 1
          }
        ],
        successUrl: `${window.location.origin}/onboarding/payment?success=true&planType=${planType}&amount=${planPrice}`,
        cancelUrl: `${window.location.origin}/onboarding/payment?plan=${planType}`,
        billingAddressCollection: 'required',
        submitType: 'pay'
      })

      if (error) {
        throw error
      }
    } catch (err) {
      console.error('Payment error:', err)
      setLoading(false)
    }
  }

  const handleBackToSelection = () => {
    navigate(-1)
  }

  const isSuccess = searchParams.get('success') === 'true'

  if (isSuccess) {
    return <PaymentSuccess />
  }

  return (
    <div className='payment'>
      <div className='payment__container'>
        <h1 className='payment__title'>Payment Details</h1>
        <p className='payment__subtitle'>
          Please enter your payment information below
        </p>
        <form onSubmit={handleSubmit}>
          <div className='payment__card-section'>
            <div className='payment__section-header'>
              <FaRegCreditCard className='payment__section-icon' />
              <h2 className='payment__section-title'>Payment Method</h2>
            </div>
            <p className='payment__card-info'>
              You'll be redirected to Stripe's secure payment page to complete
              your purchase.
            </p>
          </div>

          <div className='payment__summary-section'>
            <h2>Order Summary</h2>

            <div className='payment__summary-item'>
              <div className='payment__summary-label'>
                <div>{planDescription}</div>
                <div className='payment__summary-sublabel'>{planDetails}</div>
              </div>
              <div className='payment__summary-value'>
                ${planPrice.toFixed(2)}
              </div>
            </div>

            <div className='payment__summary-item'>
              <div className='payment__summary-label'>Tax</div>
              <div className='payment__summary-value'>$0.00</div>
            </div>

            <div className='payment__summary-total'>
              <div className='payment__summary-label'>Total</div>
              <div className='payment__summary-value'>
                ${planPrice.toFixed(2)}
              </div>
            </div>
          </div>

          <div className='payment__actions'>
            <button
              type='submit'
              className='payment__submit-button'
              disabled={loading}
            >
              {loading ? 'Processing...' : `Pay $${planPrice.toFixed(2)}`}
            </button>
            <button
              type='button'
              className='payment__back-button'
              onClick={handleBackToSelection}
              disabled={loading}
            >
              Back to Selection
            </button>
          </div>
        </form>

        <div className='payment__secure-note'>
          <FaLock className='payment__lock-icon' />
          <span>Secure payment powered by Stripe</span>
        </div>
        <div className='payment__help'>
          <span>Got questions?</span>
          <a
            href='https://calendly.com/samantha-digipalz/digipalz-consultation-call-with-founder'
            className='payment__schedule-link'
            target='_blank'
            rel='noopener noreferrer'
          >
            Schedule a call with us now
          </a>
        </div>
      </div>
    </div>
  )
}

export default PaymentForm
