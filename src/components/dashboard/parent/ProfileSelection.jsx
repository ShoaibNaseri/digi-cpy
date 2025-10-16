import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getChildrenProfiles } from '@/services/parentService'
import Avatar from '@/components/common/avatar/Avatar'
import './ProfileSelection.css'
import { FaPlus } from 'react-icons/fa'
import PagePreloader from '@/components/common/preloaders/PagePreloader'

const ProfileSelection = () => {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProfiles = async () => {
      if (currentUser) {
        try {
          setLoading(true)
          const childrenProfiles = await getChildrenProfiles(currentUser.uid)
          setProfiles(childrenProfiles)
        } catch (error) {
          console.error('Error fetching profiles:', error)
          setProfiles([])
        } finally {
          setLoading(false)
        }
      }
    }

    fetchProfiles()
  }, [currentUser])

  const handleProfileSelect = (profile) => {
    localStorage.setItem('selectedProfile', JSON.stringify(profile))
    navigate('/dashboard/child/missions')
  }

  const handleMyProfileSelect = () => {
    navigate('/dashboard/parent')
  }

  const handleAddProfile = () => {
    // navigate('/onboarding/parent/edit-profiles')
  }

  const getInitials = (name) => {
    return name ? name.substring(0, 1).toUpperCase() : ''
  }

  if (loading) {
    return (
      <div className='profile-selection-container'>
        <PagePreloader color='white' textData='Getting your profiles...' />
      </div>
    )
  }

  return (
    <div className='profile-selection-container'>
      <div className='profile-selection-content'>
        <h1 className='profile-selection-title'>Who's using Digipalz?</h1>

        <div className='profile-grid'>
          <div className='profile-item' onClick={handleMyProfileSelect}>
            <div className='profile-avatar'>
              <div className='profile-avatar-circle'>
                {getInitials(currentUser?.firstName)}
                {/* <Avatar name={currentUser?.firstName} size={80} /> */}
              </div>
            </div>
            <h3 className='profile-selection-name'>{currentUser?.firstName}</h3>
          </div>

          {/* Render children profiles */}
          {profiles.length > 0 &&
            profiles.map((profile, index) => (
              <div
                key={profile.childId || index}
                className='profile-item'
                onClick={() => handleProfileSelect(profile)}
              >
                <div className='profile-avatar'>
                  <div className='profile-avatar-circle'>
                    {getInitials(profile.firstName)}
                  </div>
                </div>
                <h3 className='profile-selection-name'>{profile.firstName}</h3>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default ProfileSelection
