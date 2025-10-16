import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { IoShieldCheckmark } from 'react-icons/io5'
import { FaGift } from 'react-icons/fa'
import { useAuth } from '@/context/AuthContext'
import { updateParentSubscriptionFeild } from '@/services/paymentService'

const Spinner = ({ counter = null }) => (
  <div
    style={{
      position: 'relative',
      display: 'inline-block',
      width: '16px',
      height: '16px',
      marginRight: '8px',
      verticalAlign: 'middle'
    }}
  >
    <div
      className='custom-spinner'
      style={{
        position: 'absolute',
        top: '-3px',
        left: '-2px',
        width: '100%',
        height: '100%',
        border: '3px solid rgb(255, 255, 255)',
        borderRadius: '50%',
        borderTop: '3px solid #000',
        animation: 'spinAnimation 1s linear infinite'
      }}
    />
    {counter !== null && (
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '10px',
          fontWeight: 'bold',
          zIndex: 1,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1
        }}
      >
        {counter}
      </div>
    )}
  </div>
)

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const { currentUser } = useAuth()
  const isTrial = searchParams.get('trial') === 'true'
  const planType = searchParams.get('planType')
  const amount = searchParams.get('amount')
  const [counter, setCounter] = useState(2)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const navigate = useNavigate()
  // const currentDate = new Date()
  // const formattedDate = currentDate.toLocaleDateString('en-US', {
  //   year: 'numeric',
  //   month: 'long',
  //   day: 'numeric'
  // })

  useEffect(() => {
    updateParentSubscriptionFeild(currentUser.uid)
    const styleSheet = document.createElement('style')
    styleSheet.type = 'text/css'
    styleSheet.innerText = `
      @keyframes spinAnimation {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .trial-success-icon {
        display: flex;
        justify-content: center;
        margin-bottom: 20px;
      }
      .trial-success-icon svg {
        font-size: 48px;
        color: #10b981;
        filter: drop-shadow(0 4px 8px rgba(16, 185, 129, 0.3));
      }
    `
    document.head.appendChild(styleSheet)

    return () => {
      document.head.removeChild(styleSheet)
    }
  }, [])

  // useEffect(() => {
  //   const timer =
  //     counter > 0 &&
  //     setTimeout(() => {
  //       setCounter(counter - 1)
  //     }, 1000)

  //   // if (counter === 0) {
  //   //   navigate('/onboarding/parent/child-account-type')
  //   // }

  //   return () => clearTimeout(timer)
  // }, [counter])
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     navigate('/dashboard/parent')
  //   }, 800)
  //   return () => clearTimeout(timer)
  // }, [])

  const handleRedirect = () => {
    console.log('redirecting')

    setIsRedirecting(true)
    setTimeout(() => {
      navigate('/dashboard/parent/profiles')
    }, 800)
  }

  return (
    <div className='payment'>
      <div className='payment__container'>
        {isTrial ? (
          <>
            <div className='parent-payment-trial-success-icon'>
              <FaGift />
            </div>
            <h1 className='payment__title'> Free Trial Started!</h1>
            <p className='payment__subtitle'>
              Welcome to your 7-day free trial of DIGIPALZ! Your {planType} plan
              is now active.
            </p>

            <div className='payment__summary-section'>
              <h2>Trial Summary</h2>

              <div className='payment__summary-item'>
                <div className='payment__summary-label'>
                  <div>Plan Type</div>
                </div>
                <div className='payment__summary-value'>
                  <span className='payment-success__status'>
                    {planType?.toUpperCase()} Plan
                  </span>
                </div>
              </div>

              <div className='payment__summary-item'>
                <div className='payment__summary-label'>
                  <div>Trial Status</div>
                </div>
                <div className='payment__summary-value'>
                  <span className='payment-success__status'>
                    Active - 7 Days
                  </span>
                </div>
              </div>

              <div className='payment__summary-item'>
                <div className='payment__summary-label'>
                  <div>Billing</div>
                </div>
                <div className='payment__summary-value'>
                  <span className='payment-success__status'>
                    Starts after trial
                  </span>
                </div>
              </div>
              <div className='payment__summary-item'>
                <div className='payment__summary-label'>
                  <div>Amount</div>
                </div>
                <div className='payment__summary-value'>
                  <span className='payment-success__status'>${amount}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <h1 className='payment__title'>Payment Confirmed</h1>
            <p className='payment__subtitle'>
              Thank you for your purchase. Your digital membership has been
              activated.
            </p>

            <div className='payment__summary-section'>
              <h2>Order Summary</h2>

              <div className='payment__summary-item'>
                <div className='payment__summary-label'>
                  <div>Status</div>
                </div>
                <div className='payment__summary-value'>
                  <span className='payment-success__status'>Completed</span>
                </div>
              </div>
              {/* 
              <div className='payment__summary-item'>
                <div className='payment__summary-label'>Date</div>
                <div className='payment__summary-value'>{formattedDate}</div>
              </div> */}

              <div className='payment__summary-total'>
                <div className='payment__summary-label'>Total</div>
                <div className='payment__summary-value'>${amount}</div>
              </div>
            </div>

            <div className='payment__card-info'>
              <p>
                A confirmation email has been sent to your registered email
                address. You now have access to all premium features.
              </p>
            </div>
          </>
        )}

        <div className='payment__actions'>
          <button
            onClick={handleRedirect}
            disabled={isRedirecting}
            className='payment__submit-button'
          >
            Setup Your Account
          </button>
        </div>

        <div className='payment__secure-note'>
          <IoShieldCheckmark className='payment__lock-icon' />
          <span>Secure payment completed successfully</span>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess
