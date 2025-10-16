import React from 'react'
import { FiX, FiCheck } from 'react-icons/fi'
import './SchoolInfoEditForm.css'

const SchoolInfoEditForm = ({
  editedSchoolInfo,
  isLoading,
  onInputChange,
  onCancelEdit,
  onSaveChanges
}) => (
  <>
    <div className='educator-dashboard-school-info__main'>
      <div>
        <div className='educator-dashboard-school-info__form-group'>
          <label>School Name</label>
          <input
            type='text'
            name='schoolName'
            value={editedSchoolInfo?.schoolName || ''}
            onChange={onInputChange}
            className='educator-dashboard-school-info__input'
          />
        </div>
        <div className='educator-dashboard-school-info__year'>
          Academic Year 2025-2026
        </div>
      </div>
      {/* <div className='educator-dashboard-school-info__actions'>
        <button
          className='educator-dashboard-school-info__action-btn cancel'
          onClick={onCancelEdit}
          disabled={isLoading}
        >
          <FiX /> Cancel
        </button>
        <button
          className='educator-dashboard-school-info__action-btn save'
          onClick={onSaveChanges}
          disabled={isLoading}
        >
          <FiCheck /> {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div> */}
    </div>
    <div className='educator-dashboard-school-info__details'>
      <div>
        <div className='educator-dashboard-school-info__label'>Type</div>
        <input
          type='text'
          name='schoolDistrict'
          value={editedSchoolInfo?.schoolDistrict || ''}
          onChange={onInputChange}
          className='educator-dashboard-school-info__input'
        />
      </div>
      <div>
        <div className='educator-dashboard-school-info__label'>
          School Region
        </div>
        <input
          type='text'
          name='region'
          value={editedSchoolInfo?.region || ''}
          onChange={onInputChange}
          className='educator-dashboard-school-info__input'
        />
      </div>
      <div>
        <div className='educator-dashboard-school-info__label'>Country</div>
        <input
          type='text'
          name='country'
          value={editedSchoolInfo?.country || ''}
          onChange={onInputChange}
          className='educator-dashboard-school-info__input'
        />
      </div>
      <div>
        <div className='educator-dashboard-school-info__label'>Plan</div>
        <div className='educator-dashboard-school-info__value'>Premium</div>
      </div>
    </div>
  </>
)

export default SchoolInfoEditForm
