import { useState, useEffect } from 'react'
import './Profile.css'
import BasicInformation from './BasicInformation'
import { useAuth } from '@/context/AuthContext'
import { getUserSchool } from '@/services/userService'
import ProfileSchoolDetails from '../ProfileSchoolDetails'
import { useLocation } from 'react-router-dom'

import DownloadMyData from './DownloadMyData'
import DeleteAccount from './DeleteAccount'
import ConsentModal from './ConsentModal'
import ChangePassword from './ChangePassword'
import { toast } from 'sonner'
import { updateUser } from '@/services/userService'
import { useQuery, useQueryClient } from '@tanstack/react-query'
// Import React icons
import {
  HiUser,
  HiMail,
  HiPhone,
  HiLocationMarker,
  HiGlobeAlt
} from 'react-icons/hi'
import { FaEdit } from 'react-icons/fa'
import { CiEdit } from 'react-icons/ci'
import { IoClose } from 'react-icons/io5'
import PageHeader from '@/components/common/dashboard-header/common/PageHeader'
import useStudentMenuItems from '@/hooks/useStudentMenuItems'
import useEducatorMenuItems from '@/hooks/useEducatorMenuItems'
import useParentMenuItems from '@/hooks/useParentMenuItems'
import PagePreloader from '@/components/common/preloaders/PagePreloader'
const Profile = ({ isAdminOrParent = false, isAdmin = false }) => {
  const location = useLocation()
  const { currentUser, setCurrentUser } = useAuth()
  // const [schoolData, setSchoolData] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const isParentPath = location.pathname.includes('/dashboard/parent')
  const isEducatorPath = location.pathname.includes('/dashboard/educator')
  const isStudentPath = location.pathname.includes('/dashboard/student')
  const [isLoading, setIsLoading] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const studentMenuItems = useStudentMenuItems()
  const educatorMenuItems = useEducatorMenuItems()
  const parentMenuItems = useParentMenuItems()
  const menuItems = isParentPath
    ? parentMenuItems
    : isEducatorPath
    ? educatorMenuItems
    : isStudentPath
    ? studentMenuItems
    : isParentPath
    ? parentMenuItems
    : []
  // useEffect(() => {
  //   if (isAdmin) {
  //     setSchoolData(false)
  //   }
  // })
  // useEffect(() => {
  //   if (isAdminOrParent) return
  //   const fetchSchoolData = async () => {
  //     const schoolData = await getUserSchool(currentUser.schoolId)
  //     setSchoolData(schoolData)
  //   }
  //   fetchSchoolData()
  // }, [currentUser, isAdminOrParent])
  const {
    data: schoolData = null,
    isLoading: isSchoolDataLoading,
    isError: isSchoolDataError
  } = useQuery({
    queryKey: ['schoolData', currentUser.schoolId],
    queryFn: () => getUserSchool(currentUser.schoolId),
    enabled: !!currentUser.schoolId
  })
  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleSaveConsent = async (consentSettings) => {
    try {
      setIsLoading(true)
      await updateUser(currentUser.uid, {
        consentSettings,
        updatedAt: new Date()
      })

      setCurrentUser((prev) => ({
        ...prev,
        consentSettings
      }))

      toast.success('Consent settings updated successfully')
      handleCloseModal()
    } catch (error) {
      console.error('Error updating consent settings:', error)
      toast.error('Failed to update consent settings')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleEditProfile = () => {
    setIsEditingProfile(!isEditingProfile)
  }

  return (
    <>
      <div className='profile-container'>
        <PageHeader
          title='Profile Settings'
          subtitle='Manage your account settings and preferences'
          menuItems={menuItems}
        />

        <div className='profile-section'>
          <div className='profile-row'>
            <h2 className='profile-section-title'>Personal Information</h2>
            <button className='profile-edit-btn' onClick={toggleEditProfile}>
              {isEditingProfile ? <IoClose size={20} /> : <CiEdit size={20} />}
              <span>{isEditingProfile ? 'Cancel Edit' : 'Edit'}</span>
            </button>
          </div>
          <BasicInformation
            isEditing={isEditingProfile}
            onToggleEdit={toggleEditProfile}
          />
        </div>

        {isSchoolDataLoading ? (
          <PagePreloader color='black' textData='Loading profile data...' />
        ) : isSchoolDataError ? (
          <p>Error loading school data</p>
        ) : (
          schoolData && (
            <div className='profile-section'>
              <ProfileSchoolDetails
                schoolData={schoolData}
                role={currentUser.role}
              />
            </div>
          )
        )}
        {/* <GuardianInformation /> */}
        {/* Billing components moved to dedicated billing page */}
        <ChangePassword />
        <div className='profile-section'>
          <div className='profile-buttons-row'>
            <button className='manage-consent-button' onClick={handleOpenModal}>
              <FaEdit className='button-icon' />
              Manage Consent Settings
            </button>
            <DownloadMyData />
            <DeleteAccount />
          </div>
        </div>
      </div>

      {/* Modal rendered at root level */}
      {isModalOpen && (
        <ConsentModal
          isOpen={true}
          onClose={handleCloseModal}
          onSave={handleSaveConsent}
          isLoading={isLoading}
        />
      )}
    </>
  )
}

export default Profile
