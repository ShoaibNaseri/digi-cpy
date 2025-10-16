import './ChildAccountSetup.css'
import { useAuth } from '@/context/AuthContext'
import { useState, useEffect } from 'react'
import { getSubscriptionByUserId } from '@/services/paymentService'
import {
  createChildrenAccount,
  updateParentProfile
} from '@/services/parentService'
import { toast } from 'react-toastify'
import { CiUser } from 'react-icons/ci'
import { FaPlus, FaTimes, FaUser, FaCalendarAlt, FaTrash } from 'react-icons/fa'
import { v4 as uuidv4 } from 'uuid'
import { useNavigate } from 'react-router-dom'
import Loader from '@/components/common/Loader/Loader'

const ChildAccountSetup = ({ handleNextStep, currentStep }) => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [subscriptionData, setSubscriptionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedProfile, setExpandedProfile] = useState(0)
  const [formData, setFormData] = useState({
    profiles: []
  })

  // Initialize profiles based on subscription plan - start with only 1 child
  const initializeProfiles = (planType) => {
    const profiles = [
      {
        childId: uuidv4(),
        firstName: '',
        lastName: '',
        birthDay: ''
      }
    ]

    setFormData({ profiles })
    setExpandedProfile(0) // Expand first profile by default
  }

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!currentUser?.uid) {
        setError('User not authenticated')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const result = await getSubscriptionByUserId(currentUser.uid)

        if (result.success) {
          // Extract only the active subscription object
          const activeSubscription = result.activeSubscription
          setSubscriptionData(activeSubscription)
          console.log('Active Subscription Data:', activeSubscription)

          // Initialize profiles based on plan type
          if (activeSubscription) {
            initializeProfiles(activeSubscription.planType)
          } else {
            // Default to single child if no subscription found
            initializeProfiles('basic')
          }
        } else {
          console.log('No subscription found, using default settings')
          // Don't set error, just use default settings
          setSubscriptionData(null)
          initializeProfiles('basic')
        }
      } catch (err) {
        console.error('Error fetching subscription data:', err)
        setError('An error occurred while fetching subscription data')
        toast.error('Failed to load subscription information')
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptionData()
  }, [currentUser?.uid])

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

  // Check if current profile is completely filled
  const isCurrentProfileFilled = (profileIndex) => {
    const profile = formData.profiles[profileIndex]
    return (
      profile &&
      profile.firstName.trim() !== '' &&
      profile.lastName.trim() !== '' &&
      profile.birthDay.trim() !== ''
    )
  }

  // Add another child profile
  const addAnotherChild = () => {
    const maxChildren =
      subscriptionData?.planType === 'multipleYearly'
        ? 3
        : subscriptionData?.planType === 'multipleMonthly'
        ? 3
        : 1

    if (formData.profiles.length < maxChildren) {
      const newProfile = {
        childId: uuidv4(),
        firstName: '',
        lastName: '',
        birthDay: ''
      }

      setFormData({
        ...formData,
        profiles: [...formData.profiles, newProfile]
      })

      // Expand the newly added profile
      setExpandedProfile(formData.profiles.length)
    }
  }

  // Check if we can add another child
  const canAddAnotherChild = () => {
    const maxChildren =
      subscriptionData?.planType === 'multipleYearly'
        ? 3
        : subscriptionData?.planType === 'multipleMonthly'
        ? 3
        : 1
    return formData.profiles.length < maxChildren
  }

  // Check if current profile is filled (for button disabled state)
  const isCurrentProfileFilledForButton = () => {
    // Check the last profile in the array (most recently added)
    const lastProfileIndex = formData.profiles.length - 1
    return isCurrentProfileFilled(lastProfileIndex)
  }

  // Delete a child profile
  const deleteProfile = (profileIndex) => {
    // Don't allow deleting the first profile (required)
    if (profileIndex === 0) {
      toast.error('Cannot delete the first child profile (required)')
      return
    }

    // Confirm deletion
    if (
      window.confirm(
        `Are you sure you want to delete Child Profile ${profileIndex + 1}?`
      )
    ) {
      const updatedProfiles = formData.profiles.filter(
        (_, index) => index !== profileIndex
      )

      setFormData({
        ...formData,
        profiles: updatedProfiles
      })

      // If we deleted the currently expanded profile, collapse it
      if (expandedProfile === profileIndex) {
        setExpandedProfile(null)
      } else if (expandedProfile > profileIndex) {
        // Adjust expanded profile index if we deleted a profile before the current one
        setExpandedProfile(expandedProfile - 1)
      }

      toast.success('Child profile deleted successfully')
    }
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

    const nonEmptyProfiles = formData.profiles
      .filter(
        (profile) =>
          profile.firstName.trim() !== '' ||
          profile.lastName.trim() !== '' ||
          profile.birthDay.trim() !== ''
      )
      .map((profile) => ({
        ...profile,
        childId:
          profile.childId ||
          `child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        accountCreated: new Date().toISOString(),
        accountStatus: 'Active'
      }))

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
      await updateParentProfile(currentUser.uid, {
        isOnboarded: true
      })
      toast.success('Child accounts created successfully')
      navigate('/dashboard/parent')
    } catch (error) {
      console.error('Error creating child accounts:', error)
      toast.error('Failed to create child accounts. Please try again.')
    }
  }

  if (loading) {
    return <Loader message='Loading...' />
  }

  if (error) {
    return (
      <div className='child-setup-container'>
        <div className='child-setup-error-message'>
          <h3>Error Loading Subscription</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  const maxChildren =
    subscriptionData?.planType === 'multipleYearly'
      ? 3
      : subscriptionData?.planType === 'multipleMonthly'
      ? 3
      : 1
  const planDisplayName =
    subscriptionData?.planType === 'multipleYearly'
      ? 'Family Plan'
      : subscriptionData?.planType === 'multipleMonthly'
      ? 'Family Plan'
      : subscriptionData?.planType === 'basic'
      ? 'Individual Plan'
      : 'Default Plan'
      ? 'Family Plan'
      : subscriptionData?.planType === 'basic'
      ? 'Individual Plan'
      : 'Default Plan'

  return (
    <div className='child-setup-container'>
      <div className='child-setup-subscription-info'>
        <div className='child-setup-family-plan-content'>
          <h1 className='child-setup-family-plan-title'>Child Account Setup</h1>
          <p className='child-setup-family-plan-subtitle'>
            {subscriptionData?.planType === 'multipleYearly'
              ? 'Configure accounts for up to 3 children (Family Plan)'
              : subscriptionData?.planType === 'multipleMonthly'
              ? 'Configure accounts for up to 3 children (Family Plan)'
              : subscriptionData?.planType === 'basic'
              ? 'Configure account for 1 child (Individual Plan)'
              : 'Configure account for 1 child (Default Plan)'}
          </p>

          {/* Subscription Plan Info */}
          <div className='child-setup-plan-info-banner'>
            <div className='child-setup-plan-info-content'>
              <strong>Current Plan:</strong> {planDisplayName} -
              <span className='child-setup-plan-status'>
                {' '}
                {subscriptionData?.status || 'Active'}
              </span>
            </div>
          </div>

          <div className='child-setup-seats-container'>
            {formData.profiles?.map((profile, index) => (
              <div
                key={index}
                className={`child-setup-seat-section ${
                  expandedProfile === index ? 'expanded' : ''
                }`}
              >
                <div className='child-setup-seat-header'>
                  <div
                    className='child-setup-seat-icon-name'
                    onClick={() => toggleProfile(index)}
                  >
                    <CiUser className='child-setup-seat-icon' />
                    <span className='child-setup-seat-name'>
                      Child Profile {index + 1}
                      {subscriptionData?.planType === 'multipleYearly' &&
                        index === 0 &&
                        ' (Required)'}
                      {subscriptionData?.planType === 'multipleYearly' &&
                        index > 0 &&
                        ' (Optional)'}
                      {subscriptionData?.planType === 'multipleMonthly' &&
                        index === 0 &&
                        ' (Required)'}
                      {subscriptionData?.planType === 'multipleMonthly' &&
                        index > 0 &&
                        ' (Optional)'}
                    </span>
                  </div>
                  <div className='child-setup-seat-actions'>
                    {index > 0 && (
                      <button
                        className='child-setup-delete-button'
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteProfile(index)
                        }}
                        title='Delete profile'
                      >
                        <FaTrash className='child-setup-delete-icon' />
                      </button>
                    )}
                    <span
                      className='child-setup-expand-icon'
                      onClick={() => toggleProfile(index)}
                    >
                      {expandedProfile === index ? <FaTimes /> : <FaPlus />}
                    </span>
                  </div>
                </div>

                {expandedProfile === index && (
                  <div className='child-setup-seat-details'>
                    <div className='child-setup-form-row'>
                      <div className='child-setup-form-group'>
                        <label className='child-setup-form-label'>
                          First Name
                        </label>
                        <div className='child-setup-input-wrapper'>
                          <div className='child-setup-input-icon'>
                            <FaUser />
                          </div>
                          <input
                            type='text'
                            className='child-setup-form-input'
                            placeholder='Enter first name'
                            value={profile.firstName}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                'firstName',
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className='child-setup-form-group'>
                        <label className='child-setup-form-label'>
                          Last Name
                        </label>
                        <div className='child-setup-input-wrapper'>
                          <div className='child-setup-input-icon'>
                            <FaUser />
                          </div>
                          <input
                            type='text'
                            className='child-setup-form-input'
                            placeholder='Enter last name'
                            value={profile.lastName}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                'lastName',
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className='child-setup-form-group'>
                      <label className='child-setup-form-label'>
                        Birth Day
                      </label>
                      <div className='child-setup-input-wrapper'>
                        <div className='child-setup-input-icon'>
                          <FaCalendarAlt />
                        </div>
                        <input
                          type='date'
                          className='child-setup-form-input'
                          value={profile.birthDay}
                          onChange={(e) => handleDateChange(index, e)}
                          max={new Date().toISOString().split('T')[0]}
                          onClick={(e) => e.target.showPicker()}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Another Child Button */}
          {(subscriptionData?.planType === 'multipleYearly' ||
            subscriptionData?.planType === 'multipleMonthly') && (
            <div className='child-setup-add-child-container'>
              <button
                type='button'
                className={`child-setup-add-child-button ${
                  !canAddAnotherChild() || !isCurrentProfileFilledForButton()
                    ? 'disabled'
                    : ''
                }`}
                onClick={addAnotherChild}
                disabled={
                  !canAddAnotherChild() || !isCurrentProfileFilledForButton()
                }
              >
                <FaPlus className='child-setup-add-icon' />
                Add Another Child
                {formData.profiles.length >= 3 && ' (Maximum Reached)'}
                {formData.profiles.length < 3 &&
                  !isCurrentProfileFilledForButton() &&
                  ' (Complete current form first)'}
              </button>
            </div>
          )}

          <div className='child-setup-form-actions'>
            <button
              type='button'
              className='child-setup-form-actions-continue-button'
              onClick={handleContinue}
            >
              Create Child Account{formData.profiles.length > 1 ? 's' : ''} &
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChildAccountSetup
