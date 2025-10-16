import './BasicInformation.css'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useProfile } from '@/context/ProfileContext'
import { toast } from 'sonner'
import {
  HiUser,
  HiMail,
  HiLocationMarker,
  HiGlobeAlt,
  HiCalendar
} from 'react-icons/hi'
import EmailChangeModal from './EmailChangeModal'
import {
  EmailAuthProvider,
  verifyBeforeUpdateEmail,
  reauthenticateWithCredential
} from 'firebase/auth'
import { auth } from '@/firebase/config'
import { createSchoolNotificationOnStudentUpdate } from '@/services/studentNotificationService'
const BasicInformation = ({ isEditing, onToggleEdit }) => {
  const { currentUser, logout } = useAuth()
  const {
    profileData,
    loading,
    updateUserProfile,
    fetchUserProfile,
    setProfileData
  } = useProfile()
  const [isSaving, setIsSaving] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    region: '',
    country: '',
    email: ''
  })

  const handleSaveChanges = async () => {
    if (!currentUser) {
      toast.error('You must be logged in to update your profile')
      return
    }

    // Check if email has been changed and user is a student
    const isEmailChanged =
      currentUser.role === 'STUDENT' && formData.email !== currentUser.email

    if (isEmailChanged) {
      setIsEmailModalOpen(true)
      return
    }

    try {
      setIsSaving(true)

      const updatedData = {
        firstName: profileData?.firstName || '',
        lastName: profileData?.lastName || '',
        dateOfBirth: profileData?.dateOfBirth || '',
        updatedAt: new Date()
      }

      const success = await updateUserProfile(currentUser.uid, updatedData)

      if (success) {
        toast.success('Profile updated successfully')
        createSchoolNotificationOnStudentUpdate(
          currentUser.schoolId,
          profileData?.firstName || ''
        )
        onToggleEdit()
      }
    } catch (error) {
      console.error('Error saving profile changes:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEmailChange = async (password) => {
    try {
      setIsSaving(true)

      // Create auth credential
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        password
      )

      // Reauthenticate
      await reauthenticateWithCredential(auth.currentUser, credential)

      // Send verification email to new address
      await verifyBeforeUpdateEmail(auth.currentUser, formData.email)

      // Update profile data with pending email change
      await updateUserProfile(currentUser.uid, {
        firstName: profileData?.firstName || '',
        lastName: profileData?.lastName || '',
        dateOfBirth: profileData?.dateOfBirth || '',
        pendingEmail: formData.email,
        updatedAt: new Date()
      })

      toast.success(
        'Verification email sent. Please check your new email address to complete the change.'
      )
      setIsEmailModalOpen(false)
      onToggleEdit()

      // Don't log out yet - user needs to verify email first
    } catch (error) {
      console.error('Error updating email:', error)
      if (error.code === 'auth/requires-recent-login') {
        toast.error(
          'Please log out and log in again before changing your email'
        )
      } else if (error.code === 'auth/email-already-in-use') {
        toast.error('This email is already in use')
      } else if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/wrong-password'
      ) {
        toast.error('Incorrect password')
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many attempts. Please try again later')
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email format')
      } else {
        toast.error('Failed to update profile. Please try again.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    if (currentUser && currentUser.uid) {
      fetchUserProfile(currentUser.uid)
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        dateOfBirth: currentUser.dateOfBirth || '',
        region: currentUser.region || '',
        country: currentUser.country || '',
        email: currentUser.email || ''
      })
    }
  }, [currentUser])

  useEffect(() => {
    if (profileData) {
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        dateOfBirth: profileData.dateOfBirth || '',
        region: profileData.region || '',
        country: profileData.country || '',
        email: profileData.email || ''
      })
    }
  }, [profileData])

  const handleChange = (e) => {
    const updatedFormData = {
      ...formData,
      [e.target.id]: e.target.value
    }

    setFormData(updatedFormData)

    if (profileData) {
      setProfileData({
        ...profileData,
        [e.target.id]: e.target.value
      })
    }
  }

  return (
    <>
      <div className='profile-form-grid'>
        <div className='profile-form-group'>
          <label className='profile-label'>First Name</label>
          {isEditing ? (
            <>
              <div className='profile-input-wrapper'>
                <HiUser size={24} color='#4B5563' />
                <input
                  type='text'
                  id='firstName'
                  className='profile-input'
                  placeholder='First Name'
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
            </>
          ) : (
            <div className='profile-display-field'>
              <div className='profile-display-field-with-icon'>
                <HiUser size={24} color='#4B5563' />
                {formData.firstName || 'Not set'}
              </div>
            </div>
          )}
        </div>

        <div className='profile-form-group'>
          <label className='profile-label'>Last Name</label>
          {isEditing ? (
            <>
              <div className='profile-input-wrapper'>
                <HiUser size={24} color='#4B5563' />
                <input
                  type='text'
                  id='lastName'
                  className='profile-input'
                  placeholder='Last Name'
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </>
          ) : (
            <div className='profile-display-field'>
              <div className='profile-display-field-with-icon'>
                <HiUser size={24} color='#4B5563' />
                {formData.lastName || 'Not set'}
              </div>
            </div>
          )}
        </div>

        <div className='profile-form-group'>
          <label className='profile-label'>Date of Birth</label>
          {isEditing ? (
            <div className='profile-input-wrapper'>
              <HiCalendar size={24} color='#4B5563' />
              <input
                type='date'
                id='dateOfBirth'
                className='profile-input'
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>
          ) : (
            <div className='profile-display-field'>
              <div className='profile-display-field-with-icon'>
                <HiCalendar size={24} color='#4B5563' />
                {formData.dateOfBirth || 'Not set'}
              </div>
            </div>
          )}
        </div>

        {currentUser?.role === 'STUDENT' && (
          <div className='profile-form-group'>
            <label className='profile-label'>Email Address</label>
            {isEditing ? (
              <>
                <div className='profile-input-wrapper'>
                  <HiMail size={24} color='#4B5563' />
                  <input
                    type='email'
                    id='email'
                    className='profile-input'
                    placeholder='Email Address'
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </>
            ) : (
              <div className='profile-display-field'>
                <div className='profile-display-field-with-icon'>
                  <HiMail size={24} color='#4B5563' />
                  {formData.email || 'Not set'}
                </div>
              </div>
            )}
          </div>
        )}

        <div className='profile-form-group'>
          <label className='profile-label'>State/Province</label>
          <div className='profile-display-field'>
            <div className='profile-display-field-with-icon'>
              <HiLocationMarker size={24} color='#4B5563' />
              {formData.region || 'Not set'}
            </div>
          </div>
        </div>

        <div className='profile-form-group'>
          <label className='profile-label'>Country</label>
          <div className='profile-display-field'>
            <div className='profile-display-field-with-icon'>
              <HiGlobeAlt size={24} color='#4B5563' />
              {formData.country || 'Not set'}
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className='profile-actions'>
          <button className='profile-cancel-btn' onClick={onToggleEdit}>
            Cancel
          </button>
          <button
            className='profile-save-btn'
            onClick={handleSaveChanges}
            disabled={loading || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      <EmailChangeModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onConfirm={handleEmailChange}
        newEmail={formData.email}
        isProcessing={isSaving}
      />
    </>
  )
}

export default BasicInformation
