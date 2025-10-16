import { useState, useEffect } from 'react'
import './EducatorDashboardSchoolInfo.css'
import { getSchoolInfo, saveSchoolDetails } from '@/services/adminService'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-toastify'
import { getPaymentRecord } from '@/services/paymentService'

import SchoolInfoDisplay from './SchoolInfoDisplay.jsx'
import SchoolInfoEditForm from './SchoolInfoEditForm.jsx'

// Main component
const EducatorDashboardSchoolInfo = () => {
  const { currentUser } = useAuth()
  const [schoolInfo, setSchoolInfo] = useState(null)
  const [planType, setPlanType] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedSchoolInfo, setEditedSchoolInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!currentUser) return
    const fetchSchoolInfo = async () => {
      const schoolInfo = await getSchoolInfo(currentUser.schoolId)
      const paymentInfo = await getPaymentRecord(schoolInfo.paymentId)
      setSchoolInfo(schoolInfo)
      setPlanType(paymentInfo.planType)
      setEditedSchoolInfo(schoolInfo) // Initialize edit form data
    }
    fetchSchoolInfo()
  }, [currentUser])

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setEditedSchoolInfo(schoolInfo) // Reset to original data
    setIsEditing(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditedSchoolInfo((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true)

      // Only update editable fields
      const updatedSchoolInfo = {
        schoolId: editedSchoolInfo.schoolId,
        schoolName: editedSchoolInfo.schoolName,
        schoolDistrict: editedSchoolInfo.schoolDistrict,
        region: editedSchoolInfo.region,
        country: editedSchoolInfo.country
      }

      await saveSchoolDetails(updatedSchoolInfo, {})

      // Update local state
      setSchoolInfo(editedSchoolInfo)
      setIsEditing(false)
      toast.success('School information updated successfully')
    } catch (error) {
      console.error('Error updating school information:', error)
      toast.error('Failed to update school information')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className='educator-dashboard-school-info'>
      {isEditing ? (
        <SchoolInfoEditForm
          editedSchoolInfo={editedSchoolInfo}
          isLoading={isLoading}
          onInputChange={handleInputChange}
          onCancelEdit={handleCancelEdit}
          onSaveChanges={handleSaveChanges}
        />
      ) : (
        <SchoolInfoDisplay
          schoolInfo={schoolInfo}
          planType={planType}
          onEditClick={handleEditClick}
        />
      )}
    </section>
  )
}

export default EducatorDashboardSchoolInfo
