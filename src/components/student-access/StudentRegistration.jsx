import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  registerStudentWithAccessCode,
  getClassInfoForRegistration,
  getSchoolInfoForRegistration
} from '@/services/accessCodeService'
import { signIn, checkUsernameAvailability } from '@/services/authServices'
import { FaEye, FaEyeSlash, FaGraduationCap } from 'react-icons/fa'
import { toast } from 'react-toastify'
import './StudentRegistration.css'

const StudentRegistration = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: '',
    country: 'United States',
    region: '',
    agreeToTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [accessCodeData, setAccessCodeData] = useState(null)
  const [classInfo, setClassInfo] = useState(null)
  const [schoolInfo, setSchoolInfo] = useState(null)
  const [errors, setErrors] = useState({})
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState(null)
  const [infoErrors, setInfoErrors] = useState({})

  // Debounced username availability check
  const debouncedUsernameCheck = useCallback(
    (() => {
      let timeoutId
      return (username) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(async () => {
          if (
            username &&
            username.length >= 3 &&
            /^[a-zA-Z0-9_]+$/.test(username)
          ) {
            setUsernameChecking(true)
            try {
              const isAvailable = await checkUsernameAvailability(username)
              setUsernameAvailable(isAvailable)
              if (!isAvailable) {
                setErrors((prev) => ({
                  ...prev,
                  username: 'This username is already taken'
                }))
              } else {
                setErrors((prev) => ({
                  ...prev,
                  username: ''
                }))
              }
            } catch (error) {
              console.error('Error checking username availability:', error)
              setUsernameAvailable(null)
            } finally {
              setUsernameChecking(false)
            }
          } else {
            setUsernameAvailable(null)
          }
        }, 500) // 500ms delay
      }
    })(),
    []
  )

  useEffect(() => {
    // Get access code data from session storage
    const storedData = sessionStorage.getItem('accessCodeData')
    if (!storedData) {
      toast.error('No access code found. Please enter your access code first.')
      navigate('/student-access')
      return
    }

    try {
      const data = JSON.parse(storedData)
      setAccessCodeData(data)

      // Get class information
      getClassInfoForRegistration(data.classId)
        .then(setClassInfo)
        .catch((error) => {
          setInfoErrors((prev) => ({
            ...prev,
            classInfo: 'Error loading class information'
          }))
          toast.error('Error loading class information')
        })

      // Get school information
      getSchoolInfoForRegistration(data.schoolId)
        .then(setSchoolInfo)
        .catch((error) => {
          console.error('Error getting school info:', error)
          setInfoErrors((prev) => ({
            ...prev,
            schoolInfo: 'Error loading school information'
          }))
          toast.error('Error loading school information')
        })
    } catch (error) {
      console.error('Error parsing access code data:', error)
      toast.error('Invalid access code data')
      navigate('/student-access')
    }
  }, [navigate])

  const validateForm = async () => {
    const newErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        'Username can only contain letters, numbers, and underscores'
    } else {
      // Check username availability
      try {
        const isAvailable = await checkUsernameAvailability(formData.username)
        if (!isAvailable) {
          newErrors.username = 'This username is already taken'
        }
      } catch (error) {
        console.error('Error checking username availability:', error)
        newErrors.username = 'Error checking username availability'
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the Terms of Service'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target
    const newValue = type === 'checkbox' ? checked : value

    setFormData((prev) => ({
      ...prev,
      [name]: newValue
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }))
    }

    // Check username availability in real-time
    if (name === 'username') {
      debouncedUsernameCheck(newValue)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!(await validateForm())) {
      return
    }

    if (!accessCodeData) {
      toast.error('Access code data not found')
      return
    }

    setLoading(true)

    try {
      // Generate a unique email for Firebase Auth (since it requires email)
      const uniqueEmail = `${formData.username}@${accessCodeData.schoolId}.student.local`

      // Register the student
      const userCredential = await registerStudentWithAccessCode(
        {
          ...formData,
          email: uniqueEmail, // Pass the generated email for Firebase Auth
          country: schoolInfo.country,
          region: schoolInfo.region
        },
        accessCodeData
      )

      if (userCredential.user) {
        toast.success('Account created successfully!')

        // Sign in the user using username
        await signIn(formData.username, formData.password)

        // Clear session storage
        sessionStorage.removeItem('accessCodeData')

        // Navigate to student dashboard
        navigate('/dashboard/student/missions')
      }
    } catch (error) {
      console.error('Registration error:', error)

      if (error.code === 'auth/email-already-in-use') {
        toast.error('An account with this username already exists')
        setErrors((prev) => ({
          ...prev,
          username: 'This username is already taken'
        }))
      } else if (error.message?.includes('username')) {
        toast.error('Username is already taken')
        setErrors((prev) => ({
          ...prev,
          username: 'This username is already taken'
        }))
      } else {
        toast.error(
          error.message || 'Failed to create account. Please try again.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  if (infoErrors.classInfo || infoErrors.schoolInfo) {
    return (
      <div className='student-registration'>
        <div className='student-registration__error-container'>
          <p className='student-registration__error-message'>
            Error loading class or school information. Please contact your
            teacher or administrator. Click <Link to='/login'>here</Link> to go
            back to the login page.
          </p>
        </div>
      </div>
    )
  }

  if (!accessCodeData || !classInfo) {
    return (
      <div className='student-registration'>
        <div className='student-registration__loading'>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='student-registration'>
      <div className='student-registration__header'>
        <h1 className='student-registration__title'>Create Your Account</h1>
        <div className='student-registration__class-info'>
          <div className='student-registration__class-badge'>
            <FaGraduationCap className='student-registration__class-icon' />
            <div className='student-registration__class-details'>
              <span className='student-registration__class-name'>
                {classInfo.className}
              </span>
              <span className='student-registration__class-grade'>
                Grade {accessCodeData.grade}
              </span>
            </div>
          </div>
        </div>
        <p className='student-registration__description'>
          Complete your registration to join your class
        </p>
      </div>

      <div className='student-registration__form'>
        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className='student-registration__form-section'>
            <div className='student-registration__form-row'>
              <div className='student-registration__form-group'>
                <label htmlFor='firstName'>First Name</label>
                <div className='student-registration__input-wrapper'>
                  <input
                    type='text'
                    id='firstName'
                    name='firstName'
                    value={formData.firstName}
                    onChange={handleChange}
                    className={errors.firstName ? 'error' : ''}
                    placeholder='Enter your first name'
                    disabled={loading}
                  />
                </div>
                {errors.firstName && (
                  <span className='student-registration__error'>
                    {errors.firstName}
                  </span>
                )}
              </div>

              <div className='student-registration__form-group'>
                <label htmlFor='lastName'>Last Name</label>
                <div className='student-registration__input-wrapper'>
                  <input
                    type='text'
                    id='lastName'
                    name='lastName'
                    value={formData.lastName}
                    onChange={handleChange}
                    className={errors.lastName ? 'error' : ''}
                    placeholder='Enter your last name'
                    disabled={loading}
                  />
                </div>
                {errors.lastName && (
                  <span className='student-registration__error'>
                    {errors.lastName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Account Information */}

          <div className='student-registration__form-row'>
            <div className='student-registration__form-group'>
              <label htmlFor='username'>Username</label>
              <input
                type='text'
                id='username'
                name='username'
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? 'error' : ''}
                placeholder='Choose a username (letters, numbers, underscores only)'
                disabled={loading}
              />
              {usernameChecking && (
                <span className='student-registration__info'>
                  Checking username availability...
                </span>
              )}
              {usernameAvailable === true &&
                formData.username &&
                !errors.username && (
                  <span className='student-registration__success'>
                    ✓ Username is available
                  </span>
                )}
              {errors.username && (
                <span className='student-registration__error'>
                  {errors.username}
                </span>
              )}
            </div>

            <div className='student-registration__form-row'>
              <div className='student-registration__form-group'>
                <label htmlFor='password'>Password</label>
                <div className='student-registration__password-wrapper'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id='password'
                    name='password'
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'error' : ''}
                    placeholder='Create a password (min. 6 characters)'
                    disabled={loading}
                  />
                  <button
                    type='button'
                    className='student-registration__password-toggle'
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <span className='student-registration__error'>
                    {errors.password}
                  </span>
                )}
              </div>

              <div className='student-registration__form-group'>
                <label htmlFor='confirmPassword'>Confirm Password</label>
                <div className='student-registration__password-wrapper'>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id='confirmPassword'
                    name='confirmPassword'
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? 'error' : ''}
                    placeholder='Confirm your password'
                    disabled={loading}
                  />
                  <button
                    type='button'
                    className='student-registration__password-toggle'
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className='student-registration__error'>
                    {errors.confirmPassword}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className='student-registration__form-row'>
            <div className='student-registration__checkbox-group'>
              <label className='student-registration__checkbox-label'>
                <input
                  type='checkbox'
                  name='agreeToTerms'
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className={errors.agreeToTerms ? 'error' : ''}
                  disabled={loading}
                />
                <span className='student-registration__checkmark'></span>I agree
                to the{' '}
                <a href='/terms' target='_blank' rel='noopener noreferrer'>
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href='/privacy' target='_blank' rel='noopener noreferrer'>
                  Privacy Policy
                </a>
              </label>
              {errors.agreeToTerms && (
                <span className='student-registration__error'>
                  {errors.agreeToTerms}
                </span>
              )}
            </div>
          </div>

          <button
            type='submit'
            className='student-registration__submit-btn'
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default StudentRegistration
