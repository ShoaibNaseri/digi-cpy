import React from 'react'
import { FaTimes } from 'react-icons/fa'
import './TeacherAnalytics.css'

const IncidentModal = ({ incident, onClose }) => {
  if (!incident) return null

  return (
    <div className='teacher-analytics-modal-overlay' onClick={onClose}>
      <div
        className='teacher-analytics-modal'
        onClick={(e) => e.stopPropagation()}
      >
        <button className='teacher-analytics-modal-close' onClick={onClose}>
          <FaTimes />
        </button>
        <h3>Incident Details</h3>
        <div className='teacher-analytics-modal-content'>
          <p>
            <strong>Summary:</strong> {incident.anonymousSummary}
          </p>
          <p>
            <strong>Platform:</strong> {incident.metadata.platform}
          </p>
          <p>
            <strong>Date of Incident:</strong>{' '}
            {incident.metadata.dateOfIncident}
          </p>
          <p>
            <strong>Reported Date:</strong> {incident.metadata.dateReported}
          </p>
        </div>
      </div>
    </div>
  )
}

export default IncidentModal
