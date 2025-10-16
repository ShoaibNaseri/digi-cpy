import React from 'react'
import { FaEye } from 'react-icons/fa'
import { useProtection } from '@/context/ProtectionContext'
import './PlanCard.css'

const PlanCard = ({ data, date }) => {
  const formattedDate = date?.toDate
    ? date.toDate().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'N/A'

  const { openModal, setSelectedReport } = useProtection()

  const handleViewReport = () => {
    setSelectedReport(data)
    openModal(formattedDate)
  }

  return (
    <div className='protection-plan-card'>
      <div className='protection-plan-card-header'>
        <h2>{formattedDate}</h2>
        <span className='status-badge'>Updated</span>
      </div>

      <div className='protection-plan-card-actions'>
        <button
          className='protection-plan-card-action-button-view-report'
          onClick={handleViewReport}
        >
          <FaEye size={20} />
          <span>View Report</span>
        </button>
      </div>
    </div>
  )
}

export default PlanCard
