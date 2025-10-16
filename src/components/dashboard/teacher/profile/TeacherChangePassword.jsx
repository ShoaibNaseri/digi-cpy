import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-toastify'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import './TeacherChangePassword.css'

const TeacherChangePassword = () => {
  const { changePassword } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleOpenModal = () => {
    setIsModalOpen(true)
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setErrors({})
    setShowNewPassword(false)
    setShowConfirmPassword(false)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setErrors({})
    setShowNewPassword(false)
    setShowConfirmPassword(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword =
        'New password must be different from current password'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await changePassword(formData.currentPassword, formData.newPassword)
      toast.success('Password changed successfully!')
      handleCloseModal()
    } catch (error) {
      console.error('Error changing password:', error)

      if (
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        setErrors({ currentPassword: 'Current password is incorrect' })
      } else if (error.code === 'auth/weak-password') {
        setErrors({ newPassword: 'Password is too weak' })
      } else if (error.code === 'auth/requires-recent-login') {
        toast.error(
          'Please log out and log in again before changing your password'
        )
      } else {
        toast.error('Failed to change password. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className='teacher-profile-section'>
        <div className='change-password-section'>
          <div className='teacher-change-password-header'>
            <h3>Password & Security</h3>
            <p>Change your account password</p>
          </div>
          <button className='change-password-button' onClick={handleOpenModal}>
            Change Password
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className='change-password-modal-overlay'>
          <div className='teacher-change-password-modal'>
            <div className='teacher-change-password-modal-header'>
              <h2>Change Password</h2>
              <button
                className='change-password-modal-close'
                onClick={handleCloseModal}
                disabled={isLoading}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className='teacher-change-password-form'
            >
              <div className='form-group'>
                <label htmlFor='currentPassword'>Current Password</label>
                <input
                  type='password'
                  id='currentPassword'
                  name='currentPassword'
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className={errors.currentPassword ? 'error' : ''}
                  disabled={isLoading}
                />
                {errors.currentPassword && (
                  <span className='error-message'>
                    {errors.currentPassword}
                  </span>
                )}
              </div>

              <div className='form-group'>
                <label htmlFor='newPassword'>New Password</label>
                <div className='password-input-wrapper'>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id='newPassword'
                    name='newPassword'
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className={errors.newPassword ? 'error' : ''}
                    disabled={isLoading}
                  />
                  <button
                    type='button'
                    className='password-toggle'
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={isLoading}
                  >
                    {showNewPassword ? (
                      <FaEyeSlash size={16} />
                    ) : (
                      <FaEye size={16} />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <span className='error-message'>{errors.newPassword}</span>
                )}
              </div>

              <div className='form-group'>
                <label htmlFor='confirmPassword'>Confirm New Password</label>
                <div className='password-input-wrapper'>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id='confirmPassword'
                    name='confirmPassword'
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={errors.confirmPassword ? 'error' : ''}
                    disabled={isLoading}
                  />
                  <button
                    type='button'
                    className='password-toggle'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash size={16} />
                    ) : (
                      <FaEye size={16} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className='error-message'>
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              <div className='change-password-modal-actions'>
                <button
                  type='button'
                  className='cancel-button'
                  onClick={handleCloseModal}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='save-button'
                  disabled={isLoading}
                >
                  {isLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default TeacherChangePassword
