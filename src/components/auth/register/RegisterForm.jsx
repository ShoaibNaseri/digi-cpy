import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { ROLES } from '@/config/roles'
import { HiUsers } from 'react-icons/hi2'
import { FaChalkboardTeacher } from 'react-icons/fa'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { toast } from 'sonner'
import './RegisterForm.css'
import '@/pages/auth/login/Login.css'
import smsIcon from '@/assets/icons/sms.svg'
import lockIcon from '@/assets/icons/lock.svg'

const Register = () => {
  const navigate = useNavigate()
  const { signUp, signIn } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ROLES.PARENT,
    agreeToTerms: false,
    parentConsent: false,
    receiveUpdates: false
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Add effect to enhance role options for keyboard accessibility
  useEffect(() => {
    // Find all role option elements
    const roleOptions = document.querySelectorAll('.register__role-option')

    // Add keyboard support to each option
    roleOptions.forEach((option) => {
      // Ensure they have proper attributes for accessibility
      option.setAttribute('role', 'button')
      option.setAttribute('tabindex', '0')

      // Add keyboard event listener
      option.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          option.click()
        }
      })

      // Make SVG icons not focusable
      const svg = option.querySelector('svg')
      if (svg) {
        svg.setAttribute('focusable', 'false')
        svg.setAttribute('aria-hidden', 'true')
      }
    })

    // Clean up event listeners when component unmounts
    return () => {
      roleOptions.forEach((option) => {
        option.removeEventListener('keydown', null)
      })
    }
  }, []) // Empty dependency array means this runs once on mount

  const handleChange = (e) => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role })
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.role === ROLES.STUDENT) {
      toast.error('Please select a role')
      return
    }

    if (!formData.agreeToTerms) {
      toast.error('You must agree to the Terms of Service and Privacy Policy')
      return
    }

    if (formData.role === ROLES.PARENT && !formData.parentConsent) {
      toast.error('You must provide consent as a parent/guardian')
      return
    }

    try {
      setLoading(true)
      const response = await signUp(
        formData.email,
        formData.password,
        formData.role
      )

      if (response.user) {
        // Navigate immediately after successful signup
        if (formData.role === ROLES.SCHOOL_ADMIN) {
          navigate('/onboarding/educator/account-setup')
        } else {
          navigate('/onboarding/parent/child-account-type')
        }
      }
    } catch (error) {
      console.error(error)
      setLoading(false)

      // Handle specific Firebase auth errors
      if (error.code === 'auth/email-already-in-use') {
        toast.error(
          'This email address is already registered. Please use a different email.'
        )
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password should be at least 6 characters long.')
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Please enter a valid email address.')
      } else {
        toast.error('Failed to create an account. Please try again.')
      }
    }
  }

  return (
    <div>
      <h1 className='login-title'>Create Your Account</h1>
      <p className='login-subtitle'>
        Take the first step toward protecting your child online.
      </p>

      <form onSubmit={handleSubmit} className='auth-form'>
        <div className='register__role-selection'>
          <div
            className='register__role-options register__role-options--segmented'
            role='radiogroup'
            aria-label='Select your role'
          >
            <label
              className={`register__role-option ${
                formData.role === ROLES.PARENT
                  ? 'register__role-option--selected'
                  : ''
              }`}
            >
              <input
                type='radio'
                className='register__role-radio'
                name='role'
                value={ROLES.PARENT}
                checked={formData.role === ROLES.PARENT}
                onChange={() => handleRoleSelect(ROLES.PARENT)}
              />
              <HiUsers aria-hidden='true' />
              <span>Parent</span>
            </label>
            <label
              className={`register__role-option ${
                formData.role === ROLES.SCHOOL_ADMIN
                  ? 'register__role-option--selected'
                  : ''
              }`}
            >
              <input
                type='radio'
                className='register__role-radio'
                name='role'
                value={ROLES.SCHOOL_ADMIN}
                checked={formData.role === ROLES.SCHOOL_ADMIN}
                onChange={() => handleRoleSelect(ROLES.SCHOOL_ADMIN)}
              />
              <FaChalkboardTeacher aria-hidden='true' />
              <span>Educator</span>
            </label>
          </div>
        </div>

        <div className='login-form-group'>
          <label htmlFor='email' className='login-form-label'>
            Email Address
          </label>
          <div className='input-group'>
            <span className='input-group-text'>
              <img
                src={smsIcon}
                alt=''
                aria-hidden='true'
                className='login-input-icon'
              />
            </span>
            <input
              type='email'
              id='email'
              name='email'
              className='login-form-control'
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className='login-form-group'>
          <label htmlFor='password' className='login-form-label'>
            Password
          </label>
          <div className='input-group'>
            <span className='input-group-text'>
              <img
                src={lockIcon}
                alt=''
                aria-hidden='true'
                className='login-input-icon'
              />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              id='password'
              name='password'
              className='login-form-control'
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type='button'
              className='login-password-toggle-btn'
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div className='register__terms'>
          <div className='register__checkbox-group'>
            {formData.role === ROLES.PARENT && (
              <div className='register__checkbox-item'>
                <input
                  type='checkbox'
                  id='parentConsent'
                  name='parentConsent'
                  checked={formData.parentConsent}
                  onChange={handleChange}
                  required
                />
                <label htmlFor='parentConsent'>
                  I consent to my child using
                  <span className='register__gradient'> Digipalz</span>.
                </label>
              </div>
            )}

            <div className='register__checkbox-item'>
              <input
                type='checkbox'
                id='agreeToTerms'
                name='agreeToTerms'
                checked={formData.agreeToTerms}
                onChange={handleChange}
                required
              />
              <label htmlFor='agreeToTerms'>
                I agree to the&nbsp;
                <Link to='/terms-of-service-en'>Terms of Service</Link>
                &nbsp;and&nbsp;
                <Link to='/privacy-policy-en'>Privacy Policy</Link>.
              </label>
            </div>

            <div className='register__checkbox-item'>
              <input
                type='checkbox'
                id='receiveUpdates'
                name='receiveUpdates'
                checked={formData.receiveUpdates}
                onChange={handleChange}
              />
              <label htmlFor='receiveUpdates'>
                Yes, send me updates and tips from Digipalz.
              </label>
            </div>
          </div>
        </div>

        <button type='submit' className='login-submit-btn' disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className='register__login-link'>
        <p>
          Already have an account?{' '}
          <Link to='/login' className='register-link'>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
