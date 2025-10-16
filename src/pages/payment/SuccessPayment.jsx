// In your success-payment page component
import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import './SuccessPayment.css'
import { useAuth } from '@/context/AuthContext'
import { getPaymentRecord } from '@/services/paymentService'
import { updateUser } from '../../services/adminService'
import { updatePaymentSessionStatus } from '@/services/paymentService'
import { updateSchoolPurchasedSeat } from '@/services/seatsManageService'
const SuccessPayment = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [customerData, setCustomerData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { currentUser } = useAuth()

  useEffect(() => {
    if (currentUser) {
      setLoading(true)
      setError(null)

      const processPaymentSuccess = async () => {
        try {
          const sessionId = searchParams.get('session_id')

          if (!sessionId) {
            setError('No session ID found')
            setLoading(false)
            return
          }

          // Step 1: Update payment session status
          const paymentUpdateResult = await updatePaymentSessionStatus(
            sessionId
          )

          if (!paymentUpdateResult.success) {
            setError('Payment session status update failed')
            setLoading(false)
            return
          }

          // Step 2: Get payment record data
          const customerDetails = await getPaymentRecord(sessionId)

          if (customerDetails.error) {
            setError('Failed to fetch payment details')
            setLoading(false)
            return
          }

          // Check if user has schoolId for different flow
          if (currentUser.schoolId) {
            // School flow: Update school purchased seats
            const seatsUpdateResult = await updateSchoolPurchasedSeat(
              currentUser.schoolId,
              parseInt(customerDetails.numOfSeats) || 0
            )

            if (!seatsUpdateResult.success) {
              setError('Failed to update school purchased seats')
              setLoading(false)
              return
            }
          } else {
            // Regular user flow: Update user subscription status
            const userUpdateResult = await updateUser(currentUser.uid, {
              hasSubscription: true
            })

            if (!userUpdateResult.success) {
              setError('User subscription update failed')
              setLoading(false)
              return
            }
          }

          setCustomerData(customerDetails)
        } catch (error) {
          setError('An error occurred while processing your payment')
        } finally {
          setLoading(false)
        }
      }

      processPaymentSuccess()
    }
  }, [currentUser, searchParams])
  if (error) {
    return (
      <div className='success-payment'>
        <div className='success-payment__container'>
          <div className='success-payment__icon-error'></div>
          <h1 className='success-payment__title'>Error</h1>
          <p className='success-payment__error-message'>
            {error}
            <br />
            Please try again later.
          </p>
        </div>
      </div>
    )
  }
  if (loading) {
    return (
      <div className='success-payment__loading'>
        <div className='success-payment__spinner'></div>
        <div className='success-payment__loading-text'>
          Processing your purchase...
        </div>
      </div>
    )
  }

  const seatsCount = searchParams.get('seats')
  const totalAmount = searchParams.get('total')
  const planType = searchParams.get('planType')
  const discountPercent = searchParams.get('discountPercent')
  const discount = searchParams.get('discount')

  return (
    <div className='success-payment'>
      <div className='success-payment__container'>
        <div className='success-payment__icon'></div>

        <h1 className='success-payment__title'>Payment Successful!</h1>
        <p className='success-payment__subtitle'>
          Thank you for your purchase! Your transaction has been completed
          successfully.
        </p>

        <div className='success-payment__details'>
          <h2 className='success-payment__details-title'>Purchase Details</h2>

          <div className='success-payment__detail-item'>
            <span className='success-payment__detail-label'>Email:</span>
            <span className='success-payment__detail-value'>
              {customerData?.email}
            </span>
          </div>

          <div className='success-payment__detail-item'>
            <span className='success-payment__detail-label'>Plan Type:</span>
            <span className='success-payment__detail-value success-payment__plan-highlight'>
              {customerData?.planType
                ? `${
                    customerData?.planType.charAt(0).toUpperCase() +
                    customerData?.planType.slice(1)
                  } Plan`
                : 'N/A'}
            </span>
          </div>

          <div className='success-payment__detail-item'>
            <span className='success-payment__detail-label'>
              Seats Purchased:
            </span>
            <span className='success-payment__detail-value success-payment__seats-highlight'>
              {customerData?.numOfSeats}{' '}
              {customerData?.numOfSeats === '1' ? 'seat' : 'seats'}
            </span>
          </div>

          {customerData?.discount && parseInt(customerData?.discount) > 0 && (
            <div className='success-payment__detail-item'>
              <span className='success-payment__detail-label'>
                Volume Discount:
              </span>
              <span className='success-payment__detail-value success-payment__discount-highlight'>
                {customerData?.discount}% OFF Applied
              </span>
            </div>
          )}

          <div className='success-payment__detail-item'>
            <span className='success-payment__detail-label'>Total Amount:</span>
            <span className='success-payment__detail-value'>
              ${(customerData?.total / 100).toFixed(2)}
            </span>
          </div>

          {customerData?.discount && (
            <div className='success-payment__detail-item'>
              <span className='success-payment__detail-label'>Discount:</span>
              <span className='success-payment__detail-value success-payment__discount-highlight'>
                {customerData?.discount}% off (Saved $
                {Math.round(
                  (customerData?.total / 100) * (customerData?.discount / 100)
                )}
                )
              </span>
            </div>
          )}

          <div className='success-payment__detail-item'>
            <span className='success-payment__detail-label'>
              Payment Status:
            </span>
            <span className='success-payment__status'>
              ✓ {customerData?.paymentStatus}
            </span>
          </div>
        </div>

        <div className='success-payment__invitation'>
          <p className='success-payment__invitation-text'>
            🎉 Congratulations! You have successfully purchased the{' '}
            {customerData?.planType
              ? `${
                  customerData?.planType.charAt(0).toUpperCase() +
                  customerData?.planType.slice(1)
                } Plan`
              : 'subscription'}{' '}
            with {customerData?.numOfSeats}{' '}
            {customerData?.numOfSeats === '1' ? 'seat' : 'seats'} for Digipalz!
            {customerData?.discount && parseInt(customerData?.discount) > 0 && (
              <span className='success-payment__discount-text'>
                {' '}
                (with {customerData?.discount}% volume discount applied)
              </span>
            )}
          </p>
        </div>

        <div className='success-payment__next-steps'>
          {currentUser?.schoolId ? (
            <button
              onClick={() => navigate('/dashboard/educator')}
              className='success-payment__next-steps-button'
            >
              GO TO DASHBOARD
            </button>
          ) : (
            <button
              onClick={() => navigate('/educator-access/school-onboarding')}
              className='success-payment__next-steps-button'
            >
              SETUP YOUR SCHOOL
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default SuccessPayment
