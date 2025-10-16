import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  verifyInvitationToken,
  invalidateInvitationToken
} from '@/services/invitationService'
import {
  schoolTeacherSignUp,
  signIn,
  schoolStudentSignUp
} from '@/services/authServices'
import {
  FaEye,
  FaEyeSlash,
  FaExclamationCircle,
  FaLock,
  FaUser,
  FaPhone
} from 'react-icons/fa'
import { toast } from 'react-toastify'
import './AccountSetup.css'
import useFormValidation from '@/hooks/useFormValidation'
import { accountSetupValidationRules } from '@/validation/accountSetupValidation'
import { getUserSchool } from '@/services/userService'
import { useAuth } from '@/context/AuthContext'
import { updateUser } from '@/services/adminService'
import hero4 from '@/assets/LandingPage/4.png'
import hero2 from '@/assets/LandingPage/2.png'
import hero5 from '@/assets/LandingPage/5.png'
import digipalzLogo from '@/assets/digipalz_b.png'

const AccountSetup = ({ role }) => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [schoolDetails, setSchoolDetails] = useState({})
  const [invitationData, setInvitationData] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { currentUser } = useAuth()

  const initialState = {
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    country: 'United States',
    region: '',
    phone: '',
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
  } = useFormValidation(initialState, accountSetupValidationRules)

  useEffect(() => {
    const token = searchParams.get('invitationToken')
    if (!token) {
      setError('Invalid invitation link')
      return
    }

    const verifyToken = async () => {
      try {
        const decoded = await verifyInvitationToken(token)
        setInvitationData(decoded)
        const schoolInfo = await getUserSchool(decoded.schoolId)
        setSchoolDetails(schoolInfo)
        setValues((prev) => ({
          ...prev,
          firstName: decoded.firstName || '',
          lastName: decoded.lastName || ''
        }))
      } catch (error) {
        setError(error.message)
      }
    }

    verifyToken()
  }, [searchParams])

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

  const handleFieldChange = (e) => {
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
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (role === 'ADMIN' && currentUser) {
      await updateUser(currentUser.uid, {
        firstName: values.firstName,
        lastName: values.lastName,
        hasSubscription: true
      })

      // Invalidate the invitation token after successful admin setup
      const token = searchParams.get('invitationToken')
      if (token) {
        await invalidateInvitationToken(token)
      }

      navigate('/dashboard/admin/analytics/user-analytics')
      setIsLoading(false)
      return
    }

    // For students, we don't need to validate country/region since they come from school details
    const isValidationRequired = role !== 'STUDENT'

    if (isValidationRequired && !validateForm()) {
      toast.error('Please fill in all required fields correctly')
      setIsLoading(false)
      return
    }

    // For students, only validate essential fields
    if (role === 'STUDENT') {
      const studentErrors = []
      if (!values.firstName?.trim())
        studentErrors.push('First name is required')
      if (!values.lastName?.trim()) studentErrors.push('Last name is required')
      if (!values.password || values.password.length < 6)
        studentErrors.push('Password must be at least 6 characters')
      if (values.password !== values.confirmPassword)
        studentErrors.push('Passwords do not match')
      if (!values.agreeToTerms)
        studentErrors.push('You must agree to the Terms of Service')

      if (studentErrors.length > 0) {
        toast.error(studentErrors[0])
        setIsLoading(false)
        return
      }
    }

    try {
      const token = searchParams.get('invitationToken')

      if (role === 'TEACHER') {
        await schoolTeacherSignUp(
          invitationData.email,
          values.password,
          values.firstName,
          values.lastName,
          invitationData.schoolId,
          invitationData.uid,
          schoolDetails.country || 'United States',
          schoolDetails.region || '',
          values.phone
        )
        await signIn(invitationData.email, values.password)

        // Invalidate the invitation token after successful registration
        if (token) {
          await invalidateInvitationToken(token)
        }

        navigate('/dashboard/teacher/classroom')
      }
      if (role === 'STUDENT') {
        await schoolStudentSignUp(
          invitationData.email,
          values.password,
          values.firstName,
          values.lastName,
          invitationData.schoolId,
          invitationData.studentId,
          invitationData.classId,
          invitationData.docId,
          schoolDetails.country || 'United States',
          schoolDetails.region || ''
        )

        await signIn(invitationData.email, values.password)

        // Invalidate the invitation token after successful registration
        if (token) {
          await invalidateInvitationToken(token)
        }

        navigate('/dashboard/student/missions')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError(error.message)
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  if (!invitationData) {
    return (
      <div className='account-setup-container'>
        <div className='account-setup-card'>
          {error ? <h2>There was an error</h2> : <h2>Registration</h2>}
          {error ? (
            <div className='account-setup-error-message'>
              <div className='account-setup-error-icon'>
                <FaExclamationCircle color='#8F9AA4' />
              </div>
              <div className='account-setup-error-content-container'>
                <div className='account-setup-error-content'>
                  <h4>
                    The invitation link appears to be invalid or expired. Please
                    contact your administrator for a new invitation.
                  </h4>
                </div>
                <Link to='/' className='account-setup-error-link'>
                  Go to Home
                </Link>
              </div>
            </div>
          ) : (
            <div className='account-setup-loading'>Loading...</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className='account-setup-container'>
      <div className='account-setup-layout'>
        {/* Left Section - Registration Form */}
        <div className='account-setup-left'>
          <div className='account-setup-card-wrapper'>
            <div className='account-setup-card'>
              <div className='account-setup-card-body'>
                <div className='account-setup-brand'>
                  <img
                    src={digipalzLogo}
                    alt='Digipalz logo'
                    className='account-setup-brand-logo'
                  />
                </div>

                <h2 className='account-setup-subtitle'>
                  Complete Your Registration
                </h2>
                <p className='account-setup-description'>
                  Let's get your profile ready — adventure awaits!
                </p>

                <form onSubmit={handleSubmit}>
                  {/* Personal Information Fields */}
                  <div className='account-setup-form-group'>
                    <label htmlFor='firstName'>First Name</label>
                    <div className='input-group'>
                      <span className='input-group-text'>
                        <FaUser
                          className='account-setup-input-icon'
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
                        className='account-setup-form-control'
                      />
                    </div>
                  </div>

                  <div className='account-setup-form-group'>
                    <label htmlFor='lastName'>Last Name</label>
                    <div className='input-group'>
                      <span className='input-group-text'>
                        <FaUser
                          className='account-setup-input-icon'
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
                        className='account-setup-form-control'
                      />
                    </div>
                  </div>

                  {/* <div className='account-setup-form-group'>
                    <label htmlFor='phone'>Phone (123-456-7890) <span className='optional-text'>(Optional)</span></label>
                    <div className='input-group'>
                      <span className='input-group-text'>
                        <FaPhone className='account-setup-input-icon' color='#8F9AA4' />
                      </span>
                      <input
                        type='tel'
                        id='phone'
                        name='phone'
                        value={values.phone}
                        onChange={handleFieldChange}
                        placeholder='123-456-7890'
                        className='account-setup-form-control'
                      />
                    </div>
                  </div> */}

                  {role !== 'ADMIN' && (
                    <>
                      <div className='account-setup-form-group'>
                        <label htmlFor='password'>Password</label>
                        <div className='input-group'>
                          <span className='input-group-text'>
                            <FaLock
                              className='account-setup-input-icon'
                              color='#8F9AA4'
                            />
                          </span>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            id='password'
                            name='password'
                            value={values.password}
                            onChange={handleFieldChange}
                            placeholder='Create a strong password'
                            required
                            className='account-setup-form-control'
                          />
                          <button
                            type='button'
                            className='password-toggle-button'
                            onClick={togglePasswordVisibility}
                            tabIndex='-1'
                          >
                            {showPassword ? (
                              <FaEye size={18} color='#8F9AA4' />
                            ) : (
                              <FaEyeSlash size={18} color='#8F9AA4' />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className='account-setup-form-group'>
                        <label htmlFor='confirmPassword'>
                          Confirm Password
                        </label>
                        <div className='input-group'>
                          <span className='input-group-text'>
                            <FaLock
                              className='account-setup-input-icon'
                              color='#8F9AA4'
                            />
                          </span>
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id='confirmPassword'
                            name='confirmPassword'
                            value={values.confirmPassword}
                            onChange={handleFieldChange}
                            placeholder='Re-enter your password'
                            required
                            className='account-setup-form-control'
                          />
                          <button
                            type='button'
                            className='password-toggle-button'
                            onClick={toggleConfirmPasswordVisibility}
                            tabIndex='-1'
                          >
                            {showConfirmPassword ? (
                              <FaEye size={18} color='#8F9AA4' />
                            ) : (
                              <FaEyeSlash size={18} color='#8F9AA4' />
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Terms and Conditions Checkbox */}
                  <div className='account-setup-form-group'>
                    <div className='account-setup-checkbox-item'>
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
                    onClick={handleSubmit}
                    className='account-setup-submit-button'
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
        <div className='account-setup-right'>
          <div className='account-setup-characters tight'>
            <img
              src={hero4}
              alt=''
              aria-hidden='true'
              className='account-setup-character tight-img'
            />
            <img
              src={hero2}
              alt=''
              aria-hidden='true'
              className='account-setup-character tight-img'
            />
            <img
              src={hero5}
              alt=''
              aria-hidden='true'
              className='account-setup-character tight-img'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountSetup
