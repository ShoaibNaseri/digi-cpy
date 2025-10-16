import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getChildrenProfiles } from '@/services/parentService'
import Avatar from '@/components/common/avatar/Avatar'
import './ParentSetupSummary.css'
import { FaCheckCircle } from 'react-icons/fa'
import { updateParentProfile } from '@/services/parentService'

const ParentSetupSummary = () => {
  const [children, setChildren] = useState([])
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchChildren = async () => {
      if (currentUser) {
        try {
          const childrenProfiles = await getChildrenProfiles(currentUser.uid)
          setChildren(childrenProfiles)
        } catch (error) {
          console.error('Error fetching children profiles:', error)
        }
      }
    }

    fetchChildren()
  }, [currentUser])

  const handleGoToDashboard = async () => {
    await updateParentProfile(currentUser.uid, { isOnboarded: true })
    navigate('/dashboard/parent')
  }

  const handleEditProfiles = () => {
    navigate('/onboarding/parent/edit-profiles')
  }

  return (
    <div className='setup-summary-container'>
      <div className='success-icon'>
        <FaCheckCircle size={72} />
      </div>

      <h1 className='summary-title'>All Profiles Created Successfully!</h1>
      <p className='summary-description'>
        Your profiles have been set up and are ready to use.
      </p>

      <div className='profiles-grid'>
        {children.map((child, index) => (
          <div key={index} className='profile-card'>
            <div className='profile-avatar'>
              <Avatar name={child.firstName} size={60} />
            </div>
            <h3 className='profile-name'>
              {child.firstName} {child.lastName}
            </h3>
            <p className='profile-status'>Active</p>
          </div>
        ))}
      </div>

      <button className='dashboard-button' onClick={handleGoToDashboard}>
        Go to Dashboard
      </button>

      <button className='edit-profiles-button' onClick={handleEditProfiles}>
        Edit Profiles
      </button>
    </div>
  )
}

export default ParentSetupSummary
