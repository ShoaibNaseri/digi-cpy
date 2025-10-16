import React, { useState, useEffect } from 'react'
import {
  FaGraduationCap,
  FaCrown,
  FaCheck,
  FaUsers,
  FaHome,
  FaRegCheckCircle
} from 'react-icons/fa'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import './SchoolPlanOptions.css'
import { useSearchParams } from 'react-router-dom'
import { isEmpty } from 'lodash'
import { stripePromise } from '@/utils/stripeLoader'
import { firebaseConfig } from '@/firebase/config'
import { useAuth } from '@/context/AuthContext'
import {
  calculateDiscountedPrice,
  calculateTotalDiscountedPrice,
  getVolumeDiscountRate,
  formatPrice,
  formatDiscountPercentage
} from '@/utils/discountCalculator'

const BASIC_PRICE = 4.99
const PREMIUM_PRICE = 5.99
const MAX_STUDENTS = 5000
const MONTHS_PER_YEAR = 10

const SchoolPlanOptions = () => {
  const [searchParams] = useSearchParams()
  const [studentCount, setStudentCount] = useState('')
  const [inputError, setInputError] = useState('')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const currentYear = new Date().getFullYear()
  const { currentUser } = useAuth()

  useEffect(() => {
    const plan = searchParams.get('plan')
    const numOfSeats = searchParams.get('numOfSeats')
    setSelectedPlan(plan)
    setStudentCount(numOfSeats || '')
  }, [searchParams])

  const handleStudentCountChange = (e) => {
    const value = e.target.value.replace(/\D/, '')
    if (value === '' || Number(value) <= MAX_STUDENTS) {
      setStudentCount(value)
      setInputError('')
    } else {
      setInputError(
        'For 5,000+ students, please contact us for custom pricing.'
      )
    }
  }

  const getDiscountRate = (count) => {
    return getVolumeDiscountRate(count)
  }

  const renderPlanOptions = (planType) => {
    switch (planType) {
      case 'basic':
        return (
          <>
            <div
              className={`school-plan-card ${
                selectedPlan === 'basic' ? 'selected' : ''
              }`}
              onClick={() => setSelectedPlan('basic')}
            >
              <div className='school-plan-card-header'>
                <FaGraduationCap className='school-plan-icon basic-plan-icon' />
                <span className='school-plan-tier-title'>Basic Tier</span>
              </div>
              <div className='school-plan-price'>
                ${BASIC_PRICE}
                <span>
                  {' '}
                  <div className='school-plan-period'>
                    / per student/month
                  </div>{' '}
                </span>
              </div>
              <ul className='school-plan-features'>
                <li>
                  <IoIosCheckmarkCircle className='school-plan-check-icon' />{' '}
                  Core cyber safety curriculum ( 10 Lessons )
                </li>
                <li>
                  <IoIosCheckmarkCircle className='school-plan-check-icon' />{' '}
                  Basic reporting feaures
                </li>
                <li>
                  <IoIosCheckmarkCircle className='school-plan-check-icon' />{' '}
                  Student progress tracking
                </li>
                <li>
                  <IoIosCheckmarkCircle className='school-plan-check-icon' />{' '}
                  Admin dashboard
                </li>
              </ul>
              <button
                className={`school-plan-action ${
                  !isEmpty(selectedPlan) && selectedPlan === 'basic'
                    ? 'selected-plan'
                    : ''
                }`}
              >
                {!isEmpty(selectedPlan) && selectedPlan === 'basic'
                  ? 'Selected Plan'
                  : 'Select Plan'}
              </button>
            </div>
          </>
        )
      case 'premium':
        return (
          <>
            {' '}
            <div
              className={`school-plan-card ${
                selectedPlan === 'premium' ? 'selected' : ''
              }`}
              onClick={() => setSelectedPlan('premium')}
            >
              <div className='school-plan-card-header'>
                <FaCrown className='school-plan-icon premium-plan-icon' />
                <span className='school-plan-tier-title'>Premium Tier</span>
              </div>
              <div className='school-plan-price'>
                ${PREMIUM_PRICE}{' '}
                <span>
                  {' '}
                  <div className='school-plan-period'>
                    / per student/month
                  </div>{' '}
                </span>
              </div>

              <ul className='school-plan-features'>
                <li>
                  <IoIosCheckmarkCircle className='school-plan-check-icon' />{' '}
                  Core cyber safety curriculum ( 10 Lessons )
                </li>
                <li>
                  <IoIosCheckmarkCircle className='school-plan-check-icon' />{' '}
                  Two bonus Lessons
                </li>
                <li>
                  <IoIosCheckmarkCircle className='school-plan-check-icon' />{' '}
                  Advanced reporting features
                </li>
                <li>
                  <IoIosCheckmarkCircle className='school-plan-check-icon' />{' '}
                  Student progress tracking
                </li>
                <li>
                  <IoIosCheckmarkCircle className='school-plan-check-icon' /> Ai
                  incident reporting tool
                </li>
                <li>
                  <IoIosCheckmarkCircle className='school-plan-check-icon' /> AI
                  Incident Chatbot
                </li>
                <li>
                  <IoIosCheckmarkCircle className='school-plan-check-icon' />{' '}
                  Personalized Protection Plans
                </li>
                <li>
                  <IoIosCheckmarkCircle className='school-plan-check-icon' />{' '}
                  Monthly Incident Analytics
                </li>
                <li>
                  <IoIosCheckmarkCircle className='school-plan-check-icon' />{' '}
                  Account Manager
                </li>
              </ul>
              <button
                className={`school-plan-action ${
                  !isEmpty(selectedPlan) && selectedPlan === 'premium'
                    ? 'selected-plan'
                    : ''
                }`}
              >
                {!isEmpty(selectedPlan) && selectedPlan === 'premium'
                  ? 'Selected Plan'
                  : 'Select Plan'}
              </button>
            </div>
          </>
        )
      default:
        return (
          <>
            <div
              className={`school-plan-card ${
                selectedPlan === 'basic' ? 'selected' : ''
              }`}
              onClick={() => setSelectedPlan('basic')}
            >
              <div className='school-plan-card-header'>
                <FaGraduationCap className='school-plan-icon basic-plan-icon' />
                <span className='school-plan-tier-title'>Basic Tier</span>
              </div>
              <div className='school-plan-price'>
                ${BASIC_PRICE}
                <span>
                  {' '}
                  <div className='school-plan-period'>
                    / per student/month
                  </div>{' '}
                </span>
              </div>
              <ul className='school-plan-features'>
                <li>
                  <IoIosCheckmarkCircle className='school-plan-check-icon' />{' '}
                  Core cyber safety curriculum ( 10 Lessons )
                </li>
                <li>
                  <IoIosCheckmarkCircle className='school-plan-check-icon' />{' '}
                  Basic reporting feaures
                </li>
                <li>
                  <IoIosCheckmarkCircle className='school-plan-check-icon' />{' '}
                  Student progress tracking
                </li>
                <li>
                  <IoIosCheckmarkCircle className='school-plan-check-icon' />{' '}
                  Admin dashboard
                </li>
              </ul>
              <button
                className={`school-plan-action ${
                  !isEmpty(selectedPlan) && selectedPlan === 'basic'
                    ? 'selected-plan'
                    : ''
                }`}
              >
                {!isEmpty(selectedPlan) && selectedPlan === 'basic'
                  ? 'Selected Plan'
                  : 'Select Plan'}
              </button>
            </div>
            <div
              className={`school-plan-card ${
                selectedPlan === 'premium' ? 'selected' : ''
              }`}
              onClick={() => setSelectedPlan('premium')}
            >
              <div className='school-plan-card-header'>
                <FaCrown className='school-plan-icon premium-plan-icon' />
                <span className='school-plan-tier-title'>Premium Tier</span>
              </div>
              <div className='school-plan-price'>
                ${PREMIUM_PRICE}{' '}
                <span>
                  {' '}
                  <div className='school-plan-period'>
                    / per student/month
                  </div>{' '}
                </span>
              </div>

              <ul className='school-plan-features'>
                <li>
                  <IoIosCheckmarkCircle className='school-plan-check-icon' />{' '}
                  Core cyber safety curriculum ( 10 Lessons )
                </li>
                <li>
                  <IoIosCheckmarkCircle className='school-plan-check-icon' />{' '}
                  Two bonus Lessons
                </li>
                <li>
                  <IoIosCheckmarkCircle className='school-plan-check-icon' />{' '}
                  Advanced reporting features
                </li>
                <li>
                  <IoIosCheckmarkCircle className='school-plan-check-icon' />{' '}
                  Student progress tracking
                </li>
                <li>
                  <IoIosCheckmarkCircle className='school-plan-check-icon' /> Ai
                  incident reporting tool
                </li>
                <li>
                  <IoIosCheckmarkCircle className='school-plan-check-icon' /> AI
                  Incident Chatbot
                </li>
                <li>
                  <IoIosCheckmarkCircle className='school-plan-check-icon' />{' '}
                  Personalized Protection Plans
                </li>
                <li>
                  <IoIosCheckmarkCircle className='school-plan-check-icon' />{' '}
                  Monthly Incident Analytics
                </li>
                <li>
                  <IoIosCheckmarkCircle className='school-plan-check-icon' />{' '}
                  Account Manager
                </li>
              </ul>
              <button
                className={`school-plan-action ${
                  !isEmpty(selectedPlan) && selectedPlan === 'premium'
                    ? 'selected-plan'
                    : ''
                }`}
              >
                {!isEmpty(selectedPlan) && selectedPlan === 'premium'
                  ? 'Selected Plan'
                  : 'Select Plan'}
              </button>
            </div>
          </>
        )
    }
  }
  const renderPrice = (price) => {
    if (!studentCount) return { perStudent: formatPrice(price), total: null }
    const count = Number(studentCount)
    if (count > MAX_STUDENTS) return { perStudent: 'Contact Us', total: null }
    const discount = getDiscountRate(count)
    if (discount === null) return { perStudent: 'Custom', total: null }
    const discountedPrice = calculateDiscountedPrice(price, discount * 100)
    const total = calculateTotalDiscountedPrice(
      price,
      count * MONTHS_PER_YEAR,
      discount * 100
    )
    return {
      perStudent: formatPrice(discountedPrice),
      total: formatPrice(total)
    }
  }

  const handleSelectPlan = async (e) => {
    e.preventDefault()

    if (isLoading) return // Prevent multiple submissions

    setIsLoading(true)

    try {
      const response = await fetch(
        `${firebaseConfig.functionsUrl}/createCheckoutSession`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            seatCount: parseInt(studentCount),
            planType: selectedPlan,
            email: currentUser.email,
            userId: currentUser.uid
          })
        }
      )

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        alert(
          `Error: ${data.error || 'Unknown error'}\nDetails: ${
            data.details || 'No details'
          }`
        )
        return
      }

      if (!data.sessionId) {
        alert('Failed to create Stripe session - no session ID returned.')
        return
      }

      const stripe = await stripePromise
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      })

      if (error) {
        console.error(error)
        alert(error.message)
      }
    } catch (err) {
      console.error('Request failed:', err)
      alert(`Something went wrong: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='school-plan-options-main'>
      <div className='school-plan-header'>
        <div className='school-plan-options-header-container'>
          <FaHome className='' />
          <h1>School License Pricing</h1>
        </div>
        {currentUser.schoolId ? (
          <div>
            <p className='school-plan-subtitle'>
              Purchase more seats for your{' '}
              <span className='school-plan-subtitle-year'>
                {currentUser?.planType === 'basic'
                  ? 'Basic Tier'
                  : 'Premium Tier'}
              </span>
            </p>
          </div>
        ) : (
          <p className='school-plan-subtitle'>
            Have a question or want a demo?{' '}
            <span
              onClick={() => {
                window.open(
                  'https://calendly.com/samantha-digipalz/digipalz-consultation-call-with-founder',
                  '_blank'
                )
              }}
              className='school-plan-subtitle-year'
            >
              Schedule a call
            </span>
          </p>
        )}
      </div>
      <div className='school-plan-cards-row'>
        {renderPlanOptions(currentUser?.planType)}
      </div>
      <div className='school-plan-volume-discount'>
        <h2>Calculate Your Volume Discount</h2>
        {inputError ? (
          <div className='school-plan-volume-note note-error'>{inputError}</div>
        ) : (
          <div className='school-plan-volume-note'>
            * For 5,000+ students, please contact us for custom pricing
          </div>
        )}
        <form className='school-plan-volume-form' onSubmit={handleSelectPlan}>
          <div className='school-plan-volume-input-wrapper-container'>
            <div className='school-plan-volume-input-wrapper'>
              <input
                id='student-count'
                className='school-plan-volume-input'
                type='text'
                placeholder='Enter number of students'
                value={studentCount}
                onChange={handleStudentCountChange}
                maxLength={5}
              />
              <span className='school-plan-volume-input-icon'>
                <FaUsers />
              </span>
            </div>
            <div className='school-plan-volume-prices'>
              <div
                className={`school-plan-volume-price-box ${
                  selectedPlan === 'basic' ? 'selected' : ''
                }`}
                onClick={() => setSelectedPlan('basic')}
              >
                <div className='school-plan-volume-tier'>Basic Tier Price</div>
                <div className='school-plan-volume-amount'>
                  {(() => {
                    const count = Number(studentCount)
                    const discount = getDiscountRate(count)
                    const original = BASIC_PRICE
                    const discounted =
                      discount !== null
                        ? calculateDiscountedPrice(original, discount * 100)
                        : original
                    if (discount && discount > 0) {
                      return (
                        <>
                          <span
                            style={{
                              textDecoration: 'line-through',
                              color: '#888',
                              fontSize: '0.9em',
                              marginRight: 6
                            }}
                          >
                            {formatPrice(original)}
                          </span>
                          <span style={{ color: 'green', fontWeight: 600 }}>
                            {formatPrice(discounted)}
                          </span>
                        </>
                      )
                    }
                    return <span>{formatPrice(original)}</span>
                  })()}
                </div>
                {(() => {
                  const count = Number(studentCount)
                  const discount = getDiscountRate(count)
                  if (discount && discount > 0) {
                    return (
                      <div
                        style={{
                          color: 'green',
                          fontSize: '0.95em',
                          marginBottom: 4
                        }}
                      >
                        Discounted Price - {formatDiscountPercentage(discount)}{' '}
                        OFF
                      </div>
                    )
                  }
                  return null
                })()}
                {studentCount && renderPrice(BASIC_PRICE).total && (
                  <div className='school-plan-volume-total'>
                    Total: {renderPrice(BASIC_PRICE).total}
                  </div>
                )}
              </div>
              <div
                className={`school-plan-volume-price-box ${
                  selectedPlan === 'premium' ? 'selected' : ''
                }`}
                onClick={() => setSelectedPlan('premium')}
              >
                <div className='school-plan-volume-tier'>
                  Premium Tier Price
                </div>
                <div className='school-plan-volume-amount'>
                  {(() => {
                    const count = Number(studentCount)
                    const discount = getDiscountRate(count)
                    const original = PREMIUM_PRICE
                    const discounted =
                      discount !== null
                        ? calculateDiscountedPrice(original, discount * 100)
                        : original
                    if (discount && discount > 0) {
                      return (
                        <>
                          <span
                            style={{
                              textDecoration: 'line-through',
                              color: '#888',
                              fontSize: '0.9em',
                              marginRight: 6
                            }}
                          >
                            {formatPrice(original)}
                          </span>
                          <span style={{ color: 'green', fontWeight: 600 }}>
                            {formatPrice(discounted)}
                          </span>
                        </>
                      )
                    }
                    return <span>{formatPrice(original)}</span>
                  })()}
                </div>
                {(() => {
                  const count = Number(studentCount)
                  const discount = getDiscountRate(count)
                  if (discount && discount > 0) {
                    return (
                      <div
                        style={{
                          color: 'green',
                          fontSize: '0.95em',
                          marginBottom: 4
                        }}
                      >
                        Discounted Price - {formatDiscountPercentage(discount)}{' '}
                        OFF
                      </div>
                    )
                  }
                  return null
                })()}
                {studentCount && renderPrice(PREMIUM_PRICE).total && (
                  <div className='school-plan-volume-total'>
                    Total: {renderPrice(PREMIUM_PRICE).total}
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            className='school-plan-purchase-btn'
            disabled={!selectedPlan || !studentCount || isLoading}
            type='submit'
          >
            {isLoading ? (
              <>
                Processing
                <div className='educatorPayment-spinner'></div>
              </>
            ) : (
              'Proceed to Payment'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SchoolPlanOptions
