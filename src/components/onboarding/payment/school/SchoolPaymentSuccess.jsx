import React, { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { FaLock } from 'react-icons/fa'
import { toast } from 'react-toastify'
import './SchoolPaymentSuccess.css'
import { createInitialSchoolData } from '@/services/adminService'
import {
  generateEmailInvitationToken,
  sendSchoolAdminInvitationEmail
} from '@/services/invitationService'
import RedirectModal from './RedirectModal'
import { saveSchoolPaymentRecord } from '@/services/paymentService'

const BASIC_PRICE = 4.99
const PREMIUM_PRICE = 7.99

const SchoolPaymentSuccess = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const amount = searchParams.get('amount')
  const numOfSeats = parseInt(searchParams.get('numOfSeats'))
  const plan = searchParams.get('planType')
  const currentDate = new Date()
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const getTotalPrice = () => {
    const price = plan === 'premium' ? PREMIUM_PRICE : BASIC_PRICE
    return (price * numOfSeats).toFixed(2)
  }

  const getPerStudentPrice = () => {
    return plan === 'premium' ? PREMIUM_PRICE : BASIC_PRICE
  }

  const handleGenerateInvitationLink = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    if (!email) {
      toast.error('Please enter an email address')
      setIsLoading(false)
      return
    }

    try {
      const paymentId = await saveSchoolPaymentRecord(
        email,
        plan,
        parseFloat(getTotalPrice())
      )
      const schoolId = await createInitialSchoolData(
        email,
        numOfSeats,
        plan,
        paymentId
      )
      const token = await generateEmailInvitationToken(email, schoolId)
      const invitationLink = `${window.location.origin}/onboarding/school-admin-signup?invitationToken=${token}`
      await sendSchoolAdminInvitationEmail(email, invitationLink)
      setShowModal(true)
      setTimeout(() => {
        navigate(`/onboarding/school-admin-signup?invitationToken=${token}`)
      }, 5000)
    } catch (error) {
      console.error('Error sending invitation email:', error)
      toast.error('Error sending invitation email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='payment'>
      <div className='payment__container'>
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

          <div className='payment__summary-item'>
            <div className='payment__summary-label'>Date</div>
            <div className='payment__summary-value'>{formattedDate}</div>
          </div>

          <div className='payment__summary-item'>
            <div className='payment__summary-label'>Plan</div>
            <div className='payment__summary-value'>{plan?.toUpperCase()}</div>
          </div>

          <div className='payment__summary-item'>
            <div className='payment__summary-label'>Number of Seats</div>
            <div className='payment__summary-value'>{numOfSeats}</div>
          </div>

          <div className='payment__summary-item'>
            <div className='payment__summary-label'>Price per Student</div>
            <div className='payment__summary-value'>
              ${getPerStudentPrice()}
            </div>
          </div>

          <div className='payment__summary-total'>
            <div className='payment__summary-label'>Total</div>
            <div className='payment__summary-value'>${getTotalPrice()}</div>
          </div>
        </div>
        <form className='payment__form' onSubmit={handleGenerateInvitationLink}>
          <div className='payment__actions-item'>
            <div className='payment__actions-item'>
              <input
                type='email'
                className='payment__actions-input'
                placeholder='Enter your email address'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className='payment__actions-item'>
            <div className='payment__actions-item'>
              <button
                className='payment__submit-button'
                type='submit'
                disabled={isLoading}
              >
                {isLoading ? 'Redirecting...' : 'Generate Invitation Link'}
              </button>
            </div>
          </div>

          <div className='payment__secure-note'>
            <FaLock className='payment__lock-icon' />
            <span>Secure payment completed successfully</span>
          </div>
        </form>
      </div>
      <RedirectModal isOpen={showModal} seconds={5} />
    </div>
  )
}

export default SchoolPaymentSuccess
