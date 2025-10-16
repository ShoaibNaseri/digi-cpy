import Modal from '../../common/modal/Modal'

const ProfileModal = ({
  isOpen,
  onClose,
  formData,
  handleInputChange,
  handleSubmit,
  regionLabel,
  regionList,
  isLoading
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Complete Your Profile'>
      <form onSubmit={handleSubmit} className='profile-dashboard-form'>
        <div className='profile-dashboard-form-group'>
          <label htmlFor='firstName'>First Name</label>
          <input
            type='text'
            id='firstName'
            name='firstName'
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className='profile-dashboard-form-group'>
          <label htmlFor='lastName'>Last Name</label>
          <input
            type='text'
            id='lastName'
            name='lastName'
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className='profile-dashboard-form-group'>
          <label htmlFor='dateOfBirth'>Date of Birth</label>
          <input
            type='date'
            id='dateOfBirth'
            name='dateOfBirth'
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            max={new Date().toISOString().split('T')[0]}
            onFocus={(e) => e.target.showPicker && e.target.showPicker()}
            onClick={(e) => e.target.showPicker && e.target.showPicker()}
          />
        </div>
        <div className='profile-dashboard-form-group'>
          <label htmlFor='country'>Country</label>
          <div className='profile-dashboard-select-wrapper'>
            <select
              id='country'
              name='country'
              value={formData.country}
              onChange={handleInputChange}
              required
            >
              <option value='United States'>United States</option>
              <option value='Canada'>Canada</option>
            </select>
          </div>
        </div>
        <div className='profile-dashboard-form-group'>
          <label htmlFor='region'>{regionLabel}</label>
          <div className='profile-dashboard-select-wrapper'>
            <select
              id='region'
              name='region'
              value={formData.region}
              onChange={handleInputChange}
              required
            >
              <option value=''>{`Select a ${regionLabel}`}</option>
              {regionList.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className='profile-dashboard-form-actions'>
          <button
            type='submit'
            className='profile-dashboard-submit-button'
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ProfileModal
