import React, { useState, useEffect } from 'react'
import './TeacherProfile.css'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import {
  getUserSchool,
  saveUserProfile,
  fetchUserProfile
} from '@/services/userService'
import ProfileSchoolDetails from '../../ProfileSchoolDetails'
import TeacherChangePassword from './TeacherChangePassword'
import CustomDropdown from './CustomDropdown'

import DownloadMyData from './components/DownloadMyData'
import PagePreloader from '@/components/common/preloaders/PagePreloader'
// Import icons
import userIcon from '@/assets/icons/user.svg'
import phoneIcon from '@/assets/icons/call.svg'
import countryIcon from '@/assets/images/country.png'
import mapIcon from '@/assets/icons/map.svg'
import editIcon from '@/assets/icons/edit-2.svg'

// Email icon as a simple component since message.png might have path issues
const EmailIcon = () => (
  <svg
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M22 6L12 13L2 6'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

const TeacherProfile = () => {
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editMode, setEditMode] = useState(false) // Add edit mode state
  const [schoolData, setSchoolData] = useState(null)

  // Form validation states
  const [formErrors, setFormErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    region: '', // Changed from state to region
    country: 'United States',
    language: 'English (US)',
    timeZone: 'Eastern Time (ET)',
    emailNotifications: true,
    role: 'TEACHER' // Default role
  })

  // US and Canada time zones - comprehensive list
  const timeZones = [
    // US Time Zones
    'Eastern Time (ET / GMT-5)',
    'Central Time (CT / GMT-6)',
    'Mountain Time (MT / GMT-7)',
    'Pacific Time (PT / GMT-8)',
    'Alaska Time (AKT / GMT-9)',
    'Hawaii-Aleutian Time (HAT / GMT-10)',
    'Samoa Time (ST / GMT-11)',
    'Chamorro Time (ChT / GMT+10)',

    // Canada Time Zones
    'Atlantic Time (AT / GMT-4)',
    'Newfoundland Time (NT / GMT-3:30)',
    'Eastern Time - Canada (ET / GMT-5)',
    'Central Time - Canada (CT / GMT-6)',
    'Mountain Time - Canada (MT / GMT-7)',
    'Pacific Time - Canada (PT / GMT-8)',
    'Yukon Time (YT / GMT-7)'
  ]

  // Fetch user data on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        if (!currentUser) {
          console.error('No user is signed in')
          setLoading(false)
          return
        }

        const userId = currentUser.uid
        const userData = await fetchUserProfile(userId)

        if (userData) {
          // Map state and territory to region if this is from an older version of the profile
          let updatedData = { ...userData }
          if (
            userData.country === 'Canada' &&
            (userData.state || userData.territory)
          ) {
            updatedData.region = userData.state || userData.territory
          } else if (userData.state) {
            updatedData.region = userData.state
          }

          setProfileData((prevData) => ({
            ...prevData,
            ...updatedData,
            email: updatedData.email || currentUser.email || prevData.email
          }))

          // Fetch school data if schoolId exists
          if (userData.schoolId) {
            const schoolInfo = await getUserSchool(userData.schoolId)
            setSchoolData(schoolInfo)
          }
        } else {
          // Initialize with data from auth if available
          setProfileData((prevData) => ({
            ...prevData,
            email: currentUser.email || '',
            firstName: currentUser.displayName
              ? currentUser.displayName.split(' ')[0]
              : '',
            lastName: currentUser.displayName
              ? currentUser.displayName.split(' ')[1] || ''
              : ''
          }))
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [])

  // Validation functions
  const validateField = (field, value) => {
    let error = ''

    switch (field) {
      case 'firstName':
      case 'lastName':
        // Only allow alphabetic characters
        if (!/^[A-Za-z]+$/.test(value) && value.trim() !== '') {
          error = 'Only alphabetic characters are allowed'
        }
        break

      case 'email':
        // Email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.trim() !== '') {
          error = 'Please enter a valid email address'
        }
        break

      case 'phone':
        // US phone format validation (123-456-7890)
        if (!/^\d{3}-\d{3}-\d{4}$/.test(value) && value.trim() !== '') {
          error = 'Phone must be in format: 123-456-7890'
        }
        break

      default:
        break
    }

    return error
  }

  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '')

    // Limit to 10 digits (for US phone numbers)
    const limitedDigits = digits.slice(0, 10)

    // Format the phone number as user types (123-456-7890)
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

  const handleInputChange = (field, value) => {
    let processedValue = value

    // Restrict input based on field type
    switch (field) {
      case 'firstName':
      case 'lastName':
        // Only allow alphabetic characters
        processedValue = value.replace(/[^A-Za-z]/g, '')
        break

      case 'email':
        // Allow valid email characters
        processedValue = value
        break

      case 'phone':
        // Format phone number and restrict to valid format
        processedValue = formatPhoneNumber(value)
        break

      default:
        processedValue = value
    }

    // Set the new value
    setProfileData((prevData) => ({
      ...prevData,
      [field]: processedValue
    }))

    // Validate the field (still needed for email format validation)
    const error = validateField(field, processedValue)
    setFormErrors({
      ...formErrors,
      [field]: error
    })
  }

  const validateForm = () => {
    let isValid = true
    const errors = {}

    // Validate each field
    Object.keys(formErrors).forEach((field) => {
      const error = validateField(field, profileData[field])
      errors[field] = error
      if (error) isValid = false
    })

    setFormErrors(errors)
    return isValid
  }

  const handleSaveChanges = async () => {
    // Validate the form before saving
    if (!validateForm()) {
      toast.error('Please fix form errors before saving')
      return
    }

    try {
      setIsSubmitting(true)

      if (!currentUser) {
        console.error('No user is signed in')
        setIsSubmitting(false)
        return
      }

      const userId = currentUser.uid

      // Add role to ensure it's preserved
      const updatedData = {
        ...profileData,
        role: profileData.role || 'TEACHER' // Ensure role is preserved
      }

      await saveUserProfile(userId, updatedData)

      setIsSubmitting(false)
      setEditMode(false)
      toast.success('Profile saved successfully')
    } catch (error) {
      console.error('Error saving profile data:', error)
      toast.error(
        'Error saving profile. Please fix the validation errors and try again.'
      )
    }
  }

  const handleCancel = () => {
    // Exit edit mode without saving changes
    setEditMode(false)

    // Reset any form errors
    setFormErrors({
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    })

    // Refresh profile data from server to discard changes
    const refreshProfile = async () => {
      try {
        if (!currentUser) {
          console.error('No user is signed in')
          return
        }

        const userId = currentUser.uid
        const userData = await fetchUserProfile(userId)

        if (userData) {
          // Map state and territory to region if needed
          let updatedData = { ...userData }
          if (
            userData.country === 'Canada' &&
            (userData.state || userData.territory)
          ) {
            updatedData.region = userData.state || userData.territory
          } else if (userData.state) {
            updatedData.region = userData.state
          }

          setProfileData((prevData) => ({
            ...prevData,
            ...updatedData,
            email: updatedData.email || currentUser.email || prevData.email
          }))
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }

    refreshProfile()
  }

  if (loading) {
    return <PagePreloader color='black' textData='Loading profile data...' />
  }

  // Determine region label based on country
  const regionLabel =
    profileData.country === 'Canada' ? 'Province/Territory' : 'State'

  return (
    <div className='teacher-profile-container'>
      <div className='teacher-profile-header'>
        <div className='teacher-profile-header-content'>
          <h1 className='teacher-profile-title'>Profile Settings</h1>
          <p className='teacher-profile-subtitle'>
            Manage your account preferences and information
          </p>
        </div>
      </div>

      <div className='teacher-profile-section'>
        <div className='teacher-profile-row'>
          <h2 className='teacher-profile-section-title'>
            Personal Information
          </h2>
          <button
            className='teacher-profile-edit-btn'
            onClick={() => setEditMode(!editMode)}
          >
            <img src={editIcon} alt='Edit' className='edit-icon' />
            {editMode ? 'Cancel Edit' : 'Edit'}
          </button>
        </div>

        <div className='teacher-profile-form-grid'>
          <div className='teacher-profile-form-group'>
            <label className='teacher-profile-label'>First Name</label>
            {editMode ? (
              <>
                <div className='teacher-profile-input-wrapper'>
                  <img src={userIcon} alt='User' className='input-icon' />
                  <input
                    type='text'
                    className={`teacher-profile-input ${
                      formErrors.firstName ? 'error' : ''
                    }`}
                    value={profileData.firstName}
                    onChange={(e) =>
                      handleInputChange('firstName', e.target.value)
                    }
                  />
                </div>
                {formErrors.firstName && (
                  <div className='teacher-profile-error-message'>
                    {formErrors.firstName}
                  </div>
                )}
              </>
            ) : (
              <div className='teacher-profile-display-field'>
                <div className='teacher-profile-display-field-with-icon'>
                  <img src={userIcon} alt='User' className='display-icon' />
                  {profileData.firstName}
                </div>
              </div>
            )}
          </div>

          <div className='teacher-profile-form-group'>
            <label className='teacher-profile-label'>Last Name</label>
            {editMode ? (
              <>
                <div className='teacher-profile-input-wrapper'>
                  <img src={userIcon} alt='User' className='input-icon' />
                  <input
                    type='text'
                    className={`teacher-profile-input ${
                      formErrors.lastName ? 'error' : ''
                    }`}
                    value={profileData.lastName}
                    onChange={(e) =>
                      handleInputChange('lastName', e.target.value)
                    }
                  />
                </div>
                {formErrors.lastName && (
                  <div className='teacher-profile-error-message'>
                    {formErrors.lastName}
                  </div>
                )}
              </>
            ) : (
              <div className='teacher-profile-display-field'>
                <div className='teacher-profile-display-field-with-icon'>
                  <img src={userIcon} alt='User' className='display-icon' />
                  {profileData.lastName}
                </div>
              </div>
            )}
          </div>

          <div className='teacher-profile-form-group'>
            <label className='teacher-profile-label'>Email</label>
            {editMode ? (
              <>
                <div className='teacher-profile-input-wrapper'>
                  <EmailIcon />
                  <input
                    type='email'
                    className={`teacher-profile-input ${
                      formErrors.email ? 'error' : ''
                    }`}
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
                {formErrors.email && (
                  <div className='teacher-profile-error-message'>
                    {formErrors.email}
                  </div>
                )}
              </>
            ) : (
              <div className='teacher-profile-display-field'>
                <div className='teacher-profile-display-field-with-icon'>
                  <EmailIcon />
                  {profileData.email}
                </div>
              </div>
            )}
          </div>

          <div className='teacher-profile-form-group'>
            <label className='teacher-profile-label'>Phone</label>
            {editMode ? (
              <>
                <div className='teacher-profile-input-wrapper'>
                  <img src={phoneIcon} alt='Phone' className='input-icon' />
                  <input
                    type='tel'
                    className={`teacher-profile-input ${
                      formErrors.phone ? 'error' : ''
                    }`}
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder='123-456-7890'
                  />
                </div>
                {formErrors.phone && (
                  <div className='teacher-profile-error-message'>
                    {formErrors.phone}
                  </div>
                )}
              </>
            ) : (
              <div className='teacher-profile-display-field'>
                <div className='teacher-profile-display-field-with-icon'>
                  <img src={phoneIcon} alt='Phone' className='display-icon' />
                  {profileData.phone || 'Not set'}
                </div>
              </div>
            )}
          </div>

          <div className='teacher-profile-form-group'>
            <label className='teacher-profile-label'>Country</label>
            <div className='teacher-profile-display-field'>
              <div className='teacher-profile-display-field-with-icon'>
                <img src={countryIcon} alt='Country' className='display-icon' />
                {profileData.country}
              </div>
            </div>
          </div>

          <div className='teacher-profile-form-group'>
            <label className='teacher-profile-label'>{regionLabel}</label>
            <div className='teacher-profile-display-field'>
              <div className='teacher-profile-display-field-with-icon'>
                <img src={mapIcon} alt='Region' className='display-icon' />
                {profileData.region || 'Not set'}
              </div>
            </div>
          </div>
        </div>
        <div className='teacher-profile-section'>
          <h2 className='teacher-profile-section-title'>Account Settings</h2>

          <div className='teacher-profile-account-settings'>
            <div className='teacher-profile-form-group wide'>
              <div className='teacher-profile-form-group'>
                <label className='teacher-profile-label'>Language</label>
                {editMode ? (
                  <CustomDropdown
                    value={profileData.language}
                    onChange={(value) => handleInputChange('language', value)}
                    options={['English (US)', 'Spanish', 'French']}
                    placeholder='Select language'
                  />
                ) : (
                  <div className='teacher-profile-display-field'>
                    {profileData.language}
                  </div>
                )}
              </div>

              <div className='teacher-profile-form-group'>
                <label className='teacher-profile-label'>Time Zone</label>
                {editMode ? (
                  <CustomDropdown
                    value={profileData.timeZone}
                    onChange={(value) => handleInputChange('timeZone', value)}
                    options={timeZones}
                    placeholder='Select time zone'
                  />
                ) : (
                  <div className='teacher-profile-display-field'>
                    {profileData.timeZone}
                  </div>
                )}
              </div>
            </div>

            <div className='teacher-profile-form-group wide notification-group'>
              <label className='teacher-profile-label'>
                Email Notifications
              </label>
              <div className='teacher-profile-toggle'>
                <label className='teacher-profile-toggle-switch'>
                  <input
                    type='checkbox'
                    checked={profileData.emailNotifications}
                    onChange={(e) =>
                      handleInputChange('emailNotifications', e.target.checked)
                    }
                    aria-label='Toggle email notifications'
                    disabled={!editMode}
                  />
                  <span className='teacher-profile-toggle-slider'></span>
                </label>
              </div>
            </div>
            {editMode && (
              <div className='teacher-profile-actions'>
                <button
                  className='teacher-profile-cancel-btn'
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  className='teacher-profile-save-btn'
                  onClick={handleSaveChanges}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {schoolData && <ProfileSchoolDetails schoolData={schoolData} />}

      <TeacherChangePassword />
      <DownloadMyData />
    </div>
  )
}

export default TeacherProfile
