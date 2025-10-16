import React, { useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import IncidentList from './IncidentList'
import LawIncidentModal from './LawIncidentModal'
import './LawEnforcementReport.css'

const LawEnforcementReport = () => {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className='law-enforcement-report'>
      <div className='law-enforcement-report-header'>
        <div>
          <h1>Law Enforcement Reports</h1>
          <p>View all incident reports submitted to law enforcement.</p>
        </div>
        <div className='law-enforcement-report-header-actions'>
          <div className='law-enforcement-report-header-actions-search'>
            <button>
              <FaSearch />
            </button>
            <input
              type='text'
              placeholder='Search reports...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      <IncidentList searchQuery={searchQuery} />
      <LawIncidentModal />
    </div>
  )
}

export default LawEnforcementReport
