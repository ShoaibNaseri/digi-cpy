import { useState, useEffect } from 'react'
import { addUser, checkUserExists, updateUser } from '@/services/adminService'
import { useSchoolPortal } from '@/context/SchoolPortalContext'
import { toast } from 'react-toastify'
import './ManageUserModal.css'
import { useAuth } from '@/context/AuthContext'
import { isEmpty } from 'lodash'
import { HiUser, HiMail } from 'react-icons/hi'
import { FaChevronDown } from 'react-icons/fa'
import userOctagonIcon from '@/assets/icons/user-octagon.svg'

const ManageUserModal = () => {
  const {
    form,
    setForm,
    isModalOpen,
    setIsModalOpen,
    setUsers,
    isEducatorDashboard
  } = useSchoolPortal()
  const { currentUser } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'TEACHER',
    status: 'INVITED'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false)

  useEffect(() => {
    if (form) {
      setFormData({
        firstName: form.firstName || '',
        lastName: form.lastName || '',
        email: form.email || '',
        role: form.role || 'TEACHER',
        status: form.status || 'INVITED'
      })
    }
  }, [form])

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      if (!validateEmail(formData.email)) {
        setErrors({ email: 'Please enter a valid email address' })
        setIsLoading(false)
        return
      }

      if (isEmpty(form)) {
        const userExists = await checkUserExists(formData.email)
        if (userExists) {
          toast.error('A user with this email already exists')
          setIsLoading(false)
          return
        }
        const userDoc = await addUser(formData, currentUser.schoolId)
        setUsers((prev) => [...prev, { ...formData, uid: userDoc.id }])
        setForm(null)
        toast.success('User invited successfully')
      } else {
        const updatedUser = await updateUser(form.uid, formData)
        toast.success('User updated successfully')
        setForm(updatedUser)
      }
    } catch (error) {
      toast.error('Failed to add user')
    } finally {
      setForm(null)
      setIsModalOpen(false)
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setForm({})
    setIsModalOpen(false)
    setIsLoading(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({
      ...prev,
      role
    }))
    setIsRoleDropdownOpen(false)
  }

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'TEACHER':
        return 'Teacher'
      case 'STUDENT':
        return 'Student'
      default:
        return role
    }
  }

  if (!isModalOpen) return null

  return (
    <div className='add-user-modal'>
      <div className='add-user-modal__content'>
        <button
          className='add-user-modal__close-button'
          onClick={handleCancel}
        >
          ×
        </button>
        
        <div className='add-user-modal__header'>
          <div className='add-user-modal__icon'>
            <img src={userOctagonIcon} alt="User Icon" />
          </div>
          <h2 className='add-user-modal__title'>
            {!isEmpty(form)
              ? 'Edit User'
              : 'Add New User'}
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='add-user-modal__form-group'>
            <label className='add-user-modal__label' htmlFor='role'>
              Role
            </label>
            <div className='add-user-modal__role-dropdown'>
              <div 
                className='add-user-modal__role-input'
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              >
                <HiUser size={20} className='add-user-modal__input-icon' />
                <span>{getRoleDisplayName(formData.role)}</span>
                <FaChevronDown size={16} className='add-user-modal__dropdown-arrow' />
              </div>
              {isRoleDropdownOpen && (
                <div className='add-user-modal__role-options'>
                  <div 
                    className={`add-user-modal__role-option ${formData.role === 'TEACHER' ? 'selected' : ''}`}
                    onClick={() => handleRoleSelect('TEACHER')}
                  >
                    Teacher
                  </div>
                  <div 
                    className={`add-user-modal__role-option ${formData.role === 'STUDENT' ? 'selected' : ''}`}
                    onClick={() => handleRoleSelect('STUDENT')}
                  >
                    Student
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className='add-user-modal__form-group'>
            <label className='add-user-modal__label' htmlFor='firstName'>
              First Name
            </label>
            <div className='add-user-modal__input-wrapper'>
              <HiUser size={20} className='add-user-modal__input-icon' />
              <input
                className={`add-user-modal__input ${
                  errors.firstName ? 'add-user-modal__input--error' : ''
                }`}
                type='text'
                id='firstName'
                name='firstName'
                placeholder='Enter your First Name'
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            {errors.firstName && (
              <div className='add-user-modal__error-message'>
                {errors.firstName}
              </div>
            )}
          </div>

          <div className='add-user-modal__form-group'>
            <label className='add-user-modal__label' htmlFor='lastName'>
              Last Name
            </label>
            <div className='add-user-modal__input-wrapper'>
              <HiUser size={20} className='add-user-modal__input-icon' />
              <input
                className={`add-user-modal__input ${
                  errors.lastName ? 'add-user-modal__input--error' : ''
                }`}
                type='text'
                id='lastName'
                name='lastName'
                placeholder='Enter your Last Name'
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            {errors.lastName && (
              <div className='add-user-modal__error-message'>
                {errors.lastName}
              </div>
            )}
          </div>

          <div className='add-user-modal__form-group'>
            <label className='add-user-modal__label' htmlFor='email'>
              Email
            </label>
            <div className='add-user-modal__input-wrapper'>
              <HiMail size={20} className='add-user-modal__input-icon' />
              <input
                className={`add-user-modal__input ${
                  errors.email ? 'add-user-modal__input--error' : ''
                }`}
                type='email'
                id='email'
                name='email'
                placeholder='Enter your email'
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            {errors.email && (
              <div className='add-user-modal__error-message'>
                {errors.email}
              </div>
            )}
          </div>

          <div className='add-user-modal__footer'>
            <button
              type='button'
              className='add-user-modal__button add-user-modal__button--cancel'
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='add-user-modal__button add-user-modal__button--submit'
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : form ? 'Save Changes' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ManageUserModal
