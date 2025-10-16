import { useState } from 'react'
import AuthPageShell from '@/components/auth/AuthPageShell'
import OTPInput from '@/components/auth/OTPInput'
import { Link } from 'react-router-dom'
import '@/pages/auth/login/Login.css'

const VerifyAccount = () => {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleComplete = async (otp) => {
    setCode(otp)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!code || code.length < 6) return
    setLoading(true)
    // TODO: call verification API without changing existing auth logic here
    setLoading(false)
  }

  return (
    <AuthPageShell showBackToLogin>
      <h1 className='login-title'>Check Your Email</h1>
      <p className='login-subtitle'>We've sent a 6-digit code to your inbox. Enter it below to continue.</p>
      <form onSubmit={handleSubmit} className='auth-form'>
        <OTPInput length={6} onChange={setCode} onComplete={handleComplete} />
        <button type='submit' className='login-submit-btn' disabled={loading || code.length < 6}>
          {loading ? 'Verifying...' : 'Verify Account'}
        </button>
      </form>
      <p className='login-resend-note'>
        Didn't get a code? <Link to='#' className='register-link'>Click to send</Link>
      </p>
    </AuthPageShell>
  )
}

export default VerifyAccount


