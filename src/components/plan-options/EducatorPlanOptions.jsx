import React, { useState, useEffect } from 'react'
import { FaGraduationCap, FaCrown, FaCheck, FaUsers } from 'react-icons/fa'
import { useSearchParams } from 'react-router-dom'
import { isEmpty } from 'lodash'
import { stripePromise } from '@/utils/stripeLoader'
import { firebaseConfig } from '@/firebase/config'
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

const EducatorSchoolPlanOptions = () => {
  const [searchParams] = useSearchParams()
  const [studentCount, setStudentCount] = useState('')
  const [inputError, setInputError] = useState('')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const currentYear = new Date().getFullYear()

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
    console.log('handleSelectPlan')
  }

  return (
    <div className='school-plan-options-main'>
      <div className='school-plan-header'>
        <h1>School License Pricing</h1>
        <p className='school-plan-subtitle'>
          {currentYear}-{currentYear + 1} Academic Year Pricing
        </p>
      </div>
      <div className='school-plan-cards-row'>
        <div
          className={`school-plan-card ${
            selectedPlan === 'basic' ? 'selected' : ''
          }`}
          onClick={() => setSelectedPlan('basic')}
        >
          <div className='school-plan-card-header'>
            <FaGraduationCap className='school-plan-icon' />
            <span className='school-plan-tier-title'>Basic Tier</span>
          </div>
          <div className='school-plan-price'>${BASIC_PRICE}</div>
          <div className='school-plan-period'>per student/month</div>
          <ul className='school-plan-features'>
            <li>
              <FaCheck className='check-icon' /> Core cyber safety curriculum
            </li>
            <li>
              <FaCheck className='check-icon' /> Basic reporting for teachers
            </li>
            <li>
              <FaCheck className='check-icon' /> Student progress tracking
            </li>
            <li>
              <FaCheck className='check-icon' /> Admin dashboard
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
            <FaCrown className='school-plan-icon' />
            <span className='school-plan-tier-title'>Premium Tier</span>
          </div>
          <div className='school-plan-price'>${PREMIUM_PRICE}</div>
          <div className='school-plan-period'>per student/month</div>
          <ul className='school-plan-features'>
            <li>
              <FaCheck className='check-icon' /> Core cyber safety curriculum
            </li>
            <li>
              <FaCheck className='check-icon' /> Board-level analytics and full
              reporting tools
            </li>
            <li>
              <FaCheck className='check-icon' /> Student progress tracking
            </li>
            <li>
              <FaCheck className='check-icon' /> Admin dashboard
            </li>
            <li>
              <FaCheck className='check-icon' /> AI Incident Chatbot
            </li>
            <li>
              <FaCheck className='check-icon' /> Personalized Protection Plans
            </li>
            <li>
              <FaCheck className='check-icon' /> Monthly Incident Analytics
            </li>
            <li>
              <FaCheck className='check-icon' /> Account Manager
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
      </div>
      <div className='school-plan-volume-discount'>
        <h2>Calculate Your Volume Discount</h2>
        <form className='school-plan-volume-form' onSubmit={handleSelectPlan}>
          <label htmlFor='student-count' className='school-plan-volume-label'>
            Number of Students
          </label>
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
                          <span style={{ color: '#e11d48', fontWeight: 600 }}>
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
                          color: '#e11d48',
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
                          <span style={{ color: '#e11d48', fontWeight: 600 }}>
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
                          color: '#e11d48',
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
          <div className='school-plan-volume-note'>
            * For 5,000+ students, please contact us for custom pricing
          </div>
          {inputError && (
            <div className='school-plan-volume-error'>{inputError}</div>
          )}
          <button
            className='school-plan-purchase-btn'
            disabled={!selectedPlan || !studentCount}
            type='submit'
          >
            Proceed to Payment
          </button>
        </form>
      </div>
    </div>
  )
}

export default EducatorSchoolPlanOptions
