import './UserManagement.css'
import PrevStepButton from '../buttons/PrevStepButton'
import NextStepButton from '../buttons/NextStepButton'
import UserManagementContent from './UserManagementContent'
import { useAuth } from '@/context/AuthContext'
import { updateUser } from '@/services/adminService'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const UserManagement = () => {
  const navigate = useNavigate()
  const { currentUser, userRole } = useAuth()
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveProgress = async () => {
    if (!currentUser) {
      toast.error('No user is currently logged in')
      return
    }

    if (userRole !== 'SCHOOL_ADMIN') {
      toast.error('You do not have permission to access this page')
      return
    }

    try {
      setIsSaving(true)
      const result = await updateUser(currentUser.uid, {
        isSchoolOnboarded: true
      })

      if (!result.success) {
        toast.error('Failed to update user data')
        return
      }

      setIsSaving(false)

      setTimeout(() => {
        navigate('/dashboard/educator')
      }, 500)
    } catch (error) {
      console.error('Error in handleSaveProgress:', error)
      toast.error('An error occurred while saving progress')
      setIsSaving(false)
    }
  }

  return (
    <div className='user-management'>
      <UserManagementContent />
      <div className='user-management-footer'>
        <PrevStepButton text='Back to School Details' stepNum={0} />
        <NextStepButton
          text='Complete Onboarding & Proceed'
          stepNum={1}
          onClick={handleSaveProgress}
          isLoading={isSaving}
        />
      </div>
    </div>
  )
}

export default UserManagement
