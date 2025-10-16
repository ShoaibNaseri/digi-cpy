import React, { useState } from 'react'
import { FaEye, FaTrash } from 'react-icons/fa'
import { BsShieldFillCheck } from 'react-icons/bs'
import { useMyProtectionPlan } from '@/context/MyProtectionPlanContext'
import { myProtectionPlanService } from '@/services/myProtectionPlanService'
import { useAuth } from '@/context/AuthContext'
import './MyProtectionPlanCard.css'

const MyProtectionPlanCard = ({ date, data, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const { currentUser } = useAuth()
  const formattedDate = date?.toDate
    ? date.toDate().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'N/A'

  const { openModal, setSelectedReport } = useMyProtectionPlan()

  const handleViewReport = () => {
    setSelectedReport(data)
    openModal(formattedDate)
  }

  const handleDelete = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete this protection plan? This action cannot be undone.'
      )
    ) {
      return
    }

    try {
      setIsDeleting(true)
      await myProtectionPlanService.deletePlan(data.id, currentUser.uid)
      if (onDelete) {
        onDelete(data.id)
      }
    } catch (error) {
      console.error('Error deleting protection plan:', error)
      alert('Failed to delete protection plan. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className='my-protection-plan-card'>
      <div className='my-protection-plan-card-icon'>
        <BsShieldFillCheck size={32} />
      </div>
      <div className='my-protection-plan-card-header'>
        <h2>My Protection Plan</h2>
        <p className='my-protection-plan-card-date'>{formattedDate}</p>
      </div>

      {/* <div className='my-protection-plan-card-stats'>
        <div className='my-protection-plan-card-stat-item'>
          <FaShieldAlt size={20} />
          <span>Safety Score: {safetyScore}%</span>
        </div>
        <div className='my-protection-plan-card-stat-item'>
          <IoMdNotifications size={20} />
          <span>{alerts} alerts</span>
        </div>
      </div> */}

      <div className='my-protection-plan-card-actions'>
        <button
          className='my-protection-plan-card-action-button-view-report'
          onClick={handleViewReport}
          disabled={isDeleting}
        >
          <FaEye size={16} />
          <span>View Report</span>
        </button>
        <button
          className='my-protection-plan-card-action-button-delete'
          onClick={handleDelete}
          disabled={isDeleting}
          title='Delete Protection Plan'
        >
          <FaTrash size={14} />
          <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
        </button>
      </div>
    </div>
  )
}

export default MyProtectionPlanCard
