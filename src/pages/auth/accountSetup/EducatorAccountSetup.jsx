import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaUser } from 'react-icons/fa'

import { toast } from 'sonner'
import './EducatorAccountSetup.css'
import useFormValidation from '@/hooks/useFormValidation'
import { educatorAccountSetupValidationRules } from '@/validation/educatorAccountSetupValidation'
import { useAuth } from '@/context/AuthContext'
import hero4 from '@/assets/LandingPage/4.png'
import hero2 from '@/assets/LandingPage/2.png'
import hero5 from '@/assets/LandingPage/5.png'
import digipalzLogo from '@/assets/digipalz_b.png'
import CountryRegionsDropdown from '@/components/common/country-regions/CountryRegionsDropdown'
import { updateUser } from '@/services/adminService'
const EducatorAccountSetup = ({}) => {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { currentUser } = useAuth()

  const initialState = {
    firstName: '',
    lastName: '',
    country: 'United States',
    region: '',
    agreeToTerms: false
  }
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setValues,
    validateForm
  } = useFormValidation(initialState, educatorAccountSetupValidationRules)

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '')
    const limitedDigits = digits.slice(0, 10)
    if (limitedDigits.length <= 3) {
      return limitedDigits
    } else if (limitedDigits.length <= 6) {
      return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`
    } else {
      return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(
        3,
        6
      )}-${limitedDigits.slice(6, 10)}`
    }
  }

  const handleFieldChange = useCallback(
    (e) => {
      const { name, type, checked, value } = e.target
      let processedValue = type === 'checkbox' ? checked : value
      if (name === 'phone') {
        processedValue = formatPhoneNumber(value)
      }
      handleChange({
        target: {
          name,
          value: processedValue
        }
      })
    },
    [handleChange]
  )

  // Stable callback functions for dropdown
  const handleCountryChange = useCallback(
    (country) => {
      handleFieldChange({ target: { name: 'country', value: country } })
    },
    [handleFieldChange]
  )

  const handleRegionChange = useCallback(
    (region) => {
      handleFieldChange({ target: { name: 'region', value: region } })
    },
    [handleFieldChange]
  )

  const handleSubmit = async (e) => {
    if (!currentUser) {
      toast.error('No user is currently logged in')
      return
    }
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly')
      setIsLoading(false)
      return
    }

    if (!values.agreeToTerms) {
      toast.error('You must agree to the Terms of Service and Privacy Policy')
      setIsLoading(false)
      return
    }

    try {
      const response = await updateUser(currentUser.uid, values)
      toast.success('Account created successfully')
      setIsLoading(false)
      navigate('/school-plan-options')
    } catch (error) {
      console.error('Error creating account:', error)
      toast.error('Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className='educator-account-setup-container'>
      <div className='educator-account-setup-layout'>
        {/* Left Section - Registration Form */}
        <div className='educator-account-setup-left'>
          <div className='educator-account-setup-card-wrapper'>
            <div className='educator-account-setup-card'>
              <div className='educator-account-setup-card-body'>
                <div className='educator-account-setup-brand'>
                  <img
                    src={digipalzLogo}
                    alt='Digipalz logo'
                    className='educator-account-setup-brand-logo'
                  />
                </div>

                <h2 className='educator-account-setup-subtitle'>
                  Complete Your Registration {initialState.country}
                </h2>
                <p className='educator-account-setup-description'>
                  Let's get your profile ready — adventure awaits!
                </p>

                <form onSubmit={handleSubmit}>
                  {/* Personal Information Fields */}
                  <div className='educator-account-setup-form-group'>
                    <label htmlFor='firstName'>First Name</label>
                    <div className='input-group'>
                      <span className='input-group-text'>
                        <FaUser
                          className='educator-account-setup-input-icon'
                          color='#8F9AA4'
                        />
                      </span>
                      <input
                        type='text'
                        id='firstName'
                        name='firstName'
                        value={values.firstName}
                        onChange={handleFieldChange}
                        placeholder='Enter your first name'
                        required
                        className='educator-account-setup-form-control'
                      />
                    </div>
                  </div>

                  <div className='educator-account-setup-form-group'>
                    <label htmlFor='lastName'>Last Name</label>
                    <div className='input-group'>
                      <span className='input-group-text'>
                        <FaUser
                          className='educator-account-setup-input-icon'
                          color='#8F9AA4'
                        />
                      </span>
                      <input
                        type='text'
                        id='lastName'
                        name='lastName'
                        value={values.lastName}
                        onChange={handleFieldChange}
                        placeholder='Enter your last name'
                        required
                        className='educator-account-setup-form-control'
                      />
                    </div>
                  </div>
                  <CountryRegionsDropdown
                    countryValue={values.country}
                    regionValue={values.region}
                    onCountryChange={handleCountryChange}
                    onRegionChange={handleRegionChange}
                  />

                  {/* <div className='educator-account-setup-form-group'>
                    <label htmlFor='phone'>Phone (123-456-7890) <span className='optional-text'>(Optional)</span></label>
                    <div className='input-group'>
                      <span className='input-group-text'>
                        <FaPhone className='educator-account-setup-input-icon' color='#8F9AA4' />
                      </span>
                      <input
                        type='tel'
                        id='phone'
                        name='phone'
                        value={values.phone}
                        onChange={handleFieldChange}
                        placeholder='123-456-7890'
                        className='educator-account-setup-form-control'
                      />
                    </div>
                  </div> */}

                  {/* Terms and Conditions Checkbox */}
                  <div className='educator-account-setup-form-group'>
                    <div className='educator-account-setup-checkbox-item'>
                      <input
                        type='checkbox'
                        id='agreeToTerms'
                        name='agreeToTerms'
                        checked={values.agreeToTerms}
                        onChange={handleFieldChange}
                        required
                      />
                      <label htmlFor='agreeToTerms'>
                        I agree to the&nbsp;
                        <Link to='/terms-of-service-en'>Terms of Service</Link>
                        &nbsp;and&nbsp;
                        <Link to='/privacy-policy-en'>Privacy Policy</Link>.
                      </label>
                    </div>
                  </div>

                  <button
                    type='submit'
                    className='educator-account-setup-submit-button'
                    disabled={isLoading}
                  >
                    {isLoading
                      ? 'Creating Account...'
                      : 'Complete Registration'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Avatar Characters */}
        <div className='educator-account-setup-right'>
          <div className='educator-account-setup-characters tight'>
            <img
              src={hero4}
              alt=''
              aria-hidden='true'
              className='educator-account-setup-character tight-img'
            />
            <img
              src={hero2}
              alt=''
              aria-hidden='true'
              className='educator-account-setup-character tight-img'
            />
            <img
              src={hero5}
              alt=''
              aria-hidden='true'
              className='educator-account-setup-character tight-img'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default EducatorAccountSetup
