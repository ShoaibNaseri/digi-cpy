const ProfileSchoolDetails = ({ schoolData, role }) => {
  const isStudent =
    role === 'STUDENT' || role === 'PARENT' || role === 'SCHOOL_ADMIN'

  return (
    <div className={isStudent ? 'cbi' : 'teacher-profile-section school-info-section'}>
      <h2 className='teacher-profile-section-title'>School Information</h2>
      <div className='teacher-profile-form-grid'>
        <div className='teacher-profile-form-group'>
          <label className='teacher-profile-label'>School Name</label>
          {schoolData.schoolName || 'Not available'}
        </div>

        <div className='teacher-profile-form-group'>
          <label className='teacher-profile-label'>School Phone</label>
          {schoolData.schoolPhone || 'Not available'}
        </div>

        <div className='teacher-profile-form-group'>
          <label className='teacher-profile-label'>Principal Name</label>
          {schoolData.principalName || 'Not available'}
        </div>

        <div className='teacher-profile-form-group'>
          <label className='teacher-profile-label'>Principal Email</label>
          {schoolData.principalEmail || 'Not available'}
        </div>

        <div className='teacher-profile-form-group'>
          <label className='teacher-profile-label'>IT Admin Name</label>
          {schoolData.itAdminName || 'Not available'}
        </div>

        <div className='teacher-profile-form-group'>
          <label className='teacher-profile-label'>IT Admin Email</label>
          {schoolData.itAdminEmail || 'Not available'}
        </div>
      </div>
    </div>
  )
}

export default ProfileSchoolDetails
