import './GuardianInformation.css'
import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useProfile } from '../../../context/ProfileContext'
import { toast } from 'sonner'
import { CiEdit } from 'react-icons/ci'
import { IoClose } from 'react-icons/io5'

const GuardianInformation = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [guardianEmail, setGuardianEmail] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const { currentUser } = useAuth()
  const {
    profileData,
    loading,
    updateUserProfile,
    fetchUserProfile,
    setProfileData
  } = useProfile()

  useEffect(() => {
    if (currentUser && currentUser.uid) {
      fetchUserProfile(currentUser.uid)
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser && currentUser.profileData) {
      setGuardianEmail(currentUser.profileData.guardianEmail || '')
    }
  }, [currentUser])

  useEffect(() => {
    if (profileData) {
      setGuardianEmail(profileData.guardianEmail || '')
    }
  }, [profileData])

  const toggleEdit = () => {
    setIsEditing(!isEditing)
  }

  const handleSaveChanges = async () => {
    if (!currentUser) {
      toast.error('You must be logged in to update your profile')
      return
    }

    try {
      setIsSaving(true)

      const updatedData = {
        guardianEmail: guardianEmail
      }

      const success = await updateUserProfile(currentUser.uid, updatedData)

      if (success) {
        toast.success('Profile updated successfully')
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error saving profile changes:', error)
      toast.error('Failed to save profile changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (e) => {
    const newValue = e.target.value
    setGuardianEmail(newValue)

    if (profileData) {
      setProfileData({
        ...profileData,
        guardianEmail: newValue
      })
    }
  }

  return (
    <div className='guardian'>
      <div className='guardian__header'>
        <h1 className='guardian__title'>Guardian Information</h1>
        <button className='guardian__edit-button' onClick={toggleEdit}>
          {isEditing ? <IoClose size={20} /> : <CiEdit size={20} />}
          <span>{isEditing ? 'Cancel' : 'Edit'}</span>
        </button>
      </div>
      <div className='guardian__form'>
        <div className='guardian__group'>
          <label htmlFor='guardianEmail'>Guardian Email</label>
          <input
            type='email'
            id='guardianEmail'
            className='guardian__input'
            placeholder='parent@example.com'
            value={guardianEmail}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>
      </div>
      {isEditing && (
        <div className='profile__actions'>
          <button className='profile__actions-cancel' onClick={toggleEdit}>
            Cancel
          </button>
          <button
            className='profile__actions-save'
            onClick={handleSaveChanges}
            disabled={loading || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  )
}

export default GuardianInformation
