import React from 'react'
import './SchoolInfoDisplay.css'
import { startCase } from 'lodash'

const SchoolInfoDisplay = ({ schoolInfo, planType, onEditClick }) => (
  <>
    <div className='educator-dashboard-school-info__main'>
      <div>
        <h2 className='educator-dashboard-school-info__school'>
          {schoolInfo?.schoolName ?? 'N/A'}
        </h2>
        <div className='educator-dashboard-school-info__year'>
          Academic Year 2025-2026
        </div>
      </div>
      {/* <button
        className='educator-dashboard-school-info__edit'
        onClick={onEditClick}
      >
        <FiEdit2 /> Edit Details
      </button> */}
    </div>
    <div className='educator-dashboard-school-info__details'>
      <div>
        <div className='educator-dashboard-school-info__label'>Type</div>
        <div className='educator-dashboard-school-info__value'>
          {schoolInfo?.schoolDistrict ?? 'N/A'}
        </div>
      </div>
      <div>
        <div className='educator-dashboard-school-info__label'>
          School Address
        </div>
        <div className='educator-dashboard-school-info__value'>
          {schoolInfo?.region && schoolInfo?.country
            ? `${schoolInfo.region}, ${schoolInfo.country}`
            : 'N/A'}
        </div>
      </div>
      <div>
        <div className='educator-dashboard-school-info__label'>Plan</div>
        <div className='educator-dashboard-school-info__value'>
          {startCase(planType)}
        </div>
      </div>
    </div>
  </>
)

export default SchoolInfoDisplay
