import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  validateAccessCode,
  markAccessCodeUsed
} from '@/services/accessCodeService'
import { icons, images } from '@/config/images'
import './StudentAccess.css'
import '@/pages/auth/login/Login.css'
import smsIcon from '@/assets/icons/sms.svg'

const StudentAccess = () => {
  const navigate = useNavigate()
  const [accessCode, setAccessCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!accessCode.trim()) {
      setError('Please enter an access code')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Validate the access code
      const validatedCode = await validateAccessCode(
        accessCode.trim().toUpperCase()
      )

      // Store access code data for the next step
      sessionStorage.setItem(
        'accessCodeData',
        JSON.stringify({
          accessCodeId: validatedCode.id,
          classId: validatedCode.classId,
          className: validatedCode.className,
          grade: validatedCode.grade,
          teacherId: validatedCode.teacherId,
          schoolId: validatedCode.schoolId
        })
      )

      // Navigate to student registration page
      navigate('/student-access/registration')
    } catch (error) {
      console.error('Access code validation error:', error)
      setError(
        error.message ||
          'Invalid or expired access code. Please check and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleAccessCodeChange = (e) => {
    const value = e.target.value.toUpperCase()
    // Format as XXX-XXX-XXX while typing
    let formatted = value.replace(/[^A-Z0-9]/g, '')
    if (formatted.length > 4) {
      formatted = formatted.slice(0, 4) + '-' + formatted.slice(4)
    }
    if (formatted.length > 9) {
      formatted = formatted.slice(0, 9) + '-' + formatted.slice(9, 12)
    }
    setAccessCode(formatted)

    // Clear error when user starts typing
    if (error) setError('')
  }

  return (
    <div className='student-access'>
      <div className='student-access__header'>
        <img src={images.educatorAccessImage} alt='student access' />
        <h1 className='student-access__title'>Student Access</h1>
        <p className='student-access__description'>
          Please enter your access code to continue
        </p>
      </div>
      <div className='student-access__form'>
        <form onSubmit={handleSubmit} className='auth-form'>
          <div className='login-form-group'>
            <label htmlFor='access-code' className='login-form-label'>Access Code</label>
            <div className='input-group'>
              <span className='input-group-text'>
                <img src={smsIcon} alt='' aria-hidden='true' className='login-input-icon' />
              </span>
              <input
                id='access-code'
                type='text'
                placeholder='Enter your access code (e.g., ABCD-1234-XYZ)'
                value={accessCode}
                onChange={handleAccessCodeChange}
                maxLength={13}
                disabled={loading}
                className={`login-form-control ${error ? 'login-is-invalid' : ''}`}
              />
            </div>
            <p className='student-access__form-group-helper-text'>
              Enter the code provided by your teacher
            </p>
            {error && (
              <p className='student-access__form-group-error-text'>{error}</p>
            )}
          </div>
          <button
            className='login-submit-btn'
            type='submit'
            disabled={loading || !accessCode.trim()}
          >
            {loading ? 'Validating...' : 'Access Platform'}
          </button>
          <p className='student-access__form-group-contact'>
            Need an access code?{' '}
            <a href='mailto:support@digipalz.com'>Contact administrator</a>
          </p>
        </form>
      </div>
      <div className='student-access__form-group-footer'>
        <p>Protected education platform</p>
        <div className='student-access__form-group-footer-icons'>
          <img src={icons.shieldIcon} alt='Shield' />
          <img src={icons.schoolIcon} alt='School' />
          <img src={icons.graduationHatIcon} alt='Graduation Hat' />
        </div>
      </div>
    </div>
  )
}

export default StudentAccess
