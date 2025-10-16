import { useState, useEffect } from 'react'
import { FaTimes, FaUser as FaUserIcon, FaCalendarAlt } from 'react-icons/fa'
import { toast } from 'react-toastify'
import './AddChildFormModal.css'

const AddChildFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingChild = null,
  isLoading = false,
  title = 'Add Your Child Profile',
  submitButtonText = 'Save Profile',
  showCloseButton = true
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDay: '',
    accountCreated: new Date().toISOString(),
    accountStatus: 'Active'
  })

  // Reset form when modal opens/closes or editing child changes
  useEffect(() => {
    if (isOpen) {
      if (editingChild) {
        setFormData({
          firstName: editingChild.firstName || '',
          lastName: editingChild.lastName || '',
          birthDay: editingChild.birthDay || '',
          accountCreated:
            editingChild.accountCreated || new Date().toISOString(),
          accountStatus: editingChild.accountStatus || 'Active'
        })
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          birthDay: '',
          accountCreated: new Date().toISOString(),
          accountStatus: 'Active'
        })
      }
    }
  }, [isOpen, editingChild])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDateChange = (e) => {
    const dateValue = e.target.value
    setFormData((prev) => ({
      ...prev,
      birthDay: dateValue
    }))
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      toast.error('Please enter first name')
      return false
    }
    if (!formData.lastName.trim()) {
      toast.error('Please enter last name')
      return false
    }
    if (!formData.birthDay.trim()) {
      toast.error('Please enter birth date')
      return false
    }

    // Validate date is not in the future
    const today = new Date().toISOString().split('T')[0]
    if (formData.birthDay > today) {
      toast.error('Birth date cannot be in the future')
      return false
    }

    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) return

    const childData = {
      ...formData,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim()
    }

    onSubmit(childData, editingChild)
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className='add-child-modal-overlay' onClick={handleClose}>
      <div className='add-child-modal' onClick={(e) => e.stopPropagation()}>
        <div className='add-child-form-section'>
          <div className='add-child-form-header'>
            <h2>{title}</h2>
            {showCloseButton && (
              <button
                className='add-child-close-form-btn'
                onClick={handleClose}
                disabled={isLoading}
              >
                <FaTimes />
              </button>
            )}
          </div>

          <form className='add-child-form' onSubmit={handleSubmit}>
            <div className='add-child-form-row'>
              <div className='add-child-form-group'>
                <label htmlFor='firstName'>First Name *</label>
                <div className='input-group'>
                  <span className='input-group-text'>
                    <FaUserIcon className='login-input-icon' />
                  </span>
                  <input
                    type='text'
                    id='firstName'
                    name='firstName'
                    className='form-control'
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder='Enter first name'
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className='add-child-form-group'>
                <label htmlFor='lastName'>Last Name *</label>
                <div className='input-group'>
                  <span className='input-group-text'>
                    <FaUserIcon className='login-input-icon' />
                  </span>
                  <input
                    type='text'
                    id='lastName'
                    name='lastName'
                    className='form-control'
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder='Enter last name'
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className='add-child-form-group'>
              <label htmlFor='birthDay'>Birth Date *</label>
              <div className='input-group'>
                <span className='input-group-text'>
                  <FaCalendarAlt className='login-input-icon' />
                </span>
                <input
                  type='date'
                  id='birthDay'
                  name='birthDay'
                  className='form-control'
                  value={formData.birthDay}
                  onChange={handleDateChange}
                  max={new Date().toISOString().split('T')[0]}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className='add-child-form-actions'>
              <button
                type='button'
                className='add-child-cancel-btn'
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type='submit'
                className='add-child-submit-btn'
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : submitButtonText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddChildFormModal
