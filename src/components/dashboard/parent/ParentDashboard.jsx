import './ParentDashboard.css'
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useProfile } from '@/context/ProfileContext'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { usStates } from '@/utils/usStatesData'
import { canadaRegions } from '@/utils/canadaRegionsData'
import ProfileModal from './ProfileModal'
import ConsentModal from './ConsentModal'
import AddChildFormModal from '@/components/common/modals/AddChildFormModal'
import { getChildrenMissionProgressStats } from '@/services/parentService'
import {
  useChildrenProfiles,
  useSubscription,
  useAddChild
} from '@/hooks/useParentQueries'

import {
  FaRocket,
  FaBrain,
  FaClipboardList,
  FaTrophy,
  FaChartBar,
  FaClock,
  FaChartLine
} from 'react-icons/fa'

import ChildProfileCard from './ChildProfileCard'
import { useNavigate } from 'react-router-dom'
import PageHeader from '@/components/common/dashboard-header/common/PageHeader'
import useParentMenuItems from '@/hooks/useParentMenuItems'

const ParentDashboard = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { profileData, updateUserProfile } = useProfile()
  const [overallStats, setOverallStats] = useState()
  const [childrenStats, setChildrenStats] = useState([])
  const menuItems = useParentMenuItems()
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [consentChecked, setConsentChecked] = useState(false)
  const [showAddChildModal, setShowAddChildModal] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    country: 'United States',
    region: ''
  })

  // Compute region list and label based on country
  const regionList = useMemo(
    () => (formData.country === 'Canada' ? canadaRegions : usStates),
    [formData.country]
  )
  const regionLabel =
    formData.country === 'Canada' ? 'Province/Territory' : 'State'

  // React Query hooks for child management
  const {
    data: children = [],
    isLoading: childrenLoading,
    error: childrenError
  } = useChildrenProfiles(currentUser?.uid, !!currentUser?.uid)

  const {
    data: subscriptionData = 'basic',
    isLoading: subscriptionLoading,
    error: subscriptionError
  } = useSubscription(currentUser?.uid, !!currentUser?.uid)

  const addChildMutation = useAddChild()

  // Get maximum children based on subscription plan
  const getMaxChildren = () => {
    if (!subscriptionData) return 1

    return subscriptionData.planType === 'multipleYearly' ||
      subscriptionData.planType === 'multipleMonthly' ||
      subscriptionData.planType === 'family'
      ? 3
      : 1
  }

  // Check if user can add more children
  const canAddMoreChildren = () => {
    return children.length < getMaxChildren()
  }

  // Handle add child form submission
  const handleAddChild = async (formData) => {
    if (!currentUser?.uid) {
      toast.error('Parent ID not found. Please log in again.')
      return
    }

    // Check if user can add more children based on their plan
    if (!canAddMoreChildren()) {
      const maxChildren = getMaxChildren()
      const planName =
        subscriptionData?.planType === 'multipleYearly' ||
        subscriptionData?.planType === 'multipleMonthly' ||
        subscriptionData?.planType === 'family'
          ? 'Family Plan'
          : 'Individual Plan'
      toast.error(
        `You have reached the maximum limit of ${maxChildren} child${
          maxChildren > 1 ? 'ren' : ''
        } for your ${planName}. Please upgrade your plan to add more children.`
      )
      return
    }

    const newChild = {
      childId: uuidv4(),
      parentId: currentUser.uid,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      birthDay: formData.birthDay,
      accountCreated: new Date().toISOString(),
      accountStatus: 'Active'
    }

    addChildMutation.mutate(
      {
        parentId: currentUser.uid,
        children: [newChild]
      },
      {
        onSuccess: () => {
          setShowAddChildModal(false)
          toast.success('Child profile added successfully!')
        },
        onError: (error) => {
          console.error('Error adding child:', error)
          toast.error('Failed to add child profile')
        }
      }
    )
  }

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        dateOfBirth: currentUser.dateOfBirth || '',
        country: currentUser.country || 'United States',
        region: currentUser.region || currentUser.stateProvince || ''
      }))

      if (
        !currentUser.firstName ||
        !currentUser.lastName ||
        !currentUser.dateOfBirth ||
        !currentUser.country ||
        !currentUser.region
      ) {
        setShowModal(true)
      }

      // Check if consent is needed (no consent or consent older than 12 months)
      const lastConsent = currentUser.lastDateOfConsent
        ? new Date(currentUser.lastDateOfConsent)
        : null
      const twelveMonthsAgo = new Date()
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

      if (!lastConsent || lastConsent < twelveMonthsAgo) {
        setShowConsentModal(true)
      }
    }
  }, [currentUser])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    // Prevent future date for dateOfBirth
    if (name === 'dateOfBirth') {
      const today = new Date().toISOString().split('T')[0]
      if (value > today) {
        toast.error('Date of birth cannot be in the future')
        return
      }
    }
    // Reset region if country changes
    if (name === 'country') {
      setFormData((prev) => ({
        ...prev,
        country: value,
        region: ''
      }))
      return
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    if (!formData.firstName || !formData.lastName) {
      toast.error('First name and last name are required')
      return
    }
    // Validate date of birth is not in the future
    if (formData.dateOfBirth) {
      const today = new Date().toISOString().split('T')[0]
      if (formData.dateOfBirth > today) {
        toast.error('Date of birth cannot be in the future')
        return
      }
    }
    // Validate region
    if (!formData.region) {
      toast.error(`Please select a ${regionLabel}`)
      return
    }
    try {
      const updatedData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        country: formData.country,
        region: formData.region,
        updatedAt: new Date()
      }
      await updateUserProfile(currentUser.uid, updatedData)
      toast.success('Profile updated successfully')
      setShowModal(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }
  useEffect(() => {
    const fetchChildren = async () => {
      if (currentUser?.uid) {
        const children = await getChildrenMissionProgressStats(currentUser.uid)
        setOverallStats(children.overallStats)
        setChildrenStats(children.childrenStats)
      }
    }
    fetchChildren()
  }, [currentUser?.uid])

  const handleConsentSubmit = async () => {
    if (!consentChecked) {
      toast.error('Please check the consent box to continue')
      return
    }

    try {
      const updatedData = {
        lastDateOfConsent: new Date().toISOString(),
        updatedAt: new Date()
      }
      await updateUserProfile(currentUser.uid, updatedData)
      toast.success('Consent updated successfully')
      setShowConsentModal(false)
    } catch (error) {
      console.error('Error updating consent:', error)
      toast.error('Failed to update consent')
    }
  }

  // Helper function to create circular progress
  const createCircularProgress = (percentage, type) => {
    const radius = 30 // Adjusted from 36
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className={`circular-progress ${type}`}>
        <svg>
          <circle className='bg-circle' cx='35' cy='35' r={radius} />
          <circle
            className='progress-circle'
            cx='35'
            cy='35'
            r={radius}
            style={{
              strokeDasharray,
              strokeDashoffset
            }}
          />
        </svg>
        <div className='progress-text-parent'>{percentage}%</div>
      </div>
    )
  }

  const renderName = () => {
    return `${currentUser?.firstName || 'User'} ${currentUser?.lastName || ''}`
  }

  return (
    <div className='profile-dashboard-container'>
      <div className='profile-parent-dashboard-content'>
        {/* Header */}
        <PageHeader
          title='Welcom To Your Dashboard'
          subtitle='Manage your account settings and preferences'
          menuItems={menuItems}
        />

        {/* Stats Cards with Circular Progress */}
        <div className='profile-parent-dashboard-stats'>
          <div className='progress-card mission'>
            <div className='progress-card-header'>
              <div className='progress-icon mission'>
                <FaRocket />
              </div>
              <h3 className='progress-title'>Mission Progress</h3>
            </div>
            <div className='progress-display'>
              {createCircularProgress(
                Math.round(overallStats?.averageProgress || 0),
                'mission'
              )}
              <div className='progress-stats'>
                <div className='progress-value'>
                  {overallStats?.totalMissionsCompleted || 0}/{12}
                </div>
                <div className='progress-label'>Missions Completed</div>
              </div>
            </div>
          </div>

          <div className='progress-card quiz'>
            <div className='progress-card-header'>
              <div className='progress-icon quiz'>
                <FaBrain />
              </div>
              <h3 className='progress-title'>Quizzes</h3>
            </div>
            <div className='progress-display'>
              {createCircularProgress(
                Math.round(overallStats?.averageCompletionRate || 0),
                'quiz'
              )}
              <div className='progress-stats'>
                <div className='progress-value'>89/100</div>
                <div className='progress-label'>Average Score</div>
              </div>
            </div>
          </div>

          <div className='progress-card assignment'>
            <div className='progress-card-header'>
              <div className='progress-icon assignment'>
                <FaClipboardList />
              </div>
              <h3 className='progress-title'>Assignments</h3>
            </div>
            <div className='progress-display'>
              {createCircularProgress(75, 'assignment')}
              <div className='progress-stats'>
                <div className='progress-value'>6/8</div>
                <div className='progress-label'>Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Achievement */}
        <div className='recent-achievement'>
          <h2>Recent Achievement</h2>
          <div className='achievement-list'>
            <div className='achievement-item'>
              <div className='achievement-icon complete'>
                <FaTrophy />
              </div>
              <div className='achievement-content'>
                <h3>Mission Complete!</h3>
                <p>
                  Declan just completed his first mission! He's making great
                  progress in understanding digital Safety fundamentals
                </p>
              </div>
              <div className='achievement-time'>
                <FaClock />2 hours ago
              </div>
            </div>
            <div className='achievement-item'>
              <div className='achievement-icon'>
                <FaChartBar />
              </div>
              <div className='achievement-content'>
                <h3>High Achiever!</h3>
                <p>
                  Fiona is scoring remarkably high on her quizzes! Her average
                  Score of 92% shows excellent understanding of the material
                </p>
              </div>
              <div className='achievement-time'>
                <FaChartLine />
                92% Average
              </div>
            </div>
          </div>
        </div>

        {/* Children Section */}
        <div className='children-section'>
          <div className='children-header'>
            <h2>Your Children</h2>

            <button
              onClick={() => setShowAddChildModal(true)}
              className='add-child-btn'
              disabled={!canAddMoreChildren()}
              title={
                !canAddMoreChildren()
                  ? `Maximum ${getMaxChildren()} children reached for your plan`
                  : 'Add another child'
              }
            >
              + Add Child Account
            </button>
          </div>

          {/* Child Profile Card */}
          {childrenStats?.length > 0 ? (
            childrenStats.map((child) => (
              <ChildProfileCard
                key={child.id}
                child={child}
                navigate={navigate}
              />
            ))
          ) : (
            <div className='parent-dashboard-no-children'>
              {' '}
              <p>No children accounts found</p>
            </div>
          )}
        </div>
      </div>

      <ProfileModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        regionLabel={regionLabel}
        regionList={regionList}
      />

      <ConsentModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        consentChecked={consentChecked}
        setConsentChecked={setConsentChecked}
        handleConsentSubmit={handleConsentSubmit}
        isLoading={isLoading}
      />

      <AddChildFormModal
        isOpen={showAddChildModal}
        onClose={() => setShowAddChildModal(false)}
        onSubmit={handleAddChild}
        isLoading={addChildMutation.isPending}
        title='Add Your Child Profile'
        submitButtonText='Save Profile'
      />
    </div>
  )
}

export default ParentDashboard
