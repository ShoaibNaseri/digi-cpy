import { useState, useEffect } from 'react'
import { CiUser } from 'react-icons/ci'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeftLong, FaPlus } from 'react-icons/fa6'
import {
  getChildrenProfiles,
  updateChildrenProfiles
} from '@/services/parentService'
import { toast } from 'react-toastify'
import { useAuth } from '@/context/AuthContext'
import './ChildrenAccountDetails.css'
import './EditProfiles.css'
import { FaTimes } from 'react-icons/fa'
import { v4 as uuidv4 } from 'uuid'

const EditProfiles = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [expandedProfile, setExpandedProfile] = useState(null)
  const [formData, setFormData] = useState({
    profiles: []
  })

  useEffect(() => {
    const fetchChildren = async () => {
      if (currentUser) {
        try {
          const childrenProfiles = await getChildrenProfiles(currentUser.uid)

          const profiles = Array(3)
            .fill()
            .map((_, i) => {
              if (i < childrenProfiles.length) {
                return {
                  childId: childrenProfiles[i].childId || uuidv4(),
                  firstName: childrenProfiles[i].firstName || '',
                  lastName: childrenProfiles[i].lastName || '',
                  birthDay: childrenProfiles[i].birthDay || '',
                  originalIndex: i
                }
              } else {
                return {
                  childId: uuidv4(),
                  firstName: '',
                  lastName: '',
                  birthDay: ''
                }
              }
            })

          setFormData({ profiles })
        } catch (error) {
          console.error('Error fetching children profiles:', error)
          toast.error('Error loading profiles. Please try again.')
        }
      }
    }

    fetchChildren()
  }, [currentUser])

  const handleInputChange = (profileIndex, field, value) => {
    const updatedProfiles = [...formData.profiles]
    updatedProfiles[profileIndex] = {
      ...updatedProfiles[profileIndex],
      [field]: value
    }

    setFormData({
      ...formData,
      profiles: updatedProfiles
    })
  }

  const handleDateChange = (profileIndex, e) => {
    const dateValue = e.target.value
    const updatedProfiles = [...formData.profiles]

    if (dateValue) {
      updatedProfiles[profileIndex] = {
        ...updatedProfiles[profileIndex],
        birthDay: dateValue
      }
    } else {
      updatedProfiles[profileIndex] = {
        ...updatedProfiles[profileIndex],
        birthDay: ''
      }
    }

    setFormData({
      ...formData,
      profiles: updatedProfiles
    })
  }

  const toggleProfile = (profileIndex) => {
    setExpandedProfile(expandedProfile === profileIndex ? null : profileIndex)
  }

  const handleBack = () => {
    navigate('/dashboard/parent/profiles')
  }

  const handleDeleteProfile = async (profileIndex) => {
    if (!currentUser) {
      toast.error('You must be logged in to update profiles')
      return
    }

    try {
      const childrenProfiles = await getChildrenProfiles(currentUser.uid)

      if (formData.profiles[profileIndex].originalIndex !== undefined) {
        const updatedChildrenProfiles = childrenProfiles.filter(
          (_, i) => i !== formData.profiles[profileIndex].originalIndex
        )

        await updateChildrenProfiles(currentUser.uid, updatedChildrenProfiles)

        toast.success('Profile deleted successfully')

        const updatedProfiles = [...formData.profiles]
        updatedProfiles[profileIndex] = {
          childId: uuidv4(),
          firstName: '',
          lastName: '',
          birthDay: ''
        }

        setFormData({
          ...formData,
          profiles: updatedProfiles
        })
      } else {
        const updatedProfiles = [...formData.profiles]
        updatedProfiles[profileIndex] = {
          childId: uuidv4(),
          firstName: '',
          lastName: '',
          birthDay: ''
        }

        setFormData({
          ...formData,
          profiles: updatedProfiles
        })
      }
    } catch (error) {
      console.error('Error deleting profile:', error)
      toast.error('Failed to delete profile. Please try again.')
    }
  }

  const handleSaveChanges = async () => {
    if (!currentUser) {
      toast.error('You must be logged in to update profiles')
      return
    }

    if (expandedProfile !== null) {
      const profile = formData.profiles[expandedProfile]
      if (!profile.firstName.trim()) {
        toast.error(
          `Please enter first name for Profile ${expandedProfile + 1}`
        )
        return
      }
      if (!profile.lastName.trim()) {
        toast.error(`Please enter last name for Profile ${expandedProfile + 1}`)
        return
      }
      if (!profile.birthDay.trim()) {
        toast.error(
          `Please enter birth date for Profile ${expandedProfile + 1}`
        )
        return
      }
    }

    try {
      const existingProfiles = await getChildrenProfiles(currentUser.uid)

      const updatedProfiles = [...existingProfiles]

      formData.profiles.forEach((profile, index) => {
        if (profile.firstName && profile.lastName && profile.birthDay) {
          const childData = {
            childId: profile.childId,
            firstName: profile.firstName,
            lastName: profile.lastName,
            birthDay: profile.birthDay
          }

          if (profile.originalIndex !== undefined) {
            updatedProfiles[profile.originalIndex] = childData
          } else if (
            profile.firstName.trim() !== '' &&
            profile.lastName.trim() !== '' &&
            profile.birthDay.trim() !== ''
          ) {
            updatedProfiles.push(childData)
          }
        }
      })

      await updateChildrenProfiles(currentUser.uid, updatedProfiles)

      toast.success('Profiles updated successfully')
      navigate('/onboarding/parent/parent-setup-summary')
    } catch (error) {
      console.error('Error updating profiles:', error)
      toast.error('Failed to update profiles. Please try again.')
    }
  }

  return (
    <div className='family-plan-container'>
      <div className='family-plan-content'>
        <h1 className='family-plan-title'>Edit Child Profiles</h1>
        <p className='family-plan-subtitle'>
          Update or add profiles for your children
        </p>

        <div className='seats-container'>
          {formData.profiles.map((profile, index) => (
            <div
              key={index}
              className={`seat-section ${
                expandedProfile === index ? 'expanded' : ''
              }`}
            >
              <div className='seat-header' onClick={() => toggleProfile(index)}>
                <div className='seat-icon-name'>
                  <CiUser className='seat-icon' />
                  <span className='seat-name'>
                    {profile.firstName
                      ? `${profile.firstName} ${profile.lastName}`
                      : `Profile ${index + 1}`}
                  </span>
                </div>
                <span className='expand-icon'>
                  {expandedProfile === index ? <FaTimes /> : <FaPlus />}
                </span>
              </div>

              {expandedProfile === index && (
                <div className='seat-details'>
                  <div className='form-row'>
                    <div className='form-group'>
                      <label>First Name</label>
                      <input
                        type='text'
                        placeholder='Enter first name'
                        value={profile.firstName}
                        onChange={(e) =>
                          handleInputChange(index, 'firstName', e.target.value)
                        }
                      />
                    </div>
                    <div className='form-group'>
                      <label>Last Name</label>
                      <input
                        type='text'
                        placeholder='Enter last name'
                        value={profile.lastName}
                        onChange={(e) =>
                          handleInputChange(index, 'lastName', e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className='form-group'>
                    <label>Birth Day</label>
                    <input
                      type='date'
                      className='date-picker-input'
                      value={profile.birthDay}
                      onChange={(e) => handleDateChange(index, e)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  {profile.firstName && (
                    <button
                      type='button'
                      className='delete-profile-button'
                      onClick={() => handleDeleteProfile(index)}
                    >
                      Delete Profile
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className='form-actions'>
          <button
            type='button'
            className='form-actions-back-button'
            onClick={handleBack}
          >
            <FaArrowLeftLong />
            <span>Back</span>
          </button>
          <div className='right-actions'>
            <button
              type='button'
              className='form-actions-continue-button'
              onClick={handleSaveChanges}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditProfiles
