import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { getEmailByUsername } from '@/services/authServices'
import './ForgotPassword.css'
import AuthPageShell from '@/components/auth/AuthPageShell'
import smsIcon from '@/assets/icons/sms.svg'

const ForgotPassword = () => {
  const { resetPassword } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const validateIdentifier = (identifier) => {
    // If it contains @, validate as email
    if (identifier.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(identifier)
    }
    // Otherwise, validate as username (at least 3 characters, alphanumeric + underscore)
    return identifier.length >= 3 && /^[a-zA-Z0-9_]+$/.test(identifier)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateIdentifier(identifier)) {
      toast.error('Please enter a valid email address or username')
      return
    }

    setIsLoading(true)
    try {
      let email = identifier

      // If identifier is a username, get the corresponding email
      if (!identifier.includes('@')) {
        try {
          email = await getEmailByUsername(identifier)
        } catch (error) {
          toast.error(
            'Username not found. Please check your username or use your email address.'
          )
          setIsLoading(false)
          return
        }
      }

      await resetPassword(email)
      toast.success('Password reset email sent!')
    } catch (error) {
      toast.error(
        'Failed to send reset email. Please check your email address or username.'
      )
    }
    setIsLoading(false)
  }

  return (
    <AuthPageShell showBackToLogin>
      <div className='forgot-password-container'>
        <h1 className='forgot-password-title'>Forgot Password</h1>
        <p className='forgot-password-subtitle'>
          Enter your email address or username and we'll send you a link to
          reset your password.
        </p>
        <form onSubmit={handleSubmit} className='forgot-password-form'>
          <div className='forgot-password-form-group'>
            <label htmlFor='identifier' className='forgot-password-form-label'>
              Email address or username
            </label>
            <div className='forgot-password-input-group'>
              <span className='forgot-password-input-group-text'>
                <img
                  src={smsIcon}
                  alt=''
                  aria-hidden='true'
                  className='forgot-password-input-icon'
                />
              </span>
              <input
                id='identifier'
                type='text'
                placeholder='Enter your email or username'
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className='forgot-password-form-control'
              />
            </div>
          </div>
          <button
            type='submit'
            className='forgot-password-submit-btn'
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Email'}
          </button>
        </form>
      </div>
      {/* Back to Login rendered by AuthPageShell */}
    </AuthPageShell>
  )
}

export default ForgotPassword
