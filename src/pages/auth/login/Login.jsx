import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { ROLES } from '@/config/roles'
import { FaEye, FaEyeSlash, FaRegUserCircle } from 'react-icons/fa'
import './Login.css'
import { toast } from 'sonner'
import ReCAPTCHA from 'react-google-recaptcha'
import captcha from '@/config/captcha'
import { getUserByUid } from '@/services/userService'
import AuthPageShell from '@/components/auth/AuthPageShell'
import smsIcon from '@/assets/icons/sms.svg'
import lockIcon from '@/assets/icons/lock.svg'
import googleIcon from '@/assets/icons/google.svg'
import facebookIcon from '@/assets/icons/fb.svg'

const LoginPage = () => {
  const {
    currentUser,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    userRole
  } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [captchaValue, setCaptchaValue] = useState(null)

  useEffect(() => {
    if (isAuthenticated && userRole) {
      // Add a small delay to allow the success toast to display before navigation
      setTimeout(() => {
        redirectBasedOnRole(userRole, currentUser.isSchoolOnboarded)
        setIsLoading(false)
      }, 1000) // 1 second delay
    }
  }, [isAuthenticated, userRole])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      })
    }
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateIdentifier = (identifier) => {
    // If it contains @, validate as email
    if (identifier.includes('@')) {
      return validateEmail(identifier)
    }
    // Otherwise, validate as username (at least 3 characters, alphanumeric + underscore)
    return identifier.length >= 3 && /^[a-zA-Z0-9_]+$/.test(identifier)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value)
  }

  // NOTE: This is temporary, we need to change the routes to root routes for each role
  const redirectBasedOnRole = async (role, isOnboarded = false) => {
    console.log('role', role)
    console.log('isOnboarded', isOnboarded)
    switch (role) {
      case ROLES.SCHOOL_ADMIN:
        if (isOnboarded) {
          navigate('/dashboard/educator')
        } else {
          if (currentUser.hasSubscription) {
            navigate('/educator-access/school-onboarding')
          } else {
            navigate('/school-plan-options')
          }
        }
        break
      case ROLES.ADMIN:
        navigate('/dashboard/admin/analytics/user-analytics')
        break
      case ROLES.TEACHER:
        navigate('/dashboard/teacher/classroom')
        break
      case ROLES.STUDENT:
        navigate('/dashboard/student/missions')
        break
      case ROLES.CHILD:
        navigate('/dashboard/child/missions')
        break
      case ROLES.PARENT:
        const user = await getUserByUid(currentUser.uid)
        console.log('user', user)
        if (user?.isOnboarded && user?.hasSubscription) {
          navigate('/dashboard/parent/profiles')
        } else if (!user?.hasSubscription) {
          navigate('/onboarding/parent/child-account-type')
        } else if (!user?.isOnboarded && user?.hasSubscription) {
          navigate('/dashboard/parent/parent-onboarding')
        }
        break
      default:
        navigate('/')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    const newErrors = {}
    if (!formData.email) {
      newErrors.email = 'Email or username is required'
    } else if (!validateIdentifier(formData.email)) {
      newErrors.email = formData.email.includes('@')
        ? 'Please enter a valid email address'
        : 'Username must be at least 3 characters and contain only letters, numbers, and underscores'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    if (!captchaValue) {
      newErrors.captcha = 'Please complete the captcha verification'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Proceed with login logic if validation passes
    setIsLoading(true)

    try {
      await signIn(formData.email, formData.password)
      setIsAuthenticated(true)
      toast.success('Login successful')
    } catch (error) {
      if (error.message.includes('auth/invalid-credential')) {
        toast.error('Invalid email/username or password. Please try again.')
      } else {
        toast.error('An error occurred. Please try again.')
      }
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      await signInWithGoogle()
      setIsAuthenticated(true)
      toast.success('Login successful')
    } catch (error) {
      console.error('Google sign-in error:', error)
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in cancelled')
      } else {
        toast.error('Failed to sign in with Google')
      }
      setIsLoading(false)
    }
  }

  const handleFacebookSignIn = async () => {
    try {
      setIsLoading(true)
      await signInWithFacebook()
      setIsAuthenticated(true)
      toast.success('Login successful')
    } catch (error) {
      console.error('Facebook sign-in error:', error)
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in cancelled')
      } else {
        toast.error('Failed to sign in with Facebook')
      }
      setIsLoading(false)
    }
  }

  return (
    <AuthPageShell>
      <h1 className='login-title'>Welcome Back</h1>
      {errors.auth && (
        <div className='login-alert login-alert-danger' role='alert'>
          {errors.auth}
        </div>
      )}

      <form className='auth-form align-start' onSubmit={handleSubmit}>
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
              type='text'
              className={`login-form-control ${
                errors.email ? 'login-is-invalid' : ''
              }`}
              id='email'
              name='email'
              placeholder='Enter your email or username'
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <div className='login-invalid-feedback'>{errors.email}</div>
            )}
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
              className={`login-form-control ${
                errors.password ? 'login-is-invalid' : ''
              }`}
              id='password'
              name='password'
              placeholder='Enter your password'
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type='button'
              className='login-password-toggle-btn'
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && (
              <div className='login-invalid-feedback'>{errors.password}</div>
            )}
          </div>
        </div>

        <div className='login-meta-row'>
          <div className='form-check'>
            <input
              type='checkbox'
              className='form-check-input'
              id='remember-me'
            />
            <label className='form-check-label' htmlFor='remember-me'>
              Remember me
            </label>
          </div>
          <Link to='/forgot-password' className='forgot-password'>
            Forgot Password?
          </Link>
        </div>

        <div className='login-form-group-captcha'>
          <ReCAPTCHA sitekey={captcha.siteKey} onChange={handleCaptchaChange} />
          {errors.captcha && (
            <div className='login-invalid-feedback'>{errors.captcha}</div>
          )}
        </div>

        <button type='submit' className='login-submit-btn' disabled={isLoading}>
          {isLoading ? (
            <span
              className='login-spinner'
              role='status'
              aria-hidden='true'
            ></span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
      <div className='login-footer'>
        <div className='other-login-options'>
          <p>Or login with</p>
        </div>
        <div className='other-login-options-icons'>
          <button
            className='other-login-options-icons-button'
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <img src={googleIcon} alt='Google' size={32} />
          </button>
          <button
            className='other-login-options-icons-button'
            onClick={handleFacebookSignIn}
            disabled={isLoading}
          >
            <img src={facebookIcon} alt='Facebook' size={32} />
          </button>
        </div>
        <div className='dont-have-account'>
          <p>
            Don't have an account?{' '}
            <Link to='/register' className='register-link'>
              Sign Up
            </Link>
          </p>
          {/* <p>
            {' '}
            or{' '}
            <Link to='/student-access' className='register-link'>
              Join Class with Access Code
            </Link>
          </p> */}
        </div>
      </div>
    </AuthPageShell>
  )
}

export default LoginPage
