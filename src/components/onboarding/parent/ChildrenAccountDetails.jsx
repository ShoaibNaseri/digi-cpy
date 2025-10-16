import { useState } from 'react'
import { CiUser } from 'react-icons/ci'
import { useNavigate } from 'react-router-dom'
import './ChildrenAccountDetails.css'
import { FaArrowLeftLong, FaPlus } from 'react-icons/fa6'
import { FaTimes } from 'react-icons/fa'
import { createChildrenAccount } from '@/services/parentService'
import { toast } from 'react-toastify'
import { useAuth } from '@/context/AuthContext'
import { v4 as uuidv4 } from 'uuid'

const ChildrenAccountDetails = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [expandedProfile, setExpandedProfile] = useState(0)
  const [formData, setFormData] = useState({
    profiles: [
      {
        childId: uuidv4(),
        firstName: '',
        lastName: '',
        birthDay: ''
      },
      {
        childId: uuidv4(),
        firstName: '',
        lastName: '',
        birthDay: ''
      },
      {
        childId: uuidv4(),
        firstName: '',
        lastName: '',
        birthDay: ''
      }
    ]
  })

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
    navigate(-1)
  }

  const handleContinue = async () => {
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

    const nonEmptyProfiles = formData.profiles.filter(
      (profile) =>
        profile.firstName.trim() !== '' ||
        profile.lastName.trim() !== '' ||
        profile.birthDay.trim() !== ''
    )

    if (nonEmptyProfiles.length === 0) {
      toast.error('Please add details for at least one child')
      return
    }

    for (let i = 0; i < nonEmptyProfiles.length; i++) {
      const profile = nonEmptyProfiles[i]
      const profileIndex = formData.profiles.indexOf(profile)

      if (!profile.firstName.trim()) {
        toast.error(`Please enter first name for Profile ${profileIndex + 1}`)
        return
      }
      if (!profile.lastName.trim()) {
        toast.error(`Please enter last name for Profile ${profileIndex + 1}`)
        return
      }
      if (!profile.birthDay.trim()) {
        toast.error(`Please enter birth day for Profile ${profileIndex + 1}`)
        return
      }
    }

    try {
      if (!currentUser) {
        toast.error('Parent ID not found. Please log in again.')
        return
      }

      await createChildrenAccount({
        parentId: currentUser.uid,
        children: nonEmptyProfiles
      })

      navigate('/onboarding/parent/parent-setup-summary')

      toast.success('Child accounts created successfully')
    } catch (error) {
      console.error('Error creating child accounts:', error)
      toast.error('Failed to create child accounts. Please try again.')
    }
  }

  return (
    <div className='family-plan-container'>
      <div className='family-plan-content'>
        <h1 className='family-plan-title'>Family Plan Setup</h1>
        <p className='family-plan-subtitle'>
          Configure accounts for up to 3 children
        </p>

        <div className='seats-container'>
          {formData.profiles?.map((profile, index) => (
            <div
              key={index}
              className={`seat-section ${
                expandedProfile === index ? 'expanded' : ''
              }`}
            >
              <div className='seat-header' onClick={() => toggleProfile(index)}>
                <div className='seat-icon-name'>
                  <CiUser className='seat-icon' />
                  <span className='seat-name'>Profile {index + 1}</span>
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
                      onClick={(e) => e.target.showPicker()}
                    />
                  </div>
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
              onClick={handleContinue}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChildrenAccountDetails
