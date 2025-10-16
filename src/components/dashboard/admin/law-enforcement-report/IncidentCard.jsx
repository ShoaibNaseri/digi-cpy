import React from 'react'
import { FaEye } from 'react-icons/fa'
import { useLawIncident } from '@/context/LawIncidentContext'
import './LawEnforcementReport.css'

const IncidentCard = ({ data }) => {
  const { openModal } = useLawIncident()
  const formattedDate = data.createdAt?.toDate
    ? data.createdAt.toDate().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'N/A'

  const handleViewReport = () => {
    openModal(formattedDate, data)
  }

  return (
    <div className='incident-card'>
      <div className='incident-card-header'>
        <h2>{formattedDate}</h2>
        <span className='status-badge'>Updated</span>
      </div>

      <div className='incident-card-actions'>
        <button
          className='incident-card-action-button-view-report'
          onClick={handleViewReport}
        >
          <FaEye size={20} />
          <span>View Report</span>
        </button>
      </div>
    </div>
  )
}

export default IncidentCard
