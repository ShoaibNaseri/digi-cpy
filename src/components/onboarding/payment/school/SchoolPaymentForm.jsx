import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FaLock, FaRegCreditCard } from 'react-icons/fa'
import { loadStripe } from '@stripe/stripe-js'
import stripeConfig from '@/config/stripe'
import './SchoolPaymentForm.css'
import SchoolPaymentSuccess from './SchoolPaymentSuccess'
const stripePromise = loadStripe(stripeConfig.stripePublicKey)

const PLAN_PRICE_IDS = {
  basic: stripeConfig.stripeBasicPriceId,
  premium: stripeConfig.stripePremiumPriceId
}

const BASIC_PRICE = 4.99
const PREMIUM_PRICE = 7.99

const SchoolPaymentForm = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const plan = searchParams.get('plan')
  const numOfSeats = searchParams.get('numOfSeats')
  const [planType, setPlanType] = useState('premium')
  const [planPrice, setPlanPrice] = useState(PREMIUM_PRICE)
  const [planDescription, setPlanDescription] = useState('Premium Tier License')
  const [planDetails, setPlanDetails] = useState('Includes 3,500 student seats')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (plan) {
      switch (plan) {
        case 'basic':
          setPlanType('basic')
          setPlanPrice(BASIC_PRICE * numOfSeats)
          setPlanDescription('Basic Tier License')
          setPlanDetails(`Includes ${numOfSeats} student seats`)
          break
        case 'premium':
          setPlanType('premium')
          setPlanPrice(PREMIUM_PRICE * numOfSeats)
          setPlanDescription('Premium Tier License')
          setPlanDetails(`Includes ${numOfSeats} student seats`)
          break
        default:
          break
      }
    }
  }, [searchParams, navigate, planType, planPrice])

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
        mode: 'subscription',
        lineItems: [
          {
            price: priceId,
            quantity: parseInt(numOfSeats)
          }
        ],
        successUrl: `${
          window.location.origin
        }/school-plan-options/school-payment?success=true&planType=${planType}&amount=${parseInt(
          numOfSeats
        )}&numOfSeats=${numOfSeats}`,
        cancelUrl: `${window.location.origin}/school-plan-options/school-payment?plan=${planType}&numOfSeats=${numOfSeats}`,
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
    return <SchoolPaymentSuccess />
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

export default SchoolPaymentForm
